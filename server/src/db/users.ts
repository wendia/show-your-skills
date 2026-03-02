import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from './index.js';

export interface User {
  id: string;
  username: string;
  password_hash: string;
  email?: string;
  avatar?: string;
  bio?: string;
  created_at: number;
  last_login?: number;
  wins: number;
  losses: number;
  draws: number;
  rating: number;
}

export interface UserStats {
  wins: number;
  losses: number;
  draws: number;
  rating: number;
  winRate: number;
  totalGames: number;
}

export function createUser(db: Database.Database, username: string, password: string): User {
  const id = uuidv4();
  const passwordHash = bcrypt.hashSync(password, 10);
  const createdAt = Math.floor(Date.now() / 1000);
  
  const stmt = db.prepare(`
    INSERT INTO users (id, username, password_hash, created_at, wins, losses, draws, rating)
    VALUES (?, ?, ?, ?, 0, 0, 0, 1200)
  `);
  
  stmt.run(id, username, passwordHash, createdAt);
  
  return {
    id,
    username,
    password_hash: passwordHash,
    created_at: createdAt,
    wins: 0,
    losses: 0,
    draws: 0,
    rating: 1200,
  };
}

export function getUserByUsername(db: Database.Database, username: string): User | null {
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
  const row = stmt.get(username) as User | undefined;
  return row || null;
}

export function getUserById(db: Database.Database, id: string): User | null {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  const row = stmt.get(id) as User | undefined;
  return row || null;
}

export function verifyPassword(user: User, password: string): boolean {
  return bcrypt.compareSync(password, user.password_hash);
}

export function updateUserStats(
  db: Database.Database,
  userId: string,
  result: 'win' | 'loss' | 'draw'
): void {
  const field = result === 'win' ? 'wins' : result === 'loss' ? 'losses' : 'draws';
  const stmt = db.prepare(`
    UPDATE users SET ${field} = ${field} + 1 WHERE id = ?
  `);
  stmt.run(userId);
}

export function updateUserRating(
  db: Database.Database,
  userId: string,
  ratingDelta: number
): void {
  const stmt = db.prepare(`
    UPDATE users SET rating = rating + ? WHERE id = ?
  `);
  stmt.run(ratingDelta, userId);
}

export function getUserStats(db: Database.Database, userId: string): UserStats | null {
  const user = getUserById(db, userId);
  if (!user) return null;
  
  const totalGames = user.wins + user.losses + user.draws;
  const winRate = totalGames > 0 ? (user.wins / totalGames) * 100 : 0;
  
  return {
    wins: user.wins,
    losses: user.losses,
    draws: user.draws,
    rating: user.rating,
    winRate: Math.round(winRate * 100) / 100,
    totalGames,
  };
}

export function getLeaderboard(db: Database.Database, limit: number = 100): Array<{
  rank: number;
  userId: string;
  username: string;
  rating: number;
  wins: number;
  losses: number;
  winRate: number;
}> {
  const stmt = db.prepare(`
    SELECT id, username, rating, wins, losses, draws
    FROM users
    ORDER BY rating DESC
    LIMIT ?
  `);
  
  const rows = stmt.all(limit) as Array<{
    id: string;
    username: string;
    rating: number;
    wins: number;
    losses: number;
    draws: number;
  }>;
  
  return rows.map((row, index) => {
    const totalGames = row.wins + row.losses + row.draws;
    const winRate = totalGames > 0 ? (row.wins / totalGames) * 100 : 0;
    
    return {
      rank: index + 1,
      userId: row.id,
      username: row.username,
      rating: row.rating,
      wins: row.wins,
      losses: row.losses,
      winRate: Math.round(winRate * 100) / 100,
    };
  });
}

export function updateLastLogin(db: Database.Database, userId: string): void {
  const stmt = db.prepare('UPDATE users SET last_login = ? WHERE id = ?');
  stmt.run(Math.floor(Date.now() / 1000), userId);
}
