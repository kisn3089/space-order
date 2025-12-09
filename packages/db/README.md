# @spaceorder/db

Shared database package for the space-order monorepo. This package provides a centralized Prisma schema and generated types for all applications.

## SSOT Strategy

This package implements Single Source of Truth (SSOT) for database schema and types:

- **Single Schema**: All database models are defined in `prisma/schema.prisma`
- **Shared Types**: Prisma-generated types are exported and shared across all apps
- **Centralized Migrations**: Database migrations are managed from this package

## Usage

### In Your App

Install the package as a workspace dependency:

```json
{
  "dependencies": {
    "@spaceorder/db": "workspace:*"
  }
}
```

### Import PrismaClient

```typescript
import { PrismaClient } from "@spaceorder/db";

const prisma = new PrismaClient();
```

### Import Types

```typescript
import { Admin, AdminRole, Order, OrderStatus } from "@spaceorder/db";
```

## Development

### Generate Prisma Client

```bash
pnpm --filter=@spaceorder/db prisma:generate
```

### Run Migrations

```bash
pnpm --filter=@spaceorder/db prisma:migrate
```

### Open Prisma Studio

```bash
pnpm --filter=@spaceorder/db prisma:studio
```

### Reset Database

```bash
pnpm --filter=@spaceorder/db prisma:reset
```

## Package Structure

```
packages/db/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Migration history
├── src/
│   ├── client.ts              # Re-exports PrismaClient and types
│   ├── types.ts               # Re-exports Prisma types
│   └── index.ts               # Main entry point
├── .env                       # Database configuration (gitignored)
├── .env.example               # Example environment variables
├── package.json
└── tsconfig.json
```

## Configuration

### Environment Variables (SSOT Strategy)

This package uses its own `.env` file in the `packages/db/` directory as the **Single Source of Truth** for all database configuration. Copy `.env.example` to `.env` and configure your database connection:

```bash
cp packages/db/.env.example packages/db/.env
```

Required environment variables:

- `DATABASE_URL`: MySQL connection string
- `DB_ROOT_PASSWORD`: Database root password
- `DB_PORT`: Database port (default: 3306)
- `DB_NAME`: Database name
- `DB_USER`: Database user
- `DB_PASSWORD`: Database password

### How Apps Use This Configuration

Apps load database environment variables from this centralized `.env` file:

**NestJS (orderhub example):**

```typescript
// apps/orderhub/src/app/app.module.ts
ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: [".env", "../../packages/db/.env"], // Loads from both files
});
```

This SSOT approach ensures:

- ✅ All apps use the same database configuration
- ✅ No duplicate DATABASE_URL in multiple `.env` files
- ✅ Easy to manage database credentials in one place
- ✅ App-specific env vars (like SERVER_PORT) stay in app's `.env`

## Exported Types

All Prisma-generated types are available:

- `Admin`, `AdminRole`
- `Owner`
- `Store`
- `Menu`
- `Order`, `OrderStatus`
- `OrderItem`
- And all other Prisma utility types (Prisma namespace)
