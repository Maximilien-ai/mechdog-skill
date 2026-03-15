#!/bin/bash

# MechDog Simulator Status Script

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           MechDog Simulator - Status Check               ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if PID file exists
if [ ! -f ".simulator.pid" ]; then
    echo -e "${RED}❌ Simulator: NOT RUNNING${NC}"
    echo ""
    echo "Start with: ./start.sh"
    exit 0
fi

PID=$(cat .simulator.pid)

# Check if process is running
if ps -p $PID > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Simulator: RUNNING${NC}"
    echo ""
    echo -e "${BLUE}Process Info:${NC}"
    echo "   PID: $PID"
    ps -p $PID -o pid,ppid,etime,command | tail -n +2
    echo ""

    # Check if port 3000 is listening
    if lsof -i :3000 > /dev/null 2>&1; then
        echo -e "${BLUE}Network:${NC}"
        echo "   Port: 3000 (LISTENING)"
        echo "   URL:  http://localhost:3000"
        echo ""

        # Try to hit the status endpoint
        if command -v curl > /dev/null 2>&1; then
            echo -e "${BLUE}API Health Check:${NC}"
            RESPONSE=$(curl -s http://localhost:3000/status)
            if [ $? -eq 0 ]; then
                echo "   $RESPONSE"
            else
                echo "   ❌ API not responding"
            fi
        fi
    else
        echo -e "${YELLOW}⚠️  Port 3000 not listening (may still be starting)${NC}"
    fi

    echo ""
    echo -e "${BLUE}Recent Logs:${NC}"
    if [ -f "simulator.log" ]; then
        tail -n 5 simulator.log | sed 's/^/   /'
        echo ""
        echo "   Full logs: tail -f simulator.log"
    else
        echo "   No log file found"
    fi

else
    echo -e "${RED}❌ Simulator: NOT RUNNING (stale PID)${NC}"
    echo "   Cleaning up stale PID file..."
    rm .simulator.pid
fi

echo ""
echo -e "${BLUE}Management Commands:${NC}"
echo "   Start:   ./start.sh"
echo "   Stop:    ./stop.sh"
echo "   Restart: ./stop.sh && ./start.sh"
echo ""
