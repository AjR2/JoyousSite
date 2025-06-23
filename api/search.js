// API endpoint for searching posts
// File: /api/search.js

import { searchPosts, transformPostToApiFormat } from './utils/data.js';
import { securityMiddleware } from './utils/security.js';
import config from './utils/config.js';

export default async function handler(req, res) {
    // Apply security middleware (includes CORS headers and OPTIONS handling)
    const securityResult = securityMiddleware(req, res, {
        allowedMethods: ['GET', 'OPTIONS'],
        requireOrigin: process.env.NODE_ENV === 'production',
        environment: config.environment
    });

    if (securityResult && securityResult.error) {
        return res.status(securityResult.status).json({
            error: securityResult.error,
            timestamp: new Date().toISOString()
        });
    }

    // Handle OPTIONS requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Set caching headers for search (shorter cache due to dynamic nature)
    res.setHeader('Cache-Control', 'public, max-age=120, s-maxage=300'); // 2 min browser, 5 min CDN
    res.setHeader('Vary', 'Accept-Encoding, User-Agent');

    // Get query parameters
    const { q, category, tag, featured } = req.query;

    // At least one search parameter is required
    if (!q && !category && !tag && featured === undefined) {
        return res.status(400).json({
            error: 'At least one search parameter is required (q, category, tag, or featured)',
            timestamp: new Date().toISOString()
        });
    }

    try {
        // Build filters object
        const filters = {};
        if (category) filters.category = category;
        if (tag) filters.tag = tag;
        if (featured !== undefined) filters.featured = featured === 'true';

        // Search for posts matching the query and filters
        const posts = await searchPosts(q || '', filters);

        // Transform posts to API format (exclude content for search results)
        const transformedPosts = posts.map(post => transformPostToApiFormat(post, false));

        // Return the search results
        return res.status(200).json({
            query: q || '',
            filters,
            results: transformedPosts,
            count: transformedPosts.length,
            meta: {
                timestamp: new Date().toISOString(),
                version: '1.0'
            }
        });
    } catch (error) {
        console.error('Error in /api/search:', error);
        return res.status(500).json({
            error: 'Failed to search posts',
            timestamp: new Date().toISOString()
        });
    }
}
