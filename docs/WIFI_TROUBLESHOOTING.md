# MechDog WiFi Connection Troubleshooting

## Issue: Can't Find MechDog WiFi Network

### Possible Causes

1. **MechDog WiFi AP is disabled** - Some MechDog units ship with AP mode off
2. **Different WiFi name** - May not be "MechDog-XXXX" pattern
3. **Already connected to WiFi** - MechDog may be on your existing network
4. **Power/Battery issue** - ESP32 WiFi not starting

### Solution 1: Use Bluetooth App to Enable WiFi

**If you have the Hiwonder app:**

1. Download "Hiwonder" app on your phone (iOS/Android)
2. Enable Bluetooth on your phone
3. Open app and connect to MechDog via Bluetooth
4. In app settings, enable WiFi AP mode
5. Configure WiFi settings:
   - SSID: `MechDog` (or custom name)
   - Password: Usually blank or `12345678`
6. Restart MechDog

### Solution 2: Connect MechDog to Your WiFi Network

**Using the Hiwonder app:**

1. Connect to MechDog via Bluetooth in app
2. Go to WiFi settings
3. Select your venue WiFi network (e.g., hotel/conference WiFi)
4. Enter WiFi password
5. MechDog will connect and display IP address
6. Note the IP address (e.g., `192.168.1.XXX`)

**Set this IP in your .env:**
```bash
echo "MECHDOG_IP=192.168.1.XXX" >> .env
```

### Solution 3: Find MechDog on Your Network (If Already Connected)

**Option A: Use Network Scanner**

```bash
# Install nmap (if not already installed)
brew install nmap  # macOS
# or
sudo apt-get install nmap  # Linux

# Scan your network for MechDog
nmap -sn 192.168.1.0/24  # Adjust subnet if different

# Look for ESP32 devices or unfamiliar IPs
# Try pinging suspected IPs
ping 192.168.1.100
```

**Option B: Check Router Admin Panel**

1. Log into your WiFi router admin page
2. Look at connected devices list
3. Find device named "ESP32", "MechDog", or unknown device
4. Note its IP address

**Option C: Use Hiwonder App**

1. Connect phone to same WiFi as MechDog
2. Open Hiwonder app
3. Scan for devices on WiFi
4. App will show MechDog's IP address

### Solution 4: Direct USB Connection (Last Resort)

If you have access to the ESP32 module inside MechDog:

1. Connect USB cable from laptop to ESP32-S3
2. Open serial terminal: `screen /dev/ttyUSB0 115200` (Linux) or `screen /dev/cu.usbserial 115200` (macOS)
3. Look for WiFi status messages
4. May show current IP or WiFi config

### Solution 5: Use Simulator for Development

If you can't connect to hardware immediately:

```bash
# Start visual simulator
./scripts/start.sh

# Test with simulator
export MECHDOG_IP=localhost:3000
bridge/.venv/bin/python bridge/bridge.py --cmd action --ip localhost:3000 --name dance

# Test with OpenClaw
openclaw --skill skills/mechdog
> Move forward 2 seconds
```

## Testing Connection

Once you have an IP address, test it:

```bash
# Test ping
ping <IP>

# Test HTTP API
curl http://<IP>/status

# Expected response:
# {"status":"ok","battery":95,"position":{"x":0,"y":0},...}
```

## Common IP Addresses to Try

```bash
# Default AP mode
192.168.4.1

# Common router DHCP ranges
192.168.1.100
192.168.1.101
192.168.0.100
10.0.0.100
```

Test each:
```bash
curl http://192.168.4.1/status
curl http://192.168.1.100/status
curl http://192.168.0.100/status
```

## Quick Test Script

```bash
#!/bin/bash
# Save as test_mechdog_ip.sh

SUBNETS="192.168.1 192.168.0 192.168.4 10.0.0"

for subnet in $SUBNETS; do
    for i in {1..10} {100..110}; do
        IP="${subnet}.${i}"
        echo -n "Testing $IP... "
        if curl -s -m 1 http://${IP}/status > /dev/null 2>&1; then
            echo "✓ FOUND!"
            echo "MechDog IP: $IP"
            exit 0
        else
            echo "✗"
        fi
    done
done

echo "MechDog not found on common IPs"
```

```bash
chmod +x test_mechdog_ip.sh
./test_mechdog_ip.sh
```

## WiFi Defaults for Different MechDog Versions

| Version | Default WiFi | Default Password | Default IP |
|---------|-------------|------------------|------------|
| Standard | MechDog-XXXX | (none) | 192.168.4.1 |
| Pro | MechDog-Pro-XXXX | 12345678 | 192.168.4.1 |
| Custom | Check manual | Check manual | 192.168.4.1 |

## At the Hackathon Venue

**Best approach:**

1. **Ask organizers** if there's a dedicated device WiFi network
2. **Use venue WiFi**: Connect MechDog to hackathon WiFi via app
3. **Share hotspot**: Use your phone's hotspot, connect both laptop and MechDog
4. **Simulator mode**: Develop/test with simulator, connect to robot at demo time

## Emergency: Simulator-Only Demo

If you absolutely cannot connect to hardware:

```bash
# Run full demo with simulator
./scripts/start.sh
./scripts/test.sh demo-vision --ip localhost:3000

# In presentation:
# "Here's the visual simulation - in production this would control
# the physical robot via the exact same API"
```

## Need Help?

1. Check MechDog manual for your specific model
2. Hiwonder support: https://www.hiwonder.com
3. ESP32 WiFi docs: Check `docs/ESP32_API.md`

## After You Connect

```bash
# Set in .env
echo "MECHDOG_IP=<your-ip>" >> .env

# Test basic command
bridge/.venv/bin/python bridge/bridge.py --cmd action --ip <your-ip> --name wave

# If wave works, you're ready! 🎉
```
