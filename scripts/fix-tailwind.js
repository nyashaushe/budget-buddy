const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Fixing Tailwind CSS configuration...');

const frontendPath = path.join(__dirname, '..', 'frontend');
if (!fs.existsSync(frontendPath)) {
  console.error('Frontend directory not found!');
  process.exit(1);
}

// Install Tailwind CSS and its dependencies with specific versions
try {
  console.log('Installing Tailwind CSS and its dependencies...');
  execSync('cd frontend && npm uninstall tailwindcss postcss autoprefixer @tailwindcss/forms', { stdio: 'inherit' });
  execSync('cd frontend && npm install tailwindcss@3.3.2 postcss@8.4.24 autoprefixer@10.4.14 @tailwindcss/forms@0.5.3 --save', { stdio: 'inherit' });
} catch (error) {
  console.error('Error installing Tailwind CSS dependencies:', error.message);
  process.exit(1);
}

// Create Tailwind config file
const tailwindConfigPath = path.join(frontendPath, 'tailwind.config.js');
const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}`;

fs.writeFileSync(tailwindConfigPath, tailwindConfig);
console.log('Created tailwind.config.js');

// Create PostCSS config file
const postcssConfigPath = path.join(frontendPath, 'postcss.config.js');
const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;

fs.writeFileSync(postcssConfigPath, postcssConfig);
console.log('Created postcss.config.js');

// Update index.css
const indexCssPath = path.join(frontendPath, 'src', 'index.css');
if (fs.existsSync(indexCssPath)) {
  const indexCssContent = `@tailwind base;
@tailwind components;
@tailwind utilities;

/* Your custom CSS below */
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}`;

  fs.writeFileSync(indexCssPath, indexCssContent);
  console.log('Updated index.css with Tailwind directives');
}

console.log('\n✅ Tailwind CSS configuration fixed successfully!');
console.log('\nYou can now restart your frontend development server:');
console.log('  npm run dev-frontend'); 