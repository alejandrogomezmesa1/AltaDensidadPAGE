// Dibujo de marca en el navegador: la misma geometría de branding/marca.py (texto convertido a
// trazos con las fuentes de la marca, la gota tallada, íconos de línea y el QR con isotipo), para que
// lo que se personaliza en el panel salga idéntico a las piezas del brand book y se imprima igual en
// cualquier programa (no depende de tener las fuentes instaladas).
import opentype from 'opentype.js';
import QRCode from 'qrcode';

export const C = {
  tinta: '#0B0B0C', grafito: '#151517', filete2: '#2A2A2D', humo: '#F2EEE6', hueso: '#F4F1EA', hueso2: '#EAE5DA',
  filete: '#D6D0C3', oro: '#9A7B3F', oro_claro: '#C9A961', vino: '#5A1220', gris: '#6B675F', gris2: '#9A958A',
  oro_palido: '#E6D5AE', oro_profundo: '#6E5628', vino_claro: '#8C2A3A', blanco: '#FFFFFF'
};

// Las 14 familias del catálogo (B3.5): color de filete e ícono
export const FAMILIAS = [
  ['Floral', '#C79A9A'], ['Ambarada / Oriental', '#B8862F'], ['Amaderada', '#7A5A3A'], ['Frutal', '#A8546A'],
  ['Aromática', '#8A7FA6'], ['Gourmand', '#A86B3C'], ['Especiada', '#8C2A3A'], ['Acuática', '#6F8E9C'],
  ['Cítrica', '#C9AE4E'], ['Almizclada', '#B3A396'], ['Cuero', '#5B3A29'], ['Fougère', '#4F6B4A'],
  ['Chipre', '#77703C'], ['Verde', '#6F9A5B']
];

const ARCHIVOS = {
  CG_L: 'CG-Light.ttf', CG_LI: 'CG-LightItalic.ttf', CG_R: 'CG-Regular.ttf', CG_I: 'CG-Italic.ttf', CG_M: 'CG-Medium.ttf',
  J_L: 'Jost-Light.ttf', J_R: 'Jost-Regular.ttf', J_M: 'Jost-Medium.ttf'
};
let promesaFuentes = null;

/** Carga las fuentes una sola vez: { CG_L, CG_LI, …, J_M } */
export function cargarFuentes() {
  if (!promesaFuentes) {
    promesaFuentes = Promise.all(Object.entries(ARCHIVOS).map(async ([clave, archivo]) => {
      const r = await fetch(`/assets/fuentes/${archivo}`);
      if (!r.ok) throw new Error(`No se pudo cargar la fuente ${archivo}`);
      return [clave, opentype.parse(await r.arrayBuffer())];
    })).then(Object.fromEntries).catch((e) => { promesaFuentes = null; throw e; });
  }
  return promesaFuentes;
}

export const n = (v) => {
  const s = (Math.round(v * 100) / 100).toString();
  return s === '-0' ? '0' : s;
};
const op = (o) => (o === undefined || o === null ? '' : ` opacity="${o}"`);
export const esc = (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function ancho(f, texto, size, track = 0) {
  const s = size / f.unitsPerEm;
  const letras = [...String(texto)];
  return letras.reduce((t, ch) => t + f.charToGlyph(ch).advanceWidth * s, 0) + track * size * Math.max(0, letras.length - 1);
}

/** Texto como trazo (igual que T() de marca.py): track en em, anchor start | middle | end */
export function T(f, texto, size, x, y, fill, { track = 0, anchor = 'start', opacidad } = {}) {
  const t = String(texto ?? '');
  if (!t.trim()) return '';
  const w = ancho(f, t, size, track);
  let cx = anchor === 'end' ? x - w : anchor === 'middle' ? x - w / 2 : x;
  const s = size / f.unitsPerEm;
  let d = '';
  for (const ch of t) {
    const g = f.charToGlyph(ch);
    if (ch !== ' ') d += g.getPath(cx, y, size).toPathData(2);
    cx += g.advanceWidth * s + track * size;
  }
  return d ? `<path d="${d}" fill="${fill}"${op(opacidad)}/>` : '';
}

export function envolver(f, texto, size, maxw, track = 0) {
  const lineas = [];
  for (const parrafo of String(texto ?? '').split('\n')) {
    let actual = '';
    for (const palabra of parrafo.split(/\s+/).filter(Boolean)) {
      const prueba = actual ? `${actual} ${palabra}` : palabra;
      if (!actual || ancho(f, prueba, size, track) <= maxw) actual = prueba;
      else { lineas.push(actual); actual = palabra; }
    }
    lineas.push(actual);
  }
  return lineas;
}

/** Párrafo envuelto; devuelve { svg, y } con la y siguiente */
export function P(f, texto, size, x, y, fill, maxw, { lh = 1.5, anchor = 'start', track = 0 } = {}) {
  let svg = '';
  for (const l of envolver(f, texto, size, maxw, track)) {
    svg += T(f, l, size, x, y, fill, { track, anchor });
    y += size * lh;
  }
  return { svg, y };
}

// ── La gota tallada (isotipo v3): la silueta con las facetas ya recortadas (los polígonos de marca.py,
//    sin máscara: así sale igual en el PDF vectorial, que no admite máscaras) ──
const GOTA_FACETADA = 'M51.63,5.14 L58.88,31.70 L62.38,26.58 L62.59,26.37 L62.66,26.34 ZM63.45,27.66 L59.39,33.60 L62.57,45.25 L75.49,45.25 ZM76.21,46.71 L76,46.75 L63.96,46.75 L80.60,61.63 ZM65,92 L77,79 L80.82,63.72 L80.75,63.71 L80.50,63.56 L62.45,47.40 L50.85,97.66 ZM23,79 L35,92 L49.15,97.66 L37.55,47.40 L19.50,63.56 L19.25,63.71 L19.18,63.72 ZM19.40,61.63 L36.04,46.75 L24,46.75 L23.79,46.71 ZM24.51,45.25 L37.43,45.25 L40.61,33.60 L36.55,27.66 ZM37.34,26.34 L37.41,26.37 L37.62,26.58 L41.12,31.70 L48.37,5.14 ZM38.94,46.75 L49.25,91.41 L49.25,46.75 ZM50.75,46.75 L50.75,91.41 L61.06,46.75 ZM61.02,45.25 L58.28,35.22 L51.42,45.25 ZM50.75,43.58 L57.77,33.32 L50.75,7.60 ZM41.72,35.22 L38.98,45.25 L48.58,45.25 ZM49.25,43.58 L49.25,7.60 L42.23,33.32 Z';
let uidN = 0;
export const uid = (p = 'x') => `${p}${Date.now().toString(36)}${(uidN += 1)}`;

export function isotipo(x, y, size, color, opacidad) {
  const s = (size * 0.92) / 100;
  return `<g transform="translate(${n(x + size * 0.04)},${n(y + size * 0.04)}) scale(${n(s)})"${op(opacidad)}><path d="${GOTA_FACETADA}" fill="${color}"/></g>`;
}

export function destello(cx, cy, r, fill) {
  const k = r * 0.12;
  return `<path d="M${n(cx)},${n(cy - r)} C${n(cx + k)},${n(cy - k)} ${n(cx + k)},${n(cy - k)} ${n(cx + r)},${n(cy)} `
    + `C${n(cx + k)},${n(cy + k)} ${n(cx + k)},${n(cy + k)} ${n(cx)},${n(cy + r)} C${n(cx - k)},${n(cy + k)} ${n(cx - k)},${n(cy + k)} ${n(cx - r)},${n(cy)} `
    + `C${n(cx - k)},${n(cy - k)} ${n(cx - k)},${n(cy - k)} ${n(cx)},${n(cy - r)} Z" fill="${fill}"/>`;
}

/** Imagotipo horizontal: isotipo + ALTA DENSIDAD / FRAGANCIAS. Devuelve el ancho total. */
export function imagotipoHorizontal(F, x, cy, alto, color, color2) {
  const size = alto * 0.44;
  const tx = x + alto + alto * 0.42;
  const w = ancho(F.CG_M, 'ALTA DENSIDAD', size, 0.3);
  const svg = isotipo(x, cy - alto / 2, alto, color)
    + T(F.CG_M, 'ALTA DENSIDAD', size, tx + w / 2, cy + size * 0.05, color, { track: 0.3, anchor: 'middle' })
    + T(F.J_R, 'FRAGANCIAS', size * 0.36, tx + w / 2, cy + size * 0.05 + size * 0.74, color2 || color, { track: 0.55, anchor: 'middle' });
  return { svg, ancho: alto + alto * 0.42 + w };
}

// ── Íconos de línea (los mismos de marca.py, caja 24×24) ──
export const ICONOS = {
  whatsapp: '<path d="M4,20 L5.3,16.2 A8.4,8.4 0 1 1 8.4,19 Z"/><path d="M9.2,8.6 C9,10.6 11.4,13.6 14.6,14.6 L15.6,13.4 L13.9,12.4 L13.1,13.2 C12,12.7 11.2,11.9 10.7,10.8 L11.5,10 L10.5,8.3 Z"/>',
  instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.1" cy="6.9" r=".6"/>',
  web: '<circle cx="12" cy="12" r="8.5"/><ellipse cx="12" cy="12" rx="3.8" ry="8.5"/><path d="M3.5,12 H20.5 M5,7.5 H19 M5,16.5 H19"/>',
  correo: '<rect x="3" y="5.5" width="18" height="13" rx="1"/><path d="M3.5,6.5 L12,13 L20.5,6.5"/>',
  telefono: '<path d="M6.5,3.5 L9.5,3.5 L11,8 L9,9.5 C10,12 12,14 14.5,15 L16,13 L20.5,14.5 V17.5 C20.5,19 19,20.5 17.5,20.5 C10,20 4,14 3.5,6.5 C3.5,5 5,3.5 6.5,3.5 Z"/>',
  ubicacion: '<path d="M12,21 C12,21 5,14 5,9.5 A7,7 0 0 1 19,9.5 C19,14 12,21 12,21 Z"/><circle cx="12" cy="9.5" r="2.5"/>'
};

export function icono(nombre, x, y, size, color, grosor = 1.1) {
  return `<g transform="translate(${n(x)},${n(y)}) scale(${n(size / 24)})" fill="none" stroke="${color}" stroke-width="${n(grosor)}" `
    + `stroke-linecap="round" stroke-linejoin="round">${ICONOS[nombre] || ''}</g>`;
}

/**
 * QR escaneable con la marca (como qr_real de marca.py): corrección alta, zona de silencio de 4
 * módulos, módulos redondeados, ojos con esquinas suaves e isotipo al centro sobre 5×5 módulos.
 */
export function qr(texto, x, y, size, color, fondo, { logo = true } = {}) {
  const q = QRCode.create(texto, { errorCorrectionLevel: 'H' });
  const N = q.modules.size;
  const dato = (i, j) => q.modules.data[i * N + j];
  const m = size / (N + 8);
  const ox = x + 4 * m;
  const oy = y + 4 * m;
  const ojos = [[0, 0], [N - 7, 0], [0, N - 7]];
  const enOjo = (i, j) => ojos.some(([fx, fy]) => j >= fx && j < fx + 7 && i >= fy && i < fy + 7);
  const c0 = (N - 5) / 2;
  const reserva = (i, j) => logo && i >= c0 && i < c0 + 5 && j >= c0 && j < c0 + 5;
  let out = fondo ? `<rect x="${n(x)}" y="${n(y)}" width="${n(size)}" height="${n(size)}" fill="${fondo}"/>` : '';
  let mods = '';
  for (let i = 0; i < N; i += 1) {
    for (let j = 0; j < N; j += 1) {
      if (dato(i, j) && !enOjo(i, j) && !reserva(i, j)) {
        mods += `<rect x="${n(ox + j * m + m * 0.04)}" y="${n(oy + i * m + m * 0.04)}" width="${n(m * 0.92)}" height="${n(m * 0.92)}" rx="${n(m * 0.3)}"/>`;
      }
    }
  }
  out += `<g fill="${color}">${mods}</g>`;
  for (const [fx, fy] of ojos) {
    const ex = ox + fx * m;
    const ey = oy + fy * m;
    out += `<rect x="${n(ex + m * 0.5)}" y="${n(ey + m * 0.5)}" width="${n(6 * m)}" height="${n(6 * m)}" rx="${n(m * 1.6)}" fill="none" stroke="${color}" stroke-width="${n(m)}"/>`
      + `<rect x="${n(ex + 2 * m)}" y="${n(ey + 2 * m)}" width="${n(3 * m)}" height="${n(3 * m)}" rx="${n(m * 0.8)}" fill="${color}"/>`;
  }
  if (logo) {
    const iso = 4.6 * m;
    out += isotipo(ox + (N / 2) * m - iso / 2, oy + (N / 2) * m - iso / 2, iso, color);
  }
  return out;
}

/** Documento SVG completo; con mm queda a tamaño real de impresión */
export function documento(w, h, contenido, { mm, titulo } = {}) {
  const dims = mm ? ` width="${n(mm[0])}mm" height="${n(mm[1])}mm"` : ` width="${n(w)}" height="${n(h)}"`;
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n(w)} ${n(h)}"${dims}>`
    + `${titulo ? `<title>${esc(titulo)}</title>` : ''}\n${contenido}\n</svg>\n`;
}
