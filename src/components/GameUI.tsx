/**
 * 游戏主界面
 */

import React, { useEffect, useState } from 'react';
import { Board } from '@/components/game/Board';
import { GameInfo } from './GameInfo';
import { SkillCardList } from './SkillCard';
import { useGameStore } from '../store/gameStore';
import { registerAllSkills } from '../skills/cards';
import { skillPoolManager } from '../skills/core/SkillPoolManager';

export const GameUI: React.FC = () => {
  const {
    gameState,
    placeStone,
    previewPosition,
    setPreviewPosition,
    startGame,
    selectedSkillCard,
    selectMode,
    useSkill,
    selectSkillCard,
    setSelectMode,
  } = useGameStore();

  const [isInitialized, setIsInitialized] = useState(false);

  // 初始化技能和游戏
  useEffect(() => {
    if (!isInitialized) {
      // 注册传统技能
      registerAllSkills();

      // 初始化技能池并开始游戏
      skillPoolManager.loadPool('standard');
      const blackCards = skillPoolManager.drawCards(3);
      const whiteCards = skillPoolManager.drawCards(3);
      startGame({ black: blackCards, white: whiteCards });

      setIsInitialized(true);
    }
  }, [isInitialized, startGame]);

  // Handle cell click - handles both stone placement and skill usage
  const handleCellClick = (position: { row: number; col: number }) => {
    // If a skill is selected and we're in a selection mode, use the skill
    if (selectedSkillCard && selectMode !== 'none') {
      const success = useSkill(selectedSkillCard, position);
      if (success) {
        console.log('技能使用成功');
      } else {
        console.log('技能使用失败，请检查条件是否满足');
      }
    } else {
      // Normal stone placement
      placeStone(position);
    }
  };

  // Get last move position from history
  const lastMove = gameState?.history && gameState.history.length > 0
    ? gameState.history[gameState.history.length - 1].position
    : null;

  return (
    <div className="game-ui" style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
    }}>
      {/* 左侧：游戏信息 */}
      <div className="left-panel" style={{
        width: '250px',
        backgroundColor: '#fff',
        boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
        zIndex: 10,
      }}>
        <GameInfo />
      </div>

      {/* 中间：棋盘 */}
      <div className="center-panel" style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}>
        {gameState ? (
          <Board
            board={gameState.board}
            onCellClick={handleCellClick}
            onCellHover={setPreviewPosition}
            previewPosition={previewPosition}
            lastMove={lastMove}
          />
        ) : (
          <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
            加载中...
          </div>
        )}
      </div>

      {/* 右侧：技能卡 */}
      <div className="right-panel" style={{
        width: '300px',
        backgroundColor: '#fff',
        boxShadow: '-2px 0 10px rgba(0,0,0,0.1)',
        padding: '20px',
        overflowY: 'auto',
      }}>
        <h3 style={{ marginBottom: '15px' }}>技能卡</h3>
        {gameState && <SkillCardList />}
      </div>
    </div>
  );
};
