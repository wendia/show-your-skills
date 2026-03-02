import { describe, test, expect, beforeEach } from 'vitest';
import { skillRegistry, SkillContext } from '../SkillRegistry';
import { registerAllEffects } from '@/skills/effects';
import { SkillDefinition } from '@/config/types';
import { createMockGameState } from '@/__tests__/utils/testUtils';

// Create test skill definitions
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

const testPhaseSkillDef: SkillDefinition = {
  id: 'test_phase_skill',
  name: 'Test Phase Skill',
  description: 'Phase skill test',
  rarity: 'common',
  type: 'instant',
  priority: 5,
  effectId: 'doubleMove',
  conditions: [{ type: 'phase', value: 'playing' }],
  params: {},
  ui: { icon: 'zap', animationId: '', soundId: '' },
};

const testMultiConditionDef: SkillDefinition = {
  id: 'test_multi_condition',
  name: 'Test Multi Condition',
  description: 'Multi condition test',
  rarity: 'legendary',
  type: 'instant',
  priority: 30,
  effectId: 'flipStones',
  conditions: [
    { type: 'min_stones', value: 2 },
    { type: 'history_not_empty', value: true },
    { type: 'phase', value: 'playing' },
  ],
  params: {},
  ui: { icon: 'zap', animationId: '', soundId: '' },
};

// Reset registry and register effects before each test
beforeEach(() => {
  // Clear existing definitions and effects
  (skillRegistry as unknown as { definitions: Map<string, SkillDefinition> }).definitions.clear();
  registerAllEffects();
});

describe('SkillRegistry - Registration', () => {
  test('should register skill definition', () => {
    skillRegistry.registerDefinition(testFlipStonesDef);
    expect(skillRegistry.getDefinition('test_flip_stones')).toEqual(testFlipStonesDef);
  });

  test('should overwrite existing definition with same id', () => {
    skillRegistry.registerDefinition({ ...testFlipStonesDef, name: 'First' });
    skillRegistry.registerDefinition({ ...testFlipStonesDef, name: 'Second' });
    expect(skillRegistry.getDefinition('test_flip_stones')?.name).toBe('Second');
  });

  test('should register multiple definitions at once', () => {
    skillRegistry.registerDefinitions([testFlipStonesDef, testUndoMoveDef]);
    expect(skillRegistry.getDefinition('test_flip_stones')).toBeDefined();
    expect(skillRegistry.getDefinition('test_undo_move')).toBeDefined();
  });
});

describe('SkillRegistry - getDefinition', () => {
  test('should return definition by id', () => {
    skillRegistry.registerDefinition(testFlipStonesDef);
    const result = skillRegistry.getDefinition('test_flip_stones');
    expect(result).toBeDefined();
    expect(result?.name).toBe('Test Flip Stones');
  });

  test('should return undefined for unknown id', () => {
    const result = skillRegistry.getDefinition('unknown_skill');
    expect(result).toBeUndefined();
  });
});

describe('SkillRegistry - getAllDefinitions', () => {
  test('should return all registered definitions', () => {
    skillRegistry.registerDefinitions([testFlipStonesDef, testUndoMoveDef]);
    const defs = skillRegistry.getAllDefinitions();
    expect(defs.length).toBe(2);
  });
});

describe('SkillRegistry - getByRarity', () => {
  test('should filter definitions by rarity', () => {
    skillRegistry.registerDefinitions([testFlipStonesDef, testUndoMoveDef, testPhaseSkillDef]);
    const rare = skillRegistry.getByRarity('rare');
    expect(rare.length).toBe(1);
    expect(rare[0].rarity).toBe('rare');
  });

  test('should return empty array for no matching rarity', () => {
    skillRegistry.registerDefinition(testFlipStonesDef);
    const legendary = skillRegistry.getByRarity('legendary');
    expect(legendary.length).toBe(0);
  });
});

describe('SkillRegistry - canUse', () => {
  describe('min_stones condition', () => {
    test('should return false when not enough stones on board', () => {
      skillRegistry.registerDefinition(testFlipStonesDef);
      const gameState = createMockGameState();
      const context: SkillContext = {
        gameState,
        currentPlayer: { id: 'black', color: 'black' },
      };

      expect(skillRegistry.canUse('test_flip_stones', context)).toBe(false);
    });

    test('should return true when enough stones exist', () => {
      skillRegistry.registerDefinition(testFlipStonesDef);
      const gameState = createMockGameState();
      gameState.board[7][7] = 'black';
      gameState.board[7][8] = 'white';
      gameState.board[7][9] = 'black';

      const context: SkillContext = {
        gameState,
        currentPlayer: { id: 'black', color: 'black' },
      };

      expect(skillRegistry.canUse('test_flip_stones', context)).toBe(true);
    });
  });

  describe('history_not_empty condition', () => {
    test('should return false when history is empty', () => {
      skillRegistry.registerDefinition(testUndoMoveDef);
      const gameState = createMockGameState();
      const context: SkillContext = {
        gameState,
        currentPlayer: { id: 'black', color: 'black' },
      };

      expect(skillRegistry.canUse('test_undo_move', context)).toBe(false);
    });

    test('should return true when history has moves', () => {
      skillRegistry.registerDefinition(testUndoMoveDef);
      const gameState = createMockGameState();
      gameState.history.push({
        type: 'place',
        player: 'black',
        position: { row: 7, col: 7 },
        timestamp: Date.now(),
      });

      const context: SkillContext = {
        gameState,
        currentPlayer: { id: 'black', color: 'black' },
      };

      expect(skillRegistry.canUse('test_undo_move', context)).toBe(true);
    });
  });

  describe('phase condition', () => {
    test('should return true when phase matches', () => {
      skillRegistry.registerDefinition(testPhaseSkillDef);
      const gameState = createMockGameState();
      gameState.phase = 'playing';

      const context: SkillContext = {
        gameState,
        currentPlayer: { id: 'black', color: 'black' },
      };

      expect(skillRegistry.canUse('test_phase_skill', context)).toBe(true);
    });

    test('should return false when phase does not match', () => {
      skillRegistry.registerDefinition(testPhaseSkillDef);
      const gameState = createMockGameState();
      gameState.phase = 'ended';

      const context: SkillContext = {
        gameState,
        currentPlayer: { id: 'black', color: 'black' },
      };

      expect(skillRegistry.canUse('test_phase_skill', context)).toBe(false);
    });
  });

  describe('multiple conditions', () => {
    test('should return true only when all conditions pass', () => {
      skillRegistry.registerDefinition(testMultiConditionDef);
      const gameState = createMockGameState();
      gameState.phase = 'playing';
      gameState.board[7][7] = 'black';
      gameState.board[7][8] = 'white';
      gameState.history.push({
        type: 'place',
        player: 'black',
        position: { row: 7, col: 7 },
        timestamp: Date.now(),
      });

      const context: SkillContext = {
        gameState,
        currentPlayer: { id: 'black', color: 'black' },
      };

      expect(skillRegistry.canUse('test_multi_condition', context)).toBe(true);
    });

    test('should return false if any condition fails', () => {
      skillRegistry.registerDefinition(testMultiConditionDef);
      const gameState = createMockGameState();
      gameState.phase = 'playing';
      // Only 2 stones but history is empty

      const context: SkillContext = {
        gameState,
        currentPlayer: { id: 'black', color: 'black' },
      };

      expect(skillRegistry.canUse('test_multi_condition', context)).toBe(false);
    });
  });

  test('should return false for unknown skill id', () => {
    const gameState = createMockGameState();
    const context: SkillContext = {
      gameState,
      currentPlayer: { id: 'black', color: 'black' },
    };

    expect(skillRegistry.canUse('unknown_skill', context)).toBe(false);
  });
});

describe('SkillRegistry - execute', () => {
  test('should return null for unknown skill id', () => {
    const gameState = createMockGameState();
    const context: SkillContext = {
      gameState,
      currentPlayer: { id: 'black', color: 'black' },
    };

    const result = skillRegistry.execute('unknown_skill', context);
    expect(result).toBeNull();
  });

  test('should return null when conditions not met', () => {
    skillRegistry.registerDefinition(testUndoMoveDef);
    const gameState = createMockGameState();
    const context: SkillContext = {
      gameState,
      currentPlayer: { id: 'black', color: 'black' },
    };

    const result = skillRegistry.execute('test_undo_move', context);
    expect(result).toBeNull();
  });

  test('should execute effect and return new game state', () => {
    skillRegistry.registerDefinition(testFlipStonesDef);
    const gameState = createMockGameState();
    gameState.board[7][7] = 'black';
    gameState.board[7][8] = 'white';
    gameState.board[7][9] = 'black';

    const context: SkillContext = {
      gameState,
      currentPlayer: { id: 'black', color: 'black' },
    };

    const result = skillRegistry.execute('test_flip_stones', context);
    expect(result).not.toBeNull();
    expect(result?.boardSize).toBe(gameState.boardSize);
  });
});
