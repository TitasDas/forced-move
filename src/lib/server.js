// Multiplayer server location. Defaults to same-origin (the Render deploy,
// where the Express server also serves the client). Static-host builds
// (itch.io) set VITE_SERVER_URL at build time to point at the Render server.
const base = (import.meta.env.VITE_SERVER_URL || '').replace(/\/+$/, '');

export function apiUrl(path) {
  return base ? `${base}${path}` : path;
}

export function wsUrl(path) {
  const origin = base || window.location.origin;
  return new URL(path, origin.replace(/^http/, 'ws'));
}
