# Show Your Skills - API 接口文档

**版本**: v1.0
**基础URL**: `http://localhost:3001`
**协议**: HTTP + WebSocket
**创建时间**: 2026-02-24

---

## 目录

1. [概述](#1-概述)
2. [认证](#2-认证)
3. [REST API](#3-rest-api)
4. [WebSocket API](#4-websocket-api)
5. [错误处理](#5-错误处理)
6. [数据结构](#6-数据结构)

---

## 1. 概述

### 1.1 API设计原则

- ✅ RESTful 风格
- ✅ JSON 数据格式
- ✅ HTTP 状态码
- ✅ 统一错误格式
- ✅ 版本控制（未来）

### 1.2 基础信息

**基础URL**:
```
Development: http://localhost:3001
Production: https://api.show-your-skills.com
```

**WebSocket URL**:
```
Development: ws://localhost:3001/ws
Production: wss://api.show-your-skills.com/ws
```

**内容类型**:
```
Content-Type: application/json
```

---

## 2. 认证

### 2.1 认证方式

**Bearer Token**:
```
Authorization: Bearer <token>
```

**获取Token**:
- 注册成功后自动获取
- 登录成功后获取
- Token有效期：7天

### 2.2 Token刷新

**自动刷新**:
- Token过期前1天内，登录接口会返回新Token
- WebSocket连接时可以刷新Token

**手动刷新**:
```http
POST /api/auth/refresh
Authorization: Bearer <old_token>

Response 200:
{
  "token": "new_token_here",
  "expiresAt": 1234567890
}
```

---

## 3. REST API

### 3.1 认证接口

#### 注册

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "player1",
  "password": "SecurePass123!"
}
```

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名（3-20字符，字母数字下划线） |
| password | string | 是 | 密码（6-50字符，至少1个数字和字母） |

**成功响应** (201):
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_abc123",
      "username": "player1",
      "createdAt": 1234567890
    }
  }
}
```

**错误响应** (400):
```json
{
  "success": false,
  "error": {
    "code": "USERNAME_EXISTS",
    "message": "用户名已被使用"
  }
}
```

**可能的错误码**:
- `USERNAME_EXISTS` - 用户名已存在
- `INVALID_USERNAME` - 用户名格式错误
- `INVALID_PASSWORD` - 密码格式错误
- `WEAK_PASSWORD` - 密码强度不足

---

#### 登录

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "player1",
  "password": "SecurePass123!"
}
```

**成功响应** (200):
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_abc123",
      "username": "player1",
      "stats": {
        "wins": 10,
        "losses": 5,
        "draws": 2,
        "rating": 1350
      }
    }
  }
}
```

**错误响应** (401):
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "用户名或密码错误"
  }
}
```

---

#### 登出

```http
POST /api/auth/logout
Authorization: Bearer <token>
```

**成功响应** (200):
```json
{
  "success": true,
  "message": "已登出"
}
```

---

#### 获取当前用户

```http
GET /api/auth/me
Authorization: Bearer <token>
```

**成功响应** (200):
```json
{
  "success": true,
  "data": {
    "id": "user_abc123",
    "username": "player1",
    "email": "player1@example.com",
    "avatar": "https://...",
    "stats": {
      "wins": 10,
      "losses": 5,
      "draws": 2,
      "rating": 1350,
      "rank": 128
    },
    "createdAt": 1234567890,
    "lastLogin": 1234599999
  }
}
```

---

### 3.2 游戏接口

#### 获取游戏历史

```http
GET /api/games?page=1&limit=20&status=ended
Authorization: Bearer <token>
```

**查询参数**:
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| page | number | 1 | 页码 |
| limit | number | 20 | 每页数量（1-100） |
| status | string | all | 游戏状态（all/playing/ended） |

**成功响应** (200):
```json
{
  "success": true,
  "data": {
    "games": [
      {
        "id": "game_xyz789",
        "blackPlayer": {
          "id": "user_abc123",
          "username": "player1",
          "rating": 1350
        },
        "whitePlayer": {
          "id": "user_def456",
          "username": "player2",
          "rating": 1320
        },
        "winner": "black",
        "reason": "five_in_row",
        "skillMode": true,
        "duration": 1234,
        "createdAt": 1234567890,
        "endedAt": 1234589999
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "totalPages": 8
    }
  }
}
```

---

#### 获取游戏详情

```http
GET /api/games/:gameId
Authorization: Bearer <token>
```

**成功响应** (200):
```json
{
  "success": true,
  "data": {
    "id": "game_xyz789",
    "blackPlayer": {
      "id": "user_abc123",
      "username": "player1"
    },
    "whitePlayer": {
      "id": "user_def456",
      "username": "player2"
    },
    "winner": "black",
    "reason": "five_in_row",
    "board": [
      [null, null, null, ...],
      ...
    ],
    "moves": [
      {
        "moveNumber": 1,
        "player": "black",
        "position": { "row": 7, "col": 7 },
        "skillUsed": null
      },
      {
        "moveNumber": 2,
        "player": "white",
        "position": { "row": 7, "col": 8 },
        "skillUsed": null
      }
    ],
    "skillCardsUsed": [
      {
        "player": "black",
        "skillCardId": "card_123",
        "skillName": "倒转乾坤",
        "usedAt": 1234577888
      }
    ],
    "duration": 1234,
    "createdAt": 1234567890,
    "endedAt": 1234589999
  }
}
```

---

### 3.3 排行榜接口

#### 获取排行榜

```http
GET /api/leaderboard?type=rating&limit=100
```

**查询参数**:
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| type | string | rating | 排行类型（rating/wins/winrate） |
| limit | number | 100 | 返回数量（1-100） |

**成功响应** (200):
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "user": {
          "id": "user_top1",
          "username": "champion",
          "avatar": "https://..."
        },
        "stats": {
          "rating": 2100,
          "wins": 156,
          "losses": 23,
          "winRate": 87.15
        }
      },
      {
        "rank": 2,
        "user": {
          "id": "user_top2",
          "username": "master",
          "avatar": "https://..."
        },
        "stats": {
          "rating": 2050,
          "wins": 142,
          "losses": 31,
          "winRate": 82.08
        }
      }
    ],
    "updatedAt": 1234599999
  }
}
```

---

#### 获取用户排名

```http
GET /api/leaderboard/me
Authorization: Bearer <token>
```

**成功响应** (200):
```json
{
  "success": true,
  "data": {
    "rank": 128,
    "percentile": 15.3,
    "stats": {
      "rating": 1350,
      "wins": 10,
      "losses": 5,
      "winRate": 66.67
    }
  }
}
```

---

### 3.4 用户接口

#### 更新用户资料

```http
PATCH /api/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "avatar": "https://...",
  "bio": "热爱五子棋"
}
```

**成功响应** (200):
```json
{
  "success": true,
  "data": {
    "id": "user_abc123",
    "username": "player1",
    "avatar": "https://...",
    "bio": "热爱五子棋",
    "updatedAt": 1234599999
  }
}
```

---

#### 获取用户统计

```http
GET /api/users/me/stats
Authorization: Bearer <token>
```

**成功响应** (200):
```json
{
  "success": true,
  "data": {
    "total": {
      "games": 17,
      "wins": 10,
      "losses": 5,
      "draws": 2
    },
    "recent": {
      "last7days": {
        "games": 5,
        "wins": 3,
        "losses": 2,
        "winRate": 60.0
      }
    },
    "skills": {
      "mostUsed": {
        "id": "reverse_chaos",
        "name": "倒转乾坤",
        "usageCount": 12
      },
      "totalUsed": 28
    },
    "average": {
      "gameDuration": 856,
      "movesPerGame": 45
    }
  }
}
```

---

### 3.5 系统接口

#### 健康检查

```http
GET /api/health
```

**成功响应** (200):
```json
{
  "status": "ok",
  "version": "1.0.0",
  "uptime": 86400,
  "timestamp": 1234599999,
  "services": {
    "database": "healthy",
    "websocket": "healthy"
  }
}
```

---

#### 获取服务器统计

```http
GET /api/stats
```

**成功响应** (200):
```json
{
  "success": true,
  "data": {
    "online": {
      "players": 42,
      "games": 12,
      "spectators": 8
    },
    "total": {
      "users": 1250,
      "games": 5432,
      "moves": 245678
    },
    "server": {
      "uptime": 86400,
      "memoryUsage": {
        "heapUsed": 128,
        "heapTotal": 256,
        "external": 32
      }
    }
  }
}
```

---

## 4. WebSocket API

### 4.1 连接

**连接URL**:
```
ws://localhost:3001/ws?token=<token>
```

**连接参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| token | string | 否 | 认证Token（可选，支持游客模式） |

**连接示例**:
```javascript
const ws = new WebSocket('ws://localhost:3001/ws?token=xxx');

ws.onopen = () => {
  console.log('Connected');
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  handleMessage(message);
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('Disconnected');
};
```

---

### 4.2 客户端消息

#### 心跳

**发送**:
```json
{
  "type": "ping",
  "timestamp": 1234599999
}
```

**接收**:
```json
{
  "type": "pong",
  "timestamp": 1234599999
}
```

---

#### 查找游戏

**发送**:
```json
{
  "type": "find_game",
  "preferences": {
    "timeControl": 600,
    "skillMode": true
  }
}
```

**接收** (匹配成功):
```json
{
  "type": "game_start",
  "roomId": "room_abc123",
  "color": "black",
  "opponent": {
    "id": "user_def456",
    "username": "player2",
    "rating": 1320
  },
  "gameState": {
    "board": [[null, ...], ...],
    "currentPlayer": "black",
    "phase": "playing",
    "players": {
      "black": {
        "skillCards": [...]
      },
      "white": {
        "skillCards": [...]
      }
    }
  }
}
```

---

#### 创建房间

**发送**:
```json
{
  "type": "create_room",
  "config": {
    "enableSkills": true,
    "skillCountPerPlayer": 3,
    "timeControl": 600
  }
}
```

**接收**:
```json
{
  "type": "room_created",
  "roomId": "room_abc123",
  "inviteCode": "ABC123",
  "config": {
    "enableSkills": true,
    "skillCountPerPlayer": 3,
    "timeControl": 600
  }
}
```

---

#### 加入房间

**发送**:
```json
{
  "type": "join_room",
  "roomId": "room_abc123"
}
```

**或通过邀请码**:
```json
{
  "type": "join_room",
  "inviteCode": "ABC123"
}
```

**接收** (成功):
```json
{
  "type": "room_joined",
  "roomId": "room_abc123",
  "color": "white",
  "opponent": {
    "id": "user_abc123",
    "username": "player1",
    "rating": 1350
  },
  "gameState": {...}
}
```

---

#### 落子

**发送**:
```json
{
  "type": "move",
  "position": {
    "row": 7,
    "col": 7
  }
}
```

**接收** (成功):
```json
{
  "type": "state_update",
  "gameState": {
    "board": [[null, ...], ...],
    "currentPlayer": "white",
    "phase": "playing",
    "lastMove": {
      "row": 7,
      "col": 7
    }
  }
}
```

**接收** (失败):
```json
{
  "type": "error",
  "code": "INVALID_MOVE",
  "message": "此位置已有棋子"
}
```

---

#### 使用技能

**发送**:
```json
{
  "type": "skill",
  "skillCardId": "card_xyz789",
  "targetPosition": {
    "row": 7,
    "col": 8
  }
}
```

**接收** (成功):
```json
{
  "type": "state_update",
  "gameState": {
    "...": "...",
    "lastSkill": {
      "skillCardId": "card_xyz789",
      "skillName": "时间回溯",
      "player": "black"
    }
  }
}
```

---

#### 发送聊天消息

**发送**:
```json
{
  "type": "chat",
  "message": "好棋！"
}
```

**接收** (广播):
```json
{
  "type": "chat",
  "sender": {
    "id": "user_abc123",
    "username": "player1"
  },
  "message": "好棋！",
  "timestamp": 1234599999
}
```

---

#### 悔棋请求

**发送**:
```json
{
  "type": "undo_request"
}
```

**接收** (对方):
```json
{
  "type": "undo_request",
  "player": {
    "id": "user_abc123",
    "username": "player1"
  }
}
```

**同意悔棋**:
```json
{
  "type": "undo_accept"
}
```

**拒绝悔棋**:
```json
{
  "type": "undo_reject"
}
```

---

#### 投降

**发送**:
```json
{
  "type": "resign"
}
```

**接收** (游戏结束):
```json
{
  "type": "game_over",
  "winner": "white",
  "reason": "resign",
  "stats": {
    "duration": 856,
    "totalMoves": 45,
    "skillsUsed": 3
  }
}
```

---

### 4.3 服务器消息

#### 对手断线

```json
{
  "type": "opponent_disconnected",
  "timeout": 30
}
```

#### 对手重连

```json
{
  "type": "opponent_reconnected"
}
```

#### 游戏结束

```json
{
  "type": "game_over",
  "winner": "black",
  "reason": "five_in_row",
  "stats": {
    "duration": 1234,
    "totalMoves": 67,
    "skillsUsed": 5
  },
  "ratingChange": {
    "black": +12,
    "white": -12
  }
}
```

---

## 5. 错误处理

### 5.1 HTTP错误码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 409 | 冲突（如用户名已存在） |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |

---

### 5.2 错误响应格式

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "人类可读的错误信息",
    "details": {
      "field": "username",
      "reason": "too_short"
    }
  }
}
```

---

### 5.3 常见错误码

**认证相关**:
- `INVALID_CREDENTIALS` - 用户名或密码错误
- `TOKEN_EXPIRED` - Token已过期
- `TOKEN_INVALID` - Token无效
- `UNAUTHORIZED` - 未认证

**游戏相关**:
- `GAME_NOT_FOUND` - 游戏不存在
- `NOT_YOUR_TURN` - 不是你的回合
- `INVALID_MOVE` - 无效的落子
- `POSITION_OCCUPIED` - 位置已被占用
- `SKILL_NOT_AVAILABLE` - 技能不可用
- `SKILL_ALREADY_USED` - 技能已使用

**房间相关**:
- `ROOM_NOT_FOUND` - 房间不存在
- `ROOM_FULL` - 房间已满
- `ALREADY_IN_ROOM` - 已在房间中

**系统相关**:
- `RATE_LIMIT_EXCEEDED` - 请求过于频繁
- `INTERNAL_ERROR` - 服务器内部错误

---

## 6. 数据结构

### 6.1 User

```typescript
interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  bio?: string;
  stats: {
    wins: number;
    losses: number;
    draws: number;
    rating: number;
    rank?: number;
  };
  createdAt: number;
  lastLogin?: number;
}
```

---

### 6.2 Game

```typescript
interface Game {
  id: string;
  blackPlayer: Player;
  whitePlayer: Player;
  winner?: 'black' | 'white' | 'draw';
  reason?: 'five_in_row' | 'resign' | 'timeout' | 'disconnect';
  skillMode: boolean;
  timeControl: number;
  duration?: number;
  createdAt: number;
  endedAt?: number;
}
```

---

### 6.3 GameState

```typescript
interface GameState {
  id: string;
  board: (Stone | null)[][];
  currentPlayer: 'black' | 'white';
  phase: 'waiting' | 'playing' | 'ended';
  winner?: 'black' | 'white' | 'draw';
  players: {
    black: PlayerState;
    white: PlayerState;
  };
  moveHistory: Position[];
  turnNumber: number;
  config: GameConfig;
}

interface PlayerState {
  id: string;
  username: string;
  color: 'black' | 'white';
  skillCards: SkillCard[];
  timeRemaining?: number;
}

interface SkillCard {
  id: string;
  skillId: string;
  name: string;
  description: string;
  used: boolean;
}
```

---

### 6.4 Position

```typescript
interface Position {
  row: number; // 0-14
  col: number; // 0-14
}
```

---

## 7. 速率限制

### 7.1 API限制

| 端点 | 限制 | 时间窗口 |
|------|------|---------|
| 全局 | 100次 | 1分钟 |
| 登录 | 5次 | 1分钟 |
| 注册 | 3次 | 1小时 |

### 7.2 WebSocket限制

| 消息类型 | 限制 | 时间窗口 |
|---------|------|---------|
| 聊天消息 | 10次 | 1分钟 |
| 移动 | 无限制 | - |
| 技能 | 无限制 | - |

---

## 8. 版本控制

**当前版本**: v1.0

**版本策略**:
- 主版本号：不兼容的API变更
- 次版本号：向后兼容的功能新增
- 修订号：向后兼容的问题修正

**示例**:
```
v1.0.0 -> v1.1.0 (新增功能)
v1.1.0 -> v1.1.1 (Bug修复)
v1.1.1 -> v2.0.0 (破坏性变更)
```

---

## 9. 更新日志

- **2026-02-24**: 创建API文档 v1.0

---

**API测试工具**:
- Postman Collection: `docs/postman_collection.json`
- OpenAPI Spec: `docs/openapi.yaml`
