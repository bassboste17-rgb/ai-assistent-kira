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

  /* ---------- SVG Map Interactions ---------- */
  function initMap() {
    const mapContainer = document.getElementById('georgia-map-svg');
    if (!mapContainer) return;

    const regionLinks = mapContainer.querySelectorAll('.region-link');
    const regionCards = document.querySelectorAll('.region-card');
    const tooltip = document.getElementById('regionTooltip');

    const regionData = {
      'tbilisi': { title: 'Тбилиси', desc: 'Столица Грузии, старый город с серными банями', badge: 'Столица' },
      'kakheti': { title: 'Кахетия', desc: 'Сигнахи, Телави, винные погреба и виноградники', badge: 'Вино' },
      'mtskheta': { title: 'Мцхета-Мтианети', desc: 'Казбеги, монастырь Джвари, Военно-Грузинская дорога', badge: 'Горы' },
      'adjara': { title: 'Аджария', desc: 'Батуми, Черноморское побережье, современная архитектура', badge: 'Побережье' },
      'imereti': { title: 'Имеретия', desc: 'Кутаиси, храм Баграти, пещера Прометея', badge: 'Культура' },
      'samegrelo': { title: 'Самегрело', desc: 'Мартвильский каньон, каньон Окаце, озеро Палиастоми', badge: 'Природа' },
      'samtskhe': { title: 'Самцхе-Джавахети', desc: 'Пещерный монастырь Вардзия, Боржоми, крепость Рабат', badge: 'История' },
      'shida-kartli': { title: 'Шида Картли', desc: 'Гори, пещерный город Уплисцихе', badge: 'История' },
      'kvemo-kartli': { title: 'Квемо Картли', desc: 'Дманиси, Болнисский Сион', badge: 'Наследие' },
      'racha': { title: 'Рача-Лечхуми', desc: 'Горное вино Хванчкара, озеро Шаори', badge: 'Горы' },
      'guria': { title: 'Гурия', desc: 'Чайные плантации, Уреки с магнитными песками', badge: 'Природа' },
      'abkhazia': { title: 'Абхазия', desc: 'Историческая область Грузии, Новый Афон, озеро Рица', badge: 'Историческая область' }
    };

    // Hover effects on SVG regions
    regionLinks.forEach(link => {
      const region = link.getAttribute('data-region');
      
      link.addEventListener('mouseenter', (e) => {
        link.querySelector('.region-path').style.fill = 'rgba(201,169,110,0.3)';
        link.querySelector('.region-path').style.stroke = '#c9a96e';
        link.querySelector('.region-path').style.strokeWidth = '2.5';
        
        // Highlight matching card
        regionCards.forEach(card => {
          if (card.getAttribute('data-region') === region) {
            card.classList.add('highlighted');
          }
        });

        // Show tooltip
        if (tooltip && regionData[region]) {
          tooltip.querySelector('.region-tooltip-title').textContent = regionData[region].title;
          tooltip.querySelector('.region-tooltip-desc').textContent = regionData[region].desc;
          tooltip.querySelector('.region-tooltip-badge').textContent = regionData[region].badge;
          tooltip.classList.add('active');
        }
      });

      link.addEventListener('mousemove', (e) => {
        if (tooltip) {
          const rect = mapContainer.getBoundingClientRect();
          tooltip.style.left = (e.clientX - rect.left + 15) + 'px';
          tooltip.style.top = (e.clientY - rect.top - 10) + 'px';
        }
      });

      link.addEventListener('mouseleave', () => {
        link.querySelector('.region-path').style.fill = '';
        link.querySelector('.region-path').style.stroke = '';
        link.querySelector('.region-path').style.strokeWidth = '';
        
        regionCards.forEach(card => card.classList.remove('highlighted'));
        if (tooltip) tooltip.classList.remove('active');
      });
    });

    // Hover on cards highlights SVG region
    regionCards.forEach(card => {
      const region = card.getAttribute('data-region');
      
      card.addEventListener('mouseenter', () => {
        regionLinks.forEach(link => {
          if (link.getAttribute('data-region') === region) {
            link.querySelector('.region-path').style.fill = 'rgba(201,169,110,0.3)';
            link.querySelector('.region-path').style.stroke = '#c9a96e';
            link.querySelector('.region-path').style.strokeWidth = '2.5';
          }
        });
      });

      card.addEventListener('mouseleave', () => {
        regionLinks.forEach(link => {
          if (link.getAttribute('data-region') === region) {
            link.querySelector('.region-path').style.fill = '';
            link.querySelector('.region-path').style.stroke = '';
            link.querySelector('.region-path').style.strokeWidth = '';
          }
        });
      });
    });
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
      // Try fullscreen first
      if (video.requestFullscreen) {
        video.play();
        video.requestFullscreen().catch(() => {
          // Fallback to modal if fullscreen fails
          modal.classList.add('active');
          video.play();
          document.body.style.overflow = 'hidden';
        });
      } else if (video.webkitRequestFullscreen) {
        video.play();
        video.webkitRequestFullscreen();
      } else if (video.webkitEnterFullscreen) {
        // iOS Safari
        video.play();
        video.webkitEnterFullscreen();
      } else {
        // Fallback to modal
        modal.classList.add('active');
        video.play();
        document.body.style.overflow = 'hidden';
      }
    });

    function closeModal() {
      modal.classList.remove('active');
      video.pause();
      document.body.style.overflow = '';
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });

    // When exiting fullscreen, pause video
    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement && !modal.classList.contains('active')) {
        video.pause();
      }
    });
    document.addEventListener('webkitfullscreenchange', () => {
      if (!document.webkitFullscreenElement && !modal.classList.contains('active')) {
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
