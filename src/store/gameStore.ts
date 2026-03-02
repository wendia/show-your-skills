import { create } from 'zustand';
import { GameState, SkillCard, Position, Stone, Board } from '@/config/types';
import { skillRegistry } from '@/skills/core/SkillRegistry';

// Note: registerAllEffects() is called in main.tsx before app renders

function createInitialGameState(): GameState {
  return {
    id: `game-${Date.now()}`,
    board: Array(15).fill(null).map(() => Array(15).fill(null)),
    currentPlayer: 'black',
    phase: 'playing',
    players: {
      black: {
        id: 'player-black',
        username: 'Black',
        color: 'black',
        skillCards: [],
      },
      white: {
        id: 'player-white',
        username: 'White',
        color: 'white',
        skillCards: [],
      },
    },
    history: [],
    turn: 1,
    remainingMoves: 1,
    blockedZones: [],
  };
}

/**
 * Check if the last placed stone creates a winning line (5 in a row).
 */
function checkWinner(
  board: Board,
  lastPosition: Position,
  color: Stone
): Stone | null {
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];

  for (const [dr, dc] of directions) {
    let count = 1;

    for (let i = 1; i < 5; i++) {
      const r = lastPosition.row + dr * i;
      const c = lastPosition.col + dc * i;
      if (r < 0 || r >= board.length || c < 0 || c >= board[0].length) break;
      if (board[r][c] !== color) break;
      count++;
    }

    for (let i = 1; i < 5; i++) {
      const r = lastPosition.row - dr * i;
      const c = lastPosition.col - dc * i;
      if (r < 0 || r >= board.length || c < 0 || c >= board[0].length) break;
      if (board[r][c] !== color) break;
      count++;
    }

    if (count >= 5) return color;
  }

  return null;
}

interface GameStore {
  gameState: GameState | null;
  selectedSkillCard: string | null;
  selectMode: 'none' | 'blockZone' | 'place' | 'clone';
  previewPosition: Position | null;

  startGame: (skillCards: { black: SkillCard[]; white: SkillCard[] }) => void;
  resetGame: () => void;
  placeStone: (position: Position) => boolean;
  useSkill: (skillCardId: string, targetPosition?: Position) => boolean;
  selectSkillCard: (skillCardId: string | null) => void;
  setSelectMode: (mode: 'none' | 'blockZone' | 'place' | 'clone') => void;
  setPreviewPosition: (position: Position | null) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: null,
  selectedSkillCard: null,
  selectMode: 'none',
  previewPosition: null,

  startGame: (skillCards) => {
    const gameState = createInitialGameState();
    gameState.players.black.skillCards = skillCards.black;
    gameState.players.white.skillCards = skillCards.white;
    set({ gameState, selectedSkillCard: null, selectMode: 'none' });
  },

  resetGame: () => {
    set({ gameState: null, selectedSkillCard: null, selectMode: 'none' });
  },

  placeStone: (position) => {
    const { gameState } = get();
    if (!gameState) return false;

    if (gameState.board[position.row][position.col] !== null) {
      return false;
    }

    const isBlocked = gameState.blockedZones.some(zone => {
      const top = Math.max(0, zone.centerPosition.row - 1);
      const left = Math.max(0, zone.centerPosition.col - 1);
      const bottom = Math.min(14, zone.centerPosition.row + 1);
      const right = Math.min(14, zone.centerPosition.col + 1);

      return position.row >= top && position.row <= bottom &&
             position.col >= left && position.col <= right &&
             zone.expiresAfterTurn > gameState.turn;
    });

    if (isBlocked) {
      return false;
    }

    const newBoard = gameState.board.map(row => [...row]);
    newBoard[position.row][position.col] = gameState.currentPlayer;

    const newHistory = [
      ...gameState.history,
      {
        type: 'place' as const,
        position,
        player: gameState.currentPlayer,
      },
    ];

    const nextPlayer = gameState.currentPlayer === 'black' ? 'white' : 'black';
    const newRemainingMoves = gameState.remainingMoves - 1;

    const newBlockedZones = gameState.blockedZones.filter(
      zone => zone.expiresAfterTurn > gameState.turn
    );

    const winner = checkWinner(newBoard, position, gameState.currentPlayer);

    set({
      gameState: {
        ...gameState,
        board: newBoard,
        history: newHistory,
        currentPlayer: winner ? gameState.currentPlayer : (newRemainingMoves > 0 ? gameState.currentPlayer : nextPlayer),
        turn: winner ? gameState.turn : (newRemainingMoves > 0 ? gameState.turn : gameState.turn + 1),
        remainingMoves: winner ? gameState.remainingMoves : (newRemainingMoves > 0 ? newRemainingMoves : 1),
        blockedZones: newBlockedZones,
        phase: winner ? 'ended' : 'playing',
        winner: winner || undefined,
      },
    });

    return true;
  },

  useSkill: (skillCardId, targetPosition) => {
    const { gameState, selectedSkillCard } = get();
    if (!gameState || !selectedSkillCard) return false;

    const currentPlayerState = gameState.players[gameState.currentPlayer];
    const skillCard = currentPlayerState.skillCards.find(card => card.id === skillCardId);

    if (!skillCard || skillCard.used) return false;

    const context = {
      gameState,
      currentPlayer: {
        id: currentPlayerState.id,
        color: currentPlayerState.color,
      },
      targetPosition,
    };

    if (!skillRegistry.canUse(skillCard.skillId, context)) {
      return false;
    }

    const newGameState = skillRegistry.execute(skillCard.skillId, context);
    if (!newGameState) return false;

    const updatedSkillCards = currentPlayerState.skillCards.map(card =>
      card.id === skillCardId ? { ...card, used: true } : card
    );

    set({
      gameState: {
        ...newGameState,
        players: {
          ...newGameState.players,
          [gameState.currentPlayer]: {
            ...currentPlayerState,
            skillCards: updatedSkillCards,
          },
        },
      },
      selectedSkillCard: null,
      selectMode: 'none',
    });

    return true;
  },

  selectSkillCard: (skillCardId) => {
    set({ selectedSkillCard: skillCardId });
  },

  setSelectMode: (mode) => {
    set({ selectMode: mode });
  },

  setPreviewPosition: (position) => {
    set({ previewPosition: position });
  },
}));
