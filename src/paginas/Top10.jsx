import { Link } from 'react-router-dom';
import { useTienda } from '../tienda/TiendaContext';
import { Ranking } from '../tienda/Secciones';
import { Pastillas, Pastilla } from '../tienda/TiendaLayout';
import { usePagina, JsonLd } from '../lib/hooks';
import { normalizarImagen, urlAbsoluta } from '../lib/producto';
import { SITIO } from '../config';

export default function Top10() {
  const { TOP10 } = useTienda();
  usePagina({
    titulo: 'Top 10 Perfumes Más Vendidos | Fragancias de Alta Densidad',
    descripcion: 'Descubre el ranking oficial de los 10 perfumes más vendidos y mejor valorados de Alta Densidad. Fragancias de alta concentración para hombre y mujer en Colombia.',
    ruta: '/top10',
    ogDescripcion: 'Ranking de las fragancias favoritas de nuestros clientes. Máxima fijación y aromas irresistibles.'
  });

  const url = `${SITIO}/top10`;
  const migas = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITIO}/` },
      { '@type': 'ListItem', position: 2, name: 'Top 10 Más Vendidas', item: url }
    ]
  };
  const lista = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Top 10 perfumes más vendidos - Fragancias de Alta Densidad',
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    numberOfItems: TOP10.length,
    itemListElement: TOP10.map((t, idx) => {
      const precio = Number(t.precio || t.price || 0);
      const item = {
        '@type': 'Product',
        name: t.nombre || t.name,
        image: urlAbsoluta(normalizarImagen(t.imagen || t.image), SITIO),
        description: t.descripcion || t.nombre || t.name,
        brand: { '@type': 'Brand', name: 'Alta Densidad' }
      };
      if (precio) item.offers = { '@type': 'Offer', priceCurrency: 'COP', price: precio, availability: 'https://schema.org/InStock', url };
      return { '@type': 'ListItem', position: idx + 1, item };
    })
  };

  return (
    <main>
      <JsonLd datos={migas} />
      <JsonLd datos={lista} />
      <section className="sec">
        <div className="wrap">
          <div className="sec-h rv in">
            <div>
              <span className="up eyebrow">Tendencias del mes</span>
              <h1 className="page-t">Top 10<br /><em>más pedidos</em></h1>
            </div>
            <p className="mute" style={{ maxWidth: '38ch' }}>Las diez fragancias que más se llevan nuestros clientes este mes. Toca una para ver su pirámide olfativa y añadirla a tu bolsa.</p>
          </div>
          <Ranking />
        </div>
      </section>
      <Pastillas>
        <Pastilla titulo="Inspiradas en originales">
          <p className="mute">Fragancias inspiradas en las originales de diseñador, con la mejor relación calidad-precio.</p>
        </Pastilla>
        <Pastilla titulo="Variedad de envases">
          <p className="mute">Cilindro, Cartier, Swarovski y más, en distintos tamaños y colores.</p>
          <Link className="link up" to="/envases">Ver envases disponibles</Link>
        </Pastilla>
        <Pastilla titulo="Feromonas">
          <p className="mute">Diseñadas para intensificar la atracción y lograr una absorción óptima en la piel.</p>
        </Pastilla>
      </Pastillas>
    </main>
  );
}
