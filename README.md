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

### 3. Find Your MechDog IP

Power on your MechDog and check your WiFi router's connected devices, or check the MechDog's display if available.

### 4. Test the Bridge

```bash
# Test movement (replace IP with your MechDog's IP)
bridge/.venv/bin/python bridge/bridge.py --cmd move --ip 192.168.1.100 --dir forward --ms 2000

# Test action
bridge/.venv/bin/python bridge/bridge.py --cmd action --ip 192.168.1.100 --name sit
```

### 5. Use with OpenClaw

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
├── skills/
│   └── mechdog/
│       ├── index.ts       # OpenClaw skill implementation
│       └── skill.md       # Skill capabilities description
├── bridge/
│   ├── bridge.py          # Python→ESP32 HTTP bridge
│   ├── pyproject.toml     # Python dependencies
│   └── .venv/             # Python virtual environment
├── docs/
│   └── MECHDOG_HACKATHON.md  # Hackathon plan
└── package.json           # Node.js configuration
```

## Stretch Goals

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
