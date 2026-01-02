#!/bin/bash
echo "Stopping containers..."
sudo docker compose down

echo "Removing old portal image..."
sudo docker rmi portal_portal:latest flight-club-portal 2>/dev/null

echo "Rebuilding (ignoring cache to ensure new dependencies)..."
sudo docker compose build --no-cache portal
sudo docker compose up -d

echo "Showing logs (Ctrl+C to exit)..."
sudo docker compose logs -f portal
