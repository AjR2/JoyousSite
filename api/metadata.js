// Consolidated API endpoint for categories, tags, and metadata
// Combines /api/categories and /api/tags functionality
// File: /api/metadata.js

import { 
    getAllCategories, 
    getPostsByCategory, 
    getAllTags, 
    getPostsByTag, 
    transformPostToApiFormat 
} from './utils/data.js';
import config from './utils/config.js';
import { securityMiddleware, validateInput } from './utils/security.js';

export default async function handler(req, res) {
    // Apply security middleware
    const securityResult = securityMiddleware(req, res);
    if (!securityResult.allowed) {
        return res.status(securityResult.status).json({ 
            error: securityResult.message,
            timestamp: new Date().toISOString()
        });
    }

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', config.cors.origin.join(', '));
    res.setHeader('Access-Control-Allow-Methods', config.cors.methods.join(', '));
    res.setHeader('Access-Control-Allow-Headers', config.cors.allowedHeaders.join(', '));

    // Set caching headers
    res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=1800'); // 10 min browser, 30 min CDN
    res.setHeader('ETag', `"metadata-${Date.now()}"`);
    res.setHeader('Last-Modified', new Date().toUTCString());

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ 
            error: 'Method not allowed',
            timestamp: new Date().toISOString()
        });
    }

    try {
        const { type, category, tag } = req.query;

        // Handle specific category requests
        if (category) {
            const categoryValidation = validateInput(category, 'category', true);
            if (!categoryValidation.valid) {
                return res.status(400).json({
                    error: categoryValidation.error,
                    timestamp: new Date().toISOString()
                });
            }

            const posts = await getPostsByCategory(categoryValidation.value);
            const transformedPosts = posts.map(post => transformPostToApiFormat(post, false));

            return res.status(200).json({
                type: 'category',
                category: categoryValidation.value,
                posts: transformedPosts,
                count: transformedPosts.length,
                meta: {
                    timestamp: new Date().toISOString(),
                    version: '1.0'
                }
            });
        }

        // Handle specific tag requests
        if (tag) {
            const tagValidation = validateInput(tag, 'tag', true);
            if (!tagValidation.valid) {
                return res.status(400).json({
                    error: tagValidation.error,
                    timestamp: new Date().toISOString()
                });
            }

            const posts = await getPostsByTag(tagValidation.value);
            const transformedPosts = posts.map(post => transformPostToApiFormat(post, false));

            return res.status(200).json({
                type: 'tag',
                tag: tagValidation.value,
                posts: transformedPosts,
                count: transformedPosts.length,
                meta: {
                    timestamp: new Date().toISOString(),
                    version: '1.0'
                }
            });
        }

        // Handle type-specific requests
        if (type === 'categories') {
            const categories = await getAllCategories();
            return res.status(200).json({
                type: 'categories',
                categories,
                count: categories.length,
                meta: {
                    timestamp: new Date().toISOString(),
                    version: '1.0'
                }
            });
        }

        if (type === 'tags') {
            const tags = await getAllTags();
            return res.status(200).json({
                type: 'tags',
                tags,
                count: tags.length,
                meta: {
                    timestamp: new Date().toISOString(),
                    version: '1.0'
                }
            });
        }

        // Default: return all metadata
        const [categories, tags] = await Promise.all([
            getAllCategories(),
            getAllTags()
        ]);

        return res.status(200).json({
            type: 'all',
            categories,
            tags,
            counts: {
                categories: categories.length,
                tags: tags.length
            },
            meta: {
                timestamp: new Date().toISOString(),
                version: '1.0'
            }
        });

    } catch (error) {
        console.error('Error in /api/metadata:', error);
        return res.status(500).json({ 
            error: 'Failed to fetch metadata',
            timestamp: new Date().toISOString()
        });
    }
}
