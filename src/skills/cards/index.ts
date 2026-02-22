/**
 * 技能卡实现
 */

import { Skill, SkillContext, GameState, BlockedZone, Position } from '../../types';
import { getAllStones, flipStones } from '../../core/Game';

/**
 * 倒转乾坤技能
 * 随机反转棋面上一定比例的棋子
 */
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
    
    console.log(`[倒转乾坤] 反转了 ${toFlip.length} 颗棋子`);
    
    return {
      ...gameState,
      board: newBoard,
    };
  },
};

/**
 * 时间回溯技能
 * 撤销最近的一步棋
 */
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
    
    if (history.length === 0) {
      return gameState;
    }
    
    let lastPlaceIndex = history.length - 1;
    while (lastPlaceIndex >= 0 && history[lastPlaceIndex].type !== 'place') {
      lastPlaceIndex--;
    }
    
    if (lastPlaceIndex < 0) {
      return gameState;
    }
    
    const lastAction = history[lastPlaceIndex];
    const position = lastAction.position!;
    
    const newBoard = gameState.board.map(row => [...row]);
    newBoard[position.row][position.col] = null;
    
    const newHistory = history.slice(0, lastPlaceIndex);
    
    console.log(`[时间回溯] 撤销了 (${position.row}, ${position.col}) 处的棋子`);
    
    return {
      ...gameState,
      board: newBoard,
      history: newHistory,
      currentPlayer: lastAction.player,
      turn: gameState.turn - 1,
    };
  },
};

/**
 * 棋子复制技能
 * 在指定位置放置己方棋子
 */
export const CloneSkill: Skill = {
  id: 'clone',
  name: '棋子复制',
  description: '在指定空位放置己方棋子（需要先点击棋盘选择位置）',
  type: 'instant',
  priority: 15,
  
  canUse(context: SkillContext): boolean {
    const { gameState, targetPosition } = context;
    if (!targetPosition) return false;
    return gameState.board[targetPosition.row][targetPosition.col] === null;
  },
  
  execute(context: SkillContext): GameState {
    const { gameState, currentPlayer, targetPosition } = context;
    
    if (!targetPosition) {
      console.log('[棋子复制] 未指定目标位置');
      return gameState;
    }
    
    if (gameState.board[targetPosition.row][targetPosition.col] !== null) {
      console.log('[棋子复制] 目标位置不为空');
      return gameState;
    }
    
    const newBoard = gameState.board.map(row => [...row]);
    newBoard[targetPosition.row][targetPosition.col] = currentPlayer.color;
    
    console.log(`[棋子复制] 在 (${targetPosition.row}, ${targetPosition.col}) 放置了棋子`);
    
    return {
      ...gameState,
      board: newBoard,
      currentPlayer: gameState.currentPlayer === 'black' ? 'white' : 'black',
      turn: gameState.turn + 1,
    };
  },
};

/**
 * 区域封锁技能
 * 禁止在指定 3x3 区域落子一回合
 */
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
    
    // 确定封锁中心位置
    const centerPos: Position = targetPosition || { row: 7, col: 7 };
    
    // 创建新的封锁区域
    const newBlock: BlockedZone = {
      centerPosition: centerPos,
      expiresAfterTurn: gameState.turn + 1,  // 一回合后过期
      blockedBy: currentPlayer.color,
    };
    
    console.log(`[区域封锁] 封锁了中心 (${centerPos.row}, ${centerPos.col}) 的 3x3 区域，持续到回合 ${newBlock.expiresAfterTurn}`);
    
    return {
      ...gameState,
      blockedZones: [...gameState.blockedZones, newBlock],
    };
  },
};

/**
 * 双子技能
 * 本回合可以连续落两子
 */
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
    
    console.log('[双子] 本回合可以连续落两子');
    
    return {
      ...gameState,
      remainingMoves: 2,  // 设置为 2，落子后会递减
    };
  },
};

// 注册所有技能
import { skillRegistry } from '../SkillRegistry';

export function registerAllSkills(): void {
  skillRegistry.register(ReverseChaosSkill);
  skillRegistry.register(TimeWarpSkill);
  skillRegistry.register(CloneSkill);
  skillRegistry.register(BlockZoneSkill);
  skillRegistry.register(DoubleMoveSkill);
  
  console.log('已注册技能:', skillRegistry.getAll().map(s => s.name).join(', '));
}
