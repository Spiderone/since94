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

    animate(0);
  }

  function createParticles() {
    const geometry = new THREE.BufferGeometry();
    const spacing = 30; // Spacing between dots

    const vertices = [];
    const cols = Math.floor(window.innerWidth / spacing);
    const rows = Math.floor(window.innerHeight / spacing);

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
      },
      vertexShader: `
        uniform vec2 mousePos;
        uniform vec2 prevMousePos;
        uniform vec2 mouseVelocity;
        uniform vec2 resolution;
        uniform float time;

        varying float vAlpha;
        varying float vDist;

        void main() {
          vec2 screenPos = position.xy;
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
          
          // Brightness variation
          vAlpha = 0.15 + smoothstep(0.4, 0.0, dist) * 0.3;
          
          vDist = dist;
          
          gl_Position = vec4(pos, 1.0);
          gl_PointSize = 2.8125; // 1.25 times larger than original
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
          float coreAlpha = smoothstep(1.0, 0.8, r);
          
          // Glow effect
          float glowStrength = smoothstep(0.4, 0.0, vDist) * 0.5;
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
