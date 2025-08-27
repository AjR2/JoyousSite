import React, { useState, useRef, useEffect } from 'react';
import { Form, Button, InputGroup, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faRobot, faUser } from '@fortawesome/free-solid-svg-icons';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { chatAPI } from '../services/api';
import './ChatInterface.css';

const ChatInterface = ({ selectedAgent, conversationId }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add welcome message when agent is selected
    if (selectedAgent && messages.length === 0) {
      const welcomeMessage = {
        id: Date.now(),
        role: 'agent',
        content: `Hi there! I'm Nimbus, your friendly workplace AI assistant. I'm here to help you with questions, brainstorming, problem-solving, and anything else you need support with.\n\nWhether you're looking for information, need help with a project, or just want to bounce ideas around, I'm ready to assist. What can I help you with today?`,
        timestamp: new Date(),
        agent: selectedAgent
      };
      setMessages([welcomeMessage]);
    }
  }, [selectedAgent]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || !selectedAgent || !conversationId) {
      return;
    }

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Use the API service to send message
      const data = await chatAPI.sendMessage({
        message: inputMessage.trim(),
        agent_id: selectedAgent.agent_id,
        conversation_id: conversationId
      });

      setIsTyping(false);

      const agentMessage = {
        id: Date.now() + 1,
        role: 'agent',
        content: data.message || data.final_response || data.request_info || 'I received your message, but I\'m having trouble processing it right now.',
        timestamp: new Date(),
        agent: selectedAgent,
        trace: data.trace,
        mock: data.mock
      };

      setMessages(prev => [...prev, agentMessage]);

      // Handle escalation or special responses
      if (data.escalation_flag) {
        const systemMessage = {
          id: Date.now() + 2,
          role: 'system',
          content: '⚠️ This conversation has been escalated to a human specialist.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, systemMessage]);
      }

      // Handle next steps
      if (data.next_steps && data.next_steps.length > 0) {
        const nextStepsMessage = {
          id: Date.now() + 3,
          role: 'agent',
          content: `Here are some suggested next steps:\n\n${data.next_steps.map(step => `• ${step}`).join('\n')}`,
          timestamp: new Date(),
          agent: selectedAgent
        };
        setMessages(prev => [...prev, nextStepsMessage]);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);

      const errorMessage = {
        id: Date.now() + 1,
        role: 'system',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again.',
        timestamp: new Date(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="chat-interface">
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <FontAwesomeIcon icon={faRobot} className="empty-icon" />
            <h5>Start a conversation</h5>
            <p>Select an agent and send a message to begin</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
            />
          ))
        )}
        
        {isTyping && <TypingIndicator agent={selectedAgent} />}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Form.Control
              ref={inputRef}
              as="textarea"
              rows={1}
              placeholder={selectedAgent ? `Message Nimbus...` : 'Select an agent first...'}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={!selectedAgent || isLoading}
              className="message-input"
            />
            <Button
              type="submit"
              variant="primary"
              disabled={!inputMessage.trim() || !selectedAgent || isLoading}
              className="send-button"
            >
              {isLoading ? (
                <Spinner size="sm" animation="border" />
              ) : (
                <FontAwesomeIcon icon={faPaperPlane} />
              )}
            </Button>
          </InputGroup>
        </Form>
      </div>
    </div>
  );
};

export default ChatInterface;
