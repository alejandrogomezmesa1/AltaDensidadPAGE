// Carrusel de perfumes afines bajo la ficha: los 1.1 que más notas comparten con el que se está
// viendo (algoritmo en lib/afinidad.js). El primero, el más afín, lleva una marca muy discreta.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTienda } from './TiendaContext';
import { Frasco } from './Frasco';
import { Destello } from './Marca';
import { perfumesAfines } from '../lib/afinidad';
import { fmt, pr, etiquetaColeccion } from '../lib/producto';

// «Rosa de Bulgaria (rosa Damascena de Bulgaria)» → «rosa de Bulgaria»
const limpiar = (nota) => nota.replace(/\s*\([^)]*\)/g, '').replace(/\.+$/, '').trim().toLowerCase();

function Tarjeta({ r, primera, ruta }) {
  const { p, comunes, total } = r;
  const notas = comunes.map((c) => limpiar(c.nota));
  const visibles = notas.slice(0, 4);
  const resto = notas.length - visibles.length;
  return (
    <li className={`afin ${primera ? 'afin--primera' : ''}`}>
      <Link to={ruta} className="afin-enlace" aria-label={`${p.n}: comparte ${comunes.length} notas`}>
        <span className="afin-foto stage">
          <Frasco h={p.h} s={1} img={p.img} nombre={p.n} />
        </span>
        <span className="afin-info">
          {primera && <span className="afin-marca up"><Destello size={9} /> El más afín</span>}
          <small className="up afin-casa">{[p.b, etiquetaColeccion(p.c)].filter(Boolean).join(' · ')}</small>
          <span className="afin-nombre">{p.n}</span>
          <span className="afin-coincide">
            <span className="afin-medidor" aria-hidden="true"><i style={{ width: `${Math.min(100, (comunes.length / Math.max(total, 1)) * 100)}%` }} /></span>
            Comparte {comunes.length} {comunes.length === 1 ? 'nota' : 'notas'}
          </span>
          <span className="afin-notas">{visibles.join(' · ')}{resto > 0 && <em> +{resto}</em>}</span>
          <span className="afin-precio">{p.rev ? 'Precio en revisión' : fmt(pr(p))}</span>
        </span>
      </Link>
    </li>
  );
}

export default function Afines({ producto }) {
  const { P, rutaPerfume } = useTienda();
  const afines = useMemo(() => perfumesAfines(producto, P, 12), [producto, P]);
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
          <span className="up eyebrow">Por notas en común</span>
          <h2 id="afines-t">Fragancias<br /><em>afines.</em></h2>
        </div>
        <div className="afines-lado">
          <p className="mute">Las que más notas comparten con {producto.n}.</p>
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
