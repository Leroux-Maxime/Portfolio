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

// Animated moving lines background
const bgCanvas = document.querySelector('.bg-lines');

if (bgCanvas) {
  const ctx = bgCanvas.getContext('2d');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0;
  let height = 0;
  let ratio = 1;
  let lines = [];
  let animationId = null;
  let lastTime = performance.now();

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  const lineCount = () => clamp(Math.round((width * height) / 42000), 18, 56);

  const createLine = () => {
    const direction = Math.random() > 0.45 ? 1 : -1;
    const length = 120 + Math.random() * 220;
    const speed = 80 + Math.random() * 34;

    return {
      x: direction === 1 ? -length - Math.random() * width : width + length + Math.random() * width,
      y: Math.random() * height,
      baseY: Math.random() * height,
      length,
      speed,
      thickness: 1.6 + Math.random() * 2.6,
      alpha: 0.24 + Math.random() * 0.4,
      wobble: 4 + Math.random() * 14,
      phase: Math.random() * Math.PI * 2,
      direction
    };
  };

  const buildLines = () => {
    lines = Array.from({ length: lineCount() }, createLine);
  };

  const resizeCanvas = () => {
    ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    bgCanvas.width = Math.round(width * ratio);
    bgCanvas.height = Math.round(height * ratio);
    bgCanvas.style.width = `${width}px`;
    bgCanvas.style.height = `${height}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    buildLines();
  };

  const drawBackground = () => {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#0d1a34');
    gradient.addColorStop(0.5, '#142543');
    gradient.addColorStop(1, '#0a142b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  };

  const drawLine = line => {
    const endX = line.x + line.length * line.direction;
    const lineGradient = ctx.createLinearGradient(line.x, line.y, endX, line.y);

    lineGradient.addColorStop(0, `rgba(125, 211, 252, 0)`);
    lineGradient.addColorStop(0.5, `rgba(186, 230, 253, ${line.alpha})`);
    lineGradient.addColorStop(1, `rgba(56, 189, 248, 0)`);

    // Soft glow pass for a premium neon look.
    ctx.shadowBlur = 24;
    ctx.shadowColor = 'rgba(125, 211, 252, 0.85)';
    ctx.beginPath();
    ctx.moveTo(line.x, line.y);
    ctx.lineTo(endX, line.y);
    ctx.strokeStyle = lineGradient;
    ctx.lineWidth = line.thickness;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.shadowBlur = 0;
  };

  const animate = currentTime => {
    const dt = Math.min((currentTime - lastTime) / 1000, 0.05);
    lastTime = currentTime;

    drawBackground();

    for (const line of lines) {
      line.x += line.speed * dt * line.direction;
      line.y = line.baseY + Math.sin(currentTime * 0.001 + line.phase) * line.wobble;

      const outRight = line.direction === 1 && line.x - 20 > width + line.length;
      const outLeft = line.direction === -1 && line.x + 20 < -line.length;

      if (outRight || outLeft) {
        Object.assign(line, createLine());
      }

      drawLine(line);
    }

    animationId = requestAnimationFrame(animate);
  };

  const startAnimation = () => {
    cancelAnimationFrame(animationId);
    drawBackground();

    if (reducedMotion.matches) {
      lines.forEach(line => {
        line.y = line.baseY;
        drawLine(line);
      });
      return;
    }

    lastTime = performance.now();
    animationId = requestAnimationFrame(animate);
  };

  resizeCanvas();
  startAnimation();

  window.addEventListener('resize', () => {
    resizeCanvas();
    startAnimation();
  });

  reducedMotion.addEventListener('change', startAnimation);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animationId);
    } else {
      startAnimation();
    }
  });
}
