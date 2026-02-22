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
  
  // 执行技能
  execute(context: SkillContext): GameState;
  
  // 是否可以使用
  canUse(context: SkillContext): boolean;
  
  // 优先级
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
  centerPosition: Position;  // 中心位置
  expiresAfterTurn: number;  // 在哪回合后过期
  blockedBy: 'black' | 'white';  // 谁设置的封锁
}

// 游戏状态
export interface GameState {
  // 棋盘大小
  boardSize: number;
  
  // 棋盘状态 (15x15)
  board: StoneColor[][];
  
  // 当前玩家
  currentPlayer: 'black' | 'white';
  
  // 玩家信息
  players: {
    black: Player;
    white: Player;
  };
  
  // 游戏阶段
  phase: 'waiting' | 'playing' | 'ended';
  
  // 胜者
  winner: 'black' | 'white' | null;
  
  // 历史记录
  history: GameAction[];
  
  // 回合数
  turn: number;
  
  // === 技能相关状态 ===
  
  // 封锁区域列表
  blockedZones: BlockedZone[];
  
  // 双子标记：当前玩家还可以落几子
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
