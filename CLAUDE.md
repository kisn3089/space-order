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
- `@spaceorder/auth` - Zod schemas and JWT utilities (jwt-decode)
- `@spaceorder/ui` - Radix UI component library with Tailwind CSS v4
- `@spaceorder/lintconfig` - ESLint 9 FlatConfig
- `@spaceorder/tsconfig` - Shared TypeScript configs (base, nextjs, react-library)

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
pnpm --filter=orderhub test:cov    # Coverage report
pnpm --filter=orderhub test:e2e    # E2E tests

# Filter syntax for specific packages
pnpm build --filter=order
pnpm lint --filter=@spaceorder/ui
```

## Architecture

### Database (SSOT)

All database configuration lives in the root `.env` file. The `@spaceorder/db` package is the single source of truth:

```typescript
// Import types and client
import { PrismaClient } from "@spaceorder/db";
import type {
  Admin,
  Order,
  OrderStatus,
  Table,
  TableSession,
} from "@spaceorder/db";
```

**Models:** Admin, Owner, Store, Table, Menu, Order, OrderItem, TableSession

**Enums:**

- `AdminRole` - SUPER, SUPPORT, VIEWER
- `OrderStatus` - PENDING, ACCEPTED, PREPARING, COMPLETED, CANCELLED
- `TableSessionStatus` - WAITING_ORDER, ACTIVE, PAYMENT_PENDING, CLOSED

**Key Design Patterns:**

- BigInt primary keys with cuid2 public IDs
- Soft delete for Menu (deletedAt)
- JSON fields for menu options and order item snapshots

Always run `prisma:generate` after schema changes.

### Backend (orderhub)

- CommonJS module system (not ESM)
- **Config:** `ConfigModule` loads from root `.env` (`envFilePath: '../../.env'`)
- **API Documentation:** Swagger UI at `/docs`
- **Modules:** Admin, Owner, Store, Menu, Order, OrderItem, Table, TableSession, Token, Me
- JWT access/refresh token auth with HTTP-only cookies
- Custom decorators: `@ZodValidation()`, `@CurrentUser()`
- Guards: LocalAuthGuard, JwtAuthGuard, JwtRefreshAuthGuard
- BigInt serialization configured in `src/main.ts`

### Frontend Apps

- Both use React Compiler (`reactCompiler: true` in next.config.js)
- ESM module system (`"type": "module"`)
- Tailwind CSS v4 with PostCSS
- `orderdesk` has `transpilePackages: ["@spaceorder/ui"]`
- `orderdesk` uses React Table v8 for data tables, React Hook Form for forms

### Package Dependencies

```text
order → @spaceorder/ui
orderdesk → @spaceorder/api, @spaceorder/db, @spaceorder/ui, @spaceorder/auth
orderhub → @spaceorder/db, @spaceorder/api
@spaceorder/api → @spaceorder/db, @spaceorder/auth
```

## Git Hooks

**husky** is configured with a pre-push hook that runs `pnpm build` to ensure all packages build successfully before pushing.

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

## Docker

Root `docker-compose.yml` defines all services for local development:

```bash
docker compose up -d              # Start all services
docker compose up -d mysql        # Start only MySQL
docker compose down               # Stop all services
docker compose logs -f orderhub   # View backend logs
```

**Services:**

- `mysql` - MySQL 8.0 database (port: `DB_PORT`, default 3306)
- `orderhub` - NestJS backend API (port: `SERVER_PORT`, default 8080)
- `orderdesk` - Admin Next.js app (port: 3001)
- `order` - Customer Next.js app (port: 3000)
- `prisma-studio` - Database GUI (port: 5555)

## Environment Variables

Central config in root `.env` file:

**Database:**

- `DB_ROOT_PASSWORD` - MySQL root password
- `DB_PORT` - MySQL port (default: 3306)
- `DB_NAME` - Database name
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `DATABASE_URL` - Prisma connection string

**Server:**

- `SERVER_PORT` - Backend port (default: 8080)
- `ORDERHUB_URL` - Backend API URL for frontend apps

**JWT:**

- `JWT_ACCESS_TOKEN_SECRET`, `JWT_ACCESS_TOKEN_EXPIRATION_MS` (default: 1 hour)
- `JWT_REFRESH_TOKEN_SECRET`, `JWT_REFRESH_TOKEN_EXPIRATION_MS` (default: 7 days)
- `JWT_ISSUER` - Token issuer URL
- `JWT_AUDIENCE` - Token audience identifier

## Troubleshooting

| Issue                       | Solution                                                            |
| --------------------------- | ------------------------------------------------------------------- |
| Prisma Client not generated | `pnpm --filter=@spaceorder/db prisma:generate`                      |
| Type imports not working    | Ensure `@spaceorder/db` is in `dependencies`, not `devDependencies` |
| Module resolution errors    | `pnpm install` at root                                              |
| Hot-reload not working      | Check nodemon is watching `src/` directory                          |
| Build fails on push         | husky pre-push hook runs `pnpm build` - fix build errors first      |
