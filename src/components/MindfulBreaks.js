import React from 'react';
import MetaTags from './MetaTags';
import './MindfulBreaks.css';

const MindfulBreaks = () => (
  <>
    <MetaTags
      title="Mindful Breaks | Akeyreu"
      description="Simple mindfulness exercises you can take throughout the day."
      keywords="mindfulness, break, wellness"
      canonicalUrl="https://www.akeyreu.com/mindful-breaks/"
    />
    <div className="mindful-container">
      <h2>Mindful Break Ideas</h2>
      <ul>
        <li>Take a short walk and focus on your breath.</li>
        <li>Spend two minutes practicing deep belly breathing.</li>
        <li>Do a quick body scan, relaxing any tension you notice.</li>
        <li>Stretch your arms and legs slowly, noticing each movement.</li>
        <li>Pause and note five things you can hear around you.</li>
      </ul>
    </div>
  </>
);

export default MindfulBreaks;
