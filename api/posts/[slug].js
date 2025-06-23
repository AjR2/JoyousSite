// Enhanced API endpoint for individual post CRUD operations
// File: /api/posts/[slug].js

import { getPostBySlug, transformPostToApiFormat, updatePost, deletePost } from '../utils/data.js';
import config from '../utils/config.js';
import { securityMiddleware, validateInput } from '../utils/security.js';

export default async function handler(req, res) {
    // Apply security middleware (includes CORS headers and OPTIONS handling)
    const securityResult = securityMiddleware(req, res, {
        rateLimit: 'api',
        requireOrigin: process.env.NODE_ENV === 'production',
        allowedMethods: ['GET', 'PUT', 'DELETE', 'OPTIONS'],
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

    // Set caching headers for individual posts (longer cache)
    res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=1800'); // 10 min browser, 30 min CDN
    res.setHeader('ETag', `"post-${req.query.slug}-${Date.now()}"`);
    res.setHeader('Last-Modified', new Date().toUTCString());

    // Get and validate the slug from the request
    const { slug } = req.query;

    if (!slug) {
        return res.status(400).json({
            error: 'Slug parameter is required',
            timestamp: new Date().toISOString()
        });
    }

    // Validate and sanitize slug
    const slugValidation = validateInput(slug, 'slug', true);
    if (!slugValidation.valid) {
        return res.status(400).json({
            error: slugValidation.error,
            timestamp: new Date().toISOString()
        });
    }

    try {
        if (req.method === 'GET') {
            // Set caching headers for GET requests
            res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=1800');
            res.setHeader('ETag', `"post-${req.query.slug}-${Date.now()}"`);
            res.setHeader('Last-Modified', new Date().toUTCString());

            // Get the post by slug using sanitized slug
            const post = await getPostBySlug(slugValidation.value);

            // If post not found, return 404
            if (!post) {
                return res.status(404).json({
                    error: 'Post not found',
                    timestamp: new Date().toISOString()
                });
            }

            // Transform post to API format
            const transformedPost = transformPostToApiFormat(post);

            // Add security headers for content
            res.setHeader('X-Content-Type-Options', 'nosniff');

            // Return the post with metadata
            return res.status(200).json({
                ...transformedPost,
                meta: {
                    timestamp: new Date().toISOString(),
                    version: '1.0'
                }
            });

        } else if (req.method === 'PUT') {
            // Update post
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

            // Update the post
            const updatedPost = await updatePost(slugValidation.value, req.body);

            // Transform to API format
            const transformedPost = transformPostToApiFormat(updatedPost, true);

            return res.status(200).json({
                message: 'Post updated successfully',
                post: transformedPost,
                timestamp: new Date().toISOString()
            });

        } else if (req.method === 'DELETE') {
            // Delete the post
            const deletedPost = await deletePost(slugValidation.value);

            return res.status(200).json({
                message: 'Post deleted successfully',
                deletedPost: {
                    id: deletedPost.id,
                    title: deletedPost.title
                },
                timestamp: new Date().toISOString()
            });
        }

    } catch (error) {
        // Log error securely (don't expose internal details)
        console.error(`Error in /api/posts/${slugValidation.value}:`, error);

        if (error.message === 'Post not found') {
            return res.status(404).json({
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }

        return res.status(500).json({
            error: 'Internal server error',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
        });
    }
}
