import { forwardRef, useImperativeHandle, useRef } from 'react';
import { gsap, useGSAP, MQ, desplazarA } from '../lib/gsap';

// Partículas de vapor: las primeras son bruma (grandes, tenues), el resto destellos finos
const PARTICULAS = 44;
const PARTICULAS_MOVIL = 26;
const BRUMA = 10;

// "Liberar la esencia": el frasco se queda en su sitio con un leve resplandor y de él sube un
// vapor dorado, como el perfume al evaporarse. Luego la página baja a la colección y sus tarjetas
// se descubren con una cortina. Solo transform, opacity y clip-path.
const EsenciaHero = forwardRef(function EsenciaHero({ envolturaRef, heroRef }, ref) {
  const raizRef = useRef(null);
  const haloRef = useRef(null);
  const particulasRef = useRef([]);
  const tlRef = useRef(null);

  const { contextSafe } = useGSAP({ scope: raizRef });

  const disparar = contextSafe(() => {
    // progress() y no isActive(): una línea recién creada aún no está "activa" hasta el siguiente tick
    if (tlRef.current && tlRef.current.progress() < 1) return;
    const envoltura = envolturaRef?.current;
    const hero = heroRef?.current;
    if (!envoltura || !hero || window.matchMedia(MQ.reducir).matches) { desplazarA('#coleccion'); return; }

    const movil = window.matchMedia(MQ.movil).matches;
    const particulas = particulasRef.current.filter(Boolean).slice(0, movil ? PARTICULAS_MOVIL : PARTICULAS);
    const tarjetas = gsap.utils.toArray('#coleccion .grid .card').slice(0, 12);
    const r = gsap.utils.random;

    // Lecturas de geometría primero: el vapor nace en la tapa del frasco (parte alta de la foto)
    const rMarco = (envoltura.querySelector('.hero-marco') || envoltura).getBoundingClientRect();
    const rHero = hero.getBoundingClientRect();
    const cx = rMarco.left + rMarco.width / 2 - rHero.left;
    const cy = rMarco.top + rMarco.height * 0.2 - rHero.top;
    const ancho = rMarco.width;
    const alto = rMarco.height;
    const subida = movil ? 0.7 : 1;

    const tl = gsap.timeline({
      defaults: { ease: 'sine.inOut' },
      onComplete: contextSafe(() => gsap.set(envoltura, { clearProps: 'scale' }))
    });
    tlRef.current = tl;

    // 1 · Resplandor: el frasco respira apenas y un halo cálido se enciende detrás del vapor
    tl.addLabel('brillo', 0)
      .to(envoltura, { scale: 1.025, duration: 1.4 }, 'brillo')
      .fromTo(haloRef.current, { x: cx, y: cy + alto * 0.15, scale: 0.5, autoAlpha: 0 },
        { scale: 1.15, autoAlpha: 1, duration: 1.4 }, 'brillo')
      .addLabel('vapor', 0.2);

    // 2 · Vapor: cada partícula sube con su propio ritmo y deriva, aparece y se disuelve
    particulas.forEach((p, i) => {
      const bruma = i < BRUMA;
      const escala = bruma ? r(4, 7) : r(0.45, 1.1);
      const dur = r(2.6, 3.8);
      const inicio = r(0, 0.9);
      gsap.set(p, { x: cx + r(-ancho, ancho) * 0.12, y: cy + r(-alto, alto) * 0.06, scale: escala, autoAlpha: 0 });
      tl.to(p, { y: `-=${r(110, 240) * subida}`, scale: escala * (bruma ? 1.6 : 0.6), duration: dur, ease: 'sine.out' }, `vapor+=${inicio}`)
        .to(p, { x: `+=${r(-70, 70)}`, duration: dur }, `vapor+=${inicio}`)
        .to(p, { autoAlpha: bruma ? 0.35 : r(0.75, 1), duration: dur * 0.3, ease: 'sine.out' }, `vapor+=${inicio}`)
        .to(p, { autoAlpha: 0, duration: dur * 0.5, ease: 'sine.in' }, `vapor+=${inicio + dur * 0.5}`);
    });

    // 3 · El resplandor se apaga y el frasco vuelve a su tamaño
    tl.to(haloRef.current, { autoAlpha: 0, scale: 1.4, duration: 1.8 }, 'vapor+=2')
      .to(envoltura, { scale: 1, duration: 1.4 }, 'vapor+=2')

      // 4 · Descenso a la colección; sus tarjetas se descubren con una cortina de abajo arriba
      .addLabel('salida', 'vapor+=2.5')
      .add(desplazarA('#coleccion', { duration: 1.4, ease: 'power2.inOut' }), 'salida');
    if (tarjetas.length) {
      tl.fromTo(tarjetas, { clipPath: 'inset(100% 0% 0% 0%)', y: 30, transition: 'none' }, {
        clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 1, ease: 'power3.out', stagger: 0.07,
        immediateRender: false, clearProps: 'clipPath,transform,transition'
      }, 'salida+=0.9');
    }
  });

  useImperativeHandle(ref, () => ({ disparar }), [disparar]);

  return (
    <div className="esencia" aria-hidden="true" ref={raizRef}>
      <div className="esencia-halo" ref={haloRef} />
      {Array.from({ length: PARTICULAS }, (_, i) => (
        <span key={i} className="esencia-particula" ref={(el) => { particulasRef.current[i] = el; }} />
      ))}
    </div>
  );
});

export default EsenciaHero;
