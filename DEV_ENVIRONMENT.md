# 开发环境部署完成

## 服务状态

### 后端服务器
- **URL**: http://localhost:3001
- **健康检查**: http://localhost:3001/api/health
- **WebSocket**: ws://localhost:3001/ws

### 前端开发服务器
- **URL**: http://localhost:3000
- **启动命令**: `npm run dev`

---

## 快速启动

### 方式1: 分别启动

```bash
# 终端1 - 启动后端
cd /home/admin/game/show-your-skills/server
npm run build
node dist/index.js

# 终端2 - 启动前端
cd /home/admin/game/show-your-skills
npm run dev
```

### 方式2: 使用脚本

```bash
# 启动后端
./scripts/start-dev.sh

# 另一个终端启动前端
npm run dev
```

### 方式3: 同时启动

```bash
npm run dev:full
```

---

## API 端点

### 认证
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `POST /api/auth/logout` - 登出
- `GET /api/auth/me` - 获取当前用户

### 配置
- `GET /api/config/themes` - 获取主题列表
- `GET /api/config/themes/:id` - 获取主题详情
- `GET /api/config/skillPools` - 获取技能池列表
- `GET /api/config/skillPools/:id` - 获取技能池详情

### 游戏
- `GET /api/games` - 游戏历史
- `GET /api/games/:id` - 游戏详情
- `GET /api/leaderboard` - 排行榜
- `GET /api/leaderboard/me` - 我的排名

### 系统
- `GET /api/health` - 健康检查
- `GET /api/stats` - 服务器统计

---

## 测试账号

运行种子数据后可用：
- `admin` / `admin123`
- `player1` / `player123`
- `player2` / `player123`
- `guest` / `guest123`

---

## 日志位置

- 后端日志: `/tmp/show-your-skills/server.log`
- 前端日志: 浏览器控制台
