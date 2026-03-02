import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ThemeConfig } from '@/config/types';
import { themeManager } from '@/theme/ThemeManager';

interface ThemeState {
  currentThemeId: string;
  currentTheme: ThemeConfig | null;

  setTheme: (themeId: string) => Promise<void>;
  loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      currentThemeId: 'default',
      currentTheme: null,

      setTheme: async (themeId: string) => {
        await themeManager.loadTheme(themeId);
        set({
          currentThemeId: themeId,
          currentTheme: themeManager.getCurrentTheme(),
        });
      },

      loadTheme: async () => {
        const { currentThemeId } = get();
        await themeManager.loadTheme(currentThemeId);
        set({
          currentTheme: themeManager.getCurrentTheme(),
        });
      },
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({ currentThemeId: state.currentThemeId }),
    }
  )
);
