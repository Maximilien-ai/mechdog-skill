/**
 * MechDog Visual Simulator - Client-side rendering
 */

const canvas = document.getElementById('mechdog-canvas');
const ctx = canvas.getContext('2d');

// WebSocket connection
let ws = null;
let isConnected = false;

// Simulator state
let dogState = {
    position: { x: 400, y: 300 },
    rotation: 0,
    action: null,
    battery: 100,
    lastCommand: 'idle'
};

// Animation state
let targetPosition = { x: 400, y: 300 };
let targetRotation = 0;
let animationProgress = 0;

// Drag state
let isDragging = false;
let dragOffset = { x: 0, y: 0 };
let draggingBall = null;

// Balls state
let balls = [];
const BALL_COLORS = ['red', 'blue', 'green'];
const BALL_RADIUS = 12; // About 1/2 the size of dog's head

// Connect to WebSocket
function connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;

    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        console.log('Connected to simulator');
        isConnected = true;
        updateConnectionStatus(true);
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleServerUpdate(data);
    };

    ws.onclose = () => {
        console.log('Disconnected from simulator');
        isConnected = false;
        updateConnectionStatus(false);
        setTimeout(connect, 2000); // Reconnect after 2s
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
}

function handleServerUpdate(data) {
    if (data.state) {
        // Smooth animation to new position
        targetPosition = { ...data.state.position };
        targetRotation = data.state.rotation;
        dogState.action = data.state.action;
        dogState.battery = data.state.battery;
        dogState.lastCommand = data.state.lastCommand;

        updateStatusDisplay();
    }

    if (data.type === 'action') {
        showAction(data.action);
        showEmojiForAction(data.action);
    }

    if (data.type === 'move') {
        showEmojiForMove(data.direction);
    }
}

function updateConnectionStatus(connected) {
    const indicator = document.getElementById('connectionIndicator');
    const text = document.getElementById('connectionText');

    if (connected) {
        indicator.className = 'connection-indicator connected';
        text.textContent = 'Connected';
    } else {
        indicator.className = 'connection-indicator disconnected';
        text.textContent = 'Disconnected';
    }
}

function updateStatusDisplay() {
    document.getElementById('position').textContent =
        `${Math.round(dogState.position.x)}, ${Math.round(dogState.position.y)}`;
    document.getElementById('rotation').textContent =
        `${Math.round(dogState.rotation)}°`;
    document.getElementById('battery').textContent =
        `${Math.round(dogState.battery)}%`;
    document.getElementById('lastCommand').textContent =
        dogState.lastCommand;
}

function showAction(action) {
    const display = document.getElementById('actionDisplay');
    const actionEmojis = {
        sit: '🪑',
        stand: '🧍',
        shake: '🤝',
        wave: '👋',
        dance: '💃',
        balance: '🤸'
    };

    display.textContent = `${actionEmojis[action] || '🤖'} ${action.toUpperCase()}`;

    setTimeout(() => {
        display.textContent = 'Ready for commands...';
    }, 2000);
}

// Drawing functions
function drawGrid() {
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;

    for (let x = 0; x < canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (let y = 0; y < canvas.height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function drawDog() {
    const { x, y } = dogState.position;
    const rotation = dogState.rotation * Math.PI / 180;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    // Body
    ctx.fillStyle = '#667eea';
    ctx.fillRect(-25, -15, 50, 30);

    // Head
    ctx.fillStyle = '#764ba2';
    ctx.beginPath();
    ctx.arc(35, 0, 15, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(38, -5, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(38, 5, 3, 0, Math.PI * 2);
    ctx.fill();

    // Legs (simple representation)
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 4;

    // Animate legs if action is active
    const legOffset = dogState.action ? Math.sin(Date.now() / 100) * 5 : 0;

    // Front left
    ctx.beginPath();
    ctx.moveTo(15, -10);
    ctx.lineTo(15, 5 + legOffset);
    ctx.stroke();

    // Front right
    ctx.beginPath();
    ctx.moveTo(15, 10);
    ctx.lineTo(15, 5 - legOffset);
    ctx.stroke();

    // Back left
    ctx.beginPath();
    ctx.moveTo(-15, -10);
    ctx.lineTo(-15, 5 - legOffset);
    ctx.stroke();

    // Back right
    ctx.beginPath();
    ctx.moveTo(-15, 10);
    ctx.lineTo(-15, 5 + legOffset);
    ctx.stroke();

    // Direction indicator
    ctx.strokeStyle = '#ff4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(25, 0);
    ctx.lineTo(45, 0);
    ctx.stroke();

    // Action indicator
    if (dogState.action) {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(0, 0, 50, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

function drawTrail() {
    // Simple trail effect (could be enhanced)
    ctx.fillStyle = 'rgba(102, 126, 234, 0.05)';
    ctx.beginPath();
    ctx.arc(dogState.position.x, dogState.position.y, 10, 0, Math.PI * 2);
    ctx.fill();
}

// Animation loop
function animate() {
    // Smooth interpolation to target
    animationProgress += 0.1;
    if (animationProgress > 1) animationProgress = 1;

    dogState.position.x += (targetPosition.x - dogState.position.x) * 0.1;
    dogState.position.y += (targetPosition.y - dogState.position.y) * 0.1;
    dogState.rotation += (targetRotation - dogState.rotation) * 0.1;

    // Constrain to canvas
    dogState.position.x = Math.max(50, Math.min(canvas.width - 50, dogState.position.x));
    dogState.position.y = Math.max(50, Math.min(canvas.height - 50, dogState.position.y));

    // Update balls physics
    balls.forEach(ball => ball.update());

    // Update floating emojis
    updateFloatingEmojis();

    // Clear and redraw
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid();
    drawTrail();

    // Draw balls (behind dog)
    balls.forEach(ball => ball.draw(ctx));

    // Draw dog
    drawDog();

    // Draw floating emojis (on top of everything)
    drawFloatingEmojis(ctx);

    requestAnimationFrame(animate);
}

// Send command to server (for manual control buttons)
async function sendCommand(type, params) {
    try {
        const endpoint = type === 'move' ? '/move' : '/action';
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
        });

        const result = await response.json();
        console.log('Command sent:', result);
    } catch (error) {
        console.error('Error sending command:', error);
    }
}

// Mouse/touch interaction for dragging robot
function isPointInDog(x, y) {
    const dx = x - dogState.position.x;
    const dy = y - dogState.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < 50; // 50px radius hit area
}

function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
        x: (evt.clientX - rect.left) * scaleX,
        y: (evt.clientY - rect.top) * scaleY
    };
}

// Mouse events
canvas.addEventListener('mousedown', (e) => {
    const pos = getMousePos(canvas, e);

    // Check if clicking on a ball first
    const ball = getBallAtPosition(pos.x, pos.y);
    if (ball) {
        console.log(`Dragging ${ball.color} ball`);
        draggingBall = ball;
        dragOffset.x = pos.x - ball.x;
        dragOffset.y = pos.y - ball.y;
        ball.vx = 0; // Stop ball movement
        ball.vy = 0;
        canvas.style.cursor = 'grabbing';
        return;
    }

    // Otherwise check if clicking on dog
    if (isPointInDog(pos.x, pos.y)) {
        console.log('Dragging robot');
        isDragging = true;
        dragOffset.x = pos.x - dogState.position.x;
        dragOffset.y = pos.y - dogState.position.y;
        canvas.style.cursor = 'grabbing';
    }
});

canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePos(canvas, e);

    if (draggingBall) {
        // Drag ball
        const newX = pos.x - dragOffset.x;
        const newY = pos.y - dragOffset.y;

        draggingBall.x = Math.max(draggingBall.radius, Math.min(canvas.width - draggingBall.radius, newX));
        draggingBall.y = Math.max(draggingBall.radius, Math.min(canvas.height - draggingBall.radius, newY));
    } else if (isDragging) {
        // Drag robot
        const newX = pos.x - dragOffset.x;
        const newY = pos.y - dragOffset.y;

        const constrainedX = Math.max(50, Math.min(canvas.width - 50, newX));
        const constrainedY = Math.max(50, Math.min(canvas.height - 50, newY));

        dogState.position.x = constrainedX;
        dogState.position.y = constrainedY;
        targetPosition.x = constrainedX;
        targetPosition.y = constrainedY;

        updateStatusDisplay();
    } else {
        // Update cursor based on what's under mouse
        const ball = getBallAtPosition(pos.x, pos.y);
        if (ball) {
            canvas.style.cursor = 'grab';
        } else if (isPointInDog(pos.x, pos.y)) {
            canvas.style.cursor = 'grab';
        } else {
            canvas.style.cursor = 'default';
        }
    }
});

canvas.addEventListener('mouseup', () => {
    if (draggingBall) {
        draggingBall = null;
        canvas.style.cursor = 'default';
    }
    if (isDragging) {
        isDragging = false;
        canvas.style.cursor = 'grab';
        sendPositionUpdate();
    }
});

canvas.addEventListener('mouseleave', () => {
    if (draggingBall) {
        draggingBall = null;
    }
    if (isDragging) {
        isDragging = false;
        canvas.style.cursor = 'default';
        sendPositionUpdate();
    }
});

// Touch events for mobile
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const pos = getMousePos(canvas, touch);

    if (isPointInDog(pos.x, pos.y)) {
        isDragging = true;
        dragOffset.x = pos.x - dogState.position.x;
        dragOffset.y = pos.y - dogState.position.y;
    }
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (isDragging) {
        const touch = e.touches[0];
        const pos = getMousePos(canvas, touch);

        const newX = pos.x - dragOffset.x;
        const newY = pos.y - dragOffset.y;

        const constrainedX = Math.max(50, Math.min(canvas.width - 50, newX));
        const constrainedY = Math.max(50, Math.min(canvas.height - 50, newY));

        dogState.position.x = constrainedX;
        dogState.position.y = constrainedY;
        targetPosition.x = constrainedX;
        targetPosition.y = constrainedY;

        updateStatusDisplay();
    }
});

canvas.addEventListener('touchend', () => {
    if (isDragging) {
        isDragging = false;
        sendPositionUpdate();
    }
});

// Send position update to server
async function sendPositionUpdate() {
    try {
        await fetch('/position', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                position: dogState.position,
                rotation: dogState.rotation
            })
        });
    } catch (error) {
        console.error('Error updating position:', error);
    }
}

// Ball physics and management
class Ball {
    constructor(color, x, y) {
        this.color = color;
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 8; // Random initial velocity
        this.vy = (Math.random() - 0.5) * 8;
        this.radius = BALL_RADIUS;
        this.friction = 0.98; // Slow down over time
        this.bounceDamping = 0.7; // Energy loss on bounce
    }

    update() {
        // Apply friction
        this.vx *= this.friction;
        this.vy *= this.friction;

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off walls
        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.vx = -this.vx * this.bounceDamping;
        }
        if (this.x + this.radius > canvas.width) {
            this.x = canvas.width - this.radius;
            this.vx = -this.vx * this.bounceDamping;
        }
        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.vy = -this.vy * this.bounceDamping;
        }
        if (this.y + this.radius > canvas.height) {
            this.y = canvas.height - this.radius;
            this.vy = -this.vy * this.bounceDamping;
        }

        // Stop if moving very slowly
        if (Math.abs(this.vx) < 0.1) this.vx = 0;
        if (Math.abs(this.vy) < 0.1) this.vy = 0;
    }

    draw(ctx) {
        ctx.save();

        // Shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Ball
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(this.x - this.radius/3, this.y - this.radius/3, this.radius/3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    contains(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;
        return Math.sqrt(dx * dx + dy * dy) < this.radius;
    }
}

function addBall(color) {
    if (balls.length >= 3) {
        alert('Maximum 3 balls allowed! Remove one first.');
        return;
    }

    // Check if color already exists
    if (balls.find(b => b.color === color)) {
        alert(`${color.charAt(0).toUpperCase() + color.slice(1)} ball already exists!`);
        return;
    }

    // Random position in center area
    const x = canvas.width / 2 + (Math.random() - 0.5) * 200;
    const y = canvas.height / 2 + (Math.random() - 0.5) * 200;

    const ball = new Ball(color, x, y);
    balls.push(ball);

    console.log(`Added ${color} ball at (${Math.round(x)}, ${Math.round(y)})`);
}

function removeBall(color) {
    const index = balls.findIndex(b => b.color === color);
    if (index !== -1) {
        balls.splice(index, 1);
        console.log(`Removed ${color} ball`);
    }
}

function getBallAtPosition(x, y) {
    // Check in reverse order so top ball is selected
    for (let i = balls.length - 1; i >= 0; i--) {
        if (balls[i].contains(x, y)) {
            return balls[i];
        }
    }
    return null;
}

// Camera functionality
let cameraStream = null;
let lastCapturedImage = null;

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: 'user' // Front camera
            }
        });

        const videoElement = document.getElementById('cameraPreview');
        videoElement.srcObject = stream;
        cameraStream = stream;

        // Update UI
        document.getElementById('startCameraBtn').disabled = true;
        document.getElementById('stopCameraBtn').disabled = false;
        document.getElementById('captureBtn').disabled = false;
        document.getElementById('cameraStatus').textContent = '✅ Camera active - ready for vision testing';

        console.log('Camera started successfully');
    } catch (error) {
        console.error('Camera error:', error);
        document.getElementById('cameraStatus').textContent = `❌ Camera error: ${error.message}. Grant camera permissions and try again.`;
    }
}

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;

        const videoElement = document.getElementById('cameraPreview');
        videoElement.srcObject = null;

        // Update UI
        document.getElementById('startCameraBtn').disabled = false;
        document.getElementById('stopCameraBtn').disabled = true;
        document.getElementById('captureBtn').disabled = true;
        document.getElementById('cameraStatus').textContent = 'Camera stopped.';

        console.log('Camera stopped');
    }
}

async function captureFrame() {
    if (!cameraStream) {
        alert('Start camera first!');
        return;
    }

    const videoElement = document.getElementById('cameraPreview');
    const canvasElement = document.getElementById('cameraCanvas');
    const ctx = canvasElement.getContext('2d');

    // Set canvas size to match video
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;

    // Draw current video frame to canvas (flip back to normal orientation)
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(videoElement, -canvasElement.width, 0, canvasElement.width, canvasElement.height);
    ctx.restore();

    // Convert to blob (JPEG)
    canvasElement.toBlob(async (blob) => {
        lastCapturedImage = blob;

        // Send to server
        const formData = new FormData();
        formData.append('image', blob, 'capture.jpg');

        try {
            const response = await fetch('/camera/capture', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                document.getElementById('cameraStatus').textContent = `📸 Frame captured! (${Math.round(blob.size / 1024)}KB) - Ready for VLM processing`;
                console.log('Frame captured and sent to server');
            } else {
                document.getElementById('cameraStatus').textContent = '❌ Capture failed - server error';
            }
        } catch (error) {
            console.error('Capture error:', error);
            document.getElementById('cameraStatus').textContent = `❌ Capture failed: ${error.message}`;
        }
    }, 'image/jpeg', 0.9);
}

// Toggle floating camera
let isFloating = true; // Start floating by default
let isLarge = false;

function toggleFloat() {
    const cameraSection = document.getElementById('cameraSection');
    const toggleBtn = document.getElementById('toggleFloatBtn');

    isFloating = !isFloating;

    if (isFloating) {
        cameraSection.classList.add('floating');
        toggleBtn.textContent = '📍 Dock Camera';
    } else {
        cameraSection.classList.remove('floating');
        toggleBtn.textContent = '📌 Float Camera';
    }

    console.log(`Camera ${isFloating ? 'floating' : 'docked'}`);
}

function toggleSize() {
    const cameraSection = document.getElementById('cameraSection');
    const resizeBtn = document.getElementById('resizeBtn');

    isLarge = !isLarge;

    if (isLarge) {
        cameraSection.classList.add('large');
        resizeBtn.textContent = '🔍 Shrink';
    } else {
        cameraSection.classList.remove('large');
        resizeBtn.textContent = '🔍 Enlarge';
    }

    console.log(`Camera size: ${isLarge ? 'large' : 'small'}`);
}

// Floating emoji system
const floatingEmojis = [];

class FloatingEmoji {
    constructor(emoji, x, y) {
        this.emoji = emoji;
        this.x = x;
        this.y = y;
        this.vy = -2.5; // Float upward faster
        this.vx = (Math.random() - 0.5) * 1.5; // More horizontal drift
        this.opacity = 1;
        this.lifetime = 0;
        this.maxLifetime = 100; // 1.6 seconds at 60fps
        this.size = 48; // Larger size
        this.scale = 1;
    }

    update() {
        this.lifetime++;
        this.y += this.vy;
        this.x += this.vx;

        // Grow slightly at start
        if (this.lifetime < 10) {
            this.scale = 0.5 + (this.lifetime / 10) * 0.5;
        }

        // Fade out in last 25 frames
        if (this.lifetime > this.maxLifetime - 25) {
            this.opacity = (this.maxLifetime - this.lifetime) / 25;
        }

        return this.lifetime < this.maxLifetime;
    }

    draw(ctx) {
        ctx.save();

        const displaySize = this.size * this.scale;

        // Draw white background circle for visibility
        ctx.globalAlpha = this.opacity * 0.9;
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x, this.y, displaySize * 0.6, 0, Math.PI * 2);
        ctx.fill();

        // Add shadow to background
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 8;

        // Draw emoji with full opacity (no transparency)
        ctx.globalAlpha = 1; // Always fully opaque!
        ctx.shadowColor = 'transparent'; // No shadow on emoji itself
        ctx.shadowBlur = 0;

        ctx.font = `${displaySize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.emoji, this.x, this.y);

        ctx.restore();
    }
}

function showEmojiForAction(action) {
    const emojiMap = {
        sit: '🪑',
        stand: '🧍',
        wave: '👋',
        shake: '🤝',
        dance: '💃',
        balance: '🤸'
    };

    const emoji = emojiMap[action] || '✨';
    spawnFloatingEmoji(emoji);
}

function showEmojiForMove(direction) {
    const emojiMap = {
        forward: '⬆️',
        backward: '⬇️',
        left: '⬅️',
        right: '➡️',
        stop: '🛑'
    };

    const emoji = emojiMap[direction] || '🚶';
    spawnFloatingEmoji(emoji);
}

function spawnFloatingEmoji(emoji) {
    // Spawn near robot position
    const x = dogState.position.x + (Math.random() - 0.5) * 40;
    const y = dogState.position.y - 30; // Above robot

    const floater = new FloatingEmoji(emoji, x, y);
    floatingEmojis.push(floater);

    console.log(`Spawned emoji: ${emoji}`);
}

function updateFloatingEmojis() {
    // Update all emojis and remove dead ones
    for (let i = floatingEmojis.length - 1; i >= 0; i--) {
        if (!floatingEmojis[i].update()) {
            floatingEmojis.splice(i, 1);
        }
    }
}

function drawFloatingEmojis(ctx) {
    floatingEmojis.forEach(emoji => emoji.draw(ctx));
}

// Auto-float camera on page load
window.addEventListener('DOMContentLoaded', () => {
    const cameraSection = document.getElementById('cameraSection');
    cameraSection.classList.add('floating');
    console.log('Camera auto-floated to top-right');
});

// Initialize
connect();
animate();
