// API helper - maneja todas las llamadas al backend
const API = {
  getBaseUrl() {
    // If running on localhost, use local API
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return '/api';
    }
    return CONFIG.API_URL;
  },

  async request(method, endpoint, body) {
    const url = this.getBaseUrl() + '/' + endpoint.replace(/^\//, '');
    const headers = { 'Content-Type': 'application/json' };
    
    if (TOKEN) {
      headers['Authorization'] = 'Bearer ' + TOKEN;
    }

    const options = { method, headers };
    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    try {
      const res = await fetch(url, options);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('[API Error]', method, endpoint, err);
      return { success: false, message: 'Error de conexion' };
    }
  },

  get(endpoint) { return this.request('GET', endpoint); },
  post(endpoint, body) { return this.request('POST', endpoint, body); },
  put(endpoint, body) { return this.request('PUT', endpoint, body); },
  del(endpoint) { return this.request('DELETE', endpoint); }
};
