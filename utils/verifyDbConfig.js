/**
 * Database Configuration Verification Script
 * 
 * This script checks the database configuration settings for common issues.
 * Run this script to validate your database configuration before starting the server.
 * 
 * Usage: node utils/verifyDbConfig.js
 */

import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import process from 'process';

// Get directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Attempt to load environment variables from .env
dotenv.config();

// Define required database configuration parameters
const requiredDbParams = [
  // DATABASE_URL is optional and will be used if provided
  // 'DATABASE_URL',  
  'DB_USER',
  'DB_PASSWORD',
  'DB_HOST',
  'DB_PORT',
  'DB_NAME'
];

// Check for required parameters
function checkRequiredParams() {
  console.log('🔍 Checking required database parameters...');
  
  const missing = [];
  const defined = [];
  
  for (const param of requiredDbParams) {
    if (!process.env[param]) {
      missing.push(param);
    } else {
      defined.push(param);
    }
  }
  
  if (missing.length > 0) {
    console.warn('⚠️ The following required database parameters are not defined:');
    for (const param of missing) {
      console.warn(`   - ${param}`);
    }
  } else {
    console.log('✅ All required database parameters are defined');
  }
  
  // Special check for DATABASE_URL vs individual parameters
  if (process.env.DATABASE_URL) {
    console.log('✅ DATABASE_URL is defined and will be used as the primary connection string');
    
    // Check if it contains placeholders
    if (process.env.DATABASE_URL.includes('${')) {
      console.warn('⚠️ DATABASE_URL appears to contain unresolved placeholders');
      console.warn('   This may prevent proper database connection');
    }
  } else if (defined.includes('DB_USER') && 
             defined.includes('DB_PASSWORD') && 
             defined.includes('DB_HOST') && 
             defined.includes('DB_PORT') && 
             defined.includes('DB_NAME')) {
    console.log('✅ Individual database parameters will be used to form the connection string');
  }
  
  return missing.length === 0;
}

// Check for common security issues
function checkSecurityIssues() {
  console.log('\n🔒 Checking for common database security issues...');
  
  const warnings = [];
  
  // Check for default or weak passwords
  const weakPasswords = ['postgres', 'password', '123456', 'admin', ''];
  const password = process.env.DB_PASSWORD;
  
  if (password && weakPasswords.includes(password.toLowerCase())) {
    warnings.push('Database password appears to be a common default/weak value');
  }
  
  // Check for default host settings
  if (process.env.DB_HOST === 'localhost' || process.env.DB_HOST === '127.0.0.1') {
    console.log('ℹ️ Using local database host');
  }
  
  // Check for credentials in the repo (if .env is in .gitignore)
  try {
    const gitignorePath = join(__dirname, '..', '.gitignore');
    const gitignoreContent = readFileSync(gitignorePath, 'utf8');
    
    if (!gitignoreContent.split('\n').some(line => line.trim() === '.env')) {
      warnings.push('.env file may not be in .gitignore - sensitive credentials could be exposed');
    } else {
      console.log('✅ .env file appears to be properly excluded in .gitignore');
    }
  } catch (error) {
    console.warn('⚠️ Could not check .gitignore file');
  }
  
  if (warnings.length > 0) {
    console.warn('⚠️ Security warnings:');
    for (const warning of warnings) {
      console.warn(`   - ${warning}`);
    }
  } else {
    console.log('✅ No obvious security issues detected');
  }
  
  return warnings.length === 0;
}

// Verify database connection parameters are valid
function verifyConnectionString() {
  console.log('\n🔌 Validating connection string format...');
  
  const dbUrl = process.env.DATABASE_URL || 
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
  
  try {
    // Simple validation of connection string format
    const urlPattern = /^postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/;
    const match = dbUrl.match(urlPattern);
    
    if (!match) {
      console.error('❌ Connection string format appears to be invalid');
      console.error(`   Format should be: postgresql://user:password@host:port/database`);
      return false;
    }
    
    const [_, user, password, host, port, dbname] = match;
    
    console.log('✅ Connection string format is valid');
    console.log('📊 Connection details:');
    console.log(`   - User: ${user}`);
    console.log(`   - Password: ${'*'.repeat(password.length)}`);
    console.log(`   - Host: ${host}`);
    console.log(`   - Port: ${port}`);
    console.log(`   - Database: ${dbname}`);
    
    // Validate port number
    const portNum = parseInt(port, 10);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      console.warn('⚠️ Port number appears to be invalid');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error validating connection string:', error.message);
    return false;
  }
}

// Summary of results
function printSummary(paramsValid, securityValid, connectionValid) {
  console.log('\n📋 Database Configuration Summary:');
  console.log(`   - Required parameters: ${paramsValid ? '✅ Valid' : '❌ Invalid'}`);
  console.log(`   - Security check: ${securityValid ? '✅ Passed' : '⚠️ Warnings'}`);
  console.log(`   - Connection string: ${connectionValid ? '✅ Valid format' : '❌ Invalid format'}`);
  
  if (paramsValid && connectionValid) {
    console.log('\n✅ Database configuration appears to be valid');
    console.log('🔄 Run `npm run dev` to start the server with this configuration');
  } else {
    console.error('\n❌ Database configuration issues detected');
    console.error('🛠️  Please fix the issues above before starting the server');
  }
}

// Run all checks
function runAllChecks() {
  console.log('🔍 Verifying Database Configuration');
  console.log('==================================');
  
  const paramsValid = checkRequiredParams();
  const securityValid = checkSecurityIssues();
  const connectionValid = verifyConnectionString();
  
  printSummary(paramsValid, securityValid, connectionValid);
  
  // Exit with appropriate code
  process.exit(paramsValid && connectionValid ? 0 : 1);
}

// Run the verification
runAllChecks(); 