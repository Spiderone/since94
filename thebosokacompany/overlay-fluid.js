import * as THREE from "three";

let scene, camera, renderer;
let fluidMesh, rtTexture1, rtTexture2, simulationMaterial, displayMaterial;
let mousePosition = new THREE.Vector2(0.5, 0.5);
let lastMousePosition = new THREE.Vector2(0.5, 0.5);
let mouseVelocity = new THREE.Vector2();

function init() {
  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById("overlayFluid").appendChild(renderer.domElement);

  const geometry = new THREE.PlaneGeometry(2, 2);

  rtTexture1 = new THREE.WebGLRenderTarget(
    window.innerWidth,
    window.innerHeight,
    {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
    },
  );
  rtTexture2 = rtTexture1.clone();

  simulationMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTexture: { value: null },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uVelocity: { value: new THREE.Vector2(0, 0) },
      uResolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
      },
    },
    vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
    fragmentShader: `
            uniform sampler2D uTexture;
            uniform vec2 uMouse;
            uniform vec2 uVelocity;
            uniform vec2 uResolution;
            varying vec2 vUv;

            void main() {
                vec2 uv = vUv;
                vec2 cellSize = 1.0 / uResolution;
                
                vec2 curl = uVelocity.yx * vec2(-1.0, 1.0);
                vec2 offset = curl * cellSize * 50.0;
                vec4 previousColor = texture2D(uTexture, uv - offset);
                
                float mouseDistance = distance(uv, uMouse);
                float mouseInfluence = smoothstep(0.1, 0.0, mouseDistance);
                
                vec3 mouseColor = vec3(uVelocity * 0.5 + 0.5, 1.0);
                vec3 finalColor = mix(previousColor.rgb, mouseColor, mouseInfluence);
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `,
  });

  displayMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTexture: { value: null },
    },
    vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
    fragmentShader: `
            uniform sampler2D uTexture;
            varying vec2 vUv;
            void main() {
                vec4 color = texture2D(uTexture, vUv);
                gl_FragColor = color;
            }
        `,
  });

  fluidMesh = new THREE.Mesh(geometry, displayMaterial);
  scene.add(fluidMesh);

  document.addEventListener("mousemove", onMouseMove);
  window.addEventListener("resize", onWindowResize);
}

function onMouseMove(event) {
  lastMousePosition.copy(mousePosition);
  mousePosition.set(
    event.clientX / window.innerWidth,
    1 - event.clientY / window.innerHeight,
  );
  mouseVelocity.subVectors(mousePosition, lastMousePosition).multiplyScalar(10);
}

function onWindowResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  rtTexture1.setSize(width, height);
  rtTexture2.setSize(width, height);
  simulationMaterial.uniforms.uResolution.value.set(width, height);
}

function animate() {
  requestAnimationFrame(animate);

  simulationMaterial.uniforms.uTexture.value = rtTexture1.texture;
  simulationMaterial.uniforms.uMouse.value.copy(mousePosition);
  simulationMaterial.uniforms.uVelocity.value.copy(mouseVelocity);

  renderer.setRenderTarget(rtTexture2);
  renderer.render(scene, camera);

  displayMaterial.uniforms.uTexture.value = rtTexture2.texture;
  renderer.setRenderTarget(null);
  renderer.render(scene, camera);

  let temp = rtTexture1;
  rtTexture1 = rtTexture2;
  rtTexture2 = temp;

  mouseVelocity.multiplyScalar(0.95);
}

init();
animate();
