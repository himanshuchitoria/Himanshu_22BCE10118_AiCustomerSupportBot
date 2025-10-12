import React, { useState, useEffect } from "react";
import { createSessionWithGreeting, listSessions } from "../api";

export default function SessionList({ onSelect, setMessages }) {
  const [sessions, setSessions] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);
  const [error, setError] = useState(null);

  const handleStartNewSession = async () => {
    try {
      const data = await createSessionWithGreeting();

      if (data.error) {
        alert(`Failed to start new session: ${data.error}`);
        return;
      }

      setMessages([{ sender: 'bot', text: data.bot_message }]);
      onSelect(data.session_id);
    } catch (err) {
      alert("Unexpected error starting new session. Please try again.");
      console.error(err);
    }
  };

  useEffect(() => {
    async function fetchSessions() {
      try {
        const sessionsData = await listSessions();
        setSessions(sessionsData);
      } catch (err) {
        console.error(err);
        setError("Failed to load sessions.");
      }
    }
    fetchSessions();
  }, []);

  return (
    <div
      style={{
        maxWidth: 500,
        margin: "20px auto",
        padding: "20px",
        borderRadius: "8px",
        backgroundColor: "#f9fafb",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
        fontFamily: "'Roboto', 'Helvetica Neue', Arial, sans-serif",
        color: "#0b436e",
      }}
    >
      <h2
        style={{
          fontWeight: 600,
          fontSize: "22px",
          marginBottom: "18px",
          color: "#0b436e",
          marginTop:"-20px",
        }}
      >
        Sessions
      </h2>
      <button
        onClick={handleStartNewSession}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#7ba33a")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#91c353")}
        style={{
          padding: "10px 16px",
          fontSize: "16px",
          fontWeight: 600,
          color: "#fff",
          backgroundColor: "#91c353",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          marginBottom: "24px",
          boxShadow: "0 3px 8px rgba(145, 195, 83, 0.4)",
          transition: "background-color 0.3s ease",
        }}
      >
        Start New Chat
      </button>

      {error && (
        <div
          style={{
            color: "#e63946",
            marginBottom: "10px",
            fontWeight: 600,
          }}
        >
          {error}
        </div>
      )}

      {sessions.length === 0 && !error && (
        <div
          style={{
            fontStyle: "italic",
            color: "#666",
            marginBottom: "16px",
          }}
        >
          No previous sessions found.
        </div>
      )}

      {sessions.map((session) => (
        <div
          key={session.session_id}
          style={{
            cursor: "pointer",
            margin: "10px 0",
            padding: "16px 18px",
            borderRadius: "8px",
            backgroundColor: "#ffffff",
            border: "1px solid #e1e4e8",
            boxShadow: "0 1px 4px rgba(0, 0, 0, 0.06)",
            transition: "box-shadow 0.3s ease, border-color 0.3s ease",
            ...(hoveredId === session.session_id
              ? {
                  boxShadow: "0 6px 18px rgba(11, 67, 110, 0.15)",
                  borderColor: "#0b436e",
                }
              : {}),
          }}
          onClick={() => onSelect(session.session_id)}
          onMouseEnter={() => setHoveredId(session.session_id)}
          onMouseLeave={() => setHoveredId(null)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              onSelect(session.session_id);
            }
          }}
          aria-label={`Open session started on ${new Date(
            session.created_at
          ).toLocaleString()}`}
        >
          <div
            style={{
              fontWeight: 700,
              marginBottom: "6px",
              color: "#0b436e",
            }}
          >
            Session ID: {session.session_id}
          </div>
          <div
            style={{
              marginBottom: "6px",
              color: "#333",
              fontSize: "14px",
            }}
          >
            Started: {new Date(session.created_at).toLocaleString()}
          </div>
          <div
            style={{
              fontSize: "13px",
              color: "#777",
            }}
          >
            {session.query_history.length === 0 ? (
              <em>No messages yet</em>
            ) : (
              `${session.query_history.length} message${
                session.query_history.length > 1 ? "s" : ""
              }`
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
