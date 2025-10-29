// filepath: /mnt/data/other/code/aprender-a-leer/effects.js

// Effect Configuration
const EFFECT_PROBABILITY = 0.20; // 20% chance of showing an effect

// Canvas setup
let canvas, ctx;

function initEffectsCanvas() {
    canvas = document.getElementById('effectsCanvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Trigger random effect with probability
function triggerRandomEffect() {
    if (Math.random() < EFFECT_PROBABILITY) {
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
    
    animateConfetti(particles);
}

function animateConfetti(particles) {
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
        requestAnimationFrame(() => animateConfetti(particles));
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
        requestAnimationFrame(() => animateFireworks(explosions));
    }
}

// Effect 3: Balloons
function createBalloons() {
    const balloons = [];
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#fd79a8', '#fdcb6e'];
    
    for (let i = 0; i < 15; i++) {
        balloons.push({
            x: Math.random() * canvas.width,
            y: canvas.height + 50,
            size: Math.random() * 30 + 40,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: Math.random() * 2 + 1,
            sway: Math.random() * 2,
            swayOffset: Math.random() * Math.PI * 2
        });
    }
    
    animateBalloons(balloons);
}

function animateBalloons(balloons) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    balloons.forEach((b, index) => {
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
    });
    
    if (balloons.length > 0) {
        requestAnimationFrame(() => animateBalloons(balloons));
    }
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
        requestAnimationFrame(() => animateStars(stars));
    }
}

// Effect 5: Bubbles
function createBubbles() {
    const bubbles = [];
    
    for (let i = 0; i < 25; i++) {
        bubbles.push({
            x: Math.random() * canvas.width,
            y: canvas.height + 20,
            size: Math.random() * 40 + 20,
            speed: Math.random() * 2 + 1,
            sway: Math.random() * 3,
            swayOffset: Math.random() * Math.PI * 2,
            pop: false,
            popProgress: 0
        });
    }
    
    animateBubbles(bubbles);
}

function animateBubbles(bubbles) {
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
            
            // Chance to pop
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
        requestAnimationFrame(() => animateBubbles(bubbles));
    }
}

// Effect 6: Emoji Rain
function createEmojiRain() {
    const emojis = ['😊', '🎉', '⭐', '💖', '🌈', '✨', '🎈', '🌟', '💫', '🎊'];
    const particles = [];
    
    for (let i = 0; i < 30; i++) {
        particles.push({
            emoji: emojis[Math.floor(Math.random() * emojis.length)],
            x: Math.random() * canvas.width,
            y: -50,
            size: Math.random() * 30 + 30,
            speed: Math.random() * 3 + 2,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 5
        });
    }
    
    animateEmojiRain(particles);
}

function animateEmojiRain(particles) {
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
        requestAnimationFrame(() => animateEmojiRain(particles));
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEffectsCanvas);
} else {
    initEffectsCanvas();
}
