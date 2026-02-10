# Docker Setup Guide

This guide explains how to run the space-order monorepo using Docker and Docker Compose.

## Prerequisites

- Docker 20.10 or later
- Docker Compose 2.0 or later

## Architecture

The Docker setup includes four services:

1. **mysql** - MySQL 8.0 database (port 3306)
2. **orderhub** - NestJS backend API (port 8080)
3. **orderdesk** - Next.js admin frontend (port 3001)
4. **order** - Next.js customer frontend (port 3000)

## Quick Start

### 1. Setup Environment Variables

Copy the example environment file and customize it:

```bash
cp .env.example .env
```

Edit `.env` to configure:

- Database credentials
- Application ports
- Other environment-specific settings

### 2. Build and Start All Services

```bash
# Build and start all services in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f orderhub
docker-compose logs -f order
```

### 3. Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes database data)
docker-compose down -v
```

## Development Workflow

### Initial Prisma Setup

**Note:** In development mode, the orderhub container automatically runs `prisma:migrate` and `prisma:seed` on startup. Manual initialization is only needed when running locally without Docker.

```bash
# From host machine (without Docker)
pnpm --filter=@spaceorder/db prisma:generate
pnpm --filter=@spaceorder/db prisma:migrate
pnpm --filter=@spaceorder/db prisma:seed
```

### Create New Prisma Migration

```bash
# Edit packages/db/prisma/schema.prisma first, then:
pnpm --filter=@spaceorder/db prisma:migrate

# If using Docker, restart orderhub to apply migrations:
docker-compose restart orderhub
```

### Access MySQL Database

```bash
# Using docker-compose exec
docker-compose exec mysql mysql -u spaceuser -p spaceorder

# Or connect from host machine
mysql -h 127.0.0.1 -P 3306 -u spaceuser -p
```

## Service URLs

- Customer Frontend (order): <http://localhost:3000>
- Admin Frontend (orderdesk): <http://localhost:3001>
- Backend API (orderhub): <http://localhost:8080>
- MySQL Database: `localhost:3306`

## Troubleshooting

### Database Connection Issues

If the orderhub app can't connect to MySQL:

1. Check if MySQL is healthy:

   ```bash
   docker-compose ps
   ```

2. Verify DATABASE_URL in orderhub service environment

3. Check MySQL logs:
   ```bash
   docker-compose logs mysql
   ```

### Rebuild After Code Changes

```bash
# Rebuild specific service
docker-compose up -d --build orderhub
docker-compose up -d --build orderdesk
docker-compose up -d --build order

# Rebuild all services
docker-compose up -d --build
```

### Clean Rebuild (Remove Cache)

```bash
# Stop everything
docker-compose down

# Remove images
docker-compose rm -f

# Rebuild without cache
docker-compose build --no-cache

# Start again
docker-compose up -d
```

### View Container Resource Usage

```bash
docker stats
```

## Production Considerations

For production deployment:

1. Use proper secrets management (not .env files)
2. Configure proper MySQL root password
3. Set up MySQL backups
4. Use environment-specific Dockerfiles if needed
5. Configure proper networking and security groups
6. Set up health checks and monitoring
7. Use Docker Swarm or Kubernetes for orchestration

## File Structure

```
.
├── docker-compose.yml           # Main orchestration file (all services)
├── .env                         # Central environment variables
├── .env.example                 # Example environment variables
├── packages/
│   └── db/
│       ├── init/                # MySQL initialization scripts
│       └── prisma/
│           └── schema.prisma    # Database schema
├── apps/
│   ├── order/
│   │   ├── Dockerfile           # Next.js customer frontend container
│   │   └── .dockerignore
│   ├── orderdesk/
│   │   ├── Dockerfile           # Next.js admin frontend container
│   │   └── .dockerignore
│   └── orderhub/
│       ├── Dockerfile           # NestJS backend container
│       └── .dockerignore
```

## Notes

- Next.js apps are built in standalone mode for smaller image size
- Prisma schema is centralized in `packages/db/prisma/schema.prisma`
- MySQL initialization scripts are loaded from `packages/db/init/`
- MySQL data persists in a Docker volume named `mysql_dev_data`
- All services communicate through the `spaceorder-network` bridge network
- **orderhub development mode** automatically runs `prisma:migrate` and `prisma:seed` on container startup
