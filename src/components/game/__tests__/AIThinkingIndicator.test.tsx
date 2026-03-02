import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AIThinkingIndicator, AIEvaluationDisplay } from '../AIThinkingIndicator';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: React.PropsWithChildren<{ className?: string }>) => (
      <div className={className} data-testid="motion-div" {...props}>{children}</div>
    ),
    span: ({ children, ...props }: React.PropsWithChildren) => (
      <span {...props}>{children}</span>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

describe('AIThinkingIndicator', () => {
  test('should not render when isThinking is false', () => {
    const { container } = render(<AIThinkingIndicator isThinking={false} />);
    expect(container.firstChild).toBeNull();
  });

  test('should render when isThinking is true', () => {
    render(<AIThinkingIndicator isThinking={true} />);
    expect(screen.getByText(/AI 思考中/)).toBeDefined();
  });

  test('should display thinking time when provided', () => {
    render(<AIThinkingIndicator isThinking={true} thinkingTime={500} />);
    expect(screen.getByText(/500ms/)).toBeDefined();
  });

  test('should display search depth when provided', () => {
    render(<AIThinkingIndicator isThinking={true} depth={4} />);
    expect(screen.getByText(/搜索深度: 4/)).toBeDefined();
  });

  test('should display both depth and time when provided', () => {
    render(<AIThinkingIndicator isThinking={true} depth={4} thinkingTime={500} />);
    expect(screen.getByText(/搜索深度: 4/)).toBeDefined();
    expect(screen.getByText(/500ms/)).toBeDefined();
  });

  test('should have correct structure', () => {
    const { container } = render(<AIThinkingIndicator isThinking={true} />);
    expect(container.querySelector('.bg-gray-900\\/90')).toBeDefined();
  });
});

describe('AIEvaluationDisplay', () => {
  test('should not render when visible is false', () => {
    const { container } = render(
      <AIEvaluationDisplay visible={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  test('should render when visible is true', () => {
    render(<AIEvaluationDisplay visible={true} />);
    expect(screen.getByText('评估:')).toBeDefined();
  });

  test('should display evaluation value', () => {
    render(<AIEvaluationDisplay visible={true} evaluation={500} />);
    expect(screen.getByText('优势')).toBeDefined();
    expect(screen.getByText('(+500)')).toBeDefined();
  });

  test('should display negative evaluation correctly', () => {
    render(<AIEvaluationDisplay visible={true} evaluation={-200} />);
    expect(screen.getByText('劣势')).toBeDefined();
    expect(screen.getByText('(-200)')).toBeDefined();
  });

  test('should display best move when provided', () => {
    render(<AIEvaluationDisplay visible={true} bestMove={{ row: 7, col: 8 }} />);
    expect(screen.getByText('(7, 8)')).toBeDefined();
  });

  test('should display both evaluation and best move', () => {
    render(
      <AIEvaluationDisplay
        visible={true}
        evaluation={100}
        bestMove={{ row: 5, col: 5 }}
      />
    );
    expect(screen.getByText('稍优')).toBeDefined();
    expect(screen.getByText('(5, 5)')).toBeDefined();
  });

  describe('evaluation labels', () => {
    test.each([
      [15000, '必胜'],
      [5000, '大优'],
      [500, '优势'],
      [50, '稍优'],
      [0, '均势'],
      [-50, '均势'],
      [-500, '劣势'],
      [-5000, '大劣'],
      [-15000, '必败'],
    ])('should show "%s" for evaluation %d', (evaluation, expectedLabel) => {
      render(<AIEvaluationDisplay visible={true} evaluation={evaluation} />);
      expect(screen.getByText(expectedLabel)).toBeDefined();
    });
  });

  describe('evaluation colors', () => {
    test('should use green for positive evaluation', () => {
      const { container } = render(
        <AIEvaluationDisplay visible={true} evaluation={500} />
      );
      expect(container.querySelector('.text-green-400')).toBeDefined();
    });

    test('should use yellow for neutral evaluation', () => {
      const { container } = render(
        <AIEvaluationDisplay visible={true} evaluation={0} />
      );
      expect(container.querySelector('.text-yellow-500')).toBeDefined();
    });

    test('should use red for negative evaluation', () => {
      const { container } = render(
        <AIEvaluationDisplay visible={true} evaluation={-500} />
      );
      expect(container.querySelector('.text-red-400')).toBeDefined();
    });
  });
});
