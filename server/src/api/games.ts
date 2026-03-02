import { FastifyInstance } from 'fastify';
import { getDatabase } from '../db/index.js';
import * as games from '../db/games.js';
import * as sessions from '../db/sessions.js';

export async function setupGameRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/', async (request) => {
    const query = request.query as { limit?: string; offset?: string };
    const limit = parseInt(query.limit || '20');
    const offset = parseInt(query.offset || '0');

    const authHeader = request.headers.authorization;
    let userId: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const db = getDatabase();
      const session = sessions.getSession(db, token);
      if (session) {
        userId = session.user_id;
      }
    }

    const db = getDatabase();
    const gameList = userId
      ? games.getUserGames(db, userId, limit, offset)
      : games.getRecentGames(db, limit);

    const total = userId ? games.countUserGames(db, userId) : gameList.length;

    return {
      success: true,
      data: {
        games: gameList,
        pagination: {
          limit,
          offset,
          total,
        },
      },
    };
  });

  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { id } = request.params;
    const db = getDatabase();

    const game = games.getGame(db, id);
    if (!game) {
      return reply.status(404).send({
        success: false,
        error: { code: 'GAME_NOT_FOUND', message: 'Game not found' }
      });
    }

    const moves = games.getGameMoves(db, id);

    return {
      success: true,
      data: {
        game,
        moves,
      },
    };
  });
}
