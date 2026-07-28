#!/bin/bash
set -e

echo "🚀 Starting Deployment of Peach Clone..."

# 1. Pull the latest code
echo "⏬ Pulling latest changes from Git..."
# We fetch and reset to ensure we match the repo exactly, ignoring any local server changes
git fetch origin main
git reset --hard origin/main

# 2. Rebuild and restart containers
echo "🏗️ Building and restarting containers..."
docker compose up -d --build

# 3. Clean up old images to save disk space on the VPS
echo "🧹 Cleaning up old Docker images..."
docker image prune -f

echo "✅ Deployment complete! Check your domain in a few moments."
