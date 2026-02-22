// ============================================================
// js/list-page-core.js - COMPLETE FIXED VERSION WITH YOUTUBE MODAL
// ============================================================

const ListPage = {
  type: 'anime',
  items: [],
  filtered: [],
  currentFilter: 'all',
  searchQuery: '',
  editingId: null,
  ytModal: null,

  init(type) {
    this.type = type;
    Auth.init();
    Common.initTheme();
    Notification.init();
    DetailModal.init();

    if (!Auth.requireAuth()) return;

    Common.renderUserInfo();
    Common.setActiveNav(type);
    this.setupYtModal();
    this.setupAddModal();
    this.setupSearch();
    this.setupFilterTabs();
    this.setupThemeToggle();
    this.loadItems();
  },

  setupThemeToggle() {
    const btn = document.getElementById('themeToggle');
    if (btn) btn.addEventListener('click', () => Common.toggleTheme());
  },

  setupSearch() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    let timer;
    input.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        this.searchQuery = input.value.trim().toLowerCase();
        this.applyFilters();
      }, 300);
    });
  },

  setupFilterTabs() {
    document.querySelectorAll('.filter-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentFilter = tab.dataset.status;
        this.applyFilters();
      });
    });
  },

  // ============================================================
  // IMPROVED YOUTUBE FUNCTIONS - FIXED FOR RESTRICTED URLS
  // ============================================================
  
  extractYoutubeId(url) {
    if (!url || typeof url !== 'string') return null;
    
    // Clean the URL
    url = url.trim();
    
    // Handle different YouTube URL formats
    const patterns = [
      // Standard youtube.com/watch?v=ID
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&?#]+)/,
      // youtube.com/shorts/ID
      /youtube\.com\/shorts\/([^&?#]+)/,
      // Direct video ID (if just the ID is pasted)
      /^([a-zA-Z0-9_-]{11})$/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        // Validate it's a proper YouTube ID (usually 11 characters)
        const id = match[1];
        // Remove any extra parameters
        const cleanId = id.split('&')[0].split('?')[0];
        if (cleanId.length === 11 || pattern === patterns[2]) {
          return cleanId;
        }
      }
    }
    
    // Fallback: try to extract any 11-character string
    const idMatch = url.match(/([a-zA-Z0-9_-]{11})/);
    return idMatch ? idMatch[1] : null;
  },

  setupYtModal() {
    // Remove existing modal if any
    const existingModal = document.getElementById('ytModal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'ytModal';
    modal.className = 'yt-modal-overlay';
    modal.innerHTML = `
      <div class="yt-modal-box">
        <div class="yt-modal-header">
          <span id="ytModalTitle" class="yt-modal-title"></span>
          <button class="yt-close" onclick="ListPage.closeYtModal()">✕</button>
        </div>
        <div class="yt-embed-container">
          <iframe id="ytIframe" src="" frameborder="0" allowfullscreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
          </iframe>
        </div>
        <div class="yt-modal-footer">
          <button class="btn-yt-direct" onclick="ListPage.openDirectYoutube()">Open in YouTube Website</button>
        </div>
      </div>
    `;
    
    // Close when clicking overlay
    modal.addEventListener('click', (e) => { 
      if (e.target === modal) this.closeYtModal(); 
    });
    
    document.body.appendChild(modal);
    this.ytModal = modal;
    this.currentYoutubeUrl = '';
  },

  openYtModal(url, title) {
    if (!url) {
      Notification.warning('No YouTube URL provided');
      return;
    }

    // Store the original URL for direct link
    this.currentYoutubeUrl = url;

    // Extract video ID
    const videoId = this.extractYoutubeId(url);
    
    if (!videoId) {
      Notification.warning('Could not extract YouTube video ID. Opening directly instead.');
      console.log('Failed to extract ID from:', url);
      
      // Open the URL directly
      window.open(url, '_blank');
      return;
    }
    
    // Create embed URL with parameters
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`;
    
    const iframe = document.getElementById('ytIframe');
    const titleEl = document.getElementById('ytModalTitle');
    
    if (iframe) {
      // Clear previous src first to prevent loading issues
      iframe.src = '';
      // Set new src after a tiny delay
      setTimeout(() => {
        iframe.src = embedUrl;
      }, 100);
    }
    
    if (titleEl) titleEl.textContent = title || 'YouTube Video';
    
    this.ytModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  openDirectYoutube() {
    if (this.currentYoutubeUrl) {
      window.open(this.currentYoutubeUrl, '_blank');
    }
  },

  closeYtModal() {
    const iframe = document.getElementById('ytIframe');
    if (iframe) {
      // Stop video by clearing src
      iframe.src = '';
    }
    
    this.ytModal.classList.remove('open');
    document.body.style.overflow = '';
    this.currentYoutubeUrl = '';
  },

  // ============================================================
  // ITEMS MANAGEMENT
  // ============================================================

  async loadItems() {
    Common.showLoading('itemsContainer');
    const user = Auth.getUser();
    try {
      const result = await Database.getItems(user.userId, this.type);
      if (result.success) {
        this.items = result.items || [];
        Common.updateCounts(this.items);
        this.applyFilters();
        Database.setOnline(true);
      } else {
        Common.showError('itemsContainer', result.error || 'Failed to load items');
      }
    } catch (e) {
      Common.showError('itemsContainer', 'Cannot connect to database. Check your Script URL in config.js');
      Database.setOnline(false);
    }
  },

  applyFilters() {
    let result = [...this.items];
    if (this.currentFilter !== 'all') {
      result = result.filter(i => i.status === this.currentFilter);
    }
    if (this.searchQuery) {
      result = result.filter(i =>
        i.title.toLowerCase().includes(this.searchQuery) ||
        (i.genre && i.genre.toLowerCase().includes(this.searchQuery)) ||
        (i.notes && i.notes.toLowerCase().includes(this.searchQuery))
      );
    }
    this.filtered = result;
    Common.renderGrid(this.filtered, 'itemsContainer');
    this.updateResultCount();
  },

  updateResultCount() {
    const el = document.getElementById('resultCount');
    if (el) el.textContent = `${this.filtered.length} title${this.filtered.length !== 1 ? 's' : ''}`;
  },

  setupAddModal() {
    // Populate genre select
    const genreSelect = document.getElementById('itemGenre');
    if (genreSelect) {
      // Clear existing options
      genreSelect.innerHTML = '<option value="">Select Genre</option>';
      CONFIG.GENRES.forEach(g => {
        const opt = document.createElement('option');
        opt.value = g;
        opt.textContent = g;
        genreSelect.appendChild(opt);
      });
    }

    // Form submit
    const form = document.getElementById('itemForm');
    if (form) {
      // Remove existing listeners
      const newForm = form.cloneNode(true);
      form.parentNode.replaceChild(newForm, form);
      
      newForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.saveItem();
      });
    }
  },

  openAddModal() {
    this.editingId = null;
    const form = document.getElementById('itemForm');
    if (form) form.reset();
    
    // Set default values
    const statusSelect = document.getElementById('itemStatus');
    if (statusSelect) statusSelect.value = 'plan';
    
    const ratingInput = document.getElementById('itemRating');
    if (ratingInput) ratingInput.value = 0;
    
    const epCurrent = document.getElementById('itemEpCurrent');
    if (epCurrent) epCurrent.value = 0;
    
    const epTotal = document.getElementById('itemEpTotal');
    if (epTotal) epTotal.value = 0;
    
    const title = document.getElementById('modalTitle');
    if (title) title.textContent = `Add ${this.type.charAt(0).toUpperCase() + this.type.slice(1)}`;
    
    document.getElementById('itemModal').classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  openEditModal(itemId) {
    const item = this.items.find(i => i.itemId === itemId);
    if (!item) return;

    this.editingId = itemId;
    const title = document.getElementById('modalTitle');
    if (title) title.textContent = 'Edit Entry';

    // Fill form
    const fields = {
      itemTitle: item.title || '',
      itemStatus: item.status || 'plan',
      itemEpCurrent: item.episodesCurrent || 0,
      itemEpTotal: item.episodesTotal || 0,
      itemRating: item.rating || 0,
      itemImageUrl: item.imageUrl || '',
      itemStreamUrl: item.streamUrl || '',
      itemYoutubeUrl: item.youtubeUrl || '',
      itemNotes: item.notes || '',
      itemGenre: item.genre || '',
      itemYear: item.year || ''
    };

    Object.keys(fields).forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = fields[id];
    });

    document.getElementById('itemModal').classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  closeModal() {
    document.getElementById('itemModal').classList.remove('open');
    document.body.style.overflow = '';
    this.editingId = null;
  },

  // ============================================================
  // IMPROVED: Save item with YouTube URL handling
  // ============================================================
  async saveItem() {
    const user = Auth.getUser();
    if (!user) {
      Notification.error('Please login first');
      return;
    }

    // Get form values
    const title = document.getElementById('itemTitle')?.value.trim();
    if (!title) {
      Notification.warning('Title is required!');
      return;
    }

    // Get YouTube URL - STORE AS-IS, don't modify
    let youtubeUrl = document.getElementById('itemYoutubeUrl')?.value.trim() || '';
    
    // Optional: Validate but don't modify the URL
    if (youtubeUrl) {
      const videoId = this.extractYoutubeId(youtubeUrl);
      if (!videoId) {
        // Just warn, but still save the original URL
        Notification.warning('YouTube URL format may be invalid. It will still be saved.');
        console.log('Potentially invalid YouTube URL:', youtubeUrl);
      }
    }

    const data = {
      type: this.type,
      title: title,
      status: document.getElementById('itemStatus')?.value || 'plan',
      episodesCurrent: parseFloat(document.getElementById('itemEpCurrent')?.value) || 0,
      episodesTotal: parseFloat(document.getElementById('itemEpTotal')?.value) || 0,
      rating: parseFloat(document.getElementById('itemRating')?.value) || 0,
      imageUrl: document.getElementById('itemImageUrl')?.value.trim() || '',
      streamUrl: document.getElementById('itemStreamUrl')?.value.trim() || '',
      youtubeUrl: youtubeUrl, // Save the URL as-is
      notes: document.getElementById('itemNotes')?.value.trim() || '',
      genre: document.getElementById('itemGenre')?.value || '',
      year: document.getElementById('itemYear')?.value.trim() || ''
    };

    const btn = document.querySelector('#itemForm [type="submit"]');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Saving...';
    }

    try {
      let result;
      if (this.editingId) {
        result = await Database.updateItem(user.userId, { ...data, itemId: this.editingId });
      } else {
        result = await Database.addItem(user.userId, data);
      }

      if (result && result.success) {
        Notification.success(this.editingId ? 'Updated successfully! ✅' : 'Added successfully! 🎉');
        this.closeModal();
        await this.loadItems();
      } else {
        Notification.error(result?.error || 'Save failed');
      }
    } catch (e) {
      console.error('Save error:', e);
      Notification.error('Connection error. Please try again.');
    }

    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Save';
    }
  },

  async deleteItem(itemId) {
    const user = Auth.getUser();
    if (!user) return;

    try {
      const result = await Database.deleteItem(user.userId, itemId);
      if (result && result.success) {
        Notification.success('Deleted successfully!');
        await this.loadItems();
      } else {
        Notification.error(result?.error || 'Delete failed');
      }
    } catch (e) {
      console.error('Delete error:', e);
      Notification.error('Connection error');
    }
  },

  confirmDelete(itemId, title) {
    if (confirm(`Delete "${title}"? This cannot be undone.`)) {
      this.deleteItem(itemId);
    }
  }
};

// ============================================================
// GLOBAL HELPERS
// ============================================================
function openEditModal(id) { 
  if (ListPage) ListPage.openEditModal(id); 
}

function confirmDelete(id, title) { 
  if (ListPage) ListPage.confirmDelete(id, title); 
}

function openYoutubeModal(url, title) { 
  if (ListPage) {
    ListPage.openYtModal(url, title); 
  } else {
    console.error('ListPage not initialized');
  }
}

// Make ListPage globally available
window.ListPage = ListPage;