#!/usr/bin/env tsx
/**
 * MechDog Visual Simulator Server
 * Provides HTTP API + WebSocket for real-time visualization
 */

import express from 'express';
import { WebSocketServer } from 'ws';
import bodyParser from 'body-parser';
import multer from 'multer';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.SIMULATOR_PORT || '8080');

// Simulator state
interface SimulatorState {
  position: { x: number; y: number };
  rotation: number; // degrees
  action: string | null;
  battery: number;
  lastCommand: string;
  timestamp: number;
}

let state: SimulatorState = {
  position: { x: 400, y: 300 }, // Center of 800x600 canvas
  rotation: 0,
  action: null,
  battery: 100,
  lastCommand: 'idle',
  timestamp: Date.now()
};

// Create Express app
const app = express();
const server = createServer(app);

// WebSocket server for real-time updates
const wss = new WebSocketServer({ server });

// Multer for handling file uploads (camera captures)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// Store last captured image
let lastCapturedImage: Buffer | null = null;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Broadcast state to all connected clients
function broadcast(data: any) {
  wss.clients.forEach(client => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(JSON.stringify(data));
    }
  });
}

// MechDog API endpoints
app.post('/move', (req, res) => {
  const { direction, duration } = req.body;

  console.log(`🐕 Move: ${direction} for ${duration}ms`);

  // Update position based on direction
  const speed = 0.1; // pixels per ms
  const distance = speed * duration;

  switch (direction) {
    case 'forward':
      state.position.x += distance * Math.cos(state.rotation * Math.PI / 180);
      state.position.y += distance * Math.sin(state.rotation * Math.PI / 180);
      break;
    case 'backward':
      state.position.x -= distance * Math.cos(state.rotation * Math.PI / 180);
      state.position.y -= distance * Math.sin(state.rotation * Math.PI / 180);
      break;
    case 'left':
      state.rotation -= 15;
      break;
    case 'right':
      state.rotation += 15;
      break;
    case 'stop':
      break;
  }

  state.lastCommand = `move ${direction}`;
  state.timestamp = Date.now();

  broadcast({
    type: 'move',
    direction,
    duration,
    state
  });

  res.json({
    status: 'ok',
    message: `Moving ${direction} for ${duration}ms`,
    state
  });
});

app.post('/action', (req, res) => {
  const { name } = req.body;

  console.log(`🎭 Action: ${name}`);

  state.action = name;
  state.lastCommand = `action ${name}`;
  state.timestamp = Date.now();

  broadcast({
    type: 'action',
    action: name,
    state
  });

  // Clear action after duration
  const durations: Record<string, number> = {
    sit: 1500,
    stand: 1000,
    shake: 2000,
    wave: 2500,
    dance: 5000,
    balance: 3000
  };

  setTimeout(() => {
    state.action = null;
    broadcast({ type: 'action_complete', state });
  }, durations[name] || 1000);

  res.json({
    status: 'ok',
    action: name,
    estimated_duration: (durations[name] || 1000) / 1000,
    state
  });
});

app.post('/position', (req, res) => {
  const { position, rotation } = req.body;

  console.log(`📍 Position update: (${Math.round(position.x)}, ${Math.round(position.y)}), rotation: ${Math.round(rotation)}°`);

  // Update state
  state.position = position;
  if (rotation !== undefined) {
    state.rotation = rotation;
  }
  state.lastCommand = 'manual position';
  state.timestamp = Date.now();

  broadcast({
    type: 'position_update',
    position,
    rotation,
    state
  });

  res.json({
    status: 'ok',
    position: state.position,
    rotation: state.rotation
  });
});

app.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    battery: state.battery,
    position: state.position,
    rotation: state.rotation,
    action: state.action,
    lastCommand: state.lastCommand,
    mode: 'simulated'
  });
});

// Camera capture - POST for receiving webcam image from browser
app.post('/camera/capture', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      status: 'error',
      message: 'No image uploaded'
    });
  }

  lastCapturedImage = req.file.buffer;

  console.log(`📸 Camera capture received: ${Math.round(req.file.size / 1024)}KB (${req.file.mimetype})`);

  res.json({
    status: 'ok',
    message: 'Camera frame captured',
    size: req.file.size,
    timestamp: Date.now()
  });
});

// Camera capture - GET for retrieving last captured image (for vision.py)
app.get('/camera/capture', (req, res) => {
  if (!lastCapturedImage) {
    return res.status(404).json({
      status: 'error',
      message: 'No frame captured yet. Use the simulator camera controls to capture a frame first.',
      note: 'Click "Start Camera" then "Capture Frame" in the simulator UI'
    });
  }

  console.log(`📷 Serving captured image: ${Math.round(lastCapturedImage.length / 1024)}KB`);

  res.setHeader('Content-Type', 'image/jpeg');
  res.setHeader('Content-Length', lastCapturedImage.length);
  res.send(lastCapturedImage);
});

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('🔌 Client connected to simulator');

  // Send initial state
  ws.send(JSON.stringify({
    type: 'init',
    state
  }));

  ws.on('close', () => {
    console.log('🔌 Client disconnected');
  });
});

// Start server
server.listen(PORT, () => {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║       MechDog Visual Simulator (HTTP + WebSocket)        ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`🚀 Server:     http://localhost:${PORT}`);
  console.log(`🎨 Visualizer: http://localhost:${PORT}/`);
  console.log(`🔌 WebSocket:  ws://localhost:${PORT}`);
  console.log('');
  console.log('📋 API Endpoints:');
  console.log('   POST /move');
  console.log('   POST /action');
  console.log('   GET  /status');
  console.log('   GET  /camera/capture');
  console.log('');
  console.log('🧪 Test with:');
  console.log(`   python3 bridge/bridge.py --cmd move --ip localhost:${PORT} --dir forward --ms 2000`);
  console.log('');
  console.log('Press Ctrl+C to stop');
  console.log('');
});
