import { FastifyInstance } from 'fastify';
import { setupAuthRoutes } from './auth.js';
import { setupConfigRoutes } from './config.js';
import { setupGameRoutes } from './games.js';
import { setupLeaderboardRoutes } from './leaderboard.js';

export async function setupAPI(fastify: FastifyInstance): Promise<void> {
  await fastify.register(setupAuthRoutes, { prefix: '/api/auth' });
  await fastify.register(setupConfigRoutes, { prefix: '/api/config' });
  await fastify.register(setupGameRoutes, { prefix: '/api/games' });
  await fastify.register(setupLeaderboardRoutes, { prefix: '/api' });

  fastify.get('/api/health', async () => {
    return {
      status: 'ok',
      version: '1.0.0',
      uptime: process.uptime(),
      timestamp: Date.now(),
    };
  });

  fastify.get('/api/stats', async () => {
    return {
      online: {
        players: 0,
        games: 0,
      },
      server: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
      },
    };
  });
}
