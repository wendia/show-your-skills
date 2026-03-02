# Show Your Skills - Server Design Document

**Version**: 2.0
**Created**: 2026-02-24
**Updated**: 2026-02-24
**Architecture**: Lightweight WebSocket Server with Config System

---

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture Design](#2-architecture-design)
3. [Config System](#3-config-system)
4. [Workflow Design](#4-workflow-design)
5. [API Design](#5-api-design)
6. [Data Structure Design](#6-data-structure-design)
7. [Code Structure](#7-code-structure)
8. [Database Operations](#8-database-operations)
9. [Security Concerns](#9-security-concerns)
10. [Performance Assurance](#10-performance-assurance)
11. [Deployment](#11-deployment)

---

## 1. Overview

### 1.1 Goals

- **Lightweight**: Minimal dependencies, small memory footprint
- **Real-time**: Low latency WebSocket communication
- **Scalable**: Support 100+ concurrent games
- **Simple**: Easy to understand and maintain
- **Portable**: Single-file database, easy backup
- **Configurable**: 🆕 Support theme and skill pool configuration

### 1.2 Tech Stack

| Component | Technology | Reason |
|-----------|-----------|--------|
| **Runtime** | Node.js 22 | Already installed, fast, async |
| **Server** | Fastify | Lighter than Express, good WebSocket support |
| **WebSocket** | `ws` library | Minimal (45KB), fast, widely used |
| **Database** | SQLite | File-based, no server process, perfect for MVP |
| **ORM** | better-sqlite3 | Synchronous, fast, simple API |
| **Auth** | Session tokens | Stateless, simple, secure enough |

### 1.3 Key Features

- ✅ Real-time multiplayer gameplay
- ✅ Room-based matchmaking
- ✅ Authoritative server (anti-cheat)
- ✅ Reconnection support
- ✅ Game history
- ✅ Basic user accounts (optional)
- ✅ 🆕 Theme configuration API
- ✅ 🆕 Skill pool configuration API
- ✅ Spectator mode (future)

---

## 2. Architecture Design

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Browser)                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │  React App v2.0                                   │  │
│  │  - ThemeProvider                                  │  │
│  │  - ConfigManager                                  │  │
│  │  - SkillPoolManager                               │  │
│  │  - WebSocket Client                               │  │
│  │  - Local State (Zustand)                          │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                        ↕ WebSocket / REST
┌─────────────────────────────────────────────────────────┐
│              Server (Node.js + Fastify) v2.0             │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Config System 🆕                                  │  │
│  │  - Theme configs                                   │  │
│  │  - Skill pool configs                              │  │
│  │  - Dynamic loading                                 │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  WebSocket Handler                                 │  │
│  │  - Connection management                           │  │
│  │  - Message routing                                 │  │
│  │  - Authentication middleware                      │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Game Engine (Authoritative)                      │  │
│  │  - Room management                                 │  │
│  │  - Move validation                                 │  │
│  │  - Skill card execution (config-driven)           │  │
│  │  - Win detection                                   │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Data Layer                                        │  │
│  │  - SQLite database                                 │  │
│  │  - User accounts                                   │  │
│  │  - Game history                                    │  │
│  │  - Config storage 🆕                              │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

```
┌──────────┐                    ┌──────────┐
│  Client  │                    │  Server  │
│  Player  │                    │  Node.js │
└────┬─────┘                    └────┬─────┘
     │                               │
     │  1. Connect with config       │
     │─────────────────────────────>│
     │                               │
     │  2. Send config/theme request │
     │<─────────────────────────────│
     │                               │
     │  3. Join/Create Room          │
     │─────────────────────────────>│
     │                               │
     │  4. Room Created + ID         │
     │<─────────────────────────────│
     │                               │
     │  5. Player 2 Joins            │
     │<─────────────────────────────│
     │                               │
     │  6. Draw Skill Cards          │
     │  (from configured pool)       │
     │<─────────────────────────────│
     │                               │
     │  7. Game Start                │
     │<─────────────────────────────│
     │                               │
     │  8. Make Move                 │
     │─────────────────────────────>│
     │                               │
     │  9. Validate & Broadcast      │
     │<─────────────────────────────│
     │                               │
     │  10. Use Skill Card           │
     │─────────────────────────────>│
     │                               │
     │  11. Execute & Broadcast      │
     │<─────────────────────────────│
     │                               │
     │  12. Game Over                │
     │<─────────────────────────────│
```

---

## 3. Config System

### 3.1 Server Config Architecture

```
server/
├── src/
│   ├── config/                    # 🆕 配置系统
│   │   ├── index.ts              # 配置管理器
│   │   ├── types.ts              # 配置类型
│   │   │
│   │   ├── themes/               # 主题配置
│   │   │   ├── default.json
│   │   │   ├── magic.json
│   │   │   └── tech.json
│   │   │
│   │   └── skillPools/           # 技能池配置
│   │       ├── standard.json
│   │       ├── chaos.json
│   │       └── tactical.json
│   │
│   ├── skills/                   # 技能系统
│   │   ├── core/
│   │   │   ├── SkillRegistry.ts
│   │   │   └── SkillPoolManager.ts
│   │   └── effects/
│   │       ├── flipStones.ts
│   │       └── undoMove.ts
│   │
│   └── api/
│       ├── config.ts             # 🆕 配置API
│       ├── themes.ts             # 🆕 主题API
│       └── skillPools.ts         # 🆕 技能池API
```

### 3.2 Config Types

```typescript
// server/src/config/types.ts

export interface ServerConfig {
  // 服务器配置
  server: {
    port: number;
    host: string;
    corsOrigins: string[];
  };

  // 游戏配置
  game: {
    defaultBoardSize: number;
    defaultSkillCountPerPlayer: number;
    defaultSkillPoolId: string;
    defaultThemeId: string;
  };

  // 数据库配置
  database: {
    path: string;
    walMode: boolean;
  };

  // WebSocket配置
  websocket: {
    heartbeatInterval: number;
    heartbeatTimeout: number;
    maxConnections: number;
  };
}

export interface ThemeConfig {
  id: string;
  name: string;
  version: string;
  rarity: {
    common: RarityStyle;
    rare: RarityStyle;
    epic: RarityStyle;
    legendary: RarityStyle;
  };
  card: CardStyle;
  board: BoardStyle;
  animations: AnimationConfig;
  sounds: SoundConfig;
}

export interface SkillPoolConfig {
  id: string;
  name: string;
  description: string;
  skills: SkillDefinition[];
  distribution: DistributionConfig;
  weights?: Record<string, number>;
}

export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  type: 'instant' | 'target' | 'passive';
  priority: number;
  effectId: string;
  conditions: SkillCondition[];
  params: Record<string, any>;
}
```

### 3.3 Config Manager

```typescript
// server/src/config/index.ts

import { ThemeConfig, SkillPoolConfig, ServerConfig } from './types';
import * as fs from 'fs';
import * as path from 'path';

class ConfigManager {
  private serverConfig: ServerConfig;
  private themes: Map<string, ThemeConfig> = new Map();
  private skillPools: Map<string, SkillPoolConfig> = new Map();

  constructor() {
    this.serverConfig = this.loadServerConfig();
    this.loadThemes();
    this.loadSkillPools();
  }

  // 加载服务器配置
  private loadServerConfig(): ServerConfig {
    return {
      server: {
        port: parseInt(process.env.PORT || '3001'),
        host: process.env.HOST || '0.0.0.0',
        corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['*'],
      },
      game: {
        defaultBoardSize: 15,
        defaultSkillCountPerPlayer: 3,
        defaultSkillPoolId: 'standard',
        defaultThemeId: 'default',
      },
      database: {
        path: process.env.DB_PATH || './game.db',
        walMode: true,
      },
      websocket: {
        heartbeatInterval: 30000,
        heartbeatTimeout: 60000,
        maxConnections: 1000,
      },
    };
  }

  // 加载所有主题
  private loadThemes(): void {
    const themesDir = path.join(__dirname, 'themes');

    if (!fs.existsSync(themesDir)) return;

    const files = fs.readdirSync(themesDir).filter(f => f.endsWith('.json'));

    for (const file of files) {
      const filePath = path.join(themesDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const theme: ThemeConfig = JSON.parse(content);
      this.themes.set(theme.id, theme);
    }
  }

  // 加载所有技能池
  private loadSkillPools(): void {
    const poolsDir = path.join(__dirname, 'skillPools');

    if (!fs.existsSync(poolsDir)) return;

    const files = fs.readdirSync(poolsDir).filter(f => f.endsWith('.json'));

    for (const file of files) {
      const filePath = path.join(poolsDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const pool: SkillPoolConfig = JSON.parse(content);
      this.skillPools.set(pool.id, pool);
    }
  }

  // 获取服务器配置
  getServerConfig(): ServerConfig {
    return this.serverConfig;
  }

  // 获取所有主题
  getAllThemes(): ThemeConfig[] {
    return Array.from(this.themes.values());
  }

  // 获取主题
  getTheme(id: string): ThemeConfig | undefined {
    return this.themes.get(id);
  }

  // 获取所有技能池
  getAllSkillPools(): SkillPoolConfig[] {
    return Array.from(this.skillPools.values());
  }

  // 获取技能池
  getSkillPool(id: string): SkillPoolConfig | undefined {
    return this.skillPools.get(id);
  }

  // 重新加载配置
  reload(): void {
    this.loadThemes();
    this.loadSkillPools();
  }
}

export const configManager = new ConfigManager();
```

---

## 4. Workflow Design

### 4.1 Config Request Flow

```
┌──────────┐                    ┌──────────┐
│  Client  │                    │  Server  │
└────┬─────┘                    └────┬─────┘
     │                               │
     │  GET /api/config/themes       │
     │─────────────────────────────>│
     │                               │
     │  [theme1, theme2, ...]        │
     │<─────────────────────────────│
     │                               │
     │  GET /api/config/skillPools   │
     │─────────────────────────────>│
     │                               │
     │  [pool1, pool2, ...]          │
     │<─────────────────────────────│
     │                               │
     │  GET /api/config/theme/:id    │
     │─────────────────────────────>│
     │                               │
     │  { theme config }             │
     │<─────────────────────────────│
     │                               │
     │  GET /api/config/pool/:id     │
     │─────────────────────────────>│
     │                               │
     │  { pool config }              │
     │<─────────────────────────────│
```

### 4.2 Game Creation with Config

```
┌──────────┐                    ┌──────────┐
│  Client  │                    │  Server  │
└────┬─────┘                    └────┬─────┘
     │                               │
     │  Create Room                  │
     │  {                            │
     │    skillPoolId: 'chaos',      │
     │    themeId: 'magic'           │
     │  }                            │
     │─────────────────────────────>│
     │                               │
     │  Load skill pool              │
     │  Load theme                   │
     │  Draw skill cards             │
     │                               │
     │  Room Created                 │
     │  {                            │
     │    roomId: 'xxx',             │
     │    skillCards: [...],         │
     │    themeId: 'magic'           │
     │  }                            │
     │<─────────────────────────────│
```

---

## 5. API Design

### 5.1 REST API - Config Endpoints

#### Get All Themes

```http
GET /api/config/themes
```

**Response**:
```json
{
  "success": true,
  "data": {
    "themes": [
      {
        "id": "default",
        "name": "默认主题",
        "version": "1.0.0"
      },
      {
        "id": "magic",
        "name": "魔法世界",
        "version": "1.0.0"
      }
    ]
  }
}
```

#### Get Theme by ID

```http
GET /api/config/themes/:id
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "magic",
    "name": "魔法世界",
    "rarity": {
      "common": { "gradient": "from-slate-600 to-slate-700" },
      "rare": { "gradient": "from-blue-600 to-cyan-600" },
      "epic": { "gradient": "from-purple-600 to-pink-600" },
      "legendary": { "gradient": "from-amber-500 to-orange-600" }
    },
    "card": {
      "borderRadius": 16,
      "shadowGlow": true
    }
  }
}
```

#### Get All Skill Pools

```http
GET /api/config/skillPools
```

**Response**:
```json
{
  "success": true,
  "data": {
    "pools": [
      {
        "id": "standard",
        "name": "标准技能池",
        "description": "平衡的标准技能组合",
        "skillCount": 5
      },
      {
        "id": "chaos",
        "name": "混乱模式",
        "description": "高随机性的混乱技能池",
        "skillCount": 3
      }
    ]
  }
}
```

#### Get Skill Pool by ID

```http
GET /api/config/skillPools/:id
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "standard",
    "name": "标准技能池",
    "skills": [
      {
        "id": "reverse_chaos",
        "name": "倒转乾坤",
        "rarity": "legendary"
      }
    ],
    "distribution": {
      "method": "balanced",
      "countPerPlayer": 3
    }
  }
}
```

### 5.2 WebSocket API - Config Messages

#### Create Room with Config

**Client → Server**:
```json
{
  "type": "create_room",
  "config": {
    "skillPoolId": "chaos",
    "themeId": "magic",
    "enableSkills": true,
    "skillCountPerPlayer": 5
  }
}
```

**Server → Client**:
```json
{
  "type": "room_created",
  "roomId": "room_abc123",
  "config": {
    "skillPoolId": "chaos",
    "themeId": "magic"
  }
}
```

---

## 6. Data Structure Design

### 6.1 Database Schema

#### Configs Table (New)

```sql
CREATE TABLE IF NOT EXISTS configs (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'json',
  updated_at INTEGER NOT NULL
);

-- Default values
INSERT INTO configs (key, value, type, updated_at) VALUES
  ('default_theme', 'default', 'string', strftime('%s', 'now')),
  ('default_skill_pool', 'standard', 'string', strftime('%s', 'now'));
```

#### Rooms Table (Enhanced)

```sql
CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  
  -- Config fields
  skill_pool_id TEXT NOT NULL DEFAULT 'standard',
  theme_id TEXT NOT NULL DEFAULT 'default',
  
  -- Game config
  board_size INTEGER NOT NULL DEFAULT 15,
  skill_count_per_player INTEGER NOT NULL DEFAULT 3,
  enable_skills INTEGER NOT NULL DEFAULT 1,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'waiting',
  current_players INTEGER NOT NULL DEFAULT 0
);
```

### 6.2 TypeScript Interfaces

```typescript
// Room with config
interface Room {
  id: string;
  createdAt: number;

  // Config
  skillPoolId: string;
  themeId: string;
  boardSize: number;
  skillCountPerPlayer: number;
  enableSkills: boolean;

  // State
  status: 'waiting' | 'playing' | 'ended';
  currentPlayers: number;
  players: Map<string, Player>;
  gameState?: GameState;
}

// Player with skill cards
interface Player {
  id: string;
  username: string;
  color: 'black' | 'white';
  skillCards: SkillCard[];
}

// Skill card from pool
interface SkillCard {
  id: string;
  skillId: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  used: boolean;
}
```

---

## 7. Code Structure

### 7.1 Server Directory Structure

```
server/
├── src/
│   ├── index.ts                 # Entry point
│   ├── config/                  # 🆕 Config system
│   │   ├── index.ts
│   │   ├── types.ts
│   │   ├── themes/
│   │   │   ├── default.json
│   │   │   ├── magic.json
│   │   │   └── tech.json
│   │   └── skillPools/
│   │       ├── standard.json
│   │       ├── chaos.json
│   │       └── tactical.json
│   │
│   ├── api/                     # REST API
│   │   ├── index.ts
│   │   ├── auth.ts
│   │   ├── games.ts
│   │   ├── leaderboard.ts
│   │   ├── config.ts            # 🆕 Config API
│   │   └── themes.ts            # 🆕 Themes API
│   │
│   ├── websocket/               # WebSocket
│   │   ├── index.ts
│   │   ├── connection.ts
│   │   └── messageHandler.ts
│   │
│   ├── game/                    # Game logic
│   │   ├── roomManager.ts
│   │   ├── matchmaking.ts
│   │   └── gameEngine.ts
│   │
│   ├── skills/                  # 🆕 Skill system
│   │   ├── core/
│   │   │   ├── SkillRegistry.ts
│   │   │   └── SkillPoolManager.ts
│   │   └── effects/
│   │       ├── flipStones.ts
│   │       ├── undoMove.ts
│   │       ├── placeStone.ts
│   │       ├── blockZone.ts
│   │       └── doubleMove.ts
│   │
│   ├── db/                      # Database
│   │   ├── index.ts
│   │   ├── migrations.ts
│   │   ├── users.ts
│   │   ├── games.ts
│   │   └── sessions.ts
│   │
│   ├── middleware/              # Middleware
│   │   ├── auth.ts
│   │   └── rateLimit.ts
│   │
│   └── utils/                   # Utilities
│       ├── logger.ts
│       ├── validator.ts
│       └── crypto.ts
│
├── package.json
├── tsconfig.json
└── .env
```

---

## 8. Database Operations

### 8.1 Config Operations

```typescript
// server/src/db/configs.ts

export function getConfig(key: string): string | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT value FROM configs WHERE key = ?');
  const row = stmt.get(key);
  return row ? row.value : null;
}

export function setConfig(key: string, value: string): void {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO configs (key, value, type, updated_at)
    VALUES (?, ?, 'string', ?)
    ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = ?
  `);
  stmt.run(key, value, Date.now(), value, Date.now());
}
```

---

## 9. Security Concerns

### 9.1 Config Validation

```typescript
// Validate theme config
export function validateThemeConfig(config: any): boolean {
  if (!config.id || !config.name) return false;
  if (!config.rarity || !config.card) return false;
  return true;
}

// Validate skill pool config
export function validateSkillPoolConfig(config: any): boolean {
  if (!config.id || !config.name) return false;
  if (!Array.isArray(config.skills)) return false;
  if (!config.distribution) return false;
  return true;
}
```

---

## 10. Performance Assurance

### 10.1 Config Caching

```typescript
class ConfigManager {
  private themeCache: Map<string, ThemeConfig> = new Map();
  private poolCache: Map<string, SkillPoolConfig> = new Map();
  private cacheExpiry: number = 60000; // 1 minute
  private lastLoad: number = 0;

  getTheme(id: string): ThemeConfig | undefined {
    if (Date.now() - this.lastLoad > this.cacheExpiry) {
      this.reload();
    }
    return this.themeCache.get(id);
  }
}
```

---

## 11. Deployment

### 11.1 Config Files Deployment

```bash
# Copy config files
cp -r src/config/themes /var/www/show-your-skills/server/config/
cp -r src/config/skillPools /var/www/show-your-skills/server/config/

# Set permissions
chmod 644 /var/www/show-your-skills/server/config/**/*.json
```

### 11.2 Environment Variables

```bash
# .env
DEFAULT_THEME=default
DEFAULT_SKILL_POOL=standard
CONFIG_CACHE_TTL=60000
```

---

## 12. Summary

### 12.1 v2.0 Changes

| Feature | v1.0 | v2.0 |
|---------|------|------|
| Theme System | ❌ | ✅ |
| Skill Pool System | ❌ | ✅ |
| Config API | ❌ | ✅ |
| Config-driven Skills | ❌ | ✅ |
| Dynamic Config Loading | ❌ | ✅ |

### 12.2 Benefits

- ✅ **Flexibility**: Change themes/pools without code changes
- ✅ **Extensibility**: Add new themes/pools via config
- ✅ **Maintainability**: Config-driven, easy to update
- ✅ **Performance**: Cached configs, fast loading

---

**Document Updated**: 2026-02-24
**Next Steps**: Implement config system and API endpoints
