import Database from 'better-sqlite3';
import { configManager } from '../config/index.js';

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    const config = configManager.getServerConfig();
    db = new Database(config.database.path);
    
    if (config.database.walMode) {
      db.pragma('journal_mode = WAL');
    }
  }
  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
