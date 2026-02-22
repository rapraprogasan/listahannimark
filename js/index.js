// ============================================================
// js/index.js - Dashboard / Main Page
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
  Auth.init();
  Common.initTheme();
  Notification.init();
  DetailModal.init();

  if (!Auth.requireAuth()) return;

  Common.renderUserInfo();
  Common.setActiveNav('home');

  const user = Auth.getUser();

  document.getElementById('themeToggle')?.addEventListener('click', () => Common.toggleTheme());

  // Search
  const searchInput = document.getElementById('searchInput');
  let searchTimer;
  searchInput?.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(async () => {
      const q = searchInput.value.trim();
      if (q.length < 2) {
        document.getElementById('searchResults').style.display = 'none';
        return;
      }
      await performSearch(q);
    }, 400);
  });

  // Hide search results on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-wrap')) {
      document.getElementById('searchResults').style.display = 'none';
    }
  });

  await loadDashboard();
});

async function loadDashboard() {
  const user = Auth.getUser();
  Common.showLoading('recentContainer');

  try {
    const result = await Database.getItems(user.userId, 'all');
    if (!result.success) {
      Common.showError('recentContainer', result.error);
      return;
    }

    const items = result.items || [];

    // Stats
    const stats = { anime: 0, manga: 0, manhwa: 0, watching: 0, complete: 0, plan: 0, dropped: 0 };
    items.forEach(item => {
      if (stats[item.type] !== undefined) stats[item.type]++;
      if (stats[item.status] !== undefined) stats[item.status]++;
    });

    document.getElementById('statAnime').textContent = stats.anime;
    document.getElementById('statManga').textContent = stats.manga;
    document.getElementById('statManhwa').textContent = stats.manhwa;
    document.getElementById('statWatching').textContent = stats.watching;
    document.getElementById('statComplete').textContent = stats.complete;
    document.getElementById('statTotal').textContent = items.length;

    // Recent items (last 12)
    const recent = [...items].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 12);
    Common.renderGrid(recent, 'recentContainer');

    Database.setOnline(true);
  } catch (e) {
    Common.showError('recentContainer', 'Cannot connect. Check your Script URL in config.js');
    Database.setOnline(false);
  }
}

async function performSearch(query) {
  const user = Auth.getUser();
  const resultsEl = document.getElementById('searchResults');
  resultsEl.style.display = 'block';
  resultsEl.innerHTML = '<div class="search-loading">Searching...</div>';

  try {
    const result = await Database.search(user.userId, query);
    if (!result.success || result.items.length === 0) {
      resultsEl.innerHTML = `<div class="search-empty">No results for "${Common.escape(query)}"</div>`;
      return;
    }
    resultsEl.innerHTML = result.items.slice(0, 8).map(item => `
      <div class="search-result-item" onclick="DetailModal.open(${JSON.stringify(item).replace(/"/g, '&quot;')})">
        ${item.imageUrl ? `<img src="${Common.escape(item.imageUrl)}" onerror="this.style.display='none'">` : '<span class="sr-icon">🎬</span>'}
        <div class="sr-info">
          <strong>${Common.escape(item.title)}</strong>
          <span>${item.type} · ${Common.statusBadge(item.status)}</span>
        </div>
        <div class="sr-rating">${item.rating > 0 ? item.rating + '/10' : ''}</div>
      </div>
    `).join('');
  } catch (e) {
    resultsEl.innerHTML = '<div class="search-error">Search failed</div>';
  }
}

// Global helpers
function openEditModal(id) { Notification.info('Please go to the specific page to edit.'); }
function confirmDelete(id, title) { Notification.info('Please go to the specific page to delete.'); }
function openYoutubeModal(url, title) {
  const modal = document.getElementById('ytModal');
  if (modal) {
    document.getElementById('ytIframe').src = url + '?autoplay=1';
    document.getElementById('ytModalTitle').textContent = title;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

// Create YT modal for dashboard
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.createElement('div');
  modal.id = 'ytModal';
  modal.className = 'yt-modal-overlay';
  modal.innerHTML = `
    <div class="yt-modal-box">
      <div class="yt-modal-header">
        <span id="ytModalTitle" class="yt-modal-title"></span>
        <button class="yt-close" onclick="document.getElementById('ytIframe').src=''; this.closest('.yt-modal-overlay').classList.remove('open'); document.body.style.overflow='';">✕</button>
      </div>
      <div class="yt-embed-container">
        <iframe id="ytIframe" src="" frameborder="0" allowfullscreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
        </iframe>
      </div>
    </div>
  `;
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.getElementById('ytIframe').src = '';
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
  document.body.appendChild(modal);
});
