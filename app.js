const storeData = {
  brand: "UUP STUDIO",
  whatsappNumber: "573000000000",
  heroImages: [
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1516826957135-700dedea698c?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1400&q=80"
  ],
  products: [
    {
      id: 1,
      name: "Camisa Concrete Line",
      category: "Camisas",
      price: 169000,
      colors: ["Negro", "Gris Cemento", "Blanco"],
      featured: true,
      images: [
        "https://images.unsplash.com/photo-1593032465171-8bd8f3d63ac5?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1527719327859-c6ce80353573?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80"
      ]
    },
    {
      id: 2,
      name: "Buzo Shadow Core",
      category: "Buzos",
      price: 219000,
      colors: ["Negro", "Gris"],
      featured: true,
      images: [
        "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80"
      ]
    },
    {
      id: 3,
      name: "Chaqueta Asphalt Pro",
      category: "Chaquetas",
      price: 299000,
      colors: ["Negro", "Grafito"],
      featured: true,
      images: [
        "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=900&q=80"
      ]
    },
    {
      id: 4,
      name: "Gorra Transit",
      category: "Gorras",
      price: 99000,
      colors: ["Negro", "Gris"],
      featured: false,
      images: [
        "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80"
      ]
    },
    {
      id: 5,
      name: "Camisa District Mono",
      category: "Camisas",
      price: 149000,
      colors: ["Blanco", "Negro"],
      featured: false,
      images: [
        "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80"
      ]
    }
  ]
};

const state = { cart: [], selected: null, categoryFilter: null };

const heroSlider = document.getElementById("heroSlider");
const featuredTrack = document.getElementById("featuredTrack");
const featuredPreview = document.getElementById("featuredPreview");
const galleryGrid = document.getElementById("galleryGrid");
const catalogGrid = document.getElementById("catalogGrid");
const modal = document.getElementById("productModal");
const cartSidebar = document.getElementById("cartSidebar");

function formatCOP(value) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
}

function startHeroSlider() {
  let index = 0;
  heroSlider.style.backgroundImage = `url(${storeData.heroImages[index]})`;
  setInterval(() => {
    index = (index + 1) % storeData.heroImages.length;
    heroSlider.style.backgroundImage = `url(${storeData.heroImages[index]})`;
  }, 4200);
}

function productCardTemplate(product, type = "catalog") {
  return `
    <article class="${type}-item product-card" data-id="${product.id}">
      <img src="${product.images[0]}" alt="${product.name}" />
      <h3>${product.name}</h3>
      <p>${product.category} · ${formatCOP(product.price)}</p>
    </article>
  `;
}

function renderFeatured() {
  const featured = storeData.products.filter((p) => p.featured).slice(0, 3);
  featuredTrack.innerHTML = featured.map((p) => productCardTemplate(p, "featured")).join("");

  featuredTrack.querySelectorAll(".product-card").forEach((card) => {
    const product = storeData.products.find((p) => p.id === Number(card.dataset.id));
    card.addEventListener("mouseenter", () => showPreview(product));
    card.addEventListener("click", () => openModal(product));
  });
}

function showPreview(product) {
  featuredPreview.classList.add("active");
  featuredPreview.innerHTML = `
    <img src="${product.images[0]}" alt="Preview ${product.name}" />
    <div>
      <h4>${product.name}</h4>
      <p>${formatCOP(product.price)}</p>
      <div class="preview-thumbs">
        ${product.images.slice(0, 3).map((image) => `<img src="${image}" alt="${product.name}" />`).join("")}
      </div>
    </div>
  `;
}

function renderGallery() {
  const items = storeData.products.slice(0, 4);
  galleryGrid.innerHTML = items.map((p) => `
    <article class="gallery-item" data-id="${p.id}">
      <img src="${p.images[1] || p.images[0]}" alt="${p.name}" />
      <h3>${p.name}</h3>
      <p>${formatCOP(p.price)}</p>
    </article>
  `).join("");

  galleryGrid.querySelectorAll(".gallery-item").forEach((item) => {
    const product = storeData.products.find((p) => p.id === Number(item.dataset.id));
    item.addEventListener("click", () => openModal(product));
  });
}

function renderCatalog() {
  const products = state.categoryFilter
    ? storeData.products.filter((p) => p.category === state.categoryFilter)
    : storeData.products;

  catalogGrid.innerHTML = products.map((p) => productCardTemplate(p, "catalog")).join("");
  catalogGrid.querySelectorAll(".product-card").forEach((card) => {
    const product = storeData.products.find((p) => p.id === Number(card.dataset.id));
    card.addEventListener("click", () => openModal(product));
  });
}

function openModal(product) {
  state.selected = product;
  document.getElementById("modalImage").src = product.images[0];
  document.getElementById("modalTitle").textContent = product.name;
  document.getElementById("modalPrice").textContent = formatCOP(product.price);
  document.getElementById("modalQty").value = 1;
  document.getElementById("modalColor").innerHTML = product.colors.map((color) => `<option value="${color}">${color}</option>`).join("");
  modal.classList.remove("hidden");
}

function closeModal() { modal.classList.add("hidden"); }

function addToCart() {
  if (!state.selected) return;
  const qty = Number(document.getElementById("modalQty").value);
  const color = document.getElementById("modalColor").value;
  state.cart.push({ ...state.selected, qty, color });
  updateCart();
  closeModal();
}

function updateCart() {
  const cartItems = document.getElementById("cartItems");
  const cartCount = document.getElementById("cartCount");
  const cartTotal = document.getElementById("cartTotal");

  cartItems.innerHTML = state.cart.map((item) => `
    <li>${item.name} (${item.color}) x${item.qty} - ${formatCOP(item.price * item.qty)}</li>
  `).join("");

  const total = state.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  cartCount.textContent = String(state.cart.reduce((sum, item) => sum + item.qty, 0));
  cartTotal.textContent = formatCOP(total);
  document.getElementById("checkoutWhatsapp").href = buildWhatsappLink(total);
}

function buildWhatsappLink(total) {
  if (!state.cart.length) return `https://wa.me/${storeData.whatsappNumber}`;
  const summary = state.cart.map((item) => `• ${item.name} (${item.color}) x${item.qty}`).join("\n");
  const text = `Hola, quiero finalizar mi pedido:%0A${encodeURIComponent(summary)}%0ATotal: ${encodeURIComponent(formatCOP(total))}`;
  return `https://wa.me/${storeData.whatsappNumber}?text=${text}`;
}

function setupObservers() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  }, { threshold: 0.25, rootMargin: "0px 0px -40px 0px" });

  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
}

function bindUI() {
  document.querySelector(".menu-toggle").addEventListener("click", () => {
    document.getElementById("mobileMenu").classList.toggle("active");
  });

  document.querySelectorAll("#mobileMenu a").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      state.categoryFilter = link.dataset.category;
      renderCatalog();
      document.getElementById("mainContent").classList.add("hidden");
      document.getElementById("catalog").classList.remove("hidden");
      document.getElementById("mobileMenu").classList.remove("active");
    });
  });

  document.getElementById("viewMoreBtn").addEventListener("click", () => {
    renderCatalog();
    document.getElementById("mainContent").classList.add("hidden");
    document.getElementById("catalog").classList.remove("hidden");
  });

  document.getElementById("backBtn").addEventListener("click", () => {
    document.getElementById("catalog").classList.add("hidden");
    document.getElementById("mainContent").classList.remove("hidden");
    state.categoryFilter = null;
  });

  document.querySelector(".cart-toggle").addEventListener("click", () => cartSidebar.classList.add("open"));
  document.getElementById("closeCart").addEventListener("click", () => cartSidebar.classList.remove("open"));

  document.getElementById("closeModal").addEventListener("click", closeModal);
  document.getElementById("addToCartBtn").addEventListener("click", addToCart);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
}

(function init() {
  startHeroSlider();
  renderFeatured();
  renderGallery();
  renderCatalog();
  setupObservers();
  bindUI();
})();
