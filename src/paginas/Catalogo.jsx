// Catálogo unificado: perfumes 1.1, armador "Crea tu perfume", kits, esencias e insumos.
// La pestaña activa vive en la URL (?ver=…) para poder enlazarla desde la portada, el menú o AURA.
import { useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTienda } from '../tienda/TiendaContext';
import { Coleccion, Kits } from '../tienda/Secciones';
import Armador from '../tienda/Armador';
import Insumos from '../tienda/Insumos';
import { usePagina } from '../lib/hooks';
import { desplazarA } from '../lib/gsap';

export const PESTANAS = [
  { clave: 'perfumes', titulo: 'Perfumes 1.1', lema: 'Réplicas 1.1 en Extrait de Parfum con feromonas, listas para llevar.' },
  { clave: 'crear', titulo: 'Crea tu perfume', lema: 'Elige el envase, el tamaño, la esencia y si lleva feromonas. Lo preparamos para ti.' },
  { clave: 'kits', titulo: 'Kits', lema: 'Sets para regalar o coleccionar, con estuche y combinaciones selectas.' },
  { clave: 'esencias', titulo: 'Esencias', lema: 'Esencias puras por mililitro para preparar tus propias fragancias.' },
  { clave: 'insumos', titulo: 'Insumos', lema: 'Envases vacíos, feromonas, bases y accesorios de perfumería.' }
];
const TIPOS_INSUMO = ['base', 'feromona', 'envase', 'accesorio'];

export default function Catalogo() {
  const [params, setParams] = useSearchParams();
  const { P, KITS } = useTienda();
  const pestanasRef = useRef(null);
  const actual = PESTANAS.find((p) => p.clave === params.get('ver')) || PESTANAS[0];
  const fraganciaInicial = Number(params.get('fragancia')) || null;

  usePagina({
    titulo: `${actual.titulo} · Catálogo | Fragancias de Alta Densidad`,
    descripcion: `${actual.lema} Perfumes 1.1, perfumes preparados a tu gusto, kits, esencias e insumos en Medellín.`,
    ruta: actual.clave === 'perfumes' ? '/catalogo' : `/catalogo?ver=${actual.clave}`
  });

  const cambiar = (clave) => {
    if (clave === actual.clave) return;
    setParams(clave === 'perfumes' ? {} : { ver: clave }, { replace: true });
    // Si la barra quedó arriba (fija), el contenido nuevo empieza desde su inicio
    const barra = pestanasRef.current;
    if (barra && barra.getBoundingClientRect().top < 120) {
      requestAnimationFrame(() => desplazarA('#catalogo-contenido', { duration: 0.6, ease: 'power2.inOut' }));
    }
  };

  const cuenta = { perfumes: P.length, kits: KITS.filter((k) => k.activo !== 0).length };

  return (
    <main className="catalogo">
      <section className="sec cat-cabecera">
        <div className="wrap">
          <span className="up eyebrow">Catálogo</span>
          <h1 className="page-t">Todo Alta Densidad,<br /><em>en un solo lugar.</em></h1>
        </div>
      </section>

      <nav className="cat-pestanas" ref={pestanasRef} aria-label="Secciones del catálogo">
        <div className="wrap" role="tablist">
          {PESTANAS.map((p, i) => (
            <button key={p.clave} type="button" role="tab" aria-selected={p.clave === actual.clave} aria-controls="catalogo-contenido"
              className={`cat-pestana up ${p.clave === actual.clave ? 'on' : ''} ${p.clave === 'crear' ? 'es-crear' : ''}`} onClick={() => cambiar(p.clave)}>
              <span className="cat-pestana-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              {p.titulo}
              {cuenta[p.clave] ? <sup>{cuenta[p.clave]}</sup> : null}
            </button>
          ))}
        </div>
      </nav>

      <div id="catalogo-contenido" role="tabpanel" aria-label={actual.titulo}>
        {actual.clave === 'perfumes' && <Coleccion titulo="Perfumes 1.1" />}
        {actual.clave !== 'perfumes' && (
          <section className="sec" id={actual.clave === 'kits' ? 'kits' : undefined}>
            <div className="wrap">
              <div className="sec-h">
                <h2>{actual.titulo}</h2>
                <p className="mute" style={{ maxWidth: '46ch' }}>{actual.lema}</p>
              </div>
              {actual.clave === 'crear' && <Armador fraganciaInicial={fraganciaInicial} />}
              {actual.clave === 'kits' && <Kits />}
              {actual.clave === 'esencias' && <Insumos tipos={['esencia']} vacio="Muy pronto encontrarás aquí nuestras esencias puras por mililitro." />}
              {actual.clave === 'insumos' && <Insumos tipos={TIPOS_INSUMO} vacio="Muy pronto encontrarás aquí envases vacíos, feromonas y accesorios." />}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
