import * as THREE from "three";

// Create scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create particle system
const particleCount = 10000;
const particles = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 10;
  colors[i] = 1; // White color
}

particles.setAttribute("position", new THREE.BufferAttribute(positions, 3));
particles.setAttribute("color", new THREE.BufferAttribute(colors, 3));

// Load logo texture
const textureLoader = new THREE.TextureLoader();
const logoTexture = textureLoader.load("path/to/your/logo.png", () => {
  // Once texture is loaded, update particle positions
  updateParticlePositions();
});

// Create particle material
const particleMaterial = new THREE.PointsMaterial({
  size: 0.05,
  vertexColors: true,
  transparent: true,
  opacity: 0.32,
  map: logoTexture,
});

const particleSystem = new THREE.Points(particles, particleMaterial);
scene.add(particleSystem);

camera.position.z = 5;

// Mouse interaction
const mouse = new THREE.Vector2();

function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

window.addEventListener("mousemove", onMouseMove, false);

// Update particle positions based on logo
function updateParticlePositions() {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = logoTexture.image.width;
  canvas.height = logoTexture.image.height;
  context.drawImage(logoTexture.image, 0, 0);
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

  const positions = particles.attributes.position.array;

  for (let i = 0; i < particleCount; i++) {
    const x = Math.floor(Math.random() * canvas.width);
    const y = Math.floor(Math.random() * canvas.height);
    const alpha = imageData.data[(y * canvas.width + x) * 4 + 3];

    if (alpha > 0) {
      positions[i * 3] = (x / canvas.width - 0.5) * 10;
      positions[i * 3 + 1] = (y / canvas.height - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }
  }

  particles.attributes.position.needsUpdate = true;
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  const time = Date.now() * 0.001;
  const positions = particles.attributes.position.array;

  for (let i = 0; i < particleCount; i++) {
    const ix = i * 3;
    const iy = i * 3 + 1;
    const iz = i * 3 + 2;

    // Add wavy motion
    positions[iy] += Math.sin(time + positions[ix]) * 0.01;

    // Look towards cursor
    positions[ix] += (mouse.x - positions[ix]) * 0.01;
    positions[iy] += (-mouse.y - positions[iy]) * 0.01;
  }

  particles.attributes.position.needsUpdate = true;

  renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener("resize", onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
