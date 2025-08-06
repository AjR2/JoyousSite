async function testChatAPI() {
  const fetch = (await import('node-fetch')).default;
  try {
    console.log('Testing Nimbus AI Chat API...');
    
    const response = await fetch('http://localhost:3004/api/nimbus/chat-simple', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello, this is a test message. Please respond briefly.',
        conversation_id: 'test-conversation'
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());

    if (response.ok) {
      const data = await response.json();
      console.log('Success! Response:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
  } catch (error) {
    console.error('Error testing API:', error.message);
    console.error('Full error:', error);
  }
}

testChatAPI();
