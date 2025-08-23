import React, { useState, useEffect } from 'react';
import './CountdownTimer.css';

const CountdownTimer = ({ targetDate, className = '' }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const target = new Date(targetDate);
      const difference = target - now;

      console.log('Countdown Debug:', { now, target, difference, targetDate });

      if (difference > 0) {
        const newTimeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
        console.log('Time left:', newTimeLeft);
        setTimeLeft(newTimeLeft);
      } else {
        console.log('Target date has passed');
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const formatNumber = (num) => {
    return num.toString().padStart(2, '0');
  };

  // Check if all values are zero (might indicate an issue)
  const allZero = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

  return (
    <div className={`countdown-timer ${className}`} role="timer" aria-live="polite">
      <div className="countdown-label">
        <span className="countdown-emoji">🕒</span>
        <span className="countdown-text">Launches In:</span>
      </div>
      <div className="countdown-display">
        <div className="countdown-unit">
          <span className="countdown-number" aria-label={`${timeLeft.days} days`}>
            {formatNumber(timeLeft.days)}
          </span>
          <span className="countdown-unit-label">DAYS</span>
        </div>
        <span className="countdown-separator">:</span>
        <div className="countdown-unit">
          <span className="countdown-number" aria-label={`${timeLeft.hours} hours`}>
            {formatNumber(timeLeft.hours)}
          </span>
          <span className="countdown-unit-label">HOURS</span>
        </div>
        <span className="countdown-separator">:</span>
        <div className="countdown-unit">
          <span className="countdown-number" aria-label={`${timeLeft.minutes} minutes`}>
            {formatNumber(timeLeft.minutes)}
          </span>
          <span className="countdown-unit-label">MINUTES</span>
        </div>
        <span className="countdown-separator">:</span>
        <div className="countdown-unit">
          <span className="countdown-number" aria-label={`${timeLeft.seconds} seconds`}>
            {formatNumber(timeLeft.seconds)}
          </span>
          <span className="countdown-unit-label">SECONDS</span>
        </div>
      </div>
      {allZero && (
        <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#6c757d' }}>
          Target: {targetDate} | Current: {new Date().toISOString()}
        </div>
      )}
    </div>
  );
};

export default CountdownTimer;
