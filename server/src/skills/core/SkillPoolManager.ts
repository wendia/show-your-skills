import { SkillPoolConfig, SkillCard, SkillDefinition } from '../../config/types.js';
import { configManager } from '../../config/index.js';

class SkillPoolManager {
  private pools: Map<string, SkillPoolConfig> = new Map();
  private currentPool: SkillPoolConfig | null = null;

  constructor() {
    const pools = configManager.getAllSkillPools();
    pools.forEach(pool => this.pools.set(pool.id, pool));
  }

  loadPool(poolId: string): void {
    const pool = this.pools.get(poolId);
    if (!pool) {
      throw new Error(`Skill pool not found: ${poolId}`);
    }
    this.currentPool = pool;
  }

  getCurrentPool(): SkillPoolConfig | null {
    return this.currentPool;
  }

  getAllPools(): SkillPoolConfig[] {
    return Array.from(this.pools.values());
  }

  drawCards(count?: number): SkillCard[] {
    if (!this.currentPool) {
      throw new Error('No skill pool loaded');
    }

    const { distribution, skills, weights } = this.currentPool;
    const drawCount = count || distribution.countPerPlayer;

    let selected: SkillDefinition[];

    switch (distribution.method) {
      case 'random':
        selected = this.randomSelect(skills, drawCount, distribution.allowDuplicates);
        break;
      case 'balanced':
        selected = this.balancedSelect(skills, drawCount, weights);
        break;
      case 'choice':
        selected = skills.slice(0, drawCount);
        break;
      default:
        selected = this.randomSelect(skills, drawCount, false);
    }

    return selected.map(skill => this.createSkillCard(skill));
  }

  private randomSelect(
    skills: SkillDefinition[],
    count: number,
    allowDuplicates: boolean
  ): SkillDefinition[] {
    const shuffled = [...skills].sort(() => Math.random() - 0.5);

    if (allowDuplicates) {
      return Array(count).fill(null).map(() => {
        const randomIndex = Math.floor(Math.random() * skills.length);
        return skills[randomIndex];
      });
    }

    return shuffled.slice(0, count);
  }

  private balancedSelect(
    skills: SkillDefinition[],
    count: number,
    _weights?: Record<string, number>
  ): SkillDefinition[] {
    const byRarity = {
      legendary: skills.filter(s => s.rarity === 'legendary'),
      epic: skills.filter(s => s.rarity === 'epic'),
      rare: skills.filter(s => s.rarity === 'rare'),
      common: skills.filter(s => s.rarity === 'common'),
    };

    const result: SkillDefinition[] = [];

    if (byRarity.legendary.length > 0) {
      const randomIndex = Math.floor(Math.random() * byRarity.legendary.length);
      result.push(byRarity.legendary[randomIndex]);
    }

    if (byRarity.epic.length > 0 && result.length < count) {
      const randomIndex = Math.floor(Math.random() * byRarity.epic.length);
      result.push(byRarity.epic[randomIndex]);
    }

    while (result.length < count) {
      const pool = [...byRarity.rare, ...byRarity.common];
      if (pool.length === 0) break;
      const randomIndex = Math.floor(Math.random() * pool.length);
      const skill = pool[randomIndex];
      if (!result.includes(skill)) {
        result.push(skill);
      }
    }

    return result;
  }

  private createSkillCard(definition: SkillDefinition): SkillCard {
    return {
      id: `${definition.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      skillId: definition.id,
      name: definition.name,
      description: definition.description,
      rarity: definition.rarity,
      used: false,
    };
  }
}

export const skillPoolManager = new SkillPoolManager();
