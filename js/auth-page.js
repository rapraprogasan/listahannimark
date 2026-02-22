// ============================================================
// js/auth-page.js - Login & Register Page Logic
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  Auth.init();
  Common.initTheme();
  Notification.init();

  const page = document.body.dataset.page;

  if (page === 'login') {
    if (Auth.isLoggedIn()) {
      window.location.href = 'index.html';
      return;
    }
    initLoginPage();
  } else if (page === 'register') {
    if (Auth.isLoggedIn()) {
      window.location.href = 'index.html';
      return;
    }
    initRegisterPage();
  }
});

function initLoginPage() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (!username || !password) {
      Notification.warning('Please fill in all fields');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Logging in...';

    const result = await Auth.login(username, password);

    if (result.success) {
      Notification.success(`Welcome back, ${result.user.username}! 🎉`);
      setTimeout(() => window.location.href = 'index.html', 1000);
    } else {
      Notification.error(result.error || 'Login failed');
      btn.disabled = false;
      btn.textContent = 'Login';
    }
  });
}

function initRegisterPage() {
  const form = document.getElementById('registerForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const confirmPass = document.getElementById('confirmPassword').value;
    const hintQuestion = document.getElementById('hintQuestion').value.trim();
    const hintAnswer = document.getElementById('hintAnswer').value.trim();

    if (!username || !password || !confirmPass) {
      Notification.warning('Please fill in all required fields');
      return;
    }
    if (password !== confirmPass) {
      Notification.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      Notification.warning('Password must be at least 6 characters');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Creating account...';

    const result = await Auth.register({ username, password, hintQuestion, hintAnswer });

    if (result.success) {
      Notification.success('Account created! Redirecting to login... 🎉');
      setTimeout(() => window.location.href = 'login.html', 1500);
    } else {
      Notification.error(result.error || 'Registration failed');
      btn.disabled = false;
      btn.textContent = 'Create Account';
    }
  });
}
