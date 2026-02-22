/**
 * 游戏主界面
 */

import React, { useEffect } from 'react';
import { Board } from './Board';
import { GameInfo } from './GameInfo';
import { SkillCardList } from './SkillCard';
import { useGameStore } from '../store/gameStore';
import { registerAllSkills } from '../skills/cards';

export const GameUI: React.FC = () => {
  const { gameState, startGame } = useGameStore();
  
  // 初始化技能
  useEffect(() => {
    registerAllSkills();
  }, []);
  
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
        <Board />
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
