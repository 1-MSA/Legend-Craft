document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initScrollAnimations();
  initNav();
  initTilt();
  initCounters();
  initCopyIp();
  CraftingAPI.renderRecipes();
  initCraftingFilters();
});

function initLoader() {
  const loader = document.getElementById('loader');
  setTimeout(() => {
    loader.classList.add('hidden');
    triggerHeroAnimations();
  }, 2200);
}

function triggerHeroAnimations() {
  document.querySelectorAll('.hero .reveal-up').forEach((el, i) => {
    setTimeout(() => el.classList.add('revealed'), i * 150);
  });
}

function initScrollAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    fallbackReveal();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const progressBar = document.querySelector('.scroll-progress');
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      if (progressBar) progressBar.style.width = `${self.progress * 100}%`;
    }
  });

  gsap.utils.toArray('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
    if (el.closest('.hero')) return;

    const anim = el.classList.contains('reveal-left') ? { x: -80, opacity: 0 }
      : el.classList.contains('reveal-right') ? { x: 80, opacity: 0 }
      : { y: 80, opacity: 0 };

    gsap.fromTo(el, anim, {
      ...Object.fromEntries(Object.entries(anim).map(([k, v]) => [k, k === 'opacity' ? 1 : 0])),
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      }
    });
  });

  gsap.to('.hero-dragon-3d', {
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1.5
    },
    y: 200,
    rotationY: 180,
    scale: 0.6,
    opacity: 0.3,
    ease: 'none'
  });

  gsap.to('.hero-content', {
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1
    },
    y: -100,
    opacity: 0.2,
    ease: 'none'
  });

  const sections = ['#about', '#videos', '#crafting', '#community', '#developers'];
  sections.forEach((id, i) => {
    const section = document.querySelector(id);
    if (!section) return;

    gsap.fromTo(section, {
      rotateX: 5,
      z: -100,
      opacity: 0.5
    }, {
      rotateX: 0,
      z: 0,
      opacity: 1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        end: 'top 20%',
        scrub: 1.2
      }
    });
  });

  gsap.utils.toArray('.about-card, .video-card, .recipe-card, .community-card, .dev-card').forEach((card, i) => {
    gsap.fromTo(card, {
      rotateY: i % 2 === 0 ? -15 : 15,
      z: -50,
      opacity: 0
    }, {
      rotateY: 0,
      z: 0,
      opacity: 1,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 90%',
        toggleActions: 'play none none reverse'
      }
    });
  });

  gsap.to('.section-header', {
    scrollTrigger: {
      trigger: '.section-header',
      start: 'top 80%',
      end: 'top 30%',
      scrub: 1
    },
    y: -30,
    ease: 'none'
  });
}

function fallbackReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
    if (!el.closest('.hero')) observer.observe(el);
  });
}

function initNav() {
  const nav = document.getElementById('nav');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const current = window.scrollY;
    nav.classList.toggle('scrolled', current > 50);

    if (current > lastScroll && current > 200) {
      nav.style.transform = 'translateY(-100%)';
    } else {
      nav.style.transform = 'translateY(0)';
    }
    lastScroll = current;
  });

  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

function initTilt() {
  document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateY(-8px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

function initCounters() {
  const counters = document.querySelectorAll('.stat-num[data-count]');
  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        counters.forEach(counter => {
          const target = parseInt(counter.dataset.count, 10);
          const suffix = counter.dataset.suffix || '+';
          let current = 0;
          const step = target / 60;

          const tick = () => {
            current += step;
            if (current >= target) {
              counter.textContent = target + suffix;
            } else {
              counter.textContent = Math.floor(current) + suffix;
              requestAnimationFrame(tick);
            }
          };
          tick();
        });
      }
    });
  }, { threshold: 0.5 });

  const statsEl = document.querySelector('.hero-stats');
  if (statsEl) observer.observe(statsEl);
}

function initCopyIp() {
  const btn = document.getElementById('copyIp');
  const ip = document.getElementById('serverIp');
  if (!btn || !ip) return;

  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(ip.textContent);
      btn.textContent = '✓';
      setTimeout(() => { btn.textContent = '📋'; }, 2000);
    } catch {
      btn.textContent = '!';
      setTimeout(() => { btn.textContent = '📋'; }, 2000);
    }
  });
}
