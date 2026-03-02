#!/bin/bash

PROJECT_DIR="/home/admin/game/show-your-skills"
SERVER_DIR="$PROJECT_DIR/server"
LOG_DIR="/tmp/show-your-skills"
PID_FILE="$LOG_DIR/server.pid"

mkdir -p $LOG_DIR

start_server() {
    echo "🚀 Starting backend server..."
    cd $SERVER_DIR
    
    # Kill existing process
    if [ -f "$PID_FILE" ]; then
        OLD_PID=$(cat $PID_FILE)
        if kill -0 $OLD_PID 2>/dev/null; then
            echo "Stopping existing server (PID: $OLD_PID)..."
            kill $OLD_PID 2>/dev/null
            sleep 1
        fi
        rm -f $PID_FILE
    fi
    
    # Start new process
    nohup node dist/index.js > "$LOG_DIR/server.log" 2>&1 &
    echo $! > $PID_FILE
    echo "✅ Server started (PID: $(cat $PID_FILE))"
    
    sleep 2
    
    # Check if running
    if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
        echo "✅ Server is healthy"
    else
        echo "⚠️ Server may not be ready yet"
        echo "Log:"
        tail -20 "$LOG_DIR/server.log"
    fi
}

stop_server() {
    echo "🛑 Stopping backend server..."
    
    if [ -f "$PID_FILE" ]; then
        PID=$(cat $PID_FILE)
        if kill -0 $PID 2>/dev/null; then
            kill $PID
            echo "✅ Server stopped (PID: $PID)"
        fi
        rm -f $PID_FILE
    else
        echo "No PID file found"
        pkill -f "node dist/index.js" 2>/dev/null
    fi
}

status() {
    echo "📊 Server Status:"
    
    if [ -f "$PID_FILE" ]; then
        PID=$(cat $PID_FILE)
        if kill -0 $PID 2>/dev/null; then
            echo "✅ Server running (PID: $PID)"
        else
            echo "❌ Server not running (stale PID file)"
        fi
    else
        echo "❌ Server not running"
    fi
    
    echo ""
    echo "Health check:"
    curl -s http://localhost:3001/api/health 2>/dev/null || echo "❌ Server not responding"
    echo ""
}

logs() {
    echo "📜 Server logs:"
    tail -50 "$LOG_DIR/server.log" 2>/dev/null || echo "No logs found"
}

case "$1" in
    start)
        start_server
        ;;
    stop)
        stop_server
        ;;
    restart)
        stop_server
        sleep 1
        start_server
        ;;
    status)
        status
        ;;
    logs)
        logs
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs}"
        exit 1
        ;;
esac
