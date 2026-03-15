#!/usr/bin/env python3
"""
MechDog Vision Integration (Stretch Goal)
Captures camera frames and sends to VLM for scene understanding
"""

import argparse
import requests
import base64
import sys
import os
from typing import Optional


def capture_frame(ip: str, save_path: str = "/tmp/mechdog_frame.jpg") -> bool:
    """Capture image from MechDog camera"""
    url = f"http://{ip}/camera/capture"

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()

        with open(save_path, "wb") as f:
            f.write(response.content)

        print(f"Frame captured: {save_path}")
        return True
    except requests.exceptions.RequestException as e:
        print(f"Error capturing frame: {e}", file=sys.stderr)
        return False


def encode_image_base64(image_path: str) -> Optional[str]:
    """Encode image to base64 for VLM API"""
    try:
        with open(image_path, "rb") as f:
            return base64.b64encode(f.read()).decode('utf-8')
    except Exception as e:
        print(f"Error encoding image: {e}", file=sys.stderr)
        return None


def query_vlm_nebius(image_base64: str, prompt: str = "Describe what you see in this image.") -> Optional[str]:
    """
    Query Nebius GPU-hosted VLM (Qwen or similar)

    TODO: Replace with actual Nebius API endpoint and authentication
    """
    # Placeholder for Nebius API integration
    nebius_endpoint = os.getenv("NEBIUS_VLM_ENDPOINT", "https://api.nebius.ai/v1/vlm/inference")
    nebius_api_key = os.getenv("NEBIUS_API_KEY", "")

    if not nebius_api_key:
        print("Warning: NEBIUS_API_KEY not set. VLM inference unavailable.", file=sys.stderr)
        return None

    try:
        response = requests.post(
            nebius_endpoint,
            headers={
                "Authorization": f"Bearer {nebius_api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": "qwen-vl",
                "image": image_base64,
                "prompt": prompt,
                "max_tokens": 200
            },
            timeout=30
        )
        response.raise_for_status()
        result = response.json()
        return result.get("description", "No description available")
    except requests.exceptions.RequestException as e:
        print(f"Error querying VLM: {e}", file=sys.stderr)
        return None


def query_vlm_anthropic(image_path: str, prompt: str = "Describe what you see in this image.") -> Optional[str]:
    """
    Query Anthropic Claude with vision (alternative to Nebius)
    Requires anthropic package: uv pip install anthropic
    """
    try:
        import anthropic
    except ImportError:
        print("Error: anthropic package not installed. Run: uv pip install anthropic", file=sys.stderr)
        return None

    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if not api_key:
        print("Warning: ANTHROPIC_API_KEY not set. Claude vision unavailable.", file=sys.stderr)
        return None

    try:
        client = anthropic.Anthropic(api_key=api_key)

        with open(image_path, "rb") as f:
            image_data = base64.b64encode(f.read()).decode('utf-8')

        message = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=200,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": "image/jpeg",
                                "data": image_data
                            }
                        },
                        {
                            "type": "text",
                            "text": prompt
                        }
                    ]
                }
            ]
        )

        return message.content[0].text
    except Exception as e:
        print(f"Error querying Claude: {e}", file=sys.stderr)
        return None


def main():
    parser = argparse.ArgumentParser(
        description="MechDog Vision Integration"
    )
    parser.add_argument('--ip', required=True, help='MechDog IP address')
    parser.add_argument('--prompt', default='Describe what you see. Focus on objects, colors, and spatial layout.',
                       help='Prompt for VLM')
    parser.add_argument('--provider', choices=['nebius', 'anthropic'], default='anthropic',
                       help='VLM provider to use')
    parser.add_argument('--save', default='/tmp/mechdog_frame.jpg',
                       help='Path to save captured image')

    args = parser.parse_args()

    # Step 1: Capture frame from MechDog
    print(f"Capturing frame from MechDog at {args.ip}...")
    if not capture_frame(args.ip, args.save):
        sys.exit(1)

    # Step 2: Query VLM
    print(f"Querying {args.provider} VLM...")
    description = None

    if args.provider == 'nebius':
        image_b64 = encode_image_base64(args.save)
        if image_b64:
            description = query_vlm_nebius(image_b64, args.prompt)
    elif args.provider == 'anthropic':
        description = query_vlm_anthropic(args.save, args.prompt)

    # Step 3: Output result
    if description:
        print(f"\n🤖 MechDog Vision:\n{description}")
    else:
        print("Failed to get vision description", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
