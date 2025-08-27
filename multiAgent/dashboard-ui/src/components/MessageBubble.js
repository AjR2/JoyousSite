import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faRobot, faExclamationTriangle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import './MessageBubble.css';

const MessageBubble = ({ message }) => {
  const { role, content, timestamp, agent, isError, trace } = message;

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getIcon = () => {
    switch (role) {
      case 'user':
        return faUser;
      case 'agent':
        return faRobot;
      case 'system':
        return isError ? faExclamationTriangle : faInfoCircle;
      default:
        return faInfoCircle;
    }
  };

  const getBubbleClass = () => {
    let baseClass = 'message-bubble';
    
    switch (role) {
      case 'user':
        return `${baseClass} user-message`;
      case 'agent':
        return `${baseClass} agent-message`;
      case 'system':
        return `${baseClass} system-message ${isError ? 'error' : ''}`;
      default:
        return baseClass;
    }
  };

  const getDisplayName = () => {
    switch (role) {
      case 'user':
        return 'You';
      case 'agent':
        return agent ? agent.agent_id : 'AI Assistant';
      case 'system':
        return 'System';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className={getBubbleClass()}>
      <div className="message-header">
        <div className="message-sender">
          <FontAwesomeIcon icon={getIcon()} className="sender-icon" />
          <span className="sender-name">{getDisplayName()}</span>
        </div>
        <span className="message-time">{formatTime(timestamp)}</span>
      </div>

      <div className="message-bubble-content">
        <div className="message-content">
          {content.split('\n').map((line, index) => (
            <React.Fragment key={index}>
              {line}
              {index < content.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}
        </div>

        {trace && trace.length > 0 && (
          <div className="message-trace">
            <details>
              <summary>View processing trace</summary>
              <div className="trace-content">
                {trace.map((step, index) => (
                  <div key={index} className="trace-step">
                    <strong>{step.agent_id}:</strong> {step.output?.message || 'Processing...'}
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
