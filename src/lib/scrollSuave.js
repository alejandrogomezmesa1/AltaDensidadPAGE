// Scroll suave de la tienda (Lenis). Interpola el desplazamiento de la rueda y el trackpad, así
// todo lo que depende del scroll (escenas fijadas, parallax, palabras del manifiesto) se mueve
// fluido. En pantallas táctiles se respeta el scroll nativo con inercia (syncTouch: false), y con
// movimiento reducido no se activa. Va sincronizado con GSAP: un solo reloj (gsap.ticker) y
// ScrollTrigger se actualiza en cada fotograma de Lenis.
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { gsap, ScrollTrigger, MQ } from './gsap';

let lenis = null;
let tick = null;

// Zonas con scroll propio: la rueda las desplaza a ellas, no a la página
const CON_SCROLL_PROPIO = '[data-lenis-prevent], .modal, .drawer, .ia-chat-widget, .arm-fragancias, .acct-menu, .filter-sheet-body, .kit-sugerencias';

export function iniciarScrollSuave() {
  if (lenis || typeof window === 'undefined' || !window.matchMedia(MQ.animar).matches) return lenis;
  lenis = new Lenis({
    lerp: 0.11,
    wheelMultiplier: 1,
    smoothWheel: true,
    syncTouch: false,
    prevent: (nodo) => Boolean(nodo.closest && nodo.closest(CON_SCROLL_PROPIO))
  });
  lenis.on('scroll', ScrollTrigger.update);
  tick = (tiempo) => lenis.raf(tiempo * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  window.__scrollSuave = lenis; // desplazarA (lib/gsap.js) lo usa sin importar este módulo
  return lenis;
}

export function detenerScrollSuave() {
  if (!lenis) return;
  gsap.ticker.remove(tick);
  lenis.destroy();
  lenis = null;
  window.__scrollSuave = null;
  tick = null;
}

export const scrollSuave = () => lenis;

// Con una capa abierta (bolsa, ficha, filtros) la página de fondo no se desplaza
export function pausarScrollSuave(pausar) {
  if (!lenis) return;
  if (pausar) lenis.stop();
  else lenis.start();
}
