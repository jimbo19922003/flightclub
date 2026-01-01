#!/bin/sh
# Do not exit on error, just log and continue
set +e

echo "Starting deployment script..."

# Wait for the database to be ready
echo "Waiting 5s for database..."
sleep 5

# Push schema to DB
echo "Pushing database schema..."
prisma db push --accept-data-loss
if [ $? -ne 0 ]; then
    echo "WARNING: prisma db push failed!"
fi

# Run seed using global ts-node to avoid dependency issues in standalone mode
echo "Seeding database..."
# We need to link the global packages or ensure they can find the local modules
export NODE_PATH=/usr/local/lib/node_modules:/app/node_modules

ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
if [ $? -ne 0 ]; then
    echo "WARNING: Seeding failed!"
fi

# Start the application
echo "Starting application..."
node server.js
