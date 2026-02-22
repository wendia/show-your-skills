/**
 * 游戏状态管理
 */

import { create } from 'zustand';
import { 
  GameState, 
  GameConfig, 
  DEFAULT_CONFIG, 
  Position,
  Player,
} from '../types';
import { 
  createInitialGameState, 
  placeStone as placeStoneLogic 
} from '../core/Game';
import { skillRegistry } from '../skills/SkillRegistry';
import { registerAllSkills } from '../skills/cards';

// 确保技能在模块加载时注册
registerAllSkills();

interface GameStore {
  // 游戏状态
  gameState: GameState | null;
  
  // 配置
  config: GameConfig;
  
  // 选中的技能卡
  selectedSkillCard: string | null;
  
  // 选择模式（用于区域封锁等需要选择位置的技能）
  selectMode: 'none' | 'blockZone' | 'clone';
  
  // 预览位置（鼠标悬停时）
  previewPosition: Position | null;
  
  // Actions
  startGame: () => void;
  placeStone: (position: Position) => void;
  useSkill: (skillCardId: string, targetPosition?: Position) => void;
  selectSkillCard: (skillCardId: string | null) => void;
  setSelectMode: (mode: 'none' | 'blockZone' | 'clone') => void;
  setPreviewPosition: (position: Position | null) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: null,
  config: DEFAULT_CONFIG,
  selectedSkillCard: null,
  selectMode: 'none',
  previewPosition: null,
  
  // 设置选择模式
  setSelectMode: (mode: 'none' | 'blockZone' | 'clone') => {
    set({ selectMode: mode, previewPosition: null });
  },
  
  // 设置预览位置
  setPreviewPosition: (position: Position | null) => {
    set({ previewPosition: position });
  },
  
  // 开始游戏
  startGame: () => {
    const config = get().config;
    
    // 确保技能已注册
    registerAllSkills();
    
    const initialState = createInitialGameState(config);
    
    // 如果启用技能，分配技能卡
    if (config.enableSkills) {
      const skillCards = skillRegistry.drawRandom(config.skillCountPerPlayer * 2);
      
      // 分配给两个玩家
      initialState.players.black.skillCards = skillCards.slice(0, config.skillCountPerPlayer);
      initialState.players.white.skillCards = skillCards.slice(config.skillCountPerPlayer);
    }
    
    console.log('游戏开始，技能卡已分配:', {
      black: initialState.players.black.skillCards.map(c => c.name),
      white: initialState.players.white.skillCards.map(c => c.name),
    });
    
    set({ gameState: initialState, selectedSkillCard: null });
  },
  
  // 落子
  placeStone: (position: Position) => {
    const { gameState, selectedSkillCard, selectMode } = get();
    
    if (!gameState || gameState.phase !== 'playing') {
      return;
    }
    
    // 如果在选择模式下
    if (selectMode === 'blockZone') {
      // 使用区域封锁技能
      if (selectedSkillCard) {
        get().useSkill(selectedSkillCard, position);
        set({ selectMode: 'none', previewPosition: null });
      }
      return;
    }
    
    if (selectMode === 'clone') {
      // 使用棋子复制技能
      if (selectedSkillCard) {
        get().useSkill(selectedSkillCard, position);
        set({ selectMode: 'none', previewPosition: null });
      }
      return;
    }
    
    // 如果选中了技能卡（某些技能需要选择目标位置）
    if (selectedSkillCard) {
      // 调用 useSkill
      get().useSkill(selectedSkillCard, position);
      return;
    }
    
    // 普通落子
    const newState = placeStoneLogic(gameState, position);
    
    if (newState) {
      set({ gameState: newState });
    }
  },
  
  // 使用技能
  useSkill: (skillCardId: string, targetPosition?: Position) => {
    const { gameState } = get();
    
    console.log('尝试使用技能:', skillCardId);
    
    if (!gameState || gameState.phase !== 'playing') {
      console.log('游戏状态不正确');
      return;
    }
    
    const currentPlayer = gameState.players[gameState.currentPlayer];
    const skillCard = currentPlayer.skillCards.find(card => card.id === skillCardId);
    
    console.log('技能卡:', skillCard);
    
    if (!skillCard || skillCard.used) {
      console.log('技能卡不可用');
      return;
    }
    
    // 执行技能
    const skill = skillRegistry.get(skillCard.skillId);
    
    console.log('技能:', skill ? skill.name : '未找到');
    
    if (!skill) {
      console.log('技能未注册');
      return;
    }
    
    const context = {
      gameState,
      currentPlayer,
      targetPosition,
    };
    
    if (!skill.canUse(context)) {
      console.log('技能条件不满足');
      return;
    }
    
    console.log('执行技能:', skill.name);
    let newState = skill.execute(context);
    
    // 标记技能卡已使用
    newState = {
      ...newState,
      players: {
        ...newState.players,
        [gameState.currentPlayer]: {
          ...newState.players[gameState.currentPlayer],
          skillCards: newState.players[gameState.currentPlayer].skillCards.map(card => 
            card.id === skillCardId ? { ...card, used: true } : card
          ),
        },
      },
    };
    
    console.log('技能执行完成');
    set({ gameState: newState, selectedSkillCard: null });
  },
  
  // 选择技能卡
  selectSkillCard: (skillCardId: string | null) => {
    set({ selectedSkillCard: skillCardId });
  },
  
  // 重置游戏
  resetGame: () => {
    set({ gameState: null, selectedSkillCard: null });
  },
}));
