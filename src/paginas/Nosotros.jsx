import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pastillas, Pastilla } from '../tienda/TiendaLayout';
import { usePagina } from '../lib/hooks';

// Número que cuenta hasta su valor al entrar en pantalla
function Contador({ valor }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return undefined;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let raf;
    const obs = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      obs.disconnect();
      const desde = valor > 1000 ? valor - 30 : 0;
      const inicio = performance.now();
      const paso = (t) => {
        const k = Math.min(1, (t - inicio) / 1400);
        el.textContent = Math.round(desde + (valor - desde) * (1 - Math.pow(1 - k, 3)));
        if (k < 1) raf = requestAnimationFrame(paso);
      };
      raf = requestAnimationFrame(paso);
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => { obs.disconnect(); cancelAnimationFrame(raf); };
  }, [valor]);
  return <span ref={ref}>{valor}</span>;
}

const PESTANAS = [
  { id: 'mision', titulo: 'Misión' },
  { id: 'vision', titulo: 'Visión' },
  { id: 'compromiso', titulo: 'Compromiso' }
];

function Faq({ grupo, pregunta, children }) {
  return (
    <details className="faq" name={grupo}>
      <summary>{pregunta}</summary>
      <div className="faq-a">{children}</div>
    </details>
  );
}

export default function Nosotros() {
  const [pestana, setPestana] = useState('mision');
  usePagina({
    titulo: 'Sobre Nosotros | Perfumería Artesanal y Alta Concentración en Medellín',
    descripcion: 'Conoce la historia, pasión y proceso de elaboración detrás de Fragancias de Alta Densidad en Medellín. Perfumería con máxima concentración y materias primas selectas.',
    ruta: '/nosotros',
    ogTitulo: 'Sobre Nosotros | Perfumería Artesanal Alta Densidad',
    ogDescripcion: 'Nuestra historia y compromiso con la alta perfumería y la máxima fijación en Colombia.'
  });

  return (
    <main>
      <section className="hero hero--about">
        <div className="hero-t">
          <span className="up eyebrow">Nosotros</span>
          <h1 className="disp">Fragancias de<br /><em>Alta Densidad.</em></h1>
          <p className="mute">Somos un emprendimiento joven que crea experiencias a través del aroma. Ofrecemos perfumes de larga duración, pensados para adaptarse a cada gusto olfativo y acompañarte en cada momento.</p>
          <div className="stats up">
            <div><b><Contador valor={99} />%</b>Semejanza al original</div>
            <div><b><Contador valor={1} /> día</b>Entrega máxima</div>
            <div><b><Contador valor={2028} /></b>Meta de expansión</div>
          </div>
        </div>
        <div className="stage about-show" aria-label="Fragancias insignia">
          <figure>
            <img src="/assets/img/SANTAL_33.jpg" alt="Fragancia Santal 33 - Perfumería Alta Densidad" width="200" height="250" loading="eager" decoding="async" />
            <figcaption className="up">Santal 33</figcaption>
          </figure>
          <figure className="is-center">
            <img src="/assets/img/VIP_212_BLACK.jpg" alt="Fragancia 212 VIP Black - Perfumería Alta Densidad" width="240" height="300" loading="eager" decoding="async" />
            <figcaption className="up">212 VIP Black</figcaption>
          </figure>
          <figure>
            <img src="/assets/img/ligth_blue.jpg" alt="Fragancia Light Blue - Perfumería Alta Densidad" width="200" height="250" loading="eager" decoding="async" />
            <figcaption className="up">Light Blue</figcaption>
          </figure>
        </div>
      </section>

      <section className="sec sec--alt">
        <div className="wrap split">
          <div className="rv in">
            <span className="up eyebrow">Filosofía</span>
            <h2 className="disp page-t" style={{ marginTop: 'var(--sp-3)' }}>Lo que nos<br /><em>mueve.</em></h2>
            <div className="chips up tabs" role="tablist" style={{ marginTop: 'var(--sp-4)' }}>
              {PESTANAS.map((t) => (
                <button key={t.id} className={`chip up ${pestana === t.id ? 'on' : ''}`} role="tab"
                  aria-selected={pestana === t.id} aria-controls={`tab-${t.id}`} onClick={() => setPestana(t.id)}>{t.titulo}</button>
              ))}
            </div>
          </div>
          <div className="rv in tab-panels">
            <div id="tab-mision" role="tabpanel" hidden={pestana !== 'mision'}>
              <p>Ofrecer fragancias de alta calidad a precios competitivos, brindando una experiencia de compra agradable y cercana. Buscamos que cada aroma te haga sentir cómodo, seguro y confiado, acompañándote en tu día a día.</p>
              <p>En 2028, Fragancias de Alta Densidad busca convertirse en una marca referente en Colombia, con presencia estratégica reconocida por su calidad, accesibilidad y experiencia personalizada.</p>
            </div>
            <div id="tab-vision" role="tabpanel" hidden={pestana !== 'vision'}>
              <p>Trabajamos día a día para ser confiables y accesibles, proporcionando perfumes de alta calidad. Nuestro fin es brindar fragancias únicas y exclusivas, incluyendo creaciones propias, con precios justos para que todos puedan disfrutar del arte de los perfumes.</p>
            </div>
            <div id="tab-compromiso" role="tabpanel" hidden={pestana !== 'compromiso'}>
              <p>Mantener intactos nuestros valores: calidad, servicio y accesibilidad. Siendo auténticos y escuchando siempre las sugerencias de nuestros usuarios, pues el compromiso más grande siempre será con cada uno de nuestros clientes.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="sec-h rv in">
            <h2>Todo lo que<br />necesitas saber</h2>
            <p className="mute" style={{ maxWidth: '36ch' }}>Si tu duda no está aquí, escríbenos por WhatsApp o pregúntale a AURA.</p>
          </div>
          <div className="info-grid">
            <div className="info-block rv in" id="faq">
              <h3 className="up eyebrow">Preguntas frecuentes</h3>
              <Faq grupo="faq" pregunta="¿Las feromonas verdaderamente sirven?">
                <p>Las feromonas son sustancias químicas que influyen en el comportamiento. Se crean sintéticamente para provocar reacciones seductoras y atractivas. No contienen olor y se agregan al perfume como un plus especial.</p>
              </Faq>
              <Faq grupo="faq" pregunta="¿Qué tan segura es la durabilidad?">
                <p>Nuestros perfumes son a base de esencia. Al hidratar la piel se asegura una durabilidad óptima, aunque también depende del pH de cada piel.</p>
              </Faq>
              <Faq grupo="faq" pregunta="¿Original o inspirado, cuál es mejor?">
                <p>Recreamos nuestras fragancias con esencias de alta calidad, garantizando un 99% de semejanza al producto original.</p>
              </Faq>
            </div>
            <div className="info-block rv in" id="envios">
              <h3 className="up eyebrow">Envíos</h3>
              <Faq grupo="envios" pregunta="Tiempo estimado de entrega">
                <p>Entregas inmediatas o con un máximo de un día hábil, después de confirmar el pedido y emitir la facturación electrónica.</p>
              </Faq>
              <Faq grupo="envios" pregunta="Horario de recepción de pedidos">
                <p>Pedidos antes de las 9 a.m. se entregan el mismo día. Después de esa hora quedan programados para el siguiente día hábil.</p>
              </Faq>
              <Faq grupo="envios" pregunta="Costos de envío">
                <p>Medellín $15.000 · Área Metropolitana $20.000 · Resto de Colombia $22.000. El valor se calcula automáticamente al finalizar tu pedido.</p>
              </Faq>
            </div>
            <div className="info-block rv in" id="devoluciones">
              <h3 className="up eyebrow">Devoluciones</h3>
              <Faq grupo="devoluciones" pregunta="¿Cuándo aplica una devolución?">
                <p>Solo para productos defectuosos, dañados o que no correspondan al pedido. Debe solicitarse al momento de la entrega o dentro de 2 días hábiles en caso de defecto.</p>
              </Faq>
              <Faq grupo="devoluciones" pregunta="Consideraciones importantes">
                <p>Los perfumes son productos higiénicos de uso personal: no se acepta devolución por otros motivos.</p>
                <p>Los productos no deben haber sido alterados, modificados ni sometidos a cambios extremos de temperatura.</p>
              </Faq>
            </div>
            <div className="info-block rv in" id="privacidad">
              <h3 className="up eyebrow">Política de privacidad</h3>
              <Faq grupo="privacidad" pregunta="Tratamiento de datos personales">
                <p>Basados en la Ley 1581 de 2012, aseguramos que sus datos serán tratados conforme a la ley y no para fines externos. Al usar nuestros servicios, aceptas el tratamiento de tus datos personales sin afectar su confidencialidad e integridad.</p>
              </Faq>
            </div>
          </div>
        </div>
      </section>

      <Pastillas>
        <Pastilla titulo="Inspiradas en originales">
          <p className="mute">Fragancias inspiradas en las originales de diseñador, con la mejor relación calidad-precio.</p>
        </Pastilla>
        <Pastilla titulo="Top 10 más vendidas">
          <p className="mute">Descubre las favoritas de nuestros clientes y encuentra tu próximo aroma.</p>
          <Link className="link up" to="/top10">Ver el Top 10</Link>
        </Pastilla>
        <Pastilla titulo="Feromonas">
          <p className="mute">Diseñadas para intensificar la atracción y lograr una absorción óptima en la piel.</p>
        </Pastilla>
      </Pastillas>
    </main>
  );
}
