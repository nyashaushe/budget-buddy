const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.log('Creating .env file with default values...');
  
  const defaultEnv = `PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
DB_USER=postgres
DB_HOST=localhost
DB_NAME=budget_buddy
DB_PASSWORD=your_password
DB_PORT=5432`;

  fs.writeFileSync(envPath, defaultEnv);
  console.log('.env file created successfully!');
} else {
  console.log('.env file already exists.');
}

// Load environment variables
dotenv.config({ path: envPath });

console.log('Running database setup...');

try {
  // Setup database schema
  console.log('Setting up database schema...');
  execSync('node utils/setupDb.js', { stdio: 'inherit' });
  
  // Initialize database with sample data
  console.log('Initializing database with sample data...');
  execSync('node utils/initializeDb.js', { stdio: 'inherit' });
  
  console.log('\nSetup completed successfully!');
  console.log('\nYou can now start the application with:');
  console.log('  npm run dev-full');
} catch (error) {
  console.error('Error during setup:', error.message);
  process.exit(1);
} 