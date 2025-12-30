import React, { useEffect, useMemo, useRef, useState } from 'react';
import { applyMove, createGame, GAME_STATUS } from '../../engine/index.js';
import { chooseMove, DIFFICULTY_LEVELS, buildAdjacentMove } from '../../engine/ai.js';
import { getAdjacentCells } from '../../engine/adjacent.js';
import BoardClassic from './BoardClassic.jsx';
import BoardNested from './BoardNested.jsx';
import WinnerOverlay from './WinnerOverlay.jsx';

export default function SinglePlayerGame({ initialMode = 'adjacent', onBack }) {
  const [mode, setMode] = useState(initialMode);
  const [difficulty, setDifficulty] = useState(3);
  const [state, setState] = useState(() => createGame(initialMode));
  const [aiThinking, setAiThinking] = useState(false);
  const aiTimer = useRef(null);
  const [pending, setPending] = useState(null); // { origin, allowed[] }

  useEffect(() => {
    setState(createGame(mode));
    setPending(null);
  }, [mode]);

  useEffect(() => {
    setMode(initialMode);
    setState(createGame(initialMode));
    setPending(null);
  }, [initialMode]);

  useEffect(() => {
    return () => {
      if (aiTimer.current) {
        clearTimeout(aiTimer.current);
      }
    };
  }, []);

  const Board = mode === 'nested' ? BoardNested : BoardClassic;

  const statusText = useMemo(() => {
    if (state.status === GAME_STATUS.IN_PROGRESS) {
      return state.currentPlayer === 'X'
        ? 'Your move'
        : `Computer thinking (level ${difficulty})`;
    }
    if (state.status === GAME_STATUS.DRAW) return 'Draw game — balanced!';
    return state.winner === 'X' ? 'You win!' : 'Computer wins';
  }, [state, difficulty]);

  const reset = () => {
    setState(createGame(mode));
  };

  const commitMove = (move) => {
    setState((current) => {
      if (current.status !== GAME_STATUS.IN_PROGRESS || current.currentPlayer !== 'X') {
        return current;
      }
      const afterHuman = applyMove(current, move);
      if (afterHuman.status !== GAME_STATUS.IN_PROGRESS) {
        setAiThinking(false);
        return afterHuman;
      }
      setAiThinking(true);
      if (aiTimer.current) clearTimeout(aiTimer.current);
      aiTimer.current = setTimeout(() => {
        setState((latest) => {
          if (latest.status !== GAME_STATUS.IN_PROGRESS || latest.currentPlayer !== 'O') {
            setAiThinking(false);
            return latest;
          }
          let aiMove = chooseMove(latest, difficulty);
          if (aiMove !== null && latest.mode === 'adjacent' && typeof aiMove === 'number') {
            aiMove = buildAdjacentMove(latest, aiMove);
          }
          const afterAi = aiMove !== null ? applyMove(latest, aiMove) : latest;
          setAiThinking(false);
          return afterAi;
        });
      }, 600);
      setPending(null);
      return afterHuman;
    });
  };

  const handleSelect = (idx) => {
    if (mode !== 'adjacent') {
      commitMove(idx);
      return;
    }
    if (state.status !== GAME_STATUS.IN_PROGRESS || state.currentPlayer !== 'X') return;
    const constrained =
      state.constraintTargets && state.constraintTargets.length
        ? state.constraintTargets.filter((c) => state.board[c] === null)
        : null;
    if (state.board[idx] !== null) return;
    if (constrained && !constrained.includes(idx)) return;

    if (!pending || pending.origin === null) {
      setPending({ origin: idx, allowed: [] });
      return;
    }
    if (pending.origin === idx) {
      setPending(null);
      return;
    }
    const adj = getAdjacentCells(pending.origin).filter((c) => state.board[c] === null);
    if (!adj.includes(idx)) return;
    if (pending.allowed.includes(idx)) return;
    const nextAllowed = [...pending.allowed, idx].slice(0, 2);
    const shouldCommit = nextAllowed.length >= 2 || nextAllowed.length === adj.length;
    if (shouldCommit) {
      commitMove({ position: pending.origin, allowed: nextAllowed });
      setPending(null);
    } else {
      setPending({ origin: pending.origin, allowed: nextAllowed });
    }
  };

  const replay = (index) => {
    // Rebuild the game up to the desired history index.
    let replayState = createGame(mode);
    state.history.slice(0, index + 1).forEach((move) => {
      replayState = applyMove(replayState, mode === 'classic' ? move.position : move);
    });
    setState(replayState);
  };

  return (
    <div className="panel grid play-panel" aria-label="single player game">
      {state.status !== GAME_STATUS.IN_PROGRESS && state.status !== GAME_STATUS.DRAW && (
        <WinnerOverlay
          message={state.winner === 'X' ? 'Hurray! You won.' : 'Computer takes it this time.'}
          subText={state.winner === 'X' ? 'Nice line-up. Play again?' : 'Try another round or bump the difficulty.'}
          onAction={reset}
          actionLabel="Play again"
        />
      )}
      <div className="control-row topbar">
        <button className="btn secondary" onClick={onBack}>
          ← Back
        </button>
          <div className="tag">
            Board: {mode === 'adjacent' ? 'Adjacent Lock' : 'Ultimate Tic-Tac-Toe'}
          </div>
      </div>
      <div className="status">
        <div>
          <div className="card-title">Solo mode</div>
          <div className="control-row">
            <span>{statusText}</span>
            {mode === 'adjacent' && <span className="tag">Adjacent Lock</span>}
            {aiThinking && (
              <span className="thinker" aria-live="polite">
                <span className="sigil">∑</span>
                <span className="dots">⋯</span>
                <span className="sigil">∫</span>
              </span>
            )}
          </div>
        </div>
        <div className="control-row">
          <label>
            <span className="sr-only">Difficulty</span>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(Number(e.target.value))}
              className="btn secondary"
            >
              {DIFFICULTY_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  Level {lvl}
                </option>
              ))}
            </select>
          </label>
          <button className="btn secondary" onClick={reset}>
            Reset
          </button>
        </div>
      </div>
      <div className={`board-wrap ${mode === 'nested' ? 'nested' : ''}`}>
        <Board
          state={state}
          onMove={mode === 'adjacent' ? undefined : commitMove}
          onSelect={mode === 'adjacent' ? handleSelect : undefined}
          pendingOrigin={mode === 'adjacent' ? pending?.origin : null}
          pendingAllowed={mode === 'adjacent' ? pending?.allowed || [] : []}
        />
        {mode === 'adjacent' && pending?.origin !== null && (
          <div className="control-row">
            <div className="tag">Pick up to two adjacent squares for your opponent.</div>
          </div>
        )}
      </div>
      <div className="grid two">
        <div className="panel">
          <div className="card-title">Move log</div>
          <ol className="list" aria-label="move history">
            {state.history.map((move, idx) => (
              <li key={`${move.player}-${idx}`} className="control-row">
                <span className="mono">
                  {idx + 1}. {move.player} →
                  {mode === 'nested'
                    ? ` board ${move.boardIndex + 1}, cell ${move.cellIndex + 1}`
                    : ` cell ${move.position + 1} ${move.allowed ? `(adjacent: ${move.allowed
                        .map((c) => c + 1)
                        .join(', ')})` : ''}`}
                </span>
                <button className="btn secondary" onClick={() => replay(idx)}>
                  Replay here
                </button>
              </li>
            ))}
            {!state.history.length && <li>No moves yet — start playing.</li>}
          </ol>
        </div>
      </div>
    </div>
  );
}
