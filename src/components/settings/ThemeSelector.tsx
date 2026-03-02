import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useTheme } from '@/theme/ThemeContext';

export function ThemeSelector() {
  const { theme, setTheme, allThemes } = useTheme();

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">选择主题</h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {allThemes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={cn(
                'relative flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all',
                theme?.id === t.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <div className="w-16 h-16 rounded-lg mb-2 overflow-hidden">
                <div
                  className={cn(
                    'w-full h-full',
                    `bg-gradient-to-br ${t.rarity.legendary.gradient}`
                  )}
                />
              </div>

              <span className="text-sm font-medium">{t.name}</span>

              {theme?.id === t.id && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
