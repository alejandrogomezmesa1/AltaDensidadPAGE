// Esencias e insumos a la venta: ítems de DATA marcados como visibles en el panel.
// Nombre, precio y stock vienen de DATA; foto y descripción de la ficha web.
// Lo que DATA mide en ml se vende por presentación (precio por ml × ml).
import { useState } from 'react';
import { useTienda } from './TiendaContext';
import { ImagenLogo } from './Frasco';
import { fmt, normalizarImagen } from '../lib/producto';
import { ETIQUETA_TIPO, codigoInsumo, precioInsumo } from '../lib/catalogo';
import { WA } from '../config';

function TarjetaInsumo({ i }) {
  const { agregarPorCodigo } = useTienda();
  const [ml, setMl] = useState(i.presentaciones ? i.presentaciones[0] : null);
  const bloqueo = i.revision ? 'Precio en revisión' : (i.agotado ? 'Agotado' : null);
  return (
    <article className="ins-card">
      <div className="ins-img"><ImagenLogo src={normalizarImagen(i.image)} alt={i.name} width="240" height="240" loading="lazy" decoding="async" /></div>
      <div className="ins-info">
        <small className="up mute">{[ETIQUETA_TIPO[i.type], i.category].filter(Boolean).join(' · ')}</small>
        <h3>{i.name}</h3>
        {i.description && <p className="mute">{i.description}</p>}
        {i.presentaciones && (
          <div className="pick up" role="radiogroup" aria-label="Presentación">
            {i.presentaciones.map((m) => (
              <button key={m} type="button" role="radio" aria-checked={m === ml} className={`chip ${m === ml ? 'on' : ''}`} onClick={() => setMl(m)}>{m} ml</button>
            ))}
          </div>
        )}
        <div className="ins-compra">
          <b>{fmt(precioInsumo(i, ml))}</b>
          {bloqueo
            ? <button className="link up" disabled aria-disabled="true">{bloqueo}</button>
            : <button className="link up" onClick={() => agregarPorCodigo(codigoInsumo(i.id, ml))}>Añadir</button>}
        </div>
      </div>
    </article>
  );
}

// tipos: lista de tipos de DATA a mostrar (['esencia'] o el resto)
export default function Insumos({ tipos, vacio }) {
  const { INSUMOS } = useTienda();
  if (INSUMOS === null) return <p className="mute arm-cargando">Cargando…</p>;
  const lista = INSUMOS.filter((i) => tipos.includes(i.type));
  if (!lista.length) {
    return (
      <div className="cat-vacio">
        <p>{vacio}</p>
        <a className="btn btn--line up" href={`https://wa.me/${WA}?text=${encodeURIComponent('¡Hola! Quiero información sobre esencias e insumos. ✨')}`} target="_blank" rel="noopener">Consultar por WhatsApp</a>
      </div>
    );
  }
  return <div className="ins-grid">{lista.map((i) => <TarjetaInsumo key={i.id} i={i} />)}</div>;
}
