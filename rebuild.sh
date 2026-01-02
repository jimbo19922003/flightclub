#!/bin/bash
echo "Stopping containers..."
docker compose down

echo "Removing old portal image..."
docker rmi portal_portal:latest flight-club-portal 2>/dev/null

echo "Rebuilding (ignoring cache to ensure new dependencies)..."
docker compose build --no-cache portal
docker compose up -d

echo "Showing logs (Ctrl+C to exit)..."
docker compose logs -f portal
