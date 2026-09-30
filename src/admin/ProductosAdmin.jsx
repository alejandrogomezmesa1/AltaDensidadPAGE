import { useCallback, useEffect, useState } from 'react';
import { apiJson } from '../lib/api';
import {
  formatPrecio, toastOk, confirmarEliminar, subirImagen, ImagenCelda, Visible, FilaEstado,
  PaginacionAdmin, usePaginado, ModalAdmin, ZonaImagen, Casillas, SelectInventario, CampoEtiquetas, InterruptorSinStock, BotonSinStockTodos
} from './comunes';

const TALLAS = ['30ml', '50ml', '60ml', '100ml', '120ml', '200ml'];
const ENVASES = ['Vidrio', 'Plástico', 'Aluminio', 'Recargable'];
const NOTAS_VACIAS = { top: [], heart: [], base: [] };
const VACIO = {
  id: '', nombre: '', descripcion: '', categoria: '', genero: '', precio: '', rating: '4', imagen: '', activo: true,
  sizes: [], bottleTypes: [], inventario_id: '',
  marca: '', original: '', familiaId: '', acordes: [], notas: NOTAS_VACIAS
};

// Cuántos bloques de la ficha están completos: marca, original, familia + acordes, pirámide
function completitud(p) {
  const n = p.notes || NOTAS_VACIAS;
  return [
    !!p.brand,
    !!p.originalName,
    !!p.family && (p.accords || []).length > 0,
    n.top.length > 0 && n.heart.length > 0 && n.base.length > 0
  ].filter(Boolean).length;
}

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
  const [catalogos, setCatalogos] = useState({ brands: [], families: [], accords: [], notes: [] });

  // "Vender sin existencias": id = null cambia todos
  const marcarSinStock = useCallback((id, valor) => {
    setProductos((l) => l.map((p) => (id === null || p.id === id
      ? { ...p, vender_sin_stock: valor ? 1 : 0, agotado: valor ? 0 : (p.agotado_data || 0) } : p)));
  }, []);

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

  // Marcas, familias, acordes y notas existentes (sugerencias del formulario)
  const cargarCatalogos = useCallback(() => {
    apiJson('productos/clasificacion', { auth: false }).then((d) => setCatalogos(d.data)).catch(() => {});
  }, []);
  useEffect(() => { cargarCatalogos(); }, [cargarCatalogos]);
  const nombres = (lista) => lista.map((x) => x.name);

  const q = busqueda.toLowerCase();
  const { pagina, filtrados, actual, totalPags, setPagina } = usePaginado(productos,
    (p) => [p.name, p.category, p.gender, p.brand && p.brand.name, p.originalName].some((t) => t && t.toLowerCase().includes(q)), 10);

  const abrir = (p) => {
    setForm(p ? {
      id: p.id, nombre: p.name, descripcion: p.description || '', categoria: p.category, genero: p.gender,
      precio: p.price, rating: String(p.rating ?? 4), imagen: p.image || '', activo: !!p.activo,
      sizes: p.sizes || [], bottleTypes: p.bottleTypes || [], inventario_id: p.inventario_id || '',
      marca: p.brand ? p.brand.name : '', original: p.originalName || '', familiaId: p.family ? String(p.family.id) : '',
      acordes: p.accords || [], notas: p.notes || NOTAS_VACIAS
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
        ...(invListo ? { inventario_id: form.inventario_id ? Number(form.inventario_id) : null } : {}),
        brand: form.marca.trim() || null,
        originalName: form.original.trim() || null,
        familyId: form.familiaId ? Number(form.familiaId) : null,
        accords: form.acordes,
        notes: form.notas
      };
      await apiJson(form.id ? `productos/${form.id}` : 'productos', { method: form.id ? 'PUT' : 'POST', body: payload });
      setModal(false);
      await cargar();
      cargarCatalogos();
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
          <BotonSinStockTodos tabla="productos" lista={productos} onCambio={marcarSinStock} alerta={alerta} />
          <button className="btn-primary" onClick={() => abrir(null)}><i className="fas fa-plus" /> Nuevo Producto</button>
        </div>
      </div>
      <div className="tabla-wrapper">
        <table className="tabla-productos">
          <thead>
            <tr><th>#</th><th>Imagen</th><th>Nombre</th><th>Marca</th><th>Categoría</th><th>Género</th><th>Precio</th><th>Ficha</th><th>Tallas</th><th>Visible</th><th title="Vender aunque DATA no tenga existencias">Sin existencias</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {estado !== 'ok' || !filtrados.length ? (
              <FilaEstado columnas={12} cargando={estado === 'cargando' && 'Cargando productos...'} error={estado === 'error'}
                vacio={busqueda ? 'No se encontraron resultados.' : 'No hay productos en el catálogo.'} />
            ) : pagina.map((p) => (
              <tr key={p.id}>
                <td data-label="#">{p.id}</td>
                <td data-label="Imagen"><ImagenCelda src={p.image} /></td>
                <td data-label="Nombre"><strong>{p.name}</strong>{p.originalName && <><br /><small style={{ color: 'var(--c-mute)' }}>Inspirado en {p.originalName}</small></>}</td>
                <td data-label="Marca">{p.brand ? p.brand.name : '—'}</td>
                <td data-label="Categoría">{p.category}</td>
                <td data-label="Género">{p.gender}</td>
                <td data-label="Precio">{formatPrecio(p.price)}{p.priceReview ? <><br /><small style={{ color: 'var(--err)' }} title="El precio en DATA no cubre el costo: la tienda no lo vende">En revisión</small></> : null}</td>
                <td data-label="Ficha" title="Marca · Original · Familia y acordes · Pirámide de notas">
                  <span className={`ficha-estado ${completitud(p) === 4 ? 'completa' : ''}`}>{completitud(p)}/4</span>
                </td>
                <td data-label="Tallas">{(p.sizes || []).join(', ') || '-'}</td>
                <td data-label="Visible"><Visible activo={p.activo} agotado={p.agotado} /></td>
                <td data-label="Sin existencias"><InterruptorSinStock tabla="productos" item={p} onCambio={marcarSinStock} alerta={alerta} /></td>
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
              <label htmlFor="inputDescripcion">Descripción</label>
              <textarea id="inputDescripcion" rows="3" placeholder="Breve descripción de la fragancia..." {...campo('descripcion')} />
              <small className="hint-data">
                💡 <em>Las notas de salida, corazón y fondo que consultes en Fragrantica van en la sección Clasificación, abajo: así la tienda puede filtrar por ellas.</em>
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
            <div className="form-seccion">
              <h4>Clasificación</h4>
              <small>Se usa en los filtros y en la ficha de la tienda</small>
            </div>
            <div className="form-group">
              <label htmlFor="inputMarca">Marca (casa original)</label>
              <input id="inputMarca" type="text" list="dl-marcas" placeholder="Ej: Dior, Lattafa"
                value={form.marca} onChange={(e) => setForm((f) => ({ ...f, marca: e.target.value }))} />
              <datalist id="dl-marcas">{nombres(catalogos.brands).map((m) => <option key={m} value={m} />)}</datalist>
            </div>
            <div className="form-group">
              <label htmlFor="inputOriginal">Perfume original</label>
              <input id="inputOriginal" type="text" placeholder="Ej: Sauvage (sin la marca)"
                value={form.original} onChange={(e) => setForm((f) => ({ ...f, original: e.target.value }))} />
            </div>
            <div className="form-group">
              <label htmlFor="inputFamilia">Familia olfativa</label>
              <select id="inputFamilia" value={form.familiaId} onChange={(e) => setForm((f) => ({ ...f, familiaId: e.target.value }))}>
                <option value="">-- Sin definir --</option>
                {catalogos.families.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            <div className="form-group full">
              <label htmlFor="inputAcordes">Acordes principales <small>(del más al menos dominante)</small></label>
              <CampoEtiquetas id="inputAcordes" valores={form.acordes} sugerencias={nombres(catalogos.accords)}
                placeholder="Escribe y pulsa Enter: Vainilla, Amaderado…" onCambiar={(acordes) => setForm((f) => ({ ...f, acordes }))} />
            </div>
            {[['top', 'Notas de salida', 'Bergamota, Pimienta…'], ['heart', 'Notas de corazón', 'Lavanda, Geranio…'], ['base', 'Notas de fondo', 'Ambroxan, Cedro…']].map(([nivel, titulo, ejemplo]) => (
              <div className="form-group full" key={nivel}>
                <label htmlFor={`inputNotas-${nivel}`}>{titulo}</label>
                <CampoEtiquetas id={`inputNotas-${nivel}`} valores={form.notas[nivel]} sugerencias={nombres(catalogos.notes)}
                  placeholder={`Escribe y pulsa Enter: ${ejemplo}`}
                  onCambiar={(lista) => setForm((f) => ({ ...f, notas: { ...f.notas, [nivel]: lista } }))} />
              </div>
            ))}
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
