import { forwardRef, useImperativeHandle, useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP, MQ, desplazarA } from '../lib/gsap';

// Partículas de vapor: las primeras son bruma (grandes, tenues), el resto destellos finos
const PARTICULAS = 60;
const PARTICULAS_MOVIL = 30;
const BRUMA = 12;

// "Liberar la esencia": escena fijada y guiada por el scroll en tres actos (pirámide olfativa).
// Mientras un narrador cuenta la salida, el corazón y el fondo, del frasco sube un vapor dorado
// distinto en cada acto y la foto se desliza dentro de su marco.
const EsenciaHero = forwardRef(function EsenciaHero(_props, ref) {
  const raizRef = useRef(null);
  const haloRef = useRef(null);
  const particulasRef = useRef([]);

  useGSAP(() => {
    // El hero es el padre de este componente: React le asigna su ref DESPUÉS de correr los efectos
    // de los hijos, así que heroRef aún es null aquí. Se llega a él desde el propio elemento.
    const hero = raizRef.current?.closest('.hero');
    const envoltura = hero?.querySelector('.hero-image-wrap');
    const marco = hero?.querySelector('.hero-marco');
    if (!hero || !envoltura || !marco) return undefined;

    // Geometría del frasco relativa al hero, leída del layout (offsetTop/Width), no del
    // getBoundingClientRect: así no la deforman el giro, la flotación ni la escala en curso
    const g = { cx: 0, cy: 0, ancho: 0, alto: 0 };
    const medir = () => {
      let x = 0; let y = 0;
      for (let el = marco; el && el !== hero; el = el.offsetParent) { x += el.offsetLeft; y += el.offsetTop; }
      g.ancho = marco.offsetWidth;
      g.alto = marco.offsetHeight;
      g.cx = x + g.ancho / 2;
      g.cy = y + g.alto * 0.2; // corona / atomizador (con la foto centrada y ampliada 1.18)
    };
    medir();
    ScrollTrigger.addEventListener('refreshInit', medir);

    const mm = gsap.matchMedia();
    mm.add({ animar: MQ.animar, movil: MQ.movil }, ({ conditions: { animar, movil } }) => {
      if (!animar) return;
      const particulas = particulasRef.current.filter(Boolean).slice(0, movil ? PARTICULAS_MOVIL : PARTICULAS);
      const detonador = hero.querySelector('.hero-detonador-scroll');
      const textoHero = hero.querySelector('.hero-t-in');
      const foto = hero.querySelector('.hero-parallax');
      const actos = gsap.utils.toArray('.acto', hero);
      const narrador = hero.querySelector('.actos');
      const barra = hero.querySelector('.actos-barra');
      const numeros = gsap.utils.toArray('.actos-num', hero);
      const alturaCabecera = () => document.querySelector('header')?.offsetHeight || 0;
      const r = gsap.utils.random;
      const subida = movil ? 0.6 : 0.75;

      // Escena fijada en tres actos, como la pirámide olfativa: salida, corazón y fondo.
      // El hero queda quieto bajo la cabecera y el scroll hace avanzar la escena; al soltar el
      // scroll se asienta en el acto más cercano (snap a etiquetas) para poder apreciarlo.
      // Solo se animan hijos del hero, nunca el elemento fijado.
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: hero,
          start: () => `top ${alturaCabecera()}`,
          end: movil ? '+=180%' : '+=250%',
          pin: true,
          scrub: 1.2,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          snap: { snapTo: 'labelsDirectional', duration: { min: 0.5, max: 1.2 }, delay: 0.2, ease: 'power2.inOut', inertia: false }
        }
      });
      tl.addLabel('inicio', 0);

      // Toda la escena: la foto baja dentro de su marco (parallax)
      if (foto) tl.fromTo(foto, { scale: 1.18, yPercent: 0 }, { yPercent: 8, duration: 3 }, 0);

      // Prólogo: el detonador y el texto del hero ceden el sitio al narrador
      if (detonador) tl.to(detonador, { autoAlpha: 0, y: 16, duration: 0.15, ease: 'power2.in' }, 0);
      if (textoHero) tl.to(textoHero, { autoAlpha: 0, y: -30, duration: 0.3, ease: 'power2.in' }, 0.05);
      if (narrador) tl.fromTo(narrador, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }, 0.25);
      if (barra) tl.fromTo(barra, { scaleX: 0 }, { scaleX: 1, duration: 2.4 }, 0.3);

      // Cada acto entra, se sostiene (ahí se asienta el snap) y sale; su numeral se enciende
      const tramos = [[0.3, 1.05], [1.25, 2.0], [2.2, 2.75]];
      const nombres = ['salida', 'corazon', 'fondo'];
      actos.forEach((acto, i) => {
        const [entra, sale] = tramos[i];
        const partes = acto.children;
        tl.fromTo(partes, { autoAlpha: 0, y: 34 }, { autoAlpha: 1, y: 0, duration: 0.25, stagger: 0.05, ease: 'power3.out' }, entra)
          .addLabel(nombres[i], (entra + sale) / 2 + 0.12);
        if (numeros[i]) tl.fromTo(numeros[i], { opacity: 0.3 }, { opacity: 1, duration: 0.15 }, entra);
        if (i < actos.length - 1) {
          tl.to(partes, { autoAlpha: 0, y: -24, duration: 0.2, stagger: 0.03, ease: 'power2.in' }, sale);
          if (numeros[i]) tl.to(numeros[i], { opacity: 0.3, duration: 0.15 }, sale);
        }
      });

      // El frasco respira con cada acto y el halo cambia: luz clara (salida), pleno (corazón)
      // y un ámbar bajo que se asienta hacia la base (fondo)
      tl.to(envoltura, { scale: movil ? 1.02 : 1.03, duration: 0.8, ease: 'sine.inOut' }, 0.2)
        .to(envoltura, { scale: movil ? 1.035 : 1.055, duration: 0.6, ease: 'sine.inOut' }, 1.2)
        .fromTo(haloRef.current,
          { x: () => g.cx, y: () => g.cy + g.alto * 0.1, scale: 0.4, autoAlpha: 0 },
          { scale: 0.9, autoAlpha: 0.6, duration: 0.7, ease: 'sine.out' }, 0.2)
        .to(haloRef.current, { scale: 1.35, autoAlpha: 1, duration: 0.6, ease: 'sine.inOut' }, 1.2)
        .to(haloRef.current, { y: () => g.cy + g.alto * 0.45, scale: 1.6, autoAlpha: 0.75, duration: 0.5, ease: 'sine.inOut' }, 2.1);

      // Vapor por actos: cada partícula pertenece a uno (i % 3)
      //   salida: destellos finos y rápidos que suben alto
      //   corazón: bruma cálida y densa, abierta a los lados
      //   fondo: bruma pesada que nace del cuerpo del frasco, sube poco y se queda
      particulas.forEach((p, i) => {
        const acto = i % 3;
        const bruma = i < BRUMA;
        const [desde, hasta] = [[0.3, 0.85], [1.25, 1.75], [2.2, 2.45]][acto];
        const inicio = r(desde, hasta);
        const dur = acto === 0 ? r(0.35, 0.5) : r(0.5, 0.7);
        const escala = acto === 2 ? r(3, 6) : bruma ? r(3.5, 6.5) : r(0.5, 1.2);
        const origenX = r(-1, 1) * (acto === 1 ? 0.18 : 0.12);
        const origenY = acto === 2 ? r(0.2, 0.35) : r(-1, 1) * 0.06;
        const deltaX = acto === 2 ? r(-160, 160) : r(-120, 120);
        const deltaY = (acto === 0 ? r(170, 280) : acto === 1 ? r(110, 230) : r(30, 90)) * subida;
        const pico = acto === 2 ? 0.3 : bruma ? 0.4 : r(0.8, 1);

        tl.fromTo(p,
          { x: () => g.cx + origenX * g.ancho, y: () => g.cy + origenY * g.alto, scale: escala },
          { x: () => g.cx + origenX * g.ancho + deltaX, y: () => g.cy + origenY * g.alto - deltaY,
            scale: escala * (acto === 0 ? 0.4 : 1.7), ease: 'power1.out', duration: dur, immediateRender: true },
          inicio)
          .fromTo(p, { autoAlpha: 0 }, { autoAlpha: pico, duration: dur * 0.35, ease: 'sine.out' }, inicio)
          .to(p, { autoAlpha: 0, duration: dur * 0.5, ease: 'sine.in' }, inicio + dur * 0.5);
      });

      // Epílogo: el halo se disuelve, el frasco vuelve, el narrador se retira y regresa el hero
      tl.to(haloRef.current, { autoAlpha: 0, scale: 1.8, duration: 0.3, ease: 'power2.in' }, 2.7)
        .to(envoltura, { scale: 1, duration: 0.3, ease: 'sine.inOut' }, 2.7);
      if (narrador) tl.to(narrador, { autoAlpha: 0, y: -20, duration: 0.2, ease: 'power2.in' }, 2.75);
      if (textoHero) tl.to(textoHero, { autoAlpha: 1, y: 0, duration: 0.25, ease: 'power2.out' }, 2.75);
      if (detonador) tl.to(detonador, { autoAlpha: 1, y: 0, duration: 0.2 }, 2.8);
      tl.addLabel('fin', 3);
    });

    return () => { ScrollTrigger.removeEventListener('refreshInit', medir); mm.revert(); };
  }, { scope: raizRef });

  // Disparo manual compatible (ej. links o botones auxiliares)
  const disparar = () => {
    desplazarA('#coleccion', { duration: 1.3, ease: 'power2.inOut' });
  };

  useImperativeHandle(ref, () => ({ disparar }), []);

  return (
    <div className="esencia" aria-hidden="true" ref={raizRef}>
      <div className="esencia-halo" ref={haloRef} />
      {Array.from({ length: PARTICULAS }, (_, i) => (
        <span
          key={i}
          className={`esencia-particula${i < BRUMA ? ' esencia-particula--bruma' : ''}`}
          ref={(el) => { particulasRef.current[i] = el; }}
        />
      ))}
    </div>
  );
});

export default EsenciaHero;
