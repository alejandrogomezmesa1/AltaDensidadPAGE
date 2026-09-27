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
