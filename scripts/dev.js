const concurrently = require('concurrently');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Define commands to run concurrently
const commands = [
  {
    command: 'nodemon server.js',
    name: 'server',
    prefixColor: 'blue'
  }
];

// Add client command if we have a client directory
if (process.env.SERVE_CLIENT === 'true') {
  commands.push({
    command: 'cd fronted && npm start',
    name: 'frontend',
    prefixColor: 'green'
  });
}

// Options for concurrently
const options = {
  prefix: 'name',
  killOthers: ['failure', 'success'],
  restartTries: 3,
  restartDelay: 1000
};

// Run commands
console.log('Starting development servers...');
concurrently(commands, options).then(
  () => console.log('All processes exited successfully'),
  (error) => console.error('One or more processes failed', error)
); 