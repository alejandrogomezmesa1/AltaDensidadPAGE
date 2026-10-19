// Decants de 10 ml en el panel: precios por categoría, envases de decant (enlazados a su ítem de
// DATA), sets de descubrimiento y el enlace de cada fragancia con su esencia en DATA. Sin enlace
// la fragancia no se ofrece en decant: DATA no sabría qué esencia descontar.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiJson } from '../lib/api';
import { toastOk, subirImagen, rutaImagen } from './comunes';

const VACIO = { config: { precios: {}, envases: [], sets: [] }, data: null, esencias: [], productos: [] };
const FILTROS = [
  ['pendientes', 'Sin esencia'],
  ['exactas', 'Coincidencia exacta'],
  ['enlazadas', 'Enlazadas'],
  ['todas', 'Todas']
];
const numero = (v) => (v === '' || v == null ? null : Number(v));
const pesos = (v) => (v == null ? '—' : `$${Number(v).toLocaleString('es-CO')}`);

export default function DecantsAdmin({ alerta }) {
  const [estado, setEstado] = useState('cargando');
  const [datos, setDatos] = useState(VACIO);
  const [form, setForm] = useState(VACIO.config);
  const [guardando, setGuardando] = useState(false);
  const [filtro, setFiltro] = useState('pendientes');
  const [busqueda, setBusqueda] = useState('');
  const [elegidas, setElegidas] = useState({}); // productoId → esenciaId elegida en el selector

  const aplicar = useCallback((d) => {
    setDatos(d);
    setForm({
      precios: { ...d.config.precios },
      envases: d.config.envases.map((e) => ({ ...e })),
      sets: d.config.sets.map((s) => ({ ...s }))
    });
  }, []);

  const cargar = useCallback(async () => {
    setEstado('cargando');
    try {
      const r = await apiJson('admin/decants');
      aplicar(r.data);
      setEstado('ok');
    } catch (err) {
      alerta('No se pudieron cargar los decants: ' + err.message, 'error');
      setEstado('error');
    }
  }, [alerta, aplicar]);

  useEffect(() => { cargar(); }, [cargar]);

  const sucio = JSON.stringify(form) !== JSON.stringify({ precios: datos.config.precios, envases: datos.config.envases, sets: datos.config.sets });

  async function guardar(e) {
    e.preventDefault();
    setGuardando(true);
    try {
      const r = await apiJson('admin/decants', { method: 'PUT', body: {
        precios: Object.fromEntries(Object.entries(form.precios).map(([k, v]) => [k, numero(v)])),
        envases: form.envases.map((x) => ({ ...x, precio: numero(x.precio) })),
        sets: form.sets
      } });
      aplicar(r.data);
      toastOk('Decants guardados');
    } catch (err) {
      alerta('No se pudo guardar: ' + err.message, 'error');
    } finally {
      setGuardando(false);
    }
  }

  async function enlazar(enlaces, mensaje) {
    try {
      const r = await apiJson('admin/decants/enlaces', { method: 'PUT', body: { enlaces } });
      aplicar(r.data);
      setElegidas({});
      toastOk(mensaje);
    } catch (err) {
      alerta('No se pudo guardar el enlace: ' + err.message, 'error');
    }
  }

  const cambiarEnvase = (i, cambio) => setForm((f) => ({ ...f, envases: f.envases.map((x, j) => (j === i ? { ...x, ...cambio } : x)) }));
  const cambiarSet = (i, cambio) => setForm((f) => ({ ...f, sets: f.sets.map((x, j) => (j === i ? { ...x, ...cambio } : x)) }));

  async function foto(i, archivo) {
    if (!archivo) return;
    try {
      cambiarEnvase(i, { imagen: await subirImagen(archivo) });
    } catch (err) { alerta('No se pudo subir la foto: ' + err.message, 'error'); }
  }

  const exactas = datos.productos.filter((p) => !p.esencia && p.sugerencia && p.activo);
  const lista = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return datos.productos.filter((p) => {
      if (filtro === 'pendientes' && (p.esencia || !p.activo)) return false;
      if (filtro === 'exactas' && !(p.sugerencia && !p.esencia)) return false;
      if (filtro === 'enlazadas' && !p.esencia) return false;
      return !q || `${p.nombre} ${p.marca || ''}`.toLowerCase().includes(q);
    });
  }, [datos.productos, filtro, busqueda]);
  const enlazadas = datos.productos.filter((p) => p.esencia).length;
  const conDecant = datos.productos.filter((p) => p.esencia && p.esencia.decants > 0).length;

  return (
    <>
      <div className="admin-toolbar">
        <div>
          <h2 className="section-title">Decants</h2>
          <p className="armador-ayuda" style={{ margin: '6px 0 0' }}>Decant de 10 ml = precio de la fragancia (por categoría) + precio del envase. Sin feromonas.</p>
        </div>
        <div className="admin-toolbar-actions">
          <a className="btn-secondary" href="/decants" target="_blank" rel="noopener noreferrer"><i className="fas fa-external-link-alt" /> Ver en la tienda</a>
          <button className="btn-primary" type="submit" form="form-decants" disabled={!sucio || guardando}>
            {guardando ? <><i className="fas fa-spinner fa-spin" /> Guardando...</> : <><i className="fas fa-save" /> {sucio ? 'Guardar cambios' : 'Sin cambios'}</>}
          </button>
        </div>
      </div>

      {estado === 'cargando' && <p className="armador-ayuda">Cargando…</p>}

      {estado === 'ok' && (
        <>
          <div className="dec-adm-estado">
            {datos.errorData
              ? <p className="dec-adm-aviso"><i className="fas fa-plug" /> {datos.errorData} Sin DATA los decants se muestran, pero no se pueden comprar en línea.</p>
              : (
                <ul>
                  <li><b>{conDecant}</b> fragancias listas para decant</li>
                  <li><b>{enlazadas}</b> enlazadas a su esencia</li>
                  <li><b>{datos.data && datos.data.recetaLista ? `${datos.data.esenciaMl} ml` : '—'}</b> de esencia por decant</li>
                  {datos.data && datos.data.envases.map((e) => <li key={e.id}><b>{e.stock}</b> {e.name.replace(/^Decant /, '')}</li>)}
                </ul>
              )}
            {datos.data && !datos.data.recetaLista && (
              <p className="dec-adm-aviso"><i className="fas fa-flask" /> En DATA falta la receta del decant (Recetas y empaque → Decant de 10 ml): sin los ml de esencia no se sabe cuántos decants alcanzan.</p>
            )}
          </div>

          <form id="form-decants" onSubmit={guardar}>
            <section className="dec-adm-bloque">
              <h3 className="up">Precio de la fragancia (10 ml)</h3>
              <div className="dec-adm-precios">
                {Object.keys(form.precios).map((c) => (
                  <label key={c}>{c === 'Arabe' ? 'Árabe' : c}
                    <input type="number" min="1" step="100" placeholder="Consultar" value={form.precios[c] ?? ''}
                      onChange={(e) => setForm((f) => ({ ...f, precios: { ...f.precios, [c]: e.target.value } }))} />
                  </label>
                ))}
              </div>
              <p className="armador-ayuda">Vacío = «Consultar»: no se vende en línea. DATA bloquea las combinaciones cuyo precio no cubre el costo de la receta.</p>
            </section>

            <section className="dec-adm-bloque">
              <h3 className="up">Envases de decant</h3>
              <div className="dec-adm-envases">
                {form.envases.map((e, i) => (
                  <div key={e.id || `n${i}`} className="dec-adm-envase">
                    <label className="dec-adm-foto">
                      {e.imagen ? <img src={rutaImagen(e.imagen)} alt="" /> : <i className="fas fa-image" />}
                      <input type="file" accept="image/*" onChange={(ev) => foto(i, ev.target.files[0])} />
                      <span>Cambiar foto</span>
                    </label>
                    <div className="dec-adm-campos">
                      <label>Nombre<input value={e.nombre} maxLength={100} onChange={(ev) => cambiarEnvase(i, { nombre: ev.target.value })} /></label>
                      <label>Precio del envase<input type="number" min="1" step="100" placeholder="Consultar" value={e.precio ?? ''} onChange={(ev) => cambiarEnvase(i, { precio: ev.target.value })} /></label>
                      <label className="dec-adm-ancho">Descripción<input value={e.descripcion || ''} maxLength={300} onChange={(ev) => cambiarEnvase(i, { descripcion: ev.target.value })} /></label>
                      <label className="dec-adm-ancho">Ítem en DATA (de dónde se descuenta)
                        <select value={e.inventarioId || ''} onChange={(ev) => cambiarEnvase(i, { inventarioId: ev.target.value ? Number(ev.target.value) : null })}>
                          <option value="">Sin enlazar</option>
                          {(datos.data ? datos.data.envases : []).map((x) => <option key={x.id} value={x.id}>{x.name} · {x.stock} en stock</option>)}
                        </select>
                      </label>
                      <label className="check-item"><input type="checkbox" checked={e.activo} onChange={(ev) => cambiarEnvase(i, { activo: ev.target.checked })} /> Visible en la tienda</label>
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" className="btn-secondary" onClick={() => setForm((f) => ({ ...f, envases: [...f.envases, { nombre: 'Nuevo envase', precio: '', activo: false, inventarioId: null }] }))}>
                <i className="fas fa-plus" /> Agregar envase
              </button>
            </section>

            <section className="dec-adm-bloque">
              <h3 className="up">Sets de descubrimiento</h3>
              <div className="dec-adm-sets">
                {form.sets.map((s, i) => (
                  <div key={s.id || `s${i}`} className="dec-adm-set">
                    <label>Nombre<input value={s.nombre} maxLength={100} onChange={(e) => cambiarSet(i, { nombre: e.target.value })} /></label>
                    <label>Fragancias<input type="number" min="2" max="10" value={s.cantidad} onChange={(e) => cambiarSet(i, { cantidad: Number(e.target.value) })} /></label>
                    <label>Descuento %<input type="number" min="0" max="60" value={s.descuento} onChange={(e) => cambiarSet(i, { descuento: Number(e.target.value) })} /></label>
                    <label className="dec-adm-ancho">Descripción<input value={s.descripcion || ''} maxLength={300} onChange={(e) => cambiarSet(i, { descripcion: e.target.value })} /></label>
                    <label className="check-item"><input type="checkbox" checked={s.activo} onChange={(e) => cambiarSet(i, { activo: e.target.checked })} /> Visible</label>
                  </div>
                ))}
              </div>
              <button type="button" className="btn-secondary" onClick={() => setForm((f) => ({ ...f, sets: [...f.sets, { nombre: 'Nuevo set', cantidad: 4, descuento: 10, descripcion: '', activo: false }] }))}>
                <i className="fas fa-plus" /> Agregar set
              </button>
            </section>
          </form>

          <section className="dec-adm-bloque">
            <div className="dec-adm-cab">
              <h3 className="up">Fragancia ↔ esencia de DATA</h3>
              {exactas.length > 0 && (
                <button type="button" className="btn-primary" onClick={() => enlazar(exactas.map((p) => ({ productoId: p.id, esenciaId: p.sugerencia.id })), `${exactas.length} fragancias enlazadas`)}>
                  <i className="fas fa-link" /> Enlazar {exactas.length} coincidencias exactas
                </button>
              )}
            </div>
            <p className="armador-ayuda">Cada decant se llena con la esencia enlazada y DATA la descuenta al vender. Las coincidencias exactas comparan nombre y marca; revisa las demás a mano.</p>
            <div className="dec-adm-filtros">
              <div className="search-box">
                <i className="fas fa-search" />
                <input type="text" className="admin-search-input" placeholder="Buscar fragancia…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
              </div>
              <div className="dec-adm-seg">
                {FILTROS.map(([k, t]) => <button key={k} type="button" className={filtro === k ? 'on' : ''} onClick={() => setFiltro(k)}>{t}</button>)}
              </div>
            </div>
            <div className="tabla-wrapper">
              <table className="tabla-productos tabla-compacta">
                <thead><tr><th>Fragancia</th><th>Esencia en DATA</th><th>Decants</th><th /></tr></thead>
                <tbody>
                  {lista.map((p) => {
                    const valor = elegidas[p.id] ?? (p.esencia ? p.esencia.id : (p.sugerencia ? p.sugerencia.id : ''));
                    const cambio = String(valor || '') !== String(p.esencia ? p.esencia.id : '');
                    const primeras = new Set([...(p.sugerencia ? [p.sugerencia.id] : []), ...p.candidatas.map((c) => c.id)]);
                    return (
                      <tr key={p.id} className={p.activo ? '' : 'dec-adm-inactivo'}>
                        <td><strong>{p.nombre}</strong><br /><small className="mute">{[p.marca, p.categoria === 'Arabe' ? 'Árabe' : 'Diseñador', !p.activo && 'oculto'].filter(Boolean).join(' · ')}</small></td>
                        <td>
                          <select value={valor || ''} onChange={(e) => setElegidas((m) => ({ ...m, [p.id]: e.target.value ? Number(e.target.value) : null }))} aria-label={`Esencia de ${p.nombre}`}>
                            <option value="">Sin esencia</option>
                            {primeras.size > 0 && (
                              <optgroup label="Sugeridas">
                                {datos.esencias.filter((x) => primeras.has(x.id)).map((x) => <option key={x.id} value={x.id}>{x.name} · {x.stockMl} ml</option>)}
                              </optgroup>
                            )}
                            <optgroup label="Todas las esencias">
                              {datos.esencias.map((x) => <option key={x.id} value={x.id}>{x.name} · {x.stockMl} ml{x.enlazada ? ' · ya enlazada' : ''}</option>)}
                            </optgroup>
                          </select>
                          {!p.esencia && p.sugerencia && <small className="dec-adm-sug"><i className="fas fa-check" /> Coincidencia exacta</small>}
                        </td>
                        <td>{p.esencia ? (p.esencia.decants > 0 ? <b>{p.esencia.decants}</b> : <span className="mute">0</span>) : '—'}</td>
                        <td>
                          {cambio && (
                            <button type="button" className="btn-secondary" onClick={() => enlazar([{ productoId: p.id, esenciaId: valor || null }], valor ? 'Enlace guardado' : 'Enlace quitado')}>
                              {valor ? 'Enlazar' : 'Quitar'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {!lista.length && <p className="armador-ayuda" style={{ padding: 16 }}>No hay fragancias en este filtro.</p>}
            </div>
            <p className="armador-ayuda">Precio de referencia por decant: Árabe {pesos(numero(form.precios.Arabe))} · Diseñador {pesos(numero(form.precios['Diseñador']))} + envase.</p>
          </section>
        </>
      )}
    </>
  );
}
