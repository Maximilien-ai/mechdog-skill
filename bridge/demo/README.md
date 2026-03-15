# MechDog Demo Scripts

Quick test scripts for MechDog functionality.

## Basic Bridge Tests

### Test Bridge Commands
```bash
# Test with simulator
./test_bridge.sh localhost:3000

# Test with real MechDog (AP mode)
./test_bridge.sh 192.168.4.1

# Test with real MechDog (on your WiFi)
./test_bridge.sh 192.168.1.100
```

**What it does:**
- Tests movement commands (forward, left, right)
- Tests action commands (sit, wave, dance, stand)
- Runs a complete demo sequence

---

## Camera Tests (New!)

### Test Camera Capture
```bash
# Test camera with simulator (default)
./test_camera.sh

# Test camera with real MechDog
./test_camera.sh 192.168.4.1
```

**What it does:**
1. Captures image from MechDog camera
2. Saves to `capture.jpg`
3. Validates JPEG format
4. Opens image in default viewer

**Prerequisites (Simulator):**
1. Start simulator: `../../scripts/start.sh`
2. Open browser: http://localhost:3000
3. Click "📹 Start" to enable webcam
4. Click "📸 Capture" to take snapshot
5. Run test script

**Output:**
```
✓ Image captured successfully (45K)
✓ Valid JPEG format
✓ Image opened in default viewer
```

---

## Vision Integration Tests (Nebius Stretch Goals #1 & #2)

### Advanced Vision-Guided Demo (NEW!)
```bash
# Full vision-guided navigation demo
./test_vision_advanced.sh localhost:3000
```

**What it does:**
1. **Scene Understanding** - Captures and analyzes what MechDog sees
2. **Vision-Based Decisions** - Turns toward detected red ball
3. **Navigation Loop** - Walks toward target with vision feedback
4. **Celebration** - Dance when goal reached!

**Prerequisites (Simulator):**
1. Add colored balls (red, blue, green)
2. Arrange balls in scene
3. Point webcam at canvas
4. Capture frame

**Demo Flow:**
```
🎥 Scene Analysis
↓
🧭 Decision: Turn toward red ball
↓
🚶 Navigation: Walk forward 3 steps with vision feedback
↓
💃 Celebration: Dance!
```

This showcases both:
- **Stretch Goal #1:** VLM scene understanding
- **Stretch Goal #2:** Vision-guided navigation

---

## Vision Integration Tests (Nebius Stretch Goal #1)

### Test Vision with VLM
```bash
# Test with Anthropic Claude (default)
export ANTHROPIC_API_KEY=your-key
./test_vision.sh localhost:3000 anthropic

# Test with Nebius VLM
export NEBIUS_API_KEY=your-key
./test_vision.sh localhost:3000 nebius

# Test with mock (no API key needed)
cd ../
.venv/bin/python vision.py --ip localhost:3000 --mock
```

**What it does:**
1. Captures frame from camera
2. Sends to VLM (Nebius/Anthropic/Mock)
3. Returns natural language scene description
4. Saves frame to `/tmp/mechdog_frame.jpg`

**Example Output:**
```
🤖 MechDog Vision:
I see a red ball in the center of the image, approximately 2 meters away.
To the left, there is a blue ball near the wall. The green ball is on the
right side, closer to the robot. The scene appears well-lit with a flat surface.
```

**Providers:**
- **anthropic** - Claude with vision (requires ANTHROPIC_API_KEY)
- **nebius** - Nebius GPU VLM (requires NEBIUS_API_KEY)
- **mock** - No API needed, returns placeholder

---

## Quick Test Workflow

### 1. Start Simulator
```bash
cd ../../
./scripts/start.sh
# Open http://localhost:3000
```

### 2. Test Basic Commands
```bash
cd bridge/demo
./test_bridge.sh localhost:3000
```

### 3. Test Camera
```bash
# In browser: Click "📹 Start" and "📸 Capture"
./test_camera.sh localhost:3000
# Image opens automatically
```

### 4. Test Vision
```bash
# Point webcam at colored balls or interesting object
# In browser: Click "📸 Capture" again
./test_vision.sh localhost:3000
# See VLM description
```

---

## Environment Variables

**Recommended: Use `.env` file for configuration**

```bash
# 1. Copy the example file
cp .env.example .env

# 2. Edit .env with your API keys
# Add your NEBIUS_API_KEY or ANTHROPIC_API_KEY
```

**`.env` file format:**
```bash
# Nebius Token Factory API (recommended for vision)
NEBIUS_API_KEY=your-nebius-api-key-here
NEBIUS_MODEL=Qwen/Qwen2-VL-7B-Instruct  # Check your Nebius dashboard for available models

# Alternative: Anthropic Claude
ANTHROPIC_API_KEY=your-anthropic-api-key-here

# Optional: MechDog hardware IP
MECHDOG_IP=192.168.4.1
```

**Important:** Update `NEBIUS_MODEL` with the exact model ID from your Nebius Token Factory account.

**Alternative: Export environment variables**
```bash
# For Nebius VLM (Stretch Goal #1)
export NEBIUS_API_KEY=your-nebius-key

# For Claude Vision (alternative)
export ANTHROPIC_API_KEY=your-anthropic-key
```

---

## Troubleshooting

### Camera capture fails
```
❌ Error: No frame captured yet
```

**Solution:**
1. Make sure simulator is running
2. Open http://localhost:3000 in **Chrome** (Safari has permission issues)
3. Click "📹 Start" to enable webcam
4. Grant camera permission when prompted
5. Click "📸 Capture" to take a snapshot
6. Run test script again

### Vision test fails
```
Warning: NEBIUS_API_KEY not set. VLM inference unavailable.
```

**Solution:**
1. Copy `.env.example` to `.env`: `cp .env.example .env`
2. Edit `.env` and add your API key:
   ```bash
   NEBIUS_API_KEY=your-actual-key-here
   ```
3. Vision script automatically loads from `.env` file
4. Alternative: Export directly: `export NEBIUS_API_KEY=your-key`

### Bridge connection fails
```
Error: Connection refused
```

**Solution:**
- Check simulator status: `../../scripts/status.sh`
- Start if needed: `../../scripts/start.sh`
- Verify IP: `curl http://localhost:3000/status`

---

## Tips

- **Use Chrome** for simulator camera (best WebRTC support)
- **Camera auto-floats** to top-right corner
- **Click "🔍 Enlarge"** to make floating camera bigger
- **Click "📍 Dock Camera"** to move it back to bottom
- **Point webcam at screen** to test vision with colored balls on canvas!

---

## Next Steps

After testing:
1. Wire OpenClaw agent with skill
2. Test natural language commands: "MechDog, what do you see?"
3. Implement vision-guided navigation (Stretch Goal #2)
4. Test at hackathon venue with real hardware

**Have fun testing! 🤖📷**
