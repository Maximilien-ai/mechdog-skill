# Release Notes

## v0.1.0 - Initial Release (March 15, 2026)

### Core Features

**Python Bridge**
- HTTP client for MechDog ESP32 WiFi API
- Support for movement commands (forward, backward, left, right, stop)
- Support for action commands (sit, stand, shake, wave, dance, balance)
- Camera capture integration
- Clean CLI with argparse interface
- Managed with `uv` for modern Python dependency management

**OpenClaw TypeScript Skill**
- Three primary tools: `move`, `action`, `look`
- Natural language control of MechDog quadruped robot
- Environment variable configuration for IP address
- Type-safe TypeScript implementation
- Ready for OpenClaw agent integration

**Visual Simulator**
- Beautiful web-based interface with real-time canvas visualization
- Express + WebSocket server for live updates
- Interactive drag-and-drop for robot positioning (mouse & touch support)
- Manual control buttons for quick testing
- Status dashboard (position, rotation, battery, last command)
- Drop-in replacement for real MechDog hardware
- Perfect for development without physical robot

### Stretch Features (Completed)

**Interactive Physics Simulation**
- Colored balls (red, blue, green) for vision testing scenarios
- Realistic physics with friction (0.98) and bounce damping (0.7)
- Drag-and-drop for both robot and balls
- Wall collision detection
- Up to 3 balls simultaneously on canvas

**Responsive Design**
- Optimized for half-screen viewing (hackathon demo setup)
- Responsive grid layout: 4 columns (>900px), 3 columns (600-900px), 2 columns (<600px)
- Mobile-friendly touch controls
- Cache-busting for reliable updates

### Developer Experience

**Scripts Organization**
- `setup.sh` - One-command installation
- `scripts/start.sh` - Start simulator in background
- `scripts/stop.sh` - Stop simulator gracefully
- `scripts/status.sh` - Check simulator status
- `scripts/test.sh` - Comprehensive test suite with multiple modes
- `scripts/build.sh` - Build and setup
- `scripts/lint.sh` - Code quality checks

**Testing Modes**
- `check` - Health check (no hardware needed)
- `bridge` - Test Python bridge with hardware/simulator
- `skill` - TypeScript type checking
- `demo` - Full demo sequence
- `all` - Run all tests

### File Structure
```
mechdog-skill/
├── bridge/              # Python HTTP client
├── skills/mechdog/      # OpenClaw TypeScript skill
├── simulator/           # Visual web simulator
├── scripts/             # Build/test/management scripts
├── docs/                # Documentation
└── setup.sh            # One-command setup
```

### API Compatibility

Simulator provides full API compatibility with MechDog ESP32:
- `POST /move` - Movement control
- `POST /action` - Action execution
- `POST /position` - Manual positioning (simulator-only)
- `GET /status` - Status query
- `GET /camera/capture` - Camera interface (mocked)

### WebSocket Protocol

Real-time updates via WebSocket:
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

### Testing

All tests passing:
- ✓ Python bridge CLI working
- ✓ TypeScript type checking passing
- ✓ Simulator server operational
- ✓ Health checks passing

### Dependencies

**Python**: `requests` (via uv)
**Node.js**: `express`, `ws`, `body-parser`, `tsx`

### Usage Example

```bash
# Setup (one-time)
./setup.sh

# Start simulator
./scripts/start.sh

# Test with Python bridge
./scripts/test.sh bridge --ip localhost:3000

# Open browser to visualize
# http://localhost:3000
```

### Known Limitations

- Simulator uses port 3000 (configurable via SIMULATOR_PORT)
- Ball physics are simplified (2D only)
- Camera capture returns mock data in simulator

### Next Steps

- Vision integration with Nebius GPU
- Multi-agent coordination
- Live video stream processing
- Test with real MechDog hardware at venue
