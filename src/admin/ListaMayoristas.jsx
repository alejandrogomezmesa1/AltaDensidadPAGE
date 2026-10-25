// Lista de precios mayoristas: lo que le cuesta cada perfume al mayorista («Tu precio») junto al precio
// al público, con la foto de cada producto completa (contenida, sin recortar), por secciones. El precio
// mayorista lo calcula DATA (regla 10/15/20 mil por rango y piso de costo + 15 %). Mismo diseño y
// marca de agua que el catálogo personalizado (./pdf/diseno.js).
import { useEffect, useMemo, useState } from 'react';
import { ModalAdmin } from './comunes';
import { LOGO } from '../lib/producto';
import { AN, AL, COLOR, crearDocumento, decorarPagina, nuevaPagina, fuente, espaciado, pesos, cargarFotos, fotoContenida } from './pdf/diseno';

const CLAVE = 'ad_lista_mayoristas';
const BASE = { disponibilidad: 'todos', categoria: 'todas', generos: ['Masculino', 'Femenino', 'Unisex'], orden: 'marca', kits: false };
const SECCIONES = [['Masculino', 'Para él'], ['Femenino', 'Para ella'], ['Unisex', 'Unisex']];
const WHATSAPP = '304 647 7694';
const INSTAGRAM = '@fragancias_alta_densidad';

const leer = () => { try { return { ...BASE, ...(JSON.parse(localStorage.getItem(CLAVE) || 'null') || {}) }; } catch { return BASE; } };
const marca = (p) => (p.brand ? p.brand.name : '');
const fecha = (d) => d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });

// Perfumes 1.1 que van en la lista con su precio mayorista (los que DATA excluye no van)
export function seleccionarMayoristas(productos, precios, cfg) {
  const comparar = {
    marca: (a, b) => marca(a).localeCompare(marca(b), 'es') || a.name.localeCompare(b.name, 'es'),
    nombre: (a, b) => a.name.localeCompare(b.name, 'es'),
    precio: (a, b) => Number(a.price) - Number(b.price)
  }[cfg.orden];
  const fuera = [];
  const lista = productos
    .filter((p) => !!Number(p.activo) && !p.soloPreparado && !p.priceReview && Number(p.price) > 0)
    .filter((p) => cfg.disponibilidad === 'todos' || !p.agotado)
    .filter((p) => cfg.categoria === 'todas' || p.category === cfg.categoria)
    .filter((p) => cfg.generos.includes(p.gender))
    .filter((p) => {
      const m = precios?.productos?.[p.id];
      if (!m || m.fuera || !(m.mayorista > 0)) { fuera.push(p.name); return false; }
      return true;
    })
    .map((p) => ({ ...p, mayorista: precios.productos[p.id].mayorista }))
    .sort(comparar);
  return { lista, fuera };
}

function kitsMayoristas(kits, precios, cfg) {
  if (!cfg.kits) return [];
  return kits
    .filter((k) => !!Number(k.activo) && Number(k.precio) > 0 && !Number(k.precio_revision))
    .filter((k) => cfg.disponibilidad === 'todos' || !Number(k.agotado))
    .filter((k) => { const m = precios?.kits?.[k.id]; return m && !m.fuera && m.mayorista > 0; })
    .map((k) => ({ id: `k${k.id}`, name: k.nombre, brand: null, image: k.imagen, price: Number(k.precio), mayorista: precios.kits[k.id].mayorista, kit: true }))
    .sort((a, b) => a.name.localeCompare(b.name, 'es'));
}

async function generarPdf(lista, kits, cfg, alAvanzar) {
  const [d, { default: autoTable }] = await Promise.all([crearDocumento(), import('jspdf-autotable')]);
  const { doc } = d;
  const respaldo = await fotoContenida(LOGO);
  const fotos = await cargarFotos([...lista, ...kits].map((p) => [String(p.id), p.image]), alAvanzar, respaldo);
  const M = 16;
  const hoy = new Date();
  const vigencia = new Date(hoy.getTime() + 15 * 86400000);
  // Las páginas que agrega la tabla también llevan fondo y marca de agua (una sola vez cada una)
  const decoradas = new Set([1]);
  const decorar = () => {
    const n = doc.getCurrentPageInfo().pageNumber;
    if (!decoradas.has(n)) { decorarPagina(d); decoradas.add(n); }
  };

  // Encabezado
  doc.addImage(d.logo, 'PNG', M, 14, 66, 66 * 340 / 1960);
  fuente(doc, 'CG', 27); doc.text('Lista de precios mayoristas', M, 44);
  fuente(doc, 'Jost', 7.6, COLOR.gris);
  espaciado(doc, `${cfg.categoria === 'todas' ? 'PERFUMES 1.1' : `PERFUMES 1.1 · ${cfg.categoria.toUpperCase()}`}   ·   ${fecha(hoy)}`, M, 50, 0.7);
  const nota = 'Tu precio es lo que te cuesta cada perfume. Al público es el precio de venta sugerido: la diferencia es tu ganancia. '
    + `Precios por unidad en pesos colombianos, sujetos a disponibilidad y vigentes hasta el ${fecha(vigencia)}.`;
  fuente(doc, 'Jost', 8.4);
  const lineas = doc.splitTextToSize(nota, AN - 2 * M - 12);
  const altoNota = 11 + lineas.length * 4.2;
  doc.setFillColor(...COLOR.hueso2); doc.rect(M, 56, AN - 2 * M, altoNota, 'F');
  doc.setFillColor(...COLOR.oro); doc.rect(M, 56, 0.8, altoNota, 'F');
  fuente(doc, 'Jost-Medium', 7.4, COLOR.oro); espaciado(doc, 'CÓMO LEER ESTA LISTA', M + 6, 62, 0.5);
  fuente(doc, 'Jost', 8.4); doc.text(lineas, M + 6, 67.5);
  let y = 56 + altoNota + 10;

  const secciones = [
    ...SECCIONES.map(([g, titulo]) => ({ titulo, filas: lista.filter((p) => p.gender === g) })),
    { titulo: 'Kits', filas: kits }
  ].filter((s) => s.filas.length);

  for (const s of secciones) {
    if (y > AL - 70) { nuevaPagina(d); decoradas.add(doc.getNumberOfPages()); y = 20; }
    fuente(doc, 'CG', 19); doc.text(s.titulo, M, y);
    fuente(doc, 'Jost-Light', 7.6, COLOR.gris); doc.text(`${s.filas.length} ${s.titulo === 'Kits' ? 'kits' : 'fragancias'}`, M, y + 5);
    autoTable(doc, {
      startY: y + 8,
      margin: { left: M, right: M, top: 18, bottom: 22 },
      head: [['', 'PERFUME', 'MARCA', 'TU PRECIO', 'AL PÚBLICO']],
      // La primera celda lleva la clave de la foto (la dibuja didDrawCell)
      body: s.filas.map((p) => [{ content: '', foto: String(p.id) }, p.name, marca(p) || (p.kit ? 'Kit' : ''), pesos(p.mayorista), pesos(p.price)]),
      theme: 'plain',
      // Una fila (foto incluida) nunca se parte entre dos páginas
      rowPageBreak: 'avoid',
      styles: { font: 'Jost', fontStyle: 'normal', fontSize: 8.8, textColor: COLOR.tinta, valign: 'middle', minCellHeight: 17,
        cellPadding: { top: 1.5, bottom: 1.5, left: 1.5, right: 1.5 }, lineColor: COLOR.filete, lineWidth: { bottom: 0.15 } },
      headStyles: { font: 'Jost-Medium', fontStyle: 'normal', fontSize: 6.6, textColor: COLOR.gris, minCellHeight: 7, lineColor: COLOR.tinta, lineWidth: { bottom: 0.35 } },
      columnStyles: {
        0: { cellWidth: 17 },
        2: { textColor: COLOR.gris, font: 'Jost-Light', cellWidth: 40 },
        3: { halign: 'right', font: 'Jost-Medium', fontSize: 10.5, cellWidth: 30 },
        4: { halign: 'right', font: 'Jost-Light', textColor: COLOR.gris, cellWidth: 28 }
      },
      didParseCell: (c) => { if (c.section === 'head' && c.column.index >= 3) c.cell.styles.halign = 'right'; },
      willDrawPage: decorar,
      // Foto contenida en un cuadro blanco con filete
      didDrawCell: (c) => {
        if (c.section !== 'body' || c.column.index !== 0) return;
        const foto = fotos.get(c.cell.raw?.foto);
        if (!foto) return;
        const lado = 14;
        const x = c.cell.x + 1;
        const yy = c.cell.y + (c.cell.height - lado) / 2;
        doc.addImage(foto, 'JPEG', x, yy, lado, lado);
        doc.setDrawColor(...COLOR.filete); doc.setLineWidth(0.15); doc.rect(x, yy, lado, lado, 'S');
      }
    });
    y = doc.lastAutoTable.finalY + 12;
  }

  if (y > AL - 34) { nuevaPagina(d); decoradas.add(doc.getNumberOfPages()); y = 24; }
  fuente(doc, 'Jost-Light', 7, COLOR.gris);
  doc.text(doc.splitTextToSize('Fragancias 1.1 inspiradas en los perfumes de referencia. Las marcas se mencionan solo para identificar el aroma; Alta Densidad Fragancias no está afiliada a ellas.', AN - 2 * M), M, y);

  const paginas = doc.getNumberOfPages();
  for (let i = 1; i <= paginas; i += 1) {
    doc.setPage(i);
    doc.setDrawColor(...COLOR.filete); doc.setLineWidth(0.15); doc.line(M, AL - 14, AN - M, AL - 14);
    fuente(doc, 'Jost', 7, COLOR.gris);
    doc.text(`WhatsApp ${WHATSAPP}  ·  ${INSTAGRAM}  ·  Lista de precios mayoristas vigente hasta el ${fecha(vigencia)}`, M, AL - 9.5);
    doc.link(M, AL - 12.5, 34, 4.5, { url: `https://wa.me/57${WHATSAPP.replace(/\D/g, '')}` });
    doc.text(String(i), AN - M, AL - 9.5, { align: 'right' });
  }
  const nombre = `Lista de precios mayoristas ${hoy.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' })}.pdf`;
  return { paginas, url: URL.createObjectURL(doc.output('blob')), nombre };
}

export const descargarPdf = (pdf) => {
  const a = document.createElement('a');
  a.href = pdf.url; a.download = pdf.nombre; a.rel = 'noopener';
  document.body.appendChild(a); a.click(); a.remove();
};

export default function ListaMayoristas({ abierto, onCerrar, productos, kits, precios, alerta, onListo }) {
  const [cfg, setCfg] = useState(leer);
  const [progreso, setProgreso] = useState(null);
  useEffect(() => { try { localStorage.setItem(CLAVE, JSON.stringify(cfg)); } catch { /* sin almacenamiento */ } }, [cfg]);
  const fijar = (k, v) => setCfg((c) => ({ ...c, [k]: v }));

  const { lista, fuera } = useMemo(() => seleccionarMayoristas(productos, precios, cfg), [productos, precios, cfg]);
  const listaKits = useMemo(() => kitsMayoristas(kits || [], precios, cfg), [kits, precios, cfg]);
  const porSexo = SECCIONES.map(([g, t]) => [t, lista.filter((p) => p.gender === g).length]).filter(([, n]) => n);

  const generar = async () => {
    if (!lista.length && !listaKits.length) { alerta('Ningún perfume cumple esta configuración.', 'error'); return; }
    setProgreso({ hechas: 0, total: lista.length + listaKits.length });
    try {
      const pdf = await generarPdf(lista, listaKits, cfg, (hechas, total) => setProgreso({ hechas, total }));
      descargarPdf(pdf);
      onListo?.(pdf);
      alerta(`Lista lista: ${lista.length} perfumes${listaKits.length ? ` y ${listaKits.length} kits` : ''} en ${pdf.paginas} páginas.`, 'success');
      onCerrar();
    } catch (e) {
      console.error('Lista mayoristas:', e);
      alerta('No se pudo generar el PDF: ' + (e && e.message ? e.message : String(e)), 'error');
    } finally {
      setProgreso(null);
    }
  };

  const generoActivo = (g) => cfg.generos.includes(g);
  return (
    <ModalAdmin abierto={abierto} titulo="Lista de precios mayoristas" onCerrar={progreso ? () => {} : onCerrar}>
      <div className="modal-form reventa">
        <div className="form-grid">
          <div className="form-seccion">
            <h4>Precio mayorista</h4>
            <small>
              {precios?.regla
                ? `Precio al público menos ${pesos(precios.regla.lowDiscount)} hasta ${pesos(precios.regla.lowUpTo)}, ${pesos(precios.regla.midDiscount)} hasta ${pesos(precios.regla.midUpTo)} y ${pesos(precios.regla.highDiscount)} por encima; nunca menos que el costo + ${precios.regla.minMarginPct} %. Se cambia en Configuraciones.`
                : 'Cargando la regla de precios…'}
            </small>
          </div>
          {precios && !precios.verificado && (
            <div className="form-group full"><small className="hint-data" style={{ color: 'var(--c-warn, #c98a1b)' }}>
              <i className="fas fa-exclamation-triangle" /> {precios.motivo || 'DATA no respondió'}: los precios salen con la regla, sin comparar con el costo.
            </small></div>
          )}
          <div className="form-seccion"><h4>Qué perfumes incluir</h4><small>Perfumes 1.1 de la tienda, visibles y con precio</small></div>
          <div className="form-group">
            <label htmlFor="mayDisp">Disponibilidad</label>
            <select id="mayDisp" value={cfg.disponibilidad} onChange={(e) => fijar('disponibilidad', e.target.value)}>
              <option value="todos">Todos (sin marcar los agotados)</option>
              <option value="existencias">Solo con existencias</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="mayCat">Categoría</label>
            <select id="mayCat" value={cfg.categoria} onChange={(e) => fijar('categoria', e.target.value)}>
              <option value="todas">Árabes y diseñador</option>
              <option value="Arabe">Solo árabes</option>
              <option value="Diseñador">Solo diseñador</option>
            </select>
          </div>
          <div className="form-group full">
            <label>Secciones</label>
            <div className="familias-opciones">
              {SECCIONES.map(([g, t]) => (
                <button type="button" key={g} className={`familia-opcion ${generoActivo(g) ? 'on' : ''}`} aria-pressed={generoActivo(g)}
                  onClick={() => fijar('generos', generoActivo(g) ? cfg.generos.filter((x) => x !== g) : [...cfg.generos, g])}>{t}</button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="mayOrden">Orden dentro de cada sección</label>
            <select id="mayOrden" value={cfg.orden} onChange={(e) => fijar('orden', e.target.value)}>
              <option value="marca">Por marca</option>
              <option value="nombre">Por nombre</option>
              <option value="precio">Por precio</option>
            </select>
          </div>
          <div className="form-group">
            <label className="check-item" style={{ marginTop: 26 }}><input type="checkbox" checked={cfg.kits} onChange={(e) => fijar('kits', e.target.checked)} /> Incluir los kits al final</label>
          </div>
        </div>
        <p className="reventa-resumen">
          {lista.length
            ? <>Se incluirán <b>{lista.length}</b> perfumes{porSexo.length ? `: ${porSexo.map(([t, n]) => `${t.toLowerCase()} ${n}`).join(' · ')}` : ''}{listaKits.length ? ` y ${listaKits.length} kits` : ''}.</>
            : 'Ningún perfume cumple esta configuración.'}
          {fuera.length > 0 && <><br /><small>Fuera porque su precio no cubre el costo: {fuera.join(', ')}.</small></>}
        </p>
      </div>
      <div className="modal-actions">
        <button type="button" className="btn-secondary" onClick={onCerrar} disabled={!!progreso}>Cerrar</button>
        <button type="button" className="btn-primary" onClick={generar} disabled={!!progreso || !precios || (!lista.length && !listaKits.length)}>
          {progreso ? <><i className="fas fa-spinner fa-spin" /> Preparando fotos {progreso.hechas}/{progreso.total}…</> : <><i className="fas fa-file-pdf" /> Generar y descargar</>}
        </button>
      </div>
    </ModalAdmin>
  );
}
