import { describe, test, expect, beforeEach } from 'vitest';
import { useGameStore } from '@/store/gameStore';
import { createMockSkillCard, createMockBlockedZone } from '@/__tests__/utils/testUtils';

// Reset store before each test
beforeEach(() => {
  useGameStore.setState({
    gameState: null,
    selectedSkillCard: null,
    selectMode: 'none',
    previewPosition: null,
  });
});

describe('Complete Game Workflow', () => {
  describe('Game Start Flow', () => {
    test('should initialize game with skill cards for both players', () => {
      const { startGame } = useGameStore.getState();

      startGame({
        black: [createMockSkillCard({ id: 'card1', skillId: 'test_skill' })],
        white: [createMockSkillCard({ id: 'card2', skillId: 'test_skill' })],
      });

      const state = useGameStore.getState();
      expect(state.gameState).not.toBeNull();
      expect(state.gameState?.players.black.skillCards.length).toBe(1);
      expect(state.gameState?.players.white.skillCards.length).toBe(1);
    });

    test('should set black as first player', () => {
      const { startGame } = useGameStore.getState();
      startGame({ black: [], white: [] });

      expect(useGameStore.getState().gameState?.currentPlayer).toBe('black');
    });

    test('should start with turn 1', () => {
      const { startGame } = useGameStore.getState();
      startGame({ black: [], white: [] });

      expect(useGameStore.getState().gameState?.turn).toBe(1);
    });
  });

  describe('Basic Play Flow', () => {
    test('should alternate turns between players', () => {
      const { startGame, placeStone } = useGameStore.getState();
      startGame({ black: [], white: [] });

      // Black plays
      placeStone({ row: 7, col: 7 });
      expect(useGameStore.getState().gameState?.currentPlayer).toBe('white');

      // White plays
      placeStone({ row: 7, col: 8 });
      expect(useGameStore.getState().gameState?.currentPlayer).toBe('black');
    });

    test('should track history correctly over multiple moves', () => {
      const { startGame, placeStone } = useGameStore.getState();
      startGame({ black: [], white: [] });

      placeStone({ row: 7, col: 7 });
      placeStone({ row: 7, col: 8 });
      placeStone({ row: 7, col: 9 });

      const history = useGameStore.getState().gameState?.history;
      expect(history?.length).toBe(3);
      expect(history?.[0].player).toBe('black');
      expect(history?.[1].player).toBe('white');
      expect(history?.[2].player).toBe('black');
    });

    test('should increment turn counter correctly', () => {
      const { startGame, placeStone } = useGameStore.getState();
      startGame({ black: [], white: [] });

      placeStone({ row: 7, col: 7 });
      expect(useGameStore.getState().gameState?.turn).toBe(2);

      placeStone({ row: 7, col: 8 });
      expect(useGameStore.getState().gameState?.turn).toBe(3);
    });
  });

  describe('Blocked Zone Workflow', () => {
    test('should prevent placement in blocked zone', () => {
      const { startGame, placeStone } = useGameStore.getState();
      startGame({ black: [], white: [] });

      // Manually add a blocked zone
      const state = useGameStore.getState();
      if (state.gameState) {
        state.gameState.blockedZones = [createMockBlockedZone({
          centerPosition: { row: 7, col: 7 },
          expiresAfterTurn: 10,
        })];
      }

      // Try to place in blocked zone
      const result = placeStone({ row: 7, col: 7 });
      expect(result).toBe(false);
    });

    test('should allow placement after zone expires', () => {
      const { startGame, placeStone } = useGameStore.getState();
      startGame({ black: [], white: [] });

      // Add an expired blocked zone
      const state = useGameStore.getState();
      if (state.gameState) {
        state.gameState.blockedZones = [createMockBlockedZone({
          centerPosition: { row: 7, col: 7 },
          expiresAfterTurn: 0, // Already expired
        })];
      }

      // Should allow placement
      const result = placeStone({ row: 7, col: 7 });
      expect(result).toBe(true);
    });
  });

  describe('Complete Game Sequence', () => {
    test('should handle a complete game from start to multiple moves', () => {
      const { startGame, placeStone } = useGameStore.getState();

      startGame({
        black: [createMockSkillCard({ skillId: 'test_skill' })],
        white: [createMockSkillCard({ skillId: 'test_skill' })],
      });

      // Play several moves
      const moves = [
        { row: 7, col: 7 },
        { row: 7, col: 8 },
        { row: 7, col: 9 },
        { row: 8, col: 7 },
        { row: 8, col: 8 },
      ];

      moves.forEach(pos => placeStone(pos));

      const state = useGameStore.getState();
      expect(state.gameState?.history.length).toBe(5);
      expect(state.gameState?.turn).toBe(6);
      expect(state.gameState?.board[7][7]).toBe('black');
      expect(state.gameState?.board[7][8]).toBe('white');
    });

    test('should handle game reset', () => {
      const { startGame, placeStone, resetGame } = useGameStore.getState();

      startGame({ black: [], white: [] });
      placeStone({ row: 7, col: 7 });
      placeStone({ row: 7, col: 8 });

      resetGame();

      expect(useGameStore.getState().gameState).toBeNull();
    });
  });

  describe('Skill Card State', () => {
    test('should track skill card selection', () => {
      const { selectSkillCard } = useGameStore.getState();

      selectSkillCard('card-123');
      expect(useGameStore.getState().selectedSkillCard).toBe('card-123');

      selectSkillCard(null);
      expect(useGameStore.getState().selectedSkillCard).toBeNull();
    });

    test('should track select mode', () => {
      const { setSelectMode } = useGameStore.getState();

      setSelectMode('blockZone');
      expect(useGameStore.getState().selectMode).toBe('blockZone');

      setSelectMode('none');
      expect(useGameStore.getState().selectMode).toBe('none');
    });

    test('should track preview position', () => {
      const { setPreviewPosition } = useGameStore.getState();

      setPreviewPosition({ row: 5, col: 5 });
      expect(useGameStore.getState().previewPosition).toEqual({ row: 5, col: 5 });

      setPreviewPosition(null);
      expect(useGameStore.getState().previewPosition).toBeNull();
    });
  });
});
