#!/usr/bin/env ts-node
/**
 * 简单测试运行器
 * 不依赖 Jest，直接运行测试
 */

// ======== 测试工具 ========
let testsPassed = 0;
let testsFailed = 0;
const failedTests: string[] = [];

function describe(name: string, fn: () => void) {
  console.log(`\n📦 ${name}`);
  fn();
}

function it(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    testsPassed++;
  } catch (error: any) {
    console.log(`  ❌ ${name}`);
    console.log(`     Error: ${error.message}`);
    testsFailed++;
    failedTests.push(name);
  }
}

function expect(actual: any) {
  return {
    toBe(expected: any) {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, got ${actual}`);
      }
    },
    toEqual(expected: any) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
      }
    },
    toBeTruthy() {
      if (!actual) {
        throw new Error(`Expected truthy value, got ${actual}`);
      }
    },
    toBeFalsy() {
      if (actual) {
        throw new Error(`Expected falsy value, got ${actual}`);
      }
    },
    toBeNull() {
      if (actual !== null) {
        throw new Error(`Expected null, got ${actual}`);
      }
    },
    toBeGreaterThan(expected: number) {
      if (actual <= expected) {
        throw new Error(`Expected ${actual} > ${expected}`);
      }
    },
    toBeLessThan(expected: number) {
      if (actual >= expected) {
        throw new Error(`Expected ${actual} < ${expected}`);
      }
    },
    toContain(expected: any) {
      if (!actual.includes(expected)) {
        throw new Error(`Expected ${JSON.stringify(actual)} to contain ${expected}`);
      }
    },
    toHaveLength(expected: number) {
      if (actual.length !== expected) {
        throw new Error(`Expected length ${expected}, got ${actual.length}`);
      }
    }
  };
}

// ======== 导入被测模块 ========
import {
  createEmptyBoard,
  createInitialGameState,
  isValidPosition,
  isEmptyPosition,
  checkWinner,
  isPositionBlocked,
  flipStones,
  getAllStones,
} from './src/core/Game';

// ======== 测试用例 ========

describe('🎮 游戏核心逻辑', () => {
  
  describe('createEmptyBoard', () => {
    it('应该创建 15x15 的空棋盘', () => {
      const board = createEmptyBoard(15);
      expect(board.length).toBe(15);
      expect(board[0].length).toBe(15);
    });
    
    it('棋盘所有格子应为 null', () => {
      const board = createEmptyBoard(15);
      expect(board[7][7]).toBeNull();
      expect(board[0][0]).toBeNull();
      expect(board[14][14]).toBeNull();
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
      expect(isValidPosition({ row: 0, col: -1 }, 15)).toBe(false);
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
      
      expect(isPositionBlocked({ row: 7, col: 7 }, blockedZones, 1)).toBe(true);
      expect(isPositionBlocked({ row: 6, col: 6 }, blockedZones, 1)).toBe(true);
      expect(isPositionBlocked({ row: 8, col: 8 }, blockedZones, 1)).toBe(true);
      expect(isPositionBlocked({ row: 5, col: 5 }, blockedZones, 1)).toBe(false);
    });
    
    it('应该正确处理过期封锁', () => {
      const blockedZones = [{
        centerPosition: { row: 7, col: 7 },
        expiresAfterTurn: 5,
        blockedBy: 'black' as const
      }];
      
      expect(isPositionBlocked({ row: 7, col: 7 }, blockedZones, 5)).toBe(true);
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
  
  describe('getAllStones', () => {
    it('应该返回所有棋子', () => {
      const board = createEmptyBoard(15);
      board[7][7] = 'black';
      board[7][8] = 'white';
      
      const stones = getAllStones(board);
      expect(stones.length).toBe(2);
    });
  });
});

// ======== 运行结果 ========
console.log('\n' + '='.repeat(50));
console.log('📊 测试结果');
console.log('='.repeat(50));
console.log(`✅ 通过: ${testsPassed}`);
console.log(`❌ 失败: ${testsFailed}`);
console.log(`📈 总计: ${testsPassed + testsFailed}`);

if (testsFailed > 0) {
  console.log('\n❌ 失败的测试:');
  failedTests.forEach(name => console.log(`   - ${name}`));
  process.exit(1);
} else {
  console.log('\n🎉 所有测试通过!');
  process.exit(0);
}
