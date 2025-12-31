import { chooseAdjacentMove, buildAdjacentMove } from './adjacent.js';
import { chooseNestedMove } from './nested.js';
import { GAME_STATUS } from '../state.js';

export const DIFFICULTY_LEVELS = [1, 2, 3, 4, 5];

export function chooseMove(state, difficulty = 3) {
  if (!state || state.status !== GAME_STATUS.IN_PROGRESS) return null;
  if (state.mode === 'adjacent') return chooseAdjacentMove(state, difficulty);
  if (state.mode === 'nested') return chooseNestedMove(state, difficulty);
  return null;
}

export { buildAdjacentMove };
