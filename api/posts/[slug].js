// API endpoint for getting a specific post by slug
// File: /api/posts/[slug].js

import { getPostBySlug, transformPostToApiFormat } from '../utils/data';

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get the slug from the request
    const { slug } = req.query;

    if (!slug) {
        return res.status(400).json({ error: 'Slug parameter is required' });
    }

    try {
        // Get the post by slug
        const post = await getPostBySlug(slug);

        // If post not found, return 404
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Transform post to API format
        const transformedPost = transformPostToApiFormat(post);

        // Return the post
        return res.status(200).json(transformedPost);
    } catch (error) {
        console.error(`Error in /api/posts/${slug}:`, error);
        return res.status(500).json({ error: 'Failed to fetch post' });
    }
}
