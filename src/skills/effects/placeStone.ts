import { SkillEffect, SkillContext } from '@/skills/core/SkillRegistry';
import { GameState } from '@/config/types';

export const placeStoneEffect: SkillEffect = {
  id: 'placeStone',

  execute(context: SkillContext, _params: Record<string, unknown>): GameState | null {
    const { gameState, currentPlayer, targetPosition } = context;

    if (!targetPosition) return null;

    if (gameState.board[targetPosition.row][targetPosition.col] !== null) {
      return null;
    }

    const newBoard = gameState.board.map(row => [...row]);
    newBoard[targetPosition.row][targetPosition.col] = currentPlayer.color;

    const newHistory = [
      ...gameState.history,
      {
        type: 'place' as const,
        position: targetPosition,
        player: currentPlayer.color,
      },
    ];

    const nextPlayer = gameState.currentPlayer === 'black' ? 'white' : 'black';

    return {
      ...gameState,
      board: newBoard,
      history: newHistory,
      currentPlayer: nextPlayer,
      turn: gameState.turn + 1,
    };
  }
};
