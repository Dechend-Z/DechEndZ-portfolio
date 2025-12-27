const canvas = document.getElementById('gravityCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];

// Custom Cursor Elements
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

// Resize handling
function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Mouse tracking
const mouse = { x: -1000, y: -1000 };
let cursorX = 0, cursorY = 0; // For smooth trailing

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    // Immediate update for the dot
    cursorDot.style.left = `${mouse.x}px`;
    cursorDot.style.top = `${mouse.y}px`;
});

// Particle Class
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = Math.random() * 2 + 0.5; // Smaller, more refined
        this.color = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.1})`; // White/Grey with opacity
        this.vx = (Math.random() - 0.5) * 1; // Slower, calmer
        this.vy = (Math.random() - 0.5) * 1;
        this.originalX = x; // Remember origin for "return" effect if desired, or just float
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around instead of bounce for a space feel
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        // Mouse interaction (repel/wave)
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 150) {
            const angle = Math.atan2(dy, dx);
            const force = (150 - distance) / 150;
            const repelStrength = 2; // Subtle push

            this.vx += Math.cos(angle) * force * repelStrength;
            this.vy += Math.sin(angle) * force * repelStrength;
        }

        // Friction for more organic control
        this.vx *= 0.98;
        this.vy *= 0.98;

        // Add a tiny bit of random movement to keep them alive
        this.vx += (Math.random() - 0.5) * 0.05;
        this.vy += (Math.random() - 0.5) * 0.05;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

// Initialize particles
function init() {
    particles = [];
    const particleCount = (width * height) / 10000; // Density based on screen size
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(Math.random() * width, Math.random() * height));
    }
}

// Animation Loop
function animate() {
    ctx.clearRect(0, 0, width, height);

    // Update Particles
    particles.forEach(p => {
        p.update();
        p.draw();
    });

    // Update Custom Cursor Outline (Smooth Trailing)
    // Lerp (Linear Interpolation) formula: a + (b - a) * t
    const speed = 0.15; // Adjustment for delay smoothness
    cursorX += (mouse.x - cursorX) * speed;
    cursorY += (mouse.y - cursorY) * speed;

    cursorOutline.style.left = `${cursorX}px`;
    cursorOutline.style.top = `${cursorY}px`;

    // Connect particles near mouse (The "Wave" effect)
    // Optional: Draw lines between particles and mouse if close?
    // Let's keep it clean for now, just physics.

    requestAnimationFrame(animate);
}

// Start
init();
animate();

// Re-init on click just for fun (Ripple effect?)
window.addEventListener('mousedown', () => {
    cursorOutline.style.transform = `translate(-50%, -50%) scale(0.8)`;
    particles.forEach(p => {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
            const angle = Math.atan2(dy, dx);
            p.vx += Math.cos(angle) * 5;
            p.vy += Math.sin(angle) * 5;
        }
    });
});

window.addEventListener('mouseup', () => {
    cursorOutline.style.transform = `translate(-50%, -50%) scale(1)`;
});
