#!/usr/bin/env node
/**
 * OmniAgent Dashboard Build Verification Script
 * 
 * This script checks for common issues in the build that might cause problems in production.
 * Run this script before deploying to Vercel or any other production environment.
 * 
 * Usage: node scripts/verify-build.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

// Check if we're in the project root
if (!fs.existsSync(path.join(process.cwd(), 'package.json'))) {
  console.error(chalk.red('❌ Please run this script from the project root'));
  process.exit(1);
}

console.log(chalk.blue('🔍 Starting build verification...'));

// Array to collect any issues found
const issues = [];

// 1. Check for required environment variables
console.log(chalk.cyan('Checking environment variables...'));
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

const envFile = path.join(process.cwd(), '.env.local');

if (!fs.existsSync(envFile)) {
  issues.push('Missing .env.local file');
} else {
  const envContent = fs.readFileSync(envFile, 'utf8');
  
  for (const envVar of requiredEnvVars) {
    if (!envContent.includes(envVar)) {
      issues.push(`Missing environment variable: ${envVar}`);
    }
  }
  
  if (envContent.includes('NEXT_PUBLIC_USE_MOCK_DATA=true')) {
    issues.push('NEXT_PUBLIC_USE_MOCK_DATA is set to true. Set to false for production.');
  }
}

// 2. Check package.json for issues
console.log(chalk.cyan('Checking package.json...'));
const packageJson = require(path.join(process.cwd(), 'package.json'));

// Look for incorrect versions or missing dependencies
const criticalDependencies = [
  'next',
  'react',
  'react-dom',
  '@supabase/supabase-js',
  '@tanstack/react-query'
];

for (const dep of criticalDependencies) {
  if (!packageJson.dependencies[dep]) {
    issues.push(`Missing critical dependency: ${dep}`);
  }
}

// 3. Run a test build if not already present
console.log(chalk.cyan('Checking build output...'));
const nextDir = path.join(process.cwd(), '.next');

if (!fs.existsSync(nextDir)) {
  try {
    console.log(chalk.yellow('Build not found. Running build...'));
    execSync('npm run build', { stdio: 'inherit' });
  } catch (error) {
    issues.push('Build failed. See above for errors.');
    console.error(chalk.red('❌ Build verification failed'));
    console.log(chalk.red('Issues found:'));
    issues.forEach(issue => console.log(chalk.red(` - ${issue}`)));
    process.exit(1);
  }
}

// 4. Check for lint issues
console.log(chalk.cyan('Checking for lint issues...'));
try {
  execSync('npm run lint', { stdio: 'pipe' });
} catch (error) {
  issues.push('Linting failed. Run npm run lint to see issues.');
}

// 5. Check for large bundle sizes (simplified)
console.log(chalk.cyan('Checking bundle sizes...'));
const buildManifest = path.join(process.cwd(), '.next/build-manifest.json');
if (fs.existsSync(buildManifest)) {
  console.log(chalk.green('✓ Build manifest found'));
  console.log(chalk.yellow('Note: For detailed bundle analysis, run npm run analyze'));
} else {
  issues.push('Build manifest not found. Try rebuilding the application.');
}

// Report results
console.log(chalk.blue('\n🔍 Build verification complete!'));

if (issues.length > 0) {
  console.log(chalk.yellow(`⚠️ ${issues.length} issue(s) found:`));
  issues.forEach(issue => console.log(chalk.yellow(` - ${issue}`)));
  console.log(chalk.yellow('\nResolve these issues before deploying to production.'));
} else {
  console.log(chalk.green('✅ No issues found. Build is ready for production!'));
}

// Final instructions
console.log(chalk.blue('\n📋 Next steps:'));
console.log(chalk.white('1. Run the production build locally: npm start'));
console.log(chalk.white('2. Verify all features work correctly in the production build'));
console.log(chalk.white('3. Deploy to Vercel or your preferred hosting provider'));
console.log(chalk.white('4. Check the PRODUCTION-CHECKLIST.md file for final verification steps'));

process.exit(issues.length > 0 ? 1 : 0); 