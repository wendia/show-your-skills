import { describe, test, expect } from 'vitest';
import {
  createEmptyBoard,
  createInitialGameState,
  isValidPosition,
  isEmptyPosition,
  checkWinner,
  isPositionBlocked,
  cleanExpiredBlocks,
  getAllStones,
  flipStones,
  removeStones,
} from '../Game';
import { createMockGameState, createWinningBoard, placeStonesOnBoard, createMockBlockedZone } from '@/__tests__/utils/testUtils';

describe('createEmptyBoard', () => {
  test('should create 15x15 board filled with null', () => {
    const board = createEmptyBoard(15);
    expect(board.length).toBe(15);
    expect(board[0].length).toBe(15);
    expect(board.every(row => row.every(cell => cell === null))).toBe(true);
  });

  test('should create board with custom size', () => {
    const board = createEmptyBoard(10);
    expect(board.length).toBe(10);
    expect(board[0].length).toBe(10);
  });
});

describe('createInitialGameState', () => {
  test('should create state with correct initial values', () => {
    const state = createInitialGameState();
    expect(state.boardSize).toBe(15);
    expect(state.currentPlayer).toBe('black');
    expect(state.phase).toBe('playing');
    expect(state.winner).toBeNull();
    expect(state.turn).toBe(1);
    expect(state.remainingMoves).toBe(1);
    expect(state.blockedZones).toEqual([]);
    expect(state.history).toEqual([]);
  });

  test('should accept custom config', () => {
    const state = createInitialGameState({ boardSize: 10 });
    expect(state.boardSize).toBe(10);
    expect(state.board.length).toBe(10);
  });
});

describe('isValidPosition', () => {
  test('should return true for valid positions', () => {
    expect(isValidPosition({ row: 0, col: 0 }, 15)).toBe(true);
    expect(isValidPosition({ row: 7, col: 7 }, 15)).toBe(true);
    expect(isValidPosition({ row: 14, col: 14 }, 15)).toBe(true);
  });

  test('should return false for negative row/col', () => {
    expect(isValidPosition({ row: -1, col: 0 }, 15)).toBe(false);
    expect(isValidPosition({ row: 0, col: -1 }, 15)).toBe(false);
    expect(isValidPosition({ row: -1, col: -1 }, 15)).toBe(false);
  });

  test('should return false for positions outside board', () => {
    expect(isValidPosition({ row: 15, col: 0 }, 15)).toBe(false);
    expect(isValidPosition({ row: 0, col: 15 }, 15)).toBe(false);
    expect(isValidPosition({ row: 100, col: 100 }, 15)).toBe(false);
  });
});

describe('isEmptyPosition', () => {
  test('should return true for null cell', () => {
    const board = createEmptyBoard(15);
    expect(isEmptyPosition(board, { row: 7, col: 7 })).toBe(true);
  });

  test('should return false for occupied cell', () => {
    const board = createEmptyBoard(15);
    board[7][7] = 'black';
    expect(isEmptyPosition(board, { row: 7, col: 7 })).toBe(false);
  });
});

describe('checkWinner', () => {
  test('should detect horizontal win (5 in a row)', () => {
    const { board, lastPosition } = createWinningBoard('horizontal', 'black');
    const result = checkWinner(board, lastPosition, 'black');
    expect(result).toBe('black');
  });

  test('should detect vertical win (5 in a column)', () => {
    const { board, lastPosition } = createWinningBoard('vertical', 'white');
    const result = checkWinner(board, lastPosition, 'white');
    expect(result).toBe('white');
  });

  test('should detect diagonal win (top-left to bottom-right)', () => {
    const { board, lastPosition } = createWinningBoard('diagonal', 'black');
    const result = checkWinner(board, lastPosition, 'black');
    expect(result).toBe('black');
  });

  test('should detect anti-diagonal win (top-right to bottom-left)', () => {
    const { board, lastPosition } = createWinningBoard('anti-diagonal', 'white');
    const result = checkWinner(board, lastPosition, 'white');
    expect(result).toBe('white');
  });

  test('should return null for no winner', () => {
    const board = createEmptyBoard(15);
    board[7][7] = 'black';
    board[7][8] = 'black';
    const result = checkWinner(board, { row: 7, col: 8 }, 'black');
    expect(result).toBeNull();
  });

  test('should return null for only 4 consecutive stones', () => {
    const board = createEmptyBoard(15);
    for (let i = 0; i < 4; i++) {
      board[7][5 + i] = 'black';
    }
    const result = checkWinner(board, { row: 7, col: 8 }, 'black');
    expect(result).toBeNull();
  });

  test('should detect win from middle of sequence', () => {
    const board = createEmptyBoard(15);
    // Place stones: position 3,4,5,6,7 with middle at 5
    for (let i = 3; i <= 7; i++) {
      board[7][i] = 'black';
    }
    const result = checkWinner(board, { row: 7, col: 5 }, 'black');
    expect(result).toBe('black');
  });
});

describe('isPositionBlocked', () => {
  test('should return false when no blocked zones exist', () => {
    const result = isPositionBlocked({ row: 7, col: 7 }, [], 1);
    expect(result).toBe(false);
  });

  test('should return true for position inside active 3x3 blocked zone', () => {
    const zone = createMockBlockedZone({ centerPosition: { row: 7, col: 7 }, expiresAfterTurn: 5 });
    // Center position
    expect(isPositionBlocked({ row: 7, col: 7 }, [zone], 1)).toBe(true);
    // Edge of 3x3 zone
    expect(isPositionBlocked({ row: 6, col: 6 }, [zone], 1)).toBe(true);
    expect(isPositionBlocked({ row: 8, col: 8 }, [zone], 1)).toBe(true);
  });

  test('should return false for position outside blocked zone', () => {
    const zone = createMockBlockedZone({ centerPosition: { row: 7, col: 7 }, expiresAfterTurn: 5 });
    expect(isPositionBlocked({ row: 5, col: 7 }, [zone], 1)).toBe(false);
    expect(isPositionBlocked({ row: 9, col: 7 }, [zone], 1)).toBe(false);
  });

  test('should return false for expired blocked zone', () => {
    const zone = createMockBlockedZone({ centerPosition: { row: 7, col: 7 }, expiresAfterTurn: 3 });
    expect(isPositionBlocked({ row: 7, col: 7 }, [zone], 4)).toBe(false);
  });

  test('should handle edge positions (corner cases)', () => {
    const zone = createMockBlockedZone({ centerPosition: { row: 0, col: 0 }, expiresAfterTurn: 5 });
    expect(isPositionBlocked({ row: 0, col: 0 }, [zone], 1)).toBe(true);
    expect(isPositionBlocked({ row: 1, col: 1 }, [zone], 1)).toBe(true);
    expect(isPositionBlocked({ row: 2, col: 2 }, [zone], 1)).toBe(false);
  });

  test('should handle overlapping blocked zones', () => {
    const zone1 = createMockBlockedZone({ centerPosition: { row: 5, col: 5 }, expiresAfterTurn: 5 });
    const zone2 = createMockBlockedZone({ centerPosition: { row: 6, col: 6 }, expiresAfterTurn: 5 });
    expect(isPositionBlocked({ row: 6, col: 6 }, [zone1, zone2], 1)).toBe(true);
  });
});

describe('cleanExpiredBlocks', () => {
  test('should remove expired blocked zones', () => {
    const zones = [
      createMockBlockedZone({ expiresAfterTurn: 3 }),
      createMockBlockedZone({ expiresAfterTurn: 5 }),
    ];
    const result = cleanExpiredBlocks(zones, 4);
    expect(result.length).toBe(1);
    expect(result[0].expiresAfterTurn).toBe(5);
  });

  test('should keep active blocked zones', () => {
    const zones = [
      createMockBlockedZone({ expiresAfterTurn: 5 }),
      createMockBlockedZone({ expiresAfterTurn: 10 }),
    ];
    const result = cleanExpiredBlocks(zones, 3);
    expect(result.length).toBe(2);
  });

  test('should handle empty blocked zones array', () => {
    const result = cleanExpiredBlocks([], 1);
    expect(result).toEqual([]);
  });
});

describe('getAllStones', () => {
  test('should return empty array for empty board', () => {
    const board = createEmptyBoard(15);
    const stones = getAllStones(board);
    expect(stones).toEqual([]);
  });

  test('should return all stone positions with colors', () => {
    const board = createEmptyBoard(15);
    board[7][7] = 'black';
    board[7][8] = 'white';
    const stones = getAllStones(board);
    expect(stones.length).toBe(2);
    expect(stones.find(s => s.position.row === 7 && s.position.col === 7)?.color).toBe('black');
    expect(stones.find(s => s.position.row === 7 && s.position.col === 8)?.color).toBe('white');
  });
});

describe('flipStones', () => {
  test('should flip black stones to white', () => {
    const board = createEmptyBoard(15);
    board[7][7] = 'black';
    const newBoard = flipStones(board, [{ row: 7, col: 7 }]);
    expect(newBoard[7][7]).toBe('white');
  });

  test('should flip white stones to black', () => {
    const board = createEmptyBoard(15);
    board[7][7] = 'white';
    const newBoard = flipStones(board, [{ row: 7, col: 7 }]);
    expect(newBoard[7][7]).toBe('black');
  });

  test('should not modify empty positions', () => {
    const board = createEmptyBoard(15);
    const newBoard = flipStones(board, [{ row: 7, col: 7 }]);
    expect(newBoard[7][7]).toBeNull();
  });

  test('should not modify original board (immutability)', () => {
    const board = createEmptyBoard(15);
    board[7][7] = 'black';
    flipStones(board, [{ row: 7, col: 7 }]);
    expect(board[7][7]).toBe('black');
  });
});

describe('removeStones', () => {
  test('should set specified positions to null', () => {
    const board = createEmptyBoard(15);
    board[7][7] = 'black';
    board[7][8] = 'white';
    const newBoard = removeStones(board, [{ row: 7, col: 7 }, { row: 7, col: 8 }]);
    expect(newBoard[7][7]).toBeNull();
    expect(newBoard[7][8]).toBeNull();
  });

  test('should handle empty positions gracefully', () => {
    const board = createEmptyBoard(15);
    const newBoard = removeStones(board, [{ row: 7, col: 7 }]);
    expect(newBoard[7][7]).toBeNull();
  });
});
