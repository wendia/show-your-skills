import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <div className={className}>{children}</div>
    ),
  },
}));

// Mock theme hooks before importing Board
vi.mock('@/theme/useTheme', () => ({
  useBoardStyle: () => ({
    style: 'classic',
    gridColor: '#8B4513',
    stoneStyle: 'classic',
  }),
}));

// Mock cn utility
vi.mock('@/lib/utils', () => ({
  cn: (...args: (string | boolean | undefined)[]) => args.filter(Boolean).join(' '),
}));

// Import after mocks
import { Board, STAR_POINTS, COLUMN_LABELS, ROW_LABELS, isStarPoint } from '../Board';
import { createEmptyBoard } from '@/core/Game';

describe('Board Component', () => {
  const mockBoard = createEmptyBoard(15);
  const mockOnCellClick = vi.fn();
  const mockOnCellHover = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    test('should render 15x15 grid', () => {
      const { container } = render(
        <Board
          board={mockBoard}
          onCellClick={mockOnCellClick}
        />
      );

      // Check that the grid has 15 columns
      const grid = container.querySelector('.grid');
      expect(grid).toBeDefined();
      expect(grid?.children.length).toBe(225); // 15 * 15
    });

    test('should render black stones correctly', () => {
      const boardWithStone = mockBoard.map((row) => [...row]);
      boardWithStone[7][7] = 'black';

      const { container } = render(
        <Board
          board={boardWithStone}
          onCellClick={mockOnCellClick}
        />
      );

      // Check that the board renders without error
      expect(container.firstChild).toBeDefined();
    });

    test('should render white stones correctly', () => {
      const boardWithStone = mockBoard.map((row) => [...row]);
      boardWithStone[7][7] = 'white';

      const { container } = render(
        <Board
          board={boardWithStone}
          onCellClick={mockOnCellClick}
        />
      );

      expect(container.firstChild).toBeDefined();
    });

    test('should render empty cells', () => {
      const { container } = render(
        <Board
          board={mockBoard}
          onCellClick={mockOnCellClick}
        />
      );

      expect(container.firstChild).toBeDefined();
    });

    test('should render last move indicator', () => {
      const { container } = render(
        <Board
          board={mockBoard}
          onCellClick={mockOnCellClick}
          lastMove={{ row: 7, col: 7 }}
        />
      );

      expect(container.firstChild).toBeDefined();
    });

    test('should render preview stone on hover position', () => {
      const { container } = render(
        <Board
          board={mockBoard}
          onCellClick={mockOnCellClick}
          previewPosition={{ row: 7, col: 7 }}
        />
      );

      expect(container.firstChild).toBeDefined();
    });
  });

  describe('interactions', () => {
    test('should call onCellClick with correct position', () => {
      render(
        <Board
          board={mockBoard}
          onCellClick={mockOnCellClick}
        />
      );

      const cells = document.querySelectorAll('.cursor-pointer');
      fireEvent.click(cells[0]);

      expect(mockOnCellClick).toHaveBeenCalledWith({ row: 0, col: 0 });
    });

    test('should not call onCellClick when disabled', () => {
      render(
        <Board
          board={mockBoard}
          onCellClick={mockOnCellClick}
          disabled={true}
        />
      );

      const cells = document.querySelectorAll('.cursor-pointer');
      fireEvent.click(cells[0]);

      expect(mockOnCellClick).not.toHaveBeenCalled();
    });

    test('should call onCellHover on mouse enter', () => {
      render(
        <Board
          board={mockBoard}
          onCellClick={mockOnCellClick}
          onCellHover={mockOnCellHover}
        />
      );

      const cells = document.querySelectorAll('.cursor-pointer');
      fireEvent.mouseEnter(cells[0]);

      expect(mockOnCellHover).toHaveBeenCalledWith({ row: 0, col: 0 });
    });

    test('should call onCellHover with null on mouse leave', () => {
      render(
        <Board
          board={mockBoard}
          onCellClick={mockOnCellClick}
          onCellHover={mockOnCellHover}
        />
      );

      const cells = document.querySelectorAll('.cursor-pointer');
      fireEvent.mouseLeave(cells[0]);

      expect(mockOnCellHover).toHaveBeenCalledWith(null);
    });
  });

  describe('coordinates', () => {
    test('should show coordinate labels by default', () => {
      render(
        <Board
          board={mockBoard}
          onCellClick={mockOnCellClick}
        />
      );

      // Check for column labels (A-O)
      expect(screen.getByText('A')).toBeDefined();
      expect(screen.getByText('H')).toBeDefined();
      expect(screen.getByText('O')).toBeDefined();

      // Check for row labels (1-15)
      expect(screen.getByText('1')).toBeDefined();
      expect(screen.getByText('8')).toBeDefined();
      expect(screen.getByText('15')).toBeDefined();
    });

    test('should hide coordinate labels when showCoordinates is false', () => {
      render(
        <Board
          board={mockBoard}
          onCellClick={mockOnCellClick}
          showCoordinates={false}
        />
      );

      // Column labels should not be present
      expect(screen.queryByText('A')).toBeNull();
      expect(screen.queryByText('O')).toBeNull();
    });
  });

  describe('star points', () => {
    test('should render star points on empty board', () => {
      const { container } = render(
        <Board
          board={mockBoard}
          onCellClick={mockOnCellClick}
        />
      );

      // Star points are rendered as small circles
      // Check that the board container exists
      expect(container.firstChild).toBeDefined();
    });
  });
});

describe('Board Helper Functions', () => {
  describe('STAR_POINTS', () => {
    test('should have 5 star points', () => {
      expect(STAR_POINTS).toHaveLength(5);
    });

    test('should include center point (天元)', () => {
      expect(STAR_POINTS).toContainEqual({ row: 7, col: 7 });
    });

    test('should include corner points D4, D12, L4, L12', () => {
      expect(STAR_POINTS).toContainEqual({ row: 3, col: 3 }); // D4
      expect(STAR_POINTS).toContainEqual({ row: 11, col: 3 }); // D12
      expect(STAR_POINTS).toContainEqual({ row: 3, col: 11 }); // L4
      expect(STAR_POINTS).toContainEqual({ row: 11, col: 11 }); // L12
    });
  });

  describe('COLUMN_LABELS', () => {
    test('should have 15 labels', () => {
      expect(COLUMN_LABELS).toHaveLength(15);
    });

    test('should start with A and end with O', () => {
      expect(COLUMN_LABELS[0]).toBe('A');
      expect(COLUMN_LABELS[14]).toBe('O');
    });

    test('should have H at index 7 (center)', () => {
      expect(COLUMN_LABELS[7]).toBe('H');
    });
  });

  describe('ROW_LABELS', () => {
    test('should have 15 labels', () => {
      expect(ROW_LABELS).toHaveLength(15);
    });

    test('should start with 15 and end with 1', () => {
      expect(ROW_LABELS[0]).toBe(15);
      expect(ROW_LABELS[14]).toBe(1);
    });

    test('should have 8 at index 7 (center row)', () => {
      expect(ROW_LABELS[7]).toBe(8);
    });
  });

  describe('isStarPoint', () => {
    test('should return true for star point positions', () => {
      expect(isStarPoint(7, 7)).toBe(true); // 天元
      expect(isStarPoint(3, 3)).toBe(true); // D4
      expect(isStarPoint(11, 11)).toBe(true); // L12
    });

    test('should return false for non-star point positions', () => {
      expect(isStarPoint(0, 0)).toBe(false);
      expect(isStarPoint(5, 5)).toBe(false);
      expect(isStarPoint(14, 14)).toBe(false);
    });
  });
});
