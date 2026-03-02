import { GameState, Position, SkillCard } from '@/config/types';

type MessageType = 
  | 'connected'
  | 'ping'
  | 'pong'
  | 'find_game'
  | 'matching'
  | 'create_room'
  | 'room_created'
  | 'join_room'
  | 'room_joined'
  | 'game_start'
  | 'move'
  | 'state_update'
  | 'skill'
  | 'chat'
  | 'undo_request'
  | 'undo_accept'
  | 'undo_reject'
  | 'opponent_disconnected'
  | 'opponent_reconnected'
  | 'game_over'
  | 'error';

interface BaseMessage {
  type: MessageType;
}

interface ConnectedMessage extends BaseMessage {
  type: 'connected';
  playerId: string;
}

interface PongMessage extends BaseMessage {
  type: 'pong';
  timestamp: number;
}

interface RoomCreatedMessage extends BaseMessage {
  type: 'room_created';
  roomId: string;
  config: Record<string, unknown>;
}

interface StateUpdateMessage extends BaseMessage {
  type: 'state_update';
  gameState?: GameState;
  move?: { position: Position; timestamp: number };
  skill?: { skillCardId: string; targetPosition?: Position; timestamp: number };
}

interface ErrorMessage extends BaseMessage {
  type: 'error';
  code: string;
  message: string;
}

type WebSocketMessage = BaseMessage | ConnectedMessage | PongMessage | RoomCreatedMessage | StateUpdateMessage | ErrorMessage;

type MessageHandler = (message: WebSocketMessage) => void;

class GameWebSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: number | null = null;
  private handlers: Map<MessageType, Set<MessageHandler>> = new Map();
  private onConnectionChange?: (connected: boolean) => void;

  constructor(url: string) {
    this.url = url;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('[WebSocket] Connected');
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.onConnectionChange?.(true);
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data) as WebSocketMessage;
            this.handleMessage(message);
          } catch (error) {
            console.error('[WebSocket] Failed to parse message:', error);
          }
        };

        this.ws.onclose = () => {
          console.log('[WebSocket] Disconnected');
          this.stopHeartbeat();
          this.onConnectionChange?.(false);
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('[WebSocket] Error:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebSocket] Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      this.connect().catch(console.error);
    }, delay);
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = window.setInterval(() => {
      this.send({ type: 'ping' });
    }, 30000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    const handlers = this.handlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => handler(message));
    }

    if (message.type === 'pong') {
      // Heartbeat response
    }
  }

  on(type: MessageType, handler: MessageHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);

    return () => {
      this.handlers.get(type)?.delete(handler);
    };
  }

  send(message: Record<string, unknown>): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  findGame(preferences?: { timeControl?: number; skillMode?: boolean }): void {
    this.send({ type: 'find_game', preferences });
  }

  createRoom(config?: { skillPoolId?: string; themeId?: string }): void {
    this.send({ type: 'create_room', config });
  }

  joinRoom(roomId: string): void {
    this.send({ type: 'join_room', roomId });
  }

  move(position: Position): void {
    this.send({ type: 'move', position });
  }

  useSkill(skillCardId: string, targetPosition?: Position): void {
    this.send({ type: 'skill', skillCardId, targetPosition });
  }

  chat(message: string): void {
    this.send({ type: 'chat', message });
  }

  requestUndo(): void {
    this.send({ type: 'undo_request' });
  }

  acceptUndo(): void {
    this.send({ type: 'undo_accept' });
  }

  rejectUndo(): void {
    this.send({ type: 'undo_reject' });
  }

  resign(): void {
    this.send({ type: 'resign' });
  }

  setOnConnectionChange(callback: (connected: boolean) => void): void {
    this.onConnectionChange = callback;
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

export const gameWebSocket = new GameWebSocket(
  import.meta.env.VITE_WS_URL || 'ws://localhost:3001/ws'
);
