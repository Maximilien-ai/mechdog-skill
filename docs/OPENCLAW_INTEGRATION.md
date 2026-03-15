# OpenClaw Integration Guide

How to integrate the MechDog skill with OpenClaw for natural language control.

## Setup Steps

### 1. Install OpenClaw

```bash
npm install -g openclaw@latest
```

### 2. Initialize OpenClaw Configuration

```bash
openclaw init
```

This creates a configuration directory (typically `~/.openclaw/` or similar).

### 3. Register MechDog Skill

Add the MechDog skill to your OpenClaw skills directory:

```bash
# Option A: Symlink (for development)
ln -s /path/to/mechdog-skill/skills/mechdog ~/.openclaw/skills/mechdog

# Option B: Copy (for production)
cp -r /path/to/mechdog-skill/skills/mechdog ~/.openclaw/skills/mechdog
```

### 4. Configure Environment

Set your MechDog IP in OpenClaw's environment:

```bash
# Add to ~/.openclaw/.env or your shell profile
export MECHDOG_IP=192.168.1.100
```

### 5. Start OpenClaw Gateway

```bash
openclaw start
```

## Usage Examples

Once OpenClaw is running and connected to your preferred messaging platform (Telegram, WhatsApp, Discord, Slack):

### Basic Movement
```
User: "MechDog, walk forward for 3 seconds"
Agent: [executes move tool with direction=forward, duration_ms=3000]
```

### Sequences
```
User: "Turn left and then sit down"
Agent: [executes move with direction=left, then action with action=sit]
```

### Actions
```
User: "Stand up and wave at me"
Agent: [executes action=stand, then action=wave]

User: "Do a little dance"
Agent: [executes action=dance]
```

### Vision (if camera is enabled)
```
User: "What do you see?"
Agent: [executes look tool, returns camera capture]
```

## Advanced: Multi-Channel Control

OpenClaw supports multiple messaging platforms simultaneously. You can control your MechDog from:

- **Telegram** - Great for mobile control
- **WhatsApp** - Convenient if already using it
- **Discord** - Good for shared control in a server
- **Slack** - Perfect for team demos

## Debugging

### Check if skill is loaded
```bash
openclaw list-skills
```

Should show `mechdog` in the list.

### Test skill directly
```bash
openclaw test mechdog move --direction forward --duration_ms 2000
```

### View logs
```bash
openclaw logs --follow
```

## Demo Script for Hackathon

Recommended flow for 2-minute demo:

1. **Introduction (15 sec)**
   - "I've integrated a MechDog quadruped with OpenClaw for natural language control"

2. **Demo 1: Basic movement (30 sec)**
   - "MechDog, walk forward for 3 seconds"
   - Wait for execution

3. **Demo 2: Turn and action (30 sec)**
   - "Now turn left and sit down"
   - Wait for execution

4. **Demo 3: Fun action (30 sec)**
   - "Stand up and do a little dance!"
   - Wait for execution

5. **Demo 4: Vision (if working) (15 sec)**
   - "What do you see in front of you?"
   - Show VLM response

6. **Conclusion (15 sec)**
   - Mention architecture, extensibility, Nebius GPU integration potential

## Troubleshooting

### Skill not found
- Check symlink/copy is correct
- Verify `skill.md` and `index.ts` exist in the skill directory
- Restart OpenClaw gateway

### Commands timing out
- Verify MechDog IP is correct
- Check MechDog is on same WiFi network
- Test with manual bridge commands first

### Python errors
- Ensure venv is created and dependencies installed
- Check `PYTHON_PATH` in index.ts points to correct venv
