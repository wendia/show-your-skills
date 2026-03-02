#!/bin/bash

echo "========================================"
echo "  Show Your Skills - 开发环境"
echo "========================================"

cd /home/admin/game/show-your-skills

# 启动后端
echo ""
echo "🚀 启动后端服务器..."
cd server
pkill -f "node dist/index.js" 2>/dev/null || true
sleep 1
nohup node dist/index.js > /tmp/backend.log 2>&1 &
echo "   后端: http://localhost:3001"

# 等待后端启动
sleep 3

# 检查后端
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "   ✅ 后端就绪"
else
    echo "   ⚠️ 后端可能未就绪"
    cat /tmp/backend.log 2>/dev/null | tail -10
fi

# 启动前端
echo ""
echo "🚀 启动前端开发服务器..."
cd /home/admin/game/show-your-skills
pkill -f "vite" 2>/dev/null || true
sleep 1
nohup npx vite --host > /tmp/frontend.log 2>&1 &
echo "   前端: http://localhost:5173"

# 等待前端启动
sleep 5

# 检查前端
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "   ✅ 前端就绪"
else
    echo "   ⚠️ 前端可能未就绪"
    cat /tmp/frontend.log 2>/dev/null | tail -10
fi

echo ""
echo "========================================"
echo "  访问地址"
echo "========================================"
echo "  前端: http://localhost:5173"
echo "  后端: http://localhost:3001"
echo "========================================"
echo ""
echo "日志位置:"
echo "  后端: /tmp/backend.log"
echo "  前端: /tmp/frontend.log"
echo ""
