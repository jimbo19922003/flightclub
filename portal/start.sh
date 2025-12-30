#!/bin/sh
set -e

# Wait for the database to be ready (simple sleep for now, could be robustified)
echo "Waiting for database to be ready..."
sleep 5

# Run migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Start the application
echo "Starting application..."
node server.js
