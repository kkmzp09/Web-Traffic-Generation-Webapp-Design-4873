#!/bin/bash
# Restore from backup

BACKUP_DIR="/root/backups"

echo "=========================================="
echo "  Backup Restore Tool"
echo "=========================================="
echo ""

# List available backups
echo "Available backups:"
echo ""
ls -lh "$BACKUP_DIR"/*.tar.gz 2>/dev/null | awk '{print NR". "$9" ("$5")"}'
echo ""

# Get backup file
if [ -z "$1" ]; then
    echo "Usage: $0 <backup_file.tar.gz>"
    echo ""
    echo "Example:"
    echo "  $0 relay_backup_20241026_020000.tar.gz"
    echo ""
    exit 1
fi

BACKUP_FILE="$1"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"

if [ ! -f "$BACKUP_PATH" ]; then
    echo "❌ Backup file not found: $BACKUP_PATH"
    exit 1
fi

echo "Restoring from: $BACKUP_FILE"
echo ""

# Confirm
read -p "⚠️  This will overwrite current files. Continue? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled"
    exit 0
fi

# Create restore directory
RESTORE_DIR="/tmp/restore_$(date +%s)"
mkdir -p "$RESTORE_DIR"

# Extract backup
echo "[1/5] Extracting backup..."
tar -xzf "$BACKUP_PATH" -C "$RESTORE_DIR"
EXTRACTED_DIR=$(ls -d "$RESTORE_DIR"/relay_backup_* | head -1)
echo "✓ Backup extracted"
echo ""

# Backup current files
echo "[2/5] Backing up current files..."
cp -r /root/relay /root/relay_before_restore_$(date +%s)
echo "✓ Current files backed up"
echo ""

# Restore server files
echo "[3/5] Restoring server files..."
cp "$EXTRACTED_DIR"/*.js /root/relay/ 2>/dev/null
cp "$EXTRACTED_DIR"/.env /root/relay/ 2>/dev/null
cp "$EXTRACTED_DIR"/package.json /root/relay/ 2>/dev/null
echo "✓ Server files restored"
echo ""

# Restore database
echo "[4/5] Restoring database..."
if [ -f "$EXTRACTED_DIR/database_backup.sql" ]; then
    export $(cat /root/relay/.env | xargs)
    psql "$DATABASE_URL" < "$EXTRACTED_DIR/database_backup.sql"
    echo "✓ Database restored"
else
    echo "⚠ No database backup found"
fi
echo ""

# Restart services
echo "[5/5] Restarting services..."
pm2 restart all
echo "✓ Services restarted"
echo ""

# Cleanup
rm -rf "$RESTORE_DIR"

echo "=========================================="
echo "  Restore Complete!"
echo "=========================================="
echo ""
echo "Check server status:"
echo "  pm2 status"
echo ""
