import { FastifyInstance } from 'fastify';
import { getDatabase } from '../db/index.js';
import * as users from '../db/users.js';
import * as sessions from '../db/sessions.js';

interface UpdateUserBody {
  email?: string;
  avatar?: string;
  bio?: string;
}

export async function setupUserRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.patch<{ Body: UpdateUserBody }>('/me', async (request, reply) => {
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

    const { email, avatar, bio } = request.body;

    const stmt = db.prepare(`
      UPDATE users 
      SET email = COALESCE(?, email),
          avatar = COALESCE(?, avatar),
          bio = COALESCE(?, bio)
      WHERE id = ?
    `);

    stmt.run(email || null, avatar || null, bio || null, session.user_id);

    const user = users.getUserById(db, session.user_id);

    return {
      success: true,
      data: {
        id: user?.id,
        username: user?.username,
        email: user?.email,
        avatar: user?.avatar,
        bio: user?.bio,
      }
    };
  });

  fastify.get('/me/stats', async (request, reply) => {
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
        ...stats,
        rank: rank > 0 ? rank : null,
      }
    };
  });
}
