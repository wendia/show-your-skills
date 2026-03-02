import { GameState, SkillCard, Position, StoneColor, BlockedZone, GameAction } from '@/types';

// This matches the GameState from src/types/index.ts used by core/Game.ts
export function createMockGameState(overrides?: Partial<GameState>): GameState {
  return {
    boardSize: 15,
    board: Array(15).fill(null).map(() => Array(15).fill(null)),
    currentPlayer: 'black',
    phase: 'playing',
    winner: null,
    players: {
      black: { id: 'black', name: 'Black', color: 'black', skillCards: [] },
      white: { id: 'white', name: 'White', color: 'white', skillCards: [] },
    },
    history: [],
    turn: 1,
    remainingMoves: 1,
    blockedZones: [],
    ...overrides,
  };
}

export function createMockSkillCard(overrides?: Partial<SkillCard>): SkillCard {
  return {
    id: 'test-card-1',
    skillId: 'test_skill',
    name: 'Test Skill',
    description: 'A test skill',
    used: false,
    ...overrides,
  };
}

export function placeStonesOnBoard(
  board: (StoneColor | null)[][],
  positions: Array<{ pos: Position; color: 'black' | 'white' }>
): (StoneColor | null)[][] {
  const newBoard = board.map(row => [...row]);
  positions.forEach(({ pos, color }) => {
    newBoard[pos.row][pos.col] = color;
  });
  return newBoard;
}

export function createWinningBoard(
  direction: 'horizontal' | 'vertical' | 'diagonal' | 'anti-diagonal',
  color: 'black' | 'white',
  startRow: number = 7,
  startCol: number = 5
): { board: (StoneColor | null)[][]; lastPosition: Position } {
  const board = Array(15).fill(null).map(() => Array(15).fill(null));
  const positions: Position[] = [];

  for (let i = 0; i < 5; i++) {
    let row = startRow;
    let col = startCol + i;

    switch (direction) {
      case 'vertical':
        row = startRow + i;
        col = startCol;
        break;
      case 'diagonal':
        row = startRow + i;
        col = startCol + i;
        break;
      case 'anti-diagonal':
        row = startRow + i;
        col = startCol - i;
        break;
    }

    board[row][col] = color;
    positions.push({ row, col });
  }

  return { board, lastPosition: positions[positions.length - 1] };
}

export function createMockBlockedZone(overrides?: Partial<BlockedZone>): BlockedZone {
  return {
    centerPosition: { row: 7, col: 7 },
    expiresAfterTurn: 5,
    blockedBy: 'black',
    ...overrides,
  };
}

export function createMockGameAction(overrides?: Partial<GameAction>): GameAction {
  return {
    type: 'place',
    player: 'black',
    position: { row: 7, col: 7 },
    timestamp: Date.now(),
    ...overrides,
  };
}
