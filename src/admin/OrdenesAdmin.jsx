import { useCallback, useEffect, useState } from 'react';
import { apiJson } from '../lib/api';
import { API } from '../config';
import { formatPrecio, FilaEstado, PaginacionAdmin, ModalAdmin } from './comunes';

const POR_PAGINA = 20;
const ESTADOS = {
  pending: 'Pendiente', approved: 'Aprobado', in_process: 'En Proceso',
  rejected: 'Rechazado', cancelled: 'Cancelado', failed: 'Fallido', refunded: 'Reembolsado'
};

function colorEstado(status) {
  if (status === 'approved') return '#27ae60';
  if (status === 'pending' || status === 'in_process') return '#f39c12';
  if (status === 'rejected' || status === 'cancelled' || status === 'failed') return '#e74c3c';
  return '#9a9a9a';
}

const etiqueta = { fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' };
const valor = { fontSize: '0.9rem', color: 'var(--text)', marginTop: 4 };
const separador = { borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 10, marginTop: 4 };

function Dato({ titulo, children, ancho, estilo }) {
  return (
    <div style={ancho ? { gridColumn: '1 / -1', ...estilo } : estilo}>
      <span style={etiqueta}>{titulo}</span>
      <p style={valor}>{children}</p>
    </div>
  );
}

function itemsDe(o) {
  try {
    return typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || []);
  } catch {
    return null;
  }
}

function DetalleOrden({ o }) {
  const color = colorEstado(o.status);
  const nombre = o.envio_nombre || o.payer_name || '';
  const correo = o.payer_email || '';
  const items = itemsDe(o);
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 8, border: '1px solid var(--border)', marginBottom: 20 }}>
        <div>
          <span style={etiqueta}>Total pagado</span>
          <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gold-soft)', marginTop: 4 }}>{formatPrecio(o.total)} {o.currency || ''}</p>
        </div>
        <div>
          <span style={etiqueta}>Estado actual</span>
          <p style={{ marginTop: 6 }}>
            <span style={{ background: `${color}22`, color, padding: '4px 10px', borderRadius: 20, fontWeight: 600, fontSize: '0.9rem', border: `1px solid ${color}55` }}>{ESTADOS[o.status] || o.status || ''}</span>
          </p>
        </div>
        <Dato titulo="Comprador" ancho estilo={separador}>
          {nombre || correo ? (
            <>
              <span style={{ color: 'var(--text)', fontWeight: 600 }}>{nombre}</span>
              {correo && <><br /><a href={`mailto:${correo}`} style={{ color: 'var(--gold)', textDecoration: 'none' }}>{correo}</a></>}
            </>
          ) : 'N/A'}
        </Dato>
        {(o.envio_ciudad || o.envio_direccion) && (
          <div style={{ gridColumn: '1 / -1', ...separador, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Dato titulo="Celular">{o.envio_celular || 'N/A'}</Dato>
            <Dato titulo="Doc. Identidad">{o.envio_documento || 'N/A'}</Dato>
            <Dato titulo="Ciudad">{o.envio_ciudad || 'N/A'}</Dato>
            <Dato titulo="Dirección">{o.envio_direccion || 'N/A'}</Dato>
            <Dato titulo="Barrio">{o.envio_barrio || 'N/A'}</Dato>
            {o.envio_piso && <Dato titulo="Apto / Piso">{o.envio_piso}</Dato>}
            {o.envio_referencia && <Dato titulo="Referencia" ancho>{o.envio_referencia}</Dato>}
          </div>
        )}
        <div style={separador}>
          <span style={etiqueta}>Preference ID</span>
          <p style={{ ...valor, fontSize: '0.85rem', wordBreak: 'break-all' }}>{o.preference_id || 'N/A'}</p>
        </div>
        <div>
          <span style={etiqueta}>Payment ID</span>
          <p style={{ ...valor, fontSize: '0.85rem', wordBreak: 'break-all' }}>{o.payment_id || 'N/A'}</p>
        </div>
      </div>

      <h4 style={{ color: 'var(--gold-soft)', margin: '16px 0 8px', fontSize: '1.05rem' }}>Items del Pedido</h4>
      <div style={{ background: 'var(--bg-card)', borderRadius: 8, padding: 12, border: '1px solid var(--border)', marginBottom: 16 }}>
        {items === null && <div className="empty-row">No se pudieron parsear los items.</div>}
        {items && !items.length && <div className="empty-row">Sin items.</div>}
        {items && items.length > 0 && (
          <table className="tabla-productos" style={{ width: '100%', border: 'none' }}>
            <thead><tr><th style={{ paddingLeft: 0 }}>Producto</th><th>Cantidad</th><th style={{ textAlign: 'right' }}>Precio</th></tr></thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i}>
                  <td style={{ paddingLeft: 0 }}>{it.title || it.name || it.id}</td>
                  <td>{String(it.quantity || it.cantidad || 1)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatPrecio(it.unit_price || it.price || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <details style={{ marginTop: 20, border: '1px solid var(--border)', borderRadius: 6, padding: '8px 12px', background: 'rgba(0,0,0,0.2)' }}>
        <summary style={{ color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>Ver datos crudos (Raw JSON)</summary>
        <pre style={{ marginTop: 10, maxHeight: 220, overflow: 'auto', background: '#0b1220', color: '#fff', padding: 12, borderRadius: 6, fontSize: '0.8rem' }}>{JSON.stringify(o, null, 2)}</pre>
      </details>
    </>
  );
}

export default function OrdenesAdmin({ alerta, sesionInvalida }) {
  const [ordenes, setOrdenes] = useState([]);
  const [meta, setMeta] = useState({});
  const [pagina, setPagina] = useState(1);
  const [estado, setEstado] = useState('cargando');
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState('pending');

  const manejarError = useCallback((prefijo, err) => {
    if (err.message.includes('Token inválido')) { sesionInvalida(); return; }
    alerta(prefijo + err.message, 'error');
  }, [alerta, sesionInvalida]);

  const cargar = useCallback(async (page) => {
    setPagina(page);
    setEstado('cargando');
    try {
      // Todas las órdenes (no solo aprobadas) para que el admin las vea todas
      const data = await apiJson(`mercadopago/orders?page=${page}&limit=${POR_PAGINA}`);
      setOrdenes(data.data || []);
      setMeta(data.meta || {});
      setEstado('ok');
    } catch (err) {
      manejarError('Error al cargar órdenes: ', err);
      setEstado('error');
    }
  }, [manejarError]);

  useEffect(() => { cargar(1); }, [cargar]);

  const abrirDetalle = useCallback(async (ref) => {
    try {
      const data = await apiJson(`mercadopago/order/${encodeURIComponent(ref)}`);
      setOrden(data.order);
      setNuevoEstado(data.order.status || 'pending');
    } catch (err) {
      manejarError('Error al abrir orden: ', err);
    }
  }, [manejarError]);

  const cerrarDetalle = useCallback(() => setOrden(null), []);

  async function actualizarEstado() {
    try {
      await apiJson(`mercadopago/order/${encodeURIComponent(orden.external_reference)}`, { method: 'PUT', body: { status: nuevoEstado } });
      alerta('Estado actualizado', 'success');
      cargar(pagina);
      abrirDetalle(orden.external_reference);
    } catch (err) {
      alerta('Error actualizando orden: ' + err.message, 'error');
    }
  }

  async function forzarVerificacion() {
    if (!orden.payment_id) { alerta('La orden no tiene payment_id para verificar.', 'error'); return; }
    try {
      const r = await fetch(`${API}/mercadopago/verify_payment?payment_id=${encodeURIComponent(orden.payment_id)}`);
      const d = await r.json();
      if (!d.success) throw new Error(d.message || 'Error verificando');
      alerta('Verificación solicitada', 'success');
      cargar(pagina);
      abrirDetalle(orden.external_reference);
    } catch (err) {
      alerta('Error verificando orden: ' + err.message, 'error');
    }
  }

  function exportarCsv() {
    if (!ordenes.length) { alerta('No hay órdenes para exportar', 'error'); return; }
    const columnas = ['external_reference', 'preference_id', 'payment_id', 'total', 'currency', 'status', 'created_at'];
    const filas = [columnas.join(',')].concat(ordenes.map((o) =>
      [o.external_reference || '', o.preference_id || '', o.payment_id || '', o.total || 0, o.currency || '', o.status || '', o.created_at || '']
        .map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')));
    const blob = new Blob([filas.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ordenes_page_${pagina}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  const q = busqueda.toLowerCase();
  const filtradas = ordenes.filter((o) =>
    (o.external_reference || '').toLowerCase().includes(q) ||
    (o.payer_name && o.payer_name.toLowerCase().includes(q)) ||
    (o.payer_email && o.payer_email.toLowerCase().includes(q)) ||
    (o.payment_id && String(o.payment_id).includes(q)));

  return (
    <>
      <div className="admin-toolbar">
        <h2 className="section-title">Órdenes</h2>
        <div className="admin-toolbar-actions">
          <div className="search-box">
            <i className="fas fa-search" />
            <input type="text" placeholder="Buscar órdenes..." className="admin-search-input" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="btn-primary" onClick={() => cargar(pagina)}><i className="fas fa-sync-alt" /> Refrescar</button>
            <button className="btn-secondary" onClick={exportarCsv}><i className="fas fa-file-csv" /> Exportar CSV</button>
          </div>
        </div>
      </div>
      <div className="tabla-wrapper">
        <table className="tabla-productos">
          <thead>
            <tr><th>Orden</th><th>Comprador</th><th>Total</th><th>Estado</th><th className="col-acciones">Acciones</th></tr>
          </thead>
          <tbody>
            {estado !== 'ok' || !filtradas.length ? (
              <FilaEstado columnas={5} cargando={estado === 'cargando' && 'Cargando órdenes...'} error={estado === 'error'}
                vacio={busqueda ? 'No se encontraron resultados.' : 'No hay órdenes registradas.'} />
            ) : filtradas.map((o, idx) => {
              const nombre = o.envio_nombre || o.payer_name || '';
              const correo = o.payer_email || '';
              return (
                <tr key={o.external_reference || idx}>
                  <td data-label="Orden" className="col-producto">
                    <button type="button" className="celda-producto celda-orden" onClick={() => abrirDetalle(o.external_reference)} title="Ver detalle">
                      <span className="celda-producto-texto">
                        <strong>{o.external_reference} <span className="celda-id">#{(((meta.page || 1) - 1) * POR_PAGINA) + idx + 1}</span></strong>
                        <small className="celda-meta">{o.created_at ? new Date(o.created_at).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }) : ''}</small>
                        {(o.payment_id || o.preference_id) && (
                          <small className="celda-meta celda-recorte" title={`Preferencia: ${o.preference_id || '—'} · Pago: ${o.payment_id || '—'}`}>
                            MP {o.payment_id ? `pago ${o.payment_id}` : `pref. ${o.preference_id}`}
                          </small>
                        )}
                      </span>
                    </button>
                  </td>
                  <td data-label="Comprador">{nombre || correo ? <><strong>{nombre}</strong><small className="celda-meta celda-bloque">{correo}</small></> : 'N/A'}</td>
                  <td data-label="Total"><strong className="celda-precio">{formatPrecio(o.total)}</strong>{o.currency && o.currency !== 'COP' ? <small className="celda-meta"> {o.currency}</small> : null}</td>
                  <td data-label="Estado"><strong style={{ color: colorEstado(o.status) }}>{ESTADOS[o.status] || o.status || ''}</strong></td>
                  <td data-label="Acciones" className="col-acciones">
                    <div className="acciones">
                      <button className="btn-icon" title="Ver" onClick={() => abrirDetalle(o.external_reference)}><i className="fas fa-eye" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <PaginacionAdmin actual={pagina} total={meta.pages || 1} onCambiar={cargar} />

      <ModalAdmin abierto={!!orden} titulo={orden ? `Orden ${orden.external_reference}` : 'Detalle de Orden'} onCerrar={cerrarDetalle}>
        {orden && (
          <>
            <div className="modal-body" style={{ padding: '20px 24px' }}>
              <DetalleOrden o={orden} />
            </div>
            <div className="modal-actions">
              <select value={nuevoEstado} onChange={(e) => setNuevoEstado(e.target.value)}
                style={{ padding: '8px 12px', background: 'var(--bg-card)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', outline: 'none', fontFamily: 'var(--font)', cursor: 'pointer' }}>
                {Object.entries(ESTADOS).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
              </select>
              <button className="btn-primary" onClick={actualizarEstado}>Actualizar estado</button>
              <button className="btn-secondary" onClick={forzarVerificacion}>Forzar verificación</button>
              <button className="btn-secondary" onClick={cerrarDetalle}>Cerrar</button>
            </div>
          </>
        )}
      </ModalAdmin>
    </>
  );
}
