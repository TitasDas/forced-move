import { applyMove, getAvailableMoves } from '../index.js';
import { GAME_STATUS } from '../state.js';

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

export function chooseNestedMove(state, difficulty = 3) {
  if (state.status !== GAME_STATUS.IN_PROGRESS) return null;
  const moves = getAvailableMoves(state);
  if (!moves.length) return null;
  if (difficulty === 1) return randomChoice(moves);
  if (difficulty === 2) return randomChoice(moves);
  if (difficulty === 3) return nestedHeuristic(state);
  if (difficulty >= 4) {
    const best = nestedHeuristic(state);
    return best ?? randomChoice(moves);
  }
  return randomChoice(moves);
}
