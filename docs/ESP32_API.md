# MechDog ESP32 API Reference

Documentation for the Hiwonder MechDog ESP32 WiFi API.

## Base URL

```
http://<MECHDOG_IP>
```

Default port: `80` (HTTP)

## Endpoints

### POST /move

Move the MechDog in a specified direction for a duration.

**Request Body:**
```json
{
  "direction": "forward",
  "duration": 3000
}
```

**Parameters:**
- `direction` (string, required): One of `forward`, `backward`, `left`, `right`, `stop`
- `duration` (number, required): Duration in milliseconds

**Response:**
```json
{
  "status": "ok",
  "message": "Moving forward for 3000ms"
}
```

**Example:**
```bash
curl -X POST http://192.168.1.100/move \
  -H "Content-Type: application/json" \
  -d '{"direction": "forward", "duration": 3000}'
```

---

### POST /action

Execute a preset MechDog action.

**Request Body:**
```json
{
  "name": "sit"
}
```

**Parameters:**
- `name` (string, required): One of `sit`, `stand`, `shake`, `wave`, `dance`, `balance`

**Response:**
```json
{
  "status": "ok",
  "action": "sit"
}
```

**Example:**
```bash
curl -X POST http://192.168.1.100/action \
  -H "Content-Type: application/json" \
  -d '{"name": "sit"}'
```

---

### GET /camera/capture

Capture an image from the ESP32-S3 camera module.

**Response:**
Binary image data (JPEG format)

**Example:**
```bash
curl -X GET http://192.168.1.100/camera/capture \
  --output mechdog_frame.jpg
```

---

### GET /status

Get current MechDog status and sensor readings.

**Response:**
```json
{
  "battery": 85,
  "imu": {
    "pitch": 0.5,
    "roll": -0.2,
    "yaw": 180
  },
  "ultrasonic_distance_cm": 42,
  "wifi_rssi": -45
}
```

---

## Notes

### Network Configuration

The MechDog creates a WiFi access point by default:
- SSID: `MechDog-XXXX` (where XXXX is device ID)
- Password: Check documentation or device sticker

Or configure it to connect to your existing WiFi network via the companion app.

### Timing Considerations

- Movement commands are non-blocking (return immediately)
- Action commands may block until completion
- Camera capture may take 1-3 seconds depending on resolution

### Error Handling

All endpoints return HTTP status codes:
- `200 OK` - Success
- `400 Bad Request` - Invalid parameters
- `500 Internal Server Error` - Hardware error
- `503 Service Unavailable` - MechDog busy or battery low

### Concurrent Commands

The ESP32 can only execute one command at a time. Sending a new command while one is executing will queue or override the previous command (behavior depends on firmware version).

### Vision Integration (Stretch Goal)

For Nebius GPU VLM integration:

1. Capture frame: `GET /camera/capture`
2. Save to file or base64 encode
3. Send to Nebius GPU instance running Qwen VLM or similar
4. Return scene description to OpenClaw agent
5. Agent can then issue navigation commands based on what it sees

**Example flow:**
```
User: "Walk toward the red object"
→ Agent captures frame
→ VLM identifies red object location
→ Agent calculates turn angle and distance
→ Agent issues move/turn commands to reach object
```
