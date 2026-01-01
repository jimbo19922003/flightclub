#!/bin/sh
set +e

echo "Starting deployment script..."

# Robust wait for database
echo "Waiting for database connection..."
until nc -z -v -w30 db 5432
do
  echo "Waiting for database connection..."
  # wait for 2 seconds before check again
  sleep 2
done
echo "Database is up!"

# Force regenerate client at runtime to match current schema
echo "Regenerating Prisma Client..."
npx prisma generate

# Push schema to DB
echo "Pushing database schema..."
npx prisma db push --accept-data-loss
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
else
    echo "Database seeded successfully."
fi

# Start the application
echo "Starting application..."
node server.js
