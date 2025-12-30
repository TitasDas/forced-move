import {
  cloneState,
  GAME_STATUS,
  PLAYER_O,
  PLAYER_X,
  statusFromWinner,
} from './state.js';
import { WIN_LINES, isBoardFull, checkClassicWinner } from './classic.js';

function resolveMiniBoard(board) {
  const { winner, line } = checkClassicWinner(board.cells);
  const isFull = isBoardFull(board.cells);
  return {
    winner,
    line,
    isFull,
  };
}

function computeMainWinner(mainBoard) {
  const { winner, line } = checkClassicWinner(mainBoard);
  if (winner) {
    return { winner, line };
  }
  const full = mainBoard.every((cell, idx) => cell !== null || cell === 'DRAW');
  return { winner: null, line: null, isFull: full };
}

export function getAvailableMovesNested(state) {
  if (state.status !== GAME_STATUS.IN_PROGRESS) return [];

  const constraintBoard =
    state.nextBoardConstraint === null
      ? null
      : state.miniBoards[state.nextBoardConstraint] || null;
  const constraintIsOpen =
    constraintBoard && !constraintBoard.winner && !constraintBoard.isFull;
  const targetBoard = constraintIsOpen ? state.nextBoardConstraint : null;
  const moves = [];

  const boardIndices =
    targetBoard === null
      ? [...Array(9).keys()].filter(
          (idx) => !state.miniBoards[idx].winner && !state.miniBoards[idx].isFull,
        )
      : [targetBoard];

  for (const boardIndex of boardIndices) {
    const board = state.miniBoards[boardIndex];
    if (board.winner || board.isFull) continue;
    board.cells.forEach((cell, cellIndex) => {
      if (cell === null) {
        moves.push({ boardIndex, cellIndex });
      }
    });
  }
  return moves;
}

export function applyNestedMove(state, { boardIndex, cellIndex }) {
  if (state.mode !== 'nested') throw new Error('Nested move applied to non-nested state');
  if (state.status !== GAME_STATUS.IN_PROGRESS) throw new Error('Game already finished');
  if (boardIndex < 0 || boardIndex > 8 || cellIndex < 0 || cellIndex > 8) {
    throw new Error('Move out of bounds');
  }
  if (
    state.nextBoardConstraint !== null &&
    state.nextBoardConstraint !== boardIndex &&
    !state.miniBoards[state.nextBoardConstraint].winner &&
    !state.miniBoards[state.nextBoardConstraint].isFull
  ) {
    throw new Error('Must play in constrained mini board');
  }

  const targetBoard = state.miniBoards[boardIndex];
  if (targetBoard.winner || targetBoard.isFull) throw new Error('Mini board already closed');
  if (targetBoard.cells[cellIndex] !== null) throw new Error('Cell already filled');

  const next = cloneState(state);
  const boardCopy = cloneState(targetBoard);
  boardCopy.cells[cellIndex] = state.currentPlayer;
  const miniResolution = resolveMiniBoard(boardCopy);
  boardCopy.winner = miniResolution.winner;
  boardCopy.line = miniResolution.line;
  boardCopy.isFull = miniResolution.isFull;
  next.miniBoards[boardIndex] = boardCopy;

  if (miniResolution.winner) {
    next.mainBoard[boardIndex] = miniResolution.winner;
  } else if (miniResolution.isFull) {
    next.mainBoard[boardIndex] = 'DRAW';
  }

  const mainResolution = computeMainWinner(next.mainBoard);
  if (mainResolution.winner) {
    next.winner = mainResolution.winner;
    next.status = statusFromWinner(mainResolution.winner);
    next.winLine = mainResolution.line;
  } else if (mainResolution.isFull) {
    next.status = GAME_STATUS.DRAW;
  } else {
    next.status = GAME_STATUS.IN_PROGRESS;
  }

  const constraintBoard = next.miniBoards[cellIndex];
  next.nextBoardConstraint = constraintBoard && !constraintBoard.winner && !constraintBoard.isFull
    ? cellIndex
    : null;

  next.lastMove = { boardIndex, cellIndex, player: state.currentPlayer };
  next.history = [...state.history, next.lastMove];
  if (next.status === GAME_STATUS.IN_PROGRESS) {
    next.currentPlayer = state.currentPlayer === PLAYER_X ? PLAYER_O : PLAYER_X;
  }
  return next;
}
