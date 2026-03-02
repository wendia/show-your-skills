import { roomManager, Player } from './roomManager.js';
import WebSocket from 'ws';

interface QueuedPlayer {
  player: Player;
  joinedAt: number;
  preferences: {
    timeControl?: number;
    skillMode?: boolean;
    skillPoolId?: string;
  };
}

class Matchmaking {
  private queue: QueuedPlayer[] = [];
  private matchTimeout: number = 60000;

  findGame(
    socket: WebSocket,
    playerId: string,
    username: string,
    preferences: {
      timeControl?: number;
      skillMode?: boolean;
      skillPoolId?: string;
    }
  ): void {
    const player: Player = {
      id: playerId,
      username,
      socket,
      color: 'black',
      skillCards: [],
    };

    const matchedPlayer = this.findMatch(player, preferences);

    if (matchedPlayer) {
      this.createMatch(player, matchedPlayer);
    } else {
      this.queue.push({
        player,
        joinedAt: Date.now(),
        preferences,
      });

      socket.send(JSON.stringify({
        type: 'matching',
        message: 'Looking for opponent...',
        queueSize: this.queue.length,
      }));
    }
  }

  private findMatch(player: Player, preferences: {
    timeControl?: number;
    skillMode?: boolean;
    skillPoolId?: string;
  }): QueuedPlayer | null {
    const now = Date.now();

    for (let i = 0; i < this.queue.length; i++) {
      const queued = this.queue[i];

      if (now - queued.joinedAt > this.matchTimeout) {
        this.queue.splice(i, 1);
        i--;
        continue;
      }

      if (queued.player.socket.readyState !== WebSocket.OPEN) {
        this.queue.splice(i, 1);
        i--;
        continue;
      }

      if (queued.player.id === player.id) {
        continue;
      }

      const sameSkillPool = !preferences.skillPoolId || 
        !queued.preferences.skillPoolId ||
        preferences.skillPoolId === queued.preferences.skillPoolId;

      if (sameSkillPool) {
        this.queue.splice(i, 1);
        return queued;
      }
    }

    return null;
  }

  private createMatch(player1: Player, queued: QueuedPlayer): void {
    const skillPoolId = queued.preferences.skillPoolId || 'standard';

    const room = roomManager.createRoom(skillPoolId, 'default', {
      enableSkills: queued.preferences.skillMode !== false,
    });

    roomManager.joinRoom(room.id, queued.player);
    roomManager.joinRoom(room.id, player1);

    const message = JSON.stringify({
      type: 'match_found',
      roomId: room.id,
    });

    if (queued.player.socket.readyState === WebSocket.OPEN) {
      queued.player.socket.send(message);
    }

    if (player1.socket.readyState === WebSocket.OPEN) {
      player1.socket.send(message);
    }
  }

  cancelFind(playerId: string): boolean {
    const index = this.queue.findIndex(q => q.player.id === playerId);
    if (index >= 0) {
      this.queue.splice(index, 1);
      return true;
    }
    return false;
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  cleanExpired(): void {
    const now = Date.now();
    this.queue = this.queue.filter(q => now - q.joinedAt <= this.matchTimeout);
  }
}

export const matchmaking = new Matchmaking();
