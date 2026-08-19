// Application State & Logic for RoseDash

// Global Application State
const state = {
  cart: [],
  currentView: 'home', // 'home', 'restaurant', 'checkout', 'order-status'
  selectedRestaurant: null,
  filters: {
    cuisine: 'all',
    searchQuery: '',
    vegOnly: false,
    sortBy: 'default'
  },
  currentOrder: null
};

// DOM Elements cache
const DOM = {
  // Views
  homeView: document.getElementById('home-view'),
  restaurantView: document.getElementById('restaurant-view'),
  checkoutView: document.getElementById('checkout-view'),
  orderStatusView: document.getElementById('order-status-view'),
  
  // Navigation / Header
  logoTrigger: document.getElementById('logo-trigger'),
  navbarSearch: document.getElementById('navbar-search'),
  cartDrawerTrigger: document.getElementById('cart-drawer-trigger'),
  headerCartCount: document.getElementById('header-cart-count'),
  
  // Home Elements
  heroSearch: document.getElementById('hero-search'),
  heroSearchBtn: document.getElementById('hero-search-btn'),
  cuisineCategories: document.getElementById('cuisine-categories'),
  vegOnlyFilter: document.getElementById('veg-only-filter'),
  restaurantSort: document.getElementById('restaurant-sort'),
  restaurantsGrid: document.getElementById('restaurants-grid-container'),
  resCountLabel: document.getElementById('res-count-label'),
  
  // Restaurant Menu Elements
  menuBackBtn: document.getElementById('menu-back-btn'),
  resBannerImg: document.getElementById('res-banner-img'),
  resDetailName: document.getElementById('res-detail-name'),
  resDetailRating: document.getElementById('res-detail-rating'),
  resDetailTime: document.getElementById('res-detail-time'),
  resDetailDistance: document.getElementById('res-detail-distance'),
  resDetailCost: document.getElementById('res-detail-cost'),
  menuCategoryNav: document.getElementById('menu-category-nav'),
  menuItemsContainer: document.getElementById('menu-items-container'),
  
  // Cart Elements
  cartDrawer: document.getElementById('cart-drawer'),
  cartDrawerOverlay: document.getElementById('cart-drawer-overlay'),
  cartCloseBtn: document.getElementById('cart-close-btn'),
  cartItemsContainer: document.getElementById('cart-items-container'),
  cartFooterCalculations: document.getElementById('cart-footer-calculations'),
  cartSubtotal: document.getElementById('cart-subtotal'),
  cartDeliveryFee: document.getElementById('cart-delivery-fee'),
  cartTax: document.getElementById('cart-tax'),
  cartTotal: document.getElementById('cart-total'),
  cartCheckoutBtn: document.getElementById('cart-checkout-btn'),
  
  // Checkout Elements
  checkoutBackBtn: document.getElementById('checkout-back-btn'),
  checkoutForm: document.getElementById('checkout-form'),
  placeOrderBtn: document.getElementById('place-order-btn'),
  checkoutItemsSummary: document.getElementById('checkout-items-summary'),
  checkoutSubtotal: document.getElementById('checkout-subtotal'),
  checkoutDeliveryFee: document.getElementById('checkout-delivery-fee'),
  checkoutTax: document.getElementById('checkout-tax'),
  checkoutTotal: document.getElementById('checkout-total'),
  orderSummaryRestaurant: document.getElementById('order-summary-restaurant'),
  
  // Tracking Elements
  trackingOrderId: document.getElementById('tracking-order-id'),
  trackingEta: document.getElementById('tracking-eta'),
  trackingBike: document.getElementById('tracking-bike'),
  trackingProgress: document.getElementById('tracking-progress'),
  trackingHomeBtn: document.getElementById('tracking-home-btn'),
  
  // Steps
  stepConfirmed: document.getElementById('step-confirmed'),
  stepPreparing: document.getElementById('step-preparing'),
  stepOutForDelivery: document.getElementById('step-outfordelivery'),
  stepDelivered: document.getElementById('step-delivered')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  renderCategories();
  renderRestaurants();
  updateCartUI();
});

// Setup All Interactive Event Listeners
function setupEventListeners() {
  // Logo / Navigation
  DOM.logoTrigger.addEventListener('click', () => {
    resetFilters();
    switchView('home');
  });

  // Search Listeners
  DOM.navbarSearch.addEventListener('input', (e) => {
    state.filters.searchQuery = e.target.value;
    if (state.currentView !== 'home') {
      switchView('home');
    }
    renderRestaurants();
  });

  DOM.heroSearch.addEventListener('input', (e) => {
    state.filters.searchQuery = e.target.value;
    DOM.navbarSearch.value = e.target.value;
    renderRestaurants();
  });

  DOM.heroSearchBtn.addEventListener('click', () => {
    state.filters.searchQuery = DOM.heroSearch.value;
    DOM.navbarSearch.value = DOM.heroSearch.value;
    renderRestaurants();
  });

  // Cart Drawer toggles
  DOM.cartDrawerTrigger.addEventListener('click', toggleCartDrawer);
  DOM.cartCloseBtn.addEventListener('click', toggleCartDrawer);
  DOM.cartDrawerOverlay.addEventListener('click', toggleCartDrawer);

  // Home Filters & Sorting
  DOM.vegOnlyFilter.addEventListener('click', () => {
    state.filters.vegOnly = !state.filters.vegOnly;
    DOM.vegOnlyFilter.classList.toggle('active', state.filters.vegOnly);
    renderRestaurants();
    if (state.selectedRestaurant) {
      renderMenu(); // Update menu list too if viewing a restaurant
    }
  });

  DOM.restaurantSort.addEventListener('change', (e) => {
    state.filters.sortBy = e.target.value;
    renderRestaurants();
  });

  // Back Buttons
  DOM.menuBackBtn.addEventListener('click', () => {
    switchView('home');
  });

  DOM.checkoutBackBtn.addEventListener('click', () => {
    switchView('restaurant');
  });

  DOM.trackingHomeBtn.addEventListener('click', () => {
    switchView('home');
  });

  // Checkout Actions
  DOM.cartCheckoutBtn.addEventListener('click', () => {
    if (state.cart.length > 0) {
      goToCheckout();
    }
  });

  DOM.checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    placeOrder();
  });

  // Payment Options Select
  document.querySelectorAll('.pay-opt-card').forEach(card => {
    card.addEventListener('click', (e) => {
      document.querySelectorAll('.pay-opt-card').forEach(c => c.classList.remove('active'));
      const activeCard = e.currentTarget;
      activeCard.classList.add('active');
    });
  });
}

// Router Switch Views
function switchView(viewName) {
  state.currentView = viewName;
  
  // Hide all sections
  DOM.homeView.style.display = 'none';
  DOM.restaurantView.style.display = 'none';
  DOM.checkoutView.style.display = 'none';
  DOM.orderStatusView.style.display = 'none';

  // Show active section
  if (viewName === 'home') {
    DOM.homeView.style.display = 'block';
  } else if (viewName === 'restaurant') {
    DOM.restaurantView.style.display = 'block';
  } else if (viewName === 'checkout') {
    DOM.checkoutView.style.display = 'block';
  } else if (viewName === 'order-status') {
    DOM.orderStatusView.style.display = 'block';
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Reset Filters Helper
function resetFilters() {
  state.filters.cuisine = 'all';
  state.filters.searchQuery = '';
  state.filters.vegOnly = false;
  state.filters.sortBy = 'default';
  
  DOM.navbarSearch.value = '';
  DOM.heroSearch.value = '';
  DOM.vegOnlyFilter.classList.remove('active');
  DOM.restaurantSort.value = 'default';
  
  document.querySelectorAll('.category-card').forEach(c => {
    c.classList.toggle('active', c.dataset.id === 'all');
  });
}

// Render Horizontal Cuisines List
function renderCategories() {
  DOM.cuisineCategories.innerHTML = '';
  CATEGORIES.forEach(cat => {
    const card = document.createElement('div');
    card.className = `category-card ${state.filters.cuisine === cat.id ? 'active' : ''}`;
    card.dataset.id = cat.id;
    card.innerHTML = `
      <span class="category-icon">${cat.icon}</span>
      <span class="category-name">${cat.name}</span>
    `;

    card.addEventListener('click', () => {
      document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      state.filters.cuisine = cat.id;
      renderRestaurants();
    });

    DOM.cuisineCategories.appendChild(card);
  });
}

// Render Restaurants Grid
function renderRestaurants() {
  DOM.restaurantsGrid.innerHTML = '';
  
  // Filter Logic
  let filtered = [...RESTAURANTS];

  // 1. Cuisine Category filter
  if (state.filters.cuisine !== 'all') {
    const selectedCatName = CATEGORIES.find(c => c.id === state.filters.cuisine).name.toLowerCase();
    filtered = filtered.filter(res => 
      res.cuisines.some(c => c.toLowerCase().includes(selectedCatName) || selectedCatName.includes(c.toLowerCase()))
    );
  }

  // 2. Search Query filter
  if (state.filters.searchQuery.trim() !== '') {
    const query = state.filters.searchQuery.toLowerCase().trim();
    filtered = filtered.filter(res => 
      res.name.toLowerCase().includes(query) ||
      res.cuisines.some(c => c.toLowerCase().includes(query)) ||
      res.menu.some(cat => cat.items.some(item => item.name.toLowerCase().includes(query)))
    );
  }

  // 3. Veg Only filter
  if (state.filters.vegOnly) {
    filtered = filtered.filter(res => 
      res.menu.some(cat => cat.items.some(item => item.isVeg === true))
    );
  }

  // 4. Sort Logic
  if (state.filters.sortBy === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (state.filters.sortBy === 'time') {
    filtered.sort((a, b) => a.deliveryTime - b.deliveryTime);
  } else if (state.filters.sortBy === 'cost-low') {
    filtered.sort((a, b) => a.costForTwo - b.costForTwo);
  } else if (state.filters.sortBy === 'cost-high') {
    filtered.sort((a, b) => b.costForTwo - a.costForTwo);
  }

  // Update label
  DOM.resCountLabel.innerText = `Found ${filtered.length} matching restaurant${filtered.length === 1 ? '' : 's'}`;

  if (filtered.length === 0) {
    DOM.restaurantsGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
        <i class="fa-solid fa-utensils" style="font-size: 3.5rem; margin-bottom: 1rem; color: var(--text-dim);"></i>
        <h3>No Restaurants Match Your Criteria</h3>
        <p style="font-size: 0.9rem; margin-top: 0.25rem;">Try modifying your search or cuisine filters.</p>
      </div>
    `;
    return;
  }

  // Generate cards
  filtered.forEach(res => {
    const card = document.createElement('article');
    card.className = 'restaurant-card';
    
    const vegBadgeCount = res.menu.reduce((acc, cat) => acc + cat.items.filter(i => i.isVeg).length, 0);
    const totalItems = res.menu.reduce((acc, cat) => acc + cat.items.length, 0);
    const vegLabelHtml = vegBadgeCount === totalItems 
      ? '<span class="tag-distance" style="background: rgba(74, 222, 128, 0.2); border: 1px solid var(--veg-color); color: var(--veg-color); font-weight: 700;">🟢 PURE VEG</span>'
      : '';

    card.innerHTML = `
      <div class="card-image-wrapper">
        <img src="${res.bannerImage}" alt="${res.name}">
        <div class="card-tags">
          ${res.isFeatured ? '<span class="tag-featured">FEATURED</span>' : ''}
          <span class="tag-distance">${res.distance} km</span>
          ${vegLabelHtml}
        </div>
      </div>
      <div class="card-content">
        <div class="card-header-row">
          <h3 class="restaurant-title">${res.name}</h3>
          <div class="restaurant-rating">
            <i class="fa-solid fa-star"></i>
            <span>${res.rating}</span>
          </div>
        </div>
        <div class="card-cuisines">${res.cuisines.join(', ')}</div>
        <div class="card-meta-row">
          <div class="meta-item">
            <i class="fa-solid fa-clock"></i>
            <span>${res.deliveryTime} mins</span>
          </div>
          <div class="meta-item">
            <i class="fa-solid fa-indian-rupee-sign"></i>
            <span>₹${res.costForTwo} for two</span>
          </div>
        </div>
      </div>
    `;

    card.addEventListener('click', () => {
      openRestaurantMenu(res.id);
    });

    DOM.restaurantsGrid.appendChild(card);
  });
}

// Open Restaurant details & Menu
function openRestaurantMenu(resId) {
  const res = RESTAURANTS.find(r => r.id === resId);
  if (!res) return;

  state.selectedRestaurant = res;

  // Update hero banner information
  DOM.resBannerImg.src = res.bannerImage;
  DOM.resBannerImg.alt = res.name;
  DOM.resDetailName.innerText = res.name;
  DOM.resDetailRating.innerHTML = `<i class="fa-solid fa-star"></i> ${res.rating} (${res.reviewsCount}+ reviews)`;
  DOM.resDetailTime.innerHTML = `<i class="fa-solid fa-clock"></i> ${res.deliveryTime} mins`;
  DOM.resDetailDistance.innerHTML = `<i class="fa-solid fa-route"></i> ${res.distance} km`;
  DOM.resDetailCost.innerHTML = `<i class="fa-solid fa-indian-rupee-sign"></i> ${res.costForTwo} for two`;

  // Render Sidebar Category list and items
  renderMenu();
  switchView('restaurant');
}

// Render Menu Sidebar Navigation and Items
function renderMenu() {
  DOM.menuCategoryNav.innerHTML = '';
  DOM.menuItemsContainer.innerHTML = '';

  const res = state.selectedRestaurant;
  if (!res) return;

  let activeSet = false;

  res.menu.forEach((cat, index) => {
    // Check if category has any matching items based on Veg-Only filter
    let itemsToRender = cat.items;
    if (state.filters.vegOnly) {
      itemsToRender = itemsToRender.filter(item => item.isVeg);
    }

    // Skip rendering category navigation/header if no items exist
    if (itemsToRender.length === 0) return;

    const navId = `nav-cat-${index}`;
    const blockId = `block-cat-${index}`;

    // Nav Links
    const link = document.createElement('div');
    link.className = `menu-nav-link ${!activeSet ? 'active' : ''}`;
    link.id = navId;
    link.innerText = cat.category;
    link.addEventListener('click', () => {
      document.querySelectorAll('.menu-nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      document.getElementById(blockId).scrollIntoView({ behavior: 'smooth' });
    });
    DOM.menuCategoryNav.appendChild(link);

    // Items block
    const block = document.createElement('div');
    block.className = 'menu-category-block';
    block.id = blockId;
    
    let itemsHtml = '';
    itemsToRender.forEach(item => {
      const cartItem = state.cart.find(c => c.id === item.id);
      const hasQty = cartItem ? cartItem.quantity : 0;
      
      const showAddStyle = hasQty > 0 ? 'display: none;' : 'display: flex;';
      const showQtyStyle = hasQty > 0 ? 'display: flex;' : 'display: none;';

      itemsHtml += `
        <div class="menu-item-card" data-item-id="${item.id}">
          <div class="menu-item-details">
            <span class="diet-indicator ${item.isVeg ? 'veg' : 'non-veg'}">
              ${item.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}
            </span>
            <h4 class="menu-item-name">${item.name}</h4>
            <div class="menu-item-price">₹${item.price}</div>
            <p class="menu-item-desc">${item.description}</p>
          </div>
          <div class="menu-item-img-action">
            <img src="${item.image}" alt="${item.name}" class="menu-item-image">
            
            <!-- Add Button -->
            <button class="add-item-btn" id="add-btn-${item.id}" style="${showAddStyle}" onclick="handleAddToCartClick('${item.id}', ${item.price}, '${item.name.replace(/'/g, "\\'")}', ${item.isVeg}, '${item.image}')">
              <i class="fa-solid fa-plus"></i> ADD
            </button>
            
            <!-- Qty Control -->
            <div class="qty-control" id="qty-ctrl-${item.id}" style="${showQtyStyle}">
              <button onclick="handleQtyChange('${item.id}', -1)">-</button>
              <span id="qty-val-${item.id}">${hasQty}</span>
              <button onclick="handleQtyChange('${item.id}', 1)">+</button>
            </div>
          </div>
        </div>
      `;
    });

    block.innerHTML = `
      <h3 class="menu-category-title">${cat.category}</h3>
      <div class="menu-items-grid">${itemsHtml}</div>
    `;
    DOM.menuItemsContainer.appendChild(block);

    activeSet = true; // Mark that first available is set as active
  });

  if (DOM.menuCategoryNav.innerHTML === '') {
    DOM.menuItemsContainer.innerHTML = `
      <div style="text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
        <i class="fa-solid fa-leaf" style="font-size: 3.5rem; margin-bottom: 1rem; color: var(--veg-color);"></i>
        <h3>No Vegetarian Items Available</h3>
        <p style="font-size: 0.9rem; margin-top: 0.25rem;">This restaurant doesn't offer vegetarian items in this view.</p>
      </div>
    `;
  }
}

// Global functions attached to window for HTML inline calls
window.handleAddToCartClick = function(itemId, price, name, isVeg, image) {
  addToCart(itemId, price, name, isVeg, image);
};

window.handleQtyChange = function(itemId, amt) {
  changeQty(itemId, amt);
};

// Add to Cart Logic
function addToCart(itemId, price, name, isVeg, image) {
  const currentRes = state.selectedRestaurant;
  if (!currentRes) return;

  // Multi-restaurant cart check
  if (state.cart.length > 0 && state.cart[0].resId !== currentRes.id) {
    const confirmClear = confirm(`Your cart contains items from "${state.cart[0].resName}". Would you like to clear your cart and start a new order from "${currentRes.name}"?`);
    if (confirmClear) {
      state.cart = [];
    } else {
      return; // Do nothing
    }
  }

  // Add Item
  const existing = state.cart.find(c => c.id === itemId);
  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.push({
      id: itemId,
      name: name,
      price: price,
      quantity: 1,
      resId: currentRes.id,
      resName: currentRes.name,
      isVeg: isVeg,
      image: image
    });
  }

  updateCartUI();
  
  // Animate adding
  const addBtn = document.getElementById(`add-btn-${itemId}`);
  const qtyCtrl = document.getElementById(`qty-ctrl-${itemId}`);
  const qtyVal = document.getElementById(`qty-val-${itemId}`);

  if (addBtn && qtyCtrl && qtyVal) {
    addBtn.style.display = 'none';
    qtyCtrl.style.display = 'flex';
    qtyVal.innerText = existing ? existing.quantity : 1;
  }
}

// Change Quantity
function changeQty(itemId, amount) {
  const idx = state.cart.findIndex(c => c.id === itemId);
  if (idx === -1) return;

  state.cart[idx].quantity += amount;

  const currentQty = state.cart[idx].quantity;
  const addBtn = document.getElementById(`add-btn-${itemId}`);
  const qtyCtrl = document.getElementById(`qty-ctrl-${itemId}`);
  const qtyVal = document.getElementById(`qty-val-${itemId}`);

  if (currentQty <= 0) {
    state.cart.splice(idx, 1);
    
    // Switch element visibility
    if (addBtn && qtyCtrl) {
      addBtn.style.display = 'flex';
      qtyCtrl.style.display = 'none';
    }
  } else {
    if (qtyVal) qtyVal.innerText = currentQty;
  }

  updateCartUI();
  
  // If in restaurant menu, verify sync (needed when changing items via cart sidebar)
  if (state.currentView === 'restaurant') {
    const localVal = document.getElementById(`qty-val-${itemId}`);
    if (localVal) {
      localVal.innerText = currentQty;
    } else if (currentQty === 0 && addBtn && qtyCtrl) {
      addBtn.style.display = 'flex';
      qtyCtrl.style.display = 'none';
    }
  }
}

// Update Cart Count and Sidebar UI
function updateCartUI() {
  const totalCount = state.cart.reduce((acc, c) => acc + c.quantity, 0);
  DOM.headerCartCount.innerText = totalCount;

  DOM.cartItemsContainer.innerHTML = '';

  if (state.cart.length === 0) {
    DOM.cartItemsContainer.innerHTML = `
      <div class="empty-cart-state">
        <i class="fa-solid fa-basket-shopping"></i>
        <h4>Your cart is empty</h4>
        <p style="font-size: 0.85rem; margin-top: 0.25rem;">Add mouth-watering dishes to get started!</p>
      </div>
    `;
    DOM.cartFooterCalculations.style.display = 'none';
    return;
  }

  // Draw Items
  state.cart.forEach(item => {
    const row = document.createElement('div');
    row.className = 'cart-item-row';
    row.innerHTML = `
      <div class="cart-item-info">
        <div class="cart-item-title">
          <span style="font-size: 0.75rem; vertical-align: middle; margin-right: 0.25rem;">
            ${item.isVeg ? '🟢' : '🔴'}
          </span>
          ${item.name}
        </div>
        <div class="cart-item-res-name">from ${item.resName}</div>
        <div class="cart-item-price-calc">₹${item.price} &times; ${item.quantity} = ₹${item.price * item.quantity}</div>
      </div>
      <div class="cart-item-qty-adjust">
        <button onclick="handleQtyChange('${item.id}', -1)">-</button>
        <span>${item.quantity}</span>
        <button onclick="handleQtyChange('${item.id}', 1)">+</button>
      </div>
    `;
    DOM.cartItemsContainer.appendChild(row);
  });

  // Calculate bill details
  const subtotal = state.cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = subtotal >= 500 ? 0 : 40; // Free delivery above 500
  const tax = Math.round(subtotal * 0.05); // 5% GST
  const grandTotal = subtotal + deliveryFee + tax;

  DOM.cartSubtotal.innerText = `₹${subtotal}`;
  DOM.cartDeliveryFee.innerText = deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`;
  DOM.cartTax.innerText = `₹${tax}`;
  DOM.cartTotal.innerText = `₹${grandTotal}`;

  DOM.cartFooterCalculations.style.display = 'block';
}

// Toggle Cart Sidebar Drawer
function toggleCartDrawer() {
  DOM.cartDrawer.classList.toggle('open');
  DOM.cartDrawerOverlay.classList.toggle('open');
}

// Go to Checkout Screen
function goToCheckout() {
  if (state.cart.length === 0) return;

  // Set selected restaurant from the cart items
  const sampleItem = state.cart[0];
  DOM.orderSummaryRestaurant.innerText = `Ordering from: ${sampleItem.resName}`;

  // Populate checkout summaries
  DOM.checkoutItemsSummary.innerHTML = '';
  state.cart.forEach(item => {
    const row = document.createElement('div');
    row.className = 'summary-item-row';
    row.style.marginBottom = '0.75rem';
    row.innerHTML = `
      <span style="color: var(--text-muted);">
        <span style="font-size: 0.65rem; margin-right: 0.25rem;">${item.isVeg ? '🟢' : '🔴'}</span>
        ${item.name} <strong style="color: var(--text-main); font-size: 0.85rem;">x ${item.quantity}</strong>
      </span>
      <span style="font-weight: 600;">₹${item.price * item.quantity}</span>
    `;
    DOM.checkoutItemsSummary.appendChild(row);
  });

  // Calculate numbers
  const subtotal = state.cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = subtotal >= 500 ? 0 : 40;
  const tax = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + deliveryFee + tax;

  DOM.checkoutSubtotal.innerText = `₹${subtotal}`;
  DOM.checkoutDeliveryFee.innerText = deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`;
  DOM.checkoutTax.innerText = `₹${tax}`;
  DOM.checkoutTotal.innerText = `₹${grandTotal}`;

  // Close Cart drawer and open view
  DOM.cartDrawer.classList.remove('open');
  DOM.cartDrawerOverlay.classList.remove('open');
  
  switchView('checkout');
}

// Place Order and trigger animation
function placeOrder() {
  // Generate tracking details
  const randomOrderId = 'BD-' + Math.floor(1000000 + Math.random() * 9000000);
  DOM.trackingOrderId.innerText = randomOrderId;

  const activeRes = RESTAURANTS.find(r => r.id === state.cart[0].resId);
  const etaMinutes = activeRes ? activeRes.deliveryTime + 5 : 30;
  DOM.trackingEta.innerText = `${etaMinutes - 5}-${etaMinutes} Minutes`;

  // Start status progression
  simulateOrderDelivery();

  // Switch to status view
  switchView('order-status');

  // Reset local cart
  state.cart = [];
  updateCartUI();
  
  // Reset fields in form
  DOM.checkoutForm.reset();
}

// Simulated Delivery Tracking status increments
let trackingTimer1, trackingTimer2, trackingTimer3;

function simulateOrderDelivery() {
  // Clear any existing timers
  clearTimeout(trackingTimer1);
  clearTimeout(trackingTimer2);
  clearTimeout(trackingTimer3);

  // Reset steps classes
  DOM.stepConfirmed.className = 'step-node completed';
  DOM.stepPreparing.className = 'step-node';
  DOM.stepOutForDelivery.className = 'step-node';
  DOM.stepDelivered.className = 'step-node';
  DOM.trackingProgress.style.width = '0%';

  // Reset bike position
  DOM.trackingBike.style.left = '0%';
  DOM.trackingBike.style.animation = 'none';
  // Force browser layout reflow
  void DOM.trackingBike.offsetWidth;
  DOM.trackingBike.style.animation = 'drive 15s linear infinite';

  // Timeline progressions
  // 1. Preparing after 3.5s
  trackingTimer1 = setTimeout(() => {
    DOM.stepPreparing.className = 'step-node completed';
    DOM.trackingProgress.style.width = '33%';
  }, 3500);

  // 2. Out for Delivery after 7.5s
  trackingTimer2 = setTimeout(() => {
    DOM.stepOutForDelivery.className = 'step-node completed';
    DOM.trackingProgress.style.width = '66%';
  }, 7500);

  // 3. Delivered after 12s
  trackingTimer3 = setTimeout(() => {
    DOM.stepDelivered.className = 'step-node completed';
    DOM.trackingProgress.style.width = '100%';
    DOM.trackingBike.style.animation = 'none';
    DOM.trackingBike.style.left = '100%';
    
    // Quick celebration effect or title change
    DOM.trackingEta.innerText = 'Delivered! Bon Appétit! 🍽️';
  }, 12000);
}
