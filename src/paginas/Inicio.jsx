import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP, MQ, desplazarA } from '../lib/gsap';
import { useHeroScroll, useSeccionesScroll } from '../tienda/efectosScroll';
import { useTienda } from '../tienda/TiendaContext';
import { PortadaCatalogo } from '../tienda/Secciones';
import DesfileTop10 from '../tienda/DesfileTop10';
import { usePagina, JsonLd } from '../lib/hooks';
import { etiquetaColeccion, pr, urlAbsoluta } from '../lib/producto';
import { SITIO } from '../config';
import EsenciaHero from '../tienda/EsenciaHero';

// Los tres actos de la escena del hero: la pirámide olfativa contada mientras sube el vapor.
// El título es la nota (orienta); la frase es el subtítulo que se escribe letra a letra.
const ACTOS = [
  { n: 'I', id: 'salida', nota: 'salida', sub: 'El primer destello', texto: 'Luminosas y fugaces: la primera impresión, la que abre el camino.' },
  { n: 'II', id: 'corazon', nota: 'corazón', sub: 'La esencia se abre', texto: 'El carácter del perfume florece al contacto con la piel.' },
  { n: 'III', id: 'fondo', nota: 'fondo', sub: 'Lo que permanece', texto: 'Concentrado en Extrait de Parfum para acompañarte más de doce horas.' }
];

// Recorrido de la escena: un camino con una estación por acto. EsenciaHero lo dibuja (DrawSVG)
// y hace viajar un punto por él (MotionPath) con el scroll; cada estación lleva a su acto.
const RUTAS = {
  v: { caja: '0 0 40 300', d: 'M20 12 C 36 60, 4 102, 20 150 S 36 240, 20 288', puntos: [[20, 12], [20, 150], [20, 288]] },
  h: { caja: '0 0 300 40', d: 'M12 20 C 60 4, 102 36, 150 20 S 240 4, 288 20', puntos: [[12, 20], [150, 20], [288, 20]] }
};

function Ruta({ orientacion }) {
  const { caja, d, puntos } = RUTAS[orientacion];
  return (
    <nav className={`ruta ruta--${orientacion}`} aria-label="Recorrido por la pirámide olfativa">
      <svg viewBox={caja} aria-hidden="true" focusable="false">
        <path className="ruta-base" d={d} />
        <path className="ruta-trazo" d={d} />
        {puntos.map(([x, y], i) => <circle key={ACTOS[i].id} className="ruta-punto" cx={x} cy={y} r="3.5" />)}
        <circle className="ruta-viajero" cx="0" cy="0" r="5" />
      </svg>
      <ol className="ruta-estaciones">
        {ACTOS.map((a) => (
          <li key={a.id}>
            <button type="button" className="ruta-estacion up" data-acto={a.id} aria-label={`Ir a las notas de ${a.nota}`}>
              <span className="ruta-num">{a.n}</span> {a.nota}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Una vuelta del "puntero virtual" alrededor del frasco y un ciclo de flotación, en segundos
const VUELTA_S = 9;
const FLOTE_S = 4.5;
const GIRO_MAX = 6; // grados de inclinación máxima (puntero en el borde del escenario)

// Frasco del hero flotando: se inclina como si un puntero le diera vueltas. Cada movimiento tiene
// su capa para no competir por transform: envoltura = resplandor de la esencia, flote = giro,
// marco = recorte de la foto, parallax = la foto se desliza dentro del marco con el scroll.
function HeroImagen({ envolturaRef }) {
  const floteRef = useRef(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MQ.animar, () => {
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
      ScrollTrigger.create({
        trigger: el, start: 'top bottom', end: 'bottom top',
        onToggle: ({ isActive }) => [giro, vaiven].forEach((a) => (isActive ? a.resume() : a.pause()))
      });
    });
    return () => mm.revert();
  }, { scope: floteRef });

  return (
    <div className="stage" aria-label="Frasco insignia de Alta Densidad Fragancias">
      <div className="hero-image-wrap" ref={envolturaRef}>
        <div className="hero-flote" ref={floteRef}>
          <div className="hero-marco">
            <div className="hero-parallax">
              <img src="/assets/img/hero-alta-densidad.jpg" alt="Frasco insignia de Alta Densidad Fragancias — Extrait de Parfum y Feromonas"
                className="hero-signature-img hero-signature-img--dark" width="600" height="600" loading="eager" fetchPriority="high" />
              <img src="/assets/img/hero-alta-densidad-light.jpg" alt="Frasco insignia de Alta Densidad Fragancias — Modo Claro"
                className="hero-signature-img hero-signature-img--light" width="600" height="600" loading="eager" fetchPriority="high" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Inicio() {
  const { P, TOP10, ENVASES, KITS } = useTienda();
  const raizRef = useRef(null);
  const heroRef = useRef(null);
  const envolturaRef = useRef(null);
  const esenciaRef = useRef(null);

  useHeroScroll(heroRef);
  useSeccionesScroll(raizRef, [P, TOP10, ENVASES, KITS]);

  const disparar = () => {
    esenciaRef.current?.disparar();
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
    <div className="inicio" ref={raizRef}>
      <JsonLd datos={schema} />
      <div className="progreso-scroll" aria-hidden="true" />

      <section className="hero" ref={heroRef}>
        <div className="hero-t">
          <div className="hero-t-in">
            <span className="up eyebrow">Medellín · Perfumería de autor</span>
            <h1 className="disp">Pura intensidad.<br /><em>Extrait de Parfum.</em></h1>
            <p className="mute">Exclusivamente en concentración Extrait de Parfum con feromonas. Una fijación superior que dura más de doce horas en piel, a una fracción del costo del perfume comercial.</p>
            <div className="hero-actions">
              <a className="btn up" href="#catalogo" onClick={(e) => { e.preventDefault(); desplazarA('#catalogo'); }}>Explorar catálogo</a>
              <button
                type="button"
                className="hero-detonador-scroll"
                onClick={() => desplazarA('#catalogo', { duration: 1.3, ease: 'power2.inOut' })}
                aria-label="Deslizar para liberar la esencia"
              >
                <span className="detonador-capsula" aria-hidden="true">
                  <span className="detonador-filamento">
                    <span className="detonador-gota" />
                  </span>
                </span>
                <span className="detonador-texto-wrap">
                  <span className="detonador-etiqueta up">Scroll para detonar</span>
                  <span className="detonador-titulo">Liberar la esencia</span>
                </span>
                <svg className="detonador-flecha" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <polyline points="19 12 12 19 5 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Narrador de la escena: visible solo mientras el scroll la recorre (EsenciaHero) */}
          <div className="actos">
            <Ruta orientacion="v" />
            <div className="actos-escena">
              {ACTOS.map((a) => (
                <div className="acto" key={a.id}>
                  <span className="acto-nota up">{a.n} · Pirámide olfativa</span>
                  <p className="acto-titulo">Notas de <em>{a.nota}</em></p>
                  <p className="acto-sub">{a.sub}</p>
                  <p className="acto-texto">{a.texto}</p>
                </div>
              ))}
            </div>
            <Ruta orientacion="h" />
          </div>
        </div>
        <HeroImagen envolturaRef={envolturaRef} />
        <EsenciaHero ref={esenciaRef} envolturaRef={envolturaRef} heroRef={heroRef} />
      </section>

      {/* Manifiesto: sus palabras se encienden una a una con el scroll (efectosScroll.js) */}
      <section className="sec manifiesto" aria-labelledby="manifiesto-texto">
        <div className="wrap">
          <span className="up eyebrow">Manifiesto</span>
          <p className="manifiesto-texto" id="manifiesto-texto">
            Un perfume no se lleva: se <em>revela</em>. Primero el destello de la <em>salida</em>, después
            un <em>corazón</em> que se abre en la piel y, al final, un <em>fondo</em> que permanece más de
            doce horas. Lo concentramos en Extrait de Parfum para que cada gota diga más con menos.
          </p>
          <span className="manifiesto-firma up">Alta Densidad · Perfumería de autor · Medellín</span>
        </div>
      </section>

      <section className="sec" id="catalogo" aria-labelledby="catalogo-t">
        <div className="wrap">
          <div className="sec-h rv in">
            <div>
              <span className="up eyebrow">Catálogo</span>
              <h2 id="catalogo-t">Todo lo que<br />creamos</h2>
            </div>
            <p className="mute" style={{ maxWidth: '40ch' }}>Perfumes 1.1 listos para llevar, tu propio perfume preparado a la medida, kits, esencias e insumos.</p>
          </div>
          <PortadaCatalogo />
        </div>
      </section>

      <section className="sec sec--alt" id="top">
        <div className="wrap">
          <div className="sec-h rv in">
            <h2>Top 10<br />más pedidos</h2>
            <p className="mute" style={{ maxWidth: '32ch' }}>Las diez fragancias que más se llevan nuestros clientes este mes. Desliza del nº 10 al nº 1.</p>
          </div>
          <DesfileTop10 />
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
    </div>
  );
}
