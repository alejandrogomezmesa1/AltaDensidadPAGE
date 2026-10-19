// Decants de 10 ml: la línea para probar la colección. Portada editorial, cómo funciona, los
// envases y el armador: set de descubrimiento (el cliente elige N fragancias) o decant suelto.
// Precios y disponibilidad vienen de /api/decants; el backend recalcula todo al cobrar.
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTienda } from '../tienda/TiendaContext';
import { Frasco } from '../tienda/Frasco';
import { Destello } from '../tienda/Marca';
import { usePagina, JsonLd } from '../lib/hooks';
import { fmt, normalizar, normalizarImagen } from '../lib/producto';
import { acordePrincipalDe } from '../lib/clasificacion';
import {
  codigoDecant, codigoSetDecants, decantVendible, precioDecant, precioSetDecants, desdeDecant
} from '../lib/catalogo';
import { desplazarA } from '../lib/gsap';
import { WA, SITIO } from '../config';

const PASOS = [
  { n: '01', t: 'Elige tus fragancias', d: 'Una sola, o un set de tres o cinco para descubrir la colección.' },
  { n: '02', t: 'Elige el envase', d: 'Atomizador de bolsillo o vial de vidrio. Los dos de 10 ml.' },
  { n: '03', t: 'Lo preparamos', d: 'Con la misma esencia de alta concentración de nuestros frascos, en Medellín.' }
];

const PREGUNTAS = [
  ['¿Qué es un decant?', 'Una porción de 10 ml de una fragancia, en un envase pequeño y con atomizador. Sirve para probarla varios días en tu piel antes de elegir el frasco, o para llevarla contigo.'],
  ['¿Es la misma fragancia del frasco?', 'Sí. Se prepara con la misma esencia de alta concentración que usamos en nuestros perfumes. Los decants no llevan feromonas.'],
  ['¿Cuánto dura un decant de 10 ml?', 'Depende de cuántas veces atomices al día. Con uso diario y moderado, suele acompañarte varias semanas.'],
  ['¿Cómo funciona el set?', 'Eliges las fragancias del set y un envase para todas. El set tiene un descuento sobre la suma de los decants por separado.']
];

const POCO = 'Últimos';

function Precio({ valor }) {
  return valor == null ? <span className="mute">Consultar</span> : <>{fmt(valor)}</>;
}

// Tarjeta de fragancia en el selector
function Fragancia({ p, f, seleccionada, desde, onElegir }) {
  const sinStock = !f.disponible;
  return (
    <li>
      <button type="button" className={`dec-frag ${seleccionada ? 'on' : ''}`} onClick={onElegir} disabled={sinStock}
        aria-pressed={seleccionada} aria-label={`${p.n}${seleccionada ? ', elegida' : ''}`}>
        <span className="dec-frag-foto stage"><Frasco h={p.h} s={1} img={p.img} nombre={p.n} /></span>
        <span className="dec-frag-info">
          <small className="up">{p.b || 'Alta Densidad'}</small>
          <span className="dec-frag-nombre">{p.n}</span>
          <span className="dec-frag-precio">
            {sinStock ? <span className="mute">Agotado</span> : desde != null ? <>Desde {fmt(desde)}</> : <span className="mute">Consultar</span>}
            {f.pocos && !sinStock && <em className="dec-poco">{POCO}</em>}
          </span>
        </span>
        <span className="dec-frag-check" aria-hidden="true">{seleccionada ? '✓' : '+'}</span>
      </button>
    </li>
  );
}

function Armador({ decants, fragancias }) {
  const { agregarPorCodigo } = useTienda();
  const opciones = useMemo(() => [
    ...decants.sets.map((s) => ({ clave: `set${s.id}`, titulo: `${s.nombre} · ${s.cantidad}`, set: s })),
    { clave: 'suelto', titulo: 'Decant suelto', set: null }
  ], [decants.sets]);
  const [modo, setModo] = useState(opciones[0].clave);
  const actual = opciones.find((o) => o.clave === modo) || opciones[0];
  const set = actual.set;
  const [elegidas, setElegidas] = useState([]);
  const [envaseId, setEnvaseId] = useState(() => (decants.envases.find((e) => e.disponible) || decants.envases[0] || {}).id);
  const [busqueda, setBusqueda] = useState('');
  const [acorde, setAcorde] = useState('');
  const [aviso, setAviso] = useState('');

  useEffect(() => { setElegidas([]); setAviso(''); }, [modo]);

  const acordes = useMemo(() => {
    const cuenta = new Map();
    fragancias.forEach(({ p }) => { const a = acordePrincipalDe(p); if (a) cuenta.set(a.clave, { ...a, n: (cuenta.get(a.clave)?.n || 0) + 1 }); });
    return [...cuenta.values()].sort((a, b) => b.n - a.n).slice(0, 6);
  }, [fragancias]);

  const visibles = useMemo(() => {
    const q = normalizar(busqueda);
    return fragancias.filter(({ p }) => (!q || normalizar(`${p.n} ${p.b || ''}`).includes(q))
      && (!acorde || acordePrincipalDe(p)?.clave === acorde));
  }, [fragancias, busqueda, acorde]);

  const max = set ? set.cantidad : 1;
  const completo = elegidas.length === max;
  const elegir = (id) => {
    setAviso('');
    setElegidas((ls) => {
      if (ls.includes(id)) return ls.filter((x) => x !== id);
      if (!set) return [id];
      if (ls.length >= max) { setAviso(`El set lleva ${max} fragancias: quita una para cambiarla.`); return ls; }
      return [...ls, id];
    });
  };

  const precio = set
    ? (completo ? precioSetDecants(decants, set, envaseId, elegidas) : null)
    : (elegidas[0] ? { total: precioDecant(decants, elegidas[0], envaseId) } : null);
  const vendible = completo && elegidas.every((id) => decantVendible(decants, id, envaseId));
  const nombreDe = (id) => (fragancias.find((x) => x.p.id === id) || {}).p?.n;

  const agregar = () => {
    if (!vendible) return;
    agregarPorCodigo(set ? codigoSetDecants(set.id, envaseId, elegidas) : codigoDecant(elegidas[0], envaseId));
    setElegidas([]);
  };

  return (
    <div className="dec-armador">
      <div className="dec-modos" role="tablist" aria-label="Qué quieres armar">
        {opciones.map((o) => (
          <button key={o.clave} type="button" role="tab" aria-selected={o.clave === modo} className={`dec-modo up ${o.clave === modo ? 'on' : ''}`} onClick={() => setModo(o.clave)}>
            {o.titulo}
            {o.set && o.set.descuento > 0 && <span className="dec-modo-desc">−{o.set.descuento}%</span>}
          </button>
        ))}
      </div>

      <div className="dec-armador-cuerpo">
        <div className="dec-selector">
          <div className="dec-filtros">
            <input type="search" className="dec-buscar" placeholder="Buscar fragancia o marca…" aria-label="Buscar fragancia"
              value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
            {acordes.length > 1 && (
              <div className="chips" role="group" aria-label="Acorde principal">
                <button type="button" className={`chip up ${!acorde ? 'on' : ''}`} onClick={() => setAcorde('')}>Todas</button>
                {acordes.map((a) => (
                  <button type="button" key={a.clave} className={`chip up ${acorde === a.clave ? 'on' : ''}`} aria-pressed={acorde === a.clave}
                    onClick={() => setAcorde(acorde === a.clave ? '' : a.clave)}>{a.etiqueta}</button>
                ))}
              </div>
            )}
          </div>
          {visibles.length ? (
            <ul className="dec-grid">
              {visibles.map(({ p, f }) => (
                <Fragancia key={p.id} p={p} f={f} seleccionada={elegidas.includes(p.id)} desde={desdeDecant(decants, p.id)} onElegir={() => elegir(p.id)} />
              ))}
            </ul>
          ) : <p className="mute dec-vacio">Ninguna fragancia coincide con la búsqueda.</p>}
        </div>

        <aside className="dec-resumen" aria-live="polite">
          <span className="up eyebrow">{set ? set.nombre : 'Decant suelto'}</span>
          <h3>{set ? <>{max} fragancias,<br /><em>un envase.</em></> : <>Una fragancia,<br /><em>diez mililitros.</em></>}</h3>
          {set && set.descripcion && <p className="mute dec-resumen-desc">{set.descripcion}</p>}

          <ol className="dec-ranuras">
            {Array.from({ length: max }, (_, i) => {
              const id = elegidas[i];
              return (
                <li key={i} className={id ? 'llena' : ''}>
                  <span className="dec-ranura-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  {id ? (
                    <>
                      <span className="dec-ranura-nombre">{nombreDe(id)}</span>
                      <button type="button" className="dec-quitar" onClick={() => elegir(id)} aria-label={`Quitar ${nombreDe(id)}`}>✕</button>
                    </>
                  ) : <span className="mute">Elige una fragancia</span>}
                </li>
              );
            })}
          </ol>

          <fieldset className="dec-envases-op">
            <legend className="up">Envase</legend>
            {decants.envases.map((e) => (
              <label key={e.id} className={`dec-envase-op ${envaseId === e.id ? 'on' : ''} ${!e.disponible ? 'agotado' : ''}`}>
                <input type="radio" name="dec-envase" value={e.id} checked={envaseId === e.id} disabled={!e.disponible} onChange={() => setEnvaseId(e.id)} />
                {e.imagen && <img src={normalizarImagen(e.imagen)} alt="" width="44" height="44" loading="lazy" />}
                <span><b>{e.nombre}</b><small className="mute">{e.disponible ? '10 ml' : 'Agotado'}</small></span>
              </label>
            ))}
          </fieldset>

          <div className="dec-total">
            {set && precio && precio.suma > precio.total && <s className="mute">{fmt(precio.suma)}</s>}
            <span className="dec-total-v">{completo ? <Precio valor={precio ? precio.total : null} /> : <span className="mute">{elegidas.length}/{max}</span>}</span>
            {set && precio && precio.suma > precio.total && <small className="dec-ahorro">Ahorras {fmt(precio.suma - precio.total)}</small>}
          </div>
          {aviso && <p className="dec-aviso">{aviso}</p>}
          {completo && !vendible && (
            <p className="dec-aviso">Esta combinación aún no se puede pedir en línea. <a className="link" href={`https://wa.me/${WA}?text=${encodeURIComponent(`Hola, quiero ${set ? `el ${set.nombre}` : 'un decant'}: ${elegidas.map(nombreDe).join(', ')}.`)}`} target="_blank" rel="noopener noreferrer">Pídelo por WhatsApp</a></p>
          )}
          <button type="button" className="btn up dec-agregar" disabled={!vendible} onClick={agregar}>
            {completo ? 'Añadir a la bolsa' : set ? `Elige ${max - elegidas.length} más` : 'Elige una fragancia'}
          </button>
        </aside>
      </div>

      {elegidas.length > 0 && (
        <div className="dec-barra" role="region" aria-label="Tu selección">
          <span className="dec-barra-t">
            <span className="mute">{set ? `${elegidas.length} de ${max} fragancias` : nombreDe(elegidas[0])}</span>
            <b>{completo && precio && precio.total != null ? fmt(precio.total) : `${elegidas.length}/${max}`}</b>
          </span>
          {completo
            ? <button type="button" className="btn up" disabled={!vendible} onClick={agregar}>Añadir</button>
            : <button type="button" className="btn btn--line up" onClick={() => desplazarA('.dec-resumen')}>Ver selección</button>}
        </div>
      )}
    </div>
  );
}

export default function Decants() {
  const { P, DECANTS } = useTienda();
  usePagina({
    titulo: 'Decants de 10 ml | Fragancias de Alta Densidad',
    descripcion: 'Prueba la colección en decants de 10 ml: arma tu set de descubrimiento de 3 o 5 fragancias o elige un decant suelto. Alta concentración, hechos en Medellín.',
    ruta: '/decants'
  });

  const fragancias = useMemo(() => {
    if (!DECANTS) return [];
    const porId = new Map(P.map((p) => [p.id, p]));
    return DECANTS.fragancias.map((f) => ({ f, p: porId.get(f.productoId) })).filter((x) => x.p)
      .sort((a, b) => Number(b.f.disponible) - Number(a.f.disponible) || a.p.n.localeCompare(b.p.n, 'es'));
  }, [DECANTS, P]);

  const desdeEnvase = (envaseId) => {
    const precios = fragancias.map(({ p }) => (decantVendible(DECANTS, p.id, envaseId) ? precioDecant(DECANTS, p.id, envaseId) : null)).filter((x) => x != null);
    return precios.length ? Math.min(...precios) : null;
  };
  const hayCatalogo = DECANTS && fragancias.some((x) => x.f.disponible);
  const ir = (id) => (e) => { e.preventDefault(); desplazarA(id); };

  const datos = {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    name: 'Decants de 10 ml · Fragancias de Alta Densidad',
    url: `${SITIO}/decants`,
    itemListElement: fragancias.filter((x) => x.f.disponible).slice(0, 30).map(({ p }) => ({
      '@type': 'Offer', priceCurrency: 'COP', price: desdeDecant(DECANTS, p.id) || undefined,
      itemOffered: { '@type': 'Product', name: `${p.n} · decant 10 ml`, brand: { '@type': 'Brand', name: 'Alta Densidad' } }
    }))
  };

  return (
    <main className="decants">
      <JsonLd datos={datos} />
      <section className="sec dec-hero">
        <div className="wrap dec-hero-in">
          <div className="dec-hero-t">
            <span className="up eyebrow">Decants · 10 ml</span>
            <h1 className="disp">La colección,<br /><em>en diez mililitros.</em></h1>
            <p className="mute">Prueba antes de elegir tu frasco, o lleva tu fragancia a todas partes. Cada decant se prepara con la misma esencia de alta concentración de nuestros perfumes.</p>
            <div className="hero-actions">
              <a className="btn up" href="#armar" onClick={ir('#armar')}>Arma tu set</a>
              <a className="link up" href="#armar" onClick={ir('#armar')}>Elegir un decant</a>
            </div>
            <ul className="dec-datos up">
              <li><b>10 ml</b> por decant</li>
              <li><b>3 y 5</b> fragancias por set</li>
              <li><b>Medellín</b> preparado a mano</li>
            </ul>
          </div>
          <div className="dec-hero-foto">
            <div className="dec-ventana">
              <img src="/assets/decants/decants-portada.jpg" alt="Decants de Fragancias de Alta Densidad: atomizadores de bolsillo rosado, morado y negro"
                width="1141" height="1400" loading="eager" fetchPriority="high" />
            </div>
          </div>
        </div>
      </section>

      <section className="sec sec--alt" aria-labelledby="dec-pasos-t">
        <div className="wrap">
          <div className="sec-h">
            <div>
              <span className="up eyebrow">Cómo funciona</span>
              <h2 id="dec-pasos-t">Tres pasos,<br /><em>una estela.</em></h2>
            </div>
          </div>
          <ol className="dec-pasos">
            {PASOS.map((s) => (
              <li key={s.n}>
                <span className="dec-paso-n" aria-hidden="true">{s.n}</span>
                <h3>{s.t}</h3>
                <p className="mute">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="sec" aria-labelledby="dec-envases-t">
        <div className="wrap">
          <div className="sec-h">
            <div>
              <span className="up eyebrow">Envases</span>
              <h2 id="dec-envases-t">Elige cómo<br /><em>llevarla.</em></h2>
            </div>
          </div>
          <ul className="dec-envases">
            {(DECANTS ? DECANTS.envases : []).map((e) => (
              <li key={e.id} className="dec-envase">
                <div className="dec-envase-foto">{e.imagen && <img src={normalizarImagen(e.imagen)} alt={e.nombre} loading="lazy" width="600" height="700" />}</div>
                <div className="dec-envase-info">
                  <h3>{e.nombre}</h3>
                  {e.descripcion && <p className="mute">{e.descripcion}</p>}
                  <span className="up dec-envase-desde">{desdeEnvase(e.id) != null ? <>Decant desde {fmt(desdeEnvase(e.id))}</> : 'Precio en línea muy pronto'}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="sec sec--alt" id="armar" aria-labelledby="dec-armar-t">
        <div className="wrap">
          <div className="sec-h">
            <div>
              <span className="up eyebrow">Arma tus decants</span>
              <h2 id="dec-armar-t">Descubre antes<br /><em>de elegir.</em></h2>
            </div>
            <p className="mute" style={{ maxWidth: '42ch' }}>Elige un set para conocer varias fragancias con descuento, o un decant suelto de la que ya amas.</p>
          </div>
          {!DECANTS && <p className="mute">Cargando decants…</p>}
          {DECANTS && hayCatalogo && <Armador decants={DECANTS} fragancias={fragancias} />}
          {DECANTS && !hayCatalogo && (
            <div className="dec-pronto">
              <Destello size={18} />
              <p>Estamos preparando los primeros decants. Mientras tanto, pídenos el tuyo por WhatsApp.</p>
              <a className="btn up" href={`https://wa.me/${WA}?text=${encodeURIComponent('Hola, quiero pedir un decant de 10 ml.')}`} target="_blank" rel="noopener noreferrer">Pedir por WhatsApp</a>
            </div>
          )}
        </div>
      </section>

      <section className="sec" aria-labelledby="dec-faq-t">
        <div className="wrap dec-faq">
          <div>
            <span className="up eyebrow">Preguntas</span>
            <h2 id="dec-faq-t">Lo que<br /><em>conviene saber.</em></h2>
            <Link className="link up" to="/catalogo">Ver los frascos completos</Link>
          </div>
          <div className="dec-faq-lista">
            {PREGUNTAS.map(([q, r]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p className="mute">{r}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
