// API endpoint for getting featured posts
// File: /api/featured.js

import { getFeaturedPosts, transformPostToApiFormat } from './utils/data.js';
import config from './utils/config.js';
import { securityMiddleware } from './utils/security.js';

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

    // Set caching headers (longer cache for featured posts)
    res.setHeader('Cache-Control', 'public, max-age=900, s-maxage=3600'); // 15 min browser, 1 hour CDN
    res.setHeader('ETag', `"featured-${Date.now()}"`);
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
        // Get featured posts
        const posts = await getFeaturedPosts();

        // Transform posts to API format (exclude content for list view)
        const transformedPosts = posts.map(post => transformPostToApiFormat(post, false));

        // Return the featured posts
        return res.status(200).json({
            posts: transformedPosts,
            count: transformedPosts.length,
            meta: {
                timestamp: new Date().toISOString(),
                version: '1.0'
            }
        });
    } catch (error) {
        console.error('Error in /api/featured:', error);
        return res.status(500).json({ 
            error: 'Failed to fetch featured posts',
            timestamp: new Date().toISOString()
        });
    }
}
