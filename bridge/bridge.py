#!/usr/bin/env python3
"""
MechDog Control Bridge
Translates OpenClaw tool calls to MechDog ESP32 HTTP commands
"""

import argparse
import requests
import time
import sys
from typing import Optional


def send_move_command(ip: str, direction: str, duration_ms: int) -> dict:
    """Send movement command to MechDog"""
    url = f"http://{ip}/move"
    payload = {
        "direction": direction,
        "duration": duration_ms
    }

    try:
        response = requests.post(url, json=payload, timeout=5)
        response.raise_for_status()
        return {"success": True, "message": f"Moving {direction} for {duration_ms}ms"}
    except requests.exceptions.RequestException as e:
        return {"success": False, "error": str(e)}


def send_action_command(ip: str, action_name: str) -> dict:
    """Send preset action command to MechDog"""
    url = f"http://{ip}/action"
    payload = {
        "name": action_name
    }

    try:
        response = requests.post(url, json=payload, timeout=5)
        response.raise_for_status()
        return {"success": True, "message": f"Performing action: {action_name}"}
    except requests.exceptions.RequestException as e:
        return {"success": False, "error": str(e)}


def capture_camera_frame(ip: str) -> dict:
    """Capture image from MechDog ESP32-S3 camera"""
    url = f"http://{ip}/camera/capture"

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()

        # Save image temporarily
        image_path = "/tmp/mechdog_frame.jpg"
        with open(image_path, "wb") as f:
            f.write(response.content)

        return {"success": True, "image_path": image_path}
    except requests.exceptions.RequestException as e:
        return {"success": False, "error": str(e)}


def main():
    parser = argparse.ArgumentParser(
        description="MechDog ESP32 Control Bridge"
    )
    parser.add_argument('--cmd', required=True,
                       choices=['move', 'action', 'capture'],
                       help='Command type to execute')
    parser.add_argument('--ip', required=True,
                       help='MechDog IP address')
    parser.add_argument('--dir', default=None,
                       choices=['forward', 'backward', 'left', 'right', 'stop'],
                       help='Movement direction (for move command)')
    parser.add_argument('--ms', type=int, default=1000,
                       help='Duration in milliseconds (for move command)')
    parser.add_argument('--name', default=None,
                       choices=['sit', 'stand', 'shake', 'wave', 'dance', 'balance'],
                       help='Action name (for action command)')

    args = parser.parse_args()

    result = None

    if args.cmd == 'move':
        if not args.dir:
            print("Error: --dir required for move command", file=sys.stderr)
            sys.exit(1)
        result = send_move_command(args.ip, args.dir, args.ms)

    elif args.cmd == 'action':
        if not args.name:
            print("Error: --name required for action command", file=sys.stderr)
            sys.exit(1)
        result = send_action_command(args.ip, args.name)

    elif args.cmd == 'capture':
        result = capture_camera_frame(args.ip)

    if result:
        if result.get('success'):
            print(result.get('message', 'Command executed successfully'))
            if 'image_path' in result:
                print(f"Image saved to: {result['image_path']}")
        else:
            print(f"Error: {result.get('error', 'Unknown error')}", file=sys.stderr)
            sys.exit(1)


if __name__ == "__main__":
    main()
