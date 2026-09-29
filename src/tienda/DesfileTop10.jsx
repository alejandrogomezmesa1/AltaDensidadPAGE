// Top 10 como desfile editorial: con la escena fijada, el scroll desliza en horizontal una fila de
// perfumes del nº 10 al nº 1. El movimiento sigue al scroll de forma continua (sin saltos): cada
// pieza se enciende, crece y enfoca según lo cerca que esté del centro, y el gran número y la foto
// se desplazan a distinto ritmo (paralaje). Un riel abajo marca el avance y lleva a cada posición.
// Sin movimiento (prefers-reduced-motion), es una lista.
import { useMemo, useRef } from 'react';
import { useTienda } from './TiendaContext';
import { ImagenLogo } from './Frasco';
import Opiniones from './Opiniones';
import { fmt, normalizarImagen, todasLasNotas, tieneNotas, noDisponible } from '../lib/producto';
import { gsap, ScrollTrigger, useGSAP, MQ, desplazarA } from '../lib/gsap';

export default function DesfileTop10() {
  const { TOP10, abrirDetalle, buscarProducto, agregarRapido } = useTienda();
  const raizRef = useRef(null);

  // Del nº 10 al nº 1
  const paradas = useMemo(() => [...TOP10]
    .map((p, i) => ({ ...p, pos: Number(p.posicion) || i + 1 }))
    .sort((a, b) => b.pos - a.pos), [TOP10]);

  useGSAP(() => {
    const raiz = raizRef.current;
    const mm = gsap.matchMedia();
    mm.add({ animar: MQ.animar, movil: MQ.movil }, ({ conditions: { animar, movil } }) => {
      const n = paradas.length;
      if (!animar || n < 2) return undefined;
      const escena = raiz.querySelector('.desfile-escena');
      const pista = raiz.querySelector('.top-paradas');
      const piezas = gsap.utils.toArray('.top-parada', raiz);
      const riel = raiz.querySelector('.desfile-riel-lleno');
      const marcas = gsap.utils.toArray('.desfile-marca', raiz);
      const cabecera = () => document.querySelector('header')?.offsetHeight || 0;
      const fijarAlto = () => raiz.style.setProperty('--alto-cabecera', `${cabecera()}px`);
      fijarAlto();
      ScrollTrigger.addEventListener('refreshInit', fijarAlto);

      // Modo escena: fila horizontal a pantalla completa (sin esta clase, es una lista)
      raiz.classList.add('en-escena');

      // Desplazamiento de la pista para centrar la pieza k (las piezas miden lo mismo)
      const centro = (k) => piezas[k].offsetLeft + piezas[k].offsetWidth / 2;
      const xPara = (k) => escena.clientWidth / 2 - centro(k);

      // Cada pieza se pinta según su distancia al centro (d = 0 en el centro, 1 una posición al
      // lado). Es una función continua del avance: cualquier punto del recorrido se ve bien.
      const ajustes = piezas.map((pieza) => ({
        pieza: gsap.quickSetter(pieza, 'css'),
        foto: gsap.quickSetter(pieza.querySelector('.top-foto img'), 'css'),
        num: gsap.quickSetter(pieza.querySelector('.top-num'), 'css'),
        info: gsap.quickSetter(pieza.querySelector('.top-info-cuerpo'), 'css')
      }));
      let ultimo = -1;
      const pintar = (avance) => {
        const pos = avance * (n - 1);
        ajustes.forEach((a, k) => {
          const d = k - pos;
          const lejos = Math.min(1, Math.abs(d));
          const suave = lejos * lejos * (3 - 2 * lejos); // smoothstep
          a.pieza({ scale: 1 - 0.14 * suave, opacity: 1 - 0.62 * suave, zIndex: lejos < 0.5 ? 2 : 1 });
          a.foto({ xPercent: gsap.utils.clamp(-1.5, 1.5, d) * -7 });
          a.num({ xPercent: gsap.utils.clamp(-1.5, 1.5, d) * 35, opacity: 1 - suave });
          a.info({ opacity: 1 - suave, y: suave * 24 });
        });
        riel.style.transform = `scaleX(${avance})`;
        const i = Math.round(pos);
        if (i !== ultimo) {
          ultimo = i;
          marcas.forEach((m, j) => m.classList.toggle('es-actual', j === i));
          piezas.forEach((p, j) => p.toggleAttribute('inert', j !== i));
        }
      };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: escena,
          start: () => `top ${cabecera()}`,
          end: () => `+=${(n - 1) * window.innerHeight * (movil ? 0.55 : 0.7)}`,
          pin: true,
          scrub: 0.9,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          // Al detenerse, se asienta suave en la pieza más cercana en la dirección del gesto
          snap: { snapTo: 1 / (n - 1), delay: 0.2, duration: { min: 0.35, max: 0.9 }, ease: 'power2.out' }
        }
      });
      tl.fromTo(pista, { x: () => xPara(0) }, {
        x: () => xPara(n - 1),
        ease: 'none',
        duration: 1,
        onUpdate: () => pintar(tl.progress())
      });
      pintar(0);

      // Cada marca del riel lleva a su posición
      const st = tl.scrollTrigger;
      const irA = (e) => {
        const i = marcas.indexOf(e.currentTarget);
        desplazarA(st.start + (i / (n - 1)) * (st.end - st.start), { duration: 1.1, ease: 'power3.inOut', cabecera: false });
      };
      marcas.forEach((m) => m.addEventListener('click', irA));

      return () => {
        marcas.forEach((m) => m.removeEventListener('click', irA));
        piezas.forEach((p) => p.removeAttribute('inert'));
        ScrollTrigger.removeEventListener('refreshInit', fijarAlto);
        raiz.classList.remove('en-escena');
      };
    });
    return () => mm.revert();
  }, { scope: raizRef, dependencies: [paradas], revertOnUpdate: true });

  if (!paradas.length) return null;

  return (
    <div className="desfile" ref={raizRef}>
      <div className="desfile-escena">
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
                  <ImagenLogo src={normalizarImagen(p.imagen || p.image || p.img)} alt={nom} width="480" height="600" loading={p.pos >= 8 ? 'eager' : 'lazy'} decoding="async" />
                </div>
                <div className="top-info">
                  <span className="top-num" aria-label={`Número ${p.pos}`}><small>Nº</small>{p.pos}</span>
                  <div className="top-info-cuerpo">
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
                </div>
              </li>
            );
          })}
        </ol>

        <nav className="desfile-riel" aria-label="Ir a una posición del Top 10">
          <div className="desfile-linea">
            <span className="desfile-riel-lleno" />
            {paradas.map((p, k) => (
              <button key={p.pos} type="button" className="desfile-marca" aria-label={`Ir al número ${p.pos}`}
                style={{ left: `${(k / (paradas.length - 1 || 1)) * 100}%` }}>
                <span>{p.pos}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
