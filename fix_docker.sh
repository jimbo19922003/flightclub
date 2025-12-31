#!/bin/bash
echo "Cleaning up Docker environment..."

# Stop containers
docker compose down --remove-orphans

# Force remove the specific containers if they are stuck
docker rm -f flight-club-portal flight-club-db 2>/dev/null

# Prune networks to ensure fresh binding
docker network prune -f

echo "Docker environment cleaned. You can now try 'docker compose up -d' again."
