import { useGameStore } from '@/store/gameStore';
import { Position, SkillCard } from '@/config/types';

export function useGame() {
  const store = useGameStore();

  return {
    // State
    gameState: store.gameState,
    selectedSkillCard: store.selectedSkillCard,
    selectMode: store.selectMode,
    previewPosition: store.previewPosition,

    // Computed
    isPlaying: store.gameState?.phase === 'playing',
    currentPlayer: store.gameState?.currentPlayer,
    turn: store.gameState?.turn,
    winner: store.gameState?.winner,
    board: store.gameState?.board,
    history: store.gameState?.history,
    blockedZones: store.gameState?.blockedZones,
    remainingMoves: store.gameState?.remainingMoves,

    // Current player info
    currentPlayerState: store.gameState?.players[store.gameState.currentPlayer],

    // Actions
    startGame: (skillCards: { black: SkillCard[]; white: SkillCard[] }) => store.startGame(skillCards),
    resetGame: () => store.resetGame(),
    placeStone: (position: Position) => store.placeStone(position),
    useSkill: (skillCardId: string, targetPosition?: Position) => store.useSkill(skillCardId, targetPosition),
    selectSkillCard: (skillCardId: string | null) => store.selectSkillCard(skillCardId),
    setSelectMode: (mode: 'none' | 'blockZone' | 'place') => store.setSelectMode(mode),
    setPreviewPosition: (position: Position | null) => store.setPreviewPosition(position),
  };
}
