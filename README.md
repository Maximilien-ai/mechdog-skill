# MechDog OpenClaw Skill

Natural language control of the Hiwonder MechDog quadruped robot via OpenClaw.

**Demo for:** Nebius.Build SF Hackathon - March 15, 2026

## Quick Start

### 1. Prerequisites

- Node.js >= 22
- Python >= 3.10
- [uv](https://github.com/astral-sh/uv) (Python package manager)
- [OpenClaw](https://openclaw.ai) installed globally: `npm install -g openclaw@latest`
- MechDog connected to same WiFi network

### 2. Setup

```bash
# Clone repository
git clone https://github.com/Maximilien-ai/mechdog-skill.git
cd mechdog-skill

# One-command setup (installs everything)
./setup.sh

# Or manual setup:
# cd bridge && uv venv && uv pip install requests && cd ..
# npm install
# cd simulator && npm install && cd ..
```

### 3. Run the Visual Simulator (Recommended for Development)

```bash
# Start the visual simulator
./scripts/start.sh

# Check status
./scripts/status.sh

# Stop when done
./scripts/stop.sh
```

Open http://localhost:3000 in your browser to see the robot move in real-time with a beautiful canvas visualization!

### 4. Connect to MechDog via WiFi (For Real Hardware)

**Important:** This skill requires WiFi (not Bluetooth). WiFi and Bluetooth use different protocols.

**Option A: Connect to MechDog's WiFi Network (Easiest)**
```bash
# 1. Power on MechDog
# 2. Connect your laptop to WiFi: MechDog-XXXX
# 3. Use default ESP32 AP mode IP
export MECHDOG_IP=192.168.4.1

# 4. Test connection
curl http://192.168.4.1/status
```

**Option B: Connect MechDog to Your WiFi (Recommended)**
```bash
# 1. Use Hiwonder app to configure MechDog WiFi settings
# 2. Connect MechDog to your network
# 3. Find IP from router or app
# 4. Set IP and test
export MECHDOG_IP=192.168.1.100  # Replace with your IP
curl http://192.168.1.100/status
```

See `docs/ESP32_API.md` for detailed WiFi setup and troubleshooting.

### 5. Test the Bridge

```bash
# With simulator (no hardware needed)
bridge/.venv/bin/python bridge/bridge.py --cmd move --ip localhost:3000 --dir forward --ms 2000
bridge/.venv/bin/python bridge/bridge.py --cmd action --ip localhost:3000 --name dance

# With real hardware - Option A (MechDog AP mode)
bridge/.venv/bin/python bridge/bridge.py --cmd move --ip 192.168.4.1 --dir forward --ms 2000
bridge/.venv/bin/python bridge/bridge.py --cmd action --ip 192.168.4.1 --name sit

# With real hardware - Option B (MechDog on your WiFi)
bridge/.venv/bin/python bridge/bridge.py --cmd move --ip 192.168.1.100 --dir forward --ms 2000
bridge/.venv/bin/python bridge/bridge.py --cmd action --ip 192.168.1.100 --name sit
```

### 6. Configure IP Address

**IMPORTANT:** Set the `MECHDOG_IP` environment variable before using with OpenClaw:

```bash
# For simulator (default)
export MECHDOG_IP=localhost:3000

# For real MechDog - Option A (MechDog AP mode - easiest)
export MECHDOG_IP=192.168.4.1

# For real MechDog - Option B (MechDog on your WiFi)
export MECHDOG_IP=192.168.1.100  # Replace with your MechDog's actual IP

# Add to shell profile to make permanent
echo 'export MECHDOG_IP=192.168.4.1' >> ~/.zshrc  # or ~/.bashrc
```

### 7. Use with OpenClaw

Add this skill to your OpenClaw configuration and control via natural language:

- "MechDog, walk forward for 3 seconds"
- "Turn left and then sit down"
- "Stand up and wave"
- "Dance!"

See `skills/mechdog/skill.md` for full configuration details.

## Architecture

```
User (Telegram/WhatsApp/Slack/Discord)
    ↓
OpenClaw Gateway
    ↓
MechDog Skill (TypeScript)
    ↓
Python Bridge (HTTP)
    ↓
MechDog ESP32 WiFi Controller
```

## Available Commands

### Movement
- `forward`, `backward`, `left`, `right`, `stop`
- Configurable duration in milliseconds

### Actions
- `sit`, `stand`, `shake`, `wave`, `dance`, `balance`

### Vision (if enabled)
- Camera capture from ESP32-S3 module

## Project Structure

```
mechdog-skill/
├── skills/mechdog/        # OpenClaw TypeScript skill
│   ├── index.ts           # Skill implementation
│   └── skill.md           # Capabilities description
├── bridge/                # Python ESP32 bridge
│   ├── bridge.py          # HTTP client
│   ├── vision.py          # VLM integration (stretch)
│   └── .venv/             # Python virtual environment
├── simulator/             # 🆕 Visual web simulator
│   ├── server.ts          # Express + WebSocket server
│   └── public/            # Web UI (canvas visualization)
│       ├── index.html     # UI layout
│       └── simulator.js   # Canvas rendering
├── docs/                  # Documentation
│   ├── SIMULATOR.md       # Simulator guide
│   ├── OPENCLAW_INTEGRATION.md
│   └── ESP32_API.md
├── scripts/               # Build & development tools
│   ├── build.sh           # Build everything
│   ├── test.sh            # Run tests
│   ├── lint.sh            # Code linting
│   ├── start.sh           # Start simulator
│   ├── stop.sh            # Stop simulator
│   └── status.sh          # Check simulator status
├── setup.sh               # One-command setup
└── package.json           # Node.js configuration
```

## Features

- ✅ **Python Bridge** - HTTP client for MechDog ESP32 API
- ✅ **OpenClaw Skill** - Natural language control interface
- ✅ **Visual Simulator** - Real-time canvas visualization with WebSocket
- ✅ **Interactive Physics** - Drag-and-drop robot and colored balls for vision testing
- ✅ **Responsive UI** - Optimized for half-screen viewing (demos/presentations)
- ✅ **Build Tools** - Automated scripts for building, testing, linting
- ✅ **Complete Docs** - Integration guides and API reference

## Simulator Features

The visual simulator (`http://localhost:3000`) includes:

- 🎨 **Real-time Canvas** - See the robot move as commands execute
- 🔌 **WebSocket Updates** - Live state synchronization
- 🖱️ **Drag & Drop** - Click and drag the robot to reposition it
- 🎯 **Vision Objects** - Add colored balls (red, blue, green) for vision testing
- 🎮 **Manual Controls** - Test movements and actions with buttons
- 📱 **Touch Support** - Works on mobile devices
- 📊 **Status Dashboard** - Position, rotation, battery, last command
- 🌐 **HTTP API** - Drop-in replacement for real MechDog

## Testing

### Quick Health Check
```bash
./scripts/test.sh check
```

### Test with Simulator
```bash
# Start simulator first
./scripts/start.sh

# Test bridge commands
./scripts/test.sh bridge --ip localhost:3000

# Run full demo sequence
./scripts/test.sh demo --ip localhost:3000
```

### Test with Real Hardware
```bash
# Replace with your MechDog's IP
./scripts/test.sh bridge --ip 192.168.1.100
./scripts/test.sh demo --ip 192.168.1.100
```

### Test TypeScript
```bash
./scripts/test.sh skill
```

## Nebius Stretch Goals

Three ambitious features to showcase Nebius GPU power (see `docs/MECHDOG_HACKATHON.md` for details):

### 🎯 Goal 1: Real-time VLM Scene Understanding (Priority: 🔥 HIGHEST)
- Camera → Nebius H100 GPU (Qwen2-VL-7B) → Natural language description
- "MechDog, what do you see?" → "I see a red ball on the floor..."
- **Time:** 2-3 hours

### 🧭 Goal 2: Vision-Guided Navigation (Priority: 🔥 HIGH)
- Autonomous navigation toward objects using VLM feedback loop
- "Walk toward the red ball" → autonomous movement with vision
- **Time:** 3-4 hours

### 🤝 Goal 3: Multi-Agent Swarm Coordination (Priority: STRETCH)
- Two OpenClaw agents coordinating via shared Nebius LLM
- "MechDogs, perform a synchronized dance"
- **Time:** 4-5 hours

**Recommended:** Start with Goal 1 for maximum impact with minimal time investment.

## Completed Features

- [x] Python bridge with uv dependency management
- [x] OpenClaw TypeScript skill
- [x] Visual simulator with WebSocket real-time updates
- [x] Drag-and-drop interaction (robot + balls)
- [x] Physics simulation with colored balls for vision testing
- [x] Responsive UI optimized for half-screen viewing
- [x] Comprehensive build/test/management scripts
- [x] Complete documentation

## Resources

- [OpenClaw GitHub](https://github.com/openclaw/openclaw)
- [OpenClaw Docs](https://openclaw.ai)
- [Hiwonder MechDog](https://www.hiwonder.com/products/mechdog)
- [Nebius.Build SF Event](https://lu.ma/nebius-build-sf-mar15-2026)

## License

MIT
