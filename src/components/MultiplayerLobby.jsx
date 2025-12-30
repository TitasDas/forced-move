import React, { useMemo, useState } from 'react';
import BoardClassic from './BoardClassic.jsx';
import BoardNested from './BoardNested.jsx';
import { useWebSocketGame } from '../hooks/useWebSocketGame.js';

export default function MultiplayerLobby() {
  const [mode, setMode] = useState('classic');
  const [gameId, setGameId] = useState('');
  const [token, setToken] = useState('');
  const [inviteToken, setInviteToken] = useState('');
  const [link, setLink] = useState('');
  const [error, setError] = useState('');

  const { state, role, status, sendMove } = useWebSocketGame(gameId, token);
  const Board = state?.mode === 'nested' ? BoardNested : BoardClassic;

  const shareUrl = useMemo(() => {
    if (!gameId || !inviteToken) return '';
    const url = new URL(window.location.href);
    url.searchParams.set('gameId', gameId);
    url.searchParams.set('invite', inviteToken);
    return url.toString();
  }, [gameId, inviteToken]);

  const createGame = async () => {
    setError('');
    try {
      const res = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });
      if (!res.ok) throw new Error('Failed to create game');
      const data = await res.json();
      setGameId(data.gameId);
      setToken(data.playerToken);
      setInviteToken(data.inviteToken);
      setLink('');
    } catch (err) {
      setError(err.message);
    }
  };

  const joinGame = async () => {
    setError('');
    try {
      const res = await fetch(`/api/games/${gameId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteToken }),
      });
      if (!res.ok) throw new Error('Join failed');
      const data = await res.json();
      setToken(data.playerToken);
      setLink('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleMove = (move) => sendMove(move);

  return (
    <div className="panel grid" aria-label="multiplayer lobby">
      <div className="status">
        <div>
          <div className="card-title">Real-time play</div>
          <div>Authoritative server validates turns and moves. Share a link to invite.</div>
        </div>
        <div className="control-row">
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="btn secondary"
            aria-label="Mode"
          >
            <option value="classic">Classic</option>
            <option value="nested">Nested</option>
          </select>
          <button className="btn" onClick={createGame}>
            Create game
          </button>
        </div>
      </div>

      <div className="grid two">
        <div className="panel">
          <div className="card-title">Invite & join</div>
          <div className="list">
            <label className="control-row">
              Game ID
              <input
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
                placeholder="auto after create"
              />
            </label>
            <label className="control-row">
              Invite token
              <input
                value={inviteToken}
                onChange={(e) => setInviteToken(e.target.value)}
                placeholder="from host"
              />
            </label>
            <div className="control-row">
              <button className="btn secondary" onClick={joinGame}>
                Join with invite
              </button>
              <button className="btn secondary" onClick={() => setLink(shareUrl)}>
                Copy share link
              </button>
            </div>
            {link && <div className="mono">{link}</div>}
            {error && <div className="mono">Error: {error}</div>}
            {status && <div className="mono">Socket: {status}</div>}
            {role && <div className="mono">You are: {role}</div>}
            {token && (
              <div className="mono" aria-label="private token">
                Token (keep secret): {token}
              </div>
            )}
          </div>
        </div>
        <div className="panel">
          <div className="card-title">Game</div>
          {!state && <p>Waiting for connection… create or join to start.</p>}
          {state && <Board state={state} onMove={handleMove} />}
        </div>
      </div>
    </div>
  );
}
