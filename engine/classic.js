import { cloneState, GAME_STATUS, PLAYER_O, PLAYER_X, statusFromWinner } from './state.js';

export const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export function getAvailableMovesClassic(state) {
  if (state.status !== GAME_STATUS.IN_PROGRESS) return [];
  return state.board
    .map((cell, idx) => (cell === null ? idx : null))
    .filter((idx) => idx !== null);
}

export function checkClassicWinner(board) {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    const value = board[a];
    if (
      (value === PLAYER_X || value === PLAYER_O) &&
      value === board[b] &&
      value === board[c]
    ) {
      return { winner: board[a], line };
    }
  }
  return { winner: null, line: null };
}

export function isBoardFull(board) {
  return board.every((cell) => cell !== null);
}

export function applyClassicMove(state, position) {
  if (state.mode !== 'classic') throw new Error('Classic move applied to non-classic state');
  if (state.status !== GAME_STATUS.IN_PROGRESS) throw new Error('Game already finished');
  if (position < 0 || position > 8) throw new Error('Position out of bounds');
  if (state.board[position] !== null) throw new Error('Cell already filled');

  const next = cloneState(state);
  next.board[position] = state.currentPlayer;
  next.lastMove = { position, player: state.currentPlayer };
  next.history = [...state.history, next.lastMove];

  const { winner, line } = checkClassicWinner(next.board);
  if (winner) {
    next.winner = winner;
    next.status = statusFromWinner(winner);
    next.winLine = line;
  } else if (isBoardFull(next.board)) {
    next.status = GAME_STATUS.DRAW;
  } else {
    next.currentPlayer = state.currentPlayer === PLAYER_X ? PLAYER_O : PLAYER_X;
  }

  return next;
}
