/**
 * Next.js API Route for Multi-Agent Ask Endpoint
 * This approach allows you to deploy on Vercel with Next.js
 */

import { MultiAgentService } from '../../lib/multiagent-service';

// Initialize the service
const multiAgentService = new MultiAgentService({
    openaiApiKey: process.env.OPENAI_API_KEY,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    grokApiKey: process.env.XAI_GROK_API_KEY,
    databaseUrl: process.env.DATABASE_URL
});

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        const { prompt, task_type = 'explanation', user_id } = req.body;

        // Validate required parameters
        if (!prompt || !user_id) {
            res.status(400).json({ 
                error: 'Missing required parameters: prompt and user_id' 
            });
            return;
        }

        // Validate task type
        const validTaskTypes = ['explanation', 'fact_check', 'code_generation', 'task_breakdown', 'final_synthesis'];
        if (!validTaskTypes.includes(task_type)) {
            res.status(400).json({ 
                error: `Invalid task_type. Must be one of: ${validTaskTypes.join(', ')}` 
            });
            return;
        }

        // Process the request
        const result = await multiAgentService.ask(prompt, task_type, user_id);

        res.status(200).json(result);
    } catch (error) {
        console.error('Ask API error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
}

// Configure API route
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '1mb',
        },
        responseLimit: '8mb',
    },
}
