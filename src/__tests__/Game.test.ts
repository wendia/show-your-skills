/**
 * 游戏核心逻辑测试用例
 */

import {
  createEmptyBoard,
  createInitialGameState,
  isValidPosition,
  isEmptyPosition,
  placeStone,
  checkWinner,
  isPositionBlocked,
  getAllStones,
  flipStones,
} from '../core/Game';
import { DEFAULT_CONFIG, Position } from '../types';

describe('Game Core Logic', () => {
  
  describe('createEmptyBoard', () => {
    it('应该创建指定大小的空棋盘', () => {
      const board = createEmptyBoard(15);
      expect(board.length).toBe(15);
      expect(board[0].length).toBe(15);
      expect(board[7][7]).toBeNull();
    });
  });
  
  describe('isValidPosition', () => {
    it('应该接受棋盘内的位置', () => {
      expect(isValidPosition({ row: 0, col: 0 }, 15)).toBe(true);
      expect(isValidPosition({ row: 7, col: 7 }, 15)).toBe(true);
      expect(isValidPosition({ row: 14, col: 14 }, 15)).toBe(true);
    });
    
    it('应该拒绝棋盘外的位置', () => {
      expect(isValidPosition({ row: -1, col: 0 }, 15)).toBe(false);
      expect(isValidPosition({ row: 15, col: 0 }, 15)).toBe(false);
      expect(isValidPosition({ row: 0, col: 15 }, 15)).toBe(false);
    });
  });
  
  describe('placeStone', () => {
    it('应该在空位成功落子', () => {
      const state = createInitialGameState(DEFAULT_CONFIG);
      const result = placeStone(state, { row: 7, col: 7 });
      
      expect(result).not.toBeNull();
      expect(result!.board[7][7]).toBe('black');
      expect(result!.currentPlayer).toBe('white');
    });
    
    it('应该拒绝在已有棋子的位置落子', () => {
      const state = createInitialGameState(DEFAULT_CONFIG);
      const result1 = placeStone(state, { row: 7, col: 7 });
      const result2 = placeStone(result1!, { row: 7, col: 7 });
      
      expect(result2).toBeNull();
    });
    
    it('应该轮流落子', () => {
      let state = createInitialGameState(DEFAULT_CONFIG);
      
      state = placeStone(state, { row: 7, col: 7 })!;
      expect(state.currentPlayer).toBe('white');
      
      state = placeStone(state, { row: 8, col: 8 })!;
      expect(state.currentPlayer).toBe('black');
    });
  });
  
  describe('checkWinner', () => {
    it('应该检测水平五连', () => {
      const board = createEmptyBoard(15);
      for (let i = 0; i < 5; i++) {
        board[7][5 + i] = 'black';
      }
      
      const winner = checkWinner(board, { row: 7, col: 7 }, 'black');
      expect(winner).toBe('black');
    });
    
    it('应该检测垂直五连', () => {
      const board = createEmptyBoard(15);
      for (let i = 0; i < 5; i++) {
        board[5 + i][7] = 'white';
      }
      
      const winner = checkWinner(board, { row: 7, col: 7 }, 'white');
      expect(winner).toBe('white');
    });
    
    it('应该检测对角线五连', () => {
      const board = createEmptyBoard(15);
      for (let i = 0; i < 5; i++) {
        board[5 + i][5 + i] = 'black';
      }
      
      const winner = checkWinner(board, { row: 7, col: 7 }, 'black');
      expect(winner).toBe('black');
    });
    
    it('不应该检测四连为胜利', () => {
      const board = createEmptyBoard(15);
      for (let i = 0; i < 4; i++) {
        board[7][5 + i] = 'black';
      }
      
      const winner = checkWinner(board, { row: 7, col: 8 }, 'black');
      expect(winner).toBeNull();
    });
  });
  
  describe('isPositionBlocked', () => {
    it('应该正确识别封锁区域', () => {
      const blockedZones = [{
        centerPosition: { row: 7, col: 7 },
        expiresAfterTurn: 10,
        blockedBy: 'black' as const
      }];
      
      // 中心点
      expect(isPositionBlocked({ row: 7, col: 7 }, blockedZones, 1)).toBe(true);
      // 边缘点 (3x3 区域内)
      expect(isPositionBlocked({ row: 6, col: 6 }, blockedZones, 1)).toBe(true);
      expect(isPositionBlocked({ row: 8, col: 8 }, blockedZones, 1)).toBe(true);
      // 区域外
      expect(isPositionBlocked({ row: 5, col: 5 }, blockedZones, 1)).toBe(false);
    });
    
    it('应该正确处理过期封锁', () => {
      const blockedZones = [{
        centerPosition: { row: 7, col: 7 },
        expiresAfterTurn: 5,
        blockedBy: 'black' as const
      }];
      
      // 未过期
      expect(isPositionBlocked({ row: 7, col: 7 }, blockedZones, 5)).toBe(true);
      // 已过期
      expect(isPositionBlocked({ row: 7, col: 7 }, blockedZones, 6)).toBe(false);
    });
  });
  
  describe('flipStones', () => {
    it('应该正确反转棋子颜色', () => {
      const board = createEmptyBoard(15);
      board[7][7] = 'black';
      board[7][8] = 'white';

      const newBoard = flipStones(board, [
        { row: 7, col: 7 },
        { row: 7, col: 8 }
      ]);

      expect(newBoard[7][7]).toBe('white');
      expect(newBoard[7][8]).toBe('black');
    });
  });
});

console.log('✓ 游戏核心逻辑测试用例已定义');
