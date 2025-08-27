import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import ChatInterface from './ChatInterface';
import AgentSidebar from './AgentSidebar';
import ConversationHistory from './ConversationHistory';
import { agentAPI, conversationAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [conversations] = useState([]);
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    // Fetch agents on component mount
    fetchAgents();
    // Start a new conversation
    startNewConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAgents = useCallback(async () => {
    try {
      const agentsData = await agentAPI.getAgents();
      setAgents(agentsData);
      if (agentsData.length > 0) {
        setSelectedAgent(prevSelected => prevSelected || agentsData[0]);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
      // Set some default agents for development
      const defaultAgents = [
        {
          agent_id: 'nimbus',
          description: 'Nimbus - Your friendly AI assistant for all workplace questions and tasks',
          inputs: ['user_message'],
          outputs: ['response'],
          escalates_to_human: false
        }
      ];
      setAgents(defaultAgents);
      setSelectedAgent(prevSelected => prevSelected || defaultAgents[0]);
    }
  }, []);

  const startNewConversation = useCallback(async () => {
    try {
      const data = await conversationAPI.startConversation();
      setConversationId(data.conversation_id);
    } catch (error) {
      console.error('Error starting conversation:', error);
      // Generate a fallback conversation ID
      setConversationId(`conv_${Date.now()}`);
    }
  }, []);

  const handleAgentSelect = (agent) => {
    setSelectedAgent(agent);
  };

  const handleNewConversation = () => {
    startNewConversation();
    // Clear current conversation messages if needed
  };

  return (
    <div className="dashboard">
      <Container fluid className="h-100">
        <Row className="h-100 g-3">
          {/* Sidebar */}
          <Col lg={3} md={4} className="sidebar-col">
            <div className="sidebar-container">
              <AgentSidebar
                agents={agents}
                selectedAgent={selectedAgent}
                onAgentSelect={handleAgentSelect}
                onNewConversation={handleNewConversation}
                conversationId={conversationId}
              />
              <ConversationHistory
                conversations={conversations}
                onConversationSelect={(conv) => setConversationId(conv.id)}
              />
            </div>
          </Col>

          {/* Main Chat Area */}
          <Col lg={9} md={8} className="chat-col">
            <Card className="chat-card h-100">
              <Card.Header className="chat-header">
                <div className="chat-header-content">
                  <h4 className="mb-0">
                    {selectedAgent ? (
                      <>
                        <span className="agent-name">{selectedAgent.agent_id}</span>
                        <small className="agent-description ms-2">
                          {selectedAgent.description}
                        </small>
                      </>
                    ) : (
                      'Select an Agent'
                    )}
                  </h4>
                  {conversationId && (
                    <small className="conversation-id">
                      Conversation: {conversationId.substring(0, 8)}...
                    </small>
                  )}
                </div>
              </Card.Header>
              <Card.Body className="chat-body p-0">
                <ChatInterface
                  selectedAgent={selectedAgent}
                  conversationId={conversationId}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Dashboard;
