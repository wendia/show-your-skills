import { describe, test, expect } from 'vitest';
import { undoMoveEffect } from '../undoMove';
import { createMockGameState } from '@/__tests__/utils/testUtils';
import { SkillContext } from '@/skills/core/SkillRegistry';

describe('undoMoveEffect', () => {
  const createContext = (gameState = createMockGameState()): SkillContext => ({
    gameState,
    currentPlayer: { id: 'black', color: 'black' },
  });

  describe('execute', () => {
    test('should return null when history is empty', () => {
      const gameState = createMockGameState();
      const context = createContext(gameState);
      const result = undoMoveEffect.execute(context, {});
      expect(result).toBeNull();
    });

    test('should remove last placed stone', () => {
      const gameState = createMockGameState();
      gameState.board[7][7] = 'black';
      gameState.history.push({
        type: 'place',
        position: { row: 7, col: 7 },
        player: 'black',
      });

      const context = createContext(gameState);
      const result = undoMoveEffect.execute(context, {});

      expect(result).not.toBeNull();
      expect(result?.board[7][7]).toBeNull();
    });

    test('should find last place action in history (skip skill actions)', () => {
      const gameState = createMockGameState();
      gameState.board[7][7] = 'black';
      gameState.history.push(
        { type: 'place', position: { row: 7, col: 7 }, player: 'black' },
        { type: 'skill', player: 'black', skillId: 'some_skill' }
      );

      const context = createContext(gameState);
      const result = undoMoveEffect.execute(context, {});

      expect(result).not.toBeNull();
      expect(result?.board[7][7]).toBeNull();
    });

    test('should restore board position to null', () => {
      const gameState = createMockGameState();
      gameState.board[5][5] = 'white';
      gameState.history.push({
        type: 'place',
        position: { row: 5, col: 5 },
        player: 'white',
      });

      const context = createContext(gameState);
      const result = undoMoveEffect.execute(context, {});

      expect(result?.board[5][5]).toBeNull();
    });

    test('should update currentPlayer to last move player', () => {
      const gameState = createMockGameState();
      gameState.currentPlayer = 'white'; // White's turn now
      gameState.board[7][7] = 'black';
      gameState.history.push({
        type: 'place',
        position: { row: 7, col: 7 },
        player: 'black',
      });

      const context = createContext(gameState);
      const result = undoMoveEffect.execute(context, {});

      expect(result?.currentPlayer).toBe('black');
    });

    test('should decrement turn count', () => {
      const gameState = createMockGameState();
      gameState.turn = 5;
      gameState.board[7][7] = 'black';
      gameState.history.push({
        type: 'place',
        position: { row: 7, col: 7 },
        player: 'black',
      });

      const context = createContext(gameState);
      const result = undoMoveEffect.execute(context, {});

      expect(result?.turn).toBe(4);
    });

    test('should truncate history after undone move', () => {
      const gameState = createMockGameState();
      gameState.board[7][7] = 'black';
      gameState.board[7][8] = 'white';
      gameState.history.push(
        { type: 'place', position: { row: 7, col: 7 }, player: 'black' },
        { type: 'place', position: { row: 7, col: 8 }, player: 'white' }
      );

      const context = createContext(gameState);
      const result = undoMoveEffect.execute(context, {});

      expect(result?.history.length).toBe(1);
    });

    test('should not modify original board or history', () => {
      const gameState = createMockGameState();
      gameState.board[7][7] = 'black';
      gameState.history.push({
        type: 'place',
        position: { row: 7, col: 7 },
        player: 'black',
      });

      const context = createContext(gameState);
      undoMoveEffect.execute(context, {});

      expect(gameState.board[7][7]).toBe('black');
      expect(gameState.history.length).toBe(1);
    });

    test('should return null when history has only skill actions', () => {
      const gameState = createMockGameState();
      gameState.history.push({
        type: 'skill',
        player: 'black',
        skillId: 'some_skill',
      });

      const context = createContext(gameState);
      const result = undoMoveEffect.execute(context, {});

      expect(result).toBeNull();
    });
  });
});
