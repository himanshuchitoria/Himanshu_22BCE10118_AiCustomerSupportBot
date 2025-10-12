import React, { useState } from 'react';
import PropTypes from 'prop-types';


const NextActions = ({ suggestions, onSelect }) => {
  const [expanded, setExpanded] = useState(false);

  // Toggle expanded/collapsed state
  const toggleExpanded = () => setExpanded(!expanded);

  // Handle clicking a suggestion: calls onSelect with full suggestion text
  const handleClick = (actionText) => {
    if (onSelect && typeof onSelect === 'function') {
      onSelect(actionText);
    }
  };

  // Parse text for **bold** parts and render appropriately
  const renderFormattedText = (text) => {
    // Split by ** to identify bold segments
    const parts = text.split(/\*\*/);
    return parts.map((part, i) =>
      i % 2 === 1 ? (
        <strong key={i} style={{ color: '#0b436e' }}>{part}</strong> // bold with brand color
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  // If no suggestions provided, render nothing
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <section
      aria-label="Suggested next actions"
      role="region"
      style={{
        marginTop: 8,
        marginBottom:8,
        marginRight:30,
        padding: 10,
        borderTop: '1px solid #e1e4e8',
        backgroundColor: '#f9fafb',
        borderRadius: 6,
        fontFamily: "'Roboto', 'Helvetica Neue', sans-serif",
        color: '#0b436e',
        maxWidth: 700,
        marginLeft: 'auto',
        marginRight: 'auto',
        userSelect: 'none',
      }}
    >
      {/* Expand/Collapse toggle button */}
      <button
        onClick={toggleExpanded}
        aria-expanded={expanded}
        aria-controls="next-actions-list"
        style={{
          cursor: 'pointer',
          backgroundColor: 'transparent',
          border: 'none',
          color: '#91c353',
          fontSize: 16,
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {expanded ? 'Suggested actions ▲' : 'Suggested actions ▼'}
      </button>

      {/* Render the suggestions list only if expanded */}
      {expanded && (
        <div
          id="next-actions-list"
          role="list"
          style={{
            marginTop: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          {suggestions.map((action, idx) => (
            <button
              key={idx}
              role="listitem"
              tabIndex={0}
              aria-label={`Next action: ${action}`}
              onClick={() => handleClick(action)}
              style={{
                cursor: 'pointer',
                padding: '10px 14px',
                border: '1.5px solid #91c353',
                borderRadius: 6,
                backgroundColor: '#fff',
                color: '#0b436e',
                textAlign: 'left',
                fontSize: 15,
                boxShadow: '0 2px 6px rgba(145, 195, 83, 0.2)',
                transition: 'background-color 0.3s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#e9f5d3')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fff')}
            >
              {renderFormattedText(action)}
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

NextActions.propTypes = {
  suggestions: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default NextActions;
