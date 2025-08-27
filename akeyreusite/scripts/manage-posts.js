#!/usr/bin/env node

// Blog post management script
// Usage: node scripts/manage-posts.js [command] [options]

const fs = require('fs').promises;
const path = require('path');

const POSTS_FILE = path.join(__dirname, '..', 'public', 'posts.json');

// Helper functions
async function loadPosts() {
    try {
        const data = await fs.readFile(POSTS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading posts:', error.message);
        return [];
    }
}

async function savePosts(posts) {
    try {
        await fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2));
        console.log('Posts saved successfully!');
    } catch (error) {
        console.error('Error saving posts:', error.message);
    }
}

function validatePost(post) {
    const required = ['title', 'date', 'content'];
    const missing = required.filter(field => !post[field]);
    
    if (missing.length > 0) {
        throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
    
    // Validate date format
    if (!/^\w+ \d{1,2}, \d{4}$/.test(post.date)) {
        throw new Error('Date must be in format "Month DD, YYYY" (e.g., "January 1, 2024")');
    }
    
    return true;
}

// Commands
async function listPosts() {
    const posts = await loadPosts();
    console.log(`\nFound ${posts.length} posts:\n`);
    
    posts.forEach((post, index) => {
        console.log(`${index + 1}. ${post.title}`);
        console.log(`   Date: ${post.date}`);
        console.log(`   Content length: ${post.content.length} characters\n`);
    });
}

async function addPost(title, date, content) {
    const posts = await loadPosts();
    
    const newPost = { title, date, content };
    validatePost(newPost);
    
    posts.unshift(newPost); // Add to beginning (newest first)
    await savePosts(posts);
    
    console.log(`Added post: "${title}"`);
}

async function removePost(titleOrIndex) {
    const posts = await loadPosts();
    
    let index = -1;
    
    // Check if it's a number (index)
    if (!isNaN(titleOrIndex)) {
        index = parseInt(titleOrIndex) - 1; // Convert to 0-based index
    } else {
        // Search by title
        index = posts.findIndex(post => 
            post.title.toLowerCase().includes(titleOrIndex.toLowerCase())
        );
    }
    
    if (index === -1 || index >= posts.length) {
        console.error('Post not found!');
        return;
    }
    
    const removedPost = posts.splice(index, 1)[0];
    await savePosts(posts);
    
    console.log(`Removed post: "${removedPost.title}"`);
}

async function validateAllPosts() {
    const posts = await loadPosts();
    let errors = 0;
    
    console.log('Validating all posts...\n');
    
    posts.forEach((post, index) => {
        try {
            validatePost(post);
            console.log(`✓ Post ${index + 1}: "${post.title}" - Valid`);
        } catch (error) {
            console.error(`✗ Post ${index + 1}: "${post.title}" - ${error.message}`);
            errors++;
        }
    });
    
    console.log(`\nValidation complete. ${errors} errors found.`);
}

// CLI interface
async function main() {
    const [,, command, ...args] = process.argv;

    switch (command) {
        case 'list':
            await listPosts();
            break;

        case 'add':
            if (args.length < 3) {
                console.error('Usage: node manage-posts.js add "Title" "Date" "Content"');
                process.exit(1);
            }
            await addPost(args[0], args[1], args[2]);
            break;

        case 'remove':
            if (args.length < 1) {
                console.error('Usage: node manage-posts.js remove "Title or Index"');
                process.exit(1);
            }
            await removePost(args[0]);
            break;

        case 'validate':
            await validateAllPosts();
            break;

        default:
            console.log(`
Blog Post Management Tool

Commands:
  list                     - List all posts
  add "title" "date" "content" - Add a new post
  remove "title or index"  - Remove a post
  validate                 - Validate all posts

Examples:
  node scripts/manage-posts.js list
  node scripts/manage-posts.js add "My New Post" "January 1, 2024" "Post content here"
  node scripts/manage-posts.js remove "My New Post"
  node scripts/manage-posts.js remove 1
  node scripts/manage-posts.js validate
            `);
    }
}

// Run the main function
main().catch(console.error);
