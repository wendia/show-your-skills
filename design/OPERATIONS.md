# Show Your Skills - 运行部署设计文档

**版本**: v1.0
**创建时间**: 2026-02-24
**适用环境**: Linux (Rocky Linux 9.7) / macOS / Windows

---

## 目录

1. [环境要求](#1-环境要求)
2. [开发环境](#2-开发环境)
3. [生产环境](#3-生产环境)
4. [配置管理](#4-配置管理)
5. [进程管理](#5-进程管理)
6. [反向代理](#6-反向代理)
7. [SSL证书](#7-ssl证书)
8. [监控告警](#8-监控告警)
9. [日志管理](#9-日志管理)
10. [备份恢复](#10-备份恢复)
11. [故障排查](#11-故障排查)
12. [运维脚本](#12-运维脚本)

---

## 1. 环境要求

### 1.1 硬件要求

| 环境 | CPU | 内存 | 存储 | 带宽 |
|------|-----|------|------|------|
| **开发** | 2核 | 4GB | 10GB | 1Mbps |
| **测试** | 2核 | 4GB | 20GB | 5Mbps |
| **生产（最小）** | 2核 | 4GB | 40GB | 10Mbps |
| **生产（推荐）** | 4核 | 8GB | 80GB | 50Mbps |

### 1.2 软件要求

| 软件 | 最低版本 | 推荐版本 | 说明 |
|------|---------|---------|------|
| **Node.js** | 18.x | 22.x | 运行时 |
| **npm** | 9.x | 10.x | 包管理器 |
| **Nginx** | 1.20 | 1.24 | 反向代理 |
| **SQLite** | 3.x | 3.45 | 数据库 |
| **Git** | 2.x | 2.43 | 版本控制 |

### 1.3 端口要求

| 端口 | 服务 | 说明 |
|------|------|------|
| 3000 | 前端开发服务器 | 仅开发环境 |
| 3001 | 后端API服务器 | 所有环境 |
| 80 | HTTP | 生产环境 |
| 443 | HTTPS | 生产环境 |
| 22 | SSH | 远程管理 |

---

## 2. 开发环境

### 2.1 环境搭建

#### 安装 Node.js

**方式1: 使用 NVM（推荐）**
```bash
# 安装 NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc

# 安装 Node.js 22
nvm install 22
nvm use 22
nvm alias default 22

# 验证
node --version  # v22.x.x
npm --version   # 10.x.x
```

**方式2: 使用包管理器**

```bash
# Rocky Linux / CentOS
sudo dnf module install nodejs:22 -y

# Ubuntu / Debian
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# macOS
brew install node@22
```

#### 安装项目依赖

```bash
cd /home/admin/game/show-your-skills

# 前端
npm install

# 后端
cd server
npm install
```

### 2.2 开发配置

#### 前端开发配置

```bash
# .env.development
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001/ws
VITE_ENABLE_DEVTOOLS=true
```

#### 后端开发配置

```bash
# server/.env.development
NODE_ENV=development
PORT=3001
HOST=localhost

DB_PATH=./game.dev.db

LOG_LEVEL=debug
LOG_FORMAT=pretty

CORS_ORIGIN=http://localhost:3000

RATE_LIMIT_ENABLED=false
```

### 2.3 启动开发服务

#### 手动启动

```bash
# 终端1: 启动后端
cd /home/admin/game/show-your-skills/server
npm run dev

# 终端2: 启动前端
cd /home/admin/game/show-your-skills
npm run dev
```

#### 使用 concurrently 同时启动

```bash
# 安装 concurrently
npm install -D concurrently

# package.json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:server": "cd server && npm run dev",
    "dev:client": "vite"
  }
}

# 启动
npm run dev
```

### 2.4 开发工具配置

#### VS Code 配置

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Server",
      "cwd": "${workspaceFolder}/server",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "console": "integratedTerminal"
    },
    {
      "type": "chrome",
      "request": "launch",
      "name": "Debug Client",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

#### ESLint 配置

```javascript
// .eslintrc.cjs
module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
}
```

---

## 3. 生产环境

### 3.1 构建生产版本

#### 前端构建

```bash
cd /home/admin/game/show-your-skills

# 设置生产环境变量
export VITE_API_URL=https://api.example.com
export VITE_WS_URL=wss://api.example.com/ws

# 构建
npm run build

# 输出在 dist/ 目录
ls -la dist/
```

#### 后端构建

```bash
cd /home/admin/game/show-your-skills/server

# 编译 TypeScript
npm run build

# 输出在 dist/ 目录
ls -la dist/
```

### 3.2 生产配置

#### 前端生产配置

```bash
# .env.production
VITE_API_URL=https://api.show-your-skills.com
VITE_WS_URL=wss://api.show-your-skills.com/ws
VITE_ENABLE_DEVTOOLS=false
```

#### 后端生产配置

```bash
# server/.env.production
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

DB_PATH=/var/lib/show-your-skills/game.db

LOG_LEVEL=info
LOG_FORMAT=json

CORS_ORIGIN=https://show-your-skills.com

RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000

JWT_SECRET=<generated-secret>
SESSION_SECRET=<generated-secret>

WS_HEARTBEAT_INTERVAL=30000
WS_HEARTBEAT_TIMEOUT=60000
```

### 3.3 部署目录结构

```
/var/www/show-your-skills/
├── current -> releases/v1.0.0   # 当前版本软链接
├── releases/                    # 历史版本
│   ├── v1.0.0/
│   │   ├── dist/               # 前端构建
│   │   └── index.html
│   └── v1.1.0/
├── shared/                      # 共享文件
│   ├── config/                 # 配置文件
│   └── logs/                   # 日志
└── backups/                     # 备份
    └── db/

/home/admin/game/show-your-skills/server/
├── dist/                        # 编译产物
├── config/                      # 配置
│   ├── themes/
│   └── skillPools/
├── game.db                      # 数据库
└── .env                         # 环境变量
```

---

## 4. 配置管理

### 4.1 环境变量管理

#### 使用 .env 文件

```bash
# 生成密钥
openssl rand -hex 32 > /tmp/jwt_secret
openssl rand -hex 32 > /tmp/session_secret

# 创建 .env 文件
cat > /home/admin/game/show-your-skills/server/.env << EOF
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

DB_PATH=/var/lib/show-your-skills/game.db

JWT_SECRET=$(cat /tmp/jwt_secret)
SESSION_SECRET=$(cat /tmp/session_secret)

LOG_LEVEL=info
EOF

# 清理临时文件
rm /tmp/jwt_secret /tmp/session_secret

# 设置权限
chmod 600 /home/admin/game/show-your-skills/server/.env
```

### 4.2 配置文件管理

#### 主题配置部署

```bash
# 创建配置目录
sudo mkdir -p /var/lib/show-your-skills/config/themes
sudo mkdir -p /var/lib/show-your-skills/config/skillPools

# 复制配置文件
sudo cp -r /home/admin/game/show-your-skills/server/src/config/themes/* /var/lib/show-your-skills/config/themes/
sudo cp -r /home/admin/game/show-your-skills/server/src/config/skillPools/* /var/lib/show-your-skills/config/skillPools/

# 设置权限
sudo chown -R admin:admin /var/lib/show-your-skills/config
sudo chmod -R 644 /var/lib/show-your-skills/config/**/*.json
```

### 4.3 配置更新流程

```bash
# 1. 修改配置文件
vim /var/lib/show-your-skills/config/themes/magic.json

# 2. 重启服务（如果需要）
systemctl --user restart show-your-skills-api

# 3. 验证配置
curl http://localhost:3001/api/config/themes/magic
```

---

## 5. 进程管理

### 5.1 Systemd 服务

#### 创建服务文件

```bash
# 用户级服务
mkdir -p ~/.config/systemd/user

cat > ~/.config/systemd/user/show-your-skills-api.service << 'EOF'
[Unit]
Description=Show Your Skills API Server
Documentation=https://github.com/username/show-your-skills
After=network.target

[Service]
Type=simple
WorkingDirectory=/home/admin/game/show-your-skills/server
ExecStart=/home/admin/.nvm/versions/node/v22.22.0/bin/node dist/index.js
Restart=always
RestartSec=10

# 环境变量
Environment=NODE_ENV=production
EnvironmentFile=/home/admin/game/show-your-skills/server/.env

# 安全设置
NoNewPrivileges=true
PrivateTmp=true

# 资源限制
LimitNOFILE=65535
MemoryMax=1G

# 日志
StandardOutput=journal
StandardError=journal
SyslogIdentifier=show-your-skills-api

[Install]
WantedBy=default.target
EOF
```

#### 服务管理命令

```bash
# 重载 systemd
systemctl --user daemon-reload

# 启动服务
systemctl --user start show-your-skills-api

# 停止服务
systemctl --user stop show-your-skills-api

# 重启服务
systemctl --user restart show-your-skills-api

# 查看状态
systemctl --user status show-your-skills-api

# 开机自启
systemctl --user enable show-your-skills-api

# 禁用自启
systemctl --user disable show-your-skills-api

# 查看日志
journalctl --user -u show-your-skills-api -f
```

### 5.2 PM2 管理（替代方案）

#### 安装 PM2

```bash
npm install -g pm2
```

#### PM2 配置

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'show-your-skills-api',
    script: 'dist/index.js',
    cwd: '/home/admin/game/show-your-skills/server',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/var/log/show-your-skills/error.log',
    out_file: '/var/log/show-your-skills/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
```

#### PM2 命令

```bash
# 启动
pm2 start ecosystem.config.js --env production

# 停止
pm2 stop show-your-skills-api

# 重启
pm2 restart show-your-skills-api

# 查看状态
pm2 status

# 查看日志
pm2 logs show-your-skills-api

# 开机自启
pm2 startup
pm2 save
```

---

## 6. 反向代理

### 6.1 Nginx 安装

```bash
# Rocky Linux
sudo dnf install nginx -y

# Ubuntu
sudo apt install nginx -y

# 启动
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 6.2 Nginx 配置

#### 基础配置

```nginx
# /etc/nginx/conf.d/show-your-skills.conf

# 上游服务器
upstream api_server {
    server 127.0.0.1:3001;
    keepalive 64;
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name show-your-skills.com www.show-your-skills.com;

    # Let's Encrypt 验证
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # 重定向到 HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS 主服务器
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name show-your-skills.com www.show-your-skills.com;

    # SSL 配置
    ssl_certificate /etc/letsencrypt/live/show-your-skills.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/show-your-skills.com/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    # 现代 SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/rss+xml application/atom+xml image/svg+xml;

    # 静态文件（前端）
    root /var/www/show-your-skills/current;
    index index.html;

    # 前端路由
    location / {
        try_files $uri $uri/ /index.html;

        # 缓存静态资源
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API 代理
    location /api/ {
        proxy_pass http://api_server;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket 代理
    location /ws {
        proxy_pass http://api_server;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket 超时设置
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;
    }

    # 健康检查
    location /health {
        proxy_pass http://api_server/api/health;
        access_log off;
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # 日志
    access_log /var/log/nginx/show-your-skills.access.log;
    error_log /var/log/nginx/show-your-skills.error.log;
}
```

#### 测试和重载

```bash
# 测试配置
sudo nginx -t

# 重载配置
sudo systemctl reload nginx

# 重启 Nginx
sudo systemctl restart nginx
```

---

## 7. SSL证书

### 7.1 Let's Encrypt 证书

#### 安装 Certbot

```bash
# Rocky Linux
sudo dnf install certbot python3-certbot-nginx -y

# Ubuntu
sudo apt install certbot python3-certbot-nginx -y
```

#### 获取证书

```bash
# 创建验证目录
sudo mkdir -p /var/www/certbot

# 获取证书
sudo certbot certonly --webroot \
  -w /var/www/certbot \
  -d show-your-skills.com \
  -d www.show-your-skills.com \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email
```

#### 自动续期

```bash
# 测试续期
sudo certbot renew --dry-run

# 添加定时任务
sudo crontab -e

# 添加以下行（每天检查两次）
0 0,12 * * * /usr/bin/certbot renew --quiet --post-hook "systemctl reload nginx"
```

### 7.2 自签名证书（开发环境）

```bash
# 生成自签名证书
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# 使用证书
# Nginx 配置
ssl_certificate /path/to/cert.pem;
ssl_certificate_key /path/to/key.pem;
```

---

## 8. 监控告警

### 8.1 健康检查

#### 健康检查脚本

```bash
#!/bin/bash
# scripts/health-check.sh

API_URL="http://localhost:3001/api/health"
MAX_RETRIES=3
RETRY_INTERVAL=5

check_health() {
    for i in $(seq 1 $MAX_RETRIES); do
        response=$(curl -s -o /dev/null -w "%{http_code}" $API_URL)
        
        if [ $response -eq 200 ]; then
            echo "✅ API is healthy"
            return 0
        fi
        
        echo "⚠️ Attempt $i failed (HTTP $response)"
        sleep $RETRY_INTERVAL
    done
    
    echo "❌ API is unhealthy after $MAX_RETRIES attempts"
    return 1
}

check_health
```

#### 定时健康检查

```bash
# 添加到 crontab
*/5 * * * * /home/admin/game/show-your-skills/scripts/health-check.sh >> /var/log/show-your-skills/health.log 2>&1
```

### 8.2 资源监控

#### 监控脚本

```bash
#!/bin/bash
# scripts/monitor.sh

LOG_FILE="/var/log/show-your-skills/monitor.log"
ALERT_THRESHOLD_CPU=80
ALERT_THRESHOLD_MEM=80

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') $1" >> $LOG_FILE
}

# CPU 使用率
cpu_usage=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
cpu_usage=${cpu_usage%.*}

# 内存使用率
mem_usage=$(free | grep Mem | awk '{print ($3/$2) * 100}')
mem_usage=${mem_usage%.*}

# 磁盘使用率
disk_usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')

log "CPU: ${cpu_usage}% | Memory: ${mem_usage}% | Disk: ${disk_usage}%"

# 告警检查
if [ $cpu_usage -gt $ALERT_THRESHOLD_CPU ]; then
    log "⚠️ CPU usage is high: ${cpu_usage}%"
fi

if [ $mem_usage -gt $ALERT_THRESHOLD_MEM ]; then
    log "⚠️ Memory usage is high: ${mem_usage}%"
fi
```

---

## 9. 日志管理

### 9.1 日志配置

#### 后端日志配置

```typescript
// server/src/utils/logger.ts
import pino from 'pino';

const logLevel = process.env.LOG_LEVEL || 'info';
const logFormat = process.env.LOG_FORMAT || 'json';

const transport = logFormat === 'pretty' 
  ? { target: 'pino-pretty', options: { colorize: true } }
  : undefined;

export const logger = pino({
  level: logLevel,
  transport,
  formatters: {
    level: (label) => ({ level: label.toUpperCase() })
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});
```

### 9.2 日志轮转

#### Logrotate 配置

```bash
# /etc/logrotate.d/show-your-skills

/var/log/show-your-skills/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 admin admin
    sharedscripts
    postrotate
        systemctl --user reload show-your-skills-api > /dev/null 2>&1 || true
    endscript
}

/var/log/nginx/show-your-skills.*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 nginx adm
    sharedscripts
    postrotate
        systemctl reload nginx > /dev/null 2>&1 || true
    endscript
}
```

### 9.3 日志查看

```bash
# 查看应用日志
journalctl --user -u show-your-skills-api -f

# 查看最近100行
journalctl --user -u show-your-skills-api -n 100

# 查看今天的日志
journalctl --user -u show-your-skills-api --since today

# 查看 Nginx 访问日志
tail -f /var/log/nginx/show-your-skills.access.log

# 查看 Nginx 错误日志
tail -f /var/log/nginx/show-your-skills.error.log
```

---

## 10. 备份恢复

### 10.1 数据库备份

#### 备份脚本

```bash
#!/bin/bash
# scripts/backup-db.sh

BACKUP_DIR="/var/lib/show-your-skills/backups/db"
DB_PATH="/var/lib/show-your-skills/game.db"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/game_$DATE.db"
KEEP_DAYS=30

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
cp $DB_PATH $BACKUP_FILE

# 压缩
gzip $BACKUP_FILE

echo "✅ Backup created: $BACKUP_FILE.gz"

# 清理旧备份
find $BACKUP_DIR -name "game_*.db.gz" -mtime +$KEEP_DAYS -delete
echo "✅ Old backups cleaned (keeping last $KEEP_DAYS days)"
```

#### 自动备份

```bash
# 添加到 crontab
crontab -e

# 每天凌晨2点备份
0 2 * * * /home/admin/game/show-your-skills/scripts/backup-db.sh >> /var/log/show-your-skills/backup.log 2>&1
```

### 10.2 配置备份

```bash
#!/bin/bash
# scripts/backup-config.sh

BACKUP_DIR="/var/lib/show-your-skills/backups/config"
CONFIG_DIR="/var/lib/show-your-skills/config"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/config_$DATE.tar.gz"

mkdir -p $BACKUP_DIR

tar -czf $BACKUP_FILE -C $(dirname $CONFIG_DIR) $(basename $CONFIG_DIR)

echo "✅ Config backup created: $BACKUP_FILE"

# 清理旧备份
find $BACKUP_DIR -name "config_*.tar.gz" -mtime +7 -delete
```

### 10.3 数据恢复

```bash
#!/bin/bash
# scripts/restore-db.sh

if [ -z "$1" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

BACKUP_FILE=$1
DB_PATH="/var/lib/show-your-skills/game.db"

# 停止服务
echo "Stopping service..."
systemctl --user stop show-your-skills-api

# 备份当前数据库
cp $DB_PATH "${DB_PATH}.bak.$(date +%Y%m%d_%H%M%S)"

# 恢复数据库
if [[ $BACKUP_FILE == *.gz ]]; then
    gunzip -c $BACKUP_FILE > $DB_PATH
else
    cp $BACKUP_FILE $DB_PATH
fi

echo "✅ Database restored from $BACKUP_FILE"

# 启动服务
echo "Starting service..."
systemctl --user start show-your-skills-api
```

---

## 11. 故障排查

### 11.1 常见问题

#### 服务无法启动

```bash
# 检查日志
journalctl --user -u show-your-skills-api -n 50

# 检查端口
ss -tulpn | grep 3001

# 检查权限
ls -la /home/admin/game/show-your-skills/server/

# 手动启动测试
cd /home/admin/game/show-your-skills/server
node dist/index.js
```

#### WebSocket 连接失败

```bash
# 检查 Nginx 配置
sudo nginx -t

# 检查 Nginx 日志
tail -f /var/log/nginx/show-your-skills.error.log

# 测试 WebSocket
wscat -c wss://show-your-skills.com/ws
```

#### 数据库错误

```bash
# 检查数据库文件
ls -la /var/lib/show-your-skills/game.db

# 检查数据库完整性
sqlite3 /var/lib/show-your-skills/game.db "PRAGMA integrity_check;"

# 检查数据库大小
du -h /var/lib/show-your-skills/game.db
```

### 11.2 性能问题

#### 高CPU使用率

```bash
# 查看进程CPU
top -p $(pgrep -f "node dist/index.js")

# 生成火焰图（需要安装）
node --prof dist/index.js
node --prof-process isolate-*.log > profile.txt
```

#### 高内存使用率

```bash
# 查看内存使用
ps aux --sort=-%mem | head

# 生成堆快照
kill -USR2 <pid>  # 如果配置了信号处理

# 使用 Node.js 内置分析
node --inspect dist/index.js
```

### 11.3 网络问题

```bash
# 检查端口监听
ss -tulpn | grep -E '3001|80|443'

# 检查防火墙
sudo firewall-cmd --list-all

# 测试连接
curl -v http://localhost:3001/api/health
curl -v https://show-your-skills.com/api/health
```

---

## 12. 运维脚本

### 12.1 部署脚本

```bash
#!/bin/bash
# scripts/deploy.sh
set -e

PROJECT_DIR="/home/admin/game/show-your-skills"
DEPLOY_DIR="/var/www/show-your-skills"
SERVICE_NAME="show-your-skills-api"
VERSION=$(node -p "require('$PROJECT_DIR/package.json').version")

echo "🚀 Deploying version $VERSION..."

# 1. 拉取最新代码
cd $PROJECT_DIR
git pull origin main

# 2. 安装依赖
npm ci
cd server && npm ci && cd ..

# 3. 运行测试
npm test

# 4. 构建前端
npm run build

# 5. 构建后端
cd server && npm run build && cd ..

# 6. 运行数据库迁移
cd server && npm run migrate && cd ..

# 7. 部署前端
mkdir -p $DEPLOY_DIR/releases/v$VERSION
cp -r dist/* $DEPLOY_DIR/releases/v$VERSION/
cd $DEPLOY_DIR
ln -sfn releases/v$VERSION current

# 8. 重启后端服务
systemctl --user restart $SERVICE_NAME

# 9. 等待启动
sleep 5

# 10. 健康检查
if curl -s http://localhost:3001/api/health | grep -q "ok"; then
    echo "✅ Deployment successful!"
else
    echo "❌ Deployment failed!"
    systemctl --user status $SERVICE_NAME
    exit 1
fi

# 11. 清理旧版本
cd $DEPLOY_DIR/releases
ls -t | tail -n +6 | xargs -r rm -rf

echo "✅ Cleanup completed"
```

### 12.2 回滚脚本

```bash
#!/bin/bash
# scripts/rollback.sh

if [ -z "$1" ]; then
    echo "Usage: $0 <version>"
    echo "Available versions:"
    ls -t /var/www/show-your-skills/releases
    exit 1
fi

VERSION=$1
DEPLOY_DIR="/var/www/show-your-skills"
SERVICE_NAME="show-your-skills-api"

echo "🔄 Rolling back to version $VERSION..."

# 检查版本是否存在
if [ ! -d "$DEPLOY_DIR/releases/v$VERSION" ]; then
    echo "❌ Version $VERSION not found"
    exit 1
fi

# 切换版本
cd $DEPLOY_DIR
ln -sfn releases/v$VERSION current

# 重启服务
systemctl --user restart $SERVICE_NAME

# 等待启动
sleep 5

# 健康检查
if curl -s http://localhost:3001/api/health | grep -q "ok"; then
    echo "✅ Rollback successful!"
else
    echo "❌ Rollback failed!"
    exit 1
fi
```

### 12.3 状态检查脚本

```bash
#!/bin/bash
# scripts/status.sh

echo "=== Show Your Skills Status ==="
echo ""

echo "📊 Service Status:"
systemctl --user status show-your-skills-api --no-pager | head -10
echo ""

echo "🌐 Nginx Status:"
sudo systemctl status nginx --no-pager | head -10
echo ""

echo "💾 Database:"
ls -lh /var/lib/show-your-skills/game.db
sqlite3 /var/lib/show-your-skills/game.db "SELECT COUNT(*) as users FROM users; SELECT COUNT(*) as games FROM games;"
echo ""

echo "📦 Disk Usage:"
df -h /var/lib/show-your-skills
echo ""

echo "📈 Recent Logs:"
journalctl --user -u show-your-skills-api -n 5 --no-pager
echo ""

echo "✅ Health Check:"
curl -s http://localhost:3001/api/health | python3 -m json.tool 2>/dev/null || echo "Failed"
```

---

## 13. 检查清单

### 13.1 部署前检查

- [ ] 代码已通过测试
- [ ] 环境变量已配置
- [ ] 数据库已备份
- [ ] SSL证书有效
- [ ] 依赖已安装

### 13.2 部署后检查

- [ ] 服务正常运行
- [ ] API健康检查通过
- [ ] WebSocket连接正常
- [ ] 前端页面可访问
- [ ] 日志无错误
- [ ] 监控正常

### 13.3 定期维护

- [ ] 每日：检查日志
- [ ] 每周：检查备份
- [ ] 每月：更新依赖
- [ ] 每季度：安全审计

---

**文档创建**: 2026-02-24
**维护者**: Elwen
**下次更新**: 根据实际部署经验更新
