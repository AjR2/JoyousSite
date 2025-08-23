import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ targetDate, className = '' }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      try {
        const now = new Date();
        const target = new Date(targetDate);
        const difference = target - now;

        if (difference > 0) {
          setTimeLeft({
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60)
          });
        } else {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        }
      } catch (error) {
        console.error('Countdown timer error:', error);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const formatNumber = (num) => {
    return String(num).padStart(2, '0');
  };

  const countdownStyle = {
    textAlign: 'center',
    margin: '2rem 0',
    padding: '1.5rem',
    background: 'linear-gradient(135deg, rgba(29, 161, 242, 0.1), rgba(241, 196, 15, 0.1))',
    borderRadius: '16px',
    border: '2px solid rgba(29, 161, 242, 0.2)'
  };

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1DA1F2',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const displayStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    flexWrap: 'wrap'
  };

  const unitStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '60px'
  };

  const numberStyle = {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #1DA1F2, #F1C40F)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    lineHeight: '1',
    marginBottom: '0.25rem'
  };

  const labelUnitStyle = {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#6c757d',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  };

  const separatorStyle = {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#1DA1F2',
    margin: '0 0.5rem',
    lineHeight: '1',
    alignSelf: 'flex-start',
    marginTop: '0.25rem'
  };

  return (
    <div className={className} style={countdownStyle} role="timer" aria-live="polite">
      <div style={labelStyle}>
        <span style={{ fontSize: '1.5rem' }}>🕒</span>
        <span>Launches In:</span>
      </div>
      <div style={displayStyle}>
        <div style={unitStyle}>
          <span style={numberStyle} aria-label={`${timeLeft.days} days`}>
            {formatNumber(timeLeft.days)}
          </span>
          <span style={labelUnitStyle}>DAYS</span>
        </div>
        <span style={separatorStyle}>:</span>
        <div style={unitStyle}>
          <span style={numberStyle} aria-label={`${timeLeft.hours} hours`}>
            {formatNumber(timeLeft.hours)}
          </span>
          <span style={labelUnitStyle}>HOURS</span>
        </div>
        <span style={separatorStyle}>:</span>
        <div style={unitStyle}>
          <span style={numberStyle} aria-label={`${timeLeft.minutes} minutes`}>
            {formatNumber(timeLeft.minutes)}
          </span>
          <span style={labelUnitStyle}>MINUTES</span>
        </div>
        <span style={separatorStyle}>:</span>
        <div style={unitStyle}>
          <span style={numberStyle} aria-label={`${timeLeft.seconds} seconds`}>
            {formatNumber(timeLeft.seconds)}
          </span>
          <span style={labelUnitStyle}>SECONDS</span>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
