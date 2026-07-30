(() => {
  const config = window.WOHS_CONFIG || {};

  document.querySelectorAll('[data-config]').forEach((el) => {
    const key = el.dataset.config;
    if (config[key]) el.textContent = config[key];
  });

  document.querySelectorAll('[data-link]').forEach((el) => {
    const key = el.dataset.link;
    const value = config[key];
    if (value && !String(value).startsWith('PASTE_')) {
  el.href = value;

  if (/^https?:\/\//i.test(value)) {
    el.target = '_blank';
    el.rel = 'noopener noreferrer';
  }
} else {
      el.href = '#setup-needed';
      el.addEventListener('click', (event) => {
        event.preventDefault();
        alert('This link still needs to be added in js/config.js.');
      });
    }
  });

  document.querySelectorAll('[data-email-link]').forEach((el) => {
    if (config.contactEmail) el.href = `mailto:${config.contactEmail}`;
  });

  const menuButton = document.querySelector('.menu-button');
  const nav = document.querySelector('.site-nav');
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
  }

  const currentFile = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.site-nav a').forEach((link) => {
    const linkFile = link.getAttribute('href').split('#')[0];
    if (linkFile === currentFile) link.setAttribute('aria-current', 'page');
  });
})();
