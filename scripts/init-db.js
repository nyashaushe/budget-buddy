const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Create a new pool using the connection string from .env
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function initializeDatabase() {
  try {
    console.log('Starting database initialization...');
    
    // Read the schema SQL file
    const schemaPath = path.join(__dirname, '..', 'config', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute the SQL commands
    await pool.query(schemaSql);
    
    console.log('Database schema created successfully!');
    
    // Close the pool
    await pool.end();
    
    console.log('Database initialization completed.');
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }
}

// Run the initialization
initializeDatabase(); 