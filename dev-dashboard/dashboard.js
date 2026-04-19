const DEFAULT_SITES = [
  { label: 'Jira', url: 'https://your-org.atlassian.net' },
  { label: 'Azure DevOps', url: 'https://dev.azure.com/your-org' },
];

function getFaviconUrl(siteUrl) {
  try {
    const origin = new URL(siteUrl).origin;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(origin)}&sz=64`;
  } catch {
    return null;
  }
}

function getInitial(label) {
  return (label || '?').trim().charAt(0).toUpperCase();
}

function buildTile(site) {
  const a = document.createElement('a');
  a.className = 'tile';
  a.href = site.url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';

  const faviconUrl = getFaviconUrl(site.url);
  if (faviconUrl) {
    const img = document.createElement('img');
    img.className = 'tile-favicon';
    img.src = faviconUrl;
    img.alt = '';
    img.onerror = () => {
      img.replaceWith(makeFallback(site.label));
    };
    a.appendChild(img);
  } else {
    a.appendChild(makeFallback(site.label));
  }

  const labelEl = document.createElement('span');
  labelEl.className = 'tile-label';
  labelEl.textContent = site.label;
  a.appendChild(labelEl);

  const urlEl = document.createElement('span');
  urlEl.className = 'tile-url';
  try {
    urlEl.textContent = new URL(site.url).hostname;
  } catch {
    urlEl.textContent = site.url;
  }
  a.appendChild(urlEl);

  return a;
}

function makeFallback(label) {
  const div = document.createElement('div');
  div.className = 'tile-favicon-fallback';
  div.textContent = getInitial(label);
  return div;
}

function renderSites(sites) {
  const grid = document.getElementById('grid');
  const empty = document.getElementById('empty-state');
  grid.innerHTML = '';

  if (!sites || sites.length === 0) {
    empty.hidden = false;
    return;
  }

  empty.hidden = true;
  sites.forEach(site => grid.appendChild(buildTile(site)));
}

chrome.storage.sync.get({ sites: DEFAULT_SITES }, ({ sites }) => {
  renderSites(sites);
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.sites) {
    renderSites(changes.sites.newValue);
  }
});
