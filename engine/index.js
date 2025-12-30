import { applyClassicMove, getAvailableMovesClassic } from './classic.js';
import { applyNestedMove, getAvailableMovesNested } from './nested.js';
import { createClassicGame, createNestedGame, GAME_STATUS } from './state.js';

export {
  createClassicGame,
  createNestedGame,
  GAME_STATUS,
} from './state.js';

export function createGame(mode = 'classic') {
  return mode === 'nested' ? createNestedGame() : createClassicGame();
}

export function applyMove(state, move) {
  if (state.mode === 'classic') {
    if (typeof move !== 'number') throw new Error('Classic move expects a number');
    return applyClassicMove(state, move);
  }
  if (state.mode === 'nested') {
    if (!move || typeof move.boardIndex !== 'number' || typeof move.cellIndex !== 'number') {
      throw new Error('Nested move expects boardIndex and cellIndex');
    }
    return applyNestedMove(state, move);
  }
  throw new Error(`Unsupported mode ${state.mode}`);
}

export function getAvailableMoves(state) {
  if (state.mode === 'classic') {
    return getAvailableMovesClassic(state);
  }
  if (state.mode === 'nested') {
    return getAvailableMovesNested(state);
  }
  return [];
}

export { getAvailableMovesClassic, getAvailableMovesNested };
