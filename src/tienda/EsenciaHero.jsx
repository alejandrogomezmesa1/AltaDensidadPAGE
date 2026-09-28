import { forwardRef, useImperativeHandle, useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP, MQ, desplazarA } from '../lib/gsap';

// Partículas de vapor: las primeras son bruma (grandes, tenues), el resto destellos finos
const PARTICULAS = 44;
const PARTICULAS_MOVIL = 24;
const BRUMA = 10;

// "Liberar la esencia": Inicializada con el scroll mediante ScrollTrigger (scrub fluido).
// El frasco se expande suavemente, un halo cálido se enciende detrás de él y de la corona
// sube una bruma de vapor dorado con destellos etéreos que flotan y se disuelven hacia la colección.
const EsenciaHero = forwardRef(function EsenciaHero({ envolturaRef, heroRef }, ref) {
  const raizRef = useRef(null);
  const haloRef = useRef(null);
  const particulasRef = useRef([]);

  useGSAP(() => {
    const hero = heroRef?.current;
    const envoltura = envolturaRef?.current;
    if (!hero || !envoltura) return;

    const mm = gsap.matchMedia();
    mm.add(MQ.animar, () => {
      const movil = window.matchMedia(MQ.movil).matches;
      const particulas = particulasRef.current.filter(Boolean).slice(0, movil ? PARTICULAS_MOVIL : PARTICULAS);
      const detonador = hero.querySelector('.hero-detonador-scroll');
      const textoHero = hero.querySelector('.hero-t-in');
      const r = gsap.utils.random;

      // Geometría del frasco: el vapor y el halo brotan de la corona / atomizador
      const rMarco = (envoltura.querySelector('.hero-marco') || envoltura).getBoundingClientRect();
      const rHero = hero.getBoundingClientRect();
      const cx = rMarco.left + rMarco.width / 2 - rHero.left;
      const cy = rMarco.top + rMarco.height * 0.22 - rHero.top;
      const ancho = rMarco.width;
      const alto = rMarco.height;
      const subida = movil ? 0.85 : 1.25;

      // Línea de tiempo gobernada por el desplazamiento del hero
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.7,
          invalidateOnRefresh: true
        }
      });

      // 0 · El detonador de scroll se disuelve al iniciar el movimiento
      if (detonador) {
        tl.to(detonador, { autoAlpha: 0, y: 16, duration: 0.2, ease: 'power2.in' }, 0);
      }

      // Parallax sutil del bloque de texto
      if (textoHero) {
        tl.to(textoHero, { y: -45, autoAlpha: 0.15, duration: 0.75, ease: 'none' }, 0.08);
      }

      // 1 · El frasco se expande con presencia majestuosa y el halo dorado se ilumina
      tl.to(envoltura, { scale: movil ? 1.05 : 1.1, y: -12, duration: 0.65, ease: 'power2.out' }, 0.05)
        .fromTo(haloRef.current,
          { x: cx, y: cy + alto * 0.1, scale: 0.4, autoAlpha: 0 },
          { scale: 1.35, autoAlpha: 1, duration: 0.6, ease: 'power2.out' },
          0.05
        );

      // 2 · Partículas de bruma y vapor que brotan y se dispersan hacia arriba
      particulas.forEach((p, i) => {
        const bruma = i < BRUMA;
        const escala = bruma ? r(3.5, 6.5) : r(0.5, 1.2);
        const inicio = r(0.1, 0.45);
        const dur = r(0.45, 0.65);
        const deltaX = r(-85, 85);
        const deltaY = r(160, 320) * subida;

        gsap.set(p, {
          x: cx + r(-ancho, ancho) * 0.14,
          y: cy + r(-alto, alto) * 0.06,
          scale: escala,
          autoAlpha: 0
        });

        tl.to(p, {
          x: `+=${deltaX}`,
          y: `-=${deltaY}`,
          scale: escala * (bruma ? 1.8 : 0.4),
          ease: 'power1.out',
          duration: dur
        }, inicio)
        .to(p, {
          autoAlpha: bruma ? 0.4 : r(0.8, 1),
          duration: dur * 0.35,
          ease: 'sine.out'
        }, inicio)
        .to(p, {
          autoAlpha: 0,
          duration: dur * 0.5,
          ease: 'sine.in'
        }, inicio + dur * 0.5);
      });

      // 3 · Difusión del halo y retorno al tamaño base al entrar en la colección
      tl.to(haloRef.current, { autoAlpha: 0, scale: 1.6, duration: 0.3, ease: 'power2.in' }, 0.68)
        .to(envoltura, { scale: 1, y: 0, duration: 0.35, ease: 'power2.in' }, 0.65);
    });

    return () => mm.revert();
  }, { scope: raizRef, dependencies: [heroRef, envolturaRef] });

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
