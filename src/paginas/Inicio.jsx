import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { useTienda } from '../tienda/TiendaContext';
import { Coleccion, Ranking, Envases, Kits } from '../tienda/Secciones';
import { usePagina, JsonLd } from '../lib/hooks';
import { etiquetaColeccion, pr, urlAbsoluta } from '../lib/producto';
import { SITIO } from '../config';
import ExplosionHero from '../tienda/ExplosionHero';

gsap.registerPlugin(useGSAP);

// Una vuelta del "puntero virtual" alrededor del frasco y un ciclo de flotación, en segundos
const VUELTA_S = 9;
const FLOTE_S = 4.5;
const GIRO_MAX = 6; // grados de inclinación máxima (puntero en el borde del escenario)

// Frasco del hero flotando: se inclina como si un puntero le diera vueltas. El giro y la flotación
// viven en un elemento interno para no competir con la explosión, que anima la envoltura.
function HeroImagen({ envolturaRef, onDisparar }) {
  const floteRef = useRef(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const el = floteRef.current;
      gsap.set(el, { transformPerspective: 800 });
      const girarY = gsap.quickSetter(el, 'rotationY', 'deg');
      const girarX = gsap.quickSetter(el, 'rotationX', 'deg');
      const puntero = { angulo: 0 };
      const giro = gsap.to(puntero, {
        angulo: 2 * Math.PI, duration: VUELTA_S, ease: 'none', repeat: -1,
        onUpdate: () => { girarY(GIRO_MAX * Math.cos(puntero.angulo)); girarX(-GIRO_MAX * Math.sin(puntero.angulo)); }
      });
      const vaiven = gsap.fromTo(el, { y: -4 }, { y: -12, duration: FLOTE_S / 2, ease: 'sine.inOut', yoyo: true, repeat: -1 });

      // Fuera de pantalla no se gasta ni un fotograma
      const obs = new IntersectionObserver(([e]) => [giro, vaiven].forEach((a) => (e.isIntersecting ? a.resume() : a.pause())));
      obs.observe(el);
      return () => obs.disconnect();
    });
  }, { scope: floteRef });

  return (
    <div className="stage" aria-label="Frasco insignia de Alta Densidad Fragancias" onClick={onDisparar} title="Haz clic para liberar la esencia">
      <div className="hero-image-wrap" ref={envolturaRef}>
        <div className="hero-flote" ref={floteRef}>
          <img src="/assets/img/hero-alta-densidad.jpg" alt="Frasco insignia de Alta Densidad Fragancias — Extrait de Parfum y Feromonas"
            className="hero-signature-img hero-signature-img--dark" width="600" height="600" loading="eager" fetchPriority="high" />
          <img src="/assets/img/hero-alta-densidad-light.jpg" alt="Frasco insignia de Alta Densidad Fragancias — Modo Claro"
            className="hero-signature-img hero-signature-img--light" width="600" height="600" loading="eager" fetchPriority="high" />
        </div>
      </div>
    </div>
  );
}

export default function Inicio() {
  const { P } = useTienda();
  const heroRef = useRef(null);
  const envolturaRef = useRef(null);
  const explosionRef = useRef(null);

  const disparar = () => {
    explosionRef.current?.disparar();
  };

  usePagina({
    titulo: 'Fragancias de Alta Densidad | Extrait de Parfum & Perfumería de Autor en Medellín',
    descripcion: 'Exclusiva concentración Extrait de Parfum con base de feromonas. Alta perfumería inspirada en fragancias nicho con más de doce horas de fijación en Medellín, Colombia.',
    ogTitulo: 'Fragancias de Alta Densidad | Puro Extrait de Parfum',
    ogDescripcion: 'Exclusivamente en concentración Extrait de Parfum con feromonas. Estela superior a doce horas en piel a una fracción del costo del perfume comercial.'
  });

  // Datos estructurados del catálogo completo para buscadores
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Catálogo de Fragancias de Alta Densidad',
    numberOfItems: P.length,
    itemListElement: P.map((p, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'Product',
        name: p.n,
        image: urlAbsoluta(p.img, SITIO),
        description: p.desc || `Perfume ${p.n} en concentración pura Extrait de Parfum y fijación prolongada.`,
        category: etiquetaColeccion(p.c),
        brand: { '@type': 'Brand', name: 'Alta Densidad' },
        offers: { '@type': 'Offer', priceCurrency: 'COP', price: pr(p), availability: 'https://schema.org/InStock', url: SITIO + '/' }
      }
    }))
  };

  return (
    <>
      <JsonLd datos={schema} />

      <section className="hero" ref={heroRef}>
        <div className="hero-t">
          <span className="up eyebrow">Medellín · Perfumería de autor</span>
          <h1 className="disp">Pura intensidad.<br /><em>Extrait de Parfum.</em></h1>
          <p className="mute">Exclusivamente en concentración Extrait de Parfum con feromonas. Una fijación superior que dura más de doce horas en piel, a una fracción del costo del perfume comercial.</p>
          <div>
            <a className="btn up" href="#coleccion" onClick={(e) => { e.preventDefault(); disparar(); }}>Explorar colección</a>
            <button type="button" className="hero-hint-burst" onClick={disparar}>
              <i className="fas fa-sparkles" aria-hidden="true" /> Toca para liberar la esencia
            </button>
          </div>
        </div>
        <HeroImagen envolturaRef={envolturaRef} onDisparar={disparar} />
        <ExplosionHero ref={explosionRef} envolturaRef={envolturaRef} heroRef={heroRef} />
      </section>

      <Coleccion />

      <section className="sec sec--alt" id="top">
        <div className="wrap">
          <div className="sec-h rv in">
            <h2>Top 10<br />más pedidos</h2>
            <p className="mute" style={{ maxWidth: '32ch' }}>Las diez fragancias que más se llevan nuestros clientes este mes.</p>
          </div>
          <Ranking />
        </div>
      </section>

      <section className="sec" id="envases">
        <div className="wrap">
          <div className="sec-h rv in">
            <h2>Envases</h2>
            <p className="mute" style={{ maxWidth: '44ch' }}>Colección exclusiva de frascos en cristal tallado para vestir tu fragancia de alta densidad.</p>
          </div>
          <Envases />
        </div>
      </section>

      <section className="sec sec--alt" id="kits" aria-label="Kits especiales de fragancias">
        <div className="wrap">
          <div className="sec-h rv in">
            <div>
              <span className="up eyebrow">Sets Exclusivos</span>
              <h2>Kits de Fragancias</h2>
              <p className="mute" style={{ maxWidth: '48ch', marginTop: 'var(--sp-1)' }}>Selecciones premium diseñadas para regalar o coleccionar con estuche de lujo y combinaciones selectas.</p>
            </div>
          </div>
          <Kits />
        </div>
      </section>

      <section className="sec" id="nosotros">
        <div className="wrap split">
          <div className="rv in">
            <span className="up eyebrow">Nosotros</span>
            <h2 className="disp" style={{ fontSize: 'var(--fs-5)', marginTop: 'var(--sp-3)' }}>Inspirados en los nichos. Concentrados para durar.</h2>
            <p>Somos una casa de perfumería de Medellín. Interpretamos el espíritu de las grandes fragancias de nicho y de diseñador con una concentración superior, para quienes entienden el aroma como la primera forma de presencia.</p>
            <div className="stats up">
              <div><b>Extrait</b>de Parfum</div>
              <div><b>12h+</b>Fijación</div>
              <div><b>+</b>Feromonas</div>
            </div>
          </div>
          <div className="rv in" style={{ alignSelf: 'center' }}>
            <div className="pill">
              <h3 className="up">Concentración</h3>
              <p className="mute" style={{ margin: 0 }}>Exclusiva formulación en Extrait de Parfum. Menos alcohol, máxima pureza y fijación.</p>
            </div>
            <div className="pill">
              <h3 className="up">Feromonas</h3>
              <p className="mute" style={{ margin: 0 }}>Una base pensada para acompañar la piel y dejar estela en cada encuentro.</p>
            </div>
            <div className="pill">
              <h3 className="up">Accesibilidad</h3>
              <p className="mute" style={{ margin: 0 }}>El lujo de un aroma de autor, sin el precio de la etiqueta comercial.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
