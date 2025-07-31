// Simple Nimbus AI Chat API endpoint for Vercel

// Agent selection logic
function selectBestAgent(message) {
  const lowerMessage = message.toLowerCase();
  
  // Sleep and wellness queries -> Claude (good for health topics)
  if (lowerMessage.includes('sleep') || lowerMessage.includes('naura') || 
      lowerMessage.includes('insomnia') || lowerMessage.includes('wellness') ||
      lowerMessage.includes('mental health') || lowerMessage.includes('anxiety')) {
    return 'claude';
  }
  
  // Creative, emotional, or conversational queries -> Grok
  if (lowerMessage.includes('feel') || lowerMessage.includes('mood') || 
      lowerMessage.includes('stress') || lowerMessage.includes('creative') ||
      lowerMessage.includes('fun') || lowerMessage.includes('joke')) {
    return 'grok';
  }
  
  // Technical, analytical, or general queries -> GPT-4
  return 'gpt4';
}

// OpenAI GPT-4 API call
async function callOpenAI(message) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

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
          content: `You are Nimbus AI, an intelligent assistant for Akeyreu, a mental wellness technology company. 
          You help users with mental wellness questions, provide information about Akeyreu's products (nAura for sleep analysis and Vza for cognitive wellness), 
          and offer supportive guidance. Be empathetic, professional, and helpful. Keep responses concise but informative.`
        },
        { role: 'user', content: message }
      ],
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { message, agent_id, conversation_id } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({
      error: 'Message is required and must be a string',
      timestamp: new Date().toISOString()
    });
  }

  // Check if any AI API keys are configured
  const hasApiKeys = !!(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.XAI_GROK_API_KEY);

  if (!hasApiKeys) {
    return res.json({
      message: "Hello! I'm Nimbus AI. I'm currently running in demo mode since no AI API keys are configured. To enable full AI functionality, please add your API keys to the environment variables.",
      conversation_id: conversation_id || `demo_${Date.now()}`,
      agent_used: 'demo',
      multi_agent_details: {
        selected_agent: agent_id || 'demo',
        agent_used: 'demo',
        fallback_used: false,
        demo_mode: true
      },
      timestamp: new Date().toISOString()
    });
  }

  try {
    // For now, just use GPT-4 to ensure it works
    const response = await callOpenAI(message);
    const agentUsed = 'gpt4';

    res.json({
      message: response,
      conversation_id: conversation_id || `conv_${Date.now()}`,
      agent_used: agentUsed,
      multi_agent_details: {
        selected_agent: agent_id || 'gpt4',
        agent_used: agentUsed,
        fallback_used: false,
        reasoning: `Selected ${agentUsed} for reliable response`
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in Nimbus AI chat:', error);
    
    // Fallback to a simple response if AI fails
    res.json({
      message: "I apologize, but I'm experiencing technical difficulties right now. Please try again in a moment. If the issue persists, it may be due to API rate limits or connectivity issues.",
      conversation_id: conversation_id || `error_${Date.now()}`,
      agent_used: 'fallback',
      multi_agent_details: {
        selected_agent: agent_id || 'gpt4',
        agent_used: 'fallback',
        fallback_used: true,
        error: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
};
