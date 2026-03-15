#!/bin/bash

# Test vision integration with MechDog camera
# Usage: ./test_vision.sh [IP] [provider]

set -e

IP=${1:-localhost:3000}
PROVIDER=${2:-nebius}

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        MechDog Vision Integration Test                    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Target:${NC} $IP"
echo -e "${GREEN}VLM Provider:${NC} $PROVIDER"
echo ""

# Check if running against simulator
if [[ "$IP" == *"localhost"* ]] || [[ "$IP" == *"127.0.0.1"* ]]; then
    echo -e "${YELLOW}⚠️  Testing with simulator${NC}"
    echo -e "${YELLOW}   Simulator setup:${NC}"
    echo -e "${YELLOW}   1. Open http://localhost:3000 in Chrome${NC}"
    echo -e "${YELLOW}   2. Click '📹 Start' to enable webcam${NC}"
    echo -e "${YELLOW}   3. Click '📸 Capture' to take snapshot${NC}"
    echo -e "${YELLOW}   4. Point camera at something interesting!${NC}"
    echo ""
    read -p "Press Enter when ready..."
    echo ""
fi

# Check API key
if [ "$PROVIDER" = "nebius" ]; then
    if [ -z "$NEBIUS_API_KEY" ]; then
        echo -e "${RED}❌ Error: NEBIUS_API_KEY not set${NC}"
        echo "   Set it with: export NEBIUS_API_KEY=your-api-key"
        echo "   Or test with mock: bridge/vision.py --ip $IP --mock"
        exit 1
    fi
    echo -e "${GREEN}✓${NC} Nebius API key found"
elif [ "$PROVIDER" = "anthropic" ]; then
    if [ -z "$ANTHROPIC_API_KEY" ]; then
        echo -e "${YELLOW}⚠️  Warning: ANTHROPIC_API_KEY not set${NC}"
        echo "   Vision will use mock responses"
        echo "   Set with: export ANTHROPIC_API_KEY=your-api-key"
        echo ""
    else
        echo -e "${GREEN}✓${NC} Anthropic API key found"
    fi
fi

# Run vision script
echo -e "${BLUE}Running vision integration...${NC}"
echo ""

cd "$(dirname "$0")/.."

if [ -d ".venv" ]; then
    .venv/bin/python vision.py --ip "$IP" --provider "$PROVIDER"
else
    python3 vision.py --ip "$IP" --provider "$PROVIDER"
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Vision test complete!                                     ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Captured image: /tmp/mechdog_frame.jpg"
echo ""
echo "Next steps:"
echo "  1. Review the vision description"
echo "  2. Test vision-guided navigation"
echo "  3. Try different camera angles/objects"
echo ""
echo "For mock mode (no API key needed):"
echo "  cd bridge && .venv/bin/python vision.py --ip $IP --mock"
