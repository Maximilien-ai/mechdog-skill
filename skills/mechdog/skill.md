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

## Technical Details

The MechDog is a WiFi-connected quadruped robot with:
- ESP32 controller
- 8 coreless servos
- ESP32-S3 AI camera module
- IMU and ultrasonic sensor
- WiFi connectivity for remote control

Commands are sent via HTTP to the robot's ESP32 controller.
