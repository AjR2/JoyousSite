// API endpoint for getting all tags
// File: /api/tags.js

import { getAllTags, getPostsByTag, transformPostToApiFormat } from './utils/data.js';
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
    res.setHeader('ETag', `"tags-${Date.now()}"`);
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
        const { tag } = req.query;

        if (tag) {
            // Validate and sanitize tag parameter
            const tagValidation = validateInput(tag, 'tag', true);
            if (!tagValidation.valid) {
                return res.status(400).json({
                    error: tagValidation.error,
                    timestamp: new Date().toISOString()
                });
            }

            // Get posts by specific tag
            const posts = await getPostsByTag(tagValidation.value);
            const transformedPosts = posts.map(post => transformPostToApiFormat(post, false));

            return res.status(200).json({
                tag: tagValidation.value,
                posts: transformedPosts,
                count: transformedPosts.length,
                meta: {
                    timestamp: new Date().toISOString(),
                    version: '1.0'
                }
            });
        } else {
            // Get all tags with counts
            const tags = await getAllTags();

            return res.status(200).json({
                tags,
                count: tags.length,
                meta: {
                    timestamp: new Date().toISOString(),
                    version: '1.0'
                }
            });
        }
    } catch (error) {
        console.error('Error in /api/tags:', error);
        return res.status(500).json({ 
            error: 'Failed to fetch tags',
            timestamp: new Date().toISOString()
        });
    }
}
