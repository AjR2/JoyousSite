import React, { useState, useEffect } from 'react';
import { Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { healthAPI } from '../services/api';
import './ConnectionStatus.css';

const ConnectionStatus = () => {
  const [status, setStatus] = useState('checking');
  const [lastCheck, setLastCheck] = useState(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const health = await healthAPI.checkHealth();
        setStatus(health.status === 'ok' ? 'connected' : 'error');
        setLastCheck(new Date());
      } catch (error) {
        setStatus('disconnected');
        setLastCheck(new Date());
      }
    };

    // Initial check
    checkConnection();

    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          variant: 'success',
          icon: faCircle,
          text: 'Connected',
          className: 'connected'
        };
      case 'disconnected':
        return {
          variant: 'danger',
          icon: faExclamationTriangle,
          text: 'Disconnected',
          className: 'disconnected'
        };
      case 'error':
        return {
          variant: 'warning',
          icon: faExclamationTriangle,
          text: 'Error',
          className: 'error'
        };
      default:
        return {
          variant: 'secondary',
          icon: faCircle,
          text: 'Checking...',
          className: 'checking'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="connection-status">
      <Badge bg={config.variant} className={`status-badge ${config.className}`}>
        <FontAwesomeIcon icon={config.icon} className="status-icon" />
        {config.text}
      </Badge>
      {lastCheck && (
        <small className="last-check">
          Last checked: {lastCheck.toLocaleTimeString()}
        </small>
      )}
    </div>
  );
};

export default ConnectionStatus;
