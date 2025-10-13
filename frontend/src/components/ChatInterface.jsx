import React, { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import NextActions from './NextActions';
import Loader from './Loader';
import { sendQueryToBackend } from '../api';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';


const ChatInterface = ({ sessionId, setSessionId, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const [nextActions, setNextActions] = useState([]);

  const messagesEndRef = useRef(null);

  // Load conversation history whenever sessionId changes
  useEffect(() => {
    if (!sessionId) {
      setMessages([]);
      return;
    }

    async function fetchHistory() {
      try {
        const res = await fetch(`${API_BASE_URL}/session/${sessionId}/`);
        if (!res.ok) throw new Error(`Failed to fetch session: ${res.statusText}`);
        const data = await res.json();

        // Map query_history (array of message objects) alternating user/bot messages
        const msgs = data.query_history.map((msg, idx) => ({
          sender: idx % 2 === 0 ? 'user' : 'bot',
          text: typeof msg === 'string' ? msg : msg.text, // Safely access text
        }));

        setMessages(msgs);
      } catch (err) {
        console.error('Failed to load history:', err);
        setMessages([{ sender: 'bot', text: 'Failed to load conversation history.' }]);
      }
    }

    fetchHistory();
  }, [sessionId]);

  // Scroll chat to bottom on messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending user message
  const handleSend = async () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    if (!sessionId) {
      alert('Please select or start a session first.');
      return;
    }

    // Add user message immediately to chat UI
    setMessages(prev => [...prev, { sender: 'user', text: trimmed }]);
    setInputText('');
    setLoading(true);
    setNextActions([]);

    try {
      const response = await sendQueryToBackend(trimmed, sessionId);

      // If backend returns a new session id, update it
      if (response.session_id && response.session_id !== sessionId) {
        setSessionId(response.session_id);
        localStorage.setItem('session_id', response.session_id);
      }

      // Append bot response message if present
      if (response.response) {
        setMessages(prev => [...prev, { sender: 'bot', text: response.response }]);
      }

      // Show next action suggestions if any
      if (response.suggestions && response.suggestions.length) {
        setNextActions(response.suggestions);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: 'Sorry, something went wrong. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Support Enter key submission without shift
  const handleInputKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Styles object for modern Unthinkable theme
  const styles = {
    container: {
    border: '1px solid #e1e4e8',
    borderRadius: 12,
    width: 550,             
    height: 1000 ,        
    marginLeft:8,
    marginRight:8,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fff',
    boxShadow: '0 12px 32px rgba(11, 67, 110, 0.12)', 
    fontFamily: "'Roboto', 'Helvetica Neue', sans-serif",
    color: '#0b436e',
    overflow: 'hidden',
  },
    backButton: {
      margin: '16px 20px 0',
      alignSelf: 'flex-start',
      padding: '6px 14px',
      fontSize: 14,
      fontWeight: 600,
      color: '#0b436e',
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      marginBottom:8,
      
    },
    messagesContainer: {
      flexGrow: 1,
      overflowY: 'auto',
      padding: '20px 24px',
      borderTop: '1px solid #e1e4e8',
      borderBottom: '1px solid #e1e4e8',
      display: 'flex',
      flexDirection: 'column',
    },
    inputContainer: {
      display: 'flex',
      padding: '16px 20px',
      backgroundColor: '#f9fafb',
      borderTop: '1px solid #e1e4e8',
    },
    textarea: {
      flex: 1,
      resize: 'none',
      padding: '12px 16px',
      fontSize: 15,
      borderRadius: 8,
      border: '1px solid #ccc',
      fontFamily: "'Roboto', 'Helvetica Neue', sans-serif",
      color: '#0b436e',
      outline: 'none',
      transition: 'border-color 0.3s ease',
    },
    textareaFocus: {
      borderColor: '#91c353',
      boxShadow: '0 0 5px rgba(145, 195, 83, 0.6)',
    },
    sendButton: {
      marginLeft: 16,
      padding: '12px 22px',
      backgroundColor: '#91c353',
      border: 'none',
      borderRadius: 8,
      color: 'white',
      fontWeight: '600',
      fontSize: 15,
      cursor: 'pointer',
      boxShadow: '0 6px 16px rgba(145, 195, 83, 0.4)',
      transition: 'background-color 0.3s ease',
      disabled: {
        backgroundColor: '#a6d484',
        cursor: 'not-allowed',
        boxShadow: 'none',
      }
    },
  };

  // Using state to track focus class for textarea
  const [isTextareaFocused, setTextareaFocused] = useState(false);

  return (
    <div style={styles.container} role="main" aria-label="Chat interface">
      {onBack && (
        <button onClick={onBack} style={styles.backButton} aria-label="Back to sessions">
           Back to Sessions
        </button>
      )}

      <div
        className="chat-messages"
        style={styles.messagesContainer}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.map((msg, idx) => (
          <MessageBubble key={idx} sender={msg.sender} text={msg.text} />
        ))}
        {loading && <Loader />}
        <div ref={messagesEndRef} />
      </div>

      {nextActions.length > 0 && (
        <NextActions suggestions={nextActions} onSelect={setInputText} />
      )}

      <div className="input-container" style={styles.inputContainer}>
        <textarea
          placeholder="Type your message..."
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={handleInputKeyDown}
          rows={2}
          aria-label="Message input"
          style={{
            ...styles.textarea,
            ...(isTextareaFocused ? styles.textareaFocus : {})
          }}
          onFocus={() => setTextareaFocused(true)}
          onBlur={() => setTextareaFocused(false)}
        />
        <button
          onClick={handleSend}
          disabled={loading || !inputText.trim()}
          style={{
            ...styles.sendButton,
            ...(loading || !inputText.trim() ? styles.sendButton.disabled : {})
          }}
          aria-label="Send message"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
