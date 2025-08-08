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
  // spotlight cursor track
  const spot = document.getElementById('spotlight');
  if (spot) {
    spot.style.setProperty('--sx', e.clientX + 'px');
    spot.style.setProperty('--sy', e.clientY + 'px');
  }
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
  // add actions
  if (!tile.querySelector('.tile-actions')) {
    const actions = document.createElement('div');
    actions.className = 'tile-actions';
    const addBtn = document.createElement('button');
    addBtn.className = 'icon-btn';
    addBtn.title = 'زیادکردن بۆ لیست';
    addBtn.textContent = '+';
    addBtn.addEventListener('click', () => addToWatchlistFromTile(tile));
    const playBtn = document.createElement('button');
    playBtn.className = 'icon-btn';
    playBtn.title = 'تریلەر';
    playBtn.textContent = '▶';
    playBtn.addEventListener('click', () => openTrailer(tile.querySelector('img')?.src));
    actions.append(addBtn, playBtn);
    tile.appendChild(actions);
  }
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
      // ambient accent from poster image average
      const img = card.querySelector('img');
      if (img) setAccentFromImage(img);
    });
    card.addEventListener('pointerleave', () => {
      if (playing) { video.pause(); video.currentTime = 0; playing = false; }
      resetAccent();
    });
    // gentle float
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
  gsap.globalTimeline.timeScale(0);
  document.documentElement.classList.add('reduced-motion');
}

/* Manual reduce effects toggle */
const effectsToggle = document.getElementById('effectsToggle');
if (effectsToggle) {
  const key = 'reduced-effects';
  const apply = (on) => {
    document.documentElement.classList.toggle('reduced-motion', on);
    gsap.globalTimeline.timeScale(on ? 0 : 1);
    effectsToggle.classList.toggle('solid', on);
    effectsToggle.textContent = on ? 'چالاککردنی ئەنیمەیشن' : 'کەمکردنەوەی ئەنیمەیشن';
    localStorage.setItem(key, on ? '1' : '0');
  };
  apply(localStorage.getItem(key) === '1');
  effectsToggle.addEventListener('click', () => apply(!document.documentElement.classList.contains('reduced-motion')));
}

/* Watchlist with persistence */
const watchKey = 'watchlist-items';
const chip = document.getElementById('watchlistChip');
function getWatchlist() {
  try { return JSON.parse(localStorage.getItem(watchKey) || '[]'); } catch { return []; }
}
function setWatchlist(arr) {
  localStorage.setItem(watchKey, JSON.stringify(arr));
  updateWatchlistCount();
}
function updateWatchlistCount() {
  const countEl = chip?.querySelector('.count');
  if (countEl) countEl.textContent = String(getWatchlist().length);
}
function addToWatchlistFromTile(tile) {
  const title = tile.querySelector('h3')?.textContent?.trim() || 'ناونیشانێک';
  const img = tile.querySelector('img')?.src;
  const list = getWatchlist();
  if (!list.find((x) => x.title === title && x.img === img)) {
    list.push({ title, img, at: Date.now() });
    setWatchlist(list);
  }
}
updateWatchlistCount();
if (chip) chip.addEventListener('click', () => {
  const list = getWatchlist();
  alert('لیستی سەیرکردن (' + list.length + '):\n' + list.map((x) => '• ' + x.title).join('\n'));
});

/* Trailer modal logic */
const trailerBtn = document.getElementById('ctaTrailer');
const trailerModal = document.getElementById('trailerModal');
const trailerVideo = document.getElementById('trailerVideo');
const trailerClose = trailerModal?.querySelector('.modal-close');
function openTrailer(posterSrc) {
  if (!trailerModal) return;
  const sample = 'https://cdn.coverr.co/videos/coverr-movie-projector-1116/1080p.mp4';
  if (trailerVideo && !trailerVideo.querySelector('source')) {
    const s = document.createElement('source');
    s.src = sample; s.type = 'video/mp4';
    trailerVideo.appendChild(s);
  }
  trailerModal.classList.add('active');
  trailerModal.setAttribute('open', '');
  trailerModal.setAttribute('aria-hidden', 'false');
  trailerVideo?.play().catch(() => {});
}
function closeTrailer() {
  if (!trailerModal) return;
  trailerModal.classList.remove('active');
  trailerModal.removeAttribute('open');
  trailerModal.setAttribute('aria-hidden', 'true');
  if (trailerVideo) { trailerVideo.pause(); trailerVideo.currentTime = 0; }
}
if (trailerBtn) trailerBtn.addEventListener('click', () => openTrailer());
trailerClose?.addEventListener('click', closeTrailer);
trailerModal?.querySelector('.modal-backdrop')?.addEventListener('click', closeTrailer);
window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeTrailer(); });

/* Ambient accent from image average color */
const spot = document.getElementById('spotlight');
function setAccentFromImage(img) {
  try {
    const c = document.createElement('canvas');
    const ctx = c.getContext('2d');
    const w = c.width = 64, h = c.height = 64;
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;
    let r = 0, g = 0, b = 0, n = 0;
    for (let i = 0; i < data.length; i += 4) {
      const rr = data[i], gg = data[i+1], bb = data[i+2];
      const bright = rr*0.299 + gg*0.587 + bb*0.114;
      if (bright < 240) { r += rr; g += gg; b += bb; n++; }
    }
    if (n > 0) { r/=n; g/=n; b/=n; }
    const col = `rgba(${r|0}, ${g|0}, ${b|0}, 0.25)`;
    spot?.style.setProperty('--accent', col);
  } catch { /* ignore CORS */ }
}
function resetAccent() { spot?.style.setProperty('--accent', 'rgba(229,9,20,0.18)'); }

/* Keyboard navigation for tiles */
let focusedIndex = 0;
const focusableTiles = Array.from(document.querySelectorAll('.tile'));
function focusTile(i) {
  if (focusableTiles.length === 0) return;
  focusedIndex = (i + focusableTiles.length) % focusableTiles.length;
  focusableTiles[focusedIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  focusableTiles[focusedIndex].classList.add('focus-ring');
  setTimeout(() => focusableTiles[focusedIndex].classList.remove('focus-ring'), 600);
}
window.addEventListener('keydown', (e) => {
  if (['ArrowLeft','ArrowRight'].includes(e.key)) {
    e.preventDefault();
    focusTile(focusedIndex + (e.key === 'ArrowLeft' ? -1 : 1));
  }
});

/* CTA scroll */
const ctaStart = document.getElementById('ctaStart');
ctaStart?.addEventListener('click', () => document.getElementById('trending')?.scrollIntoView({ behavior: 'smooth' }));