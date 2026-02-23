/**
 * Socket.io 服务
 */

import { io, Socket } from 'socket.io-client';

const SERVER_URL = 'http://localhost:3001';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string): Promise<Socket> {
    return new Promise((resolve, reject) => {
      this.socket = io(SERVER_URL, {
        auth: { token },
      });

      this.socket.on('connect', () => {
        console.log('Socket 连接成功');
        this.socket?.emit('authenticate', token);
      });

      this.socket.on('authenticated', (data: any) => {
        if (data.success) {
          resolve(this.socket!);
        } else {
          reject(new Error(data.error));
        }
      });

      this.socket.on('connect_error', (error) => {
        reject(error);
      });
    });
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // 匹配对战
  findMatch() {
    this.socket?.emit('find_match');
  }

  cancelMatch() {
    this.socket?.emit('cancel_match');
  }

  // 游戏操作
  placeStone(roomId: string, position: { row: number; col: number }) {
    this.socket?.emit('place_stone', { roomId, position });
  }

  useSkill(roomId: string, skillCardId: string, targetPosition?: { row: number; col: number }) {
    this.socket?.emit('use_skill', { roomId, skillCardId, targetPosition });
  }

  // 聊天
  sendMessage(roomId: string, message: string) {
    this.socket?.emit('chat', { roomId, message });
  }

  // 事件监听
  onMatchFound(callback: (data: any) => void) {
    this.socket?.on('match_found', callback);
  }

  onWaiting(callback: (data: any) => void) {
    this.socket?.on('waiting', callback);
  }

  onGameUpdate(callback: (data: any) => void) {
    this.socket?.on('game_update', callback);
  }

  onGameEnd(callback: (data: any) => void) {
    this.socket?.on('game_end', callback);
  }

  onChat(callback: (data: any) => void) {
    this.socket?.on('chat', callback);
  }

  onError(callback: (data: any) => void) {
    this.socket?.on('error', callback);
  }

  // 移除监听
  off(event: string) {
    this.socket?.off(event);
  }
}

export const socketService = new SocketService();
