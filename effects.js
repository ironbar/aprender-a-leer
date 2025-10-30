// filepath: /mnt/data/other/code/aprender-a-leer/effects.js

// Effect Configuration
const EFFECT_PROBABILITY = 0.2; // 20% chance of showing an effect

// Canvas setup
let canvas, ctx;
let activeAnimation = null;
let activeInteractiveObjects = null; // Track balloons or bubbles for interaction
let isInteractive = false;

function initEffectsCanvas() {
    canvas = document.getElementById('effectsCanvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('mousemove', handleCanvasHover);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function clearActiveAnimation() {
    if (activeAnimation !== null) {
        cancelAnimationFrame(activeAnimation);
        activeAnimation = null;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    disableCanvasInteraction();
}

function enableCanvasInteraction() {
    isInteractive = true;
    canvas.style.pointerEvents = 'auto';
    canvas.style.cursor = 'pointer';
}

function disableCanvasInteraction() {
    isInteractive = false;
    activeInteractiveObjects = null;
    canvas.style.pointerEvents = 'none';
    canvas.style.cursor = 'default';
}

function handleCanvasClick(event) {
    if (!isInteractive || !activeInteractiveObjects) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Check balloons
    if (activeInteractiveObjects.type === 'balloons') {
        activeInteractiveObjects.data.forEach(balloon => {
            if (balloon.popped) return;
            
            const balloonX = balloon.x + Math.sin(balloon.swayOffset) * balloon.sway;
            const balloonY = balloon.y;
            const distance = Math.sqrt(Math.pow(x - balloonX, 2) + Math.pow(y - balloonY, 2));
            
            if (distance < balloon.size) {
                balloon.popped = true;
                balloon.popProgress = 0;
            }
        });
    }
    
    // Check bubbles
    if (activeInteractiveObjects.type === 'bubbles') {
        activeInteractiveObjects.data.forEach(bubble => {
            if (bubble.pop) return;
            
            const bubbleX = bubble.x + Math.sin(bubble.swayOffset) * bubble.sway;
            const bubbleY = bubble.y;
            const distance = Math.sqrt(Math.pow(x - bubbleX, 2) + Math.pow(y - bubbleY, 2));
            
            if (distance < bubble.size) {
                bubble.pop = true;
                bubble.popProgress = 0;
            }
        });
    }
}

function handleCanvasHover(event) {
    if (!isInteractive || !activeInteractiveObjects) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    let isOverObject = false;
    
    // Check if hovering over any balloon or bubble
    if (activeInteractiveObjects.type === 'balloons') {
        for (const balloon of activeInteractiveObjects.data) {
            if (balloon.popped) continue;
            const balloonX = balloon.x + Math.sin(balloon.swayOffset) * balloon.sway;
            const distance = Math.sqrt(Math.pow(x - balloonX, 2) + Math.pow(y - balloon.y, 2));
            if (distance < balloon.size) {
                isOverObject = true;
                break;
            }
        }
    } else if (activeInteractiveObjects.type === 'bubbles') {
        for (const bubble of activeInteractiveObjects.data) {
            if (bubble.pop) continue;
            const bubbleX = bubble.x + Math.sin(bubble.swayOffset) * bubble.sway;
            const distance = Math.sqrt(Math.pow(x - bubbleX, 2) + Math.pow(y - bubble.y, 2));
            if (distance < bubble.size) {
                isOverObject = true;
                break;
            }
        }
    }
    
    canvas.style.cursor = isOverObject ? 'pointer' : 'default';
}

// Trigger random effect with probability
function triggerRandomEffect() {
    if (Math.random() < EFFECT_PROBABILITY) {
        clearActiveAnimation(); // Clear any existing effect
        const effects = [
            createConfetti,
            createFireworks,
            createBalloons,
            createStars,
            createBubbles,
            createEmojiRain
        ];
        const randomEffect = effects[Math.floor(Math.random() * effects.length)];
        randomEffect();
    }
}

// Effect 1: Confetti
function createConfetti() {
    const particles = [];
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#fd79a8', '#fdcb6e'];
    const maxDuration = 2000; // 2 seconds max
    const startTime = Date.now();
    
    for (let i = 0; i < 100; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: -20,
            size: Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            speedY: Math.random() * 3 + 2,
            speedX: (Math.random() - 0.5) * 4,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10
        });
    }
    
    animateConfetti(particles, startTime, maxDuration);
}

function animateConfetti(particles, startTime, maxDuration) {
    if (Date.now() - startTime > maxDuration) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        activeAnimation = null;
        return;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach((p, index) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
        
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotationSpeed;
        p.speedY += 0.1; // gravity
        
        if (p.y > canvas.height) {
            particles.splice(index, 1);
        }
    });
    
    if (particles.length > 0) {
        activeAnimation = requestAnimationFrame(() => animateConfetti(particles, startTime, maxDuration));
    } else {
        activeAnimation = null;
    }
}

// Effect 2: Fireworks
function createFireworks() {
    const explosions = [];
    
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height * 0.5;
            explosions.push(createExplosion(x, y));
        }, i * 400);
    }
    
    animateFireworks(explosions);
}

function createExplosion(x, y) {
    const particles = [];
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#fd79a8'];
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const speed = Math.random() * 4 + 2;
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 100,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }
    
    return particles;
}

function animateFireworks(explosions) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let allDead = true;
    
    explosions.forEach(particles => {
        particles.forEach((p, index) => {
            if (p.life > 0) {
                allDead = false;
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life / 100;
                ctx.fillRect(p.x, p.y, 3, 3);
                
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.1; // gravity
                p.life -= 2;
            }
        });
    });
    
    ctx.globalAlpha = 1;
    
    if (!allDead) {
        activeAnimation = requestAnimationFrame(() => animateFireworks(explosions));
    } else {
        activeAnimation = null;
    }
}

// Effect 3: Balloons
function createBalloons() {
    const balloons = [];
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#fd79a8', '#fdcb6e'];
    const maxDuration = 4000; // 4 seconds max (doubled)
    const startTime = Date.now();
    
    for (let i = 0; i < 15; i++) {
        balloons.push({
            x: Math.random() * canvas.width,
            y: canvas.height + 50,
            size: Math.random() * 60 + 80, // Doubled size (was 30 + 40)
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: Math.random() * 3 + 2, // Increased speed
            sway: Math.random() * 2,
            swayOffset: Math.random() * Math.PI * 2,
            popped: false,
            popProgress: 0
        });
    }
    
    activeInteractiveObjects = { type: 'balloons', data: balloons };
    enableCanvasInteraction();
    animateBalloons(balloons, startTime, maxDuration);
}

function animateBalloons(balloons, startTime, maxDuration) {
    if (Date.now() - startTime > maxDuration) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        activeAnimation = null;
        disableCanvasInteraction();
        return;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    balloons.forEach((b, index) => {
        if (!b.popped) {
            // Balloon body
            ctx.fillStyle = b.color;
            ctx.beginPath();
            ctx.ellipse(b.x + Math.sin(b.swayOffset) * b.sway, b.y, b.size * 0.4, b.size * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Balloon tie
            ctx.strokeStyle = b.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(b.x + Math.sin(b.swayOffset) * b.sway, b.y + b.size * 0.5);
            ctx.lineTo(b.x + Math.sin(b.swayOffset + 0.5) * b.sway, b.y + b.size * 0.7);
            ctx.stroke();
            
            // Highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.beginPath();
            ctx.ellipse(b.x + Math.sin(b.swayOffset) * b.sway - b.size * 0.1, b.y - b.size * 0.15, b.size * 0.15, b.size * 0.2, 0, 0, Math.PI * 2);
            ctx.fill();
            
            b.y -= b.speed;
            b.swayOffset += 0.05;
            
            if (b.y < -b.size) {
                balloons.splice(index, 1);
            }
        } else {
            // Popping animation
            b.popProgress += 0.15;
            const alpha = 1 - b.popProgress;
            const expandSize = b.size * (1 + b.popProgress * 0.5);
            
            // Draw explosion lines
            ctx.strokeStyle = `rgba(${hexToRgb(b.color)}, ${alpha})`;
            ctx.lineWidth = 3;
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI * 2 * i) / 8;
                const startX = b.x + Math.cos(angle) * b.size * 0.3;
                const startY = b.y + Math.sin(angle) * b.size * 0.3;
                const endX = b.x + Math.cos(angle) * expandSize;
                const endY = b.y + Math.sin(angle) * expandSize;
                
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                ctx.stroke();
            }
            
            if (b.popProgress >= 1) {
                balloons.splice(index, 1);
            }
        }
    });
    
    if (balloons.length > 0) {
        activeAnimation = requestAnimationFrame(() => animateBalloons(balloons, startTime, maxDuration));
    } else {
        activeAnimation = null;
        disableCanvasInteraction();
    }
}

// Helper function to convert hex color to RGB for alpha
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
        `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
        '0, 0, 0';
}

// Effect 4: Stars
function createStars() {
    const stars = [];
    
    for (let i = 0; i < 30; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 20 + 10,
            life: 100,
            growthPhase: true,
            rotation: Math.random() * 360
        });
    }
    
    animateStars(stars);
}

function animateStars(stars) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    stars.forEach((s, index) => {
        if (s.life > 0) {
            ctx.save();
            ctx.translate(s.x, s.y);
            ctx.rotate(s.rotation * Math.PI / 180);
            
            const scale = s.growthPhase ? (100 - s.life) / 50 : s.life / 50;
            const alpha = s.life / 100;
            
            ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
                const x = Math.cos(angle) * s.size * scale;
                const y = Math.sin(angle) * s.size * scale;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
                
                const innerAngle = angle + Math.PI / 5;
                const innerX = Math.cos(innerAngle) * s.size * scale * 0.4;
                const innerY = Math.sin(innerAngle) * s.size * scale * 0.4;
                ctx.lineTo(innerX, innerY);
            }
            ctx.closePath();
            ctx.fill();
            
            // Glow
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
            ctx.lineWidth = 2;
            ctx.stroke();
            
            ctx.restore();
            
            if (s.growthPhase && s.life < 50) {
                s.growthPhase = false;
            }
            
            s.life -= 2;
            s.rotation += 2;
        } else {
            stars.splice(index, 1);
        }
    });
    
    if (stars.length > 0) {
        activeAnimation = requestAnimationFrame(() => animateStars(stars));
    } else {
        activeAnimation = null;
    }
}

// Effect 5: Bubbles
function createBubbles() {
    const bubbles = [];
    const maxDuration = 4000; // 4 seconds max (doubled)
    const startTime = Date.now();
    
    for (let i = 0; i < 25; i++) {
        bubbles.push({
            x: Math.random() * canvas.width,
            y: canvas.height + 20,
            size: Math.random() * 40 + 20,
            speed: Math.random() * 3 + 2, // Increased speed
            sway: Math.random() * 3,
            swayOffset: Math.random() * Math.PI * 2,
            pop: false,
            popProgress: 0
        });
    }
    
    activeInteractiveObjects = { type: 'bubbles', data: bubbles };
    enableCanvasInteraction();
    animateBubbles(bubbles, startTime, maxDuration);
}

function animateBubbles(bubbles, startTime, maxDuration) {
    if (Date.now() - startTime > maxDuration) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        activeAnimation = null;
        disableCanvasInteraction();
        return;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    bubbles.forEach((b, index) => {
        if (!b.pop) {
            // Bubble
            const gradient = ctx.createRadialGradient(
                b.x - b.size * 0.3, b.y - b.size * 0.3, 0,
                b.x, b.y, b.size
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            gradient.addColorStop(0.5, 'rgba(135, 206, 250, 0.3)');
            gradient.addColorStop(1, 'rgba(65, 105, 225, 0.4)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(b.x + Math.sin(b.swayOffset) * b.sway, b.y, b.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.arc(b.x - b.size * 0.3 + Math.sin(b.swayOffset) * b.sway, b.y - b.size * 0.3, b.size * 0.2, 0, Math.PI * 2);
            ctx.fill();
            
            b.y -= b.speed;
            b.swayOffset += 0.03;
            
            // Chance to pop (reduced since user can click)
            if (Math.random() < 0.01 || b.y < -b.size) {
                b.pop = true;
            }
        } else {
            // Popping animation
            b.popProgress += 0.1;
            const alpha = 1 - b.popProgress;
            const expandSize = b.size * (1 + b.popProgress);
            
            ctx.strokeStyle = `rgba(135, 206, 250, ${alpha})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(b.x, b.y, expandSize, 0, Math.PI * 2);
            ctx.stroke();
            
            if (b.popProgress >= 1) {
                bubbles.splice(index, 1);
            }
        }
    });
    
    if (bubbles.length > 0) {
        activeAnimation = requestAnimationFrame(() => animateBubbles(bubbles, startTime, maxDuration));
    } else {
        activeAnimation = null;
        disableCanvasInteraction();
    }
}

// Effect 6: Emoji Rain
function createEmojiRain() {
    const emojis = ['😊', '🎉', '⭐', '💖', '🌈', '✨', '🎈', '🌟', '💫', '🎊'];
    const particles = [];
    const maxDuration = 2000; // 2 seconds max
    const startTime = Date.now();
    
    for (let i = 0; i < 30; i++) {
        particles.push({
            emoji: emojis[Math.floor(Math.random() * emojis.length)],
            x: Math.random() * canvas.width,
            y: -50,
            size: Math.random() * 30 + 30,
            speed: Math.random() * 4 + 3, // Increased speed
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 5
        });
    }
    
    animateEmojiRain(particles, startTime, maxDuration);
}

function animateEmojiRain(particles, startTime, maxDuration) {
    if (Date.now() - startTime > maxDuration) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        activeAnimation = null;
        return;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach((p, index) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation * Math.PI / 180);
        ctx.font = `${p.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.emoji, 0, 0);
        ctx.restore();
        
        p.y += p.speed;
        p.rotation += p.rotationSpeed;
        
        if (p.y > canvas.height + 50) {
            particles.splice(index, 1);
        }
    });
    
    if (particles.length > 0) {
        activeAnimation = requestAnimationFrame(() => animateEmojiRain(particles, startTime, maxDuration));
    } else {
        activeAnimation = null;
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEffectsCanvas);
} else {
    initEffectsCanvas();
}
