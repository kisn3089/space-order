# Docker Setup Guide

This guide explains how to run the space-order monorepo using Docker and Docker Compose.

## Prerequisites

- Docker 20.10 or later
- Docker Compose 2.0 or later

## Architecture

The Docker setup includes three services:

1. **mysql** - MySQL 8.0 database
2. **space** - NestJS backend API (port 8080)
3. **order** - Next.js frontend (port 3000)

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
docker-compose logs -f space
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

After first launch, you may need to initialize Prisma:

```bash
# Enter the space container
docker-compose exec space sh

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed database
npx prisma db seed
```

### Create New Prisma Migration

```bash
# Edit apps/space/prisma/schema.prisma first, then:
docker-compose exec space npx prisma migrate dev --name your_migration_name
```

### Access MySQL Database

```bash
# Using docker-compose exec
docker-compose exec mysql mysql -u spaceuser -p spaceorder

# Or connect from host machine
mysql -h 127.0.0.1 -P 3306 -u spaceuser -p
```

## Service URLs

- Frontend (Next.js): http://localhost:3000
- Backend API (NestJS): http://localhost:8080
- MySQL Database: localhost:3306

## Troubleshooting

### Database Connection Issues

If the space app can't connect to MySQL:

1. Check if MySQL is healthy:
   ```bash
   docker-compose ps
   ```

2. Verify DATABASE_URL in space service environment

3. Check MySQL logs:
   ```bash
   docker-compose logs mysql
   ```

### Rebuild After Code Changes

```bash
# Rebuild specific service
docker-compose up -d --build space
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
├── docker-compose.yml           # Main orchestration file
├── .env.example                 # Example environment variables
├── apps/
│   ├── order/
│   │   ├── Dockerfile           # Next.js frontend container
│   │   ├── .dockerignore
│   │   └── next.config.js       # (output: 'standalone' enabled)
│   └── space/
│       ├── Dockerfile           # NestJS backend container
│       ├── .dockerignore
│       ├── .env.example
│       └── prisma/
│           └── schema.prisma    # Database schema
```

## Notes

- The Next.js app is built in standalone mode for smaller image size
- Prisma migrations run automatically on space container startup
- MySQL data persists in a Docker volume named `mysql_data`
- All services communicate through the `space-order-network` bridge network
