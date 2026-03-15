#!/bin/bash

# MechDog Simulator Start Script

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         MechDog Visual Simulator - Starting...           ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if already running
if [ -f ".simulator.pid" ]; then
    PID=$(cat .simulator.pid)
    if ps -p $PID > /dev/null 2>&1; then
        echo -e "${GREEN}Simulator already running (PID: $PID)${NC}"
        echo -e "${GREEN}URL: http://localhost:$(lsof -p $PID 2>/dev/null | grep LISTEN | awk '{print $9}' | cut -d':' -f2 | head -1)${NC}"
        echo ""
        echo "Use ./stop.sh to stop it first"
        exit 0
    else
        rm .simulator.pid
    fi
fi

# Start simulator in background
echo -e "${GREEN}[1/2]${NC} Starting simulator server..."
cd simulator
SIMULATOR_PORT=3000 npx tsx server.ts > ../simulator.log 2>&1 &
SIMULATOR_PID=$!
cd ..

# Save PID
echo $SIMULATOR_PID > .simulator.pid

# Wait for server to start
echo -e "${GREEN}[2/2]${NC} Waiting for server to be ready..."
sleep 2

# Verify it's running
if ps -p $SIMULATOR_PID > /dev/null 2>&1; then
    echo ""
    echo -e "${GREEN}✅ Simulator started successfully!${NC}"
    echo ""
    echo -e "${BLUE}📊 Status:${NC}"
    echo "   PID: $SIMULATOR_PID"
    echo "   Port: 3000"
    echo "   Logs: simulator.log"
    echo ""
    echo -e "${BLUE}🌐 URLs:${NC}"
    echo "   Web UI:  http://localhost:3000"
    echo "   API:     http://localhost:3000/status"
    echo ""
    echo -e "${BLUE}🧪 Test with:${NC}"
    echo "   bridge/.venv/bin/python bridge/bridge.py --cmd move --ip localhost:3000 --dir forward --ms 2000"
    echo ""
    echo -e "${BLUE}📝 Management:${NC}"
    echo "   Status:  ./status.sh"
    echo "   Stop:    ./stop.sh"
    echo "   Logs:    tail -f simulator.log"
    echo ""
else
    echo ""
    echo "❌ Failed to start simulator. Check simulator.log for errors."
    cat simulator.log
    rm .simulator.pid
    exit 1
fi
