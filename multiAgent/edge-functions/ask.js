/**
 * Vercel Edge Function for Multi-Agent Ask
 * Runs on Vercel Edge Runtime for better performance and global distribution
 */

export const config = {
    runtime: 'edge',
};

// Lightweight AI client for edge runtime
class EdgeAIClient {
    constructor(apiKey, baseUrl) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
    }

    async call(messages, model = 'gpt-3.5-turbo') {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model,
                messages,
                max_tokens: 1000,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            throw new Error(`API call failed: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }
}

// Simple confidence scoring for edge
function calculateConfidence(response, taskType) {
    let score = 0.5;
    
    const wordCount = response.split(' ').length;
    if (wordCount > 50) score += 0.1;
    if (wordCount > 100) score += 0.1;
    
    // Uncertainty markers
    const uncertaintyWords = ['maybe', 'perhaps', 'might', 'not sure'];
    const uncertaintyCount = uncertaintyWords.reduce((count, word) => 
        count + (response.toLowerCase().includes(word) ? 1 : 0), 0);
    score -= uncertaintyCount * 0.05;
    
    // Confidence boosters
    const confidenceWords = ['definitely', 'clearly', 'proven'];
    const confidenceCount = confidenceWords.reduce((count, word) => 
        count + (response.toLowerCase().includes(word) ? 1 : 0), 0);
    score += confidenceCount * 0.05;
    
    return Math.max(0, Math.min(1, score));
}

export default async function handler(request) {
    // Handle CORS
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });
    }

    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }

    try {
        const body = await request.json();
        const { prompt, task_type = 'explanation', user_id } = body;

        if (!prompt || !user_id) {
            return new Response(JSON.stringify({ 
                error: 'Missing required parameters: prompt and user_id' 
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }

        // Validate task type
        const validTaskTypes = ['explanation', 'fact_check', 'code_generation', 'task_breakdown'];
        if (!validTaskTypes.includes(task_type)) {
            return new Response(JSON.stringify({ 
                error: `Invalid task_type. Must be one of: ${validTaskTypes.join(', ')}` 
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }

        // Initialize AI client
        const openaiClient = new EdgeAIClient(
            process.env.OPENAI_API_KEY,
            'https://api.openai.com/v1'
        );

        // Task-specific prompts
        let enhancedPrompt = prompt;
        let model = 'gpt-3.5-turbo';

        switch (task_type) {
            case 'task_breakdown':
                enhancedPrompt = `Break down this complex task into manageable components: ${prompt}`;
                break;
            case 'fact_check':
                enhancedPrompt = `Fact-check and verify the following information: ${prompt}`;
                break;
            case 'code_generation':
                enhancedPrompt = `Generate code or provide technical implementation for: ${prompt}`;
                model = 'gpt-4'; // Use GPT-4 for code generation
                break;
            case 'explanation':
            default:
                enhancedPrompt = `Provide a clear, detailed explanation of: ${prompt}`;
                break;
        }

        // Call AI service
        const response = await openaiClient.call([
            { role: 'user', content: enhancedPrompt }
        ], model);

        // Calculate quality metrics
        const confidence = calculateConfidence(response, task_type);
        const wordCount = response.split(' ').length;

        const result = {
            'Final Response': response,
            'Quality Assessment': {
                confidence_score: confidence,
                coherence_score: confidence * 0.9,
                completeness_score: Math.min(1, wordCount / 100),
                content_flags: [],
                word_count: wordCount
            },
            'Task Type': task_type,
            'Agent Used': `OpenAI ${model}`,
            'Edge Runtime': true
        };

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-cache',
            },
        });

    } catch (error) {
        console.error('Edge function error:', error);
        
        return new Response(JSON.stringify({ 
            error: 'Internal server error',
            message: error.message 
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }
}
