import React from 'react';
import { Container, Row, Col, Card, Badge, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRobot, 
  faComments, 
  faBrain, 
  faUsers, 
  faLightbulb,
  faQuestionCircle,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import './Documentation.css';

const Documentation = () => {
  return (
    <div className="documentation">
      <Container fluid>
        <Row className="mb-4">
          <Col>
            <div className="page-header">
              <h2>
                <FontAwesomeIcon icon={faQuestionCircle} className="me-3" />
                How to Use Nimbus AI
              </h2>
              <p className="lead">Your intelligent AI assistant powered by advanced multi-agent technology</p>
            </div>
          </Col>
        </Row>

        <Row className="g-4">
          {/* Getting Started */}
          <Col lg={6}>
            <Card className="h-100">
              <Card.Header>
                <h5 className="mb-0">
                  <FontAwesomeIcon icon={faLightbulb} className="me-2" />
                  Getting Started
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="step-list">
                  <div className="step-item">
                    <FontAwesomeIcon icon={faCheckCircle} className="step-icon" />
                    <div>
                      <strong>Start Chatting:</strong> Simply type your question or request in the chat interface
                    </div>
                  </div>
                  <div className="step-item">
                    <FontAwesomeIcon icon={faCheckCircle} className="step-icon" />
                    <div>
                      <strong>Get Intelligent Responses:</strong> Nimbus uses multiple AI agents working together to provide comprehensive answers
                    </div>
                  </div>
                  <div className="step-item">
                    <FontAwesomeIcon icon={faCheckCircle} className="step-icon" />
                    <div>
                      <strong>Continue the Conversation:</strong> Ask follow-up questions or explore new topics
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* What is Nimbus */}
          <Col lg={6}>
            <Card className="h-100">
              <Card.Header>
                <h5 className="mb-0">
                  <FontAwesomeIcon icon={faRobot} className="me-2" />
                  What is Nimbus AI?
                </h5>
              </Card.Header>
              <Card.Body>
                <p>
                  Nimbus is an advanced AI assistant that uses <strong>multi-agent technology</strong> to provide you with the best possible responses.
                </p>
                <div className="feature-list">
                  <div className="feature-item">
                    <Badge bg="primary" className="me-2">GPT-4</Badge>
                    Creative reasoning and comprehensive analysis
                  </div>
                  <div className="feature-item">
                    <Badge bg="success" className="me-2">Claude</Badge>
                    Analytical synthesis and thoughtful responses
                  </div>
                  <div className="feature-item">
                    <Badge bg="warning" className="me-2">Grok</Badge>
                    Fact-checking and accurate information
                  </div>
                </div>
                <p className="mt-3">
                  <small className="text-muted">
                    All three AI agents work together behind the scenes to give you the most helpful and accurate responses.
                  </small>
                </p>
              </Card.Body>
            </Card>
          </Col>

          {/* What You Can Ask */}
          <Col lg={8}>
            <Card>
              <Card.Header>
                <h5 className="mb-0">
                  <FontAwesomeIcon icon={faComments} className="me-2" />
                  What Can You Ask Nimbus?
                </h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <h6><FontAwesomeIcon icon={faBrain} className="me-2" />Creative Tasks</h6>
                    <ul className="task-list">
                      <li>Brainstorming ideas</li>
                      <li>Writing assistance</li>
                      <li>Creative problem solving</li>
                      <li>Content generation</li>
                    </ul>
                  </Col>
                  <Col md={6}>
                    <h6><FontAwesomeIcon icon={faUsers} className="me-2" />Analysis & Research</h6>
                    <ul className="task-list">
                      <li>Data analysis</li>
                      <li>Research questions</li>
                      <li>Fact verification</li>
                      <li>Comparative analysis</li>
                    </ul>
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col md={6}>
                    <h6><FontAwesomeIcon icon={faLightbulb} className="me-2" />General Help</h6>
                    <ul className="task-list">
                      <li>Answering questions</li>
                      <li>Explaining concepts</li>
                      <li>Providing recommendations</li>
                      <li>Planning assistance</li>
                    </ul>
                  </Col>
                  <Col md={6}>
                    <h6><FontAwesomeIcon icon={faCheckCircle} className="me-2" />Professional Tasks</h6>
                    <ul className="task-list">
                      <li>Business strategy</li>
                      <li>Technical questions</li>
                      <li>Process improvement</li>
                      <li>Decision support</li>
                    </ul>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          {/* Tips */}
          <Col lg={4}>
            <Card>
              <Card.Header>
                <h5 className="mb-0">
                  <FontAwesomeIcon icon={faLightbulb} className="me-2" />
                  Tips for Best Results
                </h5>
              </Card.Header>
              <Card.Body>
                <Alert variant="info" className="mb-3">
                  <small>
                    <strong>Be Specific:</strong> The more details you provide, the better Nimbus can help you.
                  </small>
                </Alert>
                <Alert variant="success" className="mb-3">
                  <small>
                    <strong>Ask Follow-ups:</strong> Don't hesitate to ask for clarification or more details.
                  </small>
                </Alert>
                <Alert variant="warning" className="mb-0">
                  <small>
                    <strong>Context Matters:</strong> Nimbus remembers your conversation, so you can build on previous questions.
                  </small>
                </Alert>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Configuration Section */}
        <Row className="mt-4">
          <Col>
            <Card>
              <Card.Header>
                <h5 className="mb-0">
                  <FontAwesomeIcon icon={faUsers} className="me-2" />
                  About Configuration
                </h5>
              </Card.Header>
              <Card.Body>
                <p>
                  The <strong>Configuration</strong> tab allows you to view and manage how Nimbus is set up. 
                  This is primarily for system administrators and advanced users.
                </p>
                <Alert variant="info">
                  <strong>Note:</strong> Nimbus is ready to use out of the box. You don't need to create or configure anything to start chatting!
                </Alert>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Documentation;
