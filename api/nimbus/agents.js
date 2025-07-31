// Nimbus AI Agents Management API endpoint for Vercel
// File: /api/nimbus/agents.js

import { securityMiddleware } from '../utils/security.js';
import config from '../utils/config.js';

// Default agent configurations
const DEFAULT_AGENTS = [
  {
    agent_id: 'nimbus',
    description: 'Primary Nimbus AI assistant for general mental wellness support',
    inputs: ['text', 'conversation_context'],
    outputs: ['text', 'recommendations'],
    escalates_to_human: false,
    capabilities: ['mental_wellness_guidance', 'product_information', 'general_support'],
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    agent_id: 'sleep_specialist',
    description: 'Specialized agent for sleep-related queries and nAura product support',
    inputs: ['text', 'sleep_data', 'biometric_data'],
    outputs: ['text', 'sleep_recommendations', 'naura_insights'],
    escalates_to_human: false,
    capabilities: ['sleep_analysis', 'naura_support', 'sleep_hygiene_advice'],
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    agent_id: 'cognitive_wellness',
    description: 'Cognitive wellness specialist for Vza product and CBT support',
    inputs: ['text', 'mood_data', 'cognitive_assessments'],
    outputs: ['text', 'cbt_exercises', 'vza_recommendations'],
    escalates_to_human: true,
    capabilities: ['cbt_guidance', 'vza_support', 'cognitive_exercises'],
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    agent_id: 'wellness_coach',
    description: 'Holistic wellness coach for lifestyle and habit formation',
    inputs: ['text', 'lifestyle_data', 'goals'],
    outputs: ['text', 'action_plans', 'progress_tracking'],
    escalates_to_human: false,
    capabilities: ['habit_formation', 'goal_setting', 'lifestyle_coaching'],
    status: 'active',
    created_at: new Date().toISOString()
  }
];

// Simple in-memory storage (use database in production)
let agents = [...DEFAULT_AGENTS];

// Utility functions
function validateAgent(agent) {
  const required = ['agent_id', 'description'];
  const missing = required.filter(field => !agent[field]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(agent.agent_id)) {
    throw new Error('Agent ID must contain only letters, numbers, hyphens, and underscores');
  }

  return true;
}

function sanitizeAgent(agent) {
  return {
    agent_id: agent.agent_id,
    description: agent.description,
    inputs: Array.isArray(agent.inputs) ? agent.inputs : [],
    outputs: Array.isArray(agent.outputs) ? agent.outputs : [],
    escalates_to_human: Boolean(agent.escalates_to_human),
    capabilities: Array.isArray(agent.capabilities) ? agent.capabilities : [],
    status: agent.status || 'active',
    created_at: agent.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

export default async function handler(req, res) {
  // Apply security middleware
  const securityResult = securityMiddleware(req, res, {
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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

  try {
    switch (req.method) {
      case 'GET':
        return handleGetAgents(req, res);
      case 'POST':
        return handleCreateAgent(req, res);
      case 'PUT':
        return handleUpdateAgent(req, res);
      case 'DELETE':
        return handleDeleteAgent(req, res);
      default:
        return res.status(405).json({
          error: 'Method not allowed',
          timestamp: new Date().toISOString()
        });
    }
  } catch (error) {
    console.error('Error in /api/nimbus/agents:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
}

async function handleGetAgents(req, res) {
  const { agent_id, status } = req.query;

  let filteredAgents = agents;

  // Filter by agent_id if specified
  if (agent_id) {
    filteredAgents = agents.filter(agent => agent.agent_id === agent_id);
    if (filteredAgents.length === 0) {
      return res.status(404).json({
        error: 'Agent not found',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Filter by status if specified
  if (status) {
    filteredAgents = filteredAgents.filter(agent => agent.status === status);
  }

  return res.status(200).json({
    agents: filteredAgents,
    total: filteredAgents.length,
    timestamp: new Date().toISOString()
  });
}

async function handleCreateAgent(req, res) {
  try {
    const agentData = req.body;
    
    // Validate agent data
    validateAgent(agentData);

    // Check if agent already exists
    const existingAgent = agents.find(agent => agent.agent_id === agentData.agent_id);
    if (existingAgent) {
      return res.status(409).json({
        error: 'Agent with this ID already exists',
        timestamp: new Date().toISOString()
      });
    }

    // Create new agent
    const newAgent = sanitizeAgent(agentData);
    agents.push(newAgent);

    return res.status(201).json({
      success: true,
      agent: newAgent,
      message: 'Agent created successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return res.status(400).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

async function handleUpdateAgent(req, res) {
  try {
    const { agent_id } = req.query;
    const updateData = req.body;

    if (!agent_id) {
      return res.status(400).json({
        error: 'Agent ID is required',
        timestamp: new Date().toISOString()
      });
    }

    // Find agent
    const agentIndex = agents.findIndex(agent => agent.agent_id === agent_id);
    if (agentIndex === -1) {
      return res.status(404).json({
        error: 'Agent not found',
        timestamp: new Date().toISOString()
      });
    }

    // Validate update data
    const updatedAgent = { ...agents[agentIndex], ...updateData };
    validateAgent(updatedAgent);

    // Update agent
    agents[agentIndex] = sanitizeAgent(updatedAgent);

    return res.status(200).json({
      success: true,
      agent: agents[agentIndex],
      message: 'Agent updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return res.status(400).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

async function handleDeleteAgent(req, res) {
  const { agent_id } = req.query;

  if (!agent_id) {
    return res.status(400).json({
      error: 'Agent ID is required',
      timestamp: new Date().toISOString()
    });
  }

  // Find agent
  const agentIndex = agents.findIndex(agent => agent.agent_id === agent_id);
  if (agentIndex === -1) {
    return res.status(404).json({
      error: 'Agent not found',
      timestamp: new Date().toISOString()
    });
  }

  // Prevent deletion of default agents
  const defaultAgentIds = DEFAULT_AGENTS.map(agent => agent.agent_id);
  if (defaultAgentIds.includes(agent_id)) {
    return res.status(403).json({
      error: 'Cannot delete default system agents',
      timestamp: new Date().toISOString()
    });
  }

  // Delete agent
  const deletedAgent = agents.splice(agentIndex, 1)[0];

  return res.status(200).json({
    success: true,
    agent: deletedAgent,
    message: 'Agent deleted successfully',
    timestamp: new Date().toISOString()
  });
}
