#!/bin/bash

# NutriScanVN Database Backup Script
# Usage: ./backup.sh

set -e

# Configuration
BACKUP_DIR="./backups"
DB_NAME="nutriscanvn"
DB_USER="postgres"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/nutriscanvn_${TIMESTAMP}.sql"

# Create backup directory if it doesn't exist
mkdir -p ${BACKUP_DIR}

echo "🔄 Starting database backup..."
echo "Database: ${DB_NAME}"
echo "Timestamp: ${TIMESTAMP}"

# Create backup
if docker-compose exec -T postgres pg_dump -U ${DB_USER} ${DB_NAME} > ${BACKUP_FILE}; then
    echo "✅ Backup completed successfully!"
    echo "📁 Backup file: ${BACKUP_FILE}"
    
    # Compress backup
    gzip ${BACKUP_FILE}
    echo "🗜️  Compressed: ${BACKUP_FILE}.gz"
    
    # Delete backups older than 30 days
    find ${BACKUP_DIR} -name "*.sql.gz" -mtime +30 -delete
    echo "🧹 Cleaned up old backups (30+ days)"
    
    # Show backup size
    BACKUP_SIZE=$(du -h "${BACKUP_FILE}.gz" | cut -f1)
    echo "📦 Backup size: ${BACKUP_SIZE}"
    
    # List recent backups
    echo ""
    echo "📋 Recent backups:"
    ls -lh ${BACKUP_DIR}/*.sql.gz | tail -5
else
    echo "❌ Backup failed!"
    exit 1
fi

echo ""
echo "✨ Backup process completed!"
