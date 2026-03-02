#!/bin/bash
# 开发环境启动脚本

set -e

PROJECT_DIR="/home/admin/game/show-your-skills"
SERVER_DIR="$PROJECT_DIR/server"
LOG_DIR="/tmp/show-your-skills"

mkdir -p $LOG_DIR

echo "========================================"
echo "  Show Your Skills - Dev Environment"
echo "========================================"
echo ""

# 1. 构建后端
echo "📦 Building backend..."
cd $SERVER_DIR
npm run build 2>&1 | tail -5

# 2. 启动后端服务器
echo ""
echo "🚀 Starting backend server on http://localhost:3001..."

# 停止现有进程
pkill -f "node.*dist/index.js" 2>/dev/null || true
sleep 1

# 启动服务器
nohup node dist/index.js > "$LOG_DIR/server.log" 2>&1 &
SERVER_PID=$!
echo $SERVER_PID > "$LOG_DIR/server.pid"
echo "   PID: $SERVER_PID"

# 等待服务器启动
sleep 3

# 检查服务器
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "   ✅ Server is healthy"
else
    echo "   ⚠️ Server may still be starting..."
    echo ""
    echo "Server log:"
    tail -10 "$LOG_DIR/server.log" 2>/dev/null
fi

echo ""
echo "========================================"
echo "  Backend: http://localhost:3001"
echo "  Health:  http://localhost:3001/api/health"
echo "  Logs:    $LOG_DIR/server.log"
echo "========================================"
echo ""
echo "To start frontend, run in another terminal:"
echo "  cd $PROJECT_DIR && npm run dev"
echo ""
echo "Or run both together:"
echo "  cd $PROJECT_DIR && npm run dev:full"
echo ""
