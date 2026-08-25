const root = document.documentElement;
const header = document.querySelector('[data-header]');
const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('#primary-nav');
const form = document.querySelector('#enquiry-form');
const toast = document.querySelector('#toast');
const languageHost = document.querySelector('.gtranslate_wrapper');
const languageToggle = document.querySelector('#language-toggle');
const languageMenu = document.querySelector('#language-menu');
const languageOptions = [...document.querySelectorAll('[data-language]')];

// Translation engine. Only runs when the .gtranslate_wrapper host is present
// (serve build) AND the page is on a real http(s) origin -- GTranslate drives
// translation through a googtrans cookie, which does nothing on file://.
// The Figma-import build omits the host element, so the selector stays inert.
const TRANSLATION_ENABLED = Boolean(languageHost) && /^https?:$/.test(window.location.protocol);

if (TRANSLATION_ENABLED) {
  window.gtranslateSettings = {
    switcher_horizontal_position: 'inline',
    switcher_vertical_position: 'inline',
    horizontal_position: 'inline',
    vertical_position: 'inline',
    float_switcher_open_direction: 'top',
    switcher_open_direction: 'bottom',
    default_language: 'en',
    native_language_names: 0,
    detect_browser_language: 0,
    add_new_line: 1,
    select_language_label: 'Select Language',
    flag_size: 32,
    flag_style: '2d',
    globe_size: 60,
    alt_flags: [],
    wrapper_selector: '.gtranslate_wrapper',
    url_structure: 'none',
    custom_domains: null,
    languages: ['en', 'zh-CN', 'zh-TW', 'ja', 'ko', 'tl', 'vi'],
    custom_css: ''
  };

  const translationScript = document.createElement('script');
  translationScript.src = 'https://cdn.gtranslate.net/widgets/latest/dwf.js';
  translationScript.async = true;
  translationScript.referrerPolicy = 'strict-origin-when-cross-origin';
  document.body.appendChild(translationScript);

  const enhanceLanguageSelector = () => {
    const selected = languageHost.querySelector('.gt_selected a');
    if (!selected || selected.dataset.initialised === 'true') return;
    selected.dataset.initialised = 'true';
    selected.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
  };
  new MutationObserver(enhanceLanguageSelector).observe(languageHost, { childList: true, subtree: true });
  enhanceLanguageSelector();
}

const languageCodes = {
  en: 'en-AU',
  'zh-CN': 'zh-Hans',
  'zh-TW': 'zh-Hant',
  ja: 'ja',
  ko: 'ko',
  tl: 'fil',
  vi: 'vi'
};

function setLanguageMenu(open) {
  languageMenu.hidden = !open;
  languageToggle.setAttribute('aria-expanded', String(open));
}

function updateLanguageControl(option) {
  const language = option.dataset.language;
  const label = option.dataset.label;
  document.querySelector('[data-language-label]').textContent = label;
  document.querySelector('[data-language-flag]').src = option.querySelector('img').src;
  languageToggle.setAttribute('aria-label', `Select language. Current language: ${label}`);
  languageOptions.forEach((item) => item.setAttribute('aria-checked', String(item === option)));
  root.lang = languageCodes[language] || language;
}

function requestTranslation(language, attempt = 0) {
  if (typeof window.doGTranslate === 'function') {
    window.doGTranslate(`en|${language}`);
    return;
  }
  if (attempt < 20) window.setTimeout(() => requestTranslation(language, attempt + 1), 250);
}

function resetTranslationToEnglish() {
  const expires = 'Thu, 01 Jan 1970 00:00:00 GMT';
  const hostnameParts = window.location.hostname.split('.').filter(Boolean);
  const domains = hostnameParts.map((_, index) => `.${hostnameParts.slice(index).join('.')}`);
  document.cookie = `googtrans=; expires=${expires}; path=/`;
  domains.forEach((domain) => {
    document.cookie = `googtrans=; expires=${expires}; path=/; domain=${domain}`;
  });
  try { sessionStorage.setItem('grand-scroll', String(window.scrollY)); } catch (_) {}
  window.location.reload();
}

if (languageToggle && languageMenu) {
  const cookieLanguage = TRANSLATION_ENABLED
    ? (document.cookie.match(/(?:^|; )googtrans=\/en\/([^;]+)/)?.[1] || 'en')
    : 'en';
  updateLanguageControl(
    languageOptions.find((option) => option.dataset.language === cookieLanguage) || languageOptions[0]);

  if (TRANSLATION_ENABLED) {
    try {
      const savedScroll = sessionStorage.getItem('grand-scroll');
      if (savedScroll !== null) {
        sessionStorage.removeItem('grand-scroll');
        window.requestAnimationFrame(() => window.scrollTo(0, Number(savedScroll) || 0));
      }
    } catch (_) {}
  }

  languageToggle.addEventListener('click', () => setLanguageMenu(languageToggle.getAttribute('aria-expanded') !== 'true'));
  languageOptions.forEach((option) => option.addEventListener('click', () => {
    const returningToEnglish = option.dataset.language === 'en' && option.getAttribute('aria-checked') !== 'true';
    updateLanguageControl(option);
    setLanguageMenu(false);
    if (TRANSLATION_ENABLED) {
      if (returningToEnglish) resetTranslationToEnglish();
      else requestTranslation(option.dataset.language);
    }
    languageToggle.focus();
  }));
  languageMenu.addEventListener('keydown', (event) => {
    const currentIndex = languageOptions.indexOf(document.activeElement);
    if (event.key === 'Escape') {
      setLanguageMenu(false);
      languageToggle.focus();
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      languageOptions[(currentIndex + direction + languageOptions.length) % languageOptions.length].focus();
    }
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.language-selector')) setLanguageMenu(false);
  });
}

function updateHeader() { header.classList.toggle('is-scrolled', window.scrollY > 40); }
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

navToggle.addEventListener('click', () => {
  const open = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!open));
  navToggle.querySelector('.sr-only').textContent = open ? 'Open menu' : 'Close menu';
  nav.classList.toggle('is-open', !open);
});

nav.addEventListener('click', (event) => {
  if (event.target.closest('a')) {
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.querySelector('.sr-only').textContent = 'Open menu';
  }
});

document.querySelectorAll('[data-set-enquiry]').forEach((link) => {
  link.addEventListener('click', () => {
    const select = form.elements.eventType;
    const requested = link.dataset.setEnquiry;
    if ([...select.options].some((option) => option.value === requested)) select.value = requested;
  });
});

document.querySelectorAll('.placeholder-download').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    toast.hidden = false;
    window.clearTimeout(window.toastTimer);
    window.toastTimer = window.setTimeout(() => { toast.hidden = true; }, 4500);
  });
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  form.querySelectorAll('input, select, textarea, button').forEach((control) => { control.disabled = true; });
  document.querySelector('#form-success').hidden = false;
  document.querySelector('#form-success').focus?.();
});

document.querySelector('.external-payment').addEventListener('click', () => {
  // Placeholder external hand-off. Replace with the approved payment URL in production.
});

const revealTargets = document.querySelectorAll([
  '.section-heading',
  '.intro__grid > *',
  '.feature-strip',
  '.event-card',
  '.package-card',
  '.resource-bar',
  '.spaces__image-wrap',
  '.spaces__content',
  '.service-grid li',
  '.offer__inner > *',
  '.location__grid > *',
  '.enquiry__grid > *',
  '.faq__grid > *'
].join(','));

if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  revealTargets.forEach((target, index) => {
    target.classList.add('motion-reveal');
    target.style.setProperty('--reveal-delay', `${(index % 3) * 70}ms`);
  });
  root.classList.add('motion-ready');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  revealTargets.forEach((target) => revealObserver.observe(target));
}

const sectionLinks = [...nav.querySelectorAll('a[href^="#"]')];
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      sectionLinks.forEach((link) => link.removeAttribute('aria-current'));
      const activeLink = sectionLinks.find((link) => link.hash === `#${entry.target.id}`);
      activeLink?.setAttribute('aria-current', 'location');
    });
  }, { rootMargin: '-25% 0px -65% 0px' });
  sectionLinks.forEach((link) => {
    const section = document.querySelector(link.hash);
    if (section) sectionObserver.observe(section);
  });
}
