import React, { useEffect, useMemo, useState } from 'react';
import BoardClassic from './BoardClassic.jsx';
import BoardNested from './BoardNested.jsx';
import { useWebSocketGame } from '../hooks/useWebSocketGame.js';
import WinnerOverlay from './WinnerOverlay.jsx';
import { getAdjacentCells } from '../../engine/adjacent.js';

export default function MultiplayerLobby({ initialMode = 'nested', onBack }) {
  const [mode, setMode] = useState(initialMode === 'nested' ? 'nested' : 'adjacent');
  const [gameId, setGameId] = useState('');
  const [token, setToken] = useState('');
  const [inviteToken, setInviteToken] = useState('');
  const [link, setLink] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(null); // { origin, allowed[] }

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
  const showWin = state && state.winner && state.status !== 'draw' && state.status !== 'in_progress';

  useEffect(() => {
    setPending(null);
  }, [mode, state?.currentPlayer, state?.status]);

  const selectableTargets = useMemo(() => {
    if (!state || state.mode !== 'adjacent') return null;
    if (!pending || pending.origin === null) return null;
    const shadow = state.board.slice();
    shadow[pending.origin] = state.currentPlayer;
    const adjacentEmpties = getAdjacentCells(pending.origin).filter((idx) => shadow[idx] === null);
    const required = Math.min(2, adjacentEmpties.length);
    if (!required) return [];
    if (!pending.allowed.length) {
      return adjacentEmpties;
    }
    return adjacentEmpties.filter((idx) => idx !== pending.allowed[0]);
  }, [pending, state]);

  const handleSelect = (idx) => {
    if (!state || state.mode !== 'adjacent') {
      handleMove(idx);
      return;
    }
    if (state.status !== 'in_progress' || state.currentPlayer !== role) return;
    const constrained =
      state.constraintTargets && state.constraintTargets.length
        ? state.constraintTargets.filter((c) => state.board[c] === null)
        : null;
    const hasConstraint = constrained && constrained.length > 0;

    if (!pending || pending.origin === null) {
      if (state.board[idx] !== null) return;
      if (hasConstraint && !constrained.includes(idx)) return;
      const adjacentEmpties = getAdjacentCells(idx).filter((cellIdx) => state.board[cellIdx] === null);
      if (adjacentEmpties.length === 0) {
        handleMove({ position: idx, allowed: [] });
        return;
      }
      setPending({ origin: idx, allowed: [] });
      return;
    }

    if (pending.origin === idx) {
      setPending(null);
      return;
    }

    const shadow = state.board.slice();
    shadow[pending.origin] = state.currentPlayer;
    const adjacentEmpties = getAdjacentCells(pending.origin).filter((cellIdx) => shadow[cellIdx] === null);
    const required = Math.min(2, adjacentEmpties.length);
    if (!required) {
      setPending(null);
      return;
    }

    if (!pending.allowed.length) {
      if (shadow[idx] !== null) return;
      if (!adjacentEmpties.includes(idx)) return;
      if (required === 1) {
        handleMove({ position: pending.origin, allowed: [idx] });
        setPending(null);
        return;
      }
      setPending({ origin: pending.origin, allowed: [idx] });
      return;
    }
    const first = pending.allowed[0];
    if (first === idx) {
      setPending({ origin: pending.origin, allowed: [] });
      return;
    }
    if (shadow[idx] !== null) return;
    if (!adjacentEmpties.includes(idx)) return;
    const allowed = [first, idx];
    handleMove({ position: pending.origin, allowed });
    setPending(null);
  };

  return (
    <div className="panel grid play-panel" aria-label="multiplayer lobby">
      {showWin && (
        <WinnerOverlay
          message={`Congratulations! ${state.winner} wins.`}
          subText="Share the link for a rematch."
          onAction={() => setLink(shareUrl)}
          actionLabel="Rematch / share link"
        />
      )}
      <div className="control-row topbar">
        <button className="btn secondary" onClick={onBack}>
          ← Back
        </button>
        <div className="tag">Board: {mode === 'adjacent' ? 'Adjacent Lock' : 'Ultimate Tic-Tac-Toe'}</div>
      </div>
      <div className="status">
        <div>
          <div className="card-title">Multiplayer</div>
          <div>Share a link so a friend can jump in.</div>
        </div>
        <div className="control-row">
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="btn secondary"
            aria-label="Mode"
          >
            <option value="adjacent">Adjacent Lock</option>
            <option value="nested">Ultimate Tic-Tac-Toe</option>
          </select>
          <button className="btn" onClick={createGame}>
            Create game
          </button>
        </div>
      </div>

      <div className="grid two">
        <div className="panel game-panel">
          <div className="card-title">Game</div>
          {!state && <p>Waiting for connection… create or join to start.</p>}
          {state && (
            <div className={`board-wrap ${state.mode === 'nested' ? 'nested' : ''}`}>
              <Board
                state={state}
                onMove={state.mode === 'adjacent' ? undefined : handleMove}
                onSelect={state.mode === 'adjacent' ? handleSelect : undefined}
                pendingOrigin={state.mode === 'adjacent' ? pending?.origin : null}
                pendingAllowed={state.mode === 'adjacent' ? pending?.allowed || [] : []}
                selectableTargets={state.mode === 'adjacent' ? selectableTargets : null}
              />
            </div>
          )}
        </div>
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
                Show invite link
              </button>
            </div>
            {link && <div className="mono">{link}</div>}
            {error && <div className="mono">Error: {error}</div>}
            {role && <div className="mono">You are: {role}</div>}
            {status && <div className="mono">Status: {status}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
