// Bolsa (drawer) con sus dos pasos: 1 · líneas y totales · 2 · datos de envío y pago con Mercado Pago
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTienda } from './TiendaContext';
import { ImagenLogo } from './Frasco';
import { fmt } from '../lib/producto';
import { API, WA, ENVIO_TARIFAS, ENVIO_ZONAS } from '../config';

const MUNICIPIOS = ['Bello', 'Envigado', 'Itagüí', 'Sabaneta', 'La Estrella', 'Copacabana', 'San Antonio de Prado', 'Caldas', 'Girardota', 'Barbosa'];
const ENVIO_VACIO = { nombre: '', documento: '', celular: '', zona: '', ciudadMetro: '', ciudadNacional: '', barrio: '', direccion: '', piso: '', referencia: '' };

function Cantidad({ valor, onMenos, onMas }) {
  return (
    <div className="qty">
      <button type="button" onClick={onMenos} aria-label="Disminuir">−</button>
      <span>{valor}</span>
      <button type="button" onClick={onMas} aria-label="Aumentar">+</button>
    </div>
  );
}
export { Cantidad };

export default function Bolsa() {
  const { cart, capa, paso, setPaso, cerrarCapas, resolverLinea, cambiarCantidad, quitarLinea, vaciarBolsa } = useTienda();
  const [envio, setEnvio] = useState(ENVIO_VACIO);
  const [error, setError] = useState('');
  const [pagando, setPagando] = useState(false);
  const primerCampo = useRef(null);

  const lineas = cart.map((l) => ({ l, r: resolverLinea(l) }));
  const subtotal = lineas.reduce((s, { l, r }) => s + r.u * l.q, 0);
  const costoEnvio = ENVIO_TARIFAS[envio.zona] || 0;

  useEffect(() => {
    if (paso !== 'ship') return undefined;
    const t = setTimeout(() => primerCampo.current?.focus(), 300);
    return () => clearTimeout(t);
  }, [paso]);

  const mensajeWa = '¡Hola! Quiero hacer un pedido en Fragancias de Alta Densidad:\n\n' +
    lineas.map(({ l, r }) => `• ${l.q} x ${r.nom} (${r.sub}) = ${fmt(r.u * l.q)}`).join('\n') +
    `\n\nTotal: ${fmt(subtotal)}\n¿Me confirman disponibilidad y despacho? ✨`;

  const campo = (k) => ({ value: envio[k], onChange: (e) => setEnvio((v) => ({ ...v, [k]: e.target.value })) });

  async function procesarPago(e) {
    e.preventDefault();
    if (!cart.length) return;
    setError('');
    const t = (s) => s.trim();
    const ciudad = envio.zona === 'medellin' ? 'Medellín' : (envio.zona === 'metropolitana' ? t(envio.ciudadMetro) : t(envio.ciudadNacional));
    const shipping = {
      nombre: t(envio.nombre),
      documento: t(envio.documento),
      celular: t(envio.celular),
      zona: ENVIO_ZONAS[envio.zona] || envio.zona,
      ciudad,
      direccion: t(envio.direccion),
      barrio: t(envio.barrio),
      piso: t(envio.piso),
      referencia: t(envio.referencia)
    };
    const items = lineas.map(({ l, r }) => ({ id: r.apiId, name: r.nom, description: r.sub, unit_price: r.u, quantity: l.q }));
    if (costoEnvio > 0) {
      items.push({ id: 'envio-logistica', name: `Servicio de Envío (${ENVIO_ZONAS[envio.zona] || envio.zona})`, unit_price: costoEnvio, quantity: 1 });
    }

    setPagando(true);
    let msg = 'No se pudo iniciar el pago seguro. Intenta de nuevo o finaliza por WhatsApp.';
    try {
      const resp = await fetch(`${API}/mercadopago/create_preference`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, shipping })
      });
      const data = await resp.json();
      if (data.success && data.preference && data.preference.init_point) {
        window.location.href = data.preference.init_point;
        return;
      }
      if (data.message) msg = data.message;
    } catch {
      msg = 'Error de conexión al procesar el pedido. Verifica tu internet o finaliza por WhatsApp.';
    }
    setError(msg);
    setPagando(false);
  }

  return (
    <aside className={`drawer ${capa === 'bolsa' ? 'on' : ''}`} data-step={paso} aria-label="Bolsa de compras">
      <div className="drawer-h up">
        <span>{paso === 'ship' ? 'Datos de envío' : 'Tu bolsa'}</span>
        <button className="up" onClick={cerrarCapas} aria-label="Cerrar bolsa">✕ Cerrar</button>
      </div>

      {/* Paso 1 · Bolsa */}
      <div className="bag-view">
        <div id="items">
          {lineas.length ? lineas.map(({ l, r }, i) => (
            <div className="it" key={`${l.id}-${l.ml}-${l.env}`}>
              <ImagenLogo src={r.img} alt={r.nom} className="mini-cart-img" width="48" height="48" />
              <div>
                <b className="up">{r.nom}</b>
                <small>{r.sub} · {fmt(r.u)}</small>
                <div className="it-actions">
                  <Cantidad valor={l.q} onMenos={() => cambiarCantidad(i, -1)} onMas={() => cambiarCantidad(i, 1)} />
                  <button className="link up it-rm" onClick={() => quitarLinea(i)}>Quitar</button>
                </div>
              </div>
              <div>{fmt(r.u * l.q)}</div>
            </div>
          )) : (
            <div className="empty">
              <p>Tu bolsa está vacía.</p>
              <p style={{ marginTop: 'var(--sp-3)' }}><Link className="link up" to="/#coleccion" onClick={cerrarCapas}>Ver colección</Link></p>
            </div>
          )}
        </div>
        <div className="tot">
          <span className="up" style={{ alignSelf: 'center' }}>Subtotal</span>
          <b>{fmt(subtotal)}</b>
        </div>
        <div className="bag-actions" style={{ display: cart.length ? '' : 'none' }}>
          <button className="btn up btn--full btn-pay" onClick={() => cart.length && setPaso('ship')}>
            <span>Hacer pedido · Pago seguro</span>
            <small>PSE · Nequi · Tarjetas</small>
          </button>
          <a className="btn btn--line up btn--full" href={cart.length ? `https://wa.me/${WA}?text=${encodeURIComponent(mensajeWa)}` : '#'} target="_blank" rel="noopener">Finalizar por WhatsApp</a>
          <div className="trust up mute">
            <span>Compra protegida</span>
            <span>Envíos a toda Colombia</span>
            <span>Garantía de calidad</span>
          </div>
          <button className="link up bag-empty" onClick={vaciarBolsa}>Vaciar bolsa</button>
        </div>
      </div>

      {/* Paso 2 · Datos de envío y pago */}
      <form className="ship-view" onSubmit={procesarPago}>
        <button type="button" className="link up ship-back" onClick={() => setPaso('bag')}>← Volver a la bolsa</button>
        <p className="mute ship-intro">Ingresa los datos para la transportadora. Luego te llevamos a Mercado Pago para pagar de forma segura.</p>
        <div className="form-err" role="alert" hidden={!error}>{error}</div>
        <div className="field-grid">
          <label className="field full"><span className="up">Nombre completo *</span>
            <input ref={primerCampo} type="text" required autoComplete="name" placeholder="Ej: Juan Pérez" {...campo('nombre')} /></label>
          <label className="field"><span className="up">Documento *</span>
            <input type="text" required inputMode="numeric" placeholder="Cédula / NIT" {...campo('documento')} /></label>
          <label className="field"><span className="up">Celular *</span>
            <input type="tel" required autoComplete="tel" placeholder="300 123 4567" {...campo('celular')} /></label>
          <label className="field full"><span className="up">Zona de envío *</span>
            <select required {...campo('zona')}>
              <option value="" disabled>Selecciona la zona</option>
              <option value="medellin">Medellín ($15.000)</option>
              <option value="metropolitana">Área Metropolitana ($20.000)</option>
              <option value="nacional">Resto de Colombia ($22.000)</option>
            </select></label>
          <label className="field full" hidden={envio.zona !== 'metropolitana'}><span className="up">Municipio *</span>
            <select required={envio.zona === 'metropolitana'} {...campo('ciudadMetro')}>
              <option value="" disabled>Selecciona el municipio</option>
              {MUNICIPIOS.map((m) => <option key={m}>{m}</option>)}
            </select></label>
          <label className="field full" hidden={envio.zona !== 'nacional'}><span className="up">Ciudad de destino *</span>
            <input type="text" required={envio.zona === 'nacional'} placeholder="Ej: Bogotá, Cali, Cartagena…" {...campo('ciudadNacional')} /></label>
          <label className="field"><span className="up">Barrio *</span>
            <input type="text" required placeholder="Nombre del barrio" {...campo('barrio')} /></label>
          <label className="field"><span className="up">Dirección *</span>
            <input type="text" required autoComplete="street-address" placeholder="Calle 123 # 45-67" {...campo('direccion')} /></label>
          <label className="field"><span className="up">Apto / Piso</span>
            <input type="text" placeholder="Ej: Apto 502" {...campo('piso')} /></label>
          <label className="field"><span className="up">Referencia</span>
            <input type="text" placeholder="Ej: Frente al parque" {...campo('referencia')} /></label>
        </div>
        <dl className="ship-sum">
          <div><dt className="up">Subtotal</dt><dd>{fmt(subtotal)}</dd></div>
          <div><dt className="up">Envío</dt><dd>{envio.zona ? fmt(costoEnvio) : 'Selecciona la zona'}</dd></div>
          <div className="ship-total"><dt className="up">Total</dt><dd>{fmt(subtotal + costoEnvio)}</dd></div>
        </dl>
        <button type="submit" className="btn up btn--full btn-pay" disabled={pagando}>
          {pagando ? 'Preparando tu pago seguro…' : (
            <>
              <span>Confirmar y pagar</span>
              <small>Compra 100% protegida · Mercado Pago</small>
            </>
          )}
        </button>
      </form>
    </aside>
  );
}
