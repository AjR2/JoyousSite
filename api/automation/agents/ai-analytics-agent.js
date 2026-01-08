/**
 * AIAnalyticsAgent - Uses existing AI APIs (OpenAI, Claude, Grok) 
 * to analyze and summarize social media data
 * 
 * Leverages the AI keys already configured in the system:
 * - OPENAI_API_KEY
 * - ANTHROPIC_API_KEY  
 * - XAI_GROK_API_KEY
 */

const BaseAgent = require('./base-agent');

class AIAnalyticsAgent extends BaseAgent {
  constructor(config = {}) {
    super({
      ...config,
      name: config.name || 'AIAnalyticsAgent',
      role: 'ai_analyst',
      capabilities: ['analyze_data', 'generate_insights', 'summarize_trends', 'create_recommendations']
    });

    this.preferredProvider = config.preferredProvider || 'openai'; // 'openai', 'anthropic', 'grok'
  }

  /**
   * Main task performer
   */
  async performTask(task) {
    const { type, ...params } = task;

    switch (type) {
      case 'analyze':
        return await this.analyzeData(params.data);
      case 'generate_insights':
        return await this.generateInsights(params.data);
      case 'summarize':
        return await this.summarizeTrends(params.data);
      default:
        throw new Error(`Unknown task type: ${type}`);
    }
  }

  /**
   * Get the best available AI provider
   */
  getAvailableProvider() {
    if (process.env.OPENAI_API_KEY) return 'openai';
    if (process.env.ANTHROPIC_API_KEY) return 'anthropic';
    if (process.env.XAI_GROK_API_KEY) return 'grok';
    return null;
  }

  /**
   * Call the AI API to analyze data
   */
  async callAI(prompt) {
    const provider = this.getAvailableProvider();
    
    if (!provider) {
      return {
        analysis: 'AI analysis not available - no API keys configured',
        provider: 'none'
      };
    }

    try {
      switch (provider) {
        case 'openai':
          return await this.callOpenAI(prompt);
        case 'anthropic':
          return await this.callClaude(prompt);
        case 'grok':
          return await this.callGrok(prompt);
        default:
          throw new Error(`Unknown provider: ${provider}`);
      }
    } catch (error) {
      console.error(`AI call failed: ${error.message}`);
      return {
        analysis: `AI analysis failed: ${error.message}`,
        provider,
        error: true
      };
    }
  }

  /**
   * Call OpenAI API
   */
  async callOpenAI(prompt) {
    const fetch = global.fetch || require('node-fetch');
    const apiKey = process.env.OPENAI_API_KEY;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert social media analytics analyst for Akeyreu, a mental wellness company. Provide insightful, actionable analysis of social media metrics. Be concise but thorough.'
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      analysis: data.choices[0].message.content,
      provider: 'openai',
      model: 'gpt-4'
    };
  }

  /**
   * Call Anthropic Claude API
   */
  async callClaude(prompt) {
    const fetch = global.fetch || require('node-fetch');
    const apiKey = process.env.ANTHROPIC_API_KEY;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `You are an expert social media analytics analyst for Akeyreu, a mental wellness company. Provide insightful, actionable analysis.\n\n${prompt}`
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      analysis: data.content[0].text,
      provider: 'anthropic',
      model: 'claude-3-5-sonnet'
    };
  }

  /**
   * Call xAI Grok API
   */
  async callGrok(prompt) {
    const fetch = global.fetch || require('node-fetch');
    const apiKey = process.env.XAI_GROK_API_KEY;

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'grok-2-1212',
        messages: [
          {
            role: 'system',
            content: 'You are an expert social media analytics analyst for Akeyreu, a mental wellness company. Provide insightful, actionable analysis of social media metrics.'
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Grok API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      analysis: data.choices[0].message.content,
      provider: 'grok',
      model: 'grok-2'
    };
  }

  /**
   * Analyze social media data and generate insights
   */
  async analyzeData(data) {
    const prompt = `Analyze the following social media analytics data and provide key insights:

${JSON.stringify(data, null, 2)}

Please provide:
1. Key performance highlights
2. Areas of concern or improvement
3. Trends you notice
4. Actionable recommendations for a mental wellness company`;

    const result = await this.callAI(prompt);

    return {
      type: 'analysis',
      timestamp: new Date().toISOString(),
      inputData: data,
      ...result
    };
  }

  /**
   * Generate strategic insights from analytics
   */
  async generateInsights(data) {
    const prompt = `Based on this social media analytics data, generate strategic insights for Akeyreu (a mental wellness company):

${JSON.stringify(data, null, 2)}

Focus on:
1. Content strategy recommendations
2. Best posting times/days
3. Audience engagement patterns
4. Growth opportunities
5. Mental wellness content that performs well`;

    const result = await this.callAI(prompt);

    return {
      type: 'insights',
      timestamp: new Date().toISOString(),
      ...result
    };
  }

  /**
   * Summarize trends from analytics data
   */
  async summarizeTrends(data) {
    const prompt = `Summarize the key trends from this social media analytics data in a concise executive summary format:

${JSON.stringify(data, null, 2)}

Format as a brief weekly report suitable for email.`;

    const result = await this.callAI(prompt);

    return {
      type: 'summary',
      timestamp: new Date().toISOString(),
      ...result
    };
  }
}

module.exports = AIAnalyticsAgent;

