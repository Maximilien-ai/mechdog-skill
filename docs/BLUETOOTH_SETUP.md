# MechDog Ultra - Bluetooth Setup Guide

## For MechDog Ultra (Bluetooth-only version)

The MechDog Ultra uses Bluetooth Low Energy (BLE) instead of WiFi. We've created a **Bluetooth Bridge** that translates HTTP API calls to Bluetooth commands.

## Quick Start

### Step 1: Install Dependencies

```bash
# Install Bluetooth and Flask libraries
cd bridge
uv pip install bleak flask
cd ..
```

### Step 2: Discover MechDog

```bash
# Scan for Bluetooth devices
bridge/.venv/bin/python bridge/bluetooth_bridge.py --scan
```

**Output:**
```
Scanning for Bluetooth devices...

Found devices:
1. iPhone (12:34:56:78:9A:BC)
2. MechDog-Ultra (AA:BB:CC:DD:EE:FF)  ← This one!
3. AirPods (11:22:33:44:55:66)

Possible MechDog devices:
  - MechDog-Ultra (AA:BB:CC:DD:EE:FF)

Use this MAC address: AA:BB:CC:DD:EE:FF
Run: python bluetooth_bridge.py --mac AA:BB:CC:DD:EE:FF --port 3000
```

### Step 3: Start Bluetooth Bridge

```bash
# Replace with your MechDog's MAC address
bridge/.venv/bin/python bridge/bluetooth_bridge.py \
  --mac AA:BB:CC:DD:EE:FF \
  --port 3000
```

**Output:**
```
Connecting to MechDog at AA:BB:CC:DD:EE:FF...
✓ Connected to MechDog

Available services:
  Service: 0000ffe0-0000-1000-8000-00805f9b34fb
    Characteristic: 0000ffe1-0000-1000-8000-00805f9b34fb - ['write']

✓ Bluetooth bridge running on http://localhost:3000
✓ MechDog connected via Bluetooth: AA:BB:CC:DD:EE:FF

You can now use the HTTP API:
  curl http://localhost:3000/status

Press Ctrl+C to stop
```

### Step 4: Test Commands

**In a new terminal:**

```bash
# Test status
curl http://localhost:3000/status

# Test movement
bridge/.venv/bin/python bridge/bridge.py \
  --cmd move \
  --ip localhost:3000 \
  --dir forward \
  --ms 1000

# Test action
bridge/.venv/bin/python bridge/bridge.py \
  --cmd action \
  --ip localhost:3000 \
  --name dance
```

### Step 5: Use with OpenClaw

```bash
# Set IP to localhost (bridge)
export MECHDOG_IP=localhost:3000

# Start OpenClaw
openclaw --skill skills/mechdog

# Try commands:
> Move forward
> Do a dance
> Sit down
```

## Important Notes

### ⚠️ Reverse Engineering Required

The Bluetooth bridge includes **placeholder command encoding**. The actual Bluetooth protocol needs to be reverse engineered from the Hiwonder app.

**Current status:**
- ✅ Connection works
- ✅ Service discovery works
- ⚠️ Command encoding is placeholder (needs reverse engineering)

### How to Reverse Engineer Commands

**Option 1: Bluetooth Packet Capture**

```bash
# On macOS
sudo log stream --predicate 'subsystem contains "bluetooth"'

# On Linux
sudo btmon

# Then use Hiwonder app and watch the packets
```

**Option 2: Use Hiwonder SDK**

If Hiwonder provides an SDK or API documentation, use those command formats.

**Option 3: Community/Forums**

Search for:
- Hiwonder MechDog BLE protocol
- ESP32 robot control protocols
- Similar robot Bluetooth implementations

### Camera Not Available

**MechDog Ultra does not have a camera.** The `/camera/capture` endpoint will return 404.

**Alternative for vision demos:**
- Use your laptop webcam
- Use external USB camera
- Use simulator with webcam

## Troubleshooting

### Cannot Find MechDog

```bash
# Make sure MechDog is powered on
# Make sure Bluetooth is enabled on your laptop

# On macOS: System Settings > Bluetooth
# On Linux: bluetoothctl
sudo bluetoothctl
> scan on
> devices
```

### Connection Fails

```bash
# Try pairing first in system Bluetooth settings
# Then run the bridge

# On macOS:
# 1. System Settings > Bluetooth
# 2. Look for MechDog device
# 3. Click Connect (if needed)
# 4. Note the MAC address
# 5. Run bridge with that MAC
```

### Commands Don't Work

**This is expected!** The command encoding is placeholder.

**To fix:**
1. Reverse engineer the Bluetooth protocol
2. Update `encode_move()` and `encode_action()` functions
3. Test with actual MechDog

**Or:**
- Use simulator for demos
- Focus on vision/AI integration
- Explain Bluetooth version is in development

## Alternative: Use Simulator

If Bluetooth reverse engineering is taking too long:

```bash
# Just use the simulator
./scripts/start.sh

# All demos work with simulator
export MECHDOG_IP=localhost:3000
./scripts/test.sh demo-vision --ip localhost:3000
```

## For Hackathon

**Recommended approach:**

1. **Try Bluetooth bridge** - See if basic connection works
2. **If commands don't work** - Use simulator instead
3. **Focus on vision AI** - This is your competitive advantage
4. **Explain to judges:**
   - "We built on simulator + webcam"
   - "Bluetooth bridge partially working (connection ✅, encoding in progress)"
   - "Code is ready for MechDog Pro (WiFi version)"

## Future Work

To complete Bluetooth support:

1. **Reverse engineer protocol:**
   - Capture Hiwonder app packets
   - Document command format
   - Update `bluetooth_bridge.py`

2. **Add camera support:**
   - Connect external USB camera
   - Route to `/camera/capture` endpoint
   - Enable vision features

3. **Test thoroughly:**
   - All movement commands
   - All actions
   - Timing and synchronization

**Pull requests welcome!** 🚀

## MAC Address Examples

```bash
# macOS format
AA:BB:CC:DD:EE:FF

# Linux format (lowercase)
aa:bb:cc:dd:ee:ff

# Both work with the bridge
```

## Running Bridge in Background

```bash
# Start bridge in background
nohup bridge/.venv/bin/python bridge/bluetooth_bridge.py \
  --mac AA:BB:CC:DD:EE:FF \
  --port 3000 \
  > bluetooth_bridge.log 2>&1 &

# Check if running
ps aux | grep bluetooth_bridge

# Check logs
tail -f bluetooth_bridge.log

# Stop bridge
pkill -f bluetooth_bridge.py
```

## Summary

**What works:**
- ✅ Bluetooth scanning
- ✅ Bluetooth connection
- ✅ HTTP API server
- ✅ Service discovery

**What needs work:**
- ⚠️ Command encoding (reverse engineering required)
- ⚠️ Camera support (hardware not available)

**Recommended for hackathon:**
- Use simulator for reliable demo
- Show Bluetooth bridge as "in progress"
- Focus on vision AI (your strength!)

---

Need help? Check `docs/MECHDOG_ULTRA_BLUETOOTH.md` for more details.
