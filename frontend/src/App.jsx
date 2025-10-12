import React, { useState } from 'react';
import SessionList from './components/SessionList';
import ChatInterface from './components/ChatInterface';


const App = () => {
  // Holds the currently active session id or null if showing session list
  const [activeSessionId, setActiveSessionId] = useState(null);

  // Holds the current chat messages for the active session
  const [messages, setMessages] = useState([]);

  // Handler to go back to session list from chat view
  const handleBack = () => setActiveSessionId(null);

  return (
    <div className="app-container" role="main" aria-label="AI Customer Support Application">
      <header className="app-header" role="banner">
        <h1 tabIndex={0}>AI Customer Support Bot</h1>
      </header>

      <main className="app-main">
        {!activeSessionId ? (
          <SessionList onSelect={setActiveSessionId} setMessages={setMessages} />
        ) : (
          <ChatInterface
            sessionId={activeSessionId}
            onBack={handleBack}
            setSessionId={setActiveSessionId}
            messages={messages}
            setMessages={setMessages}
          />
        )}
      </main>

      <footer className="app-footer" role="contentinfo">
        <small>Submitted as an assignment to unthinkable</small>
      </footer>

      {/* Global CSS can be imported in index.js */}
      <style>
        {`
          .app-container {
            display: flex;
            flex-direction: column;
            height: 100vh;
            max-width: 600px;
            margin: 0 auto;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
              Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            color: #333;
            
          }
          .app-header,
          .app-footer {
            padding: 1rem;
            background-color: #91c353;
            color: white;
            text-align: center;
            margin:20px;
            border-radius:10px;
          }
          .app-main {
            flex-grow: 1;
            overflow-y: auto;
            padding: 1rem;
            
          }
          h1 {
            margin: 0;
            font-size: 1.75rem;
          }
          small {
            font-size: 0.875rem;
          }
        `}
      </style>
    </div>
  );
};

export default App;
