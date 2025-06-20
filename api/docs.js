// API documentation endpoint
// File: /api/docs.js

import config from './utils/config.js';

export default function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', config.cors.origin.join(', '));
    res.setHeader('Access-Control-Allow-Methods', config.cors.methods.join(', '));
    res.setHeader('Access-Control-Allow-Headers', config.cors.allowedHeaders.join(', '));

    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // API documentation
    const apiDocs = {
        name: "Akeyreu Blog API",
        version: "1.0.0",
        description: "API for accessing Akeyreu blog posts",
        baseUrl: config.apiBaseUrl,
        endpoints: [
            {
                path: "/api/posts",
                method: "GET",
                description: "Get all blog posts",
                responseFormat: {
                    type: "array",
                    items: {
                        title: "Post title",
                        summary: "Post summary",
                        key_points: ["Key point 1", "Key point 2", "..."],
                        url: `${config.baseUrl}/blog/post-slug`
                    }
                }
            },
            {
                path: "/api/posts/:slug",
                method: "GET",
                description: "Get a specific blog post by slug",
                parameters: [
                    {
                        name: "slug",
                        in: "path",
                        required: true,
                        description: "Slug of the blog post"
                    }
                ],
                responseFormat: {
                    title: "Post title",
                    summary: "Post summary",
                    key_points: ["Key point 1", "Key point 2", "..."],
                    url: `${config.baseUrl}/blog/post-slug`
                }
            },
            {
                path: "/api/search",
                method: "GET",
                description: "Search for blog posts",
                parameters: [
                    {
                        name: "q",
                        in: "query",
                        required: true,
                        description: "Search query"
                    }
                ],
                responseFormat: {
                    type: "array",
                    items: {
                        title: "Post title",
                        summary: "Post summary",
                        key_points: ["Key point 1", "Key point 2", "..."],
                        url: `${config.baseUrl}/blog/post-slug`
                    }
                }
            }
        ]
    };

    // Return the API documentation
    return res.status(200).json(apiDocs);
}  