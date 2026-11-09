/* =========================================================
   GUANXIANG CAPITAL / shared behaviour
   No frameworks, no CDN, no external requests.
   ========================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var THEME_KEY = 'gx-theme';

  /* ---------- THEME (dark by default, single theme lock) ---------- */
  var themeBtn = document.getElementById('themeToggle');
  var sun = themeBtn && themeBtn.querySelector('.ico-sun');
  var moon = themeBtn && themeBtn.querySelector('.ico-moon');

  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    if (sun && moon) {
      sun.style.display = t === 'dark' ? 'block' : 'none';
      moon.style.display = t === 'light' ? 'block' : 'none';
    }
    if (themeBtn) {
      themeBtn.setAttribute('aria-label', t === 'dark' ? '切换到亮色主题' : '切换到暗色主题');
      themeBtn.setAttribute('title', t === 'dark' ? '切换到亮色主题' : '切换到暗色主题');
    }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'dark' ? '#0A0B1A' : '#F4F2FB');
  }

  var saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
  applyTheme(saved === 'light' ? 'light' : 'dark');

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
    });
  }

  /* ---------- MOBILE MENU ---------- */
  var burger = document.getElementById('navBurger');
  var menu = document.getElementById('mobileMenu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        menu.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        menu.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- INTERSECTION OBSERVER ENTRY ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          revealObserver.unobserve(e.target);
        }
      });
    }, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  }

  var grid = document.querySelector('.features-grid[data-stagger]');
  if (grid) {
    var cards = grid.querySelectorAll('.feature');
    if (reduce || !('IntersectionObserver' in window)) {
      cards.forEach(function (c) { c.classList.add('in'); });
    } else {
      var featureObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            cards.forEach(function (c, i) {
              setTimeout(function () { c.classList.add('in'); }, i * 80);
            });
            featureObserver.unobserve(e.target);
          }
        });
      }, { threshold: 0.05 });
      featureObserver.observe(grid);
    }
  }

  /* ---------- TOAST ---------- */
  var toast = document.getElementById('toast');
  var toastMsg = document.getElementById('toastMsg');
  var toastIco = document.getElementById('toastIco');
  var toastTimer = null;
  var ICO_OK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
  var ICO_ERR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';

  function showToast(msg, ok) {
    if (!toast || !toastMsg) return;
    toastMsg.textContent = msg;
    toast.classList.toggle('err', !ok);
    if (toastIco) toastIco.innerHTML = ok ? ICO_OK : ICO_ERR;
    toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 3800);
  }
  window.gxToast = showToast;

  /* ---------- CONTACT FORM (loading + toast) ---------- */
  var contact = document.getElementById('contactForm');
  if (contact) {
    contact.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = contact.querySelector('[name="name"]');
      var phone = contact.querySelector('[name="phone"]');
      var btn = contact.querySelector('[type="submit"]');
      var label = btn && btn.querySelector('.btn-label');
      if (!name || !name.value.trim()) {
        showToast('请填写您的称呼', false);
        name && name.focus();
        return;
      }
      if (!phone || !/^[0-9+\-\s]{7,20}$/.test(phone.value.trim())) {
        showToast('请填写有效的联系电话', false);
        phone && phone.focus();
        return;
      }
      var original = label ? label.innerHTML : '';
      if (btn) btn.disabled = true;
      if (label) label.innerHTML = '<span class="spin" aria-hidden="true"></span><span>提交中</span>';
      setTimeout(function () {
        if (btn) btn.disabled = false;
        if (label) label.innerHTML = original;
        contact.reset();
        showToast('需求已记录，顾问将尽快与您联系', true);
      }, 1100);
    });
  }

  /* ---------- FAQ ACCORDION ---------- */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var btn = item.querySelector('.faq-q');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var open = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function (it) {
        it.classList.remove('open');
        var b = it.querySelector('.faq-q');
        if (b) b.setAttribute('aria-expanded', 'false');
      });
      if (!open) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- TESTIMONIAL CAROUSEL (autoplay + drag) ---------- */
  var track = document.getElementById('carouselTrack');
  var viewport = document.getElementById('carouselViewport');
  var dotsWrap = document.getElementById('dots');
  if (track && viewport && dotsWrap) {
    var slides = Array.prototype.slice.call(track.children);
    var N = slides.length;
    var idx = 0;
    var auto = null;

    for (var i = 0; i < N; i++) {
      (function (n) {
        var b = document.createElement('button');
        b.className = 'dot-btn' + (n === 0 ? ' active' : '');
        b.setAttribute('aria-label', '查看第 ' + (n + 1) + ' 条客户反馈');
        b.setAttribute('role', 'tab');
        b.addEventListener('click', function () { go(n, true); });
        dotsWrap.appendChild(b);
      })(i);
    }
    var dots = Array.prototype.slice.call(dotsWrap.children);

    function go(n, fromUser) {
      idx = (n + N) % N;
      track.style.transform = 'translate3d(' + (-idx * 100) + '%,0,0)';
      dots.forEach(function (d, k) { d.classList.toggle('active', k === idx); });
      if (fromUser) restartAuto();
    }
    function next() { go(idx + 1); }
    function prev() { go(idx - 1); }
    function startAuto() { if (!reduce && !auto) auto = setInterval(next, 5200); }
    function stopAuto() { if (auto) { clearInterval(auto); auto = null; } }
    function restartAuto() { stopAuto(); startAuto(); }

    var pb = document.getElementById('prev');
    var nb = document.getElementById('next');
    if (pb) pb.addEventListener('click', function () { prev(); restartAuto(); });
    if (nb) nb.addEventListener('click', function () { next(); restartAuto(); });

    viewport.tabIndex = 0;
    viewport.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { prev(); restartAuto(); }
      if (e.key === 'ArrowRight') { next(); restartAuto(); }
    });

    var dragging = false, startX = 0, startTx = 0, curTx = 0, width = 0;
    function onDown(x) {
      dragging = true;
      viewport.classList.add('dragging');
      startX = x;
      width = viewport.clientWidth;
      startTx = -idx * width;
      curTx = startTx;
      track.style.transition = 'none';
      stopAuto();
    }
    function onMove(x) {
      if (!dragging) return;
      curTx = startTx + (x - startX);
      var min = -(N - 1) * width;
      if (curTx > 0) curTx = curTx * 0.3;
      if (curTx < min) curTx = min + (curTx - min) * 0.3;
      track.style.transform = 'translate3d(' + curTx + 'px,0,0)';
    }
    function onUp() {
      if (!dragging) return;
      dragging = false;
      viewport.classList.remove('dragging');
      track.style.transition = '';
      var diff = curTx - (-idx * width);
      var threshold = width * 0.16;
      var target = idx;
      if (diff < -threshold) target = Math.min(idx + 1, N - 1);
      else if (diff > threshold) target = Math.max(idx - 1, 0);
      go(target, true);
    }
    viewport.addEventListener('pointerdown', function (e) {
      try { viewport.setPointerCapture(e.pointerId); } catch (err) {}
      onDown(e.clientX);
    });
    viewport.addEventListener('pointermove', function (e) { onMove(e.clientX); });
    viewport.addEventListener('pointerup', function (e) {
      try { viewport.releasePointerCapture(e.pointerId); } catch (err) {}
      onUp();
    });
    viewport.addEventListener('pointercancel', onUp);
    viewport.addEventListener('touchstart', function (e) { onDown(e.touches[0].clientX); }, { passive: true });
    viewport.addEventListener('touchmove', function (e) { onMove(e.touches[0].clientX); }, { passive: true });
    viewport.addEventListener('touchend', onUp);
    viewport.addEventListener('mouseenter', stopAuto);
    viewport.addEventListener('mouseleave', startAuto);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopAuto(); else startAuto();
    });
    startAuto();
  }

  /* ---------- BACK TO TOP ---------- */
  var backTop = document.getElementById('backTop');
  if (backTop) {
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
    var onScroll = function () {
      backTop.classList.toggle('show', window.scrollY > 600);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- FOOTER YEAR ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- DEPLOYMENT URL FIX ----------
     Static pages are generated with a placeholder canonical host.
     On a real domain, rewrite canonical / og:url at runtime so SEO
     metadata always matches the live origin without regenerating files. */
  try {
    var host = window.location.hostname;
    if (host && host !== 'www.example.com' && host !== 'example.com' &&
        host !== 'localhost' && host !== '127.0.0.1' && host !== '') {
      var origin = window.location.origin;
      var path = window.location.pathname.replace(/index\.html$/, '');
      var live = origin + path;
      var canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) canonical.setAttribute('href', live);
      var ogurl = document.querySelector('meta[property="og:url"]');
      if (ogurl) ogurl.setAttribute('content', live);
    }
  } catch (e) {}
})();
