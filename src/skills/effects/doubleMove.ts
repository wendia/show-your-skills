import { SkillEffect, SkillContext } from '@/skills/core/SkillRegistry';
import { GameState } from '@/config/types';

export const doubleMoveEffect: SkillEffect = {
  id: 'doubleMove',

  execute(context: SkillContext, _params: Record<string, unknown>): GameState | null {
    const { gameState } = context;

    if (gameState.phase !== 'playing') return null;

    if (gameState.remainingMoves !== 1) return null;

    return {
      ...gameState,
      remainingMoves: 2,
    };
  }
};
