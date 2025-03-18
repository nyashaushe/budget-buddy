const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.log('Creating .env file with default values...');
  
  const defaultEnv = `# Server Configuration
PORT=5000
NODE_ENV=development
SERVE_CLIENT=true

# Database Configuration
# Uncomment and modify this line to use a connection string directly
# DATABASE_URL=postgresql://username:password@localhost:5432/BudgetBuddy

# Or use individual parameters (both options work, but connection string takes precedence)
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=budget_buddy

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h`;

  fs.writeFileSync(envPath, defaultEnv);
  console.log('.env file created successfully');
  console.log('⚠️ Important: Update the database credentials in .env before proceeding');
} else {
  console.log('.env file already exists, skipping creation');
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

// Function to execute command and handle errors
function runCommand(command, errorMessage) {
  try {
    console.log(`Running: ${command}`);
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Error: ${errorMessage}`);
    console.error(error.message);
    return false;
  }
}

// Install dependencies
console.log('\n📦 Installing server dependencies...');
runCommand('npm install', 'Failed to install server dependencies');

// Install frontend dependencies
console.log('\n📦 Installing frontend dependencies...');
runCommand('cd frontend && npm install', 'Failed to install frontend dependencies');

// Verify database configuration
console.log('\n🔍 To verify your database configuration, run:');
console.log('npm run verify-db');

// Database setup instructions
console.log('\n🗄️ To set up the database schema, run:');
console.log('npm run setup-db');

// Startup instructions
console.log('\n🚀 To start the application in development mode, run:');
console.log('npm run dev-full');

console.log('\n✅ Setup completed successfully!\n'); 