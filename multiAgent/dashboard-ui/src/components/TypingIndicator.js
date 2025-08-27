import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot } from '@fortawesome/free-solid-svg-icons';
import './TypingIndicator.css';

const TypingIndicator = ({ agent }) => {
  return (
    <div className="typing-indicator">
      <div className="typing-header">
        <div className="typing-sender">
          <FontAwesomeIcon icon={faRobot} className="typing-icon" />
          <span className="typing-name">
            {agent ? agent.agent_id : 'AI Assistant'} is typing...
          </span>
        </div>
      </div>
      
      <div className="typing-bubble">
        <div className="typing-dots">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
