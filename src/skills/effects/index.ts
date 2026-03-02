import { skillRegistry } from '@/skills/core/SkillRegistry';
import { flipStonesEffect } from './flipStones';
import { undoMoveEffect } from './undoMove';
import { placeStoneEffect } from './placeStone';
import { blockZoneEffect } from './blockZone';
import { doubleMoveEffect } from './doubleMove';

export function registerAllEffects(): void {
  skillRegistry.registerEffect(flipStonesEffect);
  skillRegistry.registerEffect(undoMoveEffect);
  skillRegistry.registerEffect(placeStoneEffect);
  skillRegistry.registerEffect(blockZoneEffect);
  skillRegistry.registerEffect(doubleMoveEffect);
}

export { flipStonesEffect, undoMoveEffect, placeStoneEffect, blockZoneEffect, doubleMoveEffect };
