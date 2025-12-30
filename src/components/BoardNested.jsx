import React from 'react';
import { GAME_STATUS } from '../../engine/index.js';

function MiniBoard({ board, boardIndex, state, onMove }) {
  const constraintBoard =
    state.nextBoardConstraint === null
      ? null
      : state.miniBoards[state.nextBoardConstraint] || null;
  const constraintIsOpen =
    constraintBoard && !constraintBoard.winner && !constraintBoard.isFull;
  const isConstrained =
    state.nextBoardConstraint === null ||
    !constraintIsOpen ||
    state.nextBoardConstraint === boardIndex;
  const closed = board.winner || board.isFull;
  const label = `Mini board ${boardIndex + 1}`;

  return (
    <div className="mini-board" aria-label={label} role="grid">
      {board.winner && <span className="badge">{board.winner} won</span>}
      {board.isFull && !board.winner && <span className="badge">draw</span>}
      {board.cells.map((cell, cellIndex) => {
        const locked =
          cell !== null ||
          closed ||
          state.status !== GAME_STATUS.IN_PROGRESS ||
          !isConstrained;
        const isWin = board.line?.includes(cellIndex);
        return (
          <button
            key={cellIndex}
            className={`cell ${cell ? `mark-${cell.toLowerCase()}` : ''} ${locked ? 'locked' : ''} ${isWin ? 'win' : ''}`}
            onClick={() => !locked && onMove({ boardIndex, cellIndex })}
            disabled={locked}
            aria-label={`${label} cell ${cellIndex + 1} ${cell ? `occupied by ${cell}` : 'empty'}`}
          >
            {cell}
          </button>
        );
      })}
    </div>
  );
}

export default function BoardNested({ state, onMove }) {
  return (
    <div className="board classic-board" aria-label="Nested tic tac toe board">
      {state.miniBoards.map((board, idx) => (
        <MiniBoard key={idx} board={board} boardIndex={idx} state={state} onMove={onMove} />
      ))}
    </div>
  );
}
