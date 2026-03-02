import { FastifyInstance } from 'fastify';
import { getDatabase } from '../db/index.js';
import * as users from '../db/users.js';
import * as sessions from '../db/sessions.js';

interface RegisterBody {
  username: string;
  password: string;
}

interface LoginBody {
  username: string;
  password: string;
}

export async function setupAuthRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post<{ Body: RegisterBody }>('/register', async (request, reply) => {
    const { username, password } = request.body;

    if (!username || !password) {
      return reply.status(400).send({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Username and password are required' }
      });
    }

    if (username.length < 3 || username.length > 20) {
      return reply.status(400).send({
        success: false,
        error: { code: 'INVALID_USERNAME', message: 'Username must be 3-20 characters' }
      });
    }

    if (password.length < 6) {
      return reply.status(400).send({
        success: false,
        error: { code: 'INVALID_PASSWORD', message: 'Password must be at least 6 characters' }
      });
    }

    const db = getDatabase();

    const existingUser = users.getUserByUsername(db, username);
    if (existingUser) {
      return reply.status(409).send({
        success: false,
        error: { code: 'USERNAME_EXISTS', message: 'Username already exists' }
      });
    }

    const user = users.createUser(db, username, password);
    const token = sessions.createSession(db, user.id);

    return {
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          createdAt: user.created_at,
        }
      }
    };
  });

  fastify.post<{ Body: LoginBody }>('/login', async (request, reply) => {
    const { username, password } = request.body;

    if (!username || !password) {
      return reply.status(400).send({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Username and password are required' }
      });
    }

    const db = getDatabase();
    const user = users.getUserByUsername(db, username);

    if (!user || !users.verifyPassword(user, password)) {
      return reply.status(401).send({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid username or password' }
      });
    }

    users.updateLastLogin(db, user.id);
    const token = sessions.createSession(db, user.id);

    return {
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          stats: {
            wins: user.wins,
            losses: user.losses,
            draws: user.draws,
            rating: user.rating,
          }
        }
      }
    };
  });

  fastify.post('/logout', async (request, reply) => {
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'No token provided' }
      });
    }

    const token = authHeader.substring(7);
    const db = getDatabase();
    sessions.deleteSession(db, token);

    return { success: true, message: 'Logged out' };
  });

  fastify.get('/me', async (request, reply) => {
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

    const user = users.getUserById(db, session.user_id);
    if (!user) {
      return reply.status(404).send({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' }
      });
    }

    return {
      success: true,
      data: {
        id: user.id,
        username: user.username,
        stats: {
          wins: user.wins,
          losses: user.losses,
          draws: user.draws,
          rating: user.rating,
        }
      }
    };
  });
}
