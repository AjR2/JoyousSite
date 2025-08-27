import React, { useState } from 'react';
import { Card, Button, Badge, Collapse } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRobot, 
  faPlus, 
  faRefresh, 
  faChevronDown, 
  faChevronRight,
  faCircle,
  faUserMd,
  faBrain,
  faStethoscope
} from '@fortawesome/free-solid-svg-icons';
import './AgentSidebar.css';

const AgentSidebar = ({ 
  agents, 
  selectedAgent, 
  onAgentSelect, 
  onNewConversation, 
  conversationId 
}) => {
  const [expandedAgent, setExpandedAgent] = useState(null);

  const getAgentIcon = (agentId) => {
    // Map different agent types to appropriate icons
    if (agentId.toLowerCase().includes('doctor') || agentId.toLowerCase().includes('physician')) {
      return faUserMd;
    } else if (agentId.toLowerCase().includes('therapist') || agentId.toLowerCase().includes('mental')) {
      return faBrain;
    } else if (agentId.toLowerCase().includes('nurse') || agentId.toLowerCase().includes('triage')) {
      return faStethoscope;
    }
    return faRobot;
  };

  const getAgentStatus = (agent) => {
    // Simulate agent status - in real app this would come from API
    return Math.random() > 0.3 ? 'online' : 'offline';
  };

  const handleAgentToggle = (agentId) => {
    setExpandedAgent(expandedAgent === agentId ? null : agentId);
  };

  return (
    <Card className="agent-sidebar">
      <Card.Header className="sidebar-header">
        <div className="header-content">
          <h5 className="mb-0">
            <FontAwesomeIcon icon={faRobot} className="me-2" />
            Nimbus AI
          </h5>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={onNewConversation}
            className="new-conversation-btn"
          >
            <FontAwesomeIcon icon={faPlus} />
          </Button>
        </div>
        {conversationId && (
          <div className="conversation-info">
            <small>Session: {conversationId.substring(0, 8)}...</small>
          </div>
        )}
      </Card.Header>

      <Card.Body className="agents-list">
        {agents.length === 0 ? (
          <div className="no-agents">
            <FontAwesomeIcon icon={faRobot} className="no-agents-icon" />
            <p>Nimbus is ready to help</p>
            <Button variant="outline-primary" size="sm">
              <FontAwesomeIcon icon={faRefresh} className="me-1" />
              Refresh
            </Button>
          </div>
        ) : (
          agents.map((agent) => {
            const isSelected = selectedAgent?.agent_id === agent.agent_id;
            const isExpanded = expandedAgent === agent.agent_id;
            const status = getAgentStatus(agent);

            return (
              <div key={agent.agent_id} className="agent-item">
                <div
                  className={`agent-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => onAgentSelect(agent)}
                >
                  <div className="agent-header">
                    <div className="agent-info">
                      <FontAwesomeIcon 
                        icon={getAgentIcon(agent.agent_id)} 
                        className="agent-icon" 
                      />
                      <div className="agent-details">
                        <div className="agent-name">{agent.agent_id}</div>
                        <div className="agent-status">
                          <FontAwesomeIcon 
                            icon={faCircle} 
                            className={`status-indicator ${status}`} 
                          />
                          <span className="status-text">{status}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="link"
                      size="sm"
                      className="expand-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAgentToggle(agent.agent_id);
                      }}
                    >
                      <FontAwesomeIcon 
                        icon={isExpanded ? faChevronDown : faChevronRight} 
                      />
                    </Button>
                  </div>
                </div>

                <Collapse in={isExpanded}>
                  <div className="agent-details-expanded">
                    <div className="agent-description">
                      <strong>Description:</strong>
                      <p>{agent.description}</p>
                    </div>
                    
                    {agent.inputs && agent.inputs.length > 0 && (
                      <div className="agent-capabilities">
                        <strong>Inputs:</strong>
                        <div className="capability-tags">
                          {agent.inputs.map((input, index) => (
                            <Badge key={index} bg="secondary" className="capability-tag">
                              {input}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {agent.outputs && agent.outputs.length > 0 && (
                      <div className="agent-capabilities">
                        <strong>Outputs:</strong>
                        <div className="capability-tags">
                          {agent.outputs.map((output, index) => (
                            <Badge key={index} bg="primary" className="capability-tag">
                              {output}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {agent.escalates_to_human && (
                      <div className="escalation-info">
                        <Badge bg="warning">
                          Can escalate to human
                        </Badge>
                      </div>
                    )}
                  </div>
                </Collapse>
              </div>
            );
          })
        )}
      </Card.Body>
    </Card>
  );
};

export default AgentSidebar;
