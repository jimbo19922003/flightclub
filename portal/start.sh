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

# Debug: Check if we can list tables (verifies auth and DB existence)
echo "Verifying database access..."
PGPASSWORD=postgres psql -h db -U postgres -d flightclub -c "\dt" || echo "Warning: Could not list tables, but proceeding..."

# Force regenerate client at runtime
echo "Regenerating Prisma Client..."
prisma generate --schema=./prisma/schema.prisma

# Retry loop for db push
MAX_RETRIES=5
COUNT=0
while [ $COUNT -lt $MAX_RETRIES ]; do
    echo "Attempting to push schema (Try $((COUNT+1))/$MAX_RETRIES)..."
    prisma db push --schema=./prisma/schema.prisma --accept-data-loss --skip-generate
    if [ $? -eq 0 ]; then
        echo "Schema push successful!"
        break
    fi
    echo "Schema push failed. Retrying in 5 seconds..."
    sleep 5
    COUNT=$((COUNT+1))
done

if [ $COUNT -eq $MAX_RETRIES ]; then
    echo "ERROR: Failed to push schema after $MAX_RETRIES attempts. Exiting."
    exit 1
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
