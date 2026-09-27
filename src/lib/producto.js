// Modelo de producto de la tienda: marca, colección, perfil olfativo, precio e imagen.
import { DATOS_DUROS_PRODUCTOS } from '../data/catalogo';

export const LOGO = '/assets/img/Logo2026.png';

export const fmt = (n) => '$' + Number(n).toLocaleString('es-CO');

// Normalizador universal de imágenes para rutas locales y remotas
export function normalizarImagen(src) {
  if (!src) return LOGO;
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) return src;
  let p = src.trim().replace(/^\//, '');
  if (p.startsWith('img/')) p = 'assets/' + p;
  else if (!p.startsWith('assets/')) p = 'assets/img/' + p;
  return '/' + p
    .replace(/cartier\.jpeg$/i, 'CARTIER.jpeg')
    .replace(/cilindro\.jpeg$/i, 'CILINDRO.jpeg')
    .replace(/amira\.jpeg$/i, 'AMIRA.jpeg')
    .replace(/victory\.jpeg$/i, 'VICTORY.jpeg')
    .replace(/eros\.jpeg$/i, 'EROS.jpeg');
}

export const urlAbsoluta = (img, sitio) => (img.startsWith('http') ? img : sitio + img);

const MARCAS_RECONOCIDAS = [
  'CAROLINA HERRERA', 'LATTAFA', 'PACO RABANNE', 'VERSACE', 'DIOR', 'CHANEL',
  'HUGO BOSS', 'LACOSTE', 'ARMAF', 'LOUIS VUITTON', 'ORIENTICA', 'AFNAN',
  'PERRY ELLIS', 'VICTORINOX', 'AL HARAMAIN', 'MONTALE', 'BHARARA', 'BOND N',
  'VALENTINO', 'PARIS HILTON', 'ARIANA GRANDE', 'BVLGARI', 'XERJOFF', 'GIORGIO ARMANI',
  'YVES SAINT LAURENT', 'CALVIN KLEIN', 'JEAN PAUL GAULTIER', 'DOLCE & GABBANA',
  'CREED', 'TOM FORD', 'HERMES', 'ROJA DOVE', 'NISHANE', 'MANCERA', 'INITIO',
  'MOSCHINO', 'MONTBLANC', 'LE LABO', 'ILMIN', 'AHLI', 'BURBERRY', 'AMOUAGE'
];

export function extraerMarca(nombre) {
  if (!nombre) return 'Otras marcas';
  const up = nombre.toUpperCase();
  for (const marca of MARCAS_RECONOCIDAS) {
    if (up.includes(marca)) return marca === 'BOND N' ? 'BOND NO. 9' : marca;
  }
  return 'Otras marcas';
}

export const etiquetaColeccion = (c) => (c === 'Arabe' ? 'Árabe' : (c || 'Diseñador'));

export function normalizarGenero(g) {
  if (g === 'Hombre' || g === 'Masculino') return 'Masculino';
  if (g === 'Mujer' || g === 'Femenino') return 'Femenino';
  return 'Unisex';
}

// Familia, ocasión y tono del frasco deducidos de la descripción cuando no hay perfil curado
function perfilOlfativo(item, idx) {
  const nameLow = (item.name || '').toLowerCase();
  const descLow = (item.description || '').toLowerCase();
  const catLow = (item.category || '').toLowerCase();
  let occ = 'Noche';
  let fam = 'Amaderada';
  let hue = (idx * 37) % 360;

  if (descLow.includes('fresc') || descLow.includes('cítric') || descLow.includes('verano') || nameLow.includes('aqua') || nameLow.includes('blue')) {
    occ = 'Verano'; fam = 'Cítrica / Fresca'; hue = 190;
  } else if (descLow.includes('oficina') || descLow.includes('elegante') || descLow.includes('diario') || descLow.includes('versátil')) {
    occ = 'Oficina'; fam = 'Aromática'; hue = 130;
  } else if (descLow.includes('dulce') || descLow.includes('vainilla') || descLow.includes('gourmand') || descLow.includes('caramelo') || nameLow.includes('candy')) {
    fam = 'Dulce / Gourmand'; hue = 24;
  } else if (descLow.includes('floral') || nameLow.includes('rosa') || nameLow.includes('iris') || nameLow.includes('rose')) {
    fam = 'Floral'; hue = 330;
  } else if (descLow.includes('cuero') || nameLow.includes('cuero') || nameLow.includes('leather')) {
    fam = 'Cuero'; hue = 16;
  } else if (catLow.includes('arabe') || descLow.includes('oriental') || descLow.includes('especiad') || nameLow.includes('oud')) {
    fam = 'Especiada / Árabe'; hue = 40;
  }
  return { f: fam, o: occ, h: hue };
}

// Convierte un producto con forma de API ({id, name, price, sizes, bottleTypes...}) al modelo interno
export function adaptarProducto(item, idx) {
  const curado = DATOS_DUROS_PRODUCTOS.find((d) => d.id === Number(item.id) && d.f) || item;
  const base = perfilOlfativo(item, idx);
  const nombre = (item.name || item.nombre || 'Fragancia').trim();
  return {
    id: Number(item.id),
    n: nombre,
    b: extraerMarca(nombre),
    c: item.category || item.categoria || 'Diseñador',
    g: normalizarGenero(item.gender || item.genero),
    f: curado.f || base.f,
    o: curado.o || base.o,
    h: curado.h != null ? curado.h : base.h,
    no: curado.no || ['Salida vibrante', 'Corazón de autor', 'Ámbar y feromonas'],
    p: Number(item.price || item.precio) > 0 ? Number(item.price || item.precio) : 75000,
    sz: Array.isArray(item.sizes) ? item.sizes.filter(Boolean) : [],
    env: Array.isArray(item.bottleTypes) ? item.bottleTypes.filter(Boolean) : [],
    desc: item.description || item.descripcion || null,
    img: normalizarImagen(item.image || item.imagen || (item.images && item.images[0])),
    ag: Number(item.agotado) === 1
  };
}

export const pr = (p) => Number(p.p || p.precio || p.price || 75000);

export function etiquetaTalla(ml) {
  if (ml === '' || ml == null) return '';
  return typeof ml === 'number' ? ml + ' ml' : String(ml);
}

export function descripcion(p) {
  if (p.desc) return p.desc;
  const f = (p.f || 'de autor').toLowerCase();
  const no = p.no || ['Notas cítricas', 'Corazón aromático', 'Ámbar y feromonas'];
  return `Una fragancia ${f} de alta densidad. Abre con ${no[0].toLowerCase()}, se asienta en ${no[1].toLowerCase()} y deja un fondo memorable de ${no[2].toLowerCase()}. Concentración pura Extrait de Parfum con base de feromonas.`;
}

export const normalizar = (txt) => (txt || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

export function paginasVisibles(actual, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (actual <= 4) return [1, 2, 3, 4, 5, '...', total];
  if (actual >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '...', actual - 1, actual, actual + 1, '...', total];
}
