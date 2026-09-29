// Esencias e insumos a la venta: salen del inventario de DATA (tipo esencia, base, feromona,
// envase o accesorio). Aquí se decide cuáles se muestran en la tienda y se les pone foto y descripción.
// Nombre, precio y stock se editan en DATA.
import { useCallback, useEffect, useState } from 'react';
import { apiJson } from '../lib/api';
import { formatPrecio, toastOk, subirImagen, ImagenCelda, FilaEstado, ModalAdmin, ZonaImagen } from './comunes';
import { ETIQUETA_TIPO } from '../lib/catalogo';

export default function InsumosAdmin({ alerta }) {
  const [insumos, setInsumos] = useState([]);
  const [estado, setEstado] = useState('cargando');
  const [aviso, setAviso] = useState('');
  const [form, setForm] = useState(null);
  const [archivo, setArchivo] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    setEstado('cargando');
    try {
      const data = await apiJson('catalogo/insumos/panel');
      setInsumos(data.data);
      setAviso(data.disponible ? '' : 'La conexión con DATA no está configurada en el servidor: no se pueden leer los insumos.');
      setEstado('ok');
    } catch (err) {
      setAviso(err.message);
      setEstado('error');
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const guardarFicha = async (i, cambios) => {
    const ficha = { visible: i.visible, imagen: i.image || '', descripcion: i.description || '', orden: i.orden || 0, ...cambios };
    await apiJson(`catalogo/insumos/${i.id}`, { method: 'PUT', body: ficha });
  };

  async function alternar(i) {
    try {
      await guardarFicha(i, { visible: !i.visible });
      setInsumos((l) => l.map((x) => (x.id === i.id ? { ...x, visible: !i.visible } : x)));
      toastOk(i.visible ? 'Oculto en la tienda' : 'Visible en la tienda');
    } catch (err) {
      alerta('Error al guardar: ' + err.message, 'error');
    }
  }

  async function guardar(ev) {
    ev.preventDefault();
    setGuardando(true);
    try {
      const imagen = archivo ? await subirImagen(archivo) : form.imagen.trim();
      await guardarFicha(form.insumo, { imagen, descripcion: form.descripcion.trim(), orden: Number(form.orden) || 0, visible: form.visible });
      setForm(null);
      await cargar();
      toastOk('Insumo actualizado');
    } catch (err) {
      alerta('Error al guardar: ' + err.message, 'error');
    } finally {
      setGuardando(false);
    }
  }

  const abrir = (i) => {
    setArchivo(null);
    setForm({ insumo: i, imagen: i.image || '', descripcion: i.description || '', orden: i.orden || 0, visible: i.visible });
  };

  return (
    <>
      <div className="admin-toolbar">
        <h2 className="section-title">Esencias e insumos</h2>
        <div className="admin-toolbar-actions">
          <button className="btn-secondary" onClick={cargar}><i className="fas fa-sync" /> Actualizar desde DATA</button>
        </div>
      </div>
      <p className="armador-ayuda">
        Aparecen los ítems de DATA con tipo <b>esencia, base, feromona, envase o accesorio</b>. Marca cuáles se venden en la tienda
        (pestañas Esencias e Insumos del catálogo). Si DATA los mide en ml, su precio es por ml y se venden en las presentaciones
        definidas en «Crea tu perfume». Nombre, precio y stock se cambian en DATA.
      </p>
      {aviso && <p className="armador-ayuda armador-aviso">{aviso}</p>}
      <div className="tabla-wrapper">
        <table className="tabla-productos">
          <thead>
            <tr><th>Imagen</th><th>Nombre</th><th>Tipo</th><th>Precio</th><th>Stock</th><th>En la tienda</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {estado !== 'ok' || !insumos.length ? (
              <FilaEstado columnas={7} cargando={estado === 'cargando' && 'Cargando insumos de DATA...'} error={estado === 'error'}
                vacio="DATA no tiene ítems de tipo esencia, base, feromona, envase o accesorio. Asigna el tipo en el inventario de DATA." />
            ) : insumos.map((i) => (
              <tr key={i.id}>
                <td data-label="Imagen"><ImagenCelda src={i.image} /></td>
                <td data-label="Nombre"><strong>{i.name}</strong>{i.category ? <><br /><small>{i.category}</small></> : null}</td>
                <td data-label="Tipo">{ETIQUETA_TIPO[i.type] || i.type}</td>
                <td data-label="Precio">{formatPrecio(i.price)}{i.unit === 'ml' ? ' / ml' : ''}{i.revision ? <><br /><small style={{ color: '#e74c3c' }}>En revisión</small></> : null}</td>
                <td data-label="Stock">{i.stock} {i.unit}</td>
                <td data-label="En la tienda">
                  <label className="check-item">
                    <input type="checkbox" checked={i.visible} onChange={() => alternar(i)} disabled={!(i.price > 0)} />
                    {i.price > 0 ? (i.visible ? ' Visible' : ' Oculto') : ' Sin precio en DATA'}
                  </label>
                </td>
                <td data-label="Acciones">
                  <div className="acciones">
                    <button className="btn-icon editar" title="Foto y descripción" onClick={() => abrir(i)}><i className="fas fa-edit" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ModalAdmin abierto={!!form} titulo={form ? form.insumo.name : ''} onCerrar={() => setForm(null)}>
        {form && (
          <form className="modal-form" noValidate onSubmit={guardar}>
            <div className="form-grid">
              <div className="form-group full">
                <label htmlFor="insDescripcion">Descripción en la tienda</label>
                <textarea id="insDescripcion" rows="3" maxLength={500} value={form.descripcion} onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))} />
              </div>
              <div className="form-group full">
                <label>Imagen</label>
                <ZonaImagen imagen={form.imagen} archivo={archivo} onArchivo={setArchivo} />
              </div>
              <div className="form-group">
                <label htmlFor="insOrden">Orden</label>
                <input id="insOrden" type="number" value={form.orden} onChange={(e) => setForm((f) => ({ ...f, orden: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Visibilidad</label>
                <label className="check-item">
                  <input type="checkbox" checked={form.visible} disabled={!(form.insumo.price > 0)} onChange={(e) => setForm((f) => ({ ...f, visible: e.target.checked }))} /> Mostrar en la tienda
                </label>
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setForm(null)}>Cancelar</button>
              <button type="submit" className="btn-primary" disabled={guardando}>
                {guardando ? <><i className="fas fa-spinner fa-spin" /> Guardando...</> : <><i className="fas fa-save" /> Guardar</>}
              </button>
            </div>
          </form>
        )}
      </ModalAdmin>
    </>
  );
}
