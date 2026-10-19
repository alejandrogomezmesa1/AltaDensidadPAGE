// Forma canónica de acordes y notas: la usan los filtros del catálogo y las recomendaciones de la
// ficha (lib/afinidad.js), así un mismo acorde o nota escrito de dos maneras cuenta como uno solo.

export const sinTildes = (t) => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '');

// ── Acordes ──
// Vienen ordenados de más a menos intenso (como en Fragrantica): el primero es el principal
const ACORDE_SINONIMOS = {
  afrutados: 'afrutado', 'frutal gourmand: mandarina': 'afrutado', florales: 'floral', vainilla: 'avainillado',
  almizcle: 'almizclado', 'con fondo de ambar gris': 'ambar', rosas: 'rosa'
};
const ACORDE_ETIQUETA = { afrutado: 'Afrutado', floral: 'Floral', avainillado: 'Avainillado', almizclado: 'Almizclado', ambar: 'Ámbar', rosa: 'Rosa' };

export function acordeCanonico(a) {
  const t = sinTildes(String(a).toLowerCase()).replace(/\.+$/, '').trim();
  return ACORDE_SINONIMOS[t] || t;
}

const mayuscula = (t) => (t ? t.charAt(0).toUpperCase() + t.slice(1) : t);

export function etiquetaAcorde(original) {
  const c = acordeCanonico(original);
  return ACORDE_ETIQUETA[c] || mayuscula(String(original).replace(/\.+$/, '').trim().toLowerCase());
}

// Acordes de un perfume sin repetir, en orden: [{ clave, etiqueta }]
export function acordesDe(p) {
  const vistos = new Set();
  const res = [];
  (p.ac || []).forEach((a) => {
    const clave = acordeCanonico(a);
    if (!clave || vistos.has(clave)) return;
    vistos.add(clave);
    res.push({ clave, etiqueta: etiquetaAcorde(a) });
  });
  return res;
}

export const acordePrincipalDe = (p) => acordesDe(p)[0] || null;

// ── Notas ──
// «Limón (lima ácida)» → limon · «pomelo» → toronja · «Pachulí de la India» → pachuli
const NOTA_ALIAS = {
  pomelo: 'toronja', 'lima acida': 'limon', muguete: 'lirio de los valles', 'fruta de la pasion': 'maracuya',
  'flor de azahar del naranjo': 'flor de azahar', azahar: 'flor de azahar', 'haba tonka': 'tonka', olibano: 'incienso',
  'incienso de olibano': 'incienso', oud: 'madera de oud', agarwood: 'madera de oud', melocoton: 'durazno',
  'limon siciliano': 'limon', 'limon de amalfi': 'limon'
};
// Palabras que solas no son una nota («madera de cachemira» no se reduce a «madera»)
const NOTA_GENERICAS = new Set(['madera', 'maderas', 'notas', 'nota', 'flor', 'flores', 'hojas', 'hoja', 'raiz', 'bayas', 'agua', 'leche', 'musgo', 'acorde', 'esencia', 'absoluto', 'aceite', 'resina', 'corteza']);
const LUGARES = /\s+de\s+(la\s+|las\s+|los\s+)?(india|calabria|madagascar|bulgaria|damasco|virginia|egipto|siam|haiti|java|sicilia|italia|francia|grasse|marruecos|turquia|tunez|sri lanka|indonesia|mexico|tahiti|laos|camboya|paraguay|brasil|florida|amalfi|persia|arabia|oman|somalia|etiopia|china|japon|guatemala|mysore|australia|kenia|toscana|provenza|comoras|reunion|ceilan|zanzibar|tailandia|vietnam|nepal|tibet|cachemira|atlas|chipre|jamaica|venezuela|ecuador|peru|colombia|sudafrica)\b.*$/;

export function notaCanonica(nota) {
  let t = sinTildes(String(nota).toLowerCase()).replace(/\.+$/, '').trim();
  const alias = t.match(/\(([^)]+)\)/);
  t = t.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
  if (!t && alias) t = alias[1].trim();
  t = NOTA_ALIAS[t] || t;
  const sinLugar = t.replace(LUGARES, '').trim();
  if (sinLugar && !NOTA_GENERICAS.has(sinLugar)) t = NOTA_ALIAS[sinLugar] || sinLugar;
  return t;
}

// Cómo se muestra una nota: sin el paréntesis y con mayúscula inicial
export const etiquetaNota = (nota) => mayuscula(String(nota).replace(/\s*\([^)]*\)/g, '').replace(/\.+$/, '').trim().toLowerCase());

// Notas de un perfume sin repetir: [{ clave, etiqueta, capa }]
export function notasDe(p) {
  const vistos = new Set();
  const res = [];
  ['top', 'heart', 'base'].forEach((capa) => (p.no?.[capa] || []).forEach((n) => {
    const clave = notaCanonica(n);
    if (!clave || vistos.has(clave)) return;
    vistos.add(clave);
    res.push({ clave, etiqueta: etiquetaNota(n), capa });
  }));
  return res;
}
