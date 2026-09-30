// Capas compartidas por todas las páginas públicas: velo, bolsa y modal de detalle (perfume o kit)
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTienda } from './TiendaContext';
import Bolsa, { Cantidad } from './Bolsa';
import { Frasco, ImagenLogo } from './Frasco';
import { fmt, pr, etiquetaColeccion, etiquetaTalla, descripcion, normalizarImagen, noDisponible, motivoNoDisponible } from '../lib/producto';
import { WA } from '../config';

function Specs({ style }) {
  return (
    <div className="specs up" style={style}>
      <div><b>Extrait</b>de Parfum</div>
      <div><b>12h+</b>Fijación</div>
      <div><b>+</b>Feromonas</div>
    </div>
  );
}

// enPagina: la misma ficha como página (enlace directo /perfume/<slug>), sin botón de cerrar
export function DetalleProducto({ enPagina = false }) {
  const { detalle: D, setDetalle, buscarProducto, cerrarCapas, addToCart, abrirBolsa } = useTienda();
  const p = buscarProducto(D.id);
  if (!p) return null;
  const niveles = [['Salida', p.no.top], ['Corazón', p.no.heart], ['Fondo', p.no.base]].filter(([, n]) => n.length);
  const msgWa = encodeURIComponent(`¡Hola! Quiero más información sobre ${p.n}${D.ml ? ' (' + etiquetaTalla(D.ml) + ')' : ''}. ✨`);
  const fijar = (cambio) => setDetalle((d) => ({ ...d, ...cambio }));

  return (
    <>
      {!enPagina && <button className="x up" onClick={cerrarCapas} aria-label="Cerrar detalle">✕ Cerrar</button>}
      <div className="stage"><Frasco h={p.h || 32} s={2} img={p.img} nombre={p.n} prioridad /></div>
      <div className="d-info">
        <span className="up eyebrow">{[p.b, etiquetaColeccion(p.c)].filter(Boolean).join(' · ')}</span>
        <h2>{p.n}</h2>
        {p.orig && <small className="mute d-orig">Inspirado en {p.orig}{p.b ? ` de ${p.b}` : ''}</small>}
        <small className="up mute">{[p.f, p.g].filter(Boolean).join(' · ')}</small>
        <p className="mute">{descripcion(p)}</p>
        {p.ac.length > 0 && (
          <div className="pick up d-acordes" aria-label="Acordes principales">
            {p.ac.map((a) => <span key={a} className="chip">{a}</span>)}
          </div>
        )}
        {niveles.length > 0 && (
          <dl className="pyr">
            {niveles.map(([nivel, notas]) => <div key={nivel}><dt className="up">{nivel}</dt><dd>{notas.join(' · ')}</dd></div>)}
          </dl>
        )}
        <Specs />
        {p.sz.length > 0 && (
          <div className="opt">
            <span className="up opt-l">Presentación</span>
            <div className="pick up">
              {p.sz.map((s) => <button key={s} className={`chip ${s === D.ml ? 'on' : ''}`} onClick={() => fijar({ ml: s })}>{etiquetaTalla(s)}</button>)}
            </div>
          </div>
        )}
        {p.env.length > 0 && (
          <div className="opt">
            <span className="up opt-l">Envase</span>
            <div className="pick up">
              {p.env.map((e) => <button key={e} className={`chip ${e === D.env ? 'on' : ''}`} onClick={() => fijar({ env: e })}>{e}</button>)}
            </div>
          </div>
        )}
        <div className="buy">
          {!p.sp && <b style={{ font: '300 28px var(--f-display)' }}>{p.rev ? 'Precio en revisión' : fmt(pr(p) * D.q)}</b>}
          {!p.sp && <Cantidad valor={D.q} onMenos={() => fijar({ q: Math.max(1, D.q - 1) })} onMas={() => fijar({ q: D.q + 1 })} />}
          {p.sp
            ? <Link className="btn up" to={`/catalogo?ver=crear&fragancia=${p.id}`}>Prepararla a tu medida</Link>
            : noDisponible(p)
              ? <button className="btn up" disabled aria-disabled="true">{motivoNoDisponible(p)}</button>
              : <button className="btn up" onClick={() => { addToCart(D.id, D.ml, D.env, D.q); abrirBolsa(); }}>Añadir a la bolsa</button>}
        </div>
        {p.sp && <p className="mute d-solo-prep">Esta fragancia la tenemos en esencia: se prepara en el envase y tamaño que elijas.</p>}
        {!p.sp && <Link className="link up d-crear" to={`/catalogo?ver=crear&fragancia=${p.id}`}>Prepararla en el envase y tamaño que quieras →</Link>}
        <a className="link up d-wa" href={`https://wa.me/${WA}?text=${msgWa}`} target="_blank" rel="noopener">Consultar con un asesor por WhatsApp</a>
      </div>
    </>
  );
}

export function DetalleKit({ enPagina = false }) {
  const { KITS, kitAbierto, cerrarCapas, addKitToCart, abrirBolsa } = useTienda();
  const kit = KITS.find((k) => k.id === kitAbierto);
  if (!kit) return null;
  const nom = kit.nombre || kit.n;
  const beneficios = kit.beneficios || [];

  return (
    <>
      {!enPagina && <button className="x up" onClick={cerrarCapas} aria-label="Cerrar detalle">✕ Cerrar</button>}
      <div className="stage" style={{ padding: 'var(--sp-4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ImagenLogo src={normalizarImagen(kit.imagen || kit.img)} alt={nom} style={{ maxHeight: 360, maxWidth: '90%', objectFit: 'contain' }} />
      </div>
      <div className="d-info">
        <span className="up eyebrow">Set Exclusivo · Estuche de Lujo</span>
        <h2>{nom}</h2>
        <p className="mute" style={{ whiteSpace: 'pre-line', lineHeight: 1.6, marginTop: 'var(--sp-2)' }}>
          {kit.descripcion || 'Kit exclusivo con selecciones premium de Alta Densidad.'}
        </p>
        {beneficios.length > 0 && (
          <div className="kit-modal-beneficios" style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-1)', margin: 'var(--sp-2) 0' }}>
            {beneficios.map((b) => <span key={b} className="chip up" style={{ fontSize: 11 }}>✓ {b}</span>)}
          </div>
        )}
        <Specs style={{ marginTop: 'var(--sp-3)' }} />
        <div className="buy" style={{ marginTop: 'var(--sp-4)' }}>
          <b style={{ font: '300 28px var(--f-display)' }}>{kit.precio_revision ? 'Precio en revisión' : fmt(Number(kit.precio || kit.p || 60000))}</b>
          {kit.agotado || kit.precio_revision
            ? <button className="btn up" disabled aria-disabled="true">{kit.precio_revision ? 'Precio en revisión' : 'Agotado'}</button>
            : <button className="btn up" onClick={() => { addKitToCart(kit.id, 1); abrirBolsa(); }}>Añadir kit a la bolsa</button>}
        </div>
      </div>
    </>
  );
}

export default function Capas() {
  const { capa, cerrarCapas } = useTienda();
  const modalAbierto = capa === 'detalle' || capa === 'kit';
  // El contenido se conserva al cerrar para que la animación de salida no muestre la hoja vacía
  const ultimo = useRef(null);
  if (modalAbierto) ultimo.current = capa;
  return (
    <>
      <div className={`scrim ${capa ? 'on' : ''}`} onClick={cerrarCapas} />
      <Bolsa />
      <div
        className={`modal ${modalAbierto ? 'on' : ''}`} role="dialog" aria-modal="true" aria-label="Detalle del producto"
        onClick={(e) => { if (e.target === e.currentTarget) cerrarCapas(); }}
      >
        <div className="sheet">
          {ultimo.current === 'detalle' && <DetalleProducto />}
          {ultimo.current === 'kit' && <DetalleKit />}
        </div>
      </div>
    </>
  );
}
