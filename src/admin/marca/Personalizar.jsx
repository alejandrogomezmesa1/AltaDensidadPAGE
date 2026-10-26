// Personalizar: las piezas que cambian por persona o por producto (firma de correo, etiquetas,
// tarjeta de agradecimiento, QR). Cada versión se guarda (crear, editar, duplicar, borrar) y se
// descarga en SVG, PNG o PDF a tamaño real; las etiquetas además salen en hoja A4 para imprimir.
import { useCallback, useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { apiJson } from '../../lib/api';
import { toastOk } from '../comunes';
import { cargarFuentes, documento } from './dibujo';
import { PLANTILLAS, plantillaDe, datosPorDefecto, enlaceQr, referenciaNueva, firmaHtml } from './personalizables';
import { descargarBlob, svgAPng, copiarTexto } from './utilidades';

const slug = (t) => String(t || 'pieza').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'pieza';

function vistaGuardada() {
  try {
    const v = localStorage.getItem('admin_marca_personalizar');
    return plantillaDe(v) ? v : PLANTILLAS[0].tipo;
  } catch {
    return PLANTILLAS[0].tipo;
  }
}

// SVG a una página PDF del tamaño indicado (vectorial con svg2pdf)
async function svgEnPdf(doc, texto, x, y, w, h) {
  const { svg2pdf } = await import('svg2pdf.js');
  const caja = document.createElement('div');
  caja.style.cssText = 'position:fixed;left:-99999px;top:0;width:0;height:0;overflow:hidden';
  caja.innerHTML = texto.replace(/<\?xml[^>]*>/, '');
  document.body.appendChild(caja);
  try {
    await svg2pdf(caja.querySelector('svg'), doc, { x, y, width: w, height: h });
  } finally {
    caja.remove();
  }
}

// Hoja A4 con las etiquetas guardadas (cada una tantas veces como sus «copias»), con guías de corte
function paginasA4(pl, registros, F) {
  const [lw, lh] = pl.mm;
  const margen = 10;
  const sep = 4;
  const cols = Math.floor((210 - 2 * margen + sep) / (lw + sep));
  const filas = Math.floor((297 - 2 * margen + sep) / (lh + sep));
  const porHoja = cols * filas;
  const items = registros.flatMap((r) => Array.from({ length: Math.max(0, Math.min(99, Number(r.datos.copias) || 0)) }, () => r.datos));
  const paginas = [];
  for (let i = 0; i < items.length; i += porHoja) {
    let c = '<rect width="2100" height="2970" fill="#FFFFFF"/>';
    items.slice(i, i + porHoja).forEach((d, k) => {
      const x = (margen + (k % cols) * (lw + sep)) * 10;
      const y = (margen + Math.floor(k / cols) * (lh + sep)) * 10;
      const art = pl.dibujar(d, F);
      c += `<g transform="translate(${x},${y}) scale(${(lw * 10) / art.w})">${art.svg}</g>`;
      c += `<rect x="${x}" y="${y}" width="${lw * 10}" height="${lh * 10}" fill="none" stroke="#BBBBBB" stroke-width="1" stroke-dasharray="6 6"/>`;
    });
    paginas.push(documento(2100, 2970, c, { mm: [210, 297] }));
  }
  return { paginas, total: items.length, porHoja };
}

function Campo({ c, valor, onCambio }) {
  const id = `pers-${c.clave}`;
  return (
    <label className="marca-pers-campo" htmlFor={id}>
      <span>{c.etiqueta}</span>
      {c.tipo === 'area' && <textarea id={id} rows={3} maxLength={c.max} value={valor ?? ''} onChange={(e) => onCambio(e.target.value)} />}
      {c.tipo === 'select' && (
        <select id={id} value={valor ?? ''} onChange={(e) => onCambio(e.target.value)}>
          {c.opciones.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
        </select>
      )}
      {c.tipo === 'numero' && (
        <input id={id} type="number" inputMode="numeric" min={c.min} max={c.max} value={valor ?? 0}
          onChange={(e) => onCambio(e.target.value === '' ? '' : Math.max(c.min ?? 0, Math.min(c.max ?? 999, parseInt(e.target.value, 10) || 0)))} />
      )}
      {!c.tipo && <input id={id} type="text" maxLength={c.max} value={valor ?? ''} onChange={(e) => onCambio(e.target.value)} />}
      {c.ayuda && <small>{c.ayuda}</small>}
    </label>
  );
}

export default function Personalizar({ alerta }) {
  const [tipo, setTipo] = useState(vistaGuardada);
  const [F, setF] = useState(null);
  const [lista, setLista] = useState(null);
  const [actual, setActual] = useState(null); // { id, nombre, datos }
  const [sucio, setSucio] = useState(false);
  const [ocupado, setOcupado] = useState('');
  const pl = plantillaDe(tipo);

  useEffect(() => { cargarFuentes().then(setF).catch((e) => alerta(e.message, 'error')); }, [alerta]);

  const nueva = useCallback((existentes = []) => {
    const datos = datosPorDefecto(pl);
    if (pl.tipo === 'qr') datos.referencia = referenciaNueva(existentes.map((r) => r.datos.referencia));
    setActual({ id: null, nombre: '', datos });
    setSucio(false);
  }, [pl]);

  const cargar = useCallback(async () => {
    setLista(null);
    try {
      const r = await apiJson(`admin/marca/plantillas?tipo=${pl.tipo}`);
      setLista(r.data);
      if (r.data.length) { setActual({ ...r.data[0], datos: { ...datosPorDefecto(pl), ...r.data[0].datos } }); setSucio(false); } else nueva([]);
    } catch (err) {
      setLista([]);
      nueva([]);
      alerta('No se pudieron leer las versiones guardadas: ' + err.message, 'error');
    }
  }, [pl, nueva, alerta]);

  useEffect(() => { cargar(); }, [cargar]);

  async function seguirSinGuardar() {
    if (!sucio) return true;
    const r = await Swal.fire({
      title: 'Hay cambios sin guardar', text: '¿Los descartas?', showCancelButton: true, confirmButtonText: 'Descartar', cancelButtonText: 'Seguir editando',
      confirmButtonColor: '#9A7B3F', background: '#151517', color: '#F2EEE6'
    });
    return r.isConfirmed;
  }

  async function cambiarTipo(t) {
    if (t === tipo || !(await seguirSinGuardar())) return;
    setTipo(t);
    try { localStorage.setItem('admin_marca_personalizar', t); } catch { /* sin almacenamiento */ }
  }

  async function abrir(r) {
    if (actual?.id === r.id || !(await seguirSinGuardar())) return;
    setActual({ ...r, datos: { ...datosPorDefecto(pl), ...r.datos } });
    setSucio(false);
  }

  const cambiar = (clave, v) => { setActual((a) => ({ ...a, datos: { ...a.datos, [clave]: v } })); setSucio(true); };

  const arte = useMemo(() => {
    if (!F || !actual) return null;
    try {
      const a = pl.dibujar(actual.datos, F);
      return { ...a, texto: documento(a.w, a.h, a.svg, { mm: pl.mm, titulo: `${pl.titulo} · ${pl.nombreDe(actual.datos)}` }) };
    } catch (err) {
      return { error: err.message };
    }
  }, [F, actual, pl]);
  const vistaUrl = useMemo(() => (arte?.texto ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(arte.texto)}` : ''), [arte]);

  const nombreArchivo = (ext) => `alta-densidad_${slug(pl.titulo)}_${slug(actual?.nombre || pl.nombreDe(actual?.datos || {}))}.${ext}`;

  async function guardar(comoNueva = false) {
    // la copia de un QR lleva su propia referencia (y su nombre la muestra)
    const datos = comoNueva && pl.tipo === 'qr'
      ? { ...actual.datos, referencia: referenciaNueva((lista || []).map((r) => r.datos.referencia)) }
      : actual.datos;
    const nombre = comoNueva
      ? (pl.tipo === 'qr' ? pl.nombreDe(datos) : `${actual.nombre || pl.nombreDe(datos)} (copia)`)
      : actual.nombre || pl.nombreDe(datos);
    setOcupado('guardar');
    try {
      const body = { tipo: pl.tipo, nombre, datos };
      const r = actual.id && !comoNueva
        ? await apiJson(`admin/marca/plantillas/${actual.id}`, { method: 'PUT', body })
        : await apiJson('admin/marca/plantillas', { method: 'POST', body });
      setLista((l) => [...(l || []).filter((x) => x.id !== r.data.id), r.data].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')));
      setActual({ ...r.data, datos: { ...datosPorDefecto(pl), ...r.data.datos } });
      setSucio(false);
      toastOk(comoNueva ? 'Copia guardada' : 'Guardado');
    } catch (err) {
      alerta('No se pudo guardar: ' + err.message, 'error');
    } finally {
      setOcupado('');
    }
  }

  async function borrar() {
    const r = await Swal.fire({
      title: `¿Borrar «${actual.nombre}»?`, text: 'Se borra esta versión guardada; las descargas que ya hiciste no cambian.', icon: 'warning',
      showCancelButton: true, confirmButtonText: 'Borrar', cancelButtonText: 'Cancelar', confirmButtonColor: '#8C2A3A', background: '#151517', color: '#F2EEE6'
    });
    if (!r.isConfirmed) return;
    try {
      await apiJson(`admin/marca/plantillas/${actual.id}`, { method: 'DELETE' });
      const resto = lista.filter((x) => x.id !== actual.id);
      setLista(resto);
      if (resto.length) setActual({ ...resto[0], datos: { ...datosPorDefecto(pl), ...resto[0].datos } }); else nueva([]);
      setSucio(false);
      toastOk('Borrada');
    } catch (err) {
      alerta('No se pudo borrar: ' + err.message, 'error');
    }
  }

  async function bajar(formato) {
    if (!arte?.texto) return;
    setOcupado(formato);
    try {
      if (formato === 'svg') descargarBlob(new Blob([arte.texto], { type: 'image/svg+xml' }), nombreArchivo('svg'));
      if (formato === 'png') {
        const [w, h] = pl.mm ? [Math.round((pl.mm[0] / 25.4) * 300), Math.round((pl.mm[1] / 25.4) * 300)] : [arte.w, arte.h];
        descargarBlob(await svgAPng(arte.texto, w, h), nombreArchivo('png'));
      }
      if (formato === 'pdf') {
        const [w, h] = pl.mm || [arte.w * 0.2646, arte.h * 0.2646];
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF({ unit: 'mm', format: [w, h], orientation: w > h ? 'landscape' : 'portrait' });
        await svgEnPdf(doc, arte.texto, 0, 0, w, h);
        doc.save(nombreArchivo('pdf'));
      }
    } catch (err) {
      alerta('No se pudo descargar: ' + err.message, 'error');
    } finally {
      setOcupado('');
    }
  }

  async function hojaA4() {
    // la versión abierta entra con sus cambios aunque no esté guardada
    const registros = (lista || []).map((r) => (r.id === actual.id ? actual : r));
    if (!actual.id) registros.push(actual);
    const { paginas, total, porHoja } = paginasA4(pl, registros, F);
    if (!total) { alerta('Ninguna etiqueta tiene copias: pon cuántas quieres en «Copias en la hoja A4».', 'error'); return; }
    setOcupado('a4');
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      for (let i = 0; i < paginas.length; i += 1) {
        if (i) doc.addPage('a4');
        await svgEnPdf(doc, paginas[i], 0, 0, 210, 297);
      }
      doc.save(`alta-densidad_${slug(pl.titulo)}_hoja-a4.pdf`);
      toastOk(`${total} etiquetas en ${paginas.length} hoja${paginas.length === 1 ? '' : 's'} (${porHoja} por hoja)`);
    } catch (err) {
      alerta('No se pudo armar la hoja: ' + err.message, 'error');
    } finally {
      setOcupado('');
    }
  }

  async function copiarFirma() {
    const html = firmaHtml(actual.datos);
    try {
      await navigator.clipboard.write([new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([[actual.datos.nombre, actual.datos.apellido].join(' ')], { type: 'text/plain' })
      })]);
      toastOk('Firma copiada: pégala en Gmail → Configuración → Firma');
    } catch {
      await copiarTexto(html);
      toastOk('Se copió el HTML de la firma');
    }
  }

  const enlace = pl.tipo === 'qr' && actual ? enlaceQr(actual.datos) : '';
  const visibles = actual ? pl.campos.filter((c) => !c.si || c.si(actual.datos)) : [];

  return (
    <div className="marca-pers">
      <nav className="marca-segmento marca-pers-tipos" aria-label="Pieza a personalizar">
        {PLANTILLAS.map((p) => (
          <button key={p.tipo} type="button" className={p.tipo === tipo ? 'activo' : ''} onClick={() => cambiarTipo(p.tipo)} aria-current={p.tipo === tipo ? 'page' : undefined}>
            <i className={`fas ${p.icono}`} aria-hidden="true" /> {p.titulo}
          </button>
        ))}
      </nav>
      <p className="marca-mute marca-pers-ayuda">{pl.ayuda}</p>

      <div className="marca-pers-grid">
        <aside className="marca-pers-lista" aria-label="Versiones guardadas">
          <div className="marca-fila marca-fila--fin">
            <span className="marca-eyebrow">GUARDADAS {lista ? `· ${lista.length}` : ''}</span>
            <button type="button" className="marca-icono-btn" title="Nueva" aria-label="Nueva versión"
              onClick={async () => { if (await seguirSinGuardar()) nueva(lista || []); }}>
              <i className="fas fa-plus" />
            </button>
          </div>
          {!lista && <p className="marca-mute">Cargando…</p>}
          {lista && !lista.length && <p className="marca-mute">Aún no hay versiones guardadas. Llena los datos y guarda la primera.</p>}
          <ul>
            {(lista || []).map((r) => (
              <li key={r.id}>
                <button type="button" className={actual?.id === r.id ? 'activo' : ''} onClick={() => abrir(r)}>
                  <b>{r.nombre}</b>
                  <small className="marca-mute">{r.actualizadoPor || r.creadoPor || ''}</small>
                </button>
              </li>
            ))}
            {actual && !actual.id && <li><button type="button" className="activo"><b>Nueva (sin guardar)</b></button></li>}
          </ul>
        </aside>

        {actual && (
          <form className="marca-pers-form" onSubmit={(e) => { e.preventDefault(); guardar(); }}>
            <label className="marca-pers-campo" htmlFor="pers-nombre">
              <span>Nombre de esta versión</span>
              <input id="pers-nombre" type="text" maxLength={120} placeholder={pl.nombreDe(actual.datos)} value={actual.nombre}
                onChange={(e) => { setActual((a) => ({ ...a, nombre: e.target.value })); setSucio(true); }} />
            </label>
            {visibles.map((c) => <Campo key={c.clave} c={c} valor={actual.datos[c.clave]} onCambio={(v) => cambiar(c.clave, v)} />)}
            <div className="marca-fila">
              <button type="submit" className="btn-primary" disabled={ocupado === 'guardar' || (!sucio && actual.id)}>
                {ocupado === 'guardar' ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-save" />} {actual.id ? 'Guardar cambios' : 'Guardar'}
              </button>
              {actual.id && <button type="button" className="btn-secondary" onClick={() => guardar(true)} disabled={Boolean(ocupado)}><i className="far fa-copy" /> Duplicar</button>}
              {actual.id && <button type="button" className="marca-icono-btn" onClick={borrar} title="Borrar" aria-label="Borrar esta versión"><i className="far fa-trash-alt" /></button>}
            </div>
          </form>
        )}

        <section className="marca-pers-vista" aria-label="Vista previa">
          <div className="marca-pers-lienzo">
            {!arte && <p className="marca-mute"><i className="fas fa-spinner fa-spin" /> Preparando las fuentes…</p>}
            {arte?.error && <p className="marca-mute">No se pudo dibujar: {arte.error}</p>}
            {vistaUrl && <img src={vistaUrl} alt={`Vista previa: ${pl.titulo}`} style={{ width: `min(100%, ${arte.w}px)` }} />}
          </div>
          {pl.mm && <p className="marca-mute marca-pers-medida">Tamaño real: {pl.mm[0]} × {pl.mm[1]} mm · PNG a 300 ppp · PDF vectorial</p>}
          {enlace && (
            <div className="marca-pers-enlace">
              <code>{enlace}</code>
              <div className="marca-fila">
                <button type="button" className="btn-secondary" onClick={() => copiarTexto(enlace).then(() => toastOk('Enlace copiado'))}><i className="far fa-copy" /> Copiar enlace</button>
                <a className="btn-secondary" href={enlace} target="_blank" rel="noreferrer"><i className="fas fa-external-link-alt" /> Probar</a>
              </div>
            </div>
          )}
          <div className="marca-fila marca-pers-descargas">
            <button type="button" className="btn-secondary" disabled={!arte?.texto || Boolean(ocupado)} onClick={() => bajar('svg')}>SVG</button>
            <button type="button" className="btn-secondary" disabled={!arte?.texto || Boolean(ocupado)} onClick={() => bajar('png')}>
              {ocupado === 'png' ? <i className="fas fa-spinner fa-spin" /> : 'PNG'}
            </button>
            {pl.mm && (
              <button type="button" className="btn-secondary" disabled={!arte?.texto || Boolean(ocupado)} onClick={() => bajar('pdf')}>
                {ocupado === 'pdf' ? <i className="fas fa-spinner fa-spin" /> : 'PDF'}
              </button>
            )}
            {pl.hoja && (
              <button type="button" className="btn-primary" disabled={!F || Boolean(ocupado)} onClick={hojaA4}>
                {ocupado === 'a4' ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-print" />} Hoja A4
              </button>
            )}
            {pl.tipo === 'firma' && (
              <button type="button" className="btn-primary" disabled={!actual} onClick={copiarFirma}><i className="fas fa-envelope" /> Copiar para Gmail</button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
