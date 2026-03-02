import { describe, test, expect } from 'vitest';
import { doubleMoveEffect } from '../doubleMove';
import { createMockGameState } from '@/__tests__/utils/testUtils';
import { SkillContext } from '@/skills/core/SkillRegistry';

describe('doubleMoveEffect', () => {
  const createContext = (gameState = createMockGameState()): SkillContext => ({
    gameState,
    currentPlayer: { id: 'black', color: 'black' },
  });

  describe('execute', () => {
    test('should return null when phase is not playing', () => {
      const gameState = createMockGameState();
      gameState.phase = 'ended';
      const context = createContext(gameState);
      const result = doubleMoveEffect.execute(context, {});
      expect(result).toBeNull();
    });

    test('should return null when remainingMoves is not 1', () => {
      const gameState = createMockGameState();
      gameState.remainingMoves = 2;
      const context = createContext(gameState);
      const result = doubleMoveEffect.execute(context, {});
      expect(result).toBeNull();
    });

    test('should return null when remainingMoves is 0', () => {
      const gameState = createMockGameState();
      gameState.remainingMoves = 0;
      const context = createContext(gameState);
      const result = doubleMoveEffect.execute(context, {});
      expect(result).toBeNull();
    });

    test('should set remainingMoves to 2', () => {
      const gameState = createMockGameState();
      gameState.remainingMoves = 1;
      const context = createContext(gameState);
      const result = doubleMoveEffect.execute(context, {});

      expect(result).not.toBeNull();
      expect(result?.remainingMoves).toBe(2);
    });

    test('should return updated game state', () => {
      const gameState = createMockGameState();
      gameState.remainingMoves = 1;
      const context = createContext(gameState);
      const result = doubleMoveEffect.execute(context, {});

      expect(result).not.toBeNull();
      expect(result?.id).toBe(gameState.id);
      expect(result?.turn).toBe(gameState.turn);
      expect(result?.phase).toBe('playing');
    });

    test('should not modify other game state properties', () => {
      const gameState = createMockGameState();
      gameState.remainingMoves = 1;
      gameState.board[7][7] = 'black';
      gameState.turn = 5;

      const context = createContext(gameState);
      const result = doubleMoveEffect.execute(context, {});

      expect(result?.board[7][7]).toBe('black');
      expect(result?.turn).toBe(5);
      expect(result?.currentPlayer).toBe('black');
    });
  });
});
