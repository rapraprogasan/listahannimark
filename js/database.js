// ============================================================
// js/database.js - COMPLETE VERSION
// ============================================================

const Database = {
  isOnline: false,
  statusCallbacks: [],

  async request(data, method = 'GET') {
    const url = CONFIG.SCRIPT_URL;
    
    // Check if URL is configured
    if (!url || url.includes('YOUR_GOOGLE_APPS_SCRIPT_URL')) {
      console.error('Script URL not configured');
      this.setOnline(false);
      Notification.show('Script URL not configured. Please check config.js', 'error');
      return { success: false, error: 'Script URL not configured' };
    }

    try {
      console.log('Sending request to:', url);
      console.log('Data:', data);

      // Convert data to URL parameters
      const params = new URLSearchParams();
      Object.keys(data).forEach(key => {
        params.append(key, data[key]);
      });

      let response;
      
      if (method === 'POST') {
        // Use POST with form data
        response = await fetch(url, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString()
        });
      } else {
        // Use GET with query string
        response = await fetch(`${url}?${params.toString()}`, {
          method: 'GET',
          mode: 'cors'
        });
      }

      // Try to parse response
      let result;
      const text = await response.text();
      console.log('Raw response:', text);
      
      try {
        result = JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse JSON:', text);
        result = { success: false, error: 'Invalid server response' };
      }

      this.setOnline(true);
      return result;
      
    } catch (error) {
      console.error('Database request error:', error);
      this.setOnline(false);
      Notification.show('Connection error. Please check your internet.', 'error');
      return { 
        success: false, 
        error: 'Connection error. Please try again.',
        details: error.toString()
      };
    }
  },

  setOnline(status) {
    this.isOnline = status;
    this.statusCallbacks.forEach(cb => cb(status));
    this.updateIndicator(status);
  },

  onStatusChange(callback) {
    this.statusCallbacks.push(callback);
    // Call immediately with current status
    callback(this.isOnline);
  },

  updateIndicator(online) {
    const indicators = document.querySelectorAll('.db-status');
    indicators.forEach(el => {
      if (el) {
        el.className = `db-status ${online ? 'online' : 'offline'}`;
        el.innerHTML = `<span class="db-dot"></span>${online ? 'Online' : 'Offline'}`;
      }
    });
  },

  async init() {
    try {
      const result = await this.request({ action: 'init', test: 'ping' });
      this.setOnline(result.success === true);
      return result;
    } catch (e) {
      this.setOnline(false);
      return { success: false, error: e.toString() };
    }
  },

  async getItems(userId, type = 'all') {
    return await this.request({ action: 'getItems', userId, type });
  },

  async addItem(userId, itemData) {
    return await this.request({ 
      action: 'addItem', 
      userId, 
      ...itemData 
    }, 'POST');
  },

  async updateItem(userId, itemData) {
    return await this.request({ 
      action: 'updateItem', 
      userId, 
      ...itemData 
    }, 'POST');
  },

  async deleteItem(userId, itemId) {
    return await this.request({ 
      action: 'deleteItem', 
      userId, 
      itemId 
    }, 'POST');
  },

  async search(userId, query) {
    return await this.request({ action: 'search', userId, query });
  }
};

window.Database = Database;