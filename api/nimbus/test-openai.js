// Test OpenAI API connection specifically
module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  
  // Check if API key exists
  if (!apiKey) {
    return res.status(500).json({
      error: 'OpenAI API key not configured',
      hasKey: false,
      timestamp: new Date().toISOString()
    });
  }

  // Clean the API key (remove quotes, whitespace, etc.)
  const cleanedKey = apiKey.trim().replace(/^["']|["']$/g, '');
  const keyStart = apiKey.substring(0, 20);
  const keyEnd = apiKey.substring(apiKey.length - 10);

  if (!cleanedKey.startsWith('sk-')) {
    return res.status(500).json({
      error: 'OpenAI API key appears to be malformed',
      hasKey: true,
      keyFormat: 'Invalid (should start with sk-)',
      keyLength: apiKey.length,
      cleanedLength: cleanedKey.length,
      keyStart: keyStart,
      keyEnd: keyEnd,
      cleanedStart: cleanedKey.substring(0, 10),
      hasQuotes: apiKey.includes('"'),
      hasNewlines: apiKey.includes('\n'),
      hasSpaces: apiKey.includes(' '),
      timestamp: new Date().toISOString()
    });
  }

  try {
    console.log('Testing OpenAI API connection...');
    console.log('API Key length:', apiKey.length);
    console.log('API Key prefix:', apiKey.substring(0, 10) + '...');

    // Make a simple API call with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cleanedKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-nano',
        messages: [
          { role: 'user', content: 'Say "Hello" in one word.' }
        ],
        max_completion_tokens: 10,
        temperature: 1,
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log('OpenAI response status:', response.status);
    console.log('OpenAI response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      
      return res.status(response.status).json({
        error: 'OpenAI API call failed',
        status: response.status,
        statusText: response.statusText,
        errorDetails: errorText,
        hasKey: true,
        keyFormat: 'Valid format',
        timestamp: new Date().toISOString()
      });
    }

    const data = await response.json();
    console.log('OpenAI response received successfully');

    return res.json({
      success: true,
      message: 'OpenAI API is working correctly',
      response: data.choices[0].message.content,
      usage: data.usage,
      model: data.model,
      hasKey: true,
      keyFormat: 'Valid format',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error testing OpenAI API:', error);
    
    let errorType = 'Unknown';
    let errorMessage = error.message;
    
    if (error.name === 'AbortError') {
      errorType = 'Timeout';
      errorMessage = 'Request timed out after 10 seconds';
    } else if (error.code === 'ENOTFOUND') {
      errorType = 'Network';
      errorMessage = 'Could not reach OpenAI API (DNS resolution failed)';
    } else if (error.code === 'ECONNREFUSED') {
      errorType = 'Connection';
      errorMessage = 'Connection refused by OpenAI API';
    }

    return res.status(500).json({
      error: 'Failed to test OpenAI API',
      errorType: errorType,
      errorMessage: errorMessage,
      errorCode: error.code,
      hasKey: true,
      keyFormat: 'Valid format',
      timestamp: new Date().toISOString()
    });
  }
};
