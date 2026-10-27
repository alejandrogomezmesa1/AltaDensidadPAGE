// Informe de la vigía de tendencias: qué se busca hoy en Colombia, qué perfumes del catálogo suenan,
// notas en alza, agotados con demanda, lo que buscan y no tenemos, y un Top 10 para la web que se aplica
// con un clic. Es interno: aquí sí aparecen los nombres de los originales.
import { useEffect, useState } from 'react';
import { apiJson } from '../../lib/api';
import { toastOk } from '../comunes';

const fecha = (f) => (f ? new Date(f).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '');
const ESTADO_FUENTE = { ok: 'ok', 'sin respuesta': 'err' };
const NOMBRE_FUENTE = { busquedas: 'Búsquedas Google Colombia', noticias: 'Google Noticias', comunidad: 'Comunidades (Reddit)' };

function Flecha({ cambio }) {
  if (cambio === null || cambio === undefined || cambio === 0) return null;
  return <span className={`marca-tend-cambio ${cambio > 0 ? 'sube' : 'baja'}`}>{cambio > 0 ? '▲' : '▼'} {Math.abs(cambio)}</span>;
}

export default function Tendencias({ informe, historial, cargando, investigando, onInvestigar, onVerInforme, items, onPublicar, alerta }) {
  const [top10Actual, setTop10Actual] = useState(null);
  const [aplicando, setAplicando] = useState(false);
  const porId = new Map(items.map((x) => [x.prod.id, x]));

  useEffect(() => {
    apiJson('top10', { auth: false }).then((r) => setTop10Actual((r.data || []).map((x) => x.producto_id))).catch(() => setTop10Actual([]));
  }, []);

  const aplicarTop10 = async () => {
    setAplicando(true);
    try {
      await apiJson('top10', { method: 'PUT', body: { productos: informe.datos.top10 } });
      setTop10Actual(informe.datos.top10);
      toastOk('Top 10 de la web actualizado');
    } catch (e) {
      alerta('No se pudo aplicar el Top 10: ' + e.message, 'error');
    } finally {
      setAplicando(false);
    }
  };

  const cabecera = (
    <div className="marca-fila marca-fila--fin marca-tend-barra">
      <div>
        <span className="marca-eyebrow">VIGÍA DE TENDENCIAS</span>
        <p className="marca-mute">
          {informe ? <>Informe del {fecha(informe.generadoEn)} · {informe.origen === 'automatico' ? 'automático (cada día 06:00)' : 'a pedido'} · resumen {informe.resumenOrigen === 'aura' ? 'escrito por AURA' : 'armado con reglas (AURA fuera de línea)'}</>
            : cargando ? 'Cargando el último informe…' : 'Todavía no hay informes: investiga ahora o espera al de las 06:00.'}
        </p>
      </div>
      <div className="marca-fila">
        {historial.length > 1 && (
          <select value={informe?.id || ''} onChange={(e) => onVerInforme(Number(e.target.value))} aria-label="Informes anteriores">
            {historial.map((h) => <option key={h.id} value={h.id}>{fecha(h.generadoEn)}{h.origen === 'manual' ? ' · a pedido' : ''}</option>)}
          </select>
        )}
        <button type="button" className="btn-primary" disabled={investigando} onClick={onInvestigar}>
          <i className={`fas ${investigando ? 'fa-spinner fa-spin' : 'fa-magnifying-glass-chart'}`} /> {investigando ? 'Investigando… (≈30 s)' : 'Investigar ahora'}
        </button>
      </div>
    </div>
  );
  if (!informe) return <div className="marca-tend">{cabecera}</div>;

  const d = informe.datos;
  const nombre = (id) => porId.get(id)?.prod.name || `#${id}`;
  const propio = (id) => porId.get(id)?.t.nombre;
  const cambiaTop = top10Actual && d.top10.length === 10 && JSON.stringify(top10Actual) !== JSON.stringify(d.top10);
  // Cajas que pueden faltar: si queda una sola, ocupa todo el ancho (sin huecos en la cuadrícula)
  const extras = [
    d.agotadosConDemanda.length > 0 && ['agotados', <>
      <h3>Tienen demanda y no hay existencias</h3>
      <p className="marca-mute">Repón primero estos: la gente los está buscando.</p>
      <ul className="marca-tend-simple">{d.agotadosConDemanda.map((id) => <li key={id}><b>{nombre(id)}</b>{propio(id) && <span className="marca-mute"> · {propio(id)}</span>}</li>)}</ul>
    </>],
    d.sinCatalogo.length > 0 && ['sin', <>
      <h3>Buscan y no lo tienes</h3>
      <p className="marca-mute">Búsquedas frecuentes en Colombia sin un perfume tuyo que responda. Revisa cuáles vale la pena traer.</p>
      <ul className="marca-tend-simple">{d.sinCatalogo.map((x) => <li key={x.busqueda}>«{x.busqueda}» <small className="marca-mute">#{x.puesto}</small></li>)}</ul>
    </>]
  ].filter(Boolean);

  return (
    <div className="marca-tend">
      {cabecera}
      <section className="marca-tend-resumen">
        <pre>{informe.resumen}</pre>
        <div className="marca-fila">
          {Object.entries(d.fuentes || {}).map(([k, f]) => (
            <span key={k} className={`marca-chip marca-chip--${ESTADO_FUENTE[f.estado] === 'ok' ? 'aprobada' : ESTADO_FUENTE[f.estado] === 'err' ? 'descartada' : 'revision'}`} title={f.estado}>
              {NOMBRE_FUENTE[k] || k}: {f.total}
            </span>
          ))}
        </div>
      </section>

      <div className="marca-tend-grid">
        <section className="marca-tend-caja marca-tend-caja--ancha">
          <h3>Lo que más suena de tu catálogo</h3>
          <ol className="marca-tend-lista">
            {d.productos.filter((x) => x.directo || x.puntaje >= 30).slice(0, 15).map((x) => {
              const it = porId.get(x.id);
              return (
                <li key={x.id}>
                  <div className="marca-tend-barra-p"><i style={{ width: `${x.puntaje}%` }} /></div>
                  <div className="marca-tend-info">
                    <b>{nombre(x.id)}</b>{x.marca && <small> · {x.marca}</small>} <Flecha cambio={x.cambio} />
                    {propio(x.id) && <span className="marca-mute"> → tuyo: {propio(x.id)}</span>}
                    {x.motivos[0] && <p className="marca-mute">{x.motivos[0]}</p>}
                  </div>
                  <div className="marca-tend-accion">
                    <span className="marca-tend-puntos">{x.puntaje}</span>
                    {x.vendible === false ? <span className="marca-chip marca-chip--descartada">Agotado</span>
                      : it && (it.estado === 'activa' || it.estado === 'renovar') ? <span className="marca-chip marca-chip--aprobada">Publicada</span>
                        : it ? <button type="button" className="btn-secondary" onClick={() => onPublicar(x.id)}>Publicar</button> : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="marca-tend-caja">
          <div className="marca-fila marca-fila--fin">
            <h3>Top 10 sugerido para la web</h3>
            <button type="button" className="btn-primary" disabled={!cambiaTop || aplicando} onClick={aplicarTop10}>
              {cambiaTop ? 'Aplicar a la web' : 'Ya está aplicado'}
            </button>
          </div>
          <p className="marca-mute">Lo que más suena y se puede vender hoy, con variedad: máximo 2 por marca y al menos 3 de hombre y 3 de mujer.</p>
          <ol className="marca-tend-top">
            {d.top10.map((id, i) => (
              <li key={id}>
                <span>{i + 1}</span><b>{nombre(id)}</b>
                {top10Actual && !top10Actual.includes(id) && <small className="marca-tend-nuevo">nuevo</small>}
              </li>
            ))}
          </ol>
        </section>

        <section className="marca-tend-caja">
          <h3>Notas y estilos en alza</h3>
          <div className="marca-tend-chips">{d.notas.map((n) => <span key={n.nota}>{n.nota}</span>)}</div>
          <h3>Marcas que más suenan</h3>
          <div className="marca-tend-chips">{d.marcas.map((m) => <span key={m.marca}>{m.marca}</span>)}</div>
        </section>

        {extras.map(([clave, contenido]) => (
          <section key={clave} className={`marca-tend-caja ${extras.length === 1 ? 'marca-tend-caja--ancha' : ''}`}>{contenido}</section>
        ))}

        {d.noticias.length > 0 && (
          <section className="marca-tend-caja marca-tend-caja--ancha">
            <h3>Noticias del mercado</h3>
            <ul className="marca-tend-noticias">
              {d.noticias.map((x) => (
                <li key={x.url || x.titulo}>
                  <a href={x.url} target="_blank" rel="noreferrer">{x.titulo}</a>
                  <small className="marca-mute">{x.fuente}{x.dias !== undefined ? ` · hace ${Math.max(1, Math.round(x.dias))} d` : ''}</small>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
