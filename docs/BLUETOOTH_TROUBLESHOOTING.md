# MechDog Ultra Bluetooth Troubleshooting & Experiments

This document tracks what we tried during reverse engineering, what failed, what worked, and what to try next.

## What Worked ✅

### 1. Basic Connection
```python
# Using Bleak to connect
client = BleakClient(mac_address)
await client.connect()
```
- **Status**: ✅ Working reliably
- **Notes**: Connection is stable, no timeouts

### 2. Service Discovery
```python
services = client.services
for service in services:
    print(f"Service: {service.uuid}")
    for char in service.characteristics:
        print(f"  Char: {char.uuid} - {char.properties}")
```
- **Status**: ✅ Working
- **Found UUIDs**:
  - Service: `0000ffe0-0000-1000-8000-00805f9b34fb`
  - Characteristic: `0000ffe1-0000-1000-8000-00805f9b34fb`
  - Properties: `['write', 'notify', 'read']`

### 3. Hiwonder Servo Protocol
```python
# Format: 0x55 0x55 0x08 0x03 0x01 <ACTION_ID> 0x00 0x00
command = bytes([0x55, 0x55, 0x08, 0x03, 0x01, 0x06, 0x00, 0x00])
await client.write_gatt_char(CHAR_UUID, command)
```
- **Status**: ✅ Working for all tested actions (0x01-0x0F)
- **Notes**: Robot responds immediately to commands

### 4. HTTP Bridge with Flask
```python
# Flask + Bleak async integration
loop = asyncio.get_event_loop()
success = loop.run_until_complete(mechdog.send_command(command))
```
- **Status**: ✅ Working with `nest_asyncio`
- **Notes**: Required `nest_asyncio.apply()` to avoid event loop conflicts

## What Failed ❌

### 1. Simple Action ID Commands
```python
# Attempt: Send just the action ID
await client.write_gatt_char(CHAR_UUID, bytes([0x01]))
await client.write_gatt_char(CHAR_UUID, bytes([0x06]))
```
- **Status**: ❌ Robot did not respond
- **Reason**: MechDog requires full Hiwonder protocol header
- **Learning**: Must use `0x55 0x55 ...` format

### 2. WiFi Protocol Over Bluetooth
```python
# Attempt: Send WiFi-style ASCII commands
await client.write_gatt_char(CHAR_UUID, b'CMD_STAND\n')
await client.write_gatt_char(CHAR_UUID, b'#001P1500T1000!')
```
- **Status**: ❌ No response
- **Reason**: Bluetooth version uses different protocol than WiFi version
- **Learning**: WiFi (ASCII) and Bluetooth (binary) are separate protocols

### 3. Direct Servo Commands
```python
# Attempt: Low-level servo position commands
# Format from LewanSoul servo protocol
command = bytes([0x55, 0x55, 0x08, 0x03, 0x00, 0x01, 0xDC, 0x05])
```
- **Status**: ❌ No response / unpredictable behavior
- **Reason**: MechDog expects action group IDs, not individual servo positions
- **Learning**: Can't control individual servos directly via Bluetooth

### 4. Read Characteristic for Feedback
```python
# Attempt: Read status/response from characteristic
response = await client.read_gatt_char(CHAR_UUID)
print(f"Response: {response.hex()}")
```
- **Status**: ❌ Empty or no meaningful data
- **Tried**: Reading immediately after write, with delays, etc.
- **Reason**: Either no response sent, or need to enable notifications
- **Learning**: May need notification handler instead of read

### 5. Different Checksum Calculations
```python
# Attempt 1: XOR checksum
checksum = 0x08 ^ 0x03 ^ 0x01 ^ 0x06
command = bytes([0x55, 0x55, 0x08, 0x03, 0x01, 0x06, checksum, 0x00])

# Attempt 2: Sum modulo 256
checksum = (0x08 + 0x03 + 0x01 + 0x06) & 0xFF
command = bytes([0x55, 0x55, 0x08, 0x03, 0x01, 0x06, checksum, 0x00])

# Attempt 3: Inverted sum
checksum = (~(0x08 + 0x03 + 0x01 + 0x06)) & 0xFF
command = bytes([0x55, 0x55, 0x08, 0x03, 0x01, 0x06, checksum, 0x00])
```
- **Status**: ❌ All variations worked same as `0x00 0x00`
- **Reason**: Checksum may not be validated, or padding is correct
- **Learning**: `0x00 0x00` padding works fine, checksum likely not required

### 6. Movement Duration Control
```python
# Attempt: Encode duration in command
# Try duration in bytes 6-7
duration_ms = 2000
duration_high = (duration_ms >> 8) & 0xFF
duration_low = duration_ms & 0xFF
command = bytes([0x55, 0x55, 0x08, 0x03, 0x01, 0x01, duration_high, duration_low])
```
- **Status**: ❌ No effect on duration
- **Reason**: These bytes may not control duration, or need different encoding
- **Learning**: Movement duration may be fixed in robot firmware

### 7. Write Without Response Mode
```python
# Attempt: Use write-without-response for faster commands
await client.write_gatt_char(CHAR_UUID, command, response=False)
```
- **Status**: ⚠️ Sometimes works, sometimes doesn't
- **Reason**: May lose commands if sent too quickly
- **Learning**: Stick with write-with-response for reliability

## What We Haven't Tried Yet 🔮

### 1. Enable Notifications for Feedback
```python
# Theory: Robot may send status updates via notifications
def notification_handler(sender, data):
    print(f"Notification from {sender}: {data.hex()}")

await client.start_notify(CHAR_UUID, notification_handler)
# Send command
await asyncio.sleep(1)  # Wait for notification
await client.stop_notify(CHAR_UUID)
```
- **Priority**: High
- **Why**: May reveal battery status, sensor data, or command acknowledgment
- **Expected**: Could get movement completion, error codes, or sensor readings

### 2. Alternative Command Packet Lengths
```python
# Current: 0x55 0x55 0x08 0x03 0x01 <ID> 0x00 0x00 (8 bytes)
# Try: Different lengths (0x06, 0x0A, 0x0C)
command = bytes([0x55, 0x55, 0x0A, 0x03, 0x01, 0x06, 0x00, 0x00, 0x00, 0x00])
```
- **Priority**: Low
- **Why**: Might unlock additional command parameters
- **Expected**: Probably won't work, but worth checking

### 3. Command Type Variations
```python
# Current: Type 0x03 (action group execution)
# Try: Types 0x01, 0x02, 0x04, 0x05, etc.
command = bytes([0x55, 0x55, 0x08, 0x04, 0x01, 0x06, 0x00, 0x00])
```
- **Priority**: Medium
- **Why**: Different command types might control speed, sensors, LEDs, etc.
- **Expected**: May discover new capabilities (LED control, speed adjustment)

### 4. Multi-Byte Action IDs
```python
# Current: Single byte action ID
# Try: 2-byte action IDs for extended actions
command = bytes([0x55, 0x55, 0x09, 0x03, 0x01, 0x00, 0x10, 0x00, 0x00])
```
- **Priority**: Low
- **Why**: May support more than 255 actions
- **Expected**: Unlikely to work, but could find hidden actions

### 5. Discover Other Characteristics
```python
# Check if there are other characteristics in other services
for service in services:
    for char in service.characteristics:
        # Try reading all readable characteristics
        if 'read' in char.properties:
            try:
                data = await client.read_gatt_char(char.uuid)
                print(f"{char.uuid}: {data.hex()}")
            except:
                pass
```
- **Priority**: High
- **Why**: Might find battery, sensor, or configuration characteristics
- **Expected**: Could discover status information or settings

### 6. Command Sequences for Custom Actions
```python
# Theory: Send multiple commands rapidly to create custom movements
commands = [
    bytes([0x55, 0x55, 0x08, 0x03, 0x01, 0x03, 0x00, 0x00]),  # Left kick
    bytes([0x55, 0x55, 0x08, 0x03, 0x01, 0x04, 0x00, 0x00]),  # Right kick
    bytes([0x55, 0x55, 0x08, 0x03, 0x01, 0x06, 0x00, 0x00]),  # Stand
]
for cmd in commands:
    await client.write_gatt_char(CHAR_UUID, cmd)
    await asyncio.sleep(0.5)
```
- **Priority**: Medium
- **Why**: Could create custom dance routines or movements
- **Expected**: Likely to work, but timing may be tricky

### 7. Speed/Power Parameter
```python
# Theory: Byte 4 or 5 might control movement speed/power
# Current: Always 0x01 at byte 4
command = bytes([0x55, 0x55, 0x08, 0x03, 0x02, 0x01, 0x00, 0x00])  # Group 2?
command = bytes([0x55, 0x55, 0x08, 0x03, 0xFF, 0x01, 0x00, 0x00])  # Max speed?
```
- **Priority**: Medium
- **Why**: Could allow speed control for movements
- **Expected**: Might control movement speed or power level

### 8. Packet Capture from Real App
```python
# Use macOS Bluetooth logging to capture actual app commands
# Command:
# sudo log stream --predicate 'subsystem contains "bluetooth"' --level debug
```
- **Priority**: High (if real app available)
- **Why**: Could reveal additional commands or protocol details
- **Expected**: Would show exact commands app sends
- **Note**: Requires iOS/Android Hiwonder app and MechDog connection

### 9. Battery/Status Query Command
```python
# Theory: Special command might query battery/status
# Try Hiwonder battery query commands
command = bytes([0x55, 0x55, 0x03, 0x0F, 0x00])  # Generic status query
```
- **Priority**: High
- **Why**: Useful for monitoring battery level
- **Expected**: May get response via notification or read

### 10. LED/Sound Control
```python
# Theory: MechDog might have LED or sound commands
# Try different command types
command = bytes([0x55, 0x55, 0x08, 0x05, 0x01, 0x01, 0x00, 0x00])  # Type 5?
```
- **Priority**: Low
- **Why**: Robot may have LEDs or speaker
- **Expected**: Unknown, but could be fun

## Testing Strategy

### Quick Test Template
```python
import asyncio
from bleak import BleakClient

async def test_command(mac, command_bytes):
    client = BleakClient(mac)
    await client.connect()
    print(f"Testing: {command_bytes.hex()}")
    await client.write_gatt_char("0000ffe1-0000-1000-8000-00805f9b34fb", command_bytes)
    await asyncio.sleep(2)
    await client.disconnect()

# Usage
asyncio.run(test_command("AA:BB:CC:DD:EE:FF", bytes([0x55, 0x55, 0x08, 0x03, 0x01, 0x06, 0x00, 0x00])))
```

### Systematic Testing
1. **One variable at a time**: Change only one byte per test
2. **Document results**: Note robot behavior for each command
3. **Safe fallback**: Always able to send "stand" command to reset
4. **Timing**: Wait 2-3 seconds between commands to observe full movement

## Common Issues & Solutions

### Issue: Event Loop Already Running
```python
# Error: asyncio.run() cannot be called from a running event loop
# Solution: Use nest_asyncio
import nest_asyncio
nest_asyncio.apply()
```

### Issue: Connection Timeout
```python
# Error: Failed to connect after 10 seconds
# Solution 1: Power cycle MechDog
# Solution 2: Disconnect from Bluetooth settings, then reconnect
# Solution 3: Increase timeout
client = BleakClient(mac, timeout=20.0)
```

### Issue: Commands Not Working
```python
# Checklist:
# 1. Verify connection: print(client.is_connected)
# 2. Check UUID: Ensure using correct characteristic UUID
# 3. Verify command format: Must start with 0x55 0x55
# 4. Check MAC address: Ensure correct device
```

### Issue: Robot Moves Then Stops Immediately
```python
# Behavior: Robot starts action but stops after <1 second
# Possible cause: Another command sent too quickly
# Solution: Add delay between commands (0.5-1 second minimum)
```

## Next Session Checklist

For continuing this work:

1. ✅ Read this document first
2. ⬜ Test notification handlers (Priority 1)
3. ⬜ Discover and read all characteristics (Priority 1)
4. ⬜ Try command type variations (Priority 2)
5. ⬜ Attempt packet capture from real app if available (Priority 1)
6. ⬜ Test command sequences for custom actions (Priority 2)
7. ⬜ Document all findings in this file

## References

- Hiwonder servo protocol: http://www.hiwonder.com/
- Bleak documentation: https://bleak.readthedocs.io/
- BLE GATT specifications: https://www.bluetooth.com/specifications/gatt/

## Session Notes

Add your experimental results here:

### Session YYYY-MM-DD
**Tested**: [What you tried]
**Result**: [What happened]
**Learning**: [What you discovered]
**Next**: [What to try next]
