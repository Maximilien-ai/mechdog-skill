/**
 * MechDog Control Skill for OpenClaw
 * Natural language control of Hiwonder MechDog quadruped robot
 */

import { execSync } from 'child_process';
import * as path from 'path';

// Get MechDog IP from environment variable
const MECHDOG_IP = process.env.MECHDOG_IP || '192.168.1.100';

// Paths
const BRIDGE_PATH = path.join(__dirname, '../../bridge/bridge.py');
const VISION_PATH = path.join(__dirname, '../../bridge/vision.py');
const PYTHON_PATH = path.join(__dirname, '../../bridge/.venv/bin/python');

/**
 * Execute Python bridge command
 */
function executeBridgeCommand(args: string[]): string {
  try {
    const command = `${PYTHON_PATH} ${BRIDGE_PATH} ${args.join(' ')}`;
    const result = execSync(command, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return result.trim();
  } catch (error: any) {
    throw new Error(`MechDog command failed: ${error.message}`);
  }
}

export const tools = {
  move: {
    description: 'Move MechDog in a specified direction for a duration',
    parameters: {
      type: 'object',
      properties: {
        direction: {
          type: 'string',
          enum: ['forward', 'backward', 'left', 'right', 'stop'],
          description: 'Direction to move the MechDog'
        },
        duration_ms: {
          type: 'number',
          description: 'How long to move in milliseconds (default: 1000ms)',
          default: 1000
        }
      },
      required: ['direction']
    },
    execute: async ({ direction, duration_ms = 1000 }: {
      direction: string;
      duration_ms?: number;
    }) => {
      const args = [
        '--cmd', 'move',
        '--ip', MECHDOG_IP,
        '--dir', direction,
        '--ms', String(duration_ms)
      ];

      const result = executeBridgeCommand(args);
      return `MechDog moving ${direction} for ${duration_ms}ms\n${result}`;
    }
  },

  action: {
    description: 'Perform a preset MechDog action (sit, stand, shake, wave, dance, balance)',
    parameters: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['sit', 'stand', 'shake', 'wave', 'dance', 'balance'],
          description: 'The action for MechDog to perform'
        }
      },
      required: ['action']
    },
    execute: async ({ action }: { action: string }) => {
      const args = [
        '--cmd', 'action',
        '--ip', MECHDOG_IP,
        '--name', action
      ];

      const result = executeBridgeCommand(args);
      return `MechDog performing: ${action}\n${result}`;
    }
  },

  look: {
    description: 'Capture an image from MechDog\'s camera (ESP32-S3). Returns path to captured image.',
    parameters: {
      type: 'object',
      properties: {}
    },
    execute: async () => {
      const args = [
        '--cmd', 'capture',
        '--ip', MECHDOG_IP
      ];

      try {
        const result = executeBridgeCommand(args);
        return `Camera capture successful\n${result}`;
      } catch (error: any) {
        return `Camera capture failed: ${error.message}\n(Vision features may not be available)`;
      }
    }
  },

  see: {
    description: 'Use vision AI to describe what MechDog sees through its camera. Captures image and analyzes with VLM (Nebius/Anthropic).',
    parameters: {
      type: 'object',
      properties: {
        question: {
          type: 'string',
          description: 'Optional question to ask about the image (e.g., "What color is the ball?"). Default: general scene description',
          default: 'Describe what you see in this image. Focus on objects, colors, and spatial layout.'
        },
        provider: {
          type: 'string',
          enum: ['nebius', 'anthropic'],
          description: 'VLM provider to use (default: nebius)',
          default: 'nebius'
        }
      }
    },
    execute: async ({ question, provider = 'nebius' }: {
      question?: string;
      provider?: string;
    }) => {
      const prompt = question || 'Describe what you see in this image. Focus on objects, colors, and spatial layout.';

      const args = [
        VISION_PATH,
        '--ip', MECHDOG_IP,
        '--provider', provider,
        '--prompt', prompt,
        '--save', '/tmp/mechdog_vision.jpg'
      ];

      try {
        const command = `${PYTHON_PATH} ${args.join(' ')}`;
        const result = execSync(command, {
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'pipe'],
          timeout: 30000 // 30 second timeout for VLM
        });
        return `🤖 MechDog Vision:\n${result.trim()}`;
      } catch (error: any) {
        return `Vision analysis failed: ${error.message}\n(Make sure NEBIUS_API_KEY or ANTHROPIC_API_KEY is set in .env)`;
      }
    }
  }
};

// Export metadata for OpenClaw
export const metadata = {
  name: 'mechdog',
  description: 'Control Hiwonder MechDog quadruped robot',
  version: '1.0.0',
  author: 'Maximilien'
};
