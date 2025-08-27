import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Table, Badge, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faEdit,
  faTrash,
  faRobot,
  faCircle,
  faUserMd,
  faBrain,
  faStethoscope
} from '@fortawesome/free-solid-svg-icons';
import { agentAPI } from '../services/api';
import './AgentManagement.css';

const AgentManagement = () => {
  const [agents, setAgents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [formData, setFormData] = useState({
    agent_id: '',
    description: '',
    inputs: '',
    outputs: '',
    escalates_to_human: false
  });
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const agentsData = await agentAPI.getAgents();
      setAgents(agentsData);
    } catch (error) {
      console.error('Error fetching agents:', error);
      showAlert('Error fetching agents', 'danger');
    }
  };

  const showAlert = (message, variant = 'info') => {
    setAlert({ message, variant });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleShowModal = (agent = null) => {
    if (agent) {
      setEditingAgent(agent);
      setFormData({
        agent_id: agent.agent_id,
        description: agent.description,
        inputs: agent.inputs ? agent.inputs.join(', ') : '',
        outputs: agent.outputs ? agent.outputs.join(', ') : '',
        escalates_to_human: agent.escalates_to_human || false
      });
    } else {
      setEditingAgent(null);
      setFormData({
        agent_id: '',
        description: '',
        inputs: 'user_message',
        outputs: 'response',
        escalates_to_human: false
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAgent(null);
    setFormData({
      agent_id: '',
      description: '',
      inputs: '',
      outputs: '',
      escalates_to_human: false
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      agent_id: formData.agent_id,
      description: formData.description,
      inputs: formData.inputs.split(',').map(i => i.trim()).filter(i => i),
      outputs: formData.outputs.split(',').map(o => o.trim()).filter(o => o),
      escalates_to_human: formData.escalates_to_human
    };

    try {
      let result;
      if (editingAgent) {
        // Update existing agent
        result = await agentAPI.updateAgent(editingAgent.agent_id, payload);
      } else {
        // Create new agent
        result = await agentAPI.createAgent(payload);
      }

      if (result.success) {
        showAlert(`Agent '${payload.agent_id}' ${editingAgent ? 'updated' : 'created'} successfully!`, 'success');
        fetchAgents();
        handleCloseModal();
      } else {
        showAlert(result.error || 'Failed to save agent', 'danger');
      }
    } catch (error) {
      console.error('Error saving agent:', error);
      showAlert('Error saving agent', 'danger');
    }
  };

  const getAgentIcon = (agentId) => {
    if (agentId.toLowerCase().includes('doctor') || agentId.toLowerCase().includes('physician')) {
      return faUserMd;
    } else if (agentId.toLowerCase().includes('therapist') || agentId.toLowerCase().includes('mental')) {
      return faBrain;
    } else if (agentId.toLowerCase().includes('nurse') || agentId.toLowerCase().includes('triage')) {
      return faStethoscope;
    }
    return faRobot;
  };

  const getAgentStatus = () => {
    return Math.random() > 0.3 ? 'online' : 'offline';
  };

  const handleDeleteAgent = async (agentId) => {
    if (window.confirm(`Are you sure you want to delete agent '${agentId}'?`)) {
      try {
        const result = await agentAPI.deleteAgent(agentId);
        if (result.success) {
          showAlert(`Agent '${agentId}' deleted successfully!`, 'success');
          fetchAgents();
        } else {
          showAlert(result.error || 'Failed to delete agent', 'danger');
        }
      } catch (error) {
        console.error('Error deleting agent:', error);
        showAlert('Error deleting agent', 'danger');
      }
    }
  };

  return (
    <div className="agent-management">
      <Container fluid>
        {alert && (
          <Alert variant={alert.variant} dismissible onClose={() => setAlert(null)}>
            {alert.message}
          </Alert>
        )}

        <Row className="mb-4">
          <Col>
            <div className="page-header">
              <h2>
                <FontAwesomeIcon icon={faRobot} className="me-3" />
                Nimbus Configuration
              </h2>
              <Button variant="primary" onClick={() => handleShowModal()}>
                <FontAwesomeIcon icon={faPlus} className="me-2" />
                Add Configuration
              </Button>
            </div>
          </Col>
        </Row>

        <Row>
          <Col>
            <Card className="agents-table-card">
              <Card.Header>
                <h5 className="mb-0">Nimbus Configurations ({agents.length})</h5>
              </Card.Header>
              <Card.Body>
                {agents.length === 0 ? (
                  <div className="no-agents-message">
                    <FontAwesomeIcon icon={faRobot} className="no-agents-icon" />
                    <h5>No configurations found</h5>
                    <p>Add your first configuration to customize how Nimbus responds to different types of queries.</p>
                    <Button variant="primary" onClick={() => handleShowModal()}>
                      <FontAwesomeIcon icon={faPlus} className="me-2" />
                      Add Configuration
                    </Button>
                  </div>
                ) : (
                  <Table responsive hover className="agents-table">
                    <thead>
                      <tr>
                        <th>Configuration</th>
                        <th>Description</th>
                        <th>Capabilities</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agents.map((agent) => {
                        const status = getAgentStatus();
                        return (
                          <tr key={agent.agent_id}>
                            <td>
                              <div className="agent-info">
                                <FontAwesomeIcon 
                                  icon={getAgentIcon(agent.agent_id)} 
                                  className="agent-table-icon" 
                                />
                                <div>
                                  <div className="agent-name">{agent.agent_id}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="agent-description">
                                {agent.description}
                              </div>
                            </td>
                            <td>
                              <div className="capabilities">
                                {agent.inputs && agent.inputs.map((input, index) => (
                                  <Badge key={index} bg="secondary" className="capability-badge">
                                    {input}
                                  </Badge>
                                ))}
                                {agent.outputs && agent.outputs.map((output, index) => (
                                  <Badge key={index} bg="primary" className="capability-badge">
                                    {output}
                                  </Badge>
                                ))}
                                {agent.escalates_to_human && (
                                  <Badge bg="warning" className="capability-badge">
                                    Escalates
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="status-cell">
                                <FontAwesomeIcon 
                                  icon={faCircle} 
                                  className={`status-indicator ${status}`} 
                                />
                                <span className="status-text">{status}</span>
                              </div>
                            </td>
                            <td>
                              <div className="action-buttons">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => handleShowModal(agent)}
                                  className="me-2"
                                >
                                  <FontAwesomeIcon icon={faEdit} />
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDeleteAgent(agent.agent_id)}
                                >
                                  <FontAwesomeIcon icon={faTrash} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Create/Edit Agent Modal */}
        <Modal show={showModal} onHide={handleCloseModal} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              <FontAwesomeIcon icon={faRobot} className="me-2" />
              {editingAgent ? 'Edit Configuration' : 'Add New Configuration'}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Configuration ID *</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.agent_id}
                      onChange={(e) => setFormData({...formData, agent_id: e.target.value})}
                      required
                      disabled={editingAgent !== null}
                      placeholder="e.g., healthcare_triage"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Escalates to Human</Form.Label>
                    <Form.Check
                      type="checkbox"
                      checked={formData.escalates_to_human}
                      onChange={(e) => setFormData({...formData, escalates_to_human: e.target.checked})}
                      label="This agent can escalate to human operators"
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label>Description *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                  placeholder="Describe what this agent does..."
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Inputs (comma-separated)</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.inputs}
                      onChange={(e) => setFormData({...formData, inputs: e.target.value})}
                      placeholder="user_message, session_data"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Outputs (comma-separated)</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.outputs}
                      onChange={(e) => setFormData({...formData, outputs: e.target.value})}
                      placeholder="response, next_action"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editingAgent ? 'Update Configuration' : 'Add Configuration'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Container>
    </div>
  );
};

export default AgentManagement;
