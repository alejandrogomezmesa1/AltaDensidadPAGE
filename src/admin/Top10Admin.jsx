import { useCallback, useEffect, useState } from 'react';
import { apiJson } from '../lib/api';
import { toastOk, ImagenCelda, FilaEstado } from './comunes';

export default function Top10Admin({ alerta }) {
  const [top10, setTop10] = useState([]);
  const [productos, setProductos] = useState([]);
  const [estado, setEstado] = useState('cargando');
  const [busqueda, setBusqueda] = useState('');
  const [buscadorAgregar, setBuscadorAgregar] = useState('');
  const [seleccion, setSeleccion] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    setEstado('cargando');
    try {
      const data = await apiJson('top10', { auth: false });
      setTop10(data.data);
      setEstado('ok');
    } catch (err) {
      alerta('Error al cargar Top 10: ' + err.message, 'error');
      setEstado('error');
    }
    try {
      const data = await apiJson('productos', { auth: false });
      setProductos(data.data);
    } catch (err) {
      alerta('Error al cargar productos para Top 10: ' + err.message, 'error');
    }
  }, [alerta]);

  useEffect(() => { cargar(); }, [cargar]);

  const q = busqueda.toLowerCase();
  // Se conserva la posición real para mover y quitar aunque la tabla esté filtrada
  const filas = top10.map((p, idx) => ({ p, idx })).filter(({ p }) =>
    p.nombre.toLowerCase().includes(q) || (p.categoria || '').toLowerCase().includes(q) || (p.genero || '').toLowerCase().includes(q));

  const mover = (idx, dir) => {
    const destino = idx + dir;
    if (destino < 0 || destino >= top10.length) return;
    setTop10((t) => {
      const copia = [...t];
      [copia[idx], copia[destino]] = [copia[destino], copia[idx]];
      return copia;
    });
  };
  const quitar = (idx) => setTop10((t) => t.filter((_, j) => j !== idx));

  const disponibles = productos.filter((p) => !top10.some((t) => t.producto_id === p.id) &&
    (!buscadorAgregar || p.name.toLowerCase().includes(buscadorAgregar.toLowerCase())));

  function agregar(e) {
    e.preventDefault();
    const prod = productos.find((p) => p.id === parseInt(seleccion, 10));
    if (!prod) return;
    if (top10.length >= 10) { alerta('Solo puedes tener 10 productos en el Top 10.', 'error'); return; }
    setTop10((t) => [...t, {
      producto_id: prod.id, nombre: prod.name, imagen: prod.image, categoria: prod.category,
      genero: prod.gender, descripcion: prod.description, precio: prod.price, rating: prod.rating
    }]);
    setSeleccion('');
    setBuscadorAgregar('');
  }

  async function guardar() {
    if (top10.length !== 10) { alerta('Debes seleccionar exactamente 10 productos.', 'error'); return; }
    setGuardando(true);
    try {
      await apiJson('top10', { method: 'PUT', body: { productos: top10.map((p) => p.producto_id) } });
      toastOk('Top 10 actualizado');
    } catch (err) {
      alerta('Error al guardar Top 10: ' + err.message, 'error');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <div className="admin-toolbar">
        <h2 className="section-title">Top 10 Más Vendidos</h2>
        <div className="admin-toolbar-actions">
          <div className="search-box">
            <i className="fas fa-search" />
            <input type="text" placeholder="Filtrar Top 10..." className="admin-search-input" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          </div>
          <button className="btn-primary" onClick={guardar} disabled={guardando}>
            {guardando ? <><i className="fas fa-spinner fa-spin" /> Guardando...</> : <><i className="fas fa-save" /> Guardar Top 10</>}
          </button>
        </div>
      </div>
      <div className="tabla-wrapper">
        <table className="tabla-productos">
          <thead>
            <tr><th>#</th><th>Imagen</th><th>Nombre</th><th>Categoría</th><th>Género</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {estado !== 'ok' || !filas.length ? (
              <FilaEstado columnas={6} cargando={estado === 'cargando' && 'Cargando Top 10...'} error={estado === 'error'}
                vacio={busqueda ? 'No se encontraron resultados.' : 'No hay productos en el Top 10.'} />
            ) : filas.map(({ p, idx }) => (
              <tr key={p.producto_id}>
                <td data-label="#">{idx + 1}</td>
                <td data-label="Imagen"><ImagenCelda src={p.imagen} /></td>
                <td data-label="Nombre"><strong>{p.nombre}</strong></td>
                <td data-label="Categoría">{p.categoria}</td>
                <td data-label="Género">{p.genero}</td>
                <td data-label="Acciones">
                  <div className="acciones">
                    <button className="btn-icon" title="Subir" onClick={() => mover(idx, -1)} disabled={idx === 0}><i className="fas fa-arrow-up" /></button>
                    <button className="btn-icon" title="Bajar" onClick={() => mover(idx, 1)} disabled={idx === top10.length - 1}><i className="fas fa-arrow-down" /></button>
                    <button className="btn-icon eliminar" title="Quitar" onClick={() => quitar(idx)}><i className="fas fa-times" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="top10-agregar-box">
        <form className="top10-agregar-form" onSubmit={agregar}>
          <label htmlFor="selectProductoTop10" className="top10-agregar-label">Agregar producto al Top 10</label>
          <div className="top10-agregar-row" style={{ flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <input type="text" className="top10-agregar-buscar" placeholder="Buscar producto..." style={{ flex: 1, minWidth: 180 }}
              value={buscadorAgregar} onChange={(e) => setBuscadorAgregar(e.target.value)} />
            <select id="selectProductoTop10" className="top10-agregar-select" style={{ flex: 2, minWidth: 180 }} value={seleccion} onChange={(e) => setSeleccion(e.target.value)}>
              <option value="">-- Seleccionar producto --</option>
              {disponibles.map((p) => <option key={p.id} value={p.id}>{p.brand ? `${p.brand.name} · ${p.name}` : p.name}</option>)}
            </select>
            <button className="btn-primary" type="submit"><i className="fas fa-plus" /> Agregar</button>
          </div>
        </form>
      </div>
    </>
  );
}
