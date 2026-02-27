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
    initScrollAnimations();
    initReviewsSlider();
    initMap();
    initContactForm();

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

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    // Add labels as separate layer with dark styling
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19,
      opacity: 0.6
    }).addTo(map);

    const goldIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        width: 18px; height: 18px;
        background: #c9a96e;
        border: 3px solid rgba(255,255,255,0.9);
        border-radius: 50%;
        box-shadow: 0 0 16px rgba(201,169,110,0.7), 0 2px 12px rgba(201,169,110,0.5);
      "></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
      popupAnchor: [0, -12]
    });

    const greenIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        width: 16px; height: 16px;
        background: #4ade80;
        border: 3px solid rgba(255,255,255,0.9);
        border-radius: 50%;
        box-shadow: 0 0 14px rgba(74,222,128,0.6), 0 2px 12px rgba(74,222,128,0.4);
      "></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
      popupAnchor: [0, -10]
    });

    const whiteIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        width: 14px; height: 14px;
        background: #ffffff;
        border: 3px solid #c9a96e;
        border-radius: 50%;
        box-shadow: 0 0 12px rgba(255,255,255,0.4), 0 2px 8px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
      popupAnchor: [0, -8]
    });

    const locations = [
      {
        lat: 41.7151, lng: 44.8271,
        title: 'Тбилиси',
        desc: 'Столица Грузии, старый город с серными банями',
        badge: 'Столица',
        icon: goldIcon
      },
      {
        lat: 42.6560, lng: 44.6387,
        title: 'Казбеги (Степанцминда)',
        desc: 'Гергетская церковь, вид на гору Казбек',
        badge: 'Горы',
        icon: goldIcon
      },
      {
        lat: 41.6410, lng: 41.6340,
        title: 'Батуми',
        desc: 'Черноморский курорт, современная архитектура',
        badge: 'Побережье',
        icon: goldIcon
      },
      {
        lat: 43.0096, lng: 42.7120,
        title: 'Местиа (Сванетия)',
        desc: 'Средневековые башни, горные пейзажи',
        badge: 'Горы',
        icon: goldIcon
      },
      {
        lat: 41.8395, lng: 45.3520,
        title: 'Сигнахи',
        desc: 'Город любви, винодельческий регион Кахетия',
        badge: 'Вино',
        icon: greenIcon
      },
      {
        lat: 42.2679, lng: 42.6990,
        title: 'Кутаиси',
        desc: 'Храм Баграти, пещера Прометея',
        badge: 'Культура',
        icon: greenIcon
      },
      {
        lat: 41.8379, lng: 44.7700,
        title: 'Мцхета',
        desc: 'Древняя столица, монастырь Джвари',
        badge: 'Наследие',
        icon: greenIcon
      },
      {
        lat: 41.3780, lng: 43.4050,
        title: 'Вардзия',
        desc: 'Пещерный монастырь XII века',
        badge: 'История',
        icon: whiteIcon
      },
      {
        lat: 42.3450, lng: 43.9960,
        title: 'Гори',
        desc: 'Родина Сталина, пещерный город Уплисцихе',
        badge: 'История',
        icon: whiteIcon
      },
      {
        lat: 42.7180, lng: 44.5200,
        title: 'Гудаури',
        desc: 'Горнолыжный курорт, параглайдинг',
        badge: 'Активный отдых',
        icon: whiteIcon
      },
      {
        lat: 41.7800, lng: 45.8000,
        title: 'Телави',
        desc: 'Сердце Кахетии, винные погреба',
        badge: 'Вино',
        icon: greenIcon
      },
      {
        lat: 42.5860, lng: 41.5680,
        title: 'Местийский ледник',
        desc: 'Тропа к леднику Чалаади',
        badge: 'Природа',
        icon: whiteIcon
      }
    ];

    locations.forEach(loc => {
      const marker = L.marker([loc.lat, loc.lng], { icon: loc.icon }).addTo(map);
      marker.bindPopup(`
        <h3>${loc.title}</h3>
        <p>${loc.desc}</p>
        <span class="map-popup-badge">${loc.badge}</span>
      `);
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

});
