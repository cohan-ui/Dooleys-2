const root = document.documentElement;
const header = document.querySelector('[data-header]');
const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('#primary-nav');
const form = document.querySelector('#enquiry-form');
const toast = document.querySelector('#toast');
const languageToggle = document.querySelector('#language-toggle');
const languageMenu = document.querySelector('#language-menu');
const languageOptions = [...document.querySelectorAll('[data-language]')];

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

if (languageToggle && languageMenu) {
  updateLanguageControl(languageOptions[0]);

  languageToggle.addEventListener('click', () => setLanguageMenu(languageToggle.getAttribute('aria-expanded') !== 'true'));
  languageOptions.forEach((option) => option.addEventListener('click', () => {
    updateLanguageControl(option);
    setLanguageMenu(false);
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
