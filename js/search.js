(() => {
  const config = window.WOHS_CONFIG || {};
  const input = document.querySelector('#business-search');
  const results = document.querySelector('#business-results');
  const message = document.querySelector('#search-message');
  const filters = [...document.querySelectorAll('.filter-chip')];
  const clearButton = document.querySelector('#clear-search');
  const count = document.querySelector('#business-count');
  if (!input || !results || !message) return;

  let businesses = [];
  let activeFilter = 'all';

  function parseCsv(text) {
    const rows = [];
    let row = [], value = '', quoted = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i], next = text[i + 1];
      if (ch === '"' && quoted && next === '"') { value += '"'; i++; }
      else if (ch === '"') quoted = !quoted;
      else if (ch === ',' && !quoted) { row.push(value); value = ''; }
      else if ((ch === '\n' || ch === '\r') && !quoted) {
        if (ch === '\r' && next === '\n') i++;
        row.push(value); value = '';
        if (row.some(cell => cell.trim())) rows.push(row);
        row = [];
      } else value += ch;
    }
    row.push(value);
    if (row.some(cell => cell.trim())) rows.push(row);
    return rows;
  }

  const normalize = (value) => String(value || '').trim().toLowerCase();
  const escapeHtml = (value) => String(value || '')
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#039;');

  function mapRows(rows) {
    const headers = rows[0].map(normalize);
    const find = (...names) => names.map(name => headers.indexOf(name)).find(i => i >= 0) ?? -1;
    const name = find('business name', 'business', 'name');
    const location = find('location', 'city');
    const status = find('status');
    const claimedUntil = find('claimed until', 'claim expires', 'claimed through');
    const updated = find('last updated', 'updated');
    if (name < 0 || status < 0) throw new Error('The sheet needs Business Name and Status columns.');
    return rows.slice(1).map(row => ({
      name: row[name]?.trim() || '',
      location: location >= 0 ? row[location]?.trim() || '' : '',
      status: row[status]?.trim() || '',
      claimedUntil: claimedUntil >= 0 ? row[claimedUntil]?.trim() || '' : '',
      updated: updated >= 0 ? row[updated]?.trim() || '' : ''
    })).filter(item => item.name);
  }

  function statusKey(status) {
    const s = normalize(status);
    if (s.includes('available')) return 'available';
    if (s.includes('claimed') || s.includes('follow')) return 'claimed';
    if (s.includes('purchased') || s.includes('sold')) return 'purchased';
    if (s.includes('declined')) return 'declined';
    return 'other';
  }

  function render() {
    const query = normalize(input.value);
    clearButton.hidden = !query;
    const filtered = businesses.filter((business) => {
      const matchesText = !query || normalize(`${business.name} ${business.location}`).includes(query);
      const matchesFilter = activeFilter === 'all' || statusKey(business.status) === activeFilter;
      return matchesText && matchesFilter;
    });

    count.textContent = `${filtered.length} ${filtered.length === 1 ? 'business' : 'businesses'}`;
    if (!filtered.length) {
      results.innerHTML = '';
      message.hidden = false;
      message.innerHTML = `<strong>No matches found.</strong><span>Try fewer letters, a different spelling, or another location.</span>`;
      return;
    }

    message.hidden = true;
   results.innerHTML = filtered.map((business) => {
  const key = statusKey(business.status);

  const claimAction = key === 'available'
    ? `<a class="button button-small button-orange" data-claim-link href="#">Claim this business</a>`
    : '';

  const expiry =
    business.claimedUntil && key === 'claimed'
      ? `<p class="result-detail"><strong>Claimed until:</strong> ${escapeHtml(business.claimedUntil)}</p>`
      : '';

  return `<article class="business-card">
    <div class="business-card-main">
      <div>
        <h2>${escapeHtml(business.name)}</h2>
        ${business.location
          ? `<p class="location">${escapeHtml(business.location)}</p>`
          : ''}
      </div>

      <span class="status status-${key}">
        ${escapeHtml(business.status || 'Status unavailable')}
      </span>
    </div>

    ${expiry}

    ${business.updated
      ? `<p class="updated">Last updated ${escapeHtml(business.updated)}</p>`
      : ''}

    ${claimAction}
  </article>`;
}).join('');

    document.querySelectorAll('[data-claim-link]').forEach((link) => {
      const value = config.claimFormUrl;
      if (value && !String(value).startsWith('PASTE_')) {
        link.href = value;
        link.target = '_blank';
        link.rel = 'noopener';
      } else {
        link.addEventListener('click', (event) => {
          event.preventDefault();
          alert('Add the Claim Form link in js/config.js first.');
        });
      }
    });
  }

  async function load() {
    try {
      message.hidden = false;
      message.innerHTML = '<strong>Loading the tracker…</strong><span>This should only take a moment.</span>';
      const source = config.trackerCsvUrl && !String(config.trackerCsvUrl).startsWith('PASTE_')
        ? config.trackerCsvUrl : 'data/sample-businesses.csv';
      const response = await fetch(source, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Tracker returned ${response.status}`);
      businesses = mapRows(parseCsv(await response.text()));
      render();
    } catch (error) {
      console.error(error);
      results.innerHTML = '';
      message.hidden = false;
      const backup = config.trackerUrl && !String(config.trackerUrl).startsWith('PASTE_')
        ? `<a href="${escapeHtml(config.trackerUrl)}" target="_blank" rel="noopener">Open the Google Sheet instead</a>` : '';
      message.innerHTML = `<strong>We couldn’t load the tracker.</strong><span>Please try again shortly. ${backup}</span>`;
    }
  }

  input.addEventListener('input', render);
  clearButton.addEventListener('click', () => { input.value = ''; input.focus(); render(); });
  filters.forEach((button) => button.addEventListener('click', () => {
    filters.forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    activeFilter = button.dataset.filter;
    render();
  }));
  load();
})();
