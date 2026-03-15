#!/bin/bash

# MechDog Skill Build Script

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
    echo -e "${BLUE}[BUILD]${NC} $1"
}

print_help() {
    echo -e "${BLUE}MechDog Skill Build${NC}"
    echo ""
    echo "Usage: ./build.sh [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  setup       Install all dependencies (Python + Node.js)"
    echo "  typescript  Build TypeScript only"
    echo "  clean       Clean build artifacts"
    echo "  all         Setup + build everything (default)"
    echo "  help        Show this help message"
}

setup_python() {
    print_header "Setting up Python environment"

    if ! command -v uv &> /dev/null; then
        print_error "uv not found. Install it from: https://github.com/astral-sh/uv"
        exit 1
    fi

    cd bridge

    if [ ! -d ".venv" ]; then
        print_status "Creating Python virtual environment"
        uv venv
    fi

    print_status "Installing Python dependencies"
    uv pip install requests

    cd ..

    print_status "Python setup complete"
}

setup_typescript() {
    print_header "Setting up TypeScript environment"

    if [ ! -d "node_modules" ]; then
        print_status "Installing Node.js dependencies"
        npm install
    else
        print_status "Node modules already installed"
    fi

    print_status "TypeScript setup complete"
}

build_typescript() {
    print_header "Building TypeScript"

    if [ ! -d "node_modules" ]; then
        print_error "Node modules not installed. Run ./build.sh setup first"
        exit 1
    fi

    print_status "Compiling TypeScript..."
    npm run build

    print_status "TypeScript build complete"
}

clean_build() {
    print_header "Cleaning build artifacts"

    rm -rf dist/
    rm -rf node_modules/
    rm -rf bridge/.venv/
    rm -rf bridge/__pycache__/
    find . -name "*.pyc" -delete
    find . -name "*.pyo" -delete
    find . -name "*.pyd" -delete

    print_status "Clean complete"
}

# Parse command
COMMAND=${1:-all}

case "$COMMAND" in
    setup)
        setup_python
        setup_typescript
        ;;
    typescript)
        build_typescript
        ;;
    clean)
        clean_build
        ;;
    all)
        setup_python
        setup_typescript
        build_typescript
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

print_status "✅ Build complete"
