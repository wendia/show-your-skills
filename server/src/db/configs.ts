import Database from 'better-sqlite3';

export interface Config {
  key: string;
  value: string;
  type: string;
  updated_at: number;
}

export function getConfig(db: Database.Database, key: string): string | null {
  const stmt = db.prepare('SELECT value FROM configs WHERE key = ?');
  const row = stmt.get(key) as { value: string } | undefined;
  return row ? row.value : null;
}

export function setConfig(db: Database.Database, key: string, value: string): void {
  const now = Math.floor(Date.now() / 1000);
  const stmt = db.prepare(`
    INSERT INTO configs (key, value, type, updated_at)
    VALUES (?, ?, 'string', ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `);
  stmt.run(key, value, now);
}

export function getAllConfigs(db: Database.Database): Record<string, string> {
  const stmt = db.prepare('SELECT key, value FROM configs');
  const rows = stmt.all() as Array<{ key: string; value: string }>;
  
  const result: Record<string, string> = {};
  for (const row of rows) {
    result[row.key] = row.value;
  }
  return result;
}

export function deleteConfig(db: Database.Database, key: string): void {
  const stmt = db.prepare('DELETE FROM configs WHERE key = ?');
  stmt.run(key);
}
