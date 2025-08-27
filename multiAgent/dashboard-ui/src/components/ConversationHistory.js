import React from 'react';
import { Card, ListGroup, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory, faComments, faClock } from '@fortawesome/free-solid-svg-icons';
import './ConversationHistory.css';

const ConversationHistory = ({ conversations, onConversationSelect }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const truncateText = (text, maxLength = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Card className="conversation-history">
      <Card.Header className="history-header">
        <h6 className="mb-0">
          <FontAwesomeIcon icon={faHistory} className="me-2" />
          Recent Conversations
        </h6>
      </Card.Header>

      <Card.Body className="history-body">
        {conversations.length === 0 ? (
          <div className="no-conversations">
            <FontAwesomeIcon icon={faComments} className="no-conversations-icon" />
            <p>No recent conversations</p>
          </div>
        ) : (
          <ListGroup variant="flush">
            {conversations.map((conversation) => (
              <ListGroup.Item
                key={conversation.id}
                className="conversation-item"
                onClick={() => onConversationSelect(conversation)}
                action
              >
                <div className="conversation-content">
                  <div className="conversation-header">
                    <span className="conversation-title">
                      {conversation.title || `Conversation ${conversation.id.substring(0, 8)}`}
                    </span>
                    <Badge bg="secondary" className="message-count">
                      {conversation.messageCount || 0}
                    </Badge>
                  </div>
                  
                  {conversation.lastMessage && (
                    <div className="last-message">
                      {truncateText(conversation.lastMessage)}
                    </div>
                  )}
                  
                  <div className="conversation-meta">
                    <span className="conversation-agent">
                      {conversation.agentId || 'Unknown Agent'}
                    </span>
                    <span className="conversation-time">
                      <FontAwesomeIcon icon={faClock} className="me-1" />
                      {formatTime(conversation.timestamp)}
                    </span>
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card.Body>
    </Card>
  );
};

export default ConversationHistory;
