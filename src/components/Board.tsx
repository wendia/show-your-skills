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
import styles from './Board.module.scss';

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
  
  const isInPreviewZone = (row: number, col: number): boolean => {
    if (!previewPosition || selectMode !== 'blockZone') return false;
    const rowDiff = Math.abs(row - previewPosition.row);
    const colDiff = Math.abs(col - previewPosition.col);
    return rowDiff <= 1 && colDiff <= 1;
  };
  
  const isInBlockedZone = (row: number, col: number): boolean => {
    return isPositionBlocked({ row, col }, gameState.blockedZones, gameState.turn);
  };
  
  return (
    <div className="board-container">
      <div
        className={styles.board}
        style={{ gridTemplateColumns: `repeat(${gameState.boardSize}, 36px)` }}
      >
        {gameState.board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isPreview = isInPreviewZone(rowIndex, colIndex);
            const isBlocked = isInBlockedZone(rowIndex, colIndex);
            const isCenterPreview = previewPosition?.row === rowIndex && previewPosition?.col === colIndex;

            const cellClasses = [
              styles.cell,
              isBlocked ? styles.blocked : '',
              isPreview && !isBlocked ? styles.preview : '',
              isCenterPreview ? styles.centerPreview : '',
              selectMode === 'blockZone' && !isBlocked ? styles.crosshair : '',
            ].filter(Boolean).join(' ');
            
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={cellClasses}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                onMouseEnter={() => handleCellMouseEnter(rowIndex, colIndex)}
                onMouseLeave={handleCellMouseLeave}
              >
                {/* 封锁区域标记 */}
                {isBlocked && !cell && (
                  <div className={styles.blockedIcon}>🚫</div>
                )}
                
                {/* 棋子 */}
                {cell && (
                  <div className={`${styles.stone} ${cell === 'black' ? styles.black : styles.white}`} />
                )}
              </div>
            );
          })
        )}
      </div>
      
      {/* 图例 */}
      {gameState.blockedZones.length > 0 && (
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <div className={styles.legendSwatch} />
            <span>封锁区域（不可落子）</span>
          </div>
        </div>
      )}
    </div>
  );
};
