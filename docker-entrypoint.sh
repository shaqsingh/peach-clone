#!/bin/sh
set -e

# Fix permissions for the volumes mounted by DigitalOcean (which often default to root)
echo "🔧 Fixing volume permissions..."
chown -R nextjs:nodejs /app/data /app/public/uploads

# Run prisma db push to ensure database schema is up-to-date
echo "🚢 Syncing database schema..."
su-exec nextjs npx prisma db push --accept-data-loss

# Start the application
echo "🚀 Starting Peach Clone..."
exec su-exec nextjs node server.js
