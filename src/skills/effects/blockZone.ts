import { SkillEffect, SkillContext } from '@/skills/core/SkillRegistry';
import { GameState, BlockedZone, Position } from '@/config/types';

export const blockZoneEffect: SkillEffect = {
  id: 'blockZone',

  execute(context: SkillContext, params: Record<string, unknown>): GameState | null {
    const { gameState, currentPlayer, targetPosition } = context;
    const { size = 3 } = params;

    const centerPos: Position = targetPosition || { row: 7, col: 7 };

    const newBlock: BlockedZone = {
      centerPosition: centerPos,
      expiresAfterTurn: gameState.turn + 2,
      blockedBy: currentPlayer.color,
    };

    const effectSize = size as number;

    const top = Math.max(0, centerPos.row - Math.floor(effectSize / 2));
    const left = Math.max(0, centerPos.col - Math.floor(effectSize / 2));
    const bottom = Math.min(gameState.board.length - 1, centerPos.row + Math.floor(effectSize / 2));
    const right = Math.min(gameState.board[0].length - 1, centerPos.col + Math.floor(effectSize / 2));

    const actualSize = {
      top,
      left,
      bottom,
      right,
    };

    return {
      ...gameState,
      blockedZones: [...gameState.blockedZones, { ...newBlock, actualSize } as BlockedZone],
    };
  }
};
