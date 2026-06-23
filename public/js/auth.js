// Sistema de autenticacion SSO via fscauth
let TOKEN = null;
let CURRENT_USER = null;

function isLoggedIn() {
  return !!TOKEN && !!CURRENT_USER;
}

function getUser() {
  return CURRENT_USER;
}

function getToken() {
  return TOKEN;
}

function loadToken() {
  // Check URL params first (SSO redirect)
  const params = new URLSearchParams(window.location.search);
  const urlToken = params.get('token');
  const urlUsername = params.get('username');
  const urlUserId = params.get('userId');

  if (urlToken) {
    TOKEN = urlToken;
    CURRENT_USER = { userId: urlUserId || urlToken, username: urlUsername || 'Usuario' };
    localStorage.setItem('tyn_token', urlToken);
    localStorage.setItem('tyn_user', JSON.stringify(CURRENT_USER));
    
    // Clean URL
    const cleanUrl = window.location.pathname + window.location.hash;
    window.history.replaceState({}, document.title, cleanUrl);
    return true;
  }

  // Check localStorage
  const storedToken = localStorage.getItem('tyn_token');
  const storedUser = localStorage.getItem('tyn_user');
  if (storedToken && storedUser) {
    TOKEN = storedToken;
    CURRENT_USER = JSON.parse(storedUser);
    return true;
  }

  return false;
}

function showLogin() {
  const currentUrl = window.location.href;
  const redirectUrl = new URL(currentUrl);
  // Remove any existing token/user params
  ['token', 'username', 'userId'].forEach(p => redirectUrl.searchParams.delete(p));
  
  window.location.href = CONFIG.FSCAUTH_URL + '/login.html?redirect=' + 
    encodeURIComponent(redirectUrl.toString()) + '&origin=' + CONFIG.APP_NAME;
}

function logout() {
  TOKEN = null;
  CURRENT_USER = null;
  localStorage.removeItem('tyn_token');
  localStorage.removeItem('tyn_user');
  window.location.href = CONFIG.BASE + '/';
}

function initAuth(callback) {
  loadToken();
  updateAuthUI();
  if (callback) callback();
}

function updateAuthUI() {
  const authNav = document.getElementById('auth-nav');
  const userNav = document.getElementById('user-nav');
  const btnLogin = document.getElementById('btn-login');
  const btnLogout = document.getElementById('btn-logout');

  if (!authNav || !userNav) return;

  if (isLoggedIn()) {
    authNav.style.display = 'none';
    userNav.style.display = 'flex';
    if (btnLogout) {
      btnLogout.addEventListener('click', logout);
    }
  } else {
    authNav.style.display = 'flex';
    userNav.style.display = 'none';
    if (btnLogin) {
      btnLogin.addEventListener('click', (e) => {
        e.preventDefault();
        showLogin();
      });
    }
  }
}

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
});
