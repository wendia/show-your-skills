import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock the gameStore before importing the component
const createMockState = (overrides = {}) => ({
  gameState: {
    id: 'test-game',
    board: Array(15).fill(null).map(() => Array(15).fill(null)),
    currentPlayer: 'black' as const,
    phase: 'playing' as const,
    players: {
      black: {
        id: 'black',
        username: 'Black Player',
        color: 'black' as const,
        skillCards: [
          { id: 'card1', skillId: 'test_skill', name: 'Test Skill 1', description: 'Test', used: false },
          { id: 'card2', skillId: 'test_skill', name: 'Test Skill 2', description: 'Test', used: true },
        ],
      },
      white: {
        id: 'white',
        username: 'White Player',
        color: 'white' as const,
        skillCards: [
          { id: 'card3', skillId: 'test_skill', name: 'Test Skill 3', description: 'Test', used: false },
        ],
      },
    },
    history: [],
    turn: 1,
    remainingMoves: 1,
    blockedZones: [],
  },
  selectMode: 'none' as const,
  selectedSkillCard: null,
  ...overrides,
});

let mockState = createMockState();

vi.mock('@/store/gameStore', () => ({
  useGameStore: vi.fn((selector) => selector ? selector(mockState) : mockState),
}));

// Import after mocks
import { SkillCardList } from '@/components/SkillCard';

describe('SkillCardList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState = createMockState();
  });

  test('should render without crashing when gameState exists', () => {
    render(<SkillCardList />);
    // Check that player names are rendered
    expect(screen.getByText(/Black Player/)).toBeDefined();
    expect(screen.getByText(/White Player/)).toBeDefined();
  });

  test('should render current player skill cards', () => {
    render(<SkillCardList />);
    expect(screen.getByText('Test Skill 1')).toBeDefined();
    expect(screen.getByText('Test Skill 2')).toBeDefined();
  });

  test('should render opponent skill cards', () => {
    render(<SkillCardList />);
    expect(screen.getByText('Test Skill 3')).toBeDefined();
  });

  test('should show current turn indicator', () => {
    render(<SkillCardList />);
    expect(screen.getByText('(当前回合)')).toBeDefined();
  });

  test('should handle undefined skillCards gracefully', () => {
    mockState = {
      gameState: {
        ...createMockState().gameState,
        players: {
          black: {
            id: 'black',
            username: 'Black Player',
            color: 'black',
            skillCards: undefined as unknown as [],
          },
          white: {
            id: 'white',
            username: 'White Player',
            color: 'white',
            skillCards: undefined as unknown as [],
          },
        },
      },
      selectMode: 'none',
      selectedSkillCard: null,
    };

    // Should not throw
    expect(() => render(<SkillCardList />)).not.toThrow();
  });

  test('should return null when gameState is null', () => {
    mockState = {
      gameState: null,
      selectMode: 'none',
      selectedSkillCard: null,
    };

    const { container } = render(<SkillCardList />);
    expect(container.firstChild).toBeNull();
  });
});
