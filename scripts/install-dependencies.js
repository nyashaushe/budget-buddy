const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Installing backend dependencies...');
try {
  execSync('npm install express cors dotenv pg bcryptjs jsonwebtoken express-validator concurrently nodemon', { stdio: 'inherit' });
  console.log('Backend dependencies installed successfully!');
} catch (error) {
  console.error('Error installing backend dependencies:', error.message);
  process.exit(1);
}

const frontendPath = path.join(__dirname, '..', 'frontend');
if (fs.existsSync(frontendPath)) {
  console.log('Installing frontend dependencies...');
  try {
    execSync('cd frontend && npm install axios react-router-dom tailwindcss@3.3.2 postcss@8.4.24 autoprefixer@10.4.14 @tailwindcss/forms@0.5.3', { stdio: 'inherit' });
    console.log('Frontend dependencies installed successfully!');
  } catch (error) {
    console.error('Error installing frontend dependencies:', error.message);
    process.exit(1);
  }
} else {
  console.log('Frontend directory not found. Skipping frontend dependencies installation.');
}

console.log('All dependencies installed successfully!'); 