#!/bin/bash
set -e

PROJECT_DIR="/home/admin/game/show-your-skills"
DEPLOY_DIR="/var/www/show-your-skills"
SERVICE_NAME="show-your-skills-api"

echo "🚀 Starting deployment..."

# 1. Pull latest code
cd $PROJECT_DIR
echo "📦 Pulling latest code..."
git pull origin main

# 2. Install dependencies
echo "📦 Installing dependencies..."
npm ci
cd server && npm ci && cd ..

# 3. Run tests
echo "🧪 Running tests..."
npm test || true

# 4. Build frontend
echo "🔨 Building frontend..."
npm run build

# 5. Build backend
echo "🔨 Building backend..."
cd server && npm run build && cd ..

# 6. Run database migrations
echo "📊 Running database migrations..."
cd server && npm run migrate && cd ..

# 7. Deploy frontend
echo "📤 Deploying frontend..."
VERSION=$(node -p "require('$PROJECT_DIR/package.json').version")
mkdir -p $DEPLOY_DIR/releases/v$VERSION
cp -r dist/* $DEPLOY_DIR/releases/v$VERSION/
cd $DEPLOY_DIR
ln -sfn releases/v$VERSION current

# 8. Restart backend service
echo "🔄 Restarting backend service..."
systemctl --user restart $SERVICE_NAME

# 9. Wait for startup
echo "⏳ Waiting for service to start..."
sleep 5

# 10. Health check
echo "🏥 Running health check..."
if curl -s http://localhost:3001/api/health | grep -q "ok"; then
    echo "✅ Deployment successful!"
else
    echo "❌ Deployment failed!"
    systemctl --user status $SERVICE_NAME
    exit 1
fi

# 11. Clean up old versions
echo "🧹 Cleaning up old versions..."
cd $DEPLOY_DIR/releases
ls -t | tail -n +6 | xargs -r rm -rf

echo "✅ Deployment completed!"
