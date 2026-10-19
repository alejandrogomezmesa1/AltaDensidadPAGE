// Secciones del catálogo reutilizadas entre páginas: colección, Top 10, envases y kits
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTienda } from './TiendaContext';
import { Frasco, ImagenLogo, Paginacion } from './Frasco';
import { fmt, pr, perfumes11, etiquetaColeccion, normalizar, normalizarImagen, paginasVisibles, todasLasNotas, tieneNotas, noDisponible, motivoNoDisponible } from '../lib/producto';
import { acordePrincipalDe, notasDe } from '../lib/clasificacion';
import { WA } from '../config';
import { useColumnas } from '../lib/hooks';

// Cada página llena filas completas según las columnas que caben: pocas filas en pantallas anchas,
// más filas cuando hay una o dos columnas
const productosPorPagina = (c) => c * (c >= 4 ? 3 : c === 3 ? 4 : c === 2 ? 6 : 8);
const kitsPorPagina = (c) => c * (c >= 3 ? 2 : c === 2 ? 3 : 6);
const celdasLibres = (n, columnas) => (columnas > 1 && n % columnas ? columnas - n % columnas : 0);

// Cierre de la última fila incompleta: ocupa las celdas que sobran con una invitación, no con huecos
function RellenoFila({ span, eyebrow, titulo, texto, children }) {
  return (
    <aside className={`grid-relleno ${span > 1 ? 'es-ancho' : ''}`} style={{ gridColumn: `span ${span}` }}>
      <div className="grid-relleno-in">
        <span className="up eyebrow">{eyebrow}</span>
        <h3>{titulo}</h3>
        <p className="mute">{texto}</p>
        <div className="grid-relleno-acciones">{children}</div>
      </div>
    </aside>
  );
}
const FILTROS_BASE = { search: '', accord: 'Todos', note: 'Todos', family: 'Todos', gender: 'Todos', category: 'Todos', brand: 'Todos' };
const CLAVES_FILTRO = ['gender', 'accord', 'family', 'category', 'brand', 'note'];

import { desplazarA } from '../lib/gsap';

export const irA = (id, opciones = {}) => {
  const destino = typeof id === 'string' && !id.startsWith('#') ? `#${id}` : id;
  return desplazarA(destino, { duration: 0.8, ease: 'power2.inOut', cabecera: true, ...opciones });
};

// Qué valores aporta cada perfume a cada filtro, ya en forma canónica: [{ clave, etiqueta }].
// Acordes y notas escritos de dos maneras («limón» y «limón (lima ácida)») cuentan como uno.
const ORDEN_GENERO = ['Femenino', 'Masculino', 'Unisex'];
const FACETAS = {
  gender: (p) => [{ clave: p.g, etiqueta: p.g }],
  // Solo el acorde principal (el primero, el más intenso): así el filtro dice lo que promete
  accord: (p) => { const a = acordePrincipalDe(p); return a ? [a] : []; },
  family: (p) => [...new Set(p.fs)].map((f) => ({ clave: f, etiqueta: f })),
  category: (p) => [{ clave: p.c, etiqueta: etiquetaColeccion(p.c) }],
  brand: (p) => (p.b ? [{ clave: p.b, etiqueta: p.b }] : []),
  note: (p) => notasDe(p)
};

function coincideBusqueda(p, term) {
  return [p.n, p.b, p.orig, ...p.fs, p.desc, ...p.ac, ...todasLasNotas(p)].some((t) => t && normalizar(t).includes(term));
}

// ¿Cumple todos los filtros activos? (saltar: ignora uno, para contar las opciones de ese filtro)
const cumple = (p, filters, saltar) => CLAVES_FILTRO.every((k) => k === saltar || filters[k] === 'Todos'
  || FACETAS[k](p).some((v) => v.clave === filters[k]));

function filtrarProductos(P, filters) {
  const term = normalizar(filters.search);
  return P.filter((p) => (!term || coincideBusqueda(p, term)) && cumple(p, filters));
}

// Opciones de un filtro con cuántos perfumes quedarían al elegirlas, contando los demás filtros
// activos: las que dejarían la lista vacía se muestran apagadas. De la más a la menos frecuente.
function opcionesDe(P, filters, clave) {
  const term = normalizar(filters.search);
  const mapa = new Map();
  P.forEach((p) => {
    if ((term && !coincideBusqueda(p, term)) || !cumple(p, filters, clave)) return;
    FACETAS[clave](p).forEach((v) => {
      const o = mapa.get(v.clave) || { ...v, n: 0 };
      o.n += 1;
      mapa.set(v.clave, o);
    });
  });
  // La opción elegida se conserva aunque ya no tenga perfumes, para poder quitarla
  if (filters[clave] !== 'Todos' && !mapa.has(filters[clave])) {
    const ref = P.flatMap(FACETAS[clave]).find((v) => v.clave === filters[clave]);
    mapa.set(filters[clave], { clave: filters[clave], etiqueta: ref ? ref.etiqueta : filters[clave], n: 0 });
  }
  const lista = [...mapa.values()];
  if (clave === 'gender') return lista.sort((x, y) => ORDEN_GENERO.indexOf(x.clave) - ORDEN_GENERO.indexOf(y.clave));
  return lista.sort((x, y) => y.n - x.n || x.etiqueta.localeCompare(y.etiqueta, 'es'));
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

const TITULOS_FILTRO = { gender: 'Para quién', accord: 'Acorde principal', family: 'Familia olfativa', category: 'Colección', brand: 'Marca', note: 'Nota' };

// Un grupo de filtro: muestra las opciones más frecuentes y el resto tras «Ver más»
function GrupoFiltro({ clave, ayuda, opciones, valor, onElegir, visibles = 8, children }) {
  const [abierto, setAbierto] = useState(false);
  let lista = abierto ? opciones : opciones.slice(0, visibles);
  const elegida = opciones.find((o) => o.clave === valor);
  if (elegida && !lista.includes(elegida)) lista = [elegida, ...lista];
  return (
    <fieldset className="filter-group">
      <legend className="filter-legend">
        <span className="up filter-label">{TITULOS_FILTRO[clave]}</span>
        {valor !== 'Todos' && <button type="button" className="filter-quitar" onClick={() => onElegir('Todos')}>Quitar</button>}
      </legend>
      {ayuda && <p className="filter-ayuda mute">{ayuda}</p>}
      {children}
      {lista.length > 0 ? (
        <div className="filter-pills">
          {lista.map((o) => {
            const on = o.clave === valor;
            return (
              <button type="button" key={o.clave} className={`chip ${on ? 'on' : ''}`} aria-pressed={on} disabled={!on && o.n === 0}
                onClick={() => onElegir(on ? 'Todos' : o.clave)}>
                {o.etiqueta}<span className="chip-n" aria-label={`${o.n} perfumes`}>{o.n}</span>
              </button>
            );
          })}
        </div>
      ) : <p className="filter-ayuda mute">Sin coincidencias.</p>}
      {opciones.length > visibles && (
        <button type="button" className="filter-mas" onClick={() => setAbierto(!abierto)} aria-expanded={abierto}>
          {abierto ? 'Ver menos' : `Ver ${opciones.length - visibles} más`}
        </button>
      )}
    </fieldset>
  );
}

// ── Atelier de filtros (modal): lo esencial arriba, lo específico (marca, notas) abajo ──
function FiltrosModal({ filters, setFilters, P, coincidencias, onReset }) {
  const { capa, cerrarCapas } = useTienda();
  const [buscarNota, setBuscarNota] = useState('');
  const elegir = (clave) => (v) => setFilters((f) => ({ ...f, [clave]: v }));
  const op = (clave) => opcionesDe(P, filters, clave);
  const notas = op('note');
  const q = normalizar(buscarNota);
  const notasVisibles = q ? notas.filter((o) => normalizar(o.etiqueta).includes(q)).slice(0, 30) : notas;
  return (
    <div
      className={`modal filter-modal ${capa === 'filtros' ? 'on' : ''}`} role="dialog" aria-modal="true" aria-label="Filtros de fragancias"
      onClick={(e) => { if (e.target === e.currentTarget) cerrarCapas(); }}
    >
      <div className="sheet">
        <div className="filter-sheet-h">
          <div>
            <span className="up eyebrow">Atelier de selección</span>
            <h3 className="disp" style={{ fontSize: 'var(--fs-4)' }}>Filtrar colección</h3>
          </div>
          <button className="x up" onClick={cerrarCapas} aria-label="Cerrar filtros">✕ Cerrar</button>
        </div>
        <div className="filter-sheet-body">
          <div className="filter-nivel">
            <GrupoFiltro clave="gender" opciones={op('gender')} valor={filters.gender} onElegir={elegir('gender')} />
            <GrupoFiltro clave="accord" ayuda="El aroma que domina el perfume." opciones={op('accord')} valor={filters.accord} onElegir={elegir('accord')} visibles={8} />
            <GrupoFiltro clave="family" opciones={op('family')} valor={filters.family} onElegir={elegir('family')} visibles={6} />
          </div>
          <div className="filter-nivel filter-nivel--fino">
            <span className="up filter-nivel-t">Para afinar</span>
            <GrupoFiltro clave="category" opciones={op('category')} valor={filters.category} onElegir={elegir('category')} />
            <GrupoFiltro clave="brand" opciones={op('brand')} valor={filters.brand} onElegir={elegir('brand')} visibles={8} />
            <GrupoFiltro clave="note" opciones={notasVisibles} valor={filters.note} onElegir={elegir('note')} visibles={q ? 30 : 12}>
              <input type="search" className="filter-buscar" placeholder="Buscar una nota: vainilla, oud, bergamota…" aria-label="Buscar una nota"
                value={buscarNota} onChange={(e) => setBuscarNota(e.target.value)} />
            </GrupoFiltro>
          </div>
        </div>
        <div className="filter-sheet-f">
          <button className="link up" onClick={() => { onReset(); setBuscarNota(''); }}>Limpiar todo</button>
          <button className="btn up" onClick={cerrarCapas}>Ver {coincidencias} {coincidencias === 1 ? 'resultado' : 'resultados'}</button>
        </div>
      </div>
    </div>
  );
}

// ── Colección: búsqueda en vivo, chips de ocasión, atelier de filtros, orden y paginación ──
// Búsqueda, filtros, orden y página de la colección se recuerdan durante la visita: al volver de la
// página de un perfume la lista está como se dejó
// v2: los filtros guardan la forma canónica (acorde principal, nota sin paréntesis)
const CLAVE_COLECCION = 'ad_coleccion_v2';
function estadoGuardado() {
  try { return JSON.parse(sessionStorage.getItem(CLAVE_COLECCION) || 'null') || {}; } catch { return {}; }
}

export function Coleccion({ titulo = 'La colección' }) {
  const { P: todos, setCapa, abrirDetalle, agregarRapido, pedirAura } = useTienda();
  const P = useMemo(() => perfumes11(todos), [todos]);
  const [guardado] = useState(estadoGuardado);
  const [filters, setFilters] = useState({ ...FILTROS_BASE, ...(guardado.filters || {}) });
  const [busqueda, setBusqueda] = useState(guardado.busqueda || '');
  const [orden, setOrden] = useState(guardado.orden || 'destacados');
  // Se recuerda el primer perfume visible (no el número de página): al cambiar el ancho cambian
  // los perfumes por página y la página que se muestra es la que lo contiene
  const [inicio, setInicio] = useState(guardado.inicio ?? ((guardado.pagina || 1) - 1) * 12);
  const inputRef = useRef(null);
  const gridRef = useRef(null);
  const columnas = useColumnas(gridRef);
  const porPagina = productosPorPagina(columnas);

  // La búsqueda se aplica 150 ms después de dejar de escribir
  useEffect(() => {
    const t = setTimeout(() => setFilters((f) => (f.search === busqueda.trim() ? f : { ...f, search: busqueda.trim() })), 150);
    return () => clearTimeout(t);
  }, [busqueda]);

  // Cualquier cambio de filtro u orden vuelve a la primera página (no al montar: se respeta la guardada)
  const criterio = useRef(JSON.stringify([filters, orden]));
  useEffect(() => {
    const ahora = JSON.stringify([filters, orden]);
    if (ahora === criterio.current) return;
    criterio.current = ahora;
    setInicio(0);
  }, [filters, orden]);

  useEffect(() => {
    try { sessionStorage.setItem(CLAVE_COLECCION, JSON.stringify({ filters, busqueda, orden, inicio })); } catch { /* sin almacenamiento */ }
  }, [filters, busqueda, orden, inicio]);

  const filtrados = useMemo(() => ordenarProductos(filtrarProductos(P, filters), orden), [P, filters, orden]);
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / porPagina));
  const actual = inicio >= filtrados.length ? 1 : Math.floor(inicio / porPagina) + 1;
  const visibles = filtrados.slice((actual - 1) * porPagina, actual * porPagina);
  const libres = celdasLibres(visibles.length, columnas);
  const activos = contarFiltros(filters);
  // Atajo sobre la grilla: los acordes principales más frecuentes de la colección (lista fija)
  const acordesPrincipales = useMemo(() => opcionesDe(P, FILTROS_BASE, 'accord').slice(0, 7), [P]);
  // Filtros activos con su nombre visible, para quitarlos uno a uno
  const activosLista = useMemo(() => CLAVES_FILTRO.filter((k) => filters[k] !== 'Todos').map((k) => {
    const ref = P.flatMap(FACETAS[k]).find((v) => v.clave === filters[k]);
    return { k, etiqueta: ref ? ref.etiqueta : filters[k] };
  }), [P, filters]);

  const reset = () => { setFilters(FILTROS_BASE); setBusqueda(''); };
  const cambiarPagina = (p) => {
    if (p === actual) {
      irA('coleccion');
      return;
    }
    setInicio((p - 1) * porPagina);
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
              {P.length} formulaciones · Alta concentración · Base de feromonas
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
          <div className="chips up" role="group" aria-label="Acorde principal">
            <button className={`chip up ${filters.accord === 'Todos' ? 'on' : ''}`} onClick={() => setFilters((f) => ({ ...f, accord: 'Todos' }))}>Todos</button>
            {acordesPrincipales.map((a) => (
              <button key={a.clave} className={`chip up ${a.clave === filters.accord ? 'on' : ''}`} aria-pressed={a.clave === filters.accord}
                onClick={() => setFilters((f) => ({ ...f, accord: f.accord === a.clave ? 'Todos' : a.clave }))}>{a.etiqueta}</button>
            ))}
          </div>
        )}

        {activos > 0 && (
          <div className="filter-status mute">
            <span>Mostrando <b>{filtrados.length}</b> de {P.length} fragancias</span>
            <ul className="filtros-activos-t">
              {filters.search && (
                <li><button type="button" onClick={() => { setBusqueda(''); setFilters((f) => ({ ...f, search: '' })); }} aria-label={`Quitar búsqueda ${filters.search}`}>«{filters.search}» ✕</button></li>
              )}
              {activosLista.map((a) => (
                <li key={a.k}>
                  <button type="button" onClick={() => setFilters((f) => ({ ...f, [a.k]: 'Todos' }))} aria-label={`Quitar ${TITULOS_FILTRO[a.k]}: ${a.etiqueta}`}>
                    <small>{TITULOS_FILTRO[a.k]}</small> {a.etiqueta} ✕
                  </button>
                </li>
              ))}
            </ul>
            <button className="link up" style={{ fontSize: 'var(--fs-2)' }} onClick={reset}>Limpiar filtros</button>
          </div>
        )}

        <div className="grid" ref={gridRef}>
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
                <span className="tag up">Alta concentración</span>
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
                  {(tieneNotas(p) || p.ac.length > 0) && (
                    <p className="card-notas">{(tieneNotas(p) ? todasLasNotas(p) : p.ac).slice(0, 6).join(' · ')}</p>
                  )}
                </div>
                {noDisponible(p)
                  ? <button className="link up" disabled aria-disabled="true">{motivoNoDisponible(p)}</button>
                  : <button className="link up" onClick={() => agregarRapido(p.id)}>Añadir</button>}
              </div>
            </article>
          ))}
          {libres > 0 && (
            <RellenoFila span={libres} eyebrow="¿No está la que buscas?" titulo="Crea tu perfume"
              texto="Elige la esencia, el envase y el tamaño. Lo preparamos para ti, con o sin feromonas.">
              <Link className="btn up" to="/catalogo?ver=crear">Crear mi perfume</Link>
              <button type="button" className="link up" onClick={pedirAura}>Pedir recomendación a AURA</button>
            </RellenoFila>
          )}
        </div>
        <Paginacion actual={actual} total={filtrados.length ? totalPaginas : 0} paginas={paginasVisibles(actual, totalPaginas)} onCambiar={cambiarPagina} />
      </div>

      <FiltrosModal filters={filters} setFilters={setFilters} P={P} coincidencias={filtrados.length} onReset={reset} />
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
    { ver: 'perfumes', n: '01', t: 'Perfumes 1.1', d: 'Alta concentración con feromonas, listos para llevar.', dato: `${P.length} fragancias`, img: perfume, clase: 'es-grande' },
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
  // La página de kits también se recuerda al volver de la página de un kit
  // (como en la colección, se guarda el primer kit visible)
  const [inicio, setInicio] = useState(() => { try { return Number(sessionStorage.getItem('ad_kits_inicio')) || 0; } catch { return 0; } });
  useEffect(() => { try { sessionStorage.setItem('ad_kits_inicio', String(inicio)); } catch { /* sin almacenamiento */ } }, [inicio]);
  const gridRef = useRef(null);
  const columnas = useColumnas(gridRef);
  const porPagina = kitsPorPagina(columnas);
  const activos = KITS.filter((k) => k.activo !== 0);
  const totalPaginas = Math.max(1, Math.ceil(activos.length / porPagina));
  const actual = inicio >= activos.length ? 1 : Math.floor(inicio / porPagina) + 1;
  const visibles = activos.slice((actual - 1) * porPagina, actual * porPagina);
  const libres = celdasLibres(visibles.length, columnas);
  const cambiar = (p) => {
    if (p < 1 || p > totalPaginas) return;
    if (p === actual) {
      irA('kits');
      return;
    }
    setInicio((p - 1) * porPagina);
    requestAnimationFrame(() => {
      irA('kits');
    });
  };

  return (
    <>
      <div className="kits-grid" ref={gridRef}>
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
        {libres > 0 && (
          <RellenoFila span={libres} eyebrow="Un regalo a tu medida" titulo="Crea tu propio perfume"
            texto="Elige la esencia, el envase y el tamaño. O escríbenos y te ayudamos a elegir el regalo ideal.">
            <Link className="btn up" to="/catalogo?ver=crear">Crear mi perfume</Link>
            <a className="link up" href={`https://wa.me/${WA}?text=${encodeURIComponent('¡Hola! Quiero ayuda para elegir un regalo. ✨')}`} target="_blank" rel="noopener">Escribir por WhatsApp</a>
          </RellenoFila>
        )}
      </div>
      <Paginacion className="kits-paginacion paginacion" actual={actual} total={totalPaginas}
        paginas={Array.from({ length: totalPaginas }, (_, i) => i + 1)} onCambiar={cambiar} />
    </>
  );
}
