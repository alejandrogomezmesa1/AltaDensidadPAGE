/**
 * animations.js — Fragancias de Alta Densidad
 * Gestor centralizado de animaciones con Anime.js (v3.2.2)
 * Diseñado con estética Dark Luxury: suavidad, stagger elegante y microinteracciones elásticas.
 */

(function (window, document) {
  'use strict';

  const ADAnimations = {
    // Detectar si el usuario prefiere reducir movimiento por accesibilidad
    prefersReducedMotion: function () {
      return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },

    // Validar disponibilidad de anime.js
    isReady: function () {
      return typeof window.anime === 'function';
    },

    /**
     * 1. Hero & Banners — Revelación suave de títulos y subtítulos
     */
    initHero: function (selector = '.collection-banner, .nos-hero-content') {
      if (!this.isReady() || this.prefersReducedMotion()) return;

      const container = document.querySelector(selector);
      if (!container) return;

      const elements = container.querySelectorAll('h1, h2, p, .hero-eyebrow, .nos-eyebrow, .nos-stats');
      if (!elements.length) return;

      anime.set(elements, { opacity: 0, translateY: 24 });

      anime({
        targets: elements,
        opacity: [0, 1],
        translateY: [24, 0],
        duration: 800,
        delay: anime.stagger(120, { start: 150 }),
        easing: 'easeOutCubic'
      });
    },

    /**
     * 2. Catálogo de Perfumes y Kits — Entrada escalonada (Stagger)
     */
    staggerCards: function (containerSelector = '#productGrid', cardSelector = '.product-card:not(.product-card-placeholder)') {
      if (!this.isReady()) return;

      const container = typeof containerSelector === 'string' ? document.querySelector(containerSelector) : containerSelector;
      if (!container) return;

      const cards = container.querySelectorAll(cardSelector);
      if (!cards.length) return;

      if (this.prefersReducedMotion()) {
        cards.forEach(c => {
          c.style.opacity = '1';
          c.style.transform = 'none';
        });
        return;
      }

      anime.set(cards, { opacity: 0, translateY: 30, scale: 0.95 });

      anime({
        targets: cards,
        opacity: [0, 1],
        translateY: [30, 0],
        scale: [0.95, 1],
        duration: 650,
        delay: anime.stagger(45, { start: 60 }),
        easing: 'easeOutCubic'
      });
    },

    /**
     * 3. Carrito — Rebote elástico del badge al agregar productos
     */
    bumpCartBadge: function (badgeSelector = '#carritoBadge') {
      if (!this.isReady() || this.prefersReducedMotion()) return;

      const badge = document.querySelector(badgeSelector);
      if (!badge) return;

      anime.remove(badge);
      anime({
        targets: badge,
        scale: [
          { value: 1.45, duration: 200, easing: 'easeOutQuad' },
          { value: 0.92, duration: 150, easing: 'easeInQuad' },
          { value: 1.15, duration: 120, easing: 'easeOutQuad' },
          { value: 1, duration: 180, easing: 'easeOutElastic(1, .6)' }
        ]
      });

      // Pulso sutil en el botón del carrito
      const btn = document.querySelector('#btnCarrito');
      if (btn) {
        anime({
          targets: btn,
          rotate: [-8, 8, -4, 4, 0],
          duration: 450,
          easing: 'easeInOutSine'
        });
      }
    },

    /**
     * 4. Modal de Producto / Envío — Zoom & Fade in
     */
    animateModalOpen: function (modalSelector, contentSelector) {
      if (!this.isReady()) return;

      const modal = typeof modalSelector === 'string' ? document.querySelector(modalSelector) : modalSelector;
      if (!modal) return;

      const content = contentSelector ? modal.querySelector(contentSelector) : modal.querySelector('.modal-content, .shipping-modal-content');

      if (this.prefersReducedMotion() || !content) return;

      anime.remove([modal, content]);

      anime({
        targets: modal,
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuad'
      });

      anime({
        targets: content,
        opacity: [0, 1],
        translateY: [40, 0],
        scale: [0.92, 1],
        duration: 450,
        easing: 'easeOutBack'
      });
    },

    /**
     * 5. Modal de Producto / Envío — Cierre suave con callback
     */
    animateModalClose: function (modalSelector, contentSelector, onComplete) {
      if (!this.isReady() || this.prefersReducedMotion()) {
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
        translateY: [0, 25],
        scale: [1, 0.94],
        duration: 250,
        easing: 'easeInQuad'
      });

      anime({
        targets: modal,
        opacity: [1, 0],
        duration: 250,
        easing: 'easeInQuad',
        complete: function () {
          if (typeof onComplete === 'function') onComplete();
        }
      });
    },

    /**
     * 6. Contadores Numéricos (utilizado en Nosotros: 99%, 1 día, 2028)
     */
    animateCounter: function (element, targetValue, duration = 1800) {
      if (!this.isReady()) {
        element.textContent = targetValue;
        return;
      }

      const obj = { val: 0 };
      const parsedTarget = parseFloat(targetValue) || 0;

      if (this.prefersReducedMotion()) {
        element.textContent = targetValue;
        return;
      }

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
     * 7. Drawer Lateral Móvil / Tablet — Cascada elegante en ítems del menú
     */
    staggerDrawerNav: function (navSelector = '.main-nav') {
      if (!this.isReady() || this.prefersReducedMotion()) return;

      const nav = document.querySelector(navSelector);
      if (!nav) return;

      const items = nav.querySelectorAll('ul > li');
      if (!items.length) return;

      anime.remove(items);
      anime.set(items, { opacity: 0, translateX: 25 });

      anime({
        targets: items,
        opacity: [0, 1],
        translateX: [25, 0],
        duration: 400,
        delay: anime.stagger(40, { start: 100 }),
        easing: 'easeOutCubic'
      });
    },

    /**
     * 8. Top 10 — Entrada destacada con badges de ranking
     */
    animateTop10: function (containerSelector = '#top10Grid') {
      if (!this.isReady()) return;

      const container = document.querySelector(containerSelector);
      if (!container) return;

      const cards = container.querySelectorAll('.product-card');
      if (!cards.length) return;

      if (this.prefersReducedMotion()) return;

      anime.set(cards, { opacity: 0, translateY: 35, scale: 0.94 });

      anime({
        targets: cards,
        opacity: [0, 1],
        translateY: [35, 0],
        scale: [0.94, 1],
        duration: 700,
        delay: anime.stagger(60, { start: 100 }),
        easing: 'easeOutCubic'
      });

      // Animación especial sobre los badges #1, #2, etc.
      const badges = container.querySelectorAll('.product-rank-badge');
      if (badges.length) {
        anime.set(badges, { scale: 0, rotate: -20 });
        anime({
          targets: badges,
          scale: [0, 1],
          rotate: [-20, 0],
          duration: 500,
          delay: anime.stagger(60, { start: 250 }),
          easing: 'easeOutBack'
        });
      }
    },

    /**
     * 9. Envases — Stagger de presentaciones
     */
    animateEnvases: function (containerSelector = '#productGrid') {
      this.staggerCards(containerSelector, '.product-card:not(.product-card-placeholder)');
    },

    /**
     * 10. Scroll Reveals — Observador de intersección para secciones generales
     */
    initScrollReveals: function () {
      if (typeof IntersectionObserver === 'undefined') return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            observer.unobserve(el);

            if (el.classList.contains('nos-info-block') || el.classList.contains('nos-stat')) {
              anime({
                targets: el,
                opacity: [0, 1],
                translateY: [25, 0],
                duration: 600,
                easing: 'easeOutCubic'
              });
            }
          }
        });
      }, { threshold: 0.12 });

      document.querySelectorAll('.nos-info-block, .nos-mvv, .nos-stat').forEach(el => {
        observer.observe(el);
      });
    },

    /**
     * 11. Resplandor Shimmer & Pulso en Botones de WhatsApp y Comprar
     */
    initWhatsAppGlow: function () {
      if (!this.isReady() || this.prefersReducedMotion()) return;

      // Inyectar botón flotante de WhatsApp si no existe en la página
      if (!document.querySelector('.btn-whatsapp-flotante')) {
        const floatBtn = document.createElement('a');
        floatBtn.className = 'btn-whatsapp-flotante';
        floatBtn.href = 'https://wa.me/3046477694?text=%C2%A1Hola%21%20%F0%9F%91%8B%20Vi%20su%20cat%C3%A1logo%20en%20la%20web%20y%20me%20gustar%C3%ADa%20recibir%20m%C3%A1s%20informaci%C3%B3n%20sobre%20sus%20perfumes.%20%E2%9C%A8';
        floatBtn.target = '_blank';
        floatBtn.rel = 'noopener noreferrer';
        floatBtn.setAttribute('aria-label', 'Contactar por WhatsApp');
        floatBtn.innerHTML = '<i class="fab fa-whatsapp"></i>';
        document.body.appendChild(floatBtn);
      }

      const targets = document.querySelectorAll('.header-buy-btn, .btn-whatsapp-flotante');
      if (!targets.length) return;

      anime({
        targets: targets,
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
    },

    /**
     * 12. Transición y Morphing en Toggle de Tema (Sol ↔ Luna)
     */
    animateThemeToggle: function (btnElement, isModoClaro) {
      if (!btnElement) return;

      if (!this.isReady() || this.prefersReducedMotion()) {
        btnElement.innerHTML = isModoClaro
          ? '<i class="fas fa-moon"></i>'
          : '<i class="fas fa-sun"></i>';
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
        btnElement.innerHTML = isModoClaro
          ? '<i class="fas fa-moon"></i>'
          : '<i class="fas fa-sun"></i>';
      }, 150);
    },

    /**
     * 13. Skeleton Loader Animado con efecto Shimmer
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
