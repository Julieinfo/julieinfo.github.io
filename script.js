/* ============================================================
   script.js — Julie de Castro Portfolio
   Vanilla JS · No external libraries
   ============================================================ */

'use strict';

/* ─────────────────────────────────────────────────────────────
   1. SCROLL REVEAL — sections, cartes, timeline items
   ───────────────────────────────────────────────────────────── */
(function initScrollReveal() {
  const style = document.createElement('style');
  style.textContent = `
    .reveal {
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.55s ease, transform 0.55s ease;
    }
    .reveal.visible {
      opacity: 1;
      transform: translateY(0);
    }
  `;
  document.head.appendChild(style);

  const selectors = [
    'section .section-header',
    '.skill-card',
    '.project-card',
    '.timeline-item',
    '.contact-card',
    'footer p',
  ];

  const elements = document.querySelectorAll(selectors.join(', '));

  elements.forEach(el => {
    // Ne pas toucher aux éléments hero déjà animés en CSS
    if (el.closest('.hero')) return;
    el.classList.add('reveal');
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();


/* ─────────────────────────────────────────────────────────────
   2. NAVBAR DYNAMIQUE — classe .scrolled au scroll
   ───────────────────────────────────────────────────────────── */
(function initNavbar() {
  const nav = document.querySelector('nav');
  if (!nav) return;

  const navStyle = document.createElement('style');
  navStyle.textContent = `
    nav.scrolled {
      background: rgba(13, 27, 42, 0.97);
      backdrop-filter: blur(20px);
      border-bottom-color: rgba(255, 255, 255, 0.14);
      transition: background 0.3s ease, backdrop-filter 0.3s ease, border-bottom-color 0.3s ease;
    }
  `;
  document.head.appendChild(navStyle);

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        if (window.scrollY > 40) {
          nav.classList.add('scrolled');
        } else {
          nav.classList.remove('scrolled');
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();


/* ─────────────────────────────────────────────────────────────
   3. COMPTEURS ANIMÉS — stats hero (5, 4+, 8+)
   ───────────────────────────────────────────────────────────── */
(function initCounters() {
  const statNums = document.querySelectorAll('.stat-num');
  if (!statNums.length) return;

  function parseTarget(text) {
    const num = parseFloat(text.replace(/[^0-9.]/g, ''));
    const suffix = text.replace(/[0-9.]/g, '');
    return { num, suffix };
  }

  function animateCounter(el, target, suffix, duration) {
    const start = performance.now();
    const isFloat = target % 1 !== 0;

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = isFloat
        ? (eased * target).toFixed(1)
        : Math.floor(eased * target);
      el.textContent = current + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  // Stocker les valeurs originales avant de les effacer
  statNums.forEach(el => {
    el.dataset.target = el.textContent.trim();
    el.textContent = '0';
  });

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const { num, suffix } = parseTarget(el.dataset.target);
          animateCounter(el, num, suffix, 1200);
          obs.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );

  statNums.forEach(el => observer.observe(el));
})();


/* ─────────────────────────────────────────────────────────────
   4. CURSEUR PERSONNALISÉ — desktop uniquement
   ───────────────────────────────────────────────────────────── */
(function initCustomCursor() {
  // Désactiver sur mobile/touch
  if (window.matchMedia('(hover: none)').matches) return;

  const cursorStyle = document.createElement('style');
  cursorStyle.textContent = `
    body { cursor: none; }
    a, button, [role="button"], .project-card, .contact-card, .skill-card {
      cursor: none;
    }
    #custom-cursor {
      position: fixed;
      top: 0; left: 0;
      width: 10px; height: 10px;
      background: #3b82f6;
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%);
      transition: width 0.2s ease, height 0.2s ease, background 0.2s ease, opacity 0.2s ease;
      will-change: transform;
      opacity: 0;
    }
    #custom-cursor.expanded {
      width: 28px;
      height: 28px;
      background: rgba(59, 130, 246, 0.25);
      border: 1.5px solid #3b82f6;
    }
    #custom-cursor.visible {
      opacity: 1;
    }
  `;
  document.head.appendChild(cursorStyle);

  const cursor = document.createElement('div');
  cursor.id = 'custom-cursor';
  document.body.appendChild(cursor);

  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;
  let rafId = null;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.classList.add('visible');
  });

  document.addEventListener('mouseleave', () => {
    cursor.classList.remove('visible');
  });

  function loop() {
    // Lag doux : lerp 0.18
    cursorX += (mouseX - cursorX) * 0.18;
    cursorY += (mouseY - cursorY) * 0.18;
    cursor.style.transform = `translate(${cursorX - 5}px, ${cursorY - 5}px)`;
    rafId = requestAnimationFrame(loop);
  }
  loop();

  const hoverTargets = 'a, button, .project-card, .contact-card, .skill-card, .btn-primary, .btn-secondary';

  document.querySelectorAll(hoverTargets).forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('expanded'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('expanded'));
  });
})();


/* ─────────────────────────────────────────────────────────────
   5. SMOOTH REVEAL EN CASCADE — tags compétences & projets
   ───────────────────────────────────────────────────────────── */
(function initTagsCascade() {
  const tagStyle = document.createElement('style');
  tagStyle.textContent = `
    .tag {
      opacity: 0;
      transform: translateY(8px) scale(0.95);
      transition: opacity 0.35s ease, transform 0.35s ease;
    }
    .tag.tag-visible {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  `;
  document.head.appendChild(tagStyle);

  // Observer les conteneurs (skill-tags, project-stack) pour déclencher la cascade
  const containers = document.querySelectorAll('.skill-tags, .project-stack');

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const tags = entry.target.querySelectorAll('.tag');
          tags.forEach((tag, i) => {
            setTimeout(() => {
              tag.classList.add('tag-visible');
            }, i * 50);
          });
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  containers.forEach(container => observer.observe(container));
})();
