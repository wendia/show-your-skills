import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import Fastify from 'fastify';
import { setupAuthRoutes } from '../api/auth';
import { setupConfigRoutes } from '../api/config';
import Database from 'better-sqlite3';
import { runMigrations } from '../db/migrations';
import * as sessions from '../db/sessions';

describe('API Routes', () => {
  let app: ReturnType<typeof Fastify>;
  let db: Database.Database;

  beforeEach(async () => {
    db = new Database(':memory:');
    runMigrations(db);

    app = Fastify();
    
    // Mock getDatabase
    const originalGetDatabase = require('../db/index').getDatabase;
    require('../db/index').getDatabase = () => db;
    
    await app.register(setupAuthRoutes, { prefix: '/api/auth' });
    await app.register(setupConfigRoutes, { prefix: '/api/config' });
    
    require('../db/index').getDatabase = originalGetDatabase;
  });

  afterEach(async () => {
    await app.close();
    db.close();
  });

  describe('POST /api/auth/register', () => {
    test('should register a new user', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          username: 'testuser',
          password: 'password123',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.token).toBeDefined();
      expect(body.data.user.username).toBe('testuser');
    });

    test('should reject duplicate username', async () => {
      await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          username: 'testuser',
          password: 'password123',
        },
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          username: 'testuser',
          password: 'anotherpassword',
        },
      });

      expect(response.statusCode).toBe(409);
    });

    test('should validate username length', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          username: 'ab',
          password: 'password123',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    test('should validate password length', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          username: 'testuser',
          password: '12345',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    test('should login with correct credentials', async () => {
      await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          username: 'testuser',
          password: 'password123',
        },
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          username: 'testuser',
          password: 'password123',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.token).toBeDefined();
    });

    test('should reject wrong password', async () => {
      await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          username: 'testuser',
          password: 'password123',
        },
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          username: 'testuser',
          password: 'wrongpassword',
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/config/themes', () => {
    test('should return all themes', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/config/themes',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data.themes)).toBe(true);
    });
  });

  describe('GET /api/config/skillPools', () => {
    test('should return all skill pools', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/config/skillPools',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data.pools)).toBe(true);
    });
  });
});
