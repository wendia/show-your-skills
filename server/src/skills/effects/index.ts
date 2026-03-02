import { skillRegistry } from '../core/SkillRegistry.js';
import { SkillEffect, SkillContext, Stone } from '../core/SkillRegistry.js';

function getAllStones(board: (Stone | null)[][]): Array<{ row: number; col: number }> {
  const stones: Array<{ row: number; col: number }> = [];
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      if (board[row][col] !== null) {
        stones.push({ row, col });
      }
    }
  }
  return stones;
}

function flipStoneColor(color: Stone): Stone {
  return color === 'black' ? 'white' : 'black';
}

const flipStonesEffect: SkillEffect = {
  id: 'flipStones',
  execute(context: SkillContext, params: Record<string, unknown>) {
    const { gameState } = context;
    const flipPercent = (params.flipPercent as number) || 30;

    const stones = getAllStones(gameState.board);
    if (stones.length === 0) return null;

    const flipCount = Math.max(1, Math.floor(stones.length * flipPercent / 100));
    const shuffled = [...stones].sort(() => Math.random() - 0.5);
    const toFlip = shuffled.slice(0, flipCount);

    const newBoard = gameState.board.map(row => [...row]);

    for (const pos of toFlip) {
      const currentColor = newBoard[pos.row][pos.col];
      if (currentColor !== null) {
        newBoard[pos.row][pos.col] = flipStoneColor(currentColor);
      }
    }

    return { ...gameState, board: newBoard };
  }
};

const undoMoveEffect: SkillEffect = {
  id: 'undoMove',
  execute(context: SkillContext) {
    const { gameState } = context;
    const history = gameState.history;

    if (history.length === 0) return null;

    let lastPlaceIndex = history.length - 1;
    while (lastPlaceIndex >= 0 && history[lastPlaceIndex].type !== 'place') {
      lastPlaceIndex--;
    }

    if (lastPlaceIndex < 0) return null;

    const lastAction = history[lastPlaceIndex];
    const position = lastAction.position;
    if (!position) return null;

    const newBoard = gameState.board.map(row => [...row]);
    newBoard[position.row][position.col] = null;

    const newHistory = history.slice(0, lastPlaceIndex);

    return {
      ...gameState,
      board: newBoard,
      history: newHistory,
      currentPlayer: lastAction.player,
      turn: gameState.turn - 1,
    };
  }
};

const placeStoneEffect: SkillEffect = {
  id: 'placeStone',
  execute(context: SkillContext) {
    const { gameState, currentPlayer, targetPosition } = context;

    if (!targetPosition) return null;
    if (gameState.board[targetPosition.row][targetPosition.col] !== null) return null;

    const newBoard = gameState.board.map(row => [...row]);
    newBoard[targetPosition.row][targetPosition.col] = currentPlayer.color;

    const newHistory = [
      ...gameState.history,
      { type: 'place' as const, position: targetPosition, player: currentPlayer.color },
    ];

    const nextPlayer = gameState.currentPlayer === 'black' ? 'white' : 'black';

    return {
      ...gameState,
      board: newBoard,
      history: newHistory,
      currentPlayer: nextPlayer,
      turn: gameState.turn + 1,
    };
  }
};

const blockZoneEffect: SkillEffect = {
  id: 'blockZone',
  execute(context: SkillContext, params: Record<string, unknown>) {
    const { gameState, currentPlayer, targetPosition } = context;
    const centerPos = targetPosition || { row: 7, col: 7 };

    const newBlock = {
      centerPosition: centerPos,
      expiresAfterTurn: gameState.turn + 2,
      blockedBy: currentPlayer.color,
    };

    return { ...gameState, blockedZones: [...gameState.blockedZones, newBlock] };
  }
};

const doubleMoveEffect: SkillEffect = {
  id: 'doubleMove',
  execute(context: SkillContext) {
    const { gameState } = context;
    if (gameState.phase !== 'playing') return null;
    if (gameState.remainingMoves !== 1) return null;
    return { ...gameState, remainingMoves: 2 };
  }
};

export function registerAllEffects(): void {
  skillRegistry.registerEffect(flipStonesEffect);
  skillRegistry.registerEffect(undoMoveEffect);
  skillRegistry.registerEffect(placeStoneEffect);
  skillRegistry.registerEffect(blockZoneEffect);
  skillRegistry.registerEffect(doubleMoveEffect);
}
