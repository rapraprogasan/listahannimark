// ============================================================
// js/detail-modal.js - Full Detail View Modal
// ============================================================

const DetailModal = {
  modal: null,

  init() {
    // Create modal if not exists
    if (!document.getElementById('detailModal')) {
      const div = document.createElement('div');
      div.id = 'detailModal';
      div.className = 'detail-modal-overlay';
      div.innerHTML = `
        <div class="detail-modal-box">
          <button class="detail-close" onclick="DetailModal.close()">✕</button>
          <div id="detailModalContent"></div>
        </div>
      `;
      div.addEventListener('click', (e) => {
        if (e.target === div) this.close();
      });
      document.body.appendChild(div);
    }
    this.modal = document.getElementById('detailModal');
  },

  open(item) {
    if (!this.modal) this.init();
    const embedUrl = Common.getYoutubeEmbed(item.youtubeUrl);

    const content = document.getElementById('detailModalContent');
    content.innerHTML = `
      <div class="detail-header">
        ${item.imageUrl
          ? `<img src="${Common.escape(item.imageUrl)}" class="detail-img" 
                  onerror="this.src='https://via.placeholder.com/200x280/1a1a2e/00d4ff?text=No+Image'"
                  ${item.streamUrl ? `onclick="window.open('${Common.escape(item.streamUrl)}','_blank')" style="cursor:pointer" title="Click to stream"` : ''}>`
          : `<div class="detail-img-placeholder">🎬</div>`
        }
        <div class="detail-info">
          <h2 class="detail-title">${Common.escape(item.title)}</h2>
          <div class="detail-badges">
            <span class="card-type type-${item.type}">${item.type.toUpperCase()}</span>
            ${Common.statusBadge(item.status)}
          </div>
          <div class="detail-rating">${Common.renderStars(item.rating)}</div>
          <div class="detail-meta-grid">
            <div class="meta-item"><span class="meta-label">Episodes</span><span>${item.episodesCurrent || 0} / ${item.episodesTotal || '?'}</span></div>
            ${item.genre ? `<div class="meta-item"><span class="meta-label">Genre</span><span>${Common.escape(item.genre)}</span></div>` : ''}
            ${item.year ? `<div class="meta-item"><span class="meta-label">Year</span><span>${item.year}</span></div>` : ''}
            <div class="meta-item"><span class="meta-label">Added</span><span>${Common.formatDate(item.createdAt)}</span></div>
            <div class="meta-item"><span class="meta-label">Updated</span><span>${Common.formatDate(item.updatedAt)}</span></div>
          </div>
          <div class="detail-links">
            ${item.streamUrl ? `<a href="${Common.escape(item.streamUrl)}" target="_blank" class="detail-link-btn stream-btn">🎬 Watch Now</a>` : ''}
          </div>
        </div>
      </div>
      ${item.notes ? `
        <div class="detail-notes">
          <h4>📝 Notes</h4>
          <p>${Common.escape(item.notes).replace(/\n/g, '<br>')}</p>
        </div>
      ` : ''}
      ${embedUrl ? `
        <div class="detail-youtube">
          <h4>🎬 Trailer / PV</h4>
          <div class="yt-embed-wrap">
            <iframe src="${embedUrl}" frameborder="0" allowfullscreen 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
            </iframe>
          </div>
        </div>
      ` : ''}
      <div class="detail-footer-actions">
        <button class="btn-edit" onclick="DetailModal.close(); openEditModal('${item.itemId}')">✏️ Edit</button>
        <button class="btn-delete" onclick="DetailModal.close(); confirmDelete('${item.itemId}', '${Common.escape(item.title)}')">🗑️ Delete</button>
      </div>
    `;

    this.modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  close() {
    if (this.modal) {
      this.modal.classList.remove('open');
      document.body.style.overflow = '';
      // Stop any playing videos
      const iframe = this.modal.querySelector('iframe');
      if (iframe) iframe.src = iframe.src;
    }
  }
};

window.DetailModal = DetailModal;
