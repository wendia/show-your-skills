import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useRarityStyle, useCardStyle } from '@/theme/useTheme';
import { cn } from '@/lib/utils';

interface ThemedCardProps {
  children: ReactNode;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  className?: string;
  disabled?: boolean;
  selected?: boolean;
  onClick?: () => void;
  animate?: boolean;
}

export function ThemedCard({
  children,
  rarity = 'common',
  className,
  disabled = false,
  selected = false,
  onClick,
  animate = true,
}: ThemedCardProps) {
  const rarityStyle = useRarityStyle(rarity);
  const cardStyle = useCardStyle();

  if (!rarityStyle || !cardStyle) {
    return (
      <div className={cn('rounded-lg border p-4', className)}>
        {children}
      </div>
    );
  }

  const cardContent = (
    <div
      className={cn(
        'relative overflow-hidden border-2 transition-all',
        `bg-gradient-to-br ${rarityStyle.gradient}`,
        rarityStyle.border,
        disabled && 'opacity-50 cursor-not-allowed',
        selected && 'ring-2 ring-white ring-offset-2 ring-offset-transparent',
        onClick && !disabled && 'cursor-pointer',
        className
      )}
      style={{
        borderRadius: cardStyle.borderRadius,
        boxShadow: cardStyle.shadowGlow
          ? `0 0 40px ${rarityStyle.glow}`
          : undefined,
      }}
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </div>
  );

  if (animate && !disabled) {
    return (
      <motion.div
        whileHover={onClick ? { scale: 1.02, y: -2 } : {}}
        whileTap={onClick ? { scale: 0.98 } : {}}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {cardContent}
      </motion.div>
    );
  }

  return cardContent;
}

interface ThemedCardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function ThemedCardHeader({ children, className }: ThemedCardHeaderProps) {
  return (
    <div className={cn('p-4 pb-2', className)}>
      {children}
    </div>
  );
}

interface ThemedCardTitleProps {
  children: ReactNode;
  className?: string;
}

export function ThemedCardTitle({ children, className }: ThemedCardTitleProps) {
  return (
    <h3 className={cn('text-lg font-semibold text-white flex items-center gap-2', className)}>
      {children}
    </h3>
  );
}

interface ThemedCardContentProps {
  children: ReactNode;
  className?: string;
}

export function ThemedCardContent({ children, className }: ThemedCardContentProps) {
  return (
    <div className={cn('p-4 pt-2', className)}>
      {children}
    </div>
  );
}
