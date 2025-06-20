#!/usr/bin/env node

// Dependency Update and Security Management Script
// File: /scripts/dependency-update.js

const fs = require('fs');
const { execSync } = require('child_process');

// Configuration
const UPDATE_CONFIG = {
  // Dependencies to exclude from automatic updates (require manual review)
  excludeFromAutoUpdate: [
    'react',
    'react-dom',
    'next'
  ],
  
  // Dependencies that should be updated with caution
  cautionDependencies: [
    'webpack',
    'babel',
    'eslint'
  ],

  // Maximum age for dependencies (in days)
  maxDependencyAge: 90,

  // Backup package.json before updates
  createBackup: true
};

// Helper function to run commands safely
function runCommand(command, options = {}) {
  try {
    const result = execSync(command, { 
      encoding: 'utf8', 
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options 
    });
    return { success: true, output: result };
  } catch (error) {
    return { 
      success: false, 
      error: error.message, 
      output: error.stdout || error.stderr 
    };
  }
}

// Create backup of package files
function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = `backups/dependencies-${timestamp}`;
  
  try {
    if (!fs.existsSync('backups')) {
      fs.mkdirSync('backups');
    }
    fs.mkdirSync(backupDir);
    
    // Backup package.json and package-lock.json
    if (fs.existsSync('package.json')) {
      fs.copyFileSync('package.json', `${backupDir}/package.json`);
    }
    if (fs.existsSync('package-lock.json')) {
      fs.copyFileSync('package-lock.json', `${backupDir}/package-lock.json`);
    }
    
    console.log(`✅ Backup created: ${backupDir}`);
    return backupDir;
  } catch (error) {
    console.error(`❌ Failed to create backup: ${error.message}`);
    return null;
  }
}

// Check for outdated dependencies
function checkOutdatedDependencies() {
  console.log('\n📊 Checking for outdated dependencies...');
  console.log('='.repeat(50));

  const result = runCommand('npm outdated --json', { silent: true });
  
  if (!result.success) {
    console.log('⚠️  Could not check outdated dependencies');
    return [];
  }

  try {
    const outdated = JSON.parse(result.output || '{}');
    const outdatedList = Object.entries(outdated).map(([name, info]) => ({
      name,
      current: info.current,
      wanted: info.wanted,
      latest: info.latest,
      type: info.type
    }));

    if (outdatedList.length === 0) {
      console.log('✅ All dependencies are up to date');
      return [];
    }

    console.log(`Found ${outdatedList.length} outdated dependencies:`);
    outdatedList.forEach(dep => {
      const severity = UPDATE_CONFIG.excludeFromAutoUpdate.includes(dep.name) ? '🔴' : 
                      UPDATE_CONFIG.cautionDependencies.includes(dep.name) ? '🟡' : '🟢';
      console.log(`${severity} ${dep.name}: ${dep.current} → ${dep.wanted} (latest: ${dep.latest})`);
    });

    return outdatedList;
  } catch (error) {
    console.error('❌ Failed to parse outdated dependencies:', error.message);
    return [];
  }
}

// Run security audit
function runSecurityAudit() {
  console.log('\n🔒 Running security audit...');
  console.log('='.repeat(50));

  const result = runCommand('npm audit --json', { silent: true });
  
  try {
    let auditData;
    if (result.success) {
      auditData = JSON.parse(result.output || '{}');
    } else if (result.output) {
      // npm audit returns non-zero exit code when vulnerabilities found
      auditData = JSON.parse(result.output);
    } else {
      console.log('⚠️  Could not run security audit');
      return { vulnerabilities: 0, fixable: 0 };
    }

    const metadata = auditData.metadata || {};
    const vulnerabilities = metadata.vulnerabilities || {};
    const total = vulnerabilities.total || 0;

    if (total === 0) {
      console.log('✅ No security vulnerabilities found');
      return { vulnerabilities: 0, fixable: 0 };
    }

    console.log(`Found ${total} vulnerabilities:`);
    console.log(`  High: ${vulnerabilities.high || 0}`);
    console.log(`  Moderate: ${vulnerabilities.moderate || 0}`);
    console.log(`  Low: ${vulnerabilities.low || 0}`);

    return {
      vulnerabilities: total,
      fixable: auditData.metadata?.fixable || 0,
      details: vulnerabilities
    };

  } catch (error) {
    console.error('❌ Failed to parse audit results:', error.message);
    return { vulnerabilities: 0, fixable: 0 };
  }
}

// Fix security vulnerabilities
function fixSecurityVulnerabilities(auditResults) {
  if (auditResults.vulnerabilities === 0) {
    return true;
  }

  console.log('\n🔧 Attempting to fix security vulnerabilities...');
  console.log('='.repeat(50));

  // Try automatic fix first
  const fixResult = runCommand('npm audit fix');
  
  if (fixResult.success) {
    console.log('✅ Automatic security fixes applied');
    
    // Check if force fix is needed
    const postFixAudit = runSecurityAudit();
    if (postFixAudit.vulnerabilities > 0) {
      console.log('\n⚠️  Some vulnerabilities remain. Consider running:');
      console.log('   npm audit fix --force');
      console.log('   (This may introduce breaking changes)');
    }
    
    return true;
  } else {
    console.log('❌ Automatic fix failed. Manual intervention required.');
    return false;
  }
}

// Update dependencies safely
function updateDependencies(outdatedList, options = {}) {
  const { autoUpdate = false, updateMajor = false } = options;
  
  console.log('\n📦 Updating dependencies...');
  console.log('='.repeat(50));

  if (outdatedList.length === 0) {
    console.log('✅ No dependencies to update');
    return true;
  }

  // Separate dependencies by update type
  const safeUpdates = outdatedList.filter(dep => 
    !UPDATE_CONFIG.excludeFromAutoUpdate.includes(dep.name) &&
    !UPDATE_CONFIG.cautionDependencies.includes(dep.name)
  );

  const cautionUpdates = outdatedList.filter(dep => 
    UPDATE_CONFIG.cautionDependencies.includes(dep.name)
  );

  const excludedUpdates = outdatedList.filter(dep => 
    UPDATE_CONFIG.excludeFromAutoUpdate.includes(dep.name)
  );

  // Update safe dependencies
  if (safeUpdates.length > 0 && autoUpdate) {
    console.log(`\n🟢 Updating ${safeUpdates.length} safe dependencies...`);
    safeUpdates.forEach(dep => {
      const updateCommand = updateMajor ? 
        `npm install ${dep.name}@latest` : 
        `npm update ${dep.name}`;
      
      const result = runCommand(updateCommand, { silent: true });
      if (result.success) {
        console.log(`✅ Updated ${dep.name}: ${dep.current} → ${dep.wanted}`);
      } else {
        console.log(`❌ Failed to update ${dep.name}: ${result.error}`);
      }
    });
  }

  // Report caution dependencies
  if (cautionUpdates.length > 0) {
    console.log(`\n🟡 Dependencies requiring caution (${cautionUpdates.length}):`);
    cautionUpdates.forEach(dep => {
      console.log(`   ${dep.name}: ${dep.current} → ${dep.wanted}`);
    });
    console.log('   Review these updates manually before applying.');
  }

  // Report excluded dependencies
  if (excludedUpdates.length > 0) {
    console.log(`\n🔴 Major dependencies requiring manual review (${excludedUpdates.length}):`);
    excludedUpdates.forEach(dep => {
      console.log(`   ${dep.name}: ${dep.current} → ${dep.wanted}`);
    });
    console.log('   These require careful testing before updating.');
  }

  return true;
}

// Clean up node_modules and reinstall
function cleanInstall() {
  console.log('\n🧹 Performing clean install...');
  console.log('='.repeat(50));

  // Remove node_modules and package-lock.json
  const cleanResult = runCommand('rm -rf node_modules package-lock.json', { silent: true });
  if (!cleanResult.success) {
    console.log('⚠️  Could not clean existing installation');
  }

  // Fresh install
  const installResult = runCommand('npm install');
  if (installResult.success) {
    console.log('✅ Clean install completed');
    return true;
  } else {
    console.log('❌ Clean install failed');
    return false;
  }
}

// Generate dependency report
function generateDependencyReport(outdatedList, auditResults) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalDependencies: 0,
      outdatedDependencies: outdatedList.length,
      securityVulnerabilities: auditResults.vulnerabilities,
      fixableVulnerabilities: auditResults.fixable
    },
    outdated: outdatedList,
    security: auditResults,
    recommendations: []
  };

  // Add recommendations
  if (auditResults.vulnerabilities > 0) {
    report.recommendations.push('Run npm audit fix to address security vulnerabilities');
  }

  if (outdatedList.length > 0) {
    report.recommendations.push('Review and update outdated dependencies');
  }

  // Count total dependencies
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const deps = Object.keys(packageJson.dependencies || {});
    const devDeps = Object.keys(packageJson.devDependencies || {});
    report.summary.totalDependencies = deps.length + devDeps.length;
  } catch (error) {
    console.warn('Could not count total dependencies');
  }

  // Save report
  const reportPath = 'dependency-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Dependency report saved to: ${reportPath}`);

  return report;
}

// Main function
function runDependencyUpdate(options = {}) {
  const {
    autoUpdate = false,
    updateMajor = false,
    cleanInstall: performCleanInstall = false,
    skipBackup = false
  } = options;

  console.log('📦 Dependency Update and Security Check');
  console.log('======================================\n');

  // Create backup
  let backupPath = null;
  if (UPDATE_CONFIG.createBackup && !skipBackup) {
    backupPath = createBackup();
  }

  try {
    // Check outdated dependencies
    const outdatedList = checkOutdatedDependencies();

    // Run security audit
    const auditResults = runSecurityAudit();

    // Fix security vulnerabilities
    if (auditResults.vulnerabilities > 0) {
      fixSecurityVulnerabilities(auditResults);
    }

    // Update dependencies
    if (autoUpdate) {
      updateDependencies(outdatedList, { autoUpdate, updateMajor });
    }

    // Clean install if requested
    if (performCleanInstall) {
      cleanInstall();
    }

    // Generate report
    const report = generateDependencyReport(outdatedList, auditResults);

    // Summary
    console.log('\n📊 Summary:');
    console.log('='.repeat(20));
    console.log(`Total Dependencies: ${report.summary.totalDependencies}`);
    console.log(`Outdated: ${report.summary.outdatedDependencies}`);
    console.log(`Security Vulnerabilities: ${report.summary.securityVulnerabilities}`);
    
    if (backupPath) {
      console.log(`Backup: ${backupPath}`);
    }

    console.log('\n✅ Dependency update completed!');

  } catch (error) {
    console.error('❌ Dependency update failed:', error.message);
    
    if (backupPath) {
      console.log(`\n🔄 To restore backup:`);
      console.log(`   cp ${backupPath}/package.json .`);
      console.log(`   cp ${backupPath}/package-lock.json .`);
      console.log(`   npm install`);
    }
    
    process.exit(1);
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    autoUpdate: args.includes('--auto'),
    updateMajor: args.includes('--major'),
    cleanInstall: args.includes('--clean'),
    skipBackup: args.includes('--no-backup')
  };

  if (args.includes('--help')) {
    console.log(`
Dependency Update Script

Usage: node scripts/dependency-update.js [options]

Options:
  --auto        Automatically update safe dependencies
  --major       Include major version updates
  --clean       Perform clean install (removes node_modules)
  --no-backup   Skip creating backup
  --help        Show this help message

Examples:
  node scripts/dependency-update.js                    # Check only
  node scripts/dependency-update.js --auto             # Auto-update safe deps
  node scripts/dependency-update.js --auto --major     # Include major updates
  node scripts/dependency-update.js --clean            # Clean install
    `);
    process.exit(0);
  }

  runDependencyUpdate(options);
}

module.exports = {
  runDependencyUpdate,
  checkOutdatedDependencies,
  runSecurityAudit,
  fixSecurityVulnerabilities,
  updateDependencies
};
