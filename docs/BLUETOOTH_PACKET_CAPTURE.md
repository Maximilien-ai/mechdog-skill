# Capturing Bluetooth Packets from Hiwonder App

Since MechDog can only connect to one device at a time, we need to capture packets while the Hiwonder app is controlling it.

## Method 1: macOS Packet Capture (Recommended)

**Steps:**

1. **Close Hiwonder app** (disconnect from MechDog)

2. **Start macOS Bluetooth logging:**
   ```bash
   sudo log stream --predicate 'subsystem contains "bluetooth"' --level debug > bluetooth_log.txt
   ```

3. **In another terminal, filter for data:**
   ```bash
   tail -f bluetooth_log.txt | grep -i "data\|write\|send"
   ```

4. **Open Hiwonder app** and control MechDog

5. **Watch the log** for hex data being sent

6. **Stop logging** with Ctrl+C

## Method 2: Use PacketLogger (Apple Developer Tool)

1. Download "Additional Tools for Xcode" from Apple Developer
2. Install PacketLogger
3. Start capture
4. Use Hiwonder app
5. See all Bluetooth packets with hex data

## Method 3: Android Debug (if you have Android phone)

```bash
# Enable Bluetooth HCI snoop log in Android Developer Options
# Control MechDog with app
# Pull log file:
adb pull /sdcard/btsnoop_hci.log
# Open in Wireshark
```

## Method 4: Just Try Common Patterns

Based on Hiwonder documentation, try these in our test scripts:

```python
# Pattern 1: Servo protocol (55 55 header)
b'\x55\x55\x08\x03\x01\x01\x00\x00'  # Action 1
b'\x55\x55\x08\x03\x01\x02\x00\x00'  # Action 2

# Pattern 2: Simple action IDs
b'\x01'  # Action 1
b'\x02'  # Action 2

# Pattern 3: WiFi protocol via Bluetooth
b'CMD_STAND\n'
b'CMD_SIT\n'
```

## Quick Test

Since you have limited time, **just use the simulator** - it works perfectly!

```bash
./scripts/start.sh
./scripts/test.sh demo --ip localhost:3000
```

The Bluetooth reverse engineering can continue after your demo.
