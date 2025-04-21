// Updated data.js with caching implementation
// File: /api/utils/data.js

const fs = require('fs').promises;
const path = require('path');
const slugify = require('slugify');
const { getFromCache, setInCache } = require('./cache');

// Path to the posts.json file
const postsFilePath = path.join(process.cwd(), 'public', 'posts.json');

// Cache keys
const CACHE_KEYS = {
    ALL_POSTS: 'all_posts',
    POST_BY_SLUG: slug => `post_${slug}`,
    SEARCH: query => `search_${query}`
};

// Function to read all posts
async function getAllPosts() {
    try {
        // Check cache first
        const cachedPosts = getFromCache(CACHE_KEYS.ALL_POSTS);
        if (cachedPosts) {
            return cachedPosts;
        }

        // Read from file if not in cache
        const data = await fs.readFile(postsFilePath, 'utf8');
        const posts = JSON.parse(data);

        // Store in cache
        setInCache(CACHE_KEYS.ALL_POSTS, posts);

        return posts;
    } catch (error) {
        console.error('Error reading posts file:', error);
        throw new Error('Failed to read posts data');
    }
}

// Function to get a post by slug
async function getPostBySlug(slug) {
    try {
        const cacheKey = CACHE_KEYS.POST_BY_SLUG(slug);
        const cachedPost = getFromCache(cacheKey);
        if (cachedPost) {
            return cachedPost;
        }

        const posts = await getAllPosts();
        const normalizedSlug = slug.toLowerCase();

        const post = posts.find(post => {
            if (!post.title) return false;

            const slugFromTitle = slugify(post.title, {
                lower: true,
                strict: true,
                remove: /[*+~.()'"!:@]/g
            });

            const slugFromUrl = post.url
                ? post.url.split('/').pop().toLowerCase()
                : null;

            return slugFromTitle === normalizedSlug || slugFromUrl === normalizedSlug;
        });

        if (!post) {
            console.warn(`Post not found for slug "${slug}"`);
            console.warn(
                'Available slugs:',
                posts.map(p =>
                    slugify(p.title || '', {
                        lower: true,
                        strict: true,
                        remove: /[*+~.()'"!:@]/g
                    })
                )
            );
        } else {
            setInCache(cacheKey, post);
        }

        return post || null;
    } catch (error) {
        console.error('Error finding post by slug:', error);
        throw new Error('Failed to find post');
    }
}

// Function to search posts
async function searchPosts(query) {
    try {
        if (!query) return [];

        // Check cache first
        const cacheKey = CACHE_KEYS.SEARCH(query);
        const cachedResults = getFromCache(cacheKey);
        if (cachedResults) {
            return cachedResults;
        }

        const posts = await getAllPosts();
        const normalizedQuery = query.toLowerCase();

        const results = posts.filter(post => {
            const titleMatch = post.title.toLowerCase().includes(normalizedQuery);
            const contentMatch = post.content.toLowerCase().includes(normalizedQuery);
            return titleMatch || contentMatch;
        });

        // Store in cache
        setInCache(cacheKey, results);

        return results;
    } catch (error) {
        console.error('Error searching posts:', error);
        throw new Error('Failed to search posts');
    }
}

// Function to transform post data to API format
function transformPostToApiFormat(post) {
    if (!post) return null;

    // Create slug from title
    const slug = slugify(post.title, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g
    });

    // Generate summary from content if not provided
    const summary = post.summary || generateSummary(post.content);

    // Extract or generate key points if not provided
    const keyPoints = post.key_points || generateKeyPoints(post.content);

    // Construct full URL
    const url = `https://akeyreu.com/blog/${slug}`;

    return {
        title: post.title,
        summary,
        key_points: keyPoints,
        url,
        date: post.date,
        content: post.content
    };
}

// Function to generate a summary from content
function generateSummary(content, maxLength = 200) {
    if (!content) return '';

    // Replace paragraph separators with spaces
    const plainText = content.replace(/<>/g, ' ').trim();

    // Truncate to maxLength
    if (plainText.length <= maxLength) return plainText;

    // Find the last space before maxLength to avoid cutting words
    const lastSpace = plainText.lastIndexOf(' ', maxLength);
    const truncated = plainText.substring(0, lastSpace > 0 ? lastSpace : maxLength);

    return truncated + '...';
}

// Function to generate key points from content
function generateKeyPoints(content) {
    if (!content) return [];

    // Split content into paragraphs
    const paragraphs = content.split('<>');

    // Extract first sentence from first 3 paragraphs as key points
    const keyPoints = paragraphs.slice(0, 3).map(paragraph => {
        // Find the first sentence (ending with . or ! or ?)
        const match = paragraph.match(/^[^.!?]*[.!?]/);
        return match ? match[0].trim() : paragraph.substring(0, 100).trim() + '...';
    });

    return keyPoints.filter(point => point.length > 0);
}

module.exports = {
    getAllPosts,
    getPostBySlug,
    searchPosts,
    transformPostToApiFormat
};
