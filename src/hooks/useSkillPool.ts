import { useCallback } from 'react';
import { skillPoolManager } from '@/skills/core/SkillPoolManager';
import { configManager } from '@/config';
import { SkillCard } from '@/config/types';

export function useSkillPool() {
  const loadPool = useCallback((poolId: string) => {
    skillPoolManager.loadPool(poolId);
  }, []);

  const drawCards = useCallback((count?: number): SkillCard[] => {
    return skillPoolManager.drawCards(count);
  }, []);

  return {
    // Current pool
    currentPool: skillPoolManager.getCurrentPool(),

    // All pools
    allPools: skillPoolManager.getAllPools(),

    // Actions
    loadPool,
    drawCards,

    // Helpers
    getPool: (id: string) => configManager.getSkillPool(id),
  };
}
