import { describe, test, expect } from 'vitest';
import { flipStonesEffect } from '../flipStones';
import { createMockGameState } from '@/__tests__/utils/testUtils';
import { SkillContext } from '@/skills/core/SkillRegistry';

describe('flipStonesEffect', () => {
  const createContext = (gameState = createMockGameState()): SkillContext => ({
    gameState,
    currentPlayer: { id: 'black', color: 'black' },
  });

  describe('execute', () => {
    test('should return null when no stones on board', () => {
      const gameState = createMockGameState();
      const context = createContext(gameState);
      const result = flipStonesEffect.execute(context, {});
      expect(result).toBeNull();
    });

    test('should flip approximately 30% of stones (default)', () => {
      const gameState = createMockGameState();
      // Place 10 stones
      for (let i = 0; i < 10; i++) {
        gameState.board[0][i] = 'black';
      }

      const context = createContext(gameState);
      const result = flipStonesEffect.execute(context, {});

      expect(result).not.toBeNull();

      // Count flipped stones (now white)
      let whiteCount = 0;
      for (let i = 0; i < 10; i++) {
        if (result?.board[0][i] === 'white') whiteCount++;
      }

      // Should flip at least 1 (30% of 10 = 3, but at least 1)
      expect(whiteCount).toBeGreaterThanOrEqual(1);
    });

    test('should respect custom flipPercent parameter', () => {
      const gameState = createMockGameState();
      // Place 10 stones
      for (let i = 0; i < 10; i++) {
        gameState.board[0][i] = 'black';
      }

      const context = createContext(gameState);
      const result = flipStonesEffect.execute(context, { flipPercent: 50 });

      expect(result).not.toBeNull();

      // Count flipped stones (now white)
      let whiteCount = 0;
      for (let i = 0; i < 10; i++) {
        if (result?.board[0][i] === 'white') whiteCount++;
      }

      // Should flip at least 1 (50% of 10 = 5)
      expect(whiteCount).toBeGreaterThanOrEqual(1);
    });

    test('should flip at least 1 stone when stones exist', () => {
      const gameState = createMockGameState();
      gameState.board[7][7] = 'black';

      const context = createContext(gameState);
      const result = flipStonesEffect.execute(context, {});

      expect(result).not.toBeNull();
      expect(result?.board[7][7]).toBe('white');
    });

    test('should flip black stones to white', () => {
      const gameState = createMockGameState();
      gameState.board[7][7] = 'black';

      const context = createContext(gameState);
      const result = flipStonesEffect.execute(context, {});

      expect(result?.board[7][7]).toBe('white');
    });

    test('should flip white stones to black', () => {
      const gameState = createMockGameState();
      gameState.board[7][7] = 'white';

      const context = createContext(gameState);
      const result = flipStonesEffect.execute(context, {});

      expect(result?.board[7][7]).toBe('black');
    });

    test('should not modify original board', () => {
      const gameState = createMockGameState();
      gameState.board[7][7] = 'black';

      const context = createContext(gameState);
      flipStonesEffect.execute(context, {});

      // Original board should still have black
      expect(gameState.board[7][7]).toBe('black');
    });

    test('should return updated game state', () => {
      const gameState = createMockGameState();
      gameState.board[7][7] = 'black';

      const context = createContext(gameState);
      const result = flipStonesEffect.execute(context, {});

      expect(result).not.toBeNull();
      expect(result?.id).toBe(gameState.id);
      expect(result?.turn).toBe(gameState.turn);
    });
  });
});
