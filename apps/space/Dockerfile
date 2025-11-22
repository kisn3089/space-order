# syntax=docker.io/docker/dockerfile:1

FROM node:20-alpine AS base

# Stage 1: Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy root package files for monorepo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/space/package.json ./apps/space/package.json

# Install dependencies with pnpm
RUN corepack enable pnpm && pnpm i --frozen-lockfile

# Copy prisma schema and generate client
COPY apps/space/prisma ./apps/space/prisma
RUN cd apps/space && pnpm exec prisma generate

# Development stage
FROM deps AS development
WORKDIR /app

ENV NODE_ENV=development

EXPOSE 8080

CMD ["sh", "-c", "cd apps/space && corepack enable pnpm && pnpm start:dev"]

# Stage 2: Builder
FROM base AS builder
WORKDIR /app

# Copy node_modules from deps
COPY --from=deps /app/node_modules ./node_modules

# Copy all source code for monorepo
COPY . .

# Build using turbo
RUN corepack enable pnpm && pnpm build --filter=space

# Stage 3: Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Create app user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy necessary files
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./

# Copy Prisma schema if it exists
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma

USER nestjs

EXPOSE 8080

CMD ["node", "dist/main"]
