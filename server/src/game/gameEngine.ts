import { Stone, GameState, Position, skillRegistry } from '../skills/core/SkillRegistry.js';
import { Room, roomManager } from './roomManager.js';
import WebSocket from 'ws';

const WINNING_COUNT = 5;

const DIRECTIONS = [
  [0, 1],   // 水平
  [1, 0],   // 垂直
  [1, 1],   // 对角线
  [1, -1],  // 反对角线
];

class GameEngine {
  canPlaceStone(gameState: GameState, position: Position): boolean {
    if (gameState.phase !== 'playing') return false;

    if (position.row < 0 || position.row >= gameState.board.length) return false;
    if (position.col < 0 || position.col >= gameState.board[0].length) return false;

    if (gameState.board[position.row][position.col] !== null) return false;

    const isBlocked = gameState.blockedZones.some(zone => {
      const top = Math.max(0, zone.centerPosition.row - 1);
      const left = Math.max(0, zone.centerPosition.col - 1);
      const bottom = Math.min(gameState.board.length - 1, zone.centerPosition.row + 1);
      const right = Math.min(gameState.board[0].length - 1, zone.centerPosition.col + 1);

      return position.row >= top && position.row <= bottom &&
             position.col >= left && position.col <= right &&
             zone.expiresAfterTurn > gameState.turn;
    });

    return !isBlocked;
  }

  placeStone(room: Room, position: Position): GameState | null {
    const { gameState } = room;
    if (!gameState) return null;

    if (!this.canPlaceStone(gameState, position)) return null;

    const currentPlayer = gameState.currentPlayer;

    const newBoard = gameState.board.map(row => [...row]);
    newBoard[position.row][position.col] = currentPlayer;

    const newHistory = [
      ...gameState.history,
      {
        type: 'place' as const,
        position,
        player: currentPlayer,
      },
    ];

    const winner = this.checkWin(newBoard, position, currentPlayer);

    const newBlockedZones = gameState.blockedZones.filter(
      zone => zone.expiresAfterTurn > gameState.turn
    );

    const nextPlayer = gameState.currentPlayer === 'black' ? 'white' : 'black';
    const newRemainingMoves = gameState.remainingMoves - 1;

    const newGameState: GameState = {
      ...gameState,
      board: newBoard,
      history: newHistory,
      currentPlayer: newRemainingMoves > 0 ? currentPlayer : nextPlayer,
      turn: newRemainingMoves > 0 ? gameState.turn : gameState.turn + 1,
      remainingMoves: newRemainingMoves > 0 ? newRemainingMoves : 1,
      blockedZones: newBlockedZones,
      phase: winner ? 'ended' : 'playing',
      winner: winner || undefined,
    };

    room.gameState = newGameState;

    return newGameState;
  }

  useSkill(
    room: Room,
    playerId: string,
    skillCardId: string,
    targetPosition?: Position
  ): GameState | null {
    const { gameState } = room;
    if (!gameState) return null;

    const currentPlayerState = gameState.players[gameState.currentPlayer];
    if (currentPlayerState.id !== playerId) return null;

    const skillCard = currentPlayerState.skillCards.find(card => card.id === skillCardId);
    if (!skillCard || skillCard.used) return null;

    const context = {
      gameState,
      currentPlayer: {
        id: currentPlayerState.id,
        color: currentPlayerState.color,
      },
      targetPosition,
    };

    if (!skillRegistry.canUse(skillCard.skillId, context)) return null;

    const newGameState = skillRegistry.execute(skillCard.skillId, context);
    if (!newGameState) return null;

    const updatedSkillCards = currentPlayerState.skillCards.map(card =>
      card.id === skillCardId ? { ...card, used: true } : card
    );

    const finalGameState: GameState = {
      ...newGameState,
      players: {
        ...newGameState.players,
        [gameState.currentPlayer]: {
          ...currentPlayerState,
          skillCards: updatedSkillCards,
        },
      },
    };

    room.gameState = finalGameState;

    return finalGameState;
  }

  private checkWin(board: (Stone | null)[][], position: Position, player: Stone): Stone | null {
    for (const [dr, dc] of DIRECTIONS) {
      let count = 1;

      // 正向检查
      for (let i = 1; i < WINNING_COUNT; i++) {
        const r = position.row + dr * i;
        const c = position.col + dc * i;
        if (r < 0 || r >= board.length || c < 0 || c >= board[0].length) break;
        if (board[r][c] !== player) break;
        count++;
      }

      // 反向检查
      for (let i = 1; i < WINNING_COUNT; i++) {
        const r = position.row - dr * i;
        const c = position.col - dc * i;
        if (r < 0 || r >= board.length || c < 0 || c >= board[0].length) break;
        if (board[r][c] !== player) break;
        count++;
      }

      if (count >= WINNING_COUNT) {
        return player;
      }
    }

    return null;
  }

  broadcastState(room: Room, excludePlayerId?: string): void {
    if (!room.gameState) return;

    const message = JSON.stringify({
      type: 'state_update',
      gameState: room.gameState,
    });

    room.players.forEach(player => {
      if (player.id !== excludePlayerId && player.socket.readyState === WebSocket.OPEN) {
        player.socket.send(message);
      }
    });
  }

  endGame(room: Room, winner: Stone | 'draw', reason: string): void {
    if (!room.gameState) return;

    const finalState: GameState = {
      ...room.gameState,
      phase: 'ended',
      winner,
    };

    room.gameState = finalState;
    room.status = 'ended';

    const message = JSON.stringify({
      type: 'game_over',
      winner,
      reason,
      gameState: finalState,
    });

    room.players.forEach(player => {
      if (player.socket.readyState === WebSocket.OPEN) {
        player.socket.send(message);
      }
    });
  }
}

export const gameEngine = new GameEngine();
