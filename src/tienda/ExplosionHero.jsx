import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { gsap, useGSAP, MQ, desplazarA } from '../lib/gsap';
import { useTienda } from './TiendaContext';
import { noDisponible } from '../lib/producto';

// SVG de la gota dorada de perfume puro de feromonas
function GotaIcono() {
  return (
    <svg viewBox="0 0 32 44" className="gota-svg" aria-hidden="true">
      <defs>
        <radialGradient id="goldDropGrad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fff8e7" />
          <stop offset="35%" stopColor="#f3c242" />
          <stop offset="70%" stopColor="#c59218" />
          <stop offset="100%" stopColor="#7a5502" />
        </radialGradient>
      </defs>
      <path
        d="M16 2 C16 2, 2 22, 2 30 C2 37.7, 8.3 44, 16 44 C23.7 44, 30 37.7, 30 30 C30 22, 16 2, 16 2 Z"
        fill="url(#goldDropGrad)"
      />
    </svg>
  );
}

// Explosión del frasco del hero en gotas de referencias (GSAP): una sola línea de tiempo con
// etiquetas por fase, animaciones dentro de contextSafe para que se reviertan al desmontar.
const ExplosionHero = forwardRef(function ExplosionHero({ envolturaRef, heroRef }, ref) {
  const { P, abrirDetalle } = useTienda();
  const [animando, setAnimando] = useState(false);
  const raizRef = useRef(null);
  const destelloRef = useRef(null);
  const ondaRef = useRef(null);
  const ondaSecundariaRef = useRef(null);
  const gotasRefs = useRef([]);
  const tlRef = useRef(null);

  // Hasta 20 referencias que se pueden comprar ahora mismo
  const referencias = useMemo(() => P.filter((p) => !noDisponible(p)).slice(0, 20), [P]);

  const { contextSafe } = useGSAP({ scope: raizRef });

  const disparar = contextSafe(() => {
    // progress() y no isActive(): una línea recién creada aún no está "activa" hasta el siguiente tick
    if (tlRef.current && tlRef.current.progress() < 1) return;
    const frasco = envolturaRef?.current;
    const hero = heroRef?.current;
    if (!frasco || !hero || window.matchMedia(MQ.reducir).matches) { desplazarA('#coleccion'); return; }

    const texto = hero.querySelector('.hero-t');
    const movil = window.matchMedia(MQ.movil).matches;
    // En móvil caben menos etiquetas sin solaparse
    const todas = gotasRefs.current.filter(Boolean);
    const gotas = movil ? todas.slice(0, 12) : todas;
    const tarjetas = gsap.utils.toArray('#coleccion .grid .card');

    // Lecturas de geometría primero, escrituras después
    // El frasco visible (con flotación y parallax aplicados) no coincide con el centro de la
    // envoltura: se escala desde el centro visible y se traslada ese mismo punto
    const rEnvoltura = frasco.getBoundingClientRect();
    const rFrasco = (frasco.querySelector('.hero-flote') || frasco).getBoundingClientRect();
    const rHero = hero.getBoundingClientRect();
    const origen = `${rFrasco.left + rFrasco.width / 2 - rEnvoltura.left}px ${rFrasco.top + rFrasco.height / 2 - rEnvoltura.top}px`;
    // Centro de la parte visible del hero (bajo la cabecera): en móvil el botón queda abajo y el
    // hero suele estar desplazado, así la explosión ocurre donde el usuario está mirando
    const techo = Math.max(rHero.top, document.querySelector('header')?.getBoundingClientRect().bottom || 0);
    const piso = Math.min(rHero.bottom, window.innerHeight);
    const cx = rHero.width / 2;
    const cy = (piso > techo ? (techo + piso) / 2 : rHero.top + rHero.height / 2) - rHero.top;
    const altoVisible = piso > techo ? piso - techo : rHero.height;
    const dx = cx - (rFrasco.left + rFrasco.width / 2 - rHero.left);
    const dy = cy - (rFrasco.top + rFrasco.height / 2 - rHero.top);
    const escala = movil ? 2.4 : 3.0;

    // Destino de cada gota: dos anillos concéntricos (elipse achatada) para que no se solapen,
    // acotados al hero para que ninguna etiqueta quede cortada ni bajo la cabecera
    const limiteX = gsap.utils.clamp(0, Math.max(0, cx - (movil ? 100 : 110)));
    const limiteY = gsap.utils.clamp(0, Math.max(0, altoVisible / 2 - 45));
    const destinos = gotas.map((_, i) => {
      const angulo = (i / gotas.length) * 2 * Math.PI + ((i % 3) - 1) * 0.12;
      const radio = Math.max(120, ((i % 2 === 0) ? (movil ? 140 : 260) : (movil ? 210 : 390)) + (i % 5) * 15 - 30);
      const ox = Math.cos(angulo) * radio;
      const oy = Math.sin(angulo) * radio * 0.75;
      return { x: cx + Math.sign(ox) * limiteX(Math.abs(ox)), y: cy + Math.sign(oy) * limiteY(Math.abs(oy)) };
    });

    setAnimando(true);
    hero.classList.add('en-explosion');
    gsap.set(frasco, { transformOrigin: origen });
    gsap.set(todas, { x: cx, y: cy, xPercent: -50, yPercent: -50, scale: 0.05, autoAlpha: 0 });

    const restaurar = contextSafe(() => {
      gsap.set([texto, frasco], { clearProps: 'all' });
      hero.classList.remove('en-explosion');
      gsap.from(frasco, { autoAlpha: 0, scale: 0.92, duration: 0.8, ease: 'power2.out' });
      setAnimando(false);
    });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: restaurar });
    tlRef.current = tl;

    // Fase 1: el envase se traslada al centro y domina la sección; el texto se atenúa
    tl.addLabel('expansion', 0)
      .to(texto, { autoAlpha: 0.08, y: -30, scale: 0.96, filter: movil ? 'none' : 'blur(6px)', duration: 0.95, ease: 'power2.out' }, 'expansion')
      .to(frasco, {
        x: dx, y: dy, scale: escala,
        // El resplandor con drop-shadow es costoso de pintar: solo en escritorio
        filter: movil ? 'brightness(1.2)' : 'drop-shadow(0 0 65px rgba(212, 175, 55, 1)) brightness(1.2)',
        duration: 1.25, ease: 'power3.inOut'
      }, 'expansion')
      .fromTo(destelloRef.current, { autoAlpha: 0, scale: 0.2, x: cx, y: cy },
        { autoAlpha: 0.95, scale: 2.2, duration: 0.8, ease: 'power2.in' }, 'expansion+=0.45')
      // Micro-vibración: presión acumulada antes del estallido (repeat impar → vuelve a dx)
      .to(frasco, { x: dx + 3, duration: 0.04, repeat: 5, yoyo: true, ease: 'none' }, 'expansion+=1.05')

      // Fase 2: el envase estalla con destello y dos ondas de choque
      .addLabel('estallido', 1.3)
      .to(frasco, { scale: escala * 1.45, autoAlpha: 0, filter: 'blur(45px) brightness(3)', duration: 0.35, ease: 'power4.out' }, 'estallido')
      .to(destelloRef.current, { autoAlpha: 0, scale: 6, duration: 0.65 }, 'estallido')
      .fromTo(ondaRef.current, { autoAlpha: 1, scale: 0.15, x: cx, y: cy },
        { autoAlpha: 0, scale: 6.8, duration: 1.1 }, 'estallido+=0.02')
      .fromTo(ondaSecundariaRef.current, { autoAlpha: 0.8, scale: 0.1, x: cx, y: cy },
        { autoAlpha: 0, scale: 4.8, duration: 0.85, ease: 'power2.out' }, 'estallido+=0.1')

      // Fase 3: cada gota sale disparada, flota y cae abriendo paso al catálogo
      .to(gotas, {
        x: (i) => destinos[i].x, y: (i) => destinos[i].y,
        scale: movil ? 0.85 : 1, autoAlpha: 1, rotation: 'random(-12, 12)',
        duration: 0.9, stagger: { amount: 0.08, from: 'random' }
      }, 'estallido')
      .to(gotas, { y: (i) => destinos[i].y + Math.sin(i) * 8, duration: 0.85, ease: 'sine.inOut' }, 'estallido+=0.9')
      .addLabel('salida', 3.05)
      .to(gotas, {
        y: (i) => destinos[i].y + (movil ? 140 : 220), autoAlpha: 0, scale: 0.45,
        duration: 0.95, ease: 'power2.in', stagger: { amount: 0.12, from: 'random' }
      }, 'salida')

      // Fase 4: desplazamiento a la colección (ScrollToPlugin, dentro de la línea de tiempo)
      // y revelado escalonado de sus tarjetas
      .add(desplazarA('#coleccion', { duration: 1.2 }), 'salida+=0.2');
    if (tarjetas.length) {
      tl.fromTo(tarjetas, { autoAlpha: 0, y: 45, scale: 0.95 }, {
        autoAlpha: 1, y: 0, scale: 1, duration: 0.65, ease: 'power2.out',
        stagger: 0.045, clearProps: 'opacity,visibility,transform', immediateRender: false
      }, 'salida+=0.52');
    }
  });

  useImperativeHandle(ref, () => ({ disparar }), [disparar]);

  return (
    <div className={`explosion-overlay ${animando ? 'activo' : ''}`} aria-hidden={!animando} ref={raizRef}>
      <div className="destello-explosivo" ref={destelloRef} />
      <div className="onda-choque" ref={ondaRef} />
      <div className="onda-choque onda-choque--secundaria" ref={ondaSecundariaRef} />

      {/* Una gota por referencia: al tocarla abre su ficha */}
      {referencias.map((p, idx) => (
        <div
          key={p.id}
          className="gota-referencia"
          ref={(el) => { gotasRefs.current[idx] = el; }}
          onClick={() => abrirDetalle(p.id)}
          title={`Ver referencia: ${p.n}`}
        >
          <div className="gota-visual">
            <GotaIcono />
            {p.img && (
              <div className="gota-thumb-wrap">
                <img src={p.img} alt="" className="gota-thumb-img" loading="lazy" />
              </div>
            )}
          </div>
          <div className="gota-etiqueta">
            <span className="gota-nombre">{p.n}</span>
            {p.b && <small className="gota-marca">{p.b}</small>}
          </div>
        </div>
      ))}
    </div>
  );
});

export default ExplosionHero;
