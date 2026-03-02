#!/bin/bash

echo "=== Show Your Skills Status ==="
echo ""

echo "📊 Service Status:"
systemctl --user status show-your-skills-api --no-pager 2>/dev/null | head -10 || echo "Service not running"
echo ""

echo "🌐 Nginx Status:"
sudo systemctl status nginx --no-pager 2>/dev/null | head -10 || echo "Nginx not running"
echo ""

echo "💾 Database:"
if [ -f "/var/lib/show-your-skills/game.db" ]; then
    ls -lh /var/lib/show-your-skills/game.db
    sqlite3 /var/lib/show-your-skills/game.db "SELECT COUNT(*) as users FROM users; SELECT COUNT(*) as games FROM games;" 2>/dev/null || echo "Database accessible"
else
    echo "Database not found"
fi
echo ""

echo "📦 Disk Usage:"
df -h /var/www/show-your-skills 2>/dev/null || df -h .
echo ""

echo "📈 Recent Logs:"
journalctl --user -u show-your-skills-api -n 5 --no-pager 2>/dev/null || echo "No logs available"
echo ""

echo "✅ Health Check:"
curl -s http://localhost:3001/api/health 2>/dev/null || echo "Service not responding"
echo ""
