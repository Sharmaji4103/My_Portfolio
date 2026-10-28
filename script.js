(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* Contact button */
  $('#contactBtn').addEventListener('click', function () {
    $('#contact').scrollIntoView({ behavior: 'smooth' });
  });

  /* Stagger delays + auto directions (timeline left/right) */
  $$('[data-stagger]').forEach(function (g) {
    $$('.reveal, .tech-tag', g).forEach(function (el, i) {
      el.style.setProperty('--d', Math.min(i * 0.07, 1.2) + 's');
    });
  });
  $$('.timeline-item').forEach(function (item, i) {
    var c = $('.timeline-content', item);
    c.setAttribute('data-anim', i % 2 === 0 ? 'slide-left' : 'slide-right');
  });
  $$('.project-tech').forEach(function (g) {
    $$('.tech-tag', g).forEach(function (t, i) {
      t.classList.add('reveal');
      t.setAttribute('data-anim', 'zoom-in');
      t.style.setProperty('--d', i * 0.07 + 's');
    });
  });

  /* Reveal on scroll (IntersectionObserver) */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(function (el) { io.observe(el); });

  /* Typing effect */
  var words = ['PHP & Laravel development', 'Flutter mobile app development', 'WordPress & WooCommerce', 'Hosting, DNS & Cloudflare', 'Shopify & SEO optimisation'];
  var typed = $('#typed'), w = 0, c = 0, del = false;
  (function type() {
    var word = words[w];
    typed.textContent = word.slice(0, c);
    if (!del && c < word.length) { c++; setTimeout(type, 70); }
    else if (!del) { del = true; setTimeout(type, 1500); }
    else if (c > 0) { c--; setTimeout(type, 35); }
    else { del = false; w = (w + 1) % words.length; setTimeout(type, 300); }
  })();

  /* Counters */
  var cio = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target, end = parseFloat(el.dataset.count), dec = +el.dataset.dec || 0, suf = el.dataset.suffix || '', t0 = null;
      (function step(t) {
        if (!t0) t0 = t;
        var p = Math.min((t - t0) / 1800, 1), eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (end * eased).toFixed(dec) + (p === 1 ? suf : '');
        if (p < 1) requestAnimationFrame(step);
      })(performance.now());
      cio.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach(function (el) { cio.observe(el); });

  /* 3D tilt on cards */
  $$('.tilt').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty('--ry', (x * 8) + 'deg');
      card.style.setProperty('--rx', (-y * 8) + 'deg');
      if (!card.classList.contains('reveal')) card.style.transform = 'perspective(900px) rotateX(' + (-y * 8) + 'deg) rotateY(' + (x * 8) + 'deg)';
    });
    card.addEventListener('mouseleave', function () {
      card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg');
      if (!card.classList.contains('reveal')) card.style.transform = '';
    });
  });

  /* Button ripple */
  $$('.btn').forEach(function (b) {
    b.addEventListener('click', function (e) {
      var r = b.getBoundingClientRect(), s = document.createElement('span'), d = Math.max(r.width, r.height);
      s.className = 'ripple';
      s.style.cssText = 'width:' + d + 'px;height:' + d + 'px;left:' + (e.clientX - r.left - d / 2) + 'px;top:' + (e.clientY - r.top - d / 2) + 'px';
      b.appendChild(s); setTimeout(function () { s.remove(); }, 600);
    });
  });

  /* Cursor glow */
  var glow = $('#cursorGlow');
  document.addEventListener('mousemove', function (e) { glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px'; });

  /* Scroll effects: progress bar, navbar hide/show, parallax, timeline draw, active link, back-to-top */
  var nav = $('#navbar'), prog = $('#progress'), bg = $('.parallax-bg'), tl = $('.timeline'),
      toTop = $('#toTop'), links = $$('.nav-links a'), secs = links.map(function (a) { return $(a.getAttribute('href')); }),
      lastY = 0, ticking = false;

  function onScroll() {
    var y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
    prog.style.width = (y / h * 100) + '%';
    nav.classList.toggle('scrolled', y > 50);
    nav.classList.toggle('hide', y > lastY && y > 500);
    lastY = y;
    if (y < innerHeight * 1.2) bg.style.transform = 'translateY(' + (y * 0.3) + 'px)';
    var r = tl.getBoundingClientRect();
    tl.style.setProperty('--p', Math.max(0, Math.min(1, (innerHeight * 0.6 - r.top) / r.height)));
    toTop.classList.toggle('show', y > 600);
    var cur = 0;
    secs.forEach(function (s, i) { if (s && s.getBoundingClientRect().top < innerHeight * 0.4) cur = i; });
    links.forEach(function (a, i) { a.classList.toggle('active', i === cur); });
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  onScroll();
  toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  /* Industry slider: autoplay, arrows, dots, drag/swipe */
  var slider = $('#slider'), track = $('.slider-track', slider), cards = $$('.project-card', slider),
      dotsBox = $('#dots'), idx = 0, pv = 3, timer, startX = 0, dx = 0, dragging = false;

  function perView() { return innerWidth < 700 ? 1 : innerWidth < 1100 ? 2 : 3; }
  function maxIdx() { return cards.length - pv; }
  function buildDots() {
    dotsBox.innerHTML = '';
    for (var i = 0; i <= maxIdx(); i++) {
      (function (n) {
        var b = document.createElement('button'); b.setAttribute('aria-label', 'Slide ' + (n + 1));
        b.addEventListener('click', function () { go(n); restart(); });
        dotsBox.appendChild(b);
      })(i);
    }
  }
  function go(n) {
    idx = n > maxIdx() ? 0 : n < 0 ? maxIdx() : n;
    track.style.transform = 'translateX(' + (-idx * 100 / pv) + '%)';
    $$('button', dotsBox).forEach(function (d, i) { d.classList.toggle('on', i === idx); });
    cards.forEach(function (c, i) { c.classList.toggle('is-active', i >= idx && i < idx + pv); });
  }
  function restart() { clearInterval(timer); timer = setInterval(function () { go(idx + 1); }, 3800); }
  function layout() { pv = perView(); slider.style.setProperty('--pv', pv); buildDots(); go(Math.min(idx, maxIdx())); }

  $('.next', slider).addEventListener('click', function () { go(idx + 1); restart(); });
  $('.prev', slider).addEventListener('click', function () { go(idx - 1); restart(); });
  slider.addEventListener('mouseenter', function () { clearInterval(timer); });
  slider.addEventListener('mouseleave', restart);

  var vp = $('.slider-viewport', slider);
  vp.addEventListener('pointerdown', function (e) { dragging = true; startX = e.clientX; dx = 0; track.classList.add('drag'); });
  window.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    dx = e.clientX - startX;
    track.style.transform = 'translateX(calc(' + (-idx * 100 / pv) + '% + ' + dx + 'px))';
  });
  window.addEventListener('pointerup', function () {
    if (!dragging) return;
    dragging = false; track.classList.remove('drag');
    if (dx < -60) go(idx + 1); else if (dx > 60) go(idx - 1); else go(idx);
    restart();
  });
  window.addEventListener('resize', layout);
  layout(); restart();
})();
