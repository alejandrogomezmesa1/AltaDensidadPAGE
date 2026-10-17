// Portada (brand book v3): calma editorial. Un solo movimiento: el parallax del frasco insignia,
// que se desliza dentro de su marco ventana mientras se baja. Todo lo demás es estático.
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap, useGSAP, MQ, desplazarA } from '../lib/gsap';
import { useTienda } from '../tienda/TiendaContext';
import { PortadaCatalogo } from '../tienda/Secciones';
import { ImagenLogo } from '../tienda/Frasco';
import { Simbolo } from '../tienda/Marca';
import { usePagina, JsonLd } from '../lib/hooks';
import { etiquetaColeccion, pr, urlAbsoluta, fmt, normalizarImagen } from '../lib/producto';
import { SITIO } from '../config';

// La pirámide olfativa en tres actos (sistema gráfico B5.1)
const ACTOS = [
  { n: 'I', nota: 'Salida', sub: 'El primer destello', texto: 'Luminosas y fugaces: la primera impresión, la que abre el camino.' },
  { n: 'II', nota: 'Corazón', sub: 'La esencia se abre', texto: 'El carácter del perfume florece al contacto con la piel.' },
  { n: 'III', nota: 'Fondo', sub: 'Lo que permanece', texto: 'Lo más concentrado de la fragancia: te acompaña todo el día.' }
];

// Los pilares de la casa, con la iconografía de línea fina del brand book
const PILARES = [
  { t: 'Concentración', d: 'Alta concentración de esencia: más fijación con menos atomizaciones.',
    icono: <path d="M12,3 C14,8 18,10.5 18,15 A6,6 0 1 1 6,15 C6,10.5 10,8 12,3 Z" /> },
  { t: 'Feromonas', d: 'Una base inodora que acompaña la piel y suma presencia a la estela.',
    icono: <><path d="M3,9 C6,6 9,12 12,9 S18,6 21,9" /><path d="M3,13 C6,10 9,16 12,13 S18,10 21,13" /><path d="M3,17 C6,14 9,20 12,17 S18,14 21,17" /></> },
  { t: 'Accesibilidad', d: 'Inspirados en los grandes nichos y diseñadores, sin el precio de la etiqueta comercial.',
    icono: <path d="M12,3.5 L14.5,9 L20.5,9.6 L16,13.6 L17.3,19.5 L12,16.5 L6.7,19.5 L8,13.6 L3.5,9.6 L9.5,9 Z" /> }
];

function Icono({ children }) {
  return (
    <svg className="pilar-icono" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.1"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{children}</svg>
  );
}

// Hero: el frasco insignia en su marco ventana. Parallax: la foto se desliza dentro del marco.
function HeroFrasco({ heroRef }) {
  const fotoRef = useRef(null);
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MQ.animar, () => {
      gsap.fromTo(fotoRef.current, { yPercent: -7 }, {
        yPercent: 7, ease: 'none',
        scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: true }
      });
    });
    return () => mm.revert();
  }, { scope: fotoRef });

  return (
    <div className="hero-escenario" aria-label="Frasco insignia de Fragancias de Alta Densidad">
      <div className="hero-ventana">
        <div className="hero-foto" ref={fotoRef}>
          <img src="/assets/marca/hero-frasco-oscuro.svg" alt="Frasco insignia de Fragancias de Alta Densidad sobre un pedestal"
            className="hero-img hero-img--oscura" width="840" height="1092" loading="eager" fetchPriority="high" />
          <img src="/assets/marca/hero-frasco-claro.svg" alt=""
            className="hero-img hero-img--clara" width="840" height="1092" loading="eager" />
        </div>
      </div>
    </div>
  );
}

// Vista previa del Top 10: los cuatro primeros, quietos
function TopPreview() {
  const { TOP10, abrirDetalle } = useTienda();
  const primeros = [...TOP10]
    .map((p, i) => ({ ...p, pos: Number(p.posicion) || i + 1 }))
    .sort((a, b) => a.pos - b.pos)
    .slice(0, 4);
  if (!primeros.length) return null;
  return (
    <ol className="top-preview">
      {primeros.map((p) => {
        const pId = p.producto_id || p.id;
        const nom = p.nombre || p.name || p.n;
        return (
          <li key={p.pos}>
            <button type="button" className="top-preview-item" onClick={() => abrirDetalle(pId)}>
              <span className="top-preview-foto">
                <ImagenLogo src={normalizarImagen(p.imagen || p.image || p.img)} alt="" width="320" height="400" loading="lazy" decoding="async" />
              </span>
              <span className="top-preview-num" aria-hidden="true">{String(p.pos).padStart(2, '0')}</span>
              <span className="top-preview-nombre">{nom}</span>
              <span className="top-preview-precio up">{p.precio_revision ? 'Precio en revisión' : fmt(Number(p.precio || p.price || 0))}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

export default function Inicio() {
  const { P, rutaPerfume } = useTienda();
  const heroRef = useRef(null);

  usePagina({
    titulo: 'Fragancias de Alta Densidad | Lo que permanece · Medellín',
    descripcion: 'Fragancias inspiradas en los grandes nichos y diseñadores, en alta concentración y con feromonas. Hechas en Medellín, con envíos a toda Colombia.',
    ogTitulo: 'Fragancias de Alta Densidad | Lo que permanece.',
    ogDescripcion: 'Fragancias en alta concentración con feromonas, hechas en Medellín. Envíos a toda Colombia.'
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
        description: p.desc || `Perfume ${p.n} en alta concentración con feromonas.`,
        category: etiquetaColeccion(p.c),
        brand: { '@type': 'Brand', name: 'Alta Densidad' },
        offers: { '@type': 'Offer', priceCurrency: 'COP', price: pr(p), availability: 'https://schema.org/InStock', url: SITIO + rutaPerfume(p.id) }
      }
    }))
  };

  return (
    <div className="inicio">
      <JsonLd datos={schema} />

      <section className="hero" ref={heroRef}>
        <div className="hero-t">
          <span className="up eyebrow">Fragancias de Alta Densidad · Medellín</span>
          <h1 className="disp">Lo que<br /><em>permanece.</em></h1>
          <p className="mute">Fragancias inspiradas en los grandes nichos y diseñadores, en alta concentración y con feromonas.</p>
          <div className="hero-actions">
            <a className="btn up" href="#catalogo" onClick={(e) => { e.preventDefault(); desplazarA('#catalogo'); }}>Explorar catálogo</a>
            <Link className="link up" to="/catalogo?ver=crear">Crea tu perfume</Link>
          </div>
        </div>
        <HeroFrasco heroRef={heroRef} />
      </section>

      <section className="sec manifiesto" aria-labelledby="manifiesto-t">
        <div className="wrap">
          <span className="up eyebrow">Manifiesto</span>
          <h2 className="manifiesto-texto" id="manifiesto-t">
            Un perfume no se lleva: <em>se revela.</em>
          </h2>
          <ol className="actos">
            {ACTOS.map((a) => (
              <li className="acto" key={a.n}>
                <span className="acto-num" aria-hidden="true">{a.n}</span>
                <span className="acto-nota up">{a.nota}</span>
                <span className="acto-sub">{a.sub}</span>
                <span className="acto-texto mute">{a.texto}</span>
              </li>
            ))}
          </ol>
          <p className="manifiesto-firma up"><Simbolo size={18} /> Fragancias de Alta Densidad · Medellín</p>
        </div>
      </section>

      <section className="sec sec--alt" id="catalogo" aria-labelledby="catalogo-t">
        <div className="wrap">
          <div className="sec-h">
            <div>
              <span className="up eyebrow">Catálogo</span>
              <h2 id="catalogo-t">Todo lo que<br /><em>creamos.</em></h2>
            </div>
            <p className="mute" style={{ maxWidth: '40ch' }}>Perfumes listos para llevar, tu propio perfume preparado a la medida, kits, esencias e insumos.</p>
          </div>
          <PortadaCatalogo />
        </div>
      </section>

      <section className="sec" id="top" aria-labelledby="top-t">
        <div className="wrap">
          <div className="sec-h">
            <div>
              <span className="up eyebrow">Top 10 · Este mes</span>
              <h2 id="top-t">Los más<br /><em>pedidos.</em></h2>
            </div>
            <Link className="link up" to="/top10">Ver el Top 10 completo</Link>
          </div>
          <TopPreview />
        </div>
      </section>

      <section className="sec sec--alt" id="nosotros" aria-labelledby="casa-t">
        <div className="wrap">
          <div className="sec-h">
            <div>
              <span className="up eyebrow">La casa</span>
              <h2 id="casa-t">Inspirados en los nichos.<br /><em>Concentrados para durar.</em></h2>
            </div>
            <Link className="link up" to="/nosotros">Conoce la casa</Link>
          </div>
          <ul className="pilares">
            {PILARES.map((p) => (
              <li className="pilar" key={p.t}>
                <Icono>{p.icono}</Icono>
                <h3 className="up">{p.t}</h3>
                <p className="mute">{p.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
