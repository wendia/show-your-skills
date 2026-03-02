/**
 * 技能卡组件
 *
 * @deprecated Use '@/components/game/SkillCard' instead.
 * This file is kept for backward compatibility.
 * See INCOMPLETE_WORKPLAN.md for migration details.
 */

import React from 'react';
import { SkillCard as SkillCardType } from '@/config/types';
import { useGameStore } from '../store/gameStore';
import styles from './SkillCard.module.scss';

interface SkillCardProps {
  card: SkillCardType;
  isCurrentPlayer: boolean;
}

export const SkillCardComponent: React.FC<SkillCardProps> = ({ card, isCurrentPlayer }) => {
  const { selectedSkillCard, selectSkillCard, setSelectMode, useSkill } = useGameStore();
  
  const isSelected = selectedSkillCard === card.id;
  const isDisabled = card.used || !isCurrentPlayer;
  
  const handleClick = () => {
    if (isDisabled) return;
    
    if (isSelected) {
      selectSkillCard(null);
      setSelectMode('none');
    } else {
      selectSkillCard(card.id);
    }
  };
  
  const handleUse = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDisabled) return;
    
    console.log('点击使用技能卡:', card.name);
    
    if (card.skillId === 'block_zone') {
      selectSkillCard(card.id);
      setSelectMode('blockZone');
      console.log('请在棋盘上点击选择封锁区域中心');
      return;
    }
    
    if (card.skillId === 'clone') {
      selectSkillCard(card.id);
      setSelectMode('clone');
      console.log('请在棋盘上点击选择目标位置');
      return;
    }
    
    useSkill(card.id);
  };

  const cardClasses = [
    styles.card,
    isSelected ? styles.selected : '',
    card.used ? styles.used : '',
    isDisabled ? styles.disabled : '',
  ].filter(Boolean).join(' ');
  
  return (
    <div className={cardClasses} onClick={handleClick}>
      {/* 技能图标 */}
      <div className={styles.icon}>{getSkillEmoji(card.skillId)}</div>
      
      {/* 技能名称 */}
      <div className={`${styles.name} ${card.used ? styles.nameUsed : ''}`}>
        {card.name}
      </div>
      
      {/* 技能描述 */}
      <div className={styles.description}>{card.description}</div>
      
      {/* 使用按钮 */}
      {!card.used && isCurrentPlayer && (
        <button
          onClick={handleUse}
          className={styles.useBtn}
          style={{ backgroundColor: getButtonColor(card.skillId, isSelected) }}
        >
          {getButtonText(card.skillId, isSelected)}
        </button>
      )}
      
      {/* 已使用标记 */}
      {card.used && <div className={styles.usedTag}>✓ 已使用</div>}
    </div>
  );
};

// 获取技能图标
function getSkillEmoji(skillId: string): string {
  const emojis: Record<string, string> = {
    'reverse_chaos': '🔄',
    'time_warp': '⏪',
    'clone': '👯',
    'block_zone': '🚫',
    'double_move': '⚡',
  };
  return emojis[skillId] || '✨';
}

// 获取按钮颜色
function getButtonColor(skillId: string, isSelected: boolean): string {
  if (skillId === 'block_zone' && isSelected) {
    return '#f44336'; // 红色，表示正在选择区域
  }
  if (skillId === 'clone' && isSelected) {
    return '#ff9800'; // 橙色，表示正在选择位置
  }
  return isSelected ? '#4CAF50' : '#2196F3';
}

// 获取按钮文字
function getButtonText(skillId: string, isSelected: boolean): string {
  if (skillId === 'block_zone') {
    return isSelected ? '选择区域...' : '封锁';
  }
  if (skillId === 'clone') {
    return isSelected ? '选择位置...' : '复制';
  }
  return isSelected ? '已选中' : '使用';
}

/**
 * 玩家技能卡列表
 */
export const SkillCardList: React.FC = () => {
  const { gameState, selectMode } = useGameStore();

  if (!gameState) return null;

  const currentPlayer = gameState.players[gameState.currentPlayer];
  const opponent = gameState.players[gameState.currentPlayer === 'black' ? 'white' : 'black'];

  // Safely access skillCards with fallback to empty array
  const currentPlayerCards = currentPlayer?.skillCards ?? [];
  const opponentCards = opponent?.skillCards ?? [];
  const currentPlayerName = (currentPlayer as { username?: string; name?: string })?.username
    || (currentPlayer as { username?: string; name?: string })?.name
    || 'Current Player';
  const opponentName = (opponent as { username?: string; name?: string })?.username
    || (opponent as { username?: string; name?: string })?.name
    || 'Opponent';

  return (
    <div className={styles.container}>
      {/* 选择模式提示 */}
      {selectMode !== 'none' && (
        <div className={styles.selectHint}>
          {selectMode === 'blockZone' && '🚫 请在棋盘上点击选择封锁区域'}
          {selectMode === 'clone' && '👯 请在棋盘上点击选择目标位置'}
        </div>
      )}
      
      {/* 当前玩家 */}
      <div className={styles.playerSection}>
        <div className={`${styles.playerHeader} ${styles.playerHeaderCurrent}`}>
          {getPlayerIcon(currentPlayer?.color ?? 'black')} {currentPlayerName}
          <span className={styles.currentTurnHint}>(当前回合)</span>
        </div>
        <div className={styles.cardList}>
          {currentPlayerCards.map(card => (
            <SkillCardComponent
              key={card.id}
              card={card}
              isCurrentPlayer={true}
            />
          ))}
        </div>
      </div>

      {/* 对手 */}
      <div className={styles.opponentSection}>
        <div className={`${styles.playerHeader} ${styles.playerHeaderOpponent}`}>
          {getPlayerIcon(opponent?.color ?? 'white')} {opponentName}
        </div>
        <div className={styles.cardList}>
          {opponentCards.map(card => (
            <SkillCardComponent 
              key={card.id} 
              card={card} 
              isCurrentPlayer={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// 获取玩家图标
function getPlayerIcon(color: 'black' | 'white'): string {
  return color === 'black' ? '⚫' : '⚪';
}
