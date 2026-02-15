const storeData = {
  whatsappNumber: "573000000000",
  heroImages: [
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1516826957135-700dedea698c?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1400&q=80"
  ],
  products: [
    { id: 1, name: "Camisa Concrete Line", category: "Camisas", price: 169000, short: "Corte recto técnico con textura dry-touch.", colors: ["Negro", "Gris", "Blanco"], featured: true, images: ["https://images.unsplash.com/photo-1593032465171-8bd8f3d63ac5?auto=format&fit=crop&w=900&q=80", "https://images.unsplash.com/photo-1527719327859-c6ce80353573?auto=format&fit=crop&w=900&q=80"] },
    { id: 2, name: "Buzo Shadow Core", category: "Buzos", price: 219000, short: "Volumen premium y caída urbana refinada.", colors: ["Negro", "Gris"], featured: true, images: ["https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=80", "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80"] },
    { id: 3, name: "Chaqueta Asphalt Pro", category: "Chaquetas", price: 299000, short: "Protección ligera con lenguaje sartorial street.", colors: ["Negro", "Grafito"], featured: true, images: ["https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?auto=format&fit=crop&w=900&q=80", "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=900&q=80"] },
    { id: 4, name: "Gorra Transit", category: "Gorras", price: 99000, short: "Línea clean para finishing urbano.", colors: ["Negro", "Gris"], featured: false, images: ["https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=900&q=80"] },
    { id: 5, name: "Camisa District Mono", category: "Camisas", price: 149000, short: "Base minimal para layering profesional.", colors: ["Blanco", "Negro"], featured: false, images: ["https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=900&q=80"] }
  ]
};

const state = { cart: [], selected: null, filter: 'Todos', search: '' };

const heroSlider = document.getElementById('heroSlider');
const featuredTrack = document.getElementById('featuredTrack');
const galleryGrid = document.getElementById('galleryGrid');
const catalogGrid = document.getElementById('catalogGrid');
const catalog = document.getElementById('catalog');
const mainContent = document.getElementById('mainContent');
const overlay = document.getElementById('productOverlay');

const formatCOP = (value) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);

function cardTemplate(product, cls = 'product-card') {
  return `
    <article class="${cls}" data-id="${product.id}">
      <img src="${product.images[0]}" alt="${product.name}" />
      <h3>${product.name}</h3>
      <p>${product.category} · ${formatCOP(product.price)}</p>
      <div class="hover-tooltip">
        <p>${product.short}</p>
        <strong>${formatCOP(product.price)}</strong>
      </div>
    </article>
  `;
}

function startHeroSlider() {
  let idx = 0;
  heroSlider.style.backgroundImage = `url(${storeData.heroImages[idx]})`;
  setInterval(() => {
    idx = (idx + 1) % storeData.heroImages.length;
    heroSlider.style.backgroundImage = `url(${storeData.heroImages[idx]})`;
  }, 4200);
}

function bindProductClicks(scope) {
  scope.querySelectorAll('[data-id]').forEach((node) => {
    node.addEventListener('click', () => {
      const product = storeData.products.find((item) => item.id === Number(node.dataset.id));
      openProduct(product);
    });
  });
}

function renderFeatured() {
  featuredTrack.innerHTML = storeData.products.filter((p) => p.featured).slice(0, 3).map((p) => cardTemplate(p)).join('');
  bindProductClicks(featuredTrack);
}

function renderGallery() {
  galleryGrid.innerHTML = storeData.products.slice(0, 4).map((p) => cardTemplate(p, 'gallery-item')).join('');
  bindProductClicks(galleryGrid);
}

function getFilteredProducts() {
  return storeData.products.filter((product) => {
    const matchesCategory = state.filter === 'Todos' || product.category === state.filter;
    const query = state.search.trim().toLowerCase();
    const matchesSearch = !query || product.name.toLowerCase().includes(query) || product.category.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });
}

function renderCatalog() {
  catalogGrid.innerHTML = getFilteredProducts().map((product) => cardTemplate(product)).join('');
  bindProductClicks(catalogGrid);
}

function renderFilters() {
  const filters = ['Todos', ...new Set(storeData.products.map((p) => p.category))];
  const container = document.getElementById('catalogFilters');
  container.innerHTML = filters.map((filter) => `<button class="filter-btn ${state.filter === filter ? 'active' : ''}" data-filter="${filter}">${filter}</button>`).join('');
  container.querySelectorAll('.filter-btn').forEach((button) => {
    button.addEventListener('click', () => {
      state.filter = button.dataset.filter;
      renderFilters();
      renderCatalog();
    });
  });
}

function openCatalog(filter = 'Todos') {
  state.filter = filter;
  renderFilters();
  renderCatalog();
  mainContent.classList.add('hidden');
  catalog.classList.remove('hidden');
  document.getElementById('menuPanel').classList.remove('active');
}

function openProduct(product) {
  state.selected = product;
  document.getElementById('modalImage').src = product.images[0];
  document.getElementById('modalTitle').textContent = product.name;
  document.getElementById('modalDescription').textContent = product.short;
  document.getElementById('modalPrice').textContent = formatCOP(product.price);
  document.getElementById('modalColor').innerHTML = product.colors.map((color) => `<option value="${color}">${color}</option>`).join('');
  document.getElementById('modalQty').value = 1;
  overlay.classList.remove('hidden');
  requestAnimationFrame(() => overlay.classList.add('show'));
}

function closeProduct() {
  overlay.classList.remove('show');
  setTimeout(() => overlay.classList.add('hidden'), 220);
}

function addToCart() {
  if (!state.selected) return;
  const qty = Number(document.getElementById('modalQty').value);
  const color = document.getElementById('modalColor').value;
  state.cart.push({ ...state.selected, qty, color });
  updateCart();
  closeProduct();
}

function buildWhatsappLink(total) {
  if (!state.cart.length) return `https://wa.me/${storeData.whatsappNumber}`;
  const items = state.cart.map((i) => `• ${i.name} (${i.color}) x${i.qty}`).join('\n');
  const text = encodeURIComponent(`Hola, quiero finalizar mi pedido:\n${items}\nTotal: ${formatCOP(total)}`);
  return `https://wa.me/${storeData.whatsappNumber}?text=${text}`;
}

function updateCart() {
  document.getElementById('cartItems').innerHTML = state.cart.map((item) => `<li>${item.name} (${item.color}) x${item.qty} · ${formatCOP(item.qty * item.price)}</li>`).join('');
  const qty = state.cart.reduce((acc, item) => acc + item.qty, 0);
  const total = state.cart.reduce((acc, item) => acc + item.qty * item.price, 0);
  document.getElementById('cartCount').textContent = String(qty);
  document.getElementById('cartTotal').textContent = formatCOP(total);
  document.getElementById('checkoutWhatsapp').href = buildWhatsappLink(total);
}

function setupObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('visible'));
  }, { threshold: 0.2, rootMargin: '0px 0px -50px 0px' });
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
}

function bindUI() {
  document.getElementById('searchToggle').addEventListener('click', () => {
    const wrap = document.getElementById('searchWrap');
    wrap.classList.toggle('active');
    if (wrap.classList.contains('active')) document.getElementById('searchInput').focus();
  });

  document.getElementById('searchInput').addEventListener('input', (event) => {
    state.search = event.target.value;
    renderCatalog();
  });

  document.getElementById('menuToggle').addEventListener('click', () => {
    document.getElementById('menuPanel').classList.toggle('active');
  });

  document.getElementById('productsMenuBtn').addEventListener('click', () => openCatalog(state.filter));
  document.getElementById('accordionToggle').addEventListener('click', (event) => {
    event.stopPropagation();
    document.getElementById('submenuCategories').classList.toggle('open');
    event.currentTarget.classList.toggle('rotate');
  });

  document.querySelectorAll('#submenuCategories button').forEach((button) => {
    button.addEventListener('click', () => openCatalog(button.dataset.category));
  });

  document.getElementById('viewMoreBtn').addEventListener('click', () => openCatalog(state.filter));
  document.getElementById('backBtn').addEventListener('click', () => {
    catalog.classList.add('hidden');
    mainContent.classList.remove('hidden');
  });

  document.getElementById('catalogSearch').addEventListener('input', (event) => {
    state.search = event.target.value;
    renderCatalog();
  });

  document.querySelector('.cart-toggle').addEventListener('click', () => document.getElementById('cartSidebar').classList.add('open'));
  document.getElementById('closeCart').addEventListener('click', () => document.getElementById('cartSidebar').classList.remove('open'));

  document.getElementById('addToCartBtn').addEventListener('click', addToCart);
  document.getElementById('closeModal').addEventListener('click', closeProduct);
  overlay.addEventListener('click', (event) => event.target === overlay && closeProduct());

  document.getElementById('goHome').addEventListener('click', () => {
    catalog.classList.add('hidden');
    mainContent.classList.remove('hidden');
  });
}

(function init() {
  startHeroSlider();
  renderFeatured();
  renderGallery();
  renderFilters();
  renderCatalog();
  setupObserver();
  bindUI();
})();
