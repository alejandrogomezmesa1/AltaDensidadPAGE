// /sitemap.xml en vivo: páginas principales + un enlace por perfume y por kit activos.
// Si la API no responde, se entregan al menos las páginas principales.
import { perfumes, kits, SITIO, direccionPerfume, direccionKit } from './_catalogo.js';

const PAGINAS = [
  ['/', 'weekly', '1.0'],
  ['/catalogo', 'weekly', '0.9'],
  ['/catalogo?ver=crear', 'monthly', '0.8'],
  ['/catalogo?ver=kits', 'weekly', '0.8'],
  ['/top10', 'weekly', '0.9'],
  ['/nosotros', 'monthly', '0.6']
];

const escapar = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export default async function handler(req, res) {
  const hoy = new Date().toISOString().slice(0, 10);
  const urls = PAGINAS.map(([ruta, frecuencia, prioridad]) => ({ ruta, frecuencia, prioridad }));
  try {
    const [p, k] = await Promise.all([perfumes(), kits()]);
    p.lista.forEach((x) => urls.push({ ruta: direccionPerfume(x), frecuencia: 'weekly', prioridad: '0.7' }));
    k.lista.forEach((x) => urls.push({ ruta: direccionKit(x), frecuencia: 'weekly', prioridad: '0.6' }));
  } catch (err) {
    console.error('[sitemap] sin catálogo:', err.message);
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${escapar(SITIO + u.ruta)}</loc>
    <lastmod>${hoy}</lastmod>
    <changefreq>${u.frecuencia}</changefreq>
    <priority>${u.prioridad}</priority>
  </url>`).join('\n')}
</urlset>
`;
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.end(xml);
}
