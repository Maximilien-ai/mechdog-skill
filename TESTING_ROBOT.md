# Testing MechDog with Real Hardware

Complete guide for testing the MechDog skill with real hardware at the hackathon.

## Prerequisites

- MechDog robot fully charged and powered on
- Laptop connected to same WiFi network as MechDog (or connected to MechDog's AP)
- `.env` file configured with API keys

## Step 1: Connect to MechDog

### Option A: MechDog AP Mode (Easiest)

```bash
# 1. Power on MechDog
# 2. Connect your laptop WiFi to: MechDog-XXXX
# 3. Test connection
curl http://192.168.4.1/status

# 4. Update .env
echo "MECHDOG_IP=192.168.4.1" >> .env
```

### Option B: MechDog on Your WiFi (Recommended)

```bash
# 1. Use Hiwonder app to connect MechDog to venue WiFi
# 2. Find MechDog IP from app or router
# 3. Test connection
curl http://192.168.1.XXX/status

# 4. Update .env
echo "MECHDOG_IP=192.168.1.XXX" >> .env
```

## Step 2: Test Basic Commands

```bash
# Test movement
bridge/.venv/bin/python bridge/bridge.py --cmd move --ip $MECHDOG_IP --dir forward --ms 1000

# Test actions
bridge/.venv/bin/python bridge/bridge.py --cmd action --ip $MECHDOG_IP --name sit
bridge/.venv/bin/python bridge/bridge.py --cmd action --ip $MECHDOG_IP --name wave
bridge/.venv/bin/python bridge/bridge.py --cmd action --ip $MECHDOG_IP --name dance
```

**Expected:** MechDog should move forward, sit, wave, and dance.

## Step 3: Test Camera Capture

```bash
# Capture frame from MechDog camera
bridge/.venv/bin/python bridge/bridge.py --cmd capture --ip $MECHDOG_IP

# Image saved to /tmp/mechdog_frame.jpg
open /tmp/mechdog_frame.jpg  # macOS
# or
xdg-open /tmp/mechdog_frame.jpg  # Linux
```

**Expected:** Image from MechDog's ESP32-S3 camera opens.

## Step 4: Test Vision Integration (Nebius Stretch Goal #1)

```bash
# Make sure .env has your Nebius API key configured
cat .env | grep NEBIUS

# Test vision with Nebius VLM
bridge/.venv/bin/python bridge/vision.py --ip $MECHDOG_IP --provider nebius

# Or with custom question
bridge/.venv/bin/python bridge/vision.py \
  --ip $MECHDOG_IP \
  --provider nebius \
  --prompt "What objects do you see? List their colors."
```

**Expected:** Natural language description of what MechDog sees.

**Example output:**
```
Capturing frame from MechDog at 192.168.4.1...
Frame captured: /tmp/mechdog_frame.jpg
Querying nebius VLM...

🤖 MechDog Vision:
I see a red ball on the floor approximately 1 meter ahead. To the left,
there is a blue object near the wall. The scene appears to be indoors
with bright lighting.
```

## Step 5: Test with OpenClaw Agent

### Setup OpenClaw

```bash
# Install OpenClaw globally (if not already)
npm install -g openclaw@latest

# Set environment variables
export MECHDOG_IP=192.168.4.1  # or your MechDog IP
export NEBIUS_API_KEY=your-key
export NEBIUS_MODEL=dedicated/Qwen/Qwen2.5-VL-72B-Instruct-YOUR_ID
```

### Start OpenClaw Session

```bash
# Start OpenClaw with MechDog skill
openclaw --skill skills/mechdog
```

### Test Natural Language Commands

**Basic Movement:**
```
> Move MechDog forward for 2 seconds
> Turn left
> Make MechDog sit down
> Do a dance
```

**Vision Commands (NEW!):**
```
> MechDog, what do you see?
> Look around and tell me what color objects are nearby
> Is there a red ball in front of you?
> Describe your surroundings
```

**Vision-Guided Navigation (Stretch Goal #2):**
```
> Look around and find the red ball
> Turn toward the red ball
> Walk forward toward the red ball
> Stop when you're close to it
> Celebrate with a dance!
```

## Step 6: Run Full Demo Sequence

```bash
# Complete vision-guided navigation demo
./scripts/test.sh demo-vision --ip $MECHDOG_IP
```

This runs a 4-scenario demo:
1. **Scene Understanding** - "What do you see?"
2. **Vision-Based Decision** - Turn toward detected object
3. **Navigation Loop** - Walk toward target with vision feedback
4. **Celebration** - Dance when goal reached!

## Available Tools in OpenClaw Skill

The MechDog skill provides these tools to the agent:

### 1. `move` - Basic movement
```typescript
{
  direction: 'forward' | 'backward' | 'left' | 'right' | 'stop',
  duration_ms: 1000 // milliseconds
}
```

### 2. `action` - Preset actions
```typescript
{
  action: 'sit' | 'stand' | 'shake' | 'wave' | 'dance' | 'balance'
}
```

### 3. `look` - Capture camera image
```typescript
{} // No parameters
```

### 4. `see` - Vision AI analysis (NEW!)
```typescript
{
  question?: string,  // Optional: "What color is the ball?"
  provider?: 'nebius' | 'anthropic'  // Default: nebius
}
```

## Troubleshooting

### Connection Issues

```bash
# Check MechDog is reachable
ping $MECHDOG_IP

# Check WiFi connection
ifconfig  # macOS/Linux
ipconfig  # Windows

# Try curl to test API
curl http://$MECHDOG_IP/status
```

### Camera Not Working

- MechDog camera requires good lighting
- ESP32-S3 camera captures at 640x480
- Check camera is not obstructed
- Verify `/camera/capture` endpoint: `curl http://$MECHDOG_IP/camera/capture > test.jpg`

### Vision API Errors

```bash
# Check API keys are set
echo $NEBIUS_API_KEY
echo $NEBIUS_MODEL

# Or check .env file
cat .env | grep NEBIUS

# Test with mock mode (no API key needed)
bridge/.venv/bin/python bridge/vision.py --ip $MECHDOG_IP --provider anthropic --prompt "test"
```

### OpenClaw Can't Find Skill

```bash
# Make sure you're in the mechdog-skill directory
pwd

# Check skill file exists
ls skills/mechdog/index.ts

# Rebuild TypeScript
npm run build

# Start OpenClaw from project root
openclaw --skill skills/mechdog
```

## Demo Tips

### For Best Vision Results:

1. **Good Lighting** - ESP32-S3 camera needs bright, even lighting
2. **Contrasting Objects** - Use colored balls (red, blue, green) on light floor
3. **Stable Platform** - Test on flat, stable surface
4. **Clear View** - Keep camera lens clean and unobstructed

### For Impressive Demos:

1. **Start Simple** - Show basic movement first
2. **Add Complexity** - Then show vision understanding
3. **Autonomous Navigation** - Finally show vision-guided movement
4. **Natural Language** - Use conversational commands with OpenClaw

### Example Demo Flow:

```bash
# 1. Show basic control
> MechDog, stand up
> Move forward 2 meters
> Turn around and come back

# 2. Show vision
> MechDog, what do you see in front of you?
> Are there any colored objects nearby?

# 3. Show autonomous navigation
> Find the red ball
> Walk toward it slowly
> Stop when you're close
> Celebrate with a dance!
```

## Success Criteria

✅ **Basic Control** - MechDog responds to movement and action commands
✅ **Camera** - Can capture images from ESP32-S3 camera
✅ **Vision** - Nebius VLM successfully describes scenes
✅ **OpenClaw** - Agent uses tools to control MechDog
✅ **Autonomous** - Vision-guided navigation works

## Stretch Goals Status

- **Goal #1:** ✅ Real-time VLM Scene Understanding - **READY**
- **Goal #2:** ✅ Vision-Guided Navigation - **DEMO READY**
- **Goal #3:** ⏳ Multi-Agent Swarm - **NOT STARTED**

---

**Have fun at the hackathon! 🤖🚀**
