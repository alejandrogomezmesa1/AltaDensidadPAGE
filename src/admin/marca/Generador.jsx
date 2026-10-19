// Generador de piezas desde el catálogo real: ficha olfativa para el feed, historia o cuadrado,
// con la foto del perfume en el marco ventana, la pirámide en tres actos (I · II · III), el precio
// y la firma. Todo se dibuja en un lienzo con las fuentes de la marca y se descarga en PNG.
// También redacta el texto de la publicación siguiendo la voz de la marca.
import { useEffect, useMemo, useRef, useState } from 'react';
import { apiJson } from '../../lib/api';
import { normalizarImagen } from '../../lib/producto';
import { SITIO } from '../../config';
import { toastOk } from '../comunes';
import { descargarBlob, lienzoABlob, copiarTexto } from './utilidades';

const FORMATOS = {
  post: { etiqueta: 'Post 4:5', ancho: 1080, alto: 1350 },
  historia: { etiqueta: 'Historia 9:16', ancho: 1080, alto: 1920 },
  cuadrado: { etiqueta: 'Cuadrado 1:1', ancho: 1080, alto: 1080 }
};
const TEMAS = {
  noche: { etiqueta: 'Noche · tinta + oro', fondo: '#0B0B0C', tinta: '#F2EEE6', acento: '#C9A961', mute: '#9A958A', filete: '#2A2A2D' },
  dia: { etiqueta: 'Día · hueso + oro', fondo: '#F4F1EA', tinta: '#0B0B0C', acento: '#9A7B3F', mute: '#6B675F', filete: '#D6D0C3' },
  vino: { etiqueta: 'Temporada · vino + oro', fondo: '#5A1220', tinta: '#F2EEE6', acento: '#C9A961', mute: '#D9C7A3', filete: '#7A2A38' }
};
const ANTETITULOS = ['Ficha olfativa', 'Nuevo', 'Top del mes', 'Disponible', 'Edición limitada'];
const DISPLAY = '"Cormorant Garamond", Georgia, serif';
const UI = 'Jost, "Segoe UI", sans-serif';

// Color de la familia olfativa (B3.5): solo como punto o filete
const FAMILIA_COLOR = [
  [/amader|madera|cuero|chipre/i, '#7A5A3A'], [/ambar|ámbar|oriental/i, '#B8862F'], [/floral|flor/i, '#C79A9A'],
  [/fresc|citr|acuát|acuat|verde|aromát|aromat/i, '#8FA58A'], [/gourmand|dulce|vainill/i, '#A86B3C'], [/especi/i, '#8C2A3A']
];
const colorFamilia = (nombre) => (FAMILIA_COLOR.find(([re]) => re.test(nombre || '')) || [null, null])[1];

const SILUETA = new Path2D('M50,2 L63,27 L76,46 L81,63 L77,79 L65,92 L50,98 L35,92 L23,79 L19,63 L24,46 L37,27 Z');
const FACETAS = new Path2D('M24,46 L76,46 M50,2 L38,46 M50,2 L62,46 M50,2 L50,46 M37,27 L50,46 L63,27 '
  + 'M24,46 L38,46 L50,98 M76,46 L62,46 L50,98 M50,46 L50,98 M19,63 L38,46 M81,63 L62,46');

// La gota tallada: silueta rellena con las facetas recortadas (igual que la máscara del SVG)
function simbolo(ctx, x, y, tam, color) {
  const c = document.createElement('canvas');
  c.width = c.height = Math.ceil(tam);
  const g = c.getContext('2d');
  g.scale(tam / 100, tam / 100);
  g.fillStyle = color;
  g.fill(SILUETA);
  g.globalCompositeOperation = 'destination-out';
  g.lineWidth = 1.5;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  g.stroke(FACETAS);
  ctx.drawImage(c, x, y);
}

// Texto con espaciado entre letras (a mano: ctx.letterSpacing no está en todos los navegadores)
function espaciado(ctx, texto, x, y, track, alinear = 'left') {
  const letras = [...texto];
  const ancho = letras.reduce((s, l) => s + ctx.measureText(l).width, 0) + track * (letras.length - 1);
  let cx = alinear === 'center' ? x - ancho / 2 : alinear === 'right' ? x - ancho : x;
  const prev = ctx.textAlign;
  ctx.textAlign = 'left';
  letras.forEach((l) => { ctx.fillText(l, cx, y); cx += ctx.measureText(l).width + track; });
  ctx.textAlign = prev;
  return ancho;
}

function lineas(ctx, texto, maxAncho, max = 3) {
  const palabras = String(texto).split(/\s+/).filter(Boolean);
  const res = [];
  let actual = '';
  for (const p of palabras) {
    const prueba = actual ? `${actual} ${p}` : p;
    if (ctx.measureText(prueba).width > maxAncho && actual) { res.push(actual); actual = p; } else actual = prueba;
  }
  if (actual) res.push(actual);
  if (res.length > max) {
    const cortadas = res.slice(0, max);
    cortadas[max - 1] = `${cortadas[max - 1].replace(/[,;.]?$/, '')}…`;
    return cortadas;
  }
  return res;
}

// Marco ventana (arco de medio punto), como el del hero de la tienda
function arco(ctx, x, y, w, h) {
  const r = w / 2;
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.arc(x + r, y + r, r, Math.PI, 0);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
}

function fotoEnArco(ctx, img, x, y, w, h, t) {
  ctx.save();
  arco(ctx, x, y, w, h);
  ctx.clip();
  if (img) {
    const k = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const iw = img.naturalWidth * k;
    const ih = img.naturalHeight * k;
    ctx.drawImage(img, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih);
  } else {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, t.filete);
    g.addColorStop(1, t.fondo);
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
    simbolo(ctx, x + w / 2 - w * 0.22, y + h / 2 - w * 0.22, w * 0.44, t.acento);
  }
  ctx.restore();
  // filete exterior separado del arco
  ctx.save();
  ctx.strokeStyle = t.acento;
  ctx.globalAlpha = 0.7;
  ctx.lineWidth = 1.5;
  arco(ctx, x - 14, y - 14, w + 28, h + 28);
  ctx.stroke();
  ctx.restore();
}

function piramide(ctx, notas, x, y, ancho, t, compacta) {
  const actos = [['I', 'Salida', notas.top], ['II', 'Corazón', notas.heart], ['III', 'Fondo', notas.base]].filter((a) => a[2]?.length);
  if (!actos.length) return y;
  const col = ancho / actos.length;
  let maxY = y;
  actos.forEach(([n, nombre, lista], i) => {
    const cx = x + col * i + col / 2;
    ctx.fillStyle = t.acento;
    ctx.font = `italic 300 ${compacta ? 34 : 40}px ${DISPLAY}`;
    ctx.textAlign = 'center';
    ctx.fillText(n, cx, y);
    ctx.font = `500 15px ${UI}`;
    ctx.fillStyle = t.mute;
    espaciado(ctx, nombre.toUpperCase(), cx, y + 34, 3.3, 'center');
    ctx.font = `300 21px ${UI}`;
    ctx.fillStyle = t.tinta;
    const ls = lineas(ctx, lista.slice(0, 3).join(', '), col - 28, 2);
    ls.forEach((l, k) => ctx.fillText(l, cx, y + 70 + k * 30));
    maxY = Math.max(maxY, y + 70 + (ls.length - 1) * 30);
    if (i > 0) {
      ctx.fillStyle = t.filete;
      ctx.fillRect(x + col * i, y - 30, 1, 120);
    }
  });
  return maxY;
}

function firma(ctx, x, y, t, alinear = 'left') {
  ctx.font = `500 22px ${DISPLAY}`;
  ctx.fillStyle = t.tinta;
  const ancho = ctx.measureText('ALTA DENSIDAD').width + 6.6 * 12 + 46;
  const x0 = alinear === 'right' ? x - ancho : alinear === 'center' ? x - ancho / 2 : x;
  simbolo(ctx, x0, y - 30, 36, t.acento);
  espaciado(ctx, 'ALTA DENSIDAD', x0 + 46, y - 4, 6.6);
}

const precioTexto = (p) => (Number(p.price) > 0 ? `$${Number(p.price).toLocaleString('es-CO')}` : '');
const familias = (p) => (p.families?.length ? p.families : p.family ? [p.family] : []).map((f) => f.name).filter(Boolean);

function dibujar(ctx, { formato, tema, producto, img, antetitulo, conPrecio, conNotas, frase }) {
  const { ancho: W, alto: H } = FORMATOS[formato];
  const t = TEMAS[tema];
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = t.fondo;
  ctx.fillRect(0, 0, W, H);
  ctx.textBaseline = 'alphabetic';
  const M = 80;
  const nombre = producto?.name || 'Elige un perfume';
  const fams = familias(producto || {});
  const punto = colorFamilia(fams.join(' '));
  const notas = producto?.notes || {};
  const precio = conPrecio && producto ? precioTexto(producto) : '';

  // filete de marco general
  ctx.strokeStyle = t.filete;
  ctx.lineWidth = 1;
  ctx.strokeRect(36.5, 36.5, W - 73, H - 73);

  const eyebrow = () => {
    ctx.font = `500 20px ${UI}`;
    ctx.fillStyle = t.acento;
    return `${antetitulo} · Alta concentración`.toUpperCase();
  };

  if (formato === 'cuadrado') {
    const aw = 400;
    const ah = H - 2 * M - 60;
    fotoEnArco(ctx, img, M + 20, M + 40, aw, ah, t);
    const x = M + aw + 100;
    const ancho = W - x - M;
    ctx.textAlign = 'left';
    ctx.font = `500 17px ${UI}`;
    ctx.fillStyle = t.acento;
    espaciado(ctx, antetitulo.toUpperCase(), x, 190, 3.7);
    ctx.font = `300 76px ${DISPLAY}`;
    ctx.fillStyle = t.tinta;
    let y = 290;
    lineas(ctx, nombre, ancho, 3).forEach((l) => { ctx.fillText(l, x, y); y += 78; });
    if (fams.length) {
      ctx.font = `500 15px ${UI}`;
      ctx.fillStyle = t.mute;
      if (punto) { ctx.fillStyle = punto; ctx.beginPath(); ctx.arc(x + 5, y - 11, 5, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = t.mute; }
      espaciado(ctx, fams.join(' · ').toUpperCase(), x + (punto ? 20 : 0), y - 4, 3);
      y += 50;
    }
    if (conNotas) {
      [['I', notas.top], ['II', notas.heart], ['III', notas.base]].filter((a) => a[1]?.length).forEach(([n, l]) => {
        ctx.font = `italic 300 30px ${DISPLAY}`;
        ctx.fillStyle = t.acento;
        ctx.fillText(n, x, y + 30);
        ctx.font = `300 19px ${UI}`;
        ctx.fillStyle = t.tinta;
        ctx.fillText(lineas(ctx, l.slice(0, 3).join(', '), ancho - 60, 1)[0], x + 60, y + 28);
        y += 52;
      });
    }
    if (precio) {
      ctx.font = `500 54px ${DISPLAY}`;
      ctx.fillStyle = t.tinta;
      ctx.fillText(precio, x, H - M - 110);
    }
    firma(ctx, x, H - M - 30, t);
    return;
  }

  const historia = formato === 'historia';
  ctx.textAlign = 'center';
  eyebrow();
  espaciado(ctx, eyebrow(), W / 2, historia ? 210 : 132, 4.4, 'center');

  const aw = historia ? 600 : 470;
  const ah = historia ? 800 : 560;
  const ay = historia ? 300 : 188;
  fotoEnArco(ctx, img, (W - aw) / 2, ay, aw, ah, t);

  let y = ay + ah + (historia ? 150 : 112);
  ctx.font = `300 ${historia ? 104 : 88}px ${DISPLAY}`;
  ctx.fillStyle = t.tinta;
  const nom = lineas(ctx, nombre, W - 2 * M - 40, 2);
  nom.forEach((l) => { ctx.fillText(l, W / 2, y); y += historia ? 104 : 86; });
  y -= historia ? 40 : 38;

  if (fams.length) {
    ctx.font = `500 17px ${UI}`;
    const txt = fams.join(' · ').toUpperCase();
    ctx.fillStyle = t.mute;
    const anchoTxt = espaciado(ctx, txt, W / 2 + (punto ? 12 : 0), y, 3.7, 'center');
    if (punto) { ctx.fillStyle = punto; ctx.beginPath(); ctx.arc(W / 2 - anchoTxt / 2 - 8, y - 6, 5, 0, Math.PI * 2); ctx.fill(); }
    y += historia ? 120 : 82;
  } else y += 40;

  if (conNotas && (historia || nom.length === 1)) {
    y = piramide(ctx, notas, M + 20, y, W - 2 * M - 40, t, !historia) + (historia ? 110 : 60);
  }

  if (historia && frase) {
    ctx.font = `italic 300 46px ${DISPLAY}`;
    ctx.fillStyle = t.acento;
    ctx.textAlign = 'center';
    ctx.fillText(frase, W / 2, Math.max(y, H - 330));
  }

  const pie = H - (historia ? 150 : 82);
  ctx.textAlign = 'left';
  if (precio) {
    ctx.font = `500 ${historia ? 60 : 48}px ${DISPLAY}`;
    ctx.fillStyle = t.tinta;
    ctx.fillText(precio, M + 10, pie);
    firma(ctx, W - M - 10, pie - 6, t, 'right');
  } else {
    firma(ctx, W / 2, pie - 6, t, 'center');
  }
}

function leyenda(p, frase, conPrecio) {
  if (!p) return '';
  const fams = familias(p);
  const n = p.notes || {};
  const ruta = p.ruta ? `${SITIO}/perfume/${p.ruta}-${p.id}` : SITIO;
  const piram = [['I · Salida', n.top], ['II · Corazón', n.heart], ['III · Fondo', n.base]]
    .filter((a) => a[1]?.length).map(([k, l]) => `${k}: ${l.slice(0, 4).join(', ')}`);
  const etiquetas = ['#AltaDensidad', '#FraganciasDeAltaDensidad', '#LoQuePermanece', '#PerfumesMedellín', '#PerfumeríaColombia',
    ...fams.slice(0, 2).map((f) => `#Fragancia${f.normalize('NFD').replace(/[̀-ͯ\s]/g, '')}`)];
  return [
    `${p.name}.`,
    frase || 'Lo que permanece.',
    '',
    fams.length ? `Familia ${fams.join(' · ').toLowerCase()}.` : '',
    ...piram,
    '',
    'Alta concentración con feromonas: más fijación con menos atomizaciones.',
    conPrecio && precioTexto(p) ? `${precioTexto(p)}${p.sizes?.[0] ? ` · ${p.sizes[0]}` : ''}` : '',
    `Pídelo por WhatsApp o en ${ruta}`,
    'Envíos a toda Colombia desde Medellín.',
    '',
    etiquetas.join(' ')
  ].filter((l, i, a) => l !== '' || (a[i - 1] !== '' && i > 0)).join('\n');
}

export default function Generador({ alerta }) {
  const [productos, setProductos] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [productoId, setProductoId] = useState('');
  const [formato, setFormato] = useState('post');
  const [tema, setTema] = useState('noche');
  const [antetitulo, setAntetitulo] = useState(ANTETITULOS[0]);
  const [conPrecio, setConPrecio] = useState(true);
  const [conNotas, setConNotas] = useState(true);
  const [frase, setFrase] = useState('Lo que permanece.');
  const [img, setImg] = useState(null);
  const [aviso, setAviso] = useState('');
  const [fuentesListas, setFuentesListas] = useState(false);
  const lienzo = useRef(null);

  useEffect(() => {
    apiJson('productos').then((r) => {
      const lista = (r.data || []).filter((p) => p.activo !== 0 && p.name).sort((a, b) => a.name.localeCompare(b.name, 'es'));
      setProductos(lista);
      if (lista.length) setProductoId(String(lista[0].id));
    }).catch((err) => { setProductos([]); alerta('No se pudieron cargar los productos: ' + err.message, 'error'); });
  }, [alerta]);

  useEffect(() => {
    const specs = [`300 80px ${DISPLAY}`, `italic 300 40px ${DISPLAY}`, `500 40px ${DISPLAY}`, `300 20px ${UI}`, `500 20px ${UI}`];
    // Si Google Fonts no responde, no se espera más de 3 s: se dibuja con Georgia y se redibuja al llegar
    const limite = new Promise((r) => { setTimeout(r, 3000); });
    Promise.race([Promise.all(specs.map((s) => document.fonts?.load(s))), limite]).catch(() => {}).finally(() => setFuentesListas(true));
    const redibujar = () => setFuentesListas((v) => (v ? 'cargadas' : v));
    document.fonts?.addEventListener?.('loadingdone', redibujar);
    return () => document.fonts?.removeEventListener?.('loadingdone', redibujar);
  }, []);

  const producto = useMemo(() => productos?.find((p) => String(p.id) === productoId) || null, [productos, productoId]);
  const opciones = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return (productos || []).filter((p) => !q || `${p.name} ${p.brand?.name || ''}`.toLowerCase().includes(q)).slice(0, 200);
  }, [productos, busqueda]);

  // Foto del producto con CORS (Cloudinary lo permite): sin CORS el lienzo no se podría exportar
  useEffect(() => {
    setImg(null);
    setAviso('');
    if (!producto?.image) return undefined;
    let vivo = true;
    const i = new Image();
    i.crossOrigin = 'anonymous';
    i.onload = () => { if (vivo) setImg(i); };
    i.onerror = () => { if (vivo) setAviso('No se pudo cargar la foto del producto: la pieza sale con el símbolo en el marco.'); };
    i.src = normalizarImagen(producto.image);
    return () => { vivo = false; };
  }, [producto]);

  useEffect(() => {
    const c = lienzo.current;
    if (!c || !fuentesListas) return;
    const { ancho, alto } = FORMATOS[formato];
    c.width = ancho;
    c.height = alto;
    dibujar(c.getContext('2d'), { formato, tema, producto, img, antetitulo, conPrecio, conNotas, frase });
  }, [formato, tema, producto, img, antetitulo, conPrecio, conNotas, frase, fuentesListas]);

  async function descargar(tipo) {
    try {
      const blob = await lienzoABlob(lienzo.current, tipo === 'jpg' ? 'image/jpeg' : 'image/png', 0.92);
      const slug = (producto?.name || 'pieza').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-');
      descargarBlob(blob, `alta-densidad_${formato}_${slug}.${tipo}`);
    } catch (err) {
      alerta('No se pudo exportar: ' + err.message, 'error');
    }
  }

  const texto = leyenda(producto, frase, conPrecio);

  return (
    <div className="marca-generador">
      <form className="marca-gen-controles" onSubmit={(e) => e.preventDefault()}>
        <label>Perfume
          <input type="search" placeholder="Buscar en el catálogo…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          <select value={productoId} onChange={(e) => setProductoId(e.target.value)} disabled={!productos?.length} size={6}>
            {productos === null && <option>Cargando…</option>}
            {opciones.map((p) => <option key={p.id} value={p.id}>{p.name}{p.brand?.name ? ` · ${p.brand.name}` : ''}</option>)}
          </select>
        </label>
        <fieldset>
          <legend>Formato</legend>
          <div className="marca-segmento">
            {Object.entries(FORMATOS).map(([k, f]) => (
              <button key={k} type="button" className={formato === k ? 'activo' : ''} onClick={() => setFormato(k)} aria-pressed={formato === k}>{f.etiqueta}</button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>Tema</legend>
          <div className="marca-temas">
            {Object.entries(TEMAS).map(([k, t]) => (
              <button key={k} type="button" className={tema === k ? 'activo' : ''} onClick={() => setTema(k)} aria-pressed={tema === k} title={t.etiqueta}>
                <i style={{ background: t.fondo, borderColor: t.acento }}><b style={{ background: t.acento }} /></i>{t.etiqueta.split(' · ')[0]}
              </button>
            ))}
          </div>
        </fieldset>
        <label>Antetítulo
          <select value={antetitulo} onChange={(e) => setAntetitulo(e.target.value)}>
            {ANTETITULOS.map((a) => <option key={a}>{a}</option>)}
          </select>
        </label>
        <label>Frase {formato === 'historia' ? '' : <small className="marca-mute">(historia y texto)</small>}
          <input type="text" value={frase} onChange={(e) => setFrase(e.target.value)} maxLength={40} />
        </label>
        <div className="marca-fila">
          <button type="button" className={`marca-toggle ${conPrecio ? 'activo' : ''}`} onClick={() => setConPrecio(!conPrecio)} aria-pressed={conPrecio}>
            <i className="fas fa-tag" /> Precio
          </button>
          <button type="button" className={`marca-toggle ${conNotas ? 'activo' : ''}`} onClick={() => setConNotas(!conNotas)} aria-pressed={conNotas}>
            <i className="fas fa-layer-group" /> Pirámide
          </button>
        </div>
        {aviso && <p className="marca-aviso"><i className="fas fa-exclamation-triangle" /> {aviso}</p>}
        <div className="marca-fila">
          <button type="button" className="btn-primary" onClick={() => descargar('png')} disabled={!producto}><i className="fas fa-download" /> PNG</button>
          <button type="button" className="btn-secondary" onClick={() => descargar('jpg')} disabled={!producto}><i className="far fa-image" /> JPG</button>
        </div>
      </form>

      <div className="marca-gen-vista">
        <canvas ref={lienzo} className={`marca-gen-lienzo marca-gen-lienzo--${formato}`} aria-label="Vista previa de la pieza" />
      </div>

      <div className="marca-gen-texto">
        <div className="marca-fila marca-fila--fin">
          <h4 className="up">Texto de la publicación</h4>
          <button type="button" className="btn-secondary" disabled={!texto} onClick={() => copiarTexto(texto).then(() => toastOk('Texto copiado'))}>
            <i className="far fa-copy" /> Copiar
          </button>
        </div>
        <pre>{texto || 'Elige un perfume.'}</pre>
        <small className="marca-mute">Revisa las notas antes de publicar: vienen de la ficha del producto.</small>
      </div>
    </div>
  );
}
