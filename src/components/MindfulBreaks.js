import React from 'react';
import MetaTags from './MetaTags';
import ErrorBoundary from './ErrorBoundary';
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
  { id: 1, icon: faPersonWalking, text: 'Take a short walk and focus on your breath.' },
  { id: 2, icon: faWind, text: 'Spend two minutes practicing deep belly breathing.' },
  { id: 3, icon: faUserCheck, text: 'Do a quick body scan, relaxing any tension you notice.' },
  { id: 4, icon: faChild, text: 'Stretch your arms and legs slowly, noticing each movement.' },
  { id: 5, icon: faEarListen, text: 'Pause and note five things you can hear around you.' },
];

const MindfulBreaks = () => (
  <>
    <MetaTags
      title="Mindful Breaks | Akeyreu"
      description="Simple mindfulness exercises you can take throughout the day to improve your mental wellness and mindfulness practice."
      keywords="mindfulness, break, wellness, meditation, mental health, stress relief, mindful exercises"
      canonicalUrl="https://www.akeyreu.com/mindful-breaks/"
    />

    <ErrorBoundary>
      <main className="mindful-breaks-container" id="main-content" role="main">
        <header className="mindful-breaks-header">
          <h1 className="mindful-breaks-title">Mindful Break Ideas</h1>
          <p className="mindful-breaks-description">
            Simple mindfulness exercises you can practice throughout your day to enhance your mental wellness and reduce stress.
          </p>
        </header>

        <section className="break-items-section" aria-labelledby="mindful-breaks-title">
          <h2 className="sr-only">List of mindful break exercises</h2>
          <div className="break-items">
            {breaks.map((breakItem) => (
              <article className="mindful-break-item" key={breakItem.id} role="listitem">
                <div className="break-icon">
                  <FontAwesomeIcon icon={breakItem.icon} aria-hidden="true" />
                </div>
                <p className="break-text">{breakItem.text}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </ErrorBoundary>
  </>
);

export default MindfulBreaks;