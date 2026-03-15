# Release Notes

## v0.1.1 - Simulator Camera & Visual Enhancements (March 15, 2026)

### 🎥 Major New Feature: Webcam Camera Simulation

**Simulator Camera Integration:**
- Use laptop webcam to simulate MechDog's ESP32-S3 camera
- Live camera preview with start/stop/capture controls
- Auto-floats to top-right corner (compact overlay)
- Resize option: toggle between small (200px) and large (400px)
- POST `/camera/capture` endpoint to receive webcam frames
- GET `/camera/capture` endpoint to serve last captured frame
- Perfect for testing Nebius VLM integration without hardware!

**Camera Features:**
- Browser permissions handling with troubleshooting docs
- Chrome recommended (Safari has permission issues)
- Touch support for mobile testing
- Dock/float toggle for flexible viewing

### 🎊 Floating Emoji Animations

**Visual Command Feedback:**
- Emojis spawn and float upward when commands execute
- Action emojis: 🪑 sit, 🧍 stand, 👋 wave, 🤝 shake, 💃 dance, 🤸 balance
- Movement emojis: ⬆️ forward, ⬇️ backward, ⬅️ left, ➡️ right, 🛑 stop
- Pop-in animation (starts small, grows to full size)
- White circular background for visibility
- Fully opaque (100% visible) with smooth fade-out
- Like live chat reactions!

### 📋 Demo Scripts & Documentation

**New Test Scripts:**
- `bridge/demo/test_camera.sh` - Test camera capture, validate JPEG, auto-open image
- `bridge/demo/test_vision.sh` - Test VLM integration (Nebius/Anthropic/mock)
- `bridge/demo/test_vision_advanced.sh` - Advanced vision-guided navigation demo (NEW!)
- `bridge/demo/README.md` - Comprehensive demo guide with examples

**Documentation Improvements:**
- `docs/FAQ.md` - Extensive FAQ covering setup, connectivity, camera, vision, hackathon tips
- `docs/TROUBLESHOOTING.md` - Detailed troubleshooting for all components
- WiFi vs Bluetooth connectivity guide in `docs/ESP32_API.md`
- Camera troubleshooting section (Safari vs Chrome permissions)
- Updated README.md with camera features and Nebius stretch goals

### 🎨 UI/UX Improvements

**Compact Status Panel:**
- Single-line layout: "POSITION 300, 300" instead of two lines
- Reduced padding and font sizes (~40% smaller)
- Right-aligned values for cleaner look
- More screen space for canvas

**Camera UX:**
- Auto-floats on page load (no need to click)
- Default size reduced to 200px (half previous size)
- Description text hidden in floating mode
- Perfect for vision testing while watching robot

### 🛠️ Technical Improvements

**Dependencies:**
- Added `multer` for handling camera image uploads
- Added `@types/multer` for TypeScript support

**API Updates:**
- POST `/camera/capture` with multipart/form-data support
- Enhanced error messages for missing camera frames
- Helpful hints for simulator camera setup

**Cache Management:**
- Version bumped to v=12 for reliable browser updates

### 📊 Testing Workflow

**Camera Testing:**
```bash
# 1. Start simulator
./scripts/start.sh

# 2. Open http://localhost:3000 in Chrome
# 3. Camera auto-floats, click "Start"
# 4. Click "Capture" to take snapshot

# 5. Test capture
bridge/demo/test_camera.sh localhost:3000

# 6. Test vision (with API key)
export ANTHROPIC_API_KEY=your-key
bridge/demo/test_vision.sh localhost:3000

# 7. Test advanced vision-guided navigation (NEW!)
./scripts/test.sh demo-vision --ip localhost:3000
```

### 🎯 Ready for Nebius Stretch Goals #1 & #2

**VLM Scene Understanding (Goal #1):**
- Camera capture working ✅
- Vision script ready (`bridge/vision.py`) ✅
- Demo scripts for testing ✅
- Documentation complete ✅
- Just need Nebius API key!

**Vision-Guided Navigation (Goal #2):**
- Advanced demo script with 4 scenarios ✅
- Scene understanding → Decision → Navigation loop → Celebration ✅
- Integrated into test.sh as `demo-vision` subcommand ✅
- Mock mode for testing without VLM API ✅

**Test Commands:**
```bash
# Basic demo
./scripts/test.sh demo --ip localhost:3000

# Advanced vision-guided navigation
./scripts/test.sh demo-vision --ip localhost:3000
```

**Next Steps:**
1. Test with real MechDog at venue
2. Wire OpenClaw agent with skill
3. Implement Nebius VLM integration
4. Add real vision feedback in navigation loop

---

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
- `demo-vision` - Advanced vision-guided navigation demo (NEW in v0.1.1)
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
