// Nimbus API Documentation Endpoint
module.exports = function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const documentation = {
    title: "Nimbus AI API Documentation",
    version: "1.0.0",
    description: "Multi-agent AI system for mental wellness and general assistance",
    base_url: "https://www.akeyreu.com/api",
    last_updated: new Date().toISOString(),
    
    endpoints: {
      // Blog & Content APIs
      blog: {
        "GET /api/posts": {
          description: "Get all blog posts",
          parameters: {},
          response: {
            type: "array",
            items: "BlogPost object with id, title, content, date, author, categories, tags"
          },
          example: "/api/posts"
        },
        "GET /api/posts/[slug]": {
          description: "Get specific blog post by slug",
          parameters: {
            slug: "string - Blog post slug/ID"
          },
          response: {
            type: "object",
            description: "Single BlogPost object"
          },
          example: "/api/posts/mental-health-tips"
        },
        "GET /api/analytics": {
          description: "Get blog analytics and statistics",
          parameters: {},
          response: {
            overview: "Post counts, categories, tags summary",
            categories: "Category distribution",
            tags: "Tag usage statistics",
            monthlyPosts: "Posts per month",
            recentActivity: "Recent posts"
          },
          example: "/api/analytics"
        },
        "GET /api/categories": {
          description: "Get all blog categories",
          parameters: {},
          response: {
            categories: "Array of category names",
            total: "Number of categories"
          },
          example: "/api/categories"
        },
        "GET /api/tags": {
          description: "Get all blog tags with usage counts",
          parameters: {},
          response: {
            tags: "Array of {tag, count} objects",
            total: "Number of unique tags"
          },
          example: "/api/tags"
        }
      },

      // Nimbus AI APIs
      nimbus: {
        "GET /api/nimbus/health-simple": {
          description: "Basic health check for Nimbus AI system",
          parameters: {
            detailed: "boolean - Include detailed service status (optional)"
          },
          response: {
            status: "healthy/unhealthy",
            service: "nimbus-ai",
            version: "1.0.0",
            services: "Detailed service status (if detailed=true)"
          },
          example: "/api/nimbus/health-simple?detailed=true"
        },
        "GET /api/nimbus/agents": {
          description: "Get all available AI agents",
          parameters: {},
          response: {
            agents: "Array of all agents",
            active_agents: "Array of active agents only",
            total: "Total agent count",
            active_count: "Active agent count",
            environment: "API key availability status"
          },
          example: "/api/nimbus/agents"
        },
        "POST /api/nimbus/chat-simple": {
          description: "Send message to Nimbus AI (simplified endpoint)",
          parameters: {
            message: "string - User message (required)",
            agent_id: "string - Preferred agent ID (optional)",
            conversation_id: "string - Conversation ID (optional)"
          },
          response: {
            message: "AI response",
            conversation_id: "Conversation identifier",
            agent_used: "Which agent provided the response",
            multi_agent_details: "Routing and fallback information"
          },
          example: "POST /api/nimbus/chat-simple"
        }
      },

      // Utility APIs
      utility: {
        "GET /api/robots": {
          description: "Get robots.txt content",
          parameters: {},
          response: "text/plain - robots.txt content",
          example: "/api/robots"
        },
        "GET /api/sitemap": {
          description: "Get XML sitemap",
          parameters: {},
          response: "application/xml - sitemap.xml content",
          example: "/api/sitemap"
        },
        "GET /api/docs": {
          description: "Get this API documentation",
          parameters: {},
          response: "Complete API documentation object",
          example: "/api/docs"
        }
      }
    },

    agents: {
      gpt4: {
        name: "GPT-4 Assistant",
        description: "Advanced AI assistant powered by OpenAI GPT-4",
        capabilities: ["reasoning", "writing", "analysis", "coding", "creative tasks"],
        model: "gpt-4",
        provider: "openai",
        status: process.env.OPENAI_API_KEY ? "active" : "inactive"
      },
      claude: {
        name: "Claude Assistant", 
        description: "Anthropic Claude AI with strong analytical capabilities",
        capabilities: ["analysis", "writing", "reasoning", "research", "summarization"],
        model: "claude-3-5-sonnet-20240620",
        provider: "anthropic",
        status: process.env.ANTHROPIC_API_KEY ? "active" : "inactive"
      },
      grok: {
        name: "Grok Assistant",
        description: "xAI Grok AI with real-time information access",
        capabilities: ["conversation", "real-time info", "humor", "current events"],
        model: "grok-beta", 
        provider: "xai",
        status: process.env.XAI_GROK_API_KEY ? "active" : "inactive"
      },
      nimbus: {
        name: "Nimbus Multi-Agent",
        description: "Intelligent routing system that selects the best AI agent",
        capabilities: ["agent_routing", "multi_agent_coordination", "fallback_handling"],
        model: "multi-agent-router",
        provider: "nimbus",
        status: "active"
      }
    },

    examples: {
      chat_request: {
        url: "POST /api/nimbus/chat-simple",
        headers: {
          "Content-Type": "application/json"
        },
        body: {
          message: "How can I improve my mental wellness?",
          agent_id: "claude",
          conversation_id: "wellness_chat_123"
        }
      },
      chat_response: {
        message: "Here are some evidence-based strategies for improving mental wellness...",
        conversation_id: "wellness_chat_123",
        agent_used: "claude",
        multi_agent_details: {
          selected_agent: "claude",
          agent_used: "claude",
          fallback_used: false,
          reasoning: "Selected Claude for mental wellness expertise"
        },
        timestamp: "2024-12-31T19:30:00.000Z"
      }
    },

    error_codes: {
      400: "Bad Request - Invalid parameters",
      401: "Unauthorized - API key required",
      404: "Not Found - Endpoint or resource not found", 
      405: "Method Not Allowed - HTTP method not supported",
      429: "Too Many Requests - Rate limit exceeded",
      500: "Internal Server Error - Server error occurred"
    },

    rate_limits: {
      chat: "10 requests per minute per IP",
      health: "60 requests per minute per IP",
      agents: "30 requests per minute per IP",
      blog: "100 requests per minute per IP"
    },

    environment: {
      openai_available: !!process.env.OPENAI_API_KEY,
      anthropic_available: !!process.env.ANTHROPIC_API_KEY,
      grok_available: !!process.env.XAI_GROK_API_KEY,
      total_active_agents: [
        process.env.OPENAI_API_KEY,
        process.env.ANTHROPIC_API_KEY, 
        process.env.XAI_GROK_API_KEY
      ].filter(Boolean).length + 1 // +1 for nimbus router
    }
  };

  res.status(200).json(documentation);
};
