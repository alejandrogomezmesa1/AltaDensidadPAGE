// Secciones del catálogo reutilizadas entre páginas: colección, Top 10, envases y kits
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTienda } from './TiendaContext';
import { Frasco, ImagenLogo, Paginacion } from './Frasco';
import { fmt, pr, perfumes11, etiquetaColeccion, normalizar, normalizarImagen, paginasVisibles, todasLasNotas, tieneNotas, noDisponible, motivoNoDisponible } from '../lib/producto';
import { WA } from '../config';

const PRODUCTOS_POR_PAGINA = 12;
const KITS_POR_PAGINA = 6;
const FILTROS_BASE = { search: '', accord: 'Todos', note: 'Todos', family: 'Todos', gender: 'Todos', category: 'Todos', brand: 'Todos' };
const CLAVES_FILTRO = ['accord', 'note', 'family', 'gender', 'category', 'brand'];

// Valores presentes en el catálogo, del más usado al menos usado
function frecuentes(lista) {
  const conteo = new Map();
  lista.forEach((v) => { if (v) conteo.set(v, (conteo.get(v) || 0) + 1); });
  return [...conteo.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([v]) => v);
}
const alfabetico = (lista) => [...new Set(lista.filter(Boolean))].sort((a, b) => a.localeCompare(b));

import { desplazarA } from '../lib/gsap';

export const irA = (id, opciones = {}) => {
  const destino = typeof id === 'string' && !id.startsWith('#') ? `#${id}` : id;
  return desplazarA(destino, { duration: 0.8, ease: 'power2.inOut', cabecera: true, ...opciones });
};

function filtrarProductos(P, filters) {
  const term = normalizar(filters.search);
  return P.filter((p) => {
    if (term) {
      const coincide = [p.n, p.b, p.orig, p.f, p.desc, ...p.ac, ...todasLasNotas(p)].some((t) => t && normalizar(t).includes(term));
      if (!coincide) return false;
    }
    if (filters.accord !== 'Todos' && !p.ac.includes(filters.accord)) return false;
    if (filters.note !== 'Todos' && !todasLasNotas(p).includes(filters.note)) return false;
    if (filters.family !== 'Todos' && p.f !== filters.family) return false;
    if (filters.gender !== 'Todos' && p.g !== filters.gender) return false;
    if (filters.category !== 'Todos' && p.c !== filters.category) return false;
    if (filters.brand !== 'Todos' && p.b !== filters.brand) return false;
    return true;
  });
}

function ordenarProductos(lista, orden) {
  const copia = lista.slice();
  switch (orden) {
    case 'precio-asc': return copia.sort((a, b) => pr(a) - pr(b));
    case 'precio-desc': return copia.sort((a, b) => pr(b) - pr(a));
    case 'nombre-asc': return copia.sort((a, b) => a.n.localeCompare(b.n));
    // Recomendados: agrupados por marca (sin marca al final) y luego por nombre
    default: return copia.sort((a, b) => (!a.b - !b.b) || (a.b || '').localeCompare(b.b || '') || a.n.localeCompare(b.n));
  }
}

const contarFiltros = (f) => CLAVES_FILTRO.filter((k) => f[k] !== 'Todos').length + (f.search ? 1 : 0);

// ── Atelier de filtros (modal) ──
function FiltrosModal({ filters, setFilters, P, coincidencias, onReset }) {
  const { capa, cerrarCapas } = useTienda();
  // Solo se muestran los grupos que tienen datos cargados en las fichas
  const grupos = [
    ['Colección', 'category', alfabetico(P.map((x) => x.c)), etiquetaColeccion],
    ['Familia olfativa', 'family', alfabetico(P.map((x) => x.f))],
    ['Acorde principal', 'accord', frecuentes(P.flatMap((x) => x.ac))],
    ['Nota', 'note', alfabetico(P.flatMap(todasLasNotas))],
    ['Estilo / Género', 'gender', ['Unisex', 'Masculino', 'Femenino']],
    ['Marca', 'brand', alfabetico(P.map((x) => x.b))]
  ].filter(([, , valores]) => valores.length > 0).map(([t, k, v, e]) => [t, k, ['Todos', ...v], e && ((x) => (x === 'Todos' ? x : e(x)))]);
  return (
    <div
      className={`modal filter-modal ${capa === 'filtros' ? 'on' : ''}`} role="dialog" aria-modal="true" aria-label="Filtros avanzados de fragancias"
      onClick={(e) => { if (e.target === e.currentTarget) cerrarCapas(); }}
    >
      <div className="sheet">
        <div className="filter-sheet-h">
          <div>
            <span className="up eyebrow">Atelier de Selección</span>
            <h3 className="disp" style={{ fontSize: 'var(--fs-4)' }}>Filtrar Colección</h3>
          </div>
          <button className="x up" onClick={cerrarCapas} aria-label="Cerrar filtros">✕ Cerrar</button>
        </div>
        <div className="filter-sheet-body">
          {grupos.map(([titulo, tipo, valores, etiqueta]) => (
            <div className="filter-group" key={tipo}>
              <label className="up filter-label">{titulo}</label>
              <div className="filter-pills">
                {valores.map((v) => (
                  <button key={v} className={`chip up ${filters[tipo] === v ? 'on' : ''}`} onClick={() => setFilters((f) => ({ ...f, [tipo]: v }))}>
                    {etiqueta ? etiqueta(v) : v}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="filter-sheet-f">
          <button className="link up" onClick={onReset}>Limpiar todo</button>
          <button className="btn up" onClick={cerrarCapas}>Ver resultados ({coincidencias})</button>
        </div>
      </div>
    </div>
  );
}

// ── Colección: búsqueda en vivo, chips de ocasión, atelier de filtros, orden y paginación ──
export function Coleccion({ titulo = 'La colección' }) {
  const { P: todos, setCapa, abrirDetalle, agregarRapido, pedirAura } = useTienda();
  const P = useMemo(() => perfumes11(todos), [todos]);
  const [filters, setFilters] = useState(FILTROS_BASE);
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState('destacados');
  const [pagina, setPagina] = useState(1);
  const inputRef = useRef(null);

  // La búsqueda se aplica 150 ms después de dejar de escribir
  useEffect(() => {
    const t = setTimeout(() => setFilters((f) => ({ ...f, search: busqueda.trim() })), 150);
    return () => clearTimeout(t);
  }, [busqueda]);

  // Cualquier cambio de filtro u orden vuelve a la primera página
  useEffect(() => { setPagina(1); }, [filters, orden]);

  const filtrados = useMemo(() => ordenarProductos(filtrarProductos(P, filters), orden), [P, filters, orden]);
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / PRODUCTOS_POR_PAGINA));
  const actual = pagina > totalPaginas ? 1 : pagina;
  const visibles = filtrados.slice((actual - 1) * PRODUCTOS_POR_PAGINA, actual * PRODUCTOS_POR_PAGINA);
  const activos = contarFiltros(filters);
  const acordesPrincipales = useMemo(() => frecuentes(P.flatMap((x) => x.ac)).slice(0, 7), [P]);

  const reset = () => { setFilters(FILTROS_BASE); setBusqueda(''); };
  const cambiarPagina = (p) => {
    if (p === actual) {
      irA('coleccion');
      return;
    }
    setPagina(p);
    requestAnimationFrame(() => {
      irA('coleccion');
    });
  };

  return (
    <section className="sec" id="coleccion">
      <div className="wrap">
        <div className="sec-h rv in">
          <div>
            <h2>{titulo}</h2>
            <p className="mute" style={{ marginTop: 'var(--sp-1)', fontSize: 'var(--fs-2)' }}>
              {P.length} formulaciones · Extrait de Parfum · Base de feromonas
            </p>
          </div>
          <div className="col-actions">
            <div className="search-input-wrap">
              <svg className="search-ico" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input ref={inputRef} type="text" className="search-input" placeholder="Buscar por nombre, nota o marca..." aria-label="Buscar fragancias"
                value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
              <button className="search-clear" aria-label="Limpiar búsqueda" style={{ display: busqueda.trim() ? 'block' : 'none' }}
                onClick={() => { setBusqueda(''); setFilters((f) => ({ ...f, search: '' })); inputRef.current?.focus(); }}>✕</button>
            </div>
            <button className="btn btn--line up btn-filter" aria-label="Abrir filtros de fragancias" onClick={() => setCapa('filtros')}>
              <span>Filtros</span>
              <span className="filter-badge" style={{ display: activos > 0 ? 'inline-block' : 'none' }}>{activos}</span>
            </button>
            <label className="sort-wrap">
              <span className="sr-only">Ordenar por</span>
              <select className="sort-select up" aria-label="Ordenar fragancias" value={orden} onChange={(e) => setOrden(e.target.value)}>
                <option value="destacados">Recomendados</option>
                <option value="precio-asc">Precio: menor a mayor</option>
                <option value="precio-desc">Precio: mayor a menor</option>
                <option value="nombre-asc">Nombre: A – Z</option>
              </select>
            </label>
          </div>
        </div>

        {acordesPrincipales.length > 0 && (
          <div className="chips up">
            {['Todos', ...acordesPrincipales].map((x) => (
              <button key={x} className={`chip up ${x === filters.accord ? 'on' : ''}`} onClick={() => setFilters((f) => ({ ...f, accord: x }))}>{x}</button>
            ))}
          </div>
        )}

        <div className="filter-status mute" style={{ display: activos > 0 ? 'flex' : 'none' }}>
          <span>Mostrando <b>{filtrados.length}</b> de {P.length} fragancias</span>
          <button className="link up" style={{ fontSize: 'var(--fs-2)' }} onClick={reset}>Limpiar filtros</button>
        </div>

        <div className="grid">
          {filtrados.length === 0 ? (
            <div className="grid-empty">
              <p className="mute">No encontramos ninguna fragancia que coincida con estos criterios.</p>
              <div className="grid-empty-actions">
                <button className="btn btn--line up" onClick={reset}>Ver toda la colección</button>
                <button className="btn up" onClick={pedirAura}>Pedir recomendación a AURA</button>
              </div>
            </div>
          ) : visibles.map((p, idx) => (
            <article className="card" key={p.id}>
              <div className="stage" onClick={() => abrirDetalle(p.id)}>
                <span className="tag up">Extrait de Parfum</span>
                <Frasco h={p.h} s={1} img={p.img} nombre={p.n} prioridad={actual === 1 && idx < 6} />
                {(tieneNotas(p) || p.ac.length > 0) && (
                  <div className="notes">{(tieneNotas(p) ? todasLasNotas(p) : p.ac).slice(0, 6).join(' · ')}</div>
                )}
              </div>
              <div className="info">
                <div>
                  <small className="up card-brand">{[p.b, etiquetaColeccion(p.c)].filter(Boolean).join(' · ')}</small>
                  <h3 onClick={() => abrirDetalle(p.id)}>{p.n}</h3>
                  <span>{[p.f, p.rev ? 'Precio en revisión' : fmt(pr(p))].filter(Boolean).join(' · ')}</span>
                </div>
                {noDisponible(p)
                  ? <button className="link up" disabled aria-disabled="true">{motivoNoDisponible(p)}</button>
                  : <button className="link up" onClick={() => agregarRapido(p.id)}>Añadir</button>}
              </div>
            </article>
          ))}
        </div>
        <Paginacion actual={actual} total={filtrados.length ? totalPaginas : 0} paginas={paginasVisibles(actual, totalPaginas)} onCambiar={cambiarPagina} />
      </div>

      <FiltrosModal filters={filters} setFilters={setFilters} P={P} coincidencias={filtrarProductos(P, filters).length} onReset={reset} />
    </section>
  );
}

// ── Portada del catálogo (landing): un acceso por cada parte del catálogo ──
export function PortadaCatalogo() {
  const { P: todos, KITS, ENVASES, TOP10 } = useTienda();
  const P = perfumes11(todos);
  const kits = KITS.filter((k) => k.activo !== 0);
  const envase = ENVASES.find((e) => /cartier/i.test(e.name || '')) || ENVASES[0];
  const perfume = TOP10[0] ? normalizarImagen(TOP10[0].imagen || TOP10[0].image) : (P[0] && P[0].img);
  const accesos = [
    { ver: 'perfumes', n: '01', t: 'Perfumes 1.1', d: 'Extrait de Parfum con feromonas, listos para llevar.', dato: `${P.length} fragancias`, img: perfume, clase: 'es-grande' },
    { ver: 'crear', n: '02', t: 'Crea tu perfume', d: 'Tu envase, tu tamaño, tu esencia. Con o sin feromonas.', dato: `${ENVASES.length} envases`, img: envase && normalizarImagen(envase.image), clase: 'es-grande es-crear' },
    { ver: 'kits', n: '03', t: 'Kits', d: 'Sets para regalar o coleccionar.', dato: `${kits.length} kits`, img: kits[0] && normalizarImagen(kits[0].imagen) },
    { ver: 'esencias', n: '04', t: 'Esencias', d: 'Esencias puras por mililitro.', dato: 'Por ml' },
    { ver: 'insumos', n: '05', t: 'Insumos', d: 'Envases vacíos, feromonas y accesorios.', dato: 'Para crear' }
  ];
  return (
    <div className="portada-cat">
      {accesos.map((a) => (
        <Link key={a.ver} to={a.ver === 'perfumes' ? '/catalogo' : `/catalogo?ver=${a.ver}`} className={`portada-acceso rv in ${a.clase || ''} ${a.img ? 'con-img' : ''}`}>
          {a.img && <span className="portada-img"><ImagenLogo src={a.img} alt="" width="480" height="480" loading="lazy" decoding="async" /></span>}
          <span className="portada-n" aria-hidden="true">{a.n}</span>
          <span className="portada-txt">
            <small className="up">{a.dato}</small>
            <b>{a.t}</b>
            <span className="mute">{a.d}</span>
          </span>
          <span className="portada-ir up" aria-hidden="true">Ver →</span>
        </Link>
      ))}
    </div>
  );
}

// ── Top 10 ──
export function Ranking() {
  const { TOP10, abrirDetalle, buscarProducto } = useTienda();
  return (
    <div className="rank">
      {TOP10.map((p, i) => {
        const pId = p.producto_id || p.id;
        const nom = p.nombre || p.name || p.n;
        // Familia y notas salen de la ficha del producto en el catálogo
        const ficha = buscarProducto(pId);
        const perfil = ficha && (tieneNotas(ficha) ? todasLasNotas(ficha) : ficha.ac).slice(0, 3).join(' · ');
        const detalle = [ficha && ficha.f, perfil || (p.genero || p.gender || 'Unisex')].filter(Boolean).join(' · ');
        const rating = Number(p.rating) || 5;
        const carga = i < 4 ? { loading: 'eager', fetchPriority: 'high' } : { loading: 'lazy', decoding: 'async' };
        return (
          <div className="row rv in" key={pId}>
            <span className="n">{i < 9 ? '0' : ''}{i + 1}</span>
            <div className="rank-thumb-wrap" onClick={() => abrirDetalle(pId)}>
              <ImagenLogo src={normalizarImagen(p.imagen || p.image || p.img)} alt={nom} className="rank-thumb" width="60" height="60" {...carga} />
            </div>
            <div>
              <h3 onClick={() => abrirDetalle(pId)}>{nom}</h3>
              <small>{detalle}</small>
              <small className="stars" aria-label={`${rating} de 5 estrellas`}>{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</small>
            </div>
            <span className="pr">{p.precio_revision ? 'En revisión' : fmt(Number(p.precio || p.price || p.p || 75000))}</span>
            <button className="link up" onClick={() => abrirDetalle(pId)}>Ver</button>
          </div>
        );
      })}
    </div>
  );
}

// ── Envases ──
export function Envases() {
  const { ENVASES } = useTienda();
  return (
    <div className="sizes">
      {ENVASES.map((z, idx) => {
        const nom = z.name || z.nombre;
        const tallas = Array.isArray(z.sizes) && z.sizes.length ? z.sizes.join(' · ') : (z.talla || '30ml · 60ml');
        const msgWa = encodeURIComponent('¡Hola! Me gustaría pedir mi perfume en el envase ' + nom + ' de Alta Densidad. ✨');
        const carga = idx < 4 ? { loading: 'eager', fetchPriority: 'high' } : { loading: 'lazy', decoding: 'async' };
        return (
          <div className="size rv in" key={z.id || nom}>
            <div className="stage" style={{ padding: 'var(--sp-2)' }}>
              <ImagenLogo src={normalizarImagen(z.image || z.imagen)} alt={`Envase ${nom}`} className="stage-real-img" width="240" height="200" {...carga}
                style={{ maxHeight: 200, width: 'auto', maxWidth: '85%', objectFit: 'contain' }} />
            </div>
            <b style={{ fontSize: 22, marginTop: 'var(--sp-1)', letterSpacing: '0.04em' }}>{nom}</b>
            <span className="up eyebrow">{tallas} · {z.material || 'Vidrio'}</span>
            <p className="mute" style={{ fontSize: 'var(--fs-2)', lineHeight: 1.45, maxWidth: '28ch', margin: 'var(--sp-1) 0 var(--sp-2)' }}>
              {z.description || z.descripcion || 'Envase de vidrio premium.'}
            </p>
            <a className="btn btn--line up" style={{ fontSize: 11, padding: 'var(--sp-2) var(--sp-3)' }} href={`https://wa.me/${WA}?text=${msgWa}`} target="_blank" rel="noopener">Pedir en este envase</a>
          </div>
        );
      })}
    </div>
  );
}

// ── Kits ──
export function Kits() {
  const { KITS, abrirKit, addKitToCart, abrirBolsa } = useTienda();
  const [pagina, setPagina] = useState(1);
  const activos = KITS.filter((k) => k.activo !== 0);
  const totalPaginas = Math.max(1, Math.ceil(activos.length / KITS_POR_PAGINA));
  const actual = pagina > totalPaginas ? 1 : pagina;
  const visibles = activos.slice((actual - 1) * KITS_POR_PAGINA, actual * KITS_POR_PAGINA);
  const cambiar = (p) => {
    if (p < 1 || p > totalPaginas) return;
    if (p === actual) {
      irA('kits');
      return;
    }
    setPagina(p);
    requestAnimationFrame(() => {
      irA('kits');
    });
  };

  return (
    <>
      <div className="kits-grid">
        {visibles.map((k, idx) => {
          const nom = k.nombre || k.name;
          const carga = idx < 3 ? { loading: 'eager', fetchPriority: 'high' } : { loading: 'lazy', decoding: 'async' };
          return (
            <article className="kit-card rv in" key={k.id}>
              <span className="tag-kit up">Set Exclusivo</span>
              <div className="kit-stage" onClick={() => abrirKit(k.id)}>
                <ImagenLogo src={normalizarImagen(k.imagen || k.image)} alt={`Kit ${nom}`} className="kit-img" width="280" height="280" {...carga} />
              </div>
              <div className="kit-info">
                <h3 className="kit-title" onClick={() => abrirKit(k.id)}>{nom}</h3>
                <p className="kit-desc">{k.descripcion || 'Kit especial de fragancias de alta densidad en estuche de regalo.'}</p>
                <div className="kit-footer">
                  <span className="kit-price">{k.precio_revision ? 'En revisión' : fmt(Number(k.precio || 60000))}</span>
                  {k.agotado || k.precio_revision
                    ? <button className="btn btn--line up" disabled aria-disabled="true">{k.precio_revision ? 'Precio en revisión' : 'Agotado'}</button>
                    : <button className="btn btn--line up" onClick={() => { addKitToCart(k.id, 1); abrirBolsa(); }}>Añadir</button>}
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <Paginacion className="kits-paginacion paginacion" actual={actual} total={totalPaginas}
        paginas={Array.from({ length: totalPaginas }, (_, i) => i + 1)} onCambiar={cambiar} />
    </>
  );
}
