# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Turborepo monorepo for a restaurant ordering system using pnpm workspaces.

**Apps:**

- `order` - Customer-facing Next.js 14 app (port 3000)
- `orderdesk` - Admin Next.js 14 app (port 3001)
- `orderhub` - NestJS 11 backend API (port 8080)

**Shared Packages:**

- `@spaceorder/db` - Prisma schema, types, and client (MySQL) - **Single Source of Truth for database**
- `@spaceorder/api` - React Query hooks and axios HTTP client
- `@spaceorder/auth` - Zod schemas for authentication
- `@spaceorder/ui` - Radix UI component library with Tailwind CSS v4
- `@spaceorder/lintconfig` - ESLint 9 FlatConfig
- `@spaceorder/tsconfig` - Shared TypeScript configs

## Commands

**Always use `pnpm`** (requires 9.0.0+, Node.js >=18)

```bash
# Development
pnpm dev                           # All apps
pnpm dev:order                     # Customer app (3000)
pnpm dev:orderdesk                 # Admin app (3001)
pnpm dev:orderhub                  # Backend API (8080)

# Build & Quality
pnpm build                         # Build all
pnpm check-types                   # Type check all
pnpm lint                          # Lint all
pnpm format                        # Format all

# Database (from root)
pnpm --filter=@spaceorder/db prisma:generate   # Generate client
pnpm --filter=@spaceorder/db prisma:migrate    # Run migrations
pnpm --filter=@spaceorder/db prisma:studio     # Open Prisma Studio
pnpm --filter=@spaceorder/db prisma:seed       # Seed database
pnpm --filter=@spaceorder/db prisma:reset      # Reset database

# Testing (orderhub only)
pnpm --filter=orderhub test        # Run unit tests
pnpm --filter=orderhub test:watch  # Watch mode
pnpm --filter=orderhub test:e2e    # E2E tests

# Filter syntax for specific packages
pnpm build --filter=order
pnpm lint --filter=@spaceorder/ui
```

## Architecture

### Database (SSOT)

All database configuration lives in `apps/orderhub/.env`. The `@spaceorder/db` package is the single source of truth:

```typescript
// Import types and client
import { PrismaClient } from "@spaceorder/db";
import type { Admin, Order, OrderStatus } from "@spaceorder/db";
```

**Models:** Admin, Owner, Store, Menu, Order, OrderItem

**Enums:** AdminRole (SUPER, SUPPORT, VIEWER), OrderStatus (PENDING, ACCEPTED, PREPARING, COMPLETED, CANCELLED)

Always run `prisma:generate` after schema changes.

### Backend (orderhub)

- CommonJS module system (not ESM)
- JWT access/refresh token auth with cookies
- Custom decorators: `@ZodValidation()`, `@CurrentUser()`
- Guards: LocalAuthGuard, JwtAuthGuard, JwtRefreshAuthGuard
- BigInt serialization configured in `src/main.ts`

### Frontend Apps

- Both use React Compiler (`reactCompiler: true` in next.config.js)
- ESM module system (`"type": "module"`)
- Tailwind CSS v4 with PostCSS
- `orderdesk` has `transpilePackages: ["@spaceorder/ui"]`

### Package Dependencies

```text
order → @spaceorder/ui
orderdesk → @spaceorder/api, @spaceorder/db, @spaceorder/ui, @spaceorder/auth
orderhub → @spaceorder/db, @spaceorder/api, @spaceorder/auth
@spaceorder/api → @spaceorder/db, @spaceorder/auth
```

## TypeScript Standards

**NEVER use type assertions (`as`)** to solve type errors. Use proper type design instead:

```typescript
// Bad
return data as T;

// Good - use generics with defaults, intersection types, or type narrowing
async getMenuById<T = PublicMenu>(...): Promise<PublicMenu & T> {
  return await prismaService.menu.findFirstOrThrow(...);
}
```

## Environment Variables

Central config in `apps/orderhub/.env`:

- `DATABASE_URL` - MySQL connection
- `SERVER_PORT` - Backend port (8080)
- `JWT_ACCESS_TOKEN_SECRET`, `JWT_ACCESS_TOKEN_EXPIRATION_MS`
- `JWT_REFRESH_TOKEN_SECRET`, `JWT_REFRESH_TOKEN_EXPIRATION_MS`

## Troubleshooting

| Issue                       | Solution                                                            |
| --------------------------- | ------------------------------------------------------------------- |
| Prisma Client not generated | `pnpm --filter=@spaceorder/db prisma:generate`                      |
| Type imports not working    | Ensure `@spaceorder/db` is in `dependencies`, not `devDependencies` |
| Module resolution errors    | `pnpm install` at root                                              |
| Hot-reload not working      | Check nodemon is watching `src/` directory                          |
