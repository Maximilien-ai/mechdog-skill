# MechDog Visual Simulator

A beautiful web-based simulator with real-time visualization of the MechDog robot.

## Features

- 🎨 **Visual Canvas** - See the robot move in real-time
- 🔌 **WebSocket Updates** - Live updates as commands are sent
- 📊 **Status Dashboard** - Position, rotation, battery, last command
- 🎮 **Manual Controls** - Test commands with on-screen buttons
- 🖱️ **Drag & Drop** - Click and drag the robot to reposition it!
- 📱 **Touch Support** - Works on mobile devices too
- 🌐 **HTTP API** - Drop-in replacement for real MechDog

## Quick Start

```bash
# Install dependencies
cd simulator
npm install

# Start simulator
npm run dev
```

Then open: http://localhost:8080

## Usage

### From Browser

1. Open http://localhost:8080
2. Use the on-screen buttons to control the robot
3. Watch the robot move on the canvas!

### From Bridge

```bash
# From project root
python3 bridge/bridge.py --cmd move --ip localhost:8080 --dir forward --ms 2000
python3 bridge/bridge.py --cmd action --ip localhost:8080 --name dance
```

### From Demo Script

```bash
cd bridge/demo
./test_bridge.sh localhost:8080
```

## API Endpoints

Same as real MechDog:

- `POST /move` - Move robot
- `POST /action` - Perform action
- `GET /status` - Get status
- `GET /camera/capture` - Camera (mocked)

## WebSocket Protocol

Connect to `ws://localhost:8080` for real-time updates:

```javascript
{
  "type": "move",
  "direction": "forward",
  "duration": 2000,
  "state": {
    "position": { "x": 450, "y": 300 },
    "rotation": 45,
    "action": null,
    "battery": 98,
    "lastCommand": "move forward"
  }
}
```

## Environment Variables

```bash
SIMULATOR_PORT=8080  # Default port
```

## Architecture

```
┌─────────────────┐
│  Web Browser    │
│  (Canvas UI)    │
└────────┬────────┘
         │ WebSocket
         ▼
┌─────────────────┐
│  Server.ts      │
│  (Express + WS) │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│  bridge.py      │
│  (Python)       │
└─────────────────┘
```

## Interactive Features

### Drag & Drop Robot
- **Click and drag** the robot anywhere on the canvas
- **Hover** over the robot to see the grab cursor
- Works with **mouse** and **touch** (mobile-friendly)
- Position updates are synchronized with the server
- Boundaries keep the robot within the canvas

### Manual Controls
- Use on-screen buttons for quick testing
- Forward, Left, Right movements
- Sit, Wave, Dance actions

## Customization

Edit `public/simulator.js` to customize:
- Robot appearance (colors, shape)
- Canvas size
- Animation speed
- Trail effects
- Drag sensitivity

## Tips

- **Zoom in/out:** Canvas auto-scales to window
- **Reset position:** Refresh page
- **Multiple clients:** Multiple browsers can connect simultaneously
- **API testing:** Use Postman/curl with the HTTP endpoints

Enjoy simulating! 🤖✨
