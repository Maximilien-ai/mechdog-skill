#!/bin/bash

# Test camera capture with MechDog simulator
# Usage: ./test_camera.sh [IP]

set -e

IP=${1:-localhost:3000}

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        MechDog Camera Capture Test Demo                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Target:${NC} $IP"
echo ""

# Check if running against simulator
if [[ "$IP" == *"localhost"* ]] || [[ "$IP" == *"127.0.0.1"* ]]; then
    echo -e "${YELLOW}⚠️  Testing with simulator${NC}"
    echo -e "${YELLOW}   Make sure:${NC}"
    echo -e "${YELLOW}   1. Simulator is running: ./scripts/status.sh${NC}"
    echo -e "${YELLOW}   2. Browser is open: http://localhost:3000${NC}"
    echo -e "${YELLOW}   3. Camera is started (click '📹 Start' button)${NC}"
    echo -e "${YELLOW}   4. Frame is captured (click '📸 Capture' button)${NC}"
    echo ""
    read -p "Press Enter when camera frame is captured..."
fi

# Test 1: Capture image
echo -e "${BLUE}[1/3]${NC} Testing camera capture..."
curl -s http://$IP/camera/capture --output capture.jpg

if [ -f capture.jpg ]; then
    SIZE=$(ls -lh capture.jpg | awk '{print $5}')
    echo -e "${GREEN}✓${NC} Image captured successfully (${SIZE})"

    # Check if file is valid JPEG
    if file capture.jpg | grep -q "JPEG"; then
        echo -e "${GREEN}✓${NC} Valid JPEG format"
    else
        echo -e "${YELLOW}⚠${NC}  Warning: File may not be valid JPEG"
    fi
else
    echo -e "${YELLOW}⚠${NC}  No image captured"
fi

echo ""

# Test 2: Check status
echo -e "${BLUE}[2/3]${NC} Checking MechDog status..."
curl -s http://$IP/status | python3 -m json.tool

echo ""

# Test 3: Open captured image
echo -e "${BLUE}[3/3]${NC} Opening captured image..."
if [ -f capture.jpg ]; then
    if command -v open &> /dev/null; then
        open capture.jpg
        echo -e "${GREEN}✓${NC} Image opened in default viewer"
    elif command -v xdg-open &> /dev/null; then
        xdg-open capture.jpg
        echo -e "${GREEN}✓${NC} Image opened in default viewer"
    else
        echo -e "${YELLOW}⚠${NC}  Could not open image automatically"
        echo "   View manually: capture.jpg"
    fi
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Camera test complete!                                     ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Captured image: capture.jpg"
echo ""
echo "Next steps:"
echo "  1. Check the captured image quality"
echo "  2. Test with Nebius VLM: bridge/demo/test_vision.sh $IP"
echo "  3. Try vision-guided navigation demo"
