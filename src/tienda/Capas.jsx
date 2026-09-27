// Capas compartidas por todas las páginas públicas: velo, bolsa y modal de detalle (perfume o kit)
import { useRef } from 'react';
import { useTienda } from './TiendaContext';
import Bolsa, { Cantidad } from './Bolsa';
import { Frasco, ImagenLogo } from './Frasco';
import { fmt, pr, etiquetaColeccion, etiquetaTalla, descripcion, normalizarImagen } from '../lib/producto';
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

function DetalleProducto() {
  const { detalle: D, setDetalle, buscarProducto, cerrarCapas, addToCart, abrirBolsa } = useTienda();
  const p = buscarProducto(D.id);
  if (!p) return null;
  const notas = p.no || ['Notas cítricas', 'Corazón aromático', 'Ámbar y feromonas'];
  const msgWa = encodeURIComponent(`¡Hola! Quiero más información sobre ${p.n}${D.ml ? ' (' + etiquetaTalla(D.ml) + ')' : ''}. ✨`);
  const fijar = (cambio) => setDetalle((d) => ({ ...d, ...cambio }));

  return (
    <>
      <button className="x up" onClick={cerrarCapas} aria-label="Cerrar detalle">✕ Cerrar</button>
      <div className="stage"><Frasco h={p.h || 32} s={2} img={p.img} nombre={p.n} prioridad /></div>
      <div className="d-info">
        <span className="up eyebrow">{p.b} · {etiquetaColeccion(p.c)}</span>
        <h2>{p.n}</h2>
        <small className="up mute">{p.f} · {p.o} · {p.g}</small>
        <p className="mute">{descripcion(p)}</p>
        <dl className="pyr">
          <div><dt className="up">Salida</dt><dd>{notas[0] || 'Notas frescas'}</dd></div>
          <div><dt className="up">Corazón</dt><dd>{notas[1] || 'Esencia de autor'}</dd></div>
          <div><dt className="up">Fondo</dt><dd>{notas[2] || 'Ámbar y feromonas'}</dd></div>
        </dl>
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
          <b style={{ font: '300 28px var(--f-display)' }}>{fmt(pr(p) * D.q)}</b>
          <Cantidad valor={D.q} onMenos={() => fijar({ q: Math.max(1, D.q - 1) })} onMas={() => fijar({ q: D.q + 1 })} />
          {p.ag
            ? <button className="btn up" disabled aria-disabled="true">Agotado</button>
            : <button className="btn up" onClick={() => { addToCart(D.id, D.ml, D.env, D.q); abrirBolsa(); }}>Añadir a la bolsa</button>}
        </div>
        <a className="link up d-wa" href={`https://wa.me/${WA}?text=${msgWa}`} target="_blank" rel="noopener">Consultar con un asesor por WhatsApp</a>
      </div>
    </>
  );
}

function DetalleKit() {
  const { KITS, kitAbierto, cerrarCapas, addKitToCart, abrirBolsa } = useTienda();
  const kit = KITS.find((k) => k.id === kitAbierto);
  if (!kit) return null;
  const nom = kit.nombre || kit.n;
  const beneficios = kit.beneficios || [];

  return (
    <>
      <button className="x up" onClick={cerrarCapas} aria-label="Cerrar detalle">✕ Cerrar</button>
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
          <b style={{ font: '300 28px var(--f-display)' }}>{fmt(Number(kit.precio || kit.p || 60000))}</b>
          {kit.agotado
            ? <button className="btn up" disabled aria-disabled="true">Agotado</button>
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
