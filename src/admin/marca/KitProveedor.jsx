// Armador del kit de marca para un proveedor: se elige para quién es (empaques, stickers,
// uniformes…), se ajustan las piezas y las indicaciones, y se descarga el PDF o el paquete ZIP
// (PDF + SVG + PNG para producir). Avisa si van piezas sin aprobar o de uso interno.
import { useEffect, useMemo, useState } from 'react';
import { KITS, SOLO_INTERNAS } from './kits';
import { generarKitPdf, generarKitZip } from './kitPdf';
import { ESTADOS } from './datos';
import { urlPieza, descargarBlob } from './utilidades';

const PERSONALIZADO = { id: 'personalizado', titulo: 'Personalizado', icono: 'fa-sliders-h', para: 'Elige tú las piezas', piezas: [], indicaciones: '' };

export default function KitProveedor({ abierto, onCerrar, piezas, estados, seleccionInicial, alerta }) {
  const [kitId, setKitId] = useState('empaques');
  const [seleccion, setSeleccion] = useState(() => new Set());
  const [proveedor, setProveedor] = useState('');
  const [indicaciones, setIndicaciones] = useState('');
  const [conEsenciales, setConEsenciales] = useState(true);
  const [verTodas, setVerTodas] = useState(false);
  const [progreso, setProgreso] = useState(null);

  // Al abrir: si vienen piezas seleccionadas en la galería, arranca como kit personalizado con ellas
  useEffect(() => {
    if (!abierto) return;
    if (seleccionInicial?.length) {
      setKitId('personalizado'); setSeleccion(new Set(seleccionInicial)); setIndicaciones(''); setVerTodas(true);
    } else {
      const k = KITS.find((x) => x.id === kitId) || KITS[0];
      setSeleccion(new Set(k.piezas)); setIndicaciones(k.indicaciones); setVerTodas(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto]);

  useEffect(() => {
    if (!abierto) return undefined;
    document.body.style.overflow = 'hidden';
    const esc = (e) => { if (e.key === 'Escape' && !progreso) onCerrar(); };
    document.addEventListener('keydown', esc);
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', esc); };
  }, [abierto, onCerrar, progreso]);

  const kit = [...KITS, PERSONALIZADO].find((k) => k.id === kitId);
  const elegir = (k) => {
    setKitId(k.id);
    if (k.id !== 'personalizado') { setSeleccion(new Set(k.piezas)); setIndicaciones(k.indicaciones); setVerTodas(false); } else setVerTodas(true);
  };
  const alternar = (id) => setSeleccion((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  // Las piezas van en el orden del brand book
  const elegidas = useMemo(() => piezas.filter((p) => seleccion.has(p.id)), [piezas, seleccion]);
  const visibles = verTodas ? piezas : elegidas;
  const grupos = useMemo(() => {
    const m = new Map();
    visibles.forEach((p) => { if (!m.has(p.seccionTitulo)) m.set(p.seccionTitulo, []); m.get(p.seccionTitulo).push(p); });
    return [...m];
  }, [visibles]);
  const sinAprobar = elegidas.filter((p) => (estados[p.id]?.estado || 'propuesta') !== 'aprobada');
  const internas = elegidas.filter((p) => SOLO_INTERNAS.includes(p.id));

  async function generar(conZip) {
    if (!elegidas.length) { alerta('Elige al menos una pieza.', 'error'); return; }
    setProgreso({ fase: 'Láminas', hechas: 0, total: elegidas.length });
    try {
      const opciones = { proveedor, tipo: kit.id === 'personalizado' ? '' : kit.titulo, indicaciones, esenciales: conEsenciales, estados };
      const pdf = await generarKitPdf(elegidas, { ...opciones, alAvanzar: (hechas, total) => setProgreso({ fase: 'Láminas', hechas, total }) });
      if (conZip) {
        const zip = await generarKitZip(elegidas, pdf, (hechas, total) => setProgreso({ fase: 'Archivos', hechas, total }));
        descargarBlob(zip, `${pdf.nombre}.zip`);
        alerta(`Paquete listo: PDF de ${pdf.paginas} páginas + ${elegidas.length} piezas en SVG y PNG.`, 'exito');
      } else {
        descargarBlob(pdf.blob, `${pdf.nombre}.pdf`);
        alerta(`Kit listo: ${pdf.paginas} páginas.`, 'exito');
      }
    } catch (err) {
      console.error('Kit de marca:', err);
      alerta('No se pudo armar el kit: ' + (err?.message || err), 'error');
    } finally {
      setProgreso(null);
    }
  }

  if (!abierto) return null;
  return (
    <div className="marca-visor" role="dialog" aria-modal="true" aria-label="Kit para proveedor"
      onClick={(e) => { if (e.target === e.currentTarget && !progreso) onCerrar(); }}>
      <div className="marca-kit">
        <section className="marca-kit-piezas">
          <header className="marca-kit-cabeza">
            <div>
              <span className="up marca-eyebrow">Kit para proveedor</span>
              <h3>¿Para quién es?</h3>
            </div>
          </header>
          <div className="marca-kit-tipos" role="radiogroup" aria-label="Tipo de proveedor">
            {KITS.map((k) => (
              <button key={k.id} type="button" role="radio" aria-checked={kitId === k.id} className={`marca-kit-tipo ${kitId === k.id ? 'activo' : ''}`} onClick={() => elegir(k)}>
                <i className={`fas ${k.icono}`} aria-hidden="true" />
                <b>{k.titulo}</b>
                <small>{k.para}</small>
              </button>
            ))}
            {/* Personalizado va aparte, a lo ancho: los 6 paquetes quedan en filas completas */}
            <button type="button" role="radio" aria-checked={kitId === 'personalizado'} className={`marca-kit-tipo marca-kit-tipo--ancho ${kitId === 'personalizado' ? 'activo' : ''}`} onClick={() => elegir(PERSONALIZADO)}>
              <i className={`fas ${PERSONALIZADO.icono}`} aria-hidden="true" />
              <span><b>{PERSONALIZADO.titulo}</b> <small>· {PERSONALIZADO.para}</small></span>
            </button>
          </div>

          <div className="marca-kit-barra">
            <h4>Piezas del kit <span className="marca-mute">{elegidas.length}</span></h4>
            <div className="marca-segmento" role="group" aria-label="Mostrar">
              <button type="button" className={!verTodas ? 'activo' : ''} onClick={() => setVerTodas(false)}>Solo las del kit</button>
              <button type="button" className={verTodas ? 'activo' : ''} onClick={() => setVerTodas(true)}>Agregar más</button>
            </div>
          </div>
          {!visibles.length && <p className="marca-mute">Todavía no hay piezas. Pulsa «Agregar más» para elegirlas.</p>}
          {grupos.map(([titulo, lista]) => (
            <div key={titulo} className="marca-kit-grupo">
              <h5 className="up">{titulo}</h5>
              <ul className="marca-kit-grid">
                {lista.map((p) => {
                  const est = estados[p.id]?.estado || 'propuesta';
                  const activa = seleccion.has(p.id);
                  return (
                    <li key={p.id}>
                      <label className={`marca-kit-pieza ${activa ? 'activa' : ''}`}>
                        <input type="checkbox" checked={activa} onChange={() => alternar(p.id)} />
                        <span className="marca-kit-mini"><img src={urlPieza(p)} alt="" loading="lazy" /></span>
                        <span className="marca-kit-nombre">{p.titulo}</span>
                        <span className={`marca-chip marca-chip--${est}`}>{ESTADOS[est]?.etiqueta}{p.mm ? ` · ${p.mm[0]}×${p.mm[1]} mm` : ''}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </section>

        <aside className="marca-panel">
          <header className="marca-panel-cabeza">
            <div>
              <span className="up marca-eyebrow">{kit.titulo}</span>
              <h3>Datos del envío</h3>
            </div>
            <button type="button" className="modal-cerrar" onClick={onCerrar} disabled={Boolean(progreso)} aria-label="Cerrar"><i className="fas fa-times" /></button>
          </header>
          <section className="marca-bloque">
            <label className="marca-kit-campo">Proveedor
              <input value={proveedor} onChange={(e) => setProveedor(e.target.value)} placeholder="Ej. Cajas El Dorado" maxLength={60} />
            </label>
            <label className="marca-kit-campo">Indicaciones de producción
              <textarea rows={7} value={indicaciones} onChange={(e) => setIndicaciones(e.target.value)} placeholder="Cantidades, materiales, acabados, fecha de entrega…" />
            </label>
            <label className="marca-kit-check"><input type="checkbox" checked={conEsenciales} onChange={(e) => setConEsenciales(e.target.checked)} /> Incluir esenciales de marca (colores Pantone/CMYK, tipografías y uso del logo)</label>
          </section>

          {(sinAprobar.length > 0 || internas.length > 0) && (
            <section className="marca-bloque marca-kit-avisos">
              {sinAprobar.length > 0 && (
                <p><i className="fas fa-exclamation-triangle" /> {sinAprobar.length} pieza{sinAprobar.length === 1 ? '' : 's'} sin aprobar: en el PDF saldrán como «Borrador: no producir sin confirmación».
                  {' '}Apruébalas antes de enviar el kit a producción.</p>
              )}
              {internas.length > 0 && (
                <p><i className="fas fa-eye-slash" /> {internas.map((p) => p.titulo).join(', ')}: {internas.length === 1 ? 'es' : 'son'} de uso interno; normalmente no se envía{internas.length === 1 ? '' : 'n'} a proveedores.</p>
              )}
            </section>
          )}

          <section className="marca-bloque">
            <h4 className="up">Descargar</h4>
            <div className="marca-kit-acciones">
              <button type="button" className="btn-primary" onClick={() => generar(true)} disabled={Boolean(progreso) || !elegidas.length}>
                <i className="fas fa-file-archive" /> Paquete completo (.zip)
              </button>
              <button type="button" className="btn-secondary" onClick={() => generar(false)} disabled={Boolean(progreso) || !elegidas.length}>
                <i className="fas fa-file-pdf" /> Solo el PDF
              </button>
            </div>
            <small className="marca-mute">
              {progreso
                ? <><i className="fas fa-spinner fa-spin" /> {progreso.fase} {progreso.hechas}/{progreso.total}…</>
                : 'El paquete trae el PDF (brief con cada lámina en vectorial; los patrones, en imagen de 300 ppp) y los archivos para producir: SVG y PNG a 300 ppp en las piezas impresas.'}
            </small>
          </section>
        </aside>
      </div>
    </div>
  );
}
