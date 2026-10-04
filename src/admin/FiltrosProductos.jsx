// Filtros del catálogo en el panel: un modal con grupos de opciones (cada una con cuántos productos
// quedarían), chips con los filtros activos sobre la tabla y orden. Se recuerdan durante la sesión.
import { useMemo } from 'react';
import { ModalAdmin, nivelStock } from './comunes';

export const NOTAS_VACIAS = { top: [], heart: [], base: [] };

// Cuántos bloques de la ficha están completos: marca, original, familia + acordes, pirámide
export function completitud(p) {
  const n = p.notes || NOTAS_VACIAS;
  return [
    !!p.brand,
    !!p.originalName,
    ((p.families || []).length > 0 || !!p.family) && (p.accords || []).length > 0,
    n.top.length > 0 && n.heart.length > 0 && n.base.length > 0
  ].filter(Boolean).length;
}

export const FILTROS_VACIOS = {
  visibilidad: 'todos', stock: 'todos', venta: 'todos', categoria: 'todos', genero: 'todos',
  marca: 'todos', familia: 'todos', ficha: 'todos', foto: 'todos', fragrantica: 'todos',
  precioMin: '', precioMax: '', orden: 'marca'
};

const CLAVE = 'ad_admin_filtros_productos';
export function filtrosGuardados() {
  try { return { ...FILTROS_VACIOS, ...(JSON.parse(sessionStorage.getItem(CLAVE) || 'null') || {}) }; } catch { return FILTROS_VACIOS; }
}
export function guardarFiltros(f) {
  try { sessionStorage.setItem(CLAVE, JSON.stringify(f)); } catch { /* sin almacenamiento */ }
}

const marcaDe = (p) => (p.brand ? p.brand.name : '');
const familiasDe = (p) => (p.families && p.families.length ? p.families : (p.family ? [p.family] : [])).map((f) => f.name);
const nivelDe = (p, semaforo) => {
  if (!p.inventario_id) return 'sin-enlace';
  const item = semaforo.porId.get(Number(p.inventario_id));
  return item ? nivelStock(item, semaforo.config) : 'sin-dato';
};

// Cada grupo: clave, título y sus opciones [valor, etiqueta, prueba(p)]
function grupos(productos, semaforo) {
  const unicos = (lista) => [...new Set(lista.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));
  return [
    { k: 'visibilidad', t: 'Visibilidad', o: [['visible', 'Visibles', (p) => !!p.activo], ['oculto', 'Ocultos', (p) => !p.activo]] },
    { k: 'stock', t: 'Stock en DATA', o: [
      ['disponible', 'Disponible', (p) => nivelDe(p, semaforo) === 'disponible'],
      ['advertencia', 'Advertencia', (p) => nivelDe(p, semaforo) === 'advertencia'],
      ['agotado', 'Agotado', (p) => nivelDe(p, semaforo) === 'agotado'],
      ['sin-enlace', 'Sin enlazar a DATA', (p) => !p.inventario_id]
    ] },
    { k: 'venta', t: 'Venta', o: [
      ['revision', 'Precio en revisión', (p) => !!p.priceReview],
      ['sin-existencias', 'Vende sin existencias', (p) => !!p.vender_sin_stock],
      ['solo-preparado', 'Solo preparado', (p) => !!p.soloPreparado],
      ['sin-precio', 'Sin precio', (p) => !(Number(p.price) > 0)]
    ] },
    { k: 'categoria', t: 'Categoría', o: unicos(productos.map((p) => p.category)).map((c) => [c, c, (p) => p.category === c]) },
    { k: 'genero', t: 'Género', o: unicos(productos.map((p) => p.gender)).map((g) => [g, g, (p) => p.gender === g]) },
    { k: 'marca', t: 'Marca', o: unicos(productos.map(marcaDe)).map((m) => [m, m, (p) => marcaDe(p) === m]) },
    { k: 'familia', t: 'Familia olfativa', o: unicos(productos.flatMap(familiasDe)).map((f) => [f, f, (p) => familiasDe(p).includes(f)]) },
    { k: 'ficha', t: 'Ficha', o: [['completa', 'Completa (4/4)', (p) => completitud(p) === 4], ['incompleta', 'Incompleta', (p) => completitud(p) < 4]] },
    { k: 'foto', t: 'Foto', o: [['con', 'Con foto', (p) => !!p.image], ['sin', 'Sin foto', (p) => !p.image]] },
    { k: 'fragrantica', t: 'Referencia Fragrantica', o: [['con', 'Con referencia', (p) => !!p.fragranticaUrl], ['sin', 'Sin referencia', (p) => !p.fragranticaUrl]] }
  ];
}

export const ORDENES = [
  ['marca', 'Marca (A–Z)'], ['nombre', 'Nombre (A–Z)'], ['recientes', 'Más recientes'],
  ['precio-asc', 'Precio: menor a mayor'], ['precio-desc', 'Precio: mayor a menor'], ['stock', 'Menos stock primero']
];

// Filtra y ordena; también devuelve los grupos para el modal y los chips
export function useFiltrosProductos(productos, filtros, busqueda, semaforo) {
  return useMemo(() => {
    const gs = grupos(productos, semaforo);
    const q = busqueda.trim().toLowerCase();
    const min = parseFloat(filtros.precioMin);
    const max = parseFloat(filtros.precioMax);
    const pasa = (p, salvo) => gs.every((g) => {
      if (g.k === salvo || filtros[g.k] === 'todos') return true;
      const op = g.o.find(([v]) => v === filtros[g.k]);
      return op ? op[2](p) : true;
    })
      && (Number.isNaN(min) || Number(p.price) >= min)
      && (Number.isNaN(max) || Number(p.price) <= max)
      && (!q || [p.name, p.category, p.gender, marcaDe(p), p.originalName, `#${p.id}`].some((t) => t && t.toLowerCase().includes(q)));
    // Cuántos quedarían eligiendo cada opción, con el resto de filtros aplicados
    const conteos = Object.fromEntries(gs.map((g) => {
      const base = productos.filter((p) => pasa(p, g.k));
      return [g.k, { todos: base.length, ...Object.fromEntries(g.o.map(([v, , f]) => [v, base.filter(f).length])) }];
    }));
    const stockDe = (p) => {
      const item = p.inventario_id && semaforo.porId.get(Number(p.inventario_id));
      return item ? Number(item.stock) : Infinity;
    };
    const comparar = {
      marca: (a, b) => (!a.brand - !b.brand) || marcaDe(a).localeCompare(marcaDe(b), 'es') || a.name.localeCompare(b.name, 'es'),
      nombre: (a, b) => a.name.localeCompare(b.name, 'es'),
      recientes: (a, b) => b.id - a.id,
      'precio-asc': (a, b) => Number(a.price) - Number(b.price),
      'precio-desc': (a, b) => Number(b.price) - Number(a.price),
      stock: (a, b) => stockDe(a) - stockDe(b) || a.name.localeCompare(b.name, 'es')
    }[filtros.orden] || (() => 0);
    const lista = productos.filter((p) => pasa(p)).sort(comparar);
    // Chips: [clave, texto] de cada filtro activo
    const activos = gs.filter((g) => filtros[g.k] !== 'todos')
      .map((g) => [g.k, `${g.t}: ${(g.o.find(([v]) => v === filtros[g.k]) || [, filtros[g.k]])[1]}`]);
    if (filtros.precioMin !== '' || filtros.precioMax !== '') {
      const fmt = (v) => `$${Number(v).toLocaleString('es-CO')}`;
      activos.push(['precio', `Precio: ${filtros.precioMin !== '' ? fmt(filtros.precioMin) : '$0'} – ${filtros.precioMax !== '' ? fmt(filtros.precioMax) : 'sin tope'}`]);
    }
    return { lista, grupos: gs, conteos, activos };
  }, [productos, filtros, busqueda, semaforo]);
}

// Quita un filtro activo (chip ×)
export const sinFiltro = (filtros, clave) => (clave === 'precio'
  ? { ...filtros, precioMin: '', precioMax: '' }
  : { ...filtros, [clave]: 'todos' });

export function ModalFiltros({ abierto, onCerrar, filtros, setFiltros, grupos: gs, conteos, total }) {
  const fijar = (k, v) => setFiltros((f) => ({ ...f, [k]: v }));
  return (
    <ModalAdmin abierto={abierto} titulo="Filtrar productos" onCerrar={onCerrar}>
      <div className="modal-form filtros-admin">
        {gs.filter((g) => g.o.length).map((g) => (
          <fieldset className="filtros-grupo" key={g.k}>
            <legend>{g.t}</legend>
            <div className="familias-opciones" role="radiogroup" aria-label={g.t}>
              {[['todos', 'Todos'], ...g.o].map(([v, etiqueta]) => {
                const n = conteos[g.k]?.[v] ?? 0;
                const on = filtros[g.k] === v;
                return (
                  <button type="button" key={v} role="radio" aria-checked={on} disabled={!on && n === 0 && v !== 'todos'}
                    className={`familia-opcion ${on ? 'on' : ''}`} onClick={() => fijar(g.k, v)}>
                    {etiqueta} <span className="filtro-n">{n}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
        <fieldset className="filtros-grupo">
          <legend>Precio (COP)</legend>
          <div className="filtros-precio">
            <input type="number" min="0" step="1000" placeholder="Desde" aria-label="Precio desde" value={filtros.precioMin} onChange={(e) => fijar('precioMin', e.target.value)} />
            <span>–</span>
            <input type="number" min="0" step="1000" placeholder="Hasta" aria-label="Precio hasta" value={filtros.precioMax} onChange={(e) => fijar('precioMax', e.target.value)} />
          </div>
        </fieldset>
        <fieldset className="filtros-grupo">
          <legend>Ordenar por</legend>
          <select value={filtros.orden} onChange={(e) => fijar('orden', e.target.value)} aria-label="Ordenar por">
            {ORDENES.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
          </select>
        </fieldset>
      </div>
      <div className="modal-actions">
        <button type="button" className="btn-secondary" onClick={() => setFiltros((f) => ({ ...FILTROS_VACIOS, orden: f.orden }))}>Limpiar filtros</button>
        <button type="button" className="btn-primary" onClick={onCerrar}>Ver {total} producto{total === 1 ? '' : 's'}</button>
      </div>
    </ModalAdmin>
  );
}
