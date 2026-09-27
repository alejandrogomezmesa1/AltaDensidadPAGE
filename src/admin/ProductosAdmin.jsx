import { useCallback, useEffect, useState } from 'react';
import { apiJson } from '../lib/api';
import {
  formatPrecio, toastOk, confirmarEliminar, subirImagen, ImagenCelda, Visible, FilaEstado,
  PaginacionAdmin, usePaginado, ModalAdmin, ZonaImagen, Casillas, SelectInventario
} from './comunes';

const TALLAS = ['30ml', '50ml', '60ml', '100ml', '120ml', '200ml'];
const ENVASES = ['Vidrio', 'Plástico', 'Aluminio', 'Recargable'];
const VACIO = { id: '', nombre: '', descripcion: '', categoria: '', genero: '', precio: '', rating: '4', imagen: '', activo: true, sizes: [], bottleTypes: [], inventario_id: '' };

export default function ProductosAdmin({ alerta }) {
  const [productos, setProductos] = useState([]);
  const [estado, setEstado] = useState('cargando');
  const [busqueda, setBusqueda] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(VACIO);
  const [archivo, setArchivo] = useState(null);
  const [invListo, setInvListo] = useState(false);
  const [invalidos, setInvalidos] = useState([]);
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    setEstado('cargando');
    try {
      const data = await apiJson('productos');
      setProductos(data.data);
      setEstado('ok');
    } catch (err) {
      alerta('Error al cargar productos: ' + err.message, 'error');
      setEstado('error');
    }
  }, [alerta]);

  useEffect(() => { cargar(); }, [cargar]);

  const q = busqueda.toLowerCase();
  const { pagina, filtrados, actual, totalPags, setPagina } = usePaginado(productos,
    (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.gender.toLowerCase().includes(q), 10);

  const abrir = (p) => {
    setForm(p ? {
      id: p.id, nombre: p.name, descripcion: p.description || '', categoria: p.category, genero: p.gender,
      precio: p.price, rating: String(p.rating ?? 4), imagen: p.image || '', activo: !!p.activo,
      sizes: p.sizes || [], bottleTypes: p.bottleTypes || [], inventario_id: p.inventario_id || ''
    } : VACIO);
    setArchivo(null);
    setInvListo(false);
    setInvalidos([]);
    setModal(true);
  };
  const cerrar = useCallback(() => setModal(false), []);
  const campo = (k) => ({
    value: form[k],
    className: invalidos.includes(k) ? 'invalid' : undefined,
    onChange: (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setInvalidos((l) => l.filter((x) => x !== k)); }
  });

  async function guardar(e) {
    e.preventDefault();
    const nombre = form.nombre.trim();
    const precio = parseFloat(form.precio);
    const faltan = [];
    if (!nombre) faltan.push('nombre');
    if (!form.categoria) faltan.push('categoria');
    if (!form.genero) faltan.push('genero');
    if (Number.isNaN(precio)) faltan.push('precio');
    if (faltan.length) { setInvalidos(faltan); alerta('Completa los campos obligatorios.', 'error'); return; }

    setGuardando(true);
    try {
      const image = archivo ? await subirImagen(archivo) : form.imagen.trim();
      const payload = {
        name: nombre, description: form.descripcion.trim(), category: form.categoria, gender: form.genero,
        price: precio, rating: parseInt(form.rating, 10), image, sizes: form.sizes, bottleTypes: form.bottleTypes,
        activo: form.activo ? 1 : 0,
        ...(invListo ? { inventario_id: form.inventario_id ? Number(form.inventario_id) : null } : {})
      };
      await apiJson(form.id ? `productos/${form.id}` : 'productos', { method: form.id ? 'PUT' : 'POST', body: payload });
      setModal(false);
      await cargar();
      toastOk(form.id ? 'Producto actualizado' : 'Producto creado');
    } catch (err) {
      alerta('Error al guardar: ' + err.message, 'error');
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(p) {
    if (!(await confirmarEliminar('producto', p.name))) return;
    try {
      await apiJson(`productos/${p.id}`, { method: 'DELETE' });
      await cargar();
      toastOk('Producto eliminado');
    } catch (err) {
      alerta('Error al eliminar: ' + err.message, 'error');
    }
  }

  return (
    <>
      <div className="admin-toolbar">
        <h2 className="section-title">Catálogo de Productos</h2>
        <div className="admin-toolbar-actions">
          <div className="search-box">
            <i className="fas fa-search" />
            <input type="text" placeholder="Buscar productos..." className="admin-search-input" value={busqueda}
              onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }} />
          </div>
          <a
            href="https://www.fragrantica.es"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
            title="Abrir Fragrantica para consultar notas y pirámides olfativas"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
          >
            <i className="fas fa-flask" style={{ color: 'var(--c-accent)' }} /> Guía Fragrantica ↗
          </a>
          <button className="btn-primary" onClick={() => abrir(null)}><i className="fas fa-plus" /> Nuevo Producto</button>
        </div>
      </div>
      <div className="tabla-wrapper">
        <table className="tabla-productos">
          <thead>
            <tr><th>#</th><th>Imagen</th><th>Nombre</th><th>Categoría</th><th>Género</th><th>Precio</th><th>Rating</th><th>Tallas</th><th>Visible</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {estado !== 'ok' || !filtrados.length ? (
              <FilaEstado columnas={10} cargando={estado === 'cargando' && 'Cargando productos...'} error={estado === 'error'}
                vacio={busqueda ? 'No se encontraron resultados.' : 'No hay productos en el catálogo.'} />
            ) : pagina.map((p) => (
              <tr key={p.id}>
                <td data-label="#">{p.id}</td>
                <td data-label="Imagen"><ImagenCelda src={p.image} /></td>
                <td data-label="Nombre"><strong>{p.name}</strong></td>
                <td data-label="Categoría">{p.category}</td>
                <td data-label="Género">{p.gender}</td>
                <td data-label="Precio">{formatPrecio(p.price)}</td>
                <td data-label="Rating">{p.rating || 0} <i className="fas fa-star" style={{ color: '#f1c40f', fontSize: '0.8rem' }} /></td>
                <td data-label="Tallas">{(p.sizes || []).join(', ') || '-'}</td>
                <td data-label="Visible"><Visible activo={p.activo} agotado={p.agotado} /></td>
                <td data-label="Acciones">
                  <div className="acciones">
                    <button className="btn-icon editar" title="Editar" onClick={() => abrir(p)}><i className="fas fa-edit" /></button>
                    <button className="btn-icon eliminar" title="Eliminar" onClick={() => eliminar(p)}><i className="fas fa-trash" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PaginacionAdmin actual={actual} total={totalPags} onCambiar={setPagina} />

      <ModalAdmin abierto={modal} titulo={form.id ? 'Editar Producto' : 'Nuevo Producto'} onCerrar={cerrar}>
        <form className="modal-form" noValidate onSubmit={guardar}>
          <div className="form-grid">
            <div className="form-group full">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                <label htmlFor="inputNombre">Nombre *</label>
                <a
                  href={form.nombre.trim()
                    ? `https://www.fragrantica.es/search/?query=${encodeURIComponent(form.nombre.trim())}`
                    : 'https://www.fragrantica.es'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-fragrantica"
                  title="Abrir búsqueda en Fragrantica para consultar notas"
                >
                  <i className="fas fa-flask" /> {form.nombre.trim() ? `Consultar notas de "${form.nombre.trim()}" en Fragrantica ↗` : 'Guía Fragrantica de Notas ↗'}
                </a>
              </div>
              <input type="text" id="inputNombre" placeholder="Ej: One Million – Paco Rabanne" required {...campo('nombre')} />
            </div>
            <div className="form-group full">
              <label htmlFor="inputDescripcion">Descripción & Pirámide Olfativa</label>
              <textarea id="inputDescripcion" rows="3" placeholder="Breve descripción y notas olfativas (Salida, Corazón, Fondo)..." {...campo('descripcion')} />
              <small className="hint-data">
                💡 <em>Tip: Puedes copiar de Fragrantica las notas de Salida, Corazón y Fondo para tener una ficha técnica precisa.</em>
              </small>
            </div>
            <div className="form-group">
              <label htmlFor="inputCategoria">Categoría *</label>
              <select id="inputCategoria" required {...campo('categoria')}>
                <option value="">-- Seleccionar --</option>
                <option value="Diseñador">Diseñador</option>
                <option value="Arabe">Arabe</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="inputGenero">Género *</label>
              <select id="inputGenero" required {...campo('genero')}>
                <option value="">-- Seleccionar --</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="inputPrecio">Precio (COP) *</label>
              <input type="number" id="inputPrecio" min="0" step="1000" placeholder="0" required {...campo('precio')} />
            </div>
            <div className="form-group">
              <label htmlFor="inputInventario">Inventario DATA</label>
              {modal && <SelectInventario id="inputInventario" valor={form.inventario_id} onListo={setInvListo}
                onCambiar={(v) => setForm((f) => ({ ...f, inventario_id: v }))} />}
              <small className="hint-data">Enlazado: el stock y precio se toman de DATA y las ventas web descuentan inventario.</small>
            </div>
            <div className="form-group">
              <label htmlFor="inputRating">Rating (1–5)</label>
              <select id="inputRating" {...campo('rating')}>
                <option value="5">5 estrellas</option>
                <option value="4">4 estrellas</option>
                <option value="3">3 estrellas</option>
                <option value="2">2 estrellas</option>
                <option value="1">1 estrella</option>
              </select>
            </div>
            <div className="form-group full">
              <label>Imagen del producto</label>
              <ZonaImagen imagen={form.imagen} archivo={archivo} onArchivo={setArchivo} />
            </div>
            <div className="form-group full">
              <label>Tallas disponibles</label>
              <Casillas opciones={TALLAS} marcadas={form.sizes} onCambiar={(sizes) => setForm((f) => ({ ...f, sizes }))} />
            </div>
            <div className="form-group full">
              <label>Tipos de envase</label>
              <Casillas opciones={ENVASES} marcadas={form.bottleTypes} onCambiar={(bottleTypes) => setForm((f) => ({ ...f, bottleTypes }))} />
            </div>
            <div className="form-group">
              <label>Visibilidad</label>
              <label className="check-item">
                <input type="checkbox" checked={form.activo} onChange={(e) => setForm((f) => ({ ...f, activo: e.target.checked }))} /> Mostrar en el catálogo
              </label>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={cerrar}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={guardando}>
              {guardando ? <><i className="fas fa-spinner fa-spin" /> Guardando...</> : <><i className="fas fa-save" /> Guardar</>}
            </button>
          </div>
        </form>
      </ModalAdmin>
    </>
  );
}
