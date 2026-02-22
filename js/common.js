// ============================================================
// js/common.js - Shared Utilities & Common Functions (FINAL FIXED)
// ============================================================

const Common = {
  // Theme
  initTheme() {
    const theme = localStorage.getItem(CONFIG.THEME_KEY) || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    this.updateThemeBtn(theme);
  },

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(CONFIG.THEME_KEY, next);
    this.updateThemeBtn(next);
  },

  updateThemeBtn(theme) {
    const btn = document.getElementById('themeToggle');
    if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
  },

  // User info in header
  renderUserInfo() {
    const user = Auth.getUser();
    const userEl = document.getElementById('headerUser');
    if (!userEl) return;

    if (user) {
      userEl.innerHTML = `
        <span class="user-badge">
          <span class="user-avatar">${user.username[0].toUpperCase()}</span>
          <span class="user-name">${user.username}</span>
        </span>
        <button class="btn-logout" onclick="Auth.logout()">Logout</button>
      `;
    } else {
      userEl.innerHTML = `<a href="login.html" class="btn-login">Login</a>`;
    }
  },

  // Nav active state
  setActiveNav(page) {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      if (link.dataset.page === page) link.classList.add('active');
    });
  },

  // Format rating stars
  renderStars(rating) {
    const r = parseFloat(rating) || 0;
    const full = Math.floor(r / 2);
    const half = r % 2 >= 1;
    let stars = '';
    for (let i = 0; i < 5; i++) {
      if (i < full) stars += '<span class="star filled">★</span>';
      else if (i === full && half) stars += '<span class="star half">★</span>';
      else stars += '<span class="star">☆</span>';
    }
    return `<span class="stars-wrap">${stars}</span> <span class="rating-num">${r > 0 ? r + '/10' : 'N/A'}</span>`;
  },

  // Status badge
  statusBadge(status) {
    const labels = CONFIG.STATUS_LABELS;
    return `<span class="status-badge status-${status}">${labels[status] || status}</span>`;
  },

  // Escape HTML
  escape(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  },

  // Format date
  formatDate(iso) {
    if (!iso) return 'N/A';
    return new Date(iso).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
  },

  // Loading state
  showLoading(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = `
      <div class="loading-state">
        <div class="spinner-ring"></div>
        <p>Loading...</p>
      </div>
    `;
  },

  showEmpty(containerId, msg = 'No items found') {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>${msg}</h3>
        <p>Click the + button to add your first entry!</p>
      </div>
    `;
  },

  showError(containerId, msg) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = `
      <div class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>${msg}</h3>
        <p>Make sure your Google Apps Script URL is configured in js/config.js</p>
      </div>
    `;
  },

  // YouTube embed URL - More robust parsing
  getYoutubeEmbed(url) {
    if (!url || typeof url !== 'string') return null;
    
    // Clean the URL
    url = url.trim();
    
    // Handle different YouTube URL formats
    let videoId = null;
    
    // List of patterns to match
    const patterns = [
      // Standard youtube.com/watch?v=ID
      { regex: /youtube\.com\/watch\?v=([^&?#]+)/, group: 1 },
      // youtu.be/ID
      { regex: /youtu\.be\/([^?#]+)/, group: 1 },
      // youtube.com/embed/ID
      { regex: /youtube\.com\/embed\/([^?#]+)/, group: 1 },
      // youtube.com/v/ID
      { regex: /youtube\.com\/v\/([^?#]+)/, group: 1 },
      // youtube.com/shorts/ID
      { regex: /youtube\.com\/shorts\/([^?#]+)/, group: 1 },
      // Direct video ID (if just the ID is pasted)
      { regex: /^([a-zA-Z0-9_-]{11})$/, group: 1 }
    ];
    
    // Try each pattern
    for (const pattern of patterns) {
      const match = url.match(pattern.regex);
      if (match && match[pattern.group]) {
        videoId = match[pattern.group];
        break;
      }
    }
    
    // If still no match, try to extract any 11-character string
    if (!videoId && (url.includes('youtube') || url.includes('youtu.be'))) {
      const possibleId = url.match(/([a-zA-Z0-9_-]{11})/);
      if (possibleId) {
        videoId = possibleId[1];
      }
    }
    
    // Return the embed URL if we have a valid ID
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  },

  // ============================================================
  // FIXED: Build item card HTML - Only shows YouTube buttons if URL exists
  // ============================================================
  buildCard(item) {
    const hasImg = item.imageUrl && item.imageUrl.trim();
    const safeTitle = this.escape(item.title);
    const safeYoutubeUrl = this.escape(item.youtubeUrl);
    
    // IMPORTANT FIX: Check if youtubeUrl actually has content
    const hasYoutube = item.youtubeUrl && item.youtubeUrl.trim() !== '';

    return `
      <div class="item-card" data-id="${item.itemId}">
        <div class="card-image-wrap">
          ${hasImg
            ? `<img src="${this.escape(item.imageUrl)}" alt="${safeTitle}" 
                    class="card-img" loading="lazy"
                    onclick="${item.streamUrl ? `window.open('${this.escape(item.streamUrl)}','_blank')` : ''}"
                    style="${item.streamUrl ? 'cursor:pointer' : ''}"
                    onerror="this.src='https://via.placeholder.com/200x280/1a1a2e/00d4ff?text=No+Image'">`
            : `<div class="card-img-placeholder"><span>🎬</span></div>`
          }
          ${this.statusBadge(item.status)}
        </div>
        <div class="card-body">
          <h3 class="card-title" title="${safeTitle}">${safeTitle}</h3>
          <div class="card-meta">
            <span class="card-type type-${item.type}">${item.type.toUpperCase()}</span>
            ${item.year ? `<span class="card-year">${item.year}</span>` : ''}
          </div>
          <div class="card-rating">${this.renderStars(item.rating)}</div>
          <div class="card-eps">
            <span class="eps-label">EP:</span>
            <span>${item.episodesCurrent || 0} / ${item.episodesTotal || '?'}</span>
          </div>
          ${item.genre ? `<div class="card-genre">${this.escape(item.genre)}</div>` : ''}
          <div class="card-actions">
            <button class="btn-view" onclick="DetailModal.open(${JSON.stringify(item).replace(/"/g, '&quot;')})">👁 View</button>
            <button class="btn-edit" onclick="openEditModal('${item.itemId}')">✏️</button>
            <button class="btn-delete" onclick="confirmDelete('${item.itemId}', '${safeTitle}')">🗑️</button>
          </div>
          ${hasYoutube ? `
            <div class="card-yt-actions">
              <button class="btn-yt-embed" onclick="openYoutubeModal('${safeYoutubeUrl}', '${safeTitle}')">▶ Watch Trailer</button>
              <button class="btn-yt-direct" onclick="window.open('${safeYoutubeUrl}','_blank')">🌐 Open in YouTube</button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  },

  // Build items grid
  renderGrid(items, containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    if (!items || items.length === 0) {
      this.showEmpty(containerId);
      return;
    }
    el.innerHTML = `<div class="cards-grid">${items.map(i => this.buildCard(i)).join('')}</div>`;
  },

  // Count badges
  updateCounts(items) {
    const counts = { all: 0, watching: 0, plan: 0, complete: 0, dropped: 0 };
    items.forEach(item => {
      counts.all++;
      if (counts[item.status] !== undefined) counts[item.status]++;
    });
    Object.keys(counts).forEach(key => {
      const el = document.getElementById(`count-${key}`);
      if (el) el.textContent = counts[key];
    });
    return counts;
  }
};

window.Common = Common;