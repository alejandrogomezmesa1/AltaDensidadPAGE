// Datos compartidos por las funciones de Vercel (los archivos con "_" no son rutas).
// Usan las mismas reglas de enlaces que la tienda (src/lib/producto.js), así un enlace
// /perfume/<slug> resuelve igual en el servidor y en el navegador.
import { adaptarProducto, mapaSlugs, normalizarImagen, direccionPerfume, direccionKit, idDesdeRuta } from '../src/lib/producto.js';

export const SITIO = 'https://alta-densidad-page.vercel.app';
const API = (process.env.API_URL || 'https://altadensidadpage-production.up.railway.app/api').replace(/\/$/, '');
const TTL_MS = 5 * 60 * 1000;
const cache = new Map();

async function leer(ruta) {
  const guardado = cache.get(ruta);
  if (guardado && guardado.expira > Date.now()) return guardado.datos;
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 4000);
  try {
    const r = await fetch(`${API}/${ruta}`, { signal: controller.signal });
    if (!r.ok) throw new Error(`API ${ruta}: ${r.status}`);
    const json = await r.json();
    const datos = Array.isArray(json) ? json : json.data;
    if (!Array.isArray(datos)) throw new Error(`API ${ruta}: respuesta inesperada`);
    cache.set(ruta, { datos, expira: Date.now() + TTL_MS });
    return datos;
  } finally {
    clearTimeout(t);
  }
}

// Mismo filtro y orden que la tienda (TiendaContext): así los slugs repetidos llevan el mismo id
export async function perfumes() {
  const lista = (await leer('productos')).filter((x) => x.activo !== 0).map(adaptarProducto);
  return { lista, slugs: mapaSlugs(lista, (p) => p.n) };
}

export async function kits() {
  const lista = (await leer('kits')).filter((k) => k.activo !== 0).map((k) => ({
    id: k.id, nombre: k.nombre || k.name, descripcion: k.descripcion || k.description || '',
    precio: Number(k.precio || k.price || 0), imagen: k.imagen || k.image
  }));
  return { lista, slugs: mapaSlugs(lista, (k) => k.nombre) };
}

// Producto a partir de la dirección (formato nuevo con id o enlace viejo por nombre)
export function buscar(datos, ruta) {
  const id = idDesdeRuta(ruta, datos.slugs, (x) => datos.lista.some((i) => i.id === x));
  return id ? datos.lista.find((i) => i.id === id) : null;
}
export { direccionPerfume, direccionKit };

export const imagenAbsoluta = (src) => {
  const n = normalizarImagen(src);
  return n.startsWith('http') ? n : SITIO + n;
};
