import { forwardRef, useImperativeHandle, useRef } from 'react';
import { gsap, ScrollTrigger, SplitText, useGSAP, MQ, desplazarA } from '../lib/gsap';

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
      if (!animar) return undefined;
      const particulas = particulasRef.current.filter(Boolean).slice(0, movil ? PARTICULAS_MOVIL : PARTICULAS);
      const detonador = hero.querySelector('.hero-detonador-scroll');
      const textoHero = hero.querySelector('.hero-t-in');
      const foto = hero.querySelector('.hero-parallax');
      const narrador = hero.querySelector('.actos');
      const actos = gsap.utils.toArray('.acto', hero);
      const ruta = hero.querySelector(movil ? '.ruta--h' : '.ruta--v');
      const alturaCabecera = () => document.querySelector('header')?.offsetHeight || 0;
      const r = gsap.utils.random;
      const subida = movil ? 0.6 : 0.75;

      // Guion de la escena (en unidades de la línea de tiempo). Cada acto ocupa un tramo largo y
      // casi todo es "sostén": las transiciones son breves para que cada nota se lea con calma.
      //   prólogo 0–0.3 · I 0.3–1.3 · II 1.3–2.3 · III 2.3–3.3 · epílogo 3.3–3.6
      const TRAMOS = [[0.3, 1.1], [1.3, 2.1], [2.3, 3.2]]; // [entra, sale]
      const IDS = ['salida', 'corazon', 'fondo'];
      const FIN = 3.6;

      // Escena fijada: el hero queda quieto bajo la cabecera y el scroll la recorre (≈ una pantalla
      // por acto). Al soltar el scroll se asienta en el acto más cercano; sin inercia, para que un
      // gesto rápido no se salte actos. Solo se animan hijos del hero, nunca el elemento fijado.
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: hero,
          start: () => `top ${alturaCabecera()}`,
          end: movil ? '+=320%' : '+=400%',
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          snap: { snapTo: 'labelsDirectional', duration: { min: 0.4, max: 1 }, delay: 0.15, ease: 'power2.inOut', inertia: false }
        }
      });
      tl.addLabel('inicio', 0);

      // Toda la escena: la foto baja dentro de su marco (parallax)
      if (foto) tl.fromTo(foto, { scale: 1.18, yPercent: 0 }, { yPercent: 8, duration: FIN }, 0);

      // Prólogo: el detonador y el texto del hero ceden el sitio al narrador
      if (detonador) tl.to(detonador, { autoAlpha: 0, y: 16, duration: 0.15, ease: 'power2.in' }, 0);
      if (textoHero) tl.to(textoHero, { autoAlpha: 0, y: -30, duration: 0.25, ease: 'power2.in' }, 0.05);
      if (narrador) tl.fromTo(narrador, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15 }, 0.2);

      // Actos: nota (título) y línea superior entran; el subtítulo se escribe letra a letra
      // (SplitText, máscara por palabra); luego el texto. Al salir, todo sube y se desvanece.
      actos.forEach((acto, i) => {
        const [entra, sale] = TRAMOS[i];
        const [nota, titulo, sub, texto] = acto.children;
        const letras = SplitText.create(sub, { type: 'words,chars', mask: 'words', charsClass: 'letra' }).chars;
        tl.fromTo([nota, titulo], { autoAlpha: 0, y: 34 }, { autoAlpha: 1, y: 0, duration: 0.2, stagger: 0.05, ease: 'power3.out' }, entra)
          .set(sub, { autoAlpha: 1 }, entra)
          .fromTo(letras, { yPercent: 110, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.12, stagger: 0.012, ease: 'power3.out' }, entra + 0.12)
          .fromTo(texto, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.15, ease: 'power2.out' }, entra + 0.3)
          .addLabel(IDS[i], (entra + 0.45 + sale) / 2);
        if (i < actos.length - 1) {
          tl.to([nota, titulo, sub, texto], { autoAlpha: 0, y: -24, duration: 0.15, stagger: 0.03, ease: 'power2.in' }, sale);
        }
      });

      // Recorrido: el camino se dibuja (DrawSVG) y un punto viaja por él (MotionPath) al pasar
      // de un acto a otro; la estación del acto en curso se agranda y su etiqueta se enciende
      let quitarClics;
      if (ruta) {
        const trazo = ruta.querySelector('.ruta-trazo');
        const viajero = ruta.querySelector('.ruta-viajero');
        const puntos = ruta.querySelectorAll('.ruta-punto');
        const etiquetas = ruta.querySelectorAll('.ruta-estacion');
        const camino = { path: trazo, align: trazo, alignOrigin: [0.5, 0.5] };
        // Tramos del viaje (inicio y fin en la línea de tiempo, y fracción del camino): el primero
        // pinta su estado inicial al crearse (camino sin dibujar, punto en la estación I)
        [[TRAMOS[0][1], TRAMOS[1][0], 0, 0.5], [TRAMOS[1][1], TRAMOS[2][0], 0.5, 1]].forEach(([desde, hasta, a, b], k) => {
          const duration = hasta + 0.1 - desde;
          tl.fromTo(trazo, { drawSVG: `0% ${a * 100}%` }, { drawSVG: `0% ${b * 100}%`, duration, ease: 'power2.inOut', immediateRender: k === 0 }, desde)
            .fromTo(viajero, { motionPath: { ...camino, start: a, end: a } },
              { motionPath: { ...camino, start: a, end: b }, duration, ease: 'power2.inOut', immediateRender: k === 0 }, desde);
        });
        TRAMOS.forEach(([entra, sale], i) => {
          tl.fromTo(puntos[i], { attr: { r: 3.5 } }, { attr: { r: 6 }, duration: 0.15, ease: 'back.out(3)' }, entra)
            .fromTo(etiquetas[i], { opacity: 0.35 }, { opacity: 1, duration: 0.15 }, entra);
          if (i < TRAMOS.length - 1) {
            tl.to(puntos[i], { attr: { r: 3.5 }, duration: 0.15 }, sale)
              .to(etiquetas[i], { opacity: 0.35, duration: 0.15 }, sale);
          }
        });

        // Cada estación lleva a su acto
        const irAlActo = (e) => {
          const id = e.currentTarget.dataset.acto;
          desplazarA(tl.scrollTrigger.labelToScroll(id), { duration: 1.2, ease: 'power2.inOut', cabecera: false });
        };
        etiquetas.forEach((b) => b.addEventListener('click', irAlActo));
        quitarClics = () => etiquetas.forEach((b) => b.removeEventListener('click', irAlActo));
      }

      // El frasco respira con cada acto y el halo cambia: luz clara (salida), pleno (corazón)
      // y un ámbar bajo que se asienta hacia la base (fondo)
      tl.to(envoltura, { scale: movil ? 1.02 : 1.03, duration: 0.8, ease: 'sine.inOut' }, 0.3)
        .to(envoltura, { scale: movil ? 1.035 : 1.055, duration: 0.6, ease: 'sine.inOut' }, 1.3)
        .fromTo(haloRef.current,
          { x: () => g.cx, y: () => g.cy + g.alto * 0.1, scale: 0.4, autoAlpha: 0 },
          { scale: 0.9, autoAlpha: 0.6, duration: 0.7, ease: 'sine.out' }, 0.3)
        .to(haloRef.current, { scale: 1.35, autoAlpha: 1, duration: 0.6, ease: 'sine.inOut' }, 1.3)
        .to(haloRef.current, { y: () => g.cy + g.alto * 0.45, scale: 1.6, autoAlpha: 0.75, duration: 0.6, ease: 'sine.inOut' }, 2.3);

      // Vapor por actos: cada partícula pertenece a uno (i % 3) y brota durante su tramo
      //   salida: destellos finos y rápidos que suben alto
      //   corazón: bruma cálida y densa, abierta a los lados
      //   fondo: bruma pesada que nace del cuerpo del frasco, sube poco y se queda
      particulas.forEach((p, i) => {
        const acto = i % 3;
        const bruma = i < BRUMA;
        const [entra, sale] = TRAMOS[acto];
        const inicio = r(entra + 0.1, sale - 0.35);
        const dur = acto === 0 ? r(0.3, 0.45) : r(0.45, 0.6);
        const escala = acto === 2 ? r(3, 6) : bruma ? r(3.5, 6.5) : r(0.5, 1.2);
        const origenX = r(-1, 1) * (acto === 1 ? 0.18 : 0.12);
        const origenY = acto === 2 ? r(0.2, 0.35) : r(-1, 1) * 0.06;
        const deltaX = acto === 2 ? r(-160, 160) : r(-120, 120);
        const deltaY = (acto === 0 ? r(170, 280) : acto === 1 ? r(110, 230) : r(30, 90)) * subida;
        const pico = acto === 2 ? 0.35 : bruma ? 0.45 : r(0.8, 1);

        tl.fromTo(p,
          { x: () => g.cx + origenX * g.ancho, y: () => g.cy + origenY * g.alto, scale: escala },
          { x: () => g.cx + origenX * g.ancho + deltaX, y: () => g.cy + origenY * g.alto - deltaY,
            scale: escala * (acto === 0 ? 0.4 : 1.7), ease: 'power1.out', duration: dur, immediateRender: true },
          inicio)
          .fromTo(p, { autoAlpha: 0 }, { autoAlpha: pico, duration: dur * 0.35, ease: 'sine.out' }, inicio)
          .to(p, { autoAlpha: 0, duration: dur * 0.5, ease: 'sine.in' }, inicio + dur * 0.5);
      });

      // Epílogo: el halo se disuelve, el frasco vuelve, el narrador se retira y regresa el hero
      tl.to(haloRef.current, { autoAlpha: 0, scale: 1.8, duration: 0.3, ease: 'power2.in' }, 3.25)
        .to(envoltura, { scale: 1, duration: 0.3, ease: 'sine.inOut' }, 3.25);
      if (narrador) tl.to(narrador, { autoAlpha: 0, y: -20, duration: 0.2, ease: 'power2.in' }, 3.3);
      if (textoHero) tl.to(textoHero, { autoAlpha: 1, y: 0, duration: 0.25, ease: 'power2.out' }, 3.35);
      if (detonador) tl.to(detonador, { autoAlpha: 1, y: 0, duration: 0.2 }, 3.4);
      tl.addLabel('fin', FIN);

      return () => quitarClics?.();
    });

    return () => { ScrollTrigger.removeEventListener('refreshInit', medir); mm.revert(); };
  }, { scope: raizRef });

  // Disparo manual compatible (ej. links o botones auxiliares)
  const disparar = () => {
    desplazarA('#catalogo', { duration: 1.3, ease: 'power2.inOut' });
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
