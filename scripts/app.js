/* CineWave App (Vanilla JS) */
(function () {
  const state = {
    allItems: [],
    filtered: [],
    pageSize: 24,
    page: 0,
    view: 'grid',
    filters: { type: 'all', year: 'all', rating: 'all', query: '' },
    watchlist: new Set(JSON.parse(localStorage.getItem('cinewave_watchlist') || '[]'))
  };

  const els = {
    grid: document.getElementById('catalogGrid'),
    loading: document.getElementById('loading'),
    detail: document.getElementById('detail'),
    hero: document.getElementById('hero'),
    watchlist: document.getElementById('watchlist'),
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.getElementById('searchBtn'),
    filterType: document.getElementById('filterType'),
    filterYear: document.getElementById('filterYear'),
    filterRating: document.getElementById('filterRating'),
    clearFilters: document.getElementById('clearFilters'),
    toggleGrid: document.getElementById('toggleGrid'),
    toggleList: document.getElementById('toggleList'),
    trailerModal: document.getElementById('trailerModal'),
    trailerFrame: document.getElementById('trailerFrame'),
  };

  const router = {
    routes: {},
    add(path, handler) { this.routes[path] = handler; },
    navigate(hash) {
      const [_, route, id] = (hash || location.hash || '#/').split('/');
      if (route === '') return this.routes['home']?.();
      if (route === 'detail' && id) return this.routes['detail']?.(id);
      if (route === 'watchlist') return this.routes['watchlist']?.();
      if (['movies','series','animation','trending'].includes(route)) {
        return this.routes['category']?.(route);
      }
      return this.routes['home']?.();
    }
  };

  // Data loading
  async function loadData() {
    try {
      const res = await fetch('/data/movies.json');
      const json = await res.json();
      // Amplify to simulate a larger catalog
      const big = [];
      for (let i = 0; i < 8; i++) big.push(...json.map(x => ({ ...x, id: x.id + '-' + i })));
      state.allItems = shuffle(big);
      hydrateYears();
      applyFilters();
      renderPage(true);
      AdEngine.safeFill('ad-top', 'bannerTop');
      AdEngine.safeFill('ad-sidebar', 'sidebar');
      AdEngine.safeFill('ad-footer', 'footer');
    } catch (e) {
      console.error('loadData error', e);
      state.allItems = generateFallback();
      hydrateYears();
      applyFilters();
      renderPage(true);
    }
  }

  function hydrateYears() {
    const years = Array.from(new Set(state.allItems.map(i => i.year))).sort((a,b)=>b-a);
    els.filterYear.innerHTML = '<option value="all">ساڵ</option>' + years.map(y => `<option value="${y}">${y}</option>`).join('');
  }

  function applyFilters() {
    const { type, year, rating, query } = state.filters;
    const q = query.trim().toLowerCase();
    state.filtered = state.allItems.filter(item => {
      if (type !== 'all' && item.type !== type) return false;
      if (year !== 'all' && String(item.year) !== String(year)) return false;
      if (rating !== 'all' && Number(item.rating) < Number(rating)) return false;
      if (!q) return true;
      return item.title.toLowerCase().includes(q) || item.genres.join(',').toLowerCase().includes(q);
    });
    state.page = 0;
    els.grid.innerHTML = '';
  }

  function renderPage(reset = false) {
    const start = state.page * state.pageSize;
    const slice = state.filtered.slice(start, start + state.pageSize);
    if (reset) els.grid.innerHTML = '';
    for (let i = 0; i < slice.length; i++) {
      if (i > 0 && i % 8 === 0) {
        const adId = `ad-infeed-${start + i}`;
        const ad = document.createElement('div');
        ad.id = adId;
        ad.className = 'ad-slot';
        ad.style.minHeight = '160px';
        els.grid.appendChild(ad);
        AdEngine.safeFill(adId, 'inFeed');
      }
      els.grid.appendChild(renderCard(slice[i]));
    }
    state.page += 1;
    toggleLoading(false);
    setupCardTilt();
    if ((start + slice.length) < state.filtered.length) observeScroll();
  }

  function renderCard(item) {
    const root = document.createElement('article');
    root.className = 'card';
    root.dataset.id = item.id;
    root.innerHTML = `
      <div class="card-media" style="background:linear-gradient(135deg, rgba(122,92,255,.25), rgba(0,229,255,.2));">
        <span>${getInitials(item.title)}</span>
        <div class="card-badges">
          <span class="badge">${item.type}</span>
          <span class="badge">${item.year}</span>
          <span class="badge">⭐ ${item.rating}</span>
        </div>
      </div>
      <div class="card-body">
        <h3 class="card-title">${escapeHtml(item.title)}</h3>
        <div class="card-meta">${item.genres.join(' • ')}</div>
        <div class="card-actions">
          <button class="btn btn-primary" data-action="detail">وردەکاری</button>
          <button class="btn" data-action="trailer">تریلە</button>
          <button class="btn" data-action="watchlist">${state.watchlist.has(item.id) ? 'لابردن' : 'زیادکردن'}</button>
        </div>
      </div>
    `;
    root.addEventListener('click', (e) => {
      const action = e.target?.dataset?.action;
      if (!action) return;
      e.stopPropagation();
      if (action === 'detail') location.hash = `#/detail/${encodeURIComponent(item.id)}`;
      if (action === 'trailer') openTrailer(item.trailerId);
      if (action === 'watchlist') toggleWatchlist(item.id, root);
    });
    return root;
  }

  function openTrailer(ytId) {
    if (!ytId) return;
    els.trailerFrame.src = `https://www.youtube.com/embed/${ytId}?autoplay=1`;
    els.trailerModal.classList.remove('hide');
    AdEngine.tryInterstitial();
  }

  function closeTrailer() {
    els.trailerFrame.src = '';
    els.trailerModal.classList.add('hide');
  }

  function toggleWatchlist(id, rootEl) {
    if (state.watchlist.has(id)) state.watchlist.delete(id); else state.watchlist.add(id);
    localStorage.setItem('cinewave_watchlist', JSON.stringify(Array.from(state.watchlist)));
    // Update button text
    const btn = rootEl.querySelector('[data-action="watchlist"]');
    if (btn) btn.textContent = state.watchlist.has(id) ? 'لابردن' : 'زیادکردن';
  }

  function renderDetail(id) {
    const item = state.allItems.find(x => String(x.id) === String(id));
    if (!item) return;
    els.hero.classList.add('hide');
    els.detail.classList.remove('hide');
    document.getElementById('catalog').classList.add('hide');
    els.watchlist.classList.add('hide');
    els.detail.innerHTML = `
      <div class="card" style="display:grid; grid-template-columns: 280px 1fr; gap: 1rem; padding: .8rem;">
        <div class="card-media"><span>${getInitials(item.title)}</span></div>
        <div class="card-body">
          <h2 class="card-title" style="font-size: 28px;">${escapeHtml(item.title)}</h2>
          <div class="card-meta">${item.year} • ${item.type} • ⭐ ${item.rating} • ${item.genres.join(' • ')}</div>
          <p class="card-meta">${escapeHtml(item.overview || 'باسە، ئەم فلمە داواکراوە بۆ زیادکردن بە زوویی.')}</p>
          <div class="card-actions">
            <button class="btn btn-primary" id="playBtn">سەیرکردن</button>
            <button class="btn" id="trailerBtn">تریلە</button>
          </div>
        </div>
      </div>
      <div id="ad-detail" class="ad-slot" style="min-height:160px"></div>
    `;
    document.getElementById('playBtn').addEventListener('click', () => {
      alert('نمونەی پەخشکەر: داتاکان نمونەن. دەتوانیت پلەیەرێکی واقعی زیاد بکەیت.');
      AdEngine.tryInterstitial();
    });
    document.getElementById('trailerBtn').addEventListener('click', () => openTrailer(item.trailerId));
    AdEngine.safeFill('ad-detail', 'inArticle');
  }

  function renderHomeCategory(slug) {
    els.hero.classList.remove('hide');
    els.detail.classList.add('hide');
    document.getElementById('catalog').classList.remove('hide');
    els.watchlist.classList.add('hide');
    // Adjust filters
    const typeMap = { movies: 'movie', series: 'series', animation: 'animation' };
    state.filters.type = typeMap[slug] || 'all';
    applyFilters();
    renderPage(true);
  }

  function renderHome() {
    els.hero.classList.remove('hide');
    els.detail.classList.add('hide');
    document.getElementById('catalog').classList.remove('hide');
    els.watchlist.classList.add('hide');
    state.filters.type = 'all';
    applyFilters();
    renderPage(true);
  }

  function renderWatchlist() {
    els.hero.classList.add('hide');
    els.detail.classList.add('hide');
    document.getElementById('catalog').classList.add('hide');
    els.watchlist.classList.remove('hide');
    const items = state.allItems.filter(x => state.watchlist.has(x.id));
    els.watchlist.innerHTML = `<h2>لیستی سەیرکردن</h2>`;
    const wrap = document.createElement('div');
    wrap.className = 'grid';
    items.forEach(x => wrap.appendChild(renderCard(x)));
    els.watchlist.appendChild(wrap);
  }

  function observeScroll() {
    const sentinel = document.getElementById('loading');
    sentinel.classList.remove('hide');
    const io = new IntersectionObserver((entries, observer) => {
      if (entries[0].isIntersecting) {
        observer.unobserve(sentinel);
        toggleLoading(true);
        setTimeout(() => renderPage(false), 350);
      }
    });
    io.observe(sentinel);
  }

  function toggleLoading(isLoading) {
    els.loading.classList.toggle('hide', !isLoading);
  }

  function setupCardTilt() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
      card.onmousemove = (e) => {
        const r = card.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width/2);
        const dy = e.clientY - (r.top + r.height/2);
        const rx = (dy / r.height) * -6;
        const ry = (dx / r.width) * 6;
        card.style.setProperty('--rx', rx + 'deg');
        card.style.setProperty('--ry', ry + 'deg');
      };
      card.onmouseleave = () => {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      };
    });
  }

  // Events
  els.searchBtn.addEventListener('click', () => {
    state.filters.query = els.searchInput.value;
    applyFilters();
    renderPage(true);
  });
  els.searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') els.searchBtn.click();
  });
  els.filterType.addEventListener('change', (e) => { state.filters.type = e.target.value; applyFilters(); renderPage(true); });
  els.filterYear.addEventListener('change', (e) => { state.filters.year = e.target.value; applyFilters(); renderPage(true); });
  els.filterRating.addEventListener('change', (e) => { state.filters.rating = e.target.value; applyFilters(); renderPage(true); });
  els.clearFilters.addEventListener('click', () => {
    state.filters = { type: 'all', year: 'all', rating: 'all', query: '' };
    els.searchInput.value = '';
    els.filterType.value = 'all';
    els.filterYear.value = 'all';
    els.filterRating.value = 'all';
    applyFilters();
    renderPage(true);
  });

  els.toggleGrid.addEventListener('click', () => {
    state.view = 'grid';
    els.toggleGrid.classList.add('is-active');
    els.toggleList.classList.remove('is-active');
    document.querySelector('.catalog .grid').style.gridTemplateColumns = '';
  });
  els.toggleList.addEventListener('click', () => {
    state.view = 'list';
    els.toggleList.classList.add('is-active');
    els.toggleGrid.classList.remove('is-active');
    document.querySelector('.catalog .grid').style.gridTemplateColumns = '1fr';
  });

  document.body.addEventListener('click', (e) => {
    if (e.target?.hasAttribute('data-close-modal')) closeTrailer();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeTrailer(); });

  // Router bindings
  router.add('home', renderHome);
  router.add('detail', renderDetail);
  router.add('watchlist', renderWatchlist);
  router.add('category', renderHomeCategory);

  window.addEventListener('hashchange', () => router.navigate(location.hash));

  // Utils
  function escapeHtml(s) { return (s||'').replace(/[&<>"]/g, (c)=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c])); }
  function getInitials(title) {
    const parts = title.split(/\s+/).filter(Boolean).slice(0,2);
    return parts.map(x => x[0]?.toUpperCase()).join('');
  }
  function shuffle(arr){
    const a = arr.slice();
    for(let i=a.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
    return a;
  }
  function generateFallback(){
    const base = [
      { id: 'f1', title: 'Sample Movie', year: 2024, type: 'movie', rating: 8.4, genres: ['Action','Sci‑Fi'], trailerId: 'aqz-KE-bpKQ' },
      { id: 's1', title: 'Sample Series', year: 2023, type: 'series', rating: 8.1, genres: ['Drama'], trailerId: 'ysz5S6PUM-U' },
      { id: 'a1', title: 'Sample Animation', year: 2022, type: 'animation', rating: 8.9, genres: ['Animation','Family'], trailerId: 'aqz-KE-bpKQ' },
    ];
    const big = [];
    for (let i=0;i<50;i++) big.push(...base.map(x => ({...x, id: x.id + '-' + i})));
    return big;
  }

  // Boot
  loadData().then(() => router.navigate(location.hash));
})();

/* Ad engine shim for safe fills */
const AdEngine = (function(){
  const exists = typeof window !== 'undefined' && window.Adsterra && window.ADSTERRA_TAGS;
  function placeholder(el, label){
    const node = typeof el === 'string' ? document.getElementById(el) : el;
    if (!node) return;
    node.innerHTML = `
      <div>
        <div style="font-weight:700; color:#e8ecf1;">Ad Slot</div>
        <div class="ad-label">${label || 'Adsterra'}</div>
      </div>
    `;
  }
  return {
    safeFill: function(slotId, tagName) {
      try {
        if (exists) window.Adsterra.fill(slotId, tagName); else placeholder(slotId, tagName);
      } catch (e) { placeholder(slotId, tagName); }
    },
    tryInterstitial: function(){
      try { if (exists && window.Adsterra.interstitial) window.Adsterra.interstitial(); } catch {}
    }
  }
})();