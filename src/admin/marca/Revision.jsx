// Revisión: los pedidos de cambio abiertos (la lista de trabajo para la siguiente iteración del
// branding) y la actividad reciente. «Copiar para Claude» arma la lista en Markdown con la ruta de
// cada pieza dentro de branding/, lista para pegarla en el chat y regenerar las piezas.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiJson } from '../../lib/api';
import { toastOk } from '../comunes';
import { urlPieza, copiarTexto, fechaCorta } from './utilidades';

export default function Revision({ manifest, activo, onAbrir, alerta }) {
  const [pendientes, setPendientes] = useState(null);
  const [actividad, setActividad] = useState(null);

  const piezas = useMemo(() => Object.fromEntries(manifest.piezas.map((p) => [p.id, p])), [manifest]);
  const titulos = useMemo(() => Object.fromEntries(manifest.secciones.map((s) => [s.id, s.titulo])), [manifest]);

  const cargar = useCallback(async () => {
    try {
      const [a, b] = await Promise.all([apiJson('admin/marca/notas?pendientes=1'), apiJson('admin/marca/notas?limite=60')]);
      setPendientes(a.data);
      setActividad(b.data);
    } catch (err) {
      setPendientes([]);
      setActividad([]);
      alerta('No se pudo leer la revisión: ' + err.message, 'error');
    }
  }, [alerta]);

  useEffect(() => { if (activo) cargar(); }, [activo, cargar]);

  const porPieza = useMemo(() => {
    const m = new Map();
    (pendientes || []).forEach((n) => m.set(n.pieza, [...(m.get(n.pieza) || []), n]));
    return [...m.entries()];
  }, [pendientes]);

  async function hecho(n) {
    try {
      await apiJson(`admin/marca/notas/${n.id}`, { method: 'PATCH', body: { resuelta: true } });
      setPendientes((l) => l.filter((x) => x.id !== n.id));
      toastOk('Cambio marcado como hecho');
    } catch (err) { alerta(err.message, 'error'); }
  }

  function paraClaude() {
    const hoy = new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
    const bloques = porPieza.map(([id, notas]) => {
      const p = piezas[id];
      const cab = `### ${p ? p.titulo : id}\n\`branding/svg/${id}\`${p ? ` · ${titulos[p.seccion] || p.seccion}` : ''}`;
      return `${cab}\n${notas.map((n) => `- ${n.texto.replace(/\n+/g, ' ')} _(${n.autor || 'equipo'}, ${new Date(n.fecha).toLocaleDateString('es-CO')})_`).join('\n')}`;
    });
    const md = `## Cambios pendientes del branding · ${hoy}\n\n`
      + 'Aplica estos cambios en `branding/` (marca.py / generar_svg.py), regenera con `--publicar` y deja las piezas «En revisión».\n\n'
      + bloques.join('\n\n');
    copiarTexto(md).then(() => toastOk(`${pendientes.length} cambios copiados`));
  }

  return (
    <div className="marca-revision">
      <section className="marca-seccion">
        <header className="marca-seccion-cabeza">
          <h3>Cambios pendientes {pendientes && <span className="marca-mute">{pendientes.length}</span>}</h3>
          <div className="admin-toolbar-actions">
            <button type="button" className="btn-secondary" onClick={cargar}><i className="fas fa-sync" /> Actualizar</button>
            <button type="button" className="btn-primary" disabled={!pendientes?.length} onClick={paraClaude}
              title="Lista en Markdown con la ruta de cada pieza, para pegarla en el chat con Claude">
              <i className="fas fa-clipboard-list" /> Copiar para Claude
            </button>
          </div>
        </header>
        <p className="armador-ayuda">
          Cada «Pedir cambio» de una pieza llega aquí. Al terminar la ronda, copia la lista y pégala en el chat: los cambios se aplican en
          la carpeta <code>branding/</code>, se regeneran las piezas y vuelven al panel para revisarlas.
        </p>
        {pendientes === null && <p className="marca-mute">Cargando…</p>}
        {pendientes?.length === 0 && <p className="marca-vacio"><i className="fas fa-check-circle" /> No hay cambios pendientes.</p>}
        <ul className="marca-pendientes">
          {porPieza.map(([id, notas]) => {
            const p = piezas[id];
            return (
              <li key={id}>
                <button type="button" className="marca-pend-pieza" onClick={() => p && onAbrir(id)} disabled={!p}>
                  {p ? <img src={urlPieza(p)} alt="" loading="lazy" /> : <i className="fas fa-question" />}
                  <span><b>{p ? p.titulo : id}</b><small className="marca-mute">{p ? titulos[p.seccion] : 'Pieza que ya no existe'}</small></span>
                </button>
                <ul>
                  {notas.map((n) => (
                    <li key={n.id}>
                      <p>{n.texto}</p>
                      <small className="marca-mute">{n.autor || 'Sin nombre'} · {fechaCorta(n.fecha)}</small>
                      <button type="button" className="marca-icono-btn" onClick={() => hecho(n)} title="Marcar hecho" aria-label="Marcar hecho">
                        <i className="fas fa-check" />
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="marca-seccion">
        <header className="marca-seccion-cabeza"><h3>Actividad reciente</h3></header>
        {actividad?.length === 0 && <p className="marca-mute">Todavía no hay actividad.</p>}
        <ol className="marca-actividad">
          {(actividad || []).map((n) => {
            const p = piezas[n.pieza];
            const verbo = n.tipo === 'estado' ? 'cambió el estado' : n.tipo === 'cambio' ? 'pidió un cambio' : 'comentó';
            return (
              <li key={n.id} className={`marca-act marca-act--${n.tipo}`}>
                <i className={`fas ${n.tipo === 'estado' ? 'fa-exchange-alt' : n.tipo === 'cambio' ? 'fa-wrench' : 'fa-comment'}`} aria-hidden="true" />
                <div>
                  <p>
                    <b>{n.autor || 'Alguien'}</b> {verbo} en{' '}
                    <button type="button" className="marca-enlace" onClick={() => p && onAbrir(n.pieza)}>{p ? p.titulo : n.pieza}</button>
                    {n.tipo === 'estado' && <>: <span className="marca-oro">{n.texto}</span></>}
                  </p>
                  {n.tipo !== 'estado' && <blockquote>{n.texto}</blockquote>}
                  <small className="marca-mute">{fechaCorta(n.fecha)}{n.tipo === 'cambio' && n.resuelta ? ' · hecho' : ''}</small>
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
