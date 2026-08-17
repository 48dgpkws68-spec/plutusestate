/* PLUTUS ESTATE · shared behavior */
(function () {
  'use strict';

  /* Capture mode for automated full-page screenshots (?capture) */
  if (location.search.indexOf('capture') !== -1) {
    document.documentElement.classList.add('capture');
  }

  /* WhatsApp floating button (injected on every page) */
  (function () {
    if (document.querySelector('.wa-float')) return;
    var msg = encodeURIComponent('Hi Plutus Estate, I would like to talk about property in Dubai / Marbella.');
    var a = document.createElement('a');
    a.className = 'wa-float';
    a.href = 'https://wa.me/31634333809?text=' + msg;
    a.target = '_blank';
    a.rel = 'noopener';
    a.setAttribute('aria-label', 'Chat with us on WhatsApp');
    a.innerHTML =
      '<span class="wa-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4C2.7 15.7 2.2 14 2.2 12.2 2.2 6.8 6.6 2.4 12 2.4s9.8 4.4 9.8 9.8-4.4 9.6-9.8 9.6zm8.4-18C18.2 1.6 15.2.4 12 .4 5.5.4.2 5.7.2 12.2c0 2.1.5 4.1 1.6 5.9L0 24l6.1-1.6c1.7.9 3.7 1.4 5.9 1.4 6.5 0 11.8-5.3 11.8-11.8 0-3.1-1.2-6.1-3.4-8.2z"/></svg></span>' +
      '<span>WhatsApp<small>Reply within the hour</small></span>';
    document.body.appendChild(a);
  })();

  /* Nav scroll state (404 keeps the solid nav permanently) */
  var nav = document.getElementById('nav');
  var solidNav = document.body.getAttribute('data-page') === '404';
  function onScroll() {
    if (!nav) return;
    if (window.scrollY > 24 || solidNav) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  var burger = document.getElementById('navBurger');
  if (burger) {
    burger.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.querySelectorAll('#navLinks a').forEach(function (a) {
      a.addEventListener('click', function () {
        document.body.classList.remove('nav-open');
      });
    });
  }

  /* Active nav link */
  var page = document.body.getAttribute('data-page');
  if (page) {
    document.querySelectorAll('[data-nav="' + page + '"]').forEach(function (a) {
      a.classList.add('active');
    });
  }

  /* Scroll reveal */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* Animated counters: <span data-count="1800" data-prefix="€" data-suffix="M+" data-decimals="1"> */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    if (isNaN(target)) return;
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var dur = 1800;
    var start = null;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 4);
      var val = target * eased;
      el.textContent = prefix + val.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  var counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          animateCount(e.target);
          cio.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  /* Ticker: duplicate track content once for a seamless loop */
  document.querySelectorAll('.ticker-track').forEach(function (track) {
    track.innerHTML += track.innerHTML;
  });

  /* Range slider fill percentage (webkit gradient) */
  function paintRange(r) {
    var min = parseFloat(r.min || 0), max = parseFloat(r.max || 100), v = parseFloat(r.value);
    var pct = ((v - min) / (max - min)) * 100;
    r.style.setProperty('--fill', pct + '%');
  }
  document.querySelectorAll('input[type=range]').forEach(function (r) {
    paintRange(r);
    r.addEventListener('input', function () { paintRange(r); });
  });
  window.paintRange = paintRange;

  /* Property filters (properties.html) */
  var filterBar = document.querySelector('.filter-bar');
  if (filterBar) {
    var groups = {};
    filterBar.querySelectorAll('.filter-btn').forEach(function (btn) {
      var g = btn.getAttribute('data-group') || 'default';
      btn.addEventListener('click', function () {
        filterBar.querySelectorAll('.filter-btn[data-group="' + g + '"]').forEach(function (b) {
          b.classList.remove('active');
        });
        btn.classList.add('active');
        groups[g] = btn.getAttribute('data-filter');
        applyFilters();
      });
      if (btn.classList.contains('active')) groups[g] = btn.getAttribute('data-filter');
    });
    function applyFilters() {
      document.querySelectorAll('[data-market]').forEach(function (card) {
        var show = true;
        Object.keys(groups).forEach(function (g) {
          var want = groups[g];
          if (!want || want === 'all') return;
          var attr = g === 'market' ? card.getAttribute('data-market') : card.getAttribute('data-' + g);
          if (!attr || attr.indexOf(want) === -1) show = false;
        });
        card.classList.toggle('hidden-card', !show);
      });
      var visible = document.querySelectorAll('[data-market]:not(.hidden-card)').length;
      var counter = document.getElementById('propCount');
      if (counter) counter.textContent = visible;
    }
    applyFilters();
  }
})();
