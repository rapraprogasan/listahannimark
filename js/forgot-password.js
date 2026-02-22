// ============================================================
// js/forgot-password.js
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  Auth.init();
  Common.initTheme();
  Notification.init();

  let step = 1;
  let verifiedUsername = '';
  let verifiedHintAnswer = '';

  const step1 = document.getElementById('step1');
  const step2 = document.getElementById('step2');
  const step3 = document.getElementById('step3');

  // Step 1: Enter username
  const step1Form = document.getElementById('step1Form');
  if (step1Form) {
    step1Form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('fpUsername').value.trim();
      const hintAnswer = document.getElementById('fpHintAnswer').value.trim();
      if (!username || !hintAnswer) {
        Notification.warning('Please fill in all fields');
        return;
      }

      const btn = step1Form.querySelector('button');
      btn.disabled = true;
      btn.textContent = 'Verifying...';

      const result = await Auth.verifyHint(username, hintAnswer);
      if (result.success) {
        verifiedUsername = username;
        verifiedHintAnswer = hintAnswer;
        step1.style.display = 'none';
        step2.style.display = 'block';
        Notification.success('Identity verified! Set your new password.');
      } else {
        Notification.error(result.error || 'Verification failed');
        btn.disabled = false;
        btn.textContent = 'Verify';
      }
    });
  }

  // Step 2: New password
  const step2Form = document.getElementById('step2Form');
  if (step2Form) {
    step2Form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newPassword = document.getElementById('newPassword').value;
      const confirmPassword = document.getElementById('confirmNewPassword').value;

      if (!newPassword || !confirmPassword) {
        Notification.warning('Please fill in all fields');
        return;
      }
      if (newPassword !== confirmPassword) {
        Notification.error('Passwords do not match');
        return;
      }
      if (newPassword.length < 6) {
        Notification.warning('Password must be at least 6 characters');
        return;
      }

      const btn = step2Form.querySelector('button');
      btn.disabled = true;
      btn.textContent = 'Changing...';

      const result = await Auth.changePassword(verifiedUsername, verifiedHintAnswer, newPassword);
      if (result.success) {
        step2.style.display = 'none';
        step3.style.display = 'block';
        Notification.success('Password changed successfully!');
      } else {
        Notification.error(result.error || 'Failed to change password');
        btn.disabled = false;
        btn.textContent = 'Change Password';
      }
    });
  }
});
