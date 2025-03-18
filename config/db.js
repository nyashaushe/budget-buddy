import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import { ApiError } from '../utils/errorHandler.js';

// Load environment variables
dotenv.config();

// Create a connection string from individual parameters if DATABASE_URL is not provided
const connectionString = process.env.DATABASE_URL || 
  `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

// Pool configuration with optimized settings
const poolConfig = {
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: parseInt(process.env.DB_POOL_MAX || '20', 10), // Maximum number of clients in the pool
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10), // Close idle clients after 30 seconds
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000', 10), // Return an error after 5 seconds if connection could not be established
};

// Pool instance
let pool = new Pool(poolConfig);

// Pool health state
let poolHealthy = true;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const INITIAL_RECONNECT_DELAY = 1000; // 1 second

// Connection event handlers
pool.on('connect', () => {
  console.log('Database connection established');
  poolHealthy = true;
  reconnectAttempts = 0;
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
  
  if (poolHealthy) {
    poolHealthy = false;
    console.log('Database pool health compromised, will attempt reconnection if needed');
  }
  
  // Handle specific error cases that require pool recreation
  if (
    err.code === 'PROTOCOL_CONNECTION_LOST' || 
    err.code === 'ECONNRESET' || 
    err.code === '57P01' // admin shutdown
  ) {
    attemptReconnection();
  }
});

// Attempt to reconnect with exponential backoff
function attemptReconnection() {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error(`Failed to reconnect to the database after ${MAX_RECONNECT_ATTEMPTS} attempts`);
    return;
  }
  
  reconnectAttempts++;
  const delay = INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttempts - 1);
  
  console.log(`Attempting to reconnect to the database in ${delay}ms (attempt ${reconnectAttempts})`);
  
  setTimeout(() => {
    try {
      // Drain and end the existing pool
      pool.end().catch(err => {
        console.error('Error ending pool during reconnection:', err);
      });
      
      // Create a new pool
      pool = new Pool(poolConfig);
      
      // Set up new event handlers
      pool.on('connect', () => {
        console.log('Database connection re-established');
        poolHealthy = true;
        reconnectAttempts = 0;
      });
      
      pool.on('error', (err) => {
        console.error('Database error after reconnection:', err);
        poolHealthy = false;
        
        if (
          err.code === 'PROTOCOL_CONNECTION_LOST' || 
          err.code === 'ECONNRESET' || 
          err.code === '57P01' // admin shutdown
        ) {
          attemptReconnection();
        }
      });
      
      // Test the new pool
      pool.query('SELECT 1')
        .then(() => {
          console.log('Successfully reconnected to database');
          poolHealthy = true;
        })
        .catch(err => {
          console.error('Failed to verify reconnection:', err);
          poolHealthy = false;
          attemptReconnection();
        });
    } catch (err) {
      console.error('Error recreating pool during reconnection:', err);
      poolHealthy = false;
      attemptReconnection();
    }
  }, delay);
}

// Helper function for database queries with enhanced error handling and retry logic
const query = async (text, params, retryCount = 0) => {
  const MAX_RETRIES = 3;
  let client;
  
  try {
    client = await pool.connect();
    const start = Date.now();
    const result = await client.query(text, params);
    const duration = Date.now() - start;
    
    // Log slow queries (over 100ms)
    if (duration > 100) {
      console.warn('Slow query:', { 
        text: text.substring(0, 100) + (text.length > 100 ? '...' : ''), 
        duration, 
        rows: result.rowCount 
      });
    }
    
    return result;
  } catch (error) {
    // Handle connection issues with retry logic
    if (
      (error.code === 'ECONNREFUSED' || 
       error.code === '08003' || // connection_does_not_exist
       error.code === '08006' || // connection_failure
       error.code === '57P01') && // admin shutdown
      retryCount < MAX_RETRIES
    ) {
      console.warn(`Database connection issue, retrying (${retryCount + 1}/${MAX_RETRIES})...`);
      
      // Wait before retrying with exponential backoff
      const delay = 100 * Math.pow(2, retryCount);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Release client if it exists
      if (client) client.release(true);
      
      // Attempt reconnection if pool is unhealthy
      if (!poolHealthy) {
        attemptReconnection();
      }
      
      // Retry the query
      return query(text, params, retryCount + 1);
    }
    
    // Handle specific database errors
    if (error.code === '23505') { // unique_violation
      throw new ApiError('Record already exists', 409);
    } else if (error.code === '23503') { // foreign_key_violation
      throw new ApiError('Referenced record does not exist', 400);
    } else if (error.code === '23502') { // not_null_violation
      throw new ApiError('Missing required fields', 400);
    } else if (error.code === '42P01') { // undefined_table
      throw new ApiError('Database table does not exist', 500);
    } else if (error.code === '28P01') { // invalid_password
      throw new ApiError('Database authentication failed', 500);
    }
    
    // Log unexpected errors
    console.error('Database error:', {
      code: error.code,
      message: error.message,
      query: text.substring(0, 100) + (text.length > 100 ? '...' : '')
    });
    
    throw new ApiError('Database operation failed', 500);
  } finally {
    if (client) {
      client.release(true); // Release with error reset
    }
  }
};

// Function to check database health with detailed information
const checkHealth = async () => {
  try {
    const startTime = Date.now();
    const result = await query('SELECT 1 as health_check');
    const responseTime = Date.now() - startTime;
    
    const poolStatus = {
      healthy: poolHealthy,
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount,
      responseTime,
    };
    
    return {
      status: 'ok',
      details: poolStatus
    };
  } catch (error) {
    console.error('Database health check failed:', error);
    
    return {
      status: 'error',
      error: error.message,
      code: error.code,
      details: {
        healthy: false,
        reconnectAttempts
      }
    };
  }
};

export {
  pool,
  query,
  checkHealth
};
