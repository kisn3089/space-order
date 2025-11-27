# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Turborepo monorepo named "space-order" using pnpm workspaces. The project contains a Next.js frontend application, a NestJS backend application, and shared packages.

## Monorepo Structure

- **Apps** (in `apps/`):
  - `order`: Next.js 14.2.33 frontend app with Tailwind CSS v4 and React Compiler enabled, runs on default port (3000)
  - `orderhub`: NestJS 11.0.1 backend application with TypeScript and Jest testing, runs on port 8080

- **Shared Packages** (in `packages/`):
  - `@share/ui`: React 19.2.0 component library exported via `./src/*.tsx` pattern (button, card, code)
  - `@share/lintconfig`: Shared ESLint 9 FlatConfig configurations (base, next, react-internal)
  - `@share/tsconfig`: Shared TypeScript configurations (base, nextjs, react-library)

## Package Manager

**Always use `pnpm`** for dependency management. This project requires pnpm 9.0.0+ and Node.js >=18.

## Common Commands

### Development

```bash
# Run all apps in development mode
pnpm dev

# Run specific apps
pnpm dev:order    # Run order app only
pnpm dev:orderhub    # Run orderhub (NestJS) app in watch mode
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
```

### Linting

```bash
# Lint all packages
pnpm lint

# Lint specific package
pnpm lint --filter=order
pnpm lint --filter=@share/ui
```

### Type Checking

```bash
# Type check all packages
pnpm check-types

# Type check specific package
pnpm check-types --filter=order
```

### Formatting

```bash
# Format all TypeScript, TSX, and Markdown files
pnpm format
```

### Component Generation

```bash
# Generate new React component in @share/ui package
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

- `build` task depends on `^build` (builds dependencies first), includes `.env*` files, outputs to `.next/**` and `dist/**`
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
- Imports components from `@share/ui` workspace package

### orderhub App (NestJS Backend)

- Uses NestJS 11.0.1 with Express platform
- TypeScript with decorators and metadata reflection enabled
- Target ES2023, module NodeNext
- Port 8080 (configured via `.env`)
- Jest testing framework with ts-jest
- Class-validator and class-transformer for DTO validation
- ESLint with TypeScript-ESLint and Prettier integration
- Main entry point: `src/main.ts`
- Build output: `dist/`
- Scripts: `start:dev` (watch mode), `start:debug`, `start:prod`

### Shared Packages

- `@share/ui`: Exports components as `./src/*.tsx` (e.g., `@share/ui/button`). Uses React 19.2.0
- `@share/lintconfig`: ESLint 9 FlatConfig files - import via `@share/lintconfig/base`, `/next`, or `/react-internal`
- `@share/tsconfig`: TypeScript configurations - extend `@share/tsconfig/base.json`, `/nextjs.json`, or `/react-library.json`

## Workspace Dependencies

Apps use `workspace:*` protocol to reference local packages. Changes to shared packages affect consuming apps during development.

## Development Workflow

1. Install dependencies: `pnpm install`
2. Run dev mode:
   - All apps: `pnpm dev`
   - Frontend only: `pnpm dev:order`
   - Backend only: `pnpm dev:orderhub`
   - Or use `--filter` for granular control
3. Type check before committing: `pnpm check-types`
4. Lint code: `pnpm lint`
5. Format code: `pnpm format`
6. Run tests (orderhub app): `pnpm --filter=orderhub test`

## Important Notes

- The **order** app uses React Compiler (experimental), which may affect how you write React components
- The **orderhub** app runs on port 8080 (ensure `.env` is configured)
- `@share/ui` uses React 19.2.0, while order app uses React 18.3.1
- Always run commands from the repository root unless working with package-specific scripts
- Turbo caches build outputs for faster rebuilds
- The order app uses ESM (`"type": "module"`), while orderhub app uses CommonJS
- ESLint 9 FlatConfig format is used across all packages
- Use `--max-warnings 0` for strict linting in shared packages
