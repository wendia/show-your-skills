import { describe, test, expect } from 'vitest';
import { useGameStore } from '@/store/gameStore';

describe('GameStore', () => {
  test('should initialize with null game state', () => {
    const store = useGameStore.getState();
    expect(store.gameState).toBeNull();
    expect(store.selectedSkillCard).toBeNull();
  });

  test('should start game with skill cards', () => {
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

  test('should place stone correctly', () => {
    const { startGame, placeStone } = useGameStore.getState();
    
    startGame({
      black: [],
      white: [],
    });

    const result = placeStone({ row: 7, col: 7 });
    expect(result).toBe(true);

    const store = useGameStore.getState();
    expect(store.gameState?.board[7][7]).toBe('black');
  });

  test('should not place stone on occupied cell', () => {
    const { startGame, placeStone } = useGameStore.getState();
    
    startGame({
      black: [],
      white: [],
    });

    placeStone({ row: 7, col: 7 });
    const result = placeStone({ row: 7, col: 7 });
    expect(result).toBe(false);
  });

  test('should reset game', () => {
    const { startGame, resetGame } = useGameStore.getState();
    
    startGame({
      black: [],
      white: [],
    });

    resetGame();

    const store = useGameStore.getState();
    expect(store.gameState).toBeNull();
  });
});
