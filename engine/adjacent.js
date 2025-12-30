import {
  cloneState,
  GAME_STATUS,
  PLAYER_O,
  PLAYER_X,
  statusFromWinner,
} from './state.js';
import { WIN_LINES, checkClassicWinner, isBoardFull } from './classic.js';

const ADJACENT_MAP = {
  0: [1, 3],
  1: [0, 2, 4],
  2: [1, 5],
  3: [0, 4, 6],
  4: [1, 3, 5, 7],
  5: [2, 4, 8],
  6: [3, 7],
  7: [4, 6, 8],
  8: [5, 7],
};

export function getAdjacentCells(position) {
  return ADJACENT_MAP[position] || [];
}

export function getAvailableMovesAdjacent(state) {
  if (state.status !== GAME_STATUS.IN_PROGRESS) return [];
  const empties = state.board
    .map((cell, idx) => (cell === null ? idx : null))
    .filter((idx) => idx !== null);

  if (state.constraintTargets && state.constraintTargets.length) {
    const constrained = state.constraintTargets.filter((idx) => state.board[idx] === null);
    if (constrained.length) return constrained;
  }
  return empties;
}

export function applyAdjacentMove(state, move) {
  if (state.mode !== 'adjacent') throw new Error('Adjacent move applied to non-adjacent state');
  if (state.status !== GAME_STATUS.IN_PROGRESS) throw new Error('Game already finished');
  const { position, allowed = [] } = move;
  if (typeof position !== 'number' || position < 0 || position > 8) {
    throw new Error('Position out of bounds');
  }
  if (state.board[position] !== null) throw new Error('Cell already filled');

  // Enforce constraint from previous turn
  if (state.constraintTargets && state.constraintTargets.length) {
    const legal = state.constraintTargets.filter((idx) => state.board[idx] === null);
    if (legal.length) {
      if (!legal.includes(position)) {
        throw new Error('Move not in constrained cells');
      }
    }
  }

  const next = cloneState(state);
  next.board[position] = state.currentPlayer;
  next.lastMove = { position, player: state.currentPlayer, allowed };
  next.history = [...state.history, next.lastMove];

  const { winner, line } = checkClassicWinner(next.board);
  if (winner) {
    next.winner = winner;
    next.status = statusFromWinner(winner);
    next.winLine = line;
    next.constraintTargets = [];
    return next;
  }
  if (isBoardFull(next.board)) {
    next.status = GAME_STATUS.DRAW;
    next.constraintTargets = [];
    return next;
  }

  // Determine constraint for the opponent based on allowed adjacent cells chosen by current player.
  const adjacents = getAdjacentCells(position).filter((idx) => next.board[idx] === null);
  const chosen = Array.isArray(allowed)
    ? allowed.filter((idx) => adjacents.includes(idx)).slice(0, 2)
    : [];
  const constraint = chosen.length ? chosen : adjacents.slice(0, 2);
  next.constraintTargets = constraint;

  next.currentPlayer = state.currentPlayer === PLAYER_X ? PLAYER_O : PLAYER_X;
  return next;
}
