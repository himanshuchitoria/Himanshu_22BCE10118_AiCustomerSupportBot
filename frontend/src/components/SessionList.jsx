import React, { useState, useEffect } from "react";
import { createSessionWithGreeting, listSessions } from "../api";

export default function SessionList({ onSelect, setMessages }) {
  const [sessions, setSessions] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);
  const [error, setError] = useState(null);
  const [statusMsg, setStatusMsg] = useState("Loading sessions...");

  const handleStartNewSession = async () => {
    setStatusMsg("Starting new session...");
    try {
      const data = await createSessionWithGreeting();

      if (data.error) {
        setStatusMsg(`Failed to start new session: ${data.error}`);
        alert(`Failed to start new session: ${data.error}`);
        return;
      }

      setStatusMsg("New session started.");
      setMessages([{ sender: "bot", text: data.bot_message }]);
      onSelect(data.session_id);
    } catch (err) {
      setStatusMsg("Unexpected error starting new session. Check console.");
      alert("Unexpected error starting new session. Please try again.");
      console.error(err);
    }
  };

  useEffect(() => {
    setStatusMsg("Loading sessions...");
    async function fetchSessions() {
      try {
        const sessionsData = await listSessions();
        setSessions(sessionsData);
        setError(null);
        setStatusMsg(`Loaded ${sessionsData.length} sessions.`);
      } catch (err) {
        setStatusMsg("Failed to load sessions.");
        console.error(err);
        setError("Failed to load sessions.");
        setSessions([]);
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
          marginTop: "-20px",
        }}
      >
        Sessions
      </h2>

      <div
        style={{
          fontStyle: "italic",
          marginBottom: "16px",
          color: error ? "#e63946" : "#666",
          fontWeight: error ? 600 : "normal",
        }}
      >
        {statusMsg}
      </div>

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

      {sessions.length === 0 && !error && <div>No previous sessions found.</div>}

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
          aria-label={`Open session started on ${new Date(session.created_at).toLocaleString()}`}
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
              `${session.query_history.length} message${session.query_history.length > 1 ? "s" : ""}`
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
