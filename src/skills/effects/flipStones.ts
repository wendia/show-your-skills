import { SkillEffect, SkillContext } from '@/skills/core/SkillRegistry';
import { GameState, Stone } from '@/config/types';

function getAllStones(board: GameState['board']): Array<{ row: number; col: number }> {
  const stones: Array<{ row: number; col: number }> = [];
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      if (board[row][col] !== null) {
        stones.push({ row, col });
      }
    }
  }
  return stones;
}

function flipStoneColor(color: Stone): Stone {
  return color === 'black' ? 'white' : 'black';
}

export const flipStonesEffect: SkillEffect = {
  id: 'flipStones',

  execute(context: SkillContext, params: Record<string, unknown>): GameState | null {
    const { gameState } = context;
    const { flipPercent = 30 } = params;

    const stones = getAllStones(gameState.board);
    if (stones.length === 0) return null;

    const flipCount = Math.max(1, Math.floor(stones.length * (flipPercent as number) / 100));

    const shuffled = [...stones].sort(() => Math.random() - 0.5);
    const toFlip = shuffled.slice(0, flipCount);

    const newBoard = gameState.board.map(row => [...row]);

    for (const pos of toFlip) {
      const currentColor = newBoard[pos.row][pos.col];
      if (currentColor !== null) {
        newBoard[pos.row][pos.col] = flipStoneColor(currentColor);
      }
    }

    return {
      ...gameState,
      board: newBoard,
    };
  }
};
