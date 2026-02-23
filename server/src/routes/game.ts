import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { gameActionValidation, placeStoneValidation, useSkillValidation, chatValidation } from '../middleware/validator';
import { gameLimiter, chatLimiter, apiLimiter } from '../middleware/rateLimit';
import prisma from '../db/prisma';

const router = Router();

// 应用 API 限制
router.use(apiLimiter);

// 获取游戏历史
router.get('/history', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    
    const [games, total] = await Promise.all([
      prisma.game.findMany({
        where: {
          OR: [
            { blackPlayerId: userId },
            { whitePlayerId: userId },
          ],
        },
        orderBy: { startedAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.game.count({
        where: {
          OR: [
            { blackPlayerId: userId },
            { whitePlayerId: userId },
          ],
        },
      }),
    ]);
    
    res.json({
      games,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('获取游戏历史错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取游戏详情
router.get('/:id', authenticate, gameActionValidation, async (req, res) => {
  try {
    const { id } = req.params;
    
    const game = await prisma.game.findUnique({
      where: { id },
      include: {
        blackPlayer: { select: { id: true, username: true } },
        whitePlayer: { select: { id: true, username: true } },
      },
    });
    
    if (!game) {
      return res.status(404).json({ error: '游戏不存在' });
    }
    
    res.json({ game });
  } catch (error) {
    console.error('获取游戏详情错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取房间列表
router.get('/rooms', authenticate, async (req, res) => {
  try {
    const sessions = await prisma.gameSession.findMany({
      where: { status: 'waiting' },
      take: 20,
    });
    
    res.json({ rooms: sessions });
  } catch (error) {
    res.json({ rooms: [] });
  }
});

// 获取排行榜
router.get('/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
    const users = await prisma.user.findMany({
      take: limit,
      orderBy: {
        gamesAsBlack: { _count: 'desc' },
      },
      include: {
        _count: {
          select: {
            gamesAsBlack: true,
            gamesAsWhite: true,
          },
        },
      },
    });
    
    const leaderboard = users.map(user => ({
      id: user.id,
      username: user.username,
      gamesPlayed: user._count.gamesAsBlack + user._count.gamesAsWhite,
    }));
    
    res.json({ leaderboard });
  } catch (error) {
    res.json({ leaderboard: [] });
  }
});

export default router;
