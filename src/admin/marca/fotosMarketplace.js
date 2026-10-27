// Fotos de cada publicación de Marketplace (1080 × 1080), dibujadas en el navegador con la misma
// geometría de las piezas B7.8 del brand book (branding/generar_svg.py → mp_portada, mp_ficha):
//   1. Portada: el frasco insignia de Alta Densidad con el nombre propio, o la foto real del producto.
//   2. Ficha olfativa: salida, corazón y fondo con la familia y el momento ideal.
//   3 y 4. «Lo que recibes» y «Cómo comprar»: las piezas fijas del brand book.
// Por defecto la portada usa el frasco ilustrado: en los 1.1 la foto real muestra el logo de otra casa y
// Marketplace tumba la publicación. La foto real queda como opción (útil en perfumes árabes propios).
import { C, FAMILIAS, T, P, ancho, isotipo, documento, cargarFuentes, uid, n } from './dibujo';
import { svgAPng, textoSvg } from './utilidades';
import { limpiarNota } from './textosMarketplace';

export const MP = 1080;
const k = MP / 1200; // las piezas del brand book están a 1200 px
const AMBAR = '#B8862F';

export const colorFamilia = (familia) => (FAMILIAS.find(([f]) => familia && (f === familia || f.startsWith(familia))) || [null, C.oro])[1];

// Generador determinista (mismas partículas cada vez para el mismo perfume)
function azar(semilla) {
  let s = semilla % 2147483647 || 1;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

function fondoDia(w, h) {
  const id = uid('dia');
  return `<defs><radialGradient id="${id}" cx=".6" cy=".35" r=".85"><stop offset="0" stop-color="#FFFBF2"/><stop offset="1" stop-color="${C.hueso2}"/></radialGradient></defs>`
    + `<rect width="${w}" height="${h}" fill="url(#${id})"/>`;
}

function particulas(w, h, cuantas, semilla, color = C.oro_claro) {
  const r = azar(semilla);
  let out = '';
  for (let i = 0; i < cuantas; i += 1) {
    out += `<circle cx="${n(r() * w)}" cy="${n(r() * h * 0.85)}" r="${n((0.6 + r() * 2) * w / 1080)}" fill="${color}" opacity="${n(0.15 + r() * 0.45)}"/>`;
  }
  return out;
}

function pedestal(cx, y, w, h) {
  const id = uid('mar');
  const x = cx - w / 2;
  return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBF8F2"/><stop offset="1" stop-color="#E2DCD0"/></linearGradient></defs>`
    + `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" fill="url(#${id})"/>`
    + `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h * 0.06)}" fill="#FBF8F2" opacity=".9"/>`
    + `<path d="M${n(x + w * 0.1)},${n(y + h)} C${n(x + w * 0.25)},${n(y + h * 0.55)} ${n(x + w * 0.4)},${n(y + h * 0.7)} ${n(x + w * 0.55)},${n(y + h * 0.2)} `
    + `S${n(x + w * 0.85)},${n(y + h * 0.3)} ${n(x + w * 0.95)},${n(y + h * 0.05)}" fill="none" stroke="${C.oro_claro}" stroke-width="${n(w * 0.003)}" opacity=".55"/>`;
}

function defsOro(id) {
  return `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8C6A2E"/><stop offset=".28" stop-color="${C.oro_claro}"/>`
    + `<stop offset=".5" stop-color="#F1E2B8"/><stop offset=".72" stop-color="${C.oro_claro}"/><stop offset="1" stop-color="#7E5F27"/></linearGradient>`;
}

// Frasco insignia facetado (frasco() de marca.py, versión para fondo claro)
function frasco(F, cx, base, alto, nombre, liquido = AMBAR) {
  const u = alto / 100;
  const w = 62 * u;
  const x0 = cx - w / 2;
  const yb = base - 64 * u;
  const ch = 7 * u;
  const [gl, gv, gt] = [uid('liq'), uid('vid'), uid('tap')];
  const cuerpo = `M${n(x0 + ch)},${n(yb)} L${n(x0 + w - ch)},${n(yb)} L${n(x0 + w)},${n(yb + ch)} L${n(x0 + w)},${n(base - ch)} `
    + `L${n(x0 + w - ch)},${n(base)} L${n(x0 + ch)},${n(base)} L${n(x0)},${n(base - ch)} L${n(x0)},${n(yb + ch)} Z`;
  const i = 4.2 * u;
  const liq = `M${n(x0 + i + ch * 0.6)},${n(yb + 9 * u)} L${n(x0 + w - i - ch * 0.6)},${n(yb + 9 * u)} L${n(x0 + w - i)},${n(yb + 9 * u + ch * 0.6)} `
    + `L${n(x0 + w - i)},${n(base - i - ch * 0.5)} L${n(x0 + w - i - ch * 0.5)},${n(base - i)} L${n(x0 + i + ch * 0.5)},${n(base - i)} `
    + `L${n(x0 + i)},${n(base - i - ch * 0.5)} L${n(x0 + i)},${n(yb + 9 * u + ch * 0.6)} Z`;
  let out = `<defs><linearGradient id="${gl}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7A4E12"/><stop offset=".35" stop-color="${liquido}"/>`
    + `<stop offset=".55" stop-color="#E9B95A"/><stop offset=".8" stop-color="${liquido}"/><stop offset="1" stop-color="#6E440F"/></linearGradient>`
    + `<linearGradient id="${gv}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".30"/><stop offset=".2" stop-color="#FFFFFF" stop-opacity=".05"/>`
    + `<stop offset=".85" stop-color="#FFFFFF" stop-opacity=".04"/><stop offset="1" stop-color="#FFFFFF" stop-opacity=".28"/></linearGradient>${defsOro(gt)}</defs>`;
  out += `<ellipse cx="${n(cx)}" cy="${n(base + 1.2 * u)}" rx="${n(w * 0.58)}" ry="${n(3 * u)}" fill="#000" opacity=".18"/>`;
  out += `<path d="${liq}" fill="url(#${gl})"/>`;
  out += `<path d="${cuerpo}" fill="url(#${gv})" stroke="#6E5628" stroke-opacity=".45" stroke-width="${n(0.5 * u)}"/>`;
  out += `<path d="M${n(x0 + ch)},${n(yb)} L${n(x0 + ch + 3 * u)},${n(yb + ch + 2 * u)} L${n(x0 + ch + 3 * u)},${n(base - ch - 2 * u)} L${n(x0 + ch)},${n(base)}" fill="none" stroke="#FFF" stroke-opacity=".35" stroke-width="${n(0.4 * u)}"/>`
    + `<path d="M${n(x0 + w - ch)},${n(yb)} L${n(x0 + w - ch - 3 * u)},${n(yb + ch + 2 * u)} L${n(x0 + w - ch - 3 * u)},${n(base - ch - 2 * u)} L${n(x0 + w - ch)},${n(base)}" fill="none" stroke="#FFF" stroke-opacity=".25" stroke-width="${n(0.4 * u)}"/>`
    + `<rect x="${n(x0 + 5 * u)}" y="${n(yb + 6 * u)}" width="${n(2.2 * u)}" height="${n(46 * u)}" fill="#FFF" opacity=".35"/>`;
  const tw = 36 * u;
  out += `<rect x="${n(cx - 9 * u)}" y="${n(yb - 7 * u)}" width="${n(18 * u)}" height="${n(7.5 * u)}" fill="url(#${gt})"/>`
    + `<rect x="${n(cx - tw / 2)}" y="${n(yb - 21 * u)}" width="${n(tw)}" height="${n(14 * u)}" fill="url(#${gt})"/>`
    + `<rect x="${n(cx - tw / 2)}" y="${n(yb - 21 * u)}" width="${n(tw)}" height="${n(1.6 * u)}" fill="#F6E9C5" opacity=".8"/>`
    + T(F.CG_M, 'ALTA DENSIDAD', 2.6 * u, cx, yb - 12.6 * u, C.oro_profundo, { track: 0.3, anchor: 'middle', opacidad: 0.85 });
  const lw = 30 * u;
  const lh = 19 * u;
  const lx = cx - lw / 2;
  const ly = yb + 22 * u;
  // El nombre propio en la etiqueta: se achica si no cabe
  let tam = 1.55 * u;
  while (tam > 0.9 * u && ancho(F.J_M, nombre, tam, 0.3) > lw - 3 * u) tam -= 0.05 * u;
  out += `<rect x="${n(lx)}" y="${n(ly)}" width="${n(lw)}" height="${n(lh)}" fill="url(#${gt})"/>`
    + `<rect x="${n(lx + 0.9 * u)}" y="${n(ly + 0.9 * u)}" width="${n(lw - 1.8 * u)}" height="${n(lh - 1.8 * u)}" fill="none" stroke="${C.oro_profundo}" stroke-width="${n(0.25 * u)}"/>`
    + T(F.CG_M, 'ALTA', 4.4 * u, cx, ly + 6.8 * u, '#3B2C10', { track: 0.12, anchor: 'middle' })
    + T(F.CG_M, 'DENSIDAD', 4.4 * u, cx, ly + 11.6 * u, '#3B2C10', { track: 0.12, anchor: 'middle' })
    + T(F.J_M, nombre, tam, cx, ly + 15.6 * u, '#3B2C10', { track: 0.3, anchor: 'middle' });
  return out;
}

function marcaEsquina(F, color) {
  return isotipo(MP - 150 * k, 70 * k, 64 * k, color) + T(F.J_M, 'ALTA DENSIDAD', 15 * k, MP - 118 * k, 165 * k, color, { track: 0.3, anchor: 'middle' });
}

// Título grande que se achica hasta caber en el ancho disponible
function titulo(F, texto, x, y, max, maxw, color) {
  let size = max;
  while (size > 40 && ancho(F.CG_L, texto, size) > maxw) size -= 2;
  if (ancho(F.CG_L, texto, size) <= maxw) return { svg: T(F.CG_L, texto, size, x, y, color), size, y };
  const r = P(F.CG_L, texto, size, x, y, color, maxw, { lh: 1.05 });
  return { svg: r.svg, size, y: r.y - size * 1.05 };
}

async function imagenComoDato(url) {
  const r = await fetch(url, { mode: 'cors' });
  if (!r.ok) throw new Error('No se pudo leer la foto del producto');
  const blob = await r.blob();
  return new Promise((ok, mal) => {
    const lector = new FileReader();
    lector.onload = () => ok(lector.result);
    lector.onerror = () => mal(new Error('No se pudo leer la foto del producto'));
    lector.readAsDataURL(blob);
  });
}

// Cloudinary entrega la foto ya recortada en cuadrado y liviana
const fotoCuadrada = (url) => String(url || '').replace('/image/upload/', '/image/upload/c_fill,g_auto,w_1080,h_1080,q_auto,f_jpg/');

/** d = { nombre, genero, ml, familia, precio, notas:{salida,corazon,fondo}, ideal, imagen, semilla } */
export async function portadaSvg(d, { foto = false } = {}) {
  const F = await cargarFuentes();
  const col = colorFamilia(d.familia);
  let c;
  if (foto && d.imagen) {
    const dato = await imagenComoDato(fotoCuadrada(d.imagen));
    const id = uid('vel');
    c = `<image href="${dato}" x="0" y="0" width="${MP}" height="${MP}" preserveAspectRatio="xMidYMid slice"/>`
      + `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.tinta}" stop-opacity="0"/>`
      + `<stop offset="1" stop-color="${C.tinta}" stop-opacity=".88"/></linearGradient></defs>`
      + `<rect y="${MP * 0.55}" width="${MP}" height="${MP * 0.45}" fill="url(#${id})"/>`;
    const t = titulo(F, d.nombre, 70, MP - 150, 84, MP - 140, C.humo);
    c += t.svg + `<rect x="72" y="${MP - 120}" width="110" height="5" fill="${col}"/>`
      + T(F.J_M, `${d.ml.toUpperCase()} · ${d.genero.toUpperCase()} · ALTA CONCENTRACIÓN`, 19, 72, MP - 70, C.oro_palido, { track: 0.2 });
    c += isotipo(MP - 130, MP - 150, 64, C.oro_claro);
  } else {
    c = fondoDia(MP, MP) + particulas(MP, MP, 28, d.semilla || 7);
    c += pedestal(MP / 2, MP * 0.84, MP * 0.74, MP * 0.16 + 10) + frasco(F, MP / 2, MP * 0.84, 640, d.nombre.toUpperCase());
    c += marcaEsquina(F, C.oro);
    const t = titulo(F, d.nombre, 80, 220 * k, 84, MP - 80 * k - 200, C.tinta);
    c += t.svg;
    const yl = t.y + 34;
    c += `<rect x="${n(82 * k)}" y="${n(yl)}" width="110" height="5" fill="${col}"/>`
      + T(F.J_M, `${d.ml.toUpperCase()} · ${d.genero.toUpperCase()} · ALTA CONCENTRACIÓN`, 18, 82 * k, yl + 46, C.gris, { track: 0.22 });
  }
  // Precio en sello: lo primero que mira la gente en la cuadrícula de Marketplace
  if (d.precio) {
    const txt = d.precio;
    const w = ancho(F.J_M, txt, 34, 0.04) + 56;
    const y = foto && d.imagen ? 60 : MP - 118;
    const x = foto && d.imagen ? 60 : 70;
    c += `<rect x="${x}" y="${y}" width="${n(w)}" height="64" fill="${C.tinta}"/>`
      + `<rect x="${x + 5}" y="${y + 5}" width="${n(w - 10)}" height="54" fill="none" stroke="${C.oro_claro}" stroke-width="1.2"/>`
      + T(F.J_M, txt, 34, x + w / 2, y + 44, C.oro_claro, { track: 0.04, anchor: 'middle' });
  }
  return documento(MP, MP, c, { titulo: `${d.nombre} · portada` });
}

export async function fichaSvg(d) {
  const F = await cargarFuentes();
  const col = colorFamilia(d.familia);
  let c = `<rect width="${MP}" height="${MP}" fill="${C.tinta}"/>` + particulas(MP, MP, 28, (d.semilla || 7) + 3, C.oro_claro);
  c += marcaEsquina(F, C.oro_claro);
  c += T(F.J_M, 'FICHA OLFATIVA', 18, 80, 110, C.gris2, { track: 0.3 });
  const t = titulo(F, d.nombre, 80, 200, 86, MP - 330, C.humo);
  c += t.svg;
  let y = t.y + 58;
  c += `<circle cx="93" cy="${y - 7}" r="8" fill="${col}"/>` + T(F.J_M, `${(d.familia || '').toUpperCase()} · ${d.genero.toUpperCase()}`, 18, 114, y, C.gris2, { track: 0.24 });
  y += 70;
  const niveles = [['I · SALIDA', d.notas.salida], ['II · CORAZÓN', d.notas.corazon], ['III · FONDO', d.notas.fondo]].filter(([, l]) => l && l.length);
  const alto = Math.min(190, (MP - 250 - y) / Math.max(1, niveles.length));
  c += `<line x1="93" y1="${y + 14}" x2="93" y2="${n(y + 14 + alto * (niveles.length - 1))}" stroke="${C.oro_claro}" stroke-width="1.4"/>`;
  niveles.forEach(([etq, notas], i) => {
    const yy = y + i * alto;
    c += `<circle cx="93" cy="${n(yy + 14)}" r="7" fill="${C.oro_claro}"/>` + T(F.J_M, etq, 16, 124, yy + 20, C.oro_claro, { track: 0.22 });
    const texto = [...new Set(notas.map(limpiarNota))].filter(Boolean).slice(0, 4).map((x) => x.charAt(0).toUpperCase() + x.slice(1)).join(' · ');
    let size = 38;
    while (size > 24 && ancho(F.CG_LI, texto, size) > MP - 200) size -= 1;
    c += P(F.CG_LI, texto, size, 124, yy + 66, C.humo, MP - 200, { lh: 1.15 }).svg;
  });
  c += `<line x1="80" y1="${MP - 210}" x2="${MP - 80}" y2="${MP - 210}" stroke="${C.filete2}" stroke-width="2"/>`;
  c += T(F.J_M, 'IDEAL PARA', 16, 80, MP - 160, C.gris2, { track: 0.24 });
  let size = 34;
  while (size > 22 && ancho(F.CG_LI, d.ideal, size) > MP - 160) size -= 1;
  c += T(F.CG_LI, d.ideal, size, 80, MP - 112, C.humo);
  c += T(F.J_R, 'Duración de 8 a 12 horas en piel · alta concentración', 22, 80, MP - 60, C.gris2);
  return documento(MP, MP, c, { titulo: `${d.nombre} · ficha olfativa` });
}

const FIJAS = [
  { seccion: '06c_marketplace', archivo: '03-foto-lo-que-recibes.svg', nombre: 'lo-que-recibes' },
  { seccion: '06c_marketplace', archivo: '04-foto-como-comprar.svg', nombre: 'como-comprar' }
];

const slug = (t) => String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Las 4 fotos de la publicación como JPG: [{ nombre, blob, url }] */
export async function fotosPublicacion(d, opciones = {}) {
  const base = slug(d.nombre);
  const svgs = [
    [`${base}-1-portada`, await portadaSvg(d, opciones)],
    [`${base}-2-ficha-olfativa`, await fichaSvg(d)],
    ...(await Promise.all(FIJAS.map(async (p, i) => [`${base}-${i + 3}-${p.nombre}`, await textoSvg(p)])))
  ];
  return Promise.all(svgs.map(async ([nombre, svg]) => {
    const blob = await svgAPng(svg, MP, MP, C.hueso, 'image/jpeg', 0.9);
    return { nombre: `${nombre}.jpg`, blob, url: URL.createObjectURL(blob) };
  }));
}
