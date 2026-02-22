/**
 * 游戏信息组件
 */

import React from 'react';
import { useGameStore } from '../store/gameStore';

export const GameInfo: React.FC = () => {
  const { gameState, startGame, resetGame } = useGameStore();
  
  if (!gameState) {
    return (
      <div className="game-info" style={{ textAlign: 'center', padding: '20px' }}>
        <h2>技能五子棋</h2>
        <p>带技能卡的五子棋对战游戏</p>
        <button
          onClick={startGame}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginTop: '20px',
          }}
        >
          开始游戏
        </button>
      </div>
    );
  }
  
  const currentPlayer = gameState.players[gameState.currentPlayer];
  
  return (
    <div className="game-info" style={{ padding: '20px' }}>
      {/* 游戏状态 */}
      <div style={{ marginBottom: '20px' }}>
        {gameState.phase === 'playing' && (
          <div style={{ fontSize: '18px' }}>
            当前回合: 
            <span style={{ 
              fontWeight: 'bold',
              color: gameState.currentPlayer === 'black' ? '#1a1a1a' : '#666'
            }}>
              {currentPlayer.name}
            </span>
          </div>
        )}
        
        {gameState.phase === 'ended' && gameState.winner && (
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>
            🎉 {gameState.players[gameState.winner].name} 获胜！
          </div>
        )}
      </div>
      
      {/* 回合信息 */}
      <div style={{ marginBottom: '20px', color: '#666' }}>
        回合: {gameState.turn}
      </div>
      
      {/* 操作按钮 */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={resetGame}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          重新开始
        </button>
      </div>
      
      {/* 游戏规则 */}
      <div style={{ marginTop: '30px', fontSize: '14px', color: '#888' }}>
        <h4>游戏规则</h4>
        <ul style={{ paddingLeft: '20px' }}>
          <li>黑方先手</li>
          <li>五子连珠获胜</li>
          <li>每局开始随机获得 3 张技能卡</li>
          <li>每张技能卡只能使用一次</li>
        </ul>
      </div>
    </div>
  );
};
