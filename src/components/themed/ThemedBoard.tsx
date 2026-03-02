import { ReactNode } from 'react';
import { useBoardStyle } from '@/theme/useTheme';
import { cn } from '@/lib/utils';

interface ThemedBoardProps {
  children: ReactNode;
  className?: string;
}

export function ThemedBoard({ children, className }: ThemedBoardProps) {
  const boardStyle = useBoardStyle();

  if (!boardStyle) {
    return (
      <div className={cn('inline-block p-4 rounded-lg bg-amber-100', className)}>
        {children}
      </div>
    );
  }

  const getBackgroundClass = () => {
    switch (boardStyle.style) {
      case 'wood':
        return 'bg-amber-100';
      case 'modern':
        return 'bg-slate-900';
      case 'classic':
        return 'bg-amber-50';
      default:
        return 'bg-amber-100';
    }
  };

  return (
    <div
      className={cn(
        'inline-block p-4 rounded-lg shadow-xl',
        getBackgroundClass(),
        className
      )}
      style={{
        backgroundColor: boardStyle.backgroundColor || undefined,
      }}
    >
      {children}
    </div>
  );
}

interface ThemedBoardGridProps {
  children: ReactNode;
  size?: number;
  className?: string;
}

export function ThemedBoardGrid({ children, size = 15, className }: ThemedBoardGridProps) {
  const boardStyle = useBoardStyle();

  const gridColor = boardStyle?.gridColor || '#8B4513';

  return (
    <div
      className={cn('grid gap-0', className)}
      style={{
        gridTemplateColumns: `repeat(${size}, 1fr)`,
        background: `
          linear-gradient(${gridColor} 1px, transparent 1px),
          linear-gradient(90deg, ${gridColor} 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%',
        opacity: 0.5,
      }}
    >
      {children}
    </div>
  );
}
