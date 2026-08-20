// Per-tab multiplayer seat: gameId + player token, so a refresh or screen
// lock doesn't lose the game.
const SESSION_KEY = 'fm-mp-session';

export function loadSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || null;
  } catch {
    return null;
  }
}

export function saveSession(session) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Private mode without storage: the game still works, it just won't survive a refresh.
  }
}

export function clearSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}
