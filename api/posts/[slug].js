// Enhanced API endpoint for getting a specific post by slug with security
// File: /api/posts/[slug].js

import { getPostBySlug, transformPostToApiFormat } from '../utils/data.js';
import config from '../utils/config.js';
import { securityMiddleware, validateInput } from '../utils/security.js';

export default async function handler(req, res) {
    // Apply security middleware
    const securityResult = securityMiddleware(req, res, {
        rateLimit: 'api',
        requireOrigin: config.security.requireOriginValidation,
        allowedMethods: ['GET', 'OPTIONS'],
        environment: config.environment
    });

    if (securityResult.error) {
        return res.status(securityResult.status).json({
            error: securityResult.error,
            timestamp: new Date().toISOString()
        });
    }

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
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
    } catch (error) {
        // Log error securely (don't expose internal details)
        console.error(`Error in /api/posts/${slugValidation.value}:`, error);

        return res.status(500).json({
            error: 'Internal server error',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
        });
    }
}
