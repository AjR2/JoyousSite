/**
 * Next.js API Route for Multi-Agent Collaboration Endpoint
 */

import { MultiAgentService } from '../../lib/multiagent-service';

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

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        const { prompt, user_id } = req.body;

        if (!prompt || !user_id) {
            res.status(400).json({ 
                error: 'Missing required parameters: prompt and user_id' 
            });
            return;
        }

        const result = await multiAgentService.collaborate(prompt, user_id);
        res.status(200).json(result);
    } catch (error) {
        console.error('Collaborate API error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
}

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '1mb',
        },
        responseLimit: '8mb',
    },
}
