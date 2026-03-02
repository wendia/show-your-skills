#!/bin/bash
set -e

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

# Check if version exists
if [ ! -d "$DEPLOY_DIR/releases/v$VERSION" ]; then
    echo "❌ Version $VERSION not found"
    exit 1
fi

# Switch version
cd $DEPLOY_DIR
ln -sfn releases/v$VERSION current

# Restart service
echo "🔄 Restarting service..."
systemctl --user restart $SERVICE_NAME

# Wait for startup
sleep 5

# Health check
echo "🏥 Running health check..."
if curl -s http://localhost:3001/api/health | grep -q "ok"; then
    echo "✅ Rollback successful!"
else
    echo "❌ Rollback failed!"
    exit 1
fi
