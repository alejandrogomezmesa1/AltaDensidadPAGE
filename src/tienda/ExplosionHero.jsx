import { forwardRef, useImperativeHandle, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { useTienda } from './TiendaContext';

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

const ExplosionHero = forwardRef(function ExplosionHero({ envolturaRef, heroRef, onEstadoAnimacion }, ref) {
  const { P } = useTienda();
  const [animando, setAnimando] = useState(false);
  const destelloRef = useRef(null);
  const ondaRef = useRef(null);
  const ondaSecundariaRef = useRef(null);
  const gotasRefs = useRef([]);

  // Tomamos hasta 20 referencias disponibles del catálogo para una nube rica y equilibrada
  const referencias = (P && P.length > 0) ? P.slice(0, 20) : [];

  const dispararExplosion = useCallback(() => {
    if (animando) return;
    const elFrasco = envolturaRef?.current;
    const heroEl = heroRef?.current;
    if (!elFrasco || !heroEl) {
      const coleccion = document.getElementById('coleccion');
      if (coleccion) coleccion.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    setAnimando(true);
    if (onEstadoAnimacion) onEstadoAnimacion(true);
    elFrasco.dataset.animando = 'true';
    elFrasco.style.transform = 'translate3d(0, 0, 0)';
    heroEl.classList.add('en-explosion');

    const tl = gsap.timeline({
      onComplete: () => {
        // Restaurar estado base para permitir volver a interactuar
        delete elFrasco.dataset.animando;
        gsap.set(elFrasco, { clearProps: 'all' });
        const heroTexto = heroEl.querySelector('.hero-t');
        if (heroTexto) gsap.set(heroTexto, { clearProps: 'all' });
        heroEl.classList.remove('en-explosion');
        setAnimando(false);
        if (onEstadoAnimacion) onEstadoAnimacion(false);
      }
    });

    const heroTexto = heroEl.querySelector('.hero-t');
    const gotas = gotasRefs.current.filter(Boolean);

    // Dimensiones y centros
    const frascoRect = elFrasco.getBoundingClientRect();
    const heroRect = heroEl.getBoundingClientRect();

    // Centro inicial del frasco dentro del sistema de coordenadas de heroEl
    const frascoCentroX = frascoRect.left + frascoRect.width / 2 - heroRect.left;
    const frascoCentroY = frascoRect.top + frascoRect.height / 2 - heroRect.top;

    // Centro absoluto de toda la sección Hero
    const heroCentroX = heroRect.width / 2;
    const heroCentroY = heroRect.height / 2;

    // Vector de traslación para centrar el envase en la sección completa
    const deltaX = heroCentroX - frascoCentroX;
    const deltaY = heroCentroY - frascoCentroY;

    // Escala dinámica para que el envase domine la sección
    const esMovil = window.innerWidth <= 820;
    const escalaExpansion = esMovil ? 2.4 : 3.0;

    // Colocar todas las gotas en el centro proyectado de la explosión
    gsap.set(gotas, {
      x: heroCentroX,
      y: heroCentroY,
      xPercent: -50,
      yPercent: -50,
      scale: 0.05,
      autoAlpha: 0
    });

    // ==============================================================
    // FASE 1.1: El envase se amplía de ocupar su espacio a tomar la sección completa
    // ==============================================================
    // Atenuación suave del texto del hero para dar todo el protagonismo al envase
    if (heroTexto) {
      tl.to(heroTexto, {
        autoAlpha: 0.08,
        y: -30,
        scale: 0.96,
        filter: 'blur(6px)',
        duration: 0.95,
        ease: 'power2.out'
      }, 0);
    }

    // El envase se traslada al centro y se expande majestuosamente
    tl.to(elFrasco, {
      x: deltaX,
      y: deltaY,
      scale: escalaExpansion,
      filter: 'drop-shadow(0 0 65px rgba(212, 175, 55, 1)) brightness(1.2)',
      duration: 1.25,
      ease: 'power3.inOut'
    }, 0);

    // Destello de energía que empieza a concentrarse en el centro del envase
    tl.fromTo(destelloRef.current,
      { autoAlpha: 0, scale: 0.2, x: heroCentroX, y: heroCentroY },
      { autoAlpha: 0.95, scale: 2.2, duration: 0.8, ease: 'power2.in' },
      0.45
    );

    // Micro-vibración previa al estallido (acumulación de presión de alta densidad)
    tl.to(elFrasco, {
      x: `${deltaX + 3}px`,
      duration: 0.04,
      repeat: 6,
      yoyo: true,
      ease: 'none'
    }, 1.05);

    // ==============================================================
    // FASE 1.2: El envase EXPLOTA
    // ==============================================================
    // Estallido visual del frasco
    tl.to(elFrasco, {
      scale: escalaExpansion * 1.45,
      autoAlpha: 0,
      filter: 'blur(45px) brightness(3)',
      duration: 0.35,
      ease: 'power4.out'
    }, 1.3);

    // Gran destello cegador de luz dorada
    tl.to(destelloRef.current, {
      autoAlpha: 0,
      scale: 6,
      duration: 0.65,
      ease: 'power3.out'
    }, 1.3);

    // Onda de choque principal
    tl.fromTo(ondaRef.current,
      { autoAlpha: 1, scale: 0.15, x: heroCentroX, y: heroCentroY },
      { autoAlpha: 0, scale: 6.8, duration: 1.1, ease: 'power3.out' },
      1.32
    );

    // Segunda onda de choque sutil
    if (ondaSecundariaRef.current) {
      tl.fromTo(ondaSecundariaRef.current,
        { autoAlpha: 0.8, scale: 0.1, x: heroCentroX, y: heroCentroY },
        { autoAlpha: 0, scale: 4.8, duration: 0.85, ease: 'power2.out' },
        1.4
      );
    }

    // ==============================================================
    // FASE 1.3: Cada gota sale disparada como una referencia 1:1
    // ==============================================================
    gotas.forEach((gota, idx) => {
      const total = gotas.length;
      // Distribución angular completa de 360 grados
      const anguloBase = (idx / total) * 2 * Math.PI;
      const variacionAngulo = ((idx % 3) - 1) * 0.12;
      const angulo = anguloBase + variacionAngulo;

      // Dos anillos concéntricos de dispersión para evitar sobreposición
      const radioBase = (idx % 2 === 0) ? (esMovil ? 140 : 260) : (esMovil ? 210 : 390);
      const variacionRadio = ((idx % 5) * 15) - 30;
      const distancia = Math.max(120, radioBase + variacionRadio);

      const targetX = heroCentroX + Math.cos(angulo) * distancia;
      const targetY = heroCentroY + Math.sin(angulo) * (distancia * 0.75);

      // 1. Expulsión explosiva hacia afuera
      tl.to(gota, {
        x: targetX,
        y: targetY,
        scale: 1,
        autoAlpha: 1,
        rotation: (Math.random() - 0.5) * 24,
        duration: 0.9,
        ease: 'power3.out'
      }, 1.3 + (idx % 5) * 0.02);

      // Flotación suspendida en el aire (hover escénico)
      tl.to(gota, {
        y: targetY + (Math.sin(idx) * 8),
        duration: 0.85,
        ease: 'sine.inOut'
      }, 2.2);

      // 2. Descenso parabólico fluido abriendo paso al catálogo
      tl.to(gota, {
        y: targetY + (esMovil ? 140 : 220),
        autoAlpha: 0,
        scale: 0.45,
        duration: 0.95,
        ease: 'power2.in'
      }, 3.05 + (idx % 4) * 0.04);
    });

    // ==============================================================
    // FASE 1.4: Abrir paso a la sección de perfumes (scroll suave)
    // ==============================================================
    tl.add(() => {
      const coleccion = document.getElementById('coleccion');
      if (coleccion) {
        coleccion.scrollIntoView({ behavior: 'smooth' });
        // Revelado escalonado (stagger) de los perfumes 1.1 en la colección
        setTimeout(() => {
          gsap.fromTo('.card',
            { opacity: 0, y: 45, scale: 0.95 },
            { opacity: 1, y: 0, scale: 1, stagger: 0.045, duration: 0.65, ease: 'power2.out', clearProps: 'all' }
          );
        }, 320);
      }
    }, 3.25);

  }, [animando, envolturaRef, heroRef, onEstadoAnimacion, referencias]);

  useImperativeHandle(ref, () => ({
    disparar: dispararExplosion,
    animando
  }), [dispararExplosion, animando]);

  // Permitir al usuario saltar directamente a un perfume haciendo clic en una gota
  const seleccionarPerfume = (id) => {
    const el = document.getElementById(`p-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      gsap.fromTo(el, { scale: 1.05, filter: 'brightness(1.3)' }, { scale: 1, filter: 'none', duration: 0.8 });
    }
  };

  return (
    <div className={`explosion-overlay ${animando ? 'activo' : ''}`} aria-hidden={!animando}>
      {/* Destello central de energía */}
      <div className="destello-explosivo" ref={destelloRef} />
      
      {/* Ondas de choque expansivas */}
      <div className="onda-choque" ref={ondaRef} />
      <div className="onda-choque onda-choque--secundaria" ref={ondaSecundariaRef} />

      {/* Gotas de las referencias disponibles 1:1 */}
      {referencias.map((p, idx) => (
        <div
          key={p.id}
          className="gota-referencia"
          ref={(el) => { gotasRefs.current[idx] = el; }}
          onClick={() => seleccionarPerfume(p.id)}
          title={`Ver referencia: ${p.n}`}
        >
          <div className="gota-visual">
            <GotaIcono />
            {p.img && (
              <div className="gota-thumb-wrap">
                <img src={p.img} alt={p.n} className="gota-thumb-img" loading="lazy" />
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
