// NimbusAdmin.js - Nimbus AI management interface integrated with existing admin
import React, { useState, useEffect } from 'react';
import './NimbusAdmin.css';

const NimbusAdmin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [systemStatus, setSystemStatus] = useState({
    nimbus: 'checking',
    openai: 'checking',
    claude: 'checking',
    grok: 'checking'
  });
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Agent management state
  const [showAgentForm, setShowAgentForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [agentForm, setAgentForm] = useState({
    agent_id: '',
    description: '',
    inputs: '',
    outputs: '',
    capabilities: '',
    escalates_to_human: false
  });

  useEffect(() => {
    fetchSystemStatus();
    fetchAgents();
    loadChatHistory();
  }, []);

  const fetchSystemStatus = async () => {
    try {
      const response = await fetch('/api/nimbus/health-simple?detailed=true');
      const data = await response.json();
      
      if (data.services) {
        const statusMap = {};
        data.services.details.forEach(service => {
          statusMap[service.service] = service.status;
        });
        setSystemStatus({
          nimbus: data.status,
          ...statusMap
        });
      }
    } catch (error) {
      console.error('Error fetching system status:', error);
      setSystemStatus({
        nimbus: 'error',
        openai: 'error',
        claude: 'error',
        grok: 'error'
      });
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/nimbus/agents');
      const data = await response.json();
      setAgents(data.agents || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching agents:', error);
      setError('Failed to load agents');
      setLoading(false);
    }
  };

  const loadChatHistory = () => {
    const saved = localStorage.getItem('nimbusAdminChat');
    if (saved) {
      setChatMessages(JSON.parse(saved));
    }
  };

  const saveChatHistory = (messages) => {
    localStorage.setItem('nimbusAdminChat', JSON.stringify(messages));
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: chatInput.trim(),
      timestamp: new Date().toISOString()
    };

    const newMessages = [...chatMessages, userMessage];
    setChatMessages(newMessages);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await fetch('/api/nimbus/chat-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversation_id: 'admin-session'
        }),
      });

      const data = await response.json();
      
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.message || 'Sorry, I couldn\'t process your request.',
        timestamp: new Date().toISOString(),
        agent_used: data.agent_used,
        multi_agent_details: data.multi_agent_details
      };

      const finalMessages = [...newMessages, assistantMessage];
      setChatMessages(finalMessages);
      saveChatHistory(finalMessages);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Error: Unable to connect to Nimbus AI. Please check the system status.',
        timestamp: new Date().toISOString(),
        isError: true
      };
      const finalMessages = [...newMessages, errorMessage];
      setChatMessages(finalMessages);
      saveChatHistory(finalMessages);
    } finally {
      setChatLoading(false);
    }
  };

  const handleAgentSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const agentData = {
        ...agentForm,
        inputs: agentForm.inputs.split(',').map(s => s.trim()).filter(Boolean),
        outputs: agentForm.outputs.split(',').map(s => s.trim()).filter(Boolean),
        capabilities: agentForm.capabilities.split(',').map(s => s.trim()).filter(Boolean)
      };

      const method = editingAgent ? 'PUT' : 'POST';
      const url = editingAgent 
        ? `/api/nimbus/agents?agent_id=${editingAgent.agent_id}`
        : '/api/nimbus/agents';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentData),
      });

      if (response.ok) {
        fetchAgents();
        setShowAgentForm(false);
        setEditingAgent(null);
        setAgentForm({
          agent_id: '',
          description: '',
          inputs: '',
          outputs: '',
          capabilities: '',
          escalates_to_human: false
        });
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving agent:', error);
      alert('Failed to save agent');
    }
  };

  const handleEditAgent = (agent) => {
    setEditingAgent(agent);
    setAgentForm({
      agent_id: agent.agent_id,
      description: agent.description,
      inputs: Array.isArray(agent.inputs) ? agent.inputs.join(', ') : '',
      outputs: Array.isArray(agent.outputs) ? agent.outputs.join(', ') : '',
      capabilities: Array.isArray(agent.capabilities) ? agent.capabilities.join(', ') : '',
      escalates_to_human: agent.escalates_to_human || false
    });
    setShowAgentForm(true);
  };

  const handleDeleteAgent = async (agentId) => {
    if (!confirm(`Are you sure you want to delete agent '${agentId}'?`)) return;

    try {
      const response = await fetch(`/api/nimbus/agents?agent_id=${agentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchAgents();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting agent:', error);
      alert('Failed to delete agent');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return '🟢';
      case 'unhealthy': return '🔴';
      case 'error': return '❌';
      default: return '🟡';
    }
  };

  const clearChat = () => {
    if (confirm('Are you sure you want to clear the chat history?')) {
      setChatMessages([]);
      localStorage.removeItem('nimbusAdminChat');
    }
  };

  if (loading) {
    return (
      <div className="nimbus-admin-loading">
        <div className="spinner"></div>
        <p>Loading Nimbus AI Admin...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="nimbus-admin-error">
        <h3>⚠️ Error Loading Nimbus AI</h3>
        <p>{error}</p>
        <button onClick={() => { setError(null); setLoading(true); fetchAgents(); }}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="nimbus-admin">
      <div className="nimbus-admin-header">
        <h2>🤖 Nimbus AI Management</h2>
        <div className="system-status">
          <span>System Status: {getStatusIcon(systemStatus.nimbus)} {systemStatus.nimbus}</span>
        </div>
      </div>

      <div className="nimbus-admin-tabs">
        <button 
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button 
          className={`tab ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          💬 Chat Test
        </button>
        <button 
          className={`tab ${activeTab === 'agents' ? 'active' : ''}`}
          onClick={() => setActiveTab('agents')}
        >
          🤖 Agents
        </button>
        <button 
          className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📈 Analytics
        </button>
      </div>

      <div className="nimbus-admin-content">
        {activeTab === 'dashboard' && (
          <div className="dashboard-tab">
            <div className="status-grid">
              <div className="status-card">
                <h3>🤖 Nimbus Core</h3>
                <div className="status-indicator">
                  {getStatusIcon(systemStatus.nimbus)} {systemStatus.nimbus}
                </div>
              </div>
              <div className="status-card">
                <h3>🧠 OpenAI GPT-4</h3>
                <div className="status-indicator">
                  {getStatusIcon(systemStatus.openai)} {systemStatus.openai || 'unknown'}
                </div>
              </div>
              <div className="status-card">
                <h3>🎭 Claude</h3>
                <div className="status-indicator">
                  {getStatusIcon(systemStatus.claude)} {systemStatus.claude || 'unknown'}
                </div>
              </div>
              <div className="status-card">
                <h3>⚡ Grok</h3>
                <div className="status-indicator">
                  {getStatusIcon(systemStatus.grok)} {systemStatus.grok || 'unknown'}
                </div>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <h4>Active Agents</h4>
                <div className="stat-number">{agents.filter(a => a.status === 'active').length}</div>
              </div>
              <div className="stat-card">
                <h4>Total Conversations</h4>
                <div className="stat-number">{chatMessages.length}</div>
              </div>
              <div className="stat-card">
                <h4>System Uptime</h4>
                <div className="stat-number">99.9%</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="chat-tab">
            <div className="chat-header">
              <h3>💬 Chat with Nimbus AI</h3>
              <button onClick={clearChat} className="btn-secondary">Clear Chat</button>
            </div>
            
            <div className="chat-messages">
              {chatMessages.map((message) => (
                <div key={message.id} className={`message ${message.role}`}>
                  <div className="message-content">
                    <strong>{message.role === 'user' ? 'You' : 'Nimbus'}:</strong>
                    <p>{message.content}</p>
                    {message.agent_used && (
                      <small className="agent-info">Agent: {message.agent_used}</small>
                    )}
                  </div>
                  <div className="message-time">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="message assistant loading">
                  <div className="message-content">
                    <strong>Nimbus:</strong>
                    <p>Thinking...</p>
                  </div>
                </div>
              )}
            </div>

            <div className="chat-input">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                placeholder="Ask Nimbus anything..."
                disabled={chatLoading}
              />
              <button 
                onClick={sendChatMessage}
                disabled={!chatInput.trim() || chatLoading}
                className="btn-primary"
              >
                Send
              </button>
            </div>
          </div>
        )}

        {activeTab === 'agents' && (
          <div className="agents-tab">
            <div className="agents-header">
              <h3>🤖 Agent Management</h3>
              <button 
                onClick={() => setShowAgentForm(true)}
                className="btn-primary"
              >
                Add Agent
              </button>
            </div>

            {showAgentForm && (
              <div className="agent-form-overlay">
                <div className="agent-form">
                  <h4>{editingAgent ? 'Edit Agent' : 'Add New Agent'}</h4>
                  <form onSubmit={handleAgentSubmit}>
                    <div className="form-group">
                      <label>Agent ID:</label>
                      <input
                        type="text"
                        value={agentForm.agent_id}
                        onChange={(e) => setAgentForm({...agentForm, agent_id: e.target.value})}
                        required
                        disabled={editingAgent}
                      />
                    </div>
                    <div className="form-group">
                      <label>Description:</label>
                      <textarea
                        value={agentForm.description}
                        onChange={(e) => setAgentForm({...agentForm, description: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Inputs (comma-separated):</label>
                      <input
                        type="text"
                        value={agentForm.inputs}
                        onChange={(e) => setAgentForm({...agentForm, inputs: e.target.value})}
                        placeholder="text, audio, image"
                      />
                    </div>
                    <div className="form-group">
                      <label>Outputs (comma-separated):</label>
                      <input
                        type="text"
                        value={agentForm.outputs}
                        onChange={(e) => setAgentForm({...agentForm, outputs: e.target.value})}
                        placeholder="text, recommendations, analysis"
                      />
                    </div>
                    <div className="form-group">
                      <label>Capabilities (comma-separated):</label>
                      <input
                        type="text"
                        value={agentForm.capabilities}
                        onChange={(e) => setAgentForm({...agentForm, capabilities: e.target.value})}
                        placeholder="mental_wellness, sleep_analysis"
                      />
                    </div>
                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={agentForm.escalates_to_human}
                          onChange={(e) => setAgentForm({...agentForm, escalates_to_human: e.target.checked})}
                        />
                        Escalates to human when needed
                      </label>
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn-primary">
                        {editingAgent ? 'Update' : 'Create'} Agent
                      </button>
                      <button 
                        type="button" 
                        onClick={() => {
                          setShowAgentForm(false);
                          setEditingAgent(null);
                        }}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="agents-list">
              {agents.map((agent) => (
                <div key={agent.agent_id} className="agent-card">
                  <div className="agent-header">
                    <h4>{agent.agent_id}</h4>
                    <div className="agent-status">
                      {agent.status === 'active' ? '🟢' : '🔴'} {agent.status}
                    </div>
                  </div>
                  <p>{agent.description}</p>
                  <div className="agent-details">
                    <div><strong>Inputs:</strong> {Array.isArray(agent.inputs) ? agent.inputs.join(', ') : 'None'}</div>
                    <div><strong>Outputs:</strong> {Array.isArray(agent.outputs) ? agent.outputs.join(', ') : 'None'}</div>
                    <div><strong>Capabilities:</strong> {Array.isArray(agent.capabilities) ? agent.capabilities.join(', ') : 'None'}</div>
                    <div><strong>Escalates:</strong> {agent.escalates_to_human ? 'Yes' : 'No'}</div>
                  </div>
                  <div className="agent-actions">
                    <button 
                      onClick={() => handleEditAgent(agent)}
                      className="btn-secondary"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteAgent(agent.agent_id)}
                      className="btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-tab">
            <h3>📈 Nimbus AI Analytics</h3>
            <div className="analytics-grid">
              <div className="analytics-card">
                <h4>Usage Statistics</h4>
                <p>Chat interactions: {chatMessages.length}</p>
                <p>Active agents: {agents.filter(a => a.status === 'active').length}</p>
                <p>System uptime: 99.9%</p>
              </div>
              <div className="analytics-card">
                <h4>Performance Metrics</h4>
                <p>Average response time: 1.2s</p>
                <p>Success rate: 98.5%</p>
                <p>User satisfaction: 4.8/5</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NimbusAdmin;
