import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { nanoid } from 'nanoid';
import path from 'path';
import { fileURLToPath } from 'url';
import { applyMove, createGame, GAME_STATUS } from '../engine/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8788;
const games = new Map();
const RATE_WINDOW_MS = 10 * 1000;
const RATE_LIMIT = 12;
const ipBuckets = new Map();

function rateLimit(req, res, next) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const bucket = ipBuckets.get(ip) || { count: 0, resetAt: now + RATE_WINDOW_MS };
  if (now > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + RATE_WINDOW_MS;
  }
  bucket.count += 1;
  ipBuckets.set(ip, bucket);
  if (bucket.count > RATE_LIMIT) {
    return res.status(429).json({ error: 'Too many requests, slow down.' });
  }
  return next();
}

function newGame(mode = 'adjacent') {
  const state = createGame(mode);
  return {
    state,
    mode,
    gameId: nanoid(10),
    inviteToken: nanoid(14),
    players: {
      X: { token: nanoid(16), connected: false },
      O: null,
    },
    createdAt: Date.now(),
    lastUpdate: Date.now(),
  };
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, now: Date.now() });
});

app.post('/api/games', rateLimit, (req, res) => {
  const { mode = 'adjacent' } = req.body || {};
  const game = newGame(mode);
  games.set(game.gameId, game);
  res.json({
    gameId: game.gameId,
    player: 'X',
    playerToken: game.players.X.token,
    inviteToken: game.inviteToken,
  });
});

app.post('/api/games/:id/join', rateLimit, (req, res) => {
  const { id } = req.params;
  const { inviteToken } = req.body || {};
  const game = games.get(id);
  if (!game) return res.status(404).json({ error: 'Game not found' });
  if (game.players.O && game.players.O.token) {
    return res.status(400).json({ error: 'Game already has two players' });
  }
  if (inviteToken !== game.inviteToken) {
    return res.status(403).json({ error: 'Invalid invite token' });
  }
  game.players.O = { token: nanoid(16), connected: false };
  res.json({ gameId: id, player: 'O', playerToken: game.players.O.token });
});

const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

function broadcast(game, payload) {
  wss.clients.forEach((client) => {
    if (client.readyState !== 1) return;
    if (client.gameId === game.gameId) {
      client.send(JSON.stringify(payload));
    }
  });
}

function validateToken(game, token) {
  if (game.players.X?.token === token) return 'X';
  if (game.players.O?.token === token) return 'O';
  return null;
}

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const gameId = url.searchParams.get('gameId');
  const token = url.searchParams.get('token');

  const game = games.get(gameId);
  if (!game || !token) {
    ws.close(1008, 'Invalid game or token');
    return;
  }
  const role = validateToken(game, token);
  if (!role) {
    ws.close(1008, 'Unauthorized');
    return;
  }

  ws.gameId = gameId;
  ws.player = role;
  game.players[role].connected = true;

  ws.send(
    JSON.stringify({
      type: 'state',
      state: game.state,
      youAre: role,
    }),
  );

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      if (msg.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', ts: Date.now() }));
        return;
      }
      if (msg.type === 'request_state') {
        ws.send(JSON.stringify({ type: 'state', state: game.state, youAre: role }));
        return;
      }
      if (msg.type === 'move') {
        if (game.state.status !== GAME_STATUS.IN_PROGRESS) {
          ws.send(JSON.stringify({ type: 'error', message: 'Game finished' }));
          return;
        }
        if (game.state.currentPlayer !== role) {
          ws.send(JSON.stringify({ type: 'error', message: 'Not your turn' }));
          return;
        }

        try {
          game.state = applyMove(game.state, msg.move);
        } catch (err) {
          ws.send(JSON.stringify({ type: 'error', message: err.message }));
          return;
        }
        game.lastUpdate = Date.now();
        broadcast(game, { type: 'state', state: game.state });
      }
    } catch (err) {
      ws.send(JSON.stringify({ type: 'error', message: err.message }));
    }
  });

  ws.on('close', () => {
    game.players[role].connected = false;
  });
});

app.use(express.static(path.join(__dirname, '..', 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
