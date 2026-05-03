// Animation au scroll
const elements = document.querySelectorAll('.section, .project-card, .skill-category, .timeline-item, .edu-card');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
    }
  });
}, {
  threshold: 0.1
});

elements.forEach(el => {
  el.classList.add('hidden');
  observer.observe(el);
});

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Mobile burger menu
const navbar = document.querySelector('.navbar');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelectorAll('.navbar ul a');
const navOverlay = document.querySelector('.nav-overlay');

if (navbar && menuToggle) {
  const closeMenu = () => {
    navbar.classList.remove('nav-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  };

  menuToggle.addEventListener('click', () => {
    const isOpen = navbar.classList.toggle('nav-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  if (navOverlay) {
    navOverlay.addEventListener('click', closeMenu);
  }

  document.addEventListener('click', event => {
    const clickedInsideNav = navbar.contains(event.target);
    const isMobile = window.innerWidth <= 768;

    if (isMobile && navbar.classList.contains('nav-open') && !clickedInsideNav) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && navbar.classList.contains('nav-open')) {
      closeMenu();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      closeMenu();
    }
  });
}
