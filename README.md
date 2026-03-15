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

# Install Python dependencies (uses uv)
cd bridge
uv venv
uv pip install requests
cd ..

# Install Node.js dependencies
npm install

# Configure MechDog IP
cp .env.example .env
# Edit .env and set your MechDog's IP address
```

### 3. Run the Visual Simulator (Optional)

```bash
# Start the visual simulator
cd simulator
npm run dev
# Open http://localhost:3000 in browser
```

See your robot move in real-time with a beautiful canvas visualization!

### 4. Find Your MechDog IP (For Real Hardware)

Power on your MechDog and check your WiFi router's connected devices, or check the MechDog's display if available.

### 5. Test the Bridge

```bash
# With simulator (no hardware needed)
bridge/.venv/bin/python bridge/bridge.py --cmd move --ip localhost:3000 --dir forward --ms 2000
bridge/.venv/bin/python bridge/bridge.py --cmd action --ip localhost:3000 --name dance

# With real hardware (replace IP)
bridge/.venv/bin/python bridge/bridge.py --cmd move --ip 192.168.1.100 --dir forward --ms 2000
bridge/.venv/bin/python bridge/bridge.py --cmd action --ip 192.168.1.100 --name sit
```

### 6. Use with OpenClaw

Add this skill to your OpenClaw configuration and control via natural language:

- "MechDog, walk forward for 3 seconds"
- "Turn left and then sit down"
- "Stand up and wave"
- "Dance!"

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
├── build.sh, test.sh, lint.sh  # Build automation
└── package.json           # Node.js configuration
```

## Features

- ✅ **Python Bridge** - HTTP client for MechDog ESP32 API
- ✅ **OpenClaw Skill** - Natural language control interface
- ✅ **Visual Simulator** - 🆕 Real-time canvas visualization with WebSocket
- ✅ **Build Tools** - Automated scripts for building, testing, linting
- ✅ **Complete Docs** - Integration guides and API reference

## Stretch Goals

- [x] Visual simulator with real-time updates
- [ ] Vision integration (ESP32-S3 camera → VLM)
- [ ] Nebius GPU-accelerated vision inference
- [ ] Vision-guided navigation
- [ ] Voice wake word integration
- [ ] Multi-agent coordination

## Resources

- [OpenClaw GitHub](https://github.com/openclaw/openclaw)
- [OpenClaw Docs](https://openclaw.ai)
- [Hiwonder MechDog](https://www.hiwonder.com/products/mechdog)
- [Nebius.Build SF Event](https://lu.ma/nebius-build-sf-mar15-2026)

## License

MIT
