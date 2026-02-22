/**
 * 技能注册表
 * 管理所有可用的技能
 */

import { Skill, SkillCard, Player, SkillContext, GameState } from '../types';

class SkillRegistry {
  private skills: Map<string, Skill> = new Map();
  
  // 注册技能
  register(skill: Skill): void {
    this.skills.set(skill.id, skill);
  }
  
  // 获取技能
  get(id: string): Skill | undefined {
    return this.skills.get(id);
  }
  
  // 获取所有技能
  getAll(): Skill[] {
    return Array.from(this.skills.values());
  }
  
  // 随机抽取技能卡
  drawRandom(count: number): SkillCard[] {
    const all = this.getAll();
    const shuffled = this.shuffle([...all]);
    
    return shuffled.slice(0, count).map(skill => ({
      id: `${skill.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      skillId: skill.id,
      name: skill.name,
      description: skill.description,
      used: false,
    }));
  }
  
  // 洗牌
  private shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  
  // 执行技能
  execute(skillId: string, context: SkillContext): GameState | null {
    const skill = this.skills.get(skillId);
    if (!skill) {
      return null;
    }
    
    if (!skill.canUse(context)) {
      return null;
    }
    
    return skill.execute(context);
  }
}

// 导出单例
export const skillRegistry = new SkillRegistry();
