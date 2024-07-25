const dotsBg = document.getElementById('dotsBg');
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
dotsBg.appendChild(canvas);

let width, height, dots, mouse;

function init() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    dots = [];
    const rows = Math.floor(height / 20);
    const cols = Math.floor(width / 20);

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            dots.push({
                x: j * 20 + Math.random() * 10,
                y: i * 20 + Math.random() * 10,
                baseY: i * 20 + Math.random() * 10,
                size: 2 + Math.random(),
                speed: 0.05 + Math.random() * 0.05
            });
        }
    }

    mouse = { x: 0, y: 0, speed: 0, lastX: 0, lastY: 0 };
}

function updateMouseSpeed(event) {
    mouse.speed = Math.sqrt(
        Math.pow(event.clientX - mouse.lastX, 2) +
        Math.pow(event.clientY - mouse.lastY, 2)
    );
    mouse.lastX = event.clientX;
    mouse.lastY = event.clientY;
}

function animate() {
    ctx.clearRect(0, 0, width, height);

    dots.forEach(dot => {
        const distX = mouse.x - dot.x;
        const distY = mouse.y - dot.y;
        const dist = Math.sqrt(distX * distX + distY * distY);
        
        if (dist < 100) {
            const force = (100 - dist) / 100;
            const angle = Math.atan2(distY, distX);
            const displacement = force * mouse.speed * 0.05;
            
            dot.x -= Math.cos(angle) * displacement;
            dot.y -= Math.sin(angle) * displacement;
            
            // Add vertical displacement for wave effect
            dot.y += Math.sin(Date.now() * dot.speed) * 2;
        } else {
            // Subtle ambient movement
            dot.x += Math.sin(Date.now() * dot.speed * 0.5) * 0.5;
            dot.y = dot.baseY + Math.sin(Date.now() * dot.speed) * 2;
        }

        // Calculate brightness based on vertical position
        const brightness = Math.max(0, Math.min(255, 150 + (dot.baseY - dot.y) * 2));
        
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${brightness}, ${brightness}, ${brightness}, 0.8)`;
        ctx.fill();
    });

    requestAnimationFrame(animate);
}

init();
animate();

window.addEventListener('resize', init);
window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    updateMouseSpeed(event);
});