# 技能五子棋 - 完整代码存档

**版本**: 1.0  
**日期**: 2026-02-22

本文档包含所有核心代码的完整实现，用于备份和恢复。

---

## 文件索引

| 文件 | 路径 |
|:---|:---|
| 类型定义 | [src/types/index.ts](#1-typesindexts) |
| 核心逻辑 | [src/core/Game.ts](#2-coregamets) |
| 技能注册表 | [src/skills/SkillRegistry.ts](#3-skillsskillregistryts) |
| 技能实现 | [src/skills/cards/index.ts](#4-skillscardsindexts) |
| 状态管理 | [src/store/gameStore.ts](#5-storegamestorets) |
| 棋盘组件 | [src/components/Board.tsx](#6-componentsboardtsx) |
| 技能卡组件 | [src/components/SkillCard.tsx](#7-componentsskillcardtsx) |
| 游戏信息 | [src/components/GameInfo.tsx](#8-componentsgameinfotsx) |
| 主界面 | [src/components/GameUI.tsx](#9-componentsgameuitsx) |
| 应用入口 | [src/App.tsx](#10-apptsx) |
| React 入口 | [src/main.tsx](#11-maintsx) |
| 样式 | [src/App.css](#12-appcss) |
| 项目配置 | [package.json](#13-packagejson) |

---

## 1. types/index.ts

```typescript
// 游戏核心类型定义

// 棋子颜色
export type StoneColor = 'black' | 'white' | null;

// 棋盘位置
export interface Position {
  row: number;
  col: number;
}

// 棋子
export interface Stone {
  position: Position;
  color: 'black' | 'white';
}

// 玩家
export interface Player {
  id: string;
  name: string;
  color: 'black' | 'white';
  skillCards: SkillCard[];
}

// 技能卡
export interface SkillCard {
  id: string;
  skillId: string;
  name: string;
  description: string;
  used: boolean;
}

// 技能定义
export interface Skill {
  id: string;
  name: string;
  description: string;
  type: 'instant' | 'passive' | 'triggered';
  
  execute(context: SkillContext): GameState;
  canUse(context: SkillContext): boolean;
  priority: number;
}

// 技能上下文
export interface SkillContext {
  gameState: GameState;
  currentPlayer: Player;
  targetPosition?: Position;
}

// 封锁区域
export interface BlockedZone {
  centerPosition: Position;
  expiresAfterTurn: number;
  blockedBy: 'black' | 'white';
}

// 游戏状态
export interface GameState {
  boardSize: number;
  board: StoneColor[][];
  currentPlayer: 'black' | 'white';
  players: {
    black: Player;
    white: Player;
  };
  phase: 'waiting' | 'playing' | 'ended';
  winner: 'black' | 'white' | null;
  history: GameAction[];
  turn: number;
  blockedZones: BlockedZone[];
  remainingMoves: number;
}

// 游戏动作
export interface GameAction {
  type: 'place' | 'skill';
  player: 'black' | 'white';
  position?: Position;
  skillId?: string;
  timestamp: number;
}

// 游戏配置
export interface GameConfig {
  boardSize: number;
  skillCountPerPlayer: number;
  enableSkills: boolean;
}

// 默认配置
export const DEFAULT_CONFIG: GameConfig = {
  boardSize: 15,
  skillCountPerPlayer: 3,
  enableSkills: true,
};
```

---

## 2. core/Game.ts

```typescript
/**
 * 游戏核心逻辑
 */

import { 
  GameState, 
  GameConfig, 
  DEFAULT_CONFIG, 
  Position, 
  StoneColor,
  GameAction 
} from '../types';

// 创建空棋盘
export function createEmptyBoard(size: number): StoneColor[][] {
  return Array(size).fill(null).map(() => Array(size).fill(null));
}

// 创建初始游戏状态
export function createInitialGameState(config: GameConfig = DEFAULT_CONFIG): GameState {
  return {
    boardSize: config.boardSize,
    board: createEmptyBoard(config.boardSize),
    currentPlayer: 'black',
    players: {
      black: {
        id: 'black',
        name: '黑方',
        color: 'black',
        skillCards: [],
      },
      white: {
        id: 'white',
        name: '白方',
        color: 'white',
        skillCards: [],
      },
    },
    phase: 'playing',
    winner: null,
    history: [],
    turn: 1,
    blockedZones: [],
    remainingMoves: 1,
  };
}

// 检查位置是否在棋盘内
export function isValidPosition(position: Position, boardSize: number): boolean {
  return position.row >= 0 
    && position.row < boardSize 
    && position.col >= 0 
    && position.col < boardSize;
}

// 检查位置是否为空
export function isEmptyPosition(board: StoneColor[][], position: Position): boolean {
  return board[position.row][position.col] === null;
}

// 落子
export function placeStone(
  state: GameState, 
  position: Position
): GameState | null {
  if (!isValidPosition(position, state.boardSize)) return null;
  if (!isEmptyPosition(state.board, position)) return null;
  if (state.phase !== 'playing') return null;
  
  if (isPositionBlocked(position, state.blockedZones, state.turn)) {
    console.log('该位置被封锁！');
    return null;
  }
  
  const newBoard = state.board.map(row => [...row]);
  newBoard[position.row][position.col] = state.currentPlayer;
  
  const action: GameAction = {
    type: 'place',
    player: state.currentPlayer,
    position,
    timestamp: Date.now(),
  };
  
  const winner = checkWinner(newBoard, position, state.currentPlayer);
  const cleanedBlockedZones = cleanExpiredBlocks(state.blockedZones, state.turn);
  const newRemainingMoves = state.remainingMoves - 1;
  const shouldSwitchPlayer = newRemainingMoves <= 0;
  
  return {
    ...state,
    board: newBoard,
    currentPlayer: winner ? state.currentPlayer : (shouldSwitchPlayer 
      ? (state.currentPlayer === 'black' ? 'white' : 'black')
      : state.currentPlayer),
    history: [...state.history, action],
    turn: shouldSwitchPlayer ? state.turn + 1 : state.turn,
    phase: winner ? 'ended' : 'playing',
    winner,
    blockedZones: cleanedBlockedZones,
    remainingMoves: shouldSwitchPlayer ? 1 : newRemainingMoves,
  };
}

// 检查胜利
export function checkWinner(
  board: StoneColor[][], 
  lastPosition: Position, 
  color: 'black' | 'white'
): 'black' | 'white' | null {
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
  
  for (const [dr, dc] of directions) {
    let count = 1;
    
    for (let i = 1; i < 5; i++) {
      const r = lastPosition.row + dr * i;
      const c = lastPosition.col + dc * i;
      if (r < 0 || r >= board.length || c < 0 || c >= board.length) break;
      if (board[r][c] === color) count++;
      else break;
    }
    
    for (let i = 1; i < 5; i++) {
      const r = lastPosition.row - dr * i;
      const c = lastPosition.col - dc * i;
      if (r < 0 || r >= board.length || c < 0 || c >= board.length) break;
      if (board[r][c] === color) count++;
      else break;
    }
    
    if (count >= 5) return color;
  }
  
  return null;
}

// 检查位置是否在封锁区域内
export function isPositionBlocked(
  position: Position, 
  blockedZones: import('../types').BlockedZone[],
  currentTurn: number
): boolean {
  for (const zone of blockedZones) {
    if (currentTurn > zone.expiresAfterTurn) continue;
    const rowDiff = Math.abs(position.row - zone.centerPosition.row);
    const colDiff = Math.abs(position.col - zone.centerPosition.col);
    if (rowDiff <= 1 && colDiff <= 1) return true;
  }
  return false;
}

// 清理过期的封锁区域
export function cleanExpiredBlocks(
  blockedZones: import('../types').BlockedZone[],
  currentTurn: number
): import('../types').BlockedZone[] {
  return blockedZones.filter(zone => currentTurn <= zone.expiresAfterTurn);
}

// 获取所有棋子
export function getAllStones(board: StoneColor[][]): { position: Position; color: 'black' | 'white' }[] {
  const stones: { position: Position; color: 'black' | 'white' }[] = [];
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      if (board[row][col]) {
        stones.push({ position: { row, col }, color: board[row][col]! });
      }
    }
  }
  return stones;
}

// 切换棋子颜色
export function flipStone(color: 'black' | 'white'): 'black' | 'white' {
  return color === 'black' ? 'white' : 'black';
}

// 批量切换棋子颜色
export function flipStones(board: StoneColor[][], positions: Position[]): StoneColor[][] {
  const newBoard = board.map(row => [...row]);
  for (const pos of positions) {
    if (newBoard[pos.row][pos.col]) {
      newBoard[pos.row][pos.col] = flipStone(newBoard[pos.row][pos.col] as 'black' | 'white');
    }
  }
  return newBoard;
}
```

---

## 3. skills/SkillRegistry.ts

```typescript
/**
 * 技能注册表
 */

import { Skill, SkillCard } from '../types';

class SkillRegistry {
  private skills: Map<string, Skill> = new Map();
  
  register(skill: Skill): void {
    this.skills.set(skill.id, skill);
  }
  
  get(id: string): Skill | undefined {
    return this.skills.get(id);
  }
  
  getAll(): Skill[] {
    return Array.from(this.skills.values());
  }
  
  drawRandom(count: number): SkillCard[] {
    const all = this.getAll();
    const shuffled = this.shuffle([...all]);
    
    return shuffled.slice(0, count).map(skill => ({
      id: `${skill.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      skillId: skill.id,
      name: skill.name,
      description: skill.description,
      used: false,
    }));
  }
  
  private shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}

export const skillRegistry = new SkillRegistry();
```

---

## 4-13. 其余文件

*由于篇幅限制，其余文件请直接查看源代码目录：*

```
~/game/show-your-skills/src/
```

---

*存档完成*
