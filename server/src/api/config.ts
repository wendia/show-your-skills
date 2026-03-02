import { FastifyInstance } from 'fastify';
import { configManager } from '../config/index.js';

export async function setupConfigRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/themes', async () => {
    const themes = configManager.getAllThemes();
    
    return {
      success: true,
      data: {
        themes: themes.map(t => ({
          id: t.id,
          name: t.name,
          version: t.version,
        })),
      },
    };
  });

  fastify.get<{ Params: { id: string } }>('/themes/:id', async (request, reply) => {
    const { id } = request.params;
    const theme = configManager.getTheme(id);

    if (!theme) {
      return reply.status(404).send({
        success: false,
        error: { code: 'THEME_NOT_FOUND', message: 'Theme not found' }
      });
    }

    return {
      success: true,
      data: theme,
    };
  });

  fastify.get('/skillPools', async () => {
    const pools = configManager.getAllSkillPools();
    
    return {
      success: true,
      data: {
        pools: pools.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          skillCount: p.skills.length,
        })),
      },
    };
  });

  fastify.get<{ Params: { id: string } }>('/skillPools/:id', async (request, reply) => {
    const { id } = request.params;
    const pool = configManager.getSkillPool(id);

    if (!pool) {
      return reply.status(404).send({
        success: false,
        error: { code: 'SKILL_POOL_NOT_FOUND', message: 'Skill pool not found' }
      });
    }

    return {
      success: true,
      data: {
        id: pool.id,
        name: pool.name,
        description: pool.description,
        skills: pool.skills.map(s => ({
          id: s.id,
          name: s.name,
          rarity: s.rarity,
        })),
        distribution: pool.distribution,
      },
    };
  });
}
