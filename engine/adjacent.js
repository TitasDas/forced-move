import {
  cloneState,
  GAME_STATUS,
  PLAYER_O,
  PLAYER_X,
  statusFromWinner,
} from './state.js';
import { checkClassicWinner, isBoardFull } from './classic.js';

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

export function cellsAreAdjacent(a, b) {
  return getAdjacentCells(a).includes(b);
}

export function getAdjacentEmptyPairs(board) {
  const pairs = [];
  for (let i = 0; i < board.length; i += 1) {
    if (board[i] !== null) continue;
    for (const neighbor of getAdjacentCells(i)) {
      if (neighbor <= i) continue; // avoid duplicates and self
      if (board[neighbor] !== null) continue;
      pairs.push([i, neighbor]);
    }
  }
  return pairs;
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

  const cleanedAllowed = Array.isArray(allowed)
    ? Array.from(new Set(allowed)).filter(
        (idx) => Number.isInteger(idx) && idx >= 0 && idx <= 8 && idx !== position,
      )
    : [];
  if (cleanedAllowed.length !== 2) {
    throw new Error('Must choose two adjacent cells');
  }
  if (!cellsAreAdjacent(cleanedAllowed[0], cleanedAllowed[1])) {
    throw new Error('Chosen cells must be adjacent');
  }

  const emptyPairs = getAdjacentEmptyPairs(next.board);
  if (emptyPairs.length > 0) {
    if (next.board[cleanedAllowed[0]] !== null || next.board[cleanedAllowed[1]] !== null) {
      throw new Error('Chosen cells must be empty while empty adjacent pairs exist');
    }
  }

  const constraint = cleanedAllowed;

  const { winner, line } = checkClassicWinner(next.board);
  if (winner) {
    next.winner = winner;
    next.status = statusFromWinner(winner);
    next.winLine = line;
    next.constraintTargets = [];
    next.lastMove = { position, player: state.currentPlayer, allowed: constraint };
    next.history = [...state.history, next.lastMove];
    return next;
  }
  if (isBoardFull(next.board)) {
    next.status = GAME_STATUS.DRAW;
    next.constraintTargets = [];
    next.lastMove = { position, player: state.currentPlayer, allowed: constraint };
    next.history = [...state.history, next.lastMove];
    return next;
  }

  next.constraintTargets = constraint;

  next.lastMove = { position, player: state.currentPlayer, allowed: constraint };
  next.history = [...state.history, next.lastMove];
  next.currentPlayer = state.currentPlayer === PLAYER_X ? PLAYER_O : PLAYER_X;
  return next;
}
