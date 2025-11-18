# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Turborepo monorepo named "orderhere" using pnpm workspaces. The project contains multiple Next.js applications and shared packages.

## Monorepo Structure

- **Apps** (in `apps/`):
  - `orderhere`: Main Next.js 14.2.33 app with Tailwind CSS v4 and React Compiler enabled, runs on default port
  - `web`: Next.js 16.0.1 app with shared UI components, runs on port 3000
  - `docs`: Next.js 16.0.1 documentation app with shared UI components, runs on port 3001

- **Shared Packages** (in `packages/`):
  - `@repo/ui`: React component library exported via `./src/*.tsx` pattern, consumed by web and docs apps
  - `@repo/eslint-config`: Shared ESLint configurations (base, next-js, react-internal)
  - `@repo/typescript-config`: Shared TypeScript configurations (base, nextjs, react-library)

## Package Manager

**Always use `pnpm`** for dependency management. This project requires pnpm 9.0.0+ and Node.js >=18.

## Common Commands

### Development
```bash
# Run all apps in development mode
pnpm dev

# Run specific app (use turbo filters)
pnpm dev --filter=web
pnpm dev --filter=docs
pnpm dev --filter=orderhere
```

### Building
```bash
# Build all apps and packages
pnpm build

# Build specific app
pnpm build --filter=web
pnpm build --filter=docs
pnpm build --filter=orderhere
```

### Linting
```bash
# Lint all packages
pnpm lint

# Lint specific package
pnpm lint --filter=web
```

### Type Checking
```bash
# Type check all packages
pnpm check-types

# Type check specific package (for web/docs apps)
pnpm check-types --filter=web
```

### Formatting
```bash
# Format all TypeScript, TSX, and Markdown files
pnpm format
```

### Component Generation
```bash
# Generate new React component in @repo/ui package
cd packages/ui
pnpm generate:component
```

## Turborepo Configuration

The `turbo.json` configures task dependencies:
- `build` task depends on `^build` (builds dependencies first), includes `.env*` files, outputs to `.next/**`
- `lint` and `check-types` depend on completing these tasks in dependencies first
- `dev` task has caching disabled and is persistent

## Key Technical Details

### orderhere App
- Uses Next.js 14.2.33 with App Router
- **React Compiler enabled** via `reactCompiler: true` in next.config.ts
- Tailwind CSS v4 with PostCSS (`@tailwindcss/postcss`)
- Path alias: `@/*` maps to `./src/*`
- TypeScript with strict mode, target ES2022
- JSX compiled to `react-jsx` (new JSX transform)

### web and docs Apps
- Use Next.js 16.0.1 with App Router
- Import components from `@repo/ui` workspace package
- Include `next typegen` in check-types script for type generation
- Use `--max-warnings 0` for strict linting (no warnings allowed)

### Shared Packages
- `@repo/ui`: Exports all components as `./src/*.tsx` (e.g., `@repo/ui/button`)
- ESLint configs: Import via `@repo/eslint-config/base`, `/next-js`, or `/react-internal`
- TypeScript configs: Extend base configurations for different app types

## Workspace Dependencies

Apps use `workspace:*` protocol to reference local packages. Changes to shared packages affect consuming apps during development.

## Development Workflow

1. Install dependencies: `pnpm install`
2. Run dev mode: `pnpm dev` (starts all apps) or use `--filter` for specific apps
3. Type check before committing: `pnpm check-types`
4. Lint code: `pnpm lint`
5. Format code: `pnpm format`

## Important Notes

- The orderhere app uses React Compiler (experimental), which may affect how you write React components
- Always run commands from the repository root unless working with package-specific scripts
- Turbo caches build outputs for faster rebuilds
- The monorepo uses ESM (`"type": "module"`) for web, docs, and some packages
