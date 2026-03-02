import { FastifyInstance } from 'fastify';
import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { roomManager, Player } from '../game/roomManager.js';
import { matchmaking } from '../game/matchmaking.js';
import { gameEngine } from '../game/gameEngine.js';
import * as sessions from '../db/sessions.js';
import { getDatabase } from '../db/index.js';

interface ClientConnection {
  socket: WebSocket;
  playerId: string;
  username: string;
  lastHeartbeat: number;
  token?: string;
}

interface Position {
  row: number;
  col: number;
}

interface BaseMessage {
  type: string;
}

interface FindGameMessage extends BaseMessage {
  type: 'find_game';
  preferences?: {
    timeControl?: number;
    skillMode?: boolean;
    skillPoolId?: string;
  };
}

interface CreateRoomMessage extends BaseMessage {
  type: 'create_room';
  config?: {
    skillPoolId?: string;
    themeId?: string;
    skillCountPerPlayer?: number;
    enableSkills?: boolean;
  };
}

interface JoinRoomMessage extends BaseMessage {
  type: 'join_room';
  roomId: string;
}

interface MoveMessage extends BaseMessage {
  type: 'move';
  position: Position;
}

interface SkillMessage extends BaseMessage {
  type: 'skill';
  skillCardId: string;
  targetPosition?: Position;
}

interface ChatMessage extends BaseMessage {
  type: 'chat';
  message: string;
}

type WebSocketMessage = FindGameMessage | CreateRoomMessage | JoinRoomMessage | MoveMessage | SkillMessage | ChatMessage | BaseMessage;

const connections = new Map<WebSocket, ClientConnection>();

export async function setupWebSocket(fastify: FastifyInstance): Promise<void> {
  fastify.register(async function (fastify) {
    fastify.get('/ws', { websocket: true }, (connection, req) => {
      const socket = connection.socket;
      const query = req.query as Record<string, string>;
      
      const clientId = uuidv4();
      let username = `Guest-${clientId.substring(0, 8)}`;
      const token = query.token;

      if (token) {
        const db = getDatabase();
        const session = sessions.getSession(db, token);
        if (session) {
          username = session.user_id;
        }
      }
      
      const clientConnection: ClientConnection = {
        socket,
        playerId: clientId,
        username,
        lastHeartbeat: Date.now(),
        token,
      };
      
      connections.set(socket, clientConnection);
      
      socket.send(JSON.stringify({
        type: 'connected',
        playerId: clientId,
      }));

      socket.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString()) as WebSocketMessage;
          handleMessage(socket, clientConnection, message);
        } catch {
          socket.send(JSON.stringify({
            type: 'error',
            code: 'INVALID_MESSAGE',
            message: 'Invalid message format',
          }));
        }
      });

      socket.on('close', () => {
        const conn = connections.get(socket);
        if (conn) {
          matchmaking.cancelFind(conn.playerId);
          roomManager.leaveRoom(conn.playerId);
        }
        connections.delete(socket);
      });

      socket.on('pong', () => {
        const conn = connections.get(socket);
        if (conn) {
          conn.lastHeartbeat = Date.now();
        }
      });
    });
  });

  setInterval(() => {
    matchmaking.cleanExpired();
  }, 30000);
}

function handleMessage(socket: WebSocket, conn: ClientConnection, message: WebSocketMessage) {
  switch (message.type) {
    case 'ping':
      socket.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
      break;

    case 'find_game': {
      const msg = message as FindGameMessage;
      matchmaking.findGame(
        socket,
        conn.playerId,
        conn.username,
        msg.preferences || {}
      );
      break;
    }

    case 'cancel_find':
      matchmaking.cancelFind(conn.playerId);
      socket.send(JSON.stringify({ type: 'find_cancelled' }));
      break;

    case 'create_room': {
      const msg = message as CreateRoomMessage;
      handleCreateRoom(socket, conn, msg);
      break;
    }

    case 'join_room': {
      const msg = message as JoinRoomMessage;
      handleJoinRoom(socket, conn, msg);
      break;
    }

    case 'leave_room':
      handleLeaveRoom(socket, conn);
      break;

    case 'move': {
      const msg = message as MoveMessage;
      handleMove(socket, conn, msg);
      break;
    }

    case 'skill': {
      const msg = message as SkillMessage;
      handleSkill(socket, conn, msg);
      break;
    }

    case 'chat': {
      const msg = message as ChatMessage;
      handleChat(socket, conn, msg);
      break;
    }

    case 'resign':
      handleResign(socket, conn);
      break;

    default:
      socket.send(JSON.stringify({
        type: 'error',
        code: 'UNKNOWN_MESSAGE',
        message: `Unknown message type: ${message.type}`,
      }));
  }
}

function handleCreateRoom(socket: WebSocket, conn: ClientConnection, message: CreateRoomMessage) {
  const config = message.config || {};
  const room = roomManager.createRoom(
    config.skillPoolId || 'standard',
    config.themeId || 'default',
    {
      skillCountPerPlayer: config.skillCountPerPlayer || 3,
      enableSkills: config.enableSkills !== false,
    }
  );

  const player: Player = {
    id: conn.playerId,
    username: conn.username,
    socket,
    color: 'black',
    skillCards: [],
  };

  roomManager.joinRoom(room.id, player);

  socket.send(JSON.stringify({
    type: 'room_created',
    roomId: room.id,
    config: {
      skillPoolId: room.skillPoolId,
      themeId: room.themeId,
    },
  }));
}

function handleJoinRoom(socket: WebSocket, conn: ClientConnection, message: JoinRoomMessage) {
  const { roomId } = message;
  
  if (!roomId) {
    socket.send(JSON.stringify({
      type: 'error',
      code: 'INVALID_ROOM',
      message: 'Room ID is required',
    }));
    return;
  }

  const room = roomManager.getRoom(roomId);
  if (!room) {
    socket.send(JSON.stringify({
      type: 'error',
      code: 'ROOM_NOT_FOUND',
      message: 'Room not found',
    }));
    return;
  }

  const player: Player = {
    id: conn.playerId,
    username: conn.username,
    socket,
    color: 'white',
    skillCards: [],
  };

  const success = roomManager.joinRoom(roomId, player);

  if (!success) {
    socket.send(JSON.stringify({
      type: 'error',
      code: 'ROOM_FULL',
      message: 'Room is full',
    }));
    return;
  }

  socket.send(JSON.stringify({
    type: 'room_joined',
    roomId,
    color: player.color,
  }));
}

function handleLeaveRoom(socket: WebSocket, conn: ClientConnection) {
  const room = roomManager.leaveRoom(conn.playerId);

  if (room) {
    socket.send(JSON.stringify({
      type: 'room_left',
      roomId: room.id,
    }));
  }
}

function handleMove(socket: WebSocket, conn: ClientConnection, message: MoveMessage) {
  const { position } = message;
  
  if (!position) {
    socket.send(JSON.stringify({
      type: 'error',
      code: 'INVALID_MOVE',
      message: 'Position is required',
    }));
    return;
  }

  const room = roomManager.getPlayerRoom(conn.playerId);
  if (!room || !room.gameState) {
    socket.send(JSON.stringify({
      type: 'error',
      code: 'NOT_IN_GAME',
      message: 'Not in a game',
    }));
    return;
  }

  const newGameState = gameEngine.placeStone(room, position);

  if (!newGameState) {
    socket.send(JSON.stringify({
      type: 'error',
      code: 'INVALID_MOVE',
      message: 'Invalid move',
    }));
    return;
  }

  gameEngine.broadcastState(room);
}

function handleSkill(socket: WebSocket, conn: ClientConnection, message: SkillMessage) {
  const { skillCardId, targetPosition } = message;
  
  if (!skillCardId) {
    socket.send(JSON.stringify({
      type: 'error',
      code: 'INVALID_SKILL',
      message: 'Skill card ID is required',
    }));
    return;
  }

  const room = roomManager.getPlayerRoom(conn.playerId);
  if (!room || !room.gameState) {
    socket.send(JSON.stringify({
      type: 'error',
      code: 'NOT_IN_GAME',
      message: 'Not in a game',
    }));
    return;
  }

  const newGameState = gameEngine.useSkill(
    room,
    conn.playerId,
    skillCardId,
    targetPosition
  );

  if (!newGameState) {
    socket.send(JSON.stringify({
      type: 'error',
      code: 'SKILL_FAILED',
      message: 'Failed to use skill',
    }));
    return;
  }

  gameEngine.broadcastState(room);
}

function handleChat(socket: WebSocket, conn: ClientConnection, message: ChatMessage) {
  const chatMessage = message.message;
  
  if (!chatMessage) {
    socket.send(JSON.stringify({
      type: 'error',
      code: 'INVALID_MESSAGE',
      message: 'Message is required',
    }));
    return;
  }

  const room = roomManager.getPlayerRoom(conn.playerId);
  if (!room) return;

  const chatData = JSON.stringify({
    type: 'chat',
    sender: {
      id: conn.playerId,
      username: conn.username,
    },
    message: chatMessage,
    timestamp: Date.now(),
  });

  room.players.forEach(player => {
    if (player.socket.readyState === WebSocket.OPEN) {
      player.socket.send(chatData);
    }
  });
}

function handleResign(socket: WebSocket, conn: ClientConnection) {
  const room = roomManager.getPlayerRoom(conn.playerId);
  if (!room || !room.gameState) {
    socket.send(JSON.stringify({
      type: 'error',
      code: 'NOT_IN_GAME',
      message: 'Not in a game',
    }));
    return;
  }

  const player = room.players.get('black')?.id === conn.playerId ? 'black' : 'white';
  const winner = player === 'black' ? 'white' : 'black';

  gameEngine.endGame(room, winner, 'resign');
}
