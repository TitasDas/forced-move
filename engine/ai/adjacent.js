import { applyMove, getAvailableMoves } from '../index.js';
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

function opponentImmediateWins(board, player) {
  const threats = new Set();
  for (const line of WIN_LINES) {
    const marks = line.map((idx) => board[idx]);
    const emptyIndex = marks.indexOf(null);
    if (emptyIndex === -1) continue;
    const [a, b, c] = line;
    const values = [board[a], board[b], board[c]];
    if (values.filter((v) => v === player).length === 2 && values.includes(null)) {
      threats.add(line[emptyIndex]);
    }
  }
  return threats;
}

function scoreConstraintPair(state, position, pair) {
  const shadowBoard = state.board.slice();
  shadowBoard[position] = state.currentPlayer;
  const oppThreats = opponentImmediateWins(shadowBoard, opposite(state.currentPlayer));
  let score = 0;
  if (oppThreats.has(pair[0])) score -= 50;
  if (oppThreats.has(pair[1])) score -= 50;
  const empties = pair.filter((p) => shadowBoard[p] === null).length;
  score -= empties * 5;
  if (pair.includes(4)) score += 8;
  return score;
}

function scoreAdjacentState(state, player) {
  if (state.winner === player) return 1000;
  if (state.winner === opposite(player)) return -1000;
  if (state.status === GAME_STATUS.DRAW) return 0;

  let score = 0;
  for (const line of WIN_LINES) {
    const vals = line.map((idx) => state.board[idx]);
    const mine = vals.filter((v) => v === player).length;
    const theirs = vals.filter((v) => v === opposite(player)).length;
    const empties = vals.filter((v) => v === null).length;
    if (mine === 2 && empties === 1) score += 25;
    if (theirs === 2 && empties === 1) score -= 20;
    if (mine === 1 && empties === 2) score += 3;
    if (theirs === 1 && empties === 2) score -= 2;
  }
  // Prefer giving fewer options to opponent.
  const constraintSize = state.constraintTargets ? state.constraintTargets.length : 0;
  score -= constraintSize * 0.5;
  return score;
}

function minimaxAdjacent(state, player, depth, alpha = -Infinity, beta = Infinity) {
  if (depth === 0 || state.status !== GAME_STATUS.IN_PROGRESS) {
    return { score: scoreAdjacentState(state, player) };
  }
  const moves = getAvailableMoves(state);
  let bestMove = null;
  let bestScore = -Infinity;

  for (const move of moves) {
    const fullMove = typeof move === 'number' ? buildAdjacentMove(state, move) : move;
    let next;
    try {
      next = applyMove(state, fullMove);
    } catch {
      continue; // skip illegal branches
    }
    const { score } = minimaxAdjacent(next, player, depth - 1, -beta, -alpha);
    const adjusted = -score;
    if (adjusted > bestScore) {
      bestScore = adjusted;
      bestMove = move;
    }
    alpha = Math.max(alpha, adjusted);
    if (alpha >= beta) break;
  }
  return { move: bestMove, score: bestScore };
}

export function chooseAdjacentMove(state, difficulty = 3) {
  if (state.status !== GAME_STATUS.IN_PROGRESS) return null;
  const moves = getAvailableMoves(state);
  if (!moves.length) return null;
  if (difficulty === 1) return randomChoice(moves);
  if (difficulty === 2) return heuristicAdjacent(state, moves);
  if (difficulty === 3) {
    const { move } = minimaxAdjacent(state, state.currentPlayer, 2);
    return move ?? heuristicAdjacent(state, moves);
  }
  if (difficulty === 4) {
    const { move } = minimaxAdjacent(state, state.currentPlayer, 4);
    return move ?? heuristicAdjacent(state, moves);
  }
  // Level 5: deeper search to be very hard to beat.
  const remaining = state.board.filter((c) => c === null).length;
  const depth = Math.max(4, Math.min(10, remaining * 2));
  const { move } = minimaxAdjacent(state, state.currentPlayer, depth);
  return move ?? heuristicAdjacent(state, moves);
}

export function buildAdjacentMove(state, position) {
  const shadowBoard = state.board.slice();
  shadowBoard[position] = state.currentPlayer;
  const pairs = getAdjacentEmptyPairs(shadowBoard);
  if (pairs.length) {
    let bestPair = pairs[0];
    let bestScore = -Infinity;
    for (const pair of pairs) {
      const score = scoreConstraintPair(state, position, pair);
      if (score > bestScore) {
        bestScore = score;
        bestPair = pair;
      }
    }
    return { position, allowed: bestPair };
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
