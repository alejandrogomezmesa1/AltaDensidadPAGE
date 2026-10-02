// Piezas compartidas del panel: tablas, paginación, modales, carga de imágenes y enlace con DATA
import { useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import { API } from '../config';
import { apiJson, authHeaders } from '../lib/api';
import { paginasVisibles } from '../lib/producto';

export const formatPrecio = (n) => (n != null ? `$${Number(n).toLocaleString('es-CO')}` : '-');

export function toastOk(titulo) {
  Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: titulo, showConfirmButton: false, timer: 3000, background: '#1a1a1a', color: '#D4AF37' });
}

export async function confirmarEliminar(tipo, nombre) {
  const r = await Swal.fire({
    title: `¿Eliminar ${tipo}?`,
    html: `¿Seguro que deseas eliminar <strong>${String(nombre).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))}</strong>?<br>Esta acción no se puede deshacer.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: '<i class="fas fa-trash"></i> Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#c0392b',
    cancelButtonColor: '#444',
    background: '#1a1a1a',
    color: '#fff'
  });
  return r.isConfirmed;
}

// Sube la imagen a /api/upload (Cloudinary en producción) y devuelve su ruta
export async function subirImagen(file) {
  const fd = new FormData();
  fd.append('imagen', file);
  const res = await fetch(`${API}/upload`, { method: 'POST', headers: authHeaders(false), body: fd });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.path;
}

export function rutaImagen(src) {
  let s = src.trim();
  if (s.startsWith('img/')) s = 'assets/' + s;
  else if (!s.startsWith('http://') && !s.startsWith('https://') && !s.startsWith('assets/') && !s.startsWith('/')) s = 'assets/img/' + s;
  if (s.startsWith('assets/')) s = '/' + s;
  return s.replace(/cartier\.jpeg$/i, 'CARTIER.jpeg');
}

export function ImagenCelda({ src }) {
  const [fallo, setFallo] = useState(false);
  if (!src || fallo) return <div className="sin-imagen"><i className="fas fa-image" /></div>;
  return <img className="tabla-img" src={rutaImagen(src)} alt="producto" onError={() => setFallo(true)} />;
}

export function Visible({ activo, agotado }) {
  return (
    <>
      {activo ? <i className="fas fa-eye" style={{ color: '#27ae60' }} /> : <i className="fas fa-eye-slash" style={{ color: '#e74c3c' }} />}
      {agotado ? <> <span title="Sin stock en DATA" style={{ color: '#e74c3c', fontSize: '0.75rem', fontWeight: 600 }}>AGOTADO</span></> : null}
    </>
  );
}

export function FilaEstado({ columnas, cargando, error, vacio }) {
  if (cargando) return <tr><td colSpan={columnas} className="loading-row"><i className="fas fa-spinner fa-spin" /> {cargando}</td></tr>;
  if (error) return <tr><td colSpan={columnas} className="empty-row"><i className="fas fa-exclamation-circle" /> No se pudo conectar con el servidor.</td></tr>;
  return <tr><td colSpan={columnas} className="empty-row">{vacio}</td></tr>;
}

export function PaginacionAdmin({ actual, total, onCambiar }) {
  if (total <= 1) return <div className="admin-paginacion" />;
  const boton = (contenido, pag, deshabilitado, activo, clave) => (
    <button key={clave} className={`admin-pag-btn${activo ? ' admin-pag-active' : ''}${deshabilitado ? ' admin-pag-disabled' : ''}`}
      disabled={deshabilitado} onClick={() => onCambiar(pag)}>{contenido}</button>
  );
  return (
    <div className="admin-paginacion">
      {boton(<i className="fas fa-chevron-left" />, actual - 1, actual === 1, false, 'ant')}
      {paginasVisibles(actual, total).map((p, i) => (p === '...'
        ? <span key={`e${i}`} className="admin-pag-ellipsis">…</span>
        : boton(p, p, false, p === actual, p)))}
      {boton(<i className="fas fa-chevron-right" />, actual + 1, actual === total, false, 'sig')}
    </div>
  );
}

// Filtra y pagina una lista del panel
export function usePaginado(lista, filtro, porPagina) {
  const [pagina, setPagina] = useState(1);
  const filtrados = lista.filter(filtro);
  const totalPags = Math.ceil(filtrados.length / porPagina);
  const actual = pagina > totalPags && totalPags > 0 ? totalPags : pagina;
  return {
    filtrados,
    pagina: filtrados.slice((actual - 1) * porPagina, actual * porPagina),
    actual, totalPags, setPagina
  };
}

// Modal del panel: se cierra con el botón, con Escape o al hacer clic fuera de la caja
export function ModalAdmin({ abierto, titulo, onCerrar, confirmar, children }) {
  useEffect(() => {
    if (!abierto) return undefined;
    document.body.style.overflow = 'hidden';
    const esc = (e) => { if (e.key === 'Escape') onCerrar(); };
    document.addEventListener('keydown', esc);
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', esc); };
  }, [abierto, onCerrar]);
  return (
    <div className={`modal-overlay ${abierto ? '' : 'hidden'}`} onClick={(e) => { if (e.target === e.currentTarget) onCerrar(); }}>
      <div className={`modal-box ${confirmar ? 'modal-confirm' : ''}`}>
        <div className="modal-header">
          <h3>{titulo}</h3>
          <button type="button" className="modal-cerrar" onClick={onCerrar}><i className="fas fa-times" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Zona de imagen con vista previa: el archivo se sube al guardar
export function ZonaImagen({ imagen, archivo, onArchivo }) {
  const [preview, setPreview] = useState('');
  const inputRef = useRef(null);
  useEffect(() => {
    if (!archivo) { setPreview(''); if (inputRef.current) inputRef.current.value = ''; return undefined; }
    const url = URL.createObjectURL(archivo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [archivo]);
  const src = preview || (imagen ? rutaImagen(imagen) : '');
  const nombre = archivo ? archivo.name : (imagen ? imagen.split('/').pop() : 'Sin imagen seleccionada');
  return (
    <div className="img-upload-zone">
      <img className="img-preview" src={src} alt="Vista previa" style={{ display: src ? 'block' : 'none' }} />
      <div className="img-upload-actions">
        <label className="btn-upload-img" onClick={() => inputRef.current?.click()}>
          <i className="fas fa-upload" /> Seleccionar imagen
        </label>
        <span className="img-filename">{nombre}</span>
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" style={{ display: 'none' }}
        onChange={(e) => onArchivo(e.target.files[0] || null)} />
    </div>
  );
}

export function Casillas({ opciones, marcadas, onCambiar }) {
  return (
    <div className="checkboxes-grid">
      {opciones.map((v) => (
        <label className="check-item" key={v}>
          <input type="checkbox" checked={marcadas.includes(v)}
            onChange={(e) => onCambiar(e.target.checked ? [...marcadas, v] : marcadas.filter((x) => x !== v))} /> {v}
        </label>
      ))}
    </div>
  );
}

// ── Enlace con el inventario de DATA ──
let inventarioData = null;
async function obtenerInventarioData() {
  if (inventarioData) return inventarioData;
  const data = await apiJson('admin/integracion/inventario');
  inventarioData = data.data;
  return inventarioData;
}

// Selector del ítem de DATA. Si la integración no responde queda deshabilitado
// y al guardar no se envía inventario_id (el enlace existente no se toca).
export function SelectInventario({ id, valor, onCambiar, onListo }) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let vivo = true;
    obtenerInventarioData()
      .then((d) => { if (vivo) { setItems(d); onListo(true); } })
      .catch(() => { if (vivo) { setError(true); onListo(false); } });
    return () => { vivo = false; };
  }, [onListo]);
  return (
    <select id={id} disabled={!items} value={items ? (valor ? String(valor) : '') : ''} onChange={(e) => onCambiar(e.target.value)}>
      {!items && <option value="">{error ? 'Integración DATA no disponible' : 'Cargando…'}</option>}
      {items && <option value="">Sin enlazar</option>}
      {items && items.map((i) => <option key={i.id} value={i.id}>{i.name} · stock {Number(i.stock)}</option>)}
    </select>
  );
}

// Lista de etiquetas (acordes, notas): Enter o coma agrega, × quita; sugiere valores existentes
// ── Separar acordes y notas pegados de golpe (p. ej. copiados de Fragrantica) ──
const sinAcentos = (t) => String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();

// Un renglón por etiqueta; también comas, punto y coma, viñetas o barras. Se quitan porcentajes sueltos.
function partirTexto(texto) {
  return String(texto || '')
    .split(/[\r\n\t,;•·|]+/)
    .map((t) => t.replace(/\d+([.,]\d+)?\s*%/g, '').replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

// Frases de varias palabras frecuentes en Fragrantica (español) que no deben partirse aunque aún
// no estén en el catálogo. Las unidas con "de" (algodón de azúcar, flor de naranjo) se detectan solas.
const FRASES_COMUNES = [
  'floral blanco', 'especiado suave', 'especiado cálido', 'especiado fresco', 'notas verdes', 'notas marinas',
  'notas acuáticas', 'frutas tropicales', 'frutos rojos', 'frutos secos', 'pimienta rosa', 'pimienta negra',
  'almizcle blanco', 'ámbar gris', 'haba tonka', 'té verde', 'té negro', 'sal marina', 'manzana verde',
  'grosella negra', 'grosellas negras', 'almendra amarga', 'azúcar moreno', 'caramelo salado',
  'jazmín sambac', 'ylang ylang', 'vainilla bourbon', 'sándalo australiano', 'cedro de virginia'
];

// Corta un texto de varias palabras usando los nombres que ya existen y las frases comunes (la más
// larga primero): "dulce floral blanco amaderado" → dulce · floral blanco · amaderado. Una palabra
// que no coincide con nada va sola, salvo que la siga "de" / "del" (algodón de azúcar).
function segmentar(texto, conocidos) {
  const dic = new Map([...FRASES_COMUNES, ...conocidos].map((c) => [sinAcentos(c), c]));
  const palabras = texto.replace(/\s+/g, ' ').trim().split(' ');
  const out = [];
  for (let i = 0; i < palabras.length;) {
    let hallado = null;
    for (let n = Math.min(4, palabras.length - i); n >= 1; n--) {
      const frase = palabras.slice(i, i + n).join(' ');
      if (dic.has(sinAcentos(frase))) { hallado = { texto: conocidos.find((c) => sinAcentos(c) === sinAcentos(frase)) || frase, n }; break; }
    }
    if (hallado) {
      out.push(hallado.texto);
      i += hallado.n;
      continue;
    }
    // "X de Y" / "X de la Y" / "X del Y"
    const sig = sinAcentos(palabras[i + 1] || '');
    if ((sig === 'de' || sig === 'del') && palabras[i + 2]) {
      const conLa = sig === 'de' && ['la', 'los', 'las'].includes(sinAcentos(palabras[i + 2])) && palabras[i + 3];
      const n = conLa ? 4 : 3;
      out.push(palabras.slice(i, i + n).join(' '));
      i += n;
      continue;
    }
    out.push(palabras[i]);
    i += 1;
  }
  return out;
}

export function CampoEtiquetas({ id, valores, onCambiar, sugerencias = [], placeholder }) {
  const [texto, setTexto] = useState('');
  const listaId = `${id}-sugerencias`;
  // Reutiliza la escritura existente ("vainilla" → "Vainilla") y no repite etiquetas
  const agregarVarios = (lista) => {
    const nuevos = [...valores];
    for (const bruto of lista) {
      const nombre = bruto.replace(/\s+/g, ' ').trim();
      if (!nombre) continue;
      const existente = sugerencias.find((s) => sinAcentos(s) === sinAcentos(nombre)) || nombre;
      if (!nuevos.some((v) => sinAcentos(v) === sinAcentos(existente))) nuevos.push(existente);
    }
    if (nuevos.length !== valores.length) onCambiar(nuevos);
    setTexto('');
  };
  const agregar = (bruto) => agregarVarios(partirTexto(bruto));
  const separar = (v) => {
    const partes = segmentar(v, sugerencias);
    const i = valores.indexOf(v);
    const resto = valores.filter((x) => x !== v);
    const nuevos = partes.filter((p) => !resto.some((x) => sinAcentos(x) === sinAcentos(p)));
    onCambiar([...resto.slice(0, i), ...nuevos, ...resto.slice(i)]);
  };
  return (
    <div className="campo-etiquetas">
      {valores.map((v) => (
        <span className="etiqueta" key={v}>
          {v}
          {v.trim().split(/\s+/).length >= 3 && segmentar(v, sugerencias).length > 1 && (
            <button type="button" className="etiqueta-separar" title="Separar en varias etiquetas" onClick={() => separar(v)}>Separar</button>
          )}
          <button type="button" aria-label={`Quitar ${v}`} onClick={() => onCambiar(valores.filter((x) => x !== v))}><i className="fas fa-times" /></button>
        </span>
      ))}
      <input
        id={id} type="text" list={listaId} value={texto} placeholder={valores.length ? '' : placeholder}
        onChange={(e) => {
          const v = e.target.value;
          if (v.endsWith(',')) agregar(v.slice(0, -1));
          else setTexto(v);
        }}
        // Al pegar, el campo convertiría los saltos de línea en espacios: se leen antes, del portapapeles
        onPaste={(e) => {
          const pegado = e.clipboardData.getData('text');
          const partes = partirTexto(pegado);
          if (partes.length > 1) {
            e.preventDefault();
            agregarVarios(texto.trim() ? [texto, ...partes] : partes);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); agregar(texto); }
          else if (e.key === 'Backspace' && !texto && valores.length) onCambiar(valores.slice(0, -1));
        }}
        onBlur={() => agregar(texto)}
      />
      <datalist id={listaId}>
        {sugerencias.filter((s) => !valores.includes(s)).map((s) => <option key={s} value={s} />)}
      </datalist>
    </div>
  );
}

// "Vender sin existencias": la tienda deja comprar el perfume o kit aunque DATA no tenga stock
export function InterruptorSinStock({ tabla, item, onCambio, alerta }) {
  const [guardando, setGuardando] = useState(false);
  const activo = Boolean(item.vender_sin_stock);
  const cambiar = async () => {
    setGuardando(true);
    try {
      await apiJson('catalogo/sin-stock', { method: 'PUT', body: { tabla, id: item.id, valor: !activo } });
      onCambio(item.id, !activo);
    } catch (err) {
      alerta('No se pudo guardar: ' + err.message, 'error');
    } finally {
      setGuardando(false);
    }
  };
  return (
    <label className="check-item sin-stock" title="Se puede comprar en la tienda aunque DATA no tenga existencias">
      <input type="checkbox" checked={activo} disabled={guardando} onChange={cambiar} />
      {activo ? ' Sí' : ' No'}
      {activo && item.agotado_data ? <small> · sin stock en DATA</small> : null}
    </label>
  );
}

export function BotonSinStockTodos({ tabla, lista, onCambio, alerta }) {
  const todos = lista.length > 0 && lista.every((x) => x.vender_sin_stock);
  const cambiar = async () => {
    const r = await Swal.fire({
      title: todos ? '¿Desactivar para todos?' : '¿Vender todo sin existencias?',
      html: todos
        ? 'Los productos sin stock en DATA volverán a mostrarse <strong>agotados</strong> en la tienda.'
        : 'Todos se podrán comprar en la tienda <strong>aunque DATA no tenga existencias</strong>. El precio en revisión sigue bloqueando la venta.',
      icon: 'question', showCancelButton: true, confirmButtonText: todos ? 'Desactivar todos' : 'Activar todos', cancelButtonText: 'Cancelar',
      background: '#1a1a1a', color: '#fff', confirmButtonColor: '#9A7B3F', cancelButtonColor: '#444'
    });
    if (!r.isConfirmed) return;
    try {
      await apiJson('catalogo/sin-stock', { method: 'PUT', body: { tabla, valor: !todos } });
      onCambio(null, !todos);
      toastOk(todos ? 'Desactivado para todos' : 'Activado para todos');
    } catch (err) {
      alerta('No se pudo guardar: ' + err.message, 'error');
    }
  };
  return (
    <button type="button" className="btn-secondary" onClick={cambiar} title="Vender sin existencias en todos" style={{ whiteSpace: 'nowrap' }}>
      <i className="fas fa-box-open" /> {todos ? 'Sin existencias: desactivar todos' : 'Vender sin existencias: todos'}
    </button>
  );
}

// "Solo preparado": la fragancia solo está en esencia; no se vende como 1.1, sí en "Crea tu perfume"
export function InterruptorSoloPreparado({ item, onCambio, alerta }) {
  const [guardando, setGuardando] = useState(false);
  const activo = Boolean(item.soloPreparado);
  const cambiar = async () => {
    setGuardando(true);
    try {
      await apiJson('catalogo/solo-preparado', { method: 'PUT', body: { id: item.id, valor: !activo } });
      onCambio(item.id, !activo);
    } catch (err) {
      alerta('No se pudo guardar: ' + err.message, 'error');
    } finally {
      setGuardando(false);
    }
  };
  return (
    <label className="check-item" title="Solo en esencia: sale de Perfumes 1.1 y queda en «Crea tu perfume»">
      <input type="checkbox" checked={activo} disabled={guardando} onChange={cambiar} />
      {activo ? ' Sí' : ' No'}
    </label>
  );
}

// ── Semáforo de stock (Configuraciones de DATA) ──
// Rojo = agotado · Amarillo = advertencia (en el límite o por debajo) · Verde = disponible.
// El límite es el stock mínimo del ítem en DATA si lo tiene; si no, el de Configuraciones.
const CONFIG_DEFECTO = { stock_advertencia_und: 1, stock_advertencia_ml: 30 };
export const NIVELES_STOCK = {
  agotado: { etiqueta: 'Agotado', color: 'var(--err)' },
  advertencia: { etiqueta: 'Advertencia', color: 'var(--warn)' },
  disponible: { etiqueta: 'Disponible', color: 'var(--ok)' }
};

export function nivelStock(item, config = CONFIG_DEFECTO) {
  const stock = Number(item.stock) || 0;
  if (stock <= 0) return 'agotado';
  const c = { ...CONFIG_DEFECTO, ...config };
  const limite = Number(item.minStock) > 0 ? Number(item.minStock) : (item.unit === 'ml' ? c.stock_advertencia_ml : c.stock_advertencia_und);
  return stock <= Number(limite) ? 'advertencia' : 'disponible';
}

// Stock de DATA por inventario_id y límites del semáforo (una carga compartida por las tablas)
let cargaSemaforo = null;
export function recargarSemaforo() { cargaSemaforo = null; }
export function useSemaforo() {
  const [datos, setDatos] = useState({ porId: new Map(), config: CONFIG_DEFECTO, listo: false });
  useEffect(() => {
    let vivo = true;
    if (!cargaSemaforo) {
      cargaSemaforo = Promise.all([
        apiJson('admin/integracion/inventario').then((r) => r.data).catch(() => []),
        apiJson('admin/configuraciones').then((r) => r.data.valores).catch(() => ({}))
      ]);
    }
    cargaSemaforo.then(([inv, config]) => {
      if (vivo) setDatos({ porId: new Map(inv.map((i) => [Number(i.id), i])), config: { ...CONFIG_DEFECTO, ...config }, listo: true });
    });
    return () => { vivo = false; };
  }, []);
  return datos;
}

export function CeldaStock({ inventarioId, semaforo }) {
  if (!inventarioId) return <span style={{ color: 'var(--c-mute)' }} title="No está enlazado con DATA">—</span>;
  const item = semaforo.porId.get(Number(inventarioId));
  if (!item) return <span style={{ color: 'var(--c-mute)' }}>{semaforo.listo ? 'Sin dato' : '…'}</span>;
  const nivel = NIVELES_STOCK[nivelStock(item, semaforo.config)];
  return (
    <span className="semaforo" style={{ color: nivel.color }} title={nivel.etiqueta}>
      <i /> {Number(item.stock).toLocaleString('es-CO', { maximumFractionDigits: 2 })}{item.unit === 'ml' ? ' ml' : ''}
    </span>
  );
}
