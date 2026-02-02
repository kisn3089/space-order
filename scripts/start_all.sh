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

check_docker() {
  command -v docker &> /dev/null || { echo "docker not found"; exit 1; }
  detect_compose_cmd || { echo "compose not found"; exit 1; }
  docker info &> /dev/null || { echo "docker daemon not running"; exit 1; }
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
  if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    cp ".env.example" ".env"
  fi
}

main() {
  check_docker
  check_platform
  check_env_file
  cd "$PROJECT_ROOT"

  # 기본: 최신 이미지로 실행
  PLATFORM=$PLATFORM "$DOCKER_COMPOSE_BIN" $DOCKER_COMPOSE_SUBCMD up --pull always -d

  "$DOCKER_COMPOSE_BIN" $DOCKER_COMPOSE_SUBCMD ps

  pnpm prisma:studio -- --port 5555 >/tmp/prisma-studio.log 2>&1 &
  STUDIO_PID=$!

  sleep 1
  if kill -0 "$STUDIO_PID" 2>/dev/null; then
    echo "Prisma Studio http://localhost:5555"
  else
    echo "Prisma Studio failed. Check :5555 port and /tmp/prisma-studio.log"
    exit 1
  fi
}

main