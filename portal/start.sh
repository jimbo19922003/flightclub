#!/bin/sh
set +e

echo "Starting deployment script..."

# Robust wait for database
echo "Waiting for database connection..."
until pg_isready -h db -p 5432 -U postgres
do
  echo "Waiting for database connection..."
  sleep 2
done
echo "Database is up!"

# Force regenerate client at runtime
echo "Regenerating Prisma Client..."
./node_modules/.bin/prisma generate --schema=./prisma/schema.prisma

# Push schema to DB
echo "Pushing database schema..."
./node_modules/.bin/prisma db push --schema=./prisma/schema.prisma --accept-data-loss --skip-generate
PUSH_EXIT_CODE=$?
if [ $PUSH_EXIT_CODE -ne 0 ]; then
    echo "ERROR: prisma db push failed with exit code $PUSH_EXIT_CODE"
    # Attempt to continue, but likely will fail
else
    echo "Database schema pushed successfully."
fi

# Run seed
echo "Seeding database..."
export NODE_PATH=/usr/local/lib/node_modules:/app/node_modules
ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
SEED_EXIT_CODE=$?
if [ $SEED_EXIT_CODE -ne 0 ]; then
    echo "WARNING: Seeding failed with exit code $SEED_EXIT_CODE"
    # Fallback: if seed fails, we try to create the missing table via raw SQL or just log it
    # But usually db push should have created it.
else
    echo "Database seeded successfully."
fi

# Start the application
echo "Starting application..."
node server.js
