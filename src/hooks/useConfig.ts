import { useConfigStore } from '@/store/configStore';
import { configManager } from '@/config';
import { SkillPoolConfig, ThemeConfig } from '@/config/types';

export function useConfig() {
  const store = useConfigStore();

  return {
    // Current config
    skillPoolId: store.skillPoolId,
    skillPool: store.skillPool,

    // Available options
    themes: configManager.getAllThemes(),
    skillPools: configManager.getAllSkillPools(),

    // Actions
    setSkillPool: (poolId: string) => store.setSkillPool(poolId),
    loadConfig: () => store.loadConfig(),

    // Helpers
    getTheme: (id: string): ThemeConfig | undefined => configManager.getTheme(id),
    getSkillPool: (id: string): SkillPoolConfig | undefined => configManager.getSkillPool(id),
  };
}
