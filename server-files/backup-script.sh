#!/bin/bash
# Automated Backup Script for VPS Server
# Backs up important files and database

# Configuration
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="relay_backup_${DATE}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "=========================================="
echo "  Starting Backup: $DATE"
echo "=========================================="
echo ""

# Create backup folder
mkdir -p "$BACKUP_PATH"

# 1. Backup server files
echo "[1/5] Backing up server files..."
cp -r /root/relay/*.js "$BACKUP_PATH/"
cp /root/relay/.env "$BACKUP_PATH/" 2>/dev/null || echo "No .env file found"
cp /root/relay/package.json "$BACKUP_PATH/" 2>/dev/null
echo "✓ Server files backed up"
echo ""

# 2. Backup PM2 configuration
echo "[2/5] Backing up PM2 configuration..."
pm2 save
cp /root/.pm2/dump.pm2 "$BACKUP_PATH/" 2>/dev/null
echo "✓ PM2 config backed up"
echo ""

# 3. Backup database
echo "[3/5] Backing up PostgreSQL database..."
export $(cat /root/relay/.env | xargs)
if [ ! -z "$DATABASE_URL" ]; then
    pg_dump "$DATABASE_URL" > "$BACKUP_PATH/database_backup.sql"
    echo "✓ Database backed up"
else
    echo "⚠ DATABASE_URL not found, skipping database backup"
fi
echo ""

# 4. Backup nginx configuration
echo "[4/5] Backing up nginx configuration..."
mkdir -p "$BACKUP_PATH/nginx"
cp /etc/nginx/sites-available/* "$BACKUP_PATH/nginx/" 2>/dev/null
cp /etc/nginx/nginx.conf "$BACKUP_PATH/nginx/" 2>/dev/null
echo "✓ Nginx config backed up"
echo ""

# 5. Create compressed archive
echo "[5/5] Creating compressed archive..."
cd "$BACKUP_DIR"
tar -czf "${BACKUP_NAME}.tar.gz" "$BACKUP_NAME"
rm -rf "$BACKUP_NAME"
echo "✓ Archive created: ${BACKUP_NAME}.tar.gz"
echo ""

# Get archive size
ARCHIVE_SIZE=$(du -h "${BACKUP_NAME}.tar.gz" | cut -f1)
echo "Archive size: $ARCHIVE_SIZE"
echo ""

# Clean up old backups (keep last 7 days)
echo "Cleaning up old backups (keeping last 7 days)..."
find "$BACKUP_DIR" -name "relay_backup_*.tar.gz" -mtime +7 -delete
REMAINING=$(ls -1 "$BACKUP_DIR"/relay_backup_*.tar.gz 2>/dev/null | wc -l)
echo "✓ Backups remaining: $REMAINING"
echo ""

echo "=========================================="
echo "  Backup Complete!"
echo "  Location: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
echo "=========================================="
