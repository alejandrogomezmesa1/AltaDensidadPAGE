import { useCallback, useEffect, useState } from 'react';
import { apiJson } from '../lib/api';
import { normalizarRuta, desdeFragrantica, rutaPorDefecto } from '../lib/producto';
import {
  formatPrecio, toastOk, confirmarEliminar, subirImagen, ImagenCelda, Visible, FilaEstado,
  PaginacionAdmin, usePaginado, ModalAdmin, ZonaImagen, Casillas, SelectInventario, CampoEtiquetas, InterruptorSinStock, BotonSinStockTodos, InterruptorSoloPreparado, useSemaforo, CeldaStock,
  useProteccionCambios, confirmarDescartar, leerBorrador, guardarBorrador, borrarBorrador, ofrecerBorrador
} from './comunes';

const TALLAS = ['30ml', '50ml', '60ml', '100ml', '120ml', '200ml'];
const ENVASES = ['Vidrio', 'Plástico', 'Aluminio', 'Recargable'];
const NOTAS_VACIAS = { top: [], heart: [], base: [] };
const VACIO = {
  id: '', nombre: '', descripcion: '', categoria: '', genero: '', precio: '', rating: '4', imagen: '', activo: true,
  sizes: [], bottleTypes: [], inventario_id: '',
  marca: '', original: '', familiaId: '', acordes: [], notas: NOTAS_VACIAS,
  fref: '', ruta: ''
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

// Búsqueda en Fragrantica con el perfume original (si se conoce) o el nombre, y su marca
const busquedaFragrantica = (nombre, marca) => {
  const n = String(nombre || '').trim();
  const conMarca = marca && !n.toLowerCase().includes(String(marca).toLowerCase());
  const q = [n, conMarca ? marca : ''].filter(Boolean).join(' ').trim();
  return q ? `https://www.fragrantica.es/search/?query=${encodeURIComponent(q)}` : 'https://www.fragrantica.es';
};

// Referencia en Fragrantica y dirección del perfume en la tienda (/perfume/<ruta>-<id>).
// Al pegar el enlace de Fragrantica se propone la dirección con su marca y nombre; se puede editar.
function EnlacesProducto({ form, setForm }) {
  const ref = form.fref.trim() ? desdeFragrantica(form.fref) : null;
  const propuesta = rutaPorDefecto(form.nombre, form.marca);
  const ruta = normalizarRuta(form.ruta);
  const busqueda = decodeURIComponent(busquedaFragrantica(form.original || form.nombre, form.marca).split('query=')[1] || '');
  const cambiarRef = (valor) => {
    const r = valor.trim() ? desdeFragrantica(valor) : null;
    // Si la dirección estaba vacía o era la propuesta automática, se toma la de Fragrantica
    setForm((f) => ({ ...f, fref: valor, ...(r && (!f.ruta.trim() || normalizarRuta(f.ruta) === rutaPorDefecto(f.nombre, f.marca)) ? { ruta: r.ruta } : {}) }));
  };
  return (
    <div className="form-group full enlaces-producto">
      <div className="enlaces-cab">
        <label htmlFor="inputFragrantica">Referencia en Fragrantica</label>
        <span className="enlaces-botones">
          {ref && (
            <a className="btn-secondary" target="_blank" rel="noopener noreferrer" href={ref.url} title="Notas, acordes, longevidad, estela y demás detalles técnicos">
              <i className="fas fa-flask" /> Abrir ficha técnica ↗
            </a>
          )}
          <a className="link-fragrantica" target="_blank" rel="noopener noreferrer" href={busquedaFragrantica(form.original || form.nombre, form.marca)}>
            <i className="fas fa-search" /> Buscar{busqueda ? ` "${busqueda}"` : ''} ↗
          </a>
        </span>
      </div>
      <input type="text" inputMode="url" id="inputFragrantica" placeholder="https://www.fragrantica.es/perfume/Marca/Nombre-1234.html"
        value={form.fref} onChange={(e) => cambiarRef(e.target.value)} className={form.fref.trim() && !ref ? 'invalid' : undefined} />
      <small className="hint-data">
        {form.fref.trim()
          ? (ref ? <>✓ {ref.marca} · {ref.nombre}</> : 'No parece un enlace de perfume de Fragrantica (…/perfume/Marca/Nombre-1234.html).')
          : 'Búscalo, abre el perfume correcto y pega aquí su dirección.'}
      </small>

      <label htmlFor="inputRuta" style={{ marginTop: 'var(--sp-3)' }}>Dirección en la tienda</label>
      <div className="ruta-campo">
        <span>/perfume/</span>
        <input type="text" id="inputRuta" placeholder={propuesta} value={form.ruta}
          onChange={(e) => setForm((f) => ({ ...f, ruta: e.target.value }))} />
        <span>-{form.id || 'id'}</span>
      </div>
      <div className="ruta-acciones">
        {ref && ruta !== ref.ruta && <button type="button" className="btn-secondary" onClick={() => setForm((f) => ({ ...f, ruta: ref.ruta }))}>Usar la de Fragrantica</button>}
        {ruta !== propuesta && <button type="button" className="btn-secondary" onClick={() => setForm((f) => ({ ...f, ruta: propuesta }))}>Proponer desde marca y nombre</button>}
      </div>
      <small className="hint-data">
        Quedará: <b>/perfume/{ruta || propuesta}-{form.id || 'id'}</b>. No cambia aunque edites el nombre; el número del final hace que los enlaces viejos sigan llegando aquí.
      </small>
    </div>
  );
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

  const semaforo = useSemaforo();

  const marcarPreparado = useCallback((id, valor) => {
    setProductos((l) => l.map((p) => (p.id === id ? { ...p, soloPreparado: valor ? 1 : 0 } : p)));
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
  // "Pendientes Fragrantica": productos que aún no tienen su referencia
  const [soloPendientes, setSoloPendientes] = useState(false);
  const pendientes = productos.filter((p) => !p.fragranticaUrl).length;
  const { pagina, filtrados, actual, totalPags, setPagina } = usePaginado(productos,
    (p) => (!soloPendientes || !p.fragranticaUrl)
      && [p.name, p.category, p.gender, p.brand && p.brand.name, p.originalName].some((t) => t && t.toLowerCase().includes(q)), 10);

  // ── Cambios sin guardar: aviso al salir, confirmación al cerrar y borrador automático ──
  const [inicial, setInicial] = useState(VACIO);
  const huella = (f) => JSON.stringify({ ...f, inventario_id: String(f.inventario_id || ''), precio: String(f.precio ?? '') });
  const sucio = modal && (huella(form) !== huella(inicial) || Boolean(archivo));
  const claveBorrador = `producto_${form.id || 'nuevo'}`;
  useProteccionCambios(sucio);
  useEffect(() => {
    if (!sucio) return undefined;
    const t = setTimeout(() => guardarBorrador(claveBorrador, form), 400);
    return () => clearTimeout(t);
  }, [sucio, form, claveBorrador]);

  const abrir = async (p) => {
    const base = p ? {
      id: p.id, nombre: p.name, descripcion: p.description || '', categoria: p.category, genero: p.gender,
      precio: p.price, rating: String(p.rating ?? 4), imagen: p.image || '', activo: !!p.activo,
      sizes: p.sizes || [], bottleTypes: p.bottleTypes || [], inventario_id: p.inventario_id || '',
      marca: p.brand ? p.brand.name : '', original: p.originalName || '', familiaId: p.family ? String(p.family.id) : '',
      acordes: p.accords || [], notas: p.notes || NOTAS_VACIAS,
      fref: p.fragranticaUrl || '', ruta: p.ruta || ''
    } : VACIO;
    // Borrador pendiente de este producto (o de "nuevo"): se ofrece recuperarlo
    const clave = `producto_${base.id || 'nuevo'}`;
    const borrador = leerBorrador(clave);
    let datos = base;
    if (borrador && huella({ ...base, ...borrador.datos }) !== huella(base)) {
      if (await ofrecerBorrador(borrador, base.nombre || 'un producto nuevo')) datos = { ...base, ...borrador.datos };
      else borrarBorrador(clave);
    }
    setInicial(base);
    setForm(datos);
    setArchivo(null);
    setInvListo(false);
    setInvalidos([]);
    setModal(true);
  };
  // Cerrar con cambios (X, Escape, clic fuera, Cancelar) pide confirmación; descartar borra el borrador
  const cerrar = useCallback(async () => {
    if (sucio && !(await confirmarDescartar())) return;
    borrarBorrador(claveBorrador);
    setModal(false);
  }, [sucio, claveBorrador]);
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
        notes: form.notas,
        fragranticaUrl: form.fref.trim() || null,
        ruta: normalizarRuta(form.ruta) || null
      };
      await apiJson(form.id ? `productos/${form.id}` : 'productos', { method: form.id ? 'PUT' : 'POST', body: payload });
      borrarBorrador(claveBorrador);
      setInicial(form);
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
          <button type="button" className={soloPendientes ? 'btn-primary' : 'btn-secondary'} onClick={() => { setSoloPendientes((v) => !v); setPagina(1); }}
            title="Productos sin referencia de Fragrantica" style={{ whiteSpace: 'nowrap' }}>
            <i className="fas fa-link" /> Pendientes Fragrantica ({pendientes})
          </button>
          <button className="btn-primary" onClick={() => abrir(null)}><i className="fas fa-plus" /> Nuevo Producto</button>
        </div>
      </div>
      <div className="tabla-wrapper">
        <table className="tabla-productos">
          <thead>
            <tr><th>#</th><th>Imagen</th><th>Nombre</th><th>Marca</th><th>Categoría</th><th>Género</th><th>Precio</th><th>Ficha</th><th>Tallas</th><th title="Stock en DATA con el semáforo de Configuraciones">Stock</th><th>Visible</th><th title="Vender aunque DATA no tenga existencias">Sin existencias</th><th title="Solo en esencia: no se vende como 1.1">Solo preparado</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {estado !== 'ok' || !filtrados.length ? (
              <FilaEstado columnas={14} cargando={estado === 'cargando' && 'Cargando productos...'} error={estado === 'error'}
                vacio={busqueda ? 'No se encontraron resultados.' : 'No hay productos en el catálogo.'} />
            ) : pagina.map((p) => (
              <tr key={p.id}>
                <td data-label="#">{p.id}</td>
                <td data-label="Imagen"><ImagenCelda src={p.image} /></td>
                <td data-label="Nombre">
                  <strong>{p.name}</strong>{p.originalName && <><br /><small style={{ color: 'var(--c-mute)' }}>Inspirado en {p.originalName}</small></>}
                  <br />
                  {p.fragranticaUrl
                    ? <a className="ref-fragrantica" href={p.fragranticaUrl} target="_blank" rel="noopener noreferrer" title={p.fragranticaUrl}><i className="fas fa-check" /> Fragrantica</a>
                    : <small className="ref-pendiente">Sin referencia Fragrantica</small>}
                </td>
                <td data-label="Marca">{p.brand ? p.brand.name : '—'}</td>
                <td data-label="Categoría">{p.category}</td>
                <td data-label="Género">{p.gender}</td>
                <td data-label="Precio">{formatPrecio(p.price)}{p.priceReview ? <><br /><small style={{ color: 'var(--err)' }} title="El precio en DATA no cubre el costo: la tienda no lo vende">En revisión</small></> : null}</td>
                <td data-label="Ficha" title="Marca · Original · Familia y acordes · Pirámide de notas">
                  <span className={`ficha-estado ${completitud(p) === 4 ? 'completa' : ''}`}>{completitud(p)}/4</span>
                </td>
                <td data-label="Tallas">{(p.sizes || []).join(', ') || '-'}</td>
                <td data-label="Stock"><CeldaStock inventarioId={p.inventario_id} semaforo={semaforo} /></td>
                <td data-label="Visible"><Visible activo={p.activo} agotado={p.agotado} /></td>
                <td data-label="Sin existencias"><InterruptorSinStock tabla="productos" item={p} onCambio={marcarSinStock} alerta={alerta} /></td>
                <td data-label="Solo preparado"><InterruptorSoloPreparado item={p} onCambio={marcarPreparado} alerta={alerta} /></td>
                <td data-label="Acciones">
                  <div className="acciones">
                    {p.fragranticaUrl
                      ? <a className="btn-icon fragrantica" href={p.fragranticaUrl} target="_blank" rel="noopener noreferrer" title="Ver ficha técnica en Fragrantica"><i className="fas fa-flask" /></a>
                      : <a className="btn-icon fragrantica sin-ref" href={busquedaFragrantica(p.originalName || p.name, p.brand && p.brand.name)} target="_blank" rel="noopener noreferrer"
                        title="Sin referencia: buscar en Fragrantica"><i className="fas fa-search" /></a>}
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
                {desdeFragrantica(form.fref)
                  ? <a href={desdeFragrantica(form.fref).url} target="_blank" rel="noopener noreferrer" className="link-fragrantica" title="Notas, acordes, longevidad, estela y demás detalles técnicos">
                      <i className="fas fa-flask" /> Ver ficha técnica en Fragrantica ↗
                    </a>
                  : <a href={busquedaFragrantica(form.original || form.nombre, form.marca)} target="_blank" rel="noopener noreferrer" className="link-fragrantica" title="Buscar este perfume en Fragrantica">
                      <i className="fas fa-search" /> {form.nombre.trim() ? `Buscar "${form.nombre.trim()}" en Fragrantica ↗` : 'Guía Fragrantica ↗'}
                    </a>}
              </div>
              <input type="text" id="inputNombre" placeholder="Ej: One Million – Paco Rabanne" required {...campo('nombre')} />
            </div>
            <EnlacesProducto form={form} setForm={setForm} />
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
