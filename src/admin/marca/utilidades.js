// Utilidades de la pestaña Marca: descargas, SVG → PNG, ZIP sin dependencias y contraste WCAG.

export const BASE = '/assets/branding';
export const urlPieza = (p) => `${BASE}/${p.seccion}/${p.archivo}`;
export const nombreArchivo = (p, ext) => `alta-densidad_${p.seccion.replace(/^\d+_/, '')}_${p.archivo.replace(/\.svg$/, '')}.${ext}`;

export function descargarBlob(blob, nombre) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

const cache = new Map();
export async function textoSvg(p) {
  const url = urlPieza(p);
  if (!cache.has(url)) {
    cache.set(url, fetch(url).then((r) => {
      if (!r.ok) throw new Error(`No se encontró ${p.archivo}`);
      return r.text();
    }).catch((e) => { cache.delete(url); throw e; }));
  }
  return cache.get(url);
}

// Piezas de un solo color (íconos, medallones, elementos sueltos): se descargan en el color que se elija
export const COLORES_MONO = [['#0B0B0C', 'Tinta'], ['#9A7B3F', 'Oro satinado'], ['#C9A961', 'Oro luminoso'], ['#5A1220', 'Vino'], ['#F4F1EA', 'Hueso'], ['#FFFFFF', 'Blanco']];
export const recolorear = (texto, de, a) => (!de || !a || de.toLowerCase() === a.toLowerCase() ? texto : texto.replace(new RegExp(de, 'gi'), a));
export async function textoSvgColor(p, color) {
  const t = await textoSvg(p);
  return p.monocromo ? recolorear(t, p.monocromo, color || p.monocromo) : t;
}

export async function copiarTexto(texto) {
  try {
    await navigator.clipboard.writeText(texto);
  } catch {
    const t = document.createElement('textarea');
    t.value = texto;
    t.style.position = 'fixed';
    t.style.opacity = '0';
    document.body.appendChild(t);
    t.select();
    document.execCommand('copy');
    t.remove();
  }
}

// Medidas en px de cada salida PNG. Las piezas impresas (mm) también salen a 300 ppp.
const MAX_PX = 16_000_000; // límite de lienzo de Safari en iPhone/iPad
export function salidasPng(p) {
  const s = [1, 2, 4].map((k) => ({ clave: `${k}x`, etiqueta: `${k}×`, ancho: Math.round(p.ancho * k), alto: Math.round(p.alto * k) }));
  if (p.mm) {
    s.push({ clave: '300ppp', etiqueta: '300 ppp', ancho: Math.round((p.mm[0] / 25.4) * 300), alto: Math.round((p.mm[1] / 25.4) * 300), impresion: true });
  }
  return s.map((o) => {
    const area = o.ancho * o.alto;
    if (area <= MAX_PX) return o;
    const f = Math.sqrt(MAX_PX / area);
    return { ...o, ancho: Math.floor(o.ancho * f), alto: Math.floor(o.alto * f), recortado: true };
  });
}

// Rasteriza el SVG al tamaño pedido. Se reescriben width/height del <svg> raíz para que el
// navegador lo dibuje en vectorial a ese tamaño (no escale un mapa de bits).
export async function svgAPng(texto, ancho, alto, fondo) {
  const ajustado = texto.replace(/<svg\b([^>]*)>/, (m, attrs) => {
    const limpio = attrs.replace(/\s(width|height)="[^"]*"/g, '');
    return `<svg${limpio} width="${ancho}" height="${alto}">`;
  });
  const url = URL.createObjectURL(new Blob([ajustado], { type: 'image/svg+xml' }));
  try {
    const img = await new Promise((ok, mal) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = () => mal(new Error('El navegador no pudo dibujar el SVG'));
      i.src = url;
    });
    const c = document.createElement('canvas');
    c.width = ancho;
    c.height = alto;
    const ctx = c.getContext('2d');
    if (fondo) {
      ctx.fillStyle = fondo;
      ctx.fillRect(0, 0, ancho, alto);
    }
    ctx.drawImage(img, 0, 0, ancho, alto);
    return await lienzoABlob(c);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function lienzoABlob(c, tipo = 'image/png', calidad) {
  return new Promise((ok, mal) => c.toBlob((b) => (b ? ok(b) : mal(new Error('No se pudo exportar la imagen'))), tipo, calidad));
}

// ── ZIP (método «store», sin comprimir: los SVG y PNG ya están compactos) ──
const TABLA_CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(bytes) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < bytes.length; i += 1) c = TABLA_CRC[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

// archivos: [{ nombre: 'carpeta/archivo.svg', datos: string | Blob | Uint8Array }]
export async function crearZip(archivos) {
  const enc = new TextEncoder();
  const ahora = new Date();
  const hora = (ahora.getHours() << 11) | (ahora.getMinutes() << 5) | (ahora.getSeconds() >> 1);
  const dia = ((ahora.getFullYear() - 1980) << 9) | ((ahora.getMonth() + 1) << 5) | ahora.getDate();
  const partes = [];
  const central = [];
  let offset = 0;
  for (const a of archivos) {
    let datos = a.datos;
    if (typeof datos === 'string') datos = enc.encode(datos);
    else if (datos instanceof Blob) datos = new Uint8Array(await datos.arrayBuffer());
    const nombre = enc.encode(a.nombre);
    const crc = crc32(datos);
    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034B50, true);
    local.setUint16(4, 20, true);
    local.setUint16(6, 0x0800, true); // nombres en UTF-8
    local.setUint16(8, 0, true);
    local.setUint16(10, hora, true);
    local.setUint16(12, dia, true);
    local.setUint32(14, crc, true);
    local.setUint32(18, datos.length, true);
    local.setUint32(22, datos.length, true);
    local.setUint16(26, nombre.length, true);
    partes.push(local.buffer, nombre, datos);
    const cen = new DataView(new ArrayBuffer(46));
    cen.setUint32(0, 0x02014B50, true);
    cen.setUint16(4, 20, true);
    cen.setUint16(6, 20, true);
    cen.setUint16(8, 0x0800, true);
    cen.setUint16(12, hora, true);
    cen.setUint16(14, dia, true);
    cen.setUint32(16, crc, true);
    cen.setUint32(20, datos.length, true);
    cen.setUint32(24, datos.length, true);
    cen.setUint16(28, nombre.length, true);
    cen.setUint32(42, offset, true);
    central.push(cen.buffer, nombre);
    offset += 30 + nombre.length + datos.length;
  }
  const tamCentral = central.reduce((s, b) => s + b.byteLength, 0);
  const fin = new DataView(new ArrayBuffer(22));
  fin.setUint32(0, 0x06054B50, true);
  fin.setUint16(8, archivos.length, true);
  fin.setUint16(10, archivos.length, true);
  fin.setUint32(12, tamCentral, true);
  fin.setUint32(16, offset, true);
  return new Blob([...partes, ...central, fin.buffer], { type: 'application/zip' });
}

// ── Color ──
export function hexARgb(hex) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbACmyk([r, g, b]) {
  const [R, G, B] = [r / 255, g / 255, b / 255];
  const k = 1 - Math.max(R, G, B);
  if (k >= 1) return [0, 0, 0, 100];
  const f = (x) => Math.round(((1 - x - k) / (1 - k)) * 100);
  return [f(R), f(G), f(B), Math.round(k * 100)];
}

function luminancia(hex) {
  const [r, g, b] = hexARgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contraste(a, b) {
  const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

export function nivelWcag(ratio) {
  return {
    aaNormal: ratio >= 4.5,
    aaGrande: ratio >= 3,
    aaaNormal: ratio >= 7,
    aaaGrande: ratio >= 4.5
  };
}

export function fechaCorta(f) {
  const d = new Date(f);
  if (Number.isNaN(d.getTime())) return '';
  const seg = (Date.now() - d.getTime()) / 1000;
  if (seg < 60) return 'ahora';
  if (seg < 3600) return `hace ${Math.floor(seg / 60)} min`;
  if (seg < 86400) return `hace ${Math.floor(seg / 3600)} h`;
  if (seg < 86400 * 7) return `hace ${Math.floor(seg / 86400)} d`;
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
}
