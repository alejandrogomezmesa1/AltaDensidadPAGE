// Perfumes afines por notas: dado un perfume, ordena los demás 1.1 por cuántas notas comparten.
//
// Las notas vienen de Fragrantica escritas de muchas formas, así que antes de comparar se llevan a
// una forma canónica:
//   «Limón (lima ácida)» → limon · «Toronja (pomelo)» y «pomelo» → toronja · «Vainilla de Madagascar»
//   → vainilla de madagascar, que cuenta como vainilla (coincidencia parcial).
// La coincidencia parcial usa el núcleo de la nota (su primera palabra: «rosa de damasco» → rosa),
// salvo en núcleos genéricos («madera de oud» no es «madera de gaiac»).
//
// Orden: primero cuántas notas comparten (una parcial cuenta como media). En empate gana la que
// comparte notas menos comunes (oud dice más que almizcle, que está en medio catálogo), las que
// coinciden en la misma capa de la pirámide, los acordes y la familia olfativa.
import { perfumes11, noDisponible } from './producto';

const ALIAS = {
  pomelo: 'toronja', 'lima acida': 'limon', muguete: 'lirio de los valles', 'fruta de la pasion': 'maracuya',
  'flor de azahar del naranjo': 'flor de azahar', azahar: 'flor de azahar', 'haba tonka': 'tonka', 'olibano': 'incienso',
  'incienso de olibano': 'incienso', oud: 'madera de oud', agarwood: 'madera de oud'
};
// Núcleos que solos no dicen nada: con ellos solo vale la coincidencia exacta
const GENERICOS = new Set(['madera', 'maderas', 'notas', 'nota', 'flor', 'flores', 'hojas', 'hoja', 'raiz', 'bayas', 'agua', 'leche', 'musgo', 'acorde', 'esencia', 'absoluto', 'aceite', 'resina', 'corteza']);

// «Pachulí de la India», «bergamota de Calabria»: el origen no cambia la nota
const LUGARES = /\s+de\s+(la\s+|las\s+|los\s+)?(india|calabria|madagascar|bulgaria|damasco|virginia|egipto|siam|haiti|java|sicilia|italia|francia|grasse|marruecos|turquia|tunez|sri lanka|indonesia|mexico|tahiti|laos|camboya|paraguay|brasil|florida|amalfi|persia|arabia|oman|somalia|etiopia|china|japon|guatemala|mysore|australia|kenia|toscana|provenza|comoras|reunion|ceilan|zanzibar|tailandia|vietnam|nepal|tibet|cachemira|atlas|chipre|jamaica|venezuela|ecuador|peru|colombia|sudafrica|egipcia)\b.*$/;

const sinTildes = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '');

export function canonica(nota) {
  let t = sinTildes(String(nota).toLowerCase()).replace(/\.+$/, '').trim();
  const alias = t.match(/\(([^)]+)\)/);
  t = t.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
  if (!t && alias) t = alias[1].trim();
  t = ALIAS[t] || t;
  // «madera de cachemira» es otra nota: solo se quita el origen si queda algo con sentido propio
  const sinLugar = t.replace(LUGARES, '').trim();
  if (sinLugar && !GENERICOS.has(sinLugar)) t = sinLugar;
  return ALIAS[t] || t;
}

const nucleo = (c) => {
  const n = c.split(' ')[0];
  return GENERICOS.has(n) ? null : n;
};

// Notas por capa, ya canónicas y sin repetir
function perfilDe(p) {
  const capas = { top: new Set(), heart: new Set(), base: new Set() };
  for (const k of Object.keys(capas)) (p.no?.[k] || []).forEach((n) => { const c = canonica(n); if (c) capas[k].add(c); });
  const todas = new Map(); // canónica → { capa, original }
  for (const k of Object.keys(capas)) {
    (p.no?.[k] || []).forEach((n) => { const c = canonica(n); if (c && !todas.has(c)) todas.set(c, { capa: k, original: n.trim() }); });
  }
  return {
    todas,
    nucleos: new Map([...todas.keys()].map((c) => [nucleo(c), c]).filter(([n]) => n)),
    acordes: new Set((p.ac || []).map((a) => sinTildes(String(a).toLowerCase()).trim())),
    familias: new Set((p.fs || (p.f ? [p.f] : [])).map((f) => sinTildes(String(f).toLowerCase())))
  };
}

// Qué tan común es cada nota en el catálogo (para desempatar por notas raras)
function rareza(perfiles) {
  const cuenta = new Map();
  perfiles.forEach((pf) => pf.todas.forEach((_, c) => cuenta.set(c, (cuenta.get(c) || 0) + 1)));
  const total = perfiles.length || 1;
  return (c) => Math.log((total + 1) / ((cuenta.get(c) || 0) + 1));
}

function comparar(base, otro, peso) {
  const comunes = []; // { nota (como la escribe el perfume base), parcial }
  let cantidad = 0;
  let rarezaSum = 0;
  let mismaCapa = 0;
  const usadas = new Set();
  base.todas.forEach((info, c) => {
    if (otro.todas.has(c)) {
      cantidad += 1;
      rarezaSum += peso(c);
      if (otro.todas.get(c).capa === info.capa) mismaCapa += 1;
      comunes.push({ nota: info.original, parcial: false });
      usadas.add(c);
      return;
    }
    const n = nucleo(c);
    const par = n && otro.nucleos.get(n);
    if (par && !usadas.has(par) && !base.todas.has(par)) {
      cantidad += 0.5;
      rarezaSum += peso(c) * 0.5;
      comunes.push({ nota: info.original, parcial: true });
      usadas.add(par);
    }
  });
  let acordes = 0;
  base.acordes.forEach((a) => { if (otro.acordes.has(a)) acordes += 1; });
  let familia = 0;
  base.familias.forEach((f) => { if (otro.familias.has(f)) familia += 1; });
  return { cantidad, comunes, puntaje: rarezaSum + mismaCapa * 0.4 + acordes * 0.15 + familia * 0.5 };
}

// Lista de afines: [{ p, cantidad, exactas, comunes, total }] ordenada de más a menos parecido.
// Solo perfumes 1.1 disponibles y con al menos una nota en común.
export function perfumesAfines(producto, catalogo, limite = 12) {
  if (!producto) return [];
  const candidatos = perfumes11(catalogo).filter((p) => p.id !== producto.id && !noDisponible(p));
  const perfiles = new Map(candidatos.map((p) => [p.id, perfilDe(p)]));
  const base = perfilDe(producto);
  const peso = rareza([base, ...perfiles.values()]);
  return candidatos
    .map((p) => ({ p, ...comparar(base, perfiles.get(p.id), peso) }))
    .filter((r) => r.cantidad >= 1)
    .sort((a, b) => b.cantidad - a.cantidad || b.puntaje - a.puntaje || a.p.n.localeCompare(b.p.n, 'es'))
    .slice(0, limite)
    .map((r) => ({ ...r, exactas: r.comunes.filter((c) => !c.parcial).length, total: base.todas.size }));
}
