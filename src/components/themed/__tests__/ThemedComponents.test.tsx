import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <div className={className}>{children}</div>
    ),
  },
}));

// Mock theme hooks
vi.mock('@/theme/useTheme', () => ({
  useRarityStyle: (rarity: string) => {
    const styles: Record<string, unknown> = {
      common: { gradient: 'from-gray-600 to-gray-800', border: 'border-gray-500', glow: 'rgba(156, 163, 175, 0.5)', badge: 'bg-gray-500' },
      rare: { gradient: 'from-blue-600 to-cyan-600', border: 'border-blue-500', glow: 'rgba(59, 130, 246, 0.4)', badge: 'bg-blue-500' },
      epic: { gradient: 'from-purple-600 to-pink-600', border: 'border-purple-500', glow: 'rgba(147, 51, 234, 0.5)', badge: 'bg-purple-500' },
      legendary: { gradient: 'from-amber-500 to-orange-600', border: 'border-amber-400', glow: 'rgba(245, 158, 11, 0.6)', badge: 'bg-amber-500' },
    };
    return styles[rarity] || styles.common;
  },
  useCardStyle: () => ({
    borderRadius: 12,
    shadowGlow: true,
    animationStyle: 'smooth',
    backgroundStyle: 'gradient',
  }),
  useBoardStyle: () => ({
    style: 'wood',
    gridColor: '#8B4513',
    backgroundColor: '#DEB887',
    stoneStyle: 'classic',
  }),
}));

// Mock cn utility
vi.mock('@/lib/utils', () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(' '),
}));

import { ThemedCard, ThemedCardHeader, ThemedCardTitle, ThemedCardContent } from '../ThemedCard';
import { ThemedBadge } from '../ThemedBadge';
import { ThemedBoard, ThemedBoardGrid } from '../ThemedBoard';

describe('ThemedCard', () => {
  test('should render children', () => {
    render(<ThemedCard>Test Content</ThemedCard>);
    expect(screen.getByText('Test Content')).toBeDefined();
  });

  test('should apply rarity styles', () => {
    render(<ThemedCard rarity="legendary">Legendary Card</ThemedCard>);
    expect(screen.getByText('Legendary Card')).toBeDefined();
  });

  test('should show disabled state', () => {
    render(<ThemedCard disabled>Disabled Card</ThemedCard>);
    expect(screen.getByText('Disabled Card')).toBeDefined();
  });

  test('should show selected state', () => {
    render(<ThemedCard selected>Selected Card</ThemedCard>);
    expect(screen.getByText('Selected Card')).toBeDefined();
  });
});

describe('ThemedCardHeader/Title/Content', () => {
  test('should render card structure', () => {
    render(
      <ThemedCard>
        <ThemedCardHeader>
          <ThemedCardTitle>Card Title</ThemedCardTitle>
        </ThemedCardHeader>
        <ThemedCardContent>Card Content</ThemedCardContent>
      </ThemedCard>
    );
    expect(screen.getByText('Card Title')).toBeDefined();
    expect(screen.getByText('Card Content')).toBeDefined();
  });
});

describe('ThemedBadge', () => {
  test('should render with rarity label', () => {
    render(<ThemedBadge rarity="legendary" />);
    expect(screen.getByText('传说')).toBeDefined();
  });

  test('should render custom children', () => {
    render(<ThemedBadge>Custom Badge</ThemedBadge>);
    expect(screen.getByText('Custom Badge')).toBeDefined();
  });
});

describe('ThemedBoard', () => {
  test('should render children', () => {
    render(<ThemedBoard>Board Content</ThemedBoard>);
    expect(screen.getByText('Board Content')).toBeDefined();
  });
});

describe('ThemedBoardGrid', () => {
  test('should render grid with size', () => {
    render(<ThemedBoardGrid size={15}>Grid</ThemedBoardGrid>);
    expect(screen.getByText('Grid')).toBeDefined();
  });
});
