import { applyMove, getAvailableMoves } from './index.js';
import { GAME_STATUS, PLAYER_O, PLAYER_X } from './state.js';
import { checkClassicWinner, WIN_LINES } from './classic.js';
import { getAdjacentCells, getAdjacentEmptyPairs } from './adjacent.js';

export const DIFFICULTY_LEVELS = [1, 2, 3, 4, 5];

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function opposite(player) {
  return player === PLAYER_X ? PLAYER_O : PLAYER_X;
}

function findBlockingCell(board, player) {
  for (const line of WIN_LINES) {
    const marks = line.map((idx) => board[idx]);
    const emptyIndex = marks.indexOf(null);
    if (emptyIndex === -1) continue;
    const [a, b, c] = line;
    const values = [board[a], board[b], board[c]];
    if (values.filter((v) => v === player).length === 2 && values.includes(null)) {
      return line[emptyIndex];
    }
  }
  return null;
}

function immediateClassicMove(state, player) {
  for (const line of WIN_LINES) {
    const marks = line.map((idx) => state.board[idx]);
    const emptyIndex = marks.indexOf(null);
    if (emptyIndex === -1) continue;
    const [a, b, c] = line;
    const values = [state.board[a], state.board[b], state.board[c]];
    if (values.filter((v) => v === player).length === 2 && values.includes(null)) {
      return line[emptyIndex];
    }
  }
  return null;
}

function heuristicClassic(state) {
  const { currentPlayer } = state;
  // Win if possible
  const winningMove = immediateClassicMove(state, currentPlayer);
  if (winningMove !== null) return winningMove;
  // Block opponent win
  const blockMove = immediateClassicMove(state, opposite(currentPlayer));
  if (blockMove !== null) return blockMove;
  // Favor center, then corners
  const preferred = [4, 0, 2, 6, 8, 1, 3, 5, 7];
  for (const idx of preferred) {
    if (state.board[idx] === null) return idx;
  }
  return null;
}

function minimaxClassic(state, player, depth, alpha = -Infinity, beta = Infinity) {
  const { winner } = checkClassicWinner(state.board);
  if (winner === player) return { score: 10 + depth };
  if (winner === opposite(player)) return { score: -10 - depth };
  if (state.board.every((c) => c !== null)) return { score: 0 };
  if (depth <= 0) return { score: 0 };

  const moves = getAvailableMoves(state);
  let bestMove = null;
  let bestScore = -Infinity;

  for (const move of moves) {
    const next = applyMove(state, move);
    const { score } = minimaxClassic(next, player, depth - 1, -beta, -alpha);
    const adjustedScore = -score;
    if (adjustedScore > bestScore) {
      bestScore = adjustedScore;
      bestMove = move;
    }
    alpha = Math.max(alpha, adjustedScore);
    if (alpha >= beta) break;
  }
  return { move: bestMove, score: bestScore };
}

function nestedHeuristic(state) {
  // Light-weight heuristic for nested games: try to win a mini-board or send opponent
  // into a constrained board that helps us.
  const moves = getAvailableMoves(state);
  const { currentPlayer } = state;
  let best = null;
  let bestScore = -Infinity;

  for (const move of moves) {
    const next = applyMove(state, move);
    let score = 0;
    const board = next.miniBoards[move.boardIndex];
    if (board.winner === currentPlayer) score += 3;
    if (next.mainBoard.filter((c) => c === currentPlayer).length >= 2) score += 2;
    if (next.nextBoardConstraint === null) score += 0.5; // keep flexibility
    if (score > bestScore) {
      bestScore = score;
      best = move;
    }
  }
  return best ?? moves[0];
}

export function chooseMove(state, difficulty = 3) {
  if (!DIFFICULTY_LEVELS.includes(difficulty)) {
    throw new Error(`Unknown difficulty ${difficulty}`);
  }
  if (state.status !== GAME_STATUS.IN_PROGRESS) {
    return null;
  }

  const moves = getAvailableMoves(state);
  if (!moves.length) return null;
  if (difficulty === 1) return randomChoice(moves);

  if (state.mode === 'adjacent') {
    const preferred = [4, 0, 2, 6, 8, 1, 3, 5, 7];
    for (const idx of preferred) {
      if (moves.includes(idx)) return idx;
    }
    return randomChoice(moves);
  }

  if (state.mode === 'classic') {
    if (difficulty === 2) {
      return heuristicClassic(state);
    }
    if (difficulty === 3) {
      const move = heuristicClassic(state);
      return move !== null ? move : randomChoice(moves);
    }
    if (difficulty === 4) {
      const { move } = minimaxClassic(state, state.currentPlayer, 4);
      return move ?? heuristicClassic(state);
    }
    if (difficulty === 5) {
      const remaining = state.board.filter((c) => c === null).length;
      const depth = Math.min(9, remaining);
      const { move } = minimaxClassic(state, state.currentPlayer, depth);
      return move ?? heuristicClassic(state);
    }
  }

  // Nested variant: difficulty scales by heuristic and shallow search to keep it fast.
  if (difficulty === 2) return randomChoice(moves);
  if (difficulty === 3) return nestedHeuristic(state);
  if (difficulty >= 4) {
    const best = nestedHeuristic(state);
    return best ?? randomChoice(moves);
  }
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
