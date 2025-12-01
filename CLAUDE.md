# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Turborepo monorepo named "space-order" using pnpm workspaces. The project contains Next.js frontend applications, a NestJS backend application, and shared packages including a centralized database package.

## Monorepo Structure

- **Apps** (in `apps/`):
  - `order`: Next.js 14.2.33 frontend app with Tailwind CSS v4 and React Compiler enabled, runs on default port (3000)
  - `orderdesk`: Next.js 14.2.33 admin frontend app, runs on port 3001
  - `orderhub`: NestJS 11.0.1 backend API application with TypeScript and Jest testing, runs on port 8080

- **Shared Packages** (in `packages/`):
  - `@spaceorder/db`: **Centralized database package (SSOT)** - Prisma schema, types, and client
  - `@spaceorder/api`: Frontend API client with React Query hooks and HTTP utilities
  - `@spaceorder/auth`: Authentication utilities and types
  - `@spaceorder/ui`: React 19.2.0 component library exported via `./src/*.tsx` pattern
  - `@spaceorder/lintconfig`: Shared ESLint 9 FlatConfig configurations (base, next, react-internal)
  - `@spaceorder/tsconfig`: Shared TypeScript configurations (base, nextjs, react-library)

## Package Manager

**Always use `pnpm`** for dependency management. This project requires pnpm 9.0.0+ and Node.js >=18.

## Common Commands

### Development

```bash
# Run all apps in development mode
pnpm dev

# Run specific apps
pnpm dev:order       # Run order app (port 3000)
pnpm dev:orderdesk   # Run orderdesk app (port 3001)
pnpm dev:orderhub    # Run orderhub (NestJS) app in watch mode (port 8080)
pnpm dev --filter=order
pnpm dev --filter=orderhub
```

### Building

```bash
# Build all apps and packages
pnpm build

# Build specific app
pnpm build --filter=order
pnpm build --filter=orderhub
pnpm build --filter=@spaceorder/db
```

### Database Operations (Prisma)

```bash
# Generate Prisma Client (from packages/db)
pnpm --filter=@spaceorder/db prisma:generate

# Run database migrations
pnpm --filter=@spaceorder/db prisma:migrate

# Open Prisma Studio
pnpm --filter=@spaceorder/db prisma:studio

# Reset database
pnpm --filter=@spaceorder/db prisma:reset
```

### Linting

```bash
# Lint all packages
pnpm lint

# Lint specific package
pnpm lint --filter=order
pnpm lint --filter=@spaceorder/ui
```

### Type Checking

```bash
# Type check all packages
pnpm check-types

# Type check specific package
pnpm check-types --filter=order
pnpm check-types --filter=orderhub
```

### Formatting

```bash
# Format all TypeScript, TSX, and Markdown files
pnpm format
```

### Component Generation

```bash
# Generate new React component in @spaceorder/ui package
cd packages/ui
pnpm generate:component
```

### Testing (orderhub app)

```bash
# Run unit tests
pnpm --filter=orderhub test

# Run tests in watch mode
pnpm --filter=orderhub test:watch

# Run E2E tests
pnpm --filter=orderhub test:e2e

# Generate coverage report
pnpm --filter=orderhub test:cov
```

## Turborepo Configuration

The `turbo.json` configures task dependencies:

- `build` task depends on `^build` (builds dependencies first), includes `.env*` files
- Outputs: `.next/**`, `dist/**`, `node_modules/.prisma/**`
- `lint` and `check-types` depend on completing these tasks in dependencies first
- `dev` task has caching disabled and is persistent
- `start:dev` task (for orderhub app) has caching disabled and is persistent

## Key Technical Details

### order App (Next.js Frontend)

- Uses Next.js 14.2.33 with App Router
- **React Compiler enabled** via `reactCompiler: true` in next.config.js
- Tailwind CSS v4 with PostCSS (`@tailwindcss/postcss`)
- React 18.3.1 & React DOM 18.3.1
- Path alias: `@/*` maps to `./src/*`
- TypeScript with strict mode, target ES2022
- JSX: preserve (Next.js handles transformation)
- ESM module (`"type": "module"`)
- Imports components from `@spaceorder/ui` workspace package

### orderdesk App (Next.js Admin Frontend)

- Uses Next.js 14.2.33 with App Router
- Runs on port 3001
- React 18.3.1 & React DOM 18.3.1
- Uses `@spaceorder/api` for data fetching with React Query
- Uses `@spaceorder/db` for TypeScript types
- Uses `@spaceorder/ui` for shared components
- Tailwind CSS v4 with PostCSS
- ESM module (`"type": "module"`)

### orderhub App (NestJS Backend)

- Uses NestJS 11.0.1 with Express platform
- TypeScript with decorators and metadata reflection enabled
- Target ES2023, module NodeNext
- Port 8080 (configured via `apps/orderhub/.env`)
- Uses `@spaceorder/db` for Prisma Client and types
- Jest testing framework with ts-jest
- Class-validator and class-transformer for DTO validation
- ESLint with TypeScript-ESLint and Prettier integration
- Main entry point: `src/main.ts`
- Build output: `apps/orderhub/dist/`
- Scripts: `start:dev` (watch mode), `start:debug`, `start:prod`
- Docker support with multi-stage build (development, builder, runner)

### Shared Packages

#### `@spaceorder/db` (Database SSOT)

**Purpose:** Centralized Prisma schema and database types for all apps

**Structure:**
```
packages/db/
├── prisma/
│   ├── schema.prisma          # Database schema (MySQL)
│   └── migrations/            # Migration history
├── src/
│   ├── client.ts              # Re-exports PrismaClient and all Prisma types
│   ├── index.ts               # Main entry point
│   └── types.ts               # (if exists) Additional type exports
├── .env                       # Database configuration (gitignored)
├── .env.example               # Example environment variables
└── package.json
```

**Environment Variables (in `apps/orderhub/.env`):**
- `DATABASE_URL`: MySQL connection string
- `DB_ROOT_PASSWORD`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`

**Usage:**
```typescript
// Import PrismaClient
import { PrismaClient } from '@spaceorder/db/client';

// Import types
import type { Admin, AdminRole, Order, OrderStatus } from '@spaceorder/db/client';
```

**Package.json Scripts:**
- All scripts use `dotenv -e ../../apps/orderhub/.env` to load environment variables
- `prisma:generate`: Generate Prisma Client
- `prisma:migrate`: Run migrations
- `prisma:studio`: Open Prisma Studio
- `build`: Generate client + TypeScript build

**Exports:**
```json
{
  "exports": {
    "./client": "./src/client.ts"
  }
}
```

**Dependencies:**
- `dependencies`: `@prisma/client`
- `devDependencies`: `prisma`, `dotenv-cli`, `typescript`

#### `@spaceorder/api`

**Purpose:** Frontend API client with React Query hooks and HTTP utilities

**Structure:**
```
packages/api/
└── src/
    └── core/
        ├── http.ts              # Axios instance configuration
        └── admin/
            ├── httpAdmin.ts     # Admin API functions
            └── adminQuery.ts    # React Query hooks for admin
```

**Usage:**
```typescript
// Import API hooks
import { getAdminListQuery } from '@spaceorder/api/core/admin/adminQuery';

// Use in component
const { data: admins } = getAdminListQuery();
```

**Dependencies:**
- `@spaceorder/db`: For TypeScript types (Admin, Order, etc.)
- `@tanstack/react-query`: React Query hooks
- `axios`: HTTP client
- `react`: React library

**Exports:**
```json
{
  "exports": {
    "./*": "./src/*"
  }
}
```

#### `@spaceorder/auth`

**Purpose:** Authentication utilities and types

**Dependencies:**
- Workspace packages for shared types

#### `@spaceorder/ui`

**Purpose:** Shared React component library

- Exports components as `./src/*.tsx` (e.g., `@spaceorder/ui/button`)
- Uses React 19.2.0
- Includes Tailwind CSS utilities
- Component examples: button, card, code, sheet, form components

#### `@spaceorder/lintconfig`

- ESLint 9 FlatConfig files
- Import via `@spaceorder/lintconfig/base`, `/next`, or `/react-internal`

#### `@spaceorder/tsconfig`

- TypeScript configurations
- Extend `@spaceorder/tsconfig/base.json`, `/nextjs.json`, or `/react-library.json`

## Workspace Dependencies

Apps use `workspace:*` protocol to reference local packages. Changes to shared packages affect consuming apps during development.

**Key dependency relationships:**
- `orderhub` → `@spaceorder/db`
- `orderdesk` → `@spaceorder/api`, `@spaceorder/db`, `@spaceorder/ui`
- `@spaceorder/api` → `@spaceorder/db`

## Development Workflow

1. **Initial Setup:**
   ```bash
   pnpm install
   ```

2. **Database Setup:**
   ```bash
   # Configure database in apps/orderhub/.env
   # Then generate Prisma Client
   pnpm --filter=@spaceorder/db prisma:generate

   # Run migrations
   pnpm --filter=@spaceorder/db prisma:migrate
   ```

3. **Run Development:**
   ```bash
   # Run all apps
   pnpm dev

   # Or run individually
   pnpm dev:orderhub    # Backend (port 8080)
   pnpm dev:orderdesk   # Admin frontend (port 3001)
   pnpm dev:order       # User frontend (port 3000)
   ```

4. **Before Committing:**
   ```bash
   pnpm check-types
   pnpm lint
   pnpm format
   ```

5. **Run Tests (orderhub):**
   ```bash
   pnpm --filter=orderhub test
   ```

## Important Notes

### General
- **Always run commands from the repository root** unless working with package-specific scripts
- Use `--filter=<package-name>` for package-specific operations
- Turbo caches build outputs for faster rebuilds

### Database (SSOT Strategy)
- **All database configuration is in `apps/orderhub/.env`**
- `@spaceorder/db` is the Single Source of Truth for:
  - Prisma schema (`packages/db/prisma/schema.prisma`)
  - Database types (Admin, Order, Menu, etc.)
  - Prisma Client configuration
- Apps import types from `@spaceorder/db/client`
- Never duplicate DATABASE_URL across multiple `.env` files
- Always run `prisma:generate` after schema changes

### Frontend Apps
- `order` and `orderdesk` use React Compiler (experimental)
- `@spaceorder/ui` uses React 19.2.0, while apps use React 18.3.1
- Both use ESM (`"type": "module"`)
- Tailwind CSS v4 with PostCSS

### Backend App (orderhub)
- Uses CommonJS (no `"type": "module"`)
- Port 8080 configured in `apps/orderhub/.env`
- Docker support for containerized deployment
- BigInt serialization configured in `src/main.ts`

### ESLint
- ESLint 9 FlatConfig format across all packages
- Use `--max-warnings 0` for strict linting in shared packages

### Docker (orderhub)
- Multi-stage Dockerfile in `apps/orderhub/Dockerfile`
- Stages: base, deps, development, builder, runner
- Requires `packages/db/prisma` and `apps/orderhub/.env` for build
- Docker Compose configuration in `apps/orderhub/docker-compose.yml`

## Environment Variables

### apps/orderhub/.env
```env
SERVER_PORT=8080
DB_ROOT_PASSWORD=***
DB_PORT=3306
DB_NAME=spaceorder
DB_USER=spaceorder
DB_PASSWORD=***
DATABASE_URL="mysql://user:pass@localhost:3306/dbname"
```

### Frontend apps (.env)
App-specific configuration only (no database credentials)

## Common Issues & Solutions

### Issue: Prisma Client not generated
**Solution:** Run `pnpm --filter=@spaceorder/db prisma:generate`

### Issue: Type import not working from @spaceorder/db
**Solution:**
1. Ensure `@spaceorder/db` is in `dependencies` (not `devDependencies`)
2. Import from `@spaceorder/db/client`: `import { Admin } from '@spaceorder/db/client'`

### Issue: Docker build fails on prisma generate
**Solution:** Ensure both `packages/db/prisma` and `apps/orderhub/.env` are copied in Dockerfile

### Issue: Module resolution errors
**Solution:** Run `pnpm install` at root to sync workspace dependencies
