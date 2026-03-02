import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from './index.js';

export interface Session {
  token: string;
  user_id: string;
  created_at: number;
  expires_at: number;
}

const SESSION_DURATION = 7 * 24 * 60 * 60;

export function createSession(db: Database.Database, userId: string): string {
  const token = uuidv4();
  const createdAt = Math.floor(Date.now() / 1000);
  const expiresAt = createdAt + SESSION_DURATION;
  
  const stmt = db.prepare(`
    INSERT INTO sessions (token, user_id, created_at, expires_at)
    VALUES (?, ?, ?, ?)
  `);
  
  stmt.run(token, userId, createdAt, expiresAt);
  
  return token;
}

export function getSession(db: Database.Database, token: string): Session | null {
  cleanExpiredSessions(db);
  
  const stmt = db.prepare('SELECT * FROM sessions WHERE token = ?');
  const row = stmt.get(token) as Session | undefined;
  return row || null;
}

export function deleteSession(db: Database.Database, token: string): void {
  const stmt = db.prepare('DELETE FROM sessions WHERE token = ?');
  stmt.run(token);
}

export function deleteSessionsByUserId(db: Database.Database, userId: string): void {
  const stmt = db.prepare('DELETE FROM sessions WHERE user_id = ?');
  stmt.run(userId);
}

export function cleanExpiredSessions(db: Database.Database): void {
  const now = Math.floor(Date.now() / 1000);
  const stmt = db.prepare('DELETE FROM sessions WHERE expires_at < ?');
  stmt.run(now);
}

export function extendSession(db: Database.Database, token: string): boolean {
  const session = getSession(db, token);
  if (!session) return false;
  
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION;
  const stmt = db.prepare('UPDATE sessions SET expires_at = ? WHERE token = ?');
  stmt.run(expiresAt, token);
  
  return true;
}
