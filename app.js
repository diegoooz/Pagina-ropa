document.body.classList.add('js-enabled');

const DataModule = (() => {
  const storeData = {
    whatsappNumber: '573000000000',
    heroPairs: [
      { left: 'fotoposteai.jpg', right: 'https://images.unsplash.com/photo-1516826957135-700dedea698c?auto=format&fit=crop&w=1400&q=80' },
      { left: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1400&q=80', right: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1400&q=80' },
      { left: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?auto=format&fit=crop&w=1400&q=80', right: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1400&q=80' }
    ],
    showcase: [
      { image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80', copy: 'Monocromía editorial con precisión urbana.' },
      { image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1600&q=80', copy: 'Siluetas amplias, intención profesional.' },
      { image: 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1600&q=80', copy: 'Streetwear de lujo funcional.' }
    ],
    products: [
      { id: 1, name: 'Camisa Concrete Line', category: 'Camisas', price: 169000, short: 'Corte recto técnico.', colors: ['Negro', 'Gris', 'Blanco'], featured: true, images: ['1','2','3','4'] },
      { id: 2, name: 'Camisa District Mono', category: 'Camisas', price: 149000, short: 'Base clean de layering.', colors: ['Blanco', 'Negro'], featured: true, images: ['1','2','3','4'] },
      { id: 3, name: 'Buzo Shadow Core', category: 'Buzos', price: 219000, short: 'Volumen premium.', colors: ['Negro', 'Gris'], featured: true, images: ['1','2','3','4'] },
      { id: 4, name: 'Buzo Midnight Crew', category: 'Buzos', price: 239000, short: 'Caída pesada y suave.', colors: ['Negro', 'Carbón'], featured: true, images: ['1','2','3','4'] },
      { id: 5, name: 'Chaqueta Asphalt Pro', category: 'Chaquetas', price: 299000, short: 'Protección ligera urbana.', colors: ['Negro', 'Grafito'], featured: true, images: ['1','2','3','4'] },
      { id: 6, name: 'Chaqueta Urban Draft', category: 'Chaquetas', price: 329000, short: 'Estructura técnica premium.', colors: ['Negro'], featured: true, images: ['1','2','3','4'] },
      { id: 7, name: 'Gorra Transit', category: 'Gorras', price: 99000, short: 'Finishing urbano clean.', colors: ['Negro', 'Gris'], featured: false, images: ['1','2','3','4'] }
    ]
  };

  return { storeData };
})();

const UIModule = (() => {
  const state = {
    cart: [],
    selected: null,
    filter: 'Todos',
    search: '',
    featuredIndex: 0,
    featuredLooping: false,
    modalImageIndex: 0,
    mobileScrollDebounce: null,
    touchStartX: 0,
    touchCurrentX: 0,
    touchStartTime: 0,
    touchDragging: false
  };

  const formatCOP = (value) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);

  const refs = {
    heroLeftCurrent: document.getElementById('heroLeftCurrent'),
    heroLeftNext: document.getElementById('heroLeftNext'),
    heroRightCurrent: document.getElementById('heroRightCurrent'),
    heroRightNext: document.getElementById('heroRightNext'),
    featuredTrack: document.getElementById('featuredTrack'),
    carouselViewport: document.getElementById('carouselViewport'),
    catalog: document.getElementById('catalog'),
    mainContent: document.getElementById('mainContent'),
    catalogGrid: document.getElementById('catalogGrid'),
    overlay: document.getElementById('productOverlay'),
    cartSidebar: document.getElementById('cartSidebar'),
    showcaseA: document.getElementById('showcaseImageA'),
    showcaseB: document.getElementById('showcaseImageB'),
    showcaseCopy: document.getElementById('showcaseCopy'),
    modalGalleryTrack: document.getElementById('modalGalleryTrack')
  };

  const getFeatured = () => DataModule.storeData.products.filter((item) => item.featured).slice(0, 6);
  const isMobileCarousel = () => window.matchMedia('(max-width: 900px)').matches;
  const getVisibleItems = () => isMobileCarousel() ? 1 : 3;

  function cardTemplate(product, className = 'product-card') {
    return `
      <article class="${className}" data-id="${product.id}">
        <img src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80" alt="${product.name}" />
        <h3>${product.name}</h3>
        <p>${product.category} · ${formatCOP(product.price)}</p>
        <div class="tooltip"><p>${product.short}</p><strong>${formatCOP(product.price)}</strong></div>
      </article>
    `;
  }

  function bindProductClicks(scope) {
    scope.querySelectorAll('[data-id]').forEach((card) => {
      card.addEventListener('click', () => {
        const product = DataModule.storeData.products.find((item) => item.id === Number(card.dataset.id));
        openProductModal(product);
      });
    });
  }

  function buildInfiniteTrack() {
    const featured = getFeatured();
    const visible = getVisibleItems();
    const headClones = featured.slice(0, visible);
    const tailClones = featured.slice(-visible);
    const sequence = [...tailClones, ...featured, ...headClones];

    refs.featuredTrack.innerHTML = sequence.map((item, index) => {
      const isClone = index < visible || index >= visible + featured.length;
      return cardTemplate(item).replace('<article', `<article data-clone="${isClone ? '1' : '0'}"`);
    }).join('');

    state.featuredIndex = visible;
    bindProductClicks(refs.featuredTrack);
    updateFeaturedPosition(false);
  }

  function getStepSize() {
    const firstCard = refs.featuredTrack.querySelector('.product-card');
    if (!firstCard) return 0;
    const style = window.getComputedStyle(refs.featuredTrack);
    const gap = parseFloat(style.columnGap || style.gap || '0');
    return firstCard.getBoundingClientRect().width + gap;
  }

  function updateFeaturedPosition(withTransition = true) {
    const step = getStepSize();
    if (!step) return;

    if (isMobileCarousel()) {
      refs.featuredTrack.style.transition = 'none';
      refs.featuredTrack.style.transform = 'none';
      refs.carouselViewport.scrollTo({ left: state.featuredIndex * step, behavior: withTransition ? 'smooth' : 'auto' });
      return;
    }

    refs.featuredTrack.style.transition = withTransition ? 'transform 1.2s cubic-bezier(0.22, 0.61, 0.36, 1)' : 'none';
    refs.featuredTrack.style.transform = `translateX(-${state.featuredIndex * step}px)`;
  }

  function moveFeatured(direction) {
    if (state.featuredLooping) return;
    state.featuredLooping = true;
    state.featuredIndex += direction;
    updateFeaturedPosition(true);
  }


  function instantMobileReposition(index) {
    refs.carouselViewport.classList.add('no-snap');
    state.featuredIndex = index;
    updateFeaturedPosition(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        refs.carouselViewport.classList.remove('no-snap');
      });
    });
  }

  function normalizeInfinitePosition() {
    const featured = getFeatured();
    const visible = getVisibleItems();
    const minIndex = visible;
    const maxIndex = visible + featured.length - 1;

    if (state.featuredIndex > maxIndex) {
      if (isMobileCarousel()) instantMobileReposition(minIndex);
      else {
        state.featuredIndex = minIndex;
        updateFeaturedPosition(false);
      }
    } else if (state.featuredIndex < minIndex) {
      if (isMobileCarousel()) instantMobileReposition(maxIndex);
      else {
        state.featuredIndex = maxIndex;
        updateFeaturedPosition(false);
      }
    }

    state.featuredLooping = false;
  }

  function syncIndexFromMobileScroll() {
    if (!isMobileCarousel()) return;
    const step = getStepSize();
    if (!step) return;

    const rawIndex = Math.round(refs.carouselViewport.scrollLeft / step);
    state.featuredIndex = rawIndex;

    clearTimeout(state.mobileScrollDebounce);
    state.mobileScrollDebounce = setTimeout(() => {
      normalizeInfinitePosition();
    }, 120);
  }

  function renderFeatured() {
    buildInfiniteTrack();
  }

  function renderCatalog() {
    const query = state.search.trim().toLowerCase();
    const products = DataModule.storeData.products.filter((product) => {
      const categoryMatch = state.filter === 'Todos' || product.category === state.filter;
      const searchMatch = !query || product.name.toLowerCase().includes(query) || product.category.toLowerCase().includes(query);
      return categoryMatch && searchMatch;
    });
    refs.catalogGrid.innerHTML = products.map((product) => cardTemplate(product, 'catalog-card')).join('');
    bindProductClicks(refs.catalogGrid);
  }

  function renderFilters() {
    const filters = ['Todos', ...new Set(DataModule.storeData.products.map((item) => item.category))];
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
    refs.mainContent.classList.add('hidden');
    refs.catalog.classList.remove('hidden');
    refs.catalog.classList.add('visible');
    document.getElementById('menuPanel').classList.remove('active');
  }

  function closeCatalog() {
    refs.catalog.classList.add('hidden');
    refs.mainContent.classList.remove('hidden');
  }

  function updateModalImage() {
    if (!state.selected) return;
    const total = state.selected.images.length;
    state.modalImageIndex = ((state.modalImageIndex % total) + total) % total;

    refs.modalGalleryTrack.innerHTML = state.selected.images.map((_, index) =>
      `<div class="modal-placeholder ${index === state.modalImageIndex ? 'active' : ''}"></div>`
    ).join('');
  }

  function changeModalImage(direction, event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (!state.selected) return;
    state.modalImageIndex += direction;
    updateModalImage();
  }

  function createProductWhatsAppLink(product, qty, color) {
    const text = encodeURIComponent(`Hola, quiero comprar este producto:\n• ${product.name} (${color}) x${qty}\nPrecio unitario: ${formatCOP(product.price)}\nTotal: ${formatCOP(product.price * qty)}`);
    return `https://wa.me/${DataModule.storeData.whatsappNumber}?text=${text}`;
  }

  function openProductModal(product) {
    state.selected = product;
    state.modalImageIndex = 0;
    updateModalImage();

    document.getElementById('modalTitle').textContent = product.name;
    document.getElementById('modalDescription').textContent = product.short;
    document.getElementById('modalPrice').textContent = formatCOP(product.price);
    document.getElementById('modalColor').innerHTML = product.colors.map((color) => `<option value="${color}">${color}</option>`).join('');
    document.getElementById('modalQty').value = 1;
    document.getElementById('buyNowBtn').href = createProductWhatsAppLink(product, 1, product.colors[0]);

    refs.overlay.classList.remove('hidden');
    requestAnimationFrame(() => refs.overlay.classList.add('show'));
  }

  function closeProductModal() {
    refs.overlay.classList.remove('show');
    setTimeout(() => refs.overlay.classList.add('hidden'), 260);
  }

  function updateBuyNowLink() {
    if (!state.selected) return;
    const qty = Number(document.getElementById('modalQty').value) || 1;
    const color = document.getElementById('modalColor').value;
    document.getElementById('buyNowBtn').href = createProductWhatsAppLink(state.selected, qty, color);
  }

  function buildCartLink(total) {
    if (!state.cart.length) return `https://wa.me/${DataModule.storeData.whatsappNumber}`;
    const items = state.cart.map((item) => `• ${item.name} (${item.color}) x${item.qty}`).join('\n');
    const text = encodeURIComponent(`Hola, quiero finalizar mi pedido:\n${items}\nTotal: ${formatCOP(total)}`);
    return `https://wa.me/${DataModule.storeData.whatsappNumber}?text=${text}`;
  }

  function updateCart() {
    const items = document.getElementById('cartItems');
    items.innerHTML = state.cart.map((item) => `<li>${item.name} (${item.color}) x${item.qty} · ${formatCOP(item.price * item.qty)}</li>`).join('');
    const totalQty = state.cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = state.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    document.getElementById('cartCount').textContent = String(totalQty);
    document.getElementById('cartTotal').textContent = formatCOP(totalPrice);
    document.getElementById('checkoutWhatsapp').href = buildCartLink(totalPrice);
  }

  function addToCart() {
    if (!state.selected) return;
    const qty = Number(document.getElementById('modalQty').value) || 1;
    const color = document.getElementById('modalColor').value;
    state.cart.push({ ...state.selected, qty, color });
    updateCart();
  }

  function initHeroDirectionalTransition() {
    const pairs = DataModule.storeData.heroPairs;
    let index = 0;
    let cycling = false;

    refs.heroLeftCurrent.style.backgroundImage = `url(${pairs[0].left})`;
    refs.heroRightCurrent.style.backgroundImage = `url(${pairs[0].right})`;

    setInterval(() => {
      if (cycling) return;
      cycling = true;

      index = (index + 1) % pairs.length;
      const nextPair = pairs[index];

      refs.heroLeftNext.style.backgroundImage = `url(${nextPair.left})`;
      refs.heroRightNext.style.backgroundImage = `url(${nextPair.right})`;

      // Ensure browser paints next layers before current layers start exiting.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          refs.heroLeftCurrent.classList.add('is-exiting');
          refs.heroRightCurrent.classList.add('is-exiting');

          setTimeout(() => {
            refs.heroLeftCurrent.classList.remove('is-exiting');
            refs.heroRightCurrent.classList.remove('is-exiting');
            refs.heroLeftCurrent.style.backgroundImage = 'none';
            refs.heroRightCurrent.style.backgroundImage = 'none';
            refs.heroLeftCurrent.classList.add('is-hidden');
            refs.heroRightCurrent.classList.add('is-hidden');

            setTimeout(() => {
              refs.heroLeftCurrent.style.backgroundImage = refs.heroLeftNext.style.backgroundImage || 'none';
              refs.heroRightCurrent.style.backgroundImage = refs.heroRightNext.style.backgroundImage || 'none';

              requestAnimationFrame(() => {
                refs.heroLeftCurrent.classList.remove('is-hidden');
                refs.heroRightCurrent.classList.remove('is-hidden');
                cycling = false;
              });
            }, 500);
          }, 1200);
        });
      });
    }, 5000);
  }

  function initShowcaseSlider() {
    const slides = DataModule.storeData.showcase;
    let index = 0;
    let activeIsA = true;
    refs.showcaseA.src = slides[0].image;
    refs.showcaseCopy.textContent = slides[0].copy;

    setInterval(() => {
      index = (index + 1) % slides.length;
      const next = slides[index];
      if (activeIsA) {
        refs.showcaseB.src = next.image;
        refs.showcaseB.classList.add('active');
        refs.showcaseA.classList.remove('active');
      } else {
        refs.showcaseA.src = next.image;
        refs.showcaseA.classList.add('active');
        refs.showcaseB.classList.remove('active');
      }
      refs.showcaseCopy.textContent = next.copy;
      activeIsA = !activeIsA;
    }, 5000);
  }

  function setupIntersectionObserver() {
    const sections = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      sections.forEach((section) => section.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.target.classList.toggle('visible', entry.isIntersecting));
    }, { threshold: 0.2 });

    sections.forEach((section) => observer.observe(section));
  }


  function bindCarouselTouchSwipe() {
    const viewport = refs.carouselViewport;

    const onTouchStart = (event) => {
      if (!isMobileCarousel() || state.featuredLooping) return;
      const touch = event.touches[0];
      state.touchStartX = touch.clientX;
      state.touchCurrentX = touch.clientX;
      state.touchStartTime = performance.now();
      state.touchDragging = true;
    };

    const onTouchMove = (event) => {
      if (!state.touchDragging) return;
      state.touchCurrentX = event.touches[0].clientX;
    };

    const onTouchEnd = () => {
      if (!state.touchDragging) return;
      state.touchDragging = false;

      const deltaX = state.touchCurrentX - state.touchStartX;
      const elapsed = Math.max(1, performance.now() - state.touchStartTime);
      const velocity = Math.abs(deltaX / elapsed);
      const step = getStepSize();
      const threshold = Math.min(64, step * 0.18);

      if (Math.abs(deltaX) > threshold || velocity > 0.45) {
        moveFeatured(deltaX < 0 ? 1 : -1);
      }
    };

    viewport.addEventListener('touchstart', onTouchStart, { passive: true });
    viewport.addEventListener('touchmove', onTouchMove, { passive: true });
    viewport.addEventListener('touchend', onTouchEnd, { passive: true });
    viewport.addEventListener('touchcancel', () => { state.touchDragging = false; }, { passive: true });
  }

  function bindUI() {
    refs.featuredTrack.addEventListener('transitionend', () => {
      if (!isMobileCarousel()) normalizeInfinitePosition();
    });
    refs.carouselViewport.addEventListener('scroll', syncIndexFromMobileScroll, { passive: true });
    bindCarouselTouchSwipe();

    document.getElementById('modalPrev')?.addEventListener('click', (e) => changeModalImage(-1, e));
    document.getElementById('modalNext')?.addEventListener('click', (e) => changeModalImage(1, e));

    document.getElementById('searchToggle').addEventListener('click', () => {
      const wrap = document.getElementById('searchWrap');
      wrap.classList.toggle('active');
      if (wrap.classList.contains('active')) document.getElementById('searchInput').focus();
    });

    const handleSearch = (value) => {
      state.search = value;
      renderCatalog();
    };

    document.getElementById('searchInput').addEventListener('input', (event) => handleSearch(event.target.value));
    document.getElementById('catalogSearch').addEventListener('input', (event) => handleSearch(event.target.value));

    document.getElementById('menuToggle').addEventListener('click', () => {
      document.getElementById('menuPanel').classList.toggle('active');
    });

    document.getElementById('productsMenuBtn').addEventListener('click', () => openCatalog(state.filter));
    document.getElementById('accordionToggle').addEventListener('click', () => {
      document.getElementById('submenuCategories').classList.toggle('open');
      document.getElementById('accordionToggle').classList.toggle('rotate');
    });

    document.querySelectorAll('#submenuCategories button').forEach((button) => {
      button.addEventListener('click', () => openCatalog(button.dataset.category));
    });

    document.getElementById('viewMoreBtn').addEventListener('click', () => openCatalog(state.filter));
    document.getElementById('backBtn').addEventListener('click', closeCatalog);
    document.getElementById('goHome').addEventListener('click', closeCatalog);

    document.getElementById('prevFeatured').addEventListener('click', () => moveFeatured(-1));
    document.getElementById('nextFeatured').addEventListener('click', () => moveFeatured(1));

    window.addEventListener('resize', renderFeatured);

    document.querySelector('.cart-toggle').addEventListener('click', () => refs.cartSidebar.classList.add('open'));
    document.getElementById('closeCart').addEventListener('click', () => refs.cartSidebar.classList.remove('open'));

    document.getElementById('addToCartBtn').addEventListener('click', addToCart);
    document.getElementById('modalQty').addEventListener('input', updateBuyNowLink);
    document.getElementById('modalColor').addEventListener('change', updateBuyNowLink);

    document.getElementById('closeModal').addEventListener('click', closeProductModal);
    refs.overlay.addEventListener('click', (event) => {
      if (event.target === refs.overlay) closeProductModal();
    });
  }

  function init() {
    initHeroDirectionalTransition();
    initShowcaseSlider();
    renderFilters();
    renderFeatured();
    renderCatalog();
    setupIntersectionObserver();
    bindUI();
  }

  return { init };
})();

UIModule.init();
