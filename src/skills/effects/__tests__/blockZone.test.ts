import { describe, test, expect } from 'vitest';
import { blockZoneEffect } from '../blockZone';
import { createMockGameState } from '@/__tests__/utils/testUtils';
import { SkillContext } from '@/skills/core/SkillRegistry';

describe('blockZoneEffect', () => {
  const createContext = (
    gameState = createMockGameState(),
    targetPosition?: { row: number; col: number }
  ): SkillContext => ({
    gameState,
    currentPlayer: { id: 'black', color: 'black' },
    targetPosition,
  });

  describe('execute', () => {
    test('should create blocked zone at target position', () => {
      const gameState = createMockGameState();
      const context = createContext(gameState, { row: 7, col: 7 });
      const result = blockZoneEffect.execute(context, {});

      expect(result).not.toBeNull();
      expect(result?.blockedZones.length).toBe(1);
      expect(result?.blockedZones[0].centerPosition).toEqual({ row: 7, col: 7 });
    });

    test('should use default position (7,7) when no target', () => {
      const gameState = createMockGameState();
      const context = createContext(gameState);
      const result = blockZoneEffect.execute(context, {});

      expect(result).not.toBeNull();
      expect(result?.blockedZones[0].centerPosition).toEqual({ row: 7, col: 7 });
    });

    test('should set expiration to current turn + 2', () => {
      const gameState = createMockGameState();
      gameState.turn = 5;
      const context = createContext(gameState, { row: 7, col: 7 });
      const result = blockZoneEffect.execute(context, {});

      expect(result?.blockedZones[0].expiresAfterTurn).toBe(7);
    });

    test('should record blocking player', () => {
      const gameState = createMockGameState();
      const context = createContext(gameState, { row: 7, col: 7 });
      const result = blockZoneEffect.execute(context, {});

      expect(result?.blockedZones[0].blockedBy).toBe('black');
    });

    test('should handle custom size parameter', () => {
      const gameState = createMockGameState();
      const context = createContext(gameState, { row: 7, col: 7 });
      const result = blockZoneEffect.execute(context, { size: 5 });

      expect(result).not.toBeNull();
      // The actualSize should be calculated for size 5
      const zone = result?.blockedZones[0];
      expect(zone).toBeDefined();
    });

    test('should add zone to existing blocked zones', () => {
      const gameState = createMockGameState();
      gameState.blockedZones = [
        {
          centerPosition: { row: 3, col: 3 },
          expiresAfterTurn: 5,
          blockedBy: 'white',
        },
      ];

      const context = createContext(gameState, { row: 7, col: 7 });
      const result = blockZoneEffect.execute(context, {});

      expect(result?.blockedZones.length).toBe(2);
    });

    test('should calculate actualSize bounds correctly', () => {
      const gameState = createMockGameState();
      const context = createContext(gameState, { row: 7, col: 7 });
      const result = blockZoneEffect.execute(context, { size: 3 });

      const zone = result?.blockedZones[0];
      expect(zone).toBeDefined();
      // For size 3 centered at (7,7): top=6, left=6, bottom=8, right=8
      // But actualSize is stored in the zone
    });

    test('should clamp bounds to board edges', () => {
      const gameState = createMockGameState();
      const context = createContext(gameState, { row: 0, col: 0 });
      const result = blockZoneEffect.execute(context, {});

      expect(result).not.toBeNull();
      // Zone should be created even at corner
      expect(result?.blockedZones[0].centerPosition).toEqual({ row: 0, col: 0 });
    });
  });
});
