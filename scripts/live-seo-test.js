#!/usr/bin/env node

// Live SEO Test - Tests the running React application
// This tests the actual rendered content with all React components loaded

const puppeteer = require('puppeteer');

const BASE_URL = 'http://localhost:3000';

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

// Test a specific page
async function testPage(page, url, pageName) {
  log(`\n🔍 Testing ${pageName} (${url})...`, 'bold');
  
  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Test meta tags
    const title = await page.$eval('title', el => el.textContent).catch(() => null);
    const description = await page.$eval('meta[name="description"]', el => el.getAttribute('content')).catch(() => null);
    const viewport = await page.$eval('meta[name="viewport"]', el => el.getAttribute('content')).catch(() => null);
    
    logTest(`${pageName} - Title tag`, !!title, title);
    logTest(`${pageName} - Meta description`, !!description, description?.substring(0, 100) + '...');
    logTest(`${pageName} - Viewport meta`, !!viewport);
    
    // Test Open Graph tags
    const ogTitle = await page.$eval('meta[property="og:title"]', el => el.getAttribute('content')).catch(() => null);
    const ogDescription = await page.$eval('meta[property="og:description"]', el => el.getAttribute('content')).catch(() => null);
    const ogImage = await page.$eval('meta[property="og:image"]', el => el.getAttribute('content')).catch(() => null);
    const ogUrl = await page.$eval('meta[property="og:url"]', el => el.getAttribute('content')).catch(() => null);
    
    logTest(`${pageName} - Open Graph title`, !!ogTitle);
    logTest(`${pageName} - Open Graph description`, !!ogDescription);
    logTest(`${pageName} - Open Graph image`, !!ogImage);
    logTest(`${pageName} - Open Graph URL`, !!ogUrl);
    
    // Test Twitter Card tags
    const twitterCard = await page.$eval('meta[name="twitter:card"]', el => el.getAttribute('content')).catch(() => null);
    const twitterTitle = await page.$eval('meta[name="twitter:title"]', el => el.getAttribute('content')).catch(() => null);
    
    logTest(`${pageName} - Twitter Card`, !!twitterCard && !!twitterTitle);
    
    // Test structured data
    const structuredData = await page.$$eval('script[type="application/ld+json"]', scripts => scripts.length).catch(() => 0);
    logTest(`${pageName} - Structured data`, structuredData > 0, `Found ${structuredData} schema blocks`);
    
    // Test semantic HTML
    const main = await page.$('main').catch(() => null);
    const nav = await page.$('nav').catch(() => null);
    const header = await page.$('header').catch(() => null);
    
    logTest(`${pageName} - Semantic HTML`, !!main && !!nav && !!header);
    
    // Test accessibility
    const ariaLabels = await page.$$eval('[aria-label]', els => els.length).catch(() => 0);
    const ariaDescribedBy = await page.$$eval('[aria-describedby]', els => els.length).catch(() => 0);
    const ariaLabelledBy = await page.$$eval('[aria-labelledby]', els => els.length).catch(() => 0);
    
    logTest(`${pageName} - ARIA labels`, ariaLabels > 0, `Found ${ariaLabels} aria-label attributes`);
    logTest(`${pageName} - ARIA relationships`, ariaDescribedBy > 0 || ariaLabelledBy > 0, 
      `Found ${ariaDescribedBy} aria-describedby, ${ariaLabelledBy} aria-labelledby`);
    
    // Test heading hierarchy
    const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', els => els.length).catch(() => 0);
    const h1Count = await page.$$eval('h1', els => els.length).catch(() => 0);
    
    logTest(`${pageName} - Heading hierarchy`, headings > 0 && h1Count === 1, 
      `Found ${headings} headings, ${h1Count} h1 tags`);
    
    // Test images
    const images = await page.$$eval('img', els => els.length).catch(() => 0);
    const imagesWithAlt = await page.$$eval('img[alt]', els => els.length).catch(() => 0);
    
    logTest(`${pageName} - Image alt text`, images === 0 || images === imagesWithAlt, 
      `${imagesWithAlt}/${images} images have alt text`);
    
    // Test skip links
    const skipLinks = await page.$$eval('a[href="#main-content"], .skip-link', els => els.length).catch(() => 0);
    logTest(`${pageName} - Skip links`, skipLinks > 0, `Found ${skipLinks} skip links`);
    
    return {
      title: !!title,
      description: !!description,
      openGraph: !!(ogTitle && ogDescription && ogImage && ogUrl),
      twitterCard: !!(twitterCard && twitterTitle),
      structuredData: structuredData > 0,
      semanticHTML: !!(main && nav && header),
      accessibility: ariaLabels > 0 && (ariaDescribedBy > 0 || ariaLabelledBy > 0),
      headings: headings > 0 && h1Count === 1,
      images: images === 0 || images === imagesWithAlt,
      skipLinks: skipLinks > 0
    };
    
  } catch (error) {
    log(`❌ Error testing ${pageName}: ${error.message}`, 'red');
    return null;
  }
}

// Test API endpoints
async function testAPIEndpoints(page) {
  log('\n🔌 Testing API Endpoints...', 'bold');
  
  const endpoints = [
    '/api/posts',
    '/api/metadata?type=categories',
    '/api/metadata?type=tags',
    '/api/search?featured=true',
    '/api/sitemap',
    '/api/robots'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await page.goto(`${BASE_URL}${endpoint}`, { waitUntil: 'networkidle0' });
      const status = response.status();
      const contentType = response.headers()['content-type'] || '';
      
      logTest(`API ${endpoint}`, status === 200, `Status: ${status}, Type: ${contentType}`);
    } catch (error) {
      logTest(`API ${endpoint}`, false, `Error: ${error.message}`);
    }
  }
}

// Main test function
async function runLiveSEOTest() {
  log('🚀 Starting Live SEO & Accessibility Test...', 'bold');
  log('===============================================', 'blue');
  
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1200, height: 800 });
    
    // Test pages
    const pages = [
      { url: BASE_URL, name: 'Home Page' },
      { url: `${BASE_URL}/blog`, name: 'Blog Page' },
      { url: `${BASE_URL}/contact`, name: 'Contact Page' },
      { url: `${BASE_URL}/mindful-breaks`, name: 'Mindful Breaks Page' }
    ];
    
    const results = {};
    for (const pageInfo of pages) {
      results[pageInfo.name] = await testPage(page, pageInfo.url, pageInfo.name);
    }
    
    // Test API endpoints
    await testAPIEndpoints(page);
    
    // Calculate overall score
    log('\n📊 Test Summary', 'bold');
    log('===============', 'blue');
    
    let totalTests = 0;
    let passedTests = 0;
    
    Object.entries(results).forEach(([pageName, pageResults]) => {
      if (pageResults) {
        const pageTests = Object.values(pageResults);
        const pagePassed = pageTests.filter(Boolean).length;
        totalTests += pageTests.length;
        passedTests += pagePassed;
        
        const pageScore = Math.round((pagePassed / pageTests.length) * 100);
        log(`${pageName}: ${pageScore}% (${pagePassed}/${pageTests.length})`, 
          pageScore >= 80 ? 'green' : pageScore >= 60 ? 'yellow' : 'red');
      }
    });
    
    const overallScore = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
    
    log(`\nOverall Score: ${overallScore}%`, overallScore >= 80 ? 'green' : overallScore >= 60 ? 'yellow' : 'red');
    log(`Tests Passed: ${passedTests}/${totalTests}`, 'blue');
    
    if (overallScore >= 80) {
      log('\n🎉 Excellent! Your site is well-optimized for SEO and accessibility.', 'green');
    } else if (overallScore >= 60) {
      log('\n⚠️  Good progress, but some areas need improvement.', 'yellow');
    } else {
      log('\n❌ Several issues need to be addressed.', 'red');
    }
    
    return overallScore >= 80;
    
  } catch (error) {
    log(`❌ Test failed: ${error.message}`, 'red');
    return false;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// CLI interface
if (require.main === module) {
  runLiveSEOTest().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Live test failed:', error);
    process.exit(1);
  });
}

module.exports = { runLiveSEOTest };
