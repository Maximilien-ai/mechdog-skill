# MechDog Pro Setup Guide

**Status:** Ready for MechDog Pro arrival (Expected: April 2026)

This guide will help you get started with MechDog Pro when it arrives. The MechDog Pro has WiFi capabilities, making it fully compatible with this skill.

## What is MechDog Pro?

MechDog Pro is the WiFi-enabled version of the Hiwonder MechDog quadruped robot. Unlike MechDog Ultra (Bluetooth-only), MechDog Pro includes an ESP32 WiFi module that supports HTTP API control.

**Key Differences:**
- ✅ **MechDog Pro**: WiFi + HTTP API (fully supported by this skill)
- ⚠️ **MechDog Ultra**: Bluetooth-only (requires `bluetooth_bridge.py` workaround)

## Prerequisites

Before MechDog Pro arrives, ensure you have:

- [x] Node.js >= 22
- [x] Python >= 3.10
- [x] [uv](https://github.com/astral-sh/uv) Python package manager
- [x] [OpenClaw](https://openclaw.ai) installed: `npm install -g openclaw@latest`
- [x] This repository cloned and set up
- [x] Simulator tested and working

## Day 1: Unboxing and First Connection

### Step 1: Physical Setup

1. **Charge the battery** fully before first use
2. **Power on MechDog Pro** - locate the power switch
3. **Check for WiFi LED** indicator (ESP32 module)

### Step 2: Connect to MechDog's WiFi Network

MechDog Pro creates its own WiFi access point:

```bash
# 1. Look for WiFi network named "MechDog-XXXX" or "ESP32-XXXX"
# 2. Connect your laptop to this network
# 3. Password is usually printed on the robot or in manual (often: "12345678")

# 4. Test connection - ESP32 AP mode default IP is 192.168.4.1
curl http://192.168.4.1/status
```

**Expected response:**
```json
{"status":"ok","battery":85}
```

If this works, you're connected! Skip to Step 4.

### Step 3: (Optional) Connect MechDog to Your WiFi

For better range and to keep your laptop on your main network:

```bash
# Option A: Use Hiwonder mobile app
# 1. Download Hiwonder app (iOS/Android)
# 2. Connect MechDog via app
# 3. Configure WiFi settings in app
# 4. Note the IP address assigned by your router

# Option B: Direct ESP32 configuration (if supported)
# 1. Connect to MechDog's AP (192.168.4.1)
# 2. Access web interface at http://192.168.4.1/config
# 3. Enter your WiFi credentials
# 4. Check your router for MechDog's new IP
```

### Step 4: Test Basic Commands

```bash
# Set IP based on connection method
export MECHDOG_IP=192.168.4.1  # If using MechDog's AP
# OR
export MECHDOG_IP=192.168.1.XXX  # If on your WiFi (replace with actual IP)

# Test status
curl http://$MECHDOG_IP/status

# Test movement
curl -X POST http://$MECHDOG_IP/move \
  -H "Content-Type: application/json" \
  -d '{"direction":"forward","duration_ms":1000}'

# Test action
curl -X POST http://$MECHDOG_IP/action \
  -H "Content-Type: application/json" \
  -d '{"name":"sit"}'
```

### Step 5: Test with Python Bridge

```bash
# Navigate to skill directory
cd /path/to/mechdog-skill

# Test bridge commands
bridge/.venv/bin/python bridge/bridge.py --cmd move --ip $MECHDOG_IP --dir forward --ms 2000
bridge/.venv/bin/python bridge/bridge.py --cmd action --ip $MECHDOG_IP --name wave
```

### Step 6: Run Full Demo

```bash
# Run the complete demo sequence
./scripts/test.sh demo --ip $MECHDOG_IP
```

You should see MechDog:
1. Stand up
2. Walk forward
3. Turn left
4. Turn right
5. Sit down
6. Wave
7. Dance
8. Return to standing

## Day 2: OpenClaw Integration

### Configure Environment

```bash
# Add to ~/.zshrc or ~/.bashrc
echo "export MECHDOG_IP=$MECHDOG_IP" >> ~/.zshrc
source ~/.zshrc
```

### Test with OpenClaw

```bash
# Make sure OpenClaw is running
openclaw --version

# Try natural language commands:
# - "MechDog, walk forward for 3 seconds"
# - "Turn left and sit down"
# - "Stand up and wave"
# - "Dance!"
```

See `docs/OPENCLAW_INTEGRATION.md` for detailed integration steps.

## Day 3: Advanced Features

### Camera/Vision (if MechDog Pro has ESP32-S3 with camera)

```bash
# Test camera capture
curl http://$MECHDOG_IP/camera/capture

# Test vision with Nebius VLM
cp .env.example .env
# Add your Nebius API key to .env
./scripts/test.sh demo-vision --ip $MECHDOG_IP
```

See `docs/MECHDOG_HACKATHON.md` for vision-guided navigation demos.

### Custom Action Sequences

Edit `skills/mechdog/index.ts` to add custom movement patterns:

```typescript
// Example: Circle pattern
async function circlePattern() {
  await moveForward(1000);
  await turnLeft(500);
  await moveForward(1000);
  await turnLeft(500);
  await moveForward(1000);
  await turnLeft(500);
  await moveForward(1000);
  await turnLeft(500);
}
```

## Troubleshooting

### Can't Connect to WiFi

1. **Check power**: Is MechDog Pro powered on?
2. **Check WiFi LED**: Is it blinking/solid?
3. **Check network**: Are you connected to MechDog's AP?
4. **Check IP**: Is 192.168.4.1 the correct default?
5. **Try ping**: `ping 192.168.4.1`

See `docs/WIFI_TROUBLESHOOTING.md` for detailed troubleshooting.

### Commands Not Working

1. **Test connection**: `curl http://$MECHDOG_IP/status`
2. **Check battery**: Low battery may affect movement
3. **Check command format**: Ensure JSON is valid
4. **Check ESP32 firmware**: May need update

See `docs/TROUBLESHOOTING.md` for full troubleshooting guide.

### HTTP Errors

- **503 Service Unavailable**: ESP32 may be overloaded, wait and retry
- **404 Not Found**: Check endpoint path (`/move`, `/action`, `/status`)
- **400 Bad Request**: Check JSON format
- **Timeout**: Check WiFi connection strength

## API Reference

Full API documentation: `docs/ESP32_API.md`

### Endpoints

- `GET /status` - Get robot status
- `POST /move` - Movement commands (forward, backward, left, right)
- `POST /action` - Action commands (sit, stand, wave, dance, etc.)
- `GET /camera/capture` - Capture image (if camera available)

### Available Actions

```
Movement:
- forward, backward, left, right, stop

Actions:
- sit, stand, lie_down
- shake, wave, bow, nod
- balance (2-leg stand)
- dance, stretch
```

## Comparison: MechDog Pro vs Ultra

| Feature | MechDog Pro | MechDog Ultra |
|---------|-------------|---------------|
| WiFi | ✅ Yes (HTTP API) | ❌ No |
| Bluetooth | ✅ Yes | ✅ Yes (proprietary protocol) |
| HTTP API | ✅ Native | ❌ Not accessible |
| Camera | ✅ Yes (HTTP accessible) | ✅ Yes (not accessible via BT) |
| This Skill | ✅ Full support | ❌ Protocol unsuccessful |
| Range | ✅ WiFi range | ⚠️ Bluetooth (~10m) |
| Recommended | ✅ YES | ❌ Use simulator instead |

## What Was Learned from MechDog Ultra

During the hackathon with MechDog Ultra (Bluetooth-only), we attempted to reverse engineer the protocol:

1. ⚠️ **Attempted Bluetooth protocol reverse engineering** - Unsuccessful, but documented
2. ❌ **Protocol is proprietary** - Not publicly documented
3. ✅ **MechDog Ultra has camera** - But no way to access via Bluetooth
4. ✅ **Explored multiple approaches** - Service discovery, command formats, packet capture
5. ✅ **Documented everything** - See `docs/BLUETOOTH_TROUBLESHOOTING.md`

**Key insight:** MechDog Ultra's Bluetooth protocol is proprietary. MechDog Pro with WiFi (HTTP API) will work like our simulator!

See `docs/BLUETOOTH_TROUBLESHOOTING.md` for what we tried and what failed.

## Migration from Simulator

If you've been using the simulator:

```bash
# Simulator (current)
./scripts/start.sh
bridge/.venv/bin/python bridge/bridge.py --cmd action --ip localhost:3000 --name wave

# MechDog Pro (when it arrives - should work the same way!)
bridge/.venv/bin/python bridge/bridge.py --cmd action --ip 192.168.4.1 --name wave
```

Same commands, just different IP! MechDog Pro works exactly like the simulator.

## Next Steps After Setup

1. ✅ **Test all movements and actions** - Make sure everything works
2. ✅ **Test camera/vision** (if available) - Enable VLM features
3. ✅ **Create custom routines** - Build your own action sequences
4. ✅ **Integrate with OpenClaw** - Natural language control
5. ✅ **Build something cool!** - Let your imagination run wild

## Resources

- **This Repository**: Complete skill implementation
- **Simulator**: `./scripts/start.sh` - Test without hardware
- **Documentation**: `docs/` directory - All guides and references
- **Bluetooth Learnings**: If WiFi doesn't work, we have a backup plan!

## Support

Having issues? Check these resources:

1. `docs/FAQ.md` - Frequently asked questions
2. `docs/TROUBLESHOOTING.md` - Detailed problem solving
3. `docs/WIFI_TROUBLESHOOTING.md` - WiFi-specific issues
4. `docs/ESP32_API.md` - API reference
5. GitHub Issues - Report bugs or ask questions

## Welcome MechDog Pro! 🎉

When your MechDog Pro arrives, you'll be ready to:

- Connect in minutes (not hours)
- Control via WiFi HTTP API (no bridge needed)
- Use with OpenClaw immediately
- Test vision features (if camera equipped)
- Build amazing things!

**Everything is ready. Just waiting for the robot to arrive!**
