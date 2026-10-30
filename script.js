(() => {
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Scroll-reveal engine (24 animations) ---------- */
  const ANIMS = ['fade-up','fade-down','slide-left','slide-right','zoom-in','zoom-out','blur-in','flip','flip-y','rotate-in','skew-in','bounce-in','elastic','swing','clip-left','clip-up','curtain','spiral','roll-in','drop','tilt-3d','light-speed','focus-in','rubber'];
  const known = new Set(ANIMS);
  let auto = 0;
  $$('.reveal').forEach(el => {
    const want = (el.dataset.anim || 'auto').split(' ').find(a => known.has(a));
    el.dataset.a = want || ANIMS[auto++ % ANIMS.length];   // 'auto' cards cycle through every effect
  });
  $$('[data-stagger]').forEach(p => $$('.reveal, .tech-tag', p).forEach((c, i) => c.style.setProperty('--d', i * 0.07 + 's')));
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target; el.classList.add('in'); io.unobserve(el);
    const finish = () => el.classList.add('done');
    el.addEventListener('animationend', finish, { once: true });
    setTimeout(finish, 2200);
    if (el.querySelector('[data-count]')) countUp($('[data-count]', el));
    if (el.matches('[data-count]')) countUp(el);
  }), { threshold: .15, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal').forEach(el => io.observe(el));
  if (reduce) $$('.reveal').forEach(el => el.classList.add('done'));

  /* ---------- 2. Counters ---------- */
  function countUp(el) {
    const b = el.matches('b') ? el : $('b', el); if (!b || b.dataset.ran) return; b.dataset.ran = 1;
    const to = parseFloat(b.dataset.count), dec = +b.dataset.dec || 0, suf = b.dataset.suffix || '', t0 = performance.now();
    const step = t => { const p = Math.min((t - t0) / 1800, 1), v = to * (1 - Math.pow(1 - p, 4));
      b.textContent = v.toFixed(dec) + suf; p < 1 && requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }

  /* ---------- 3. Hero: letter-by-letter H1 + typing ---------- */
  const h1 = $('h1.hero-title');
  if (h1) { const txt = h1.textContent.trim(); h1.setAttribute('aria-label', txt); h1.textContent = '';
    [...txt].forEach((c, i) => { const s = document.createElement('span'); s.className = 'ch'; s.setAttribute('aria-hidden', 'true');
      s.style.animationDelay = (.25 + i * .04) + 's'; s.innerHTML = c === ' ' ? '&nbsp;' : c; h1.appendChild(s); }); }
  const typed = $('#typed');
  if (typed) { const words = ['WordPress websites','PHP & Laravel apps','Flutter mobile apps','Hosting, DNS & Cloudflare','Shopify stores','SEO-ready builds'];
    let w = 0, i = 0, del = false;
    (function tick() { const cur = words[w]; typed.textContent = cur.slice(0, i);
      if (!del && i === cur.length) { del = true; return setTimeout(tick, 1500); }
      if (del && i === 0) { del = false; w = (w + 1) % words.length; }
      i += del ? -1 : 1; setTimeout(tick, del ? 35 : 75); })(); }

  /* ---------- 4. Progress, nav, back-to-top, timeline fill, parallax ---------- */
  const nav = $('#navbar'), bar = $('#progress'), top = $('#toTop'), tl = $('.timeline'), bg = $('.parallax-bg');
  let lastY = 0;
  const links = $$('.nav-links a'), secs = links.map(a => $(a.getAttribute('href')));
  const onScroll = () => {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (y / h * 100) + '%';
    nav.classList.toggle('scrolled', y > 20); nav.classList.toggle('hide', y > lastY && y > 300); lastY = y;
    top.classList.toggle('show', y > 600);
    if (tl) { const r = tl.getBoundingClientRect(); tl.style.setProperty('--tl', Math.min(100, Math.max(0, (innerHeight * .6 - r.top) / r.height * 100)) + '%'); }
    if (!reduce && bg) bg.style.transform = `translateY(${y * .25}px)`;
    $$('.shape').forEach((s, i) => s.style.translate = `0 ${y * (.06 + i * .04)}px`);
    secs.forEach((s, i) => { if (!s) return; const r = s.getBoundingClientRect(); links[i].classList.toggle('active', r.top < innerHeight * .4 && r.bottom > innerHeight * .4); });
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  top.onclick = () => scrollTo({ top: 0, behavior: 'smooth' });
  const cb = $('#contactBtn'); cb && (cb.onclick = () => $('#contact').scrollIntoView({ behavior: 'smooth' }));

  /* ---------- 5. Cursor glow, 3D tilt, magnetic buttons, ripple ---------- */
  const glow = $('#cursorGlow');
  addEventListener('pointermove', e => { glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px'; });
  $$('.tilt').forEach(el => {
    el.addEventListener('pointermove', e => { if (!el.classList.contains('done') || el.closest('.slider')) return;
      const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      el.style.setProperty('--ry2', x * 7 + 'deg'); el.style.setProperty('--rx', -y * 7 + 'deg'); });
    el.addEventListener('pointerleave', () => { el.style.setProperty('--ry2', '0deg'); el.style.setProperty('--rx', '0deg'); });
  });
  $$('.btn, .contact-btn, .contact-link').forEach(b => {
    b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .2}px,${(e.clientY - r.top - r.height / 2) * .3}px)`; });
    b.addEventListener('pointerleave', () => b.style.transform = '');
    b.addEventListener('click', e => { const r = b.getBoundingClientRect(), s = document.createElement('span'), d = Math.max(r.width, r.height);
      s.className = 'ripple'; s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
      b.appendChild(s); setTimeout(() => s.remove(), 700); });
  });

  /* ---------- 6. Horizontal 3D coverflow slider ---------- */
  const sl = $('#slider'); if (!sl) return;
  const vp = $('.slider-viewport', sl), track = $('.slider-track', sl), cards = $$('.project-card', track), dots = $('#dots');
  let idx = 0, timer, dragX = null, base = 0;
  cards.forEach((_, i) => { const d = document.createElement('button'); d.setAttribute('aria-label', 'Go to slide ' + (i + 1)); d.onclick = () => go(i, true); dots.appendChild(d); });
  const offsetFor = i => { const c = cards[i]; return vp.clientWidth / 2 - (c.offsetLeft + c.offsetWidth / 2); };
  function go(i, user) {
    idx = (i + cards.length) % cards.length; base = offsetFor(idx);
    track.style.transform = `translate3d(${base}px,0,0)`;
    cards.forEach((c, k) => { const d = k - idx;
      c.classList.toggle('is-active', d === 0); c.classList.toggle('is-near', Math.abs(d) === 1);
      c.style.setProperty('--ry', d === 0 ? '0deg' : (d > 0 ? -18 : 18) + 'deg'); });
    $$('button', dots).forEach((d, k) => d.classList.toggle('on', k === idx));
    if (user) restart();
  }
  const restart = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => go(idx + 1), 4200); };
  $('.prev', sl).onclick = () => go(idx - 1, true); $('.next', sl).onclick = () => go(idx + 1, true);
  cards.forEach((c, k) => c.addEventListener('click', () => { if (!moved) go(k, true); }));
  let moved = false;
  vp.addEventListener('pointerdown', e => { dragX = e.clientX; moved = false; vp.classList.add('drag'); track.style.transition = 'none'; clearInterval(timer); });
  addEventListener('pointermove', e => { if (dragX === null) return; const dx = e.clientX - dragX; if (Math.abs(dx) > 6) moved = true;
    track.style.transform = `translate3d(${base + dx}px,0,0)`; });
  addEventListener('pointerup', e => { if (dragX === null) return; const dx = e.clientX - dragX; dragX = null; vp.classList.remove('drag'); track.style.transition = '';
    go(Math.abs(dx) > 60 ? idx + (dx < 0 ? 1 : -1) : idx, true); setTimeout(() => moved = false, 0); });
  vp.addEventListener('wheel', e => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 30) { e.preventDefault(); go(idx + (e.deltaX > 0 ? 1 : -1), true); } }, { passive: false });
  addEventListener('keydown', e => { const r = sl.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) { if (e.key === 'ArrowRight') go(idx + 1, true); if (e.key === 'ArrowLeft') go(idx - 1, true); } });
  sl.addEventListener('pointerenter', () => clearInterval(timer)); sl.addEventListener('pointerleave', restart);
  addEventListener('resize', () => go(idx)); addEventListener('load', () => go(idx));
  go(0); restart();
})();
