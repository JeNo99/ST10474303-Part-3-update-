/* =====================================================
   SHAM SHAWARMA & GRILL — MAIN SCRIPT (script.js)
   ===================================================== */

'use strict';

/* ===================================================
   UTILITY
   =================================================== */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function showToast(msg, duration = 4000) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

/* ===================================================
   ACTIVE NAV LINK
   =================================================== */
function setActiveNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  $$('nav a').forEach(a => {
    const href = a.getAttribute('href').split('/').pop();
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}

/* ===================================================
   HAMBURGER MENU
   =================================================== */
function initHamburger() {
  const btn = $('.hamburger');
  const ul  = $('nav ul');
  if (!btn || !ul) return;
  btn.addEventListener('click', () => {
    ul.classList.toggle('open');
    btn.setAttribute('aria-expanded', ul.classList.contains('open'));
  });
}

/* ===================================================
   SCROLL-TO-TOP BUTTON
   =================================================== */
function initScrollTop() {
  const btn = document.getElementById('scroll-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 300);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ===================================================
   LIGHTBOX GALLERY
   =================================================== */
let lightboxImages = [];
let lightboxIndex  = 0;

function openLightbox(index) {
  const lb   = document.getElementById('lightbox');
  const img  = document.getElementById('lightbox-img');
  const cap  = document.getElementById('lightbox-caption');
  if (!lb || !img) return;
  lightboxIndex = index;
  img.src = lightboxImages[index].src;
  if (cap) cap.textContent = lightboxImages[index].caption || '';
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  lb.classList.remove('open');
  document.body.style.overflow = '';
}

function shiftLightbox(dir) {
  lightboxIndex = (lightboxIndex + dir + lightboxImages.length) % lightboxImages.length;
  const img = document.getElementById('lightbox-img');
  const cap = document.getElementById('lightbox-caption');
  if (img) img.src = lightboxImages[lightboxIndex].src;
  if (cap) cap.textContent = lightboxImages[lightboxIndex].caption || '';
}

function initLightbox() {
  const items = $$('.gallery-item');
  if (!items.length) return;

  lightboxImages = items.map(item => ({
    src:     item.querySelector('img')?.src || '',
    caption: item.dataset.caption || item.querySelector('img')?.alt || ''
  }));

  items.forEach((item, i) => {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', `View image ${i + 1}`);
    item.addEventListener('click', () => openLightbox(i));
    item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openLightbox(i); });
  });

  // Also attach lightbox to menu items
  $$('.menu-item').forEach((item, i) => {
    item.addEventListener('click', () => {
      const img  = item.querySelector('img');
      const name = item.querySelector('h4')?.textContent || '';
      const price= item.querySelector('p')?.textContent  || '';
      openMenuModal(img?.src, name, price);
    });
  });

  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn  = document.getElementById('lightbox-prev');
  const nextBtn  = document.getElementById('lightbox-next');
  const lb       = document.getElementById('lightbox');

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (prevBtn)  prevBtn.addEventListener('click',  () => shiftLightbox(-1));
  if (nextBtn)  nextBtn.addEventListener('click',  () => shiftLightbox(1));

  if (lb) {
    lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
  }

  document.addEventListener('keydown', e => {
    const lb = document.getElementById('lightbox');
    if (!lb || !lb.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  shiftLightbox(-1);
    if (e.key === 'ArrowRight') shiftLightbox(1);
  });
}

/* ===================================================
   MENU ITEM MODAL
   =================================================== */
function openMenuModal(imgSrc, name, price) {
  let modal = document.getElementById('menu-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'menu-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true">
        <button class="modal-close" aria-label="Close">&times;</button>
        <img id="menu-modal-img" src="" alt="" style="width:100%;border-radius:10px;margin-bottom:16px;">
        <h2 id="menu-modal-name" style="color:var(--orange);"></h2>
        <p id="menu-modal-price" style="color:#fff;font-size:1.2rem;font-weight:bold;"></p>
        <a href="inquiry.html" class="btn" style="margin-top:18px;display:inline-block;">Enquire / Order</a>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelector('.modal-close').addEventListener('click', () => modal.classList.remove('open'));
    modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open'); });
  }
  document.getElementById('menu-modal-img').src = imgSrc || '';
  document.getElementById('menu-modal-name').textContent = name;
  document.getElementById('menu-modal-price').textContent = price;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  modal.addEventListener('transitionend', () => {}, { once: true });

  // Close restores scroll
  const close = () => { modal.classList.remove('open'); document.body.style.overflow = ''; };
  modal.querySelector('.modal-close').onclick = close;
  modal.onclick = e => { if (e.target === modal) close(); };
}

/* ===================================================
   ACCORDION
   =================================================== */
function initAccordions() {
  $$('.accordion-header').forEach(btn => {
    btn.addEventListener('click', () => {
      const body = btn.nextElementSibling;
      const isOpen = btn.classList.contains('open');
      // Close all in same accordion
      const accordion = btn.closest('.accordion');
      if (accordion) {
        $$('.accordion-header.open', accordion).forEach(b => {
          b.classList.remove('open');
          b.nextElementSibling.classList.remove('open');
        });
      }
      if (!isOpen) {
        btn.classList.add('open');
        body.classList.add('open');
      }
    });
  });
}

/* ===================================================
   TABS
   =================================================== */
function initTabs() {
  $$('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const wrapper = btn.closest('.tabs-wrapper');
      if (!wrapper) return;
      $$('.tab-btn', wrapper).forEach(b => b.classList.remove('active'));
      $$('.tab-panel', wrapper).forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const target = wrapper.querySelector(btn.dataset.tab);
      if (target) target.classList.add('active');
    });
  });
}

/* ===================================================
   MENU SEARCH + FILTER
   =================================================== */
function initMenuSearch() {
  const searchInput = document.getElementById('menu-search');
  const filterBtns  = $$('.filter-btn');
  const noResults   = document.getElementById('no-results');
  if (!searchInput) return;

  let activeCategory = 'all';

  function filterMenu() {
    const query = searchInput.value.toLowerCase().trim();
    const items = $$('.menu-item');
    let visible = 0;

    items.forEach(item => {
      const name     = item.querySelector('h4')?.textContent.toLowerCase() || '';
      const category = item.dataset.category || '';
      const matchQuery    = !query    || name.includes(query);
      const matchCategory = activeCategory === 'all' || category === activeCategory;

      if (matchQuery && matchCategory) {
        item.style.display = '';
        item.style.animation = 'fadeSlideUp 0.35s ease both';
        visible++;
      } else {
        item.style.display = 'none';
      }
    });

    // Show/hide category headers
    $$('.category-section').forEach(section => {
      const anyVisible = $$('.menu-item', section).some(i => i.style.display !== 'none');
      section.style.display = anyVisible ? '' : 'none';
    });

    if (noResults) noResults.style.display = visible === 0 ? 'block' : 'none';
  }

  searchInput.addEventListener('input', filterMenu);

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.category || 'all';
      filterMenu();
    });
  });
}

/* ===================================================
   INQUIRY FORM — Dynamic fields + Validation + Response
   =================================================== */
function initInquiryForm() {
  const form = document.getElementById('inquiry-form');
  if (!form) return;

  const typeCards  = $$('.inquiry-type-card');
  const typeInput  = document.getElementById('inquiry-type');
  const dynamicWrap= document.getElementById('dynamic-fields');
  const responseDiv= document.getElementById('inquiry-response');

  // Pricing data
  const pricingData = {
    services: {
      'dine-in':   { label: 'Dine-In',   info: 'No booking fee. Tables available Sun–Thu 11:00–22:00, Fri 13:00–00:00, Sat 11:00–00:00. Max 6 per table.',  price: 'No cover charge' },
      'takeaway':  { label: 'Takeaway',   info: 'Order online or by phone. Ready in 15–25 minutes. Minimum order R80.',                                         price: 'Min R80' },
      'catering':  { label: 'Catering',   info: 'We cater events from 20–500 guests. Packages start at R120/person including shawarma, platters & drinks.',     price: 'From R120/person' },
      'delivery':  { label: 'Delivery',   info: 'Delivery available within 10 km of Florida Road. Delivery fee R25–R50. Minimum order R120.',                   price: 'R25–R50 delivery fee' },
    },
    products: {
      'shawarma':  { label: 'Shawarma',   info: 'Wraps from R90, Pita from R110, Single Meal from R160. All made fresh to order.',                             price: 'R90 – R160' },
      'platters':  { label: 'Platters',   info: 'Platters for 2 from R160. BBQ Platter R400, Family Platter R900. Perfect for groups.',                        price: 'R160 – R900' },
      'desserts':  { label: 'Desserts',   info: 'Baklava (5 pcs) R100. Seasonal specials available on request.',                                               price: 'From R100' },
      'drinks':    { label: 'Drinks',     info: 'Fresh juices & milkshakes from R50. Lemon & Mint, Avo Dates Almonds, Chocolate Milkshake.',                  price: 'From R50' },
    },
    volunteer: {
      info: 'We welcome volunteers for community events and food drives. Volunteering is unpaid but you\'ll receive free meals during your shift. Minimum commitment: 1 event per month.',
      price: 'Free (meals provided)'
    },
    sponsor: {
      info: 'Sponsorship packages available: Bronze R2,000/month (logo on menu), Silver R5,000/month (logo + social media), Gold R10,000/month (full co-branding). Contact us to discuss bespoke arrangements.',
      price: 'R2,000 – R10,000/month'
    }
  };

  // Dynamic field templates
  const fieldTemplates = {
    services: `
      <div class="form-group">
        <label for="service-type">Service Interested In</label>
        <select id="service-type" name="service-type">
          <option value="">— Select —</option>
          <option value="dine-in">Dine-In</option>
          <option value="takeaway">Takeaway</option>
          <option value="catering">Catering / Events</option>
          <option value="delivery">Delivery</option>
        </select>
      </div>
      <div class="form-group">
        <label for="service-date">Preferred Date</label>
        <input type="date" id="service-date" name="service-date">
      </div>
      <div class="form-group">
        <label for="guest-count">Number of Guests</label>
        <input type="number" id="guest-count" name="guest-count" min="1" max="500" placeholder="e.g. 4">
      </div>`,
    products: `
      <div class="form-group">
        <label for="product-type">Product Category</label>
        <select id="product-type" name="product-type">
          <option value="">— Select —</option>
          <option value="shawarma">Shawarma</option>
          <option value="platters">Platters</option>
          <option value="desserts">Desserts</option>
          <option value="drinks">Drinks</option>
        </select>
      </div>
      <div class="form-group">
        <label for="quantity">Quantity / Portions</label>
        <input type="number" id="quantity" name="quantity" min="1" placeholder="e.g. 2">
      </div>`,
    volunteer: `
      <div class="form-group">
        <label for="availability">Availability</label>
        <select id="availability" name="availability">
          <option value="">— Select —</option>
          <option value="weekdays">Weekdays</option>
          <option value="weekends">Weekends</option>
          <option value="both">Both</option>
        </select>
      </div>
      <div class="form-group">
        <label for="skills">Your Skills / Experience</label>
        <textarea id="skills" name="skills" placeholder="Tell us about any relevant experience..."></textarea>
      </div>`,
    sponsor: `
      <div class="form-group">
        <label for="sponsor-package">Preferred Package</label>
        <select id="sponsor-package" name="sponsor-package">
          <option value="">— Select —</option>
          <option value="bronze">Bronze — R2,000/month</option>
          <option value="silver">Silver — R5,000/month</option>
          <option value="gold">Gold — R10,000/month</option>
          <option value="custom">Custom — Let's talk</option>
        </select>
      </div>
      <div class="form-group">
        <label for="company">Company / Organisation Name</label>
        <input type="text" id="company" name="company" placeholder="Your company name">
      </div>`
  };

  // Type card selection
  typeCards.forEach(card => {
    card.addEventListener('click', () => {
      typeCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const type = card.dataset.type;
      typeInput.value = type;
      dynamicWrap.innerHTML = fieldTemplates[type] || '';
      dynamicWrap.classList.add('show');
      responseDiv.classList.remove('show');
    });
  });

  // Form submission
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateInquiryForm(form)) return;

    const type = typeInput.value;
    let responseHTML = '';

    if (type === 'services') {
      const svc = document.getElementById('service-type')?.value;
      const data = pricingData.services[svc];
      if (data) {
        responseHTML = `
          <h3>✅ Thank You for Your Enquiry — ${data.label}</h3>
          <p>${data.info}</p>
          <p class="price-highlight">💰 ${data.price}</p>
          <p>Our team will contact you within 2 hours. For urgent enquiries call <strong>060 322 4155</strong>.</p>`;
      }
    } else if (type === 'products') {
      const prod = document.getElementById('product-type')?.value;
      const data = pricingData.products[prod];
      if (data) {
        responseHTML = `
          <h3>✅ Thank You for Your Product Enquiry — ${data.label}</h3>
          <p>${data.info}</p>
          <p class="price-highlight">💰 Price Range: ${data.price}</p>
          <p>Visit us at 259 Florida Road, Berea, Durban or call <strong>060 322 4155</strong> to place your order.</p>`;
      }
    } else if (type === 'volunteer') {
      const data = pricingData.volunteer;
      responseHTML = `
        <h3>✅ Thank You for Wanting to Volunteer!</h3>
        <p>${data.info}</p>
        <p class="price-highlight">🎁 ${data.price}</p>
        <p>We'll be in touch within 3 business days to discuss the next available event.</p>`;
    } else if (type === 'sponsor') {
      const data = pricingData.sponsor;
      const pkg = document.getElementById('sponsor-package')?.value;
      responseHTML = `
        <h3>✅ Thank You for Your Sponsorship Interest!</h3>
        <p>${data.info}</p>
        <p class="price-highlight">💰 ${data.price}</p>
        <p>Package selected: <strong>${pkg || 'To be discussed'}</strong>. Our manager will contact you within 24 hours to finalise the arrangement.</p>`;
    }

    if (!responseHTML) {
      responseHTML = `
        <h3>✅ Enquiry Received!</h3>
        <p>Thank you for reaching out. We'll respond within 24 hours.</p>
        <p>For urgent matters call <strong>060 322 4155</strong>.</p>`;
    }

    responseDiv.innerHTML = responseHTML;
    responseDiv.classList.add('show');
    responseDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    form.reset();
    typeCards.forEach(c => c.classList.remove('selected'));
    dynamicWrap.classList.remove('show');
    typeInput.value = '';
  });
}

/* ===================================================
   CONTACT FORM VALIDATION
   =================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateForm(form)) return;
    showToast('✅ Message sent! We\'ll be in touch within 24 hours.');
    form.reset();
  });
}

/* ===================================================
   RESERVATION FORM VALIDATION
   =================================================== */
function initReservationForm() {
  const form = document.getElementById('reservation-form');
  if (!form) return;

  // Set min date to today
  const dateInput = form.querySelector('input[type="date"]');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateForm(form)) return;

    const guests = form.querySelector('input[type="number"]')?.value;
    const date   = form.querySelector('input[type="date"]')?.value;
    const time   = form.querySelector('input[type="time"]')?.value;

    const formatted = date ? new Date(date).toLocaleDateString('en-ZA', { weekday:'long', year:'numeric', month:'long', day:'numeric' }) : '';

    showToast(`✅ Table booked for ${guests} guest(s) on ${formatted} at ${time}. See you soon!`, 6000);
    form.reset();
  });
}

/* ===================================================
   GENERIC FORM VALIDATION
   =================================================== */
function validateForm(form) {
  let valid = true;
  $$('[required]', form).forEach(field => {
    const group = field.closest('.form-group');
    const errMsg = group?.querySelector('.error-msg');
    if (!field.value.trim()) {
      field.classList.add('error');
      if (errMsg) { errMsg.textContent = 'This field is required.'; errMsg.classList.add('show'); }
      valid = false;
    } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
      field.classList.add('error');
      if (errMsg) { errMsg.textContent = 'Please enter a valid email address.'; errMsg.classList.add('show'); }
      valid = false;
    } else {
      field.classList.remove('error');
      if (errMsg) errMsg.classList.remove('show');
    }
    field.addEventListener('input', () => {
      field.classList.remove('error');
      if (errMsg) errMsg.classList.remove('show');
    }, { once: true });
  });
  return valid;
}

function validateInquiryForm(form) {
  let valid = validateForm(form);
  if (!document.getElementById('inquiry-type')?.value) {
    showToast('Please select an enquiry type first.');
    valid = false;
  }
  return valid;
}

/* ===================================================
   DYNAMIC CONTENT LOADING (Posts / Announcements)
   =================================================== */
const announcements = [
  { title: 'Ramadan Special Menu', date: '2025-03-01', category: 'event',   body: 'We are proud to offer our special Ramadan menu throughout the holy month. Iftar platters from R160.' },
  { title: 'Family Friday Discount', date: '2025-04-10', category: 'promo',  body: 'Every Friday, families of 4 or more get 15% off their total bill. Show this at the counter.' },
  { title: 'Catering Now Open',    date: '2025-05-15', category: 'event',   body: 'We now offer full catering services for weddings, corporates, and community events from 20+ guests.' },
  { title: 'Sponsorship Available',date: '2025-06-01', category: 'sponsor', body: 'Interested in co-branding with Sham Shawarma? Packages starting from R2,000/month. Enquire now.' },
];

function loadAnnouncements(filter = 'all') {
  const container = document.getElementById('announcements-list');
  if (!container) return;

  const filtered = filter === 'all' ? announcements : announcements.filter(a => a.category === filter);
  container.innerHTML = '';

  if (!filtered.length) {
    container.innerHTML = '<p style="color:var(--gray);text-align:center;padding:20px;">No announcements found.</p>';
    return;
  }

  filtered.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'about-card';
    card.style.animationDelay = `${i * 0.08}s`;
    card.innerHTML = `
      <p style="color:var(--gray);font-size:0.8rem;margin-bottom:6px;">${new Date(item.date).toLocaleDateString('en-ZA', { year:'numeric', month:'long', day:'numeric' })} · <span style="color:var(--orange);text-transform:capitalize;">${item.category}</span></p>
      <h2>${item.title}</h2>
      <p>${item.body}</p>`;
    container.appendChild(card);
  });
}

function initAnnouncementFilters() {
  const filterBtns = $$('.announcement-filter');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadAnnouncements(btn.dataset.filter || 'all');
    });
  });
  loadAnnouncements();
}

/* ===================================================
   HEADER SCROLL EFFECT
   =================================================== */
function initHeaderScroll() {
  const header = document.querySelector('header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.style.boxShadow = window.scrollY > 10
      ? '0 4px 20px rgba(255,140,0,0.2)'
      : '0 2px 12px rgba(0,0,0,0.5)';
  }, { passive: true });
}

/* ===================================================
   IMAGE LAZY LOADING
   =================================================== */
function initLazyImages() {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          observer.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });

    $$('img[data-src]').forEach(img => observer.observe(img));
  } else {
    $$('img[data-src]').forEach(img => { img.src = img.dataset.src; });
  }
}

/* ===================================================
   INIT
   =================================================== */
document.addEventListener('DOMContentLoaded', () => {
  setActiveNav();
  initHamburger();
  initScrollTop();
  initLightbox();
  initAccordions();
  initTabs();
  initMenuSearch();
  initInquiryForm();
  initContactForm();
  initReservationForm();
  initAnnouncementFilters();
  initHeaderScroll();
  initLazyImages();
});