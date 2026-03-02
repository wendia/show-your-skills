import { describe, test, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations } from '../db/migrations.js';
import * as users from '../db/users.js';
import * as sessions from '../db/sessions.js';
import * as games from '../db/games.js';

describe('Database Operations', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(':memory:');
    runMigrations(db);
  });

  describe('Users', () => {
    test('should create a user', () => {
      const user = users.createUser(db, 'testuser', 'password123');
      
      expect(user).toBeDefined();
      expect(user.username).toBe('testuser');
      expect(user.id).toBeDefined();
      expect(user.rating).toBe(1200);
    });

    test('should not allow duplicate usernames', () => {
      users.createUser(db, 'testuser', 'password123');
      
      expect(() => {
        users.createUser(db, 'testuser', 'anotherpassword');
      }).toThrow();
    });

    test('should get user by username', () => {
      users.createUser(db, 'testuser', 'password123');
      
      const user = users.getUserByUsername(db, 'testuser');
      
      expect(user).toBeDefined();
      expect(user?.username).toBe('testuser');
    });

    test('should return null for non-existent user', () => {
      const user = users.getUserByUsername(db, 'nonexistent');
      expect(user).toBeNull();
    });

    test('should verify password correctly', () => {
      const user = users.createUser(db, 'testuser', 'password123');
      
      expect(users.verifyPassword(user, 'password123')).toBe(true);
      expect(users.verifyPassword(user, 'wrongpassword')).toBe(false);
    });

    test('should update user stats', () => {
      const user = users.createUser(db, 'testuser', 'password123');
      
      users.updateUserStats(db, user.id, 'win');
      users.updateUserStats(db, user.id, 'win');
      users.updateUserStats(db, user.id, 'loss');
      
      const updatedUser = users.getUserById(db, user.id);
      
      expect(updatedUser?.wins).toBe(2);
      expect(updatedUser?.losses).toBe(1);
    });

    test('should get user stats', () => {
      const user = users.createUser(db, 'testuser', 'password123');
      
      users.updateUserStats(db, user.id, 'win');
      users.updateUserStats(db, user.id, 'win');
      users.updateUserStats(db, user.id, 'loss');
      
      const stats = users.getUserStats(db, user.id);
      
      expect(stats).toBeDefined();
      expect(stats?.wins).toBe(2);
      expect(stats?.losses).toBe(1);
      expect(stats?.totalGames).toBe(3);
      expect(stats?.winRate).toBeCloseTo(66.67, 1);
    });

    test('should get leaderboard', () => {
      const user1 = users.createUser(db, 'user1', 'pass');
      const user2 = users.createUser(db, 'user2', 'pass');
      const user3 = users.createUser(db, 'user3', 'pass');
      
      users.updateUserRating(db, user1.id, 100);
      users.updateUserRating(db, user2.id, 200);
      users.updateUserRating(db, user3.id, 50);
      
      const leaderboard = users.getLeaderboard(db, 10);
      
      expect(leaderboard).toHaveLength(3);
      expect(leaderboard[0].userId).toBe(user2.id);
      expect(leaderboard[1].userId).toBe(user1.id);
      expect(leaderboard[2].userId).toBe(user3.id);
    });
  });

  describe('Sessions', () => {
    test('should create a session', () => {
      const user = users.createUser(db, 'testuser', 'password123');
      const token = sessions.createSession(db, user.id);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    test('should get a valid session', () => {
      const user = users.createUser(db, 'testuser', 'password123');
      const token = sessions.createSession(db, user.id);
      
      const session = sessions.getSession(db, token);
      
      expect(session).toBeDefined();
      expect(session?.user_id).toBe(user.id);
    });

    test('should return null for invalid token', () => {
      const session = sessions.getSession(db, 'invalid-token');
      expect(session).toBeNull();
    });

    test('should delete a session', () => {
      const user = users.createUser(db, 'testuser', 'password123');
      const token = sessions.createSession(db, user.id);
      
      sessions.deleteSession(db, token);
      
      const session = sessions.getSession(db, token);
      expect(session).toBeNull();
    });
  });

  describe('Games', () => {
    let user1: users.User;
    let user2: users.User;

    beforeEach(() => {
      user1 = users.createUser(db, 'player1', 'pass');
      user2 = users.createUser(db, 'player2', 'pass');
    });

    test('should create a game', () => {
      const gameId = games.createGame(db, user1.id, user2.id);
      
      expect(gameId).toBeDefined();
      
      const game = games.getGame(db, gameId);
      expect(game).toBeDefined();
      expect(game?.black_player_id).toBe(user1.id);
      expect(game?.white_player_id).toBe(user2.id);
    });

    test('should save moves', () => {
      const gameId = games.createGame(db, user1.id, user2.id);
      
      games.saveMove(db, gameId, 1, 'black', 7, 7);
      games.saveMove(db, gameId, 2, 'white', 7, 8);
      
      const moves = games.getGameMoves(db, gameId);
      
      expect(moves).toHaveLength(2);
      expect(moves[0].player).toBe('black');
      expect(moves[1].player).toBe('white');
    });

    test('should end a game', () => {
      const gameId = games.createGame(db, user1.id, user2.id);
      
      games.endGame(db, gameId, 'black', 'five_in_a_row');
      
      const game = games.getGame(db, gameId);
      
      expect(game?.winner).toBe('black');
      expect(game?.reason).toBe('five_in_a_row');
      expect(game?.ended_at).toBeDefined();
    });

    test('should get user games', () => {
      games.createGame(db, user1.id, user2.id);
      games.createGame(db, user1.id, user2.id);
      games.createGame(db, user2.id, user1.id);
      
      const userGames = games.getUserGames(db, user1.id);
      
      expect(userGames).toHaveLength(3);
    });
  });
});
