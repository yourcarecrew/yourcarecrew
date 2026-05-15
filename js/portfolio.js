/**
 * portfolio.js — Your Care Crew
 * Loads provider data and renders the portfolio/directory grid.
 * Depends on translations.js being loaded first (defines window.TRANSLATIONS).
 */

/* ─────────────────────────────────────────────
   Service label translations
───────────────────────────────────────────── */
var SERVICE_I18N_KEYS = {
  nanny:       'svc_nanny',
  babysitter:  'svc_babysitter',
  babycare:    'svc_babycare',
  japa:        'svc_japa',
  female:      'svc_female',
  male:        'svc_male',
  nurse:       'svc_nurse',
  elder:       'svc_elder'
};

/**
 * Returns the translated display label for a service key.
 * Falls back to the raw service string if no translation is found.
 *
 * @param {string} service - e.g. 'nanny', 'nurse'
 * @returns {string}
 */
function getServiceLabel(service) {
  var lang = 'en';
  try { lang = localStorage.getItem('cc_lang') || 'en'; } catch (e) { /* private browsing */ }

  if (
    typeof TRANSLATIONS !== 'undefined' &&
    TRANSLATIONS[lang] &&
    SERVICE_I18N_KEYS[service] &&
    TRANSLATIONS[lang][SERVICE_I18N_KEYS[service]]
  ) {
    return TRANSLATIONS[lang][SERVICE_I18N_KEYS[service]];
  }

  // Graceful fallback: capitalise first letter
  return service.charAt(0).toUpperCase() + service.slice(1);
}

/* ─────────────────────────────────────────────
   Badge label translations
───────────────────────────────────────────── */
var BADGE_I18N_KEYS = {
  verified: 'badge_verified',
  approved: 'badge_approved',
  checked:  'badge_checked'
};

function getBadgeLabel(badge) {
  var lang = 'en';
  try { lang = localStorage.getItem('cc_lang') || 'en'; } catch (e) { /* private browsing */ }

  if (
    typeof TRANSLATIONS !== 'undefined' &&
    TRANSLATIONS[lang] &&
    BADGE_I18N_KEYS[badge] &&
    TRANSLATIONS[lang][BADGE_I18N_KEYS[badge]]
  ) {
    return TRANSLATIONS[lang][BADGE_I18N_KEYS[badge]];
  }

  return badge.charAt(0).toUpperCase() + badge.slice(1);
}

/* ─────────────────────────────────────────────
   Experience suffix translation
───────────────────────────────────────────── */
function getExpLabel() {
  var lang = 'en';
  try { lang = localStorage.getItem('cc_lang') || 'en'; } catch (e) { /* private browsing */ }

  if (
    typeof TRANSLATIONS !== 'undefined' &&
    TRANSLATIONS[lang] &&
    TRANSLATIONS[lang]['card_exp']
  ) {
    return TRANSLATIONS[lang]['card_exp'];
  }

  return 'yrs experience';
}

/* ─────────────────────────────────────────────
   1. Load providers from JSON
───────────────────────────────────────────── */
function loadProviders() {
  // Use inline data if available (works locally + on GitHub Pages)
  if (typeof PROVIDERS_DATA !== 'undefined' && Array.isArray(PROVIDERS_DATA)) {
    return Promise.resolve(PROVIDERS_DATA);
  }
  // Fallback: fetch from JSON (requires HTTP server)
  return fetch('data/providers.json')
    .then(function (response) {
      if (!response.ok) throw new Error('Failed to load providers');
      return response.json();
    })
    .catch(function (err) {
      console.error('[portfolio.js] Could not load providers:', err);
      return [];
    });
}

/* ─────────────────────────────────────────────
   2. Render provider cards into #portfolio-grid
───────────────────────────────────────────── */
/**
 * Renders provider cards.
 *
 * @param {Array}  data   - Full array of provider objects.
 * @param {string} filter - Service key to filter by, or 'all'.
 */
function renderCards(data, filter) {
  var grid = document.getElementById('portfolio-grid');
  if (!grid) return;

  // Filter dataset
  var filtered = (filter && filter !== 'all')
    ? data.filter(function (p) { return p.service === filter; })
    : data;

  // Clear existing content
  grid.innerHTML = '';

  // Empty state
  if (!filtered.length) {
    var emptyMsg = document.createElement('p');
    emptyMsg.className = 'portfolio-empty';

    var lang = 'en';
    try { lang = localStorage.getItem('cc_lang') || 'en'; } catch (e) { /* private browsing */ }

    var emptyText = 'No providers found for this category.';
    if (
      typeof TRANSLATIONS !== 'undefined' &&
      TRANSLATIONS[lang] &&
      TRANSLATIONS[lang]['portfolio_empty']
    ) {
      emptyText = TRANSLATIONS[lang]['portfolio_empty'];
    }

    emptyMsg.textContent = emptyText;
    grid.appendChild(emptyMsg);
    return;
  }

  // Build cards
  var fragment = document.createDocumentFragment();

  filtered.forEach(function (p) {
    // ── Outer card ──
    var card = document.createElement('article');
    card.className = 'provider-card fade-in';
    card.setAttribute('data-service', p.service);

    // ── Image / avatar ──
    var imgWrap = document.createElement('div');
    imgWrap.className = 'provider-card-img';

    if (p.photo) {
      var img = document.createElement('img');
      img.src = p.photo;
      img.alt = p.firstName + ' — ' + getServiceLabel(p.service) + ' in ' + (p.location || '');
      img.loading = 'lazy';
      imgWrap.appendChild(img);
    } else {
      var avatar = document.createElement('div');
      avatar.className = 'provider-avatar';
      avatar.setAttribute('aria-hidden', 'true');
      avatar.textContent = p.firstName ? p.firstName.charAt(0).toUpperCase() : '?';
      imgWrap.appendChild(avatar);
    }

    card.appendChild(imgWrap);

    // ── Card body ──
    var body = document.createElement('div');
    body.className = 'provider-card-body';

    // Name
    var nameEl = document.createElement('h3');
    nameEl.className = 'provider-name';
    nameEl.textContent = p.firstName || '';
    body.appendChild(nameEl);

    // Service label
    var serviceEl = document.createElement('span');
    serviceEl.className = 'provider-service';
    serviceEl.textContent = getServiceLabel(p.service);
    body.appendChild(serviceEl);

    // Experience
    var expEl = document.createElement('p');
    expEl.className = 'provider-exp';
    expEl.textContent = (p.experience || 0) + ' ' + getExpLabel();
    body.appendChild(expEl);

    // Location (optional, always show)
    if (p.location) {
      var locEl = document.createElement('p');
      locEl.className = 'provider-location';
      locEl.textContent = p.location;
      body.appendChild(locEl);
    }

    // Badges
    if (Array.isArray(p.badges) && p.badges.length) {
      var badgesEl = document.createElement('div');
      badgesEl.className = 'provider-badges';

      p.badges.forEach(function (badge) {
        var badgeEl = document.createElement('span');
        badgeEl.className = 'badge badge-' + badge;
        badgeEl.textContent = getBadgeLabel(badge);
        badgesEl.appendChild(badgeEl);
      });

      body.appendChild(badgesEl);
    }

    card.appendChild(body);
    fragment.appendChild(card);
  });

  grid.appendChild(fragment);

  // Re-initialise IntersectionObserver for newly added .fade-in elements
  if (typeof initFadeIn === 'function') {
    initFadeIn();
  }
}

/* ─────────────────────────────────────────────
   3. initPortfolio — load data, render, wire filters
───────────────────────────────────────────── */
function initPortfolio() {
  loadProviders().then(function (data) {

    // Hide loading indicator
    var loading = document.getElementById('portfolio-loading');
    if (loading) loading.style.display = 'none';

    // Initial render (all)
    renderCards(data, 'all');

    // Wire up filter buttons
    document.querySelectorAll('.filter-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        // Update active state
        document.querySelectorAll('.filter-btn').forEach(function (b) {
          b.classList.remove('active');
        });
        btn.classList.add('active');

        var filter = btn.getAttribute('data-filter') || 'all';
        renderCards(data, filter);
      });
    });

  });
}

/* ─────────────────────────────────────────────
   4. Boot
───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  if (document.getElementById('portfolio-grid')) {
    initPortfolio();
  }
});
