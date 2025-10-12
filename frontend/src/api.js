const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

/**
 * Helper function to handle fetch with timeout.
 */
async function fetchWithTimeout(resource, options = {}, timeout = 500000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  options.signal = controller.signal;

  try {
    const response = await fetch(resource, options);
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

/**
 * Sends a customer query to backend and returns response data.
 * @param {string} query - User query string.
 * @param {string|null} sessionId - Optional session ID for continuity.
 * @returns {Promise<object>} Response with fields {response, session_id, escalated, suggestions}.
 */
export async function sendQueryToBackend(query, sessionId = null) {
  const payload = { query };

  if (sessionId) {
    payload.session_id = sessionId;
  }

  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API call error in sendQueryToBackend:", error);
    throw error;
  }
}

/**
 * Fetches session details by session ID.
 * @param {string} sessionId
 * @returns {Promise<object>} Session info {session_id, query_history, created_at}.
 */
export async function fetchSession(sessionId) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/session/${sessionId}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch session ${sessionId}. Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API call error in fetchSession:", error);
    throw error;
  }
}

/**
 * Lists all active sessions from backend.
 * @returns {Promise<Array>} Array of session objects.
 */
export async function listSessions() {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/sessions`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch sessions. Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API call error in listSessions:", error);
    throw error;
  }
}

/**
 * Requests a summary of a conversation session.
 * @param {string} sessionId
 * @returns {Promise<object>} {summary: string}
 */
export async function fetchSessionSummary(sessionId) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/summarize/${sessionId}`, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch summary for session ${sessionId}. Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API call error in fetchSessionSummary:", error);
    throw error;
  }
}

/**
 * Gets next action suggestions for a session.
 * @param {string} sessionId
 * @returns {Promise<object>} {next_actions: Array<string>}
 */
export async function fetchNextActions(sessionId) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/next-actions/${sessionId}`, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch next actions for session ${sessionId}. Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API call error in fetchNextActions:", error);
    throw error;
  }
}

// Assuming you have an api.js file, add this function:
export async function createSessionWithGreeting() {
  try {
    const response = await fetch(`${API_BASE_URL}/session/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to create session: ${errorText}`);
      return { error: `Failed to create session: ${errorText}` };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API call error in createSessionWithGreeting:', error);
    return { error: error.message || 'Unknown error occurred.' };
  }
}

