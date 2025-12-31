import { getAvailableMoves } from '../index.js';
import { GAME_STATUS, PLAYER_O, PLAYER_X } from '../state.js';
import { WIN_LINES } from '../classic.js';
import { getAdjacentCells, getAdjacentEmptyPairs } from '../adjacent.js';

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function opposite(player) {
  return player === PLAYER_X ? PLAYER_O : PLAYER_X;
}

function immediateClassicMove(state, player, legalMoves) {
  for (const line of WIN_LINES) {
    const marks = line.map((idx) => state.board[idx]);
    const emptyIndex = marks.indexOf(null);
    if (emptyIndex === -1) continue;
    const [a, b, c] = line;
    const values = [state.board[a], state.board[b], state.board[c]];
    if (values.filter((v) => v === player).length === 2 && values.includes(null)) {
      const target = line[emptyIndex];
      if (legalMoves.includes(target)) return target;
    }
  }
  return null;
}

function heuristicAdjacent(state, legalMoves) {
  const { currentPlayer } = state;
  const winningMove = immediateClassicMove(state, currentPlayer, legalMoves);
  if (winningMove !== null) return winningMove;
  const blockMove = immediateClassicMove(state, opposite(currentPlayer), legalMoves);
  if (blockMove !== null) return blockMove;
  const preferred = [4, 0, 2, 6, 8, 1, 3, 5, 7];
  for (const idx of preferred) {
    if (legalMoves.includes(idx)) return idx;
  }
  return legalMoves[0];
}

export function chooseAdjacentMove(state, difficulty = 3) {
  if (state.status !== GAME_STATUS.IN_PROGRESS) return null;
  const moves = getAvailableMoves(state);
  if (!moves.length) return null;
  if (difficulty === 1) return randomChoice(moves);
  if (difficulty === 2) return heuristicAdjacent(state, moves);
  if (difficulty === 3) return heuristicAdjacent(state, moves);
  if (difficulty >= 4) return heuristicAdjacent(state, moves);
  return randomChoice(moves);
}

export function buildAdjacentMove(state, position) {
  const shadowBoard = state.board.slice();
  shadowBoard[position] = state.currentPlayer;
  const pairs = getAdjacentEmptyPairs(shadowBoard);
  if (pairs.length) {
    return { position, allowed: pairs[0] };
  }
  // Fallback: use any adjacent pair even if one is filled, to keep the game moving.
  for (let i = 0; i < 9; i += 1) {
    for (const neighbor of getAdjacentCells(i)) {
      if (neighbor === i) continue;
      return { position, allowed: [i, neighbor] };
    }
  }
  return { position, allowed: [0, 1] };
}
