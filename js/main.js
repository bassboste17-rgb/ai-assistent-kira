/* =============================================
   DAMQ TRAVEL - Main JavaScript
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Load Component Helper ---------- */
  async function loadComponent(id, path) {
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error(`Failed to load ${path}`);
      const html = await res.text();
      const container = document.getElementById(id);
      if (container) container.innerHTML = html;
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  /* ---------- Detect Current Page ---------- */
  function getCurrentPage() {
    const path = window.location.pathname;
    const file = path.split('/').pop() || 'home.html';
    if (file.includes('home') || file === '' || file === '/') return 'home';
    if (file.includes('services')) return 'services';
    if (file.includes('blog')) return 'blog';
    if (file.includes('contact')) return 'contact';
    if (file.includes('tour-detail')) return 'tour-detail';
    if (file.includes('admin')) return 'admin';
    return 'home';
  }

  /* ---------- Set Active Nav Link ---------- */
  function setActiveNavLink() {
    const page = getCurrentPage();
    // Map page to data-nav attribute
    const navMap = {
      'home': 'home',
      'services': 'services',
      'blog': 'blog',
      'contact': 'contact',
      'tour-detail': 'services'
    };
    const activeNav = navMap[page] || '';

    document.querySelectorAll('.nav-link, .mobile-link').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-nav') === activeNav) {
        link.classList.add('active');
      }
    });
  }

  /* ---------- Load Navbar + Footer, then Init ---------- */
  async function loadAndInit() {
    // Load navbar via fetch only if placeholder is empty (not pre-embedded)
    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    if (navbarPlaceholder && !navbarPlaceholder.querySelector('.navbar')) {
      await loadComponent('navbar-placeholder', '/components/navbar.html');
    }

    // Load footer via fetch only if placeholder is empty (not pre-embedded)
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder && !footerPlaceholder.querySelector('.footer')) {
      await loadComponent('footer-placeholder', '/components/footer.html');
    }

    // Set active nav link based on current page
    setActiveNavLink();

    // Init navbar functionality
    initNavbar();
    initLangSwitcher();

    // Apply translations to freshly loaded components
    const lang = localStorage.getItem('damq_lang') || 'ru';
    if (window.setLanguage) window.setLanguage(lang);

    // Init remaining features
    initScrollAnimations();
    initReviewsSlider();
    initMap();
    initContactForm();
    initVideoModal();
    initReviewForm();
    initToursSliders();

    setTimeout(() => {
      document.querySelector('.hero')?.classList.add('loaded');
    }, 100);
  }

  loadAndInit();

  /* ---------- Navbar ---------- */
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    const toggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');

    if (!navbar) return;

    let menuIsOpen = false;

    // --- helpers ---
    function openMenu() {
      if (!toggle || !mobileMenu) return;
      menuIsOpen = true;
      toggle.classList.add('active');
      mobileMenu.classList.add('active');
      navbar.classList.add('menu-open');
      navbar.classList.remove('scrolled');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      if (!toggle || !mobileMenu) return;
      menuIsOpen = false;
      toggle.classList.remove('active');
      mobileMenu.classList.remove('active');
      navbar.classList.remove('menu-open');
      document.body.style.overflow = '';
      // restore scroll styling
      updateScrollState();
    }

    function updateScrollState() {
      if (menuIsOpen) return;
      if (window.scrollY > 80) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    // --- scroll ---
    function handleScroll() {
      updateScrollState();

      // Active section tracking (only on pages with sections)
      const sections = document.querySelectorAll('section[id]');
      let current = '';
      sections.forEach(section => {
        const top = section.offsetTop - 120;
        if (window.scrollY >= top) {
          current = section.getAttribute('id');
        }
      });

      document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('data-section') === current) {
          // Only update if using data-section attribute
        }
      });
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // --- toggle button ---
    if (toggle && mobileMenu) {
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (menuIsOpen) {
          closeMenu();
        } else {
          openMenu();
        }
      });
    }

    // --- close on any link / CTA click ---
    document.querySelectorAll('.nav-link, .mobile-link, .mobile-cta, .btn-cta-nav').forEach(el => {
      el.addEventListener('click', () => {
        if (menuIsOpen) closeMenu();
      });
    });

    // --- close on Escape key ---
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuIsOpen) closeMenu();
    });
  }

  /* ---------- Language Switcher ---------- */
  function initLangSwitcher() {
    const switcher = document.getElementById('langSwitcher');
    const toggle = document.getElementById('langToggle');
    const dropdown = document.getElementById('langDropdown');
    const langLabel = document.getElementById('langLabel');
    const options = document.querySelectorAll('.lang-option');
    const mobileBtns = document.querySelectorAll('.mobile-lang-btn');

    if (!switcher || !toggle) return;

    // Restore saved language
    const savedLang = localStorage.getItem('damq_lang') || 'ru';
    setLanguage(savedLang);

    // Toggle dropdown
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      switcher.classList.toggle('active');
    });

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
      if (!switcher.contains(e.target)) {
        switcher.classList.remove('active');
      }
    });

    // Desktop lang option click
    options.forEach(opt => {
      opt.addEventListener('click', () => {
        const lang = opt.getAttribute('data-lang');
        setLanguage(lang);
        switcher.classList.remove('active');
      });
    });

    // Mobile lang button click
    mobileBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang');
        setLanguage(lang);
      });
    });
  }

  /* ---------- Translation Engine ---------- */
  function setLanguage(lang) {
    // Save preference
    localStorage.setItem('damq_lang', lang);
    window.currentLang = lang;

    // Update lang label
    const langLabel = document.getElementById('langLabel');
    if (langLabel) langLabel.textContent = lang.toUpperCase();

    // Sync desktop options
    document.querySelectorAll('.lang-option').forEach(opt => {
      opt.classList.toggle('active', opt.getAttribute('data-lang') === lang);
    });

    // Sync mobile buttons
    document.querySelectorAll('.mobile-lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    // Translate all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = window.t ? window.t(key, lang) : key;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = val;
      } else if (el.tagName === 'OPTION') {
        el.textContent = val;
      } else {
        el.innerHTML = val;
      }
    });

    // Translate placeholders with data-i18n-ph
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const key = el.getAttribute('data-i18n-ph');
      const val = window.t ? window.t(key, lang) : key;
      el.placeholder = val;
    });

    // Translate labels with data-i18n-label
    document.querySelectorAll('[data-i18n-label]').forEach(el => {
      const key = el.getAttribute('data-i18n-label');
      const val = window.t ? window.t(key, lang) : key;
      el.setAttribute('aria-label', val);
    });

    // Update HTML lang attribute
    document.documentElement.lang = lang === 'ka' ? 'ka' : lang === 'en' ? 'en' : 'ru';

    // Dispatch event for other scripts to listen
    window.dispatchEvent(new CustomEvent('langChanged', { detail: { lang } }));
  }

  // Make setLanguage global
  window.setLanguage = setLanguage;
  window.currentLang = localStorage.getItem('damq_lang') || 'ru';

  /* ---------- Scroll Animations ---------- */
  function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observer.observe(el);
    });
  }

  /* ---------- Count-Up Animation ---------- */
  function initCountUp() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const counters = entry.target.querySelectorAll('.stat-number[data-target]');
          counters.forEach(counter => {
            animateCounter(counter);
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    const statsBar = document.querySelector('.hero-stats');
    if (statsBar) observer.observe(statsBar);
  }

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'));
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 2000;
    const start = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const current = Math.round(eased * target);
      el.textContent = current.toLocaleString() + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  /* ---------- Reviews Slider ---------- */
  function initReviewsSlider() {
    const track = document.querySelector('.reviews-track');
    const prevBtn = document.querySelector('.review-prev');
    const nextBtn = document.querySelector('.review-next');
    const dots = document.querySelectorAll('.review-dot');

    if (!track) return;

    let currentSlide = 0;
    const totalSlides = document.querySelectorAll('.review-card').length;
    let autoSlide;

    function goToSlide(index) {
      currentSlide = (index + totalSlides) % totalSlides;
      track.style.transform = `translateX(-${currentSlide * 100}%)`;

      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSlide);
      });
    }

    if (prevBtn) prevBtn.addEventListener('click', () => {
      goToSlide(currentSlide - 1);
      resetAutoSlide();
    });

    if (nextBtn) nextBtn.addEventListener('click', () => {
      goToSlide(currentSlide + 1);
      resetAutoSlide();
    });

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        goToSlide(i);
        resetAutoSlide();
      });
    });

    function startAutoSlide() {
      autoSlide = setInterval(() => goToSlide(currentSlide + 1), 5000);
    }

    function resetAutoSlide() {
      clearInterval(autoSlide);
      startAutoSlide();
    }

    startAutoSlide();
  }

  /* ---------- Leaflet Map ---------- */
  function initMap() {
    const mapEl = document.getElementById('georgia-map');
    if (!mapEl || typeof L === 'undefined') return;

    const map = L.map('georgia-map', {
      center: [42.3154, 43.3569],
      zoom: 8,
      scrollWheelZoom: false,
      zoomControl: false
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    const regionIcon = L.divIcon({
      className: 'custom-marker',
      html: '<div style="width:16px;height:16px;background:#e63946;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3),0 0 10px rgba(230,57,70,0.4);"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
      popupAnchor: [0, -10]
    });

    // Georgian regions as markers
    const locations = [
      { lat: 41.7151, lng: 44.8271, titleKey: 'region.tbilisi', descKey: 'region.tbilisi.desc', badgeKey: 'region.tbilisi.badge', region: 'tbilisi', image: 'images/regions/tbilisi.jpg' },
      { lat: 41.6453, lng: 45.9527, titleKey: 'region.kakheti', descKey: 'region.kakheti.desc', badgeKey: 'region.kakheti.badge', region: 'kakheti', image: 'images/regions/kakheti.jpg' },
      { lat: 42.4533, lng: 44.7218, titleKey: 'region.mtskheta', descKey: 'region.mtskheta.desc', badgeKey: 'region.mtskheta.badge', region: 'mtskheta', image: 'images/regions/mtskheta.jpg' },
      { lat: 41.6168, lng: 41.6367, titleKey: 'region.adjara', descKey: 'region.adjara.desc', badgeKey: 'region.adjara.badge', region: 'adjara', image: 'images/regions/adjara.jpg' },
      { lat: 42.2679, lng: 42.6946, titleKey: 'region.imereti', descKey: 'region.imereti.desc', badgeKey: 'region.imereti.badge', region: 'imereti', image: 'images/regions/imereti.jpg' },
      { lat: 42.5090, lng: 41.8710, titleKey: 'region.samegrelo', descKey: 'region.samegrelo.desc', badgeKey: 'region.samegrelo.badge', region: 'samegrelo', image: 'images/regions/samegrelo.jpg' },
      { lat: 41.3780, lng: 43.4050, titleKey: 'region.samtskhe', descKey: 'region.samtskhe.desc', badgeKey: 'region.samtskhe.badge', region: 'samtskhe', image: 'images/regions/samtskhe.jpg' },
      { lat: 42.3450, lng: 43.9960, titleKey: 'region.shida', descKey: 'region.shida.desc', badgeKey: 'region.shida.badge', region: 'shida-kartli', image: 'images/regions/shida-kartli.jpg' },
      { lat: 41.4430, lng: 44.4870, titleKey: 'region.kvemo', descKey: 'region.kvemo.desc', badgeKey: 'region.kvemo.badge', region: 'kvemo-kartli', image: 'images/regions/kvemo-kartli.jpg' },
      { lat: 42.6820, lng: 43.4270, titleKey: 'region.racha', descKey: 'region.racha.desc', badgeKey: 'region.racha.badge', region: 'racha', image: 'images/regions/racha.jpg' },
      { lat: 41.9730, lng: 42.1110, titleKey: 'region.guria', descKey: 'region.guria.desc', badgeKey: 'region.guria.badge', region: 'guria', image: 'images/regions/guria.jpg' },
      { lat: 43.0096, lng: 41.0230, titleKey: 'region.abkhazia', descKey: 'region.abkhazia.desc', badgeKey: 'region.abkhazia.badge', region: 'abkhazia', image: 'images/regions/abkhazia.jpg' }
    ];

    function getPopupHtml(loc) {
      const curLang = window.currentLang || localStorage.getItem('damq_lang') || 'ru';
      const tr = (key) => window.t ? window.t(key, curLang) : key;
      return '<div class="map-popup">' +
        '<div class="map-popup-img"><img src="' + loc.image + '" alt="' + tr(loc.titleKey) + '" loading="lazy"></div>' +
        '<div class="map-popup-body">' +
          '<h3 class="map-popup-title">' + tr(loc.titleKey) + '</h3>' +
          '<p class="map-popup-desc">' + tr(loc.descKey) + '</p>' +
          '<span class="map-popup-badge">' + tr(loc.badgeKey) + '</span>' +
          '<a href="services.html" class="map-popup-link">' + tr('map.more') + ' &rarr;</a>' +
        '</div>' +
      '</div>';
    }

    const mapMarkers = [];
    locations.forEach(loc => {
      const marker = L.marker([loc.lat, loc.lng], { icon: regionIcon }).addTo(map);
      marker.bindPopup(getPopupHtml(loc), { maxWidth: 280, minWidth: 240, className: 'custom-popup' });
      mapMarkers.push({ marker, loc });
    });

    // Re-bind popups when language changes
    window.addEventListener('langChanged', function() {
      mapMarkers.forEach(function(item) {
        item.marker.setPopupContent(getPopupHtml(item.loc));
      });
    });

    // Enable scroll zoom on focus
    mapEl.addEventListener('click', () => map.scrollWheelZoom.enable());
    mapEl.addEventListener('mouseleave', () => map.scrollWheelZoom.disable());
  }

  /* ---------- Contact Form ---------- */
  function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const btn = form.querySelector('.btn-submit');
      const originalText = btn.innerHTML;

      btn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        Отправка...
      `;
      btn.disabled = true;

      setTimeout(() => {
        btn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          Заявка отправлена!
        `;
        btn.style.background = '#4ade80';
        btn.style.color = '#0f0f1a';

        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.background = '';
          btn.style.color = '';
          btn.disabled = false;
          form.reset();
        }, 3000);
      }, 1500);
    });
  }

  /* ---------- Video Modal (Native Fullscreen) ---------- */
  function initVideoModal() {
    const openBtn = document.getElementById('openVideoBtn');
    const modal = document.getElementById('videoModal');
    const closeBtn = document.getElementById('closeVideoBtn');
    const video = document.getElementById('videoPlayer');

    if (!openBtn || !modal || !video) return;

    openBtn.addEventListener('click', () => {
      // Show the modal first so the video is visible in the DOM
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      video.play();

      // Then try to go fullscreen on the VIDEO element itself
      if (video.requestFullscreen) {
        video.requestFullscreen().catch(() => {});
      } else if (video.webkitEnterFullscreen) {
        video.webkitEnterFullscreen();
      } else if (video.webkitRequestFullscreen) {
        video.webkitRequestFullscreen();
      }
    });

    function closeModal() {
      modal.classList.remove('active');
      video.pause();
      video.currentTime = 0;
      document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });

    // When exiting fullscreen, keep modal open so user can still watch
    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement && modal.classList.contains('active')) {
        // User exited fullscreen, video stays in modal
      }
    });
  }

  /* ---------- Review Form ---------- */
  function initReviewForm() {
    const form = document.getElementById('reviewForm');
    const starRating = document.getElementById('starRating');
    const ratingInput = document.getElementById('reviewRating');

    if (!form || !starRating) return;

    let currentRating = 0;
    const starBtns = starRating.querySelectorAll('.star-btn');

    // Star hover effect
    starBtns.forEach((btn) => {
      btn.addEventListener('mouseenter', () => {
        const hoverRating = parseInt(btn.dataset.rating);
        starBtns.forEach((s) => {
          const r = parseInt(s.dataset.rating);
          s.classList.toggle('hover', r <= hoverRating && r > currentRating);
        });
      });

      btn.addEventListener('click', () => {
        currentRating = parseInt(btn.dataset.rating);
        ratingInput.value = currentRating;
        starBtns.forEach((s) => {
          const r = parseInt(s.dataset.rating);
          s.classList.toggle('active', r <= currentRating);
          s.classList.remove('hover');
        });
      });
    });

    starRating.addEventListener('mouseleave', () => {
      starBtns.forEach((s) => s.classList.remove('hover'));
    });

    // Form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const firstName = document.getElementById('reviewFirstName').value.trim();
      const lastName = document.getElementById('reviewLastName').value.trim();
      const country = document.getElementById('reviewCountry').value;
      const rating = parseInt(ratingInput.value);
      const text = document.getElementById('reviewText').value.trim();

      if (!firstName || !lastName || !country || rating === 0 || !text) {
        if (rating === 0) {
          alert('Пожалуйста, выберите оценку');
          return;
        }
        return;
      }

      // Generate initials from first letter of first and last name
      const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();

      // Build star SVGs
      let starsHtml = '';
      for (let i = 0; i < 5; i++) {
        if (i < rating) {
          starsHtml += '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
        } else {
          starsHtml += '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
        }
      }

      // Create new review card
      const newCard = document.createElement('div');
      newCard.className = 'review-card';
      newCard.innerHTML = `
        <div class="review-card-inner">
          <span class="review-quote">&ldquo;</span>
          <div class="review-stars">${starsHtml}</div>
          <p class="review-text">${text}</p>
          <div class="review-author">
            <div class="review-avatar">${initials}</div>
            <div class="review-info">
              <h4>${firstName} ${lastName}</h4>
              <p>${country}</p>
            </div>
          </div>
        </div>
      `;

      // Append the new review card to the reviews track
      const track = document.querySelector('.reviews-track');
      if (track) {
        track.appendChild(newCard);

        // Add a new dot
        const dotsContainer = document.querySelector('.reviews-dots');
        if (dotsContainer) {
          const newDot = document.createElement('button');
          newDot.className = 'review-dot';
          newDot.setAttribute('aria-label', `Отзыв ${track.children.length}`);
          dotsContainer.appendChild(newDot);

          // Bind click to the new dot
          newDot.addEventListener('click', () => {
            const dots = document.querySelectorAll('.review-dot');
            const index = Array.from(dots).indexOf(newDot);
            track.style.transform = `translateX(-${index * 100}%)`;
            dots.forEach((d, i) => d.classList.toggle('active', i === index));
          });
        }

        // Navigate to the new review
        const totalSlides = track.children.length;
        const newIndex = totalSlides - 1;
        track.style.transform = `translateX(-${newIndex * 100}%)`;
        document.querySelectorAll('.review-dot').forEach((d, i) => {
          d.classList.toggle('active', i === newIndex);
        });
      }

      // Show success state
      const btn = form.querySelector('.btn-submit-review');
      const originalText = btn.innerHTML;
      btn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        Отзыв добавлен!
      `;
      btn.style.background = '#4ade80';
      btn.style.color = '#0f0f1a';
      btn.disabled = true;

      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
        btn.style.color = '';
        btn.disabled = false;
        form.reset();
        currentRating = 0;
        ratingInput.value = 0;
        starBtns.forEach((s) => {
          s.classList.remove('active');
          s.classList.remove('hover');
        });
      }, 3000);
    });
  }

  /* ---------- Tours Horizontal Sliders ---------- */
  function initToursSliders() {
    document.querySelectorAll('.tours-slider-wrap').forEach(wrap => {
      const track = wrap.querySelector('.tours-grid');
      const leftBtn = wrap.querySelector('.arrow-left');
      const rightBtn = wrap.querySelector('.arrow-right');

      if (!track || !leftBtn || !rightBtn) return;

      function updateArrows() {
        const scrollLeft = track.scrollLeft;
        const maxScroll = track.scrollWidth - track.clientWidth;

        leftBtn.classList.toggle('disabled', scrollLeft <= 5);
        rightBtn.classList.toggle('disabled', scrollLeft >= maxScroll - 5);
      }

      function getScrollAmount() {
        // Scroll by one card width + gap
        const card = track.querySelector('.tour-card') || track.querySelector('.tour-featured');
        if (!card) return 400;
        return card.offsetWidth + 32; // 32 = gap
      }

      leftBtn.addEventListener('click', () => {
        track.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
      });

      rightBtn.addEventListener('click', () => {
        track.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
      });

      track.addEventListener('scroll', updateArrows);
      window.addEventListener('resize', updateArrows);

      // Initial check
      setTimeout(updateArrows, 200);
    });
  }

});
