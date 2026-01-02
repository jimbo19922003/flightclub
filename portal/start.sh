#!/bin/sh
set +e

echo "Starting deployment script..."

# Wait for database
echo "Waiting for database connection..."
until nc -z -v -w30 db 5432
do
  echo "Waiting for database connection..."
  sleep 2
done
echo "Database is up!"

# Push schema to DB
echo "Pushing database schema..."
npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss
if [ $? -ne 0 ]; then
    echo "ERROR: prisma db push failed. Retrying..."
    sleep 5
    npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss
fi

# Run seed
echo "Seeding database..."
npm run seed

# Start the application
echo "Starting application..."
npm start
