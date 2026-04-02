#!/bin/sh
set -e

# Run prisma db push to ensure database schema is up-to-date
echo "🚢 Syncing database schema..."
npx prisma db push --accept-data-loss

# Start the application
echo "🚀 Starting Peach Clone..."
exec node server.js
