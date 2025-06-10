import React from 'react';
import MetaTags from './MetaTags';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPersonWalking,
  faWind,
  faUserCheck,
  faChild,
  faEarListen,
} from '@fortawesome/free-solid-svg-icons';
import './MindfulBreaks.css';

const breaks = [
  { icon: faPersonWalking, text: 'Take a short walk and focus on your breath.' },
  { icon: faWind, text: 'Spend two minutes practicing deep belly breathing.' },
  { icon: faUserCheck, text: 'Do a quick body scan, relaxing any tension you notice.' },
  { icon: faChild, text: 'Stretch your arms and legs slowly, noticing each movement.' },
  { icon: faEarListen, text: 'Pause and note five things you can hear around you.' },
];

const MindfulBreaks = () => (
  <>
    <MetaTags
      title="Mindful Breaks | Akeyreu"
      description="Simple mindfulness exercises you can take throughout the day."
      keywords="mindfulness, break, wellness"
      canonicalUrl="https://www.akeyreu.com/mindful-breaks/"
    />
    <div className="mindful-card">
      <h2>Mindful Break Ideas</h2>
      <div className="break-items">
        {breaks.map((b, idx) => (
          <div className="mindful-break-item" key={idx}>
            <FontAwesomeIcon icon={b.icon} />
            <p>{b.text}</p>
          </div>
        ))}
      </div>
    </div>
  </>
);

export default MindfulBreaks;
