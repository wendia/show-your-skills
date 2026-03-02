#!/bin/bash

if [ -z "$1" ]; then
    echo "Usage: $0 <backup_file>"
    echo "Available backups:"
    ls -t /var/lib/show-your-skills/backups/db/*.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE=$1
DB_PATH="/var/lib/show-your-skills/game.db"
SERVICE_NAME="show-your-skills-api"

# Stop service
echo "Stopping service..."
systemctl --user stop $SERVICE_NAME

# Backup current database
if [ -f "$DB_PATH" ]; then
    cp $DB_PATH "${DB_PATH}.bak.$(date +%Y%m%d_%H%M%S)"
fi

# Restore database
if [[ $BACKUP_FILE == *.gz ]]; then
    gunzip -c $BACKUP_FILE > $DB_PATH
else
    cp $BACKUP_FILE $DB_PATH
fi

echo "✅ Database restored from $BACKUP_FILE"

# Start service
echo "Starting service..."
systemctl --user start $SERVICE_NAME
