import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

window.onload = function () {
  const dotsBg = document.getElementById("dotsBg");
  let scene, camera, renderer, particles, bloomComposer;
  let mouseX = 0,
    mouseY = 0;

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
        resolution: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
        time: { value: 0 },
      },
      vertexShader: `
        uniform vec2 mousePos;
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
          
          // Immediate wave effect
          float waveStrength = 0.02;
          float wave = exp(-dist * 5.0) * waveStrength;
          vec2 waveDir = normalize(aspectCorrectedDiff);
          vec2 offset = waveDir * wave;
          
          // Add subtle ambient movement
          float noiseScale = 0.5;
          float noiseTime = time * 0.2;
          vec2 noiseCoord = screenPos * noiseScale + noiseTime;
          float noise = snoise(noiseCoord) * 0.005;
          offset += vec2(noise, noise);
          
          vec3 pos = vec3(screenPos + offset, 0.0);
          
          // Brightness variation
          vAlpha = 0.3 + smoothstep(0.2, 0.0, dist) * 0.7;
          
          gl_Position = vec4(pos, 1.0);
          gl_PointSize = 1.6875; // 75% of 2.25
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

    // Set up bloom effect
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.5, // bloom strength
      0.4, // bloom radius
      0.85, // bloom threshold
    );
    bloomComposer = new EffectComposer(renderer);
    bloomComposer.addPass(renderScene);
    bloomComposer.addPass(bloomPass);

    window.addEventListener("resize", onWindowResize, false);
    document.addEventListener("mousemove", onMouseMove, false);
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    bloomComposer.setSize(window.innerWidth, window.innerHeight);
    particles.material.uniforms.resolution.value.set(
      window.innerWidth,
      window.innerHeight,
    );
    init(); // Recreate the grid on resize
  }

  function onMouseMove(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;
  }

  function animate(currentTime) {
    requestAnimationFrame(animate);

    const uniforms = particles.material.uniforms;

    // Update mouse position
    uniforms.mousePos.value.set(mouseX, window.innerHeight - mouseY);

    // Update time uniform
    uniforms.time.value = currentTime * 0.001;

    bloomComposer.render();
  }

  init();
  animate(0);
};
