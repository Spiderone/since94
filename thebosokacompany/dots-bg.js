console.log("dots-bg-js loaded");
import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.166.1/three.module.min.js";

window.onload = function () {
  const dotsBg = document.getElementById("dotsBg");
  let scene, camera, renderer, particles;
  let mouseX = 0,
    mouseY = 0;
  let lastMouseX = 0,
    lastMouseY = 0;
  let targetMouseX = 0,
    targetMouseY = 0;
  let animationStartTime;

  function init() {
    scene = new THREE.Scene();

    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 2;
    camera = new THREE.OrthographicCamera(
      (frustumSize * aspect) / -2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      frustumSize / -2,
      0.1,
      1000,
    );
    camera.position.z = 1;

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    dotsBg.appendChild(renderer.domElement);

    createParticles();

    window.addEventListener("resize", onWindowResize, false);
    document.addEventListener("mousemove", onMouseMove, false);

    animationStartTime = Date.now();
    animate(0);
  }

  function createParticles() {
    const geometry = new THREE.BufferGeometry();
    const finalSpacing = 30; // Final spacing between dots
    const initialSpacing = 60; // Initial spacing between dots (more spread out)

    const vertices = [];
    const cols = Math.floor(window.innerWidth / finalSpacing);
    const rows = Math.floor(window.innerHeight / finalSpacing);

    for (let i = 0; i <= cols; i++) {
      for (let j = 0; j <= rows; j++) {
        vertices.push((i / cols) * 2 - 1, (j / rows) * 2 - 1, 0);
      }
    }

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3),
    );

    const material = new THREE.ShaderMaterial({
      uniforms: {
        baseColor: { value: new THREE.Color(0xffffff) },
        highlightColor: { value: new THREE.Color(0xdbffbe) },
        mousePos: { value: new THREE.Vector2() },
        prevMousePos: { value: new THREE.Vector2() },
        mouseVelocity: { value: new THREE.Vector2() },
        resolution: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
        time: { value: 0 },
        animationProgress: { value: 0 }, // Uniform for animation progress
      },
      vertexShader: `
        uniform vec2 mousePos;
        uniform vec2 prevMousePos;
        uniform vec2 mouseVelocity;
        uniform vec2 resolution;
        uniform float time;
        uniform float animationProgress;

        varying float vAlpha;
        varying float vDist;

        // Easing function (ease-out cubic)
        float easeOutCubic(float t) {
          return 1.0 - pow(1.0 - t, 3.0);
        }

        void main() {
          vec2 screenPos = position.xy;
          
          // Apply eased animation to screenPos
          float easedProgress = easeOutCubic(animationProgress);
          float spreadFactor = 1.0 + (1.0 - easedProgress) * 1.0; // Adjust the 1.0 to control spread amount
          screenPos *= spreadFactor;
          
          vec2 mouseNorm = mousePos / resolution;
          float aspect = resolution.x / resolution.y;
          vec2 centeredPos = (screenPos + 1.0) * 0.5;
          vec2 aspectCorrectedDiff = (centeredPos - mouseNorm) * vec2(aspect, 1.0);
          float dist = length(aspectCorrectedDiff) * 2.0;
          
          // Enlarged cursor circle
          float circleRadius = 1.5;
          dist /= circleRadius;
          
          // Increased stable repulsion effect based on mouse speed
          float mouseSpeed = length(mouseVelocity);
          float repulsionStrength = mouseSpeed * 0.03;
          float repulsion = exp(-dist * 2.0) * repulsionStrength;
          vec2 repulsionDir = normalize(aspectCorrectedDiff);
          
          vec2 offset = repulsionDir * repulsion;
          
          vec3 pos = vec3(screenPos + offset, 0.0);
          
          // Animate brightness and size
          float sizeMultiplier = 1.0 + (1.0 - easedProgress) * 1.0; // Double size at start
          float alphaMultiplier = 1.0 + (1.0 - easedProgress) * 1.0; // Double opacity at start
          
          // Brightness variation with animation
          vAlpha = (0.15 + smoothstep(0.4, 0.0, dist) * 0.3) * 1.10 * alphaMultiplier;
          
          vDist = dist;
          
          gl_Position = vec4(pos, 1.0);
          gl_PointSize = 3.234375 * sizeMultiplier; // Animate size
        }
      `,
      fragmentShader: `
        uniform vec3 baseColor;
        uniform vec3 highlightColor;
        varying float vAlpha;
        varying float vDist;

        void main() {
          vec2 circCoord = 2.0 * gl_PointCoord - 1.0;
          float r = length(circCoord);
          
          if (r > 1.0) {
            discard;
          }
          
          // Core dot
          float coreAlpha = smoothstep(1.0, 0.01, r);
          
          // Glow effect
          float glowStrength = smoothstep(0.8, 0.0, vDist) * 0.5;
          float glowAlpha = smoothstep(1.0, 0.0, r) * glowStrength;
          
          // Combine core and glow
          vec3 finalColor = mix(baseColor, highlightColor, glowStrength);
          float finalAlpha = max(coreAlpha, glowAlpha) * vAlpha;
          
          gl_FragColor = vec4(finalColor, finalAlpha);
        }
      `,
      transparent: true,
      depthWrite: false,
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);
  }

  function onWindowResize() {
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 2;
    camera.left = (-frustumSize * aspect) / 2;
    camera.right = (frustumSize * aspect) / 2;
    camera.top = frustumSize / 2;
    camera.bottom = -frustumSize / 2;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    particles.material.uniforms.resolution.value.set(
      window.innerWidth,
      window.innerHeight,
    );

    // Recreate particles
    scene.remove(particles);
    createParticles();
    animationStartTime = Date.now(); // Reset animation start time
  }

  function onMouseMove(event) {
    targetMouseX = event.clientX;
    targetMouseY = event.clientY;
  }

  function animate(currentTime) {
    requestAnimationFrame(animate);

    if (!particles || !particles.material) return;

    const deltaTime = currentTime - (animate.lastTime || 0);
    animate.lastTime = currentTime;

    // Calculate animation progress with easing
    const animationDuration = 1500; // Animation duration in milliseconds (increased to 1.5 seconds)
    const elapsedTime = Date.now() - animationStartTime;
    const animationProgress = Math.min(elapsedTime / animationDuration, 1);
    particles.material.uniforms.animationProgress.value = animationProgress;

    // Slower mouse movement
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    const uniforms = particles.material.uniforms;

    // Update previous mouse position
    uniforms.prevMousePos.value.copy(uniforms.mousePos.value);

    // Update current mouse position
    uniforms.mousePos.value.set(mouseX, window.innerHeight - mouseY);

    // Calculate and update mouse velocity
    const velocityX = (mouseX - lastMouseX) / deltaTime;
    const velocityY = (mouseY - lastMouseY) / deltaTime;
    uniforms.mouseVelocity.value.set(velocityX, -velocityY);

    // Update time uniform
    uniforms.time.value += deltaTime * 0.001;

    lastMouseX = mouseX;
    lastMouseY = mouseY;

    renderer.render(scene, camera);
  }

  init();
};
