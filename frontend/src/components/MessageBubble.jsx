import React from 'react';
import PropTypes from 'prop-types';


const MessageBubble = ({ sender, text }) => {
  const isUser = sender === 'user';

  // Styles based on sender type to match Unthinkable's theme colors and modern look
  const styles = {
    container: {
      maxWidth: '75%',
      marginBottom: 12,
      padding: '12px 18px',
      borderRadius: 20,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      fontFamily: "'Roboto', 'Helvetica Neue', sans-serif",
      fontSize: 15,
      lineHeight: 1.4,
      color: isUser ? '#fff' : '#0b436e', 
      backgroundColor: isUser ? '#91c353' : '#f1f3f5', 
      alignSelf: isUser ? 'flex-end' : 'flex-start',
      textAlign: isUser ? 'right' : 'left',
      wordBreak: 'break-word',

      transition: 'background-color 0.3s ease, color 0.3s ease',
    }
  };

  return (
    <div
      style={styles.container}
      role="article"
      aria-label={isUser ? "User message" : "Bot message"}
    >
      <p style={{ margin: 0 }}>{text}</p>  {/* safe: text is string passed from ChatInterface */}
    </div>
  );
};

MessageBubble.propTypes = {
  sender: PropTypes.oneOf(['user', 'bot']).isRequired,
  text: PropTypes.string.isRequired,
};

export default MessageBubble;
