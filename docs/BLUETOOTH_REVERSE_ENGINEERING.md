# MechDog Ultra Bluetooth Reverse Engineering

## Overview

The MechDog Ultra (Bluetooth-only version) uses a proprietary Bluetooth Low Energy (BLE) protocol for control. This document summarizes the reverse engineering effort to understand and implement this protocol.

## Hardware & Protocol

### BLE Service Information
- **Service UUID**: `0000ffe0-0000-1000-8000-00805f9b34fb`
- **Characteristic UUID**: `0000ffe1-0000-1000-8000-00805f9b34fb`
- **Protocol**: Hiwonder servo control protocol

### Command Format

All commands follow the Hiwonder servo protocol format:

```
0x55 0x55 0x08 0x03 0x01 <ACTION_ID> 0x00 0x00
```

**Breakdown:**
- `0x55 0x55`: Header/sync bytes (standard Hiwonder marker)
- `0x08`: Packet length
- `0x03`: Command type (action/group execution)
- `0x01`: Action group number
- `<ACTION_ID>`: The specific action to perform (see mapping below)
- `0x00 0x00`: Padding/checksum (not validated in current implementation)

## Action ID Mapping

Through testing, we've confirmed the following action IDs:

| Action ID | Action Name | Description |
|-----------|-------------|-------------|
| `0x01` | forward | Walk forward |
| `0x02` | backward | Walk backward |
| `0x03` | left_kick | Left turn/kick |
| `0x04` | right_kick | Right turn/kick |
| `0x05` | sit | Sit down |
| `0x06` | stand | Stand up (default/stop) |
| `0x07` | lie_down | Lie down flat |
| `0x08` | stand_2legs | Stand on 2 legs/balance |
| `0x09` | shake_hand | Shake hand/paw |
| `0x0A` | bow | Bow down |
| `0x0B` | nod | Nod head |
| `0x0C` | wave | Wave paw |
| `0x0D` | stretch | Stretch |
| `0x0E` | dance | Dance routine |
| `0x0F` | pee | Pee action |

## Reverse Engineering Process

### Tools Used
1. **Bleak** (Python BLE library) - For BLE communication
2. **macOS Bluetooth logging** - For packet capture
3. **Iterative testing** - Systematically trying different command formats

### Discovery Steps

1. **Service Discovery**
   - Scanned MechDog Ultra for BLE services
   - Found Hiwonder's standard UART service UUIDs
   - Identified writable characteristic for commands

2. **Protocol Analysis**
   - Initial attempts with simple action IDs failed
   - Analyzed Hiwonder servo documentation
   - Recognized `0x55 0x55` header pattern from Hiwonder servo protocol
   - Successfully sent first working command: `0x55 0x55 0x08 0x03 0x01 0x06 0x00 0x00` (stand)

3. **Action Mapping**
   - Systematically tested action IDs `0x01` through `0x0F`
   - Documented which actions corresponded to which movements
   - Created comprehensive action mapping table

4. **API Implementation**
   - Built HTTP-to-BLE bridge (`bluetooth_bridge.py`)
   - Implemented same REST API as WiFi version for compatibility
   - Resolved async/sync issues with Flask and BLE

## Implementation

### Current Status
✅ **Working**: Bluetooth connection and command sending
✅ **Working**: All documented actions (forward, sit, stand, wave, etc.)
✅ **Working**: HTTP REST API bridge
✅ **Working**: Compatible with existing demo scripts

### Key Files
- `bridge/bluetooth_bridge.py`: Main HTTP-to-Bluetooth bridge
- `docs/BLUETOOTH_PACKET_CAPTURE.md`: Packet capture instructions
- `bridge/tests/`: Test scripts for protocol exploration (if preserved)

### Usage Example

```bash
# Scan for MechDog
python bridge/bluetooth_bridge.py --scan

# Connect and start HTTP bridge
python bridge/bluetooth_bridge.py --mac AA:BB:CC:DD:EE:FF --port 3000

# Use with existing API
curl -X POST http://localhost:3000/action -H "Content-Type: application/json" -d '{"name":"wave"}'
```

## Challenges Overcome

1. **Async/Sync Integration**: Flask (sync) + Bleak (async)
   - Solution: Used `nest_asyncio` and event loop management

2. **Protocol Discovery**: No official documentation for Bluetooth commands
   - Solution: Systematic testing based on Hiwonder servo protocol knowledge

3. **Single Connection Limit**: MechDog can only connect to one device
   - Solution: Documented packet capture methods for future protocol expansion

## Future Work

### Potential Enhancements
1. **Response Handling**: Implement notification handlers for feedback
2. **Battery Status**: Discover if battery level can be queried
3. **Sensor Data**: Investigate if gyro/accelerometer data is available
4. **Custom Actions**: Explore if custom servo sequences can be uploaded
5. **Movement Duration**: Test if duration parameter affects movement time

### Unknown Protocol Features
- Checksum validation (currently padding with `0x00 0x00`)
- Response packets format
- Sensor data characteristic (if available)
- Battery/status characteristic (if available)

## Testing Notes

The `bridge/tests/` directory can contain exploration scripts:
- Service/characteristic discovery
- Protocol timing tests
- Checksum validation
- Response handling
- Direct characteristic testing

## References

- Hiwonder servo bus protocol documentation
- BLE UART service standard (though MechDog uses custom UUIDs)
- Bleak documentation: https://github.com/hbldh/bleak
- Original reverse engineering session logs (if preserved)

## Credits

Reverse engineered through systematic testing and analysis.
Implementation uses standard BLE libraries (Bleak) for cross-platform compatibility.
