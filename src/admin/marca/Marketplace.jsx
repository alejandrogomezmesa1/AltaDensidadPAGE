// Marca → Marketplace: centro para promocionar todo el catálogo en Facebook Marketplace.
// - Hoy: el plan del día (bajar las agotadas, renovar las que cumplieron días y publicar las que más
//   suenan según la vigía de tendencias), con un asistente que deja cada publicación lista en un minuto.
// - Todas: los perfumes con su estado en Marketplace, búsqueda por el original y por el nombre propio.
// - Tendencias: el informe diario del mercado y el Top 10 sugerido para la web.
// - Ajustes: pie común de las descripciones, publicaciones por día y cada cuántos días renovar.
// Precio y disponibilidad salen en vivo del catálogo. Lo publicado nunca lleva marcas de otras casas.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiJson } from '../../lib/api';
import { toastOk } from '../comunes';
import { textoDe, tamano, pesos, GENERO } from './textosMarketplace';
import PublicarAsistente from './PublicarAsistente';
import Tendencias from './Tendencias';

const PESTANAS = [
  { clave: 'hoy', titulo: 'Hoy', icono: 'fa-bolt' },
  { clave: 'todas', titulo: 'Todas', icono: 'fa-table-cells' },
  { clave: 'tendencias', titulo: 'Tendencias', icono: 'fa-arrow-trend-up' },
  { clave: 'ajustes', titulo: 'Ajustes', icono: 'fa-sliders' }
];
const CLAVE_PESTANA = 'admin_marketplace_pestana';
const PIE_LOCAL = 'admin_marketplace_pie'; // versión anterior: el pie vivía en este navegador
const DIA = 86400000;
const URL_VENDIENDO = 'https://www.facebook.com/marketplace/you/selling';

const normalizar = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const mismoDia = (f) => f && new Date(f).toDateString() === new Date().toDateString();
const dias = (f) => (f ? Math.floor((Date.now() - new Date(f).getTime()) / DIA) : null);
const leer = (clave, defecto) => { try { return localStorage.getItem(clave) || defecto; } catch { return defecto; } };

// Estado de un perfume en Marketplace
function estadoDe(x, renovarDias) {
  const agotado = Number(x.prod.agotado) === 1;
  if (!x.pub) return agotado ? 'agotado' : 'sin';
  if (x.pub.estado === 'pausada') return agotado ? 'agotado' : 'pausada';
  if (agotado) return 'bajar';
  return dias(x.pub.renovadaEn || x.pub.publicadaEn) >= renovarDias ? 'renovar' : 'activa';
}
const ETIQUETA = {
  sin: ['Sin publicar', ''], pausada: ['Pausada', 'revision'], activa: ['Publicada', 'aprobada'],
  renovar: ['Renovar', 'revision'], bajar: ['Agotada · bájala', 'descartada'], agotado: ['Agotado', 'descartada']
};

function Fuego({ tend }) {
  if (!tend || tend.puntaje < 15) return null;
  return <span className="marca-mp-fuego" title={tend.motivos?.[0] || 'En tendencia'}><i className="fas fa-fire" aria-hidden="true" /> {tend.puntaje}</span>;
}

function Original({ prod }) {
  return (
    <div className="marca-mp-original" title="Solo para ti: así sabes cuál es. No lo escribas en la publicación de Marketplace.">
      <span><i className="fas fa-lock" aria-hidden="true" /> ES EL 1.1 DE</span>
      <b>{prod.name}</b>
      {prod.brand?.name && <small>{prod.brand.name}</small>}
    </div>
  );
}

// Una fila por perfume (filas completas: nunca deja huecos como una cuadrícula a medias)
function Fila({ x, onPublicar, accionRapida }) {
  const { estado } = x;
  const [txt, tono] = ETIQUETA[estado];
  const d = x.pub ? dias(x.pub.renovadaEn || x.pub.publicadaEn) : null;
  return (
    <li className={`marca-mpf ${estado === 'agotado' ? 'marca-mpf--agotado' : ''}`}>
      <Original prod={x.prod} />
      <div className="marca-mpf-texto">
        <div className="marca-mpf-nombre">
          <h3>{x.t.nombre}</h3>
          <span className="marca-mute marca-mp-num">{x.t.n ? `Nº ${String(x.t.n).padStart(3, '0')}` : 'NUEVO'}</span>
        </div>
        <p className="marca-mp-datos">{GENERO[x.prod.gender] || 'Unisex'} · {tamano(x.prod)} · {x.t.familia}</p>
        <p className="marca-mp-gancho">{x.t.gancho}</p>
        <div className="marca-mp-pie-tarjeta">
          <span className={`marca-chip ${tono ? `marca-chip--${tono}` : ''}`}>
            {txt}{d !== null && estado !== 'sin' ? ` · hace ${d} d` : ''}{x.pub?.veces > 1 ? ` · ${x.pub.veces}ª vez` : ''}
          </span>
          {x.t.automatico && <span className="marca-chip marca-chip--revision" title="Armado con las notas del catálogo: revísalo">Texto automático</span>}
        </div>
      </div>
      <div className="marca-mpf-lado">
        <div className="marca-mp-precio">
          <b>{pesos(x.prod.price)}</b>
          <Fuego tend={x.tend} />
        </div>
        <div className="marca-mp-acciones">
          {estado === 'bajar' && <button type="button" className="btn-primary" onClick={() => accionRapida(x, 'pausar')}><i className="fas fa-pause" /> Ya la pausé</button>}
          {(estado === 'sin' || estado === 'pausada') && <button type="button" className="btn-primary" onClick={() => onPublicar(x.prod.id)}><i className="fas fa-upload" /> Publicar</button>}
          {estado === 'renovar' && <button type="button" className="btn-primary" onClick={() => accionRapida(x, 'renovar')}><i className="fas fa-rotate" /> Ya la renové</button>}
          {(estado === 'activa' || estado === 'renovar') && <button type="button" className="btn-secondary" onClick={() => onPublicar(x.prod.id)}><i className="far fa-copy" /> Textos y fotos</button>}
          {x.pub?.enlace && <a className="btn-secondary" href={x.pub.enlace} target="_blank" rel="noreferrer"><i className="fas fa-arrow-up-right-from-square" /> Ver</a>}
          {estado === 'agotado' && <span className="marca-mute">Sin existencias</span>}
        </div>
      </div>
    </li>
  );
}

// Filas compactas del plan de hoy (bajar y renovar)
function FilaPlan({ x, texto, boton, onClick }) {
  return (
    <li className="marca-mp-fila">
      <div>
        <b>{x.t.nombre}</b> <span className="marca-mute">· {x.prod.name}</span>
        <small className="marca-mute">{texto}</small>
      </div>
      <div className="marca-fila">
        <a className="btn-secondary" href={x.pub?.enlace || URL_VENDIENDO} target="_blank" rel="noreferrer">Abrir</a>
        <button type="button" className="btn-primary" onClick={onClick}>{boton}</button>
      </div>
    </li>
  );
}

export default function Marketplace({ alerta }) {
  const [productos, setProductos] = useState(null);
  const [estadoMp, setEstadoMp] = useState(null);
  const [informe, setInforme] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [cargandoInforme, setCargandoInforme] = useState(true);
  const [investigando, setInvestigando] = useState(false);
  const [pestana, setPestana] = useState(() => {
    const v = leer(CLAVE_PESTANA, 'hoy');
    return PESTANAS.some((p) => p.clave === v) ? v : 'hoy';
  });
  const [asistente, setAsistente] = useState(null); // id del perfume abierto en el asistente
  const [busqueda, setBusqueda] = useState('');
  const [genero, setGenero] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [orden, setOrden] = useState('tendencia');
  const [ajustes, setAjustes] = useState(null);

  useEffect(() => {
    apiJson('productos')
      .then((r) => setProductos(r.data || []))
      .catch((err) => { setProductos([]); alerta('No se pudieron leer los precios del catálogo: ' + err.message, 'error'); });
    apiJson('admin/marketplace')
      .then(async (r) => {
        const datos = r.data;
        // Si el pie se había editado en este navegador (versión anterior), se sube una vez al servidor
        const local = leer(PIE_LOCAL, '');
        if (local && local.trim() !== datos.ajustes.pie.trim()) {
          try {
            await apiJson('admin/marketplace/ajustes', { method: 'PUT', body: { pie: local } });
            datos.ajustes.pie = local;
          } catch { /* se queda el del servidor */ }
        }
        try { localStorage.removeItem(PIE_LOCAL); } catch { /* sin almacenamiento */ }
        setEstadoMp(datos);
        setAjustes(datos.ajustes);
      })
      .catch((err) => { setEstadoMp({ publicaciones: {}, textos: {}, ajustes: { pie: '', porDia: 5, renovarDias: 7 } }); alerta('No se pudo leer el estado de Marketplace: ' + err.message, 'error'); });
  }, [alerta]);

  const cargarInforme = useCallback((id) => {
    setCargandoInforme(true);
    return apiJson(`admin/marketplace/tendencias${id ? `?id=${id}` : ''}`)
      .then((r) => { setInforme(r.data.informe); setHistorial(r.data.historial); })
      .catch((err) => alerta('No se pudo leer el informe de tendencias: ' + err.message, 'error'))
      .finally(() => setCargandoInforme(false));
  }, [alerta]);
  useEffect(() => { cargarInforme(); }, [cargarInforme]);

  const investigar = async () => {
    setInvestigando(true);
    try {
      const r = await apiJson('admin/marketplace/tendencias', { method: 'POST' });
      await cargarInforme(r.data.id);
      toastOk('Informe de tendencias actualizado');
    } catch (e) {
      alerta(e.message, 'error');
    } finally {
      setInvestigando(false);
    }
  };

  const cambiarPestana = (p) => {
    setPestana(p);
    try { localStorage.setItem(CLAVE_PESTANA, p); } catch { /* sin almacenamiento */ }
  };

  const renovarDias = estadoMp?.ajustes.renovarDias || 7;
  const tendencias = useMemo(() => new Map((informe?.datos.productos || []).map((x) => [x.id, x])), [informe]);

  // Un ítem por perfume vendible como 1.1 (los «solo preparado» no van a Marketplace)
  const items = useMemo(() => {
    if (!productos || !estadoMp) return [];
    return productos.filter((p) => !Number(p.soloPreparado)).map((prod) => {
      const x = { prod, t: textoDe(prod, estadoMp.textos), pub: estadoMp.publicaciones[prod.id], tend: tendencias.get(prod.id) };
      return { ...x, estado: estadoDe(x, renovarDias) };
    });
  }, [productos, estadoMp, tendencias, renovarDias]);

  const puntaje = (x) => x.tend?.puntaje || 0;
  const plan = useMemo(() => {
    const cola = items.filter((x) => x.estado === 'sin' || x.estado === 'pausada')
      .sort((a, b) => puntaje(b) - puntaje(a) || (a.t.n || 999) - (b.t.n || 999));
    return {
      cola,
      bajar: items.filter((x) => x.estado === 'bajar'),
      renovar: items.filter((x) => x.estado === 'renovar').sort((a, b) => puntaje(b) - puntaje(a)),
      activas: items.filter((x) => x.estado === 'activa' || x.estado === 'renovar').length,
      hoy: items.filter((x) => x.pub && (mismoDia(x.pub.publicadaEn) || mismoDia(x.pub.renovadaEn))).length
    };
  }, [items]);

  const lista = useMemo(() => {
    const q = normalizar(busqueda);
    return items.filter((x) => {
      if (genero && x.prod.gender !== genero) return false;
      if (filtroEstado && x.estado !== filtroEstado) return false;
      if (!q) return true;
      return normalizar(`${x.prod.name} ${x.prod.brand?.name || ''} ${x.prod.originalName || ''} ${x.t.nombre} ${x.t.familia} ${Object.values(x.t.notas).flat().join(' ')}`).includes(q);
    }).sort((a, b) => (orden === 'tendencia' ? puntaje(b) - puntaje(a) || a.prod.name.localeCompare(b.prod.name, 'es')
      : orden === 'numero' ? (a.t.n || 999) - (b.t.n || 999)
        : a.prod.name.localeCompare(b.prod.name, 'es', { sensitivity: 'base' })));
  }, [items, busqueda, genero, filtroEstado, orden]);

  const guardarPub = (id, fila) => setEstadoMp((e) => {
    const publicaciones = { ...e.publicaciones };
    if (fila) publicaciones[id] = fila; else delete publicaciones[id];
    return { ...e, publicaciones };
  });
  const guardarTexto = (id, fila) => setEstadoMp((e) => {
    const textos = { ...e.textos };
    if (fila) textos[id] = fila; else delete textos[id];
    return { ...e, textos };
  });

  const accionRapida = async (x, accion) => {
    try {
      const r = await apiJson(`admin/marketplace/publicaciones/${x.prod.id}`, { method: 'PUT', body: { accion } });
      guardarPub(x.prod.id, r.data);
      toastOk(accion === 'renovar' ? 'Marcada como renovada' : 'Marcada como pausada');
    } catch (e) {
      alerta(e.message, 'error');
    }
  };

  const guardarAjustes = async () => {
    try {
      await apiJson('admin/marketplace/ajustes', { method: 'PUT', body: ajustes });
      setEstadoMp((e) => ({ ...e, ajustes }));
      toastOk('Ajustes guardados');
    } catch (e) {
      alerta(e.message, 'error');
    }
  };

  // El asistente sigue con el siguiente de la cola de hoy (sin el que se acaba de abrir)
  const itemAsistente = asistente ? items.find((x) => x.prod.id === asistente) : null;
  const siguiente = asistente ? plan.cola.find((x) => x.prod.id !== asistente && !Number(x.prod.agotado)) : null;

  if (!productos || !estadoMp) return <p className="marca-mute">Cargando Marketplace…</p>;

  const meta = estadoMp.ajustes.porDia;
  const deHoy = plan.cola.slice(0, Math.max(meta - plan.hoy, 0) || 0);

  return (
    <div className="marca-mpv">
      <div className="marca-mp-kpis">
        <div><b>{plan.activas}</b><span>publicadas</span></div>
        <div className={plan.renovar.length ? 'aviso' : ''}><b>{plan.renovar.length}</b><span>por renovar</span></div>
        <div className={plan.bajar.length ? 'alerta' : ''}><b>{plan.bajar.length}</b><span>agotadas publicadas</span></div>
        <div><b>{plan.cola.length}</b><span>sin publicar</span></div>
        <div className="marca-mp-kpi-meta">
          <b>{plan.hoy}<small>/{meta}</small></b><span>hoy</span>
          <i style={{ width: `${Math.min(100, (100 * plan.hoy) / meta)}%` }} />
        </div>
      </div>

      <nav className="marca-segmento marca-mp-pestanas" aria-label="Secciones de Marketplace">
        {PESTANAS.map((p) => (
          <button key={p.clave} type="button" className={pestana === p.clave ? 'activo' : ''} onClick={() => cambiarPestana(p.clave)} aria-current={pestana === p.clave ? 'page' : undefined}>
            <i className={`fas ${p.icono}`} aria-hidden="true" /> {p.titulo}
          </button>
        ))}
      </nav>

      {pestana === 'hoy' && (
        <div className="marca-mp-hoy">
          {informe?.resumen && (
            <section className="marca-mp-bloque marca-mp-brief">
              <span className="marca-eyebrow">LO QUE ESTÁ PASANDO EN EL MERCADO</span>
              <pre>{informe.resumen}</pre>
              <button type="button" className="marca-limpiar" onClick={() => cambiarPestana('tendencias')}>Ver el informe completo</button>
            </section>
          )}

          {plan.bajar.length > 0 && (
            <section className="marca-mp-bloque">
              <h3><span className="marca-mp-paso">1</span> Baja o pausa estas: se agotaron</h3>
              <ul className="marca-mp-filas">
                {plan.bajar.map((x) => <FilaPlan key={x.prod.id} x={x} texto="Si alguien escribe, no la tienes para entregar." boton="Ya la pausé" onClick={() => accionRapida(x, 'pausar')} />)}
              </ul>
            </section>
          )}

          {plan.renovar.length > 0 && (
            <section className="marca-mp-bloque">
              <h3><span className="marca-mp-paso">{plan.bajar.length ? 2 : 1}</span> Renueva estas (vuelven arriba en Marketplace)</h3>
              <p className="marca-mute">En «Tu cuenta → Vendiendo», abre cada una y toca «Renovar publicación». Llevan {renovarDias} días o más.</p>
              <ul className="marca-mp-filas">
                {plan.renovar.map((x) => <FilaPlan key={x.prod.id} x={x} texto={`Publicada hace ${dias(x.pub.renovadaEn || x.pub.publicadaEn)} días`} boton="Ya la renové" onClick={() => accionRapida(x, 'renovar')} />)}
              </ul>
            </section>
          )}

          <section className="marca-mp-bloque">
            <div className="marca-fila marca-fila--fin">
              <h3><span className="marca-mp-paso">{1 + (plan.bajar.length > 0) + (plan.renovar.length > 0)}</span> Publica hoy</h3>
              {plan.cola.length > 0 && (
                <button type="button" className="btn-primary" onClick={() => setAsistente(plan.cola[0].prod.id)}>
                  <i className="fas fa-bolt" /> Empezar a publicar en serie
                </button>
              )}
            </div>
            <p className="marca-mute">
              {plan.hoy >= meta ? `¡Meta de hoy cumplida (${meta})! Si tienes tiempo, sigue con los próximos: más publicaciones activas = más mensajes.`
                : `Los que más suenan en el mercado primero. Meta: ${meta} por día (cámbiala en Ajustes).`}
            </p>
            <ul className="marca-mpf-lista">
              {(deHoy.length ? deHoy : plan.cola.slice(0, 3)).map((x) => (
                <Fila key={x.prod.id} x={x} onPublicar={setAsistente} accionRapida={accionRapida} />
              ))}
            </ul>
            {!plan.cola.length && <p className="marca-mute">Todo el catálogo disponible ya está publicado. 🎉</p>}
          </section>
        </div>
      )}

      {pestana === 'todas' && (
        <>
          <div className="marca-filtros">
            <div className="search-box">
              <i className="fas fa-search" />
              <input type="search" className="admin-search-input" placeholder="Busca el original (ej. Sauvage) o el tuyo…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
            </div>
            <div className="marca-segmento" role="group" aria-label="Género">
              {[['', 'Todos'], ['Masculino', 'Hombre'], ['Femenino', 'Mujer'], ['Unisex', 'Unisex']].map(([k, t]) => (
                <button key={t} type="button" className={genero === k ? 'activo' : ''} onClick={() => setGenero(k)}>{t}</button>
              ))}
            </div>
            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} aria-label="Estado en Marketplace">
              <option value="">Todos los estados</option>
              {Object.entries(ETIQUETA).map(([k, [t]]) => <option key={k} value={k}>{t}</option>)}
            </select>
            <div className="marca-segmento" role="group" aria-label="Orden">
              {[['tendencia', 'Tendencia'], ['original', 'Original A–Z'], ['numero', 'Por Nº']].map(([k, t]) => (
                <button key={k} type="button" className={orden === k ? 'activo' : ''} onClick={() => setOrden(k)}>{t}</button>
              ))}
            </div>
          </div>
          <p className="marca-mute marca-mp-cuenta">{lista.length} perfumes</p>
          <ul className="marca-mpf-lista">
            {lista.map((x) => <Fila key={x.prod.id} x={x} onPublicar={setAsistente} accionRapida={accionRapida} />)}
          </ul>
        </>
      )}

      {pestana === 'tendencias' && (
        <Tendencias informe={informe} historial={historial} cargando={cargandoInforme} investigando={investigando}
          onInvestigar={investigar} onVerInforme={cargarInforme} items={items} onPublicar={setAsistente} alerta={alerta} />
      )}

      {pestana === 'ajustes' && ajustes && (
        <section className="marca-mp-bloque marca-mp-ajustes">
          <label>
            <span className="marca-eyebrow">PIE DE TODAS LAS DESCRIPCIONES · ENVÍOS, PAGOS Y CONTACTO</span>
            <textarea rows={5} value={ajustes.pie} maxLength={600} onChange={(e) => setAjustes({ ...ajustes, pie: e.target.value })} />
          </label>
          <div className="marca-fila">
            <label><span className="marca-eyebrow">PUBLICACIONES NUEVAS POR DÍA</span>
              <input type="number" min={1} max={30} value={ajustes.porDia} onChange={(e) => setAjustes({ ...ajustes, porDia: Number(e.target.value) })} />
            </label>
            <label><span className="marca-eyebrow">RENOVAR CADA (DÍAS)</span>
              <input type="number" min={1} max={30} value={ajustes.renovarDias} onChange={(e) => setAjustes({ ...ajustes, renovarDias: Number(e.target.value) })} />
            </label>
          </div>
          <p className="marca-mute">Marketplace deja renovar una publicación a los 7 días: vuelve a salir arriba sin crearla de nuevo.</p>
          <div className="marca-mp-acciones"><button type="button" className="btn-primary" onClick={guardarAjustes}>Guardar ajustes</button></div>
        </section>
      )}

      {itemAsistente && (
        <PublicarAsistente key={itemAsistente.prod.id} item={itemAsistente} pie={estadoMp.ajustes.pie} alerta={alerta}
          onCerrar={() => setAsistente(null)} onPublicado={guardarPub} onTexto={guardarTexto}
          siguiente={siguiente} onSiguiente={() => setAsistente(siguiente.prod.id)} />
      )}
    </div>
  );
}
