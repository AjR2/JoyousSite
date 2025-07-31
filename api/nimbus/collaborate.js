// Nimbus AI Multi-Agent Collaboration API endpoint for Vercel
// File: /api/nimbus/collaborate.js

import { securityMiddleware } from '../utils/security.js';
import config from '../utils/config.js';

// Import chat functionality
async function callAIService(service, message, context = []) {
  const apiKey = process.env[`${service.toUpperCase()}_API_KEY`] || 
                 process.env[`${service === 'gpt4' ? 'OPENAI' : service.toUpperCase()}_API_KEY`];
  
  if (!apiKey) {
    throw new Error(`${service} API key not configured`);
  }

  switch (service) {
    case 'gpt4':
    case 'openai':
      return await callOpenAI(message, context, apiKey);
    case 'claude':
      return await callClaude(message, context, apiKey);
    case 'grok':
      return await callGrok(message, context, apiKey);
    default:
      throw new Error(`Unknown AI service: ${service}`);
  }
}

async function callOpenAI(message, context, apiKey) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a mental wellness expert working as part of the Nimbus AI team for Akeyreu. Provide thoughtful, evidence-based responses.'
        },
        ...context.slice(-8),
        { role: 'user', content: message }
      ],
      max_tokens: 400,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    model: 'gpt-4',
    usage: data.usage
  };
}

async function callClaude(message, context, apiKey) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 400,
      messages: [
        {
          role: 'user',
          content: `Context: ${context.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n')}\n\nAs a mental wellness expert, please respond to: ${message}`
        }
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    content: data.content[0].text,
    model: 'claude-3-sonnet',
    usage: data.usage
  };
}

async function callGrok(message, context, apiKey) {
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'grok-beta',
      messages: [
        {
          role: 'system',
          content: 'You are a creative and empathetic mental wellness assistant for Akeyreu. Be supportive and engaging.'
        },
        ...context.slice(-6),
        { role: 'user', content: message }
      ],
      max_tokens: 400,
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    throw new Error(`Grok API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    model: 'grok-beta',
    usage: data.usage
  };
}

// Multi-agent collaboration logic
async function collaborateOnQuery(message, agents = ['gpt4', 'claude'], context = []) {
  const responses = [];
  const errors = [];

  // Get responses from all requested agents
  for (const agent of agents) {
    try {
      const response = await callAIService(agent, message, context);
      responses.push({
        agent,
        ...response,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error with ${agent}:`, error);
      errors.push({
        agent,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  if (responses.length === 0) {
    throw new Error('All agents failed to respond');
  }

  // Synthesize responses if multiple agents responded
  let finalResponse;
  if (responses.length === 1) {
    finalResponse = responses[0].content;
  } else {
    // Create a synthesis prompt
    const synthesisPrompt = `Based on these expert responses about "${message}", provide a comprehensive and balanced answer:

${responses.map((r, i) => `Expert ${i + 1} (${r.agent}): ${r.content}`).join('\n\n')}

Please synthesize these perspectives into a cohesive, helpful response for someone seeking mental wellness guidance.`;

    try {
      const synthesis = await callAIService('gpt4', synthesisPrompt, []);
      finalResponse = synthesis.content;
    } catch (synthError) {
      // Fallback to the first response if synthesis fails
      finalResponse = responses[0].content;
    }
  }

  return {
    message: finalResponse,
    collaboration_details: {
      agents_requested: agents,
      agents_responded: responses.map(r => r.agent),
      agents_failed: errors.map(e => e.agent),
      individual_responses: responses,
      errors: errors,
      synthesis_used: responses.length > 1
    }
  };
}

export default async function handler(req, res) {
  // Apply security middleware
  const securityResult = securityMiddleware(req, res, {
    allowedMethods: ['POST', 'OPTIONS'],
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

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const { message, agents, conversation_id, context } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Message is required and must be a string',
        timestamp: new Date().toISOString()
      });
    }

    // Default agents for collaboration
    const requestedAgents = agents || ['gpt4', 'claude'];
    
    // Validate agents
    const validAgents = ['gpt4', 'openai', 'claude', 'grok'];
    const invalidAgents = requestedAgents.filter(agent => !validAgents.includes(agent));
    
    if (invalidAgents.length > 0) {
      return res.status(400).json({
        error: `Invalid agents: ${invalidAgents.join(', ')}. Valid agents: ${validAgents.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }

    // Perform collaboration
    const result = await collaborateOnQuery(message, requestedAgents, context || []);

    return res.status(200).json({
      ...result,
      conversation_id: conversation_id || `collab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in /api/nimbus/collaborate:', error);
    return res.status(500).json({
      error: 'Failed to process collaboration request',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
}
