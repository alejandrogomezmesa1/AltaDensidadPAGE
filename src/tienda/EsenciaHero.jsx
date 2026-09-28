import { forwardRef, useImperativeHandle, useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP, MQ, desplazarA } from '../lib/gsap';

// Partículas de vapor: las primeras son bruma (grandes, tenues), el resto destellos finos
const PARTICULAS = 44;
const PARTICULAS_MOVIL = 24;
const BRUMA = 10;

// "Liberar la esencia": Inicializada con el scroll mediante ScrollTrigger (scrub fluido).
// El frasco se expande suavemente, un halo cálido se enciende detrás de él y de la corona
// sube una bruma de vapor dorado con destellos etéreos que flotan y se disuelven hacia la colección.
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
      const alturaCabecera = () => document.querySelector('header')?.offsetHeight || 0;
      const r = gsap.utils.random;
      const subida = movil ? 0.6 : 0.75;

      // Escena fijada: el hero queda quieto bajo la cabecera mientras el scroll hace avanzar el
      // vapor; sin pin, la tapa del frasco sale de pantalla antes de que el vapor se vea.
      // Se anima solo a los hijos del hero, nunca al elemento fijado.
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: hero,
          start: () => `top ${alturaCabecera()}`,
          end: movil ? '+=80%' : '+=110%',
          pin: true,
          scrub: 0.7,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      });

      // Parallax de la foto dentro de su marco durante toda la escena: va ampliada un 18 %
      // (9 % de margen por lado) y baja de centrada a +8 % de su alto
      if (foto) tl.fromTo(foto, { scale: 1.18, yPercent: 0 }, { yPercent: 8, duration: 1.03 }, 0);

      // 0 · El detonador de scroll se disuelve al iniciar el movimiento
      if (detonador) tl.to(detonador, { autoAlpha: 0, y: 16, duration: 0.2, ease: 'power2.in' }, 0);

      // El texto se retira un poco en escritorio; en móvil queda legible porque tras la escena
      // siguen el párrafo y los botones
      if (textoHero && !movil) tl.to(textoHero, { y: -45, autoAlpha: 0.15, duration: 0.75, ease: 'none' }, 0.08);

      // 1 · El frasco se expande con presencia y el halo dorado se ilumina tras la corona
      tl.to(envoltura, { scale: movil ? 1.03 : 1.05, duration: 0.65, ease: 'power2.out' }, 0.05)
        .fromTo(haloRef.current,
          { x: () => g.cx, y: () => g.cy + g.alto * 0.1, scale: 0.4, autoAlpha: 0 },
          { scale: 1.35, autoAlpha: 1, duration: 0.6, ease: 'power2.out' },
          0.05);

      // 2 · Partículas de bruma y vapor que brotan de la corona y se dispersan hacia arriba.
      // Valores en función: con invalidateOnRefresh se recalculan si cambia el tamaño.
      particulas.forEach((p, i) => {
        const bruma = i < BRUMA;
        const escala = bruma ? r(3.5, 6.5) : r(0.5, 1.2);
        const inicio = r(0.1, 0.45);
        const dur = r(0.45, 0.65);
        const origenX = r(-1, 1) * 0.14;
        const origenY = r(-1, 1) * 0.06;
        const deltaX = r(-120, 120);
        const deltaY = r(120, 260) * subida;

        tl.fromTo(p,
          { x: () => g.cx + origenX * g.ancho, y: () => g.cy + origenY * g.alto, scale: escala },
          { x: () => g.cx + origenX * g.ancho + deltaX, y: () => g.cy + origenY * g.alto - deltaY,
            scale: escala * (bruma ? 1.8 : 0.4), ease: 'power1.out', duration: dur, immediateRender: true },
          inicio)
          .fromTo(p, { autoAlpha: 0 }, { autoAlpha: bruma ? 0.4 : r(0.8, 1), duration: dur * 0.35, ease: 'sine.out' }, inicio)
          .to(p, { autoAlpha: 0, duration: dur * 0.5, ease: 'sine.in' }, inicio + dur * 0.5);
      });

      // 3 · Difusión del halo y retorno al tamaño base al entrar en la colección
      tl.to(haloRef.current, { autoAlpha: 0, scale: 1.6, duration: 0.3, ease: 'power2.in' }, 0.68)
        .to(envoltura, { scale: 1, duration: 0.35, ease: 'power2.in' }, 0.65);
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
