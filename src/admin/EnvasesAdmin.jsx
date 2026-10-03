import { useCallback, useEffect, useState } from 'react';
import { apiJson } from '../lib/api';
import {
  formatPrecio, toastOk, confirmarEliminar, subirImagen, ImagenCelda, Visible, FilaEstado,
  PaginacionAdmin, usePaginado, ModalAdmin, ZonaImagen, Casillas, enfocarInvalido
} from './comunes';

const TALLAS = ['30ml', '50ml', '60ml', '100ml', '120ml', '200ml'];
const VACIO = { id: '', nombre: '', descripcion: '', material: '', precio: '', imagen: '', activo: true, sizes: [] };

export default function EnvasesAdmin({ alerta }) {
  const [envases, setEnvases] = useState([]);
  const [estado, setEstado] = useState('cargando');
  const [busqueda, setBusqueda] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(VACIO);
  const [archivo, setArchivo] = useState(null);
  const [invalidos, setInvalidos] = useState([]);
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    setEstado('cargando');
    try {
      const data = await apiJson('envases', { auth: false });
      setEnvases(data.data);
      setEstado('ok');
    } catch (err) {
      alerta('Error al cargar envases: ' + err.message, 'error');
      setEstado('error');
    }
  }, [alerta]);

  useEffect(() => { cargar(); }, [cargar]);

  const q = busqueda.toLowerCase();
  const { pagina, filtrados, actual, totalPags, setPagina } = usePaginado(envases,
    (e) => e.name.toLowerCase().includes(q) || (e.material || '').toLowerCase().includes(q), 10);

  const abrir = (e) => {
    setForm(e ? {
      id: e.id, nombre: e.name, descripcion: e.description || '', material: e.material, precio: e.price,
      imagen: e.image || '', activo: !!e.activo, sizes: e.sizes || []
    } : VACIO);
    setArchivo(null);
    setInvalidos([]);
    setModal(true);
  };
  const cerrar = useCallback(() => setModal(false), []);
  const campo = (k) => ({
    value: form[k],
    className: invalidos.includes(k) ? 'invalid' : undefined,
    onChange: (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setInvalidos((l) => l.filter((x) => x !== k)); }
  });

  async function guardar(ev) {
    ev.preventDefault();
    const nombre = form.nombre.trim();
    const precio = String(form.precio ?? '').trim() === '' ? 0 : parseFloat(form.precio);
    const faltan = [
      !nombre && ['nombre', 'nombre'],
      !form.material && ['material', 'material'],
      // Sin tallas el envase no aparece en "Crea tu perfume"
      !form.sizes.length && ['sizes', 'al menos una talla'],
      !(precio >= 0) && ['precio', 'un precio válido']
    ].filter(Boolean);
    if (faltan.length) {
      setInvalidos(faltan.map(([k]) => k));
      alerta(`Completa los campos obligatorios: ${faltan.map(([, t]) => t).join(', ')}.`, 'error');
      enfocarInvalido();
      return;
    }
    setGuardando(true);
    try {
      const image = archivo ? await subirImagen(archivo) : form.imagen.trim();
      await apiJson(form.id ? `envases/${form.id}` : 'envases', {
        method: form.id ? 'PUT' : 'POST',
        body: {
          name: nombre, description: form.descripcion.trim(), material: form.material,
          price: precio, image, sizes: form.sizes, activo: form.activo ? 1 : 0
        }
      });
      setModal(false);
      await cargar();
      toastOk(form.id ? 'Envase actualizado' : 'Envase creado');
    } catch (err) {
      alerta('Error al guardar: ' + err.message, 'error');
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(e) {
    if (!(await confirmarEliminar('envase', e.name))) return;
    try {
      await apiJson(`envases/${e.id}`, { method: 'DELETE' });
      await cargar();
      toastOk('Envase eliminado');
    } catch (err) {
      alerta('Error al eliminar: ' + err.message, 'error');
    }
  }

  return (
    <>
      <div className="admin-toolbar">
        <h2 className="section-title">Catálogo de Envases</h2>
        <div className="admin-toolbar-actions">
          <div className="search-box">
            <i className="fas fa-search" />
            <input type="text" placeholder="Buscar envases..." className="admin-search-input" value={busqueda}
              onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }} />
          </div>
          <button className="btn-primary" onClick={() => abrir(null)}><i className="fas fa-plus" /> Nuevo Envase</button>
        </div>
      </div>
      <div className="tabla-wrapper">
        <table className="tabla-productos">
          <thead>
            <tr><th>#</th><th>Imagen</th><th>Nombre</th><th>Material</th><th>Precio</th><th>Tallas</th><th>Visible</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {estado !== 'ok' || !filtrados.length ? (
              <FilaEstado columnas={8} cargando={estado === 'cargando' && 'Cargando envases...'} error={estado === 'error'}
                vacio={busqueda ? 'No se encontraron resultados.' : 'No hay envases registrados.'} />
            ) : pagina.map((e) => (
              <tr key={e.id}>
                <td data-label="#">{e.id}</td>
                <td data-label="Imagen"><ImagenCelda src={e.image} /></td>
                <td data-label="Nombre"><strong>{e.name}</strong></td>
                <td data-label="Material">{e.material}</td>
                <td data-label="Precio">{formatPrecio(e.price)}</td>
                <td data-label="Tallas">{(e.sizes || []).join(', ') || '-'}</td>
                <td data-label="Visible"><Visible activo={e.activo} /></td>
                <td data-label="Acciones">
                  <div className="acciones">
                    <button className="btn-icon editar" title="Editar" onClick={() => abrir(e)}><i className="fas fa-edit" /></button>
                    <button className="btn-icon eliminar" title="Eliminar" onClick={() => eliminar(e)}><i className="fas fa-trash" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PaginacionAdmin actual={actual} total={totalPags} onCambiar={setPagina} />

      <ModalAdmin abierto={modal} titulo={form.id ? 'Editar Envase' : 'Nuevo Envase'} onCerrar={cerrar}>
        <form className="modal-form" noValidate onSubmit={guardar}>
          <div className="form-grid">
            <div className="form-group full">
              <label htmlFor="envaseNombre">Nombre *</label>
              <input type="text" id="envaseNombre" placeholder="Ej: Frasco Elegance 50ml" required {...campo('nombre')} />
            </div>
            <div className="form-group full">
              <label htmlFor="envaseDescripcion">Descripción</label>
              <textarea id="envaseDescripcion" rows="3" placeholder="Descripción del envase..." {...campo('descripcion')} />
            </div>
            <div className="form-group">
              <label htmlFor="envaseMaterial">Material *</label>
              <select id="envaseMaterial" required {...campo('material')}>
                <option value="">-- Seleccionar --</option>
                {['Vidrio', 'Plástico', 'Aluminio', 'Recargable', 'Cristal'].map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="envasePrecio">Precio de referencia (COP)</label>
              <input type="number" id="envasePrecio" min="0" step="1000" placeholder="0" {...campo('precio')} />
              <small className="hint-data">No se cobra: lo que paga el cliente por el envase se define en «Armador», por tamaño.</small>
            </div>
            <div className="form-group full">
              <label>Imagen del envase</label>
              <ZonaImagen imagen={form.imagen} archivo={archivo} onArchivo={setArchivo} />
            </div>
            <div className="form-group full">
              <label>Tallas disponibles *</label>
              <div className={invalidos.includes('sizes') ? 'invalid grupo-invalido' : undefined} tabIndex={-1}>
                <Casillas opciones={TALLAS} marcadas={form.sizes} onCambiar={(sizes) => { setForm((f) => ({ ...f, sizes })); setInvalidos((l) => l.filter((x) => x !== 'sizes')); }} />
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
    </>
  );
}
