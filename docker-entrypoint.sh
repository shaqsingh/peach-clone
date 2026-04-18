#!/bin/sh
set -e

# Fix permissions for the volumes mounted by DigitalOcean (which often default to root)
echo "🔧 Fixing volume permissions..."
chown -R nextjs:nodejs /app/data /app/public/uploads

# Run prisma db push to ensure database schema is up-to-date
echo "🚢 Syncing database schema..."
# Use node_modules/.bin/prisma if available (it will be, since we moved it to dependencies)
# This is faster than npx and works without internet
if [ -f "./node_modules/.bin/prisma" ]; then
    echo "✅ Using local Prisma binary"
    su-exec nextjs ./node_modules/.bin/prisma db push --accept-data-loss
else
    echo "⚠️ Local Prisma not found, falling back to npx"
    su-exec nextjs npx prisma db push --accept-data-loss
fi

# Start the application
echo "🚀 Starting Peach Clone on ${HOSTNAME:-0.0.0.0}:${PORT:-3000}..."
exec su-exec nextjs node server.js
