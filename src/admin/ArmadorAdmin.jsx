// Precios del armador "Crea tu perfume": esencia por categoría y tamaño, precio de cada envase
// por tamaño, recargo de feromonas y presentaciones en ml de los insumos líquidos.
// Precio total = esencia + envase + feromonas. Una celda vacía = sin precio ("Consultar" en la tienda).
import { useCallback, useEffect, useState } from 'react';
import { apiJson } from '../lib/api';
import { toastOk } from './comunes';

const CATEGORIAS = [['Arabe', 'Árabe'], ['Diseñador', 'Diseñador']];
const texto = (v) => (v == null ? '' : String(v));
const valor = (t) => (String(t).trim() === '' ? null : Math.round(Number(String(t).replace(/[^\d]/g, ''))));

export default function ArmadorAdmin({ alerta }) {
  const [config, setConfig] = useState(null);
  const [esencia, setEsencia] = useState({});
  const [envases, setEnvases] = useState({});
  const [recargo, setRecargo] = useState('');
  const [presentaciones, setPresentaciones] = useState('');
  const [guardando, setGuardando] = useState(false);

  const aplicar = useCallback((c) => {
    setConfig(c);
    const e = {};
    CATEGORIAS.forEach(([cat]) => c.tamanos.forEach((m) => { e[`${cat}|${m}`] = texto((c.esencia[cat] || {})[m]); }));
    setEsencia(e);
    const v = {};
    c.envases.forEach((env) => env.sizes.forEach((s) => { v[`${env.name}|${s.ml}`] = texto(s.price); }));
    setEnvases(v);
    setRecargo(texto(c.recargoFeromonas));
    setPresentaciones(c.presentaciones.join(', '));
  }, []);

  const cargar = useCallback(async () => {
    try {
      const data = await apiJson('catalogo/armador', { auth: false });
      aplicar(data.data);
    } catch (err) {
      alerta('Error al cargar el armador: ' + err.message, 'error');
    }
  }, [alerta, aplicar]);

  useEffect(() => { cargar(); }, [cargar]);

  async function guardar(ev) {
    ev.preventDefault();
    // Una casilla en 0 cobraría esa parte gratis: vacía significa "Consultar"
    const enCero = [...Object.values(esencia), ...Object.values(envases)].filter((t) => valor(t) === 0).length;
    if (enCero) {
      alerta(`${enCero === 1 ? 'Hay un precio' : `Hay ${enCero} precios`} en 0: se cobraría gratis. Escribe el precio o deja la casilla vacía para que la tienda muestre «Consultar».`, 'error');
      requestAnimationFrame(() => document.querySelector('.armador-precio.en-cero')?.focus());
      return;
    }
    setGuardando(true);
    try {
      const data = await apiJson('catalogo/armador', {
        method: 'PUT',
        body: {
          esencia: Object.entries(esencia).map(([k, t]) => { const [categoria, ml] = k.split('|'); return { categoria, ml: Number(ml), precio: valor(t) }; }),
          envases: Object.entries(envases).map(([k, t]) => { const [envase, ml] = k.split('|'); return { envase, ml: Number(ml), precio: valor(t) }; }),
          recargoFeromonas: valor(recargo),
          presentaciones: presentaciones.split(/[,\s]+/).map(Number).filter((x) => x > 0)
        }
      });
      aplicar(data.data);
      toastOk('Precios del armador guardados');
    } catch (err) {
      alerta('Error al guardar: ' + err.message, 'error');
    } finally {
      setGuardando(false);
    }
  }

  const celda = (estado, fijar, clave, etiqueta) => (
    <input type="text" inputMode="numeric" className={`armador-precio ${valor(estado[clave] ?? '') === 0 ? 'en-cero invalid' : ''}`} aria-label={etiqueta} placeholder="—"
      value={estado[clave] ?? ''} onChange={(e) => fijar((s) => ({ ...s, [clave]: e.target.value }))} />
  );

  return (
    <>
      <div className="admin-toolbar">
        <h2 className="section-title">Precios de "Crea tu perfume"</h2>
        <div className="admin-toolbar-actions">
          <button className="btn-primary" form="form-armador" type="submit" disabled={!config || guardando}>
            {guardando ? <><i className="fas fa-spinner fa-spin" /> Guardando...</> : <><i className="fas fa-save" /> Guardar precios</>}
          </button>
        </div>
      </div>
      <p className="armador-ayuda">
        Precio del perfume armado = <b>esencia</b> (según categoría y tamaño) + <b>envase</b> (diseño y tamaño) + <b>feromonas</b> (si las pide).
        Deja una celda vacía si aún no tiene precio: en la tienda aparecerá como «Consultar» y el cliente lo cotiza por WhatsApp.
        Los tamaños salen de las tallas de cada envase (sección Envases).
      </p>

      {!config ? <p className="armador-ayuda">Cargando…</p> : (
        <form id="form-armador" onSubmit={guardar} className="armador-form">
          <h3 className="armador-sub">Esencia por categoría y tamaño</h3>
          <div className="tabla-wrapper">
            <table className="tabla-productos armador-tabla">
              <thead><tr><th>Categoría</th>{config.tamanos.map((m) => <th key={m}>{m} ml</th>)}</tr></thead>
              <tbody>
                {CATEGORIAS.map(([cat, etiqueta]) => (
                  <tr key={cat}>
                    <td data-label="Categoría"><strong>{etiqueta}</strong></td>
                    {config.tamanos.map((m) => <td key={m} data-label={`${m} ml`}>{celda(esencia, setEsencia, `${cat}|${m}`, `Esencia ${etiqueta} ${m} ml`)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="armador-sub">Envase por tamaño</h3>
          <div className="tabla-wrapper">
            <table className="tabla-productos armador-tabla">
              <thead><tr><th>Envase</th>{config.tamanos.map((m) => <th key={m}>{m} ml</th>)}</tr></thead>
              <tbody>
                {config.envases.map((env) => (
                  <tr key={env.id}>
                    <td data-label="Envase"><strong>{env.name}</strong></td>
                    {config.tamanos.map((m) => (
                      <td key={m} data-label={`${m} ml`}>
                        {env.sizes.some((s) => s.ml === m) ? celda(envases, setEnvases, `${env.name}|${m}`, `Envase ${env.name} ${m} ml`) : <span className="armador-na">no viene</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="form-grid armador-param">
            <div className="form-group">
              <label htmlFor="armRecargo">Recargo por feromonas (COP)</label>
              <input id="armRecargo" type="text" inputMode="numeric" placeholder="Vacío = consultar · 0 = sin costo" value={recargo} onChange={(e) => setRecargo(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="armPresentaciones">Presentaciones de esencias e insumos líquidos (ml)</label>
              <input id="armPresentaciones" type="text" placeholder="30, 50, 100" value={presentaciones} onChange={(e) => setPresentaciones(e.target.value)} />
            </div>
          </div>
        </form>
      )}
    </>
  );
}
