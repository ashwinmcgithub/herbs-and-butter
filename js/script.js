/* ═══════════════════════════════════════════════════
   HERBS & BUTTER — Main JavaScript
   ═══════════════════════════════════════════════════ */

'use strict';

/* ─── DOM Ready ─────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initScrollReveal();
  initMenuTabs();
  initReviewSlider();
  initGalleryLightbox();
  initCounterAnimation();
  initBackToTop();
  initActiveNavLinks();
});


/* ─── Navbar: Transparent → Solid on Scroll ─────── */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const onScroll = () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run on load
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

  hamburger.addEventListener('click', () => {
    navLinks.classList.contains('open') ? closeMenu() : openMenu();
  });

  overlay && overlay.addEventListener('click', closeMenu);

  // Close on nav link click
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });
}


/* ─── Scroll Reveal (Intersection Observer) ─────── */
function initScrollReveal() {
  const elements = document.querySelectorAll(
    '.reveal, .reveal-left, .reveal-right'
  );

  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Stagger children of .reveal parent groups
          const delay = entry.target.dataset.delay || 0;
          setTimeout(() => {
            entry.target.classList.add('in-view');
          }, Number(delay));
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  // Add staggered delays for grouped children
  document.querySelectorAll('.sig-card, .menu-item, .review-card, .strip-item').forEach((el, i) => {
    el.dataset.delay = (i % 4) * 80;
  });

  elements.forEach(el => observer.observe(el));
}


/* ─── Menu Tabs ─────────────────────────────────── */
function initMenuTabs() {
  const tabBtns  = document.querySelectorAll('.tab-btn');
  const panels   = document.querySelectorAll('.menu-panel');
  if (!tabBtns.length) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;

      // Update buttons
      tabBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Update panels
      panels.forEach(panel => {
        panel.classList.remove('active');
      });
      const activePanel = document.getElementById(`tab-${target}`);
      if (activePanel) {
        activePanel.classList.add('active');
        // Re-trigger reveal for items inside this panel
        activePanel.querySelectorAll('.menu-item').forEach((item, i) => {
          item.style.animation = 'none';
          item.offsetHeight; // reflow
          item.style.animation = '';
        });
      }
    });
  });
}


/* ─── Reviews Slider ─────────────────────────────── */
function initReviewSlider() {
  const track    = document.getElementById('reviewsTrack');
  const prevBtn  = document.getElementById('prevBtn');
  const nextBtn  = document.getElementById('nextBtn');
  const dotsEl   = document.getElementById('sliderDots');
  if (!track) return;

  const cards    = track.querySelectorAll('.review-card');
  let current    = 0;
  let autoTimer;

  // Calculate how many cards are visible
  const getVisible = () => {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  };

  const getMax = () => Math.max(0, cards.length - getVisible());

  // Build dots
  const buildDots = () => {
    if (!dotsEl) return;
    dotsEl.innerHTML = '';
    const maxSlide = getMax();
    for (let i = 0; i <= maxSlide; i++) {
      const dot = document.createElement('div');
      dot.className = 'dot' + (i === current ? ' active' : '');
      dot.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(dot);
    }
  };

  const updateDots = () => {
    if (!dotsEl) return;
    dotsEl.querySelectorAll('.dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === current);
    });
  };

  const getCardWidth = () => {
    if (!cards.length) return 0;
    const card = cards[0];
    const style = getComputedStyle(card);
    return card.offsetWidth + parseInt(style.marginRight || 0) +
           parseFloat(getComputedStyle(track).gap || 24);
  };

  const goTo = (index) => {
    const max = getMax();
    current = Math.max(0, Math.min(index, max));
    const offset = current * (cards[0].offsetWidth + 24); // 24 = gap
    track.style.transform = `translateX(-${offset}px)`;
    updateDots();
  };

  const goNext = () => goTo(current >= getMax() ? 0 : current + 1);
  const goPrev = () => goTo(current <= 0 ? getMax() : current - 1);

  prevBtn && prevBtn.addEventListener('click', () => { goPrev(); resetAuto(); });
  nextBtn && nextBtn.addEventListener('click', () => { goNext(); resetAuto(); });

  // Touch / swipe
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? goNext() : goPrev();
      resetAuto();
    }
  });

  // Auto-play
  const startAuto = () => { autoTimer = setInterval(goNext, 5000); };
  const resetAuto = () => { clearInterval(autoTimer); startAuto(); };

  // Rebuild on resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      buildDots();
      goTo(Math.min(current, getMax()));
    }, 200);
  });

  buildDots();
  startAuto();

  // Pause on hover
  track.addEventListener('mouseenter', () => clearInterval(autoTimer));
  track.addEventListener('mouseleave', startAuto);
}


/* ─── Gallery Lightbox ───────────────────────────── */
function initGalleryLightbox() {
  const lightbox    = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const closeBtn    = document.getElementById('lightboxClose');
  if (!lightbox) return;

  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (!img) return;
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    lightboxImg.src = '';
  };

  closeBtn && closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
  });
}


/* ─── Counter Animation ─────────────────────────── */
function initCounterAnimation() {
  const counters = document.querySelectorAll('.stat-num[data-target]');
  if (!counters.length) return;

  const animateCounter = (el) => {
    const target  = parseInt(el.dataset.target, 10);
    const duration = 2000;
    const step     = target / (duration / 16);
    let current    = 0;

    const tick = () => {
      current += step;
      if (current >= target) {
        el.textContent = target.toLocaleString('en-IN');
        return;
      }
      el.textContent = Math.floor(current).toLocaleString('en-IN');
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(counter => observer.observe(counter));
}


/* ─── Back to Top ────────────────────────────────── */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}


/* ─── Active Nav Links on Scroll ────────────────── */
function initActiveNavLinks() {
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-link');
  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${entry.target.id}`) {
              link.classList.add('active');
            }
          });
        }
      });
    },
    { threshold: 0.4, rootMargin: '-60px 0px -40% 0px' }
  );

  sections.forEach(section => observer.observe(section));
}
