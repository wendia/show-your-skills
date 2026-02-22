# 技能五子棋 (Show Your Skills) 设计文档

**版本**: 1.0  
**创建日期**: 2026-02-22  
**项目路径**: `~/game/show-your-skills`

---

## 目录

1. [项目概述](#1-项目概述)
2. [技术架构](#2-技术架构)
3. [目录结构](#3-目录结构)
4. [数据结构设计](#4-数据结构设计)
5. [核心逻辑实现](#5-核心逻辑实现)
6. [技能系统设计](#6-技能系统设计)
7. [状态管理](#7-状态管理)
8. [组件设计](#8-组件设计)
9. [API 接口](#9-api-接口)
10. [样式设计](#10-样式设计)
11. [运行与部署](#11-运行与部署)
12. [后续迭代方向](#12-后续迭代方向)

---

## 1. 项目概述

### 1.1 游戏简介

**技能五子棋**是一款带技能卡的五子棋对战游戏。与传统五子棋的区别在于：

- 每局开始时，双方各随机获得 **3 张技能卡**
- 玩家可以在对局中使用技能卡改变局势
- 每张技能卡只能使用一次
- 最终胜负标准与传统五子棋相同（五子连珠获胜）

### 1.2 核心玩法

```
┌─────────────────────────────────────────────────────┐
│                    游戏流程                          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1. 开始游戏                                        │
│     └─ 双方各获得 3 张随机技能卡                    │
│                                                     │
│  2. 对局进行                                        │
│     ├─ 轮流落子                                     │
│     └─ 可选择使用技能卡                            │
│                                                     │
│  3. 胜负判定                                        │
│     └─ 先达成五子连珠者获胜                        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 1.3 技术栈

| 类别 | 技术 |
|:---|:---|
| **前端框架** | React 18 + TypeScript |
| **构建工具** | Vite 5 |
| **状态管理** | Zustand 4 |
| **样式** | CSS (内联样式) |

---

## 2. 技术架构

### 2.1 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                      前端架构                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    组件层                            │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐             │   │
│  │  │ GameUI  │  │  Board  │  │SkillCard│             │   │
│  │  └─────────┘  └─────────┘  └─────────┘             │   │
│  │  ┌─────────┐  ┌─────────┐                          │   │
│  │  │GameInfo │  │SkillList│                          │   │
│  │  └─────────┘  └─────────┘                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                            ↓                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   状态管理层                         │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │              gameStore (Zustand)             │   │   │
│  │  │  - gameState                                 │   │   │
│  │  │  - selectedSkillCard                         │   │   │
│  │  │  - selectMode                                │   │   │
│  │  │  - previewPosition                           │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                            ↓                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    业务逻辑层                       │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐             │   │
│  │  │  Game   │  │  Skill  │  │  Skill  │             │   │
│  │  │ (core)  │  │Registry │  │  Cards  │             │   │
│  │  └─────────┘  └─────────┘  └─────────┘             │   │
│  └─────────────────────────────────────────────────────┘   │
│                            ↓                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    类型定义层                       │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │              types/index.ts                  │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 数据流

```
用户操作 → 组件 → Store Actions → 核心逻辑 → 更新 State → 组件重渲染
```

---

## 3. 目录结构

```
show-your-skills/
├── package.json              # 项目配置
├── tsconfig.json             # TypeScript 配置
├── vite.config.ts            # Vite 配置
├── index.html                # 入口 HTML
└── src/
    ├── main.tsx              # React 入口
    ├── App.tsx               # 应用主组件
    ├── App.css               # 全局样式
    │
    ├── types/
    │   └── index.ts          # 类型定义
    │
    ├── core/
    │   └── Game.ts           # 游戏核心逻辑
    │
    ├── skills/
    │   ├── SkillRegistry.ts  # 技能注册表
    │   └── cards/
    │       └── index.ts      # 技能卡实现
    │
    ├── store/
    │   └── gameStore.ts      # Zustand 状态管理
    │
    └── components/
        ├── GameUI.tsx        # 游戏主界面
        ├── Board.tsx         # 棋盘组件
        ├── GameInfo.tsx      # 游戏信息
        └── SkillCard.tsx     # 技能卡组件
```

---

## 4. 数据结构设计

### 4.1 核心类型定义

```typescript
// src/types/index.ts

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
```

### 4.2 数据关系图

```
GameState
├── board: StoneColor[][]          // 15x15 棋盘
├── currentPlayer: 'black' | 'white'
├── players
│   ├── black: Player
│   │   └── skillCards: SkillCard[]
│   └── white: Player
│       └── skillCards: SkillCard[]
├── phase: 'waiting' | 'playing' | 'ended'
├── winner: 'black' | 'white' | null
├── history: GameAction[]
├── turn: number
├── blockedZones: BlockedZone[]
└── remainingMoves: number
```

---

## 5. 核心逻辑实现

### 5.1 游戏核心 (src/core/Game.ts)

#### 5.1.1 创建游戏状态

```typescript
export function createInitialGameState(config: GameConfig = DEFAULT_CONFIG): GameState {
  return {
    boardSize: config.boardSize,
    board: createEmptyBoard(config.boardSize),
    currentPlayer: 'black',
    players: {
      black: { id: 'black', name: '黑方', color: 'black', skillCards: [] },
      white: { id: 'white', name: '白方', color: 'white', skillCards: [] },
    },
    phase: 'playing',
    winner: null,
    history: [],
    turn: 1,
    blockedZones: [],
    remainingMoves: 1,
  };
}
```

#### 5.1.2 落子逻辑

```typescript
export function placeStone(state: GameState, position: Position): GameState | null {
  // 验证
  if (!isValidPosition(position, state.boardSize)) return null;
  if (!isEmptyPosition(state.board, position)) return null;
  if (state.phase !== 'playing') return null;
  
  // 检查封锁区域
  if (isPositionBlocked(position, state.blockedZones, state.turn)) {
    return null;
  }
  
  // 放置棋子
  const newBoard = state.board.map(row => [...row]);
  newBoard[position.row][position.col] = state.currentPlayer;
  
  // 检查胜利
  const winner = checkWinner(newBoard, position, state.currentPlayer);
  
  // 处理双子和回合切换
  const newRemainingMoves = state.remainingMoves - 1;
  const shouldSwitchPlayer = newRemainingMoves <= 0;
  
  return {
    ...state,
    board: newBoard,
    currentPlayer: shouldSwitchPlayer 
      ? (state.currentPlayer === 'black' ? 'white' : 'black') 
      : state.currentPlayer,
    history: [...state.history, { type: 'place', player: state.currentPlayer, position }],
    turn: shouldSwitchPlayer ? state.turn + 1 : state.turn,
    phase: winner ? 'ended' : 'playing',
    winner,
    remainingMoves: shouldSwitchPlayer ? 1 : newRemainingMoves,
  };
}
```

#### 5.1.3 胜负判断

```typescript
export function checkWinner(
  board: StoneColor[][], 
  lastPosition: Position, 
  color: 'black' | 'white'
): 'black' | 'white' | null {
  const directions = [
    [0, 1],   // 水平
    [1, 0],   // 垂直
    [1, 1],   // 对角线
    [1, -1],  // 反对角线
  ];
  
  for (const [dr, dc] of directions) {
    let count = 1;
    
    // 正向计数
    for (let i = 1; i < 5; i++) {
      const r = lastPosition.row + dr * i;
      const c = lastPosition.col + dc * i;
      if (r < 0 || r >= board.length || c < 0 || c >= board.length) break;
      if (board[r][c] === color) count++;
      else break;
    }
    
    // 反向计数
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
```

#### 5.1.4 封锁区域检测

```typescript
export function isPositionBlocked(
  position: Position, 
  blockedZones: BlockedZone[],
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
```

---

## 6. 技能系统设计

### 6.1 技能注册表 (src/skills/SkillRegistry.ts)

```typescript
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
  
  // 随机抽取技能卡
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

### 6.2 技能卡实现 (src/skills/cards/index.ts)

#### 6.2.1 倒转乾坤

```typescript
export const ReverseChaosSkill: Skill = {
  id: 'reverse_chaos',
  name: '倒转乾坤',
  description: '随机反转棋面上 30% 的棋子颜色',
  type: 'instant',
  priority: 10,
  
  canUse(context: SkillContext): boolean {
    const stones = getAllStones(context.gameState.board);
    return stones.length >= 3;
  },
  
  execute(context: SkillContext): GameState {
    const { gameState } = context;
    const stones = getAllStones(gameState.board);
    
    const flipCount = Math.max(1, Math.floor(stones.length * 0.3));
    const shuffled = [...stones].sort(() => Math.random() - 0.5);
    const toFlip = shuffled.slice(0, flipCount).map(s => s.position);
    
    const newBoard = flipStones(gameState.board, toFlip);
    
    return { ...gameState, board: newBoard };
  },
};
```

#### 6.2.2 时间回溯

```typescript
export const TimeWarpSkill: Skill = {
  id: 'time_warp',
  name: '时间回溯',
  description: '撤销对手最近的一步棋',
  type: 'instant',
  priority: 20,
  
  canUse(context: SkillContext): boolean {
    return context.gameState.history.length > 0;
  },
  
  execute(context: SkillContext): GameState {
    const { gameState } = context;
    const history = gameState.history;
    
    // 找到最后一个落子
    let lastPlaceIndex = history.length - 1;
    while (lastPlaceIndex >= 0 && history[lastPlaceIndex].type !== 'place') {
      lastPlaceIndex--;
    }
    
    if (lastPlaceIndex < 0) return gameState;
    
    const lastAction = history[lastPlaceIndex];
    const position = lastAction.position!;
    
    // 移除棋子
    const newBoard = gameState.board.map(row => [...row]);
    newBoard[position.row][position.col] = null;
    
    const newHistory = history.slice(0, lastPlaceIndex);
    
    return {
      ...gameState,
      board: newBoard,
      history: newHistory,
      currentPlayer: lastAction.player,
      turn: gameState.turn - 1,
    };
  },
};
```

#### 6.2.3 棋子复制

```typescript
export const CloneSkill: Skill = {
  id: 'clone',
  name: '棋子复制',
  description: '在指定空位放置己方棋子',
  type: 'instant',
  priority: 15,
  
  canUse(context: SkillContext): boolean {
    const { gameState, targetPosition } = context;
    if (!targetPosition) return false;
    return gameState.board[targetPosition.row][targetPosition.col] === null;
  },
  
  execute(context: SkillContext): GameState {
    const { gameState, currentPlayer, targetPosition } = context;
    
    if (!targetPosition) return gameState;
    
    const newBoard = gameState.board.map(row => [...row]);
    newBoard[targetPosition.row][targetPosition.col] = currentPlayer.color;
    
    return {
      ...gameState,
      board: newBoard,
      currentPlayer: gameState.currentPlayer === 'black' ? 'white' : 'black',
      turn: gameState.turn + 1,
    };
  },
};
```

#### 6.2.4 区域封锁

```typescript
export const BlockZoneSkill: Skill = {
  id: 'block_zone',
  name: '区域封锁',
  description: '选择棋盘位置，封锁周围 3x3 区域一回合',
  type: 'instant',
  priority: 25,
  
  canUse(context: SkillContext): boolean {
    return context.gameState.phase === 'playing';
  },
  
  execute(context: SkillContext): GameState {
    const { gameState, currentPlayer, targetPosition } = context;
    
    const centerPos: Position = targetPosition || { row: 7, col: 7 };
    
    const newBlock: BlockedZone = {
      centerPosition: centerPos,
      expiresAfterTurn: gameState.turn + 1,
      blockedBy: currentPlayer.color,
    };
    
    return {
      ...gameState,
      blockedZones: [...gameState.blockedZones, newBlock],
    };
  },
};
```

#### 6.2.5 双子

```typescript
export const DoubleMoveSkill: Skill = {
  id: 'double_move',
  name: '双子',
  description: '本回合可以连续落两子',
  type: 'instant',
  priority: 30,
  
  canUse(context: SkillContext): boolean {
    return context.gameState.phase === 'playing' && 
           context.gameState.remainingMoves === 1;
  },
  
  execute(context: SkillContext): GameState {
    const { gameState } = context;
    
    return {
      ...gameState,
      remainingMoves: 2,
    };
  },
};
```

### 6.3 技能使用流程

```
1. 玩家点击技能卡「使用」按钮
       ↓
2. 检查是否需要选择目标位置
   ├─ 是 (区域封锁/棋子复制) → 进入选择模式
   │   ↓
   │   玩家点击棋盘选择位置
   │   ↓
   └─ 否 (其他技能) → 直接执行
       ↓
3. gameStore.useSkill(skillCardId, targetPosition)
       ↓
4. 从 skillRegistry 获取技能定义
       ↓
5. skill.canUse(context) 检查条件
       ↓
6. skill.execute(context) 执行效果
       ↓
7. 标记技能卡 used = true
       ↓
8. 更新游戏状态
```

---

## 7. 状态管理

### 7.1 Store 定义 (src/store/gameStore.ts)

```typescript
interface GameStore {
  gameState: GameState | null;
  config: GameConfig;
  selectedSkillCard: string | null;
  selectMode: 'none' | 'blockZone' | 'clone';
  previewPosition: Position | null;
  
  startGame: () => void;
  placeStone: (position: Position) => void;
  useSkill: (skillCardId: string, targetPosition?: Position) => void;
  selectSkillCard: (skillCardId: string | null) => void;
  setSelectMode: (mode: 'none' | 'blockZone' | 'clone') => void;
  setPreviewPosition: (position: Position | null) => void;
  resetGame: () => void;
}
```

### 7.2 状态流程

```
                    ┌─────────────────┐
                    │   startGame()   │
                    └────────┬────────┘
                             ↓
┌──────────────────────────────────────────────────────┐
│                   playing 状态                        │
│                                                      │
│   placeStone() ←──────→ 普通落子                     │
│        ↓                                             │
│   useSkill() ←────────→ 使用技能                     │
│        ↓                                             │
│   selectMode ──────────→ 选择模式 (区域封锁/复制)    │
│        ↓                                             │
│   previewPosition ─────→ 预览位置                    │
│                                                      │
└──────────────────────────────────────────────────────┘
                             ↓
                    ┌─────────────────┐
                    │  ended 状态     │
                    └─────────────────┘
```

---

## 8. 组件设计

### 8.1 GameUI (主界面)

```typescript
// 布局结构
<div className="game-ui">
  <div className="left-panel">   {/* 游戏信息 */}
    <GameInfo />
  </div>
  
  <div className="center-panel"> {/* 棋盘 */}
    <Board />
  </div>
  
  <div className="right-panel">  {/* 技能卡 */}
    <SkillCardList />
  </div>
</div>
```

### 8.2 Board (棋盘)

```typescript
// 功能
- 显示 15x15 棋盘
- 处理点击事件 (落子)
- 处理鼠标悬停 (预览封锁区域)
- 显示封锁区域 (灰色 + 🚫)
- 显示预览区域 (半透明红色)

// Props
- 无 (使用 useGameStore)

// 关键状态
- selectMode: 当前选择模式
- previewPosition: 预览位置
- blockedZones: 封锁区域列表
```

### 8.3 SkillCard (技能卡)

```typescript
// 功能
- 显示技能卡信息
- 处理使用按钮点击
- 显示使用状态

// 交互
- 点击按钮 → 使用技能
- 区域封锁/棋子复制 → 进入选择模式
```

### 8.4 GameInfo (游戏信息)

```typescript
// 功能
- 显示当前回合
- 显示游戏状态
- 开始/重新开始按钮
- 显示游戏规则
```

---

## 9. API 接口

### 9.1 当前状态 (纯前端)

目前项目为纯前端实现，无后端 API。

### 9.2 未来 API 设计 (预留)

#### 9.2.1 游戏相关

```typescript
// 创建游戏
POST /api/games
Request: { config: GameConfig }
Response: { gameId: string, gameState: GameState }

// 获取游戏状态
GET /api/games/:gameId
Response: { gameState: GameState }

// 落子
POST /api/games/:gameId/move
Request: { position: Position }
Response: { gameState: GameState }

// 使用技能
POST /api/games/:gameId/skill
Request: { skillCardId: string, targetPosition?: Position }
Response: { gameState: GameState }
```

#### 9.2.2 玩家相关

```typescript
// 创建玩家
POST /api/players
Request: { name: string }
Response: { playerId: string }

// 加入游戏
POST /api/games/:gameId/join
Request: { playerId: string }
Response: { gameState: GameState }
```

---

## 10. 样式设计

### 10.1 颜色方案

| 元素 | 颜色 | 说明 |
|:---|:---|:---|
| 棋盘背景 | #dcb35c | 木质棕色 |
| 黑子 | #1a1a1a | 深色 |
| 白子 | #f5f5f5 | 浅色 |
| 预览区域 | rgba(244, 67, 54, 0.5) | 半透明红色 |
| 封锁区域 | #9e9e9e | 灰色 |
| 选中边框 | #4CAF50 | 绿色 |
| 按钮 (默认) | #2196F3 | 蓝色 |
| 按钮 (选中) | #4CAF50 | 绿色 |

### 10.2 组件尺寸

| 组件 | 尺寸 |
|:---|:---|
| 棋盘格子 | 36px × 36px |
| 棋子 | 30px (直径) |
| 技能卡 | 140px 宽 |
| 左侧面板 | 250px 宽 |
| 右侧面板 | 300px 宽 |

---

## 11. 运行与部署

### 11.1 开发环境

```bash
cd ~/game/show-your-skills

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问
# http://localhost:3000
```

### 11.2 生产构建

```bash
# 构建
npm run build

# 预览
npm run preview
```

### 11.3 部署选项

| 方案 | 说明 |
|:---|:---|
| **静态托管** | npm run build 后部署到 Vercel/Netlify |
| **Docker** | 创建 Dockerfile 使用 nginx 镜像 |
| **Node.js** | 使用 serve 或 http-server |

---

## 12. 后续迭代方向

### 12.1 短期 (v1.1)

| 功能 | 优先级 | 说明 |
|:---|:---:|:---|
| 更多技能卡 | ⭐⭐⭐ | 增加 5-10 个新技能 |
| 技能动画 | ⭐⭐⭐ | 棋子翻转、消失等动画效果 |
| 音效 | ⭐⭐ | 落子音效、技能音效 |
| 悔棋功能 | ⭐⭐ | 普通悔棋 |

### 12.2 中期 (v1.5)

| 功能 | 优先级 | 说明 |
|:---|:---:|:---|
| 双人在线对战 | ⭐⭐⭐⭐ | WebSocket 实时同步 |
| 游戏回放 | ⭐⭐⭐ | 记录完整对局 |
| 排行榜 | ⭐⭐ | 胜率统计 |

### 12.3 长期 (v2.0)

| 功能 | 优先级 | 说明 |
|:---|:---:|:---|
| AI 对手 | ⭐⭐⭐⭐⭐ | 单人模式 |
| 技能编辑器 | ⭐⭐⭐ | 自定义技能 |
| 观战模式 | ⭐⭐ | 实时观战 |

---

## 附录

### A. 文件清单

| 文件 | 行数 | 说明 |
|:---|:---:|:---|
| types/index.ts | ~80 | 类型定义 |
| core/Game.ts | ~150 | 核心逻辑 |
| skills/SkillRegistry.ts | ~40 | 技能注册表 |
| skills/cards/index.ts | ~200 | 技能实现 |
| store/gameStore.ts | ~120 | 状态管理 |
| components/*.tsx | ~400 | 组件 |

### B. 依赖清单

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.5.0",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}
```

---

*文档最后更新: 2026-02-22*
