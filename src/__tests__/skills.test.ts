import { describe, test, expect, beforeEach } from 'vitest';
import { skillRegistry, SkillContext } from '@/skills/core/SkillRegistry';
import { registerAllEffects } from '@/skills/effects';
import { SkillDefinition } from '@/config/types';
import { createMockGameState } from './utils/testUtils';

// Test skill definitions
const testFlipStonesDef: SkillDefinition = {
  id: 'test_flip_stones',
  name: 'Test Flip Stones',
  description: 'Flip stones test',
  rarity: 'rare',
  type: 'instant',
  priority: 10,
  effectId: 'flipStones',
  conditions: [{ type: 'min_stones', value: 3 }],
  params: { flipPercent: 30 },
  ui: { icon: 'zap', animationId: '', soundId: '' },
};

const testUndoMoveDef: SkillDefinition = {
  id: 'test_undo_move',
  name: 'Test Undo Move',
  description: 'Undo move test',
  rarity: 'epic',
  type: 'instant',
  priority: 20,
  effectId: 'undoMove',
  conditions: [{ type: 'history_not_empty', value: true }],
  params: {},
  ui: { icon: 'zap', animationId: '', soundId: '' },
};

describe('SkillRegistry', () => {
  beforeEach(() => {
    // Clear and re-register effects
    (skillRegistry as unknown as { definitions: Map<string, SkillDefinition> }).definitions.clear();
    registerAllEffects();
  });

  test('should register effects', () => {
    expect(skillRegistry).toBeDefined();
  });

  test('should check conditions for flipStones', () => {
    skillRegistry.registerDefinition(testFlipStonesDef);

    const gameState = createMockGameState();
    const context: SkillContext = {
      gameState,
      currentPlayer: { id: '1', color: 'black' },
    };

    // Without enough stones, should fail
    expect(skillRegistry.canUse('test_flip_stones', context)).toBe(false);

    // Add some stones
    gameState.board[7][7] = 'black';
    gameState.board[7][8] = 'white';
    gameState.board[7][9] = 'black';

    expect(skillRegistry.canUse('test_flip_stones', context)).toBe(true);
  });

  test('should check conditions for undoMove', () => {
    skillRegistry.registerDefinition(testUndoMoveDef);

    const gameState = createMockGameState();
    const context: SkillContext = {
      gameState,
      currentPlayer: { id: '1', color: 'black' },
    };

    // Without history, should fail
    expect(skillRegistry.canUse('test_undo_move', context)).toBe(false);

    // Add history
    gameState.history.push({
      type: 'place',
      player: 'black',
      position: { row: 7, col: 7 },
      timestamp: Date.now(),
    });

    expect(skillRegistry.canUse('test_undo_move', context)).toBe(true);
  });
});
