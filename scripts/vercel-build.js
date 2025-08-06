#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Running Vercel build optimizations...');

// Ensure critical files exist in build directory
const buildDir = path.join(__dirname, '../build');
const publicDir = path.join(__dirname, '../public');

// Files that must be served correctly
const criticalFiles = [
  'sw.js',
  'manifest.json',
  'robots.txt',
  'sitemap.xml',
  'favicon.ico'
];

criticalFiles.forEach(file => {
  const buildPath = path.join(buildDir, file);
  const publicPath = path.join(publicDir, file);
  
  if (fs.existsSync(buildPath)) {
    console.log(`✅ ${file} exists in build directory`);
  } else if (fs.existsSync(publicPath)) {
    console.log(`⚠️  ${file} missing from build, copying from public...`);
    fs.copyFileSync(publicPath, buildPath);
    console.log(`✅ ${file} copied to build directory`);
  } else {
    console.log(`❌ ${file} missing from both build and public directories`);
  }
});

// Verify manifest.json is valid JSON
const manifestPath = path.join(buildDir, 'manifest.json');
if (fs.existsSync(manifestPath)) {
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    console.log('✅ manifest.json is valid JSON');
  } catch (error) {
    console.error('❌ manifest.json is invalid JSON:', error.message);
  }
}

// Verify sw.js is valid JavaScript
const swPath = path.join(buildDir, 'sw.js');
if (fs.existsSync(swPath)) {
  const swContent = fs.readFileSync(swPath, 'utf8');
  if (swContent.includes('<!DOCTYPE html>')) {
    console.error('❌ sw.js contains HTML instead of JavaScript');
  } else if (swContent.includes('self.addEventListener')) {
    console.log('✅ sw.js appears to be valid JavaScript');
  } else {
    console.warn('⚠️  sw.js may not be a valid service worker');
  }
}

console.log('🚀 Vercel build optimizations complete!');
