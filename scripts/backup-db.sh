#!/bin/bash

BACKUP_DIR="/var/lib/show-your-skills/backups/db"
DB_PATH="/var/lib/show-your-skills/game.db"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/game_$DATE.db"
KEEP_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
if [ -f "$DB_PATH" ]; then
    cp $DB_PATH $BACKUP_FILE
    
    # Compress
    gzip $BACKUP_FILE
    
    echo "✅ Backup created: $BACKUP_FILE.gz"
    
    # Clean old backups
    find $BACKUP_DIR -name "game_*.db.gz" -mtime +$KEEP_DAYS -delete
    echo "✅ Old backups cleaned (keeping last $KEEP_DAYS days)"
else
    echo "❌ Database not found: $DB_PATH"
    exit 1
fi
