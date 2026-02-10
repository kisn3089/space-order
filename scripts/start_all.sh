#!/bin/bash
set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

DOCKER_COMPOSE_BIN=""
DOCKER_COMPOSE_SUBCMD=""

detect_compose_cmd() {
  if docker compose version &> /dev/null; then
    DOCKER_COMPOSE_BIN="docker"
    DOCKER_COMPOSE_SUBCMD="compose"
    return 0
  fi
  if command -v docker-compose &> /dev/null && docker-compose version &> /dev/null; then
    DOCKER_COMPOSE_BIN="docker-compose"
    DOCKER_COMPOSE_SUBCMD=""
    return 0
  fi
  return 1
}

run_compose() {
  "$DOCKER_COMPOSE_BIN" $DOCKER_COMPOSE_SUBCMD "$@"
}

check_docker() {
  command -v docker &> /dev/null || { echo "Error: docker not found"; exit 1; }
  detect_compose_cmd || { echo "Error: docker compose not found"; exit 1; }
  docker info &> /dev/null || { echo "Error: docker daemon not running"; exit 1; }
}

check_platform() {
  if [ "$(uname -m)" = "x86_64" ]; then
    PLATFORM="linux/amd64"
  elif [ "$(uname -m)" = "aarch64" ] || [ "$(uname -m)" = "arm64" ]; then
    PLATFORM="linux/arm64"
  else
    PLATFORM="linux/amd64"
  fi
  export PLATFORM
}

check_env_file() {
  cd "$PROJECT_ROOT"
  if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
      cp ".env.example" ".env"
      echo "Created .env from .env.example"
    else
      echo "Error: .env file not found. Please create one based on the project documentation."
      exit 1
    fi
  fi
}

wait_for_orderhub() {
  echo "Waiting for orderhub to be ready..."
  local max_attempts=60
  local attempt=0

  while [ $attempt -lt $max_attempts ]; do
    if run_compose logs orderhub 2>&1 | grep -q "Nest application successfully started"; then
      echo "orderhub is ready!"
      return 0
    fi

    # Check if container exited with error
    if ! run_compose ps orderhub | grep -q "Up"; then
      echo "Error: orderhub container is not running"
      run_compose logs orderhub --tail 50
      exit 1
    fi

    attempt=$((attempt + 1))
    sleep 2
  done

  echo "Warning: Timeout waiting for orderhub. Check logs with: docker compose logs orderhub"
  return 1
}

main() {
  echo "=== SpaceOrder Development Environment Setup ==="
  echo ""

  check_docker
  check_platform
  check_env_file

  cd "$PROJECT_ROOT"

  echo ""
  echo "Starting Docker containers..."
  PLATFORM=$PLATFORM run_compose up --build -d

  echo ""
  run_compose ps

  echo ""
  wait_for_orderhub

  echo ""
  echo "=== All services started ==="
  echo ""
  echo "  order (Customer):  http://localhost:3000"
  echo "  orderdesk (Admin): http://localhost:3001"
  echo "  orderhub (API):    http://localhost:8080"
  echo "  Prisma Studio:     http://localhost:5555"
  echo "  API Docs:          http://localhost:8080/docs"
  echo ""
  echo "To view logs: docker compose logs -f [service]"
  echo "To stop all:  docker compose down"
}

main
