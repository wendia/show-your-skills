/**
 * 游戏信息组件
 */

import React from 'react';
import { useGameStore } from '../store/gameStore';
import styles from './GameInfo.module.scss';

export const GameInfo: React.FC = () => {
  const { gameState, startGame, resetGame } = useGameStore();
  
  if (!gameState) {
    return (
      <div className={`game-info ${styles.containerEmpty}`}>
        <h2>技能五子棋</h2>
        <p>带技能卡的五子棋对战游戏</p>
        <button onClick={startGame} className={styles.startBtn}>
          开始游戏
        </button>
      </div>
    );
  }
  
  const currentPlayer = gameState.players[gameState.currentPlayer];
  
  return (
    <div className={`game-info ${styles.container}`}>
      {/* 游戏状态 */}
      <div className={styles.statusSection}>
        {gameState.phase === 'playing' && (
          <div className={styles.turnInfo}>
            当前回合: 
            <span className={`${styles.playerName} ${
              gameState.currentPlayer === 'black' ? styles.playerBlack : styles.playerWhite
            }`}>
              {currentPlayer.name}
            </span>
          </div>
        )}
        
        {gameState.phase === 'ended' && gameState.winner && (
          <div className={styles.winnerInfo}>
            🎉 {gameState.players[gameState.winner].name} 获胜！
          </div>
        )}
      </div>
      
      {/* 回合信息 */}
      <div className={styles.turnCount}>回合: {gameState.turn}</div>
      
      {/* 操作按钮 */}
      <div className={styles.actions}>
        <button onClick={resetGame} className={styles.resetBtn}>
          重新开始
        </button>
      </div>
      
      {/* 游戏规则 */}
      <div className={styles.rules}>
        <h4>游戏规则</h4>
        <ul>
          <li>黑方先手</li>
          <li>五子连珠获胜</li>
          <li>每局开始随机获得 3 张技能卡</li>
          <li>每张技能卡只能使用一次</li>
        </ul>
      </div>
    </div>
  );
};
