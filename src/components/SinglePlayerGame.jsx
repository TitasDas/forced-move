import React, { useEffect, useMemo, useState } from 'react';
import { applyMove, createGame, GAME_STATUS } from '../../engine/index.js';
import { chooseMove, DIFFICULTY_LEVELS } from '../../engine/ai.js';
import BoardClassic from './BoardClassic.jsx';
import BoardNested from './BoardNested.jsx';
import WinnerOverlay from './WinnerOverlay.jsx';

export default function SinglePlayerGame({ initialMode = 'nested', onBack }) {
  const [mode, setMode] = useState(initialMode);
  const [difficulty, setDifficulty] = useState(3);
  const [state, setState] = useState(() => createGame(initialMode));

  useEffect(() => {
    setState(createGame(mode));
  }, [mode]);

  useEffect(() => {
    setMode(initialMode);
    setState(createGame(initialMode));
  }, [initialMode]);

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
      let next = applyMove(current, move);
      if (next.status !== GAME_STATUS.IN_PROGRESS) return next;

      const aiMove = chooseMove(next, difficulty);
      if (aiMove !== null) {
        next = applyMove(next, aiMove);
      }
      return next;
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
        <div className="tag">Board: {mode === 'classic' ? 'Classic' : 'Ultimate Tic-Tac-Toe'}</div>
      </div>
      <div className="status">
        <div>
          <div className="card-title">Solo mode</div>
          <div>{statusText}</div>
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
