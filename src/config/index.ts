import { ThemeConfig, SkillPoolConfig } from './types';

class ConfigManager {
  private themes: Map<string, ThemeConfig> = new Map();
  private skillPools: Map<string, SkillPoolConfig> = new Map();

  registerTheme(theme: ThemeConfig): void {
    this.themes.set(theme.id, theme);
  }

  registerSkillPool(pool: SkillPoolConfig): void {
    this.skillPools.set(pool.id, pool);
  }

  importThemes(themes: ThemeConfig[]): void {
    themes.forEach(theme => this.registerTheme(theme));
  }

  importSkillPools(pools: SkillPoolConfig[]): void {
    pools.forEach(pool => this.registerSkillPool(pool));
  }

  getTheme(id: string): ThemeConfig | undefined {
    return this.themes.get(id);
  }

  getAllThemes(): ThemeConfig[] {
    return Array.from(this.themes.values());
  }

  getSkillPool(id: string): SkillPoolConfig | undefined {
    return this.skillPools.get(id);
  }

  getAllSkillPools(): SkillPoolConfig[] {
    return Array.from(this.skillPools.values());
  }
}

export const configManager = new ConfigManager();
