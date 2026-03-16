#!/bin/bash

# MechDog Skill Test Script

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

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

print_help() {
    echo -e "${BLUE}MechDog Skill Test Suite${NC}"
    echo ""
    echo "Usage: ./scripts/test.sh [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  bridge        Test Python bridge (requires --ip or --bluetooth)"
    echo "  skill         Test OpenClaw skill functionality"
    echo "  demo          Run full demo sequence (requires --ip or --bluetooth)"
    echo "  demo-vision   Run advanced vision-guided navigation demo (requires --ip)"
    echo "  bluetooth     Test Bluetooth connection (requires --bluetooth)"
    echo "  check         Quick health check (no hardware needed)"
    echo "  all           Run all tests that don't require hardware"
    echo "  help          Show this help message"
    echo ""
    echo "Options:"
    echo "  --ip <IP>              MechDog IP address or localhost:PORT for simulator"
    echo "  --bluetooth <MAC>      MechDog Bluetooth MAC address (for Ultra)"
    echo ""
    echo "Examples:"
    echo "  # Health check (no hardware/simulator needed)"
    echo "  ./scripts/test.sh check"
    echo ""
    echo "  # Test with visual simulator (start it first with ./scripts/start.sh)"
    echo "  ./scripts/test.sh bridge --ip localhost:3000"
    echo "  ./scripts/test.sh demo --ip localhost:3000"
    echo "  ./scripts/test.sh demo-vision --ip localhost:3000"
    echo ""
    echo "  # Test with Bluetooth (MechDog Ultra)"
    echo "  ./scripts/test.sh bluetooth --bluetooth 594FCE37-8C82-3F69-F038-4102A5772742"
    echo "  ./scripts/test.sh bridge --bluetooth 594FCE37-8C82-3F69-F038-4102A5772742"
    echo ""
    echo "  # Test with real hardware (WiFi)"
    echo "  ./scripts/test.sh bridge --ip 192.168.1.100"
    echo "  ./scripts/test.sh demo --ip 192.168.1.100"
    echo ""
    echo "Testing Workflow with Simulator:"
    echo "  1. Start simulator:  ./scripts/start.sh"
    echo "  2. Run tests:        ./scripts/test.sh bridge --ip localhost:3000"
    echo "  3. Watch in browser: http://localhost:3000"
    echo "  4. Stop simulator:   ./scripts/stop.sh"
    echo ""
    echo "Testing Workflow with Bluetooth:"
    echo "  1. Scan for device:  bridge/.venv/bin/python bridge/bluetooth_bridge.py --scan"
    echo "  2. Test connection:  ./scripts/test.sh bluetooth --bluetooth <MAC>"
}

# Parse arguments
MECHDOG_IP=""
BLUETOOTH_MAC=""
USE_BLUETOOTH=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --ip)
            MECHDOG_IP="$2"
            shift 2
            ;;
        --bluetooth)
            USE_BLUETOOTH=true
            BLUETOOTH_MAC="$2"
            shift 2
            ;;
        *)
            COMMAND="$1"
            shift
            ;;
    esac
done

test_check() {
    print_header "Running health checks"

    # Check Python bridge exists
    if [ -f "bridge/bridge.py" ]; then
        print_status "✓ Python bridge found"
    else
        print_error "✗ Python bridge not found"
        exit 1
    fi

    # Check TypeScript skill exists
    if [ -f "skills/mechdog/index.ts" ]; then
        print_status "✓ TypeScript skill found"
    else
        print_error "✗ TypeScript skill not found"
        exit 1
    fi

    # Check Python venv exists
    if [ -d "bridge/.venv" ]; then
        print_status "✓ Python venv found"
    else
        print_warning "⚠ Python venv not found. Run ./build.sh setup"
    fi

    # Check node_modules exists
    if [ -d "node_modules" ]; then
        print_status "✓ Node modules found (root)"
    else
        print_warning "⚠ Node modules not found (root). Run npm install"
    fi

    # Check simulator node_modules
    if [ -d "simulator/node_modules" ]; then
        print_status "✓ Node modules found (simulator)"
    else
        print_warning "⚠ Simulator node modules not found. Run ./build.sh setup"
    fi

    # Test Python bridge help
    if [ -d "bridge/.venv" ]; then
        print_status "Testing Python bridge --help"
        bridge/.venv/bin/python bridge/bridge.py --help > /dev/null
        print_status "✓ Python bridge CLI working"
    fi

    # Check simulator TypeScript
    if [ -f "simulator/server.ts" ]; then
        print_status "✓ Simulator found"
    fi

    print_status "Health check complete"
}

test_bridge() {
    print_header "Testing Python bridge"

    if [ -z "$MECHDOG_IP" ]; then
        print_error "MechDog IP required. Use --ip <IP>"
        exit 1
    fi

    if [ ! -d "bridge/.venv" ]; then
        print_error "Python venv not found. Run ./build.sh setup"
        exit 1
    fi

    print_status "Testing bridge with MechDog at $MECHDOG_IP"

    # Test action command
    print_status "Test 1: Stand action"
    bridge/.venv/bin/python bridge/bridge.py \
        --cmd action --ip "$MECHDOG_IP" --name stand

    sleep 2

    # Test move command
    print_status "Test 2: Forward movement (1 second)"
    bridge/.venv/bin/python bridge/bridge.py \
        --cmd move --ip "$MECHDOG_IP" --dir forward --ms 1000

    sleep 2

    print_status "Bridge tests complete"
}

test_skill() {
    print_header "Testing OpenClaw skill"

    if [ ! -d "node_modules" ]; then
        print_error "Node modules not found. Run npm install"
        exit 1
    fi

    # Type check TypeScript (skills)
    print_status "Type-checking TypeScript skill"
    npx tsc --noEmit

    # Type check TypeScript (simulator)
    if [ -f "simulator/tsconfig.json" ]; then
        print_status "Type-checking TypeScript simulator"
        cd simulator && npx tsc --noEmit && cd ..
    fi

    print_status "Skill tests complete"
}

test_demo() {
    print_header "Running demo sequence"

    if [ -z "$MECHDOG_IP" ]; then
        print_error "MechDog IP required. Use --ip <IP>"
        exit 1
    fi

    print_status "Running demo script with MechDog at $MECHDOG_IP"
    cd bridge/demo
    ./test_bridge.sh "$MECHDOG_IP"
    cd ../..

    print_status "Demo complete"
}

test_demo_vision() {
    print_header "Running advanced vision-guided navigation demo"

    if [ -z "$MECHDOG_IP" ]; then
        print_error "MechDog IP required. Use --ip <IP>"
        exit 1
    fi

    print_status "Running advanced vision demo with MechDog at $MECHDOG_IP"
    cd bridge/demo
    ./test_vision_advanced.sh "$MECHDOG_IP"
    cd ../..

    print_status "Vision demo complete"
}

test_bluetooth() {
    print_header "Testing Bluetooth connection"

    if [ -z "$BLUETOOTH_MAC" ]; then
        print_error "Bluetooth MAC address required. Use --bluetooth <MAC>"
        print_status "Run scan first: bridge/.venv/bin/python bridge/bluetooth_bridge.py --scan"
        exit 1
    fi

    if [ ! -d "bridge/.venv" ]; then
        print_error "Python venv not found. Run ./setup.sh"
        exit 1
    fi

    print_status "Testing connection to MechDog at $BLUETOOTH_MAC"

    # Test by starting bridge (it will connect and show status)
    print_status "Starting Bluetooth bridge (press Ctrl+C to stop)"
    bridge/.venv/bin/python bridge/bluetooth_bridge.py \
        --mac "$BLUETOOTH_MAC" \
        --port 3001

    print_status "Bluetooth test complete"
}

test_all() {
    print_header "Running all tests (no hardware required)"

    test_check
    test_skill

    print_status "All tests complete"
}

# Default to help if no command
COMMAND=${COMMAND:-help}

case "$COMMAND" in
    bridge)
        test_bridge
        ;;
    skill)
        test_skill
        ;;
    demo)
        test_demo
        ;;
    demo-vision)
        test_demo_vision
        ;;
    bluetooth)
        test_bluetooth
        ;;
    check)
        test_check
        ;;
    all)
        test_all
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

print_status "✅ Tests complete"
