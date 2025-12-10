(function () {
  /* ========== A. Core UI: nav, scroll, contact, modal, reveal ========== */

  // Mobile navigation toggle
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('show');
      const expanded = navLinks.classList.contains('show');
      hamburger.setAttribute('aria-expanded', expanded.toString());
    });

    document.addEventListener('click', (ev) => {
      if (!navLinks.classList.contains('show')) return;
      if (!navLinks.contains(ev.target) && !hamburger.contains(ev.target)) {
        navLinks.classList.remove('show');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href && href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          if (navLinks && navLinks.classList.contains('show')) {
            navLinks.classList.remove('show');
            hamburger && hamburger.setAttribute('aria-expanded', 'false');
          }
        }
      }
    });
  });

  // Contact form validation & demo submission
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const name = (document.getElementById('name') || {}).value || '';
      const email = (document.getElementById('email') || {}).value || '';
      const message = (document.getElementById('message') || {}).value || '';

      if (!name.trim() || !email.trim() || !message.trim()) {
        alert('Please fill all fields before submitting.');
        return;
      }

      const emailRe = /^\S+@\S+\.\S+$/;
      if (!emailRe.test(email)) {
        alert('Please provide a valid email address.');
        return;
      }

      setTimeout(() => {
        alert('Thanks ' + name + '! Your message has been received (demo).');
        contactForm.reset();
      }, 400);
    });
  }

  // Product Quick-view Modal (only if product cards exist)
  const productCards = document.querySelectorAll('.product-card');
  let modal = null;
  let lastFocusedElement = null;

  if (productCards && productCards.length) {
    modal = document.createElement('div');
    modal.className = 'pf-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <div class="pf-modal-backdrop" data-role="backdrop"></div>
      <div class="pf-modal-panel" role="document" aria-modal="true">
        <button class="pf-modal-close" aria-label="Close product quick view">×</button>
        <div class="pf-modal-body">
          <img class="pf-modal-img" src="img/compost.png" alt="Product image" />
          <div class="pf-modal-info">
            <h3 class="pf-modal-title">Product</h3>
            <p class="pf-modal-desc">Product description...</p>
            <strong class="pf-modal-price">₹0</strong>
            <div style="margin-top:12px"><button class="btn pf-add-to-cart">Add to Cart</button></div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Delegated click: open on .btn inside a .product-card
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn');
      if (!btn) return;
      const card = btn.closest('.product-card');
      if (!card) return;

      const img = card.querySelector('img') ? card.querySelector('img').getAttribute('src') : 'img/compost.png';
      const title = card.querySelector('h3') ? card.querySelector('h3').innerText : 'Product';
      const desc = card.querySelector('p') ? card.querySelector('p').innerText : '';
      const priceEl = card.querySelector('strong') ? card.querySelector('strong').innerText : '';

      modal.querySelector('.pf-modal-img').setAttribute('src', img);
      modal.querySelector('.pf-modal-title').innerText = title;
      modal.querySelector('.pf-modal-desc').innerText = desc;
      modal.querySelector('.pf-modal-price').innerText = priceEl;

      openModal();
      e.preventDefault();
    });

    modal.addEventListener('click', (e) => {
      if (e.target.matches('.pf-modal-backdrop') || e.target.closest('.pf-modal-close')) {
        closeModal();
      }
    });

    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
        closeModal();
      }
    });
  }

  function openModal() {
    if (!modal) return;
    lastFocusedElement = document.activeElement;
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('open');
    const closeBtn = modal.querySelector('.pf-modal-close');
    closeBtn && closeBtn.focus();
    document.addEventListener('focus', trapFocus, true);
  }

  function closeModal() {
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('open');
    document.removeEventListener('focus', trapFocus, true);
    try { lastFocusedElement && lastFocusedElement.focus(); } catch (err) {}
  }

  function trapFocus(event) {
    if (!modal || modal.getAttribute('aria-hidden') === 'true') return;
    if (!modal.contains(event.target)) {
      event.stopPropagation();
      modal.querySelector('.pf-modal-close').focus();
    }
  }

  // Reveal animations using IntersectionObserver (safe on all screens)
  const revealSelector = '.product-card, .review-card, .about, .hero-text';
  const revealEls = document.querySelectorAll(revealSelector);
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal');
      }
    });
  }, { threshold: 0.12 }) : null;

  revealEls.forEach(el => observer ? observer.observe(el) : el.classList.add('reveal'));

  window.scrollToTop = function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ========== B. Products & Cart Data / Utilities ========== */

  const PRODUCTS = [
    { id: 'p1', name: 'Compost 5kg', price: 249, desc: 'Organic compost for vegetables', img: 'img/compost 5kg.webp' },
    { id: 'p2', name: 'Bio-Fertilizer 1L', price: 399, desc: 'Microbial fertilizer', img: 'img/biofrtrilizer 1 ltr.jpeg' },
    { id: 'p3', name: 'Soil Booster 2kg', price: 299, desc: 'Boosts soil nutrients', img: 'img/soil boost 2kg.jpg' }
  ];

  const MathUtil = {
    round2(num) { return Math.round((num + Number.EPSILON) * 100) / 100; },
    applyDiscount(price, percent) {
      if (typeof price !== 'number' || typeof percent !== 'number') return price;
      const discounted = price * (1 - percent / 100);
      return MathUtil.round2(discounted);
    },
    randInt(min, max) {
      min = Math.ceil(min); max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  };

  const Catalog = {
    products: Array.from(PRODUCTS),
    findById(id) { return this.products.find(p => p.id === id); },
    filterByMaxPrice(max) { return this.products.filter(p => p.price <= max); },
    getNames() { return this.products.map(p => p.name); },
    addProduct(prod) {
      if (!prod || !prod.id) throw new Error('Invalid product');
      this.products.push(prod);
    }
  };

  /* ========== D. Track product interactions (optional but light) ========== */

  const visitedSet = new Set();
  const weakSeen = new WeakSet();

  document.addEventListener('click', (e) => {
    const card = e.target.closest('.product-card');
    if (!card) return;
    const pid = card.dataset && card.dataset.id;
    if (pid) visitedSet.add(pid);
    weakSeen.add(card);
  });

  /* ========== E. CRUD DOM helpers for product cards ========== */

  const productsContainer = document.querySelector('.products-grid') || document.querySelector('#products');

  function createProductCard(product) {
    const el = document.createElement('article');
    el.className = 'product-card';
    el.dataset.id = product.id;
    el.dataset.name = product.name;
    el.dataset.price = product.price;
    el.innerHTML = `
      <img src="${product.img}" alt="${product.name}" loading="lazy" />
      <h3>${product.name}</h3>
      <p>${product.desc}</p>
      <strong>₹${product.price}</strong>
      <div class="product-actions">
        <button class="btn pf-buy add-to-cart">Add to Cart</button>
        <button class="btn pf-remove">Remove</button>
      </div>
    `;
    return el;
  }

  function addProductToDOM(product) {
    if (!productsContainer) return;
    const card = createProductCard(product);
    productsContainer.appendChild(card);
    observer ? observer.observe(card) : card.classList.add('reveal');
  }

  function removeProductFromDOM(productId) {
    const el = document.querySelector(`.product-card[data-id="${productId}"]`);
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  function updateProductInDOM(product) {
    const el = document.querySelector(`.product-card[data-id="${product.id}"]`);
    if (!el) return;
    const img = el.querySelector('img'); if (img) img.src = product.img;
    const h3 = el.querySelector('h3'); if (h3) h3.innerText = product.name;
    const p = el.querySelector('p'); if (p) p.innerText = product.desc;
    const strong = el.querySelector('strong'); if (strong) strong.innerText = `₹${product.price}`;
  }

  if (productsContainer) {
    Catalog.products.forEach(p => addProductToDOM(p));
  }

  document.addEventListener('click', (e) => {
    if (e.target.matches('.pf-remove')) {
      const card = e.target.closest('.product-card');
      const pid = card && (card.dataset && card.dataset.id);
      if (pid) {
        Catalog.products = Catalog.products.filter(p => p.id !== pid);
        removeProductFromDOM(pid);
      }
    }

    if (e.target.matches('.pf-add-to-cart')) {
      const card = e.target.closest('.product-card');
      const pid = card && (card.dataset && card.dataset.id);
      const product = Catalog.findById(pid) || Catalog.products.find(x => x.id === pid);
      if (product) {
        addToCart(product.id, 1);
      }
    }
  });

  /* ========== J. LocalStorage Cart system ========== */

  const CART_KEY = 'of_cart_v1';

  function readCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (err) {
      console.warn('readCart failed', err);
      return {};
    }
  }

  function writeCart(cartObj) {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cartObj));
      document.dispatchEvent(new CustomEvent('cart-updated', { detail: { cart: cartObj } }));
    } catch (err) {
      console.warn('writeCart failed', err);
    }
  }

  function addToCart(productId, qty = 1) {
    const cart = readCart();
    cart[productId] = (cart[productId] || 0) + qty;
    writeCart(cart);
    flashMessage('Added to cart');
  }

  function removeFromCart(productId) {
    const cart = readCart();
    if (cart[productId]) {
      delete cart[productId];
      writeCart(cart);
      flashMessage('Removed from cart');
    }
  }

  function clearCart() {
    writeCart({});
  }

  function flashMessage(text, timeout = 1400) {
    let el = document.querySelector('.pf-flash');
    if (!el) {
      el = document.createElement('div');
      el.className = 'pf-flash';
      el.style = 'position:fixed;bottom:20px;right:20px;background:#0b0;color:#fff;padding:10px 14px;border-radius:8px;z-index:9999;';
      document.body.appendChild(el);
    }
    el.innerText = text;
    el.style.opacity = '1';
    setTimeout(() => { el.style.opacity = '0'; }, timeout);
  }

  function cartTotal() {
    const cart = readCart();
    const items = Object.keys(cart).map(id => {
      const p = Catalog.findById(id) || { price: 0 };
      return { id, qty: cart[id], price: p.price || 0 };
    });
    const subTotal = items.reduce((sum, it) => sum + (it.price * it.qty), 0);
    return MathUtil.round2(subTotal);
  }

  function updateCartTotalUI() {
    const el = document.getElementById('cart-total');
    if (el) el.innerText = `₹${cartTotal()}`;
  }

  document.addEventListener('cart-updated', updateCartTotalUI);
  updateCartTotalUI();

  /* ========== L. Debounce search (if present) ========== */

  function debounce(fn, wait = 200) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  const searchBox = document.getElementById('product-search');
  if (searchBox) {
    searchBox.addEventListener('input', debounce((e) => {
      const q = (e.target.value || '').trim().toLowerCase();
      document.querySelectorAll('.product-card').forEach(card => {
        const name = (card.querySelector('h3') || {}).innerText || '';
        card.style.display = name.toLowerCase().includes(q) ? '' : 'none';
      });
    }, 250));
  }

  /* ========== P. Price helpers ========== */

  function parsePrice(text) {
    if (!text) return 0;
    return Number(String(text).replace(/[^\d.-]+/g, '')) || 0;
  }

  function formatINR(amount) {
    return '₹' + MathUtil.round2(amount).toFixed(2);
  }

  /* ========== Q. Final init tasks ========== */

  updateCartTotalUI();

  (function heroDiscountBadge() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    const badge = document.createElement('div');
    badge.className = 'hero-discount';
    const d = MathUtil.randInt(5, 25);
    badge.innerText = `${d}% OFF TODAY`;
    badge.style = 'position:absolute;top:18px;left:18px;background:rgba(0,0,0,0.6);color:#fff;padding:6px 10px;border-radius:6px;font-weight:600;';
    hero.appendChild(badge);
  }());
})();

/* ========== TAB SWITCHING & LOGIN ========== */
document.addEventListener("DOMContentLoaded", () => {
  const loginTab = document.getElementById("loginTab");
  const registerTab = document.getElementById("registerTab");
  const loginForm = document.getElementById("loginForm");
  const regForm = document.getElementById("regForm");

  if (loginTab && registerTab && loginForm && regForm) {
    loginTab.addEventListener("click", () => {
      loginTab.classList.add("active");
      registerTab.classList.remove("active");
      loginForm.style.display = "block";
      regForm.style.display = "none";
    });

    registerTab.addEventListener("click", () => {
      registerTab.classList.add("active");
      loginTab.classList.remove("active");
      regForm.style.display = "block";
      loginForm.style.display = "none";
    });
  }

  document.querySelectorAll(".toggle-password").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = btn.previousElementSibling;
      if (!input) return;
      input.type = input.type === "password" ? "text" : "password";
      btn.textContent = btn.textContent === "Show" ? "Hide" : "Show";
    });
  });
});

function goToDashboard(event) {
  event.preventDefault();
  const btn = event.target;
  btn.disabled = true;
  btn.textContent = "Loading...";
  setTimeout(() => {
    window.location.href = "farmer-dashboard.html";
  }, 1000);
}

/* ========== DARK MODE (with safety checks) ========== */
const darkToggle = document.getElementById("darkToggle");
if (darkToggle) {
  darkToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    darkToggle.innerText = document.body.classList.contains("dark")
      ? "☀ Light Mode"
      : "🌙 Dark Mode";
  });
}

/* ========== WEATHER API ========== */
async function loadWeather() {
  const weatherInfo = document.getElementById('weatherInfo');
  if (!weatherInfo) return;
  try {
    const res = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=19.75&longitude=75.71&current=temperature_2m"
    );
    const data = await res.json();
    if (data && data.current && typeof data.current.temperature_2m !== 'undefined') {
      weatherInfo.innerText = data.current.temperature_2m + "°C (Live)";
    }
  } catch (e) {
    weatherInfo.innerText = "Weather unavailable";
  }
}
loadWeather();

/* ========== SOIL, FARMER, WALLET, ORDERS, NOTIFICATIONS ========== */
const soilHealth = document.getElementById('soilHealth');
if (soilHealth) soilHealth.innerText = "Healthy • pH 6.4 • Moisture 40%";

function loadFarmer() {
  const farmerName = document.getElementById('farmerName');
  const farmerMobile = document.getElementById('farmerMobile');
  const farmerLand = document.getElementById('farmerLand');
  const farmerCrop = document.getElementById('farmerCrop');
  if (farmerName) farmerName.innerText = "Manas Patil";
  if (farmerMobile) farmerMobile.innerText = "9876543210";
  if (farmerLand) farmerLand.innerText = "3.5 Acres";
  if (farmerCrop) farmerCrop.innerText = "Wheat, Sugarcane";
}
loadFarmer();

const walletBalance = document.getElementById('walletBalance');
const lastPayment = document.getElementById('lastPayment');
const upcomingPayment = document.getElementById('upcomingPayment');
const paymentHistory = document.getElementById('paymentHistory');

if (walletBalance) walletBalance.innerText = "₹1,850";
if (lastPayment) lastPayment.innerText = "₹450 — Nitrogen Booster";
if (upcomingPayment) upcomingPayment.innerText = "₹799 — Soil Enhancer";
if (paymentHistory) paymentHistory.innerText = "₹450, ₹1200, ₹380";

const orders = [
  { item: "Organic Nitrogen Booster", date: "12 Nov 2025", status: "Delivered" },
  { item: "Soil Health Enhancer", date: "02 Nov 2025", status: "In Transit" },
  { item: "Premium Seeds Pack", date: "25 Oct 2025", status: "Delivered" }
];

const orderList = document.getElementById('orderList');
if (orderList) {
  orderList.innerHTML = orders.map(o => `
    <div class="order-item">
      <h4>🌿 ${o.item}</h4>
      <p><strong>Date:</strong> ${o.date}</p>
      <p><strong>Status:</strong> ${o.status}</p>
    </div>
  `).join("");
}

const notifications = [
  "Rain expected in your area in 48 hours — plan irrigation.",
  "New organic fertilizer available in store!",
  "Your soil moisture is slightly low — recommended watering."
];

const notifList = document.getElementById('notifList');
if (notifList) {
  notifList.innerHTML = notifications.map(n =>
    `<div class="notification-item">${n}</div>`
  ).join("");
}

/* ========== SECONDARY CART FOR DASHBOARD NAVBAR (SAFE) ========== */
let cartArray = JSON.parse(localStorage.getItem("cart")) || [];

function updateCartCount() {
  const el = document.getElementById("cart-count");
  if (el) el.textContent = cartArray.length;
}

const addButtons = document.querySelectorAll(".add-to-cart");
addButtons.forEach(btn => {
  btn.addEventListener("click", e => {
    const card = e.target.closest(".product-card");
    if (!card) return;
    const product = {
      name: card.dataset.name,
      price: card.dataset.price,
      quantity: 1
    };

    const existing = cartArray.find(p => p.name === product.name);
    if (existing) {
      existing.quantity += 1;
    } else {
      cartArray.push(product);
    }

    localStorage.setItem("cart", JSON.stringify(cartArray));
    updateCartCount();
    alert(`${product.name} added to cart!`);
  });
});

updateCartCount();

/* ========== RESPONSIVE CAROUSEL (with null checks for mobile) ========== */
const track = document.querySelector('.carousel-track');
const slides = track ? Array.from(track.children) : [];
const nextButton = document.querySelector('.next');
const prevButton = document.querySelector('.prev');
let currentIndex = 0;

function updateCarousel() {
  if (!track || slides.length === 0) return;
  const slideWidth = slides[0].getBoundingClientRect().width;
  track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
}

// Attach events only if elements exist
if (track && slides.length > 0 && nextButton && prevButton) {
  updateCarousel();

  nextButton.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % slides.length;
    updateCarousel();
  });

  prevButton.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    updateCarousel();
  });

  // Adjust on resize (important for mobile orientation changes)
  window.addEventListener('resize', () => {
    updateCarousel();
  });

  setInterval(() => {
    currentIndex = (currentIndex + 1) % slides.length;
    updateCarousel();
  }, 2000);
}

