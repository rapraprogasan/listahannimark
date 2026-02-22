// ============================================================
// js/auth.js - COMPLETE WITH CHANGE PASSWORD IN DROPDOWN
// ============================================================

const Auth = {
  currentUser: null,

  init() {
    const session = localStorage.getItem(CONFIG.SESSION_KEY);
    if (session) {
      try {
        this.currentUser = JSON.parse(session);
      } catch (e) {
        this.currentUser = null;
        localStorage.removeItem(CONFIG.SESSION_KEY);
      }
    }
    
    // Update UI if user is logged in
    if (this.currentUser) {
      this.updateHeaderUI();
    }
    
    return this.currentUser;
  },

  isLoggedIn() {
    return this.currentUser !== null;
  },

  getUser() {
    return this.currentUser;
  },

  setUser(user) {
    this.currentUser = user;
    localStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify(user));
    this.updateHeaderUI();
  },

  async login(username, password) {
    try {
      console.log('Attempting login for:', username);
      
      const response = await Database.request({
        action: 'login',
        username: username,
        password: password
      }, 'POST');

      console.log('Login response:', response);

      if (response && response.success) {
        if (response.user) {
          this.setUser(response.user);
          return { success: true, user: response.user };
        }
      }
      
      return { 
        success: false, 
        error: response?.error || 'Login failed' 
      };
      
    } catch (e) {
      console.error('Login error:', e);
      return { success: false, error: 'Connection error. Please try again.' };
    }
  },

  async register(data) {
    try {
      console.log('Attempting registration for:', data.username);
      
      const response = await Database.request({
        action: 'register',
        username: data.username,
        password: data.password,
        hintQuestion: data.hintQuestion || '',
        hintAnswer: data.hintAnswer || ''
      }, 'POST');

      console.log('Register response:', response);

      if (response && response.success) {
        return { 
          success: true, 
          message: response.message || 'Registration successful!' 
        };
      }
      
      return { 
        success: false, 
        error: response?.error || 'Registration failed' 
      };
      
    } catch (e) {
      console.error('Register error:', e);
      return { success: false, error: 'Connection error. Please try again.' };
    }
  },

  async verifyHint(username, hintAnswer) {
    try {
      const response = await Database.request({
        action: 'verifyHint',
        username: username,
        hintAnswer: hintAnswer
      }, 'POST');
      return response;
    } catch (e) {
      console.error('Verify hint error:', e);
      return { success: false, error: 'Connection error. Please try again.' };
    }
  },

  async changePassword(username, hintAnswer, newPassword) {
    try {
      // Validate password
      if (newPassword.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
      }
      
      const response = await Database.request({
        action: 'changePassword',
        username: username,
        hintAnswer: hintAnswer,
        newPassword: newPassword
      }, 'POST');
      
      return response;
    } catch (e) {
      console.error('Change password error:', e);
      return { success: false, error: 'Connection error. Please try again.' };
    }
  },

  logout() {
    this.currentUser = null;
    localStorage.removeItem(CONFIG.SESSION_KEY);
    this.updateHeaderUI();
    window.location.href = 'login.html';
  },

  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  },

  updateHeaderUI() {
    const headerUser = document.getElementById('headerUser');
    if (!headerUser) return;
    
    if (this.currentUser) {
      // Logged in state - show dropdown with Change Password
      headerUser.innerHTML = `
        <div class="user-dropdown">
          <button class="user-dropdown-btn" onclick="Auth.toggleDropdown(event)">
            <span class="user-avatar">👤</span>
            <span class="user-name">${this.currentUser.username}</span>
            <span class="dropdown-arrow">▼</span>
          </button>
          <div class="user-dropdown-menu">
            </a>
            <a href="change-password.html" class="dropdown-item">
              <span class="dropdown-icon">🔐</span>
              Change Password
            </a>
            <div class="dropdown-divider"></div>
            <button onclick="Auth.logout()" class="dropdown-item logout-item">
              <span class="dropdown-icon">🚪</span>
              Logout
            </button>
          </div>
        </div>
      `;
    } else {
      // Logged out state - show login/register buttons
      headerUser.innerHTML = `
        <div class="auth-buttons">
          <a href="login.html" class="login-link">Login</a>
          <a href="register.html" class="register-link">Register</a>
        </div>
      `;
    }
  },

  toggleDropdown(event) {
    if (event) {
      event.stopPropagation();
    }
    
    // Close all other dropdowns
    document.querySelectorAll('.user-dropdown').forEach(dropdown => {
      if (dropdown !== event?.currentTarget?.parentElement) {
        dropdown.classList.remove('active');
      }
    });
    
    // Toggle current dropdown
    const dropdown = event?.currentTarget?.parentElement;
    if (dropdown) {
      dropdown.classList.toggle('active');
    }
  },

  // Close dropdown when clicking outside
  setupClickOutside() {
    document.addEventListener('click', (event) => {
      const dropdowns = document.querySelectorAll('.user-dropdown');
      dropdowns.forEach(dropdown => {
        if (!dropdown.contains(event.target)) {
          dropdown.classList.remove('active');
        }
      });
    });
  }
};

// Initialize Auth when script loads
document.addEventListener('DOMContentLoaded', () => {
  Auth.init();
  Auth.setupClickOutside();
});

// Make Auth available globally
window.Auth = Auth;