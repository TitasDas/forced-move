import { PLAYER_O, PLAYER_X } from './state.js';

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
