import { Server, Socket } from 'socket.io';
import { users } from '../controllers/authController';

// 游戏房间
interface GameRoom {
  id: string;
  players: { id: string; username: string; color: 'black' | 'white' }[];
  gameState: any;
  status: 'waiting' | 'playing' | 'ended';
}

const rooms: Map<string, GameRoom> = new Map();
const waitingQueue: { id: string; username: string }[] = [];

export const setupSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`用户连接: ${socket.id}`);

    // 用户认证
    socket.on('authenticate', (token: string) => {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
        const user = users.get(decoded.userId);
        
        if (user) {
          (socket as any).userId = user.id;
          (socket as any).username = user.username;
          socket.emit('authenticated', { success: true, user: { id: user.id, username: user.username } });
        } else {
          socket.emit('authenticated', { success: false, error: '用户不存在' });
        }
      } catch (error) {
        socket.emit('authenticated', { success: false, error: '认证失败' });
      }
    });

    // 匹配对战
    socket.on('find_match', () => {
      const userId = (socket as any).userId;
      const username = (socket as any).username;

      if (!userId) {
        socket.emit('error', { message: '请先登录' });
        return;
      }

      console.log(`${username} 正在寻找对手...`);

      // 检查等待队列
      if (waitingQueue.length > 0) {
        const opponent = waitingQueue.shift()!;
        
        // 创建房间
        const roomId = `room_${Date.now()}`;
        const room: GameRoom = {
          id: roomId,
          players: [
            { id: opponent.id, username: opponent.username, color: 'black' },
            { id: userId, username: username, color: 'white' },
          ],
          gameState: createInitialGameState(),
          status: 'playing',
        };
        
        rooms.set(roomId, room);
        
        // 加入房间
        socket.join(roomId);
        socket.to(opponent.id).emit('match_found', { roomId, room });
        socket.emit('match_found', { roomId, room });
        
        console.log(`匹配成功: ${opponent.username} vs ${username}`);
      } else {
        // 加入等待队列
        waitingQueue.push({ id: socket.id, username });
        socket.emit('waiting', { message: '正在等待对手...' });
      }
    });

    // 取消匹配
    socket.on('cancel_match', () => {
      const index = waitingQueue.findIndex(p => p.id === socket.id);
      if (index !== -1) {
        waitingQueue.splice(index, 1);
        socket.emit('match_cancelled');
      }
    });

    // 加入房间
    socket.on('join_room', (roomId: string) => {
      const room = rooms.get(roomId);
      if (room) {
        socket.join(roomId);
        socket.emit('room_joined', { room });
      } else {
        socket.emit('error', { message: '房间不存在' });
      }
    });

    // 落子
    socket.on('place_stone', (data: { roomId: string; position: { row: number; col: number } }) => {
      const { roomId, position } = data;
      const room = rooms.get(roomId);
      const userId = (socket as any).userId;

      if (!room || room.status !== 'playing') {
        socket.emit('error', { message: '游戏未进行中' });
        return;
      }

      // 验证是否轮到该玩家
      const currentPlayer = room.players.find(p => p.color === room.gameState.currentPlayer);
      if (currentPlayer?.id !== userId) {
        socket.emit('error', { message: '不是你的回合' });
        return;
      }

      // 执行落子（简化版本）
      const result = placeStone(room.gameState, position);
      if (result) {
        room.gameState = result;
        
        // 广播给房间内所有人
        io.to(roomId).emit('game_update', { gameState: room.gameState });
        
        // 检查胜利
        if (result.winner) {
          room.status = 'ended';
          io.to(roomId).emit('game_end', { winner: result.winner });
        }
      } else {
        socket.emit('error', { message: '无效的落子' });
      }
    });

    // 使用技能
    socket.on('use_skill', (data: { roomId: string; skillCardId: string; targetPosition?: { row: number; col: number } }) => {
      const { roomId, skillCardId, targetPosition } = data;
      const room = rooms.get(roomId);

      if (!room || room.status !== 'playing') {
        socket.emit('error', { message: '游戏未进行中' });
        return;
      }

      // 广播技能使用
      io.to(roomId).emit('skill_used', { 
        playerId: (socket as any).userId,
        skillCardId,
        targetPosition 
      });
    });

    // 聊天消息
    socket.on('chat', (data: { roomId: string; message: string }) => {
      const { roomId, message } = data;
      const username = (socket as any).username || '未知用户';
      
      io.to(roomId).emit('chat', { 
        username, 
        message, 
        timestamp: Date.now() 
      });
    });

    // 断开连接
    socket.on('disconnect', () => {
      console.log(`用户断开连接: ${socket.id}`);
      
      // 从等待队列移除
      const index = waitingQueue.findIndex(p => p.id === socket.id);
      if (index !== -1) {
        waitingQueue.splice(index, 1);
      }
    });
  });
};

// 创建初始游戏状态
function createInitialGameState() {
  return {
    boardSize: 15,
    board: Array(15).fill(null).map(() => Array(15).fill(null)),
    currentPlayer: 'black',
    phase: 'playing',
    winner: null,
    turn: 1,
    blockedZones: [],
    remainingMoves: 1,
    history: [],
  };
}

// 落子逻辑
function placeStone(gameState: any, position: { row: number; col: number }) {
  if (gameState.board[position.row][position.col] !== null) {
    return null;
  }

  const newBoard = gameState.board.map((row: any[]) => [...row]);
  newBoard[position.row][position.col] = gameState.currentPlayer;

  const winner = checkWinner(newBoard, position, gameState.currentPlayer);

  return {
    ...gameState,
    board: newBoard,
    currentPlayer: winner ? gameState.currentPlayer : (gameState.currentPlayer === 'black' ? 'white' : 'black'),
    turn: gameState.turn + 1,
    phase: winner ? 'ended' : 'playing',
    winner,
  };
}

// 检查胜利
function checkWinner(board: any[][], position: { row: number; col: number }, color: string) {
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];

  for (const [dr, dc] of directions) {
    let count = 1;

    for (let i = 1; i < 5; i++) {
      const r = position.row + dr * i;
      const c = position.col + dc * i;
      if (r < 0 || r >= 15 || c < 0 || c >= 15) break;
      if (board[r][c] === color) count++;
      else break;
    }

    for (let i = 1; i < 5; i++) {
      const r = position.row - dr * i;
      const c = position.col - dc * i;
      if (r < 0 || r >= 15 || c < 0 || c >= 15) break;
      if (board[r][c] === color) count++;
      else break;
    }

    if (count >= 5) return color;
  }

  return null;
}
