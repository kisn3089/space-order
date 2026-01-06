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
  - `@spaceorder/db`: **Centralized database package (SSOT)** - Prisma schema, types, and client (Prisma 6.19.0, MySQL)
  - `@spaceorder/api`: Frontend API client with React Query hooks and HTTP utilities (axios, @tanstack/react-query)
  - `@spaceorder/auth`: Authentication utilities with Zod schemas and hooks
  - `@spaceorder/ui`: React 18.3.1 component library with Radix UI and Tailwind CSS v4.1.11
  - `@spaceorder/lintconfig`: Shared ESLint 9 FlatConfig configurations (base, next-js, react-internal)
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

# Seed database
pnpm --filter=@spaceorder/db prisma:seed

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
- **React Compiler enabled** via `reactCompiler: true` in next.config.js
- Runs on port 3001
- React 18.3.1 & React DOM 18.3.1
- Uses `@spaceorder/api` for data fetching with React Query (@tanstack/react-query 5.90.11)
- Uses `@spaceorder/db` for TypeScript types
- Uses `@spaceorder/ui` for shared components (with transpilePackages configured)
- Uses `@spaceorder/auth` for authentication utilities
- Tailwind CSS v4.1.11 with PostCSS
- Form handling: react-hook-form 7.53.0 with @hookform/resolvers
- Icons: lucide-react 0.475.0
- Theme support: next-themes 0.4.6
- ESM module (`"type": "module"`)
- Features: Admin signin page with form validation

### orderhub App (NestJS Backend)

- Uses NestJS 11.0.1 with Express platform
- TypeScript with decorators and metadata reflection enabled
- Target ES2023, module NodeNext
- **Build Tool**: NestJS CLI with SWC builder (faster compilation)
- **Development**: nodemon with ts-node/register for hot-reload of `src/` directory
- Port 8080 (configured via `apps/orderhub/.env`)
- **Dependencies**:
  - `@spaceorder/db` for Prisma Client and types (workspace)
  - `@spaceorder/api` for shared utilities (workspace)
  - `@spaceorder/auth` for authentication schemas (workspace)
  - `@nestjs/jwt`, `@nestjs/passport` for JWT authentication
  - `@nestjs/swagger` 11.2.3 for API documentation
  - `@nestjs/config` 4.0.2 for configuration management
  - `passport` 0.7.0 with jwt and local strategies
  - `bcrypt` 6.0.0 for password hashing
  - `class-validator` 0.14.2, `class-transformer` 0.5.1 for DTO validation
  - `nestjs-zod` 5.0.1, `zod` 3.25.76 for Zod validation
  - `cookie-parser` 1.4.7 for cookie handling
- **Testing**: Jest with ts-jest (unit and e2e tests)
- **Modules**:
  - `admin` - Admin user management
  - `auth` - JWT authentication with refresh tokens
  - `owner` - Owner/restaurant management
  - `store` - Restaurant store information
  - `menu` - Menu items
  - `order` - Order management
  - `order_item` - Order items
  - Common filters (Prisma exception filter)
  - Utilities (JWT handling, guards, crypto)
- **Key Features**:
  - JWT access/refresh token authentication
  - Zod validation guard decorator (`@ZodValidation()`)
  - Cookie-based refresh token handling
  - Admin and Owner login endpoints
  - Current user decorator (`@CurrentUser()`)
  - Auth guards (Local, JWT, JWT refresh)
- **Main entry point**: `src/main.ts`
- **Build output**: `apps/orderhub/dist/`
- **Scripts**: `start:dev` (nodemon watch mode), `start:debug`, `start:prod`
- **Docker**: Multi-stage Dockerfile (base, deps, development, builder, runner)
- **Type**: CommonJS (no `"type": "module"`)

### Shared Packages

#### `@spaceorder/db` (Database SSOT)

**Purpose:** Centralized Prisma schema and database types for all apps

**Structure:**

```text
packages/db/
├── prisma/
│   ├── schema.prisma          # Database schema (MySQL)
│   ├── migrations/            # Migration history
│   └── seed.ts                # Database seeding script
├── src/
│   ├── index.ts               # Re-exports PrismaClient and all Prisma types
│   └── (client.ts removed)
└── package.json
```

**Database Models:**

- `Admin` - Admin users (id, publicId, email, password, name, role: AdminRole, isActive, refreshToken, lastLoginAt, timestamps)
- `Owner` - Restaurant owners (id, publicId, email, password, name, phone, businessNumber, isActive, refreshToken, lastLoginAt, timestamps, stores relation)
- `Store` - Restaurant stores (id, publicId, ownerId, name, phone, address, businessHours, description, tableCount, isOpen, timestamps)
- `Menu` - Menu items (id, publicId, storeId, name, price, description, imageUrl, category, isAvailable, sortOrder, timestamps)
- `Order` - Orders (id, publicId, storeId, tableNum, status: OrderStatus, totalPrice, memo, timestamps)
- `OrderItem` - Order items (id, publicId, orderId, menuId, menuName, price, quantity, options JSON, timestamps)

**Enums:**

- `AdminRole`: SUPER, SUPPORT, VIEWER
- `OrderStatus`: PENDING, ACCEPTED, PREPARING, COMPLETED, CANCELLED

**Environment Variables (in `apps/orderhub/.env`):**

- `DATABASE_URL`: MySQL connection string
- `DB_ROOT_PASSWORD`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`

**Usage:**

```typescript
// Import PrismaClient
import { PrismaClient } from "@spaceorder/db";

// Import types
import type { Admin, AdminRole, Order, OrderStatus } from "@spaceorder/db";
```

**Package.json Scripts:**

- All scripts use `dotenv -e ../../apps/orderhub/.env` to load environment variables
- `prisma:generate`: Generate Prisma Client
- `prisma:migrate`: Run migrations
- `prisma:studio`: Open Prisma Studio
- `prisma:seed`: Run database seeding
- `prisma:reset`: Reset database
- `build`: Generate client + TypeScript build

**Exports:**

```json
{
  "exports": {
    ".": "./src/index.ts"
  }
}
```

**Dependencies:**

- `dependencies`: `@prisma/client` (6.19.0), `@spaceorder/auth` (workspace)
- `devDependencies`: `prisma` (6.19.0), `dotenv-cli`, `typescript`, `bcrypt` (for seeding)

#### `@spaceorder/api`

**Purpose:** Frontend API client with React Query hooks and HTTP utilities

**Structure:**

```text
packages/api/
└── src/
    ├── core/
    │   ├── http.ts                      # Axios instance configuration
    │   ├── TanstackProvider.tsx         # React Query provider component
    │   ├── auth/
    │   │   ├── httpAuth.ts              # Authentication API functions
    │   │   ├── useSignInMutation.ts     # Sign-in mutation hook
    │   │   └── auth.types.ts            # Auth type definitions
    │   └── admin/
    │       ├── httpAdmin.ts             # Admin API functions
    │       └── adminQuery.ts            # React Query hooks for admin
    └── types/
        └── QueryOptions.ts              # React Query options types
```

**Usage:**

```typescript
// Import React Query provider
import { TanstackProvider } from "@spaceorder/api/core/TanstackProvider";

// Import API hooks
import { getAdminListQuery } from "@spaceorder/api/core/admin/adminQuery";
import { useSignInMutation } from "@spaceorder/api/core/auth/useSignInMutation";

// Use in component
const { data: admins } = getAdminListQuery();
const signInMutation = useSignInMutation();
```

**Dependencies:**

- `@spaceorder/db` (workspace): For TypeScript types (Admin, Order, etc.)
- `@spaceorder/auth` (workspace): For authentication schemas
- `@tanstack/react-query` (5.90.11): React Query hooks
- `axios` (1.13.2): HTTP client
- `react` (18.3.1): React library

**Dev Tools:**

- `tsc-watch`: TypeScript compiler in watch mode

**Exports:**

```json
{
  "exports": {
    "./core/*": "./src/core/*",
    "./types/*": "./src/types/*",
    "./*": "./src/*"
  }
}
```

#### `@spaceorder/auth`

**Purpose:** Authentication utilities with Zod schemas and hooks

**Structure:**

```text
packages/auth/
└── src/
    ├── schemas/
    │   └── signIn.schema.ts    # Zod validation schema for sign-in
    ├── hooks/
    │   └── useAuth.ts          # Authentication hook
    └── index.ts                # Main export
```

**Dependencies:**

- `zod` (3.25.76): Schema validation
- `react` (18.3.1): React library

**Exports:**

```json
{
  "exports": {
    "./schemas": "./src/schemas/index.ts"
  }
}
```

#### `@spaceorder/ui`

**Purpose:** Shared React component library

**Structure:**

```text
packages/ui/
└── src/
    ├── components/           # UI components
    │   ├── button.tsx
    │   ├── checkbox.tsx
    │   ├── dialog.tsx
    │   ├── dropdown-menu.tsx
    │   ├── input.tsx
    │   ├── input-group.tsx
    │   ├── label.tsx
    │   ├── separator.tsx
    │   ├── textarea.tsx
    │   ├── tooltip.tsx
    │   └── ...
    ├── hooks/                # Custom hooks
    ├── lib/                  # Utility functions
    ├── globals.css           # Global styles
    └── postcss.config.ts     # PostCSS configuration
```

**Key Features:**

- React 18.3.1 (matches frontend apps)
- Tailwind CSS v4.1.11 with PostCSS
- Radix UI components (@radix-ui/react-\*)
- Animation support with motion (12.23.24)
- Utility libraries:
  - class-variance-authority (0.7.1): Component variants
  - clsx (2.1.1) & tailwind-merge (3.3.1): Class name utilities
  - lucide-react (0.475.0): Icons
  - tw-animate-css (1.3.6): Tailwind animations

**Component Exports:**

- `./components/*` - UI components (button, checkbox, dialog, dropdown-menu, input, input-group, label, separator, textarea, tooltip, etc.)
- `./hooks/*` - Custom hooks
- `./lib/*` - Utility functions
- `./globals.css` - Global styles
- `./postcss.config` - PostCSS configuration

**Scripts:**

- `lint`: ESLint with `--max-warnings 0` (strict mode)
- `check-types`: TypeScript type checking
- `generate:component`: Scaffold new component using turbo gen

#### `@spaceorder/lintconfig`

**Purpose:** Shared ESLint 9 FlatConfig configurations

**Configuration Files:**

- `base.js` - Base ESLint configuration with TypeScript support
- `next.js` - Next.js specific configuration
- `react-internal.js` - React library internal configuration

**Exports:**

- `@spaceorder/lintconfig/base` - Base config
- `@spaceorder/lintconfig/next-js` - Next.js config
- `@spaceorder/lintconfig/react-internal` - React internal config

**Key Plugins:**

- `@eslint/js` - Core ESLint rules
- `typescript-eslint` - TypeScript ESLint integration
- `eslint-plugin-react` - React rules
- `eslint-plugin-react-hooks` - React Hooks rules
- `@next/eslint-plugin-next` - Next.js rules
- `eslint-plugin-turbo` - Turborepo rules
- `eslint-config-prettier` - Prettier integration

#### `@spaceorder/tsconfig`

**Purpose:** Shared TypeScript configurations

**Configuration Files:**

- `base.json` - Base TypeScript config (ES2022 target, strict mode, node module resolution)
- `nextjs.json` - Next.js specific config (extends base)
- `react-library.json` - React library config (extends base)

**Key Settings (base.json):**

- Target: ES2022
- Module: ESNext
- Lib: ["es2022", "DOM", "DOM.Iterable"]
- Strict: true
- Module Resolution: node
- JSX: preserve
- Skip library checks enabled

**Usage:**

Extend in consuming packages:

```json
{
  "extends": "@spaceorder/tsconfig/base.json"
}
```

## Workspace Dependencies

Apps use `workspace:*` protocol to reference local packages. Changes to shared packages affect consuming apps during development.

**Key dependency relationships:**

- `order` → `@spaceorder/ui`
- `orderdesk` → `@spaceorder/api`, `@spaceorder/db`, `@spaceorder/ui`, `@spaceorder/auth`
- `orderhub` → `@spaceorder/db`, `@spaceorder/api`, `@spaceorder/auth`
- `@spaceorder/api` → `@spaceorder/db`, `@spaceorder/auth`
- `@spaceorder/db` → `@spaceorder/auth`

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
- Apps import types from `@spaceorder/db`
- Never duplicate DATABASE_URL across multiple `.env` files
- Always run `prisma:generate` after schema changes

### Frontend Apps

- `order` and `orderdesk` use React Compiler (experimental) enabled via `reactCompiler: true`
- Both apps use React 18.3.1 (while `@spaceorder/ui` also uses 18.3.1)
- Both use ESM (`"type": "module"`)
- Tailwind CSS v4.1.11 with PostCSS (`@tailwindcss/postcss`)
- `orderdesk` has `transpilePackages: ["@spaceorder/ui"]` configured for workspace package compatibility

### Backend App (orderhub)

- Uses CommonJS (no `"type": "module"`)
- Port 8080 configured in `apps/orderhub/.env`
- **Hot-reload in development**: nodemon watches `src/` directory and restarts on changes
- **Build tool**: NestJS CLI with SWC for faster compilation
- **Zod Validation**: Custom `@ZodValidation()` guard decorator for DTO validation
- **JWT Authentication**: Full access/refresh token implementation with cookies
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

This is the central environment configuration file used by all apps and packages.

```env
# Server Configuration
SERVER_PORT=8080

# Database Configuration
DB_ROOT_PASSWORD=***
DB_PORT=3306
DB_NAME=spaceorder
DB_USER=spaceorder
DB_PASSWORD=***
DATABASE_URL="mysql://spaceorder:***@localhost:3306/spaceorder"

# JWT Configuration
JWT_ACCESS_TOKEN_SECRET=***
JWT_ACCESS_TOKEN_EXPIRATION_MS=3600000        # 1 hour
JWT_REFRESH_TOKEN_SECRET=***
JWT_REFRESH_TOKEN_EXPIRATION_MS=604800000     # 7 days
```

### Frontend apps (.env)

App-specific configuration only (no database credentials)

## TypeScript Coding Standards

### Type Safety

- **NEVER use type assertions (`as`)** to solve type errors
- Type assertions bypass TypeScript's type checking and hide real type issues
- Instead, use proper type design:
  - Generic type parameters with default values (`<T = DefaultType>`)
  - Intersection types (`Type1 & Type2`)
  - Union types (`Type1 | Type2`)
  - Conditional types when needed
  - Proper type narrowing

**Example - Bad:**
```typescript
async getMenuById<T extends PublicMenu>(...): Promise<T> {
  return await prismaService.menu.findFirstOrThrow(...) as T; // ❌ Never use 'as'
}
```

**Example - Good:**
```typescript
async getMenuById<T = PublicMenu>(...): Promise<PublicMenu & T> {
  return await prismaService.menu.findFirstOrThrow(...); // ✅ Proper type design
}
```

## Common Issues & Solutions

### Issue: Prisma Client not generated

**Solution:** Run `pnpm --filter=@spaceorder/db prisma:generate`

### Issue: Type import not working from @spaceorder/db

**Solution:**

1. Ensure `@spaceorder/db` is in `dependencies` (not `devDependencies`)
2. Import from `@spaceorder/db`: `import { Admin } from '@spaceorder/db'`

### Issue: Docker build fails on prisma generate

**Solution:** Ensure both `packages/db/prisma` and `apps/orderhub/.env` are copied in Dockerfile

### Issue: Module resolution errors

**Solution:** Run `pnpm install` at root to sync workspace dependencies

### Issue: Hot-reload not working in orderhub

**Solution:** Ensure nodemon is watching the correct `src/` directory. Check `nodemon.json` configuration.

### Issue: Zod validation not working

**Solution:** Use the `@ZodValidation()` decorator on controller methods and ensure DTO is properly typed with Zod schema.
