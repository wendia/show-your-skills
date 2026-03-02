import { motion } from 'framer-motion';
import { useBoardStyle } from '@/theme/useTheme';
import { cn } from '@/lib/utils';
import { Board as BoardType, Position, Stone } from '@/config/types';

// Cell size in pixels
const CELL_SIZE = 32;

// Star points (星位) positions - traditional Gomoku 5-star layout
// 天元 at center (H8), plus 4 corner stars at D4, D12, L4, L12
const STAR_POINTS: Position[] = [
  { row: 7, col: 7 },   // 天元 (H8) - center
  { row: 3, col: 3 },   // D4
  { row: 3, col: 11 },  // L4
  { row: 11, col: 3 },  // D12
  { row: 11, col: 11 }, // L12
];

// Column labels: A-O (left to right)
const COLUMN_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];

// Row labels: 15-1 (top to bottom, traditional Gomoku convention)
const ROW_LABELS = [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

const isStarPoint = (row: number, col: number): boolean => {
  return STAR_POINTS.some((p) => p.row === row && p.col === col);
};

interface BoardProps {
  board: BoardType;
  onCellClick: (position: Position) => void;
  onCellHover?: (position: Position | null) => void;
  previewPosition?: Position | null;
  disabled?: boolean;
  lastMove?: Position | null;
  showCoordinates?: boolean;
}

export function Board({
  board,
  onCellClick,
  onCellHover,
  previewPosition,
  disabled = false,
  lastMove,
  showCoordinates = true,
}: BoardProps) {
  const boardStyle = useBoardStyle();

  // Safety check for undefined board
  if (!board || !Array.isArray(board) || board.length === 0) {
    return (
      <div className="inline-block p-8 rounded-lg shadow-xl bg-amber-100">
        <div className="text-amber-900">Loading board...</div>
      </div>
    );
  }

  const getBoardBackground = () => {
    switch (boardStyle?.style) {
      case 'wood':
        return 'bg-gradient-to-b from-amber-200 via-amber-100 to-amber-200';
      case 'modern':
        return 'bg-slate-900';
      default:
        return 'bg-gradient-to-b from-amber-200 via-amber-100 to-amber-200';
    }
  };

  const getGridColor = () => {
    return boardStyle?.gridColor || '#8B4513';
  };

  const getTextColor = () => {
    return boardStyle?.style === 'modern' ? 'text-gray-400' : 'text-amber-900';
  };

  const getStoneStyle = (stone: Stone | null) => {
    if (!stone) return '';

    switch (boardStyle?.stoneStyle) {
      case 'modern':
        return stone === 'black'
          ? 'bg-gradient-to-br from-gray-800 to-black shadow-lg'
          : 'bg-gradient-to-br from-white to-gray-200 shadow-lg';
      case 'minimal':
        return stone === 'black' ? 'bg-gray-900' : 'bg-gray-100';
      default:
        return stone === 'black'
          ? 'bg-gradient-to-br from-gray-700 to-black rounded-full shadow-inner'
          : 'bg-gradient-to-br from-white to-gray-200 rounded-full shadow-inner';
    }
  };

  const renderCell = (row: number, col: number) => {
    const stone = board[row][col];
    const isPreview = previewPosition?.row === row && previewPosition?.col === col;
    const isLastMove = lastMove?.row === row && lastMove?.col === col;
    const isStar = isStarPoint(row, col);

    return (
      <div
        key={`${row}-${col}`}
        className="relative flex items-center justify-center cursor-pointer"
        style={{ width: CELL_SIZE, height: CELL_SIZE }}
        onClick={() => !disabled && onCellClick({ row, col })}
        onMouseEnter={() => onCellHover?.({ row, col })}
        onMouseLeave={() => onCellHover?.(null)}
      >
        {/* Grid lines */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(${getGridColor()} 1px, transparent 1px),
              linear-gradient(90deg, ${getGridColor()} 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%',
            opacity: 0.5,
          }}
        />

        {/* Star point marker (星位) */}
        {isStar && !stone && (
          <div
            className="absolute w-2 h-2 rounded-full z-0"
            style={{ backgroundColor: getGridColor(), opacity: 0.7 }}
          />
        )}

        {/* Last move indicator */}
        {isLastMove && (
          <div className="absolute w-2 h-2 bg-red-500 rounded-full z-10" />
        )}

        {/* Stone */}
        {stone && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className={cn('w-6 h-6 z-10', getStoneStyle(stone))}
          />
        )}

        {/* Preview stone */}
        {isPreview && !stone && !disabled && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.5 }}
            className={cn('w-6 h-6 z-10 rounded-full', 'bg-gray-400')}
          />
        )}
      </div>
    );
  };

  // Board grid dimensions
  const gridSize = CELL_SIZE * 15;

  // Board without coordinates
  if (!showCoordinates) {
    return (
      <div
        className={cn(
          'inline-flex flex-col rounded-lg shadow-xl border-4 border-amber-800/30',
          getBoardBackground()
        )}
        style={{ padding: 16 }}
      >
        <div
          className="grid"
          style={{
            width: gridSize,
            height: gridSize,
            gridTemplateColumns: `repeat(15, ${CELL_SIZE}px)`,
            gridTemplateRows: `repeat(15, ${CELL_SIZE}px)`,
          }}
        >
          {board.map((row, rowIndex) => row.map((_, colIndex) => renderCell(rowIndex, colIndex)))}
        </div>
      </div>
    );
  }

  // Board with traditional coordinates
  return (
    <div
      className={cn(
        'inline-flex flex-col rounded-lg shadow-xl border-4 border-amber-800/30',
        getBoardBackground()
      )}
      style={{ padding: 12 }}
    >
      {/* Column headers (A-O) */}
      <div className="flex" style={{ marginLeft: 24 }}>
        {COLUMN_LABELS.map((label) => (
          <div
            key={label}
            className={cn('flex items-center justify-center text-xs font-medium', getTextColor())}
            style={{ width: CELL_SIZE, height: 20 }}
          >
            {label}
          </div>
        ))}
      </div>

      <div className="flex">
        {/* Row headers (15-1) */}
        <div className="flex flex-col" style={{ width: 24 }}>
          {ROW_LABELS.map((num) => (
            <div
              key={num}
              className={cn('flex items-center justify-center text-xs font-medium', getTextColor())}
              style={{ height: CELL_SIZE }}
            >
              {num}
            </div>
          ))}
        </div>

        {/* Board grid */}
        <div
          className="grid"
          style={{
            width: gridSize,
            height: gridSize,
            gridTemplateColumns: `repeat(15, ${CELL_SIZE}px)`,
            gridTemplateRows: `repeat(15, ${CELL_SIZE}px)`,
          }}
        >
          {board.map((row, rowIndex) => row.map((_, colIndex) => renderCell(rowIndex, colIndex)))}
        </div>
      </div>
    </div>
  );
}

// Export helper functions for testing
export { STAR_POINTS, COLUMN_LABELS, ROW_LABELS, isStarPoint };
