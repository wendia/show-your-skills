import { v4 as uuidv4 } from 'uuid';
import WebSocket from 'ws';
import { skillPoolManager } from '../skills/core/SkillPoolManager.js';
import { Stone, GameState, SkillCard, Position } from '../skills/core/SkillRegistry.js';

export interface Player {
  id: string;
  username: string;
  socket: WebSocket;
  color: Stone;
  skillCards: SkillCard[];
}

export interface Room {
  id: string;
  createdAt: number;
  skillPoolId: string;
  themeId: string;
  boardSize: number;
  skillCountPerPlayer: number;
  enableSkills: boolean;
  status: 'waiting' | 'playing' | 'ended';
  players: Map<Stone, Player>;
  gameState: GameState | null;
}

class RoomManager {
  private rooms: Map<string, Room> = new Map();
  private playerRooms: Map<string, string> = new Map();

  createRoom(
    skillPoolId: string = 'standard',
    themeId: string = 'default',
    options?: {
      boardSize?: number;
      skillCountPerPlayer?: number;
      enableSkills?: boolean;
    }
  ): Room {
    const roomId = uuidv4();
    
    const room: Room = {
      id: roomId,
      createdAt: Date.now(),
      skillPoolId,
      themeId,
      boardSize: options?.boardSize || 15,
      skillCountPerPlayer: options?.skillCountPerPlayer || 3,
      enableSkills: options?.enableSkills !== false,
      status: 'waiting',
      players: new Map(),
      gameState: null,
    };

    this.rooms.set(roomId, room);
    return room;
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  joinRoom(roomId: string, player: Player): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    if (room.players.size >= 2) return false;

    const color: Stone = room.players.size === 0 ? 'black' : 'white';
    player.color = color;
    room.players.set(color, player);
    this.playerRooms.set(player.id, roomId);

    if (room.players.size === 2) {
      this.startGame(room);
    }

    return true;
  }

  leaveRoom(playerId: string): Room | undefined {
    const roomId = this.playerRooms.get(playerId);
    if (!roomId) return undefined;

    const room = this.rooms.get(roomId);
    if (!room) return undefined;

    for (const [color, player] of room.players) {
      if (player.id === playerId) {
        room.players.delete(color);
        this.playerRooms.delete(playerId);
        break;
      }
    }

    if (room.players.size === 0) {
      this.rooms.delete(roomId);
    }

    return room;
  }

  private startGame(room: Room): void {
    skillPoolManager.loadPool(room.skillPoolId);

    const blackCards = skillPoolManager.drawCards(room.skillCountPerPlayer);
    const whiteCards = skillPoolManager.drawCards(room.skillCountPerPlayer);

    const blackPlayer = room.players.get('black');
    const whitePlayer = room.players.get('white');

    if (blackPlayer) {
      blackPlayer.skillCards = blackCards;
    }
    if (whitePlayer) {
      whitePlayer.skillCards = whiteCards;
    }

    const gameState: GameState = {
      id: uuidv4(),
      board: Array(room.boardSize).fill(null).map(() => Array(room.boardSize).fill(null)),
      currentPlayer: 'black',
      phase: 'playing',
      players: {
        black: {
          id: blackPlayer?.id || '',
          username: blackPlayer?.username || 'Black',
          color: 'black',
          skillCards: blackCards,
        },
        white: {
          id: whitePlayer?.id || '',
          username: whitePlayer?.username || 'White',
          color: 'white',
          skillCards: whiteCards,
        },
      },
      history: [],
      turn: 1,
      remainingMoves: 1,
      blockedZones: [],
    };

    room.gameState = gameState;
    room.status = 'playing';

    const message = JSON.stringify({
      type: 'game_start',
      roomId: room.id,
      gameState,
    });

    room.players.forEach(player => {
      if (player.socket.readyState === WebSocket.OPEN) {
        player.socket.send(message);
      }
    });
  }

  getWaitingRooms(): Room[] {
    return Array.from(this.rooms.values()).filter(room => room.status === 'waiting');
  }

  getActiveRooms(): Room[] {
    return Array.from(this.rooms.values()).filter(room => room.status === 'playing');
  }

  getPlayerRoom(playerId: string): Room | undefined {
    const roomId = this.playerRooms.get(playerId);
    if (!roomId) return undefined;
    return this.rooms.get(roomId);
  }
}

export const roomManager = new RoomManager();
