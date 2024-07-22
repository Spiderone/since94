let scene, camera, renderer, plane;
let mouseX = 0,
  mouseY = 0;

function init() {
  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  camera.position.z = 1;

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const dotSpacing = 50; // pixels between dots
  const cols = Math.ceil(window.innerWidth / dotSpacing);
  const rows = Math.ceil(window.innerHeight / dotSpacing);

  const geometry = new THREE.PlaneGeometry(2, 2, cols, rows);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      mouse: { value: new THREE.Vector2() },
      resolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
      },
      dotSpacing: { value: dotSpacing },
    },
    vertexShader: `
            uniform float time;
            uniform vec2 mouse;
            uniform vec2 resolution;
            varying vec2 vUv;
            varying float vElevation;

            void main() {
                vUv = uv;
                vec3 pos = position;
                
                // Convert position to pixel coordinates
                vec2 pixelPos = vec2(pos.x * resolution.x / 2.0, pos.y * resolution.y / 2.0);
                
                // Calculate distance to mouse in pixel space
                vec2 mousePixel = mouse * resolution / 2.0;
                float distanceToMouse = distance(mousePixel, pixelPos);
                
                // Create wave effect
                float elevation = sin(distanceToMouse * 0.02 - time * 2.0) * 0.1;
                elevation *= smoothstep(300.0, 0.0, distanceToMouse);
                
                pos.z += elevation;
                vElevation = elevation;

                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `,
    fragmentShader: `
            uniform vec2 resolution;
            uniform float dotSpacing;
            varying vec2 vUv;
            varying float vElevation;

            void main() {
                vec2 pixelCoord = vUv * resolution;
                vec2 nearestDot = round(pixelCoord / dotSpacing) * dotSpacing;
                float dist = distance(pixelCoord, nearestDot);
                
                float dotSize = 2.0;
                float strength = 1.0 - smoothstep(0.0, dotSize, dist);
                
                vec3 color = mix(vec3(0.5, 0.5, 0.5), vec3(1.0, 1.0, 1.0), vElevation * 5.0 + 0.5);
                gl_FragColor = vec4(color, strength * 0.5);
            }
        `,
    transparent: true,
  });

  plane = new THREE.Mesh(geometry, material);
  scene.add(plane);

  document.addEventListener("mousemove", onMouseMove);
  window.addEventListener("resize", onWindowResize);
}

function onMouseMove(event) {
  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
  plane.material.uniforms.mouse.value.set(mouseX, mouseY);
}

function onWindowResize() {
  const aspect = window.innerWidth / window.innerHeight;
  const frustumHeight = 2;
  const frustumWidth = aspect * frustumHeight;

  camera.left = frustumWidth / -2;
  camera.right = frustumWidth / 2;
  camera.top = frustumHeight / 2;
  camera.bottom = frustumHeight / -2;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  plane.material.uniforms.resolution.value.set(
    window.innerWidth,
    window.innerHeight,
  );

  const dotSpacing = 50;
  const cols = Math.ceil(window.innerWidth / dotSpacing);
  const rows = Math.ceil(window.innerHeight / dotSpacing);
  plane.geometry = new THREE.PlaneGeometry(2, 2, cols, rows);
}

function animate() {
  requestAnimationFrame(animate);
  plane.material.uniforms.time.value += 0.01;
  renderer.render(scene, camera);
}

init();
animate();
alert("update gitpage");
