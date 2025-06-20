// API endpoint for getting all categories
// File: /api/categories.js

import { getAllCategories, getPostsByCategory, transformPostToApiFormat } from './utils/data.js';
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
    res.setHeader('ETag', `"categories-${Date.now()}"`);
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
        const { category } = req.query;

        if (category) {
            // Validate and sanitize category parameter
            const categoryValidation = validateInput(category, 'category', true);
            if (!categoryValidation.valid) {
                return res.status(400).json({
                    error: categoryValidation.error,
                    timestamp: new Date().toISOString()
                });
            }

            // Get posts by specific category
            const posts = await getPostsByCategory(categoryValidation.value);
            const transformedPosts = posts.map(post => transformPostToApiFormat(post, false));

            return res.status(200).json({
                category: categoryValidation.value,
                posts: transformedPosts,
                count: transformedPosts.length,
                meta: {
                    timestamp: new Date().toISOString(),
                    version: '1.0'
                }
            });
        } else {
            // Get all categories
            const categories = await getAllCategories();

            return res.status(200).json({
                categories,
                count: categories.length,
                meta: {
                    timestamp: new Date().toISOString(),
                    version: '1.0'
                }
            });
        }
    } catch (error) {
        console.error('Error in /api/categories:', error);
        return res.status(500).json({ 
            error: 'Failed to fetch categories',
            timestamp: new Date().toISOString()
        });
    }
}
