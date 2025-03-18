import { pool, checkHealth } from '../config/db.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testConnection() {
  console.log('Testing database connection...');
  console.log('Connection parameters:');
  console.log(`- Host: ${process.env.DB_HOST}`);
  console.log(`- Port: ${process.env.DB_PORT}`);
  console.log(`- Database: ${process.env.DB_NAME}`);
  console.log(`- User: ${process.env.DB_USER}`);
  
  try {
    // Test the connection
    const isHealthy = await checkHealth();
    
    if (isHealthy) {
      console.log('\n✅ Database connection successful!');
      
      // Get database info
      const client = await pool.connect();
      
      try {
        // Get PostgreSQL version
        const versionResult = await client.query('SELECT version()');
        console.log(`\nDatabase version: ${versionResult.rows[0].version}`);
        
        // Get table count
        const tableCountResult = await client.query(`
          SELECT count(*) FROM information_schema.tables 
          WHERE table_schema = 'public'
        `);
        console.log(`Number of tables: ${tableCountResult.rows[0].count}`);
        
        // List tables
        const tablesResult = await client.query(`
          SELECT table_name FROM information_schema.tables 
          WHERE table_schema = 'public'
          ORDER BY table_name
        `);
        
        console.log('\nAvailable tables:');
        tablesResult.rows.forEach(row => {
          console.log(`- ${row.table_name}`);
        });
      } finally {
        client.release();
      }
    } else {
      console.error('\n❌ Database connection failed!');
    }
  } catch (error) {
    console.error('\n❌ Database connection error:', error.message);
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
    
    // Provide helpful suggestions based on error code
    if (error.code === 'ECONNREFUSED') {
      console.error('\nSuggestions:');
      console.error('- Make sure PostgreSQL is running');
      console.error('- Check if the host and port are correct');
      console.error('- Verify firewall settings');
    } else if (error.code === '28P01') {
      console.error('\nSuggestions:');
      console.error('- Check if the username and password are correct');
    } else if (error.code === '3D000') {
      console.error('\nSuggestions:');
      console.error('- The database does not exist, create it first');
      console.error(`- Run: createdb ${process.env.DB_NAME}`);
    }
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the test
testConnection().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 