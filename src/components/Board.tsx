/**
 * 棋盘组件
 *
 * @deprecated Use '@/components/game/Board' instead.
 * This file is kept for backward compatibility.
 * See INCOMPLETE_WORKPLAN.md for migration details.
 */

import React from 'react';
import { useGameStore } from '../store/gameStore';
import { isPositionBlocked } from '../core/Game';

export const Board: React.FC = () => {
  const { 
    gameState, 
    placeStone, 
    selectMode, 
    previewPosition, 
    setPreviewPosition 
  } = useGameStore();
  
  if (!gameState) {
    return <div>游戏未开始</div>;
  }
  
  const handleCellClick = (row: number, col: number) => {
    placeStone({ row, col });
  };
  
  const handleCellMouseEnter = (row: number, col: number) => {
    if (selectMode !== 'none') {
      setPreviewPosition({ row, col });
    }
  };
  
  const handleCellMouseLeave = () => {
    setPreviewPosition(null);
  };
  
  // 检查格子是否在预览区域内（3x3）
  const isInPreviewZone = (row: number, col: number): boolean => {
    if (!previewPosition || selectMode !== 'blockZone') return false;
    const rowDiff = Math.abs(row - previewPosition.row);
    const colDiff = Math.abs(col - previewPosition.col);
    return rowDiff <= 1 && colDiff <= 1;
  };
  
  // 检查格子是否在封锁区域内
  const isInBlockedZone = (row: number, col: number): boolean => {
    return isPositionBlocked({ row, col }, gameState.blockedZones, gameState.turn);
  };
  
  return (
    <div className="board-container">
      <div 
        className="board"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gameState.boardSize}, 36px)`,
          gap: '0px',
          backgroundColor: '#dcb35c',
          padding: '12px',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        }}
      >
        {gameState.board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isPreview = isInPreviewZone(rowIndex, colIndex);
            const isBlocked = isInBlockedZone(rowIndex, colIndex);
            const isCenterPreview = previewPosition?.row === rowIndex && previewPosition?.col === colIndex;
            
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="cell"
                onClick={() => handleCellClick(rowIndex, colIndex)}
                onMouseEnter={() => handleCellMouseEnter(rowIndex, colIndex)}
                onMouseLeave={handleCellMouseLeave}
                style={{
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isBlocked 
                    ? 'not-allowed' 
                    : (selectMode === 'blockZone' ? 'crosshair' : 'pointer'),
                  backgroundColor: isBlocked 
                    ? '#9e9e9e'  // 封锁区域：灰色
                    : (isPreview ? 'rgba(244, 67, 54, 0.5)' : '#dcb35c'),  // 预览：半透明红色
                  border: isCenterPreview 
                    ? '2px dashed #f44336'  // 中心点：红色虚线
                    : '1px solid #b89b4a',
                  position: 'relative',
                  transition: 'background-color 0.15s ease',
                }}
              >
                {/* 封锁区域标记 */}
                {isBlocked && !cell && (
                  <div style={{
                    position: 'absolute',
                    width: '20px',
                    height: '20px',
                    opacity: 0.4,
                  }}>
                    🚫
                  </div>
                )}
                
                {/* 棋子 */}
                {cell && (
                  <div
                    className="stone"
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      backgroundColor: cell === 'black' ? '#1a1a1a' : '#f5f5f5',
                      boxShadow: cell === 'black' 
                        ? 'inset 3px 3px 6px rgba(255,255,255,0.2), 2px 2px 4px rgba(0,0,0,0.3)'
                        : 'inset 3px 3px 6px rgba(0,0,0,0.15), 2px 2px 4px rgba(0,0,0,0.2)',
                      zIndex: 2,
                      position: 'relative',
                    }}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
      
      {/* 图例 */}
      {gameState.blockedZones.length > 0 && (
        <div style={{
          marginTop: '15px',
          padding: '10px',
          backgroundColor: '#fafafa',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#666',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '16px',
              height: '16px',
              backgroundColor: '#9e9e9e',
              borderRadius: '2px',
            }} />
            <span>封锁区域（不可落子）</span>
          </div>
        </div>
      )}
    </div>
  );
};
