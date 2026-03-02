import { useRarityStyle } from '@/theme/useTheme';
import { cn } from '@/lib/utils';

interface ThemedBadgeProps {
  children?: React.ReactNode;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  className?: string;
}

const rarityLabels: Record<string, string> = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
};

export function ThemedBadge({
  children,
  rarity = 'common',
  className,
}: ThemedBadgeProps) {
  const rarityStyle = useRarityStyle(rarity);

  if (!rarityStyle) {
    return (
      <span className={cn('px-2 py-1 text-xs rounded-full bg-gray-500 text-white', className)}>
        {children || rarityLabels[rarity]}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'px-2 py-1 text-xs rounded-full text-white font-medium',
        rarityStyle.badge,
        className
      )}
    >
      {children || rarityLabels[rarity]}
    </span>
  );
}
