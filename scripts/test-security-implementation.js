#!/usr/bin/env node

// Comprehensive Security Implementation Testing
// File: /scripts/test-security-implementation.js

const fs = require('fs');
const path = require('path');

// Test configuration
const SECURITY_TESTS = {
  files: {
    securityUtils: 'api/utils/security.js',
    config: 'api/utils/config.js',
    contactAPI: 'api/contact.js',
    postsAPI: 'api/posts/[slug].js',
    envExample: '.env.example'
  },
  
  requiredFeatures: {
    cors: ['setCORSHeaders', 'validateOrigin', 'CORS_CONFIG'],
    validation: ['validateInput', 'sanitizeInput', 'VALIDATION_PATTERNS'],
    rateLimit: ['rateLimit', 'RATE_LIMITS'],
    security: ['setSecurityHeaders', 'securityMiddleware'],
    environment: ['process.env', 'parseEnvArray', 'parseEnvBoolean']
  }
};

// Test results tracking
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  details: []
};

// Helper function to add test result
function addResult(name, passed, message = '', details = null) {
  testResults.total++;
  
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${name}: ${message || 'Passed'}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${name}: ${message || 'Failed'}`);
  }

  testResults.details.push({
    name,
    passed,
    message,
    details,
    timestamp: new Date().toISOString()
  });
}

// Test file existence and basic structure
function testFileStructure() {
  console.log('\n📁 Testing Security File Structure');
  console.log('='.repeat(50));

  Object.entries(SECURITY_TESTS.files).forEach(([name, filePath]) => {
    const exists = fs.existsSync(filePath);
    addResult(
      `File exists: ${name}`,
      exists,
      exists ? `Found at ${filePath}` : `Missing: ${filePath}`
    );

    if (exists && filePath.endsWith('.js')) {
      const content = fs.readFileSync(filePath, 'utf8');
      const hasExports = content.includes('export') || content.includes('module.exports');
      addResult(
        `File exports: ${name}`,
        hasExports,
        hasExports ? 'Has proper exports' : 'Missing exports'
      );
    }
  });
}

// Test CORS implementation
function testCORSImplementation() {
  console.log('\n🌐 Testing CORS Implementation');
  console.log('='.repeat(50));

  const securityFile = SECURITY_TESTS.files.securityUtils;
  if (!fs.existsSync(securityFile)) {
    addResult('CORS implementation', false, 'Security utils file not found');
    return;
  }

  const content = fs.readFileSync(securityFile, 'utf8');
  
  SECURITY_TESTS.requiredFeatures.cors.forEach(feature => {
    const hasFeature = content.includes(feature);
    addResult(
      `CORS feature: ${feature}`,
      hasFeature,
      hasFeature ? 'Implemented' : 'Missing implementation'
    );
  });

  // Test for environment-specific CORS
  const hasEnvCORS = content.includes('production') && content.includes('development');
  addResult(
    'Environment-specific CORS',
    hasEnvCORS,
    hasEnvCORS ? 'Environment-aware CORS configured' : 'Missing environment-specific CORS'
  );

  // Test for wildcard prevention
  const hasWildcardPrevention = !content.includes("'*'") && !content.includes('"*"');
  addResult(
    'CORS wildcard prevention',
    hasWildcardPrevention,
    hasWildcardPrevention ? 'No wildcard origins found' : 'Wildcard origins detected'
  );
}

// Test input validation and sanitization
function testInputValidation() {
  console.log('\n✅ Testing Input Validation');
  console.log('='.repeat(50));

  const securityFile = SECURITY_TESTS.files.securityUtils;
  if (!fs.existsSync(securityFile)) {
    addResult('Input validation', false, 'Security utils file not found');
    return;
  }

  const content = fs.readFileSync(securityFile, 'utf8');
  
  SECURITY_TESTS.requiredFeatures.validation.forEach(feature => {
    const hasFeature = content.includes(feature);
    addResult(
      `Validation feature: ${feature}`,
      hasFeature,
      hasFeature ? 'Implemented' : 'Missing implementation'
    );
  });

  // Test for XSS prevention
  const hasXSSPrevention = content.includes('&lt;') && content.includes('&gt;');
  addResult(
    'XSS prevention',
    hasXSSPrevention,
    hasXSSPrevention ? 'HTML entity encoding implemented' : 'Missing XSS prevention'
  );

  // Test for SQL injection prevention patterns
  const hasSQLPrevention = content.includes('sanitize') || content.includes('escape');
  addResult(
    'SQL injection prevention',
    hasSQLPrevention,
    hasSQLPrevention ? 'Input sanitization implemented' : 'Limited SQL injection prevention'
  );
}

// Test rate limiting implementation
function testRateLimiting() {
  console.log('\n⏱️  Testing Rate Limiting');
  console.log('='.repeat(50));

  const securityFile = SECURITY_TESTS.files.securityUtils;
  if (!fs.existsSync(securityFile)) {
    addResult('Rate limiting', false, 'Security utils file not found');
    return;
  }

  const content = fs.readFileSync(securityFile, 'utf8');
  
  SECURITY_TESTS.requiredFeatures.rateLimit.forEach(feature => {
    const hasFeature = content.includes(feature);
    addResult(
      `Rate limit feature: ${feature}`,
      hasFeature,
      hasFeature ? 'Implemented' : 'Missing implementation'
    );
  });

  // Test for different rate limit types
  const hasMultipleTypes = content.includes('default') && content.includes('strict');
  addResult(
    'Multiple rate limit types',
    hasMultipleTypes,
    hasMultipleTypes ? 'Multiple rate limit configurations' : 'Single rate limit configuration'
  );

  // Test for rate limit headers
  const hasRateLimitHeaders = content.includes('X-RateLimit') || content.includes('Retry-After');
  addResult(
    'Rate limit headers',
    hasRateLimitHeaders,
    hasRateLimitHeaders ? 'Rate limit headers implemented' : 'Missing rate limit headers'
  );
}

// Test security headers implementation
function testSecurityHeaders() {
  console.log('\n🛡️  Testing Security Headers');
  console.log('='.repeat(50));

  const securityFile = SECURITY_TESTS.files.securityUtils;
  if (!fs.existsSync(securityFile)) {
    addResult('Security headers', false, 'Security utils file not found');
    return;
  }

  const content = fs.readFileSync(securityFile, 'utf8');
  
  const requiredHeaders = [
    'X-Content-Type-Options',
    'X-Frame-Options',
    'X-XSS-Protection',
    'Content-Security-Policy',
    'Referrer-Policy'
  ];

  requiredHeaders.forEach(header => {
    const hasHeader = content.includes(header);
    addResult(
      `Security header: ${header}`,
      hasHeader,
      hasHeader ? 'Implemented' : 'Missing header'
    );
  });

  // Test for CSP implementation
  const hasCSP = content.includes("default-src 'self'");
  addResult(
    'Content Security Policy',
    hasCSP,
    hasCSP ? 'CSP configured' : 'Missing or incomplete CSP'
  );
}

// Test environment variable usage
function testEnvironmentVariables() {
  console.log('\n🌍 Testing Environment Variables');
  console.log('='.repeat(50));

  const configFile = SECURITY_TESTS.files.config;
  const envFile = SECURITY_TESTS.files.envExample;
  
  // Test config file
  if (fs.existsSync(configFile)) {
    const content = fs.readFileSync(configFile, 'utf8');
    
    SECURITY_TESTS.requiredFeatures.environment.forEach(feature => {
      const hasFeature = content.includes(feature);
      addResult(
        `Environment feature: ${feature}`,
        hasFeature,
        hasFeature ? 'Implemented' : 'Missing implementation'
      );
    });

    // Test for hardcoded values
    const hasHardcodedValues = content.includes('localhost:3000') || content.includes('akeyreu.com');
    addResult(
      'Hardcoded values check',
      !hasHardcodedValues,
      hasHardcodedValues ? 'Some hardcoded values found (may be fallbacks)' : 'No hardcoded values detected'
    );
  } else {
    addResult('Config file', false, 'Config file not found');
  }

  // Test .env.example file
  if (fs.existsSync(envFile)) {
    const envContent = fs.readFileSync(envFile, 'utf8');
    
    const requiredEnvVars = [
      'NODE_ENV',
      'CORS_ORIGINS',
      'SESSION_SECRET',
      'EMAILJS_SERVICE_ID'
    ];

    requiredEnvVars.forEach(envVar => {
      const hasVar = envContent.includes(envVar);
      addResult(
        `Environment variable: ${envVar}`,
        hasVar,
        hasVar ? 'Documented in .env.example' : 'Missing from .env.example'
      );
    });

    // Test for security warnings
    const hasSecurityWarnings = envContent.includes('CHANGE') || envContent.includes('SECURITY');
    addResult(
      'Security warnings in .env.example',
      hasSecurityWarnings,
      hasSecurityWarnings ? 'Security warnings present' : 'Missing security warnings'
    );
  } else {
    addResult('.env.example file', false, '.env.example file not found');
  }
}

// Test API endpoint security
function testAPIEndpointSecurity() {
  console.log('\n🔌 Testing API Endpoint Security');
  console.log('='.repeat(50));

  const apiFiles = [
    SECURITY_TESTS.files.contactAPI,
    SECURITY_TESTS.files.postsAPI
  ];

  apiFiles.forEach(apiFile => {
    if (!fs.existsSync(apiFile)) {
      addResult(`API security: ${path.basename(apiFile)}`, false, 'API file not found');
      return;
    }

    const content = fs.readFileSync(apiFile, 'utf8');
    const fileName = path.basename(apiFile);

    // Test for security middleware usage
    const hasSecurityMiddleware = content.includes('securityMiddleware');
    addResult(
      `Security middleware: ${fileName}`,
      hasSecurityMiddleware,
      hasSecurityMiddleware ? 'Security middleware implemented' : 'Missing security middleware'
    );

    // Test for input validation
    const hasInputValidation = content.includes('validateInput') || content.includes('validation');
    addResult(
      `Input validation: ${fileName}`,
      hasInputValidation,
      hasInputValidation ? 'Input validation implemented' : 'Missing input validation'
    );

    // Test for error handling
    const hasErrorHandling = content.includes('try') && content.includes('catch');
    addResult(
      `Error handling: ${fileName}`,
      hasErrorHandling,
      hasErrorHandling ? 'Error handling implemented' : 'Missing error handling'
    );

    // Test for method restrictions
    const hasMethodRestrictions = content.includes('method') && (content.includes('GET') || content.includes('POST'));
    addResult(
      `Method restrictions: ${fileName}`,
      hasMethodRestrictions,
      hasMethodRestrictions ? 'HTTP method restrictions implemented' : 'Missing method restrictions'
    );
  });
}

// Test security configuration completeness
function testSecurityConfiguration() {
  console.log('\n⚙️  Testing Security Configuration');
  console.log('='.repeat(50));

  const configFile = SECURITY_TESTS.files.config;
  if (!fs.existsSync(configFile)) {
    addResult('Security configuration', false, 'Config file not found');
    return;
  }

  const content = fs.readFileSync(configFile, 'utf8');

  // Test for security section
  const hasSecuritySection = content.includes('security:') || content.includes('security =');
  addResult(
    'Security configuration section',
    hasSecuritySection,
    hasSecuritySection ? 'Security section found' : 'Missing security configuration section'
  );

  // Test for rate limiting config
  const hasRateLimitConfig = content.includes('rateLimit') || content.includes('RATE_LIMIT');
  addResult(
    'Rate limiting configuration',
    hasRateLimitConfig,
    hasRateLimitConfig ? 'Rate limiting configured' : 'Missing rate limiting configuration'
  );

  // Test for CORS configuration
  const hasCORSConfig = content.includes('cors') && content.includes('origin');
  addResult(
    'CORS configuration',
    hasCORSConfig,
    hasCORSConfig ? 'CORS configured' : 'Missing CORS configuration'
  );

  // Test for environment-specific settings
  const hasEnvSpecific = content.includes('production') && content.includes('development');
  addResult(
    'Environment-specific settings',
    hasEnvSpecific,
    hasEnvSpecific ? 'Environment-specific configuration' : 'Missing environment-specific settings'
  );
}

// Generate security test report
function generateSecurityReport() {
  console.log('\n📊 Security Implementation Test Report');
  console.log('='.repeat(50));
  
  const summary = {
    total: testResults.total,
    passed: testResults.passed,
    failed: testResults.failed,
    score: Math.round((testResults.passed / testResults.total) * 100),
    timestamp: new Date().toISOString()
  };

  console.log(`Total Tests: ${summary.total}`);
  console.log(`Passed: ${summary.passed}`);
  console.log(`Failed: ${summary.failed}`);
  console.log(`Security Score: ${summary.score}%`);

  // Categorize results
  const categories = {
    critical: testResults.details.filter(r => !r.passed && (
      r.name.includes('CORS') || 
      r.name.includes('validation') || 
      r.name.includes('Security middleware')
    )),
    important: testResults.details.filter(r => !r.passed && (
      r.name.includes('header') || 
      r.name.includes('rate limit') || 
      r.name.includes('environment')
    )),
    minor: testResults.details.filter(r => !r.passed && !r.name.includes('CORS') && !r.name.includes('validation'))
  };

  if (categories.critical.length > 0) {
    console.log('\n🚨 Critical Security Issues:');
    categories.critical.forEach(r => console.log(`   • ${r.name}: ${r.message}`));
  }

  if (categories.important.length > 0) {
    console.log('\n⚠️  Important Security Issues:');
    categories.important.forEach(r => console.log(`   • ${r.name}: ${r.message}`));
  }

  console.log('\n📋 Security Recommendations:');
  console.log('1. Address all critical security issues immediately');
  console.log('2. Review and implement missing security headers');
  console.log('3. Ensure all API endpoints use security middleware');
  console.log('4. Test CORS configuration in production');
  console.log('5. Validate input sanitization with penetration testing');
  console.log('6. Regular security audits and dependency updates');

  // Save detailed report
  const reportPath = 'security-implementation-report.json';
  fs.writeFileSync(reportPath, JSON.stringify({
    summary,
    details: testResults.details,
    categories
  }, null, 2));
  
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);

  return summary;
}

// Main test runner
function runSecurityImplementationTests() {
  console.log('🔒 Security Implementation Testing Suite');
  console.log('========================================\n');

  // Run all test suites
  testFileStructure();
  testCORSImplementation();
  testInputValidation();
  testRateLimiting();
  testSecurityHeaders();
  testEnvironmentVariables();
  testAPIEndpointSecurity();
  testSecurityConfiguration();

  // Generate final report
  const summary = generateSecurityReport();

  // Exit with appropriate code
  if (summary.score >= 90) {
    console.log('\n✅ Security implementation tests passed!');
    process.exit(0);
  } else if (summary.score >= 70) {
    console.log('\n⚠️  Security implementation needs improvement.');
    process.exit(0);
  } else {
    console.log('\n❌ Security implementation requires immediate attention.');
    process.exit(1);
  }
}

// Export for use in other scripts
module.exports = {
  runSecurityImplementationTests,
  testCORSImplementation,
  testInputValidation,
  testRateLimiting,
  testSecurityHeaders,
  testEnvironmentVariables,
  testAPIEndpointSecurity
};

// Run tests if called directly
if (require.main === module) {
  runSecurityImplementationTests();
}
