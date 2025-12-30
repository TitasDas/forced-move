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
  const owner = board.winner;

  return (
    <div
      className={`mini-board ${owner ? `mini-owned mark-${owner.toLowerCase()}` : ''}`}
      aria-label={label}
      role="grid"
    >
      {owner && <span className="badge">{owner} won</span>}
      {board.isFull && !board.winner && <span className="badge">draw</span>}
      {board.cells.map((cell, cellIndex) => {
        const locked =
          cell !== null ||
          closed ||
          state.status !== GAME_STATUS.IN_PROGRESS ||
          !isConstrained;
        const isWin = board.line?.includes(cellIndex);
        const isClaimedCenter =
          owner && boardIndex === cellIndex; // highlight the winning cell that maps to main board
        return (
          <button
            key={cellIndex}
            className={`cell ${cell ? `mark-${cell.toLowerCase()}` : ''} ${locked ? 'locked' : ''} ${isWin ? 'win' : ''} ${isClaimedCenter ? 'claimed-mark' : ''}`}
            onClick={() => !locked && onMove({ boardIndex, cellIndex })}
            disabled={locked}
            aria-label={`${label} cell ${cellIndex + 1} ${cell ? `occupied by ${cell}` : 'empty'}`}
          >
            {isClaimedCenter && owner ? (
              <span className="claimed-symbol">{owner}</span>
            ) : (
              cell
            )}
          </button>
        );
      })}
      {owner && <div className="mini-overlay">{owner}</div>}
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
