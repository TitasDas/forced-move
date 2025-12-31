import { applyMove, getAvailableMoves } from '../index.js';
import { GAME_STATUS, PLAYER_O, PLAYER_X } from '../state.js';

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function nestedHeuristic(state) {
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
    if (next.nextBoardConstraint === null) score += 0.5;
    if (score > bestScore) {
      bestScore = score;
      best = move;
    }
  }
  return best ?? moves[0];
}

function scoreNestedState(state, player) {
  if (state.winner === player) return 1000;
  if (state.winner && state.winner !== player) return -1000;
  if (state.status === GAME_STATUS.DRAW) return 0;

  let score = 0;
  for (let i = 0; i < 9; i += 1) {
    if (state.mainBoard[i] === player) score += 12;
    if (state.mainBoard[i] === (player === PLAYER_X ? PLAYER_O : PLAYER_X)) score -= 12;
  }
  // Favor sending opponent into constrained boards.
  if (state.nextBoardConstraint === null) score += 1;
  const openBoards = state.miniBoards.filter((b) => !b.winner && !b.isFull).length;
  score -= openBoards * 0.2;
  return score;
}

function rolloutNested(state, player, plies, rand = Math.random) {
  let current = state;
  let depth = plies;
  while (depth > 0 && current.status === GAME_STATUS.IN_PROGRESS) {
    const moves = getAvailableMoves(current);
    if (!moves.length) break;
    const move = moves[Math.floor(rand() * moves.length)];
    current = applyMove(current, move);
    depth -= 1;
  }
  return scoreNestedState(current, player);
}

export function chooseNestedMove(state, difficulty = 3) {
  if (state.status !== GAME_STATUS.IN_PROGRESS) return null;
  const moves = getAvailableMoves(state);
  if (!moves.length) return null;
  if (difficulty === 1) return randomChoice(moves);
  if (difficulty === 2) return nestedHeuristic(state);
  if (difficulty === 3) {
    // Heuristic plus short rollouts.
    let best = null;
    let bestScore = -Infinity;
    for (const move of moves) {
      const next = applyMove(state, move);
      const estimate = rolloutNested(next, state.currentPlayer, 4);
      if (estimate > bestScore) {
        bestScore = estimate;
        best = move;
      }
    }
    return best ?? nestedHeuristic(state);
  }
  if (difficulty === 4) {
    // More rollouts, deeper plies.
    let best = null;
    let bestScore = -Infinity;
    const rolloutsPerMove = 24;
    for (const move of moves) {
      let total = 0;
      for (let i = 0; i < rolloutsPerMove; i += 1) {
        const next = applyMove(state, move);
        total += rolloutNested(next, state.currentPlayer, 8);
      }
      const avg = total / rolloutsPerMove;
      if (avg > bestScore) {
        bestScore = avg;
        best = move;
      }
    }
    return best ?? nestedHeuristic(state);
  }
  // Difficulty 5: heavier Monte Carlo search.
  let best = null;
  let bestScore = -Infinity;
  const rolloutsPerMove = 100;
  for (const move of moves) {
    let total = 0;
    for (let i = 0; i < rolloutsPerMove; i += 1) {
      const next = applyMove(state, move);
      total += rolloutNested(next, state.currentPlayer, 12, Math.random);
    }
    const avg = total / rolloutsPerMove;
    if (avg > bestScore) {
      bestScore = avg;
      best = move;
    }
  }
  return best ?? nestedHeuristic(state);
}
