import React, { useEffect, useMemo, useState } from 'react';
import BoardClassic from './BoardClassic.jsx';
import BoardNested from './BoardNested.jsx';
import { useWebSocketGame } from '../hooks/useWebSocketGame.js';
import WinnerOverlay from './WinnerOverlay.jsx';
import { cellsAreAdjacent, getAdjacentEmptyPairs } from '../../engine/adjacent.js';
import { GAME_STATUS } from '../../engine/index.js';
import RulesModal from './RulesModal.jsx';
import { loadSession, saveSession, clearSession } from '../lib/mpSession.js';

function parseInviteText(text) {
  if (!text) return null;
  try {
    const url = new URL(text.trim());
    const gameId = url.searchParams.get('gameId');
    const invite = url.searchParams.get('invite');
    if (gameId && invite) return { gameId, invite };
  } catch {
    // Not a URL, fall through to the loose match.
  }
  const match = text.match(/gameId=([\w-]+).*?invite=([\w-]+)/);
  if (match) return { gameId: match[1], invite: match[2] };
  return null;
}

const MODE_LABELS = {
  adjacent: 'Adjacent Lock',
  nested: 'Ultimate Tic-Tac-Toe',
};

export default function MultiplayerLobby({ initialMode = 'nested', joinRequest = null, onBack }) {
  const [mode, setMode] = useState(initialMode === 'nested' ? 'nested' : 'adjacent');
  const [session, setSession] = useState(() => loadSession());
  const [joining, setJoining] = useState(Boolean(joinRequest));
  const [joinText, setJoinText] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(null); // { origin, allowed[] }
  const [showRules, setShowRules] = useState(false);
  const [copied, setCopied] = useState(false);

  const gameId = session?.gameId || '';
  const token = session?.token || '';
  const { state, role, status, players, sendMove, sendReset } = useWebSocketGame(gameId, token);
  const Board = state?.mode === 'nested' ? BoardNested : BoardClassic;

  const adoptSession = (next) => {
    saveSession(next);
    setSession(next);
  };

  const leaveGame = () => {
    clearSession();
    setSession(null);
    setPending(null);
    setError('');
  };

  const shareUrl = useMemo(() => {
    if (!gameId || !session?.inviteToken) return '';
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('gameId', gameId);
    url.searchParams.set('invite', session.inviteToken);
    return url.toString();
  }, [gameId, session?.inviteToken]);

  const createGame = async () => {
    setError('');
    try {
      const res = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });
      if (!res.ok) throw new Error('Could not create a game, try again.');
      const data = await res.json();
      adoptSession({
        gameId: data.gameId,
        token: data.playerToken,
        inviteToken: data.inviteToken,
        role: 'X',
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const joinGame = async (id, invite) => {
    setError('');
    setJoining(true);
    try {
      const res = await fetch(`/api/games/${id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteToken: invite }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Could not join the game.');
      }
      const data = await res.json();
      adoptSession({ gameId: id, token: data.playerToken, role: 'O' });
    } catch (err) {
      setError(err.message);
    } finally {
      setJoining(false);
    }
  };

  // Invite links land here: rejoin with the saved seat if we already have one,
  // otherwise claim the open seat.
  useEffect(() => {
    if (!joinRequest) return;
    const saved = loadSession();
    if (saved && saved.gameId === joinRequest.gameId && saved.token) {
      setSession(saved);
      setJoining(false);
      return;
    }
    joinGame(joinRequest.gameId, joinRequest.invite);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joinRequest]);

  useEffect(() => {
    if (status === 'gone') {
      setError('That game has expired. Create a new one.');
      clearSession();
      setSession(null);
    }
  }, [status]);

  useEffect(() => {
    setPending(null);
  }, [state?.currentPlayer, state?.status]);

  const joinFromText = () => {
    const parsed = parseInviteText(joinText);
    if (!parsed) {
      setError('That does not look like an invite link.');
      return;
    }
    joinGame(parsed.gameId, parsed.invite);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const input = document.createElement('textarea');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nativeShare = () => {
    navigator
      .share({ title: 'Forced Move', text: 'Play a round of Forced Move with me:', url: shareUrl })
      .catch(() => {});
  };

  const opponentReady = useMemo(() => {
    if (!players || !role) return false;
    const other = role === 'X' ? 'O' : 'X';
    return Boolean(players[other]?.joined);
  }, [players, role]);

  const opponentConnected = useMemo(() => {
    if (!players || !role) return false;
    const other = role === 'X' ? 'O' : 'X';
    return Boolean(players[other]?.connected);
  }, [players, role]);

  // While we wait for the second player, show the board dimmed and locked so a
  // stray tap can't commit a move nobody has seen.
  const boardState = useMemo(() => {
    if (!state) return null;
    if (opponentReady || state.status !== GAME_STATUS.IN_PROGRESS) return state;
    return { ...state, status: 'waiting', currentPlayer: null };
  }, [state, opponentReady]);

  const banner = useMemo(() => {
    if (!session) return null;
    if (joining) return { tone: 'wait', text: 'Joining game…' };
    if (!state) return { tone: 'wait', text: 'Connecting…' };
    if (state.status === GAME_STATUS.DRAW) return { tone: 'wait', text: "It's a draw." };
    if (state.status !== GAME_STATUS.IN_PROGRESS) {
      return state.winner === role
        ? { tone: 'you', text: 'You win!' }
        : { tone: 'them', text: `${state.winner} takes it.` };
    }
    if (status !== 'connected') return { tone: 'wait', text: 'Reconnecting…' };
    if (!opponentReady) return { tone: 'wait', text: 'Waiting for your friend to join' };
    if (!opponentConnected) return { tone: 'wait', text: 'Opponent reconnecting…' };
    if (state.currentPlayer === role) return { tone: 'you', text: 'Your turn' };
    return { tone: 'them', text: "Opponent's turn" };
  }, [session, joining, state, status, role, opponentReady, opponentConnected]);

  const instruction = useMemo(() => {
    if (!state || state.mode !== 'adjacent') return '';
    if (state.status !== GAME_STATUS.IN_PROGRESS || !opponentReady) return '';
    if (state.currentPlayer !== role) return '';
    if (!pending || pending.origin === null) {
      const constrained = (state.constraintTargets || []).filter((c) => state.board[c] === null);
      return constrained.length
        ? 'Your opponent locked you in: play one of the highlighted squares.'
        : 'Tap a square to place your mark.';
    }
    const shadow = state.board.slice();
    shadow[pending.origin] = state.currentPlayer;
    const empties = shadow.filter((cell) => cell === null).length;
    const hasPairs = getAdjacentEmptyPairs(shadow).length > 0;
    if (!hasPairs && empties > 0) {
      return 'No adjacent pairs left: pick one square for your opponent. Tap your mark to undo.';
    }
    if (pending.allowed.length === 1) {
      return 'Pick a second square adjacent to your first pick.';
    }
    return 'Now pick two adjacent empty squares your opponent must play in. Tap your mark to undo.';
  }, [state, pending, role, opponentReady]);

  const selectableTargets = useMemo(() => {
    if (!state || state.mode !== 'adjacent') return null;
    if (!pending || pending.origin === null) return null;
    const shadow = state.board.slice();
    shadow[pending.origin] = state.currentPlayer;
    const empties = shadow.map((cell, idx) => (cell === null ? idx : null)).filter((idx) => idx !== null);
    const emptyPairs = getAdjacentEmptyPairs(shadow);
    const required = emptyPairs.length ? 2 : Math.min(2, empties.length);
    if (!pending.allowed.length) {
      return empties;
    }
    const first = pending.allowed[0];
    return empties.filter((idx) => idx !== first && (required === 2 ? cellsAreAdjacent(first, idx) : true));
  }, [pending, state]);

  const handleMove = (move) => sendMove(move);

  const handleSelect = (idx) => {
    if (!state || state.mode !== 'adjacent') {
      handleMove(idx);
      return;
    }
    if (state.status !== GAME_STATUS.IN_PROGRESS || state.currentPlayer !== role) return;
    if (!opponentReady) return;
    const constrained =
      state.constraintTargets && state.constraintTargets.length
        ? state.constraintTargets.filter((c) => state.board[c] === null)
        : null;

    if (!pending || pending.origin === null) {
      if (state.board[idx] !== null) return;
      if (constrained && !constrained.includes(idx)) return;
      const shadow = state.board.slice();
      shadow[idx] = state.currentPlayer;
      const empties = shadow.map((cell, i) => (cell === null ? i : null)).filter((i) => i !== null);
      const emptyPairs = getAdjacentEmptyPairs(shadow);
      const required = emptyPairs.length ? 2 : Math.min(2, empties.length);
      if (required === 0) {
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
    const empties = shadow.map((cell, i) => (cell === null ? i : null)).filter((i) => i !== null);
    if (!empties.length) {
      handleMove({ position: pending.origin, allowed: [] });
      setPending(null);
      return;
    }
    const emptyPairs = getAdjacentEmptyPairs(shadow);
    const required = emptyPairs.length ? 2 : Math.min(2, empties.length);

    if (!pending.allowed.length) {
      if (shadow[idx] !== null) return;
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
    if (required === 2 && !cellsAreAdjacent(first, idx)) return;
    const allowed = required === 2 ? [first, idx] : [idx];
    handleMove({ position: pending.origin, allowed });
    setPending(null);
  };

  const showEnd = state && state.status !== GAME_STATUS.IN_PROGRESS;
  const endMessage = !state
    ? ''
    : state.status === GAME_STATUS.DRAW
      ? "It's a draw."
      : state.winner === role
        ? 'Hurray! You won.'
        : 'Your friend takes this one.';

  return (
    <div className="panel grid play-panel mp-panel" aria-label="multiplayer game">
      {showEnd && (
        <WinnerOverlay
          message={endMessage}
          subText="Same board, same friend. Go again?"
          onAction={() => sendReset()}
          actionLabel="Rematch"
        />
      )}
      <div className="control-row topbar">
        <button className="btn secondary" onClick={onBack}>
          ← Back
        </button>
        <div className="control-row">
          <div className="tag">Board: {MODE_LABELS[state?.mode || mode]}</div>
          <button className="btn secondary" onClick={() => setShowRules(true)}>
            Rules
          </button>
        </div>
      </div>
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
      {error && <div className="mp-error">{error}</div>}

      {!session && !joining && (
        <div className="mp-setup">
          <div className="card-title">Play a friend</div>
          <p className="helper">Create a game and send them the link. They tap it and you're playing.</p>
          <div className="mode-grid compact mode-pills">
            {['adjacent', 'nested'].map((m) => (
              <button
                key={m}
                className={`mode small segmented ${mode === m ? 'active' : ''}`}
                onClick={() => setMode(m)}
              >
                <span className="mode-title">{MODE_LABELS[m]}</span>
              </button>
            ))}
          </div>
          <button className="btn large" onClick={createGame}>
            Create game
          </button>
          <details className="mp-details">
            <summary>Got an invite link?</summary>
            <div className="control-row">
              <input
                value={joinText}
                onChange={(e) => setJoinText(e.target.value)}
                placeholder="Paste the invite link here"
                inputMode="url"
                aria-label="Invite link"
              />
              <button className="btn secondary" onClick={joinFromText}>
                Join
              </button>
            </div>
          </details>
        </div>
      )}

      {!session && joining && <div className="turn-banner wait">Joining game…</div>}

      {session && (
        <>
          {banner && (
            <div className={`turn-banner ${banner.tone}`} aria-live="polite">
              {role && <span className={`role-chip mark-${role.toLowerCase()}`}>You are {role}</span>}
              <span>{banner.text}</span>
            </div>
          )}

          {shareUrl && state && !opponentReady && state.status === GAME_STATUS.IN_PROGRESS && (
            <div className="invite-card">
              <div className="invite-link">{shareUrl}</div>
              <div className="control-row center">
                <button className="btn" onClick={copyLink}>
                  {copied ? 'Copied ✓' : 'Copy link'}
                </button>
                {typeof navigator !== 'undefined' && navigator.share && (
                  <button className="btn secondary" onClick={nativeShare}>
                    Share…
                  </button>
                )}
              </div>
            </div>
          )}

          {boardState && (
            <div className={`board-wrap ${boardState.mode === 'nested' ? 'nested' : ''}`}>
              <Board
                state={boardState}
                onMove={boardState.mode === 'adjacent' ? undefined : handleMove}
                onSelect={boardState.mode === 'adjacent' ? handleSelect : undefined}
                pendingOrigin={boardState.mode === 'adjacent' ? pending?.origin : null}
                pendingAllowed={boardState.mode === 'adjacent' ? pending?.allowed || [] : []}
                selectableTargets={boardState.mode === 'adjacent' ? selectableTargets : null}
              />
            </div>
          )}

          {instruction && (
            <div className="control-row center">
              <div className="tag">{instruction}</div>
            </div>
          )}

          <details className="mp-details">
            <summary>Game details</summary>
            <div className="list">
              <div className="mono">Game ID: {gameId}</div>
              {shareUrl && <div className="invite-link">{shareUrl}</div>}
              <div className="mono">Connection: {status}</div>
              <div className="control-row">
                <button className="btn secondary" onClick={leaveGame}>
                  Leave game
                </button>
              </div>
            </div>
          </details>
        </>
      )}
    </div>
  );
}
