// "Crea tu perfume": el cliente elige envase, tamaño, fragancia y si lleva feromonas.
// El precio se arma en vivo (esencia + envase + feromonas) y el backend lo recalcula al cobrar.
// Si alguna parte aún no tiene precio en el panel, el pedido se cotiza por WhatsApp.
import { useEffect, useMemo, useState } from 'react';
import { useTienda } from './TiendaContext';
import { ImagenLogo } from './Frasco';
import { fmt, normalizar, normalizarImagen, etiquetaColeccion, todasLasNotas } from '../lib/producto';
import { categoriaPrecio, codigoArmado, precioArmado } from '../lib/catalogo';
import { WA } from '../config';

const FRAGANCIAS_VISIBLES = 24;

function Paso({ n, titulo, ayuda, listo, children }) {
  return (
    <section className={`arm-paso ${listo ? 'es-listo' : ''}`} aria-labelledby={`arm-paso-${n}`}>
      <header className="arm-paso-h">
        <span className="arm-paso-n" aria-hidden="true">{String(n).padStart(2, '0')}</span>
        <div>
          <h3 id={`arm-paso-${n}`}>{titulo}</h3>
          {ayuda && <p className="mute">{ayuda}</p>}
        </div>
      </header>
      {children}
    </section>
  );
}

const precioTexto = (v) => (v == null ? 'Consultar' : fmt(v));

export default function Armador({ fraganciaInicial }) {
  const { P, ARMADOR, agregarPorCodigo } = useTienda();
  const [envaseId, setEnvaseId] = useState(null);
  const [ml, setMl] = useState(null);
  const [productoId, setProductoId] = useState(fraganciaInicial || null);
  const [feromonas, setFeromonas] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('Todas');
  const [cuantas, setCuantas] = useState(FRAGANCIAS_VISIBLES);
  // Con una esencia ya elegida (p. ej. desde la ficha del perfume) la lista se pliega y se ve la elegida
  const [cambiando, setCambiando] = useState(!fraganciaInicial);

  useEffect(() => {
    if (!fraganciaInicial) return;
    setProductoId(fraganciaInicial);
    setCambiando(false);
  }, [fraganciaInicial]);

  const envases = useMemo(() => (ARMADOR ? ARMADOR.envases.filter((e) => e.sizes.length) : []), [ARMADOR]);
  const envase = envases.find((e) => e.id === envaseId) || null;
  const producto = P.find((p) => p.id === productoId) || null;

  // Al cambiar de envase, se conserva el tamaño si ese envase lo tiene
  const elegirEnvase = (e) => {
    setEnvaseId(e.id);
    if (!e.sizes.some((s) => s.ml === ml)) setMl(e.sizes.length === 1 ? e.sizes[0].ml : null);
  };

  const fragancias = useMemo(() => {
    const t = normalizar(busqueda);
    return P.filter((p) => (categoria === 'Todas' || categoriaPrecio(p.c) === categoria)
      && (!t || [p.n, p.b, p.orig, ...p.fs, ...p.ac, ...todasLasNotas(p)].some((x) => x && normalizar(x).includes(t))))
      .sort((a, b) => (b.id === productoId) - (a.id === productoId) || a.n.localeCompare(b.n));
  }, [P, busqueda, categoria, productoId]);
  useEffect(() => { setCuantas(FRAGANCIAS_VISIBLES); }, [busqueda, categoria]);

  const esenciaDe = (cat) => (ml && ARMADOR ? (ARMADOR.esencia[categoriaPrecio(cat)] || {})[ml] ?? null : null);
  const precio = ARMADOR && envase && ml && producto
    ? precioArmado(ARMADOR, { categoria: producto.c, ml, envaseId: envase.id, feromonas })
    : null;
  const completo = Boolean(envase && ml && producto);

  const mensajeWa = encodeURIComponent(`¡Hola! Quiero crear mi perfume:\n• Fragancia: ${producto ? producto.n : '—'}\n• Envase: ${envase ? envase.name : '—'}\n• Tamaño: ${ml ? ml + ' ml' : '—'}\n• Feromonas: ${feromonas ? 'Sí' : 'No'}\n¿Me cotizan? ✨`);

  if (!ARMADOR) return <p className="mute arm-cargando">Cargando envases y precios…</p>;
  if (!envases.length) {
    return (
      <div className="cat-vacio">
        <p>El armador en línea no está disponible en este momento.</p>
        <a className="btn up" href={`https://wa.me/${WA}?text=${encodeURIComponent('¡Hola! Quiero crear mi propio perfume. ✨')}`} target="_blank" rel="noopener">Crear por WhatsApp</a>
      </div>
    );
  }

  return (
    <div className="armador">
      <div className="arm-pasos">
        <Paso n={1} titulo="Elige el envase" ayuda="El frasco que vestirá tu fragancia." listo={!!envase}>
          <div className="arm-envases" role="radiogroup" aria-label="Envase">
            {envases.map((e) => (
              <button key={e.id} type="button" role="radio" aria-checked={e.id === envaseId}
                className={`arm-envase ${e.id === envaseId ? 'on' : ''}`} onClick={() => elegirEnvase(e)}>
                <span className="arm-envase-img"><ImagenLogo src={normalizarImagen(e.image)} alt="" width="160" height="160" loading="lazy" decoding="async" /></span>
                <b>{e.name}</b>
                <small className="up">{e.sizes.map((s) => `${s.ml} ml`).join(' · ')}</small>
              </button>
            ))}
          </div>
        </Paso>

        <Paso n={2} titulo="Elige el tamaño" ayuda={envase ? `Tamaños de ${envase.name}.` : 'Primero elige un envase.'} listo={!!ml}>
          <div className="arm-opciones" role="radiogroup" aria-label="Tamaño">
            {(envase ? envase.sizes : []).map((s) => (
              <button key={s.ml} type="button" role="radio" aria-checked={s.ml === ml}
                className={`arm-opcion ${s.ml === ml ? 'on' : ''}`} onClick={() => setMl(s.ml)}>
                <b>{s.ml} <small>ml</small></b>
                <span className="mute">Envase {precioTexto(s.price)}</span>
              </button>
            ))}
          </div>
        </Paso>

        <Paso n={3} titulo={producto && !cambiando ? 'Tu esencia' : 'Elige la esencia'} ayuda="La fragancia que llevará tu perfume, en concentración Extrait." listo={!!producto}>
          {producto && !cambiando ? (
            <div className="arm-elegida">
              <div className="arm-fragancia on" aria-current="true">
                <ImagenLogo src={producto.img} alt="" width="56" height="56" />
                <span>
                  <b>{producto.n}</b>
                  <small className="up mute">{[producto.b, etiquetaColeccion(producto.c), ml ? `Esencia ${precioTexto(esenciaDe(producto.c))}` : null].filter(Boolean).join(' · ')}</small>
                </span>
              </div>
              <button type="button" className="btn btn--line up" onClick={() => setCambiando(true)}>Cambiar esencia</button>
            </div>
          ) : (<>
          <div className="arm-buscador">
            <input type="search" className="search-input" placeholder="Buscar por nombre, marca o nota…" aria-label="Buscar fragancia"
              value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
            <div className="chips up">
              {['Todas', 'Arabe', 'Diseñador'].map((c) => (
                <button key={c} type="button" className={`chip up ${c === categoria ? 'on' : ''}`} onClick={() => setCategoria(c)}>
                  {c === 'Todas' ? c : etiquetaColeccion(c)}{c !== 'Todas' && ml ? ` · ${precioTexto(esenciaDe(c))}` : ''}
                </button>
              ))}
            </div>
          </div>
          <div className="arm-fragancias" role="radiogroup" aria-label="Fragancia">
            {fragancias.slice(0, cuantas).map((p) => (
              <button key={p.id} type="button" role="radio" aria-checked={p.id === productoId}
                className={`arm-fragancia ${p.id === productoId ? 'on' : ''}`} onClick={() => { setProductoId(p.id); setCambiando(false); }}>
                <ImagenLogo src={p.img} alt="" width="56" height="56" loading="lazy" decoding="async" />
                <span>
                  <b>{p.n}</b>
                  <small className="up mute">{[p.b, etiquetaColeccion(p.c)].filter(Boolean).join(' · ')}</small>
                </span>
              </button>
            ))}
            {!fragancias.length && <p className="mute">No encontramos esa fragancia. Prueba con otra palabra.</p>}
          </div>
          {fragancias.length > cuantas && (
            <button type="button" className="link up arm-mas" onClick={() => setCuantas((c) => c + FRAGANCIAS_VISIBLES)}>
              Ver más fragancias ({fragancias.length - cuantas})
            </button>
          )}
          </>)}
        </Paso>

        <Paso n={4} titulo="¿Con feromonas?" ayuda="Una dosis fija que intensifica la atracción y la fijación en la piel." listo>
          <div className="arm-opciones" role="radiogroup" aria-label="Feromonas">
            {[[true, 'Con feromonas', ARMADOR.recargoFeromonas == null ? 'Consultar' : ARMADOR.recargoFeromonas ? `+ ${fmt(ARMADOR.recargoFeromonas)}` : 'Sin costo adicional'],
              [false, 'Sin feromonas', 'Solo la fragancia']].map(([v, t, d]) => (
              <button key={t} type="button" role="radio" aria-checked={feromonas === v}
                className={`arm-opcion ${feromonas === v ? 'on' : ''}`} onClick={() => setFeromonas(v)}>
                <b>{t}</b>
                <span className="mute">{d}</span>
              </button>
            ))}
          </div>
        </Paso>
      </div>

      {/* Resumen: fijo a un lado en escritorio, barra inferior en móvil */}
      <aside className="arm-resumen" aria-label="Tu perfume" aria-live="polite">
        <span className="up eyebrow">Tu perfume</span>
        <div className="arm-resumen-img">
          {envase
            ? <ImagenLogo src={normalizarImagen(envase.image)} alt={`Envase ${envase.name}`} width="320" height="320" />
            : <span className="mute">Elige un envase</span>}
        </div>
        <h3 className="arm-resumen-t">{producto ? producto.n : 'Tu fragancia'}</h3>
        <dl className="arm-desglose">
          <div><dt>Envase</dt><dd>{envase ? `${envase.name}${ml ? ` · ${ml} ml` : ''}` : '—'}</dd></div>
          <div><dt>Esencia</dt><dd>{precio ? precioTexto(precio.esencia) : '—'}</dd></div>
          <div><dt>Frasco</dt><dd>{precio ? precioTexto(precio.envase) : '—'}</dd></div>
          <div><dt>Feromonas</dt><dd>{feromonas ? (precio ? precioTexto(precio.feromonas) : 'Sí') : 'No'}</dd></div>
        </dl>
        <div className="arm-total">
          <span className="up">Total</span>
          <b>{precio && precio.total != null ? fmt(precio.total) : (completo ? 'A cotizar' : '—')}</b>
        </div>
        {completo && precio && precio.total != null ? (
          <button type="button" className="btn up btn--full"
            onClick={() => agregarPorCodigo(codigoArmado({ productoId: producto.id, ml, envaseId: envase.id, feromonas }))}>
            Añadir a la bolsa
          </button>
        ) : completo ? (
          <a className="btn up btn--full" href={`https://wa.me/${WA}?text=${mensajeWa}`} target="_blank" rel="noopener">Cotizar por WhatsApp</a>
        ) : (
          <button type="button" className="btn up btn--full" disabled>
            {!envase ? 'Elige un envase' : !ml ? 'Elige un tamaño' : 'Elige una esencia'}
          </button>
        )}
      </aside>
    </div>
  );
}
