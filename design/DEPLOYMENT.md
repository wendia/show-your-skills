# Show Your Skills - 部署文档

**版本**: v1.0
**创建时间**: 2026-02-24
**目标环境**: Linux (Rocky Linux 9.7)

---

## 目录

1. [部署概述](#1-部署概述)
2. [环境准备](#2-环境准备)
3. [前端部署](#3-前端部署)
4. [后端部署](#4-后端部署)
5. [反向代理配置](#5-反向代理配置)
6. [SSL配置](#6-ssl配置)
7. [监控和日志](#7-监控和日志)
8. [备份策略](#8-备份策略)
9. [故障排查](#9-故障排查)

---

## 1. 部署概述

### 1.1 架构图

```
┌─────────────────────────────────────────────────┐
│                    用户                          │
└─────────────────────────────────────────────────┘
                     ↓ HTTPS
┌─────────────────────────────────────────────────┐
│              Nginx (反向代理)                     │
│  - SSL终止                                       │
│  - 静态文件服务                                  │
│  - WebSocket代理                                │
└─────────────────────────────────────────────────┘
         ↓                    ↓
┌──────────────────┐  ┌──────────────────┐
│   前端 (静态)     │  │   后端 (API)      │
│   :443           │  │   :3001          │
│   React + Vite   │  │   Node.js        │
└──────────────────┘  └──────────────────┘
                              ↓
                      ┌──────────────────┐
                      │   SQLite 数据库   │
                      │   game.db        │
                      └──────────────────┘
```

### 1.2 服务器要求

**最低配置**:
- CPU: 1核
- 内存: 1GB
- 存储: 10GB
- 带宽: 1Mbps

**推荐配置**:
- CPU: 2核
- 内存: 2GB
- 存储: 20GB
- 带宽: 5Mbps

### 1.3 软件要求

| 软件 | 版本 | 说明 |
|------|------|------|
| Node.js | 22.x | 运行时 |
| Nginx | 1.20+ | 反向代理 |
| SQLite | 3.x | 数据库 |

---

## 2. 环境准备

### 2.1 系统更新

```bash
# Rocky Linux / CentOS / RHEL
sudo dnf update -y

# Ubuntu / Debian
sudo apt update && sudo apt upgrade -y
```

### 2.2 安装 Node.js

**使用 NVM (推荐)**:
```bash
# 安装 NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# 安装 Node.js 22
nvm install 22
nvm use 22
nvm alias default 22

# 验证
node --version  # v22.x.x
npm --version   # 10.x.x
```

**或使用包管理器**:
```bash
# Rocky Linux
sudo dnf module install nodejs:22 -y

# Ubuntu
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2.3 安装 Nginx

```bash
# Rocky Linux
sudo dnf install nginx -y

# Ubuntu
sudo apt install nginx -y

# 启动并设置开机自启
sudo systemctl start nginx
sudo systemctl enable nginx

# 验证
sudo systemctl status nginx
```

### 2.4 配置防火墙

```bash
# Rocky Linux (firewalld)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --reload

# Ubuntu (ufw)
sudo ufw allow 'Nginx Full'
sudo ufw allow 3001/tcp
sudo ufw enable
```

### 2.5 创建部署用户

```bash
# 创建用户（如果还没有）
sudo useradd -m -s /bin/bash admin
sudo passwd admin

# 添加 sudo 权限（可选）
sudo usermod -aG wheel admin  # Rocky Linux
sudo usermod -aG sudo admin   # Ubuntu

# 切换到部署用户
su - admin
```

---

## 3. 前端部署

### 3.1 项目结构

```
/var/www/show-your-skills/
├── dist/              # 构建产物
├── current -> dist/   # 当前版本软链接
└── releases/          # 历史版本
    ├── v1.0.0/
    ├── v1.0.1/
    └── v1.1.0/
```

### 3.2 构建前端

**本地构建**:
```bash
cd /home/admin/game/show-your-skills

# 安装依赖
npm ci

# 配置环境变量
cat > .env.production << EOF
VITE_API_URL=https://api.show-your-skills.com
VITE_WS_URL=wss://api.show-your-skills.com/ws
EOF

# 构建
npm run build

# 验证构建
ls -la dist/
```

### 3.3 部署到服务器

**方式1: 直接复制**:
```bash
# 在服务器上创建目录
sudo mkdir -p /var/www/show-your-skills/releases
sudo chown -R admin:admin /var/www/show-your-skills

# 复制构建产物
cp -r dist /var/www/show-your-skills/releases/v1.0.0

# 更新软链接
cd /var/www/show-your-skills
ln -sfn releases/v1.0.0 current
```

**方式2: 使用 rsync**:
```bash
# 在本地机器执行
rsync -avz --delete dist/ admin@server:/var/www/show-your-skills/current/
```

**方式3: 使用 Git + 服务器构建**:
```bash
# 在服务器上
cd /home/admin
git clone https://github.com/username/show-your-skills.git
cd show-your-skills

# 安装依赖并构建
npm ci
npm run build

# 部署
./scripts/deploy.sh
```

### 3.4 部署脚本

创建 `scripts/deploy.sh`:

```bash
#!/bin/bash
set -e

# 配置
PROJECT_DIR="/home/admin/game/show-your-skills"
DEPLOY_DIR="/var/www/show-your-skills"
VERSION=$(node -p "require('./package.json').version")
RELEASE_DIR="$DEPLOY_DIR/releases/v$VERSION"

echo "🚀 Deploying version $VERSION..."

# 构建
cd $PROJECT_DIR
npm ci
npm run build

# 创建发布目录
mkdir -p $RELEASE_DIR

# 复制文件
cp -r dist/* $RELEASE_DIR/

# 更新软链接
cd $DEPLOY_DIR
ln -sfn releases/v$VERSION current

# 清理旧版本（保留最近5个）
cd $DEPLOY_DIR/releases
ls -t | tail -n +6 | xargs -r rm -rf

echo "✅ Deployed version $VERSION successfully!"
```

---

## 4. 后端部署

### 4.1 项目结构

```
/home/admin/game/show-your-skills/server/
├── dist/              # 编译产物
├── src/               # 源代码
├── node_modules/      # 依赖
├── game.db           # 数据库
├── .env              # 环境变量
└── package.json
```

### 4.2 编译后端

```bash
cd /home/admin/game/show-your-skills/server

# 安装依赖
npm ci --production

# 编译 TypeScript
npm run build

# 验证
ls -la dist/
```

### 4.3 配置环境变量

创建 `.env` 文件:

```bash
cat > /home/admin/game/show-your-skills/server/.env << EOF
# 环境
NODE_ENV=production

# 服务器
PORT=3001
HOST=0.0.0.0

# 数据库
DB_PATH=./game.db

# 安全
JWT_SECRET=$(openssl rand -hex 32)
SESSION_SECRET=$(openssl rand -hex 32)

# 日志
LOG_LEVEL=info

# 速率限制
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000

# CORS
CORS_ORIGIN=https://show-your-skills.com

# WebSocket
WS_HEARTBEAT_INTERVAL=30000
WS_HEARTBEAT_TIMEOUT=60000
EOF

# 保护环境变量
chmod 600 .env
```

### 4.4 创建 Systemd 服务

创建服务文件:

```bash
sudo tee /etc/systemd/user/show-your-skills-api.service > /dev/null << 'EOF'
[Unit]
Description=Show Your Skills API Server
Documentation=https://github.com/username/show-your-skills
After=network.target

[Service]
Type=simple
User=admin
Group=admin
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

# 日志
StandardOutput=journal
StandardError=journal
SyslogIdentifier=show-your-skills-api

[Install]
WantedBy=default.target
EOF
```

### 4.5 启动服务

```bash
# 重载 systemd
systemctl --user daemon-reload

# 启动服务
systemctl --user start show-your-skills-api

# 设置开机自启
systemctl --user enable show-your-skills-api

# 查看状态
systemctl --user status show-your-skills-api

# 查看日志
journalctl --user -u show-your-skills-api -f
```

### 4.6 部署脚本

创建 `scripts/deploy-server.sh`:

```bash
#!/bin/bash
set -e

PROJECT_DIR="/home/admin/game/show-your-skills/server"
SERVICE_NAME="show-your-skills-api"

echo "🚀 Deploying server..."

cd $PROJECT_DIR

# 拉取最新代码（如果使用 Git）
git pull origin main

# 安装依赖
npm ci --production

# 编译
npm run build

# 运行数据库迁移
npm run migrate

# 重启服务
systemctl --user restart $SERVICE_NAME

# 等待启动
sleep 3

# 检查状态
if systemctl --user is-active --quiet $SERVICE_NAME; then
    echo "✅ Server deployed successfully!"
else
    echo "❌ Server failed to start!"
    journalctl --user -u $SERVICE_NAME -n 50
    exit 1
fi
```

---

## 5. 反向代理配置

### 5.1 Nginx 配置

创建 Nginx 配置文件:

```bash
sudo tee /etc/nginx/conf.d/show-your-skills.conf > /dev/null << 'EOF'
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
EOF
```

### 5.2 测试配置

```bash
# 测试 Nginx 配置
sudo nginx -t

# 重载配置
sudo systemctl reload nginx
```

---

## 6. SSL 配置

### 6.1 安装 Certbot

```bash
# Rocky Linux
sudo dnf install certbot python3-certbot-nginx -y

# Ubuntu
sudo apt install certbot python3-certbot-nginx -y
```

### 6.2 获取 SSL 证书

```bash
# 创建目录
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

### 6.3 自动续期

```bash
# 测试续期
sudo certbot renew --dry-run

# 添加定时任务
sudo crontab -e

# 添加以下行（每天检查两次）
0 0,12 * * * /usr/bin/certbot renew --quiet --post-hook "systemctl reload nginx"
```

---

## 7. 监控和日志

### 7.1 日志管理

**Nginx 日志**:
```bash
# 查看访问日志
sudo tail -f /var/log/nginx/show-your-skills.access.log

# 查看错误日志
sudo tail -f /var/log/nginx/show-your-skills.error.log
```

**API 日志**:
```bash
# 查看实时日志
journalctl --user -u show-your-skills-api -f

# 查看最近100行
journalctl --user -u show-your-skills-api -n 100

# 查看今天的日志
journalctl --user -u show-your-skills-api --since today
```

### 7.2 日志轮转

创建日志轮转配置:

```bash
sudo tee /etc/logrotate.d/show-your-skills > /dev/null << 'EOF'
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
        [ -f /var/run/nginx.pid ] && kill -USR1 `cat /var/run/nginx.pid`
    endscript
}
EOF
```

### 7.3 监控脚本

创建健康检查脚本 `scripts/health-check.sh`:

```bash
#!/bin/bash

API_URL="http://localhost:3001/api/health"
ALERT_EMAIL="your-email@example.com"

response=$(curl -s -o /dev/null -w "%{http_code}" $API_URL)

if [ $response -ne 200 ]; then
    echo "API is down! HTTP Status: $response"
    echo "API is down at $(date)" | mail -s "API Alert" $ALERT_EMAIL
    systemctl --user restart show-your-skills-api
fi
```

添加定时检查:

```bash
crontab -e

# 每5分钟检查一次
*/5 * * * * /home/admin/game/show-your-skills/scripts/health-check.sh
```

---

## 8. 备份策略

### 8.1 数据库备份

创建备份脚本 `scripts/backup-db.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/home/admin/backups"
DB_PATH="/home/admin/game/show-your-skills/server/game.db"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/game_$DATE.db"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
cp $DB_PATH $BACKUP_FILE

# 压缩
gzip $BACKUP_FILE

# 删除30天前的备份
find $BACKUP_DIR -name "game_*.db.gz" -mtime +30 -delete

echo "Backup created: $BACKUP_FILE.gz"
```

### 8.2 自动备份

```bash
crontab -e

# 每天凌晨2点备份
0 2 * * * /home/admin/game/show-your-skills/scripts/backup-db.sh
```

### 8.3 恢复数据库

```bash
# 停止服务
systemctl --user stop show-your-skills-api

# 恢复数据库
gunzip -c /home/admin/backups/game_20260224_020000.db.gz > /home/admin/game/show-your-skills/server/game.db

# 启动服务
systemctl --user start show-your-skills-api
```

---

## 9. 故障排查

### 9.1 常见问题

#### 服务无法启动

```bash
# 检查日志
journalctl --user -u show-your-skills-api -n 50

# 检查端口占用
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
sudo tail -f /var/log/nginx/show-your-skills.error.log

# 测试 WebSocket
wscat -c wss://show-your-skills.com/ws
```

#### 数据库错误

```bash
# 检查数据库文件
ls -la /home/admin/game/show-your-skills/server/game.db

# 检查数据库完整性
sqlite3 /home/admin/game/show-your-skills/server/game.db "PRAGMA integrity_check;"

# 恢复备份
./scripts/backup-db.sh
```

### 9.2 性能问题

#### 内存占用高

```bash
# 检查内存使用
free -h
ps aux --sort=-%mem | head

# 重启服务
systemctl --user restart show-your-skills-api
```

#### CPU 占用高

```bash
# 检查 CPU 使用
top -p $(pgrep -f "node dist/index.js")

# 检查日志是否有异常
journalctl --user -u show-your-skills-api -f
```

---

## 10. 更新日志

- **2026-02-24**: 创建部署文档 v1.0

---

## 11. 附录

### 11.1 有用的命令

```bash
# 查看服务状态
systemctl --user status show-your-skills-api

# 重启服务
systemctl --user restart show-your-skills-api

# 查看端口
ss -tulpn | grep 3001

# 查看进程
ps aux | grep node

# 实时日志
journalctl --user -u show-your-skills-api -f

# Nginx 状态
sudo systemctl status nginx

# 重载 Nginx
sudo systemctl reload nginx

# 检查 SSL 证书
sudo certbot certificates
```

### 11.2 联系方式

- 技术支持: support@show-your-skills.com
- GitHub Issues: https://github.com/username/show-your-skills/issues
