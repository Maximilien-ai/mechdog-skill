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
            await self.client.write_gatt_char(MECHDOG_CHAR_UUID, command)
            return True
        except Exception as e:
            print(f"Failed to send command: {e}")
            return False

    # Command encoding functions (need to reverse engineer from Hiwonder app)
    def encode_move(self, direction: str, duration_ms: int) -> bytes:
        """
        Encode movement command

        Note: These are placeholder implementations.
        Actual protocol needs to be reverse engineered from Hiwonder app.
        """
        # Placeholder - actual encoding depends on MechDog protocol
        direction_codes = {
            'forward': b'\x01',
            'backward': b'\x02',
            'left': b'\x03',
            'right': b'\x04',
            'stop': b'\x00'
        }

        code = direction_codes.get(direction, b'\x00')
        duration_bytes = duration_ms.to_bytes(2, 'big')

        return b'\xFF' + code + duration_bytes + b'\xFE'  # Example framing

    def encode_action(self, action_name: str) -> bytes:
        """
        Encode action command
        """
        action_codes = {
            'sit': b'\x10',
            'stand': b'\x11',
            'wave': b'\x12',
            'shake': b'\x13',
            'dance': b'\x14',
            'balance': b'\x15'
        }

        code = action_codes.get(action_name, b'\x11')  # Default to stand
        return b'\xFF\xA0' + code + b'\xFE'  # Example framing


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

    command = mechdog.encode_action(action_name)

    # Run async function in sync context
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    success = loop.run_until_complete(mechdog.send_command(command))
    loop.close()

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
