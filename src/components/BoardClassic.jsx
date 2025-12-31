import React from 'react';
import { GAME_STATUS } from '../../engine/index.js';

export default function BoardClassic({
  state,
  onMove,
  onSelect,
  pendingOrigin = null,
  pendingAllowed = [],
  selectableTargets = null,
}) {
  const { board, winLine } = state;
  const selectingTargets = Array.isArray(selectableTargets);
  const constrained =
    pendingOrigin === null &&
    state.mode === 'adjacent' &&
    state.constraintTargets &&
    state.constraintTargets.length
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
        const isOrigin = pendingOrigin === idx;
        let locked =
          state.status !== GAME_STATUS.IN_PROGRESS || state.currentPlayer === null;

        if (selectingTargets) {
          locked =
            locked ||
            (!isOrigin &&
              selectableTargets &&
              selectableTargets.length > 0 &&
              !selectableTargets.includes(idx));
        } else {
          locked =
            locked ||
            cell !== null ||
            (constrained && !constrained.includes(idx));
        }

        const isWin = winLine?.includes(idx);
        const isPendingOrigin = isOrigin;
        const isPendingChoice =
          pendingOrigin !== null && selectingTargets && selectableTargets.includes(idx);
        const isSelectedPending = pendingAllowed.includes(idx);
        const handler = onSelect || onMove;
        return (
          <button
            key={idx}
            className={`cell ${cell ? `mark-${cell.toLowerCase()}` : ''} ${locked ? 'locked' : ''} ${isWin ? 'win' : ''} ${isPendingOrigin ? 'pending-origin' : ''} ${isPendingChoice ? 'pending-choice' : ''} ${isSelectedPending ? 'pending-selected' : ''}`}
            onClick={() => !locked && handler && handler(idx)}
            disabled={locked}
            aria-label={`Cell ${idx + 1} ${cell ? `occupied by ${cell}` : 'empty'}`}
          >
            {cell || (pendingOrigin === idx ? state.currentPlayer : '')}
          </button>
        );
      })}
    </div>
  );
}
