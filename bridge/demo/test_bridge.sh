#!/bin/bash
# Demo script to test MechDog bridge commands
# Usage: ./test_bridge.sh <mechdog-ip>

if [ -z "$1" ]; then
    echo "Usage: $0 <mechdog-ip>"
    echo "Example: $0 192.168.1.100"
    exit 1
fi

MECHDOG_IP=$1
PYTHON="../.venv/bin/python"
BRIDGE="../bridge.py"

echo "🤖 MechDog Bridge Demo"
echo "====================="
echo "MechDog IP: $MECHDOG_IP"
echo ""

# Test 1: Stand
echo "Test 1: Stand up"
$PYTHON $BRIDGE --cmd action --ip $MECHDOG_IP --name stand
sleep 2

# Test 2: Walk forward
echo ""
echo "Test 2: Walk forward for 3 seconds"
$PYTHON $BRIDGE --cmd move --ip $MECHDOG_IP --dir forward --ms 3000
sleep 4

# Test 3: Turn left
echo ""
echo "Test 3: Turn left for 1 second"
$PYTHON $BRIDGE --cmd move --ip $MECHDOG_IP --dir left --ms 1000
sleep 2

# Test 4: Sit
echo ""
echo "Test 4: Sit down"
$PYTHON $BRIDGE --cmd action --ip $MECHDOG_IP --name sit
sleep 2

# Test 5: Wave
echo ""
echo "Test 5: Wave"
$PYTHON $BRIDGE --cmd action --ip $MECHDOG_IP --name wave
sleep 3

# Test 6: Dance
echo ""
echo "Test 6: Dance!"
$PYTHON $BRIDGE --cmd action --ip $MECHDOG_IP --name dance
sleep 5

echo ""
echo "✅ Demo complete!"
