import { ThemeConfig } from '@/config/types';
import { configManager } from '@/config';

class ThemeManager {
  private currentTheme: ThemeConfig | null = null;
  private listeners: Set<(theme: ThemeConfig) => void> = new Set();

  async loadTheme(themeId: string): Promise<void> {
    const theme = configManager.getTheme(themeId);
    if (!theme) {
      throw new Error(`Theme not found: ${themeId}`);
    }

    this.currentTheme = theme;
    this.applyCSSVariables(theme);
    this.notifyListeners();
  }

  getCurrentTheme(): ThemeConfig | null {
    return this.currentTheme;
  }

  getRarityStyle(rarity: string) {
    if (!this.currentTheme) return null;
    const rarityKey = rarity as keyof typeof this.currentTheme.rarity;
    return this.currentTheme.rarity[rarityKey] || null;
  }

  getCardStyle() {
    return this.currentTheme?.card || null;
  }

  getBoardStyle() {
    return this.currentTheme?.board || null;
  }

  getColors() {
    return this.currentTheme?.colors || null;
  }

  private applyCSSVariables(theme: ThemeConfig): void {
    const root = document.documentElement;

    if (theme.colors.primary) {
      if (theme.colors.primary[500]) {
        root.style.setProperty('--color-primary', theme.colors.primary[500]);
      }
      if (theme.colors.primary[900]) {
        root.style.setProperty('--color-primary-dark', theme.colors.primary[900]);
      }
    }

    if (theme.colors.secondary) {
      if (theme.colors.secondary[500]) {
        root.style.setProperty('--color-secondary', theme.colors.secondary[500]);
      }
    }

    if (theme.colors.background) {
      root.style.setProperty('--color-background-light', theme.colors.background.light);
      root.style.setProperty('--color-background-dark', theme.colors.background.dark);
    }

    if (theme.rarity) {
      Object.entries(theme.rarity).forEach(([rarity, style]) => {
        root.style.setProperty(`--rarity-${rarity}-glow`, (style as { glow: string }).glow);
      });
    }

    if (theme.card) {
      root.style.setProperty('--card-radius', `${theme.card.borderRadius}px`);
    }
  }

  subscribe(listener: (theme: ThemeConfig) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    if (this.currentTheme) {
      this.listeners.forEach(listener => listener(this.currentTheme!));
    }
  }
}

export const themeManager = new ThemeManager();
