import React from 'react';

const Loader = () => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      tabIndex={-1}
      style={{
        overflow: 'visible',    
        whiteSpace: 'nowrap',
        width: '100%',
        margin: 0,
        padding: 0,
        fontFamily: "'Orbitron', 'Courier New', Courier, monospace",
        fontWeight: '700',
        color: '#a4f9a4', 
        fontSize: '1.5rem',  
        position: 'relative',
        backgroundColor: 'transparent', 
        top: 0,
        left: 0,
      }}
    >
      
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700&display=swap');

          .loader-text {
            display: inline-block;
            padding-left: 100%;
            animation: slide-left 8s linear infinite;
            will-change: transform;
            margin-top: 0;    /* Remove any vertical margin */
            vertical-align: top; /* Align text at top */
          }

          @keyframes slide-left {
            0% {
              transform: translateX(0%);
            }
            100% {
              transform: translateX(-100%);
            }
          }
        `}
      </style>

      <div className="loader-text" aria-hidden="true" style={{ lineHeight: 1 }}>
        Your response is getting baked in our oven. &nbsp;&nbsp;&nbsp; Your response is getting baked in our oven.
      </div>
    </div>
  );
};

export default Loader;
