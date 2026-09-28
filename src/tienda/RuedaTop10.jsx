// Top 10 como recorrido por la rueda olfativa: una espiral (la estela de un perfume) que va del
// borde de la rueda, donde está el nº 10, hasta su centro, donde está el nº 1. El scroll recorre las
// paradas de una en una; para llegar al nº 1 se ven todas. Sin movimiento, es una lista.
import { useMemo, useRef } from 'react';
import { useTienda } from './TiendaContext';
import { ImagenLogo } from './Frasco';
import Opiniones from './Opiniones';
import { fmt, normalizarImagen, todasLasNotas, tieneNotas, noDisponible } from '../lib/producto';
import { gsap, ScrollTrigger, Observer, useGSAP, MQ, desplazarA } from '../lib/gsap';

// ── Geometría de la rueda (viewBox 600 × 600) ──
const C = 300;
const RADIO = 258;
const VUELTAS = 1.55;
const FAMILIAS = [['Fresco', -45], ['Floral', 45], ['Ámbar', 135], ['Amaderado', 225]];

// Espiral de Arquímedes del borde al centro, muestreada; las paradas se reparten a igual distancia
// a lo largo de ella (así el punto viajero avanza lo mismo entre cada una)
function espiral(n) {
  const muestras = [];
  for (let i = 0; i <= 360; i++) {
    const t = i / 360;
    const r = RADIO * (1 - t);
    const a = -Math.PI / 2 + t * VUELTAS * 2 * Math.PI;
    muestras.push([C + r * Math.cos(a), C + r * Math.sin(a)]);
  }
  const acumulado = [0];
  for (let i = 1; i < muestras.length; i++) {
    acumulado.push(acumulado[i - 1] + Math.hypot(muestras[i][0] - muestras[i - 1][0], muestras[i][1] - muestras[i - 1][1]));
  }
  const total = acumulado[acumulado.length - 1];
  const paradas = Array.from({ length: n }, (_, k) => {
    const fraccion = n > 1 ? k / (n - 1) : 1;
    const i = acumulado.findIndex((l) => l >= fraccion * total);
    const [x, y] = muestras[Math.max(0, i)];
    // Etiqueta del número hacia afuera de la rueda
    const a = Math.atan2(y - C, x - C);
    return { fraccion, x, y, ex: x + Math.cos(a) * 20, ey: y + Math.sin(a) * 20 };
  });
  const d = muestras.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  return { d, paradas };
}

function Rueda({ geo, ranking }) {
  return (
    <div className="rueda" aria-hidden="true">
      <svg viewBox="0 0 600 600" focusable="false">
        <g className="rueda-deco">
          {[70, 140, 210, 285].map((r) => <circle key={r} cx={C} cy={C} r={r} className="rueda-anillo" />)}
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * 2 * Math.PI;
            return <line key={i} className="rueda-radio" x1={C + 40 * Math.cos(a)} y1={C + 40 * Math.sin(a)} x2={C + 285 * Math.cos(a)} y2={C + 285 * Math.sin(a)} />;
          })}
        </g>
        {FAMILIAS.map(([f, g]) => {
          const a = (g * Math.PI) / 180;
          return <text key={f} className="rueda-familia" x={C + 272 * Math.cos(a)} y={C + 272 * Math.sin(a)} textAnchor="middle">{f.toUpperCase()}</text>;
        })}
        <path className="rueda-estela-base" d={geo.d} />
        <path className="rueda-estela" d={geo.d} />
        {geo.paradas.map((p, k) => (
          <g key={ranking[k]} className="rueda-parada">
            <circle className="rueda-punto" cx={p.x} cy={p.y} r={k === geo.paradas.length - 1 ? 7 : 5} />
            <text className="rueda-num" x={p.ex} y={p.ey} textAnchor="middle" dominantBaseline="central">{ranking[k]}</text>
          </g>
        ))}
        <circle className="rueda-viajero" cx="0" cy="0" r="7" />
      </svg>
    </div>
  );
}

export default function RuedaTop10() {
  const { TOP10, abrirDetalle, buscarProducto, agregarRapido } = useTienda();
  const raizRef = useRef(null);

  // Del nº 10 al nº 1
  const paradas = useMemo(() => [...TOP10]
    .map((p, i) => ({ ...p, pos: Number(p.posicion) || i + 1 }))
    .sort((a, b) => b.pos - a.pos), [TOP10]);
  const geo = useMemo(() => espiral(paradas.length), [paradas.length]);

  useGSAP(() => {
    const raiz = raizRef.current;
    const mm = gsap.matchMedia();
    mm.add({ animar: MQ.animar, movil: MQ.movil }, ({ conditions: { animar, movil } }) => {
      if (!animar || !paradas.length) return undefined;
      const escena = raiz.querySelector('.top-escena');
      const tarjetas = gsap.utils.toArray('.top-parada', raiz);
      const puntos = raiz.querySelectorAll('.rueda-punto');
      const numeros = raiz.querySelectorAll('.rueda-num');
      const estela = raiz.querySelector('.rueda-estela');
      const viajero = raiz.querySelector('.rueda-viajero');
      const deco = raiz.querySelector('.rueda-deco');
      const cabecera = () => document.querySelector('header')?.offsetHeight || 0;
      const fijarAlto = () => raiz.style.setProperty('--alto-cabecera', `${cabecera()}px`);
      fijarAlto();
      ScrollTrigger.addEventListener('refreshInit', fijarAlto);

      // Modo escena: tarjetas apiladas y rueda a la vista (sin esta clase, es una lista)
      raiz.classList.add('en-escena');
      gsap.set(tarjetas.slice(1), { autoAlpha: 0 });

      const n = paradas.length;
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: escena,
          start: () => `top ${cabecera()}`,
          end: `+=${n * (movil ? 55 : 60)}%`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          snap: { snapTo: 'labelsDirectional', duration: { min: 0.4, max: 1 }, delay: 0.15, ease: 'power2.inOut', inertia: false }
        }
      });

      // La rueda gira despacio durante todo el recorrido (solo los anillos y radios)
      tl.to(deco, { rotation: -30, svgOrigin: `${C} ${C}`, duration: n }, 0);

      const camino = { path: estela, align: estela, alignOrigin: [0.5, 0.5] };
      paradas.forEach((p, k) => {
        const tarjeta = tarjetas[k];
        const foto = tarjeta.querySelector('.top-foto img');
        // Llegada a la parada: la tarjeta entra (la primera ya está) y su punto se enciende
        if (k > 0) {
          tl.fromTo(tarjeta, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.22, ease: 'power3.out' }, k + 0.05);
          if (foto) tl.fromTo(foto, { scale: 1.08 }, { scale: 1, duration: 0.5, ease: 'power2.out' }, k + 0.05);
        }
        tl.fromTo(puntos[k], { attr: { r: k === n - 1 ? 7 : 5 } }, { attr: { r: k === n - 1 ? 12 : 9 }, duration: 0.15, ease: 'back.out(3)' }, k + 0.05)
          .fromTo(numeros[k], { opacity: 0.4 }, { opacity: 1, duration: 0.15 }, k + 0.05)
          .addLabel(`n${p.pos}`, k + 0.5);
        // Salida hacia la siguiente: la estela se dibuja y el punto viaja por ella
        if (k < n - 1) {
          const [a, b] = [geo.paradas[k].fraccion, geo.paradas[k + 1].fraccion];
          tl.to(tarjeta, { autoAlpha: 0, y: -30, duration: 0.15, ease: 'power2.in' }, k + 0.85)
            .to(puntos[k], { attr: { r: 5 }, duration: 0.15 }, k + 0.85)
            .to(numeros[k], { opacity: 0.4, duration: 0.15 }, k + 0.85)
            .fromTo(estela, { drawSVG: `0% ${a * 100}%` }, { drawSVG: `0% ${b * 100}%`, duration: 0.3, ease: 'power2.inOut', immediateRender: k === 0 }, k + 0.8)
            .fromTo(viajero, { motionPath: { ...camino, start: a, end: a } },
              { motionPath: { ...camino, start: a, end: b }, duration: 0.3, ease: 'power2.inOut', immediateRender: k === 0 }, k + 0.8);
        }
      });
      tl.addLabel('fin', n);

      // Una parada por gesto (Observer): mientras la escena está fijada, cada gesto de rueda o de
      // dedo lleva exactamente a la parada siguiente o anterior, así nadie se salta un perfume.
      // Antes del nº 10 y después del nº 1 el scroll vuelve a ser libre. La barra de desplazamiento
      // y el teclado siguen funcionando con el scrub y el snap.
      const st = tl.scrollTrigger;
      const etiqueta = (i) => `n${paradas[i].pos}`;
      const cercana = () => gsap.utils.clamp(0, n - 1, Math.round(st.progress * tl.duration() - 0.5));
      let actual = 0;
      let ocupado = false;
      let listoEn = 0;
      const liberar = () => { ocupado = false; listoEn = performance.now() + 350; };
      const ir = (i) => {
        if (ocupado || performance.now() < listoEn) return;
        ocupado = true;
        if (i < 0 || i >= n) {
          // Fuera de la escena: se suelta el control y se sale por el borde correspondiente
          gestos.disable();
          desplazarA(i < 0 ? st.start - 4 : st.end + 4, { duration: 0.6, ease: 'power2.inOut', cabecera: false, alTerminar: liberar });
          return;
        }
        actual = i;
        desplazarA(st.labelToScroll(etiqueta(i)), { duration: 0.9, ease: 'power2.inOut', cabecera: false, alTerminar: liberar });
      };
      const gestos = Observer.create({
        target: window,
        type: 'wheel,touch',
        wheelSpeed: -1,
        tolerance: 30,
        preventDefault: true,
        onUp: () => ir(actual + 1),
        onDown: () => ir(actual - 1)
      });
      gestos.disable();
      const enEscena = ScrollTrigger.create({
        trigger: escena,
        start: () => st.start,
        end: () => st.end,
        onToggle: ({ isActive }) => {
          if (!isActive) { gestos.disable(); return; }
          if (gestos.isEnabled) return;
          gestos.enable();
          // Al entrar se asienta en la parada más cercana (salvo que ya vaya hacia una, p. ej. un atajo)
          if (!ocupado) { listoEn = 0; ir(cercana()); }
        }
      });

      // Cada número de la rueda lleva a su parada
      const irA = (e) => {
        const i = paradas.findIndex((p) => String(p.pos) === e.currentTarget.dataset.pos);
        ocupado = false;
        listoEn = 0;
        ir(i);
      };
      const botones = raiz.querySelectorAll('.top-atajo');
      botones.forEach((b) => b.addEventListener('click', irA));

      return () => {
        gestos.kill();
        enEscena.kill();
        botones.forEach((b) => b.removeEventListener('click', irA));
        ScrollTrigger.removeEventListener('refreshInit', fijarAlto);
        raiz.classList.remove('en-escena');
      };
    });
    return () => mm.revert();
  }, { scope: raizRef, dependencies: [paradas, geo], revertOnUpdate: true });

  if (!paradas.length) return null;

  return (
    <div className="top-rueda" ref={raizRef}>
      <div className="top-escena">
        <div className="top-mapa">
          <Rueda geo={geo} ranking={paradas.map((p) => p.pos)} />
          <nav className="top-atajos" aria-label="Ir a una posición del Top 10">
            {paradas.map((p, k) => (
              <button key={p.pos} type="button" className="top-atajo" data-pos={p.pos} aria-label={`Ir al número ${p.pos}`}
                style={{ left: `${(geo.paradas[k].x / 600) * 100}%`, top: `${(geo.paradas[k].y / 600) * 100}%` }} />
            ))}
          </nav>
        </div>

        <ol className="top-paradas" reversed>
          {paradas.map((p) => {
            const pId = p.producto_id || p.id;
            const nom = p.nombre || p.name || p.n;
            const ficha = buscarProducto(pId);
            const notas = ficha && (tieneNotas(ficha) ? todasLasNotas(ficha) : ficha.ac).slice(0, 4).join(' · ');
            const meta = [ficha && ficha.b, ficha && ficha.f, p.genero || p.gender].filter(Boolean).join(' · ');
            const bloqueo = p.precio_revision ? 'En revisión' : (ficha && noDisponible(ficha) ? 'Agotado' : null);
            const desc = p.descripcion || (ficha && ficha.desc) || '';
            return (
              <li className="top-parada" key={p.pos}>
                <div className="top-foto" onClick={() => abrirDetalle(pId)}>
                  <ImagenLogo src={normalizarImagen(p.imagen || p.image || p.img)} alt={nom} width="480" height="480" loading={p.pos >= 8 ? 'eager' : 'lazy'} decoding="async" />
                </div>
                <div className="top-info">
                  <span className="top-num" aria-label={`Número ${p.pos}`}><small>Nº</small>{p.pos}</span>
                  {meta && <small className="up top-meta">{meta}</small>}
                  <h3 className="top-nombre">{nom}</h3>
                  {notas && <p className="top-notas">{notas}</p>}
                  {desc && <p className="top-desc">{desc}</p>}
                  <div className="top-compra">
                    <span className="top-precio">{bloqueo === 'En revisión' ? 'Precio en revisión' : fmt(Number(p.precio || p.price || p.p || 0))}</span>
                    <button type="button" className="btn btn--line up" onClick={() => abrirDetalle(pId)}>Ver ficha</button>
                    <button type="button" className="btn up" disabled={!!bloqueo} onClick={() => agregarRapido(pId)}>{bloqueo || 'Añadir'}</button>
                  </div>
                  <Opiniones productoId={pId} rating={p.rating} />
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
