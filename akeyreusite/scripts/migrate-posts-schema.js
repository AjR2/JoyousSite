#!/usr/bin/env node

// Blog post schema migration script
// Migrates existing posts to new enhanced schema with categories, tags, and metadata

const fs = require('fs').promises;
const path = require('path');
const slugify = require('slugify');

const POSTS_FILE = path.join(__dirname, '..', 'public', 'posts.json');
const BACKUP_FILE = path.join(__dirname, '..', 'public', 'posts-backup.json');

// Predefined categories and tags for mental health content
const CATEGORIES = {
    'Mental Health': ['mental health', 'wellness', 'depression', 'anxiety', 'therapy', 'mindfulness'],
    'Personal Development': ['growth', 'development', 'goals', 'habits', 'productivity', 'success'],
    'Relationships': ['relationships', 'love', 'friendship', 'communication', 'boundaries'],
    'Lifestyle': ['lifestyle', 'nature', 'sleep', 'exercise', 'creativity', 'gratitude'],
    'Self-Care': ['self-care', 'self-love', 'journaling', 'meditation', 'healing']
};

// Function to generate slug from title
function generateSlug(title) {
    return slugify(title, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g
    });
}

// Function to estimate reading time (average 200 words per minute)
function estimateReadingTime(content) {
    const words = content.split(/\s+/).length;
    return Math.ceil(words / 200);
}

// Function to generate summary from content
function generateSummary(content, maxLength = 200) {
    if (!content) return '';
    
    // Replace paragraph separators with spaces and clean up
    const plainText = content.replace(/<>/g, ' ').replace(/\n/g, ' ').trim();
    
    if (plainText.length <= maxLength) return plainText;
    
    // Find the last space before maxLength to avoid cutting words
    const lastSpace = plainText.lastIndexOf(' ', maxLength);
    const truncated = plainText.substring(0, lastSpace > 0 ? lastSpace : maxLength);
    
    return truncated + '...';
}

// Function to categorize content based on keywords
function categorizeContent(title, content) {
    const text = (title + ' ' + content).toLowerCase();
    const foundCategories = [];
    
    for (const [category, keywords] of Object.entries(CATEGORIES)) {
        if (keywords.some(keyword => text.includes(keyword))) {
            foundCategories.push(category);
        }
    }
    
    // Default to Mental Health if no categories found
    return foundCategories.length > 0 ? foundCategories : ['Mental Health'];
}

// Function to extract tags from content
function extractTags(title, content, categories) {
    const text = (title + ' ' + content).toLowerCase();
    const tags = new Set();
    
    // Add category-based tags
    for (const category of categories) {
        if (CATEGORIES[category]) {
            CATEGORIES[category].forEach(keyword => {
                if (text.includes(keyword)) {
                    tags.add(keyword);
                }
            });
        }
    }
    
    // Add some manual tags based on common themes
    const manualTags = {
        'accountability': ['accountable', 'responsibility'],
        'resilience': ['resilient', 'overcome', 'strength'],
        'mindfulness': ['mindful', 'present', 'awareness'],
        'positivity': ['positive', 'optimism', 'hope'],
        'stress management': ['stress', 'overwhelm', 'pressure'],
        'emotional health': ['emotion', 'feeling', 'mood'],
        'life balance': ['balance', 'harmony', 'equilibrium']
    };
    
    for (const [tag, keywords] of Object.entries(manualTags)) {
        if (keywords.some(keyword => text.includes(keyword))) {
            tags.add(tag);
        }
    }
    
    return Array.from(tags).slice(0, 8); // Limit to 8 tags
}

// Function to determine if post should be featured
function shouldBeFeatured(title, content) {
    const featuredKeywords = [
        'mental health', 'wellness', 'self-care', 'resilience', 
        'personal growth', 'mindfulness', 'gratitude'
    ];
    
    const text = (title + ' ' + content).toLowerCase();
    return featuredKeywords.some(keyword => text.includes(keyword));
}

// Function to migrate a single post
function migratePost(post, index) {
    const id = generateSlug(post.title);
    const categories = categorizeContent(post.title, post.content);
    const tags = extractTags(post.title, post.content, categories);
    const summary = generateSummary(post.content);
    const readTime = estimateReadingTime(post.content);
    const featured = shouldBeFeatured(post.title, post.content) && index < 3; // Only first 3 can be featured
    
    // Convert <> separators to proper newlines
    const formattedContent = post.content ? post.content.replace(/<>/g, '\n\n') : '';
    
    return {
        id,
        title: post.title,
        date: post.date,
        author: post.author || 'Akeyreu Team',
        categories,
        tags,
        summary,
        featured,
        readTime,
        content: formattedContent
    };
}

// Main migration function
async function migratePosts() {
    try {
        console.log('Starting blog post schema migration...\n');
        
        // Read existing posts
        const data = await fs.readFile(POSTS_FILE, 'utf8');
        const posts = JSON.parse(data);
        
        console.log(`Found ${posts.length} posts to migrate`);
        
        // Create backup
        await fs.writeFile(BACKUP_FILE, data);
        console.log('✓ Created backup at posts-backup.json');
        
        // Migrate each post
        const migratedPosts = posts.map((post, index) => {
            const migrated = migratePost(post, index);
            console.log(`✓ Migrated: "${migrated.title}"`);
            console.log(`  - Categories: ${migrated.categories.join(', ')}`);
            console.log(`  - Tags: ${migrated.tags.join(', ')}`);
            console.log(`  - Read time: ${migrated.readTime} min`);
            console.log(`  - Featured: ${migrated.featured ? 'Yes' : 'No'}\n`);
            return migrated;
        });
        
        // Write migrated posts
        await fs.writeFile(POSTS_FILE, JSON.stringify(migratedPosts, null, 2));
        
        console.log(`\n✅ Migration completed successfully!`);
        console.log(`📊 Migration Summary:`);
        console.log(`   - Total posts: ${migratedPosts.length}`);
        console.log(`   - Featured posts: ${migratedPosts.filter(p => p.featured).length}`);
        console.log(`   - Categories used: ${[...new Set(migratedPosts.flatMap(p => p.categories))].join(', ')}`);
        console.log(`   - Backup saved: posts-backup.json`);
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

// CLI interface
if (require.main === module) {
    migratePosts();
}

module.exports = { migratePosts, migratePost };
