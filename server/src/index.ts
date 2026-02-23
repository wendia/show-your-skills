import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import gameRoutes from './routes/game';
import { setupSocket } from './socket';
import { generalLimiter, apiLimiter, chatLimiter } from './middleware/rateLimit';
import prisma from './db/prisma';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// ===== 中间件 =====

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// JSON 解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 全局请求限制
app.use(generalLimiter);

// 安全头
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// 请求日志
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// ===== 路由 =====

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/game', gameRoutes);

// 健康检查
app.get('/health', async (req, res) => {
  let dbStatus = 'disconnected';
  
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch (error) {
    console.log('数据库连接失败，使用内存存储');
  }
  
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: dbStatus,
    version: '1.0.0',
  });
});

// 根路径
app.get('/', (req, res) => {
  res.json({
    name: 'Skill Gomoku API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      user: '/api/user',
      game: '/api/game',
      health: '/health',
    },
  });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// 错误处理
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ===== Socket.io =====

// Socket.io 速率限制
const socketRateLimit = new Map<string, { count: number; resetTime: number }>();

io.use((socket, next) => {
  const ip = socket.handshake.address;
  const now = Date.now();
  const limit = socketRateLimit.get(ip) || { count: 0, resetTime: now + 60000 };
  
  if (now > limit.resetTime) {
    limit.count = 0;
    limit.resetTime = now + 60000;
  }
  
  limit.count++;
  socketRateLimit.set(ip, limit);
  
  if (limit.count > 100) {
    return next(new Error('请求过于频繁'));
  }
  
  next();
});

setupSocket(io);

// ===== 数据库连接 =====

async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✓ 数据库连接成功');
  } catch (error) {
    console.log('⚠ 数据库连接失败，将使用内存存储');
  }
}

// ===== 启动服务器 =====

const PORT = process.env.PORT || 3001;

async function start() {
  await connectDatabase();
  
  httpServer.listen(PORT, () => {
    console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
    console.log(`📝 API 文档: http://localhost:${PORT}/`);
    console.log(`💚 健康检查: http://localhost:${PORT}/health`);
  });
}

start().catch(console.error);

export { prisma, io };
