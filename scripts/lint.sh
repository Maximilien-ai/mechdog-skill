#!/bin/bash

# MechDog Skill Lint Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[LINT]${NC} $1"
}

print_help() {
    echo -e "${BLUE}MechDog Skill Lint${NC}"
    echo ""
    echo "Usage: ./lint.sh [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  python      Lint Python code (ruff)"
    echo "  typescript  Lint TypeScript code (eslint)"
    echo "  all         Lint all code (default)"
    echo "  help        Show this help message"
}

lint_python() {
    print_header "Linting Python code"

    if ! command -v ruff &> /dev/null; then
        print_status "ruff not found, installing..."
        cd bridge
        uv pip install ruff
        cd ..
    fi

    print_status "Running ruff on bridge/*.py"
    bridge/.venv/bin/ruff check bridge/*.py || true

    print_status "Python linting complete"
}

lint_typescript() {
    print_header "Linting TypeScript code"

    if [ ! -f "node_modules/.bin/eslint" ]; then
        print_status "Installing eslint..."
        npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
    fi

    print_status "Running eslint on skills/**/*.ts"
    npx eslint skills/**/*.ts --ext .ts || true

    if [ -f "simulator/server.ts" ]; then
        print_status "Running eslint on simulator/*.ts"
        npx eslint simulator/*.ts --ext .ts || true
    fi

    print_status "TypeScript linting complete"
}

# Parse command
COMMAND=${1:-all}

case "$COMMAND" in
    python)
        lint_python
        ;;
    typescript)
        lint_typescript
        ;;
    all)
        lint_python
        lint_typescript
        ;;
    help)
        print_help
        exit 0
        ;;
    *)
        print_error "Unknown command: $COMMAND"
        print_help
        exit 1
        ;;
esac

print_status "✅ Linting complete"
