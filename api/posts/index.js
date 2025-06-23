// API endpoint for posts CRUD operations
// File: /api/posts/index.js

import { getAllPosts, transformPostToApiFormat, createPost } from '../utils/data.js';
import { securityMiddleware, validateInput } from '../utils/security.js';
import config from '../utils/config.js';

export default async function handler(req, res) {
    // Apply security middleware (includes CORS headers and OPTIONS handling)
    const securityResult = securityMiddleware(req, res, {
        allowedMethods: ['GET', 'POST', 'OPTIONS'],
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

    if (securityResult && securityResult.error) {
        return res.status(securityResult.status).json({
            error: securityResult.error,
            timestamp: new Date().toISOString()
        });
    }

    try {
        if (req.method === 'GET') {
            // Set caching headers for GET requests
            res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600');
            res.setHeader('ETag', `"posts-${Date.now()}"`);
            res.setHeader('Last-Modified', new Date().toUTCString());

            // Get all posts
            const posts = await getAllPosts();

            // Transform posts to API format (exclude content for list view)
            const transformedPosts = posts.map(post => transformPostToApiFormat(post, false));

            return res.status(200).json(transformedPosts);

        } else if (req.method === 'POST') {
            // Validate required fields
            const { title, content } = req.body;

            if (!title || !content) {
                return res.status(400).json({
                    error: 'Title and content are required',
                    timestamp: new Date().toISOString()
                });
            }

            // Validate input data
            const validationResult = validateInput(req.body, {
                title: { type: 'string', maxLength: 200 },
                content: { type: 'string', maxLength: 50000 },
                author: { type: 'string', maxLength: 100, optional: true },
                categories: { type: 'array', optional: true },
                tags: { type: 'array', optional: true },
                featured: { type: 'boolean', optional: true }
            });

            if (!validationResult.isValid) {
                return res.status(400).json({
                    error: 'Invalid input data',
                    details: validationResult.errors,
                    timestamp: new Date().toISOString()
                });
            }

            // Create new post
            const newPost = await createPost(req.body);

            // Transform to API format
            const transformedPost = transformPostToApiFormat(newPost, true);

            return res.status(201).json({
                message: 'Post created successfully',
                post: transformedPost,
                timestamp: new Date().toISOString()
            });
        }

    } catch (error) {
        console.error('Error in /api/posts:', error);

        if (error.message === 'A post with this title already exists') {
            return res.status(409).json({
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }

        return res.status(500).json({
            error: 'Internal server error',
            timestamp: new Date().toISOString()
        });
    }
}
