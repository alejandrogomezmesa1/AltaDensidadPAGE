// Carrusel de perfumes afines bajo la ficha: los 1.1 que comparten el acorde principal del que se
// está viendo (algoritmo en lib/afinidad.js). El primero, el más afín, lleva una marca muy discreta.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTienda } from './TiendaContext';
import { Frasco } from './Frasco';
import { Destello } from './Marca';
import { perfumesAfines, acordePrincipal } from '../lib/afinidad';
import { fmt, pr, etiquetaColeccion } from '../lib/producto';

function Tarjeta({ r, primera, ruta }) {
  const { p, afinidad, acordes } = r;
  return (
    <li className={`afin ${primera ? 'afin--primera' : ''}`}>
      <Link to={ruta} className="afin-enlace" aria-label={`${p.n}: afinidad ${afinidad} %`}>
        <span className="afin-foto stage">
          <Frasco h={p.h} s={1} img={p.img} nombre={p.n} />
        </span>
        <span className="afin-info">
          {primera && <span className="afin-marca up"><Destello size={9} /> El más afín</span>}
          <small className="up afin-casa">{[p.b, etiquetaColeccion(p.c)].filter(Boolean).join(' · ')}</small>
          <span className="afin-nombre">{p.n}</span>
          <span className="afin-coincide">
            <span className="afin-medidor" aria-hidden="true"><i style={{ width: `${afinidad}%` }} /></span>
            Afinidad {afinidad} %
          </span>
          <span className="afin-notas">
            {acordes.map((a, i) => (
              <span key={a.nombre} className={a.compartido ? 'afin-acorde--comun' : undefined}>{i > 0 && ' · '}{a.nombre}</span>
            ))}
          </span>
          <span className="afin-precio">{p.rev ? 'Precio en revisión' : fmt(pr(p))}</span>
        </span>
      </Link>
    </li>
  );
}

export default function Afines({ producto }) {
  const { P, rutaPerfume } = useTienda();
  const afines = useMemo(() => perfumesAfines(producto, P, 12), [producto, P]);
  const principal = useMemo(() => acordePrincipal(producto), [producto]);
  const pista = useRef(null);
  const [bordes, setBordes] = useState({ inicio: true, fin: false });

  const medir = useCallback(() => {
    const el = pista.current;
    if (!el) return;
    setBordes({ inicio: el.scrollLeft < 8, fin: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
  }, []);

  // Al cambiar de perfume el carrusel vuelve al principio
  useEffect(() => {
    const el = pista.current;
    if (!el) return undefined;
    el.scrollLeft = 0;
    medir();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(medir) : null;
    ro?.observe(el);
    return () => ro?.disconnect();
  }, [producto?.id, medir]);

  const mover = (dir) => {
    const el = pista.current;
    if (!el) return;
    const paso = el.querySelector('.afin')?.getBoundingClientRect().width || el.clientWidth / 3;
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: dir * Math.max(paso, el.clientWidth - paso), behavior: reducido ? 'auto' : 'smooth' });
  };

  if (!afines.length) return null;

  return (
    <section className="afines" aria-labelledby="afines-t">
      <div className="sec-h afines-h">
        <div>
          <span className="up eyebrow">Por acorde principal</span>
          <h2 id="afines-t">Fragancias<br /><em>afines.</em></h2>
        </div>
        <div className="afines-lado">
          <p className="mute">Comparten el acorde principal de {producto.n}: <b className="afines-acorde">{principal}</b>.</p>
          {afines.length > 1 && (
            <div className="afines-flechas">
              <button type="button" onClick={() => mover(-1)} disabled={bordes.inicio} aria-label="Ver anteriores">←</button>
              <button type="button" onClick={() => mover(1)} disabled={bordes.fin} aria-label="Ver siguientes">→</button>
            </div>
          )}
        </div>
      </div>
      <ul className="afines-pista" ref={pista} onScroll={medir} tabIndex={-1}>
        {afines.map((r, i) => <Tarjeta key={r.p.id} r={r} primera={i === 0} ruta={rutaPerfume(r.p.id)} />)}
      </ul>
    </section>
  );
}
