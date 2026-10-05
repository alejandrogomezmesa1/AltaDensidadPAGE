// Catálogo para revendedores: PDF con los perfumes 1.1 en tarjetas (foto, marca, nombre, notas y
// precio con la ganancia del revendedor), separados por sexo y con el nombre de su perfumería.
// La configuración se recuerda en este navegador; jsPDF se carga solo al generar.
import { useEffect, useMemo, useState } from 'react';
import { ModalAdmin } from './comunes';
import { LOGO, normalizarImagen } from '../lib/producto';

const CLAVE = 'ad_catalogo_reventa';
const BASE = {
  perfumeria: '', contacto: '', ganancia: 30, redondeo: 'mil',
  disponibilidad: 'existencias', categoria: 'todas',
  generos: ['Masculino', 'Femenino', 'Unisex'], notas: true, columnas: 3, orden: 'marca'
};
const SECCIONES = [['Masculino', 'Para él'], ['Femenino', 'Para ella'], ['Unisex', 'Unisex']];
const REDONDEOS = [['ninguno', 'Sin redondear'], ['mil', 'Al millar (hacia arriba)'], ['cincomil', 'A 5.000 (hacia arriba)']];

// (una configuración guardada antes con «ocultos» se ignora)
const leer = () => { try { const { ocultos, ...c } = JSON.parse(localStorage.getItem(CLAVE) || 'null') || {}; void ocultos; return { ...BASE, ...c }; } catch { return BASE; } };
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

// ── Imágenes: miniatura cuadrada en JPEG (Cloudinary la recorta en el servidor) ──
function urlMiniatura(src) {
  const url = normalizarImagen(src);
  return url.includes('res.cloudinary.com') && url.includes('/upload/')
    ? url.replace('/upload/', '/upload/c_fill,g_auto,w_420,h_420,f_jpg,q_75/')
    : url;
}
function cargarImagen(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const lado = 420;
        const c = document.createElement('canvas');
        c.width = lado; c.height = lado;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, lado, lado);
        // Recorte "cover" al centro
        const r = Math.max(lado / img.width, lado / img.height);
        const w = img.width * r; const h = img.height * r;
        ctx.drawImage(img, (lado - w) / 2, (lado - h) / 2, w, h);
        resolve(c.toDataURL('image/jpeg', 0.8));
      } catch { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}
async function cargarTodas(lista, alAvanzar) {
  const fotos = new Map();
  let hechas = 0;
  const logo = await cargarImagen(LOGO);
  const cola = [...lista];
  const trabajador = async () => {
    while (cola.length) {
      const p = cola.shift();
      fotos.set(p.id, (p.image && await cargarImagen(urlMiniatura(p.image))) || logo);
      alAvanzar(++hechas, lista.length);
    }
  };
  await Promise.all(Array.from({ length: 6 }, trabajador));
  return { fotos, logo };
}

const capital = (t) => String(t || '').charAt(0).toUpperCase() + String(t || '').slice(1);
function textoNotas(p) {
  const n = p.notes || {};
  const partes = [['Salida', n.top], ['Corazón', n.heart], ['Fondo', n.base]]
    .filter(([, l]) => l && l.length).map(([t, l]) => `${t}: ${l.map(capital).join(', ')}`);
  if (partes.length) return partes.join('  ·  ');
  return (p.accords || []).length ? `Acordes: ${p.accords.map(capital).join(', ')}` : '';
}

// ── PDF ──
async function generarPdf(lista, cfg, alAvanzar) {
  const { jsPDF } = await import('jspdf');
  const { fotos } = await cargarTodas(lista, alAvanzar);
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const AN = 210; const AL = 297; const M = 12; const G = 5;
  const ORO = [176, 141, 72]; const TINTA = [28, 26, 24]; const GRIS = [110, 106, 100]; const LINEA = [226, 220, 208];
  const cols = Number(cfg.columnas) || 3;
  const W = (AN - 2 * M - (cols - 1) * G) / cols;
  // Tres filas por página: 3 × 74 mm + separaciones caben bajo la cabecera y la banda de sección
  const H = 74;
  const foto = cols === 3 ? 38 : 42;
  const nombre = cfg.perfumeria.trim() || 'Catálogo de fragancias';
  const fecha = new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
  let pagina = 0;

  const cabecera = () => {
    pagina += 1;
    doc.setTextColor(...TINTA); doc.setFont('helvetica', 'bold'); doc.setFontSize(16);
    doc.text(nombre, M, M + 6);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...GRIS);
    doc.text(`Fragancias 1.1 · ${fecha}`, AN - M, M + 6, { align: 'right' });
    doc.setDrawColor(...ORO); doc.setLineWidth(0.5); doc.line(M, M + 10, AN - M, M + 10);
    // Pie
    doc.setDrawColor(...LINEA); doc.setLineWidth(0.2); doc.line(M, AL - 12, AN - M, AL - 12);
    doc.setFontSize(7.5); doc.setTextColor(...GRIS);
    if (cfg.contacto.trim()) doc.text(cfg.contacto.trim(), M, AL - 7);
    doc.text(`Página ${pagina}`, AN - M, AL - 7, { align: 'right' });
    return M + 16;
  };
  const banda = (y, titulo, n) => {
    doc.setFillColor(248, 245, 238); doc.rect(M, y, AN - 2 * M, 9, 'F');
    doc.setTextColor(...ORO); doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
    doc.text(titulo.toUpperCase(), M + 4, y + 6, { charSpace: 0.8 });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...GRIS);
    doc.text(`${n} fragancia${n === 1 ? '' : 's'}`, AN - M - 4, y + 6, { align: 'right' });
    return y + 13;
  };
  const tarjeta = (p, x, y) => {
    doc.setDrawColor(...LINEA); doc.setLineWidth(0.3); doc.roundedRect(x, y, W, H, 2, 2, 'S');
    const img = fotos.get(p.id);
    if (img) doc.addImage(img, 'JPEG', x + (W - foto) / 2, y + 4, foto, foto);
    let ty = y + foto + 9;
    doc.setTextColor(...ORO); doc.setFont('helvetica', 'bold'); doc.setFontSize(6.5);
    doc.text((p.brand ? p.brand.name : '').toUpperCase(), x + W / 2, ty, { align: 'center', charSpace: 0.4, maxWidth: W - 6 });
    ty += 4.5;
    doc.setTextColor(...TINTA); doc.setFontSize(9.5);
    const lineasNombre = doc.splitTextToSize(p.name, W - 6).slice(0, 2);
    doc.text(lineasNombre, x + W / 2, ty, { align: 'center', lineHeightFactor: 1.1 });
    ty += lineasNombre.length * 4;
    if (cfg.notas) {
      const notas = textoNotas(p);
      if (notas) {
        doc.setFont('helvetica', 'normal'); doc.setFontSize(6.2); doc.setTextColor(...GRIS);
        let lineas = doc.splitTextToSize(notas, W - 6);
        const max = cols === 3 ? 3 : 4;
        if (lineas.length > max) { lineas = lineas.slice(0, max); lineas[max - 1] = lineas[max - 1].replace(/\s*\S*$/, '…'); }
        doc.text(lineas, x + W / 2, ty + 0.5, { align: 'center', lineHeightFactor: 1.25 });
      }
    }
    doc.setTextColor(...TINTA); doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
    doc.text(pesos(precioReventa(Number(p.price), cfg)), x + W / 2, y + H - 4.5, { align: 'center' });
  };

  let y = null;
  for (const [genero, titulo] of SECCIONES) {
    const grupo = lista.filter((p) => p.gender === genero);
    if (!grupo.length) continue;
    // Cada sexo empieza en página nueva
    if (y !== null) doc.addPage();
    y = banda(cabecera(), titulo, grupo.length);
    grupo.forEach((p, i) => {
      const col = i % cols;
      if (i > 0 && col === 0) y += H + G;
      if (y + H > AL - 15) { doc.addPage(); y = cabecera(); }
      tarjeta(p, M + col * (W + G), y);
    });
  }
  const archivo = `Catalogo ${nombre}`.replace(/[\\/:*?"<>|]+/g, '').trim();
  doc.save(`${archivo}.pdf`);
  return pagina;
}

export default function CatalogoReventa({ abierto, onCerrar, productos, alerta }) {
  const [cfg, setCfg] = useState(leer);
  const [progreso, setProgreso] = useState(null);
  useEffect(() => { try { localStorage.setItem(CLAVE, JSON.stringify(cfg)); } catch { /* sin almacenamiento */ } }, [cfg]);
  const fijar = (k, v) => setCfg((c) => ({ ...c, [k]: v }));

  const lista = useMemo(() => seleccionar(productos, cfg), [productos, cfg]);
  const porSexo = SECCIONES.map(([g, t]) => [t, lista.filter((p) => p.gender === g).length]).filter(([, n]) => n);
  // Cálculo en vivo: promedio y ejemplos (más barato, intermedio y más caro)
  const resumen = useMemo(() => {
    if (!lista.length) return null;
    const precios = lista.map((p) => Number(p.price)).sort((a, b) => a - b);
    const ventas = lista.map((p) => precioReventa(Number(p.price), cfg));
    const promBase = precios.reduce((s, v) => s + v, 0) / precios.length;
    const promVenta = ventas.reduce((s, v) => s + v, 0) / ventas.length;
    const ejemplos = [...new Set([precios[0], precios[Math.floor(precios.length / 2)], precios[precios.length - 1]])];
    return { promBase, promVenta, ejemplos };
  }, [lista, cfg]);

  const generar = async () => {
    if (!lista.length) { alerta('No hay perfumes que cumplan esta configuración.', 'error'); return; }
    setProgreso({ hechas: 0, total: lista.length });
    try {
      const paginas = await generarPdf(lista, cfg, (hechas, total) => setProgreso({ hechas, total }));
      alerta(`Catálogo generado: ${lista.length} perfumes en ${paginas} páginas.`, 'success');
    } catch (e) {
      alerta('No se pudo generar el PDF: ' + e.message, 'error');
    } finally {
      setProgreso(null);
    }
  };

  const generoActivo = (g) => cfg.generos.includes(g);
  return (
    <ModalAdmin abierto={abierto} titulo="Catálogo para revendedores" onCerrar={progreso ? () => {} : onCerrar}>
      <div className="modal-form reventa">
        <div className="form-grid">
          <div className="form-group full">
            <label htmlFor="revPerfumeria">Nombre de la perfumería</label>
            <input id="revPerfumeria" type="text" maxLength={60} placeholder="Ej: Perfumería Aroma — aparece en cada página" value={cfg.perfumeria} onChange={(e) => fijar('perfumeria', e.target.value)} />
          </div>
          <div className="form-group full">
            <label htmlFor="revContacto">Contacto <small>(opcional, va al pie de página)</small></label>
            <input id="revContacto" type="text" maxLength={90} placeholder="Ej: WhatsApp 300 000 0000 · @miperfumeria" value={cfg.contacto} onChange={(e) => fijar('contacto', e.target.value)} />
          </div>

          <div className="form-seccion"><h4>Precio para el revendedor</h4><small>Se aplica sobre el precio de la tienda</small></div>
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
                <thead><tr><th>Precio tienda</th><th>Precio revendedor</th><th>Ganancia</th><th>Margen sobre venta</th></tr></thead>
                <tbody>
                  {resumen.ejemplos.map((b) => {
                    const v = precioReventa(b, cfg);
                    return <tr key={b}><td>{pesos(b)}</td><td><b>{pesos(v)}</b></td><td>{pesos(v - b)}</td><td>{v > 0 ? `${Math.round(((v - b) / v) * 100)}%` : '—'}</td></tr>;
                  })}
                </tbody>
              </table>
              <small>
                En promedio: {pesos(resumen.promBase)} → <b>{pesos(resumen.promVenta)}</b>, ganancia de {pesos(resumen.promVenta - resumen.promBase)} por perfume
                ({Math.round(((resumen.promVenta - resumen.promBase) / resumen.promBase) * 100)}% real con el redondeo).
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
          <div className="form-group">
            <label htmlFor="revCols">Tarjetas por fila</label>
            <select id="revCols" value={cfg.columnas} onChange={(e) => fijar('columnas', Number(e.target.value))}>
              <option value={3}>3 (9 por página)</option>
              <option value={2}>2 (más grandes, 6 por página)</option>
            </select>
          </div>
          <div className="form-group full">
            <label className="check-item"><input type="checkbox" checked={cfg.notas} onChange={(e) => fijar('notas', e.target.checked)} /> Mostrar las notas (salida, corazón y fondo)</label>
          </div>
        </div>
        <p className="reventa-resumen">
          {lista.length
            ? <>Se incluirán <b>{lista.length}</b> perfumes: {porSexo.map(([t, n]) => `${t.toLowerCase()} ${n}`).join(' · ')}.</>
            : 'Ningún perfume cumple esta configuración.'}
        </p>
      </div>
      <div className="modal-actions">
        <button type="button" className="btn-secondary" onClick={onCerrar} disabled={!!progreso}>Cerrar</button>
        <button type="button" className="btn-primary" onClick={generar} disabled={!!progreso || !lista.length}>
          {progreso
            ? <><i className="fas fa-spinner fa-spin" /> Preparando fotos {progreso.hechas}/{progreso.total}…</>
            : <><i className="fas fa-file-pdf" /> Generar PDF</>}
        </button>
      </div>
    </ModalAdmin>
  );
}
