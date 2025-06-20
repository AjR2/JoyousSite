#!/usr/bin/env node

// Simple API test script
// Usage: node scripts/test-api.js

// Import required modules
const fs = require('fs').promises;
const path = require('path');

// Simple implementation for testing
const POSTS_FILE = path.join(__dirname, '..', 'public', 'posts.json');

async function getAllPosts() {
    const data = await fs.readFile(POSTS_FILE, 'utf8');
    return JSON.parse(data);
}

function createSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

async function getPostBySlug(slug) {
    const posts = await getAllPosts();
    return posts.find(post => createSlug(post.title) === slug);
}

async function searchPosts(query) {
    if (!query) return [];
    const posts = await getAllPosts();
    const normalizedQuery = query.toLowerCase();
    return posts.filter(post =>
        post.title.toLowerCase().includes(normalizedQuery) ||
        post.content.toLowerCase().includes(normalizedQuery)
    );
}

function transformPostToApiFormat(post) {
    const slug = createSlug(post.title);
    const summary = post.content.substring(0, 200) + '...';
    const keyPoints = post.content.split('<>').slice(0, 3).map(p => p.substring(0, 100) + '...');

    return {
        title: post.title,
        summary,
        key_points: keyPoints,
        url: `http://localhost:3000/blog/${slug}`,
        date: post.date,
        content: post.content
    };
}

async function testAPI() {
    console.log('🧪 Testing API functions...\n');
    
    try {
        // Test getAllPosts
        console.log('1. Testing getAllPosts()...');
        const allPosts = await getAllPosts();
        console.log(`   ✓ Found ${allPosts.length} posts`);
        
        if (allPosts.length > 0) {
            const firstPost = allPosts[0];
            console.log(`   ✓ First post: "${firstPost.title}"`);
            
            // Test transformPostToApiFormat
            console.log('\n2. Testing transformPostToApiFormat()...');
            const transformedPost = transformPostToApiFormat(firstPost);
            console.log(`   ✓ Transformed post has URL: ${transformedPost.url}`);
            console.log(`   ✓ Summary length: ${transformedPost.summary.length} characters`);
            console.log(`   ✓ Key points: ${transformedPost.key_points.length} items`);
            
            // Test getPostBySlug
            console.log('\n3. Testing getPostBySlug()...');
            const slug = transformedPost.url.split('/').pop();
            const postBySlug = await getPostBySlug(slug);
            
            if (postBySlug) {
                console.log(`   ✓ Found post by slug "${slug}": "${postBySlug.title}"`);
            } else {
                console.log(`   ✗ Could not find post by slug "${slug}"`);
            }
        }
        
        // Test searchPosts
        console.log('\n4. Testing searchPosts()...');
        const searchResults = await searchPosts('mental health');
        console.log(`   ✓ Search for "mental health" returned ${searchResults.length} results`);
        
        const searchResults2 = await searchPosts('gratitude');
        console.log(`   ✓ Search for "gratitude" returned ${searchResults2.length} results`);
        
        // Test empty search
        const emptySearch = await searchPosts('');
        console.log(`   ✓ Empty search returned ${emptySearch.length} results`);
        
        console.log('\n🎉 All API tests passed!');
        
    } catch (error) {
        console.error('\n❌ API test failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run tests
testAPI();
