#!/usr/bin/env node

// Comprehensive Security Audit Tool
// File: /scripts/security-audit.js

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Security audit configuration
const SECURITY_CONFIG = {
  // Files to check for hardcoded secrets
  secretScanFiles: [
    'src/**/*.js',
    'src/**/*.jsx',
    'api/**/*.js',
    'public/**/*.js',
    '*.js',
    '*.json'
  ],
  
  // Patterns that might indicate security issues
  securityPatterns: [
    {
      pattern: /password\s*[:=]\s*['"][^'"]+['"]/gi,
      severity: 'HIGH',
      description: 'Hardcoded password detected'
    },
    {
      pattern: /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi,
      severity: 'HIGH',
      description: 'Hardcoded API key detected'
    },
    {
      pattern: /secret\s*[:=]\s*['"][^'"]+['"]/gi,
      severity: 'MEDIUM',
      description: 'Hardcoded secret detected'
    },
    {
      pattern: /token\s*[:=]\s*['"][^'"]+['"]/gi,
      severity: 'MEDIUM',
      description: 'Hardcoded token detected'
    },
    {
      pattern: /localhost:\d+/gi,
      severity: 'LOW',
      description: 'Hardcoded localhost URL'
    },
    {
      pattern: /http:\/\/[^'">\s]+/gi,
      severity: 'LOW',
      description: 'HTTP URL (should use HTTPS in production)'
    }
  ],

  // Dependencies to check for known vulnerabilities
  vulnerableDependencies: [
    'lodash',
    'moment',
    'request',
    'node-sass',
    'bower'
  ],

  // Required security headers
  requiredHeaders: [
    'X-Content-Type-Options',
    'X-Frame-Options',
    'X-XSS-Protection',
    'Content-Security-Policy',
    'Referrer-Policy'
  ]
};

// Test results tracking
let auditResults = {
  total: 0,
  passed: 0,
  failed: 0,
  warnings: 0,
  details: []
};

// Helper function to add test result
function addResult(name, status, severity = 'INFO', message = '', details = null) {
  auditResults.total++;
  
  const result = {
    name,
    status,
    severity,
    message,
    details,
    timestamp: new Date().toISOString()
  };

  if (status === 'PASS') {
    auditResults.passed++;
  } else if (status === 'FAIL') {
    auditResults.failed++;
  } else if (status === 'WARN') {
    auditResults.warnings++;
  }

  auditResults.details.push(result);

  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  const severityColor = severity === 'HIGH' ? '\x1b[31m' : severity === 'MEDIUM' ? '\x1b[33m' : '\x1b[36m';
  console.log(`${icon} ${severityColor}[${severity}]\x1b[0m ${name}: ${message}`);
}

// Check for hardcoded secrets and sensitive data
function checkHardcodedSecrets() {
  console.log('\n🔍 Checking for hardcoded secrets...');
  console.log('='.repeat(50));

  const filesToCheck = [
    'src/components/Contact.js',
    'src/components/ContactEnhanced.js',
    'api/utils/config.js',
    'package.json'
  ];

  let secretsFound = 0;

  filesToCheck.forEach(filePath => {
    if (!fs.existsSync(filePath)) {
      addResult(`File check: ${filePath}`, 'WARN', 'LOW', 'File not found');
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    
    SECURITY_CONFIG.securityPatterns.forEach(({ pattern, severity, description }) => {
      const matches = content.match(pattern);
      if (matches) {
        secretsFound++;
        addResult(
          `Secret scan: ${filePath}`,
          'FAIL',
          severity,
          `${description}: ${matches[0].substring(0, 50)}...`,
          { file: filePath, matches: matches.slice(0, 3) }
        );
      }
    });
  });

  if (secretsFound === 0) {
    addResult('Hardcoded secrets scan', 'PASS', 'INFO', 'No hardcoded secrets detected');
  }
}

// Check dependency vulnerabilities
function checkDependencyVulnerabilities() {
  console.log('\n🔒 Checking dependency vulnerabilities...');
  console.log('='.repeat(50));

  try {
    // Check if package.json exists
    if (!fs.existsSync('package.json')) {
      addResult('Package.json check', 'FAIL', 'HIGH', 'package.json not found');
      return;
    }

    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

    // Check for known vulnerable dependencies
    let vulnerableFound = 0;
    SECURITY_CONFIG.vulnerableDependencies.forEach(dep => {
      if (dependencies[dep]) {
        vulnerableFound++;
        addResult(
          `Vulnerable dependency: ${dep}`,
          'WARN',
          'MEDIUM',
          `Consider updating or replacing ${dep}`,
          { version: dependencies[dep] }
        );
      }
    });

    // Run npm audit if available
    try {
      const auditOutput = execSync('npm audit --json', { encoding: 'utf8', stdio: 'pipe' });
      const auditData = JSON.parse(auditOutput);

      if (auditData.metadata && auditData.metadata.vulnerabilities) {
        const vulnData = auditData.metadata.vulnerabilities;
        const totalVulns = vulnData.total || 0;

        if (totalVulns > 0) {
          const severity = vulnData.high > 0 ? 'HIGH' : vulnData.moderate > 0 ? 'MEDIUM' : 'LOW';
          addResult(
            'NPM Audit',
            'FAIL',
            severity,
            `Found ${totalVulns} vulnerabilities (High: ${vulnData.high || 0}, Moderate: ${vulnData.moderate || 0}, Low: ${vulnData.low || 0})`,
            { vulnerabilities: vulnData }
          );
        } else {
          addResult('NPM Audit', 'PASS', 'INFO', 'No vulnerabilities found');
        }
      } else {
        addResult('NPM Audit', 'PASS', 'INFO', 'No vulnerabilities found');
      }
    } catch (auditError) {
      // npm audit returns non-zero exit code when vulnerabilities are found
      if (auditError.stdout) {
        try {
          const auditData = JSON.parse(auditError.stdout);
          if (auditData.metadata && auditData.metadata.vulnerabilities) {
            const vulnData = auditData.metadata.vulnerabilities;
            const totalVulns = vulnData.total || 0;
            const severity = vulnData.high > 0 ? 'HIGH' : vulnData.moderate > 0 ? 'MEDIUM' : 'LOW';
            addResult(
              'NPM Audit',
              'FAIL',
              severity,
              `Found ${totalVulns} vulnerabilities`,
              { vulnerabilities: vulnData }
            );
          }
        } catch (parseError) {
          addResult('NPM Audit', 'WARN', 'LOW', 'Could not parse npm audit output');
        }
      } else {
        addResult('NPM Audit', 'WARN', 'LOW', 'Could not run npm audit');
      }
    }

    if (vulnerableFound === 0) {
      addResult('Known vulnerable dependencies', 'PASS', 'INFO', 'No known vulnerable dependencies found');
    }

  } catch (error) {
    addResult('Dependency check', 'FAIL', 'HIGH', `Error checking dependencies: ${error.message}`);
  }
}

// Check environment variable usage
function checkEnvironmentVariables() {
  console.log('\n🌍 Checking environment variable usage...');
  console.log('='.repeat(50));

  // Check if .env.example exists
  if (!fs.existsSync('.env.example')) {
    addResult('.env.example', 'FAIL', 'MEDIUM', '.env.example file missing');
  } else {
    addResult('.env.example', 'PASS', 'INFO', '.env.example file exists');
  }

  // Check if .env files are in .gitignore
  if (fs.existsSync('.gitignore')) {
    const gitignore = fs.readFileSync('.gitignore', 'utf8');
    if (gitignore.includes('.env')) {
      addResult('.gitignore check', 'PASS', 'INFO', '.env files are ignored by git');
    } else {
      addResult('.gitignore check', 'FAIL', 'HIGH', '.env files not in .gitignore');
    }
  } else {
    addResult('.gitignore check', 'WARN', 'MEDIUM', '.gitignore file not found');
  }

  // Check for hardcoded URLs in config
  if (fs.existsSync('api/utils/config.js')) {
    const config = fs.readFileSync('api/utils/config.js', 'utf8');
    if (config.includes('process.env')) {
      addResult('Environment variables usage', 'PASS', 'INFO', 'Using environment variables in config');
    } else {
      addResult('Environment variables usage', 'WARN', 'MEDIUM', 'Limited environment variable usage');
    }
  }
}

// Check security headers implementation
function checkSecurityHeaders() {
  console.log('\n🛡️  Checking security headers implementation...');
  console.log('='.repeat(50));

  if (fs.existsSync('api/utils/security.js')) {
    const securityFile = fs.readFileSync('api/utils/security.js', 'utf8');
    
    let headersImplemented = 0;
    SECURITY_CONFIG.requiredHeaders.forEach(header => {
      if (securityFile.includes(header)) {
        headersImplemented++;
        addResult(`Security header: ${header}`, 'PASS', 'INFO', 'Header implemented');
      } else {
        addResult(`Security header: ${header}`, 'FAIL', 'MEDIUM', 'Header not implemented');
      }
    });

    if (headersImplemented === SECURITY_CONFIG.requiredHeaders.length) {
      addResult('Security headers', 'PASS', 'INFO', 'All required security headers implemented');
    }
  } else {
    addResult('Security headers', 'FAIL', 'HIGH', 'Security utility file not found');
  }
}

// Check CORS configuration
function checkCORSConfiguration() {
  console.log('\n🌐 Checking CORS configuration...');
  console.log('='.repeat(50));

  if (fs.existsSync('api/utils/config.js')) {
    const config = fs.readFileSync('api/utils/config.js', 'utf8');
    
    if (config.includes('cors')) {
      addResult('CORS configuration', 'PASS', 'INFO', 'CORS configuration found');
      
      // Check for overly permissive CORS
      if (config.includes("'*'") || config.includes('"*"')) {
        addResult('CORS wildcard', 'FAIL', 'HIGH', 'Wildcard (*) CORS origin detected');
      } else {
        addResult('CORS wildcard', 'PASS', 'INFO', 'No wildcard CORS origins');
      }
    } else {
      addResult('CORS configuration', 'WARN', 'MEDIUM', 'CORS configuration not found');
    }
  }
}

// Check input validation implementation
function checkInputValidation() {
  console.log('\n✅ Checking input validation...');
  console.log('='.repeat(50));

  const filesToCheck = [
    'api/utils/security.js',
    'api/contact.js',
    'api/posts/[slug].js'
  ];

  let validationFound = 0;
  filesToCheck.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      if (content.includes('validateInput') || content.includes('sanitizeInput')) {
        validationFound++;
        addResult(`Input validation: ${filePath}`, 'PASS', 'INFO', 'Input validation implemented');
      } else {
        addResult(`Input validation: ${filePath}`, 'WARN', 'MEDIUM', 'No input validation found');
      }
    }
  });

  if (validationFound > 0) {
    addResult('Input validation', 'PASS', 'INFO', `Input validation found in ${validationFound} files`);
  }
}

// Generate security report
function generateSecurityReport() {
  console.log('\n📊 Security Audit Report');
  console.log('='.repeat(50));
  
  const summary = {
    total: auditResults.total,
    passed: auditResults.passed,
    failed: auditResults.failed,
    warnings: auditResults.warnings,
    score: Math.round((auditResults.passed / auditResults.total) * 100),
    timestamp: new Date().toISOString()
  };

  console.log(`Total Tests: ${summary.total}`);
  console.log(`Passed: ${summary.passed}`);
  console.log(`Failed: ${summary.failed}`);
  console.log(`Warnings: ${summary.warnings}`);
  console.log(`Security Score: ${summary.score}%`);

  // Security recommendations
  console.log('\n🔧 Security Recommendations:');
  console.log('='.repeat(30));
  
  if (summary.failed > 0) {
    console.log('❌ Critical Issues Found:');
    auditResults.details
      .filter(r => r.status === 'FAIL' && r.severity === 'HIGH')
      .forEach(r => console.log(`   • ${r.name}: ${r.message}`));
  }

  if (summary.warnings > 0) {
    console.log('\n⚠️  Warnings to Address:');
    auditResults.details
      .filter(r => r.status === 'WARN')
      .forEach(r => console.log(`   • ${r.name}: ${r.message}`));
  }

  console.log('\n📋 Next Steps:');
  console.log('1. Address all HIGH severity issues immediately');
  console.log('2. Review and fix MEDIUM severity issues');
  console.log('3. Run: npm audit fix');
  console.log('4. Update dependencies: npm update');
  console.log('5. Review environment variables');
  console.log('6. Test security headers in production');

  // Save detailed report
  const reportPath = 'security-audit-report.json';
  fs.writeFileSync(reportPath, JSON.stringify({
    summary,
    details: auditResults.details
  }, null, 2));
  
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);

  return summary;
}

// Main audit function
function runSecurityAudit() {
  console.log('🔒 Security Audit for Akeyreu');
  console.log('============================\n');

  // Run all security checks
  checkHardcodedSecrets();
  checkDependencyVulnerabilities();
  checkEnvironmentVariables();
  checkSecurityHeaders();
  checkCORSConfiguration();
  checkInputValidation();

  // Generate final report
  const summary = generateSecurityReport();

  // Exit with appropriate code
  if (summary.failed > 0) {
    console.log('\n❌ Security audit failed. Please address the issues above.');
    process.exit(1);
  } else if (summary.warnings > 0) {
    console.log('\n⚠️  Security audit completed with warnings.');
    process.exit(0);
  } else {
    console.log('\n✅ Security audit passed!');
    process.exit(0);
  }
}

// Export for use in other scripts
module.exports = {
  runSecurityAudit,
  checkHardcodedSecrets,
  checkDependencyVulnerabilities,
  checkEnvironmentVariables,
  checkSecurityHeaders,
  checkCORSConfiguration,
  checkInputValidation
};

// Run audit if called directly
if (require.main === module) {
  runSecurityAudit();
}
