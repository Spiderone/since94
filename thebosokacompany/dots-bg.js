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

    createParticles();

    window.addEventListener("resize", onWindowResize, false);
    document.addEventListener("mousemove", onMouseMove, false);
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
        color: { value: new THREE.Color(0xffffff) },
        mousePos: { value: new THREE.Vector2() },
        prevMousePos: { value: new THREE.Vector2() },
        mouseVelocity: { value: new THREE.Vector2() },
        resolution: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
        time: { value: 0 },
        bloomColor: { value: new THREE.Color(0xe7ffd4) },
      },
      vertexShader: `
        uniform vec2 mousePos;
        uniform vec2 prevMousePos;
        uniform vec2 mouseVelocity;
        uniform vec2 resolution;
        uniform float time;

        varying float vAlpha;
        varying float vDist;
        varying float vBloom;

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
          
          // Enlarged cursor circle (1.5x)
          float circleRadius = 1.5;
          dist /= circleRadius;
          
          // Increased stable repulsion effect based on mouse speed
          float mouseSpeed = length(mouseVelocity);
          float repulsionStrength = mouseSpeed * 0.03;
          float repulsion = exp(-dist * 2.0) * repulsionStrength;
          vec2 repulsionDir = normalize(aspectCorrectedDiff);
          
          vec2 offset = repulsionDir * repulsion;
          
          // Add stronger but slower ambient movement
          float noiseScale = 0.25;
          float noiseTime = time * 0.05;
          vec2 noiseCoord = screenPos * noiseScale + noiseTime;
          float noise = snoise(noiseCoord) * 0.005;
          offset += vec2(noise, noise);
          
          vec3 pos = vec3(screenPos + offset, 0.0);
          
          // Subtle brightness variation (slightly less bright)
          vAlpha = 0.15 + smoothstep(0.4, 0.0, dist) * 0.3;
          
          vDist = dist;
          
          // Bloom effect
          vBloom = smoothstep(0.4, 0.0, dist) * 0.5;
          
          gl_Position = vec4(pos, 1.0);
          gl_PointSize = 2.25;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform vec3 bloomColor;
        varying float vAlpha;
        varying float vDist;
        varying float vBloom;

        void main() {
          vec2 circCoord = 2.0 * gl_PointCoord - 1.0;
          if (dot(circCoord, circCoord) > 1.0) {
            discard;
          }
          
          // Increased blur effect for dots outside the cursor circle
          float blur = smoothstep(1.0, 1.2, vDist) * 0.08;
          vec2 blurredCoord = circCoord * (1.0 - blur);
          float alpha = smoothstep(1.0, 0.6, length(blurredCoord));
          
          // Bloom effect
          vec3 finalColor = mix(color, bloomColor, vBloom);
          
          gl_FragColor = vec4(finalColor, vAlpha * alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);
  }

  function onWindowResize() {
    camera.left = -1;
    camera.right = 1;
    camera.top = 1;
    camera.bottom = -1;
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
  animate(0);
};
