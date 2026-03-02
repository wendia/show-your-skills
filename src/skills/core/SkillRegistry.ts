import { SkillDefinition, SkillCondition, GameState } from '@/config/types';

export interface SkillContext {
  gameState: GameState;
  currentPlayer: {
    id: string;
    color: 'black' | 'white';
  };
  targetPosition?: { row: number; col: number };
}

export interface SkillEffect {
  id: string;
  execute: (context: SkillContext, params: Record<string, unknown>) => GameState | null;
}

class SkillRegistry {
  private definitions: Map<string, SkillDefinition> = new Map();
  private effects: Map<string, SkillEffect> = new Map();

  registerDefinition(definition: SkillDefinition): void {
    this.definitions.set(definition.id, definition);
  }

  registerDefinitions(definitions: SkillDefinition[]): void {
    definitions.forEach(def => this.registerDefinition(def));
  }

  registerEffect(effect: SkillEffect): void {
    this.effects.set(effect.id, effect);
  }

  getDefinition(id: string): SkillDefinition | undefined {
    return this.definitions.get(id);
  }

  getAllDefinitions(): SkillDefinition[] {
    return Array.from(this.definitions.values());
  }

  getByRarity(rarity: string): SkillDefinition[] {
    return this.getAllDefinitions().filter(s => s.rarity === rarity);
  }

  canUse(skillId: string, context: SkillContext): boolean {
    const definition = this.definitions.get(skillId);
    if (!definition) return false;

    return this.checkConditions(definition.conditions, context);
  }

  execute(skillId: string, context: SkillContext): GameState | null {
    const definition = this.definitions.get(skillId);
    if (!definition) return null;

    if (!this.checkConditions(definition.conditions, context)) {
      return null;
    }

    const effect = this.effects.get(definition.effectId);
    if (!effect) return null;

    return effect.execute(context, definition.params);
  }

  private checkConditions(conditions: SkillCondition[], context: SkillContext): boolean {
    for (const condition of conditions) {
      switch (condition.type) {
        case 'min_stones': {
          const stones = this.getAllStones(context.gameState);
          if (stones.length < (condition.value as number)) return false;
          break;
        }
        case 'history_not_empty': {
          if (!context.gameState.history || context.gameState.history.length === 0) {
            return false;
          }
          break;
        }
        case 'phase': {
          if (context.gameState.phase !== condition.value) return false;
          break;
        }
        case 'custom': {
          console.warn(`Custom condition not implemented: ${JSON.stringify(condition)}`);
          break;
        }
      }
    }
    return true;
  }

  private getAllStones(gameState: GameState): Array<{ row: number; col: number; color: string }> {
    const stones: Array<{ row: number; col: number; color: string }> = [];
    for (let row = 0; row < gameState.board.length; row++) {
      for (let col = 0; col < gameState.board[row].length; col++) {
        const cell = gameState.board[row][col];
        if (cell !== null) {
          stones.push({ row, col, color: cell });
        }
      }
    }
    return stones;
  }
}

export const skillRegistry = new SkillRegistry();
