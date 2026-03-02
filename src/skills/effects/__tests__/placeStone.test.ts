import { describe, test, expect } from 'vitest';
import { placeStoneEffect } from '../placeStone';
import { createMockGameState } from '@/__tests__/utils/testUtils';
import { SkillContext } from '@/skills/core/SkillRegistry';

describe('placeStoneEffect', () => {
  const createContext = (
    gameState = createMockGameState(),
    targetPosition?: { row: number; col: number }
  ): SkillContext => ({
    gameState,
    currentPlayer: { id: 'black', color: 'black' },
    targetPosition,
  });

  describe('execute', () => {
    test('should return null when no target position', () => {
      const gameState = createMockGameState();
      const context = createContext(gameState);
      const result = placeStoneEffect.execute(context, {});
      expect(result).toBeNull();
    });

    test('should return null when target position occupied', () => {
      const gameState = createMockGameState();
      gameState.board[7][7] = 'white';

      const context = createContext(gameState, { row: 7, col: 7 });
      const result = placeStoneEffect.execute(context, {});

      expect(result).toBeNull();
    });

    test('should place stone of current player color', () => {
      const gameState = createMockGameState();
      const context = createContext(gameState, { row: 7, col: 7 });
      const result = placeStoneEffect.execute(context, {});

      expect(result).not.toBeNull();
      expect(result?.board[7][7]).toBe('black');
    });

    test('should place white stone for white player', () => {
      const gameState = createMockGameState();
      const context: SkillContext = {
        gameState,
        currentPlayer: { id: 'white', color: 'white' },
        targetPosition: { row: 7, col: 7 },
      };
      const result = placeStoneEffect.execute(context, {});

      expect(result?.board[7][7]).toBe('white');
    });

    test('should add move to history', () => {
      const gameState = createMockGameState();
      const context = createContext(gameState, { row: 7, col: 7 });
      const result = placeStoneEffect.execute(context, {});

      expect(result?.history.length).toBe(1);
      expect(result?.history[0].type).toBe('place');
      expect(result?.history[0].position).toEqual({ row: 7, col: 7 });
      expect(result?.history[0].player).toBe('black');
    });

    test('should switch to next player', () => {
      const gameState = createMockGameState();
      gameState.currentPlayer = 'black';
      const context = createContext(gameState, { row: 7, col: 7 });
      const result = placeStoneEffect.execute(context, {});

      expect(result?.currentPlayer).toBe('white');
    });

    test('should increment turn', () => {
      const gameState = createMockGameState();
      gameState.turn = 5;
      const context = createContext(gameState, { row: 7, col: 7 });
      const result = placeStoneEffect.execute(context, {});

      expect(result?.turn).toBe(6);
    });

    test('should not modify original board', () => {
      const gameState = createMockGameState();
      const context = createContext(gameState, { row: 7, col: 7 });
      placeStoneEffect.execute(context, {});

      expect(gameState.board[7][7]).toBeNull();
    });
  });
});
