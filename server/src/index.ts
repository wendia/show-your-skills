import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import { configManager } from './config/index.js';
import { getDatabase, closeDatabase } from './db/index.js';
import { runMigrations } from './db/migrations.js';
import { setupAPI } from './api/index.js';
import { setupWebSocket } from './websocket/index.js';

const config = configManager.getServerConfig();

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.LOG_FORMAT === 'pretty' ? {
      target: 'pino-pretty',
      options: { colorize: true }
    } : undefined,
  },
});

await fastify.register(websocket);

await setupAPI(fastify);
await setupWebSocket(fastify);

fastify.addHook('onClose', async () => {
  closeDatabase();
});

const start = async () => {
  try {
    const db = getDatabase();
    runMigrations(db);
    fastify.log.info('Database initialized');

    await fastify.listen({
      port: config.server.port,
      host: config.server.host,
    });

    fastify.log.info(`Server running on http://${config.server.host}:${config.server.port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
