import React from 'react';

function LoopCounter({ closed, total }) {
  return (
    <div className="loop-counter" aria-hidden="true">
      {closed} / {total} LOOPS CLOSED
    </div>
  );
}

export default LoopCounter;
