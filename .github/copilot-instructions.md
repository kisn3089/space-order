# GitHub Copilot Instructions for space-order

## Project Overview

This is a **Turborepo monorepo** for a restaurant ordering system using **pnpm workspaces**. The project includes Next.js frontend applications, a NestJS backend API, and shared packages with a centralized database package.

## Tech Stack & Versions

### Package Manager & Runtime

- **pnpm**: 9.0.0+ (REQUIRED - always use pnpm, never npm or yarn)
- **Node.js**: >=18

### Frontend Apps (apps/)

#### order (Customer-facing app)

- **Framework**: Next.js 14.2.33 with App Router
- **React**: 18.3.1
- **React Compiler**: ENABLED via `reactCompiler: true`
- **Styling**: Tailwind CSS v4 with PostCSS (`@tailwindcss/postcss`)
- **Module Type**: ESM (`"type": "module"`)
- **Port**: 3000 (default)
- **Path Alias**: `@/*` maps to `./src/*`

#### orderdesk (Admin app)

- **Framework**: Next.js 14.2.33 with App Router
- **React**: 18.3.1
- **React Compiler**: ENABLED via `reactCompiler: true`
- **Styling**: Tailwind CSS v4.1.11 with PostCSS
- **Data Fetching**: @tanstack/react-query 5.90.11
- **Form Handling**: react-hook-form 7.53.0 with @hookform/resolvers
- **Icons**: lucide-react 0.475.0
- **Theme**: next-themes 0.4.6
- **Module Type**: ESM (`"type": "module"`)
- **Port**: 3001
- **Workspace Dependencies**: `@spaceorder/api`, `@spaceorder/db`, `@spaceorder/ui`, `@spaceorder/auth`

### Backend App (apps/)

#### orderhub (API server)

- **Framework**: NestJS 11.0.1 with Express platform
- **Runtime**: Node.js with TypeScript
- **Build Tool**: NestJS CLI with SWC builder (faster compilation)
- **Dev Mode**: nodemon with ts-node/register for hot-reload
- **Config**: `ConfigModule` loads from root `.env` (`envFilePath: '../../.env'`)
- **Module Type**: CommonJS (no `"type": "module"`)
- **Target**: ES2023, module NodeNext
- **Port**: 8080
- **Testing**: Jest with ts-jest
- **Key Dependencies**:
  - `@nestjs/jwt`, `@nestjs/passport` - JWT authentication
  - `@nestjs/swagger` 11.2.3 - API documentation
  - `@nestjs/config` 4.0.2 - Configuration management
  - `passport` 0.7.0 with jwt and local strategies
  - `bcrypt` 6.0.0 - Password hashing
  - `class-validator` 0.14.2, `class-transformer` 0.5.1 - DTO validation
  - `nestjs-zod` 5.0.1, `zod` 3.25.76 - Zod validation
  - `cookie-parser` 1.4.7 - Cookie handling

### Shared Packages (packages/)

#### @spaceorder/db (Database SSOT)

- **ORM**: Prisma 6.19.0
- **Client**: @prisma/client 6.19.0
- **Database**: MySQL
- **Purpose**: Centralized Prisma schema, types, and client (Single Source of Truth)
- **Models**: Admin, Owner, Store, Menu, Order, OrderItem
- **Enums**: AdminRole (SUPER, SUPPORT, VIEWER), OrderStatus (PENDING, ACCEPTED, PREPARING, COMPLETED, CANCELLED)

#### @spaceorder/api

- **HTTP Client**: axios 1.13.2
- **React Query**: @tanstack/react-query 5.90.11
- **Purpose**: Frontend API client with React Query hooks
- **Dependencies**: `@spaceorder/db`, `@spaceorder/auth`, `react` 18.3.1

#### @spaceorder/auth

- **Validation**: zod 3.25.76
- **Purpose**: Authentication utilities, Zod schemas, hooks
- **Dependencies**: `react` 18.3.1

#### @spaceorder/ui

- **React**: 18.3.1
- **Styling**: Tailwind CSS v4.1.11 with PostCSS
- **Component Library**: Radix UI (@radix-ui/react-\*)
- **Animation**: motion 12.23.24
- **Utilities**:
  - class-variance-authority 0.7.1 - Component variants
  - clsx 2.1.1, tailwind-merge 3.3.1 - Class name utilities
  - lucide-react 0.475.0 - Icons
  - tw-animate-css 1.3.6 - Tailwind animations

#### @spaceorder/lintconfig

- **ESLint**: 9 FlatConfig format
- **Configs**: base.js, next.js, react-internal.js
- **Plugins**: @eslint/js, typescript-eslint, eslint-plugin-react, eslint-plugin-react-hooks, @next/eslint-plugin-next, eslint-plugin-turbo

#### @spaceorder/tsconfig

- **Configs**: base.json (ES2022, strict mode), nextjs.json, react-library.json

## Coding Standards & Guidelines

### TypeScript Rules

1. **NEVER use type assertions (`as`)**
   - Type assertions bypass TypeScript's type checking
   - Use proper type design instead:
     - Generic type parameters with defaults: `<T = DefaultType>`
     - Intersection types: `Type1 & Type2`
     - Union types: `Type1 | Type2`
     - Conditional types when needed

   **❌ Bad:**

   ```typescript
   return await prisma.menu.findFirst(...) as T;
   ```

   **✅ Good:**

   ```typescript
   async getMenuById<T = PublicMenu>(...): Promise<PublicMenu & T> {
     return await prisma.menu.findFirst(...);
   }
   ```

2. **Strict Type Safety**
   - Enable TypeScript strict mode
   - No implicit any
   - Proper null/undefined handling

3. **Naming Conventions**
   - Avoid non-intuitive acronyms in type, function, method, or variable names
   - Use clear, descriptive names

### Code Quality

1. **Avoid Over-engineering**
   - Only make changes directly requested or clearly necessary
   - Keep solutions simple and focused
   - Don't add features beyond what was asked

2. **Security**
   - Check for OWASP top 10 vulnerabilities:
     - Command injection
     - XSS
     - SQL injection
   - Validate at system boundaries (user input, external APIs)
   - Don't add unnecessary validation for internal code

3. **Comments & Documentation**
   - Commit messages: English only
   - Code comments: Korean or English
   - Add comments only where logic isn't self-evident
   - Don't add docstrings to unchanged code

4. **React Best Practices**
   - Utilize React Compiler features (enabled in Next.js apps)
   - Suggest custom hooks for complex logic when appropriate
   - Keep components focused and modular

### Language & Style

- **Korean with "존댓말" (formal tone)** for code review comments
- **Keep technical terms in English**
- **Write concise, clear sentences**
- **Use bullet points for clarity**

## Common Commands

### Development

```bash
pnpm dev                    # Run all apps
pnpm dev:order              # Run order app (port 3000)
pnpm dev:orderdesk          # Run orderdesk app (port 3001)
pnpm dev:orderhub           # Run orderhub API (port 8080)
```

### Database (Prisma)

```bash
pnpm --filter=@spaceorder/db prisma:generate    # Generate Prisma Client
pnpm --filter=@spaceorder/db prisma:migrate     # Run migrations
pnpm --filter=@spaceorder/db prisma:studio      # Open Prisma Studio
pnpm --filter=@spaceorder/db prisma:seed        # Seed database
```

### Build & Quality

```bash
pnpm build                  # Build all apps and packages
pnpm lint                   # Lint all packages
pnpm check-types            # Type check all packages
pnpm format                 # Format all files

# Package-specific
pnpm build --filter=orderhub
pnpm lint --filter=order
```

### Testing (orderhub)

```bash
pnpm --filter=orderhub test              # Run unit tests
pnpm --filter=orderhub test:watch        # Watch mode
pnpm --filter=orderhub test:e2e          # E2E tests
pnpm --filter=orderhub test:cov          # Coverage report
```

## Key Technical Context

### Module Systems

- **Frontend apps (order, orderdesk)**: ESM (`"type": "module"`)
- **Backend app (orderhub)**: CommonJS (no `"type": "module"`)

### React Compiler

- **Enabled** in both Next.js apps via `reactCompiler: true` in next.config.js
- Consider compiler-friendly patterns when writing React code

### Database Architecture

- **Single Source of Truth**: `@spaceorder/db` package
- All apps import types from `@spaceorder/db`
- Database configuration in root `.env` file only
- Never duplicate DATABASE_URL across multiple .env files

### Workspace Dependencies

- Use `workspace:*` protocol for local packages
- Apps depend on shared packages:
  - `orderdesk` → `@spaceorder/api`, `@spaceorder/db`, `@spaceorder/ui`, `@spaceorder/auth`
  - `orderhub` → `@spaceorder/db`, `@spaceorder/api`, `@spaceorder/auth`
  - `@spaceorder/api` → `@spaceorder/db`, `@spaceorder/auth`

### NestJS Patterns

- Use `@ZodValidation()` decorator for DTO validation
- JWT authentication with access/refresh tokens
- Cookie-based refresh token handling
- Current user via `@Client()` decorator
- Prisma exception filters for error handling

### Path Aliases

- **Frontend apps**: `@/*` maps to `./src/*`
- **Workspace packages**: Import via `@spaceorder/[package-name]`

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

## Environment Variables

### Root `.env` (Central configuration)

```env
# Database
DB_ROOT_PASSWORD=***
DB_PORT=3306
DB_NAME=spaceorder
DB_USER=spaceorder
DB_PASSWORD=***
DATABASE_URL="mysql://..."

# Server
SERVER_PORT=8080
ORDERHUB_URL=http://localhost:8080

# JWT
JWT_ACCESS_TOKEN_SECRET=***
JWT_ACCESS_TOKEN_EXPIRATION_MS=3600000
JWT_REFRESH_TOKEN_SECRET=***
JWT_REFRESH_TOKEN_EXPIRATION_MS=604800000
JWT_ISSUER=***
JWT_AUDIENCE=***
```

## Important Notes

1. **Always use pnpm** (never npm or yarn)
2. **Run commands from repository root** unless working with package-specific scripts
3. **Use `--filter=<package-name>`** for package-specific operations
4. **Run `prisma:generate`** after schema changes
5. **Type imports** always from `@spaceorder/db` for database types
6. **ESLint strict mode** with `--max-warnings 0`
7. **Turborepo caching** speeds up builds (configured in `turbo.json`)
