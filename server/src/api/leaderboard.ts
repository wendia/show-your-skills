import { FastifyInstance } from 'fastify';
import { getDatabase } from '../db/index.js';
import * as users from '../db/users.js';
import * as sessions from '../db/sessions.js';

export async function setupLeaderboardRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/leaderboard', async (request) => {
    const query = request.query as { limit?: string };
    const limit = parseInt(query.limit || '100');

    const db = getDatabase();
    const leaderboard = users.getLeaderboard(db, limit);

    return {
      success: true,
      data: {
        leaderboard,
        updatedAt: Date.now(),
      },
    };
  });

  fastify.get('/leaderboard/me', async (request, reply) => {
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'No token provided' }
      });
    }

    const token = authHeader.substring(7);
    const db = getDatabase();
    const session = sessions.getSession(db, token);

    if (!session) {
      return reply.status(401).send({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' }
      });
    }

    const stats = users.getUserStats(db, session.user_id);
    if (!stats) {
      return reply.status(404).send({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' }
      });
    }

    const leaderboard = users.getLeaderboard(db, 1000);
    const rank = leaderboard.findIndex(p => p.userId === session.user_id) + 1;

    return {
      success: true,
      data: {
        rank: rank > 0 ? rank : null,
        stats,
      },
    };
  });
}
