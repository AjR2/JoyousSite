import React, { useState, useEffect } from 'react';
import './NimbusDocumentation.css';

const NimbusDocumentation = () => {
  const [docs, setDocs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    fetchDocumentation();
  }, []);

  const fetchDocumentation = async () => {
    try {
      const response = await fetch('/api/docs');
      if (!response.ok) {
        throw new Error('Failed to fetch documentation');
      }
      const data = await response.json();
      setDocs(data);
    } catch (error) {
      console.error('Error fetching documentation:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderEndpoint = (method, path, details) => (
    <div key={`${method}-${path}`} className="endpoint-card">
      <div className="endpoint-header">
        <span className={`method-badge ${method.toLowerCase()}`}>{method}</span>
        <code className="endpoint-path">{path}</code>
      </div>
      <div className="endpoint-body">
        <p className="endpoint-description">{details.description}</p>
        
        {details.parameters && Object.keys(details.parameters).length > 0 && (
          <div className="parameters-section">
            <h6>Parameters:</h6>
            <ul>
              {Object.entries(details.parameters).map(([param, desc]) => (
                <li key={param}>
                  <code>{param}</code>: {desc}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {details.response && (
          <div className="response-section">
            <h6>Response:</h6>
            {typeof details.response === 'string' ? (
              <p>{details.response}</p>
            ) : (
              <ul>
                {Object.entries(details.response).map(([key, desc]) => (
                  <li key={key}>
                    <code>{key}</code>: {desc}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        
        {details.example && (
          <div className="example-section">
            <h6>Example:</h6>
            <code className="example-url">{details.example}</code>
          </div>
        )}
      </div>
    </div>
  );

  const renderAgentCard = (agentId, agent) => (
    <div key={agentId} className={`agent-card ${agent.status}`}>
      <div className="agent-header">
        <h5>{agent.name}</h5>
        <span className={`status-badge ${agent.status}`}>{agent.status}</span>
      </div>
      <p className="agent-description">{agent.description}</p>
      <div className="agent-details">
        <div className="agent-meta">
          <strong>Model:</strong> {agent.model}<br/>
          <strong>Provider:</strong> {agent.provider}
        </div>
        <div className="agent-capabilities">
          <strong>Capabilities:</strong>
          <div className="capability-tags">
            {agent.capabilities.map(cap => (
              <span key={cap} className="capability-tag">{cap}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="nimbus-docs-loading">
        <div className="spinner"></div>
        <p>Loading Nimbus AI Documentation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="nimbus-docs-error">
        <h3>⚠️ Error Loading Documentation</h3>
        <p>{error}</p>
        <button onClick={fetchDocumentation}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="nimbus-documentation">
      <div className="docs-header">
        <h2>🤖 {docs.title}</h2>
        <div className="docs-meta">
          <span>Version: {docs.version}</span>
          <span>Updated: {new Date(docs.last_updated).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="docs-nav">
        <button 
          className={activeSection === 'overview' ? 'active' : ''}
          onClick={() => setActiveSection('overview')}
        >
          Overview
        </button>
        <button 
          className={activeSection === 'endpoints' ? 'active' : ''}
          onClick={() => setActiveSection('endpoints')}
        >
          API Endpoints
        </button>
        <button 
          className={activeSection === 'agents' ? 'active' : ''}
          onClick={() => setActiveSection('agents')}
        >
          AI Agents
        </button>
        <button 
          className={activeSection === 'examples' ? 'active' : ''}
          onClick={() => setActiveSection('examples')}
        >
          Examples
        </button>
      </div>

      <div className="docs-content">
        {activeSection === 'overview' && (
          <div className="overview-section">
            <h3>Overview</h3>
            <p>{docs.description}</p>
            
            <div className="system-status">
              <h4>System Status</h4>
              <div className="status-grid">
                <div className="status-item">
                  <span className="status-label">Base URL:</span>
                  <code>{docs.base_url}</code>
                </div>
                <div className="status-item">
                  <span className="status-label">Active Agents:</span>
                  <span className="status-value">{docs.environment.total_active_agents}/4</span>
                </div>
                <div className="status-item">
                  <span className="status-label">OpenAI:</span>
                  <span className={`status-indicator ${docs.environment.openai_available ? 'active' : 'inactive'}`}>
                    {docs.environment.openai_available ? '✅ Available' : '❌ Not configured'}
                  </span>
                </div>
                <div className="status-item">
                  <span className="status-label">Anthropic:</span>
                  <span className={`status-indicator ${docs.environment.anthropic_available ? 'active' : 'inactive'}`}>
                    {docs.environment.anthropic_available ? '✅ Available' : '❌ Not configured'}
                  </span>
                </div>
                <div className="status-item">
                  <span className="status-label">Grok:</span>
                  <span className={`status-indicator ${docs.environment.grok_available ? 'active' : 'inactive'}`}>
                    {docs.environment.grok_available ? '✅ Available' : '❌ Not configured'}
                  </span>
                </div>
              </div>
            </div>

            <div className="rate-limits">
              <h4>Rate Limits</h4>
              <ul>
                {Object.entries(docs.rate_limits).map(([endpoint, limit]) => (
                  <li key={endpoint}>
                    <code>{endpoint}</code>: {limit}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeSection === 'endpoints' && (
          <div className="endpoints-section">
            <h3>API Endpoints</h3>
            
            <div className="endpoint-category">
              <h4>🤖 Nimbus AI</h4>
              {Object.entries(docs.endpoints.nimbus).map(([endpoint, details]) => {
                const [method, path] = endpoint.split(' ');
                return renderEndpoint(method, path, details);
              })}
            </div>

            <div className="endpoint-category">
              <h4>📝 Blog & Content</h4>
              {Object.entries(docs.endpoints.blog).map(([endpoint, details]) => {
                const [method, path] = endpoint.split(' ');
                return renderEndpoint(method, path, details);
              })}
            </div>

            <div className="endpoint-category">
              <h4>🔧 Utility</h4>
              {Object.entries(docs.endpoints.utility).map(([endpoint, details]) => {
                const [method, path] = endpoint.split(' ');
                return renderEndpoint(method, path, details);
              })}
            </div>
          </div>
        )}

        {activeSection === 'agents' && (
          <div className="agents-section">
            <h3>AI Agents</h3>
            <p>Nimbus AI uses multiple specialized agents to provide the best responses:</p>
            
            <div className="agents-grid">
              {Object.entries(docs.agents).map(([agentId, agent]) => 
                renderAgentCard(agentId, agent)
              )}
            </div>
          </div>
        )}

        {activeSection === 'examples' && (
          <div className="examples-section">
            <h3>Usage Examples</h3>
            
            <div className="example-block">
              <h4>Chat Request</h4>
              <pre className="code-block">
{JSON.stringify(docs.examples.chat_request, null, 2)}
              </pre>
            </div>

            <div className="example-block">
              <h4>Chat Response</h4>
              <pre className="code-block">
{JSON.stringify(docs.examples.chat_response, null, 2)}
              </pre>
            </div>

            <div className="error-codes">
              <h4>Error Codes</h4>
              <ul>
                {Object.entries(docs.error_codes).map(([code, description]) => (
                  <li key={code}>
                    <code>{code}</code>: {description}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NimbusDocumentation;
