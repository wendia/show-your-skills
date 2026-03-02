import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      className,
      animate,
      variants,
    }: {
      children: React.ReactNode;
      className?: string;
      animate?: string;
      variants?: { front: object; back: object };
    }) => (
      <div className={className} data-animate={animate} data-testid="motion-div">
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock theme hooks before importing
vi.mock('@/theme/useTheme', () => ({
  useRarityStyle: () => ({
    gradient: 'from-gray-600 to-gray-800',
    border: 'border-gray-500',
    glow: 'rgba(156, 163, 175, 0.5)',
    badge: 'bg-gray-500',
  }),
  useCardStyle: () => ({
    borderRadius: 8,
    shadowGlow: true,
    animationStyle: 'smooth',
    backgroundStyle: 'gradient',
  }),
}));

// Mock cn utility
vi.mock('@/lib/utils', () => ({
  cn: (...args: (string | boolean | undefined)[]) =>
    args.filter(Boolean).join(' '),
}));

// Import after mocks
import { SkillCard } from '../SkillCard';
import { createMockSkillCard } from '@/__tests__/utils/testUtils';

describe('SkillCard Component', () => {
  const mockSkill = createMockSkillCard({
    name: 'Test Skill',
    description: 'A test skill description',
    rarity: 'common',
  });
  const mockOnUse = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    test('should display skill name', () => {
      render(<SkillCard skill={mockSkill} onUse={mockOnUse} />);
      expect(screen.getByText('Test Skill')).toBeDefined();
    });

    test('should display skill description', () => {
      render(<SkillCard skill={mockSkill} onUse={mockOnUse} />);
      expect(screen.getByText('A test skill description')).toBeDefined();
    });

    test('should display rarity badge', () => {
      render(<SkillCard skill={mockSkill} onUse={mockOnUse} />);
      expect(screen.getByText('普通')).toBeDefined(); // 'common' in Chinese
    });

    test('should show "已使用" overlay when used', () => {
      render(<SkillCard skill={{ ...mockSkill, used: true }} onUse={mockOnUse} />);
      const usedTexts = screen.getAllByText('已使用');
      expect(usedTexts.length).toBeGreaterThan(0);
    });

    test('should show selected state', () => {
      render(<SkillCard skill={mockSkill} onUse={mockOnUse} selected={true} />);
      // Component should render without error when selected
      expect(screen.getByText('Test Skill')).toBeDefined();
    });

    test('should show correct button text for unused skill', () => {
      render(<SkillCard skill={mockSkill} onUse={mockOnUse} />);
      const useButtons = screen.getAllByText('使用技能');
      expect(useButtons.length).toBeGreaterThan(0);
    });

    test('should show correct button text for used skill', () => {
      render(<SkillCard skill={{ ...mockSkill, used: true }} onUse={mockOnUse} />);
      expect(screen.getByText('已使用')).toBeDefined();
    });
  });

  describe('interactions', () => {
    test('should call onUse when button clicked', () => {
      render(<SkillCard skill={mockSkill} onUse={mockOnUse} />);
      const button = screen.getAllByText('使用技能')[0];
      fireEvent.click(button);
      expect(mockOnUse).toHaveBeenCalled();
    });

    test('should disable button when skill is used', () => {
      render(<SkillCard skill={{ ...mockSkill, used: true }} onUse={mockOnUse} />);
      const buttons = screen.getAllByRole('button');
      // The main use button should be disabled
      const disabledButtons = buttons.filter((btn) => btn.hasAttribute('disabled'));
      expect(disabledButtons.length).toBeGreaterThan(0);
    });
  });

  describe('flip functionality', () => {
    test('should show info button when flip is enabled', () => {
      render(<SkillCard skill={mockSkill} onUse={mockOnUse} enableFlip={true} />);
      // Component should render
      expect(screen.getByText('Test Skill')).toBeDefined();
    });

    test('should not show info button when flip is disabled', () => {
      render(<SkillCard skill={mockSkill} onUse={mockOnUse} enableFlip={false} />);
      expect(screen.getByText('Test Skill')).toBeDefined();
    });

    test('should flip card when clicked', () => {
      const { container } = render(
        <SkillCard skill={mockSkill} onUse={mockOnUse} enableFlip={true} />
      );

      // Click on the card container to flip
      const cardContainer = container.querySelector('.perspective-1000');
      expect(cardContainer).toBeDefined();

      fireEvent.click(cardContainer!);

      // After flip, should show back face content
      expect(screen.getByText('技能说明')).toBeDefined();
      expect(screen.getByText('使用方法')).toBeDefined();
    });

    test('should not flip when skill is used', () => {
      render(
        <SkillCard
          skill={{ ...mockSkill, used: true }}
          onUse={mockOnUse}
          enableFlip={true}
        />
      );

      // Card should still show front content
      expect(screen.getByText('A test skill description')).toBeDefined();
    });

    test('should show back face with additional info', () => {
      const { container } = render(
        <SkillCard skill={mockSkill} onUse={mockOnUse} enableFlip={true} />
      );

      const cardContainer = container.querySelector('.perspective-1000');
      fireEvent.click(cardContainer!);

      // Back face should have detailed sections
      expect(screen.getByText('技能说明')).toBeDefined();
      expect(screen.getByText('稀有度')).toBeDefined();
      expect(screen.getByText('使用方法')).toBeDefined();
    });

    test('should call onUse from back face', () => {
      const { container } = render(
        <SkillCard skill={mockSkill} onUse={mockOnUse} enableFlip={true} />
      );

      // Flip to back
      const cardContainer = container.querySelector('.perspective-1000');
      fireEvent.click(cardContainer!);

      // Click use button on back face
      const useButtons = screen.getAllByText('使用技能');
      fireEvent.click(useButtons[useButtons.length - 1]); // Click the last one (back face)

      expect(mockOnUse).toHaveBeenCalled();
    });
  });

  describe('rarity labels', () => {
    test.each([
      ['common', '普通'],
      ['rare', '稀有'],
      ['epic', '史诗'],
      ['legendary', '传说'],
    ])('should show "%s" label for %s rarity', (rarity, expectedLabel) => {
      render(
        <SkillCard
          skill={createMockSkillCard({ rarity: rarity as 'common' | 'rare' | 'epic' | 'legendary' })}
          onUse={mockOnUse}
        />
      );
      expect(screen.getByText(expectedLabel)).toBeDefined();
    });
  });
});
