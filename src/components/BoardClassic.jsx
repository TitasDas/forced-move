import React from 'react';
import { GAME_STATUS } from '../../engine/index.js';

export default function BoardClassic({ state, onMove }) {
  const { board, winLine } = state;
  const constrained =
    state.mode === 'adjacent' && state.constraintTargets && state.constraintTargets.length
      ? state.constraintTargets.filter((idx) => state.board[idx] === null)
      : null;
  return (
    <div
      className="board classic-board"
      role="grid"
      aria-label="Classic tic tac toe board"
      aria-live="polite"
    >
      {board.map((cell, idx) => {
        const locked =
          cell !== null ||
          state.status !== GAME_STATUS.IN_PROGRESS ||
          state.currentPlayer === null ||
          (constrained && !constrained.includes(idx));
        const isWin = winLine?.includes(idx);
        return (
          <button
            key={idx}
            className={`cell ${cell ? `mark-${cell.toLowerCase()}` : ''} ${locked ? 'locked' : ''} ${isWin ? 'win' : ''}`}
            onClick={() => !locked && onMove(idx)}
            disabled={locked}
            aria-label={`Cell ${idx + 1} ${cell ? `occupied by ${cell}` : 'empty'}`}
          >
            {cell}
          </button>
        );
      })}
    </div>
  );
}
