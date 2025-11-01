// filepath: /mnt/data/other/code/aprender-a-leer/effects.js

// Effect Configuration
let EFFECT_INTERVAL = 4; // Show an effect every 4 trigger calls
let INTERACTIVE_COOLDOWN = 1000; // 1.5 second cooldown after interactive effects
let EFFECT_DURATION = 4000; // Default effect animation duration in ms
let effectsEnabled = true;

let effectTriggerCount = 0;

// Canvas setup
let canvas, ctx;
let activeAnimation = null;
let activeInteractiveObjects = null; // Track balloons or bubbles for interaction
let isInteractive = false;

const bodyElement = document.body;
const EFFECT_STATE = {
    IDLE: 'idle',
    ACTIVE: 'active',
    COOLDOWN: 'cooldown'
};
let currentEffectState = EFFECT_STATE.IDLE;
let currentEffectName = null;
let currentEffectStartTime = null;
let hasLoggedCooldownEnd = false;

function blurActiveElement() {
    const activeElement = document.activeElement;
    if (activeElement && typeof activeElement.blur === 'function') {
        activeElement.blur();
    }
}

function setEffectsEnabled(enabled) {
    effectsEnabled = Boolean(enabled);
    effectTriggerCount = 0;
    if (!effectsEnabled) {
        clearActiveAnimation();
        resetEffectBackground();
    }
}

function setEffectInterval(interval) {
    const value = Math.max(1, Math.round(interval));
    EFFECT_INTERVAL = value;
    effectTriggerCount = 0;
}

function setEffectDuration(duration) {
    const value = Math.max(500, Math.round(duration));
    EFFECT_DURATION = value;
}

function setEffectCooldown(cooldown) {
    const value = Math.max(0, Math.round(cooldown));
    INTERACTIVE_COOLDOWN = value;
}

function getEffectSettings() {
    return {
        enabled: effectsEnabled,
        interval: EFFECT_INTERVAL,
        duration: EFFECT_DURATION,
        cooldown: INTERACTIVE_COOLDOWN
    };
}

function isEffectInCooldown() {
    return currentEffectState === EFFECT_STATE.COOLDOWN;
}

function logEffectEvent(message) {
    console.log(`[Effects] ${message}`);
}

function logEffectStart(effectName) {
    currentEffectName = effectName;
    currentEffectStartTime = Date.now();
    hasLoggedCooldownEnd = false;
    logEffectEvent(`Effect "${effectName}" started.`);
}

function logEffectAnimationEnd(elapsed) {
    if (!currentEffectName) return;
    const duration = elapsed;
    logEffectEvent(`Effect "${currentEffectName}" animation ended after ${duration}ms.`);
}

function logEffectCooldownStart() {
    if (!currentEffectName) return;
    logEffectEvent(`Cooldown started for effect "${currentEffectName}".`);
}

function logEffectCooldownEnd() {
    if (!currentEffectName || hasLoggedCooldownEnd) return;
    const totalElapsed = currentEffectStartTime ? Date.now() - currentEffectStartTime : null;
    if (totalElapsed !== null) {
        logEffectEvent(`Cooldown finished for effect "${currentEffectName}" after ${totalElapsed}ms total.`);
    } else {
        logEffectEvent(`Cooldown finished for effect "${currentEffectName}".`);
    }
    hasLoggedCooldownEnd = true;
    currentEffectName = null;
    currentEffectStartTime = null;
}

function activateEffectBackground() {
    if (currentEffectState === EFFECT_STATE.ACTIVE) return;
    currentEffectState = EFFECT_STATE.ACTIVE;
    bodyElement.classList.add('effects-active');
    bodyElement.classList.remove('effects-cooldown');
    blurActiveElement();
}

function startEffectCooldownPhase() {
    if (currentEffectState !== EFFECT_STATE.ACTIVE) return;
    currentEffectState = EFFECT_STATE.COOLDOWN;
    logEffectCooldownStart();
    disableCanvasInteraction();
    bodyElement.classList.remove('effects-active');
    bodyElement.classList.add('effects-cooldown');
    blurActiveElement();
}

function resetEffectBackground() {
    if (currentEffectState === EFFECT_STATE.IDLE) {
        bodyElement.classList.remove('effects-active', 'effects-cooldown');
        return;
    }
    currentEffectState = EFFECT_STATE.IDLE;
    bodyElement.classList.remove('effects-active', 'effects-cooldown');
}

function updateEffectPhase(elapsed, maxDuration) {
    if (currentEffectState === EFFECT_STATE.ACTIVE && elapsed > maxDuration) {
        logEffectAnimationEnd(elapsed);
        startEffectCooldownPhase();
    }
}

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
    if (currentEffectName && !hasLoggedCooldownEnd) {
        logEffectEvent(`Effect "${currentEffectName}" was cleared before completing its cooldown phase.`);
        hasLoggedCooldownEnd = true;
        currentEffectName = null;
        currentEffectStartTime = null;
    }
    disableCanvasInteraction();
    resetEffectBackground();
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

    // Check confetti burst creation
    if (activeInteractiveObjects.type === 'confetti') {
        const { particles, colors } = activeInteractiveObjects.data;
        for (let i = 0; i < 25; i++) {
            particles.push({
                x: x + (Math.random() - 0.5) * 40,
                y: y + (Math.random() - 0.5) * 40,
                size: Math.random() * 8 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                speedY: -Math.random() * 4 - 2,
                speedX: (Math.random() - 0.5) * 6,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 12
            });
        }
    }

    // Add fireworks explosion at click position
    if (activeInteractiveObjects.type === 'fireworks') {
        const data = activeInteractiveObjects.data;
        data.explosions.push(createExplosion(x, y));
    }

    // Stars react to nearby clicks or spawn a new one
    if (activeInteractiveObjects.type === 'stars') {
        const { stars } = activeInteractiveObjects.data;
        let interacted = false;

        stars.forEach(star => {
            const distance = Math.sqrt(Math.pow(x - star.x, 2) + Math.pow(y - star.y, 2));
            if (distance < star.size) {
                interacted = true;
                star.life = 100;
                star.growthPhase = true;
                star.twinkle = 1;
                star.rotationSpeed = 6;
            }
        });

        if (!interacted) {
            stars.push(createStarAtPosition(x, y));
        }
    }

    // Emojis bounce when clicked, otherwise spawn a new emoji
    if (activeInteractiveObjects.type === 'emoji') {
        const data = activeInteractiveObjects.data;
        let bounced = false;

        data.particles.forEach(particle => {
            const distance = Math.sqrt(Math.pow(x - particle.x, 2) + Math.pow(y - particle.y, 2));
            if (distance < particle.size * 0.6) {
                bounced = true;
                particle.speed = -Math.abs(particle.speed) - 2;
                particle.rotationSpeed = (Math.random() - 0.5) * 12;
                particle.emoji = data.emojis[Math.floor(Math.random() * data.emojis.length)];
                particle.bounces = (particle.bounces || 0) + 1;
            }
        });

        if (!bounced) {
            data.particles.push(createEmojiAtPosition(x, y, data.emojis));
        }
    }
}

function handleCanvasHover(event) {
    if (!isInteractive || !activeInteractiveObjects) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    let isOverObject = false;

    // Check if hovering over any interactive object
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
    } else if (activeInteractiveObjects.type === 'stars') {
        for (const star of activeInteractiveObjects.data.stars) {
            const distance = Math.sqrt(Math.pow(x - star.x, 2) + Math.pow(y - star.y, 2));
            if (distance < star.size) {
                isOverObject = true;
                break;
            }
        }
    } else if (activeInteractiveObjects.type === 'emoji') {
        for (const emoji of activeInteractiveObjects.data.particles) {
            const distance = Math.sqrt(Math.pow(x - emoji.x, 2) + Math.pow(y - emoji.y, 2));
            if (distance < emoji.size * 0.6) {
                isOverObject = true;
                break;
            }
        }
    } else if (activeInteractiveObjects.type === 'confetti' || activeInteractiveObjects.type === 'fireworks') {
        isOverObject = true; // clicking anywhere triggers a reaction
    }

    canvas.style.cursor = isOverObject ? 'pointer' : 'default';
}

// Trigger an effect at a deterministic interval
function triggerRandomEffect() {
    if (!effectsEnabled) {
        return;
    }

    effectTriggerCount = (effectTriggerCount + 1) % EFFECT_INTERVAL;

    if (effectTriggerCount !== 0) {
        return;
    }

    clearActiveAnimation(); // Clear any existing effect
    activateEffectBackground();
    const effects = [
        { name: 'Confetti', create: createConfetti },
        { name: 'Fireworks', create: createFireworks },
        { name: 'Balloons', create: createBalloons },
        { name: 'Stars', create: createStars },
        { name: 'Bubbles', create: createBubbles },
        { name: 'Emoji Rain', create: createEmojiRain }
    ];
    const selectedEffect = effects[Math.floor(Math.random() * effects.length)];
    logEffectStart(selectedEffect.name);
    selectedEffect.create();
}

// Effect 1: Confetti
function createConfetti() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#fd79a8', '#fdcb6e'];
    const data = {
        particles: [],
        colors,
        startTime: Date.now(),
        maxDuration: EFFECT_DURATION
    };

    for (let i = 0; i < 120; i++) {
        data.particles.push({
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

    activeInteractiveObjects = { type: 'confetti', data };
    enableCanvasInteraction();
    animateConfetti(data);
}

function animateConfetti(data) {
    const { particles, startTime, maxDuration } = data;
    const elapsed = Date.now() - startTime;

    updateEffectPhase(elapsed, maxDuration);

    if (elapsed > maxDuration + INTERACTIVE_COOLDOWN) {
        logEffectCooldownEnd();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        activeAnimation = null;
        disableCanvasInteraction();
        resetEffectBackground();
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (elapsed <= maxDuration) {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation * Math.PI / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            ctx.restore();

            p.y += p.speedY;
            p.x += p.speedX;
            p.rotation += p.rotationSpeed;
            p.speedY += 0.1;

            if (p.y > canvas.height + 20) {
                if (elapsed <= maxDuration) {
                    p.y = -20;
                    p.x = Math.random() * canvas.width;
                    p.speedY = Math.random() * 3 + 2;
                    p.speedX = (Math.random() - 0.5) * 4;
                    p.rotation = Math.random() * 360;
                } else {
                    particles.splice(i, 1);
                }
            }
        }
    }

    activeAnimation = requestAnimationFrame(() => animateConfetti(data));
}

// Effect 2: Fireworks
function createFireworks(fireworkCount = 40) {
    const totalFireworks = Math.max(1, Math.floor(fireworkCount));
    const data = {
        explosions: [],
        startTime: Date.now(),
        maxDuration: EFFECT_DURATION
    };

    const interval = Math.min(400, data.maxDuration / Math.max(totalFireworks, 1));

    for (let i = 0; i < totalFireworks; i++) {
        setTimeout(() => {
            if (!activeInteractiveObjects || activeInteractiveObjects.type !== 'fireworks' || activeInteractiveObjects.data !== data) {
                return;
            }
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height * 0.5;
            data.explosions.push(createExplosion(x, y));
        }, i * interval);
    }

    activeInteractiveObjects = { type: 'fireworks', data };
    enableCanvasInteraction();
    animateFireworks(data);
}

function createExplosion(x, y) {
    const particles = [];
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#fd79a8'];
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const speed = Math.random() * 4 + 2;
        particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 100,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }

    return particles;
}

function animateFireworks(data) {
    const { explosions, startTime, maxDuration } = data;
    const elapsed = Date.now() - startTime;

    updateEffectPhase(elapsed, maxDuration);

    if (elapsed > maxDuration + INTERACTIVE_COOLDOWN) {
        logEffectCooldownEnd();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        activeAnimation = null;
        disableCanvasInteraction();
        resetEffectBackground();
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (elapsed <= maxDuration) {
        explosions.forEach(particles => {
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                if (p.life > 0) {
                    ctx.fillStyle = p.color;
                    ctx.globalAlpha = p.life / 100;
                    ctx.fillRect(p.x, p.y, 3, 3);

                    p.x += p.vx;
                    p.y += p.vy;
                    p.vy += 0.08;
                    p.life -= 2;
                } else {
                    particles.splice(i, 1);
                }
            }
        });

        for (let i = explosions.length - 1; i >= 0; i--) {
            if (explosions[i].length === 0 && elapsed > maxDuration) {
                explosions.splice(i, 1);
            }
        }
    }

    ctx.globalAlpha = 1;

    activeAnimation = requestAnimationFrame(() => animateFireworks(data));
}

// Effect 3: Balloons
function createBalloons() {
    const balloons = [];
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#fd79a8', '#fdcb6e'];
    const maxDuration = EFFECT_DURATION;
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
    const elapsed = Date.now() - startTime;

    updateEffectPhase(elapsed, maxDuration);

    // Check if we're past the total duration (animation + cooldown)
    if (elapsed > maxDuration + INTERACTIVE_COOLDOWN) {
        logEffectCooldownEnd();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        activeAnimation = null;
        disableCanvasInteraction();
        resetEffectBackground();
        return;
    }
    
    // Clear canvas regardless of phase
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Only render if within animation duration (not in cooldown)
    if (elapsed <= maxDuration) {
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
    }
    // During cooldown phase: canvas stays clear
    
    activeAnimation = requestAnimationFrame(() => animateBalloons(balloons, startTime, maxDuration));
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
    const data = {
        stars: [],
        startTime: Date.now(),
        maxDuration: EFFECT_DURATION
    };

    for (let i = 0; i < 30; i++) {
        data.stars.push(createStarAtPosition(Math.random() * canvas.width, Math.random() * canvas.height));
    }

    activeInteractiveObjects = { type: 'stars', data };
    enableCanvasInteraction();
    animateStars(data);
}

function createStarAtPosition(x, y) {
    return {
        x,
        y,
        size: Math.random() * 20 + 10,
        life: 100,
        growthPhase: true,
        rotation: Math.random() * 360,
        rotationSpeed: 2,
        twinkle: 0,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6
    };
}

function animateStars(data) {
    const { stars, startTime, maxDuration } = data;
    const elapsed = Date.now() - startTime;

    updateEffectPhase(elapsed, maxDuration);

    if (elapsed > maxDuration + INTERACTIVE_COOLDOWN) {
        logEffectCooldownEnd();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        activeAnimation = null;
        disableCanvasInteraction();
        resetEffectBackground();
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (elapsed <= maxDuration) {
        for (let i = stars.length - 1; i >= 0; i--) {
            const s = stars[i];
            if (s.life > 0) {
                ctx.save();
                ctx.translate(s.x, s.y);
                ctx.rotate(s.rotation * Math.PI / 180);

                const baseScale = s.growthPhase ? (100 - s.life) / 50 : s.life / 50;
                const twinkleScale = 1 + s.twinkle * 0.3;
                const scale = Math.max(0, baseScale) * twinkleScale;
                const alpha = Math.min(1, (s.life / 100) + s.twinkle * 0.3);

                ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
                ctx.beginPath();
                for (let j = 0; j < 5; j++) {
                    const angle = (Math.PI * 2 * j) / 5 - Math.PI / 2;
                    const pointX = Math.cos(angle) * s.size * scale;
                    const pointY = Math.sin(angle) * s.size * scale;
                    if (j === 0) ctx.moveTo(pointX, pointY);
                    else ctx.lineTo(pointX, pointY);

                    const innerAngle = angle + Math.PI / 5;
                    const innerX = Math.cos(innerAngle) * s.size * scale * 0.4;
                    const innerY = Math.sin(innerAngle) * s.size * scale * 0.4;
                    ctx.lineTo(innerX, innerY);
                }
                ctx.closePath();
                ctx.fill();

                ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.restore();

                if (s.growthPhase && s.life < 50) {
                    s.growthPhase = false;
                }

                s.life -= 1.5;
                s.rotation += s.rotationSpeed;
                s.x += s.vx;
                s.y += s.vy;
                s.twinkle = Math.max(0, s.twinkle - 0.02);

                if (s.x < -50 || s.x > canvas.width + 50 || s.y < -50 || s.y > canvas.height + 50) {
                    stars.splice(i, 1);
                }
            } else {
                stars.splice(i, 1);
            }
        }
    }

    activeAnimation = requestAnimationFrame(() => animateStars(data));
}

// Effect 5: Bubbles
function createBubbles() {
    const bubbles = [];
    const maxDuration = EFFECT_DURATION;
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
    const elapsed = Date.now() - startTime;

    updateEffectPhase(elapsed, maxDuration);

    // Check if we're past the total duration (animation + cooldown)
    if (elapsed > maxDuration + INTERACTIVE_COOLDOWN) {
        logEffectCooldownEnd();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        activeAnimation = null;
        disableCanvasInteraction();
        resetEffectBackground();
        return;
    }
    
    // Clear canvas regardless of phase
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Only render if within animation duration (not in cooldown)
    if (elapsed <= maxDuration) {
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
    }
    // During cooldown phase: canvas stays clear
    
    activeAnimation = requestAnimationFrame(() => animateBubbles(bubbles, startTime, maxDuration));
}

// Effect 6: Emoji Rain
function createEmojiRain() {
    const emojis = ['😊', '🎉', '⭐', '💖', '🌈', '✨', '🎈', '🌟', '💫', '🎊'];
    const data = {
        particles: [],
        emojis,
        startTime: Date.now(),
        maxDuration: EFFECT_DURATION
    };

    for (let i = 0; i < 35; i++) {
        data.particles.push(createEmojiAtPosition(Math.random() * canvas.width, -50, emojis));
    }

    activeInteractiveObjects = { type: 'emoji', data };
    enableCanvasInteraction();
    animateEmojiRain(data);
}

function createEmojiAtPosition(x, y, emojis) {
    const isFromTop = y <= -10;
    return {
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        x,
        y,
        size: Math.random() * 30 + 30,
        speed: isFromTop ? Math.random() * 3 + 2 : -Math.random() * 4 - 2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 6,
        bounces: 0
    };
}

function animateEmojiRain(data) {
    const { particles, startTime, maxDuration, emojis } = data;
    const elapsed = Date.now() - startTime;

    updateEffectPhase(elapsed, maxDuration);

    if (elapsed > maxDuration + INTERACTIVE_COOLDOWN) {
        logEffectCooldownEnd();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        activeAnimation = null;
        disableCanvasInteraction();
        resetEffectBackground();
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (elapsed <= maxDuration) {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
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
            p.speed = Math.min(p.speed + 0.08, 8);

            if (p.speed < -10) {
                p.speed = -10;
            }

            if (p.y > canvas.height + 60) {
                if (elapsed <= maxDuration) {
                    p.y = -60;
                    p.x = Math.random() * canvas.width;
                    p.speed = Math.random() * 3 + 2;
                    p.rotationSpeed = (Math.random() - 0.5) * 6;
                    p.emoji = emojis[Math.floor(Math.random() * emojis.length)];
                } else {
                    particles.splice(i, 1);
                }
            } else if (p.y < -80 && p.speed < 0) {
                p.speed = Math.abs(p.speed) * 0.6;
            }
        }
    }

    activeAnimation = requestAnimationFrame(() => animateEmojiRain(data));
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEffectsCanvas);
} else {
    initEffectsCanvas();
}
