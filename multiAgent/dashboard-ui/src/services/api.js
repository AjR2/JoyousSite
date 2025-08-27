import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8002',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Agent Management API
export const agentAPI = {
  // Get all agents
  getAgents: async () => {
    try {
      const response = await api.get('/agents');
      return response.data;
    } catch (error) {
      console.error('Error fetching agents:', error);
      throw error;
    }
  },

  // Create new agent
  createAgent: async (agentData) => {
    try {
      const response = await api.post('/agents', agentData);
      return response.data;
    } catch (error) {
      console.error('Error creating agent:', error);
      throw error;
    }
  },

  // Update agent (if supported by backend)
  updateAgent: async (agentId, agentData) => {
    try {
      const response = await api.put(`/agents/${agentId}`, agentData);
      return response.data;
    } catch (error) {
      console.error('Error updating agent:', error);
      throw error;
    }
  },

  // Delete agent (if supported by backend)
  deleteAgent: async (agentId) => {
    try {
      const response = await api.delete(`/agents/${agentId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting agent:', error);
      throw error;
    }
  },
};

// Conversation Management API
export const conversationAPI = {
  // Start new conversation
  startConversation: async () => {
    try {
      const response = await api.post('/conversations');
      return response.data;
    } catch (error) {
      console.error('Error starting conversation:', error);
      throw error;
    }
  },

  // Get conversation history (if supported)
  getConversations: async (userId) => {
    try {
      const response = await api.get(`/conversations?user_id=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      // Return empty array if endpoint doesn't exist
      return [];
    }
  },

  // Get specific conversation
  getConversation: async (conversationId) => {
    try {
      const response = await api.get(`/conversations/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }
  },
};

// Chat API
export const chatAPI = {
  // Send message to agent
  sendMessage: async (messageData) => {
    try {
      // Send directly to the chat endpoint with the correct format
      const response = await api.post('/chat', messageData);
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);

      // Return a mock response for development
      return {
        message: "I'm sorry, I'm having trouble connecting to the server right now. This is a mock response for development purposes.",
        agent_id: messageData.agent_id,
        conversation_id: messageData.conversation_id,
        timestamp: new Date().toISOString(),
        mock: true
      };
    }
  },

  // Stream message (for real-time responses)
  streamMessage: async (messageData, onChunk) => {
    try {
      const response = await fetch(`${api.defaults.baseURL}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              onChunk(data);
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error streaming message:', error);
      throw error;
    }
  },
};

// Health check API
export const healthAPI = {
  // Check if backend is available
  checkHealth: async () => {
    try {
      const response = await api.get('/health');
      // Convert 'healthy' status to 'ok' for consistency
      if (response.data.status === 'healthy') {
        return { status: 'ok', message: 'Backend is healthy' };
      }
      return response.data;
    } catch (error) {
      // Try a simple endpoint that should exist
      try {
        const response = await api.get('/agents');
        return { status: 'ok', message: 'Backend is responding' };
      } catch (fallbackError) {
        console.error('Health check failed:', error);
        return { status: 'error', message: 'Backend is not responding' };
      }
    }
  },
};

export default api;
