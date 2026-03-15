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
from pathlib import Path

# Load environment variables from .env file
def load_env():
    """Load environment variables from .env file if it exists"""
    env_path = Path(__file__).parent.parent / '.env'
    if env_path.exists():
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    key, _, value = line.partition('=')
                    os.environ.setdefault(key.strip(), value.strip())

load_env()


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


def query_vlm_nebius(image_path: str, prompt: str = "Describe what you see in this image.") -> Optional[str]:
    """
    Query Nebius Token Factory VLM (vision models via OpenAI-compatible API)
    """
    nebius_api_key = os.getenv("NEBIUS_API_KEY", "")
    nebius_base_url = os.getenv("NEBIUS_BASE_URL", "https://api.tokenfactory.us-central1.nebius.com/v1/")
    # User must set this in .env - it's a dedicated model ID
    nebius_model = os.getenv("NEBIUS_MODEL", "")

    if not nebius_api_key:
        print("Warning: NEBIUS_API_KEY not set. VLM inference unavailable.", file=sys.stderr)
        print("Set NEBIUS_API_KEY in .env file or environment", file=sys.stderr)
        return None

    if not nebius_model:
        print("Warning: NEBIUS_MODEL not set. Set your dedicated model ID in .env", file=sys.stderr)
        print("Example: NEBIUS_MODEL=dedicated/Qwen/Qwen2.5-VL-72B-Instruct-dQEwwpQN9Pc3", file=sys.stderr)
        return None

    try:
        # Try using OpenAI library (preferred)
        try:
            from openai import OpenAI

            client = OpenAI(
                base_url=nebius_base_url,
                api_key=nebius_api_key
            )

            # Encode image to base64
            with open(image_path, "rb") as f:
                image_data = base64.b64encode(f.read()).decode('utf-8')

            response = client.chat.completions.create(
                model=nebius_model,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{image_data}"
                                }
                            },
                            {
                                "type": "text",
                                "text": prompt
                            }
                        ]
                    }
                ],
                max_tokens=200
            )

            return response.choices[0].message.content

        except ImportError:
            # Fallback to requests library
            print("Note: openai package not found, using requests fallback", file=sys.stderr)

            with open(image_path, "rb") as f:
                image_data = base64.b64encode(f.read()).decode('utf-8')

            response = requests.post(
                f"{nebius_base_url.rstrip('/')}/chat/completions",
                headers={
                    "Authorization": f"Bearer {nebius_api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": nebius_model,
                    "messages": [
                        {
                            "role": "user",
                            "content": [
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": f"data:image/jpeg;base64,{image_data}"
                                    }
                                },
                                {
                                    "type": "text",
                                    "text": prompt
                                }
                            ]
                        }
                    ],
                    "max_tokens": 200
                },
                timeout=30
            )
            response.raise_for_status()
            result = response.json()

            if "choices" in result and len(result["choices"]) > 0:
                return result["choices"][0]["message"]["content"]
            else:
                print(f"Unexpected response format: {result}", file=sys.stderr)
                return None

    except Exception as e:
        print(f"Error querying Nebius VLM: {e}", file=sys.stderr)
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
            model="claude-3-5-sonnet-20240620",
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
        description = query_vlm_nebius(args.save, args.prompt)
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
