// Efectos de scroll de la página de inicio (GSAP ScrollTrigger + SplitText).
// Todo vive dentro de gsap.matchMedia(): con movimiento reducido nada se oculta ni se mueve,
// y al cambiar de breakpoint o desmontar se revierte solo (useGSAP).
import { gsap, ScrollTrigger, SplitText, useGSAP, MQ } from '../lib/gsap';

// Titular en líneas enmascaradas que suben desde su propia máscara
function lineasEnmascaradas(el, vars) {
  return SplitText.create(el, {
    type: 'lines', mask: 'lines', linesClass: 'linea', autoSplit: true,
    onSplit: (self) => gsap.from(self.lines, { yPercent: 115, duration: 1.1, ease: 'power4.out', stagger: 0.12, ...vars })
  });
}

// Hero: entrada al cargar. El parallax de la foto y el vapor viven en la escena fijada de EsenciaHero
export function useHeroScroll(heroRef) {
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MQ.animar, () => {
      const q = gsap.utils.selector(heroRef);

      // Entrada: titular por líneas, luego el resto del texto; el frasco aparece sin prisa
      lineasEnmascaradas(q('h1'), { delay: 0.15 });
      gsap.from(q('.hero-t-in > :not(h1)'), { autoAlpha: 0, y: 24, duration: 0.9, ease: 'power3.out', stagger: 0.1, delay: 0.45 });
      gsap.from(q('.hero-flote'), { autoAlpha: 0, scale: 0.96, duration: 1.6, ease: 'power2.out' });
    });
    return () => mm.revert();
  });
}

// Secciones: titulares, listas por lotes, parallax de columnas y contador. Se rehace cuando
// cambian los datos (catálogo, top 10, envases o kits) porque cambian los elementos.
export function useSeccionesScroll(raizRef, datos) {
  useGSAP(() => {
    const q = gsap.utils.selector(raizRef);

    // Barra de progreso de lectura: retroalimentación directa del scroll, también con movimiento reducido
    const barra = q('.progreso-scroll')[0];
    if (barra) gsap.fromTo(barra, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

    const mm = gsap.matchMedia();
    mm.add({ escritorio: MQ.escritorio, animar: MQ.animar }, ({ conditions: { escritorio, animar } }) => {
      if (!animar) return;

      // Titulares de sección
      q('.sec-h h2, #nosotros h2.disp').forEach((h) => {
        lineasEnmascaradas(h, { duration: 1, stagger: 0.1, scrollTrigger: { trigger: h, start: 'clamp(top 88%)', once: true } });
      });

      // Listas: entran por lotes con escalonado, una sola vez. La transition de CSS (.rv, hover de
      // .kit-card) se apaga mientras GSAP anima, o retrasaría cada fotograma; al terminar se devuelve.
      ['.sec-h p', '.rank .row', '.sizes .size', '.kits-grid .kit-card', '#nosotros .stats > div', '#nosotros .pill'].forEach((sel) => {
        const els = q(sel).filter((el) => !el.closest('#coleccion'));
        if (!els.length) return;
        gsap.set(els, { autoAlpha: 0, y: 40, transition: 'none' });
        ScrollTrigger.batch(els, {
          start: 'clamp(top 92%)',
          once: true,
          onEnter: (lote) => gsap.to(lote, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08, overwrite: true, clearProps: 'transform,transition' })
        });
      });

      // Nosotros: las dos columnas se desplazan a distinta velocidad
      if (escritorio) {
        const [izq, der] = q('#nosotros .split > *');
        const scrollTrigger = { trigger: q('#nosotros')[0], start: 'top bottom', end: 'bottom top', scrub: 0.8 };
        if (izq) gsap.fromTo(izq, { yPercent: 6 }, { yPercent: -6, ease: 'none', scrollTrigger });
        if (der) gsap.fromTo(der, { yPercent: -4 }, { yPercent: 8, ease: 'none', scrollTrigger: { ...scrollTrigger } });
      }

      // Contador de fijación: 0h+ → 12h+
      const fijacion = q('#nosotros .stats b').find((b) => /^\d+h\+$/.test(b.textContent));
      if (fijacion) {
        const final = parseInt(fijacion.textContent, 10);
        const n = { v: 0 };
        fijacion.textContent = '0h+';
        gsap.to(n, {
          v: final, duration: 1.6, ease: 'power2.out', snap: { v: 1 },
          onUpdate: () => { fijacion.textContent = `${n.v}h+`; },
          scrollTrigger: { trigger: fijacion, start: 'clamp(top 92%)', once: true }
        });
        return () => { fijacion.textContent = `${final}h+`; };
      }
      return undefined;
    });

    // Si la altura de la página cambia (filtros, paginación, imágenes) las posiciones se recalculan
    let pendiente;
    const ro = new ResizeObserver(() => {
      pendiente?.kill();
      pendiente = gsap.delayedCall(0.6, () => ScrollTrigger.refresh());
    });
    ro.observe(document.body);
    return () => { ro.disconnect(); pendiente?.kill(); mm.revert(); };
  }, { dependencies: datos, scope: raizRef, revertOnUpdate: true });
}
