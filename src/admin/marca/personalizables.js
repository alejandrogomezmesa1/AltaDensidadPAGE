// Piezas personalizables de la marca: cada una define sus campos (el formulario del panel) y cómo se
// dibuja a partir de ellos. Se guardan como plantillas (MarcaPlantillas) y se descargan en SVG, PNG y
// PDF a tamaño real. El diseño es el de la pieza del brand book; aquí solo cambian los datos.
import { WA, SITIO } from '../../config';
import { C, FAMILIAS, T, P, ancho, envolver, isotipo, imagotipoHorizontal, icono, qr, destello, esc } from './dibujo';

export const INSTAGRAM = 'fragancias_alta_densidad';
const WA_VISIBLE = '+57 304 647 7694';

const soloDigitos = (t) => String(t || '').replace(/\D/g, '');
// WhatsApp de Colombia: si escriben 10 dígitos, se antepone el 57
const numeroWa = (t) => { const d = soloDigitos(t); return d.length === 10 ? `57${d}` : d; };
const sinArroba = (t) => String(t || '').trim().replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/\/.*$/, '');
const urlLimpia = (t) => { const u = String(t || '').trim(); return !u ? '' : /^https?:\/\//i.test(u) ? u : `https://${u}`; };
const urlVisible = (t) => String(t || '').trim().replace(/^https?:\/\//i, '').replace(/\/$/, '');

// Texto que se achica hasta caber en el ancho (nombres largos de fragancia)
function ajustar(f, texto, size, maxw, track = 0, minimo = size * 0.55) {
  let s = size;
  while (s > minimo && ancho(f, texto, s, track) > maxw) s -= 0.5;
  return s;
}

/** Enlaces que salen de una plantilla de QR */
export function enlaceQr(d) {
  if (d.destino === 'instagram') return `https://instagram.com/${sinArroba(d.instagram) || INSTAGRAM}`;
  if (d.destino === 'web' || d.destino === 'otro') return urlLimpia(d.url) || SITIO;
  const msg = `${String(d.mensaje || '').trim()}${d.referencia ? ` (ref. ${d.referencia})` : ''}`.trim();
  return `https://wa.me/${numeroWa(d.whatsapp) || WA}${msg ? `?text=${encodeURIComponent(msg)}` : ''}`;
}

/** Referencia única para un QR nuevo: QR-XXXX (sin letras que se confundan) */
export function referenciaNueva(existentes = []) {
  const abc = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  for (;;) {
    const r = `QR-${Array.from({ length: 4 }, () => abc[Math.floor(Math.random() * abc.length)]).join('')}`;
    if (!existentes.includes(r)) return r;
  }
}

const FONDOS_ETIQUETA = [['hueso', 'Hueso'], ['blanco', 'Blanco'], ['tinta', 'Tinta (negro)']];
const tonos = (fondo) => (fondo === 'tinta'
  ? { bg: C.tinta, ink: C.humo, mute: C.gris2, acento: C.oro_claro, linea: C.filete2 }
  : { bg: fondo === 'blanco' ? C.blanco : C.hueso, ink: C.tinta, mute: C.gris, acento: C.oro, linea: C.filete });

export const PLANTILLAS = [
  // ───────────────────────────── Firma de correo ─────────────────────────────
  {
    tipo: 'firma', titulo: 'Firma de correo', icono: 'fa-signature', pieza: '10_papeleria/04-firma-de-correo.svg',
    ayuda: 'Una firma por persona. «Copiar para Gmail» la pega con los enlaces activos; también sale en PNG.',
    nombreDe: (d) => [d.nombre, d.apellido].filter(Boolean).join(' ') || 'Firma',
    campos: [
      { clave: 'nombre', etiqueta: 'Nombre', defecto: 'Nombre', max: 40 },
      { clave: 'apellido', etiqueta: 'Apellido', defecto: 'Apellido', max: 40 },
      { clave: 'cargo', etiqueta: 'Cargo', defecto: 'Asesora olfativa', max: 50 },
      { clave: 'whatsapp', etiqueta: 'WhatsApp', defecto: WA_VISIBLE, max: 24, ayuda: 'Con indicativo; el enlace se arma solo.' },
      { clave: 'instagram', etiqueta: 'Instagram', defecto: `@${INSTAGRAM}`, max: 60 },
      { clave: 'web', etiqueta: 'Página web', defecto: urlVisible(SITIO), max: 80 },
      { clave: 'correo', etiqueta: 'Correo (opcional)', defecto: '', max: 80 }
    ],
    dibujar(d, F) {
      const W = 1200;
      const items = [
        ['whatsapp', d.whatsapp], ['instagram', d.instagram ? `@${sinArroba(d.instagram)}` : ''], ['web', urlVisible(d.web)], ['correo', d.correo]
      ].filter(([, t]) => String(t || '').trim());
      // los datos de contacto van en una o dos filas según quepan
      const filas = [[]];
      let x = 40;
      for (const it of items) {
        const w = 40 + ancho(F.J_R, it[1], 22) + 32;
        if (x + w > W - 40 && filas[filas.length - 1].length) { filas.push([]); x = 40; }
        filas[filas.length - 1].push(it);
        x += w;
      }
      const H = 330 + filas.length * 46;
      let s = `<rect width="${W}" height="${H}" fill="#FFFFFF"/>`;
      s += imagotipoHorizontal(F, 40, 90, 70, C.tinta, C.gris).svg;
      s += `<line x1="40" y1="160" x2="1160" y2="160" stroke="${C.oro}" stroke-width="2"/>`;
      s += T(F.CG_R, [d.nombre, d.apellido].filter(Boolean).join(' '), 40, 40, 222, C.tinta);
      s += T(F.J_M, String(d.cargo || '').toUpperCase(), 16, 42, 252, C.oro, { track: 0.3 });
      filas.forEach((fila, k) => {
        let xx = 40;
        const y = 307 + k * 46;
        for (const [ic, t] of fila) {
          s += icono(ic, xx, y - 23, 30, C.oro, 1.4) + T(F.J_R, t, 22, xx + 40, y, C.gris);
          xx += 40 + ancho(F.J_R, t, 22) + 32;
        }
      });
      return { w: W, h: H, svg: s };
    }
  },
  // ───────────────────────────── Etiqueta posterior ─────────────────────────────
  {
    tipo: 'etiqueta_posterior', titulo: 'Etiqueta posterior', icono: 'fa-tag', pieza: '08_empaque/03-etiqueta-posterior.svg', mm: [40, 60], hoja: true,
    ayuda: '40 × 60 mm. Una por fragancia y lote. El texto se achica solo para caber. Validar con el asesor regulatorio (INVIMA).',
    nombreDe: (d) => `${d.nombre || 'Etiqueta'}${d.lote ? ` · ${d.lote}` : ''}`,
    campos: [
      { clave: 'nombre', etiqueta: 'Fragancia', defecto: 'Oriental Leather', max: 40 },
      { clave: 'descriptor', etiqueta: 'Descriptor', defecto: 'Alta concentración', max: 40 },
      { clave: 'uso', etiqueta: 'Modo de uso y precauciones', tipo: 'area', max: 500,
        defecto: 'Modo de uso: aplicar sobre piel limpia en puntos de pulso. Precauciones: producto inflamable; evitar contacto con ojos y mucosas; mantener fuera del alcance de los niños; no exponer al calor ni al sol. Suspender en caso de irritación.' },
      { clave: 'ingredientes', etiqueta: 'Ingredientes (INCI)', tipo: 'area', max: 500, defecto: 'Alcohol denat., parfum (fragrance), aqua.' },
      { clave: 'contenido', etiqueta: 'Contenido', defecto: '100 ml e · 3.38 fl oz', max: 40 },
      { clave: 'lote', etiqueta: 'Lote', defecto: 'AD-2611', max: 20 },
      { clave: 'fabricacion', etiqueta: 'Fabricación (mes/año)', defecto: '11/2026', max: 12 },
      { clave: 'invima', etiqueta: 'NSO INVIMA', defecto: '[número]', max: 40 },
      { clave: 'origen', etiqueta: 'Origen', defecto: 'Hecho en Medellín, Colombia', max: 50 },
      { clave: 'aviso', etiqueta: 'Aviso', defecto: 'Inspirado en una fragancia de referencia; no es el producto original.', max: 120 },
      { clave: 'qr', etiqueta: 'QR a', tipo: 'select', defecto: 'instagram', opciones: [['instagram', 'Instagram'], ['web', 'Página web'], ['ninguno', 'Sin QR']] },
      { clave: 'fondo', etiqueta: 'Fondo', tipo: 'select', defecto: 'hueso', opciones: FONDOS_ETIQUETA },
      { clave: 'copias', etiqueta: 'Copias en la hoja A4', tipo: 'numero', defecto: 1, min: 0, max: 40 }
    ],
    dibujar(d, F) {
      const W = 400;
      const H = 600;
      const t = tonos(d.fondo);
      let s = `<rect width="${W}" height="${H}" fill="${t.bg}"/>` + isotipo(170, 26, 60, t.ink);
      const sn = ajustar(F.CG_M, 'ALTA DENSIDAD', 26, 340, 0.2);
      s += T(F.CG_M, 'ALTA DENSIDAD', sn, 200, 122, t.ink, { track: 0.2, anchor: 'middle' });
      const sub = `${d.nombre || ''} · ${d.descriptor || ''}`.toUpperCase();
      s += T(F.J_M, sub, ajustar(F.J_M, sub, 10, 340, 0.16, 6), 200, 145, t.mute, { track: 0.16, anchor: 'middle' });
      const datos = [d.contenido, [d.lote && `Lote ${d.lote}`, d.fabricacion && `Fab. ${d.fabricacion}`].filter(Boolean).join(' · '),
        d.invima && `NSO INVIMA: ${d.invima}`, d.origen].filter(Boolean);
      const conQr = d.qr !== 'ninguno';
      // el cuerpo se achica hasta que todo quepa sobre el QR
      const cuerpo = [d.uso, d.ingredientes && `Ingredientes: ${d.ingredientes}`].filter(Boolean).join('\n');
      let tam = 12.5;
      let bloque;
      for (; tam >= 7; tam -= 0.5) {
        bloque = P(F.J_R, cuerpo, tam, 40, 182, t.ink, 320, { lh: 1.42 });
        const fin = bloque.y + 6 + datos.length * (tam + 9) + 14 + envolver(F.J_L, d.aviso, tam * 0.84, conQr ? 240 : 320).length * tam * 1.05;
        if (fin <= H - 24) break;
      }
      s += bloque.svg;
      let y = bloque.y + 2;
      s += `<line x1="40" y1="${y}" x2="360" y2="${y}" stroke="${t.linea}"/>`;
      y += tam + 14;
      for (const l of datos) { s += T(F.J_M, l, tam - 0.5, 40, y, t.ink, { track: 0.04 }); y += tam + 9; }
      s += P(F.J_L, d.aviso, tam * 0.84, 40, y + 6, t.mute, conQr ? 240 : 320, { lh: 1.25 }).svg;
      if (conQr) s += qr(d.qr === 'web' ? SITIO : `https://instagram.com/${INSTAGRAM}`, 290, H - 104, 84, t.ink, t.bg);
      return { w: W, h: H, svg: s };
    }
  },
  // ───────────────────────────── Etiqueta de decant ─────────────────────────────
  {
    tipo: 'etiqueta_decant', titulo: 'Etiqueta de decant', icono: 'fa-vial', pieza: '09_unboxing/06-etiqueta-de-muestra.svg', mm: [50, 20], hoja: true,
    ayuda: '50 × 20 mm, para el decant de 10 ml. La línea de color es la de la familia olfativa.',
    nombreDe: (d) => d.nombre || 'Decant',
    campos: [
      { clave: 'nombre', etiqueta: 'Fragancia', defecto: 'Citrus Amber', max: 40 },
      { clave: 'linea', etiqueta: 'Segunda línea', defecto: 'Decant · 10 ml', max: 30 },
      { clave: 'familia', etiqueta: 'Familia olfativa', tipo: 'select', defecto: 'Cítrica', opciones: [['', 'Sin familia'], ...FAMILIAS.map(([f]) => [f, f])] },
      { clave: 'fondo', etiqueta: 'Fondo', tipo: 'select', defecto: 'tinta', opciones: FONDOS_ETIQUETA },
      { clave: 'copias', etiqueta: 'Copias en la hoja A4', tipo: 'numero', defecto: 1, min: 0, max: 60 }
    ],
    dibujar(d, F) {
      const t = tonos(d.fondo);
      const acento = d.fondo === 'tinta' ? C.oro_claro : C.oro;
      const color = (FAMILIAS.find(([f]) => f === d.familia) || [])[1];
      let s = `<rect width="500" height="200" fill="${t.bg}"/><rect x="7" y="7" width="486" height="186" fill="none" stroke="${acento}" stroke-width="1.5"/>`;
      s += isotipo(26, 52, 92, acento);
      s += T(F.CG_LI, d.nombre, ajustar(F.CG_LI, d.nombre, 44, 340), 135, 92, t.ink);
      if (color) s += `<line x1="137" y1="112" x2="217" y2="112" stroke="${color}" stroke-width="4"/>`;
      s += T(F.J_M, String(d.linea || '').toUpperCase(), 15, 137, 148, acento, { track: 0.26 });
      s += T(F.J_M, 'ALTA DENSIDAD', 11, 137, 172, t.mute, { track: 0.3 });
      return { w: 500, h: 200, svg: s };
    }
  },
  // ───────────────────────────── Tarjeta de agradecimiento ─────────────────────────────
  {
    tipo: 'agradecimiento', titulo: 'Tarjeta de agradecimiento', icono: 'fa-envelope-open-text', pieza: '09_unboxing/02-tarjeta-de-agradecimiento.svg', mm: [148, 105],
    ayuda: '148 × 105 mm. Con nombre y mensaje impresos, o deja el espacio para escribirla a mano.',
    nombreDe: (d) => d.saludo || 'Agradecimiento',
    campos: [
      { clave: 'saludo', etiqueta: 'Saludo', defecto: 'Para Laura,', max: 40 },
      { clave: 'mensaje', etiqueta: 'Mensaje', tipo: 'area', defecto: 'que tu fondo permanezca.', max: 140 },
      { clave: 'cierre', etiqueta: 'Línea de cierre', defecto: 'Gracias por elegir Alta Densidad', max: 50 },
      { clave: 'firma', etiqueta: 'Firma (opcional)', defecto: '', max: 40 },
      { clave: 'mano', etiqueta: 'Espacio para escribir a mano', tipo: 'select', defecto: 'no', opciones: [['no', 'No'], ['si', 'Sí']] },
      { clave: 'fondo', etiqueta: 'Fondo', tipo: 'select', defecto: 'hueso', opciones: [['hueso', 'Hueso'], ['tinta', 'Tinta (negro)']] }
    ],
    dibujar(d, F) {
      const W = 1480;
      const H = 1050;
      const t = tonos(d.fondo);
      const oro = d.fondo === 'tinta' ? C.oro_claro : C.oro;
      let s = `<rect width="${W}" height="${H}" fill="${t.bg}"/><rect x="30" y="30" width="1420" height="990" fill="none" stroke="${oro}" stroke-width="3"/>`;
      s += isotipo(690, 100, 100, oro);
      const mano = d.mano === 'si';
      let y = mano ? 330 : 400;
      if (d.saludo) { s += T(F.CG_LI, d.saludo, ajustar(F.CG_LI, d.saludo, 64, 1200), 740, y, t.ink, { anchor: 'middle' }); y += 90; }
      for (const l of envolver(F.CG_LI, d.mensaje, 60, 1200).slice(0, 3)) { s += T(F.CG_LI, l, 60, 740, y, t.ink, { anchor: 'middle' }); y += 80; }
      y += 10;
      s += `<line x1="640" y1="${y}" x2="840" y2="${y}" stroke="${oro}" stroke-width="1.5"/>`;
      s += T(F.J_M, String(d.cierre || '').toUpperCase(), 20, 740, y + 70, t.mute, { track: 0.3, anchor: 'middle' });
      if (d.firma) s += T(F.CG_I, d.firma, 40, 740, y + 140, oro, { anchor: 'middle' });
      if (mano) {
        for (let k = 0; k < 3; k += 1) s += `<line x1="240" y1="${820 + k * 62}" x2="1240" y2="${820 + k * 62}" stroke="${t.linea}" stroke-width="2"/>`;
      }
      return { w: W, h: H, svg: s };
    }
  },
  // ───────────────────────────── QR con marca ─────────────────────────────
  {
    tipo: 'qr', titulo: 'QR de marca', icono: 'fa-qrcode', pieza: '12_digital/04-qr-con-marca.svg',
    ayuda: 'El QR de WhatsApp abre el chat con un mensaje que trae su referencia única: así sabes desde qué QR te escribieron.',
    nombreDe: (d) => `${d.lugar || 'QR'} · ${d.referencia || ''}`.trim(),
    campos: [
      { clave: 'lugar', etiqueta: 'Dónde va (lugar o campaña)', defecto: 'Vitrina de la tienda', max: 60 },
      { clave: 'destino', etiqueta: 'Abre', tipo: 'select', defecto: 'whatsapp', opciones: [['whatsapp', 'WhatsApp'], ['instagram', 'Instagram'], ['web', 'Página web'], ['otro', 'Otro enlace']] },
      { clave: 'referencia', etiqueta: 'Referencia única', defecto: '', max: 20, si: (d) => d.destino === 'whatsapp', ayuda: 'Aparece en el mensaje que llega por WhatsApp.' },
      { clave: 'mensaje', etiqueta: 'Mensaje que llega', tipo: 'area', defecto: 'Hola Alta Densidad, quiero información', max: 200, si: (d) => d.destino === 'whatsapp' },
      { clave: 'whatsapp', etiqueta: 'Número de WhatsApp', defecto: WA_VISIBLE, max: 24, si: (d) => d.destino === 'whatsapp' },
      { clave: 'instagram', etiqueta: 'Cuenta de Instagram', defecto: `@${INSTAGRAM}`, max: 60, si: (d) => d.destino === 'instagram' },
      { clave: 'url', etiqueta: 'Enlace', defecto: SITIO, max: 300, si: (d) => d.destino === 'web' || d.destino === 'otro' },
      { clave: 'color', etiqueta: 'Color', tipo: 'select', defecto: 'tinta', opciones: [['tinta', 'Tinta'], ['oro', 'Oro'], ['vino', 'Vino']] },
      { clave: 'fondo', etiqueta: 'Fondo', tipo: 'select', defecto: 'blanco', opciones: [['blanco', 'Blanco'], ['hueso', 'Hueso'], ['transparente', 'Transparente']] },
      { clave: 'leyenda', etiqueta: 'Texto debajo (opcional)', defecto: 'Escríbenos', max: 40 }
    ],
    dibujar(d, F) {
      const color = { tinta: C.tinta, oro: C.oro, vino: C.vino }[d.color] || C.tinta;
      const bg = { blanco: C.blanco, hueso: C.hueso, transparente: null }[d.fondo];
      const H = d.leyenda ? 690 : 600;
      let s = bg ? `<rect width="600" height="${H}" fill="${bg}"/>` : '';
      s += qr(enlaceQr(d), 0, 0, 600, color, null);
      if (d.leyenda) s += destello(300, 604, 9, color) + T(F.J_M, d.leyenda.toUpperCase(), 26, 300, 656, color, { track: 0.26, anchor: 'middle' });
      return { w: 600, h: H, svg: s };
    }
  }
];

export const plantillaDe = (tipo) => PLANTILLAS.find((p) => p.tipo === tipo);
export const datosPorDefecto = (pl) => Object.fromEntries(pl.campos.map((c) => [c.clave, c.defecto]));

/**
 * Firma para pegar en Gmail / Outlook: HTML con tablas y estilos en línea (los clientes de correo
 * no aceptan CSS externo ni SVG). Los íconos y el logo son PNG publicados en la tienda.
 */
export function firmaHtml(d) {
  const base = SITIO.replace(/\/$/, '');
  const oro = C.oro;
  const enlaces = [
    d.whatsapp && ['whatsapp', d.whatsapp, `https://wa.me/${numeroWa(d.whatsapp)}`],
    d.instagram && ['instagram', `@${sinArroba(d.instagram)}`, `https://instagram.com/${sinArroba(d.instagram)}`],
    d.web && ['web', urlVisible(d.web), urlLimpia(d.web)],
    d.correo && ['correo', d.correo, `mailto:${String(d.correo).trim()}`]
  ].filter(Boolean);
  const celdas = enlaces.map(([ic, t, href]) => `<td style="padding:0 18px 0 0;white-space:nowrap;vertical-align:middle">`
    + `<a href="${esc(href)}" style="color:#6B675F;text-decoration:none;font:14px/1.4 Arial,Helvetica,sans-serif">`
    + `<img src="${base}/assets/firma/${ic}.png" width="16" height="16" alt="" style="vertical-align:-3px;border:0;margin-right:6px">${esc(t)}</a></td>`).join('');
  return `<table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif">`
    + `<tr><td style="padding:0 0 10px 0"><img src="${base}/assets/firma/logo.png" width="220" alt="Alta Densidad · Fragancias" style="display:block;border:0"></td></tr>`
    + `<tr><td style="border-top:1px solid ${oro};padding:12px 0 0 0;font:20px/1.2 Georgia,'Times New Roman',serif;color:#0B0B0C">${esc([d.nombre, d.apellido].filter(Boolean).join(' '))}</td></tr>`
    + `<tr><td style="padding:2px 0 10px 0;font:bold 11px/1.4 Arial,Helvetica,sans-serif;letter-spacing:3px;color:${oro};text-transform:uppercase">${esc(d.cargo)}</td></tr>`
    + `<tr><td><table cellpadding="0" cellspacing="0" border="0"><tr>${celdas}</tr></table></td></tr></table>`;
}
