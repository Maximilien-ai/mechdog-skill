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

    // Clear and redraw
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid();
    drawTrail();
    drawDog();

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
    console.log('Mouse down at:', pos);

    if (isPointInDog(pos.x, pos.y)) {
        console.log('Dragging started!');
        isDragging = true;
        dragOffset.x = pos.x - dogState.position.x;
        dragOffset.y = pos.y - dogState.position.y;
        canvas.style.cursor = 'grabbing';
    }
});

canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePos(canvas, e);

    if (isDragging) {
        // Update both current and target position for immediate response
        const newX = pos.x - dragOffset.x;
        const newY = pos.y - dragOffset.y;

        // Constrain to canvas
        const constrainedX = Math.max(50, Math.min(canvas.width - 50, newX));
        const constrainedY = Math.max(50, Math.min(canvas.height - 50, newY));

        dogState.position.x = constrainedX;
        dogState.position.y = constrainedY;
        targetPosition.x = constrainedX;
        targetPosition.y = constrainedY;

        // Update status display
        updateStatusDisplay();
    } else {
        // Change cursor when hovering over dog
        canvas.style.cursor = isPointInDog(pos.x, pos.y) ? 'grab' : 'default';
    }
});

canvas.addEventListener('mouseup', () => {
    if (isDragging) {
        isDragging = false;
        canvas.style.cursor = 'grab';

        // Send position update to server
        sendPositionUpdate();
    }
});

canvas.addEventListener('mouseleave', () => {
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

// Initialize
connect();
animate();
