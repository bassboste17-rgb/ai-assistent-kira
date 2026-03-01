/* =============================================
   DAMQ TRAVEL - Main JavaScript
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Load Navbar & Footer ---------- */
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

  Promise.all([
    loadComponent('navbar-placeholder', 'components/navbar.html'),
    loadComponent('footer-placeholder', 'components/footer.html')
  ]).then(() => {
    initNavbar();
    initLangSwitcher();
    initScrollAnimations();
    initReviewsSlider();
    initMap();
    initContactForm();
    initVideoModal();
    initReviewForm();

    setTimeout(() => {
      document.querySelector('.hero')?.classList.add('loaded');
    }, 100);
  });

  /* ---------- Navbar ---------- */
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    const toggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const navLinks = document.querySelectorAll('.nav-link, .mobile-link');

    if (!navbar) return;

    // Scroll effect
    function handleScroll() {
      if (window.scrollY > 80) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }

      // Active section tracking
      const sections = document.querySelectorAll('section[id]');
      let current = '';
      sections.forEach(section => {
        const top = section.offsetTop - 120;
        if (window.scrollY >= top) {
          current = section.getAttribute('id');
        }
      });

      document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === current) {
          link.classList.add('active');
        }
      });
    }

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    // Mobile menu toggle
    if (toggle && mobileMenu) {
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
      });
    }

    // Close mobile menu on link click
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (toggle) toggle.classList.remove('active');
        if (mobileMenu) mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });

    // Close mobile menu on nav CTA click
    document.querySelectorAll('.mobile-cta, .btn-cta-nav').forEach(btn => {
      btn.addEventListener('click', () => {
        if (toggle) toggle.classList.remove('active');
        if (mobileMenu) mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
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
        options.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        if (langLabel) langLabel.textContent = lang.toUpperCase();
        switcher.classList.remove('active');

        // Sync mobile buttons
        mobileBtns.forEach(btn => {
          btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
        });
      });
    });

    // Mobile lang button click
    mobileBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang');
        mobileBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (langLabel) langLabel.textContent = lang.toUpperCase();

        // Sync desktop options
        options.forEach(opt => {
          opt.classList.toggle('active', opt.getAttribute('data-lang') === lang);
        });
      });
    });
  }

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

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    const goldIcon = L.divIcon({
      className: 'custom-marker',
      html: '<div style="width:18px;height:18px;background:#c9a96e;border:3px solid #1a1a2e;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.35),0 0 12px rgba(201,169,110,0.4);"></div>',
      iconSize: [18, 18],
      iconAnchor: [9, 9],
      popupAnchor: [0, -12]
    });

    const greenIcon = L.divIcon({
      className: 'custom-marker',
      html: '<div style="width:16px;height:16px;background:#22c55e;border:3px solid #1a1a2e;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.35),0 0 10px rgba(34,197,94,0.3);"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
      popupAnchor: [0, -10]
    });

    const whiteIcon = L.divIcon({
      className: 'custom-marker',
      html: '<div style="width:14px;height:14px;background:#1a1a2e;border:3px solid #c9a96e;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.35);"></div>',
      iconSize: [14, 14],
      iconAnchor: [7, 7],
      popupAnchor: [0, -8]
    });

    // Georgian regions as markers
    const locations = [
      { lat: 41.7151, lng: 44.8271, title: 'Тбилиси', desc: 'Столица Грузии, старый город с серными банями', badge: 'Столица', region: 'tbilisi', icon: goldIcon },
      { lat: 41.8395, lng: 45.3520, title: 'Кахетия', desc: 'Сигнахи, Телави, винные погреба и виноградники', badge: 'Вино', region: 'kakheti', icon: goldIcon },
      { lat: 42.6560, lng: 44.6387, title: 'Мцхета-Мтианети', desc: 'Казбеги, монастырь Джвари, Военно-Грузинская дорога', badge: 'Горы', region: 'mtskheta', icon: goldIcon },
      { lat: 41.6410, lng: 41.6340, title: 'Аджария', desc: 'Батуми, Черноморское побережье, современная архитектура', badge: 'Побережье', region: 'adjara', icon: goldIcon },
      { lat: 42.2679, lng: 42.6990, title: 'Имеретия', desc: 'Кутаиси, храм Баграти, пещера Прометея', badge: 'Культура', region: 'imereti', icon: greenIcon },
      { lat: 42.5090, lng: 41.8710, title: 'Самегрело', desc: 'Мартвильский каньон, каньон Окаце, озеро Палиастоми', badge: 'Природа', region: 'samegrelo', icon: greenIcon },
      { lat: 41.3780, lng: 43.4050, title: 'Самцхе-Джавахети', desc: 'Пещерный монастырь Вардзия, Боржоми, крепость Рабат', badge: 'История', region: 'samtskhe', icon: greenIcon },
      { lat: 42.3450, lng: 43.9960, title: 'Шида Картли', desc: 'Гори, пещерный город Уплисцихе', badge: 'История', region: 'shida-kartli', icon: whiteIcon },
      { lat: 41.4430, lng: 44.4870, title: 'Квемо Картли', desc: 'Дманиси, Болнисский Сион', badge: 'Наследие', region: 'kvemo-kartli', icon: whiteIcon },
      { lat: 42.6820, lng: 43.4270, title: 'Рача-Лечхуми', desc: 'Горное вино Хванчкара, озеро Шаори', badge: 'Горы', region: 'racha', icon: whiteIcon },
      { lat: 41.9730, lng: 42.1110, title: 'Гурия', desc: 'Чайные плантации, Уреки с магнитными песками', badge: 'Природа', region: 'guria', icon: whiteIcon },
      { lat: 43.0096, lng: 41.0230, title: 'Абхазия', desc: 'Историческая область Грузии, Новый Афон, озеро Рица', badge: 'Историческая область', region: 'abkhazia', icon: whiteIcon },
      { lat: 43.0096, lng: 42.7120, title: 'Местийский ледник', desc: 'Тропа к леднику Чалаади', badge: 'Природа', region: 'mestia', icon: greenIcon }
    ];

    locations.forEach(loc => {
      const marker = L.marker([loc.lat, loc.lng], { icon: loc.icon }).addTo(map);
      marker.bindPopup(
        '<div style="min-width:180px;">' +
          '<h3 style="font-family:Playfair Display,serif;font-size:15px;margin:0 0 4px;color:#1a1a2e;">' + loc.title + '</h3>' +
          '<p style="font-size:12px;color:#555;margin:0 0 8px;line-height:1.4;">' + loc.desc + '</p>' +
          '<span class="map-popup-badge">' + loc.badge + '</span>' +
          (loc.region !== 'mestia' ? '<br><a href="services.html" style="display:inline-block;margin-top:8px;font-size:11px;font-weight:600;color:#c9a96e;text-decoration:none;">Подробнее &rarr;</a>' : '') +
        '</div>'
      );
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

    if (!openBtn || !video) return;

    openBtn.addEventListener('click', () => {
      video.play();
      // Request fullscreen on the VIDEO element only (not the whole page)
      if (video.requestFullscreen) {
        video.requestFullscreen();
      } else if (video.webkitRequestFullscreen) {
        video.webkitRequestFullscreen();
      } else if (video.webkitEnterFullscreen) {
        // iOS Safari native fullscreen
        video.webkitEnterFullscreen();
      } else if (video.msRequestFullscreen) {
        video.msRequestFullscreen();
      }
    });

    // When exiting fullscreen, pause video
    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement) {
        video.pause();
      }
    });
    document.addEventListener('webkitfullscreenchange', () => {
      if (!document.webkitFullscreenElement) {
        video.pause();
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

});
