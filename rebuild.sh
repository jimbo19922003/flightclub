#!/bin/bash
echo "Stopping containers..."
docker-compose down

echo "Removing old portal image to force rebuild..."
docker rmi portal_portal:latest flight-club-portal 2>/dev/null

echo "Rebuilding and starting..."
docker-compose up -d --build

echo "Showing logs (Ctrl+C to exit)..."
docker-compose logs -f portal
