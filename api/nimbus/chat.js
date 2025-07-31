// Nimbus AI Chat API endpoint for Vercel
// File: /api/nimbus/chat.js

import { securityMiddleware } from '../utils/security.js';
import config from '../utils/config.js';

// Simple in-memory conversation storage (use Redis/DB in production)
const conversations = new Map();

// AI Service integrations
async function callOpenAI(message, conversationHistory = []) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const messages = [
    {
      role: 'system',
      content: `You are Nimbus AI, an intelligent assistant for Akeyreu, a mental wellness technology company. 
      You help users with mental wellness questions, provide information about Akeyreu's products (nAura for sleep analysis and Vza for cognitive wellness), 
      and offer supportive guidance. Be empathetic, professional, and helpful. Keep responses concise but informative.`
    },
    ...conversationHistory.slice(-10), // Keep last 10 messages for context
    { role: 'user', content: message }
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callClaude(message, conversationHistory = []) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('Anthropic API key not configured');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `You are Nimbus AI for Akeyreu mental wellness. Previous context: ${conversationHistory.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n')}\n\nUser: ${message}`
        }
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

async function callGrok(message, conversationHistory = []) {
  const apiKey = process.env.XAI_GROK_API_KEY;
  if (!apiKey) {
    throw new Error('Grok API key not configured');
  }

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
          content: 'You are Nimbus AI for Akeyreu mental wellness company. Be helpful and supportive.'
        },
        ...conversationHistory.slice(-8),
        { role: 'user', content: message }
      ],
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`Grok API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Multi-agent decision logic
function selectAgent(message, conversationHistory = []) {
  const lowerMessage = message.toLowerCase();
  
  // Sleep-related queries -> Claude (good for health topics)
  if (lowerMessage.includes('sleep') || lowerMessage.includes('naura') || lowerMessage.includes('insomnia')) {
    return 'claude';
  }
  
  // Technical or product questions -> GPT-4
  if (lowerMessage.includes('product') || lowerMessage.includes('vza') || lowerMessage.includes('how does')) {
    return 'gpt4';
  }
  
  // Creative or conversational -> Grok
  if (lowerMessage.includes('feel') || lowerMessage.includes('mood') || lowerMessage.includes('stress')) {
    return 'grok';
  }
  
  // Default to GPT-4 for general queries
  return 'gpt4';
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
    const { message, agent_id, conversation_id } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Message is required and must be a string',
        timestamp: new Date().toISOString()
      });
    }

    // Get or create conversation
    const convId = conversation_id || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    let conversationHistory = conversations.get(convId) || [];

    // Select agent if not specified
    const selectedAgent = agent_id || selectAgent(message, conversationHistory);

    let response;
    let agentUsed;

    try {
      switch (selectedAgent) {
        case 'claude':
          response = await callClaude(message, conversationHistory);
          agentUsed = 'claude';
          break;
        case 'grok':
          response = await callGrok(message, conversationHistory);
          agentUsed = 'grok';
          break;
        case 'gpt4':
        default:
          response = await callOpenAI(message, conversationHistory);
          agentUsed = 'gpt4';
          break;
      }
    } catch (agentError) {
      console.error(`Error with ${selectedAgent}:`, agentError);
      
      // Fallback to GPT-4 if primary agent fails
      if (selectedAgent !== 'gpt4') {
        try {
          response = await callOpenAI(message, conversationHistory);
          agentUsed = 'gpt4-fallback';
        } catch (fallbackError) {
          throw new Error('All AI services are currently unavailable');
        }
      } else {
        throw agentError;
      }
    }

    // Update conversation history
    conversationHistory.push(
      { role: 'user', content: message },
      { role: 'assistant', content: response }
    );
    
    // Keep only last 20 messages to prevent memory issues
    if (conversationHistory.length > 20) {
      conversationHistory = conversationHistory.slice(-20);
    }
    
    conversations.set(convId, conversationHistory);

    // Clean up old conversations (simple memory management)
    if (conversations.size > 100) {
      const oldestKey = conversations.keys().next().value;
      conversations.delete(oldestKey);
    }

    return res.status(200).json({
      message: response,
      conversation_id: convId,
      agent_used: agentUsed,
      multi_agent_details: {
        selected_agent: selectedAgent,
        agent_used: agentUsed,
        fallback_used: agentUsed.includes('fallback'),
        conversation_length: conversationHistory.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in /api/nimbus/chat:', error);
    return res.status(500).json({
      error: 'Failed to process chat request',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
}
