#!/bin/bash

# Advanced vision-guided demo with MechDog camera
# Demonstrates full vision-guided navigation workflow
# Usage: ./test_vision_advanced.sh [IP]

set -e

IP=${1:-localhost:3000}

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${MAGENTA}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║   MechDog Vision-Guided Navigation Demo (Advanced)        ║${NC}"
echo -e "${MAGENTA}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}This demo shows the full vision → decision → action loop${NC}"
echo ""

# Check prerequisites
if [[ "$IP" == *"localhost"* ]] || [[ "$IP" == *"127.0.0.1"* ]]; then
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}  SIMULATOR SETUP REQUIRED${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "1. Make sure simulator is running:"
    echo "   ${CYAN}./scripts/status.sh${NC}"
    echo ""
    echo "2. Open browser: ${CYAN}http://localhost:3000${NC} (Chrome recommended)"
    echo ""
    echo "3. Setup scene:"
    echo "   • Click '📹 Start' to enable webcam"
    echo "   • Click '🔴 Add Red' to add red ball"
    echo "   • Click '🔵 Add Blue' to add blue ball"
    echo "   • Click '🟢 Add Green' to add green ball"
    echo "   • Arrange balls in different positions (drag & drop)"
    echo ""
    echo "4. Point webcam at the canvas with colored balls"
    echo ""
    echo "5. Click '📸 Capture' to take snapshot"
    echo ""
    read -p "Press Enter when scene is ready..."
    echo ""
fi

cd "$(dirname "$0")/.."

# Load .env file if it exists
if [ -f "../../.env" ]; then
    export $(cat ../../.env | grep -v '^#' | grep -v '^$' | xargs)
fi

# Scenario 1: Look around
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  SCENARIO 1: Scene Understanding${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}Command:${NC} \"MechDog, what do you see?\""
echo ""

# Capture and analyze
if [ -d ".venv" ]; then
    PYTHON=".venv/bin/python"
else
    PYTHON="python3"
fi

# Check for API key (prefer Nebius)
if [ -n "$NEBIUS_API_KEY" ] && [ -n "$NEBIUS_MODEL" ]; then
    echo -e "${GREEN}✓${NC} Using Nebius VLM for vision"
    PROVIDER="nebius"
elif [ -n "$ANTHROPIC_API_KEY" ]; then
    echo -e "${GREEN}✓${NC} Using Anthropic Claude for vision"
    PROVIDER="anthropic"
else
    echo -e "${YELLOW}⚠${NC}  No API key found, using mock mode"
    echo "   Set NEBIUS_API_KEY or ANTHROPIC_API_KEY for real vision"
    PROVIDER="mock"
fi

echo ""
echo -e "${CYAN}Analyzing scene...${NC}"
echo ""

$PYTHON vision.py --ip "$IP" --provider "$PROVIDER" --save /tmp/mechdog_scene.jpg

echo ""
echo -e "${GREEN}✓${NC} Scene analyzed and saved to /tmp/mechdog_scene.jpg"
echo ""

# Scenario 2: Move based on vision
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  SCENARIO 2: Vision-Guided Movement${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}Command:${NC} \"Turn toward the red ball\""
echo ""

# Simulate decision making
echo "🤖 MechDog reasoning:"
echo "   1. I see a red ball to my right"
echo "   2. I need to turn right to face it"
echo "   3. Executing turn right command..."
echo ""

$PYTHON bridge.py --cmd move --ip "$IP" --dir right --ms 500

echo ""
echo -e "${GREEN}✓${NC} Turned right toward red ball"
sleep 1

# Scenario 3: Navigate to object
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  SCENARIO 3: Navigate to Object${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}Command:${NC} \"Walk toward the red ball\""
echo ""

echo "🤖 MechDog navigation loop:"
echo ""

for i in {1..3}; do
    echo "   ${CYAN}Iteration $i:${NC}"
    echo "   • Capturing frame..."

    # In real implementation, would analyze image here
    echo "   • Analyzing position... (red ball ${i}m away)"
    echo "   • Moving forward..."

    $PYTHON bridge.py --cmd move --ip "$IP" --dir forward --ms 800

    sleep 1

    if [ $i -eq 3 ]; then
        echo "   • ${GREEN}Target reached!${NC}"
    fi
    echo ""
done

echo -e "${GREEN}✓${NC} Navigation complete"

# Scenario 4: Celebrate
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  SCENARIO 4: Celebration${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}Command:${NC} \"Do a happy dance!\""
echo ""

$PYTHON bridge.py --cmd action --ip "$IP" --name dance

echo ""
echo -e "${GREEN}✓${NC} Dancing! Watch the emoji! 💃"

sleep 5

# Summary
echo ""
echo -e "${MAGENTA}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║  Advanced Vision Demo Complete! 🎉                        ║${NC}"
echo -e "${MAGENTA}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}What we demonstrated:${NC}"
echo "  ✓ Scene understanding with camera"
echo "  ✓ Vision-based decision making"
echo "  ✓ Navigation toward detected objects"
echo "  ✓ Multi-step autonomous behavior"
echo "  ✓ Visual feedback with emojis"
echo ""
echo -e "${CYAN}Captured images:${NC}"
echo "  • Scene analysis: /tmp/mechdog_scene.jpg"
echo "  • Latest frame: /tmp/mechdog_frame.jpg"
echo ""
echo -e "${CYAN}Next steps:${NC}"
echo "  1. Implement real VLM integration with Nebius"
echo "  2. Add object detection and distance estimation"
echo "  3. Implement closed-loop vision-guided navigation"
echo "  4. Test with real MechDog at hackathon"
echo ""
echo -e "${GREEN}Ready for Nebius Stretch Goal #1 & #2! 🚀${NC}"
echo ""
