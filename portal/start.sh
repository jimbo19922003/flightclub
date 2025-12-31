#!/bin/sh
set -e

# Wait for the database to be ready (simple sleep for now, could be robustified)
echo "Waiting for database to be ready..."
sleep 5

# Run migrations
echo "Running database migrations..."
prisma migrate deploy || echo "Migration failed, continuing..."

# Run seed
echo "Seeding database..."
npm run seed || echo "Seeding failed, continuing..."

# Start the application
echo "Starting application..."
node server.js
