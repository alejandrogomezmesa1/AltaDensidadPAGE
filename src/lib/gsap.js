// GSAP de la tienda: plugins registrados una sola vez y consultas de medios compartidas
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { Observer } from 'gsap/Observer';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollToPlugin, SplitText, DrawSVGPlugin, MotionPathPlugin, Observer);

export const MQ = {
  movil: '(max-width: 820px)',
  escritorio: '(min-width: 821px)',
  animar: '(prefers-reduced-motion: no-preference)',
  reducir: '(prefers-reduced-motion: reduce)'
};

const alturaCabecera = () => document.querySelector('header')?.getBoundingClientRect().height || 0;

// Desplazamiento suave con ScrollToPlugin. El scroll-behavior: smooth del CSS se apaga mientras
// GSAP mueve el scroll: si no, el navegador suavizaría cada fotograma y el recorrido daría tirones.
// autoKill: si el usuario desplaza a mano, el recorrido se detiene y le devuelve el control.
// destino: selector, elemento o posición en px (con cabecera: false no se descuenta la cabecera).
// alTerminar: se llama al acabar o interrumpirse el recorrido.
export function desplazarA(destino, { duration = 1.1, ease = 'power3.inOut', cabecera = true, alTerminar } = {}) {
  const html = document.documentElement;
  // Con scroll suave (Lenis) el recorrido lo hace Lenis, para que no compitan dos animaciones
  const suave = typeof window !== 'undefined' && window.__scrollSuave;
  if (suave && !window.matchMedia(MQ.reducir).matches) {
    const curva = gsap.parseEase(ease);
    // Posición exacta: con un elemento, Lenis sumaría además el scroll-margin del CSS
    let y = destino;
    if (typeof destino !== 'number') {
      const el = typeof destino === 'string' ? document.querySelector(destino) : destino;
      if (!el) return gsap.delayedCall(0, () => alTerminar?.());
      y = el.getBoundingClientRect().top + window.scrollY - (cabecera ? alturaCabecera() : 0);
    }
    suave.resize(); // medidas de la página actual (pudo cambiar de ruta hace un instante)
    suave.scrollTo(Math.max(0, y), { duration, easing: (t) => curva(t), force: true, onComplete: () => alTerminar?.() });
    return gsap.delayedCall(duration, () => {});
  }
  const soltar = () => { html.style.scrollBehavior = ''; alTerminar?.(); };
  // Con movimiento reducido, salto directo (ScrollToPlugin con duración 0 no desplaza)
  if (window.matchMedia(MQ.reducir).matches) {
    if (typeof destino === 'number') { window.scrollTo({ top: destino, behavior: 'instant' }); return gsap.delayedCall(0, () => alTerminar?.()); }
    const el = typeof destino === 'string' ? document.querySelector(destino) : destino;
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - alturaCabecera(), behavior: 'instant' });
    return gsap.delayedCall(0, () => alTerminar?.());
  }
  return gsap.to(window, {
    scrollTo: { y: destino, offsetY: cabecera ? alturaCabecera : 0, autoKill: true },
    duration,
    ease,
    onStart: () => { html.style.scrollBehavior = 'auto'; },
    onComplete: soltar,
    onInterrupt: soltar
  });
}

export { gsap, ScrollTrigger, SplitText, Observer, useGSAP };
