/* Three.js animated background */
const canvas = document.getElementById('bg');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(0, 0, 60);

// Particles
const particleCount = 900;
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
  const i3 = i * 3;
  positions[i3 + 0] = (Math.random() - 0.5) * 180;
  positions[i3 + 1] = (Math.random() - 0.5) * 120;
  positions[i3 + 2] = (Math.random() - 0.5) * 140;
  // color blend between accent and purple
  const t = Math.random();
  const r = 229/255 * (0.6 + 0.4 * t);
  const g = 9/255 * (0.6 + 0.4 * (1 - t));
  const b = 20/255 + (124/255 - 20/255) * t;
  colors[i3 + 0] = r;
  colors[i3 + 1] = g * 0.4;
  colors[i3 + 2] = b;
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
const material = new THREE.PointsMaterial({ size: 1.6, vertexColors: true, transparent: true, opacity: 0.85 });
const points = new THREE.Points(geometry, material);
scene.add(points);

// Subtle fog-ish plane to deepen scene
const fogGeo = new THREE.PlaneGeometry(400, 300, 1, 1);
const fogMat = new THREE.MeshBasicMaterial({ color: 0x0b0b10, transparent: true, opacity: 0.45 });
const fog = new THREE.Mesh(fogGeo, fogMat);
fog.position.z = -40; scene.add(fog);

const mouse = { x: 0, y: 0 };
window.addEventListener('pointermove', (e) => {
  mouse.x = (e.clientX / innerWidth) * 2 - 1;
  mouse.y = (e.clientY / innerHeight) * 2 - 1;
});

function animate() {
  requestAnimationFrame(animate);
  const t = performance.now() * 0.00035;
  points.rotation.y = t;
  points.rotation.x = Math.sin(t * 0.6) * 0.08;
  camera.position.x += (mouse.x * 10 - camera.position.x) * 0.02;
  camera.position.y += (-mouse.y * 6 - camera.position.y) * 0.02;
  camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);
}
animate();

function onResize() {
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
}
addEventListener('resize', onResize);

/* Split text utilities */
function splitLetters(element) {
  const text = element.textContent.trim();
  element.textContent = '';
  const frag = document.createDocumentFragment();
  for (const ch of text) {
    const span = document.createElement('span');
    span.className = 'char';
    span.textContent = ch;
    frag.appendChild(span);
  }
  element.appendChild(frag);
}

function splitWords(element) {
  const words = element.textContent.split(/\s+/);
  element.textContent = '';
  words.forEach((w, i) => {
    const span = document.createElement('span');
    span.className = 'word';
    span.textContent = w + (i < words.length - 1 ? ' ' : '');
    element.appendChild(span);
  });
}

// Prepare elements
const letterAnims = [...document.querySelectorAll('[data-animate="letters"]')];
letterAnims.forEach(splitLetters);
const wordAnims = [...document.querySelectorAll('[data-animate="words"]')];
wordAnims.forEach(splitWords);

// Animate in
window.addEventListener('load', () => {
  // letters
  document.querySelectorAll('[data-animate="letters"] .char').forEach((el, i) => {
    const delay = i * 0.025;
    gsap.to(el, { y: 0, rotation: 0, scale: 1, opacity: 1, filter: 'blur(0px)', duration: 0.7, ease: 'back.out(1.6)', delay });
  });
  // words
  document.querySelectorAll('[data-animate="words"] .word').forEach((el, i) => {
    const delay = i * 0.05 + 0.2;
    gsap.to(el, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', delay });
  });
});

/* 3D tilt for tiles */
const tiles = document.querySelectorAll('.tile');
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

function handleTilt(e) {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  const cx = e.clientX - rect.left;
  const cy = e.clientY - rect.top;
  const px = (cx / rect.width) * 2 - 1; // -1..1
  const py = (cy / rect.height) * 2 - 1;
  const rotX = clamp(-py * 8, -8, 8);
  const rotY = clamp(px * 10, -10, 10);
  el.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
}
function resetTilt(e) { e.currentTarget.style.transform = 'rotateX(0) rotateY(0)'; }

tiles.forEach((tile) => {
  tile.addEventListener('pointermove', handleTilt);
  tile.addEventListener('pointerleave', resetTilt);
});

/* Poster stack hover video */
const stack = document.getElementById('stack3d');
if (stack) {
  stack.querySelectorAll('.poster-card').forEach((card, idx) => {
    const video = card.querySelector('video');
    const src = card.getAttribute('data-video');
    if (src) {
      const source = document.createElement('source');
      source.src = src;
      source.type = 'video/mp4';
      video.appendChild(source);
    }
    let playing = false;
    card.addEventListener('pointerenter', async () => {
      try {
        await video.play();
        playing = true;
      } catch (_) {}
    });
    card.addEventListener('pointerleave', () => {
      if (playing) { video.pause(); video.currentTime = 0; playing = false; }
    });
    // gentle float animation per card
    const baseZ = [120, 40, -80][idx % 3] || 0;
    gsap.to(card, { y: -10, duration: 2.4 + idx * 0.2, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: idx * 0.2 });
  });
  // subtle parallax on move
  const baseTransforms = [
    'translateZ(120px) rotateY(-10deg) translateX(10%)',
    'translateZ(40px) rotateY(6deg) translateX(-2%)',
    'translateZ(-80px) rotateY(12deg) translateX(-16%)'
  ];
  stack.addEventListener('pointermove', (e) => {
    const r = stack.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    stack.querySelectorAll('.poster-card').forEach((card, i) => {
      const depth = (i + 1) * 10;
      const base = baseTransforms[i % baseTransforms.length];
      card.style.transform = `${base} translateX(${px * depth}px) translateY(${py * -depth * 0.5}px)`;
    });
  });
}

/* Intersection animations for rows */
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const target = entry.target;
      target.querySelectorAll('.tile').forEach((tile, i) => {
        gsap.fromTo(tile, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: i * 0.06 });
      });
      observer.unobserve(target);
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.row').forEach((row) => observer.observe(row));

/* Accessibility: reduce motion */
const mediaQuery = matchMedia('(prefers-reduced-motion: reduce)');
if (mediaQuery.matches) {
  // Freeze animations
  gsap.globalTimeline.timeScale(0);
}