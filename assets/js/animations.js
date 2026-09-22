/**
 * animations.js — Fragancias de Alta Densidad
 * Gestor avanzado de animaciones e interactividad con Anime.js (v3.2.2)
 * Diseñado con estética Dark Luxury: física elástica, efectos continuos,
 * microinteracciones de tarjetas, "vuelo al carrito" y ambientación visual.
 */

(function (window, document) {
  'use strict';

  const ADAnimations = {
    // Validar disponibilidad de anime.js
    isReady: function () {
      return typeof window.anime === 'function';
    },

    /**
     * 1. Hero & Banners — Ambientación de lujo, orbe flotante y revelación
     */
    initHero: function (selector = '.collection-banner, .nos-hero-content') {
      if (!this.isReady()) return;

      const containers = document.querySelectorAll(selector);
      containers.forEach(container => {
        // Inyectar orbe dorado si no existe en el banner
        if (container.classList.contains('collection-banner') && !container.querySelector('.hero-glow-orb')) {
          const orb = document.createElement('div');
          orb.className = 'hero-glow-orb';
          container.prepend(orb);

          // Animación orbital continua del orbe
          anime({
            targets: orb,
            translateX: ['-50%', '-44%', '-56%', '-50%'],
            translateY: ['-50%', '-56%', '-44%', '-50%'],
            scale: [1, 1.2, 0.9, 1],
            opacity: [0.7, 0.95, 0.65, 0.7],
            duration: 8500,
            loop: true,
            easing: 'easeInOutSine'
          });
        }

        // Animar elementos de texto y badges
        const badge = container.querySelector('.hero-badge-pill');
        if (badge) {
          anime({
            targets: badge,
            opacity: [0, 1],
            translateY: [25, 0],
            scale: [0.85, 1],
            duration: 750,
            easing: 'easeOutBack'
          });
        }

        const heading = container.querySelector('h1, h2');
        if (heading) {
          anime({
            targets: heading,
            opacity: [0, 1],
            translateY: [35, 0],
            duration: 800,
            delay: 120,
            easing: 'easeOutCubic'
          });
        }

        const paragraph = container.querySelector('p');
        if (paragraph) {
          anime({
            targets: paragraph,
            opacity: [0, 1],
            translateY: [25, 0],
            duration: 750,
            delay: 240,
            easing: 'easeOutCubic'
          });
        }

        const benefits = container.querySelectorAll('.hero-benefit-item');
        if (benefits.length) {
          anime({
            targets: benefits,
            opacity: [0, 1],
            translateY: [25, 0],
            scale: [0.9, 1],
            duration: 650,
            delay: anime.stagger(90, { start: 380 }),
            easing: 'easeOutElastic(1, .8)'
          });
        }
      });
    },

    /**
     * 2. Catálogo de Perfumes y Kits — Entrada escalonada dinámica (Stagger)
     */
    staggerCards: function (containerSelector = '#productGrid', cardSelector = '.product-card:not(.product-card-placeholder)') {
      if (!this.isReady()) return;

      const container = typeof containerSelector === 'string' ? document.querySelector(containerSelector) : containerSelector;
      if (!container) return;

      const cards = container.querySelectorAll(cardSelector);
      if (!cards.length) return;

      anime.remove(cards);
      anime.set(cards, { opacity: 0, translateY: 40, scale: 0.92 });

      anime({
        targets: cards,
        opacity: [0, 1],
        translateY: [40, 0],
        scale: [0.92, 1],
        duration: 700,
        delay: anime.stagger(50, { start: 40 }),
        easing: 'easeOutCubic',
        complete: () => {
          cards.forEach(c => {
            c.style.transform = '';
            c.style.opacity = '';
          });
        }
      });

      this.bindCardHover(containerSelector, cardSelector);
    },

    /**
     * 3. Microinteracción — Física de resorte al pasar el mouse por las cards
     */
    bindCardHover: function (containerSelector = '#productGrid', cardSelector = '.product-card') {
      if (!this.isReady()) return;
      const container = typeof containerSelector === 'string' ? document.querySelector(containerSelector) : containerSelector;
      if (!container) return;

      const cards = container.querySelectorAll(cardSelector);
      cards.forEach(card => {
        if (card.dataset.hoverBound) return;
        card.dataset.hoverBound = 'true';

        card.addEventListener('mouseenter', () => {
          anime.remove(card);
          anime({
            targets: card,
            translateY: -8,
            scale: 1.025,
            duration: 320,
            easing: 'easeOutCubic'
          });
        });

        card.addEventListener('mouseleave', () => {
          anime.remove(card);
          anime({
            targets: card,
            translateY: 0,
            scale: 1,
            duration: 450,
            easing: 'easeOutElastic(1, .8)'
          });
        });
      });
    },

    /**
     * 4. Vuelo al Carrito (Fly-to-Cart) con parábola elástica
     */
    flyToCart: function (originElement, imgSrc, targetSelector = '#btnCarrito') {
      if (!this.isReady()) return;

      const target = document.querySelector(targetSelector);
      if (!originElement || !target) return;

      const startRect = originElement.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();

      // Crear burbuja flotante del producto
      const bubble = document.createElement('div');
      bubble.className = 'flying-cart-bubble';
      bubble.style.left = `${startRect.left + (startRect.width / 2) - 27}px`;
      bubble.style.top = `${startRect.top + (startRect.height / 2) - 27}px`;

      if (imgSrc) {
        const img = document.createElement('img');
        img.src = imgSrc;
        img.alt = 'Vuelo al carrito';
        bubble.appendChild(img);
      } else {
        bubble.innerHTML = '<i class="fas fa-gem" style="color:#D4AF37;font-size:1.4rem;"></i>';
      }

      document.body.appendChild(bubble);

      const deltaX = (targetRect.left + targetRect.width / 2) - (startRect.left + startRect.width / 2);
      const deltaY = (targetRect.top + targetRect.height / 2) - (startRect.top + startRect.height / 2);

      anime({
        targets: bubble,
        translateX: [
          { value: deltaX * 0.45, duration: 320, easing: 'easeOutQuad' },
          { value: deltaX, duration: 380, easing: 'easeInQuad' }
        ],
        translateY: [
          { value: -90, duration: 320, easing: 'easeOutQuad' },
          { value: deltaY, duration: 380, easing: 'easeInQuad' }
        ],
        scale: [
          { value: 1.25, duration: 250, easing: 'easeOutQuad' },
          { value: 0.35, duration: 450, easing: 'easeInBack' }
        ],
        opacity: [
          { value: 1, duration: 500 },
          { value: 0, duration: 200, easing: 'easeInQuad' }
        ],
        rotate: 360,
        complete: () => {
          bubble.remove();
          this.bumpCartBadge();
        }
      });
    },

    /**
     * 5. Carrito — Sacudida elástica y explosión de badge
     */
    bumpCartBadge: function (badgeSelector = '#carritoBadge', btnSelector = '#btnCarrito') {
      if (!this.isReady()) return;

      const badge = document.querySelector(badgeSelector);
      const btn = document.querySelector(btnSelector);

      if (btn) {
        anime.remove(btn);
        anime({
          targets: btn,
          rotate: [-14, 14, -8, 8, 0],
          scale: [
            { value: 1.3, duration: 160, easing: 'easeOutQuad' },
            { value: 0.95, duration: 140, easing: 'easeInQuad' },
            { value: 1, duration: 240, easing: 'easeOutElastic(1, .6)' }
          ]
        });
      }

      if (badge) {
        anime.remove(badge);
        anime({
          targets: badge,
          scale: [
            { value: 1.7, duration: 180, easing: 'easeOutQuad' },
            { value: 0.9, duration: 120, easing: 'easeInQuad' },
            { value: 1, duration: 220, easing: 'easeOutElastic(1, .5)' }
          ]
        });
      }
    },

    /**
     * 6. Modal de Producto / Envío — Zoom elástico & Fade in
     */
    animateModalOpen: function (modalSelector, contentSelector) {
      if (!this.isReady()) return;

      const modal = typeof modalSelector === 'string' ? document.querySelector(modalSelector) : modalSelector;
      if (!modal) return;

      const content = contentSelector ? modal.querySelector(contentSelector) : modal.querySelector('.modal-content, .shipping-modal-content');
      if (!content) return;

      anime.remove([modal, content]);

      anime({
        targets: modal,
        opacity: [0, 1],
        duration: 250,
        easing: 'easeOutQuad'
      });

      anime({
        targets: content,
        opacity: [0, 1],
        translateY: [50, 0],
        scale: [0.85, 1],
        duration: 480,
        easing: 'easeOutBack'
      });
    },

    /**
     * 7. Modal de Producto / Envío — Cierre suave con callback
     */
    animateModalClose: function (modalSelector, contentSelector, onComplete) {
      if (!this.isReady()) {
        if (typeof onComplete === 'function') onComplete();
        return;
      }

      const modal = typeof modalSelector === 'string' ? document.querySelector(modalSelector) : modalSelector;
      if (!modal) {
        if (typeof onComplete === 'function') onComplete();
        return;
      }

      const content = contentSelector ? modal.querySelector(contentSelector) : modal.querySelector('.modal-content, .shipping-modal-content');

      if (!content) {
        if (typeof onComplete === 'function') onComplete();
        return;
      }

      anime({
        targets: content,
        opacity: [1, 0],
        translateY: [0, 30],
        scale: [1, 0.92],
        duration: 220,
        easing: 'easeInQuad'
      });

      anime({
        targets: modal,
        opacity: [1, 0],
        duration: 220,
        easing: 'easeInQuad',
        complete: function () {
          if (typeof onComplete === 'function') onComplete();
        }
      });
    },

    /**
     * 8. Contadores Numéricos con Anime.js
     */
    animateCounter: function (element, targetValue, duration = 1800) {
      if (!this.isReady()) {
        element.textContent = targetValue;
        return;
      }

      const obj = { val: 0 };
      const parsedTarget = parseFloat(targetValue) || 0;

      anime({
        targets: obj,
        val: parsedTarget,
        round: 1,
        duration: duration,
        easing: 'easeOutExpo',
        update: function () {
          element.textContent = obj.val;
        }
      });
    },

    /**
     * 9. Drawer Lateral Móvil — Cascada elástica en ítems del menú
     */
    staggerDrawerNav: function (navSelector = '.main-nav') {
      if (!this.isReady()) return;

      const nav = document.querySelector(navSelector);
      if (!nav) return;

      const items = nav.querySelectorAll('ul > li');
      if (!items.length) return;

      anime.remove(items);
      anime.set(items, { opacity: 0, translateX: 30 });

      anime({
        targets: items,
        opacity: [0, 1],
        translateX: [30, 0],
        duration: 450,
        delay: anime.stagger(45, { start: 80 }),
        easing: 'easeOutCubic'
      });
    },

    /**
     * 10. Top 10 — Entrada destacada con badges 3D y ranking
     */
    animateTop10: function (containerSelector = '#top10Grid') {
      if (!this.isReady()) return;

      const container = document.querySelector(containerSelector);
      if (!container) return;

      const cards = container.querySelectorAll('.product-card');
      if (!cards.length) return;

      anime.remove(cards);
      anime.set(cards, { opacity: 0, translateY: 45, scale: 0.92 });

      anime({
        targets: cards,
        opacity: [0, 1],
        translateY: [45, 0],
        scale: [0.92, 1],
        duration: 750,
        delay: anime.stagger(60, { start: 100 }),
        easing: 'easeOutCubic',
        complete: () => {
          cards.forEach(c => {
            c.style.transform = '';
            c.style.opacity = '';
          });
        }
      });

      // Animación en 3D sobre los badges de ranking #1, #2, #3
      const badges = container.querySelectorAll('.product-rank-badge');
      if (badges.length) {
        anime.remove(badges);
        anime.set(badges, { scale: 0, rotateY: -120 });
        anime({
          targets: badges,
          scale: [0, 1.25, 1],
          rotateY: [-120, 0],
          duration: 650,
          delay: anime.stagger(60, { start: 240 }),
          easing: 'easeOutBack'
        });
      }

      this.bindCardHover(containerSelector);
    },

    /**
     * 11. Envases — Stagger de presentaciones
     */
    animateEnvases: function (containerSelector = '#productGrid') {
      this.staggerCards(containerSelector, '.product-card:not(.product-card-placeholder)');
    },

    /**
     * 12. Scroll Reveals — Observador de intersección para secciones generales
     */
    initScrollReveals: function () {
      if (typeof IntersectionObserver === 'undefined') return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            observer.unobserve(el);

            if (el.classList.contains('nos-info-block') || el.classList.contains('nos-stat') || el.classList.contains('feature-card')) {
              anime({
                targets: el,
                opacity: [0, 1],
                translateY: [35, 0],
                duration: 650,
                easing: 'easeOutCubic'
              });
            }
          }
        });
      }, { threshold: 0.12 });

      document.querySelectorAll('.nos-info-block, .nos-mvv, .nos-stat, .feature-card').forEach(el => {
        observer.observe(el);
      });
    },

    /**
     * 13. Botón Flotante de WhatsApp con Ondas Expansivas (Ripples)
     */
    initWhatsAppGlow: function () {
      if (!this.isReady()) return;

      // Inyectar contenedor y botón si no existe
      let wrapper = document.querySelector('.whatsapp-flotante-wrapper');
      if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.className = 'whatsapp-flotante-wrapper';
        wrapper.innerHTML = `
          <div class="whatsapp-ripple-ring ring-1"></div>
          <div class="whatsapp-ripple-ring ring-2"></div>
          <a class="btn-whatsapp-flotante" href="https://wa.me/3046477694?text=%C2%A1Hola%21%20%F0%9F%91%8B%20Vi%20su%20cat%C3%A1logo%20en%20la%20web%20y%20me%20gustar%C3%ADa%20recibir%20m%C3%A1s%20informaci%C3%B3n%20sobre%20sus%20perfumes.%20%E2%9C%A8" target="_blank" rel="noopener noreferrer" aria-label="Contactar por WhatsApp">
            <i class="fab fa-whatsapp"></i>
          </a>
        `;
        document.body.appendChild(wrapper);
      }

      // Animación continua de ondas expansivas
      const rings = wrapper.querySelectorAll('.whatsapp-ripple-ring');
      if (rings.length) {
        anime({
          targets: rings,
          scale: [1, 2.3],
          opacity: [0.75, 0],
          duration: 2200,
          delay: anime.stagger(950),
          loop: true,
          easing: 'easeOutSine'
        });
      }

      // Respiración sutil del botón
      const btn = wrapper.querySelector('.btn-whatsapp-flotante');
      if (btn) {
        anime({
          targets: btn,
          translateY: [-3, 3],
          duration: 2000,
          loop: true,
          direction: 'alternate',
          easing: 'easeInOutSine'
        });
      }

      // Pulso sutil en el botón comprar del header
      const buyBtn = document.querySelector('.header-buy-btn');
      if (buyBtn) {
        anime({
          targets: buyBtn,
          boxShadow: [
            { value: '0 4px 15px rgba(212, 175, 55, 0.25)', duration: 0 },
            { value: '0 4px 28px rgba(212, 175, 55, 0.7)', duration: 1800, easing: 'easeInOutSine' },
            { value: '0 4px 15px rgba(212, 175, 55, 0.25)', duration: 1800, easing: 'easeInOutSine' }
          ],
          scale: [
            { value: 1, duration: 0 },
            { value: 1.04, duration: 1800, easing: 'easeInOutSine' },
            { value: 1, duration: 1800, easing: 'easeInOutSine' }
          ],
          loop: true
        });
      }
    },

    /**
     * 14. Transición y Morphing en Toggle de Tema (Sol ↔ Luna)
     */
    animateThemeToggle: function (btnElement, isModoClaro) {
      if (!btnElement) return;

      if (!this.isReady()) {
        btnElement.innerHTML = isModoClaro ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
        return;
      }

      anime.remove(btnElement);
      anime({
        targets: btnElement,
        rotate: isModoClaro ? [0, 360] : [360, 0],
        scale: [
          { value: 0.5, duration: 150, easing: 'easeInQuad' },
          { value: 1.25, duration: 180, easing: 'easeOutQuad' },
          { value: 1, duration: 170, easing: 'easeOutElastic(1, .6)' }
        ],
        complete: function () {
          btnElement.style.transform = 'none';
        }
      });

      setTimeout(() => {
        btnElement.innerHTML = isModoClaro ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
      }, 150);
    },

    /**
     * 15. Skeleton Loader Animado con efecto Shimmer
     */
    renderSkeletons: function (containerSelector, count = 4) {
      const container = typeof containerSelector === 'string' ? document.querySelector(containerSelector) : containerSelector;
      if (!container) return;

      let html = '';
      for (let i = 0; i < count; i++) {
        html += `
          <div class="skeleton-card skeleton-shimmer">
            <div class="skeleton-img"></div>
            <div class="skeleton-text skeleton-text--title"></div>
            <div class="skeleton-text skeleton-text--subtitle"></div>
            <div class="skeleton-text skeleton-text--price"></div>
            <div class="skeleton-btn"></div>
          </div>
        `;
      }
      container.innerHTML = html;
    }
  };

  // Exponer globalmente
  window.ADAnimations = ADAnimations;

  // Auto-iniciar al cargar el DOM
  document.addEventListener('DOMContentLoaded', function () {
    ADAnimations.initHero();
    ADAnimations.initScrollReveals();
    ADAnimations.initWhatsAppGlow();
  });

})(window, document);
