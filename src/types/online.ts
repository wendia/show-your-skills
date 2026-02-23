/**
 * 在线对战相关类型
 */

export interface User {
  id: string;
  username: string;
  email?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface OnlineGameState {
  roomId: string | null;
  players: { id: string; username: string; color: 'black' | 'white' }[];
  gameState: any;
  status: 'waiting' | 'matching' | 'playing' | 'ended';
  isMyTurn: boolean;
  myColor: 'black' | 'white' | null;
}

export interface ChatMessage {
  username: string;
  message: string;
  timestamp: number;
}
