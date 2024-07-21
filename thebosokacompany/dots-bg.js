let scene, camera, renderer, plane;
let mouseX = 0,
  mouseY = 0;

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const geometry = new THREE.PlaneGeometry(10, 10, 100, 100);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      mouse: { value: new THREE.Vector2() },
    },
    vertexShader: `
                    uniform float time;
                    uniform vec2 mouse;
                    varying vec2 vUv;
                    varying float vElevation;

                    void main() {
                        vUv = uv;
                        vec4 modelPosition = modelMatrix * vec4(position, 1.0);
                        float elevation = sin(modelPosition.x * 10.0 + time) * 0.1;
                        elevation += sin(modelPosition.y * 10.0 + time) * 0.1;
                        
                        // Mouse interaction
                        float distanceToMouse = distance(mouse, modelPosition.xy);
                        elevation += smoothstep(0.5, 0.0, distanceToMouse) * 0.2;

                        modelPosition.z += elevation;
                        vElevation = elevation;

                        gl_Position = projectionMatrix * viewMatrix * modelPosition;
                    }
                `,
    fragmentShader: `
                    varying vec2 vUv;
                    varying float vElevation;

                    void main() {
                        float strength = mod(vUv.x * 10.0, 1.0);
                        strength *= mod(vUv.y * 10.0, 1.0);
                        strength = step(0.9, strength);

                        vec3 color = mix(vec3(0.5, 0.5, 0.5), vec3(1.0, 1.0, 1.0), vElevation * 2.0 + 0.5);
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
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  plane.material.uniforms.time.value += 0.01;
  renderer.render(scene, camera);
}

init();
animate();
