#!/bin/bash
set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

DOCKER_COMPOSE_BIN=""
DOCKER_COMPOSE_SUBCMD=""

STOP_SERVICES=false
RUN_PRISMA_SEED=false

show_help() {
  echo "Usage: $0 [OPTIONS]"
  echo ""
  echo "Options:"
  echo "  -h, --help     도움말 표시"
  echo "  -s, --stop     모든 서비스 중지"
  echo ""
  echo "Examples:"
  echo "  $0              # 서비스 시작"
  echo "  $0 --stop       # 서비스 중지"
  exit 0
}

while [ "$1" != "" ]; do
  case $1 in
    -h | --help )   show_help
                    ;;
    -s | --stop )   STOP_SERVICES=true
                    ;;
    * )             echo "Error: 알 수 없는 옵션: $1"
                    show_help
                    ;;
  esac
  shift
done

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

generate_secrets() {
  GEN_DB_ROOT_PW=$(openssl rand -hex 16)
  GEN_DB_PW=$(openssl rand -hex 16)
  GEN_JWT_ACCESS=$(openssl rand -hex 24)
  GEN_JWT_REFRESH=$(openssl rand -hex 24)
}

replace_secrets() {
  local src="$1"
  local dest="$2"

  sed \
    -e "s|^DB_ROOT_PASSWORD=.*|DB_ROOT_PASSWORD=$GEN_DB_ROOT_PW|" \
    -e "s|^DB_PASSWORD=.*|DB_PASSWORD=$GEN_DB_PW|" \
    -e "s|^DATABASE_URL=.*|DATABASE_URL=mysql://spaceorder:${GEN_DB_PW}@localhost:3306/spaceorder?connection_limit=10\&pool_timeout=10|" \
    -e "s|^JWT_ACCESS_TOKEN_SECRET=.*|JWT_ACCESS_TOKEN_SECRET=$GEN_JWT_ACCESS|" \
    -e "s|^JWT_REFRESH_TOKEN_SECRET=.*|JWT_REFRESH_TOKEN_SECRET=$GEN_JWT_REFRESH|" \
    "$src" > "$dest"
}

check_env_file() {
  cd "$PROJECT_ROOT"
  if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
      echo "Generating .env from .env.example with auto-generated secrets..."
      generate_secrets
      replace_secrets ".env.example" ".env"
      RUN_PRISMA_SEED=true
      echo "Created .env with auto-generated secrets (prisma seed enabled for first run)"
      echo "Installing dependencies..."
      pnpm install
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
    if curl -fsS "http://localhost:${SERVER_PORT:-8080}/" >/dev/null 2>&1; then
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

stop_services() {
  echo "=== Stopping SpaceOrder Services ==="
  echo ""

  check_docker
  cd "$PROJECT_ROOT"

  run_compose down --remove-orphans
  echo ""
  echo "=== All services stopped ==="
}

main() {
  if [ "$STOP_SERVICES" = true ]; then
    stop_services
    exit 0
  fi

  echo "=== SpaceOrder Development Environment Setup ==="
  echo ""

  check_docker
  check_platform
  check_env_file

  cd "$PROJECT_ROOT"

  # Load environment variables for port detection
  set -a
  . "$PROJECT_ROOT/.env"
  set +a

  echo ""
  echo "Starting Docker containers..."
  # RUN_PRISMA_SEED 값은 초기 데이터 시딩을 위해 최초 1회만 true로 설정됩니다.
  PLATFORM=$PLATFORM RUN_PRISMA_SEED=$RUN_PRISMA_SEED run_compose up --build -d

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
  echo "To view logs:  docker compose logs -f [service]"
  echo "To stop all:   $0 --stop"
}

main
