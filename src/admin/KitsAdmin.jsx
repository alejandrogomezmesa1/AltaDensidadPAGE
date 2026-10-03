import { useCallback, useEffect, useState } from 'react';
import { apiJson } from '../lib/api';
import {
  formatPrecio, toastOk, subirImagen, ImagenCelda, FilaEstado,
  PaginacionAdmin, usePaginado, ModalAdmin, ZonaImagen, SelectInventario, InterruptorSinStock, BotonSinStockTodos, useSemaforo, CeldaStock,
  PRECIO_SOSPECHOSO, confirmarPrecioBajo, enfocarInvalido } from './comunes';

const VACIO = { id: '', nombre: '', descripcion: '', precio: '', imagen: '', activo: true, beneficios: [], inventario_id: '' };

export default function KitsAdmin({ alerta }) {
  const [kits, setKits] = useState([]);
  const [estado, setEstado] = useState('cargando');
  const [busqueda, setBusqueda] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(VACIO);
  const [archivo, setArchivo] = useState(null);
  const [nuevoBeneficio, setNuevoBeneficio] = useState('');
  const [invListo, setInvListo] = useState(false);
  const [invalidos, setInvalidos] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [aEliminar, setAEliminar] = useState(null);

  const semaforo = useSemaforo();

  // "Vender sin existencias": id = null cambia todos
  const marcarSinStock = useCallback((id, valor) => {
    setKits((l) => l.map((k) => (id === null || k.id === id
      ? { ...k, vender_sin_stock: valor ? 1 : 0, agotado: valor ? 0 : (k.agotado_data || 0) } : k)));
  }, []);

  const cargar = useCallback(async () => {
    setEstado('cargando');
    try {
      const data = await apiJson('kits');
      setKits(data.data);
      setEstado('ok');
    } catch (err) {
      alerta('Error al cargar kits: ' + err.message, 'error');
      setEstado('error');
    }
  }, [alerta]);

  useEffect(() => { cargar(); }, [cargar]);

  const q = busqueda.toLowerCase();
  const { pagina, filtrados, actual, totalPags, setPagina } = usePaginado(kits,
    (k) => k.nombre.toLowerCase().includes(q) || (k.descripcion || '').toLowerCase().includes(q), 10);

  const abrir = (k) => {
    setForm(k ? {
      id: k.id, nombre: k.nombre, descripcion: k.descripcion || '', precio: k.precio, imagen: k.imagen || '',
      activo: !!k.activo, beneficios: Array.isArray(k.beneficios) ? [...k.beneficios] : [], inventario_id: k.inventario_id || ''
    } : VACIO);
    setArchivo(null);
    setNuevoBeneficio('');
    setInvListo(false);
    setInvalidos([]);
    setModal(true);
  };
  const cerrar = useCallback(() => setModal(false), []);
  const cerrarEliminar = useCallback(() => setAEliminar(null), []);
  const campo = (k) => ({
    value: form[k],
    className: invalidos.includes(k) ? 'invalid' : undefined,
    onChange: (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setInvalidos((l) => l.filter((x) => x !== k)); }
  });

  const agregarBeneficio = () => {
    const val = nuevoBeneficio.trim();
    if (!val) return;
    setForm((f) => ({ ...f, beneficios: [...f.beneficios, val] }));
    setNuevoBeneficio('');
  };

  async function guardar(e) {
    e.preventDefault();
    const nombre = form.nombre.trim();
    const precio = parseFloat(form.precio);
    if (!nombre) { setInvalidos(['nombre']); alerta('El nombre es obligatorio.', 'error'); enfocarInvalido(); return; }
    // Sin precio el kit se vendería en $0
    if (!(precio > 0)) { setInvalidos(['precio']); alerta('El precio es obligatorio y debe ser mayor que 0.', 'error'); enfocarInvalido(); return; }
    if (precio < PRECIO_SOSPECHOSO && !(await confirmarPrecioBajo(precio))) { setInvalidos(['precio']); enfocarInvalido(); return; }
    setGuardando(true);
    try {
      const imagen = archivo ? await subirImagen(archivo) : form.imagen.trim();
      const payload = {
        nombre, descripcion: form.descripcion.trim(), precio, imagen, beneficios: form.beneficios, activo: form.activo ? 1 : 0,
        ...(invListo ? { inventario_id: form.inventario_id ? Number(form.inventario_id) : null } : {})
      };
      await apiJson(form.id ? `kits/${form.id}` : 'kits', { method: form.id ? 'PUT' : 'POST', body: payload });
      setModal(false);
      await cargar();
      toastOk(form.id ? 'Kit actualizado' : 'Kit creado');
    } catch (err) {
      alerta('Error al guardar: ' + err.message, 'error');
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar() {
    try {
      await apiJson(`kits/${aEliminar.id}`, { method: 'DELETE' });
      setAEliminar(null);
      await cargar();
      toastOk('Kit eliminado');
    } catch (err) {
      alerta('Error al eliminar: ' + err.message, 'error');
    }
  }

  return (
    <>
      <div className="admin-toolbar">
        <h2 className="section-title">Catálogo de Kits</h2>
        <div className="admin-toolbar-actions">
          <div className="search-box">
            <i className="fas fa-search" />
            <input type="text" placeholder="Buscar kits..." className="admin-search-input" value={busqueda}
              onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }} />
          </div>
          <BotonSinStockTodos tabla="kits" lista={kits} onCambio={marcarSinStock} alerta={alerta} />
          <button className="btn-primary" onClick={() => abrir(null)}><i className="fas fa-plus" /> Nuevo Kit</button>
        </div>
      </div>
      <div className="tabla-wrapper">
        <table className="tabla-productos tabla-compacta">
          <thead>
            <tr>
              <th>Kit</th>
              <th title="Precio en la tienda y stock en DATA con el semáforo de Configuraciones">Precio y stock</th>
              <th>Estado</th>
              <th className="col-acciones">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {estado !== 'ok' || !filtrados.length ? (
              <FilaEstado columnas={4} cargando={estado === 'cargando' && 'Cargando kits...'} error={estado === 'error'}
                vacio={busqueda ? 'No se encontraron resultados.' : 'No hay kits registrados.'} />
            ) : pagina.map((k) => (
              <tr key={k.id}>
                <td data-label="Kit" className="col-producto">
                  <button type="button" className="celda-producto" onClick={() => abrir(k)} title="Editar kit">
                    <ImagenCelda src={k.imagen} />
                    <span className="celda-producto-texto">
                      <strong>{k.nombre} <span className="celda-id">#{k.id}</span></strong>
                      {k.descripcion && <small className="celda-meta celda-recorte">{k.descripcion}</small>}
                    </span>
                  </button>
                </td>
                <td data-label="Precio y stock">
                  <strong className="celda-precio">{formatPrecio(k.precio)}</strong>
                  <span className="celda-bloque"><CeldaStock inventarioId={k.inventario_id} semaforo={semaforo} /></span>
                </td>
                <td data-label="Estado" className="col-estado">
                  <span className={`estado-visible ${k.activo ? '' : 'oculto'}`}>
                    <i className={`fas ${k.activo ? 'fa-eye' : 'fa-eye-slash'}`} /> {k.activo ? 'Visible' : 'Oculto'}
                    {k.agotado ? <span className="badge-agotado" title="Sin stock en DATA">Agotado</span> : null}
                  </span>
                  <InterruptorSinStock tabla="kits" item={k} onCambio={marcarSinStock} alerta={alerta} etiqueta="Sin existencias" />
                </td>
                <td data-label="Acciones" className="col-acciones">
                  <div className="acciones">
                    <button className="btn-icon editar" title="Editar" onClick={() => abrir(k)}><i className="fas fa-edit" /></button>
                    <button className="btn-icon eliminar" title="Eliminar" onClick={() => setAEliminar(k)}><i className="fas fa-trash" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PaginacionAdmin actual={actual} total={totalPags} onCambiar={setPagina} />

      <ModalAdmin abierto={modal} titulo={form.id ? 'Editar Kit' : 'Nuevo Kit'} onCerrar={cerrar}>
        <form className="modal-form" noValidate onSubmit={guardar}>
          <div className="form-grid">
            <div className="form-group full">
              <label htmlFor="kitNombre">Nombre *</label>
              <input type="text" id="kitNombre" placeholder="Ej: Kit Haya" required {...campo('nombre')} />
            </div>
            <div className="form-group full">
              <label htmlFor="kitDescripcion">Descripción</label>
              <textarea id="kitDescripcion" rows="3" placeholder="Descripción del kit..." {...campo('descripcion')} />
            </div>
            <div className="form-group">
              <label htmlFor="kitPrecio">Precio (COP) *</label>
              <input type="number" id="kitPrecio" min="1" step="1000" placeholder="Ej: 120000" required {...campo('precio')} />
            </div>
            <div className="form-group">
              <label htmlFor="kitInventario">Inventario DATA</label>
              {modal && <SelectInventario id="kitInventario" valor={form.inventario_id} onListo={setInvListo}
                onCambiar={(v) => setForm((f) => ({ ...f, inventario_id: v }))} />}
              <small className="hint-data">Enlazado: el stock y precio se toman de DATA y las ventas web descuentan inventario.</small>
            </div>
            <div className="form-group full">
              <label>Imagen del kit</label>
              <ZonaImagen imagen={form.imagen} archivo={archivo} onArchivo={setArchivo} />
            </div>
            <div className="form-group full">
              <label>Beneficios</label>
              <div className="checkboxes-grid" style={{ flexDirection: 'column', gap: 8 }}>
                {form.beneficios.map((b, idx) => (
                  <div key={`${b}-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{b}</span>
                    <button type="button" className="btn-icon eliminar" title="Quitar"
                      onClick={() => setForm((f) => ({ ...f, beneficios: f.beneficios.filter((_, j) => j !== idx) }))}>
                      <i className="fas fa-times" />
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <input type="text" placeholder="Agregar beneficio..." style={{ flex: 1 }} value={nuevoBeneficio}
                  onChange={(e) => setNuevoBeneficio(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); agregarBeneficio(); } }} />
                <button type="button" className="btn-primary" onClick={agregarBeneficio}><i className="fas fa-plus" /> Agregar</button>
              </div>
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

      <ModalAdmin abierto={!!aEliminar} titulo="Eliminar Kit" onCerrar={cerrarEliminar} confirmar>
        <p className="confirm-msg">¿Estás seguro de que deseas eliminar <strong>{aEliminar?.nombre}</strong>? Esta acción no se puede deshacer.</p>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={cerrarEliminar}>Cancelar</button>
          <button className="btn-danger" onClick={eliminar}><i className="fas fa-trash" /> Eliminar</button>
        </div>
      </ModalAdmin>
    </>
  );
}
