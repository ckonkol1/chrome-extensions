const DEFAULT_SITES = [
  { label: 'Jira', url: 'https://your-org.atlassian.net' },
  { label: 'Azure DevOps', url: 'https://dev.azure.com/your-org' },
];

let sites = [];

function loadSites() {
  chrome.storage.sync.get({ sites: DEFAULT_SITES }, ({ sites: stored }) => {
    sites = stored;
    renderList();
  });
}

function saveSites(callback) {
  chrome.storage.sync.set({ sites }, () => {
    if (callback) callback();
    showStatus('Saved!');
  });
}

function renderList() {
  const list = document.getElementById('site-list');
  list.innerHTML = '';

  if (sites.length === 0) {
    const empty = document.createElement('li');
    empty.style.cssText = 'color:#8b949e;font-size:0.875rem;padding:0.5rem 0;';
    empty.textContent = 'No sites yet. Add one below.';
    list.appendChild(empty);
    return;
  }

  sites.forEach((site, index) => {
    const li = document.createElement('li');
    li.className = 'site-item';

    const label = document.createElement('span');
    label.className = 'site-item-label';
    label.textContent = site.label;

    const url = document.createElement('span');
    url.className = 'site-item-url';
    url.textContent = site.url;
    url.title = site.url;

    const actions = document.createElement('div');
    actions.className = 'site-item-actions';

    if (index > 0) {
      const up = makeIconBtn('↑', 'Move up', () => moveItem(index, -1));
      actions.appendChild(up);
    }
    if (index < sites.length - 1) {
      const down = makeIconBtn('↓', 'Move down', () => moveItem(index, 1));
      actions.appendChild(down);
    }

    const del = makeIconBtn('✕', 'Remove', () => removeItem(index));
    del.classList.add('danger');
    actions.appendChild(del);

    li.append(label, url, actions);
    list.appendChild(li);
  });
}

function makeIconBtn(text, title, onClick) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn-icon';
  btn.textContent = text;
  btn.title = title;
  btn.addEventListener('click', onClick);
  return btn;
}

function moveItem(index, direction) {
  const target = index + direction;
  if (target < 0 || target >= sites.length) return;
  [sites[index], sites[target]] = [sites[target], sites[index]];
  saveSites();
  renderList();
}

function removeItem(index) {
  sites.splice(index, 1);
  saveSites();
  renderList();
}

function showStatus(msg) {
  const el = document.getElementById('status');
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(el._timeout);
  el._timeout = setTimeout(() => { el.hidden = true; }, 2000);
}

function showFormError(msg) {
  const el = document.getElementById('form-error');
  el.textContent = msg;
  el.hidden = false;
}

function clearFormError() {
  const el = document.getElementById('form-error');
  el.hidden = true;
  el.textContent = '';
}

document.getElementById('add-form').addEventListener('submit', (e) => {
  e.preventDefault();
  clearFormError();

  const labelInput = document.getElementById('new-label');
  const urlInput = document.getElementById('new-url');

  const label = labelInput.value.trim();
  const url = urlInput.value.trim();

  if (!label) {
    showFormError('Please enter a label.');
    return;
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    showFormError('Please enter a valid URL including https://');
    return;
  }

  if (!['https:', 'http:'].includes(parsedUrl.protocol)) {
    showFormError('Only http:// and https:// URLs are allowed.');
    return;
  }

  sites.push({ label, url });
  saveSites();
  renderList();

  labelInput.value = '';
  urlInput.value = '';
  labelInput.focus();
});

loadSites();
