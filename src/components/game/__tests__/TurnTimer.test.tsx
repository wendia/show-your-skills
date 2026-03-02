import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TurnTimer, GameTimer } from '../TurnTimer';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    circle: ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
      <circle className={className} style={style} data-testid="motion-circle" />
    ),
  },
}));

describe('TurnTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('should render with initial time', () => {
    render(<TurnTimer initialSeconds={60} onTimeout={vi.fn()} />);
    expect(screen.getByText('1:00')).toBeDefined();
  });

  test('should show remaining time label', () => {
    render(<TurnTimer initialSeconds={60} onTimeout={vi.fn()} />);
    expect(screen.getByText('剩余时间')).toBeDefined();
  });

  test('should count down when active', () => {
    render(<TurnTimer initialSeconds={60} onTimeout={vi.fn()} />);

    vi.advanceTimersByTime(1000);
    expect(screen.getByText('0:59')).toBeDefined();

    vi.advanceTimersByTime(5000);
    expect(screen.getByText('0:54')).toBeDefined();
  });

  test('should call onTimeout when time reaches zero', async () => {
    const onTimeout = vi.fn();
    render(<TurnTimer initialSeconds={3} onTimeout={onTimeout} />);

    vi.advanceTimersByTime(3000);

    expect(onTimeout).toHaveBeenCalled();
  });

  test('should not count down when paused', () => {
    render(<TurnTimer initialSeconds={60} onTimeout={vi.fn()} isPaused={true} />);

    vi.advanceTimersByTime(5000);
    expect(screen.getByText('1:00')).toBeDefined();
  });

  test('should not count down when inactive', () => {
    render(<TurnTimer initialSeconds={60} onTimeout={vi.fn()} isActive={false} />);

    vi.advanceTimersByTime(5000);
    expect(screen.getByText('1:00')).toBeDefined();
  });

  test('should show warning when time is low (≤30 seconds)', () => {
    render(<TurnTimer initialSeconds={30} onTimeout={vi.fn()} />);

    expect(screen.getByText('时间紧迫!')).toBeDefined();
  });

  test('should not show warning when time is above threshold', () => {
    render(<TurnTimer initialSeconds={60} onTimeout={vi.fn()} />);

    expect(screen.getByText('剩余时间')).toBeDefined();
    expect(screen.queryByText('时间紧迫!')).toBeNull();
  });

  test('should show warning state after countdown', () => {
    render(<TurnTimer initialSeconds={35} onTimeout={vi.fn()} />);

    expect(screen.getByText('剩余时间')).toBeDefined();

    vi.advanceTimersByTime(5000);

    expect(screen.getByText('时间紧迫!')).toBeDefined();
  });

  test('should format time correctly', () => {
    const { rerender } = render(<TurnTimer initialSeconds={90} onTimeout={vi.fn()} />);
    expect(screen.getByText('1:30')).toBeDefined();

    rerender(<TurnTimer initialSeconds={5} onTimeout={vi.fn()} />);
    expect(screen.getByText('0:05')).toBeDefined();
  });
});

describe('GameTimer', () => {
  test('should render both player times', () => {
    render(
      <GameTimer
        currentPlayer="black"
        blackTime={120}
        whiteTime={180}
        initialTime={180}
        onTimeout={vi.fn()}
      />
    );

    expect(screen.getByText('黑方')).toBeDefined();
    expect(screen.getByText('白方')).toBeDefined();
    expect(screen.getByText('2:00')).toBeDefined(); // Black time
    expect(screen.getByText('3:00')).toBeDefined(); // White time
  });

  test('should highlight current player', () => {
    const { container } = render(
      <GameTimer
        currentPlayer="black"
        blackTime={120}
        whiteTime={180}
        initialTime={180}
        onTimeout={vi.fn()}
      />
    );

    // Black player should be highlighted (white text)
    const blackTimeElement = screen.getAllByText('2:00')[0];
    expect(blackTimeElement.className).toContain('text-white');
  });

  test('should show warning for low time', () => {
    render(
      <GameTimer
        currentPlayer="black"
        blackTime={20}
        whiteTime={180}
        initialTime={180}
        onTimeout={vi.fn()}
      />
    );

    const blackTimeElement = screen.getAllByText('0:20')[0];
    expect(blackTimeElement.className).toContain('text-red-500');
  });

  test('should show vs separator', () => {
    render(
      <GameTimer
        currentPlayer="black"
        blackTime={120}
        whiteTime={180}
        initialTime={180}
        onTimeout={vi.fn()}
      />
    );

    expect(screen.getByText('vs')).toBeDefined();
  });
});
