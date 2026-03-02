import { SkillEffect, SkillContext } from '@/skills/core/SkillRegistry';
import { GameState } from '@/config/types';

export const undoMoveEffect: SkillEffect = {
  id: 'undoMove',

  execute(context: SkillContext, _params: Record<string, unknown>): GameState | null {
    const { gameState } = context;
    const history = gameState.history;

    if (history.length === 0) return null;

    let lastPlaceIndex = history.length - 1;
    while (lastPlaceIndex >= 0 && history[lastPlaceIndex].type !== 'place') {
      lastPlaceIndex--;
    }

    if (lastPlaceIndex < 0) return null;

    const lastAction = history[lastPlaceIndex];
    const position = lastAction.position;

    if (!position) return null;

    const newBoard = gameState.board.map(row => [...row]);
    newBoard[position.row][position.col] = null;

    const newHistory = history.slice(0, lastPlaceIndex);

    return {
      ...gameState,
      board: newBoard,
      history: newHistory,
      currentPlayer: lastAction.player,
      turn: gameState.turn - 1,
    };
  }
};
