import React from 'react';
import { GAME_STATUS } from '../../engine/index.js';

export default function BoardClassic({ state, onMove }) {
  const { board, winLine } = state;
  return (
    <div
      className="board classic-board"
      role="grid"
      aria-label="Classic tic tac toe board"
      aria-live="polite"
    >
      {board.map((cell, idx) => {
        const locked =
          cell !== null || state.status !== GAME_STATUS.IN_PROGRESS || state.currentPlayer === null;
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
