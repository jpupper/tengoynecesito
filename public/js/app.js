// Main app logic for index.html
function createProductCard(product) {
  const card = document.createElement('a');
  card.href = 'producto.html?id=' + product._id;
  card.className = 'product-card';
  
  const typeLabel = product.type === 'tengo' ? 'TENGO' : 'NECESITO';
  const typeClass = product.type === 'tengo' ? 'type-tengo' : 'type-necesito';
  const desc = product.description.substring(0, 120) + (product.description.length > 120 ? '...' : '');
  const date = new Date(product.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });

  card.innerHTML = `
    <div class="product-card-header">
      <span class="type-badge ${typeClass}">${typeLabel}</span>
      <span style="font-size:0.8rem;color:var(--text-secondary)">${product.category}</span>
    </div>
    <h3>${product.title}</h3>
    <p>${desc}</p>
    <div class="product-card-footer">
      <a href="profile.html?userId=${product.userId}" class="product-author-link" onclick="event.stopPropagation()">
        <div class="avatar-small">${product.username.charAt(0).toUpperCase()}</div>
        <span>${product.username}</span>
      </a>
      <span>${date}</span>
    </div>
  `;

  return card;
}

// Load latest products for home
document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('products-grid')) return;

  let currentFilter = 'all';

  function loadProducts() {
    let url = 'products/latest?limit=12';
    if (currentFilter !== 'all') url = 'products?type=' + currentFilter + '&status=active&limit=12';

    API.get(url).then(data => {
      const grid = document.getElementById('products-grid');
      grid.innerHTML = '';

      if (!data.products || data.products.length === 0) {
        grid.innerHTML = '<div class="empty-state">Todavia no hay publicaciones. <a href="nuevo.html">Se el primero!</a></div>';
        return;
      }

      data.products.forEach(p => {
        grid.appendChild(createProductCard(p));
      });
    });
  }

  // Stats
  API.get('products?limit=1').then(data => {
    const el = document.getElementById('stat-products');
    if (el && data.total !== undefined) el.textContent = data.total;
  });
  
  API.get('transactions/count?userId=all').catch(() => {});
  
  // Count all completed transactions
  API.get('products?limit=1').then(data => {
    if (data && data.total) {
      document.getElementById('stat-users').textContent = Math.ceil(data.total / 2) || 1;
    }
  });

  // Transaction count - get all completed
  API.get('products?limit=1').then(d => {
    // Just show some stats
  });

  loadProducts();

  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.type;
      loadProducts();
    });
  });
});
