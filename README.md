# Forced Move

Calm, secure Tic-Tac-Toe for learning React, AI difficulty design, and multiplayer architecture. Mobile-first UI with a chalkboard-meets-math-lab vibe.

## Features

- Classic and nested (Ultimate-style) Tic-Tac-Toe with constrained moves.
- Single player with 5 difficulty tiers: random → heuristics → minimax (classic) / constrained heuristics (nested).
- Real-time multiplayer with invite tokens, WebSockets, and authoritative validation.
- Deterministic, framework-free engine reused by client and server; versioned state for evolvability.
- Replay-friendly move history; accessibility toggles including high-contrast mode and screen-reader labels.

## Project layout

- `engine/` – Pure game engine: state factories, validators, move application, AI helpers.
- `src/` – React UI (Vite). Components for single-player, multiplayer lobby, accessibility, and boards.
- `server/` – Lightweight Express + `ws` server for invites, tokens, and authoritative move validation.
- `index.html`, `vite.config.js` – Frontend entry points.

## Quickstart

```
npm install
npm run dev          # Runs Vite dev server + nodemon backend
# visit http://localhost:5173 for the client (proxy API hits to http://localhost:8788)
```

Production-ish:

```
npm run build        # Vite build -> dist/
PORT=8788 npm start  # Serves dist/ and WebSocket API
```

## Multiplayer flow (security-first)

1. Host hits “Create game” (selects mode). Server returns `gameId`, `playerToken` (X), `inviteToken`.
2. Host shares invite link (`gameId` + `inviteToken`). Client persists token locally only.
3. Joiner POSTs `/api/games/:id/join` with invite token to get their private `playerToken`.
4. WebSocket connects with `gameId` + `token`. Server authorizes role (X/O) and streams state.
5. Moves are proposals only; server re-validates turn order, legality, and win state using the shared engine.
6. If invalid, server rejects; on success, broadcasts authoritative state to both players.

Notes: In-memory store for now; add Redis/Durable storage before deploying publicly. Rate limiting is lightweight (per-IP window); harden before production.

## AI difficulty ladder

- **1**: Random legal move.
- **2–3**: Heuristics (win-if-possible, block, center/corner preference).
- **4–5**: Minimax with alpha-beta for classic; nested uses constrained heuristic search to keep turns fast on mobile.

## Accessibility

- Keyboard-operable board cells (buttons).
- Screen-reader labels per cell and board.
- High-contrast toggle.
- Clear focus styles.

## TODOs / future work

- Persist game state + replays (Redis/SQLite), add token rotation & expiry.
- Add spectator-only sockets and recorded replay playback.
- Stronger abuse prevention: challenge puzzles on spam, stricter rate limits, and invite token TTLs.
- Offline-first caching and a Service Worker.
- Formal test suite (unit tests for engine + minimax correctness).

## License

No license specified yet. Add one before distributing.
