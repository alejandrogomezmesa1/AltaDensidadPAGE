// Direcciones de los perfumes en la tienda: /perfume/<marca>/<nombre>-<id>, al estilo de
// Fragrantica. La parte "<marca>/<nombre>" (ruta) se guarda en Productos.ruta: no cambia si se
// edita el nombre, y el id al final hace que un enlace viejo o mal escrito igual encuentre el
// producto. Mismas reglas que src/lib/producto.js (slug) en el navegador.

const slug = (texto) => String(texto == null ? '' : texto)
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' y ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// "POLO BLUE RALPH LAUREN" + "Ralph Lauren" → "ralph-lauren/polo-blue"
function rutaPorDefecto(nombre, marca) {
    const m = slug(marca);
    let n = slug(nombre);
    // La marca se quita del nombre solo como palabras completas ("le-labo" sí, "le-laboo" no)
    if (m) n = `-${n}-`.replace(`-${m}-`, '-').replace(/^-+|-+$/g, '') || n;
    return [m, n].filter(Boolean).join('/').slice(0, 150) || null;
}

// Lo que escribe el panel: hasta dos tramos (marca/nombre), cada uno como slug
function normalizarRuta(texto) {
    const tramos = String(texto == null ? '' : texto).split('/').map(slug).filter(Boolean);
    if (!tramos.length) return null;
    return tramos.slice(-2).join('/').slice(0, 150);
}

// https://www.fragrantica.es/perfume/Ralph-Lauren/Polo-Blue-1198.html → { marca, nombre, ruta }
function desdeFragrantica(url) {
    let u;
    try { u = new URL(String(url).trim()); } catch { return null; }
    if (!/(^|\.)fragrantica\.[a-z.]+$/i.test(u.hostname)) return null;
    const m = /^\/(?:perfume|perfumes)\/([^/]+)\/(.+?)-(\d+)\.html$/i.exec(decodeURIComponent(u.pathname));
    if (!m) return null;
    const marca = m[1].replace(/-/g, ' ').trim();
    const nombre = m[2].replace(/-/g, ' ').trim();
    return { marca, nombre, ruta: normalizarRuta(`${marca}/${nombre}`), url: `${u.origin}${u.pathname}` };
}

module.exports = { slug, rutaPorDefecto, normalizarRuta, desdeFragrantica };
