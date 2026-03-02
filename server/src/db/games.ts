import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from './index.js';

export interface Game {
  id: string;
  black_player_id: string;
  white_player_id: string;
  winner?: string;
  reason?: string;
  skill_pool_id: string;
  theme_id: string;
  skill_mode: number;
  time_control: number;
  created_at: number;
  ended_at?: number;
  duration?: number;
}

export interface Move {
  id: number;
  game_id: string;
  move_number: number;
  player: string;
  row: number;
  col: number;
  skill_used?: string;
  created_at: number;
}

export function createGame(
  db: Database.Database,
  blackPlayerId: string,
  whitePlayerId: string,
  skillPoolId: string = 'standard',
  themeId: string = 'default'
): string {
  const id = uuidv4();
  const createdAt = Math.floor(Date.now() / 1000);
  
  const stmt = db.prepare(`
    INSERT INTO games (id, black_player_id, white_player_id, skill_pool_id, theme_id, skill_mode, time_control, created_at)
    VALUES (?, ?, ?, ?, ?, 1, 0, ?)
  `);
  
  stmt.run(id, blackPlayerId, whitePlayerId, skillPoolId, themeId, createdAt);
  
  return id;
}

export function saveMove(
  db: Database.Database,
  gameId: string,
  moveNumber: number,
  player: string,
  row: number,
  col: number,
  skillUsed?: string
): void {
  const createdAt = Math.floor(Date.now() / 1000);
  
  const stmt = db.prepare(`
    INSERT INTO moves (game_id, move_number, player, row, col, skill_used, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(gameId, moveNumber, player, row, col, skillUsed || null, createdAt);
}

export function endGame(
  db: Database.Database,
  gameId: string,
  winner: string,
  reason: string
): void {
  const endedAt = Math.floor(Date.now() / 1000);
  
  const game = getGame(db, gameId);
  const duration = game ? endedAt - game.created_at : 0;
  
  const stmt = db.prepare(`
    UPDATE games SET winner = ?, reason = ?, ended_at = ?, duration = ? WHERE id = ?
  `);
  
  stmt.run(winner, reason, endedAt, duration, gameId);
}

export function getGame(db: Database.Database, gameId: string): Game | null {
  const stmt = db.prepare('SELECT * FROM games WHERE id = ?');
  const row = stmt.get(gameId) as Game | undefined;
  return row || null;
}

export function getGameMoves(db: Database.Database, gameId: string): Move[] {
  const stmt = db.prepare('SELECT * FROM moves WHERE game_id = ? ORDER BY move_number');
  return stmt.all(gameId) as Move[];
}

export function getUserGames(
  db: Database.Database,
  userId: string,
  limit: number = 20,
  offset: number = 0
): Game[] {
  const stmt = db.prepare(`
    SELECT * FROM games
    WHERE black_player_id = ? OR white_player_id = ?
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `);
  
  return stmt.all(userId, userId, limit, offset) as Game[];
}

export function countUserGames(db: Database.Database, userId: string): number {
  const stmt = db.prepare(`
    SELECT COUNT(*) as count FROM games
    WHERE black_player_id = ? OR white_player_id = ?
  `);
  
  const row = stmt.get(userId, userId) as { count: number };
  return row.count;
}

export function getRecentGames(db: Database.Database, limit: number = 10): Game[] {
  const stmt = db.prepare(`
    SELECT * FROM games
    WHERE status = 'ended'
    ORDER BY ended_at DESC
    LIMIT ?
  `);
  
  return stmt.all(limit) as Game[];
}
