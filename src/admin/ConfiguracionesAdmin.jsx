// Módulo Configuraciones del panel. Las definiciones llegan de DATA (backend/configuraciones.js
// de DATA), así que cada configuración nueva aparece aquí sola, en su grupo, y se guarda en DATA:
// vale lo mismo en los dos paneles.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiJson } from '../lib/api';
import { toastOk, NIVELES_STOCK, recargarSemaforo } from './comunes';

function Semaforo({ und, ml }) {
  const filas = [
    ['agotado', '0'],
    ['advertencia', `1 a ${und} und · hasta ${ml} ml`],
    ['disponible', `más de ${und} und · más de ${ml} ml`]
  ];
  return (
    <div className="cfg-semaforo" aria-label="Así se verá el stock">
      {filas.map(([nivel, texto]) => (
        <span key={nivel} className="cfg-nivel">
          <i style={{ background: NIVELES_STOCK[nivel].color }} />
          <b style={{ color: NIVELES_STOCK[nivel].color }}>{NIVELES_STOCK[nivel].etiqueta}</b>
          <small>{texto}</small>
        </span>
      ))}
    </div>
  );
}

export default function ConfiguracionesAdmin({ alerta }) {
  const [estado, setEstado] = useState('cargando');
  const [datos, setDatos] = useState({ disponible: false, definiciones: [], valores: {} });
  const [valores, setValores] = useState({});
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    setEstado('cargando');
    try {
      const r = await apiJson('admin/configuraciones');
      setDatos(r.data);
      setValores(r.data.valores);
      setEstado('ok');
    } catch (err) {
      alerta('Error al cargar configuraciones: ' + err.message, 'error');
      setEstado('error');
    }
  }, [alerta]);

  useEffect(() => { cargar(); }, [cargar]);

  const grupos = useMemo(() => datos.definiciones.reduce((m, d) => m.set(d.grupo, [...(m.get(d.grupo) || []), d]), new Map()), [datos]);
  const cambiados = Object.keys(valores).filter((k) => String(valores[k]) !== String(datos.valores[k]));

  async function guardar(e) {
    e.preventDefault();
    if (!cambiados.length) return;
    setGuardando(true);
    try {
      const r = await apiJson('admin/configuraciones', { method: 'PUT', body: { valores: Object.fromEntries(cambiados.map((k) => [k, valores[k]])) } });
      setDatos(r.data);
      setValores(r.data.valores);
      recargarSemaforo();
      toastOk('Configuraciones guardadas');
    } catch (err) {
      alerta('No se pudo guardar: ' + err.message, 'error');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <div className="admin-toolbar">
        <h2 className="section-title">Configuraciones</h2>
        <div className="admin-toolbar-actions">
          <button className="btn-primary" type="submit" form="form-config" disabled={!cambiados.length || guardando}>
            {guardando ? <><i className="fas fa-spinner fa-spin" /> Guardando...</> : <><i className="fas fa-save" /> {cambiados.length ? `Guardar (${cambiados.length})` : 'Sin cambios'}</>}
          </button>
        </div>
      </div>
      <p className="armador-ayuda">Ajustes del sistema. Los del inventario se guardan en DATA y valen igual en los dos paneles. Los precios de «Crea tu perfume» siguen en su propia sección.</p>

      {estado === 'cargando' && <p className="armador-ayuda">Cargando…</p>}
      {estado === 'ok' && !datos.disponible && <p className="armador-ayuda armador-aviso">La conexión con DATA no está configurada en el servidor: las configuraciones del inventario no están disponibles.</p>}
      {estado === 'ok' && datos.disponible && (
        <form id="form-config" onSubmit={guardar} className="cfg-grupos">
          {[...grupos].map(([grupo, defs]) => (
            <section key={grupo} className="cfg-grupo">
              <h3 className="armador-sub">{grupo}</h3>
              {grupo.startsWith('Inventario · semáforo') && <Semaforo und={valores.stock_advertencia_und} ml={valores.stock_advertencia_ml} />}
              {defs.map((d) => (
                <div key={d.clave} className="cfg-campo">
                  <div className="cfg-texto">
                    <label htmlFor={`cfg-${d.clave}`}>{d.etiqueta}</label>
                    <p>{d.ayuda}</p>
                  </div>
                  <div className="cfg-control">
                    {d.tipo === 'booleano' ? (
                      <input id={`cfg-${d.clave}`} type="checkbox" checked={!!valores[d.clave]} onChange={(e) => setValores({ ...valores, [d.clave]: e.target.checked })} />
                    ) : (
                      <input id={`cfg-${d.clave}`} type="number" className="armador-precio" min={d.min} max={d.max} step={d.paso || 1}
                        value={valores[d.clave] ?? ''} onChange={(e) => setValores({ ...valores, [d.clave]: e.target.value })} />
                    )}
                    {d.unidad && <span>{d.unidad}</span>}
                  </div>
                </div>
              ))}
            </section>
          ))}
        </form>
      )}
    </>
  );
}
