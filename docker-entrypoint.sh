#!/bin/sh
set -e

# Run prisma db push to ensure database schema is up-to-date
# --accept-data-loss is used for dev convenience, can be changed to migrate deploy for production migrations
echo "🚢 Syncing database schema..."
npx prisma db push --schema=/app/prisma/schema.prisma --accept-data-loss

# Start the application
echo "🚀 Starting Peach Clone..."
exec node server.js
