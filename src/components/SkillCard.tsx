/**
 * 技能卡组件
 */

import React from 'react';
import { SkillCard as SkillCardType } from '../types';
import { useGameStore } from '../store/gameStore';

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
    
    // 区域封锁需要先选择位置
    if (card.skillId === 'block_zone') {
      selectSkillCard(card.id);
      setSelectMode('blockZone');
      console.log('请在棋盘上点击选择封锁区域中心');
      return;
    }
    
    // 棋子复制需要先选择位置
    if (card.skillId === 'clone') {
      selectSkillCard(card.id);
      setSelectMode('clone');
      console.log('请在棋盘上点击选择目标位置');
      return;
    }
    
    // 其他技能直接使用
    useSkill(card.id);
  };
  
  return (
    <div
      className={`skill-card ${isSelected ? 'selected' : ''} ${card.used ? 'used' : ''}`}
      onClick={handleClick}
      style={{
        width: '140px',
        padding: '12px',
        margin: '5px',
        borderRadius: '12px',
        border: isSelected ? '3px solid #4CAF50' : '2px solid #ddd',
        backgroundColor: card.used ? '#f5f5f5' : (isSelected ? '#e8f5e9' : '#fff'),
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.5 : 1,
        transition: 'all 0.2s ease',
        boxShadow: isSelected 
          ? '0 6px 20px rgba(76, 175, 80, 0.4)' 
          : '0 2px 8px rgba(0,0,0,0.1)',
        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
      }}
    >
      {/* 技能图标 */}
      <div style={{
        fontSize: '24px',
        textAlign: 'center',
        marginBottom: '8px',
      }}>
        {getSkillEmoji(card.skillId)}
      </div>
      
      {/* 技能名称 */}
      <div style={{ 
        fontWeight: 'bold', 
        marginBottom: '5px', 
        fontSize: '14px',
        textAlign: 'center',
        color: card.used ? '#999' : '#333',
      }}>
        {card.name}
      </div>
      
      {/* 技能描述 */}
      <div style={{ 
        fontSize: '11px', 
        color: '#666',
        lineHeight: '1.4',
        minHeight: '30px',
      }}>
        {card.description}
      </div>
      
      {/* 使用按钮 */}
      {!card.used && isCurrentPlayer && (
        <button
          onClick={handleUse}
          style={{
            marginTop: '10px',
            width: '100%',
            padding: '8px 0',
            fontSize: '13px',
            fontWeight: 'bold',
            backgroundColor: getButtonColor(card.skillId, isSelected),
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
        >
          {getButtonText(card.skillId, isSelected)}
        </button>
      )}
      
      {/* 已使用标记 */}
      {card.used && (
        <div style={{
          marginTop: '10px',
          textAlign: 'center',
          color: '#999',
          fontSize: '12px',
        }}>
          ✓ 已使用
        </div>
      )}
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
  
  return (
    <div className="skill-cards-container" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '25px' 
    }}>
      {/* 选择模式提示 */}
      {selectMode !== 'none' && (
        <div style={{
          padding: '12px',
          backgroundColor: '#fff3e0',
          border: '2px solid #ff9800',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#e65100',
          textAlign: 'center',
        }}>
          {selectMode === 'blockZone' && '🚫 请在棋盘上点击选择封锁区域'}
          {selectMode === 'clone' && '👯 请在棋盘上点击选择目标位置'}
        </div>
      )}
      
      {/* 当前玩家 */}
      <div>
        <div style={{ 
          fontWeight: 'bold', 
          marginBottom: '12px',
          fontSize: '16px',
          color: '#333',
          padding: '8px 12px',
          backgroundColor: '#e3f2fd',
          borderRadius: '8px',
        }}>
          {getPlayerIcon(currentPlayer.color)} {currentPlayer.name}
          <span style={{ 
            fontSize: '12px', 
            color: '#666',
            marginLeft: '8px',
          }}>
            (当前回合)
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {currentPlayer.skillCards.map(card => (
            <SkillCardComponent 
              key={card.id} 
              card={card} 
              isCurrentPlayer={true}
            />
          ))}
        </div>
      </div>
      
      {/* 对手 */}
      <div style={{ opacity: 0.7 }}>
        <div style={{ 
          fontWeight: 'bold', 
          marginBottom: '12px',
          fontSize: '16px',
          color: '#333',
          padding: '8px 12px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
        }}>
          {getPlayerIcon(opponent.color)} {opponent.name}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {opponent.skillCards.map(card => (
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
