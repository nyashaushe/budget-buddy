import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, query } from '../config/db.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the schema file
const schemaPath = path.join(__dirname, '..', 'config', 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

// Function to initialize the database
async function setupDatabase() {
  console.log('Setting up database...');
  
  try {
    // Connect to the database
    const client = await pool.connect();
    console.log('Connected to database');
    
    // Execute the schema
    console.log('Creating tables...');
    await client.query(schema);
    console.log('Tables created successfully');
    
    // Check if the income table exists, if not create it
    const incomeTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'income'
      );
    `);
    
    if (!incomeTableCheck.rows[0].exists) {
      console.log('Creating income table...');
      await client.query(`
        CREATE TABLE IF NOT EXISTS income (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          source VARCHAR(100),
          amount DECIMAL(10, 2) NOT NULL,
          frequency VARCHAR(50),
          description TEXT,
          date DATE,
          category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('Income table created successfully');
    }
    
    // Release the client
    client.release();
    console.log('Database setup completed successfully');
    
    return true;
  } catch (error) {
    console.error('Error setting up database:', error);
    return false;
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the setup if this file is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  setupDatabase()
    .then(success => {
      if (success) {
        console.log('Database setup completed successfully');
        process.exit(0);
      } else {
        console.error('Database setup failed');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Unhandled error during database setup:', error);
      process.exit(1);
    });
}

export default setupDatabase; 