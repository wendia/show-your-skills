import { useTheme } from './ThemeContext';
import { RarityStyle, CardStyle, BoardStyle } from '@/config/types';

export function useRarityStyle(rarity: string): RarityStyle | null {
  const { theme } = useTheme();
  if (!theme) return null;
  const rarityKey = rarity as keyof typeof theme.rarity;
  return theme.rarity[rarityKey] || null;
}

export function useCardStyle(): CardStyle | null {
  const { theme } = useTheme();
  return theme?.card || null;
}

export function useBoardStyle(): BoardStyle | null {
  const { theme } = useTheme();
  return theme?.board || null;
}

export function useThemeColors() {
  const { theme } = useTheme();
  return theme?.colors || null;
}

export function useAnimations() {
  const { theme } = useTheme();
  return theme?.animations || null;
}

export function useSounds() {
  const { theme } = useTheme();
  return theme?.sounds || null;
}
