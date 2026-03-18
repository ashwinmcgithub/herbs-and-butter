/* ═══════════════════════════════════════════════════
   HERBS & BUTTER — Main JavaScript
   ═══════════════════════════════════════════════════ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initScrollReveal();
  initMenuTabs();
  initReviewSlider();
  initBentoGallery();
  initCounterAnimation();
  initBackToTop();
  initActiveNavLinks();
});


/* ─── Navbar ─────────────────────────────────────── */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}


/* ─── Mobile Menu ────────────────────────────────── */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  const overlay   = document.getElementById('navOverlay');
  if (!hamburger || !navLinks) return;

  const openMenu  = () => {
    hamburger.classList.add('open');
    navLinks.classList.add('open');
    overlay && overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };
  const closeMenu = () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    overlay && overlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  hamburger.addEventListener('click', () =>
    navLinks.classList.contains('open') ? closeMenu() : openMenu()
  );
  overlay && overlay.addEventListener('click', closeMenu);
  navLinks.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
}


/* ─── Scroll Reveal ──────────────────────────────── */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!els.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const delay = Number(entry.target.dataset.delay || 0);
      setTimeout(() => entry.target.classList.add('in-view'), delay);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  // Stagger grouped children
  document.querySelectorAll('.sig-card, .menu-item, .review-card').forEach((el, i) => {
    el.dataset.delay = (i % 4) * 80;
  });

  els.forEach(el => observer.observe(el));
}


/* ─── Menu Tabs ─────────────────────────────────── */
function initMenuTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const panels  = document.querySelectorAll('.menu-panel');
  if (!tabBtns.length) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      panels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      const panel = document.getElementById(`tab-${btn.dataset.tab}`);
      if (panel) panel.classList.add('active');
    });
  });
}


/* ─── Reviews Slider ─────────────────────────────── */
function initReviewSlider() {
  const track   = document.getElementById('reviewsTrack');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const dotsEl  = document.getElementById('sliderDots');
  if (!track) return;

  const cards = [...track.querySelectorAll('.review-card')];
  let current = 0;
  let autoTimer;

  const getVisible = () => window.innerWidth <= 768 ? 1 : window.innerWidth <= 1024 ? 2 : 3;
  const getMax = () => Math.max(0, cards.length - getVisible());

  const buildDots = () => {
    if (!dotsEl) return;
    dotsEl.innerHTML = '';
    for (let i = 0; i <= getMax(); i++) {
      const d = document.createElement('div');
      d.className = 'dot' + (i === current ? ' active' : '');
      d.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(d);
    }
  };

  const updateDots = () => {
    dotsEl && dotsEl.querySelectorAll('.dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  };

  const goTo = (index) => {
    current = Math.max(0, Math.min(index, getMax()));
    const cardW = cards[0] ? cards[0].offsetWidth + 24 : 0;
    track.style.transform = `translateX(-${current * cardW}px)`;
    updateDots();
  };

  const goNext = () => goTo(current >= getMax() ? 0 : current + 1);
  const goPrev = () => goTo(current <= 0 ? getMax() : current - 1);

  prevBtn && prevBtn.addEventListener('click', () => { goPrev(); resetAuto(); });
  nextBtn && nextBtn.addEventListener('click', () => { goNext(); resetAuto(); });

  // Swipe
  let tx = 0;
  track.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const d = tx - e.changedTouches[0].clientX;
    if (Math.abs(d) > 50) { d > 0 ? goNext() : goPrev(); resetAuto(); }
  });

  const startAuto = () => { autoTimer = setInterval(goNext, 5000); };
  const resetAuto = () => { clearInterval(autoTimer); startAuto(); };

  let resizeT;
  window.addEventListener('resize', () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => { buildDots(); goTo(Math.min(current, getMax())); }, 200);
  });

  track.addEventListener('mouseenter', () => clearInterval(autoTimer));
  track.addEventListener('mouseleave', startAuto);

  buildDots();
  startAuto();
}


/* ─── Bento Gallery + Media Modal ────────────────── */
function initBentoGallery() {
  const bentoItems = [...document.querySelectorAll('.bento-item')];
  const modal      = document.getElementById('mediaModal');
  const backdrop   = document.getElementById('modalBackdrop');
  const closeBtn   = document.getElementById('modalClose');
  const prevBtn    = document.getElementById('modalPrev');
  const nextBtn    = document.getElementById('modalNext');
  const mediaWrap  = document.getElementById('modalMediaWrap');
  const titleEl    = document.getElementById('modalTitle');
  const counterEl  = document.getElementById('modalCounter');
  if (!bentoItems.length || !modal) return;

  // ── Filter ────────────────────────────────────────
  document.querySelectorAll('.gf-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.gf-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      bentoItems.forEach(item => {
        const match = filter === 'all' || item.dataset.type === filter;
        item.classList.toggle('filtered-out', !match);
      });
    });
  });

  // ── Video hover-to-play ────────────────────────────
  bentoItems.forEach(item => {
    if (item.dataset.type !== 'video') return;
    const vid = item.querySelector('video');
    if (!vid) return;

    item.addEventListener('mouseenter', () => {
      vid.play().catch(() => {});
    });
    item.addEventListener('mouseleave', () => {
      vid.pause();
      vid.currentTime = 0;
    });
  });

  // ── Get visible items (not filtered out) ──────────
  const visibleItems = () => bentoItems.filter(i => !i.classList.contains('filtered-out'));

  // ── Open modal ─────────────────────────────────────
  let currentIndex = 0;
  let modalVideo   = null;

  const openModal = (item) => {
    const items = visibleItems();
    currentIndex = items.indexOf(item);
    loadMedia(items[currentIndex], items);
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    if (modalVideo) { modalVideo.pause(); modalVideo = null; }
    mediaWrap.innerHTML = '';
  };

  const loadMedia = (item, items) => {
    if (!item) return;
    mediaWrap.innerHTML = '';
    if (modalVideo) { modalVideo.pause(); modalVideo = null; }

    if (item.dataset.type === 'video') {
      const vid = document.createElement('video');
      vid.src      = item.dataset.src;
      vid.controls = true;
      vid.autoplay = true;
      vid.playsInline = true;
      vid.style.width = '100%';
      vid.style.maxHeight = '80vh';
      mediaWrap.appendChild(vid);
      modalVideo = vid;
    } else {
      const img = document.createElement('img');
      img.src = item.dataset.src;
      img.alt = item.dataset.title || '';
      img.style.maxHeight = '80vh';
      mediaWrap.appendChild(img);
    }

    if (titleEl)  titleEl.textContent   = item.dataset.title || '';
    if (counterEl) counterEl.textContent = `${currentIndex + 1} / ${items.length}`;
  };

  const goNext = () => {
    const items = visibleItems();
    currentIndex = (currentIndex + 1) % items.length;
    loadMedia(items[currentIndex], items);
  };

  const goPrev = () => {
    const items = visibleItems();
    currentIndex = (currentIndex - 1 + items.length) % items.length;
    loadMedia(items[currentIndex], items);
  };

  // Click items to open
  bentoItems.forEach(item => {
    item.addEventListener('click', () => openModal(item));
  });

  // Controls
  closeBtn && closeBtn.addEventListener('click', closeModal);
  backdrop && backdrop.addEventListener('click', closeModal);
  prevBtn  && prevBtn.addEventListener('click', goPrev);
  nextBtn  && nextBtn.addEventListener('click', goNext);

  // Keyboard
  document.addEventListener('keydown', e => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape')       closeModal();
    if (e.key === 'ArrowRight')   goNext();
    if (e.key === 'ArrowLeft')    goPrev();
  });

  // Touch swipe in modal
  let touchX = 0;
  mediaWrap.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  mediaWrap.addEventListener('touchend', e => {
    const d = touchX - e.changedTouches[0].clientX;
    if (Math.abs(d) > 50) { d > 0 ? goNext() : goPrev(); }
  });
}


/* ─── Counter Animation ─────────────────────────── */
function initCounterAnimation() {
  const counters = document.querySelectorAll('.stat-num[data-target]');
  if (!counters.length) return;

  const animate = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const step   = target / (2000 / 16);
    let val = 0;
    const tick = () => {
      val += step;
      if (val >= target) { el.textContent = target.toLocaleString('en-IN'); return; }
      el.textContent = Math.floor(val).toLocaleString('en-IN');
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { animate(e.target); obs.unobserve(e.target); } });
  }, { threshold: 0.5 });

  counters.forEach(c => obs.observe(c));
}


/* ─── Back to Top ────────────────────────────────── */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 500), { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}


/* ─── Active Nav Links ───────────────────────────── */
function initActiveNavLinks() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-link');
  if (!sections.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => {
          l.classList.remove('active');
          if (l.getAttribute('href') === `#${e.target.id}`) l.classList.add('active');
        });
      }
    });
  }, { threshold: 0.4, rootMargin: '-60px 0px -40% 0px' });

  sections.forEach(s => obs.observe(s));
}
