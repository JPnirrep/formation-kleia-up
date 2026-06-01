#!/bin/bash
# Backup quotidien PostgreSQL
BACKUP_DIR="/opt/kleia-up/backups"
RETENTION_DAYS=7
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

# Dump PostgreSQL
docker exec kleia-db pg_dump -U kleia_user kleia_lms > "$BACKUP_DIR/kleia_lms_${TIMESTAMP}.sql"

# Compresser
gzip "$BACKUP_DIR/kleia_lms_${TIMESTAMP}.sql"

# Nettoyer les backups > 7 jours
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

BACKUP_SIZE=$(du -h "$BACKUP_DIR/kleia_lms_${TIMESTAMP}.sql.gz" | cut -f1)
echo "Backup terminé: kleia_lms_${TIMESTAMP}.sql.gz (${BACKUP_SIZE})"
