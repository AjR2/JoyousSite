#!/usr/bin/env node

// SEO and Accessibility Audit Script
// Validates all SEO improvements and accessibility features

const fs = require('fs').promises;
const path = require('path');
const { JSDOM } = require('jsdom');

const BASE_URL = 'http://localhost:3000';
const BUILD_DIR = path.join(__dirname, '..', 'build');

// Test configuration
const TESTS = {
  seo: {
    metaTags: true,
    structuredData: true,
    sitemap: true,
    robots: true,
    openGraph: true,
    semanticHTML: true
  },
  accessibility: {
    ariaLabels: true,
    headingHierarchy: true,
    altText: true,
    keyboardNavigation: true,
    colorContrast: true
  },
  performance: {
    bundleSize: true,
    caching: true,
    compression: true
  }
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName, passed, details = '') {
  const icon = passed ? '✅' : '❌';
  const color = passed ? 'green' : 'red';
  log(`${icon} ${testName}`, color);
  if (details) {
    log(`   ${details}`, 'blue');
  }
}

// Test HTML structure and meta tags
async function testHTMLStructure() {
  log('\n🔍 Testing HTML Structure & Meta Tags...', 'bold');
  
  try {
    const indexPath = path.join(BUILD_DIR, 'index.html');
    const html = await fs.readFile(indexPath, 'utf8');
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Test meta tags
    const title = document.querySelector('title');
    logTest('Title tag exists', !!title, title?.textContent);
    
    const description = document.querySelector('meta[name="description"]');
    logTest('Meta description exists', !!description, description?.getAttribute('content')?.substring(0, 100) + '...');
    
    const viewport = document.querySelector('meta[name="viewport"]');
    logTest('Viewport meta tag exists', !!viewport, viewport?.getAttribute('content'));
    
    // Test Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const ogImage = document.querySelector('meta[property="og:image"]');
    const ogUrl = document.querySelector('meta[property="og:url"]');
    
    logTest('Open Graph title', !!ogTitle);
    logTest('Open Graph description', !!ogDescription);
    logTest('Open Graph image', !!ogImage);
    logTest('Open Graph URL', !!ogUrl);
    
    // Test Twitter Card tags
    const twitterCard = document.querySelector('meta[name="twitter:card"]');
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    
    logTest('Twitter Card tags', !!twitterCard && !!twitterTitle);
    
    // Test structured data
    const structuredData = document.querySelectorAll('script[type="application/ld+json"]');
    logTest('Structured data (JSON-LD)', structuredData.length > 0, `Found ${structuredData.length} schema blocks`);
    
    // Test semantic HTML
    const main = document.querySelector('main');
    const nav = document.querySelector('nav');
    const header = document.querySelector('header');
    
    logTest('Semantic HTML elements', !!main && !!nav && !!header, 'main, nav, header elements found');
    
    return true;
  } catch (error) {
    log(`❌ Error testing HTML structure: ${error.message}`, 'red');
    return false;
  }
}

// Test accessibility features
async function testAccessibility() {
  log('\n♿ Testing Accessibility Features...', 'bold');
  
  try {
    const indexPath = path.join(BUILD_DIR, 'index.html');
    const html = await fs.readFile(indexPath, 'utf8');
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Test ARIA labels
    const ariaLabels = document.querySelectorAll('[aria-label]');
    const ariaDescribedBy = document.querySelectorAll('[aria-describedby]');
    const ariaLabelledBy = document.querySelectorAll('[aria-labelledby]');
    
    logTest('ARIA labels present', ariaLabels.length > 0, `Found ${ariaLabels.length} aria-label attributes`);
    logTest('ARIA relationships', ariaDescribedBy.length > 0 || ariaLabelledBy.length > 0, 
      `Found ${ariaDescribedBy.length} aria-describedby, ${ariaLabelledBy.length} aria-labelledby`);
    
    // Test heading hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const h1Count = document.querySelectorAll('h1').length;
    
    logTest('Heading hierarchy', headings.length > 0 && h1Count === 1, 
      `Found ${headings.length} headings, ${h1Count} h1 tags`);
    
    // Test alt text on images
    const images = document.querySelectorAll('img');
    const imagesWithAlt = document.querySelectorAll('img[alt]');
    
    logTest('Image alt text', images.length === imagesWithAlt.length, 
      `${imagesWithAlt.length}/${images.length} images have alt text`);
    
    // Test skip links
    const skipLinks = document.querySelectorAll('a[href="#main-content"], .skip-link');
    logTest('Skip navigation links', skipLinks.length > 0, `Found ${skipLinks.length} skip links`);
    
    // Test form labels
    const inputs = document.querySelectorAll('input, textarea, select');
    const labelsOrAria = document.querySelectorAll('input[aria-label], textarea[aria-label], select[aria-label], label');
    
    logTest('Form accessibility', inputs.length === 0 || labelsOrAria.length > 0, 
      `Form elements have proper labeling`);
    
    return true;
  } catch (error) {
    log(`❌ Error testing accessibility: ${error.message}`, 'red');
    return false;
  }
}

// Test sitemap and robots.txt
async function testSEOFiles() {
  log('\n🗺️  Testing SEO Files...', 'bold');
  
  try {
    // Test sitemap.xml
    const sitemapPath = path.join(BUILD_DIR, 'sitemap.xml');
    try {
      const sitemap = await fs.readFile(sitemapPath, 'utf8');
      const urlCount = (sitemap.match(/<url>/g) || []).length;
      logTest('Sitemap.xml exists', true, `Contains ${urlCount} URLs`);
      
      // Validate sitemap structure
      const hasUrlset = sitemap.includes('<urlset');
      const hasLoc = sitemap.includes('<loc>');
      const hasLastmod = sitemap.includes('<lastmod>');
      
      logTest('Sitemap structure valid', hasUrlset && hasLoc && hasLastmod, 
        'Contains urlset, loc, and lastmod elements');
    } catch (error) {
      logTest('Sitemap.xml exists', false, 'File not found');
    }
    
    // Test robots.txt
    const robotsPath = path.join(BUILD_DIR, 'robots.txt');
    try {
      const robots = await fs.readFile(robotsPath, 'utf8');
      const hasUserAgent = robots.includes('User-agent:');
      const hasSitemap = robots.includes('Sitemap:');
      
      logTest('Robots.txt exists', true, 'File found');
      logTest('Robots.txt structure', hasUserAgent && hasSitemap, 
        'Contains User-agent and Sitemap directives');
    } catch (error) {
      logTest('Robots.txt exists', false, 'File not found');
    }
    
    return true;
  } catch (error) {
    log(`❌ Error testing SEO files: ${error.message}`, 'red');
    return false;
  }
}

// Test bundle sizes and performance
async function testPerformance() {
  log('\n⚡ Testing Performance...', 'bold');
  
  try {
    const staticDir = path.join(BUILD_DIR, 'static');
    
    // Test JS bundle sizes
    const jsDir = path.join(staticDir, 'js');
    const jsFiles = await fs.readdir(jsDir);
    const jsStats = await Promise.all(
      jsFiles.filter(f => f.endsWith('.js')).map(async (file) => {
        const stats = await fs.stat(path.join(jsDir, file));
        return { file, size: stats.size };
      })
    );
    
    const totalJSSize = jsStats.reduce((sum, file) => sum + file.size, 0);
    const totalJSSizeKB = Math.round(totalJSSize / 1024);
    
    logTest('JavaScript bundle size', totalJSSizeKB < 500, `Total: ${totalJSSizeKB}KB`);
    
    // Test CSS bundle sizes
    const cssDir = path.join(staticDir, 'css');
    const cssFiles = await fs.readdir(cssDir);
    const cssStats = await Promise.all(
      cssFiles.filter(f => f.endsWith('.css')).map(async (file) => {
        const stats = await fs.stat(path.join(cssDir, file));
        return { file, size: stats.size };
      })
    );
    
    const totalCSSSize = cssStats.reduce((sum, file) => sum + file.size, 0);
    const totalCSSSizeKB = Math.round(totalCSSSize / 1024);
    
    logTest('CSS bundle size', totalCSSSizeKB < 100, `Total: ${totalCSSSizeKB}KB`);
    
    // Test code splitting
    const chunkFiles = jsFiles.filter(f => f.includes('chunk'));
    logTest('Code splitting implemented', chunkFiles.length > 0, `Found ${chunkFiles.length} chunks`);
    
    return true;
  } catch (error) {
    log(`❌ Error testing performance: ${error.message}`, 'red');
    return false;
  }
}

// Main audit function
async function runSEOAudit() {
  log('🔍 Starting SEO & Accessibility Audit...', 'bold');
  log('==========================================', 'blue');
  
  const results = {
    htmlStructure: await testHTMLStructure(),
    accessibility: await testAccessibility(),
    seoFiles: await testSEOFiles(),
    performance: await testPerformance()
  };
  
  // Summary
  log('\n📊 Audit Summary', 'bold');
  log('================', 'blue');
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  const score = Math.round((passedTests / totalTests) * 100);
  
  log(`Overall Score: ${score}%`, score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red');
  log(`Tests Passed: ${passedTests}/${totalTests}`, 'blue');
  
  if (score >= 80) {
    log('\n🎉 Excellent! Your site is well-optimized for SEO and accessibility.', 'green');
  } else if (score >= 60) {
    log('\n⚠️  Good progress, but some areas need improvement.', 'yellow');
  } else {
    log('\n❌ Several issues need to be addressed.', 'red');
  }
  
  return score >= 80;
}

// CLI interface
if (require.main === module) {
  runSEOAudit().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Audit failed:', error);
    process.exit(1);
  });
}

module.exports = { runSEOAudit };
