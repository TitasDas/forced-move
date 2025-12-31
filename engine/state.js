export const GAME_VERSION = '1.0.0';
export const PLAYER_X = 'X';
export const PLAYER_O = 'O';

export const GAME_STATUS = {
  IN_PROGRESS: 'in_progress',
  X_WON: 'x_won',
  O_WON: 'o_won',
  DRAW: 'draw',
};

export function createAdjacentGame() {
  return {
    version: GAME_VERSION,
    mode: 'adjacent',
    board: Array(9).fill(null),
    currentPlayer: PLAYER_X,
    status: GAME_STATUS.IN_PROGRESS,
    winner: null,
    lastMove: null,
    history: [],
    constraintTargets: [],
  };
}

export function createNestedGame() {
  return {
    version: GAME_VERSION,
    mode: 'nested',
    miniBoards: Array(9)
      .fill(null)
      .map(() => ({
        cells: Array(9).fill(null),
        winner: null,
        isFull: false,
      })),
    mainBoard: Array(9).fill(null),
    currentPlayer: PLAYER_X,
    status: GAME_STATUS.IN_PROGRESS,
    winner: null,
    lastMove: null,
    nextBoardConstraint: null, // null means free choice
    history: [],
  };
}

export function cloneState(state) {
  // Avoid mutating original state so the engine stays deterministic.
  if (typeof structuredClone === 'function') {
    return structuredClone(state);
  }
  return JSON.parse(JSON.stringify(state));
}

export function serializeState(state) {
  return JSON.stringify(state);
}

export function deserializeState(serialized) {
  const parsed = JSON.parse(serialized);
  if (parsed.version !== GAME_VERSION) {
    throw new Error(
      `Unsupported game version ${parsed.version}. Expected ${GAME_VERSION}. Consider adding a migrator.`,
    );
  }
  return parsed;
}

export function statusFromWinner(winner) {
  if (winner === PLAYER_X) return GAME_STATUS.X_WON;
  if (winner === PLAYER_O) return GAME_STATUS.O_WON;
  return GAME_STATUS.DRAW;
}
