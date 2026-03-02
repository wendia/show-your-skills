import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { configManager } from '../config/index.js';

function createTestUsers(db: Database.Database): void {
  const users = [
    { username: 'admin', password: 'admin123', email: 'admin@example.com' },
    { username: 'player1', password: 'player123', email: 'player1@example.com' },
    { username: 'player2', password: 'player123', email: 'player2@example.com' },
    { username: 'guest', password: 'guest123', email: null },
  ];

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO users (id, username, password_hash, email, created_at, wins, losses, draws, rating)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const user of users) {
    const id = uuidv4();
    const passwordHash = bcrypt.hashSync(user.password, 10);
    const createdAt = Math.floor(Date.now() / 1000);
    const wins = Math.floor(Math.random() * 50);
    const losses = Math.floor(Math.random() * 30);
    const draws = Math.floor(Math.random() * 10);
    const rating = 1200 + Math.floor(Math.random() * 400) - 200;

    stmt.run(id, user.username, passwordHash, user.email, createdAt, wins, losses, draws, rating);
  }

  console.log('✅ Test users created');
}

function createTestGames(db: Database.Database): void {
  const users = db.prepare('SELECT id FROM users LIMIT 4').all() as Array<{ id: string }>;
  if (users.length < 2) {
    console.log('⚠️ Not enough users for test games');
    return;
  }

  const gameStmt = db.prepare(`
    INSERT INTO games (id, black_player_id, white_player_id, winner, reason, skill_pool_id, theme_id, created_at, ended_at, duration)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const moveStmt = db.prepare(`
    INSERT INTO moves (game_id, move_number, player, row, col, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (let i = 0; i < 10; i++) {
    const blackPlayer = users[Math.floor(Math.random() * users.length)];
    let whitePlayer = users[Math.floor(Math.random() * users.length)];
    while (whitePlayer.id === blackPlayer.id) {
      whitePlayer = users[Math.floor(Math.random() * users.length)];
    }

    const gameId = uuidv4();
    const winner = Math.random() > 0.5 ? 'black' : (Math.random() > 0.5 ? 'white' : 'draw');
    const reason = winner === 'draw' ? 'agreement' : 'five_in_a_row';
    const createdAt = Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 86400 * 7);
    const duration = Math.floor(Math.random() * 600) + 60;

    gameStmt.run(
      gameId,
      blackPlayer.id,
      whitePlayer.id,
      winner === 'draw' ? null : winner,
      reason,
      'standard',
      'default',
      createdAt,
      createdAt + duration,
      duration
    );

    // Create some moves
    const moveCount = Math.floor(Math.random() * 30) + 10;
    for (let m = 0; m < moveCount; m++) {
      const player = m % 2 === 0 ? 'black' : 'white';
      const row = Math.floor(Math.random() * 15);
      const col = Math.floor(Math.random() * 15);
      moveStmt.run(gameId, m + 1, player, row, col, createdAt + Math.floor(m * 5));
    }
  }

  console.log('✅ Test games created');
}

export function runSeeds(db: Database.Database): void {
  console.log('🌱 Running database seeds...');
  
  createTestUsers(db);
  createTestGames(db);
  
  console.log('✅ Database seeding completed');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const config = configManager.getServerConfig();
  const db = new Database(config.database.path);
  runSeeds(db);
  db.close();
}
