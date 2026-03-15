# MechDog Control Skill

Control a Hiwonder MechDog quadruped robot through natural language commands.

## Capabilities

This skill enables you to:
- **Move** the MechDog in any direction (forward, backward, left, right) for a specified duration
- **Execute actions** like sit, stand, shake, wave, dance, and balance
- **Capture vision** from the onboard ESP32-S3 camera (if vision integration is enabled)

## Example Commands

- "Walk forward for 3 seconds"
- "Turn left"
- "Sit down"
- "Stand up and then wave"
- "Dance for 5 seconds"
- "What do you see?" (requires vision integration)

## Configuration

**IMPORTANT:** You must configure the MechDog IP address before using this skill.

### Set the IP Address

Set the `MECHDOG_IP` environment variable to your robot's IP address:

```bash
# For real MechDog hardware
export MECHDOG_IP=192.168.1.100

# For the visual simulator (default)
export MECHDOG_IP=localhost:3000
```

Add this to your shell profile (`~/.zshrc` or `~/.bashrc`) to make it permanent.

### Finding Your MechDog's IP

1. **Real hardware:** Check your router's connected devices or use the MechDog's display/app
2. **Simulator:** Default is `localhost:3000` (or whatever port you configured with `SIMULATOR_PORT`)

### Testing Connection

```bash
# Test with the bridge directly
python3 bridge/bridge.py --cmd action --ip $MECHDOG_IP --name stand

# Or use the test script
./scripts/test.sh bridge --ip $MECHDOG_IP
```

## Technical Details

The MechDog is a WiFi-connected quadruped robot with:
- ESP32 controller
- 8 coreless servos
- ESP32-S3 AI camera module
- IMU and ultrasonic sensor
- WiFi connectivity for remote control

Commands are sent via HTTP to the robot's ESP32 controller. The default IP is `localhost:3000` (simulator), but you should update this to match your hardware.
