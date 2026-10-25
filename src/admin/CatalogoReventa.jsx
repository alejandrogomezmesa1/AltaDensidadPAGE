// Catálogo para revendedores: PDF con los perfumes 1.1 en tarjetas (foto, marca, nombre, notas y
// precio con la ganancia del revendedor), separados por sexo y con la marca del revendedor: logo,
// redes sociales con enlace, colores por sección, portada con índice navegable y tarjetas que
// abren WhatsApp con el perfume ya escrito. Al final, los kits que se escojan uno a uno.
// El precio de venta es el de la tienda más la ganancia del revendedor (así el de la tienda se ve
// bajo); la calculadora muestra además lo que le cuesta como mayorista y lo que gana de verdad.
// Mismo diseño y marca de agua que la lista de precios mayoristas (./pdf/diseno.js).
// La configuración se recuerda en este navegador; jsPDF se carga solo al generar.
import { useEffect, useMemo, useState } from 'react';
import { ModalAdmin } from './comunes';
import { LOGO } from '../lib/producto';
import { apiJson } from '../lib/api';
import { AN, AL, COLOR, crearDocumento, nuevaPagina, fuente, espaciado, rgb, cargarFotos, fotoContenida } from './pdf/diseno';

const CLAVE = 'ad_catalogo_reventa';
const CLAVE_LOGO = 'ad_catalogo_reventa_logo';
const BASE = {
  perfumeria: '', eslogan: '', nota: 'Precios sujetos a cambio sin previo aviso.',
  whatsapp: '', instagram: '', tiktok: '', facebook: '', web: '',
  ganancia: 30, redondeo: 'mil', mostrarPrecios: true,
  disponibilidad: 'existencias', categoria: 'todas',
  generos: ['Masculino', 'Femenino', 'Unisex'], notas: true, columnas: 3, orden: 'marca',
  portada: true, enlaceTarjeta: 'whatsapp', kits: [],
  // Paleta de la marca (24-10-2026): oro, tinta, vino y gris cálido
  colorMarca: '#9A7B3F',
  colores: { Masculino: '#0B0B0C', Femenino: '#5A1220', Unisex: '#6B675F', Kits: '#9A7B3F' },
  version: 2
};
const SECCIONES = [['Masculino', 'Para él'], ['Femenino', 'Para ella'], ['Unisex', 'Unisex']];
const REDONDEOS = [['ninguno', 'Sin redondear'], ['mil', 'Al millar (hacia arriba)'], ['cincomil', 'A 5.000 (hacia arriba)']];

// Redes: [clave, etiqueta, ejemplo, glifo de Font Awesome, familia, ícono del panel, enlace, texto visible]
const limpiarUsuario = (v) => String(v || '').trim().replace(/^https?:\/\/\S*?\//, '').replace(/^@/, '').replace(/\/$/, '');
const soloDigitos = (v) => String(v || '').replace(/\D/g, '');
const numeroWa = (v) => { const d = soloDigitos(v); return d.length === 10 ? `57${d}` : d; };
const urlWeb = (v) => (/^https?:\/\//i.test(String(v).trim()) ? String(v).trim() : `https://${String(v).trim()}`);
const REDES = [
  ['whatsapp', 'WhatsApp', '300 000 0000', '', 'brands', 'fab fa-whatsapp', (v) => `https://wa.me/${numeroWa(v)}`, (v) => String(v).trim()],
  ['instagram', 'Instagram', '@miperfumeria', '', 'brands', 'fab fa-instagram', (v) => `https://instagram.com/${limpiarUsuario(v)}`, (v) => `@${limpiarUsuario(v)}`],
  ['tiktok', 'TikTok', '@miperfumeria', '', 'brands', 'fab fa-tiktok', (v) => `https://www.tiktok.com/@${limpiarUsuario(v)}`, (v) => `@${limpiarUsuario(v)}`],
  ['facebook', 'Facebook', 'miperfumeria', '', 'brands', 'fab fa-facebook-f', (v) => `https://facebook.com/${limpiarUsuario(v)}`, (v) => limpiarUsuario(v)],
  ['web', 'Página web', 'miperfumeria.com', '', 'solid', 'fas fa-globe', urlWeb, (v) => String(v).trim().replace(/^https?:\/\//i, '').replace(/\/$/, '')]
];

const leer = () => {
  try {
    const { ocultos, contacto, ...c } = JSON.parse(localStorage.getItem(CLAVE) || 'null') || {};
    void ocultos; void contacto;
    // Configuraciones guardadas con los colores anteriores al diseño común pasan a la paleta de la marca
    if (c.version !== BASE.version) { delete c.colores; delete c.colorMarca; }
    return { ...BASE, ...c, colores: { ...BASE.colores, ...(c.colores || {}) }, version: BASE.version };
  } catch { return BASE; }
};
const leerLogo = () => { try { return localStorage.getItem(CLAVE_LOGO) || null; } catch { return null; } };
const pesos = (v) => `$${Math.round(v).toLocaleString('es-CO')}`;

export function precioReventa(base, cfg) {
  const bruto = base * (1 + (Number(cfg.ganancia) || 0) / 100);
  if (cfg.redondeo === 'mil') return Math.ceil(bruto / 1000) * 1000;
  if (cfg.redondeo === 'cincomil') return Math.ceil(bruto / 5000) * 5000;
  return Math.round(bruto);
}

const tieneFicha = (p) => {
  const n = p.notes || {};
  return !!p.brand && ['top', 'heart', 'base'].every((k) => (n[k] || []).length > 0);
};

// Perfumes 1.1 que entran al catálogo con la configuración dada
function seleccionar(productos, cfg) {
  const marca = (p) => (p.brand ? p.brand.name : '');
  const comparar = {
    marca: (a, b) => marca(a).localeCompare(marca(b), 'es') || a.name.localeCompare(b.name, 'es'),
    nombre: (a, b) => a.name.localeCompare(b.name, 'es'),
    precio: (a, b) => Number(a.price) - Number(b.price)
  }[cfg.orden];
  return productos
    .filter((p) => !p.soloPreparado && !p.priceReview && Number(p.price) > 0)
    // Reglas: solo productos de la tienda (lo que existe solo en DATA nunca llega aquí), visibles y
    // con ficha técnica: marca y pirámide completa (salida, corazón y fondo)
    .filter((p) => !!p.activo)
    .filter(tieneFicha)
    .filter((p) => cfg.disponibilidad === 'todos' || !p.agotado)
    .filter((p) => cfg.categoria === 'todas' || p.category === cfg.categoria)
    .filter((p) => cfg.generos.includes(p.gender))
    .sort(comparar);
}

// Kits que se pueden ofrecer: visibles en la tienda, con precio y fuera de revisión
const kitElegible = (k) => !!Number(k.activo) && Number(k.precio) > 0 && !Number(k.precio_revision);
const kitAgotado = (k) => !!Number(k.agotado);
function seleccionarKits(kits, cfg) {
  return kits
    .filter((k) => kitElegible(k) && cfg.kits.includes(k.id))
    .filter((k) => cfg.disponibilidad === 'todos' || !kitAgotado(k))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
}

// Logo del revendedor: se reduce a PNG de 600 px como máximo (conserva la transparencia)
function prepararLogo(archivo) {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onerror = () => reject(new Error('No se pudo leer el archivo'));
    lector.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Formato no soportado: usa PNG, JPG o WEBP'));
      img.onload = () => {
        const r = Math.min(1, 600 / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * r); c.height = Math.round(img.height * r);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/png'));
      };
      img.src = lector.result;
    };
    lector.readAsDataURL(archivo);
  });
}
const medidas = (url) => new Promise((resolve) => {
  const img = new Image();
  img.onload = () => resolve({ ancho: img.width, alto: img.height });
  img.onerror = () => resolve(null);
  img.src = url;
});

// Íconos de redes: círculo del color dado con el glifo de Font Awesome en blanco
async function icono(glifo, familia, color) {
  const fuente = familia === 'brands' ? '400 64px "Font Awesome 6 Brands"' : '900 64px "Font Awesome 6 Free"';
  // Font Awesome viene de un CDN: si no carga en 2 s, queda solo el círculo (antes se quedaba esperando)
  try { await Promise.race([document.fonts.load(fuente, glifo), new Promise((r) => setTimeout(r, 2000))]); } catch { /* sin la fuente queda solo el círculo */ }
  const c = document.createElement('canvas');
  c.width = 128; c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = color; ctx.beginPath(); ctx.arc(64, 64, 64, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.font = fuente; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(glifo, 64, 67);
  return c.toDataURL('image/png');
}

const capital = (t) => String(t || '').charAt(0).toUpperCase() + String(t || '').slice(1);
function textoNotas(p) {
  const n = p.notes || {};
  return [['Salida', n.top], ['Corazón', n.heart], ['Fondo', n.base]]
    .filter(([, l]) => l && l.length).map(([t, l]) => `${t}: ${l.map(capital).join(', ')}`).join('  ·  ');
}

// ── PDF ──
async function generarPdf(lista, kits, cfg, logoCliente, alAvanzar) {
  const d = await crearDocumento();
  const { doc } = d;
  const respaldo = await fotoContenida(LOGO);
  const fotos = await cargarFotos([...lista.map((p) => [`p${p.id}`, p.image]), ...kits.map((k) => [`k${k.id}`, k.imagen])], alAvanzar, respaldo);
  const redes = REDES.filter(([k]) => String(cfg[k] || '').trim())
    .map(([k, , , glifo, familia, , enlace, texto]) => ({ k, glifo, familia, url: enlace(cfg[k]), texto: texto(cfg[k]) }));
  for (const r of redes) r.img = await icono(r.glifo, r.familia, cfg.colorMarca);
  const logoMed = logoCliente ? await medidas(logoCliente) : null;

  const M = 12; const G = 5;
  const MARCA = rgb(cfg.colorMarca);
  const cols = Number(cfg.columnas) || 3;
  const W = (AN - 2 * M - (cols - 1) * G) / cols;
  const H = 76;
  const foto = cols === 3 ? 40 : 46;
  const nombre = cfg.perfumeria.trim() || 'Catálogo de fragancias';
  const fecha = new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
  const wa = soloDigitos(cfg.whatsapp) ? numeroWa(cfg.whatsapp) : '';
  // que: «el perfume X de Y» o «el kit X»
  const enlaceDe = (que, base) => {
    if (cfg.enlaceTarjeta === 'whatsapp' && wa) {
      const precio = cfg.mostrarPrecios ? ` (${pesos(precioReventa(base, cfg))})` : '';
      return `https://wa.me/${wa}?text=${encodeURIComponent(`¡Hola! Me interesa ${que}${precio}. ¿Está disponible?`)}`;
    }
    if (cfg.enlaceTarjeta === 'web' && cfg.web.trim()) return urlWeb(cfg.web);
    return null;
  };
  // Logo encajado en una caja, sin deformar; devuelve el ancho usado
  const dibujarLogo = (x, y, altoMax, anchoMax, centrado = false) => {
    if (!logoCliente || !logoMed) return 0;
    let h = altoMax; let w = (logoMed.ancho / logoMed.alto) * h;
    if (w > anchoMax) { w = anchoMax; h = (logoMed.alto / logoMed.ancho) * w; }
    doc.addImage(logoCliente, 'PNG', centrado ? x - w / 2 : x, y + (altoMax - h) / 2, w, h);
    return w;
  };
  // Fila de redes: con texto (ícono + usuario) en la portada, solo íconos en el pie
  const filaRedes = (x, y, tam, centrado, conTexto) => {
    fuente(doc, 'Jost', 9, COLOR.gris);
    const sep = conTexto ? 7 : 2.5;
    const anchos = redes.map((r) => tam + (conTexto ? 2 + doc.getTextWidth(r.texto) : 0));
    const total = anchos.reduce((s, v) => s + v, 0) + (redes.length - 1) * sep;
    let cx = centrado ? x - total / 2 : x;
    redes.forEach((r, i) => {
      doc.addImage(r.img, 'PNG', cx, y, tam, tam);
      if (conTexto) doc.text(r.texto, cx + tam + 2, y + tam * 0.7);
      doc.link(cx, y, anchos[i], tam, { url: r.url });
      cx += anchos[i] + sep;
    });
  };

  // Cabecera y pie de cada página de productos
  const cabecera = () => {
    const anchoLogo = dibujarLogo(M, M - 1, 11, 34);
    fuente(doc, 'CG', 17);
    doc.text(nombre, M + (anchoLogo ? anchoLogo + 4 : 0), M + 7);
    fuente(doc, 'Jost', 7.4, COLOR.gris);
    espaciado(doc, `CATÁLOGO · ${fecha.toUpperCase()}`, AN - M, M + 6.5, 0.5, 'right');
    doc.setDrawColor(...COLOR.tinta); doc.setLineWidth(0.35); doc.line(M, M + 11, AN - M, M + 11);
    doc.setDrawColor(...COLOR.filete); doc.setLineWidth(0.15); doc.line(M, AL - 13, AN - M, AL - 13);
    if (redes.length) filaRedes(M, AL - 10.5, 4.5, false, false);
    fuente(doc, 'Jost-Light', 7, COLOR.gris);
    if (cfg.nota.trim()) doc.text(cfg.nota.trim(), AN / 2, AL - 7.5, { align: 'center', maxWidth: 100 });
    doc.text(`${doc.getNumberOfPages()}`, AN - M, AL - 7.5, { align: 'right' });
    if (cfg.portada) {
      doc.setTextColor(...MARCA);
      doc.text('Índice', AN - M - 7, AL - 7.5, { align: 'right' });
      doc.link(AN - M - 18, AL - 10.5, 11, 4.5, { pageNumber: 1 });
    }
    return M + 18;
  };
  const cuantos = (n, kit) => (kit ? `${n} kit${n === 1 ? '' : 's'}` : `${n} fragancia${n === 1 ? '' : 's'}`);
  // Título de sección: Cormorant con un filete del color de la sección
  const banda = (y, titulo, n, color, kit) => {
    fuente(doc, 'CG', 20); doc.text(titulo, M, y + 7);
    fuente(doc, 'Jost-Light', 7.6, COLOR.gris); doc.text(cuantos(n, kit), AN - M, y + 7, { align: 'right' });
    doc.setFillColor(...rgb(color)); doc.rect(M, y + 10, AN - 2 * M, 0.6, 'F');
    return y + 15;
  };
  // t: { clave, eyebrow, nombre, detalle, base, url } — sirve igual para perfumes y kits
  const tarjeta = (t, x, y, color) => {
    const c = rgb(color);
    const { url } = t;
    doc.setFillColor(...COLOR.blanco); doc.setDrawColor(...COLOR.filete); doc.setLineWidth(0.2); doc.rect(x, y, W, H, 'FD');
    doc.setFillColor(...c); doc.rect(x, y, W, 0.9, 'F');
    const img = fotos.get(t.clave);
    if (img) doc.addImage(img, 'JPEG', x + (W - foto) / 2, y + 3.5, foto, foto);
    let ty = y + foto + 8.5;
    fuente(doc, 'Jost-Medium', 6.2, c);
    espaciado(doc, t.eyebrow.toUpperCase(), x + W / 2, ty, 0.5, 'center');
    ty += 4.6;
    fuente(doc, 'CG', 11.5);
    const lineasNombre = doc.splitTextToSize(t.nombre, W - 6).slice(0, 2);
    doc.text(lineasNombre, x + W / 2, ty, { align: 'center', lineHeightFactor: 1.05 });
    ty += lineasNombre.length * 4.2;
    if (t.detalle) {
      fuente(doc, 'Jost-Light', 6.1, COLOR.gris);
      let lineas = doc.splitTextToSize(t.detalle, W - 6);
      // Cuantas líneas quepan sobre el precio (un nombre de 2 líneas deja menos espacio)
      const tope = y + H - (url ? 7.5 : 4.5) - (cfg.mostrarPrecios ? 5 : 0);
      const max = Math.max(1, Math.min(cols === 3 ? (url && cfg.mostrarPrecios ? 2 : 3) : 4, Math.floor((tope - ty) / 2.75)));
      if (lineas.length > max) { lineas = lineas.slice(0, max); lineas[max - 1] = lineas[max - 1].replace(/\s*\S*$/, '…'); }
      doc.text(lineas, x + W / 2, ty + 0.5, { align: 'center', lineHeightFactor: 1.25 });
    }
    if (cfg.mostrarPrecios) {
      fuente(doc, 'Jost-Medium', 12);
      doc.text(pesos(precioReventa(t.base, cfg)), x + W / 2, y + H - (url ? 7.5 : 4.5), { align: 'center' });
    }
    if (url) {
      fuente(doc, 'Jost-Medium', 5.8, c);
      espaciado(doc, cfg.enlaceTarjeta === 'whatsapp' ? 'PEDIR POR WHATSAPP  >' : 'VER MÁS  >', x + W / 2, y + H - 3, 0.3, 'center');
      doc.link(x, y, W, H, { url });
    }
  };
  const tarjetaPerfume = (p) => ({
    clave: `p${p.id}`, eyebrow: p.brand ? p.brand.name : '', nombre: p.name,
    detalle: cfg.notas ? textoNotas(p) : '', base: Number(p.price),
    url: enlaceDe(`el perfume ${p.name}${p.brand ? ` de ${p.brand.name}` : ''}`, Number(p.price))
  });
  const tarjetaKit = (k) => ({
    clave: `k${k.id}`, eyebrow: 'Kit', nombre: k.nombre,
    detalle: (k.beneficios && k.beneficios.length ? k.beneficios.join('  ·  ') : String(k.descripcion || '').trim()),
    base: Number(k.precio),
    url: enlaceDe(`el kit ${k.nombre}`, Number(k.precio))
  });

  // jsPDF empieza con una página: con portada esa es la portada (se dibuja al final, cuando ya se
  // sabe en qué página empieza cada sección); sin portada la usa la primera sección
  const inicios = [];
  const secciones = [
    ...SECCIONES.map(([genero, titulo]) => ({
      titulo, color: cfg.colores[genero], kit: false,
      tarjetas: lista.filter((p) => p.gender === genero).map(tarjetaPerfume)
    })),
    { titulo: 'Kits', color: cfg.colores.Kits, kit: true, tarjetas: kits.map(tarjetaKit) }
  ];
  for (const { titulo, color, kit, tarjetas } of secciones) {
    if (!tarjetas.length) continue;
    if (inicios.length || cfg.portada) nuevaPagina(d);
    inicios.push({ titulo, n: tarjetas.length, color, kit, pagina: doc.getNumberOfPages() });
    let y = banda(cabecera(), titulo, tarjetas.length, color, kit);
    tarjetas.forEach((t, i) => {
      const col = i % cols;
      if (i > 0 && col === 0) y += H + G;
      if (y + H > AL - 15) { nuevaPagina(d); y = cabecera(); }
      tarjeta(t, M + col * (W + G), y, color);
    });
  }
  if (cfg.portada) {
    doc.setPage(1);
    doc.setFillColor(...MARCA); doc.rect(0, 0, AN, 2.5, 'F'); doc.rect(0, AL - 2.5, AN, 2.5, 'F');
    let y = 40;
    if (logoCliente) { dibujarLogo(AN / 2, y, 50, 120, true); y += 64; } else y += 24;
    fuente(doc, 'CG', 34);
    doc.text(nombre, AN / 2, y, { align: 'center', maxWidth: AN - 40 }); y += 10;
    if (cfg.eslogan.trim()) {
      fuente(doc, 'CG-Italic', 15, COLOR.gris);
      doc.text(cfg.eslogan.trim(), AN / 2, y, { align: 'center', maxWidth: AN - 50 }); y += 8;
    }
    doc.setDrawColor(...MARCA); doc.setLineWidth(0.4); doc.line(AN / 2 - 18, y, AN / 2 + 18, y); y += 9;
    fuente(doc, 'Jost', 8.6, MARCA);
    espaciado(doc, `CATÁLOGO DE FRAGANCIAS · ${fecha.toUpperCase()}`, AN / 2, y, 1, 'center'); y += 18;
    // Índice: cada sección lleva a su página
    fuente(doc, 'Jost-Medium', 7.4, COLOR.gris); espaciado(doc, 'CONTENIDO', AN / 2, y, 1.5, 'center'); y += 5;
    inicios.forEach((s) => {
      const x = AN / 2 - 52;
      doc.setDrawColor(...COLOR.filete); doc.setLineWidth(0.2); doc.line(x, y + 12, x + 104, y + 12);
      doc.setFillColor(...rgb(s.color)); doc.rect(x, y + 3.2, 0.8, 6.6, 'F');
      fuente(doc, 'CG', 15); doc.text(s.titulo, x + 4, y + 8.6);
      fuente(doc, 'Jost-Light', 8, COLOR.gris);
      doc.text(`${cuantos(s.n, s.kit)}  ·  pág. ${s.pagina}  >`, x + 104, y + 8.6, { align: 'right' });
      doc.link(x, y, 104, 12, { pageNumber: s.pagina });
      y += 14;
    });
    if (redes.length) filaRedes(AN / 2, AL - 36, 7, true, true);
    if (wa && cfg.enlaceTarjeta === 'whatsapp') {
      fuente(doc, 'Jost-Light', 8.4, COLOR.gris);
      doc.text(`Toca cualquier ${kits.length ? 'perfume o kit' : 'perfume'} para pedirlo por WhatsApp.`, AN / 2, AL - 20, { align: 'center' });
    }
  }
  const archivo = `Catalogo ${nombre}`.replace(/[\\/:*?"<>|]+/g, '').trim();
  return { paginas: doc.getNumberOfPages(), url: URL.createObjectURL(doc.output('blob')), nombre: `${archivo}.pdf` };
}

export default function CatalogoReventa({ abierto, onCerrar, productos, precios, alerta, onListo }) {
  const [cfg, setCfg] = useState(leer);
  const [logo, setLogo] = useState(leerLogo);
  const [progreso, setProgreso] = useState(null);
  const [listo, setListo] = useState(null);
  useEffect(() => { try { localStorage.setItem(CLAVE, JSON.stringify(cfg)); } catch { /* sin almacenamiento */ } }, [cfg]);
  useEffect(() => { try { if (logo) localStorage.setItem(CLAVE_LOGO, logo); else localStorage.removeItem(CLAVE_LOGO); } catch { /* sin espacio: queda solo en esta sesión */ } }, [logo]);
  const fijar = (k, v) => setCfg((c) => ({ ...c, [k]: v }));
  const fijarColor = (g, v) => setCfg((c) => ({ ...c, colores: { ...c.colores, [g]: v } }));

  const lista = useMemo(() => seleccionar(productos, cfg), [productos, cfg]);
  // Kits: se cargan al abrir; el usuario escoge cuáles entran (por defecto ninguno)
  const [kitsTienda, setKitsTienda] = useState(null);
  useEffect(() => {
    if (!abierto) return undefined;
    let vivo = true;
    apiJson('kits')
      .then((r) => { if (vivo) setKitsTienda(r.data || []); })
      .catch((e) => { if (vivo) { setKitsTienda([]); alerta('No se pudieron cargar los kits: ' + e.message, 'error'); } });
    return () => { vivo = false; };
  }, [abierto, alerta]);
  const kitsOpciones = useMemo(() => (kitsTienda || []).filter(kitElegible).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')), [kitsTienda]);
  const kitsLista = useMemo(() => seleccionarKits(kitsTienda || [], cfg), [kitsTienda, cfg]);
  const kitActivo = (id) => cfg.kits.includes(id);
  const alternarKit = (id) => fijar('kits', kitActivo(id) ? cfg.kits.filter((x) => x !== id) : [...cfg.kits, id]);
  const porSexo = SECCIONES.map(([g, t]) => [t, lista.filter((p) => p.gender === g).length]).filter(([, n]) => n);
  // Lo que le cuesta cada perfume al mayorista (DATA); sin ese dato se compara con el precio de la tienda
  const costoMayorista = (p) => precios?.productos?.[p.id]?.mayorista || Number(p.price);
  const resumen = useMemo(() => {
    if (!lista.length) return null;
    const orden = [...lista].sort((a, b) => Number(a.price) - Number(b.price));
    const ejemplos = [...new Map([orden[0], orden[Math.floor(orden.length / 2)], orden[orden.length - 1]].map((p) => [Number(p.price), p])).values()];
    const prom = (f) => lista.reduce((s, p) => s + f(p), 0) / lista.length;
    return {
      ejemplos,
      promBase: prom((p) => Number(p.price)),
      promVenta: prom((p) => precioReventa(Number(p.price), cfg)),
      promCosto: prom(costoMayorista)
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lista, cfg, precios]);

  // Un PDF ya generado solo se ofrece mientras la configuración sea la misma con la que se hizo
  const firma = useMemo(() => JSON.stringify([cfg, lista.map((p) => [p.id, p.price]), kitsLista.map((k) => [k.id, k.precio]), logo ? logo.length : 0]), [cfg, lista, kitsLista, logo]);
  const vigente = listo && listo.firma === firma ? listo : null;
  useEffect(() => () => { if (listo) URL.revokeObjectURL(listo.url); }, [listo]);

  const subirLogo = async (e) => {
    const archivo = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!archivo) return;
    try { setLogo(await prepararLogo(archivo)); } catch (err) { alerta(err.message, 'error'); }
  };
  const descargar = (pdf) => {
    const a = document.createElement('a');
    a.href = pdf.url; a.download = pdf.nombre; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); a.remove();
  };
  const generar = async () => {
    if (!lista.length && !kitsLista.length) { alerta('No hay perfumes ni kits que cumplan esta configuración.', 'error'); return; }
    if (cfg.enlaceTarjeta === 'whatsapp' && !soloDigitos(cfg.whatsapp)) { alerta('Para que las tarjetas abran WhatsApp escribe el número de WhatsApp, o elige otra acción al tocar una tarjeta.', 'error'); return; }
    if (cfg.enlaceTarjeta === 'web' && !cfg.web.trim()) { alerta('Para que las tarjetas abran la página web escribe la dirección, o elige otra acción al tocar una tarjeta.', 'error'); return; }
    setListo(null);
    setProgreso({ hechas: 0, total: lista.length + kitsLista.length });
    try {
      const pdf = await generarPdf(lista, kitsLista, cfg, logo, (hechas, total) => setProgreso({ hechas, total }));
      setListo({ ...pdf, firma });
      descargar(pdf);
      onListo?.(pdf);
      const kitsTxt = kitsLista.length ? ` y ${kitsLista.length} kit${kitsLista.length === 1 ? '' : 's'}` : '';
      alerta(`Catálogo listo: ${lista.length} perfumes${kitsTxt} en ${pdf.paginas} páginas. Si no se descargó solo, usa «Descargar PDF».`, 'success');
    } catch (e) {
      console.error('Catálogo revendedor:', e);
      alerta('No se pudo generar el PDF: ' + (e && e.message ? e.message : String(e)), 'error');
    } finally {
      setProgreso(null);
    }
  };

  const generoActivo = (g) => cfg.generos.includes(g);
  return (
    <ModalAdmin abierto={abierto} titulo="Catálogo personalizado" onCerrar={progreso ? () => {} : onCerrar}>
      <div className="modal-form reventa">
        <div className="form-grid">
          <div className="form-seccion"><h4>Marca del revendedor</h4><small>Lo que dejes vacío no aparece en el PDF</small></div>
          <div className="form-group full">
            <label htmlFor="revPerfumeria">Nombre de la perfumería</label>
            <input id="revPerfumeria" type="text" maxLength={60} placeholder="Ej: Perfumería Aroma" value={cfg.perfumeria} onChange={(e) => fijar('perfumeria', e.target.value)} />
          </div>
          <div className="form-group full">
            <label>Logo</label>
            <div className="reventa-logo">
              {logo ? <img src={logo} alt="Logo del revendedor" /> : <span className="reventa-logo-vacio">Sin logo</span>}
              <label className="btn-secondary">
                <i className="fas fa-upload" /> {logo ? 'Cambiar' : 'Subir logo'}
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={subirLogo} hidden />
              </label>
              {logo && <button type="button" className="btn-secondary" onClick={() => setLogo(null)}><i className="fas fa-times" /> Quitar</button>}
            </div>
            <small className="hint-data">Un PNG con fondo transparente se ve mejor. Va en la portada y en la cabecera de cada página.</small>
          </div>
          <div className="form-group full">
            <label htmlFor="revEslogan">Eslogan <small>(portada)</small></label>
            <input id="revEslogan" type="text" maxLength={80} placeholder="Ej: Fragancias que dejan huella" value={cfg.eslogan} onChange={(e) => fijar('eslogan', e.target.value)} />
          </div>
          {REDES.map(([k, etiqueta, ejemplo, , , clase]) => (
            <div className="form-group" key={k}>
              <label htmlFor={`rev-${k}`}><i className={clase} /> {etiqueta}</label>
              <input id={`rev-${k}`} type="text" placeholder={ejemplo} value={cfg[k]} onChange={(e) => fijar(k, e.target.value)} />
            </div>
          ))}
          <div className="form-group full">
            <label htmlFor="revNota">Nota al pie</label>
            <input id="revNota" type="text" maxLength={90} placeholder="Ej: Precios sujetos a cambio" value={cfg.nota} onChange={(e) => fijar('nota', e.target.value)} />
          </div>

          <div className="form-seccion"><h4>Diseño</h4><small>Colores de la portada y de cada sección</small></div>
          <div className="form-group full">
            <div className="reventa-colores">
              <label><input type="color" value={cfg.colorMarca} onChange={(e) => fijar('colorMarca', e.target.value)} /> Marca</label>
              {[...SECCIONES, ['Kits', 'Kits']].map(([g, t]) => (
                <label key={g}><input type="color" value={cfg.colores[g]} onChange={(e) => fijarColor(g, e.target.value)} /> {t}</label>
              ))}
              <button type="button" className="link-limpiar" onClick={() => setCfg((c) => ({ ...c, colorMarca: BASE.colorMarca, colores: BASE.colores }))}>Restaurar colores</button>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="revEnlace">Al tocar una tarjeta</label>
            <select id="revEnlace" value={cfg.enlaceTarjeta} onChange={(e) => fijar('enlaceTarjeta', e.target.value)}>
              <option value="whatsapp">Abrir WhatsApp con el perfume escrito</option>
              <option value="web">Abrir la página web</option>
              <option value="ninguno">No hacer nada</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="revCols">Tarjetas por fila</label>
            <select id="revCols" value={cfg.columnas} onChange={(e) => fijar('columnas', Number(e.target.value))}>
              <option value={3}>3 (9 por página)</option>
              <option value={2}>2 (más grandes, 6 por página)</option>
            </select>
          </div>
          <div className="form-group full">
            <label className="check-item"><input type="checkbox" checked={cfg.portada} onChange={(e) => fijar('portada', e.target.checked)} /> Portada con logo, redes e índice (cada sección es un enlace)</label>
            <label className="check-item"><input type="checkbox" checked={cfg.notas} onChange={(e) => fijar('notas', e.target.checked)} /> Mostrar las notas (salida, corazón y fondo)</label>
            <label className="check-item"><input type="checkbox" checked={cfg.mostrarPrecios} onChange={(e) => fijar('mostrarPrecios', e.target.checked)} /> Mostrar precios</label>
          </div>

          <div className="form-seccion"><h4>Precio de venta en el catálogo</h4><small>Se suma sobre el precio de nuestra tienda: así el nuestro se ve más bajo. La tabla muestra lo que le cuesta al mayorista y lo que gana.</small></div>
          <div className="form-group full">
            <label htmlFor="revGanancia">Ganancia (aumento sobre el precio): <b>{cfg.ganancia}%</b></label>
            <div className="reventa-ganancia">
              <input id="revGanancia" type="range" min="0" max="150" step="1" value={cfg.ganancia} onChange={(e) => fijar('ganancia', Number(e.target.value))} />
              <input type="number" min="0" max="500" aria-label="Porcentaje de ganancia" value={cfg.ganancia} onChange={(e) => fijar('ganancia', Math.max(0, Number(e.target.value) || 0))} />
              <span>%</span>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="revRedondeo">Redondeo</label>
            <select id="revRedondeo" value={cfg.redondeo} onChange={(e) => fijar('redondeo', e.target.value)}>
              {REDONDEOS.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
            </select>
          </div>
          {resumen && (
            <div className="form-group full reventa-calculo" aria-live="polite">
              <table>
                <thead><tr><th>Precio tienda</th><th>Le cuesta (mayorista)</th><th>Vende en el catálogo</th><th>Gana</th></tr></thead>
                <tbody>
                  {resumen.ejemplos.map((p) => {
                    const b = Number(p.price);
                    const v = precioReventa(b, cfg);
                    const c = costoMayorista(p);
                    return <tr key={b}><td>{pesos(b)}</td><td>{pesos(c)}</td><td><b>{pesos(v)}</b></td><td>{pesos(v - c)} ({v > 0 ? Math.round(((v - c) / v) * 100) : 0} %)</td></tr>;
                  })}
                </tbody>
              </table>
              <small>
                En promedio el cliente final paga <b>{pesos(resumen.promVenta)}</b> en el catálogo, frente a {pesos(resumen.promBase)} en nuestra tienda
                ({Math.round(((resumen.promVenta - resumen.promBase) / resumen.promBase) * 100)} % más). Al mayorista le cuesta {pesos(resumen.promCosto)}:
                gana {pesos(resumen.promVenta - resumen.promCosto)} por perfume.
              </small>
            </div>
          )}

          <div className="form-seccion"><h4>Qué perfumes incluir</h4><small>Solo perfumes 1.1 de la tienda, visibles, con ficha técnica (marca y notas de salida, corazón y fondo) y con precio (no entran los ocultos, los que solo están en DATA, los «solo preparado» ni los que están en revisión)</small></div>
          <div className="form-group">
            <label htmlFor="revDisp">Disponibilidad</label>
            <select id="revDisp" value={cfg.disponibilidad} onChange={(e) => fijar('disponibilidad', e.target.value)}>
              <option value="existencias">Solo con existencias</option>
              <option value="todos">Todos, aunque estén agotados</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="revCat">Categoría</label>
            <select id="revCat" value={cfg.categoria} onChange={(e) => fijar('categoria', e.target.value)}>
              <option value="todas">Árabes y diseñador</option>
              <option value="Arabe">Solo árabes</option>
              <option value="Diseñador">Solo diseñador</option>
            </select>
          </div>
          <div className="form-group full">
            <label>Secciones</label>
            <div className="familias-opciones">
              {SECCIONES.map(([g, t]) => (
                <button type="button" key={g} className={`familia-opcion ${generoActivo(g) ? 'on' : ''}`} aria-pressed={generoActivo(g)}
                  style={generoActivo(g) ? { background: cfg.colores[g], borderColor: cfg.colores[g], color: '#fff' } : undefined}
                  onClick={() => fijar('generos', generoActivo(g) ? cfg.generos.filter((x) => x !== g) : [...cfg.generos, g])}>{t}</button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="revOrden">Orden dentro de cada sección</label>
            <select id="revOrden" value={cfg.orden} onChange={(e) => fijar('orden', e.target.value)}>
              <option value="marca">Por marca</option>
              <option value="nombre">Por nombre</option>
              <option value="precio">Por precio</option>
            </select>
          </div>

          <div className="form-seccion">
            <h4>Kits</h4>
            <small>Escoge cuáles van al final del catálogo, en su propia sección. Solo aparecen los kits visibles en la tienda, con precio y fuera de revisión.</small>
          </div>
          <div className="form-group full">
            {kitsTienda === null ? <small className="hint-data"><i className="fas fa-spinner fa-spin" /> Cargando kits…</small>
              : !kitsOpciones.length ? <small className="hint-data">No hay kits disponibles para ofrecer.</small>
                : (
                  <>
                    <div className="reventa-kits-acciones">
                      <button type="button" className="link-limpiar" onClick={() => fijar('kits', kitsOpciones.map((k) => k.id))}>Todos</button>
                      <button type="button" className="link-limpiar" onClick={() => fijar('kits', [])}>Ninguno</button>
                    </div>
                    <div className="reventa-kits">
                      {kitsOpciones.map((k) => {
                        const fuera = kitAgotado(k) && cfg.disponibilidad !== 'todos';
                        return (
                          <label key={k.id} className={`check-item ${fuera ? 'fuera' : ''}`} title={fuera ? 'Agotado: no entra con «Solo con existencias»' : undefined}>
                            <input type="checkbox" checked={kitActivo(k.id)} onChange={() => alternarKit(k.id)} />
                            <span className="reventa-kit-nombre">{k.nombre}{kitAgotado(k) && <em> · agotado</em>}</span>
                            <span className="reventa-kit-precio">{pesos(precioReventa(Number(k.precio), cfg))}</span>
                          </label>
                        );
                      })}
                    </div>
                  </>
                )}
          </div>
        </div>
        <p className="reventa-resumen">
          {lista.length || kitsLista.length
            ? <>Se incluirán <b>{lista.length}</b> perfumes{porSexo.length ? `: ${porSexo.map(([t, n]) => `${t.toLowerCase()} ${n}`).join(' · ')}` : ''}
              {' '}y <b>{kitsLista.length}</b> kit{kitsLista.length === 1 ? '' : 's'}.</>
            : 'Ningún perfume ni kit cumple esta configuración.'}
        </p>
      </div>
      <div className="modal-actions">
        <button type="button" className="btn-secondary" onClick={onCerrar} disabled={!!progreso}>Cerrar</button>
        {vigente && !progreso && (
          <button type="button" className="btn-primary" onClick={() => descargar(vigente)}>
            <i className="fas fa-download" /> Descargar PDF
          </button>
        )}
        <button type="button" className={vigente ? 'btn-secondary' : 'btn-primary'} onClick={generar} disabled={!!progreso || (!lista.length && !kitsLista.length)}>
          {progreso
            ? <><i className="fas fa-spinner fa-spin" /> Preparando fotos {progreso.hechas}/{progreso.total}…</>
            : <><i className="fas fa-file-pdf" /> {vigente ? 'Generar de nuevo' : 'Generar PDF'}</>}
        </button>
      </div>
    </ModalAdmin>
  );
}
