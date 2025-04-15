// API endpoint for searching posts
// File: /api/search.js

import { searchPosts, transformPostToApiFormat } from './utils/data';

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get the query parameter
    const { q } = req.query;

    if (!q) {
        return res.status(400).json({ error: 'Query parameter (q) is required' });
    }

    try {
        // Search for posts matching the query
        const posts = await searchPosts(q);

        // Transform posts to API format
        const transformedPosts = posts.map(post => transformPostToApiFormat(post));

        // Return the posts
        return res.status(200).json(transformedPosts);
    } catch (error) {
        console.error('Error in /api/search:', error);
        return res.status(500).json({ error: 'Failed to search posts' });
    }
}
