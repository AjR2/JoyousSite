#!/usr/bin/env node

/**
 * Deployment Health Check Script
 * Validates deployment readiness and post-deployment health
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

class DeploymentChecker {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.checks = 0;
    this.passed = 0;
  }

  log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
  }

  success(message) {
    this.log(`✅ ${message}`, colors.green);
    this.passed++;
  }

  error(message) {
    this.log(`❌ ${message}`, colors.red);
    this.errors.push(message);
  }

  warning(message) {
    this.log(`⚠️  ${message}`, colors.yellow);
    this.warnings.push(message);
  }

  info(message) {
    this.log(`ℹ️  ${message}`, colors.blue);
  }

  async checkFileExists(filePath, required = true) {
    this.checks++;
    const fullPath = path.resolve(filePath);
    
    if (fs.existsSync(fullPath)) {
      this.success(`File exists: ${filePath}`);
      return true;
    } else {
      if (required) {
        this.error(`Required file missing: ${filePath}`);
      } else {
        this.warning(`Optional file missing: ${filePath}`);
      }
      return false;
    }
  }

  async checkPackageJson() {
    this.info('Checking package.json...');
    
    if (!await this.checkFileExists('package.json')) {
      return false;
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      // Check required scripts
      const requiredScripts = ['build', 'start', 'test'];
      for (const script of requiredScripts) {
        this.checks++;
        if (packageJson.scripts && packageJson.scripts[script]) {
          this.success(`Script exists: ${script}`);
        } else {
          this.error(`Missing required script: ${script}`);
        }
      }

      // Check dependencies
      this.checks++;
      if (packageJson.dependencies && Object.keys(packageJson.dependencies).length > 0) {
        this.success(`Dependencies defined (${Object.keys(packageJson.dependencies).length} packages)`);
      } else {
        this.error('No dependencies defined');
      }

      return true;
    } catch (error) {
      this.error(`Invalid package.json: ${error.message}`);
      return false;
    }
  }

  async checkBuildFiles() {
    this.info('Checking build configuration...');
    
    // Check build-related files
    const buildFiles = [
      { path: 'public/index.html', required: true },
      { path: 'src/App.js', required: true },
      { path: 'src/index.js', required: true },
      { path: 'vercel.json', required: false },
      { path: 'netlify.toml', required: false }
    ];

    for (const file of buildFiles) {
      await this.checkFileExists(file.path, file.required);
    }
  }

  async checkStaticAssets() {
    this.info('Checking static assets...');
    
    const staticFiles = [
      'public/favicon.ico',
      'public/manifest.json',
      'public/robots.txt'
    ];

    for (const file of staticFiles) {
      await this.checkFileExists(file, false);
    }

    // Check manifest.json validity
    if (fs.existsSync('public/manifest.json')) {
      try {
        const manifest = JSON.parse(fs.readFileSync('public/manifest.json', 'utf8'));
        this.checks++;
        if (manifest.name && manifest.short_name) {
          this.success('Manifest.json is valid');
        } else {
          this.warning('Manifest.json missing required fields');
        }
      } catch (error) {
        this.error(`Invalid manifest.json: ${error.message}`);
      }
    }
  }

  async checkEnvironmentVariables() {
    this.info('Checking environment variables...');
    
    const requiredEnvVars = ['NODE_ENV'];
    const optionalEnvVars = ['ADMIN_USERNAME', 'ADMIN_PASSWORD', 'VERCEL_TOKEN'];

    for (const envVar of requiredEnvVars) {
      this.checks++;
      if (process.env[envVar]) {
        this.success(`Environment variable set: ${envVar}`);
      } else {
        this.warning(`Environment variable not set: ${envVar}`);
      }
    }

    for (const envVar of optionalEnvVars) {
      this.checks++;
      if (process.env[envVar]) {
        this.success(`Optional environment variable set: ${envVar}`);
      } else {
        this.info(`Optional environment variable not set: ${envVar}`);
      }
    }
  }

  async checkUrl(url, timeout = 10000) {
    return new Promise((resolve) => {
      const protocol = url.startsWith('https:') ? https : http;
      
      const req = protocol.get(url, (res) => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          success: res.statusCode >= 200 && res.statusCode < 400
        });
      });

      req.setTimeout(timeout, () => {
        req.destroy();
        resolve({ success: false, error: 'Timeout' });
      });

      req.on('error', (error) => {
        resolve({ success: false, error: error.message });
      });
    });
  }

  async checkDeployedSite(url) {
    if (!url) {
      this.info('No URL provided for deployment check');
      return;
    }

    this.info(`Checking deployed site: ${url}`);

    // Check main page
    this.checks++;
    const mainPageResult = await this.checkUrl(url);
    if (mainPageResult.success) {
      this.success(`Main page accessible (${mainPageResult.status})`);
    } else {
      this.error(`Main page not accessible: ${mainPageResult.error || mainPageResult.status}`);
    }

    // Check service worker
    this.checks++;
    const swResult = await this.checkUrl(`${url}/sw.js`);
    if (swResult.success) {
      this.success('Service worker accessible');
    } else {
      this.warning('Service worker not accessible');
    }

    // Check manifest
    this.checks++;
    const manifestResult = await this.checkUrl(`${url}/manifest.json`);
    if (manifestResult.success) {
      this.success('Manifest accessible');
    } else {
      this.warning('Manifest not accessible');
    }

    // Check API endpoints (if they exist)
    const apiEndpoints = ['/api/posts', '/api/sitemap'];
    for (const endpoint of apiEndpoints) {
      this.checks++;
      const apiResult = await this.checkUrl(`${url}${endpoint}`);
      if (apiResult.success) {
        this.success(`API endpoint accessible: ${endpoint}`);
      } else {
        this.info(`API endpoint not accessible: ${endpoint} (may not be implemented)`);
      }
    }
  }

  async runAllChecks(deploymentUrl) {
    this.log('\n🔍 Running Deployment Health Checks', colors.cyan);
    this.log('=====================================', colors.cyan);

    await this.checkPackageJson();
    await this.checkBuildFiles();
    await this.checkStaticAssets();
    await this.checkEnvironmentVariables();

    if (deploymentUrl) {
      await this.checkDeployedSite(deploymentUrl);
    }

    this.printSummary();
    return this.errors.length === 0;
  }

  printSummary() {
    this.log('\n📊 Health Check Summary', colors.cyan);
    this.log('=======================', colors.cyan);
    
    this.log(`Total checks: ${this.checks}`);
    this.log(`Passed: ${this.passed}`, colors.green);
    this.log(`Warnings: ${this.warnings.length}`, colors.yellow);
    this.log(`Errors: ${this.errors.length}`, colors.red);

    if (this.errors.length > 0) {
      this.log('\n❌ Errors found:', colors.red);
      this.errors.forEach(error => this.log(`  • ${error}`, colors.red));
    }

    if (this.warnings.length > 0) {
      this.log('\n⚠️  Warnings:', colors.yellow);
      this.warnings.forEach(warning => this.log(`  • ${warning}`, colors.yellow));
    }

    if (this.errors.length === 0) {
      this.log('\n🎉 All critical checks passed! Ready for deployment.', colors.green);
    } else {
      this.log('\n🚨 Please fix the errors above before deploying.', colors.red);
    }
  }
}

// Main execution
async function main() {
  const checker = new DeploymentChecker();
  const deploymentUrl = process.argv[2]; // Optional URL parameter
  
  const success = await checker.runAllChecks(deploymentUrl);
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main().catch(error => {
    console.error('Health check failed:', error);
    process.exit(1);
  });
}

module.exports = DeploymentChecker;
