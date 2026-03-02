import { describe, test, expect, beforeEach } from 'vitest';
import { useGameStore } from '@/store/gameStore';
import { createMockSkillCard, createMockGameState, createMockBlockedZone } from '@/__tests__/utils/testUtils';

// Reset store before each test
beforeEach(() => {
  useGameStore.setState({
    gameState: null,
    selectedSkillCard: null,
    selectMode: 'none',
    previewPosition: null,
  });
});

describe('GameStore - Initialization', () => {
  test('should initialize with null game state', () => {
    const store = useGameStore.getState();
    expect(store.gameState).toBeNull();
    expect(store.selectedSkillCard).toBeNull();
    expect(store.selectMode).toBe('none');
    expect(store.previewPosition).toBeNull();
  });
});

describe('GameStore - startGame', () => {
  test('should create game state with provided skill cards', () => {
    const { startGame } = useGameStore.getState();

    startGame({
      black: [
        { id: 'card1', skillId: 'reverse_chaos', name: '倒转乾坤', description: 'test', rarity: 'legendary', used: false },
      ],
      white: [
        { id: 'card2', skillId: 'time_warp', name: '时间回溯', description: 'test', rarity: 'epic', used: false },
      ],
    });

    const store = useGameStore.getState();
    expect(store.gameState).not.toBeNull();
    expect(store.gameState?.players.black.skillCards.length).toBe(1);
    expect(store.gameState?.players.white.skillCards.length).toBe(1);
  });

  test('should set currentPlayer to black', () => {
    const { startGame } = useGameStore.getState();
    startGame({ black: [], white: [] });
    expect(useGameStore.getState().gameState?.currentPlayer).toBe('black');
  });

  test('should set phase to playing', () => {
    const { startGame } = useGameStore.getState();
    startGame({ black: [], white: [] });
    expect(useGameStore.getState().gameState?.phase).toBe('playing');
  });

  test('should initialize turn to 1', () => {
    const { startGame } = useGameStore.getState();
    startGame({ black: [], white: [] });
    expect(useGameStore.getState().gameState?.turn).toBe(1);
  });

  test('should initialize remainingMoves to 1', () => {
    const { startGame } = useGameStore.getState();
    startGame({ black: [], white: [] });
    expect(useGameStore.getState().gameState?.remainingMoves).toBe(1);
  });

  test('should initialize empty blocked zones', () => {
    const { startGame } = useGameStore.getState();
    startGame({ black: [], white: [] });
    expect(useGameStore.getState().gameState?.blockedZones).toEqual([]);
  });
});

describe('GameStore - placeStone', () => {
  test('should return false when no game state exists', () => {
    const { placeStone } = useGameStore.getState();
    const result = placeStone({ row: 7, col: 7 });
    expect(result).toBe(false);
  });

  test('should place stone at valid empty position', () => {
    const { startGame, placeStone } = useGameStore.getState();
    startGame({ black: [], white: [] });

    const result = placeStone({ row: 7, col: 7 });
    expect(result).toBe(true);
    expect(useGameStore.getState().gameState?.board[7][7]).toBe('black');
  });

  test('should not place stone on occupied cell', () => {
    const { startGame, placeStone } = useGameStore.getState();
    startGame({ black: [], white: [] });

    placeStone({ row: 7, col: 7 });
    const result = placeStone({ row: 7, col: 7 });
    expect(result).toBe(false);
  });

  test('should not place stone in blocked zone (active)', () => {
    const { startGame, placeStone } = useGameStore.getState();
    startGame({ black: [], white: [] });

    // Manually add a blocked zone
    const state = useGameStore.getState();
    if (state.gameState) {
      state.gameState.blockedZones = [createMockBlockedZone({
        centerPosition: { row: 7, col: 7 },
        expiresAfterTurn: 5
      })];
    }

    const result = placeStone({ row: 7, col: 7 });
    expect(result).toBe(false);
  });

  test('should allow placement in expired blocked zone', () => {
    const { startGame, placeStone } = useGameStore.getState();
    startGame({ black: [], white: [] });

    // Manually add an expired blocked zone
    const state = useGameStore.getState();
    if (state.gameState) {
      state.gameState.blockedZones = [createMockBlockedZone({
        centerPosition: { row: 7, col: 7 },
        expiresAfterTurn: 0
      })];
    }

    const result = placeStone({ row: 7, col: 7 });
    expect(result).toBe(true);
  });

  test('should switch player after placement', () => {
    const { startGame, placeStone } = useGameStore.getState();
    startGame({ black: [], white: [] });

    placeStone({ row: 7, col: 7 });
    expect(useGameStore.getState().gameState?.currentPlayer).toBe('white');
  });

  test('should increment turn after placement', () => {
    const { startGame, placeStone } = useGameStore.getState();
    startGame({ black: [], white: [] });

    placeStone({ row: 7, col: 7 });
    expect(useGameStore.getState().gameState?.turn).toBe(2);
  });

  test('should add move to history', () => {
    const { startGame, placeStone } = useGameStore.getState();
    startGame({ black: [], white: [] });

    placeStone({ row: 7, col: 7 });
    const history = useGameStore.getState().gameState?.history;
    expect(history?.length).toBe(1);
    expect(history?.[0].type).toBe('place');
    expect(history?.[0].position).toEqual({ row: 7, col: 7 });
    expect(history?.[0].player).toBe('black');
  });

  test('should clean expired blocked zones after placement', () => {
    const { startGame, placeStone } = useGameStore.getState();
    startGame({ black: [], white: [] });

    // Add expired zone
    const state = useGameStore.getState();
    if (state.gameState) {
      state.gameState.blockedZones = [
        createMockBlockedZone({ centerPosition: { row: 3, col: 3 }, expiresAfterTurn: 0 }),
        createMockBlockedZone({ centerPosition: { row: 5, col: 5 }, expiresAfterTurn: 5 }),
      ];
    }

    placeStone({ row: 7, col: 7 });
    const zones = useGameStore.getState().gameState?.blockedZones;
    expect(zones?.length).toBe(1);
    expect(zones?.[0].centerPosition.row).toBe(5);
  });
});

describe('GameStore - remainingMoves flow', () => {
  test('should decrement remainingMoves after placement', () => {
    const { startGame, placeStone } = useGameStore.getState();
    startGame({ black: [], white: [] });

    // Set remainingMoves to 2
    const state = useGameStore.getState();
    if (state.gameState) {
      state.gameState.remainingMoves = 2;
    }

    placeStone({ row: 7, col: 7 });
    expect(useGameStore.getState().gameState?.remainingMoves).toBe(1);
  });

  test('should not switch player when remainingMoves > 1', () => {
    const { startGame, placeStone } = useGameStore.getState();
    startGame({ black: [], white: [] });

    // Set remainingMoves to 2
    const state = useGameStore.getState();
    if (state.gameState) {
      state.gameState.remainingMoves = 2;
    }

    placeStone({ row: 7, col: 7 });
    expect(useGameStore.getState().gameState?.currentPlayer).toBe('black');
  });

  test('should switch player when remainingMoves reaches 0', () => {
    const { startGame, placeStone } = useGameStore.getState();
    startGame({ black: [], white: [] });

    placeStone({ row: 7, col: 7 });
    expect(useGameStore.getState().gameState?.currentPlayer).toBe('white');
  });

  test('should reset remainingMoves to 1 after turn switch', () => {
    const { startGame, placeStone } = useGameStore.getState();
    startGame({ black: [], white: [] });

    placeStone({ row: 7, col: 7 });
    expect(useGameStore.getState().gameState?.remainingMoves).toBe(1);
  });
});

describe('GameStore - useSkill', () => {
  test('should return false when no game state', () => {
    const { useSkill } = useGameStore.getState();
    const result = useSkill('card1');
    expect(result).toBe(false);
  });

  test('should return false when no skill card selected', () => {
    const { startGame, useSkill } = useGameStore.getState();
    startGame({ black: [], white: [] });
    const result = useSkill('card1');
    expect(result).toBe(false);
  });

  test('should return false for already used skill card', () => {
    const { startGame, useSkill, selectSkillCard } = useGameStore.getState();
    const usedCard = createMockSkillCard({ id: 'card1', used: true });
    startGame({ black: [usedCard], white: [] });

    selectSkillCard('card1');
    const result = useSkill('card1');
    expect(result).toBe(false);
  });
});

describe('GameStore - resetGame', () => {
  test('should clear game state', () => {
    const { startGame, resetGame } = useGameStore.getState();
    startGame({ black: [], white: [] });
    resetGame();
    expect(useGameStore.getState().gameState).toBeNull();
  });

  test('should clear selected skill card', () => {
    const { startGame, resetGame, selectSkillCard } = useGameStore.getState();
    startGame({ black: [createMockSkillCard()], white: [] });
    selectSkillCard('test-card-1');
    resetGame();
    expect(useGameStore.getState().selectedSkillCard).toBeNull();
  });

  test('should reset selectMode to none', () => {
    const { startGame, resetGame, setSelectMode } = useGameStore.getState();
    startGame({ black: [], white: [] });
    setSelectMode('blockZone');
    resetGame();
    expect(useGameStore.getState().selectMode).toBe('none');
  });
});

describe('GameStore - Selection State', () => {
  test('selectSkillCard should update selectedSkillCard', () => {
    const { selectSkillCard } = useGameStore.getState();
    selectSkillCard('card-123');
    expect(useGameStore.getState().selectedSkillCard).toBe('card-123');
  });

  test('setSelectMode should update selectMode', () => {
    const { setSelectMode } = useGameStore.getState();
    setSelectMode('blockZone');
    expect(useGameStore.getState().selectMode).toBe('blockZone');
  });

  test('setPreviewPosition should update previewPosition', () => {
    const { setPreviewPosition } = useGameStore.getState();
    setPreviewPosition({ row: 5, col: 5 });
    expect(useGameStore.getState().previewPosition).toEqual({ row: 5, col: 5 });
  });
});

describe('GameStore - Blocked Zone Validation', () => {
  test('should correctly calculate 3x3 zone boundaries', () => {
    const { startGame, placeStone } = useGameStore.getState();
    startGame({ black: [], white: [] });

    // Add a blocked zone at corner
    const state = useGameStore.getState();
    if (state.gameState) {
      state.gameState.blockedZones = [createMockBlockedZone({
        centerPosition: { row: 0, col: 0 },
        expiresAfterTurn: 5
      })];
    }

    // Position (1,1) should be blocked (within 3x3 zone)
    const result1 = placeStone({ row: 1, col: 1 });
    expect(result1).toBe(false);

    // Position (2,2) should NOT be blocked (outside 3x3 zone)
    const result2 = placeStone({ row: 2, col: 2 });
    expect(result2).toBe(true);
  });

  test('should handle zones at board edges', () => {
    const { startGame, placeStone } = useGameStore.getState();
    startGame({ black: [], white: [] });

    // Add a blocked zone at edge
    const state = useGameStore.getState();
    if (state.gameState) {
      state.gameState.blockedZones = [createMockBlockedZone({
        centerPosition: { row: 14, col: 14 },
        expiresAfterTurn: 5
      })];
    }

    // Position (13,13) should be blocked
    const result = placeStone({ row: 13, col: 13 });
    expect(result).toBe(false);
  });
});

describe('GameStore - History Tracking', () => {
  test('should track multiple stone placements', () => {
    const { startGame, placeStone } = useGameStore.getState();
    startGame({ black: [], white: [] });

    placeStone({ row: 7, col: 7 });
    placeStone({ row: 7, col: 8 });
    placeStone({ row: 7, col: 9 });

    const history = useGameStore.getState().gameState?.history;
    expect(history?.length).toBe(3);
  });

  test('should maintain correct order of moves', () => {
    const { startGame, placeStone } = useGameStore.getState();
    startGame({ black: [], white: [] });

    placeStone({ row: 7, col: 7 });
    placeStone({ row: 7, col: 8 });

    const history = useGameStore.getState().gameState?.history;
    expect(history?.[0].position).toEqual({ row: 7, col: 7 });
    expect(history?.[1].position).toEqual({ row: 7, col: 8 });
  });

  test('should include position and player info', () => {
    const { startGame, placeStone } = useGameStore.getState();
    startGame({ black: [], white: [] });

    placeStone({ row: 7, col: 7 });
    const move = useGameStore.getState().gameState?.history[0];

    expect(move?.position).toEqual({ row: 7, col: 7 });
    expect(move?.player).toBe('black');
    expect(move?.type).toBe('place');
  });
});
