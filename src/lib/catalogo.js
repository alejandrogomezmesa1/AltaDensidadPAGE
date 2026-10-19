// Catálogo unificado: códigos de línea y precios del armador y de los insumos.
// El precio que se muestra aquí es informativo: el backend lo recalcula al cobrar (services/precios.js).

// Categoría de precio de la esencia: árabe o diseñador
export const categoriaPrecio = (c) => (/arab/i.test(String(c || '')) ? 'Arabe' : 'Diseñador');

export const ETIQUETA_TIPO = {
  esencia: 'Esencia', base: 'Base', feromona: 'Feromonas', envase: 'Envase', accesorio: 'Accesorio'
};

// arm_<productoId>_<ml>_<envaseId>_<0|1 feromonas>
export const codigoArmado = ({ productoId, ml, envaseId, feromonas }) => `arm_${productoId}_${ml}_${envaseId}_${feromonas ? 1 : 0}`;
export function leerArmado(id) {
  const m = /^arm_(\d+)_(\d+)_(\d+)_([01])$/.exec(String(id));
  return m ? { productoId: Number(m[1]), ml: Number(m[2]), envaseId: Number(m[3]), feromonas: m[4] === '1' } : null;
}

// ins_<inventarioId> o ins_<inventarioId>_<ml>
export const codigoInsumo = (id, ml) => (ml ? `ins_${id}_${ml}` : `ins_${id}`);
export function leerInsumo(id) {
  const m = /^ins_(\d+)(?:_(\d+))?$/.exec(String(id));
  return m ? { id: Number(m[1]), ml: m[2] ? Number(m[2]) : null } : null;
}

// Desglose del perfume armado; total = null si alguna parte aún no tiene precio
export function precioArmado(config, { categoria, ml, envaseId, feromonas }) {
  const envase = config.envases.find((e) => e.id === envaseId);
  const talla = envase && envase.sizes.find((s) => s.ml === ml);
  const tabla = config.esencia[categoriaPrecio(categoria)] || {};
  const esencia = tabla[ml] ?? null;
  const envasePrecio = talla ? talla.price : null;
  const recargo = feromonas ? config.recargoFeromonas : 0;
  const total = esencia != null && envasePrecio != null && recargo != null ? esencia + envasePrecio + recargo : null;
  return { esencia, envase: envasePrecio, feromonas: recargo, total };
}

// Precio de un insumo: por unidad, o precio por ml × presentación
export const precioInsumo = (insumo, ml) => Math.round(insumo.unit === 'ml' ? insumo.price * (ml || 0) : insumo.price);

// ── Decants de 10 ml (services/decants.js) ──
// dec_<productoId>_<envaseId> · dset_<setId>_<envaseId>_<p1>-<p2>-…
export const codigoDecant = (productoId, envaseId) => `dec_${productoId}_${envaseId}`;
export function leerDecant(id) {
  const m = /^dec_(\d+)_(\d+)$/.exec(String(id));
  return m ? { productoId: Number(m[1]), envaseId: Number(m[2]) } : null;
}
export const codigoSetDecants = (setId, envaseId, productoIds) => `dset_${setId}_${envaseId}_${productoIds.join('-')}`;
export function leerSetDecants(id) {
  const m = /^dset_(\d+)_(\d+)_(\d+(?:-\d+)+)$/.exec(String(id));
  return m ? { setId: Number(m[1]), envaseId: Number(m[2]), productoIds: m[3].split('-').map(Number) } : null;
}

// Ficha de decant de una fragancia (o null si no se ofrece en decant)
export const decantDe = (decants, productoId) => (decants ? decants.fragancias.find((f) => f.productoId === productoId) || null : null);

// Precio de un decant: fragancia (por categoría) + envase; null si falta alguno
export function precioDecant(decants, productoId, envaseId) {
  const f = decantDe(decants, productoId);
  const envase = decants && decants.envases.find((e) => e.id === envaseId);
  if (!f || !envase || f.precio == null || envase.precio == null) return null;
  return f.precio + envase.precio;
}

// Se puede pedir ya: hay esencia, el envase tiene stock, hay precio y cubre el costo
export function decantVendible(decants, productoId, envaseId) {
  const f = decantDe(decants, productoId);
  const envase = decants && decants.envases.find((e) => e.id === envaseId);
  return Boolean(decants && decants.disponible && f && f.disponible && envase && envase.disponible
    && !f.bloqueados.includes(envaseId) && precioDecant(decants, productoId, envaseId) != null);
}

// Precio del set: suma de sus decants con el descuento, redondeado a $100 (igual que el backend)
export function precioSetDecants(decants, set, envaseId, productoIds) {
  const precios = productoIds.map((id) => precioDecant(decants, id, envaseId));
  if (!set || precios.some((p) => p == null)) return null;
  const suma = precios.reduce((s, p) => s + p, 0);
  return { suma, total: Math.round((suma * (100 - set.descuento)) / 100 / 100) * 100 };
}

// Precio más bajo de un decant de esa fragancia (para "desde $…")
export function desdeDecant(decants, productoId) {
  if (!decants) return null;
  const precios = decants.envases.filter((e) => decantVendible(decants, productoId, e.id)).map((e) => precioDecant(decants, productoId, e.id));
  return precios.length ? Math.min(...precios) : null;
}
