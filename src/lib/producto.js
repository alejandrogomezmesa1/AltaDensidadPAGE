// Modelo de producto de la tienda: marca, colección, perfil olfativo, precio e imagen.

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

export const etiquetaColeccion = (c) => (c === 'Arabe' ? 'Árabe' : (c || 'Diseñador'));

export function normalizarGenero(g) {
  if (g === 'Hombre' || g === 'Masculino') return 'Masculino';
  if (g === 'Mujer' || g === 'Femenino') return 'Femenino';
  return 'Unisex';
}

const NOTAS_VACIAS = { top: [], heart: [], base: [] };

// Convierte un producto de la API al modelo de la tienda. La ficha (marca, original, familia,
// acordes y notas) viene de la base; si un dato no está cargado, simplemente no se muestra.
export function adaptarProducto(item, idx) {
  const nombre = (item.name || item.nombre || 'Fragancia').trim();
  const notas = item.notes || NOTAS_VACIAS;
  return {
    id: Number(item.id),
    n: nombre,
    b: item.brand ? item.brand.name : null,
    orig: item.originalName || null,
    c: item.category || item.categoria || 'Diseñador',
    g: normalizarGenero(item.gender || item.genero),
    f: item.family ? item.family.name : null,
    ac: Array.isArray(item.accords) ? item.accords : [],
    no: { top: notas.top || [], heart: notas.heart || [], base: notas.base || [] },
    // Tono del frasco dibujado cuando la foto no carga
    h: (Number(item.id || idx) * 37) % 360,
    p: Number(item.price || item.precio) > 0 ? Number(item.price || item.precio) : 75000,
    sz: Array.isArray(item.sizes) ? item.sizes.filter(Boolean) : [],
    env: Array.isArray(item.bottleTypes) ? item.bottleTypes.filter(Boolean) : [],
    desc: item.description || item.descripcion || null,
    img: normalizarImagen(item.image || item.imagen || (item.images && item.images[0])),
    ag: Number(item.agotado) === 1,
    rev: Number(item.priceReview || item.precio_revision) === 1,
    // Solo en esencia: no se vende como 1.1, sí en "Crea tu perfume"
    sp: Number(item.soloPreparado) === 1
  };
}

// Todas las notas de la pirámide en una lista (salida, corazón y fondo)
export const todasLasNotas = (p) => [...p.no.top, ...p.no.heart, ...p.no.base];
export const tieneNotas = (p) => todasLasNotas(p).length > 0;

// No se puede vender: sin stock en DATA o precio en revisión (no cubre el costo)
export const noDisponible = (p) => p.ag || p.rev;
export const motivoNoDisponible = (p) => (p.rev ? 'Precio en revisión' : 'Agotado');

// Perfumes que se venden como 1.1 (sin los que solo se preparan)
export const perfumes11 = (P) => P.filter((p) => !p.sp);

export const pr = (p) => Number(p.p || p.precio || p.price || 75000);

export function etiquetaTalla(ml) {
  if (ml === '' || ml == null) return '';
  return typeof ml === 'number' ? ml + ' ml' : String(ml);
}

export function descripcion(p) {
  if (p.desc) return p.desc;
  return 'Concentración pura Extrait de Parfum con base de feromonas.';
}

export const normalizar = (txt) => (txt || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

export function paginasVisibles(actual, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (actual <= 4) return [1, 2, 3, 4, 5, '...', total];
  if (actual >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '...', actual - 1, actual, actual + 1, '...', total];
}

// ── Enlaces directos: /perfume/<slug> y /kit/<slug> ──
// El slug sale del nombre ("KHAMRAH LATTAFA" → "khamrah-lattafa"). Si dos nombres dan el mismo,
// al segundo se le agrega su id. Un enlace viejo que termine en -<id> o sea solo el id también resuelve.
export const slug = (texto) => normalizar(texto)
  .replace(/&/g, ' y ')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

export function mapaSlugs(lista, nombreDe) {
  const porSlug = new Map();
  const porId = new Map();
  for (const x of lista) {
    let s = slug(nombreDe(x)) || String(x.id);
    if (porSlug.has(s)) s = `${s}-${x.id}`;
    porSlug.set(s, x.id);
    porId.set(x.id, s);
  }
  return { porSlug, porId };
}

export function resolverSlug(mapa, s) {
  const limpio = slug(decodeURIComponent(String(s || '')));
  if (mapa.porSlug.has(limpio)) return mapa.porSlug.get(limpio);
  const id = /(?:^|-)(\d+)$/.exec(limpio);
  if (id && mapa.porId.has(Number(id[1]))) return Number(id[1]);
  return null;
}
