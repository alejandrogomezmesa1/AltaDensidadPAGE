// Diseño común de todos los catálogos en PDF (catálogo personalizado y lista de precios mayoristas):
// fondo hueso, Cormorant Garamond para títulos, Jost para el texto, la paleta de la marca y, en cada
// página, el isotipo de Alta Densidad como marca de agua casi imperceptible. Las fuentes e imágenes
// se descargan una sola vez por sesión (public/assets/pdf). jsPDF se carga solo al generar.
import { normalizarImagen } from '../../lib/producto';

export const AN = 210;
export const AL = 297;
export const COLOR = {
  hueso: [244, 241, 234], hueso2: [234, 229, 218], filete: [214, 208, 195],
  tinta: [11, 11, 12], gris: [107, 103, 95], oro: [154, 123, 63], vino: [90, 18, 32], blanco: [255, 255, 255]
};
// Opacidad de la marca de agua: visible si se busca, invisible si no
const OPACIDAD_MARCA = 0.016;

const FUENTES = [
  ['CG', 'CG-Regular.ttf'], ['CG-Italic', 'CG-Italic.ttf'],
  ['Jost', 'Jost-Regular.ttf'], ['Jost-Light', 'Jost-Light.ttf'], ['Jost-Medium', 'Jost-Medium.ttf']
];
const RUTA = '/assets/pdf/';
let recursos = null;

const aBase64 = (buffer) => {
  let binario = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i += 0x8000) binario += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binario);
};
const descargar = async (archivo) => {
  const r = await fetch(RUTA + archivo);
  if (!r.ok) throw new Error(`No se pudo cargar ${archivo}`);
  return aBase64(await r.arrayBuffer());
};

async function cargarRecursos() {
  if (!recursos) {
    recursos = Promise.all([
      Promise.all(FUENTES.map(async ([nombre, archivo]) => [nombre, archivo, await descargar(archivo)])),
      descargar('isotipo.png'), descargar('logo-horizontal.png')
    ]).then(([fuentes, isotipo, logo]) => ({ fuentes, isotipo: `data:image/png;base64,${isotipo}`, logo: `data:image/png;base64,${logo}` }))
      .catch((e) => { recursos = null; throw e; });
  }
  return recursos;
}

/** Documento A4 con las fuentes de la marca registradas y la primera página ya decorada. */
export async function crearDocumento() {
  const [{ jsPDF }, r] = await Promise.all([import('jspdf'), cargarRecursos()]);
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  for (const [nombre, archivo, datos] of r.fuentes) {
    doc.addFileToVFS(archivo, datos);
    doc.addFont(archivo, nombre, 'normal');
  }
  const d = { doc, isotipo: r.isotipo, logo: r.logo };
  decorarPagina(d);
  return d;
}

// Fondo hueso y marca de agua: va primero, debajo de todo el contenido de la página.
// Las láminas de arte final para proveedores van sin marca de agua (no debe confundirse con el diseño).
export function decorarPagina({ doc, isotipo }, { marcaDeAgua = true } = {}) {
  doc.setFillColor(...COLOR.hueso);
  doc.rect(0, 0, AN, AL, 'F');
  if (!marcaDeAgua) return;
  const alto = 96;
  const ancho = alto * (284 / 427);
  doc.saveGraphicsState();
  doc.setGState(new doc.GState({ opacity: OPACIDAD_MARCA }));
  doc.addImage(isotipo, 'PNG', (AN - ancho) / 2, (AL - alto) / 2 + 8, ancho, alto);
  doc.restoreGraphicsState();
}

export function nuevaPagina(d, opciones) {
  d.doc.addPage();
  decorarPagina(d, opciones);
}

export const fuente = (doc, nombre, tam, color = COLOR.tinta) => {
  doc.setFont(nombre, 'normal');
  doc.setFontSize(tam);
  doc.setTextColor(...color);
};

// Texto con espaciado entre letras; jsPDF no lo cuenta al alinear, se calcula a mano
export function espaciado(doc, texto, x, y, esp, alineacion = 'left') {
  const ancho = doc.getTextWidth(texto) + esp * Math.max(0, texto.length - 1);
  const inicio = alineacion === 'center' ? x - ancho / 2 : alineacion === 'right' ? x - ancho : x;
  doc.text(texto, inicio, y, { charSpace: esp });
  return ancho;
}

export const pesos = (v) => `$${Math.round(Number(v) || 0).toLocaleString('es-CO')}`;
export const rgb = (hex) => { const h = String(hex || '#000000').replace('#', ''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) || 0); };

// ── Fotos: siempre contenidas (completas, sin recortar) en un cuadro blanco ──
function urlFoto(src, lado) {
  const url = normalizarImagen(src);
  return url.includes('res.cloudinary.com') && url.includes('/upload/')
    ? url.replace('/upload/', `/upload/c_fit,w_${lado},h_${lado},f_jpg,q_80/`)
    : url;
}
export function fotoContenida(src, lado = 360, margen = 0.06) {
  return new Promise((resolve) => {
    if (!src) { resolve(null); return; }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const c = document.createElement('canvas');
        c.width = lado; c.height = lado;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, lado, lado);
        const util = lado * (1 - 2 * margen);
        const r = Math.min(util / img.width, util / img.height);
        const w = img.width * r; const h = img.height * r;
        ctx.drawImage(img, (lado - w) / 2, (lado - h) / 2, w, h);
        resolve(c.toDataURL('image/jpeg', 0.82));
      } catch { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = urlFoto(src, lado);
  });
}

// entradas: [clave, url]; se cargan de a 6 y avisan el avance. Sin foto queda el respaldo.
export async function cargarFotos(entradas, alAvanzar, respaldo) {
  const fotos = new Map();
  let hechas = 0;
  const cola = [...entradas];
  const trabajador = async () => {
    while (cola.length) {
      const [clave, src] = cola.shift();
      fotos.set(clave, (await fotoContenida(src)) || respaldo || null);
      alAvanzar?.(++hechas, entradas.length);
    }
  };
  await Promise.all(Array.from({ length: 6 }, trabajador));
  return fotos;
}
