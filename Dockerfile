FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl build-base python3
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Generate prisma client
RUN npx prisma generate
# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install su-exec to handle non-root execution after permission fixes
RUN apk add --no-cache su-exec

COPY --from=builder /app/public ./public
# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static/
COPY --from=builder /app/prisma ./prisma/
COPY --from=builder /app/prisma.config.js ./
COPY docker-entrypoint.sh ./

RUN chmod +x docker-entrypoint.sh
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data
RUN mkdir -p /app/public/uploads && chown nextjs:nodejs /app/public/uploads

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["./docker-entrypoint.sh"]
