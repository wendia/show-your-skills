/**
 * 游戏主界面
 */

import React, { useEffect, useState } from 'react';
import { Board } from '@/components/game/Board';
import { GameInfo } from './GameInfo';
import { SkillCardList } from './SkillCard';
import { useGameStore } from '../store/gameStore';
import { skillPoolManager } from '../skills/core/SkillPoolManager';
import styles from './GameUI.module.scss';

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

  useEffect(() => {
    if (!isInitialized) {
      skillPoolManager.loadPool('standard');
      const blackCards = skillPoolManager.drawCards(3);
      const whiteCards = skillPoolManager.drawCards(3);
      startGame({ black: blackCards, white: whiteCards });
      setIsInitialized(true);
    }
  }, [isInitialized, startGame]);

  const handleCellClick = (position: { row: number; col: number }) => {
    if (selectedSkillCard && selectMode !== 'none') {
      const success = useSkill(selectedSkillCard, position);
      if (success) {
        console.log('技能使用成功');
      } else {
        console.log('技能使用失败，请检查条件是否满足');
      }
    } else {
      placeStone(position);
    }
  };

  const lastMove = gameState?.history && gameState.history.length > 0
    ? gameState.history[gameState.history.length - 1].position
    : null;

  return (
    <div className={`game-ui ${styles.gameUi}`}>
      {/* 左侧：游戏信息 */}
      <div className={`left-panel ${styles.leftPanel}`}>
        <GameInfo />
      </div>

      {/* 中间：棋盘 */}
      <div className={`center-panel ${styles.centerPanel}`}>
        {gameState ? (
          <Board
            board={gameState.board}
            onCellClick={handleCellClick}
            onCellHover={setPreviewPosition}
            previewPosition={previewPosition}
            lastMove={lastMove}
          />
        ) : (
          <div className={styles.loading}>加载中...</div>
        )}
      </div>

      {/* 右侧：技能卡 */}
      <div className={`right-panel ${styles.rightPanel}`}>
        <h3 className={styles.rightPanelTitle}>技能卡</h3>
        {gameState && <SkillCardList />}
      </div>
    </div>
  );
};
