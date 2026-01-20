// Pre-Deployment Verification Script
// Run this before deploying to Koyeb to ensure everything is ready
// Usage: node pre-deploy-check.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🔍 SAP Business System - Pre-Deployment Check\n');
console.log('=' .repeat(60));

const checks = [];
let passCount = 0;
let failCount = 0;

// Check 1: package.json exists
console.log('\n📦 Checking package.json...');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  
  if (packageJson.scripts && packageJson.scripts.start) {
    console.log('✅ package.json exists with "start" script');
    passCount++;
  } else {
    console.log('❌ "start" script missing in package.json');
    failCount++;
  }
  
  // Check dependencies
  const requiredDeps = ['express', 'pg', 'dotenv', 'cors', 'jsonwebtoken'];
  const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
  
  if (missingDeps.length === 0) {
    console.log('✅ All required dependencies present');
    passCount++;
  } else {
    console.log(`❌ Missing dependencies: ${missingDeps.join(', ')}`);
    failCount++;
  }
} catch (error) {
  console.log('❌ package.json not found or invalid');
  failCount++;
}

// Check 2: .env file exists
console.log('\n🔐 Checking environment configuration...');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file exists');
  passCount++;
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = ['DATABASE_URL', 'JWT_SECRET', 'PORT'];
  const missingVars = requiredVars.filter(v => !envContent.includes(v));
  
  if (missingVars.length === 0) {
    console.log('✅ All required environment variables present');
    passCount++;
  } else {
    console.log(`❌ Missing variables: ${missingVars.join(', ')}`);
    failCount++;
  }
} else {
  console.log('❌ .env file not found');
  failCount++;
}

// Check 3: src/index.js exists
console.log('\n📁 Checking source files...');
const indexPath = path.join(__dirname, 'src', 'index.js');
if (fs.existsSync(indexPath)) {
  console.log('✅ src/index.js exists');
  passCount++;
  
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  
  // Check for PORT configuration
  if (indexContent.includes('process.env.PORT')) {
    console.log('✅ PORT environment variable configured');
    passCount++;
  } else {
    console.log('⚠️  PORT may not be configurable via environment');
  }
  
  // Check for health endpoint
  if (indexContent.includes('/health') || indexContent.includes('/api/health')) {
    console.log('✅ Health check endpoint found');
    passCount++;
  } else {
    console.log('⚠️  No health check endpoint found');
  }
} else {
  console.log('❌ src/index.js not found');
  failCount++;
}

// Check 4: Database connection file
console.log('\n💾 Checking database configuration...');
const dbPath = path.join(__dirname, 'src', 'db', 'connection.js');
if (fs.existsSync(dbPath)) {
  console.log('✅ Database connection file exists');
  passCount++;
} else {
  console.log('❌ Database connection file not found');
  failCount++;
}

// Check 5: Routes directory
console.log('\n🛣️  Checking routes...');
const routesPath = path.join(__dirname, 'src', 'routes');
if (fs.existsSync(routesPath)) {
  const routes = fs.readdirSync(routesPath).filter(f => f.endsWith('.js'));
  console.log(`✅ Found ${routes.length} route files`);
  passCount++;
} else {
  console.log('❌ Routes directory not found');
  failCount++;
}

// Check 6: .gitignore
console.log('\n📝 Checking .gitignore...');
const gitignorePath = path.join(__dirname, '..', '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  
  if (gitignoreContent.includes('.env') && gitignoreContent.includes('node_modules')) {
    console.log('✅ .gitignore properly configured');
    passCount++;
  } else {
    console.log('⚠️  .gitignore may be incomplete');
  }
} else {
  console.log('⚠️  .gitignore not found');
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('\n📊 SUMMARY\n');
console.log(`✅ Passed: ${passCount}`);
console.log(`❌ Failed: ${failCount}`);

if (failCount === 0) {
  console.log('\n🎉 All checks passed! Your backend is ready for Koyeb deployment.\n');
  console.log('Next steps:');
  console.log('1. Commit and push your code to GitHub');
  console.log('2. Go to https://koyeb.com');
  console.log('3. Follow the steps in DEPLOYMENT_CHECKLIST.md');
  console.log('4. Deploy! 🚀\n');
} else {
  console.log('\n⚠️  Some checks failed. Please fix the issues above before deploying.\n');
}

console.log('=' .repeat(60) + '\n');

// Environment variables to copy to Koyeb
console.log('📋 ENVIRONMENT VARIABLES FOR KOYEB:\n');
console.log('Copy these to Koyeb Dashboard → Environment Variables:\n');

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  lines.forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#') && line.includes('=')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=');
      
      // Mask sensitive values
      let displayValue = value;
      if (key.includes('SECRET') || key.includes('PASSWORD')) {
        displayValue = value.substring(0, 10) + '...' + value.substring(value.length - 4);
      }
      
      console.log(`${key}=${displayValue}`);
    }
  });
} catch (error) {
  console.log('Could not read .env file');
}

console.log('\n⚠️  Remember: Add these as environment variables in Koyeb, not in .env.production');
console.log('=' .repeat(60) + '\n');
