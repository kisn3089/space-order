# syntax=docker.io/docker/dockerfile:1

FROM node:20-alpine AS base

# Stage 1: Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy root package files for monorepo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/orderhub/package.json ./apps/orderhub/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY packages/auth/package.json ./packages/auth/package.json
COPY packages/api/package.json ./packages/api/package.json

# Install dependencies with pnpm
RUN corepack enable pnpm && pnpm i --frozen-lockfile

# Copy prisma schema and .env, then generate client
COPY packages/db/prisma ./packages/db/prisma
COPY .env ./.env
RUN pnpm --filter=@spaceorder/db exec prisma generate

# Development stage
FROM deps AS development
WORKDIR /app

ENV NODE_ENV=development

EXPOSE 8080

CMD ["sh", "-c", "corepack enable pnpm && pnpm prisma:deploy && if [ \"$RUN_PRISMA_SEED\" = \"true\" ]; then pnpm prisma:seed; fi && pnpm --filter=@spaceorder/orderhub start:dev"]



# Stage 2: Builder
FROM base AS builder
WORKDIR /app

# Copy node_modules from deps
COPY --from=deps /app/node_modules ./node_modules

# Copy all source code for monorepo
COPY . .

# Build using turbo
RUN corepack enable pnpm && pnpm build --filter=orderhub

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
COPY --from=builder --chown=nestjs:nodejs /app/apps/orderhub/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json

USER nestjs

EXPOSE 8080

CMD ["node", "dist/main"]
