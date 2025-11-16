/* ==========================
   js/script.js — Interactive behaviors for OrganicFarming site
   - Place this file at: js/script.js
   - Connected in HTML with: <script src="js/script.js"></script>
   ==========================

   Features included:
   1. Mobile navbar toggle
   2. Smooth scroll for internal links
   3. Contact form client-side validation + demo submit (replace with backend fetch)
   4. Simple product quick-view modal
   5. Hero + reveal animations (lightweight, JS-only)
   6. Accessibility helpers (escape to close modal, focus trap basics)
*/

// ACTION: Wrap everything in IIFE to avoid global leakage
(function () {
  'use strict';

  // ---------------------------
  // Mobile navigation toggle
  // ---------------------------
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    // ACTION: Toggle mobile menu visibility
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('show');
      // ARIA: reflect expanded state
      const expanded = navLinks.classList.contains('show');
      hamburger.setAttribute('aria-expanded', expanded.toString());
    });

    // Close menu when clicking outside
    document.addEventListener('click', (ev) => {
      if (!navLinks.contains(ev.target) && !hamburger.contains(ev.target)) {
        navLinks.classList.remove('show');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ---------------------------
  // Smooth scroll for anchor links
  // ---------------------------
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href && href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // close mobile nav after clicking
          if (navLinks && navLinks.classList.contains('show')) {
            navLinks.classList.remove('show');
            hamburger && hamburger.setAttribute('aria-expanded', 'false');
          }
        }
      }
    });
  });

  // ---------------------------
  // Contact form validation & demo submission
  // ---------------------------
  // ACTION: Replace demo submit with your backend endpoint (fetch to /api/contact etc.)
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const name = (document.getElementById('name') || {}).value || '';
      const email = (document.getElementById('email') || {}).value || '';
      const message = (document.getElementById('message') || {}).value || '';

      // Basic client-side validation
      if (!name.trim() || !email.trim() || !message.trim()) {
        alert('Please fill all fields before submitting.');
        return;
      }

      // Email simple regex - light check
      const emailRe = /^\S+@\S+\.\S+$/;
      if (!emailRe.test(email)) {
        alert('Please provide a valid email address.');
        return;
      }

      // Demo: show a success message and reset form
      // ACTION: Replace with fetch POST to your backend URL
      setTimeout(() => {
        alert('Thanks ' + name + '! Your message has been received (demo).');
        contactForm.reset();
      }, 400);
    });
  }

  // ---------------------------
  // Product Quick-view Modal
  // ---------------------------
  // ACTION: This code expects .product-card elements with an optional data attributes
  const productCards = document.querySelectorAll('.product-card');
  let modal = null;
  let lastFocusedElement = null;

  if (productCards && productCards.length) {
    // Create modal markup and append to body (hidden initially)
    modal = document.createElement('div');
    modal.className = 'pf-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <div class="pf-modal-backdrop"></div>
      <div class="pf-modal-panel" role="document">
        <button class="pf-modal-close" aria-label="Close product quick view">×</button>
        <div class="pf-modal-body">
          <img class="pf-modal-img" src="img/compost.png" alt="Product image" />
          <div class="pf-modal-info">
            <h3 class="pf-modal-title">Product</h3>
            <p class="pf-modal-desc">Product description...</p>
            <strong class="pf-modal-price">₹0</strong>
            <div style="margin-top:12px"><button class="btn">Add to Cart</button></div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Open modal when product "Buy" clicked (delegation)
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn');
      if (!btn) return;
      const card = btn.closest('.product-card');
      if (!card) return; // not a product button

      // populate modal from card content
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

    // Close handlers
    modal.addEventListener('click', (e) => {
      if (e.target.matches('.pf-modal-backdrop') || e.target.closest('.pf-modal-close')) {
        closeModal();
      }
    });

    // keyboard escape
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
    // focus first focusable element inside modal
    const closeBtn = modal.querySelector('.pf-modal-close');
    closeBtn && closeBtn.focus();
    // simple focus trap: prevent tabbing out
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

  // ---------------------------
  // Lightweight reveal animations
  // ---------------------------
  // ACTION: Adds "reveal" class when elements enter viewport
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

  // ---------------------------
  // Small utilities
  // ---------------------------
  // ACTION: Smoothly scroll to top (you can call scrollToTop())
  window.scrollToTop = function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

})();
