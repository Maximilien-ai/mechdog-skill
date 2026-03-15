#!/bin/bash

# MechDog Skill - Complete Setup Script

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo ""
}

print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_header "MechDog Skill - Complete Setup"

# 1. Check prerequisites
print_header "Checking Prerequisites"

# Check uv
if command -v uv &> /dev/null; then
    print_status "uv found ($(uv --version))"
else
    print_error "uv not found"
    echo "Install from: https://github.com/astral-sh/uv"
    echo "Or run: curl -LsSf https://astral.sh/uv/install.sh | sh"
    exit 1
fi

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_status "Node.js found ($NODE_VERSION)"

    # Check if version >= 22
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ $NODE_MAJOR -lt 22 ]; then
        print_warning "Node.js version should be >= 22 (you have $NODE_VERSION)"
        print_warning "Some features may not work correctly"
    fi
else
    print_error "Node.js not found"
    echo "Install from: https://nodejs.org/"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    print_status "npm found ($(npm --version))"
else
    print_error "npm not found (should come with Node.js)"
    exit 1
fi

# 2. Setup Python environment
print_header "Setting Up Python Environment"

cd bridge

if [ ! -d ".venv" ]; then
    print_status "Creating Python virtual environment..."
    uv venv
else
    print_status "Python venv already exists"
fi

print_status "Installing Python dependencies..."
uv pip install requests anthropic openai

cd ..

# 3. Setup Node.js dependencies
print_header "Setting Up Node.js Dependencies"

if [ ! -d "node_modules" ]; then
    print_status "Installing root dependencies..."
    npm install
else
    print_status "Root dependencies already installed"
fi

if [ ! -d "simulator/node_modules" ]; then
    print_status "Installing simulator dependencies..."
    cd simulator && npm install && cd ..
else
    print_status "Simulator dependencies already installed"
fi

# 4. Build TypeScript
print_header "Building TypeScript"

print_status "Compiling TypeScript skill..."
npm run build

print_status "Simulator ready (runs with tsx)"

# 5. Run health check
print_header "Running Health Check"

./scripts/test.sh check

# 6. Summary
print_header "Setup Complete!"

echo -e "${GREEN}✅ All dependencies installed${NC}"
echo -e "${GREEN}✅ TypeScript compiled${NC}"
echo -e "${GREEN}✅ Health check passed${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo ""
echo "   1. ${YELLOW}Start the visual simulator:${NC}"
echo "      ./scripts/start.sh"
echo "      Open http://localhost:3000"
echo ""
echo "   2. ${YELLOW}Test the bridge:${NC}"
echo "      bridge/.venv/bin/python bridge/bridge.py --cmd move --ip localhost:3000 --dir forward --ms 2000"
echo ""
echo "   3. ${YELLOW}For real hardware:${NC}"
echo "      cp .env.example .env"
echo "      # Edit .env with your MechDog IP"
echo ""
echo -e "${BLUE}📖 Documentation:${NC}"
echo "   README.md                    - Quick start guide"
echo "   docs/SIMULATOR.md            - Simulator details"
echo "   docs/OPENCLAW_INTEGRATION.md - OpenClaw setup"
echo ""
echo -e "${BLUE}🛠️  Useful Commands:${NC}"
echo "   ./scripts/start.sh    - Start simulator"
echo "   ./scripts/stop.sh     - Stop simulator"
echo "   ./scripts/status.sh   - Check simulator status"
echo "   ./scripts/test.sh     - Run tests"
echo "   ./scripts/build.sh    - Rebuild everything"
echo ""
echo -e "${GREEN}Happy hacking! 🤖🚀${NC}"
echo ""
