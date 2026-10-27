// Textos de las publicaciones de Marketplace. Cada perfume tiene su nombre propio de Alta Densidad, un
// gancho (la primera línea, lo único que se ve en el listado), la sensación, para qué es ideal y sus notas.
// Origen, en este orden: lo editado en el panel (MarketplaceTextos) → marketplace.json (los 117 escritos a
// mano) → un texto automático armado con las notas y la familia del catálogo, para que un perfume nuevo
// tenga su publicación lista el mismo día. Nunca llevan el nombre ni la marca del original.
import BASE from './marketplace.json';

const POR_ID = new Map(BASE.map((p) => [p.id, p]));
const NOMBRES_USADOS = new Set(BASE.map((p) => p.nombre.toLowerCase()));
export const GENERO = { Masculino: 'Hombre', Femenino: 'Mujer', Unisex: 'Unisex' };
const PARA = { Masculino: 'Para hombre', Femenino: 'Para mujer', Unisex: 'Unisex' };
const PARA_TITULO = { Masculino: 'para hombre', Femenino: 'para mujer', Unisex: 'unisex' };

// Familia principal → gancho e ideal del texto automático
const POR_FAMILIA = {
  'Floral': ['Femenina, elegante y de las que dejan huella.', 'oficina · citas · celebraciones'],
  'Ambarada / Oriental': ['Cálido, envolvente y con muchísima estela.', 'noches · eventos · temporada fría'],
  'Amaderada': ['Elegancia que se nota sin decir nada.', 'oficina · cenas · día a día'],
  'Frutal': ['Jugoso, alegre y fácil de amar.', 'uso diario · salidas · clima cálido'],
  'Aromática': ['Fresco con carácter: perfecto para todos los días.', 'oficina · deporte · viajes'],
  'Gourmand': ['Huele a postre… y nadie lo olvida.', 'citas · noches · temporada fría'],
  'Especiada': ['Intenso, especiado y de mucha presencia.', 'noches · eventos · frío'],
  'Acuática': ['Frescura de mar que dura todo el día.', 'calor · oficina · playa'],
  'Cítrica': ['Pura energía: limpio, cítrico y luminoso.', 'día · calor · deporte'],
  'Almizclada': ['Huele a piel limpia… pero mucho más bonita.', 'uso diario · oficina · siempre'],
  'Cuero': ['Sofisticado, intenso y con mucho carácter.', 'noches · eventos · frío'],
  'Fougère': ['El clásico elegante que siempre funciona.', 'oficina · reuniones · día a día'],
  'Chipre': ['Distinguido y diferente a todo lo demás.', 'eventos · cenas · oficina'],
  'Verde': ['Natural, verde y muy elegante.', 'día · oficina · clima cálido']
};

// «limón (lima ácida)» → «limón»: en Marketplace se lee mejor corto
export const limpiarNota = (t) => String(t || '').replace(/\s*\([^)]*\)/g, '').trim();
const limpiar = (l) => [...new Set((l || []).map(limpiarNota).filter(Boolean))];
const capital = (t) => String(t || '').charAt(0).toUpperCase() + String(t || '').slice(1);
const lista = (l) => (l.length <= 1 ? l.join('') : `${l.slice(0, -1).join(', ')} y ${l[l.length - 1]}`);
export const tamano = (prod) => String(prod?.sizes?.[0] || '100ml').replace(/ml$/i, ' ml');
export const pesos = (v) => `$${Math.round(Number(v) || 0).toLocaleString('es-CO')}`;

// Nombre propio a partir de las notas: «Rosa y Vainilla», «Bergamota y Ámbar»…
function nombreAutomatico(notas) {
  const medio = [...notas.corazon, ...notas.salida].map(capital);
  const fondo = notas.fondo.map(capital);
  for (const a of medio) {
    for (const b of fondo) {
      const nom = `${a} y ${b}`;
      if (a !== b && nom.length <= 32 && !NOMBRES_USADOS.has(nom.toLowerCase())) return nom;
    }
  }
  return medio[0] || fondo[0] || 'Fragancia de autor';
}

function textoAutomatico(prod) {
  const notas = {
    salida: prod?.notes?.top || [], corazon: prod?.notes?.heart || [], fondo: prod?.notes?.base || []
  };
  const familias = (prod?.families?.length ? prod.families : prod?.family ? [prod.family] : []).map((f) => f.name);
  const [gancho, ideal] = POR_FAMILIA[familias[0]] || ['Una fragancia que se nota desde el primer momento.', 'día a día · salidas · ocasiones especiales'];
  const destacadas = [...notas.salida.slice(0, 1), ...notas.corazon.slice(0, 1), ...notas.fondo.slice(0, 1)];
  return {
    nombre: nombreAutomatico(notas),
    gancho,
    sensacion: destacadas.length ? `${capital(lista(destacadas))}.` : 'Alta concentración y gran duración.',
    ideal,
    familia: familias.slice(0, 2).join(' · ') || 'Alta Densidad',
    notas,
    automatico: true
  };
}

/** Texto vigente de un perfume: { nombre, gancho, sensacion, ideal, familia, notas, n?, automatico?, editado? } */
export function textoDe(prod, editados = {}) {
  const base = POR_ID.get(prod.id) || textoAutomatico(prod);
  const ed = editados[prod.id];
  return ed ? { ...base, nombre: ed.nombre, gancho: ed.gancho, sensacion: ed.sensacion, ideal: ed.ideal, automatico: false, editado: true } : base;
}

// Tres formas del título: Marketplace oculta publicaciones repetidas, así que al volver a publicar
// el mismo perfume se usa la siguiente.
export function tituloDe(t, prod, variante = 0) {
  const g = GENERO[prod?.gender] || '';
  const ml = tamano(prod);
  const opciones = [
    `Perfume ${g} ${t.nombre} ${ml} · Alta Densidad`,
    `${t.nombre} · Perfume ${PARA_TITULO[prod?.gender] || ''} de alta concentración ${ml}`,
    `Perfume ${String(t.familia).split(' · ')[0].toLowerCase()} ${g} ${t.nombre} · ${ml} · Alta Densidad`
  ];
  return opciones[((variante % 3) + 3) % 3].replace(/\s+/g, ' ').trim().slice(0, 99);
}

export function descripcionDe(t, prod, pie) {
  const [salida, corazon, fondo] = [limpiar(t.notas.salida), limpiar(t.notas.corazon), limpiar(t.notas.fondo)];
  return [
    t.gancho,
    '',
    `✨ ${t.nombre}: ${t.sensacion}`,
    '',
    salida.length ? `🍋 Salida: ${salida.join(', ')}` : null,
    corazon.length ? `🌸 Corazón: ${corazon.join(', ')}` : null,
    fondo.length ? `🪵 Fondo: ${fondo.join(', ')}` : null,
    '',
    `👤 ${PARA[prod?.gender] || 'Unisex'} · ${tamano(prod)} · familia ${String(t.familia).toLowerCase()}`,
    '💎 Fragancia de alta concentración',
    `📍 Ideal para: ${t.ideal}`,
    '',
    String(pie || '').trim()
  ].filter((l) => l !== null).join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
