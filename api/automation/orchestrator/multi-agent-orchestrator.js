/**
 * MultiAgentOrchestrator - Coordinates multiple agents for complex tasks
 * 
 * Inspired by LatentMAS architecture:
 * - Sequential agent execution with context passing (like latent state transfer)
 * - Hierarchical agent organization (manager -> workers)
 * - Working memory accumulation across agents
 * - Final "judger" agent for aggregation and decision making
 */

const SocialMediaAnalyticsAgent = require('../agents/social-media-analytics-agent');
const EmailReportAgent = require('../agents/email-report-agent');
const AIAnalyticsAgent = require('../agents/ai-analytics-agent');

class MultiAgentOrchestrator {
  constructor(config = {}) {
    this.orchestratorId = config.orchestratorId || `orchestrator_${Date.now()}`;
    this.agents = new Map();
    this.workflows = new Map();
    this.sharedContext = {}; // Shared context across all agents (like latent state)
    this.executionHistory = [];
    this.config = config;
  }

  /**
   * Initialize the orchestrator and register default agents
   */
  async initialize() {
    // Register default agents for social media analytics workflow
    await this.registerAgent('analytics', new SocialMediaAnalyticsAgent({
      platforms: this.config.platforms || ['instagram', 'twitter', 'linkedin', 'facebook'],
      credentials: this.buildCredentials()
    }));

    await this.registerAgent('reporter', new EmailReportAgent({
      recipients: this.config.recipients || [],
      emailConfig: {
        service: this.config.emailService || 'console',
        from: this.config.fromEmail || process.env.EMAIL_FROM
      }
    }));

    // Register AI Analytics Agent (uses existing OPENAI_API_KEY, ANTHROPIC_API_KEY, or XAI_GROK_API_KEY)
    await this.registerAgent('ai_analyst', new AIAnalyticsAgent({
      preferredProvider: this.config.aiProvider || 'openai'
    }));

    // Register default workflows
    this.registerWorkflow('weekly_analytics_report', this.buildWeeklyAnalyticsWorkflow());
    this.registerWorkflow('ai_enhanced_report', this.buildAIEnhancedWorkflow());

    return { success: true, orchestratorId: this.orchestratorId };
  }

  /**
   * Build credentials from environment variables
   */
  buildCredentials() {
    return {
      instagram: {
        accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
        accountId: process.env.INSTAGRAM_ACCOUNT_ID
      },
      twitter: {
        bearerToken: process.env.TWITTER_BEARER_TOKEN,
        userId: process.env.TWITTER_USER_ID
      },
      linkedin: {
        accessToken: process.env.LINKEDIN_ACCESS_TOKEN,
        organizationId: process.env.LINKEDIN_ORG_ID
      },
      facebook: {
        accessToken: process.env.FACEBOOK_ACCESS_TOKEN,
        pageId: process.env.FACEBOOK_PAGE_ID
      }
    };
  }

  /**
   * Register an agent with the orchestrator
   */
  async registerAgent(name, agent) {
    await agent.initialize();
    this.agents.set(name, agent);
    return { registered: name, agentId: agent.agentId };
  }

  /**
   * Register a workflow (sequence of agent tasks)
   */
  registerWorkflow(name, workflow) {
    this.workflows.set(name, workflow);
    return { registered: name, steps: workflow.length };
  }

  /**
   * Build the weekly analytics report workflow
   * This demonstrates the LatentMAS-style sequential agent execution
   */
  buildWeeklyAnalyticsWorkflow() {
    return [
      {
        agentName: 'analytics',
        role: 'data_collector',
        task: { type: 'fetch_all_analytics' },
        description: 'Collect analytics from all social media platforms',
        passContext: true // Pass results to next agent (like latent state)
      },
      {
        agentName: 'analytics',
        role: 'aggregator',
        task: { type: 'aggregate' },
        description: 'Aggregate all collected analytics into summary',
        passContext: true
      },
      {
        agentName: 'reporter',
        role: 'judger', // Final agent that produces the output (like LatentMAS judger)
        task: { type: 'generate_and_send' },
        description: 'Generate and send the email report',
        useContext: true // Use accumulated context from previous agents
      }
    ];
  }

  /**
   * Build AI-enhanced workflow that uses existing AI APIs for intelligent analysis
   * This workflow uses OPENAI_API_KEY, ANTHROPIC_API_KEY, or XAI_GROK_API_KEY
   */
  buildAIEnhancedWorkflow() {
    return [
      {
        agentName: 'analytics',
        role: 'data_collector',
        task: { type: 'fetch_all_analytics' },
        description: 'Collect analytics from all social media platforms',
        passContext: true
      },
      {
        agentName: 'analytics',
        role: 'aggregator',
        task: { type: 'aggregate' },
        description: 'Aggregate all collected analytics into summary',
        passContext: true
      },
      {
        agentName: 'ai_analyst',
        role: 'analyzer',
        task: { type: 'analyze' },
        description: 'Use AI (GPT-4/Claude/Grok) to analyze the data and generate insights',
        useContext: true,
        passContext: true
      },
      {
        agentName: 'reporter',
        role: 'judger',
        task: { type: 'generate_and_send' },
        description: 'Generate and send the AI-enhanced email report',
        useContext: true
      }
    ];
  }

  /**
   * Execute a workflow by name
   * Implements sequential execution with context passing (similar to LatentMAS)
   */
  async executeWorkflow(workflowName, params = {}) {
    const workflow = this.workflows.get(workflowName);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowName}`);
    }

    const execution = {
      workflowName,
      startTime: Date.now(),
      steps: [],
      params
    };

    // Reset shared context for this execution
    this.sharedContext = { ...params };

    console.log(`\n🚀 Starting workflow: ${workflowName}`);
    console.log('='.repeat(50));

    for (let i = 0; i < workflow.length; i++) {
      const step = workflow[i];
      console.log(`\n📌 Step ${i + 1}/${workflow.length}: ${step.description}`);
      console.log(`   Agent: ${step.agentName} (role: ${step.role})`);

      const agent = this.agents.get(step.agentName);
      if (!agent) {
        throw new Error(`Agent not found: ${step.agentName}`);
      }

      // Prepare task with context if needed
      const taskWithContext = step.useContext 
        ? { ...step.task, data: this.sharedContext.aggregatedData, recipients: params.recipients }
        : step.task;

      // Execute the agent task
      const result = await agent.execute(taskWithContext, this.sharedContext);

      // Update shared context with results (like latent state passing)
      if (step.passContext && result.success) {
        this.sharedContext = {
          ...this.sharedContext,
          ...result.context,
          [`${step.agentName}_${step.role}_result`]: result.result,
          aggregatedData: result.result // Keep the latest aggregated data
        };
      }

      execution.steps.push({
        step: i + 1,
        agentName: step.agentName,
        role: step.role,
        success: result.success,
        duration: result.duration,
        error: result.error
      });

      console.log(`   ✅ Completed in ${result.duration}ms`);
    }

    execution.endTime = Date.now();
    execution.totalDuration = execution.endTime - execution.startTime;
    execution.success = execution.steps.every(s => s.success);

    this.executionHistory.push(execution);

    console.log('\n' + '='.repeat(50));
    console.log(`🏁 Workflow completed in ${execution.totalDuration}ms`);
    console.log(`   Success: ${execution.success}`);

    return execution;
  }

  /**
   * Get the status of all registered agents
   */
  getAgentStatus() {
    const status = {};
    for (const [name, agent] of this.agents) {
      status[name] = agent.getInfo();
    }
    return status;
  }

  /**
   * Get execution history
   */
  getExecutionHistory() {
    return this.executionHistory;
  }

  /**
   * Get available workflows
   */
  getWorkflows() {
    const workflows = {};
    for (const [name, steps] of this.workflows) {
      workflows[name] = {
        steps: steps.length,
        description: steps.map(s => s.description)
      };
    }
    return workflows;
  }

  /**
   * Cleanup all agents
   */
  async cleanup() {
    for (const [name, agent] of this.agents) {
      await agent.cleanup();
    }
    this.agents.clear();
    this.sharedContext = {};
  }
}

module.exports = MultiAgentOrchestrator;

