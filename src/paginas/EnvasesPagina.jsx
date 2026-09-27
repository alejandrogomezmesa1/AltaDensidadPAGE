import { useTienda } from '../tienda/TiendaContext';
import { Envases } from '../tienda/Secciones';
import { Pastillas, Pastilla } from '../tienda/TiendaLayout';
import { usePagina, JsonLd } from '../lib/hooks';
import { normalizarImagen, urlAbsoluta } from '../lib/producto';
import { SITIO } from '../config';

export default function EnvasesPagina() {
  const { ENVASES } = useTienda();
  usePagina({
    titulo: 'Presentaciones y Envases de Perfumes | Alta Densidad',
    descripcion: 'Explora nuestras presentaciones y envases de lujo para perfumes: frascos de vidrio premium, atomizadores de alta calidad y capacidades de 30ml, 50ml y 100ml.',
    ruta: '/envases',
    ogDescripcion: 'Elige el envase ideal para tu fragancia favorita con materiales de alta calidad y acabados elegantes.'
  });

  const migas = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITIO}/` },
      { '@type': 'ListItem', position: 2, name: 'Presentaciones y Envases', item: `${SITIO}/envases` }
    ]
  };
  const lista = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Envases para perfume - Fragancias de Alta Densidad',
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    numberOfItems: ENVASES.length,
    itemListElement: ENVASES.map((z, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'Product',
        name: 'Envase ' + (z.name || z.nombre),
        image: urlAbsoluta(normalizarImagen(z.image || z.imagen), SITIO),
        description: z.description || z.descripcion || 'Envase ' + (z.name || z.nombre),
        brand: { '@type': 'Brand', name: 'Alta Densidad' }
      }
    }))
  };

  return (
    <main>
      <JsonLd datos={migas} />
      <JsonLd datos={lista} />
      <section className="sec">
        <div className="wrap">
          <div className="sec-h rv in">
            <div>
              <span className="up eyebrow">Presentaciones</span>
              <h1 className="page-t">Tu envase favorito,<br /><em>tu fragancia favorita.</em></h1>
            </div>
            <p className="mute" style={{ maxWidth: '40ch' }}>Elige el frasco que vestirá tu fragancia de alta densidad. Cada envase indica sus tamaños disponibles.</p>
          </div>
          <Envases />
        </div>
      </section>
      <Pastillas>
        <Pastilla titulo="Inspiradas en originales">
          <p className="mute">Fragancias inspiradas en las originales de diseñador, con la mejor relación calidad-precio.</p>
        </Pastilla>
        <Pastilla titulo="¿Ya elegiste tu envase?">
          <p className="mute">Pídelo ahora mismo: nuestro equipo te ayuda a combinarlo con tu fragancia.</p>
          <a className="link up" href="https://wa.me/573046477694?text=%C2%A1Hola!%20Quiero%20pedir%20una%20fragancia%20en%20uno%20de%20sus%20envases.%20%E2%9C%A8" target="_blank" rel="noopener noreferrer">Pedir por WhatsApp</a>
        </Pastilla>
        <Pastilla titulo="Feromonas">
          <p className="mute">Diseñadas para intensificar la atracción y lograr una absorción óptima en la piel.</p>
        </Pastilla>
      </Pastillas>
    </main>
  );
}
