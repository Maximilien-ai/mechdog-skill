# Troubleshooting Guide

Detailed solutions for common issues with the MechDog OpenClaw skill.

---

## Table of Contents

- [Installation Issues](#installation-issues)
- [Connectivity Issues](#connectivity-issues)
- [Simulator Issues](#simulator-issues)
- [Bridge/API Issues](#bridgeapi-issues)
- [OpenClaw Integration Issues](#openclaw-integration-issues)
- [Hardware-Specific Issues](#hardware-specific-issues)
- [Performance Issues](#performance-issues)

---

## Installation Issues

### ❌ `command not found: uv`

**Problem:** Python package manager `uv` is not installed.

**Solution:**
```bash
# Install uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# Restart shell or source profile
source ~/.zshrc  # or ~/.bashrc

# Verify installation
uv --version
```

### ❌ `Module not found: requests`

**Problem:** Python dependencies not installed.

**Solution:**
```bash
# Run setup script
./setup.sh

# Or manually install
cd bridge
uv venv
uv pip install requests
cd ..
```

### ❌ `npm install` fails

**Problem:** Node.js version too old or npm not installed.

**Solution:**
```bash
# Check Node version (need >= 22)
node --version

# Install/update Node.js
# Mac (Homebrew):
brew install node

# Or use nvm:
nvm install 22
nvm use 22

# Try npm install again
npm install
```

### ❌ `./setup.sh: Permission denied`

**Problem:** Setup script is not executable.

**Solution:**
```bash
chmod +x setup.sh
chmod +x scripts/*.sh
./setup.sh
```

### ❌ TypeScript compilation errors

**Problem:** TypeScript dependencies or configuration issue.

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check TypeScript version
npx tsc --version

# Run type check
npx tsc --noEmit
```

---

## Connectivity Issues

### ❌ `Connection refused` when testing bridge

**Problem:** Can't connect to MechDog or simulator.

**Diagnosis:**
```bash
# Check what you're trying to connect to
echo $MECHDOG_IP

# Test basic connectivity
ping 192.168.4.1  # Or your IP

# Test HTTP
curl -v http://192.168.4.1/status
```

**Solutions:**

**If testing with simulator:**
```bash
# Is simulator running?
./scripts/status.sh

# Start it if not running
./scripts/start.sh

# Verify it's listening
curl http://localhost:3000/status
```

**If testing with real MechDog:**
```bash
# 1. Verify MechDog is powered on (wait 30s after power on)
# 2. Check WiFi connection

# Option A: Using MechDog AP mode
# - Connect laptop to "MechDog-XXXX" WiFi
# - IP should be 192.168.4.1

# Option B: MechDog on your network
# - Find IP from router or app
# - Make sure laptop is on same network

# Test connectivity
ping 192.168.4.1
curl http://192.168.4.1/status
```

### ❌ `MechDog-XXXX` WiFi network not visible

**Problem:** MechDog WiFi AP not broadcasting.

**Solutions:**
1. **Power cycle:** Turn MechDog off and on, wait 30-45 seconds
2. **Check battery:** Low battery may disable WiFi
3. **Factory reset:** Use Hiwonder app to reset WiFi settings
4. **Use existing network:** Configure MechDog to join your WiFi via Hiwonder app

### ❌ Can connect to MechDog WiFi but no internet

**Problem:** MechDog AP mode doesn't provide internet (this is normal).

**Solution:**
This is expected behavior. The MechDog WiFi is for local control only. If you need internet access:
1. Use Option B: Connect MechDog to your existing WiFi
2. Or: Use a second WiFi adapter/phone tethering for internet while connected to MechDog

### ❌ WiFi keeps disconnecting

**Problem:** Unstable WiFi connection to MechDog.

**Solutions:**
1. **Move closer:** MechDog WiFi range is ~10-20m
2. **Reduce interference:** Move away from other WiFi routers, microwaves
3. **Check battery:** Low battery can cause unstable WiFi
4. **Use cable:** For demos, consider USB tethering if supported

### ❌ `MECHDOG_IP` not set

**Problem:** Environment variable not configured.

**Solution:**
```bash
# Set for current session
export MECHDOG_IP=192.168.4.1

# Make permanent (add to shell profile)
echo 'export MECHDOG_IP=192.168.4.1' >> ~/.zshrc  # or ~/.bashrc
source ~/.zshrc

# Verify
echo $MECHDOG_IP
```

---

## Simulator Issues

### ❌ Simulator won't start - "Port already in use"

**Problem:** Port 3000 is already in use by another process.

**Diagnosis:**
```bash
# Find what's using port 3000
lsof -i :3000
```

**Solutions:**

**Option 1: Kill the process**
```bash
# Kill process on port 3000
lsof -ti :3000 | xargs kill -9

# Start simulator
./scripts/start.sh
```

**Option 2: Use different port**
```bash
# Start on different port
SIMULATOR_PORT=8080 ./scripts/start.sh

# Update MECHDOG_IP
export MECHDOG_IP=localhost:8080
```

### ❌ Simulator starts but browser shows "Can't connect"

**Problem:** Simulator process crashed or not listening.

**Diagnosis:**
```bash
# Check simulator status
./scripts/status.sh

# Check logs
tail -f simulator.log
```

**Solution:**
```bash
# Stop any existing instances
./scripts/stop.sh

# Restart
./scripts/start.sh

# If still failing, check logs
cat simulator.log
```

### ❌ Drag and drop not working in browser

**Problem:** Browser cache or JavaScript not loading.

**Solutions:**
1. **Hard refresh:** `Cmd+Shift+R` (Mac) or `Ctrl+Shift+F5` (Windows)
2. **Clear cache:** Browser settings → Clear cache
3. **Check console:** Open browser DevTools (F12) → Console tab → look for errors
4. **Try different browser:** Test in Chrome/Firefox/Safari

### ❌ Simulator shows "Connecting..." forever

**Problem:** WebSocket connection failing.

**Solutions:**
1. **Check URL:** Make sure you're on `http://localhost:3000` not `https://`
2. **Firewall:** Temporarily disable firewall
3. **Check logs:** `tail -f simulator.log`
4. **Restart:** `./scripts/stop.sh && ./scripts/start.sh`

### ❌ Robot doesn't appear on canvas

**Problem:** Canvas rendering issue.

**Solutions:**
1. **Hard refresh:** `Cmd+Shift+R`
2. **Check console:** F12 → Console → look for JavaScript errors
3. **Check version:** URL should have `?v=5` query param
4. **Browser support:** Use modern browser (Chrome/Firefox/Safari)

---

## Bridge/API Issues

### ❌ `bridge.py: command not found`

**Problem:** Python script not executable or wrong path.

**Solution:**
```bash
# Use full path with Python from venv
bridge/.venv/bin/python bridge/bridge.py --cmd action --ip localhost:3000 --name wave

# Or activate venv first
source bridge/.venv/bin/activate
python bridge/bridge.py --cmd action --ip localhost:3000 --name wave
```

### ❌ Bridge returns error: `Invalid direction`

**Problem:** Typo in direction parameter.

**Valid values:** `forward`, `backward`, `left`, `right`, `stop`

**Example:**
```bash
# ❌ Wrong
bridge/.venv/bin/python bridge/bridge.py --cmd move --ip localhost:3000 --dir forwards --ms 2000

# ✅ Correct
bridge/.venv/bin/python bridge/bridge.py --cmd move --ip localhost:3000 --dir forward --ms 2000
```

### ❌ Bridge returns error: `Invalid action`

**Problem:** Typo in action name.

**Valid values:** `sit`, `stand`, `shake`, `wave`, `dance`, `balance`

**Example:**
```bash
# ❌ Wrong
bridge/.venv/bin/python bridge/bridge.py --cmd action --ip localhost:3000 --name sitting

# ✅ Correct
bridge/.venv/bin/python bridge/bridge.py --cmd action --ip localhost:3000 --name sit
```

### ❌ Bridge hangs/times out

**Problem:** Network issue or MechDog not responding.

**Diagnosis:**
```bash
# Test raw HTTP
curl -v -X POST http://192.168.4.1/action \
  -H "Content-Type: application/json" \
  -d '{"name": "wave"}'
```

**Solutions:**
1. **Check connectivity:** `ping 192.168.4.1`
2. **Verify IP:** Make sure `MECHDOG_IP` is correct
3. **Check MechDog:** Is it powered on? Battery charged?
4. **Firewall:** Temporarily disable firewall

---

## OpenClaw Integration Issues

### ❌ OpenClaw can't find the skill

**Problem:** Skill not in OpenClaw's skill directory.

**Solution:**
```bash
# Check OpenClaw config
openclaw config

# Add skill path to OpenClaw configuration
# Point to /path/to/mechdog-skill/skills/mechdog
```

### ❌ OpenClaw skill executes but MechDog doesn't respond

**Problem:** `MECHDOG_IP` not set in OpenClaw's environment.

**Solution:**
```bash
# Set environment variable before starting OpenClaw
export MECHDOG_IP=192.168.4.1
openclaw chat

# Or add to shell profile
echo 'export MECHDOG_IP=192.168.4.1' >> ~/.zshrc
source ~/.zshrc
```

### ❌ OpenClaw returns "Tool execution failed"

**Problem:** Bridge script error.

**Diagnosis:**
```bash
# Test bridge directly
bridge/.venv/bin/python bridge/bridge.py --cmd action --ip $MECHDOG_IP --name wave

# Check OpenClaw logs for error details
```

**Common causes:**
- `MECHDOG_IP` not set
- MechDog not reachable
- Python venv not activated
- Invalid parameters

---

## Hardware-Specific Issues

### ❌ MechDog doesn't move when commanded

**Problem:** Various hardware issues.

**Checklist:**
1. **Battery:** Check battery level (needs > 20%)
2. **Power:** Is MechDog fully powered on?
3. **Servos:** Listen for servo sounds when commanding
4. **Response:** Check HTTP response for error messages
5. **Calibration:** May need servo calibration via Hiwonder app

**Test:**
```bash
# Check status endpoint
curl http://192.168.4.1/status

# Look for:
# - battery level
# - error messages
# - servo status
```

### ❌ MechDog moves erratically or falls

**Problem:** Servo calibration or mechanical issue.

**Solutions:**
1. **Calibrate:** Use Hiwonder app to calibrate servos
2. **Check assembly:** Verify legs are assembled correctly
3. **Surface:** Test on flat, non-slip surface
4. **Battery:** Low battery can cause weak movements

### ❌ Camera capture fails or returns black image

**Problem:** ESP32-S3 camera module issue.

**Solutions:**
1. **Check module:** Is camera module properly connected?
2. **Lighting:** Test in well-lit environment
3. **Lens cover:** Remove any protective film from lens
4. **Firmware:** Update firmware via Hiwonder app

**Test:**
```bash
# Capture image
curl http://192.168.4.1/camera/capture --output test.jpg

# View image
open test.jpg  # Mac
# Or view in browser
```

### ❌ Battery drains quickly

**Problem:** Normal for robotics, but can be optimized.

**Tips:**
1. **Reduce demo time:** Keep demos short (2-3 min)
2. **Standby mode:** Put in sit position between demos
3. **Bring charger:** Have USB-C cable ready
4. **Charge fully:** 100% before hackathon judging

---

## Performance Issues

### ❌ Commands are slow to execute

**Problem:** Network latency or MechDog processing time.

**Expected latency:**
- Move commands: ~100-500ms
- Action commands: 1-5 seconds (depending on action)
- Camera capture: 1-3 seconds

**If slower than expected:**
1. **WiFi signal:** Move closer to MechDog
2. **Network congestion:** Reduce other WiFi traffic
3. **Battery:** Low battery slows servos
4. **Busy:** Wait for previous command to complete

### ❌ Simulator lags or stutters

**Problem:** Browser performance issue.

**Solutions:**
1. **Close tabs:** Reduce browser memory usage
2. **Hardware acceleration:** Enable in browser settings
3. **Different browser:** Try Chrome (best performance)
4. **Reduce load:** Remove colored balls if not needed

### ❌ Multiple commands queue up

**Problem:** Commands sent too quickly.

**Solution:**
Add delays between commands:
```bash
# In shell scripts
bridge/.venv/bin/python bridge/bridge.py --cmd move --ip localhost:3000 --dir forward --ms 2000
sleep 3  # Wait for completion
bridge/.venv/bin/python bridge/bridge.py --cmd action --ip localhost:3000 --name sit
```

---

## Debug Tools

### Enable verbose logging

**Bridge:**
```bash
# Add -v flag (if implemented) or check bridge.py output
bridge/.venv/bin/python bridge/bridge.py --cmd move --ip localhost:3000 --dir forward --ms 2000
```

**Simulator:**
```bash
# Check logs
tail -f simulator.log

# Or run in foreground
cd simulator
SIMULATOR_PORT=3000 npx tsx server.ts
```

**Browser:**
```bash
# Open DevTools
# Mac: Cmd+Option+I
# Windows: F12

# Check:
# - Console tab for JavaScript errors
# - Network tab for WebSocket connection
# - Application tab for cache issues
```

### Network debugging

```bash
# Test ping
ping 192.168.4.1

# Test HTTP with verbose
curl -v http://192.168.4.1/status

# Test WebSocket (requires wscat)
npm install -g wscat
wscat -c ws://localhost:3000

# Check open ports
lsof -i :3000

# Network scan
nmap -sn 192.168.1.0/24
```

---

## Still Having Issues?

1. **Check FAQ:** See `docs/FAQ.md` for common questions
2. **Review docs:** Check other files in `docs/` directory
3. **GitHub Issues:** https://github.com/Maximilien-ai/mechdog-skill/issues
4. **OpenClaw Community:** https://openclaw.ai
5. **Start fresh:**
   ```bash
   # Clean rebuild
   ./scripts/stop.sh
   rm -rf node_modules bridge/.venv simulator/node_modules
   ./setup.sh
   ```

**For hackathon emergencies:**
- Use the simulator as backup
- Have a demo video recorded beforehand
- Keep the demo simple - a working basic demo beats a broken complex one!

Good luck! 🤖🚀
