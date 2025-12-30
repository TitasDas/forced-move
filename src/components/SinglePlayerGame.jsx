import React, { useEffect, useMemo, useRef, useState } from 'react';
import { applyMove, createGame, GAME_STATUS } from '../../engine/index.js';
import { chooseMove, DIFFICULTY_LEVELS, buildAdjacentMove } from '../../engine/ai.js';
import BoardClassic from './BoardClassic.jsx';
import BoardNested from './BoardNested.jsx';
import WinnerOverlay from './WinnerOverlay.jsx';

export default function SinglePlayerGame({ initialMode = 'nested', onBack }) {
  const [mode, setMode] = useState(initialMode);
  const [difficulty, setDifficulty] = useState(3);
  const [state, setState] = useState(() => createGame(initialMode));
  const [aiThinking, setAiThinking] = useState(false);
  const aiTimer = useRef(null);

  useEffect(() => {
    setState(createGame(mode));
  }, [mode]);

  useEffect(() => {
    setMode(initialMode);
    setState(createGame(initialMode));
  }, [initialMode]);

  useEffect(() => {
    return () => {
      if (aiTimer.current) {
        clearTimeout(aiTimer.current);
      }
    };
  }, []);

  const Board = mode === 'classic' ? BoardClassic : BoardNested;

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

  const handleMove = (move) => {
    setState((current) => {
      if (current.status !== GAME_STATUS.IN_PROGRESS || current.currentPlayer !== 'X') {
        return current;
      }
      const humanMove =
        mode === 'adjacent' && typeof move === 'number'
          ? buildAdjacentMove(current, move)
          : move;
      const afterHuman = applyMove(current, humanMove);
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
      return afterHuman;
    });
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
            Board:{' '}
            {mode === 'classic'
              ? 'Classic'
              : mode === 'adjacent'
                ? 'Adjacent Constraint'
                : 'Ultimate Tic-Tac-Toe'}
          </div>
      </div>
      <div className="status">
        <div>
          <div className="card-title">Solo mode</div>
          <div className="control-row">
            <span>{statusText}</span>
            {mode === 'adjacent' && <span className="tag">Adjacent Constraint</span>}
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
        <Board state={state} onMove={handleMove} />
      </div>
      <div className="grid two">
        <div className="panel">
          <div className="card-title">Move log</div>
          <ol className="list" aria-label="move history">
            {state.history.map((move, idx) => (
              <li key={`${move.player}-${idx}`} className="control-row">
                <span className="mono">
                  {idx + 1}. {move.player} →
                  {mode === 'classic'
                    ? ` cell ${move.position + 1}`
                    : ` board ${move.boardIndex + 1}, cell ${move.cellIndex + 1}`}
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
