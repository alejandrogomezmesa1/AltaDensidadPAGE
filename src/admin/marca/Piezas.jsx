// Galería de las piezas del brand book, con filtros, progreso de revisión y el visor de cada pieza
// (descargas SVG/PNG, estado, favorita y el hilo de notas).
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import { apiJson } from '../../lib/api';
import { toastOk } from '../comunes';
import { ESTADOS } from './datos';
import {
  urlPieza, nombreArchivo, textoSvg, svgAPng, salidasPng, descargarBlob, crearZip, copiarTexto, fechaCorta
} from './utilidades';

const estadoDe = (estados, id) => estados[id] || { estado: 'propuesta', favorita: false, notas: 0, pendientes: 0 };

function ChipEstado({ estado }) {
  const e = ESTADOS[estado] || ESTADOS.propuesta;
  return <span className={`marca-chip marca-chip--${estado}`}><i className={`fas ${e.icono}`} aria-hidden="true" />{e.etiqueta}</span>;
}

// Barra apilada con el reparto de estados
function Progreso({ piezas, estados, compacto }) {
  const cuenta = Object.fromEntries(Object.keys(ESTADOS).map((k) => [k, 0]));
  piezas.forEach((p) => { cuenta[estadoDe(estados, p.id).estado] += 1; });
  const total = piezas.length || 1;
  const pct = Math.round((cuenta.aprobada / total) * 100);
  return (
    <div className={`marca-progreso ${compacto ? 'marca-progreso--compacto' : ''}`}>
      <div className="marca-barra" role="img" aria-label={`${cuenta.aprobada} de ${piezas.length} aprobadas`}>
        {Object.keys(ESTADOS).map((k) => cuenta[k] > 0 && (
          <span key={k} className={`marca-barra-${k}`} style={{ width: `${(cuenta[k] / total) * 100}%` }} title={`${ESTADOS[k].etiqueta}: ${cuenta[k]}`} />
        ))}
      </div>
      {!compacto && (
        <ul className="marca-leyenda">
          <li className="marca-leyenda-pct"><b>{pct}%</b> aprobado</li>
          {Object.entries(ESTADOS).map(([k, e]) => (
            <li key={k}><i className={`marca-punto marca-barra-${k}`} />{e.etiqueta} <b>{cuenta[k]}</b></li>
          ))}
        </ul>
      )}
      {compacto && <span className="marca-progreso-txt">{cuenta.aprobada}/{piezas.length}</span>}
    </div>
  );
}

// Arma un ZIP con las piezas (SVG y, si se pide, PNG 2×) dentro de carpetas por sección
async function zipPiezas(piezas, conPng, onAvance) {
  const archivos = [];
  for (let i = 0; i < piezas.length; i += 1) {
    const p = piezas[i];
    const svg = await textoSvg(p);
    archivos.push({ nombre: `alta-densidad/${p.seccion}/${p.archivo}`, datos: svg });
    if (conPng) {
      const o = salidasPng(p)[1];
      archivos.push({ nombre: `alta-densidad/${p.seccion}/png/${p.archivo.replace(/\.svg$/, '')}@2x.png`, datos: await svgAPng(svg, o.ancho, o.alto) });
    }
    onAvance?.(i + 1, piezas.length);
  }
  return crearZip(archivos);
}

function Tarjeta({ p, est, onAbrir, onFavorita }) {
  return (
    <li className={`marca-tarjeta marca-tarjeta--${est.estado}`}>
      <button type="button" className="marca-tarjeta-abrir" onClick={() => onAbrir(p.id)} aria-label={`Abrir ${p.titulo}`}>
        <span className="marca-miniatura"><img src={urlPieza(p)} alt="" loading="lazy" decoding="async" /></span>
        <span className="marca-tarjeta-info">
          <span className="marca-tarjeta-titulo">{p.titulo}</span>
          <span className="marca-tarjeta-meta">
            <ChipEstado estado={est.estado} />
            {est.notas > 0 && <span className="marca-cuenta" title={`${est.notas} notas`}><i className="far fa-comment" aria-hidden="true" /> {est.notas}</span>}
            {est.pendientes > 0 && <span className="marca-cuenta marca-cuenta--pend" title={`${est.pendientes} cambios pendientes`}><i className="fas fa-wrench" aria-hidden="true" /> {est.pendientes}</span>}
          </span>
        </span>
      </button>
      <button type="button" className={`marca-estrella ${est.favorita ? 'activa' : ''}`} onClick={() => onFavorita(p.id, !est.favorita)}
        aria-pressed={est.favorita} aria-label={est.favorita ? 'Quitar de favoritas' : 'Marcar como favorita'}>
        <i className={est.favorita ? 'fas fa-star' : 'far fa-star'} aria-hidden="true" />
      </button>
    </li>
  );
}

// ── Visor de una pieza ──
function Visor({ p, est, indice, total, onCerrar, onMover, onCambiarPieza, onNotasCambiaron, alerta }) {
  const [fondo, setFondo] = useState('cuadros');
  const [zoom, setZoom] = useState('ajustar');
  const [ocupado, setOcupado] = useState('');
  const [notas, setNotas] = useState(null);
  const [texto, setTexto] = useState('');
  const [tipo, setTipo] = useState('nota');
  const cajaRef = useRef(null);

  const cargarNotas = useCallback(async () => {
    try {
      const r = await apiJson(`admin/marca/notas?pieza=${encodeURIComponent(p.id)}`);
      setNotas(r.data);
    } catch (err) {
      setNotas([]);
      if (err.status !== 404) alerta('No se pudieron leer las notas: ' + err.message, 'error');
    }
  }, [p.id, alerta]);

  useEffect(() => { setNotas(null); setZoom('ajustar'); cargarNotas(); }, [cargarNotas]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const teclas = (e) => {
      const escribiendo = /^(TEXTAREA|INPUT|SELECT)$/.test(e.target.tagName);
      if (e.key === 'Escape') onCerrar();
      else if (!escribiendo && e.key === 'ArrowRight') onMover(1);
      else if (!escribiendo && e.key === 'ArrowLeft') onMover(-1);
    };
    document.addEventListener('keydown', teclas);
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', teclas); };
  }, [onCerrar, onMover]);

  async function bajarSvg() {
    try {
      descargarBlob(new Blob([await textoSvg(p)], { type: 'image/svg+xml' }), nombreArchivo(p, 'svg'));
    } catch (err) { alerta(err.message, 'error'); }
  }

  async function bajarPng(o) {
    setOcupado(o.clave);
    try {
      const blob = await svgAPng(await textoSvg(p), o.ancho, o.alto, fondo === 'tinta' ? '#0B0B0C' : fondo === 'hueso' ? '#F4F1EA' : null);
      descargarBlob(blob, nombreArchivo(p, `${o.clave}.png`).replace(`.${o.clave}.png`, `@${o.clave}.png`));
      if (o.recortado) alerta('La imagen se redujo al máximo que admite el navegador.', 'exito');
    } catch (err) { alerta(err.message, 'error'); } finally { setOcupado(''); }
  }

  async function copiarCodigo() {
    try { await copiarTexto(await textoSvg(p)); toastOk('Código SVG copiado'); } catch (err) { alerta(err.message, 'error'); }
  }

  async function enviarNota(e) {
    e?.preventDefault();
    const t = texto.trim();
    if (!t) return;
    setOcupado('nota');
    try {
      const r = await apiJson('admin/marca/notas', { method: 'POST', body: { pieza: p.id, texto: t, tipo } });
      setNotas((n) => [...(n || []), r.data]);
      setTexto('');
      onNotasCambiaron(p.id, { notas: 1, pendientes: tipo === 'cambio' ? 1 : 0 });
    } catch (err) { alerta('No se pudo guardar la nota: ' + err.message, 'error'); } finally { setOcupado(''); }
  }

  async function resolver(n) {
    try {
      await apiJson(`admin/marca/notas/${n.id}`, { method: 'PATCH', body: { resuelta: !n.resuelta } });
      setNotas((l) => l.map((x) => (x.id === n.id ? { ...x, resuelta: !n.resuelta } : x)));
      onNotasCambiaron(p.id, { notas: 0, pendientes: n.resuelta ? 1 : -1 });
    } catch (err) { alerta(err.message, 'error'); }
  }

  async function borrar(n) {
    try {
      await apiJson(`admin/marca/notas/${n.id}`, { method: 'DELETE' });
      setNotas((l) => l.filter((x) => x.id !== n.id));
      onNotasCambiaron(p.id, { notas: -1, pendientes: n.tipo === 'cambio' && !n.resuelta ? -1 : 0 });
    } catch (err) { alerta(err.message, 'error'); }
  }

  async function cambiarEstado(estado) {
    if (estado === est.estado) return;
    const ok = await onCambiarPieza(p.id, { estado });
    if (ok) cargarNotas();
  }

  const escala = zoom === 'ajustar' ? null : zoom;
  const salidas = salidasPng(p);

  return (
    <div className="marca-visor" role="dialog" aria-modal="true" aria-label={p.titulo}
      onClick={(e) => { if (e.target === e.currentTarget) onCerrar(); }}>
      <div className="marca-visor-caja">
        <div className="marca-escenario">
          <div className="marca-escenario-barra">
            <div className="marca-segmento" role="group" aria-label="Fondo">
              {[['cuadros', 'Transparente'], ['tinta', 'Tinta'], ['hueso', 'Hueso']].map(([k, t]) => (
                <button key={k} type="button" className={fondo === k ? 'activo' : ''} onClick={() => setFondo(k)} aria-pressed={fondo === k}>
                  <i className={`marca-muestra marca-muestra--${k}`} aria-hidden="true" />{t}
                </button>
              ))}
            </div>
            <div className="marca-segmento" role="group" aria-label="Zoom">
              {[['ajustar', 'Ajustar'], [1, '100 %'], [2, '200 %']].map(([k, t]) => (
                <button key={k} type="button" className={zoom === k ? 'activo' : ''} onClick={() => setZoom(k)} aria-pressed={zoom === k}>{t}</button>
              ))}
            </div>
          </div>
          <div ref={cajaRef} className={`marca-lienzo marca-lienzo--${fondo} ${escala ? 'marca-lienzo--zoom' : ''}`}>
            <img src={urlPieza(p)} alt={p.titulo} style={escala ? { width: p.ancho * escala, maxWidth: 'none', maxHeight: 'none' } : undefined} />
          </div>
          <div className="marca-navegar">
            <button type="button" onClick={() => onMover(-1)} aria-label="Pieza anterior"><i className="fas fa-arrow-left" /></button>
            <span>{indice + 1} / {total}</span>
            <button type="button" onClick={() => onMover(1)} aria-label="Pieza siguiente"><i className="fas fa-arrow-right" /></button>
          </div>
        </div>

        <aside className="marca-panel">
          <header className="marca-panel-cabeza">
            <div>
              <span className="up marca-eyebrow">{p.seccionTitulo}</span>
              <h3>{p.titulo}</h3>
            </div>
            <button type="button" className="modal-cerrar" onClick={onCerrar} aria-label="Cerrar"><i className="fas fa-times" /></button>
          </header>
          {p.descripcion && <p className="marca-desc">{p.descripcion}</p>}
          <dl className="marca-ficha">
            <div><dt>Archivo</dt><dd><code>{p.archivo}</code></dd></div>
            <div><dt>Lienzo</dt><dd>{p.ancho} × {p.alto} px</dd></div>
            {p.mm && <div><dt>Impresión</dt><dd>{p.mm[0]} × {p.mm[1]} mm</dd></div>}
          </dl>

          <section className="marca-bloque">
            <h4 className="up">Estado</h4>
            <div className="marca-estados" role="radiogroup" aria-label="Estado de la pieza">
              {Object.entries(ESTADOS).map(([k, e]) => (
                <button key={k} type="button" role="radio" aria-checked={est.estado === k}
                  className={`marca-estado-btn marca-estado-btn--${k} ${est.estado === k ? 'activo' : ''}`} onClick={() => cambiarEstado(k)}>
                  <i className={`fas ${e.icono}`} aria-hidden="true" />{e.etiqueta}
                </button>
              ))}
            </div>
            <div className="marca-fila">
              <button type="button" className={`btn-secondary marca-fav ${est.favorita ? 'activa' : ''}`} onClick={() => onCambiarPieza(p.id, { favorita: !est.favorita })}>
                <i className={est.favorita ? 'fas fa-star' : 'far fa-star'} /> {est.favorita ? 'Favorita' : 'Marcar favorita'}
              </button>
              {est.actualizadoPor && <small className="marca-mute">Último cambio: {est.actualizadoPor}</small>}
            </div>
          </section>

          <section className="marca-bloque">
            <h4 className="up">Descargar</h4>
            <div className="marca-descargas">
              <button type="button" className="btn-primary" onClick={bajarSvg}><i className="fas fa-bezier-curve" /> SVG</button>
              {salidas.map((o) => (
                <button key={o.clave} type="button" className="btn-secondary" onClick={() => bajarPng(o)} disabled={Boolean(ocupado)}
                  title={`${o.ancho} × ${o.alto} px${o.impresion ? ' · para imprenta' : ''}`}>
                  {ocupado === o.clave ? <i className="fas fa-spinner fa-spin" /> : <i className="far fa-image" />} PNG {o.etiqueta}
                </button>
              ))}
            </div>
            <small className="marca-mute">
              El PNG {fondo === 'cuadros' ? 'sale con fondo transparente' : `sale sobre fondo ${fondo}`}: cámbialo con los botones de fondo de la vista previa.
            </small>
            <div className="marca-fila">
              <button type="button" className="btn-secondary" onClick={copiarCodigo}><i className="fas fa-code" /> Copiar código</button>
              <button type="button" className="btn-secondary" onClick={() => copiarTexto(`branding/svg/${p.id}`).then(() => toastOk('Ruta copiada'))}
                title="Ruta dentro de la carpeta branding, para pedir cambios">
                <i className="fas fa-link" /> Copiar ruta
              </button>
            </div>
          </section>

          <section className="marca-bloque marca-notas">
            <h4 className="up">Notas {notas && notas.length > 0 && <span className="marca-mute">({notas.filter((n) => n.tipo !== 'estado').length})</span>}</h4>
            {notas === null && <p className="marca-mute">Cargando…</p>}
            {notas && notas.length === 0 && <p className="marca-mute">Sin notas todavía. Deja una observación o un pedido de cambio.</p>}
            {notas && notas.length > 0 && (
              <ol className="marca-hilo">
                {notas.map((n) => (
                  <li key={n.id} className={`marca-nota marca-nota--${n.tipo} ${n.resuelta ? 'resuelta' : ''}`}>
                    {n.tipo === 'estado' ? (
                      <p className="marca-nota-estado"><i className="fas fa-exchange-alt" aria-hidden="true" /> {n.texto} <span>· {n.autor || 'Alguien'} · {fechaCorta(n.fecha)}</span></p>
                    ) : (
                      <>
                        <div className="marca-nota-cabeza">
                          <b>{n.autor || 'Sin nombre'}</b>
                          {n.tipo === 'cambio' && <span className="marca-etq-cambio">{n.resuelta ? 'Cambio hecho' : 'Cambio pedido'}</span>}
                          <time dateTime={n.fecha}>{fechaCorta(n.fecha)}</time>
                        </div>
                        <p>{n.texto}</p>
                        <div className="marca-nota-acciones">
                          {n.tipo === 'cambio' && (
                            <button type="button" onClick={() => resolver(n)}>
                              <i className={n.resuelta ? 'fas fa-undo' : 'fas fa-check'} /> {n.resuelta ? 'Reabrir' : 'Marcar hecho'}
                            </button>
                          )}
                          <button type="button" onClick={() => borrar(n)}><i className="far fa-trash-alt" /> Borrar</button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ol>
            )}
            <form className="marca-redactar" onSubmit={enviarNota}>
              <div className="marca-segmento" role="radiogroup" aria-label="Tipo de nota">
                <button type="button" role="radio" aria-checked={tipo === 'nota'} className={tipo === 'nota' ? 'activo' : ''} onClick={() => setTipo('nota')}>
                  <i className="far fa-comment" /> Nota
                </button>
                <button type="button" role="radio" aria-checked={tipo === 'cambio'} className={tipo === 'cambio' ? 'activo' : ''} onClick={() => setTipo('cambio')}>
                  <i className="fas fa-wrench" /> Pedir cambio
                </button>
              </div>
              <textarea value={texto} onChange={(e) => setTexto(e.target.value)} maxLength={2000} rows={3}
                placeholder={tipo === 'cambio' ? 'Qué hay que cambiar: «el oro más cálido», «el símbolo más grande»…' : 'Escribe una nota sobre esta pieza…'}
                onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) enviarNota(e); }} />
              <div className="marca-fila marca-fila--fin">
                <small className="marca-mute">⌘/Ctrl + Enter para enviar</small>
                <button type="submit" className="btn-primary" disabled={!texto.trim() || ocupado === 'nota'}>
                  {ocupado === 'nota' ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-paper-plane" />} Guardar
                </button>
              </div>
            </form>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default function Piezas({ manifest, estados, setEstados, sinServidor, alerta, abrirId, setAbrirId }) {
  const [busqueda, setBusqueda] = useState('');
  const [seccion, setSeccion] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [soloFav, setSoloFav] = useState(false);
  const [soloPend, setSoloPend] = useState(false);
  const [zip, setZip] = useState(null); // { hechas, total }

  const titulos = useMemo(() => Object.fromEntries(manifest.secciones.map((s) => [s.id, s.titulo])), [manifest]);
  const todas = useMemo(() => manifest.piezas.map((p) => ({ ...p, seccionTitulo: titulos[p.seccion] })), [manifest, titulos]);

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return todas.filter((p) => {
      const e = estadoDe(estados, p.id);
      if (seccion && p.seccion !== seccion) return false;
      if (filtroEstado && e.estado !== filtroEstado) return false;
      if (soloFav && !e.favorita) return false;
      if (soloPend && !e.pendientes) return false;
      if (!q) return true;
      return `${p.titulo} ${p.descripcion} ${p.archivo} ${p.seccionTitulo}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q);
    });
  }, [todas, estados, busqueda, seccion, filtroEstado, soloFav, soloPend]);

  const grupos = useMemo(() => manifest.secciones
    .map((s) => ({ ...s, piezas: filtradas.filter((p) => p.seccion === s.id), todas: todas.filter((p) => p.seccion === s.id) }))
    .filter((g) => g.piezas.length), [manifest, filtradas, todas]);

  const cambiarPieza = useCallback(async (id, cambio) => {
    if (sinServidor) { alerta('El servidor de la marca no responde: no se puede guardar.', 'error'); return false; }
    const previo = estadoDe(estados, id);
    setEstados((m) => ({ ...m, [id]: { ...previo, ...cambio } }));
    try {
      const r = await apiJson('admin/marca/piezas', { method: 'PUT', body: { pieza: id, ...cambio } });
      setEstados((m) => ({ ...m, [id]: { ...previo, ...r.data } }));
      return true;
    } catch (err) {
      setEstados((m) => ({ ...m, [id]: previo }));
      alerta('No se pudo guardar: ' + err.message, 'error');
      return false;
    }
  }, [estados, setEstados, sinServidor, alerta]);

  const notasCambiaron = useCallback((id, d) => {
    setEstados((m) => {
      const e = estadoDe(m, id);
      return { ...m, [id]: { ...e, notas: Math.max(0, (e.notas || 0) + d.notas), pendientes: Math.max(0, (e.pendientes || 0) + d.pendientes) } };
    });
  }, [setEstados]);

  const indiceAbierta = filtradas.findIndex((p) => p.id === abrirId);
  const abierta = indiceAbierta >= 0 ? filtradas[indiceAbierta] : todas.find((p) => p.id === abrirId);
  const lista = indiceAbierta >= 0 ? filtradas : todas;
  const indice = lista.findIndex((p) => p.id === abrirId);
  const mover = useCallback((d) => {
    if (!lista.length) return;
    setAbrirId(lista[(indice + d + lista.length) % lista.length].id);
  }, [lista, indice, setAbrirId]);
  const cerrar = useCallback(() => setAbrirId(null), [setAbrirId]);

  async function descargarZip(piezas, nombre) {
    const r = await Swal.fire({
      title: `Descargar ${piezas.length} piezas`,
      text: 'El ZIP trae los SVG. ¿Agrego también un PNG 2× de cada una?',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'Solo SVG',
      denyButtonText: 'SVG + PNG 2×',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#9A7B3F',
      denyButtonColor: '#444',
      background: '#151517',
      color: '#F2EEE6'
    });
    if (r.isDismissed) return;
    const conPng = r.isDenied;
    setZip({ hechas: 0, total: piezas.length });
    try {
      const blob = await zipPiezas(piezas, conPng, (hechas, total) => setZip({ hechas, total }));
      descargarBlob(blob, `${nombre}.zip`);
    } catch (err) {
      alerta('No se pudo armar el ZIP: ' + err.message, 'error');
    } finally {
      setZip(null);
    }
  }

  const hayFiltros = busqueda || seccion || filtroEstado || soloFav || soloPend;

  return (
    <>
      <Progreso piezas={todas} estados={estados} />

      <div className="marca-filtros">
        <div className="search-box">
          <i className="fas fa-search" />
          <input type="search" className="admin-search-input" placeholder="Buscar pieza…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </div>
        <select className="marca-select" value={seccion} onChange={(e) => setSeccion(e.target.value)} aria-label="Sección">
          <option value="">Todas las secciones</option>
          {manifest.secciones.map((s) => <option key={s.id} value={s.id}>{s.titulo}</option>)}
        </select>
        <div className="marca-segmento" role="group" aria-label="Estado">
          <button type="button" className={!filtroEstado ? 'activo' : ''} onClick={() => setFiltroEstado('')}>Todas</button>
          {Object.entries(ESTADOS).map(([k, e]) => (
            <button key={k} type="button" className={filtroEstado === k ? 'activo' : ''} onClick={() => setFiltroEstado(filtroEstado === k ? '' : k)}>{e.etiqueta}</button>
          ))}
        </div>
        <button type="button" className={`marca-toggle ${soloFav ? 'activo' : ''}`} onClick={() => setSoloFav(!soloFav)} aria-pressed={soloFav}>
          <i className="fas fa-star" /> Favoritas
        </button>
        <button type="button" className={`marca-toggle ${soloPend ? 'activo' : ''}`} onClick={() => setSoloPend(!soloPend)} aria-pressed={soloPend}>
          <i className="fas fa-wrench" /> Con cambios pendientes
        </button>
      </div>

      <div className="marca-resumen">
        <span>{filtradas.length} de {todas.length} piezas{hayFiltros && (
          <button type="button" className="marca-limpiar" onClick={() => { setBusqueda(''); setSeccion(''); setFiltroEstado(''); setSoloFav(false); setSoloPend(false); }}>Limpiar filtros</button>
        )}</span>
        <button type="button" className="btn-secondary" disabled={!filtradas.length || Boolean(zip)}
          onClick={() => descargarZip(filtradas, hayFiltros ? 'alta-densidad-marca-seleccion' : 'alta-densidad-marca')}>
          {zip ? <><i className="fas fa-spinner fa-spin" /> {zip.hechas}/{zip.total}</> : <><i className="fas fa-file-archive" /> Descargar {hayFiltros ? 'lo filtrado' : 'todo'} (.zip)</>}
        </button>
      </div>

      {!grupos.length && <p className="armador-ayuda">Ninguna pieza coincide con los filtros.</p>}

      {grupos.map((g) => (
        <section key={g.id} className="marca-seccion" aria-labelledby={`ms-${g.id}`}>
          <header className="marca-seccion-cabeza">
            <h3 id={`ms-${g.id}`}>{g.titulo} <span className="marca-mute">{g.piezas.length}</span></h3>
            <Progreso piezas={g.todas} estados={estados} compacto />
            <button type="button" className="marca-icono-btn" disabled={Boolean(zip)} onClick={() => descargarZip(g.piezas, `alta-densidad-${g.id}`)}
              title="Descargar la sección (.zip)" aria-label={`Descargar ${g.titulo} en ZIP`}>
              <i className="fas fa-download" />
            </button>
          </header>
          <ul className="marca-grid">
            {g.piezas.map((p) => (
              <Tarjeta key={p.id} p={p} est={estadoDe(estados, p.id)} onAbrir={setAbrirId} onFavorita={(id, fav) => cambiarPieza(id, { favorita: fav })} />
            ))}
          </ul>
        </section>
      ))}

      {abierta && (
        <Visor p={abierta} est={estadoDe(estados, abierta.id)} indice={indice} total={lista.length}
          onCerrar={cerrar} onMover={mover} onCambiarPieza={cambiarPieza} onNotasCambiaron={notasCambiaron} alerta={alerta} />
      )}
    </>
  );
}
