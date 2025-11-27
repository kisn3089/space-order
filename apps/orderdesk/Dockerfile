# syntax=docker.io/docker/dockerfile:1

FROM node:20-alpine AS base

# 1. Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy root package files for monorepo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/orderdesk/package.json ./apps/orderdesk/package.json
COPY packages/ui/package.json ./packages/ui/package.json
COPY packages/tsconfig/package.json ./packages/tsconfig/package.json
COPY packages/lintconfig/package.json ./packages/lintconfig/package.json

# Install dependencies with pnpm
RUN corepack enable pnpm && pnpm i --frozen-lockfile

# Development stage
FROM deps AS development
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3001

CMD ["sh", "-c", "corepack enable pnpm && pnpm dev --filter=orderdesk"]

# 2. Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy node_modules from deps
COPY --from=deps /app/node_modules ./node_modules

# Copy all source code for monorepo
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Build using turbo
RUN corepack enable pnpm && pnpm build --filter=orderdesk

# 3. Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder --chown=nextjs:nodejs /app/apps/orderdesk/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/orderdesk/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/orderdesk/.next/static ./apps/orderdesk/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/orderdesk/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/orderdesk/public ./apps/orderdesk/public

USER nextjs

EXPOSE 3001

ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/orderdesk/server.js"]
