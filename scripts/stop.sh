#!/bin/bash

# MechDog Simulator Stop Script

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Stopping MechDog Simulator...${NC}"

if [ ! -f ".simulator.pid" ]; then
    echo -e "${RED}No PID file found. Simulator may not be running.${NC}"
    exit 1
fi

PID=$(cat .simulator.pid)

if ps -p $PID > /dev/null 2>&1; then
    echo "Stopping simulator (PID: $PID)..."
    kill $PID
    sleep 1

    # Force kill if still running
    if ps -p $PID > /dev/null 2>&1; then
        echo "Force killing..."
        kill -9 $PID
    fi

    rm .simulator.pid
    echo -e "${GREEN}✅ Simulator stopped${NC}"
else
    echo -e "${YELLOW}Simulator not running (stale PID file)${NC}"
    rm .simulator.pid
fi
