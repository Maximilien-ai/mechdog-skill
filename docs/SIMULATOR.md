# MechDog Simulator (Mock Server)

**Good news!** While there's no official MechDog simulator from Hiwonder, we've created a **mock HTTP server** that simulates the MechDog ESP32 API for development and testing without hardware.

## Quick Start

### 1. Start the Mock Server

```bash
# Terminal 1: Start mock server
python3 bridge/mock_server.py --port 8080
```

You'll see:
```
╔═══════════════════════════════════════════════════════════╗
║          MechDog Mock Server (Simulator)                  ║
╚═══════════════════════════════════════════════════════════╝

🚀 Server running at http://127.0.0.1:8080
```

### 2. Test with Bridge

```bash
# Terminal 2: Test movement
python3 bridge/bridge.py --cmd move --ip 127.0.0.1:8080 --dir forward --ms 2000

# Test action
python3 bridge/bridge.py --cmd action --ip 127.0.0.1:8080 --name sit
```

### 3. Test with Demo Script

Edit `bridge/demo/test_bridge.sh` and set:
```bash
MECHDOG_IP="127.0.0.1:8080"
```

Then run:
```bash
cd bridge/demo
./test_bridge.sh 127.0.0.1:8080
```

## What's Simulated

### ✅ Fully Simulated Endpoints

- **POST /move** - Movement commands (forward, backward, left, right, stop)
- **POST /action** - Actions (sit, stand, shake, wave, dance, balance)
- **GET /status** - Status with randomized sensor data
- **GET /camera/capture** - Camera capture (returns mock response)

### 🎭 Simulation Features

- ✅ **Realistic timing** - Different actions have appropriate durations
- ✅ **Error handling** - Invalid commands return proper error responses
- ✅ **Visual feedback** - Console shows simulated robot actions
- ✅ **Random sensor data** - IMU, battery, ultrasonic readings
- ✅ **JSON responses** - Matches real MechDog API format

### ⚠️ Limitations

- ❌ No actual visual simulation (no 3D robot model)
- ❌ No physics simulation
- ❌ Camera returns mock response, not actual images
- ❌ No collision detection
- ❌ No battery drain simulation

## Development Workflow

### Recommended Flow

1. **Develop with mock** - Fast iteration without hardware
2. **Test bridge logic** - Validate command structure
3. **Test OpenClaw integration** - End-to-end natural language
4. **Switch to hardware** - Final testing with real MechDog

### Switching Between Mock and Hardware

Just change the IP address:

```bash
# Mock (local development)
export MECHDOG_IP="127.0.0.1:8080"

# Real hardware (at venue)
export MECHDOG_IP="192.168.1.100"
```

## Advanced: 3D Simulation Options

If you need visual simulation, consider:

### Option 1: Webots (Easiest)
- **Pros:** Beginner-friendly, Python support, good visuals
- **Cons:** Need to create custom MechDog model
- **Setup time:** ~2-3 hours

```bash
# Install Webots
brew install webots  # macOS

# Create basic quadruped model
# Follow: https://cyberbotics.com/doc/guide/tutorial-1
```

### Option 2: Gazebo + ROS2 (Most Realistic)
- **Pros:** Industry standard, excellent physics
- **Cons:** Complex setup, steep learning curve
- **Setup time:** ~4-6 hours

```bash
# Install Gazebo
brew install gazebo  # macOS

# Would need to create URDF model of MechDog
# Not recommended for hackathon timeline
```

### Option 3: PyBullet (Lightweight)
- **Pros:** Pure Python, fast, simple
- **Cons:** Need to model robot kinematics
- **Setup time:** ~3-4 hours

```bash
pip install pybullet

# Create simple quadruped model
# Good for testing locomotion algorithms
```

## Recommendation for Hackathon

**Use our mock server!** Here's why:

✅ **Zero setup time** - Already built and tested
✅ **Fast iteration** - No physics overhead
✅ **Matches real API** - Easy to switch to hardware
✅ **Good enough** - Tests business logic without 3D visuals

**When to use 3D simulator:**
- Post-hackathon development
- Testing complex navigation algorithms
- Vision-guided locomotion (need spatial awareness)
- Multi-robot coordination

## Mock Server API Reference

### POST /move
```json
Request:  {"direction": "forward", "duration": 2000}
Response: {"status": "ok", "message": "Moving forward for 2000ms"}
```

### POST /action
```json
Request:  {"name": "sit"}
Response: {"status": "ok", "action": "sit", "estimated_duration": 1.5}
```

### GET /status
```json
Response: {
  "status": "ok",
  "battery": 87,
  "imu": {"pitch": 0.3, "roll": -0.1, "yaw": 145.2},
  "ultrasonic_distance_cm": 42,
  "wifi_rssi": -45,
  "mode": "simulated"
}
```

### GET /camera/capture
```json
Response: {
  "status": "ok",
  "message": "Camera capture simulated",
  "note": "Real hardware returns binary JPEG data"
}
```

## Testing Tips

### Test Full Demo Without Hardware

```bash
# Terminal 1: Start mock
python3 bridge/mock_server.py

# Terminal 2: Run full test suite
./test.sh bridge --ip 127.0.0.1:8080

# Terminal 3: Monitor logs
# Watch Terminal 1 for simulated actions
```

### Simulate Network Issues

```bash
# Slow network (add delay)
# Edit mock_server.py, add: time.sleep(0.5) in handlers

# Test timeouts
# Stop mock server while bridge command runs
```

### Test Error Handling

```bash
# Invalid direction
python3 bridge/bridge.py --cmd move --ip 127.0.0.1:8080 --dir invalid --ms 1000

# Invalid action
python3 bridge/bridge.py --cmd action --ip 127.0.0.1:8080 --name jump

# Server not running (timeout test)
# Stop mock server, then try commands
```

## Summary

🎯 **For hackathon:** Use mock server for rapid development
🔬 **For research:** Consider Webots or PyBullet post-event
🏭 **For production:** Test on real hardware before demo

The mock server gives you 90% of what you need for development, with 10% of the setup complexity!

Happy simulating! 🤖✨
