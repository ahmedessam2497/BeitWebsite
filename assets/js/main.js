/* Beit Hend — interactions & scroll motion (no dependencies) */
(() => {
  'use strict';

  /* =========================================================
     SETTINGS — fill these in
     ========================================================= */
  // Cloudbeds booking engine link. Paste your property's booking URL and keep the
  // {checkin} {checkout} {adults} placeholders where Cloudbeds expects them.
  // Check the exact format in Cloudbeds > Booking Engine (deep-link / URL parameters).
  // Example: 'https://hotels.cloudbeds.com/en/reservation/XXXXXX?checkin={checkin}&checkout={checkout}&adults={adults}'
  const CLOUDBEDS_URL = '';

  /* ---------- Rooms content ---------- */
  const ROOMS = [
    { id:'siwa', name:'Siwa', ar:'سيوة', region:'The oasis', regionAr:'الواحة', img:'siwa-bedroom',
      short:'Lime-washed walls, cedar beams and the slow calm of the desert oasis.',
      text:'Inspired by the mud-brick houses of the Siwa oasis. Warm lime-washed walls, wooden ceiling beams, terracotta pottery and hand-woven rugs, with a freestanding bathtub for long, unhurried evenings.',
      feat:['Wooden ceiling beams','Freestanding bathtub','Walk-in shower','Hand-woven rugs & terracotta','Arched, filleted openings','Warm pendant lighting'],
      gallery:['siwa-bedroom','siwa-bedroom-tv-wall','siwa-bathroom'] },
    { id:'alexandria', name:'Alexandria', ar:'إسكندرية', region:'The sea', regionAr:'البحر', img:'alexandria-bedroom',
      short:'Mediterranean blues, linen light and a living area made for slow mornings.',
      text:'A breath of the Mediterranean. Soft whites and sea blues, light wooden beams and linen curtains that let the light in. A separate living area invites slow mornings, and the bathroom is tiled in the colours of the coast.',
      feat:['Separate living area','Sea-blue tiled bathroom','Light wood ceiling beams','Linen curtains','Walk-in shower','Coastal colour palette'],
      gallery:['alexandria-bedroom','alexandria-living-area','alexandria-bedroom-tv-wall','alexandria-bathroom-vanity','alexandria-bathroom-wc'] },
    { id:'cairo', name:'Cairo', ar:'القاهرة', region:'The old city', regionAr:'وسط البلد', img:'cairo-bedroom',
      short:'Deep green panelling, vintage art and the soul of downtown Cairo.',
      text:'A love letter to old Cairo. Deep green wainscoting, burgundy accents, vintage art and an antique-style vanity. A curved lounge for conversation and a clawfoot tub framed by arches.',
      feat:['Curved lounge corner','Clawfoot bathtub','Vintage art & photographs','Green panelled walls','Writing & vanity desk','Arched niches'],
      gallery:['cairo-bedroom','cairo-lounge','cairo-vanity-desk','cairo-bathroom-vanity','cairo-bathroom-shower'] },
    { id:'nubia', name:'Nubia', ar:'النوبة', region:'The south', regionAr:'الجنوب', img:'nubia-bedroom',
      short:'Woven textures, a beaded screen and the sun-warmed colours of the Nile’s south.',
      text:'Warm, generous and full of colour, like a Nubian home on the Nile. Woven rattan, a hand-beaded screen, terracotta and mustard tones, with a stone vessel basin in the bathroom.',
      feat:['Hand-beaded screen','Woven rattan details','Stone vessel basin','Round woven rug','Earthy terracotta tones','Walk-in shower'],
      gallery:['nubia-bedroom','nubia-bedroom-beaded-screen','nubia-bathroom'] },
    { id:'delta', name:'Delta', ar:'الدلتا', region:'The green fields', regionAr:'الغيطان', img:'delta-bedroom',
      short:'Olive tones, warm wood and a glowing hearth, rooted in the fields of the Delta.',
      text:'Grounded in the green fields of the Nile Delta. Olive and earth tones, warm ribbed wood panelling lit from within, a fireplace wall, and twin stone basins beneath arched mirrors.',
      feat:['Fireplace wall','Ribbed wood panelling','Twin stone basins','Arched mirrors','Olive & earth palette','Woven pendant lighting'],
      gallery:['delta-bedroom','delta-bedroom-tv-wall','delta-bathroom'] }
  ];

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const img = n => `assets/img/${n}.jpg`;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const root = document.documentElement;
  const isLanding = document.body.classList.contains('page-index');
  let vh = innerHeight, vw = root.clientWidth;
  const lock = on => { root.style.overflow = on ? 'hidden' : ''; };

  /* ---------- Page transitions (arch of light) ---------- */
  addEventListener('pageshow', e => { if (e.persisted) document.body.classList.remove('is-leaving'); });
  function leaveTo(href) {
    if (reduce) { location.href = href; return; }
    document.body.classList.add('is-leaving');
    setTimeout(() => { location.href = href; }, 720);
  }

  /* ---------- Menu ---------- */
  const menu = $('#menu');
  $('#menuOpen').addEventListener('click', () => { menu.classList.add('is-open'); menu.setAttribute('aria-hidden', 'false'); lock(true); });
  const closeMenu = () => { if (!menu.classList.contains('is-open')) return; menu.classList.remove('is-open'); menu.setAttribute('aria-hidden', 'true'); lock(false); };
  $('#menuClose').addEventListener('click', closeMenu);

  /* ---------- Hero (landing slideshow + word bar) ---------- */
  const hero = $('#hero'), heroMedia = $('#heroMedia');
  const slides = $$('.hero__slide'), words = $$('.hero__word');
  if (isLanding && slides.length > 1) {
    const keys = words.map(w => w.dataset.key);
    let idx = 0, timer, paused = false;
    const set = key => {
      idx = keys.indexOf(key);
      slides.forEach(s => {
        const on = s.dataset.key === key;
        if (on && !s.classList.contains('is-active')) { s.style.transition = 'none'; s.style.transform = 'scale(1.12)'; s.offsetWidth; s.style.transition = ''; s.style.transform = ''; }
        s.classList.toggle('is-active', on);
      });
      words.forEach(w => w.classList.toggle('is-active', w.dataset.key === key));
    };
    const nextSlide = () => { if (!paused) set(keys[(idx + 1) % keys.length]); };
    timer = setInterval(nextSlide, 6000);
    words.forEach(w => {
      w.addEventListener('mouseenter', () => { paused = true; set(w.dataset.key); });
      w.addEventListener('mouseleave', () => { paused = false; clearInterval(timer); timer = setInterval(nextSlide, 6000); });
    });
  }
  if (hero) setTimeout(() => hero.classList.add('ready'), 2200);

  /* ---------- Hero lamp: warm light follows the cursor ---------- */
  const lamp = $('#heroLamp');
  if (lamp && finePointer && !reduce) {
    let lx = vw / 2, ly = vh * .45, tx = lx, ty = ly, on = false;
    hero.addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; if (!on) { hero.classList.add('lamp-on'); on = true; } });
    hero.addEventListener('pointerleave', () => { hero.classList.remove('lamp-on'); on = false; });
    (function loop() { lx += (tx - lx) * .08; ly += (ty - ly) * .08; lamp.style.setProperty('--lx', lx + 'px'); lamp.style.setProperty('--ly', ly + 'px'); requestAnimationFrame(loop); })();
  }

  /* ---------- Rooms ---------- */
  const list = $('#roomList'), stage = $('#roomStage'), tag = $('#roomTag');
  let rows = [], stageImgs = [], activeRoom = 0, listHover = false;
  function setRoom(i) {
    if (i === activeRoom) return;
    activeRoom = i;
    rows.forEach((r, k) => r.classList.toggle('is-active', k === i));
    stageImgs.forEach((m, k) => m.classList.toggle('is-active', k === i));
    tag.textContent = `${ROOMS[i].name} · ${ROOMS[i].region}`;
  }
  if (list) {
    ROOMS.forEach((r, i) => {
      const row = document.createElement('button');
      row.className = 'room-row' + (i === 0 ? ' is-active' : '');
      row.dataset.i = i; row.dataset.cursor = 'view';
      row.innerHTML = `<div><div class="room-row__thumb"><img src="${img(r.img)}" alt="${r.name} room" loading="lazy"></div>
        <span class="region">${r.region} · ${r.regionAr}</span><h3>${r.name}<span class="ar">${r.ar}</span></h3><p>${r.short}</p>
        <span class="link more">Discover <span class="pill"><svg class="i" viewBox="0 0 24 24"><path d="M4 12h15M13 6l6 6-6 6"/></svg></span></span></div>
        <span class="num">0${i + 1}</span>`;
      list.appendChild(row);
      const im = document.createElement('img');
      im.src = img(r.img); im.alt = `${r.name} room`; if (i === 0) im.className = 'is-active'; else im.loading = 'lazy';
      stage.insertBefore(im, tag);
    });
    rows = $$('.room-row', list); stageImgs = $$('img', stage);
    rows.forEach(r => {
      r.addEventListener('mouseenter', () => { listHover = true; setRoom(+r.dataset.i); });
      r.addEventListener('mouseleave', () => { listHover = false; });
      r.addEventListener('click', () => openDrawer(+r.dataset.i));
    });
    stage.addEventListener('click', () => openDrawer(activeRoom));
  }
  function roomsByScroll() {
    if (!rows.length || listHover || vw <= 980) return;
    let best = 0, bd = 1e9;
    rows.forEach((r, i) => { const b = r.getBoundingClientRect(); const d = Math.abs(b.top + b.height / 2 - vh * .5); if (d < bd) { bd = d; best = i; } });
    setRoom(best);
  }

  /* ---------- Room drawer ---------- */
  const drawer = $('#drawer'), dSl = $('#drawerSlider');
  function openDrawer(i) {
    if (!drawer) return;
    const r = ROOMS[i];
    dSl.innerHTML = r.gallery.map(g => `<div class="g"><img src="${img(g)}" alt="${r.name} room"></div>`).join('');
    dSl.scrollLeft = 0;
    $('#drawerRegion').textContent = `0${i + 1} · ${r.region}`;
    $('#drawerTitle').textContent = r.name;
    $('#drawerAr').textContent = r.ar;
    $('#drawerText').textContent = r.text;
    $('#drawerFeat').innerHTML = r.feat.map(f => `<li>${f}</li>`).join('');
    $('#drawerBook').href = `stay.html?room=${encodeURIComponent(r.name)}`;
    $('.drawer__panel', drawer).scrollTop = 0;
    drawer.classList.add('is-open'); drawer.setAttribute('aria-hidden', 'false'); lock(true);
    const cur = $('.cursor'); cur && cur.classList.remove('is-view');
    dSl._update && dSl._update();
  }
  function closeDrawer() { if (!drawer || !drawer.classList.contains('is-open')) return; drawer.classList.remove('is-open'); drawer.setAttribute('aria-hidden', 'true'); lock(false); }
  if (drawer) $$('[data-close]', drawer).forEach(b => b.addEventListener('click', closeDrawer));
  addEventListener('keydown', e => { if (e.key === 'Escape') { closeDrawer(); closeMenu(); } });

  /* ---------- Split text ---------- */
  function splitWords(el, cls) {
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const s = document.createElement('span');
            if (cls === 'wd') { s.className = 'wd'; const inner = document.createElement('span'); inner.textContent = part; s.appendChild(inner); }
            else { s.className = 'w'; s.textContent = part; }
            frag.appendChild(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
  }
  $$('[data-split]').forEach(el => { splitWords(el, 'wd'); $$('.wd>span', el).forEach((s, i) => s.style.transitionDelay = (i * .035) + 's'); });
  const fills = $$('[data-fill]').map(el => { splitWords(el, 'w'); return { el, words: $$('.w', el), last: -1 }; });

  /* ---------- Reveal on view ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -12% 0px' });
  $$('.rv,.rv-mask,.split').forEach(el => io.observe(el));

  /* ---------- Smooth wheel scrolling (desktop) ---------- */
  let target = scrollY, current = scrollY, smoothing = false;
  const maxScroll = () => root.scrollHeight - vh;
  if (!reduce && finePointer && !isLanding) {
    addEventListener('wheel', e => {
      if (e.ctrlKey || root.style.overflow === 'hidden') return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      if (!smoothing) target = current = scrollY;
      target = clamp(target + e.deltaY * (e.deltaMode === 1 ? 40 : 1), 0, maxScroll());
      smoothing = true;
    }, { passive: false });
  }
  addEventListener('scroll', () => { if (!smoothing) target = current = scrollY; }, { passive: true });
  function scrollToY(y) {
    y = clamp(y, 0, maxScroll());
    if (reduce || !finePointer) { scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' }); return; }
    current = scrollY; target = y; smoothing = true;
  }

  /* ---------- Links: in-page anchors scroll, other pages get the curtain ---------- */
  $$('a[href]').forEach(a => a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (a.hasAttribute('data-ph')) { e.preventDefault(); return; }
    if (e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
    if (href.startsWith('#')) {
      const el = href === '#top' ? document.body : $(href);
      if (!el) return;
      e.preventDefault(); closeMenu(); closeDrawer();
      scrollToY(href === '#top' ? 0 : el.getBoundingClientRect().top + scrollY - 40);
      return;
    }
    if (/^https?:|^mailto:|^tel:/.test(href)) return;
    e.preventDefault();
    leaveTo(href);
  }));

  /* ---------- Registries ---------- */
  const nav = $('#nav');
  const pxEls = $$('[data-speed]').map(el => ({ el, speed: +el.dataset.speed, y: 0 }));
  const pxImgs = $$('.px').map(f => ({ f, im: $('img', f) }));
  const waves = $$('.wave svg');
  const acts = $('#acts'), track = $('#actsTrack'), bar = $('#actsBar');
  let actsDist = 0;
  function sizeActs() { if (!acts) return; actsDist = Math.max(0, track.scrollWidth - vw); acts.style.height = (actsDist + vh) + 'px'; }
  const gWin = $('#gardenWindow'), gImg = gWin && $('img', gWin);
  let lastY = scrollY;

  /* ---------- Threshold: Hend's door opens ---------- */
  const th = $('#threshold');
  let threshold = () => {};
  if (th) {
    const thRoom = $('#thRoom'), thImg = $('img', thRoom), thDoors = $('#thDoors'), thFrame = $('#thFrame'),
          thGlow = $('#thGlow'), thT1 = $('#thT1'), thT2 = $('#thT2'), thHint = $('#thHint');
    const [leafL, leafR] = $$('.th__leaf', thDoors);
    const ease = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    const doorRect = () => {
      const H0 = vh * (vw < 700 ? .5 : .56), W = Math.min(vw * (vw < 700 ? .6 : .26), 380, H0 / 1.5), H = Math.min(W * 1.62, H0);
      const t1 = thT1.offsetTop + thT1.offsetHeight + 28;
      return { W, H, x: (vw - W) / 2, y: Math.max(t1, (vh - H) / 2 + vh * .06) };
    };
    threshold = () => {
      const r = th.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      const p = clamp(-r.top / Math.max(1, r.height - vh)), d = doorRect();
      const pOpen = ease(clamp(p / .42)), pGrow = ease(clamp((p - .38) / .5));
      Object.assign(thDoors.style, { left: d.x + 'px', top: d.y + 'px', width: d.W + 'px', height: d.H + 'px', opacity: 1 - clamp((p - .5) / .12) });
      Object.assign(thFrame.style, { left: (d.x - 14) + 'px', top: (d.y - 14) + 'px', width: (d.W + 28) + 'px', height: (d.H + 14) + 'px', opacity: .5 * (1 - pGrow) });
      leafL.style.borderRadius = `${d.W / 2}px 0 0 0`; leafR.style.borderRadius = `0 ${d.W / 2}px 0 0`;
      leafL.style.transform = `rotateY(${-pOpen * 112}deg)`; leafR.style.transform = `rotateY(${pOpen * 112}deg)`;
      const ix = d.x * (1 - pGrow), it = d.y * (1 - pGrow), ib = (vh - d.y - d.H) * (1 - pGrow), rad = (d.W / 2) * (1 - pGrow);
      thRoom.style.clipPath = `inset(${it}px ${ix}px ${ib}px ${ix}px round ${rad}px ${rad}px 0 0)`;
      thImg.style.transform = `scale(${1.35 - pGrow * .35})`;
      thRoom.style.setProperty('--dim', (pGrow * .32).toFixed(3));
      thGlow.style.opacity = (pOpen * (1 - pGrow)).toFixed(3);
      thT1.style.opacity = (1 - clamp(p / .22)).toFixed(3);
      thT1.style.transform = `translateY(${-p * 80}px)`;
      thHint.style.opacity = (1 - clamp(p / .1)).toFixed(3);
      thT2.style.opacity = clamp((p - .72) / .16).toFixed(3);
      thT2.style.transform = `translateY(calc(-50% + ${(1 - clamp((p - .72) / .2)) * 40}px))`;
    };
  }

  /* ---------- Main loop ---------- */
  function frame(t) {
    if (smoothing) {
      current += (target - current) * .09;
      if (Math.abs(target - current) < .4) { current = target; smoothing = false; }
      scrollTo(0, current);
    }
    const y = scrollY;
    if (!isLanding) {
      nav.classList.toggle('is-solid', y > vh * .75);
      if (Math.abs(y - lastY) > 4) { nav.classList.toggle('is-hidden', y > lastY && y > vh * 1.2); lastY = y; }
    }
    if (!reduce) {
      if (heroMedia && y < vh * 1.2) heroMedia.style.transform = `translate3d(0,${y * .38}px,0)`;
      pxEls.forEach(p => {
        const r = p.el.getBoundingClientRect(), top = r.top - p.y;
        if (top > vh * 1.5 || top + r.height < -vh * .5) return;
        p.y = (top + r.height / 2 - vh / 2) * p.speed;
        p.el.style.translate = `0 ${p.y.toFixed(1)}px`;
      });
      pxImgs.forEach(({ f, im }) => {
        const r = f.getBoundingClientRect();
        if (r.top > vh || r.bottom < 0) return;
        const prog = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
        im.style.translate = `0 ${(-prog * r.height * .1).toFixed(1)}px`;
      });
      if (gWin) {
        const gr = gWin.getBoundingClientRect();
        if (gr.top < vh && gr.bottom > 0) {
          const e = 1 - Math.pow(1 - clamp((vh - gr.top) / (vh * .95)), 3);
          const sx = (1 - e) * 28, sy = (1 - e) * 10, rad = (1 - e) * 600;
          gWin.style.clipPath = `inset(${sy}% ${sx}% 0% ${sx}% round ${rad}px ${rad}px 0 0)`;
          gImg.style.translate = `0 ${((gr.top + gr.height / 2 - vh / 2) * -.12).toFixed(1)}px`;
          gImg.style.scale = (1.15 - e * .15).toFixed(3);
        }
      }
      waves.forEach((w, i) => {
        const x = ((y * (i % 2 ? .05 : .09) + t * .004 * (i % 2 ? 1 : -1)) % 50 + 50) % 50;
        w.style.transform = `translate3d(${-x}%,0,0)`;
      });
      threshold();
    }
    fills.forEach(f => {
      const r = f.el.getBoundingClientRect();
      const n = Math.round(clamp((vh * .88 - r.top) / (r.height + vh * .45)) * f.words.length);
      if (n !== f.last) { f.words.forEach((w, i) => w.classList.toggle('on', i < n)); f.last = n; }
    });
    if (acts) {
      const ap = clamp(-acts.getBoundingClientRect().top / Math.max(1, actsDist));
      track.style.transform = `translate3d(${(-ap * actsDist).toFixed(1)}px,0,0)`;
      bar.style.transform = `scaleX(${ap})`;
    }
    roomsByScroll();
    requestAnimationFrame(frame);
  }

  /* ---------- Sliders ---------- */
  function initSlider(sl) {
    const nv = $(`.slider__nav[data-for="${sl.id}"]`), count = nv && $('.slider__count', nv);
    const items = () => [...sl.children];
    const idx = () => { const pad = parseFloat(getComputedStyle(sl).paddingLeft) || 0; let b = 0, bd = 1e9; items().forEach((c, i) => { const d = Math.abs(c.offsetLeft - sl.offsetLeft - pad - sl.scrollLeft); if (d < bd) { bd = d; b = i; } }); return b; };
    const update = () => {
      if (!nv) return;
      const it = items(), atEnd = sl.scrollLeft + sl.clientWidth >= sl.scrollWidth - 4, i = atEnd ? it.length - 1 : idx();
      count.textContent = `${i + 1} / ${it.length}`;
      $('.prev', nv).disabled = sl.scrollLeft < 4; $('.next', nv).disabled = atEnd;
    };
    const go = d => { const it = items(), i = clamp(idx() + d, 0, it.length - 1); sl.scrollTo({ left: it[i].offsetLeft - it[0].offsetLeft, behavior: 'smooth' }); };
    if (nv) { $('.prev', nv).onclick = () => go(-1); $('.next', nv).onclick = () => go(1); }
    sl.addEventListener('scroll', update, { passive: true });
    sl.tabIndex = 0;
    sl.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { e.preventDefault(); go(1); } if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); } });
    let down = false, sx = 0, sl0 = 0, moved = false;
    sl.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl0 = sl.scrollLeft; });
    addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 4) { moved = true; sl.classList.add('dragging'); } sl.scrollLeft = sl0 - dx; });
    addEventListener('pointerup', () => { if (!down) return; down = false; sl.classList.remove('dragging'); if (moved) { const it = items(); sl.scrollTo({ left: it[idx()].offsetLeft - it[0].offsetLeft, behavior: 'smooth' }); } });
    sl.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
    sl._update = update; update();
  }

  /* ---------- Cursor ---------- */
  if (finePointer) {
    const c = $('.cursor'); let cx = vw / 2, cy = vh / 2, tx = cx, ty = cy;
    addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; const v = e.target.closest && e.target.closest('[data-cursor="view"]'); c.classList.toggle('is-view', !!v && !(drawer && drawer.classList.contains('is-open'))); });
    (function loop() { cx += (tx - cx) * .2; cy += (ty - cy) * .2; c.style.transform = `translate3d(${cx}px,${cy}px,0)`; requestAnimationFrame(loop); })();
  }

  /* ---------- Booking form → Cloudbeds ---------- */
  const form = $('#bookForm');
  if (form) {
    const sel = $('#roomSelect');
    ROOMS.forEach(r => { const o = document.createElement('option'); o.value = r.name; o.textContent = `${r.name} · ${r.ar}`; sel.appendChild(o); });
    const want = new URLSearchParams(location.search).get('room');
    if (want && ROOMS.some(r => r.name === want)) sel.value = want;
    const today = new Date().toISOString().slice(0, 10);
    form.in.min = today; form.out.min = today;
    form.in.addEventListener('change', () => { form.out.min = form.in.value; if (form.out.value && form.out.value <= form.in.value) form.out.value = ''; });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const note = $('.book__note', form);
      if (!CLOUDBEDS_URL) { note.textContent = 'Online booking is being connected. Your dates: ' + form.in.value + ' → ' + form.out.value + ', ' + form.guests.value + ' guest(s).'; return; }
      const url = CLOUDBEDS_URL.replace('{checkin}', form.in.value).replace('{checkout}', form.out.value).replace('{adults}', form.guests.value);
      location.href = url;
    });
  }

  /* ---------- Init ---------- */
  function resize() { vh = innerHeight; vw = root.clientWidth; sizeActs(); }
  addEventListener('resize', resize);
  addEventListener('load', resize);
  resize();
  $$('.slider').forEach(initSlider);
  requestAnimationFrame(frame);
})();
