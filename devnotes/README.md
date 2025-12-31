# Dev Notes

For maintainers and contributors. Player-facing info lives in the root README.

## Architecture

- Frontend: React (Vite), mobile-first retro theme. Audio toggle, accessibility (labels, focus, high-contrast).
- Game engine: `engine/` pure logic (adjacent-lock and ultimate rules), state versioning, deterministic applyMove, AI ladder.
- Backend: `server/index.js` (Express + `ws`). Authoritative validation, invite tokens, lightweight rate limiting. In-memory store (add Redis/DB for production).
- Multiplayer: WebSocket path `/ws` with `gameId` + `token`. Moves validated server-side; state broadcast to both players.
- Adjacent Lock mode: move includes `{ position, allowed[] }` with adjacent cells to constrain the opponent. If empty adjacent pairs exist, two empty adjacent cells are required; if none exist, a single empty cell is allowed. If both chosen are blocked on the next turn, opponent falls back to any open cell.

## Scripts

- `npm run dev` — Vite + nodemon backend.
- `npm run build` — Vite build to `dist/`.
- `npm start` — serve `dist/` and WebSocket API on `PORT` (default 8788).
- Android wrapper (WebView): from `android/`, `./gradlew :app:assembleDebug` after `npm run build`; copies `dist/` into assets. No proprietary deps.

## State & security

- Shared engine and validation for client + server to avoid client authority.
- Invite flow: host creates game -> gets `gameId` + `inviteToken` + host token; joiner POSTs with invite token to get their private token; WebSockets authorize per token/role.
- Rate limiting: simple per-IP window; harden before public release.
- TODO: persist state/replays (Redis/DB), token rotation + expiry, HTTPS + stricter CORS for production.

## Testing ideas

- Unit-test engine (win detection, constraints, minimax outputs).
- WebSocket integration: simulate two clients, assert server rejects bad moves and keeps turn order.

## Deployment notes

- Static + Node: `npm run build` then `PORT=$PORT node server/index.js`.
- Android: `./gradlew :app:assembleRelease` in `android/` after `npm run build`.
- Keep `public/audio/` for media; adjust CORS and TLS when hosting.

## Next steps

- Add persistence and reconnect logic.
- Spectator mode + replay playback.
- Offline cache (Service Worker) for assets.
- Harden abuse protection (better rate limits, token TTLs, challenge puzzles).
- More AI tuning per mode; add tests for deadlock handling and single-target constraints.
