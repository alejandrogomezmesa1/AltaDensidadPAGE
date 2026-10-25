// Kit de marca para un proveedor (empaques, stickers, uniformes…): un PDF que sirve de brief de
// producción y, si se pide, un ZIP con ese PDF y los archivos originales para producir.
//   · Portada: para quién es, indicaciones y contenido (cada línea lleva a su lámina).
//   · Esenciales de marca: colores institucionales (HEX, RGB, CMYK, Pantone) y tipografías.
//   · Una lámina por pieza: el arte en VECTORIAL (svg2pdf), su medida de impresión y, si cabe, una
//     muestra a tamaño real. Las láminas de arte van sin marca de agua; las que aún no están
//     aprobadas dicen «Borrador: no producir sin confirmación».
import { AN, AL, COLOR, crearDocumento, nuevaPagina, fuente, espaciado } from '../pdf/diseno';
import { PALETA } from './datos';
import { hexARgb, textoSvg, svgAPng, salidasPng, crearZip } from './utilidades';

const M = 16;
const CONTACTO = 'Alta Densidad Fragancias  ·  WhatsApp 304 647 7694  ·  @fragancias_alta_densidad';
const fechaLarga = (d) => d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
const limpiarNombre = (t) => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w-]+/g, '-').replace(/^-|-$/g, '').toLowerCase();

// Tamaño en que se dibuja el arte dentro de una caja, sin deformarlo
const encajar = (ancho, alto, cajaAncho, cajaAlto) => {
  const k = Math.min(cajaAncho / ancho, cajaAlto / alto);
  return { w: ancho * k, h: alto * k };
};

// Dibuja un SVG en vectorial; si svg2pdf no puede con él, cae a PNG de alta resolución.
// Los <pattern> los dibuja mal (las uniones de las baldosas salen como líneas): esas piezas van en PNG.
async function dibujarSvg(doc, texto, p, x, y, w, h) {
  if (/<pattern\b/.test(texto)) return dibujarPng(doc, texto, x, y, w, h);
  const { svg2pdf } = await import('svg2pdf.js');
  const caja = document.createElement('div');
  caja.style.cssText = 'position:fixed;left:-99999px;top:0;width:0;height:0;overflow:hidden';
  caja.innerHTML = texto;
  document.body.appendChild(caja);
  try {
    const el = caja.querySelector('svg');
    if (!el.getAttribute('viewBox')) el.setAttribute('viewBox', `0 0 ${p.ancho} ${p.alto}`);
    await svg2pdf(el, doc, { x, y, width: w, height: h });
    return 'vector';
  } catch {
    return dibujarPng(doc, texto, x, y, w, h);
  } finally {
    caja.remove();
  }
}

// El arte como imagen a 300 ppp del tamaño en que se ve en la lámina
async function dibujarPng(doc, texto, x, y, w, h) {
  const ppmm = 300 / 25.4;
  const png = await svgAPng(texto, Math.round(w * ppmm), Math.round(h * ppmm));
  const datos = await new Promise((ok) => { const r = new FileReader(); r.onload = () => ok(r.result); r.readAsDataURL(png); });
  doc.addImage(datos, 'PNG', x, y, w, h, undefined, 'FAST');
  return 'png';
}

function cabeceraLamina(doc, seccion, numero, total) {
  fuente(doc, 'Jost-Medium', 7, COLOR.oro);
  espaciado(doc, 'ALTA DENSIDAD  ·  KIT DE MARCA', M, 14, 0.8);
  fuente(doc, 'Jost', 7, COLOR.gris);
  espaciado(doc, `${String(seccion || '').toUpperCase()}   ·   ${numero} / ${total}`, AN - M, 14, 0.5, 'right');
  doc.setDrawColor(...COLOR.tinta); doc.setLineWidth(0.3); doc.line(M, 17, AN - M, 17);
}

function pie(doc, texto) {
  doc.setDrawColor(...COLOR.filete); doc.setLineWidth(0.15); doc.line(M, AL - 14, AN - M, AL - 14);
  fuente(doc, 'Jost', 7, COLOR.gris);
  doc.text(texto, M, AL - 9.5);
  doc.text(String(doc.getCurrentPageInfo().pageNumber), AN - M, AL - 9.5, { align: 'right' });
}

function esenciales(d) {
  const { doc } = d;
  fuente(doc, 'CG', 26); doc.text('Esenciales de marca', M, 34);
  fuente(doc, 'Jost-Light', 8.6, COLOR.gris);
  doc.text(doc.splitTextToSize('Producir siempre con estos valores. Los Pantone son la referencia para imprenta: valídalos con una prueba de color; el HEX es para pantalla.', AN - 2 * M), M, 41);

  // Colores institucionales
  fuente(doc, 'Jost-Medium', 7.4, COLOR.oro); espaciado(doc, 'COLORES INSTITUCIONALES', M, 56, 0.8);
  const colores = PALETA.find((g) => g.grupo === 'Institucionales').colores;
  const ancho = (AN - 2 * M - 4 * 4) / 5;
  colores.forEach((c, i) => {
    const x = M + i * (ancho + 4);
    doc.setFillColor(...hexARgb(c.hex)); doc.setDrawColor(...COLOR.filete); doc.setLineWidth(0.2);
    doc.rect(x, 60, ancho, 30, 'FD');
    fuente(doc, 'CG', 13); doc.text(c.nombre, x, 97);
    fuente(doc, 'Jost', 7.2, COLOR.tinta);
    const [r, g, b] = hexARgb(c.hex);
    const lineas = [`HEX  ${c.hex}`, `RGB  ${r} · ${g} · ${b}`, c.cmyk ? `CMYK  ${c.cmyk}` : null, c.pantone ? `PANTONE  ${c.pantone}` : null].filter(Boolean);
    lineas.forEach((l, j) => doc.text(l, x, 102 + j * 4.2));
    fuente(doc, 'Jost-Light', 6.6, COLOR.gris);
    doc.text(doc.splitTextToSize(c.rol || '', ancho), x, 102 + lineas.length * 4.2 + 2);
  });

  // Tipografías
  let y = 140;
  fuente(doc, 'Jost-Medium', 7.4, COLOR.oro); espaciado(doc, 'TIPOGRAFÍAS', M, y, 0.8);
  y += 10;
  fuente(doc, 'CG', 30); doc.text('Lo que permanece', M, y + 6);
  fuente(doc, 'Jost', 8, COLOR.gris); doc.text('Cormorant Garamond · titulares, nombres de perfume y frases', M, y + 13);
  y += 26;
  fuente(doc, 'Jost', 15); doc.text('Fragancias de alta concentración', M, y + 4);
  fuente(doc, 'Jost', 8, COLOR.gris); doc.text('Jost · textos, botones y etiquetas en mayúsculas espaciadas', M, y + 11);
  y += 22;
  fuente(doc, 'Jost-Light', 8, COLOR.gris);
  doc.text(doc.splitTextToSize('Ambas son de Google Fonts y de uso libre. Si el archivo no las trae instaladas, todos los textos de las láminas ya vienen convertidos a trazos: no hace falta instalarlas para producir.', AN - 2 * M), M, y);

  // Reglas del logo
  y += 18;
  fuente(doc, 'Jost-Medium', 7.4, COLOR.oro); espaciado(doc, 'USO DEL LOGO', M, y, 0.8);
  fuente(doc, 'Jost', 8.4);
  ['No deformar, rotar, recolorear ni agregar sombras o efectos al logo.',
    'Respetar el área de protección y los tamaños mínimos (láminas de construcción y tamaños mínimos).',
    'Sobre fondos oscuros, el logo en oro o en blanco; sobre fondos claros, en tinta u oro.',
    'Bordado, grabado y troquel: usar las versiones de una tinta (sin degradados).']
    .forEach((t, i) => doc.text(`—  ${t}`, M, y + 7 + i * 5.4));
  pie(doc, CONTACTO);
}

async function lamina(d, p, i, total, estado) {
  const { doc } = d;
  nuevaPagina(d, { marcaDeAgua: false });
  cabeceraLamina(doc, p.seccionTitulo, i + 1, total);
  fuente(doc, 'CG', 19);
  const titulo = doc.splitTextToSize(p.titulo, AN - 2 * M).slice(0, 2);
  doc.text(titulo, M, 28);
  let y = 28 + titulo.length * 7;
  if (p.descripcion) {
    fuente(doc, 'Jost-Light', 8.2, COLOR.gris);
    const desc = doc.splitTextToSize(p.descripcion, AN - 2 * M).slice(0, 3);
    doc.text(desc, M, y);
    y += desc.length * 3.8;
  }
  // Marco del arte: blanco (o tinta si la pieza es blanca, para que se vea)
  const marco = { x: M, y: y + 3, w: AN - 2 * M, h: AL - 80 - (y + 3) };
  const oscuro = /blanca/i.test(p.archivo);
  doc.setFillColor(...(oscuro ? COLOR.tinta : COLOR.blanco)); doc.setDrawColor(...COLOR.filete); doc.setLineWidth(0.2);
  doc.rect(marco.x, marco.y, marco.w, marco.h, 'FD');
  const texto = await textoSvg(p);
  const { w, h } = encajar(p.ancho, p.alto, marco.w - 16, marco.h - 16);
  const modo = await dibujarSvg(doc, texto, p, marco.x + (marco.w - w) / 2, marco.y + (marco.h - h) / 2, w, h);

  // Ficha técnica
  let fy = marco.y + marco.h + 9;
  const fila = (etq, valor) => {
    fuente(doc, 'Jost-Medium', 6.8, COLOR.gris); espaciado(doc, etq.toUpperCase(), M, fy, 0.5);
    fuente(doc, 'Jost', 8.6); doc.text(valor, M + 38, fy);
    fy += 5.6;
  };
  fila('Archivo', `${p.archivo}${modo === 'vector' ? '  (vectorial)' : '  (imagen 300 ppp; el vectorial va en el ZIP)'}`);
  if (p.mm) fila('Medida de impresión', `${p.mm[0]} × ${p.mm[1]} mm`);
  fila('Lienzo digital', `${p.ancho} × ${Math.round(p.alto)} px`);
  fila('Estado', estado === 'aprobada' ? 'Arte final aprobado' : 'Borrador: no producir sin confirmación de Alta Densidad');
  if (estado !== 'aprobada') {
    doc.setFillColor(...COLOR.vino); doc.rect(M - 3, fy - 8.6, 1, 4.6, 'F');
  }

  // Muestra a tamaño real cuando cabe al lado de la ficha
  if (p.mm && p.mm[0] <= 70 && p.mm[1] <= 46) {
    const rx = AN - M - p.mm[0];
    const ry = marco.y + marco.h + 6;
    fuente(doc, 'Jost-Medium', 6.4, COLOR.gris); espaciado(doc, 'TAMAÑO REAL', AN - M, ry - 1.5, 0.4, 'right');
    doc.setFillColor(...COLOR.blanco); doc.rect(rx, ry, p.mm[0], p.mm[1], 'F');
    await dibujarSvg(doc, texto, p, rx, ry, p.mm[0], p.mm[1]);
    doc.setDrawColor(...COLOR.filete); doc.setLineWidth(0.1); doc.rect(rx, ry, p.mm[0], p.mm[1], 'S');
  }
  pie(doc, CONTACTO);
}

/**
 * @param piezas  piezas del manifest (con seccionTitulo), en el orden en que van
 * @param opciones { proveedor, tipo, indicaciones, esenciales, estados, alAvanzar }
 * @returns { blob, nombre, paginas }
 */
export async function generarKitPdf(piezas, { proveedor, tipo, indicaciones, esenciales: conEsenciales, estados = {}, alAvanzar }) {
  const d = await crearDocumento();
  const { doc } = d;
  const hoy = new Date();
  const para = proveedor.trim() || tipo || 'Proveedor';

  // Portada (el contenido con sus páginas se escribe al final, cuando ya se saben)
  doc.addImage(d.logo, 'PNG', M, 18, 80, 80 * 340 / 1960);
  fuente(doc, 'Jost-Medium', 8, COLOR.oro); espaciado(doc, 'KIT DE MARCA', M, 56, 1.2);
  fuente(doc, 'CG', 34); doc.text(doc.splitTextToSize(`Para ${para}`, AN - 2 * M).slice(0, 2), M, 70);
  fuente(doc, 'Jost', 8.4, COLOR.gris);
  doc.text(`${tipo ? `${tipo}  ·  ` : ''}${fechaLarga(hoy)}  ·  ${piezas.length} pieza${piezas.length === 1 ? '' : 's'}`, M, 80);
  let y = 92;
  if (indicaciones.trim()) {
    fuente(doc, 'Jost', 8.8);
    const lineas = doc.splitTextToSize(indicaciones.trim(), AN - 2 * M - 12);
    const alto = 12 + lineas.length * 4.4;
    doc.setFillColor(...COLOR.hueso2); doc.rect(M, y, AN - 2 * M, alto, 'F');
    doc.setFillColor(...COLOR.oro); doc.rect(M, y, 0.8, alto, 'F');
    fuente(doc, 'Jost-Medium', 7.2, COLOR.oro); espaciado(doc, 'INDICACIONES DE PRODUCCIÓN', M + 6, y + 6.5, 0.6);
    fuente(doc, 'Jost', 8.8); doc.text(lineas, M + 6, y + 12.5);
    y += alto + 10;
  }
  const yContenido = y;
  pie(doc, CONTACTO);

  if (conEsenciales) { nuevaPagina(d); esenciales(d); }
  const inicio = doc.getNumberOfPages() + 1;
  for (let i = 0; i < piezas.length; i += 1) {
    await lamina(d, piezas[i], i, piezas.length, estados[piezas[i].id]?.estado || 'propuesta');
    alAvanzar?.(i + 1, piezas.length);
  }

  // Contenido en la portada: cada línea lleva a su lámina
  doc.setPage(1);
  fuente(doc, 'Jost-Medium', 7.2, COLOR.oro); espaciado(doc, 'CONTENIDO', M, yContenido, 0.8);
  let cy = yContenido + 6;
  let omitidas = 0;
  const linea = (texto, pagina, extra = '') => {
    if (cy > AL - 26) { omitidas += 1; return; }
    fuente(doc, 'Jost', 8.6); doc.text(doc.splitTextToSize(texto, AN - 2 * M - 30)[0], M, cy);
    fuente(doc, 'Jost-Light', 8, COLOR.gris); doc.text(`${extra}pág. ${pagina}`, AN - M, cy, { align: 'right' });
    doc.setDrawColor(...COLOR.filete); doc.setLineWidth(0.1); doc.line(M, cy + 1.8, AN - M, cy + 1.8);
    doc.link(M, cy - 3.6, AN - 2 * M, 5.4, { pageNumber: pagina });
    cy += 5.6;
  };
  if (conEsenciales) linea('Esenciales de marca: colores, tipografías y uso del logo', 2);
  piezas.forEach((p, i) => linea(p.titulo, inicio + i, p.mm ? `${p.mm[0]}×${p.mm[1]} mm  ·  ` : ''));
  if (omitidas) {
    fuente(doc, 'Jost-Light', 7.6, COLOR.gris);
    doc.text(`… y ${omitidas} lámina${omitidas === 1 ? '' : 's'} más.`, M, AL - 20);
  }

  const nombre = `alta-densidad-kit-${limpiarNombre(para) || 'proveedor'}-${hoy.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' })}`;
  return { blob: doc.output('blob'), nombre, paginas: doc.getNumberOfPages() };
}

// ZIP para producir: el PDF del kit + cada pieza en SVG (vectorial) y PNG (300 ppp si es impresa; 2× si no)
export async function generarKitZip(piezas, pdf, alAvanzar) {
  const archivos = [{ nombre: `${pdf.nombre}/${pdf.nombre}.pdf`, datos: pdf.blob }];
  for (let i = 0; i < piezas.length; i += 1) {
    const p = piezas[i];
    const svg = await textoSvg(p);
    const base = p.archivo.replace(/\.svg$/, '');
    archivos.push({ nombre: `${pdf.nombre}/svg/${p.seccion}_${p.archivo}`, datos: svg });
    const salidas = salidasPng(p);
    const o = salidas.find((x) => x.clave === '300ppp') || salidas[1];
    archivos.push({ nombre: `${pdf.nombre}/png/${p.seccion}_${base}@${o.clave}.png`, datos: await svgAPng(svg, o.ancho, o.alto) });
    alAvanzar?.(i + 1, piezas.length);
  }
  return crearZip(archivos);
}
