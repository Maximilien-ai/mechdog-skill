#!/usr/bin/env python3
"""
MechDog Mock HTTP Server
Simulates MechDog ESP32 API for development and testing without hardware

Usage:
    python mock_server.py [--port PORT]

Then test with:
    python bridge.py --cmd move --ip 127.0.0.1:8080 --dir forward --ms 2000
"""

import argparse
import json
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
from typing import Dict, Any


class MechDogMockHandler(BaseHTTPRequestHandler):
    """HTTP request handler that simulates MechDog ESP32 responses"""

    def log_message(self, format, *args):
        """Custom logging with prettier output"""
        timestamp = time.strftime('%H:%M:%S')
        print(f"[{timestamp}] {format % args}")

    def _send_json_response(self, status_code: int, data: Dict[str, Any]):
        """Helper to send JSON responses"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def do_POST(self):
        """Handle POST requests"""
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8')

        try:
            data = json.loads(body) if body else {}
        except json.JSONDecodeError:
            self._send_json_response(400, {
                'status': 'error',
                'message': 'Invalid JSON'
            })
            return

        # Route handling
        if self.path == '/move':
            self._handle_move(data)
        elif self.path == '/action':
            self._handle_action(data)
        else:
            self._send_json_response(404, {
                'status': 'error',
                'message': f'Unknown endpoint: {self.path}'
            })

    def do_GET(self):
        """Handle GET requests"""
        if self.path == '/camera/capture':
            self._handle_capture()
        elif self.path == '/status':
            self._handle_status()
        else:
            self._send_json_response(404, {
                'status': 'error',
                'message': f'Unknown endpoint: {self.path}'
            })

    def _handle_move(self, data: Dict[str, Any]):
        """Simulate movement command"""
        direction = data.get('direction')
        duration = data.get('duration', 1000)

        if direction not in ['forward', 'backward', 'left', 'right', 'stop']:
            self._send_json_response(400, {
                'status': 'error',
                'message': f'Invalid direction: {direction}'
            })
            return

        print(f"🤖 [SIMULATION] Moving {direction} for {duration}ms")

        # Simulate movement delay (non-blocking in real implementation)
        # time.sleep(duration / 1000.0)  # Commented out to keep server responsive

        self._send_json_response(200, {
            'status': 'ok',
            'message': f'Moving {direction} for {duration}ms',
            'command': 'move',
            'direction': direction,
            'duration': duration
        })

    def _handle_action(self, data: Dict[str, Any]):
        """Simulate action command"""
        action = data.get('name')

        valid_actions = ['sit', 'stand', 'shake', 'wave', 'dance', 'balance']
        if action not in valid_actions:
            self._send_json_response(400, {
                'status': 'error',
                'message': f'Invalid action: {action}'
            })
            return

        # Different actions take different times
        action_durations = {
            'sit': 1.5,
            'stand': 1.0,
            'shake': 2.0,
            'wave': 2.5,
            'dance': 5.0,
            'balance': 3.0
        }

        duration = action_durations.get(action, 1.0)
        print(f"🤖 [SIMULATION] Performing action: {action} (~{duration}s)")

        self._send_json_response(200, {
            'status': 'ok',
            'action': action,
            'estimated_duration': duration,
            'message': f'Performing action: {action}'
        })

    def _handle_capture(self):
        """Simulate camera capture"""
        print(f"📷 [SIMULATION] Camera capture requested")

        # In a real implementation, this would return JPEG binary data
        # For mock, we return a simple message
        self._send_json_response(200, {
            'status': 'ok',
            'message': 'Camera capture simulated (no actual image in mock)',
            'note': 'Real hardware returns binary JPEG data'
        })

    def _handle_status(self):
        """Simulate status endpoint"""
        import random

        self._send_json_response(200, {
            'status': 'ok',
            'battery': random.randint(70, 100),
            'imu': {
                'pitch': round(random.uniform(-1, 1), 2),
                'roll': round(random.uniform(-1, 1), 2),
                'yaw': round(random.uniform(0, 360), 2)
            },
            'ultrasonic_distance_cm': random.randint(10, 200),
            'wifi_rssi': random.randint(-60, -30),
            'mode': 'simulated'
        })


def main():
    parser = argparse.ArgumentParser(
        description='MechDog Mock HTTP Server'
    )
    parser.add_argument('--port', type=int, default=8080,
                       help='Port to run mock server on (default: 8080)')
    parser.add_argument('--host', default='127.0.0.1',
                       help='Host to bind to (default: 127.0.0.1)')

    args = parser.parse_args()

    server_address = (args.host, args.port)
    httpd = HTTPServer(server_address, MechDogMockHandler)

    print("╔═══════════════════════════════════════════════════════════╗")
    print("║          MechDog Mock Server (Simulator)                  ║")
    print("╚═══════════════════════════════════════════════════════════╝")
    print(f"\n🚀 Server running at http://{args.host}:{args.port}")
    print(f"\n📋 Available endpoints:")
    print(f"   POST /move      - Simulate movement")
    print(f"   POST /action    - Simulate actions")
    print(f"   GET  /camera/capture - Simulate camera")
    print(f"   GET  /status    - Get simulated status")
    print(f"\n🧪 Test with bridge:")
    print(f"   python bridge.py --cmd move --ip {args.host}:{args.port} --dir forward --ms 2000")
    print(f"   python bridge.py --cmd action --ip {args.host}:{args.port} --name sit")
    print(f"\nPress Ctrl+C to stop\n")

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n🛑 Shutting down mock server...")
        httpd.shutdown()


if __name__ == "__main__":
    main()
