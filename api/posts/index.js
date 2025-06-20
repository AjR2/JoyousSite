// API endpoint for getting all posts
// File: /api/posts/index.js

import { getAllPosts, transformPostToApiFormat } from '../utils/data.js';
import config from '../utils/config.js';

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', config.cors.origin.join(', '));
    res.setHeader('Access-Control-Allow-Methods', config.cors.methods.join(', '));
    res.setHeader('Access-Control-Allow-Headers', config.cors.allowedHeaders.join(', '));

    // Set caching headers
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600'); // 5 min browser, 10 min CDN
    res.setHeader('ETag', `"posts-${Date.now()}"`);
    res.setHeader('Last-Modified', new Date().toUTCString());

    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get all posts
        const posts = await getAllPosts();

        // Transform posts to API format (exclude content for list view)
        const transformedPosts = posts.map(post => transformPostToApiFormat(post, false));

        // Return the posts
        return res.status(200).json(transformedPosts);
    } catch (error) {
        console.error('Error in /api/posts:', error);
        return res.status(500).json({ error: 'Failed to fetch posts' });
    }
}
