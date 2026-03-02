import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

// Mock stores
vi.mock('@/store/gameStore', () => ({
  useGameStore: vi.fn((selector) => {
    const state = {
      gameState: {
        id: 'test-game',
        board: Array(15).fill(null).map(() => Array(15).fill(null)),
        currentPlayer: 'black',
        phase: 'playing',
        players: {
          black: { id: 'black', username: 'Black', color: 'black', skillCards: [] },
          white: { id: 'white', username: 'White', color: 'white', skillCards: [] },
        },
        history: [],
        turn: 1,
        remainingMoves: 1,
        blockedZones: [],
      },
      selectedSkillCard: null,
      selectMode: 'none',
      previewPosition: null,
      startGame: vi.fn(),
      resetGame: vi.fn(),
      placeStone: vi.fn(() => true),
      useSkill: vi.fn(() => true),
      selectSkillCard: vi.fn(),
      setSelectMode: vi.fn(),
      setPreviewPosition: vi.fn(),
    };
    return selector ? selector(state) : state;
  }),
}));

vi.mock('@/store/configStore', () => ({
  useConfigStore: vi.fn((selector) => {
    const state = {
      skillPoolId: 'standard',
      skillPool: null,
      setSkillPool: vi.fn(),
      loadConfig: vi.fn(),
    };
    return selector ? selector(state) : state;
  }),
}));

vi.mock('@/config', () => ({
  configManager: {
    getAllThemes: () => [{ id: 'default', name: 'Default' }],
    getAllSkillPools: () => [{ id: 'standard', name: 'Standard' }],
    getTheme: (id: string) => (id === 'default' ? { id: 'default', name: 'Default' } : undefined),
    getSkillPool: (id: string) => (id === 'standard' ? { id: 'standard', name: 'Standard' } : undefined),
  },
}));

vi.mock('@/skills/core/SkillPoolManager', () => ({
  skillPoolManager: {
    getCurrentPool: () => ({ id: 'standard', name: 'Standard' }),
    getAllPools: () => [{ id: 'standard', name: 'Standard' }],
    loadPool: vi.fn(),
    drawCards: vi.fn(() => []),
  },
}));

import { useGame } from '../useGame';
import { useConfig } from '../useConfig';
import { useSkillPool } from '../useSkillPool';

describe('useGame hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should return game state', () => {
    const { result } = renderHook(() => useGame());
    const { gameState, isPlaying, currentPlayer } = result.current;
    expect(gameState).toBeDefined();
    expect(isPlaying).toBe(true);
    expect(currentPlayer).toBe('black');
  });

  test('should return actions', () => {
    const { result } = renderHook(() => useGame());
    const { startGame, resetGame, placeStone, useSkill } = result.current;
    expect(startGame).toBeDefined();
    expect(resetGame).toBeDefined();
    expect(placeStone).toBeDefined();
    expect(useSkill).toBeDefined();
  });

  test('should return computed values', () => {
    const { result } = renderHook(() => useGame());
    const { turn, winner, board, history } = result.current;
    expect(turn).toBe(1);
    expect(winner).toBeUndefined();
    expect(board).toBeDefined();
    expect(history).toEqual([]);
  });
});

describe('useConfig hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should return config state', () => {
    const { result } = renderHook(() => useConfig());
    const { skillPoolId, skillPool } = result.current;
    expect(skillPoolId).toBe('standard');
    expect(skillPool).toBeNull();
  });

  test('should return available options', () => {
    const { result } = renderHook(() => useConfig());
    const { themes, skillPools } = result.current;
    expect(themes).toHaveLength(1);
    expect(skillPools).toHaveLength(1);
  });

  test('should return actions', () => {
    const { result } = renderHook(() => useConfig());
    const { setSkillPool, loadConfig } = result.current;
    expect(setSkillPool).toBeDefined();
    expect(loadConfig).toBeDefined();
  });
});

describe('useSkillPool hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should return current pool', () => {
    const { result } = renderHook(() => useSkillPool());
    const { currentPool } = result.current;
    expect(currentPool).toBeDefined();
    expect(currentPool?.id).toBe('standard');
  });

  test('should return all pools', () => {
    const { result } = renderHook(() => useSkillPool());
    const { allPools } = result.current;
    expect(allPools).toHaveLength(1);
  });

  test('should return actions', () => {
    const { result } = renderHook(() => useSkillPool());
    const { loadPool, drawCards } = result.current;
    expect(loadPool).toBeDefined();
    expect(drawCards).toBeDefined();
  });
});
