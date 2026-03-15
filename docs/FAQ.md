# Frequently Asked Questions (FAQ)

Common questions and answers for the MechDog OpenClaw skill.

---

## Setup & Installation

### Q: What are the prerequisites?

- Node.js >= 22
- Python >= 3.10
- `uv` (Python package manager): `curl -LsSf https://astral.sh/uv/install.sh | sh`
- OpenClaw installed globally: `npm install -g openclaw@latest`

### Q: How do I set everything up quickly?

```bash
git clone https://github.com/Maximilien-ai/mechdog-skill.git
cd mechdog-skill
./setup.sh
```

That's it! The setup script installs all dependencies automatically.

### Q: Do I need a real MechDog to test?

No! We provide a visual simulator that runs in your browser:

```bash
./scripts/start.sh
# Open http://localhost:3000
```

The simulator has the same HTTP API as the real MechDog.

---

## Connectivity

### Q: WiFi vs Bluetooth - which do I need?

**You need WiFi.** This skill uses HTTP over WiFi to communicate with the MechDog's ESP32 controller.

- **WiFi** = HTTP API (required for this skill) ✅
- **Bluetooth** = Mobile app control only ❌

Both can run simultaneously, but our skill only works over WiFi.

### Q: What IP address should I use?

**For simulator:**
```bash
export MECHDOG_IP=localhost:3000
```

**For real MechDog (Option A - easiest):**
```bash
# Connect your laptop to MechDog-XXXX WiFi network
export MECHDOG_IP=192.168.4.1
```

**For real MechDog (Option B - recommended):**
```bash
# Configure MechDog to join your WiFi via Hiwonder app
# Then find IP from router or app
export MECHDOG_IP=192.168.1.100  # Replace with actual IP
```

### Q: How do I find my MechDog's IP address?

1. **Check router:** Look in your router's connected devices list
2. **Use Hiwonder app:** The app usually displays the current IP
3. **Use AP mode:** Connect to `MechDog-XXXX` and use `192.168.4.1`
4. **Network scan:** `nmap -sn 192.168.1.0/24` (may take time)

### Q: Can I use the skill while connected via Bluetooth?

No. Bluetooth uses a different protocol. You need to enable WiFi on the MechDog. However, WiFi and Bluetooth can both be active at the same time - you can use the Bluetooth app AND our WiFi skill simultaneously.

---

## Testing

### Q: How do I test if everything is working?

```bash
# Health check (no hardware needed)
./scripts/test.sh check

# Test with simulator
./scripts/start.sh
./scripts/test.sh bridge --ip localhost:3000

# Test with real MechDog
./scripts/test.sh bridge --ip 192.168.4.1
```

### Q: How do I test a single command?

```bash
# Direct Python bridge test
bridge/.venv/bin/python bridge/bridge.py --cmd action --ip localhost:3000 --name wave

# Or with real hardware
bridge/.venv/bin/python bridge/bridge.py --cmd move --ip 192.168.4.1 --dir forward --ms 2000
```

### Q: How do I run the demo sequence?

```bash
# With simulator
./scripts/test.sh demo --ip localhost:3000

# With real MechDog
./scripts/test.sh demo --ip 192.168.4.1
```

---

## OpenClaw Integration

### Q: How do I use this skill with OpenClaw?

1. **Set the IP address:**
   ```bash
   export MECHDOG_IP=192.168.4.1
   # Or add to ~/.zshrc for permanent
   echo 'export MECHDOG_IP=192.168.4.1' >> ~/.zshrc
   ```

2. **Add skill to OpenClaw config:** Point OpenClaw to the `skills/mechdog` directory

3. **Start OpenClaw and test:**
   ```bash
   openclaw chat
   > "MechDog, walk forward for 3 seconds"
   ```

### Q: What commands can I use with OpenClaw?

**Movement commands:**
- "Walk forward for 3 seconds"
- "Turn left"
- "Turn right"
- "Go backward for 2 seconds"
- "Stop"

**Action commands:**
- "Sit down"
- "Stand up"
- "Wave"
- "Shake"
- "Dance"
- "Balance"

**Combinations:**
- "Stand up and then wave"
- "Turn left and sit"
- "Dance for 5 seconds"

### Q: Does the vision command work?

The `look` command is a placeholder for vision integration (Nebius stretch goal). It currently returns a mock response. See `docs/MECHDOG_HACKATHON.md` for implementing real vision with Nebius GPU.

---

## Simulator

### Q: How do I start/stop the simulator?

```bash
# Start
./scripts/start.sh

# Check status
./scripts/status.sh

# Stop
./scripts/stop.sh
```

### Q: What port does the simulator use?

Default: `3000`

To change:
```bash
SIMULATOR_PORT=8080 ./scripts/start.sh
```

### Q: Can I interact with the simulator?

Yes! The simulator has several interactive features:

- **Drag robot:** Click and drag the robot to move it
- **Drag balls:** Click and drag colored balls
- **Add objects:** Use buttons to add red, blue, green balls
- **Manual controls:** Use on-screen buttons for movements/actions
- **Watch in real-time:** All commands from the bridge appear instantly

### Q: How do I view the simulator while testing?

Open http://localhost:3000 in your browser. You can have it side-by-side with your terminal in half-screen mode (the UI is optimized for this).

---

## Development

### Q: How do I run TypeScript type checking?

```bash
./scripts/test.sh skill
```

### Q: How do I lint the code?

```bash
./scripts/lint.sh
```

### Q: Where are the logs?

Simulator logs are in `simulator.log` in the project root.

### Q: How do I rebuild everything?

```bash
./scripts/build.sh
```

---

## Hardware-Specific

### Q: My MechDog doesn't respond to commands. What should I check?

1. **Power:** Is the MechDog powered on?
2. **WiFi:** Is WiFi enabled? (Check if you can see `MechDog-XXXX` network)
3. **Connection:** Are you connected to the right WiFi network?
4. **IP:** Is `MECHDOG_IP` set correctly?
5. **API:** Can you curl the status endpoint? `curl http://192.168.4.1/status`
6. **Battery:** Is battery above 20%?

### Q: Commands work but the robot doesn't move. Why?

- **Low battery:** MechDog may refuse commands below 20% battery
- **Action in progress:** Wait for current action to complete
- **Servo calibration:** Robot may need calibration via Hiwonder app
- **Check response:** Look at the HTTP response for error messages

### Q: How long does the battery last?

Typically 30-60 minutes depending on usage. Bring a USB-C cable for charging during the hackathon!

### Q: Can I use multiple MechDogs?

Yes! For multi-agent coordination (Stretch Goal 3), you can:
1. Set up two OpenClaw instances
2. Each with different `MECHDOG_IP` pointing to different robots
3. Use shared Nebius LLM for coordination

Or test with one real MechDog + one simulator.

---

## Nebius Stretch Goals

### Q: How do I implement vision with Nebius?

See `docs/MECHDOG_HACKATHON.md` section "🎯 Goal 1: Real-time VLM Scene Understanding" for:
- Model setup (Qwen2-VL-7B on Nebius H100)
- API integration code
- Quick start commands

**Time estimate:** 2-3 hours

### Q: Which stretch goal should I start with?

**Goal 1: VLM Scene Understanding** - Highest priority
- Quickest to implement (2-3 hours)
- Highest visual impact
- Directly showcases Nebius GPU

Then Goal 2 (Vision Navigation) if time permits.

### Q: Do I need a Nebius account?

Yes, for GPU-accelerated vision features. Get an API key at https://nebius.com

For core functionality (movement, actions), no Nebius account needed.

---

## Common Issues

See `docs/TROUBLESHOOTING.md` for detailed troubleshooting steps.

**Quick fixes:**

- **"Module not found"** → Run `./setup.sh`
- **"Connection refused"** → Check WiFi, verify IP with `ping`
- **"Command not found"** → Make sure scripts are executable: `chmod +x scripts/*.sh`
- **Simulator won't start** → Check if port 3000 is already in use: `lsof -i :3000`
- **Drag-drop not working** → Hard refresh browser: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+F5` (Windows)

---

## Hackathon Tips

### Q: What should I prepare before the hackathon?

- [ ] Run `./setup.sh` to install all dependencies
- [ ] Test simulator: `./scripts/start.sh` and visit http://localhost:3000
- [ ] Test bridge: `./scripts/test.sh bridge --ip localhost:3000`
- [ ] Charge MechDog battery to 100%
- [ ] Practice demo sequence 5+ times
- [ ] Have backup plan: record demo video

### Q: What's the recommended demo flow?

1. **Core:** "MechDog, walk forward 3 seconds" ✅
2. **Actions:** "Sit down" → "Stand up and wave" ✅
3. **Vision:** "What do you see?" (if Goal 1 implemented) 🎯
4. **Navigate:** "Walk toward the red ball" (if Goal 2 implemented) 🧭
5. **Swarm:** Two MechDogs synchronized (if Goal 3 implemented) 🤝

**Total time:** 2-4 minutes

### Q: What if something breaks during the demo?

- Have the simulator running as backup
- Record a demo video beforehand
- Practice the demo 10+ times before judging
- Keep it simple - better a working simple demo than buggy complex one

---

## Getting Help

- **Documentation:** Check `docs/` directory
- **Examples:** See `bridge/demo/test_bridge.sh`
- **Issues:** https://github.com/Maximilien-ai/mechdog-skill/issues
- **OpenClaw:** https://openclaw.ai
- **Nebius:** https://nebius.com

**Good luck at the hackathon! 🤖🚀**
