import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ThemeConfig } from '@/config/types';
import { themeManager } from './ThemeManager';
import { configManager } from '@/config';

interface ThemeContextValue {
  theme: ThemeConfig | null;
  loading: boolean;
  setTheme: (themeId: string) => Promise<void>;
  allThemes: ThemeConfig[];
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: null,
  loading: true,
  setTheme: async () => {},
  allThemes: [],
});

interface ThemeProviderProps {
  defaultTheme?: string;
  children: ReactNode;
}

export function ThemeProvider({ defaultTheme = 'default', children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [allThemes] = useState<ThemeConfig[]>(() => configManager.getAllThemes());

  useEffect(() => {
    themeManager.loadTheme(defaultTheme).then(() => {
      setThemeState(themeManager.getCurrentTheme());
      setLoading(false);
    });

    const unsubscribe = themeManager.subscribe((newTheme) => {
      setThemeState(newTheme);
    });

    return unsubscribe;
  }, [defaultTheme]);

  const setTheme = async (themeId: string) => {
    setLoading(true);
    await themeManager.loadTheme(themeId);
    setLoading(false);
  };

  return (
    <ThemeContext.Provider value={{ theme, loading, setTheme, allThemes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
