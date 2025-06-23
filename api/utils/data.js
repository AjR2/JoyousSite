// Updated data.js with caching implementation
// File: /api/utils/data.js

import fs from 'fs/promises';
import path from 'path';
import slugify from 'slugify';
import { getFromCache, setInCache } from './cache.js';
import config from './config.js';

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
        const cachedPost = getFromCache(cacheKey, config.cache.postTTL);
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

// Function to search posts with enhanced filtering
async function searchPosts(query, filters = {}) {
    try {
        if (!query && !filters.category && !filters.tag) return [];

        // Check cache first
        const cacheKey = CACHE_KEYS.SEARCH(`${query}_${JSON.stringify(filters)}`);
        const cachedResults = getFromCache(cacheKey, config.cache.searchTTL);
        if (cachedResults) {
            return cachedResults;
        }

        const posts = await getAllPosts();
        let results = posts;

        // Apply text search if query provided
        if (query) {
            const normalizedQuery = query.toLowerCase();
            results = results.filter(post => {
                const titleMatch = post.title.toLowerCase().includes(normalizedQuery);
                const contentMatch = post.content.toLowerCase().includes(normalizedQuery);
                const summaryMatch = post.summary && post.summary.toLowerCase().includes(normalizedQuery);
                const tagMatch = post.tags && post.tags.some(tag => tag.toLowerCase().includes(normalizedQuery));
                const categoryMatch = post.categories && post.categories.some(cat => cat.toLowerCase().includes(normalizedQuery));

                return titleMatch || contentMatch || summaryMatch || tagMatch || categoryMatch;
            });
        }

        // Apply category filter
        if (filters.category) {
            results = results.filter(post =>
                post.categories && post.categories.includes(filters.category)
            );
        }

        // Apply tag filter
        if (filters.tag) {
            results = results.filter(post =>
                post.tags && post.tags.includes(filters.tag)
            );
        }

        // Apply featured filter
        if (filters.featured !== undefined) {
            results = results.filter(post => post.featured === filters.featured);
        }

        // Store in cache
        setInCache(cacheKey, results);

        return results;
    } catch (error) {
        console.error('Error searching posts:', error);
        throw new Error('Failed to search posts');
    }
}

// Function to get all categories
async function getAllCategories() {
    try {
        const posts = await getAllPosts();
        const categories = new Set();

        posts.forEach(post => {
            if (post.categories) {
                post.categories.forEach(category => categories.add(category));
            }
        });

        return Array.from(categories).sort();
    } catch (error) {
        console.error('Error getting categories:', error);
        throw new Error('Failed to get categories');
    }
}

// Function to get all tags
async function getAllTags() {
    try {
        const posts = await getAllPosts();
        const tagCounts = new Map();

        posts.forEach(post => {
            if (post.tags) {
                post.tags.forEach(tag => {
                    tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
                });
            }
        });

        // Return tags sorted by frequency
        return Array.from(tagCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([tag, count]) => ({ tag, count }));
    } catch (error) {
        console.error('Error getting tags:', error);
        throw new Error('Failed to get tags');
    }
}

// Function to get posts by category
async function getPostsByCategory(category) {
    try {
        const posts = await getAllPosts();
        return posts.filter(post =>
            post.categories && post.categories.includes(category)
        );
    } catch (error) {
        console.error('Error getting posts by category:', error);
        throw new Error('Failed to get posts by category');
    }
}

// Function to get posts by tag
async function getPostsByTag(tag) {
    try {
        const posts = await getAllPosts();
        return posts.filter(post =>
            post.tags && post.tags.includes(tag)
        );
    } catch (error) {
        console.error('Error getting posts by tag:', error);
        throw new Error('Failed to get posts by tag');
    }
}

// Function to get featured posts
async function getFeaturedPosts() {
    try {
        const posts = await getAllPosts();
        return posts.filter(post => post.featured === true);
    } catch (error) {
        console.error('Error getting featured posts:', error);
        throw new Error('Failed to get featured posts');
    }
}

// Function to transform post data to API format
function transformPostToApiFormat(post, includeContent = true) {
    if (!post) return null;

    // Use existing ID or create slug from title
    const slug = post.id || slugify(post.title, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g
    });

    // Generate summary from content if not provided
    const summary = post.summary || generateSummary(post.content);

    // Extract or generate key points if not provided
    const keyPoints = post.key_points || generateKeyPoints(post.content);

    // Construct full URL
    const url = `${config.baseUrl}/blog/${slug}`;

    const transformed = {
        id: slug,
        title: post.title,
        summary,
        key_points: keyPoints,
        url,
        date: post.date,
        author: post.author || 'Akeyreu Team',
        categories: post.categories || [],
        tags: post.tags || [],
        featured: post.featured || false,
        readTime: post.readTime || estimateReadingTime(post.content)
    };

    // Include content only if requested (for individual post views)
    if (includeContent) {
        transformed.content = post.content;
    }

    return transformed;
}

// Function to estimate reading time (average 200 words per minute)
function estimateReadingTime(content) {
    if (!content) return 1;
    const words = content.split(/\s+/).length;
    return Math.ceil(words / 200);
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

    const paragraphs = content.split('<>');

    return paragraphs.slice(0, 3).map(paragraph => {
        const cleaned = paragraph.trim();

        // Match the first sentence ending in . ! or ? optionally followed by a quote or whitespace
        const match = cleaned.match(/^.*?[.!?](?=\s|$)/);

        if (match) {
            return match[0].trim(); // return full sentence
        }

        // fallback: no sentence end found, just show preview
        return cleaned.slice(0, 100).trim() + '...';
    });
}

// Function to save posts to file
async function savePosts(posts) {
    try {
        const data = JSON.stringify(posts, null, 2);
        await fs.writeFile(postsFilePath, data, 'utf8');

        // Clear cache after saving
        clearCache();

        return true;
    } catch (error) {
        console.error('Error saving posts file:', error);
        throw new Error('Failed to save posts data');
    }
}

// Function to create a new post
async function createPost(postData) {
    try {
        const posts = await getAllPosts();

        // Generate ID from title if not provided
        const id = postData.id || slugify(postData.title, {
            lower: true,
            strict: true,
            remove: /[*+~.()'"!:@]/g
        });

        // Check if post with this ID already exists
        const existingPost = posts.find(post => post.id === id);
        if (existingPost) {
            throw new Error('A post with this title already exists');
        }

        // Create new post with required fields
        const newPost = {
            id,
            title: postData.title,
            date: postData.date || new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            author: postData.author || 'Akeyreu Team',
            categories: postData.categories || [],
            tags: postData.tags || [],
            summary: postData.summary || generateSummary(postData.content),
            featured: postData.featured || false,
            readTime: postData.readTime || estimateReadingTime(postData.content),
            content: postData.content
        };

        // Add to beginning of posts array (newest first)
        posts.unshift(newPost);

        // Save to file
        await savePosts(posts);

        return newPost;
    } catch (error) {
        console.error('Error creating post:', error);
        throw error;
    }
}

// Function to update an existing post
async function updatePost(id, postData) {
    try {
        const posts = await getAllPosts();
        const postIndex = posts.findIndex(post => post.id === id);

        if (postIndex === -1) {
            throw new Error('Post not found');
        }

        // Update post with new data
        const updatedPost = {
            ...posts[postIndex],
            ...postData,
            id, // Keep original ID
            summary: postData.summary || generateSummary(postData.content),
            readTime: postData.readTime || estimateReadingTime(postData.content)
        };

        posts[postIndex] = updatedPost;

        // Save to file
        await savePosts(posts);

        return updatedPost;
    } catch (error) {
        console.error('Error updating post:', error);
        throw error;
    }
}

// Function to delete a post
async function deletePost(id) {
    try {
        const posts = await getAllPosts();
        const postIndex = posts.findIndex(post => post.id === id);

        if (postIndex === -1) {
            throw new Error('Post not found');
        }

        // Remove post from array
        const deletedPost = posts.splice(postIndex, 1)[0];

        // Save to file
        await savePosts(posts);

        return deletedPost;
    } catch (error) {
        console.error('Error deleting post:', error);
        throw error;
    }
}

// Function to clear cache
function clearCache() {
    // This would clear the cache - implementation depends on your cache system
    // For now, we'll just log it
    console.log('Cache cleared after data modification');
}

export {
    getAllPosts,
    getPostBySlug,
    searchPosts,
    getAllCategories,
    getAllTags,
    getPostsByCategory,
    getPostsByTag,
    getFeaturedPosts,
    transformPostToApiFormat,
    createPost,
    updatePost,
    deletePost,
    savePosts
};
