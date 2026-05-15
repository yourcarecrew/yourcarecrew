/**
 * main.js — Your CareCrew
 * Vanilla JS for all shared site behaviour.
 * Depends on translations.js being loaded first (defines window.TRANSLATIONS).
 */

/* ─────────────────────────────────────────────
   1. Nav scroll effect
───────────────────────────────────────────── */
(function initNavScroll() {
  const header = document.getElementById('site-header');
  if (!header) return;

  function onScroll() {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  // Run once on load in case page is already scrolled (e.g. after refresh)
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}());

/* ─────────────────────────────────────────────
   2. Hamburger / mobile-nav toggle
───────────────────────────────────────────── */
(function initHamburger() {
  const hamburger = document.getElementById('nav-hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  const header    = document.getElementById('site-header');
  if (!hamburger || !mobileNav) return;

  function isOpen() {
    return hamburger.classList.contains('open');
  }

  function openMenu() {
    hamburger.classList.add('open');
    mobileNav.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    mobileNav.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  hamburger.addEventListener('click', function (e) {
    e.stopPropagation();
    isOpen() ? closeMenu() : openMenu();
  });

  // Close when clicking outside the header area
  document.addEventListener('click', function (e) {
    if (!isOpen()) return;
    if (header && header.contains(e.target)) return;
    closeMenu();
  });

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen()) closeMenu();
  });
}());

/* ─────────────────────────────────────────────
   3. Scroll fade-in animation (IntersectionObserver)
───────────────────────────────────────────── */
function initFadeIn() {
  const elements = document.querySelectorAll('.fade-in:not(.visible)');
  if (!elements.length) return;

  const observer = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  elements.forEach(function (el) { observer.observe(el); });
}

document.addEventListener('DOMContentLoaded', initFadeIn);

/* ─────────────────────────────────────────────
   4. Active nav link highlighting
───────────────────────────────────────────── */
(function initActiveNav() {
  document.addEventListener('DOMContentLoaded', function () {
    const path = window.location.pathname;

    // Normalise: strip trailing slash for comparison, but keep '/' for root
    function normalisePath(p) {
      return p.endsWith('/') && p.length > 1 ? p.slice(0, -1) : p;
    }

    const currentPath = normalisePath(path);

    const selectors = ['.nav-links a', '.mobile-nav a'];
    selectors.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (link) {
        const linkPath = normalisePath(new URL(link.href, window.location.origin).pathname);
        if (linkPath === currentPath) {
          link.classList.add('active');
        }
      });
    });
  });
}());

/* ─────────────────────────────────────────────
   5. Language toggle system
───────────────────────────────────────────── */
var _currentLang = 'en';

function applyLanguage(lang) {
  var validLang = (lang === 'bn') ? 'bn' : 'en';
  _currentLang = validLang;

  // Persist to localStorage
  try { localStorage.setItem('cc_lang', validLang); } catch (e) { /* private browsing */ }

  // Set <html lang>
  document.documentElement.lang = validLang === 'bn' ? 'bn' : 'en';

  // Toggle body class for Bengali-specific CSS
  if (validLang === 'bn') {
    document.body.classList.add('lang-bn');
  } else {
    document.body.classList.remove('lang-bn');
  }

  // Guard: only translate if TRANSLATIONS is available
  if (typeof TRANSLATIONS === 'undefined' || !TRANSLATIONS[validLang]) return;

  var dict = TRANSLATIONS[validLang];

  // Translate textContent for all [data-i18n] elements
  document.querySelectorAll('[data-i18n]').forEach(function (el) {
    var key = el.getAttribute('data-i18n');
    if (key && dict[key] !== undefined) {
      var tag = el.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea') {
        el.placeholder = dict[key];
      } else {
        el.textContent = dict[key];
      }
    }
  });

  // Translate placeholder only for [data-i18n-ph] elements
  document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
    var key = el.getAttribute('data-i18n-ph');
    if (key && dict[key] !== undefined) {
      el.placeholder = dict[key];
    }
  });

  // Update all language-toggle text indicators
  document.querySelectorAll('.lang-toggle-text').forEach(function (span) {
    span.textContent = validLang === 'bn' ? 'English' : 'বাংলা';
  });
}

function initLanguage() {
  var saved = 'en';
  try { saved = localStorage.getItem('cc_lang') || 'en'; } catch (e) { /* private browsing */ }
  applyLanguage(saved);
}

(function initLangToggle() {
  document.addEventListener('DOMContentLoaded', function () {
    initLanguage();

    function toggleLang() {
      applyLanguage(_currentLang === 'en' ? 'bn' : 'en');
    }

    var btn = document.getElementById('lang-toggle');
    if (btn) btn.addEventListener('click', toggleLang);

    var btnMobile = document.getElementById('lang-toggle-mobile');
    if (btnMobile) btnMobile.addEventListener('click', toggleLang);
  });
}());

/* ─────────────────────────────────────────────
   6. FAQ accordion
───────────────────────────────────────────── */
(function initFAQ() {
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.faq-question').forEach(function (question) {
      question.addEventListener('click', function () {
        var item = question.closest('.faq-item');
        if (!item) return;

        var isAlreadyOpen = item.classList.contains('open');

        // Close all open items
        document.querySelectorAll('.faq-item.open').forEach(function (openItem) {
          openItem.classList.remove('open');
          var q = openItem.querySelector('.faq-question');
          if (q) q.setAttribute('aria-expanded', 'false');
        });

        // Toggle the clicked item (open it if it was closed)
        if (!isAlreadyOpen) {
          item.classList.add('open');
          question.setAttribute('aria-expanded', 'true');
        }
      });
    });
  });
}());

/* ─────────────────────────────────────────────
   7. Animated stat counters
───────────────────────────────────────────── */
(function initStatCounters() {
  document.addEventListener('DOMContentLoaded', function () {
    var statsBar = document.querySelector('.stats-bar');
    if (!statsBar) return;

    var animated = false;

    function animateCounters() {
      if (animated) return;
      animated = true;

      statsBar.querySelectorAll('.stat-number[data-count]').forEach(function (el) {
        var target  = parseInt(el.getAttribute('data-count'), 10);
        var suffix  = el.getAttribute('data-suffix') || '';
        var start   = 0;
        var duration = 1500; // ms
        var interval = 16;   // ~60 fps
        var steps    = Math.ceil(duration / interval);
        var increment = target / steps;
        var current  = 0;
        var count    = 0;

        var timer = setInterval(function () {
          count++;
          current = Math.min(Math.round(increment * count), target);
          el.textContent = current + suffix;

          if (current >= target) {
            clearInterval(timer);
            el.textContent = target + suffix; // ensure exact final value
          }
        }, interval);
      });
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounters();
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    observer.observe(statsBar);
  });
}());

/* ─────────────────────────────────────────────
   8. Form handling — real Formspree AJAX
───────────────────────────────────────────── */
(function initForms() {
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('form.contact-form, form.join-form').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();

        var submitBtn  = form.querySelector('[type="submit"]');
        var successMsg = form.querySelector('.form-success-msg');
        var errorMsg   = form.querySelector('.form-error-msg');

        // ── Loading state ──────────────────────────
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.setAttribute('data-original-text', submitBtn.textContent);
          submitBtn.textContent = submitBtn.getAttribute('data-loading-text') || 'Sending…';
        }
        if (errorMsg) {
          errorMsg.style.display = 'none';
        }

        // ── Submit via fetch to Formspree ──────────
        fetch(form.action, {
          method:  'POST',
          body:    new FormData(form),
          headers: { 'Accept': 'application/json' }
        })
        .then(function (response) {
          if (response.ok) {
            // ── Success: hide form fields, show confirmation ──
            form.querySelectorAll(
              'input:not([type="hidden"]), textarea, select, label, ' +
              '.form-group, .form-row, .form-field, .form-actions, ' +
              '.form-submit-row, h3'
            ).forEach(function (el) { el.style.display = 'none'; });

            if (submitBtn) submitBtn.style.display = 'none';
            if (successMsg) {
              successMsg.style.display = 'flex';
              successMsg.classList.add('show');
            }
          } else {
            // ── Server-level error (e.g. validation rejected) ──
            return response.json().then(function (data) {
              throw new Error(
                (data.errors && data.errors.map(function (err) { return err.message; }).join(', ')) ||
                'Submission failed. Please try again.'
              );
            });
          }
        })
        .catch(function (err) {
          // ── Network or server error — restore button, show error ──
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = submitBtn.getAttribute('data-original-text') || 'Send';
          }
          if (errorMsg) {
            errorMsg.style.display = 'flex';
            var errText = errorMsg.querySelector('.error-text');
            if (errText) {
              errText.textContent = err.message || 'Something went wrong. Please try again.';
            }
          }
          console.error('[Your CareCrew] Form error:', err);
        });
      });
    });
  });
}());

/* ─────────────────────────────────────────────
   9. Testimonials carousel
───────────────────────────────────────────── */
(function initCarousel() {
  document.addEventListener('DOMContentLoaded', function () {
    var track = document.querySelector('.testimonial-track');
    if (!track) return;

    var slides     = Array.prototype.slice.call(track.children);
    var totalSlides = slides.length;
    if (totalSlides < 2) return;

    var currentIndex = 0;
    var autoTimer    = null;

    function goTo(index) {
      // Wrap around
      if (index < 0) index = totalSlides - 1;
      if (index >= totalSlides) index = 0;
      currentIndex = index;
      track.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';

      // Update ARIA / active state if slides have it
      slides.forEach(function (slide, i) {
        slide.setAttribute('aria-hidden', i !== currentIndex ? 'true' : 'false');
      });
    }

    function startAuto() {
      stopAuto();
      autoTimer = setInterval(function () { goTo(currentIndex + 1); }, 4000);
    }

    function stopAuto() {
      if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
    }

    // Initialise positions
    goTo(0);

    // Auto-rotate only on mobile
    function handleResize() {
      if (window.innerWidth < 768) {
        startAuto();
      } else {
        stopAuto();
      }
    }

    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });

    // Prev / Next button support
    var prevBtn = document.querySelector('.carousel-prev');
    var nextBtn = document.querySelector('.carousel-next');

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        stopAuto();
        goTo(currentIndex - 1);
        if (window.innerWidth < 768) startAuto();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        stopAuto();
        goTo(currentIndex + 1);
        if (window.innerWidth < 768) startAuto();
      });
    }

    // Pause on hover / touch
    track.addEventListener('mouseenter', stopAuto);
    track.addEventListener('mouseleave', function () {
      if (window.innerWidth < 768) startAuto();
    });
    track.addEventListener('touchstart', stopAuto, { passive: true });
    track.addEventListener('touchend', function () {
      if (window.innerWidth < 768) startAuto();
    }, { passive: true });
  });
}());
