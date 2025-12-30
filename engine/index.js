import { applyClassicMove, getAvailableMovesClassic } from './classic.js';
import { applyNestedMove, getAvailableMovesNested } from './nested.js';
import { applyAdjacentMove, getAvailableMovesAdjacent } from './adjacent.js';
import { createClassicGame, createAdjacentGame, createNestedGame, GAME_STATUS } from './state.js';

export {
  createClassicGame,
  createNestedGame,
  createAdjacentGame,
  GAME_STATUS,
} from './state.js';

export function createGame(mode = 'adjacent') {
  if (mode === 'nested') return createNestedGame();
  if (mode === 'adjacent' || mode === 'classic') return createAdjacentGame();
  return createAdjacentGame();
}

export function applyMove(state, move) {
  if (state.mode === 'classic') {
    if (typeof move !== 'number') throw new Error('Classic move expects a number');
    return applyClassicMove(state, move);
  }
  if (state.mode === 'adjacent') {
    if (!move || typeof move.position !== 'number') {
      throw new Error('Adjacent move expects { position, allowed[] }');
    }
    return applyAdjacentMove(state, move);
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
  if (state.mode === 'adjacent') {
    return getAvailableMovesAdjacent(state);
  }
  if (state.mode === 'nested') {
    return getAvailableMovesNested(state);
  }
  return [];
}

export { getAvailableMovesClassic, getAvailableMovesNested, getAvailableMovesAdjacent };
