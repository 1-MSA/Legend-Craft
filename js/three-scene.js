let scene, camera, renderer, particles, blocks = [];
let mouseX = 0, mouseY = 0;
let scrollY = 0;

function initThreeScene() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0118, 0.0008);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 50;

  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  createParticleField();
  createFloatingBlocks();
  createDragonParticles();

  window.addEventListener('resize', onResize);
  document.addEventListener('mousemove', onMouseMove);
  window.addEventListener('scroll', () => { scrollY = window.scrollY; });

  animate();
}

function createParticleField() {
  const count = 3000;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  const purple = new THREE.Color(0xa855f7);
  const pink = new THREE.Color(0xe879f9);
  const dark = new THREE.Color(0x581c87);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 200;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 200;

    const color = [purple, pink, dark][Math.floor(Math.random() * 3)];
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;

    sizes[i] = Math.random() * 2 + 0.5;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.PointsMaterial({
    size: 0.8,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  });

  particles = new THREE.Points(geometry, material);
  scene.add(particles);
}

function createFloatingBlocks() {
  const blockColors = [0x9333ea, 0x7c3aed, 0x581c87, 0xc084fc, 0x6b21a8];
  const blockCount = 25;

  for (let i = 0; i < blockCount; i++) {
    const size = Math.random() * 2 + 1;
    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshPhongMaterial({
      color: blockColors[Math.floor(Math.random() * blockColors.length)],
      transparent: true,
      opacity: 0.6,
      shininess: 80,
      emissive: 0x3b0764,
      emissiveIntensity: 0.3
    });

    const block = new THREE.Mesh(geometry, material);
    block.position.set(
      (Math.random() - 0.5) * 120,
      (Math.random() - 0.5) * 80,
      (Math.random() - 0.5) * 60 - 20
    );
    block.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    block.userData = {
      rotSpeed: {
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02
      },
      floatSpeed: Math.random() * 0.5 + 0.3,
      floatOffset: Math.random() * Math.PI * 2,
      baseY: block.position.y
    };

    blocks.push(block);
    scene.add(block);
  }

  const ambient = new THREE.AmbientLight(0x581c87, 0.5);
  scene.add(ambient);

  const pointLight = new THREE.PointLight(0xa855f7, 2, 200);
  pointLight.position.set(0, 20, 30);
  scene.add(pointLight);

  const pointLight2 = new THREE.PointLight(0xe879f9, 1.5, 150);
  pointLight2.position.set(-30, -10, 20);
  scene.add(pointLight2);
}

function createDragonParticles() {
  const ringCount = 200;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(ringCount * 3);

  for (let i = 0; i < ringCount; i++) {
    const angle = (i / ringCount) * Math.PI * 2;
    const radius = 25 + Math.sin(i * 0.5) * 5;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = Math.sin(angle * 3) * 8;
    positions[i * 3 + 2] = Math.sin(angle) * radius;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    size: 1.2,
    color: 0xc084fc,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending
  });

  const ring = new THREE.Points(geometry, material);
  ring.userData.isRing = true;
  scene.add(ring);
  blocks.push(ring);
}

function onResize() {
  if (!camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(e) {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
}

function animate() {
  requestAnimationFrame(animate);
  const time = Date.now() * 0.001;

  if (particles) {
    particles.rotation.y = time * 0.05;
    particles.rotation.x = Math.sin(time * 0.1) * 0.1;

    const positions = particles.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 1] += Math.sin(time + i) * 0.01;
    }
    particles.geometry.attributes.position.needsUpdate = true;
  }

  blocks.forEach(block => {
    if (block.userData.isRing) {
      block.rotation.y = time * 0.3;
      block.rotation.z = Math.sin(time * 0.5) * 0.2;
      return;
    }

    block.rotation.x += block.userData.rotSpeed.x;
    block.rotation.y += block.userData.rotSpeed.y;
    block.rotation.z += block.userData.rotSpeed.z;
    block.position.y = block.userData.baseY + Math.sin(time * block.userData.floatSpeed + block.userData.floatOffset) * 3;
  });

  camera.position.x += (mouseX * 15 - camera.position.x) * 0.05;
  camera.position.y += (-mouseY * 10 + scrollY * -0.02 - camera.position.y) * 0.05;
  camera.lookAt(0, scrollY * -0.01, 0);

  renderer.render(scene, camera);
}

document.addEventListener('DOMContentLoaded', initThreeScene);
