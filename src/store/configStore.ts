import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SkillPoolConfig } from '@/config/types';
import { skillPoolManager } from '@/skills/core/SkillPoolManager';
import { configManager } from '@/config';

interface ConfigState {
  skillPoolId: string;
  skillPool: SkillPoolConfig | null;

  setSkillPool: (poolId: string) => void;
  loadConfig: () => void;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      skillPoolId: 'standard',
      skillPool: null,

      setSkillPool: (poolId: string) => {
        skillPoolManager.loadPool(poolId);
        set({
          skillPoolId: poolId,
          skillPool: skillPoolManager.getCurrentPool(),
        });
      },

      loadConfig: () => {
        const { skillPoolId } = get();
        skillPoolManager.loadPool(skillPoolId);
        set({
          skillPool: skillPoolManager.getCurrentPool(),
        });
      },
    }),
    {
      name: 'config-storage',
      partialize: (state) => ({ skillPoolId: state.skillPoolId }),
    }
  )
);

export function initializeConfig(): void {
  const themes = configManager.getAllThemes();
  const pools = configManager.getAllSkillPools();

  if (themes.length === 0) {
    console.warn('No themes loaded');
  }

  if (pools.length === 0) {
    console.warn('No skill pools loaded');
  }

  useConfigStore.getState().loadConfig();
}
