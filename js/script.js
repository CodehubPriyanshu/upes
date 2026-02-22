// js/script.js – Enhanced with testimonial slider and perfect interactions

(function() {
  'use strict';

  // ---------- HELPER: debounce for resize events ----------
  const debounce = (fn, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  };

  // ---------- COUNTER ANIMATION (triggers once when stats visible) ----------
  const counters = document.querySelectorAll('.stat-number-lg, .fig-number');
  let countersAnimated = false;

  const animateNumbers = () => {
    if (countersAnimated) return;
    countersAnimated = true;
    counters.forEach(counter => {
      const target = +counter.getAttribute('data-target');
      let current = 0;
      const increment = target / 80;
      const update = () => {
        current += increment;
        if (current < target) {
          counter.innerText = Math.ceil(current);
          requestAnimationFrame(update);
        } else {
          counter.innerText = target;
        }
      };
      requestAnimationFrame(update);
    });
  };

  // ---------- SCROLL REVEAL (Intersection Observer) ----------
  const reveals = document.querySelectorAll('.reveal');
  const statsSection = document.querySelector('.stats-navy');
  const figuresSection = document.querySelector('.figures');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        if (entry.target === statsSection || entry.target === figuresSection || entry.target.closest('.stats-navy') || entry.target.closest('.figures')) {
          animateNumbers();
        }
      }
    });
  }, { threshold: 0.3 });

  reveals.forEach(el => observer.observe(el));
  if (statsSection) observer.observe(statsSection);
  if (figuresSection) observer.observe(figuresSection);

  // ---------- TESTIMONIAL SLIDER (modern carousel) ----------
  const initTestimonialSlider = () => {
    const sliderContainer = document.querySelector('.testimonial-slider');
    if (!sliderContainer) return;

    // Get existing cards
    const cards = Array.from(document.querySelectorAll('.testimonial-card'));
    if (cards.length === 0) return;

    // Clear container and build carousel structure
    sliderContainer.innerHTML = '';

    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'testimonial-wrapper';
    cards.forEach(card => wrapper.appendChild(card.cloneNode(true)));
    sliderContainer.appendChild(wrapper);

    // Add navigation buttons
    const prevBtn = document.createElement('button');
    prevBtn.className = 'slider-btn prev';
    prevBtn.innerHTML = '❮';
    const nextBtn = document.createElement('button');
    nextBtn.className = 'slider-btn next';
    nextBtn.innerHTML = '❯';
    sliderContainer.appendChild(prevBtn);
    sliderContainer.appendChild(nextBtn);

    // Add dots
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'slider-dots';
    const slides = wrapper.children;
    const slideCount = slides.length;
    for (let i = 0; i < slideCount; i++) {
      const dot = document.createElement('span');
      dot.className = 'dot';
      dot.dataset.index = i;
      dotsContainer.appendChild(dot);
    }
    sliderContainer.appendChild(dotsContainer);

    let currentIndex = 0;
    const dots = dotsContainer.children;

    // Determine visible slides based on screen width
    const getVisibleSlides = () => window.innerWidth >= 1025 ? 3 : 1;
    let visibleSlides = getVisibleSlides();

    const updateSlider = () => {
      const maxIndex = slideCount - visibleSlides;
      if (currentIndex > maxIndex) currentIndex = maxIndex;
      if (currentIndex < 0) currentIndex = 0;
      const translateX = -(currentIndex * (100 / visibleSlides));
      wrapper.style.transform = `translateX(${translateX}%)`;
      Array.from(dots).forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
      });
    };

    // Event listeners
    prevBtn.addEventListener('click', () => {
      currentIndex = Math.max(currentIndex - 1, 0);
      updateSlider();
    });

    nextBtn.addEventListener('click', () => {
      currentIndex = Math.min(currentIndex + 1, slideCount - visibleSlides);
      updateSlider();
    });

    Array.from(dots).forEach(dot => {
      dot.addEventListener('click', (e) => {
        currentIndex = parseInt(e.target.dataset.index);
        updateSlider();
      });
    });

    // Auto-slide
    let autoSlide = setInterval(() => {
      currentIndex = (currentIndex + 1) % (slideCount - visibleSlides + 1);
      updateSlider();
    }, 5000);

    sliderContainer.addEventListener('mouseenter', () => clearInterval(autoSlide));
    sliderContainer.addEventListener('mouseleave', () => {
      autoSlide = setInterval(() => {
        currentIndex = (currentIndex + 1) % (slideCount - visibleSlides + 1);
        updateSlider();
      }, 5000);
    });

    // Touch support
    let touchStartX = 0;
    wrapper.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });
    wrapper.addEventListener('touchend', (e) => {
      const diff = e.changedTouches[0].screenX - touchStartX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          currentIndex = Math.max(currentIndex - 1, 0);
        } else {
          currentIndex = Math.min(currentIndex + 1, slideCount - visibleSlides);
        }
        updateSlider();
      }
    });

    // Update on resize
    window.addEventListener('resize', debounce(() => {
      const newVisible = getVisibleSlides();
      if (newVisible !== visibleSlides) {
        visibleSlides = newVisible;
        currentIndex = 0;
        updateSlider();
      }
    }, 200));

    updateSlider();
  };

  // Initialize slider after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTestimonialSlider);
  } else {
    initTestimonialSlider();
  }

  // ---------- MODAL ----------
  const modal = document.getElementById('modal');
  const closeBtn = document.querySelector('.close-btn');
  const placementBtn = document.getElementById('placementDetailsBtn');
  const brochureBtn = document.getElementById('downloadBrochureBtn');

  function openModal() {
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (placementBtn) placementBtn.addEventListener('click', openModal);
  if (brochureBtn) brochureBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('active')) {
      closeModal();
    }
  });

  // ---------- FORM VALIDATION ----------
  const validateForm = (form) => {
    let isValid = true;
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(field => {
      field.style.border = '';
      if (field.hasAttribute('required') && !field.value.trim()) {
        isValid = false;
        field.style.border = '1px solid red';
      }
      if (field.type === 'email' && field.value && !field.value.includes('@')) {
        isValid = false;
        field.style.border = '1px solid red';
      }
      if (field.type === 'tel' && field.value && !/^\d{10}$/.test(field.value)) {
        isValid = false;
        field.style.border = '1px solid red';
      }
    });
    return isValid;
  };

  const heroForm = document.getElementById('heroForm');
  if (heroForm) {
    heroForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (validateForm(heroForm)) {
        alert('✅ Inquiry sent (demo). We will contact you soon.');
        heroForm.reset();
      } else {
        alert('❌ Please fill all fields correctly.');
      }
    });
  }

  const modalForm = document.getElementById('modalForm');
  if (modalForm) {
    modalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (validateForm(modalForm)) {
        alert('📄 Brochure download link sent (demo).');
        modalForm.reset();
        closeModal();
      } else {
        alert('❌ Please fill all fields correctly.');
      }
    });
  }

  // ---------- RECRUITER SLIDER (infinite clone) ----------
  const track = document.getElementById('sliderTrack');
  if (track && !track.hasAttribute('data-cloned')) {
    const clone = track.innerHTML;
    track.innerHTML += clone;
    track.setAttribute('data-cloned', 'true');
  }

  // ---------- SMOOTH SCROLL ----------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });
})();