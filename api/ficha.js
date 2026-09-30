// Función de Vercel para /perfume/<slug>, /kit/<slug> y las direcciones desconocidas.
// La tienda es una SPA: el HTML es el mismo para todas las rutas y WhatsApp, Facebook o Google
// leen solo ese HTML (no ejecutan la página). Aquí se entrega el index.html con el título, la
// descripción, la foto y el precio del producto, y con el código correcto: 200 si existe,
// 404 si no (la página igual se abre y muestra "no encontrado" con sugerencias).
import { perfumes, kits, imagenAbsoluta, SITIO, buscar, direccionPerfume, direccionKit } from './_catalogo.js';
import { descripcion } from '../src/lib/producto.js';

let plantilla = null;

async function leerPlantilla(origen) {
  if (plantilla && plantilla.expira > Date.now()) return plantilla.html;
  const r = await fetch(`${origen}/`, { headers: { 'x-ad-plantilla': '1' } });
  if (!r.ok) throw new Error(`index.html: ${r.status}`);
  const html = await r.text();
  plantilla = { html, expira: Date.now() + 5 * 60 * 1000 };
  return html;
}

const escapar = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Reemplaza el contenido de una etiqueta <meta>/<link> existente; si no está, la agrega al <head>
function fijar(html, selector, atributo, valor) {
  const patron = new RegExp(`(<${selector}[^>]*\\s${atributo}=")[^"]*(")`, 'i');
  if (patron.test(html)) return html.replace(patron, `$1${escapar(valor)}$2`);
  const etiqueta = selector.startsWith('link') ? `<${selector} ${atributo}="${escapar(valor)}">` : `<${selector} ${atributo}="${escapar(valor)}">`;
  return html.replace('</head>', `    ${etiqueta}\n  </head>`);
}

function conMeta(html, m) {
  let h = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapar(m.titulo)}</title>`);
  h = fijar(h, 'meta name="description"', 'content', m.descripcion);
  h = fijar(h, 'meta name="robots"', 'content', m.indexar ? 'index, follow' : 'noindex, nofollow');
  h = fijar(h, 'link rel="canonical"', 'href', m.url);
  h = fijar(h, 'meta property="og:type"', 'content', m.tipo || 'website');
  h = fijar(h, 'meta property="og:url"', 'content', m.url);
  h = fijar(h, 'meta property="og:title"', 'content', m.titulo);
  h = fijar(h, 'meta property="og:description"', 'content', m.descripcion);
  if (m.imagen) {
    h = fijar(h, 'meta property="og:image"', 'content', m.imagen);
    h = fijar(h, 'meta name="twitter:image"', 'content', m.imagen);
  }
  h = fijar(h, 'meta name="twitter:title"', 'content', m.titulo);
  h = fijar(h, 'meta name="twitter:description"', 'content', m.descripcion);
  if (m.precio) {
    h = fijar(h, 'meta property="product:price:amount"', 'content', String(m.precio));
    h = fijar(h, 'meta property="product:price:currency"', 'content', 'COP');
  }
  return h;
}

const recortar = (t, n = 180) => {
  const s = String(t || '').replace(/\s+/g, ' ').trim();
  return s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s;
};

export default async function handler(req, res) {
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const origen = host ? `${proto}://${host}` : SITIO;
  const { tipo } = req.query || {};
  const ruta = [].concat(req.query.ruta || req.query.slug || []).join('/');

  let html;
  try {
    html = await leerPlantilla(origen);
  } catch (err) {
    console.error('[ficha] sin plantilla:', err.message);
    res.statusCode = 302;
    res.setHeader('Location', '/');
    return res.end();
  }

  let status = 200;
  let meta = null;
  try {
    if (tipo === 'perfume' || tipo === 'kit') {
      const datos = tipo === 'kit' ? await kits() : await perfumes();
      const item = buscar(datos, ruta);
      if (item) {
        const oficial = tipo === 'kit' ? direccionKit(item) : direccionPerfume(item);
        // Enlace viejo o con otro texto: redirección permanente a la dirección oficial
        if (decodeURIComponent(`/${tipo}/${ruta}`).toLowerCase() !== oficial.toLowerCase()) {
          res.statusCode = 301;
          res.setHeader('Location', encodeURI(oficial));
          res.setHeader('Cache-Control', 'public, s-maxage=300');
          return res.end();
        }
        const nombre = tipo === 'kit' ? item.nombre : item.n;
        const precio = tipo === 'kit' ? item.precio : item.p;
        meta = {
          titulo: `${nombre} | Fragancias de Alta Densidad`,
          descripcion: recortar(tipo === 'kit' ? (item.descripcion || `Kit ${nombre} de Alta Densidad.`) : descripcion(item)),
          url: SITIO + oficial,
          imagen: imagenAbsoluta(tipo === 'kit' ? item.imagen : item.img),
          precio: precio > 0 ? Math.round(precio) : null,
          tipo: 'product',
          indexar: true
        };
      } else {
        status = 404;
      }
    } else {
      status = 404;
    }
  } catch (err) {
    // Sin catálogo (API caída) no se afirma que no exista: se entrega la página normal
    console.error('[ficha] sin catálogo:', err.message);
  }

  if (status === 404) {
    meta = { titulo: 'No encontrado | Fragancias de Alta Densidad', descripcion: 'La página que buscas no existe.', url: SITIO + (req.url || '/').split('?')[0], indexar: false };
  }
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', status === 200 ? 'public, s-maxage=300, stale-while-revalidate=86400' : 'public, s-maxage=60');
  res.end(meta ? conMeta(html, meta) : html);
}
