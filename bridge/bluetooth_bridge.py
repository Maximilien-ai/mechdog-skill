#!/usr/bin/env python3
"""
MechDog Ultra Bluetooth Bridge
Provides HTTP API for MechDog Ultra (Bluetooth-only version)

Usage:
    python bluetooth_bridge.py --mac AA:BB:CC:DD:EE:FF --port 3000

This creates an HTTP server that translates REST API calls to Bluetooth commands.
"""

import argparse
import asyncio
import sys
from typing import Optional
from flask import Flask, request, jsonify
from bleak import BleakClient, BleakScanner

# Hiwonder MechDog BLE Service UUIDs (need to be discovered)
# These are placeholders - actual UUIDs need to be found via scanning
MECHDOG_SERVICE_UUID = "0000ffe0-0000-1000-8000-00805f9b34fb"
MECHDOG_CHAR_UUID = "0000ffe1-0000-1000-8000-00805f9b34fb"

app = Flask(__name__)

class MechDogBluetooth:
    """Bluetooth client for MechDog Ultra"""

    def __init__(self, mac_address: str):
        self.mac_address = mac_address
        self.client: Optional[BleakClient] = None
        self.connected = False

    async def connect(self):
        """Connect to MechDog via Bluetooth"""
        print(f"Connecting to MechDog at {self.mac_address}...")
        try:
            self.client = BleakClient(self.mac_address)
            await self.client.connect()
            self.connected = True
            print(f"✓ Connected to MechDog")

            # Discover services
            services = self.client.services
            print("\nAvailable services:")
            for service in services:
                print(f"  Service: {service.uuid}")
                for char in service.characteristics:
                    print(f"    Characteristic: {char.uuid} - {char.properties}")

        except Exception as e:
            print(f"Failed to connect: {e}")
            self.connected = False
            raise

    async def disconnect(self):
        """Disconnect from MechDog"""
        if self.client and self.connected:
            await self.client.disconnect()
            self.connected = False
            print("Disconnected from MechDog")

    async def send_command(self, command: bytes) -> bool:
        """Send command to MechDog via Bluetooth"""
        if not self.connected:
            print("Error: Not connected to MechDog")
            return False

        try:
            print(f"Sending command: {command.hex()} ({len(command)} bytes)")
            await self.client.write_gatt_char(MECHDOG_CHAR_UUID, command)
            print(f"✓ Command sent successfully")
            return True
        except Exception as e:
            print(f"Failed to send command: {e}")
            import traceback
            traceback.print_exc()
            return False

    # Command encoding functions (Hiwonder MechDog servo protocol)
    def encode_move(self, direction: str, duration_ms: int) -> bytes:
        """
        Encode movement command
        Protocol: 0x55 0x55 0x08 0x03 0x01 <ACTION_ID> 0x00 0x00
        """
        # Movement action IDs (from testing)
        direction_codes = {
            'forward': 0x01,   # Action 1
            'backward': 0x02,  # Action 2
            'left': 0x03,      # Action 3 (left kick/turn)
            'right': 0x04,     # Action 4 (right kick/turn)
            'stop': 0x06       # Action 6 (stand)
        }

        action_id = direction_codes.get(direction, 0x06)  # Default to stand

        # Hiwonder servo protocol: 0x55 0x55 0x08 0x03 0x01 <ID> 0x00 0x00
        return bytes([0x55, 0x55, 0x08, 0x03, 0x01, action_id, 0x00, 0x00])

    def encode_action(self, action_name: str) -> bytes:
        """
        Encode action command
        Protocol: 0x55 0x55 0x08 0x03 0x01 <ACTION_ID> 0x00 0x00
        """
        # Action IDs (from testing - confirmed working!)
        action_codes = {
            'forward': 0x01,
            'backward': 0x02,
            'left_kick': 0x03,
            'right_kick': 0x04,
            'sit': 0x05,
            'stand': 0x06,
            'lie_down': 0x07,
            'stand_2legs': 0x08,
            'shake_hand': 0x09,
            'shake': 0x09,  # Alias
            'bow': 0x0A,
            'nod': 0x0B,
            'wave': 0x0C,
            'stretch': 0x0D,
            'dance': 0x0E,
            'pee': 0x0F,

            # Additional common aliases
            'balance': 0x08,  # 2 legs stand
            'hello': 0x0C,    # Wave
        }

        action_id = action_codes.get(action_name.lower(), 0x06)  # Default to stand

        # Hiwonder servo protocol
        return bytes([0x55, 0x55, 0x08, 0x03, 0x01, action_id, 0x00, 0x00])


# Global MechDog instance
mechdog: Optional[MechDogBluetooth] = None


# Flask HTTP API routes (compatible with WiFi version)

@app.route('/status', methods=['GET'])
def get_status():
    """Get MechDog status"""
    return jsonify({
        'status': 'ok' if mechdog and mechdog.connected else 'disconnected',
        'connection': 'bluetooth',
        'mac_address': mechdog.mac_address if mechdog else None
    })


@app.route('/move', methods=['POST'])
def move():
    """Move MechDog"""
    if not mechdog or not mechdog.connected:
        return jsonify({'error': 'Not connected to MechDog'}), 503

    data = request.json
    direction = data.get('direction', 'forward')
    duration_ms = data.get('duration_ms', 1000)

    command = mechdog.encode_move(direction, duration_ms)

    # Run async function in sync context
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    success = loop.run_until_complete(mechdog.send_command(command))
    loop.close()

    if success:
        return jsonify({'status': 'ok', 'direction': direction, 'duration_ms': duration_ms})
    else:
        return jsonify({'error': 'Failed to send command'}), 500


@app.route('/action', methods=['POST'])
def action():
    """Perform action"""
    if not mechdog or not mechdog.connected:
        return jsonify({'error': 'Not connected to MechDog'}), 503

    data = request.json
    action_name = data.get('name', 'stand')
    print(f"\n[ACTION] Received request: {action_name}")

    command = mechdog.encode_action(action_name)
    print(f"[ACTION] Encoded command: {command.hex()}")

    # Send command synchronously using the BLE client's write method directly
    try:
        import nest_asyncio
        nest_asyncio.apply()

        loop = asyncio.get_event_loop()
        success = loop.run_until_complete(mechdog.send_command(command))
    except Exception as e:
        print(f"[ACTION] Exception in async execution: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Command execution failed: {str(e)}'}), 500

    if success:
        return jsonify({'status': 'ok', 'action': action_name})
    else:
        return jsonify({'error': 'Failed to send command'}), 500


@app.route('/camera/capture', methods=['GET'])
def camera_capture():
    """Camera capture - not available on Ultra"""
    return jsonify({'error': 'Camera not available on MechDog Ultra (Bluetooth version)'}), 404


async def discover_mechdog():
    """Scan for MechDog devices"""
    print("Scanning for Bluetooth devices...")
    devices = await BleakScanner.discover()

    print("\nFound devices:")
    for i, device in enumerate(devices):
        print(f"{i+1}. {device.name or 'Unknown'} ({device.address})")

    # Look for devices with "MechDog" or "Hiwonder" in name
    mechdog_devices = [d for d in devices if d.name and ('mechdog' in d.name.lower() or 'hiwonder' in d.name.lower())]

    if mechdog_devices:
        print("\nPossible MechDog devices:")
        for device in mechdog_devices:
            print(f"  - {device.name} ({device.address})")
        return mechdog_devices[0].address
    else:
        print("\nNo MechDog devices found automatically.")
        return None


def main():
    global mechdog

    parser = argparse.ArgumentParser(
        description="MechDog Ultra Bluetooth Bridge - HTTP API for Bluetooth-only MechDog"
    )
    parser.add_argument('--mac', help='MechDog MAC address (e.g., AA:BB:CC:DD:EE:FF)')
    parser.add_argument('--scan', action='store_true', help='Scan for MechDog devices')
    parser.add_argument('--port', type=int, default=3000, help='HTTP server port (default: 3000)')

    args = parser.parse_args()

    if args.scan:
        # Run discovery
        mac = asyncio.run(discover_mechdog())
        if mac:
            print(f"\nUse this MAC address: {mac}")
            print(f"Run: python bluetooth_bridge.py --mac {mac} --port {args.port}")
        else:
            print("\nManually find MAC address:")
            print("1. Check Bluetooth settings on your laptop")
            print("2. Pair with MechDog if needed")
            print("3. Note the MAC address")
        sys.exit(0)

    if not args.mac:
        print("Error: --mac argument required (or use --scan to discover)")
        print("Usage: python bluetooth_bridge.py --mac AA:BB:CC:DD:EE:FF")
        sys.exit(1)

    # Create MechDog instance
    mechdog = MechDogBluetooth(args.mac)

    # Connect
    try:
        asyncio.run(mechdog.connect())
    except Exception as e:
        print(f"Failed to connect: {e}")
        print("\nTroubleshooting:")
        print("1. Make sure MechDog is powered on")
        print("2. Check Bluetooth is enabled on your laptop")
        print("3. Try pairing with MechDog in Bluetooth settings")
        print("4. Run with --scan to discover devices")
        sys.exit(1)

    print(f"\n✓ Bluetooth bridge running on http://localhost:{args.port}")
    print(f"✓ MechDog connected via Bluetooth: {args.mac}")
    print("\nYou can now use the HTTP API:")
    print(f"  curl http://localhost:{args.port}/status")
    print(f"  # Or use with bridge.py: --ip localhost:{args.port}")
    print("\nPress Ctrl+C to stop")

    # Run Flask server
    try:
        app.run(host='0.0.0.0', port=args.port, debug=False)
    except KeyboardInterrupt:
        print("\nShutting down...")
    finally:
        asyncio.run(mechdog.disconnect())


if __name__ == "__main__":
    main()
