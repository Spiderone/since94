import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.166.1/three.module.min.js";

function initParticleSystem() {
  const heroSpacer = document.querySelector(".hero-spacer");

  if (!heroSpacer) {
    console.error("Could not find .hero-spacer element");
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    90,
    heroSpacer.clientWidth / heroSpacer.clientHeight,
    0.1,
    1000,
  );
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(heroSpacer.clientWidth, heroSpacer.clientHeight);

  heroSpacer.innerHTML = "";
  heroSpacer.appendChild(renderer.domElement);

  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.display = "block";

  const loader = new THREE.TextureLoader();
  loader.load(
    "https://uploads-ssl.webflow.com/5c4f5c323770f2d68eb62b54/66b9334ff8f1d06c15bbc5eb_s94-large.avif",
    function (texture) {
      const particleSystem = createParticleSystem(texture);
      scene.add(particleSystem);

      const aspect = 106 / 41;
      const logoHeight = 2;
      const logoWidth = logoHeight * aspect;
      camera.position.z =
        (logoHeight / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) *
        0.75;

      animate();
    },
  );

  function createParticleSystem(texture) {
    const imageData = getImageData(texture.image);
    const geometry = new THREE.BufferGeometry();
    const particles = [];
    const opacities = []; // New array to store opacity values

    const aspect = 106 / 41;
    const scale = 0.95;
    const width = scale * aspect;
    const height = scale;

    const particleDensity = 0.038;
    const depthRange = 0.75; // Range of depth for particles

    for (let y = 0; y < imageData.height; y += 1 / particleDensity) {
      for (let x = 0; x < imageData.width; x += 1 / particleDensity) {
        if (
          imageData.data[
            (Math.floor(y) * imageData.width + Math.floor(x)) * 4 + 3
          ] > 128
        ) {
          const particle = new THREE.Vector3(
            (x / imageData.width - 0.5) * width,
            (-y / imageData.height + 0.5) * height,
            (Math.random() - 0.5) * depthRange, // Random Z position
          );
          particles.push(particle);

          // Calculate opacity based on Z position
          const opacity = THREE.MathUtils.mapLinear(
            particle.z,
            -depthRange / 1,
            depthRange / 1,
            0.01,
            1,
          );
          opacities.push(opacity);
        }
      }
    }

    geometry.setFromPoints(particles);
    geometry.setAttribute(
      "opacity",
      new THREE.Float32BufferAttribute(opacities, 1),
    );

    const material = new THREE.ShaderMaterial({
      vertexShader: `
        attribute float opacity;
        varying float vOpacity;
        void main() {
          vOpacity = opacity;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = 3.65 / -mvPosition.z;
        }
      `,
      fragmentShader: `
        varying float vOpacity;
        void main() {
          if (length(gl_PointCoord - vec2(0.5)) > 0.5) discard;
          gl_FragColor = vec4(0.70, 0.70, 0.70, vOpacity);
        }
      `,
      transparent: true,
    });

    return new THREE.Points(geometry, material);
  }

  function getImageData(image) {
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext("2d");
    context.drawImage(image, 0, 0);
    return context.getImageData(0, 0, image.width, image.height);
  }

  function animate() {
    requestAnimationFrame(animate);

    const time = Date.now() * 0.0015;

    scene.children.forEach((child) => {
      if (child instanceof THREE.Points) {
        const positions = child.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
          const angle = time + i * 0.0006;
          const radius = 0.004;
          positions[i] +=
            Math.cos(angle) * radius - Math.cos(angle - 0.03) * radius;
          positions[i + 1] +=
            Math.sin(angle) * radius - Math.sin(angle - 0.03) * radius;

          // Oscillate Z position
          positions[i + 2] = Math.sin(angle * 1) * 0.025;

          // Update opacity based on new Z position
          const opacity = THREE.MathUtils.mapLinear(
            positions[i + 2],
            -0.1,
            0.1,
            0.1,
            1,
          );
          child.geometry.attributes.opacity.array[i / 3] = opacity;
        }
        child.geometry.attributes.position.needsUpdate = true;
        child.geometry.attributes.opacity.needsUpdate = true;
      }
    });

    renderer.render(scene, camera);
  }

  function onWindowResize() {
    camera.aspect = heroSpacer.clientWidth / heroSpacer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(heroSpacer.clientWidth, heroSpacer.clientHeight);
  }

  window.addEventListener("resize", onWindowResize, false);
}

initParticleSystem();
