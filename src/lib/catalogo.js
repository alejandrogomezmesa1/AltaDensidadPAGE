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
