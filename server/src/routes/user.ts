import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getStats } from '../controllers/authController';

const router = Router();

// 获取用户战绩
router.get('/stats', authenticate, getStats);

// 获取游戏历史
router.get('/games', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const prisma = require('../db/prisma').default;
    
    const games = await prisma.game.findMany({
      where: {
        OR: [
          { blackPlayerId: userId },
          { whitePlayerId: userId },
        ],
      },
      orderBy: { startedAt: 'desc' },
      take: 20,
    });
    
    res.json({ games });
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

export default router;
