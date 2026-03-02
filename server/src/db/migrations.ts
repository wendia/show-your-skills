import Database from 'better-sqlite3';
import { getDatabase } from './index.js';

export function runMigrations(db?: Database.Database): void {
  const database = db || getDatabase();
  
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      email TEXT,
      avatar TEXT,
      bio TEXT,
      created_at INTEGER NOT NULL,
      last_login INTEGER,
      wins INTEGER DEFAULT 0,
      losses INTEGER DEFAULT 0,
      draws INTEGER DEFAULT 0,
      rating INTEGER DEFAULT 1200
    );
    
    CREATE TABLE IF NOT EXISTS games (
      id TEXT PRIMARY KEY,
      black_player_id TEXT NOT NULL,
      white_player_id TEXT NOT NULL,
      winner TEXT,
      reason TEXT,
      skill_pool_id TEXT NOT NULL DEFAULT 'standard',
      theme_id TEXT NOT NULL DEFAULT 'default',
      skill_mode INTEGER DEFAULT 1,
      time_control INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      ended_at INTEGER,
      duration INTEGER,
      FOREIGN KEY (black_player_id) REFERENCES users(id),
      FOREIGN KEY (white_player_id) REFERENCES users(id)
    );
    
    CREATE TABLE IF NOT EXISTS moves (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id TEXT NOT NULL,
      move_number INTEGER NOT NULL,
      player TEXT NOT NULL,
      row INTEGER NOT NULL,
      col INTEGER NOT NULL,
      skill_used TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (game_id) REFERENCES games(id)
    );
    
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    
    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      created_at INTEGER NOT NULL,
      skill_pool_id TEXT NOT NULL DEFAULT 'standard',
      theme_id TEXT NOT NULL DEFAULT 'default',
      board_size INTEGER NOT NULL DEFAULT 15,
      skill_count_per_player INTEGER NOT NULL DEFAULT 3,
      enable_skills INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'waiting',
      current_players INTEGER NOT NULL DEFAULT 0
    );
    
    CREATE TABLE IF NOT EXISTS configs (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'string',
      updated_at INTEGER NOT NULL
    );
    
    CREATE INDEX IF NOT EXISTS idx_games_black_player ON games(black_player_id);
    CREATE INDEX IF NOT EXISTS idx_games_white_player ON games(white_player_id);
    CREATE INDEX IF NOT EXISTS idx_games_created_at ON games(created_at);
    CREATE INDEX IF NOT EXISTS idx_moves_game_id ON moves(game_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
  `);
  
  const insertDefaultConfigs = database.prepare(`
    INSERT OR IGNORE INTO configs (key, value, type, updated_at)
    VALUES 
      ('default_theme', 'default', 'string', strftime('%s', 'now')),
      ('default_skill_pool', 'standard', 'string', strftime('%s', 'now'))
  `);
  
  insertDefaultConfigs.run();
}
