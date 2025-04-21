// API endpoint for getting all posts
// File: /api/posts/index.js

import { getAllPosts, transformPostToApiFormat } from '../utils/data';

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get all posts
        const posts = await getAllPosts();

        // Transform posts to API format
        const transformedPosts = posts.map(post => transformPostToApiFormat(post));

        // Return the posts
        return res.status(200).json(transformedPosts);
    } catch (error) {
        console.error('Error in /api/posts:', error);
        return res.status(500).json({ error: 'Failed to fetch posts' });
    }
}
