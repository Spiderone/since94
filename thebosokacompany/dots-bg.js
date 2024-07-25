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
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
    camera.position.z = 1;

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    dotsBg.appendChild(renderer.domElement);

    const geometry = new THREE.BufferGeometry();
    const spacing = 30; // Spacing between dots

    function createGrid() {
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
      geometry.attributes.position.needsUpdate = true;
    }

    createGrid();

    const material = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0xffffff) },
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

        // Simplex 2D noise
        vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

        float snoise(vec2 v){
          const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                   -0.577350269189626, 0.024390243902439);
          vec2 i  = floor(v + dot(v, C.yy) );
          vec2 x0 = v -   i + dot(i, C.xx);
          vec2 i1;
          i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod(i, 289.0);
          vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
          + i.x + vec3(0.0, i1.x, 1.0 ));
          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
            dot(x12.zw,x12.zw)), 0.0);
          m = m*m ;
          m = m*m ;
          vec3 x = 2.0 * fract(p * C.www) - 1.0;
          vec3 h = abs(x) - 0.5;
          vec3 ox = floor(x + 0.5);
          vec3 a0 = x - ox;
          m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
          vec3 g;
          g.x  = a0.x  * x0.x  + h.x  * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130.0 * dot(m, g);
        }

        void main() {
          vec2 screenPos = position.xy;
          vec2 mouseNorm = mousePos / resolution;
          float aspect = resolution.x / resolution.y;
          vec2 centeredPos = (screenPos + 1.0) * 0.5;
          vec2 aspectCorrectedDiff = (centeredPos - mouseNorm) * vec2(aspect, 1.0);
          float dist = length(aspectCorrectedDiff) * 2.0;
          
          // Softer wave propagation (doubled strength)
          float waveStrength = length(mouseVelocity) * 0.001;
          float wave = exp(-dist * 3.0) * waveStrength;
          vec2 waveDir = normalize(aspectCorrectedDiff);
          
          // Gentler ripple effect
          float rippleSpeed = 1.0;
          float rippleFreq = 5.0;
          float ripple = sin(dist * rippleFreq - time * rippleSpeed) * 0.5 + 0.5;
          ripple *= exp(-dist * 2.0) * 0.1; // Doubled ripple intensity
          
          // Combine wave and ripple effects
          vec2 offset = waveDir * (wave + ripple);
          
          // Smoother inertia
          vec2 prevMouseNorm = prevMousePos / resolution;
          vec2 prevAspectCorrectedDiff = (centeredPos - prevMouseNorm) * vec2(aspect, 1.0);
          float prevDist = length(prevAspectCorrectedDiff) * 2.0;
          vec2 prevOffset = normalize(prevAspectCorrectedDiff) * exp(-prevDist * 3.0) * waveStrength;
          
          offset = mix(prevOffset, offset, 0.2); // Faster inertia
          
          // Add subtle ambient movement
          float noiseScale = 0.5;
          float noiseTime = time * 0.2;
          vec2 noiseCoord = screenPos * noiseScale + noiseTime;
          float noise = snoise(noiseCoord) * 0.005;
          offset += vec2(noise, noise);
          
          vec3 pos = vec3(screenPos + offset, 0.0);
          
          // Subtle brightness variation
          vAlpha = 0.3 + smoothstep(0.4, 0.0, dist) * 0.4;
          
          gl_Position = vec4(pos, 1.0);
          gl_PointSize = 2.25;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        varying float vAlpha;
        void main() {
          vec2 circCoord = 2.0 * gl_PointCoord - 1.0;
          if (dot(circCoord, circCoord) > 1.0) {
            discard;
          }
          gl_FragColor = vec4(color, vAlpha);
        }
      `,
      transparent: true,
      depthWrite: false,
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);

    window.addEventListener("resize", onWindowResize, false);
    document.addEventListener("mousemove", onMouseMove, false);
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    particles.material.uniforms.resolution.value.set(
      window.innerWidth,
      window.innerHeight,
    );
    init(); // Recreate the grid on resize
  }

  function onMouseMove(event) {
    targetMouseX = event.clientX;
    targetMouseY = event.clientY;
  }

  function animate(currentTime) {
    requestAnimationFrame(animate);

    const deltaTime = currentTime - (animate.lastTime || 0);
    animate.lastTime = currentTime;

    // Smoother mouse movement
    mouseX += (targetMouseX - mouseX) * 0.1; // Increased from 0.05 to 0.1
    mouseY += (targetMouseY - mouseY) * 0.1; // Increased from 0.05 to 0.1

    const uniforms = particles.material.uniforms;

    // Update previous mouse position
    uniforms.prevMousePos.value.copy(uniforms.mousePos.value);

    // Update current mouse position
    uniforms.mousePos.value.set(mouseX, window.innerHeight - mouseY);

    // Calculate and update mouse velocity (reduced intensity)
    const velocityX = (mouseX - lastMouseX) / (deltaTime * 0.1);
    const velocityY = (mouseY - lastMouseY) / (deltaTime * 0.1);
    uniforms.mouseVelocity.value.set(velocityX, -velocityY);

    // Update time uniform
    uniforms.time.value += deltaTime * 0.001;

    lastMouseX = mouseX;
    lastMouseY = mouseY;

    renderer.render(scene, camera);
  }

  init();
  animate(0);
};
