#!/bin/sh
set -e

# Wait for the database to be ready (simple sleep for now, could be robustified)
echo "Waiting for database to be ready..."
sleep 5

# Push schema to DB (using db push for dev environment to avoid migration file dependency)
echo "Pushing database schema..."
npx prisma db push --accept-data-loss

# Run seed
echo "Seeding database..."
npm run seed || echo "Seeding failed, continuing..."

# Start the application
echo "Starting application..."
node server.js
