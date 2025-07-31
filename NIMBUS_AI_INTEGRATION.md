# 🤖 Nimbus AI Integration Guide

This document explains the Nimbus AI multi-agent system integration with the Akeyreu website.

## 🌟 Overview

Nimbus AI is a sophisticated multi-agent system that provides intelligent mental wellness support through multiple AI services:

- **GPT-4 (OpenAI)**: Primary agent for general queries and technical questions
- **Claude (Anthropic)**: Specialized in health and wellness topics, sleep analysis
- **Grok (xAI)**: Creative and empathetic responses for emotional support

## 🏗️ Architecture

### API Endpoints

The Nimbus AI system is integrated as Vercel serverless functions:

```
/api/nimbus/chat          - Main chat interface
/api/nimbus/agents        - Agent management (CRUD)
/api/nimbus/health        - System health checks
/api/nimbus/collaborate   - Multi-agent collaboration
```

### Admin Interface

Access the Nimbus AI admin panel through:
1. Navigate to `/admin` (requires authentication)
2. Click on the "🤖 Nimbus AI" tab
3. Manage agents, test chat, and view analytics

## 🔧 Setup & Configuration

### 1. Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# AI Service API Keys (REQUIRED)
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
XAI_GROK_API_KEY=your_grok_api_key_here

# Nimbus AI Settings
NIMBUS_ENABLED=true
NIMBUS_DEFAULT_AGENT=gpt4
NIMBUS_MAX_CONVERSATION_LENGTH=20
NIMBUS_RESPONSE_TIMEOUT=30000
```

### 2. API Key Setup

#### OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account and navigate to API Keys
3. Generate a new secret key
4. Add to `OPENAI_API_KEY` environment variable

#### Anthropic API Key
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Create an account and navigate to API Keys
3. Generate a new API key
4. Add to `ANTHROPIC_API_KEY` environment variable

#### Grok API Key
1. Visit [xAI Console](https://console.x.ai/)
2. Create an account and navigate to API Keys
3. Generate a new API key
4. Add to `XAI_GROK_API_KEY` environment variable

### 3. Vercel Deployment

For production deployment on Vercel:

1. **Environment Variables**: Add all API keys in Vercel dashboard
2. **Build Settings**: No changes needed - uses existing React build
3. **Function Configuration**: Serverless functions auto-deploy from `/api/nimbus/`

## 🚀 Features

### Multi-Agent Intelligence
- **Smart Routing**: Automatically selects the best AI agent based on query type
- **Fallback System**: If primary agent fails, automatically falls back to GPT-4
- **Context Awareness**: Maintains conversation context across interactions

### Agent Management
- **CRUD Operations**: Create, read, update, delete custom agents
- **Configuration**: Set inputs, outputs, capabilities, and escalation rules
- **Status Monitoring**: Real-time health checks for all AI services

### Admin Interface
- **Dashboard**: System status and usage statistics
- **Chat Testing**: Direct interface to test Nimbus AI responses
- **Agent Configuration**: Manage agent settings and capabilities
- **Analytics**: Usage metrics and performance data

## 🔒 Security Features

### API Security
- **CORS Protection**: Configured for production domains
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Sanitizes all user inputs
- **Error Handling**: Secure error responses without sensitive data

### Authentication
- **Admin Access**: Secure admin panel with session management
- **API Keys**: Encrypted storage of AI service credentials
- **Environment Isolation**: Separate configs for dev/staging/production

## 📊 Usage Examples

### Basic Chat Request
```javascript
const response = await fetch('/api/nimbus/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "I'm having trouble sleeping. Can you help?",
    conversation_id: "user-session-123"
  })
});

const data = await response.json();
console.log(data.message); // AI response
console.log(data.agent_used); // Which agent responded
```

### Agent Management
```javascript
// Create new agent
const newAgent = await fetch('/api/nimbus/agents', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    agent_id: 'sleep_specialist',
    description: 'Specialized in sleep wellness and nAura product support',
    inputs: ['text', 'sleep_data'],
    outputs: ['text', 'sleep_recommendations'],
    capabilities: ['sleep_analysis', 'naura_support']
  })
});
```

### Health Check
```javascript
// Basic health check
const health = await fetch('/api/nimbus/health');

// Detailed health check
const detailedHealth = await fetch('/api/nimbus/health?detailed=true');
```

## 🛠️ Development

### Local Development
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Start development server
npm run dev

# Access admin panel
open http://localhost:3000/admin
```

### Testing
```bash
# Test API endpoints
npm run test:api

# Test Nimbus integration
npm run test:nimbus

# Security audit
npm run security:audit
```

## 🔍 Troubleshooting

### Common Issues

#### "API key not configured" Error
- Ensure all required API keys are set in environment variables
- Check that environment variables are properly loaded in Vercel

#### "All AI services are currently unavailable"
- Check API key validity and account limits
- Verify network connectivity to AI service endpoints
- Check Vercel function logs for detailed error messages

#### Admin Panel Not Loading
- Verify authentication credentials
- Check browser console for JavaScript errors
- Ensure all required components are properly imported

### Health Monitoring
- Use `/api/nimbus/health?detailed=true` for comprehensive system status
- Monitor Vercel function logs for error patterns
- Set up alerts for API failures or high response times

## 📈 Performance Optimization

### Response Time
- Average response time: ~1-3 seconds
- Timeout configured at 30 seconds
- Automatic fallback reduces failed requests

### Cost Management
- Monitor API usage through provider dashboards
- Implement conversation length limits
- Use appropriate model tiers for different query types

## 🔄 Updates & Maintenance

### Regular Tasks
- Monitor API usage and costs
- Update AI model versions when available
- Review and update agent configurations
- Security audit of API keys and access patterns

### Version Updates
- Follow semantic versioning for Nimbus AI features
- Test thoroughly in staging before production deployment
- Maintain backward compatibility for existing integrations

## 📞 Support

For issues with the Nimbus AI integration:

1. Check this documentation first
2. Review Vercel function logs
3. Test individual API endpoints
4. Check AI service status pages
5. Contact development team with detailed error logs

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Compatibility**: Vercel, React 18, Node.js 18+
