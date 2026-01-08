/**
 * BaseAgent - Foundation class for all automation agents
 * 
 * Inspired by LatentMAS architecture, this implements:
 * - Agent role definitions
 * - Message passing between agents
 * - Context accumulation (similar to latent state)
 * - Task execution with memory
 */

class BaseAgent {
  constructor(config = {}) {
    this.agentId = config.agentId || `agent_${Date.now()}`;
    this.name = config.name || 'BaseAgent';
    this.role = config.role || 'worker';
    this.capabilities = config.capabilities || [];
    this.status = 'idle';
    this.context = {}; // Accumulated context (similar to latent state)
    this.memory = []; // Agent's working memory
    this.maxMemorySize = config.maxMemorySize || 50;
  }

  /**
   * Initialize the agent (override in subclasses)
   */
  async initialize() {
    this.status = 'ready';
    return { success: true, agentId: this.agentId };
  }

  /**
   * Execute a task - main entry point for agent actions
   * @param {Object} task - Task definition with type and parameters
   * @param {Object} sharedContext - Context shared between agents
   */
  async execute(task, sharedContext = {}) {
    this.status = 'working';
    const startTime = Date.now();

    try {
      // Merge shared context with local context
      this.context = { ...this.context, ...sharedContext };
      
      // Add task to memory
      this.addToMemory({ type: 'task_start', task, timestamp: startTime });

      // Execute the task (implemented by subclasses)
      const result = await this.performTask(task);

      // Update context with results
      this.context.lastResult = result;
      this.addToMemory({ type: 'task_complete', result, duration: Date.now() - startTime });

      this.status = 'ready';
      return {
        success: true,
        agentId: this.agentId,
        result,
        context: this.context,
        duration: Date.now() - startTime
      };
    } catch (error) {
      this.status = 'error';
      this.addToMemory({ type: 'task_error', error: error.message, timestamp: Date.now() });
      
      return {
        success: false,
        agentId: this.agentId,
        error: error.message,
        context: this.context
      };
    }
  }

  /**
   * Perform the actual task - override in subclasses
   */
  async performTask(task) {
    throw new Error('performTask must be implemented by subclass');
  }

  /**
   * Add an entry to working memory (with size limit)
   */
  addToMemory(entry) {
    this.memory.push(entry);
    if (this.memory.length > this.maxMemorySize) {
      this.memory.shift(); // Remove oldest entry
    }
  }

  /**
   * Get the agent's current context (for passing to other agents)
   */
  getContext() {
    return { ...this.context };
  }

  /**
   * Merge context from another agent (like latent state passing)
   */
  mergeContext(incomingContext) {
    this.context = { ...this.context, ...incomingContext };
  }

  /**
   * Get agent info
   */
  getInfo() {
    return {
      agentId: this.agentId,
      name: this.name,
      role: this.role,
      capabilities: this.capabilities,
      status: this.status,
      memorySize: this.memory.length
    };
  }

  /**
   * Cleanup resources (override in subclasses)
   */
  async cleanup() {
    this.status = 'idle';
    this.context = {};
  }
}

module.exports = BaseAgent;

