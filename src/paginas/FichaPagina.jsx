// Enlace directo a un perfume (/perfume/<marca>/<nombre>-<id>) o a un kit (/kit/<nombre>-<id>): la
// misma ficha de la ventana de detalle, como página. Un enlace viejo o con otro texto se lleva a la
// dirección oficial; si no corresponde a nada, "no encontrado" con sugerencias.
import { useEffect } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useTienda } from '../tienda/TiendaContext';
import { DetalleProducto, DetalleKit } from '../tienda/Capas';
import NoEncontrado from './NoEncontrado';
import { usePagina, JsonLd } from '../lib/hooks';
import { pr, descripcion, etiquetaColeccion, normalizarImagen, urlAbsoluta, noDisponible } from '../lib/producto';
import { SITIO } from '../config';

export default function FichaPagina({ tipo }) {
  const params = useParams();
  const navigate = useNavigate();
  // "Volver": a la página anterior de la tienda si se llegó desde ella; si no (enlace directo), al catálogo
  const desdeLaTienda = typeof window !== 'undefined' && window.history.state && window.history.state.idx > 0;
  const slug = tipo === 'kit' ? params.slug : params['*'];
  const { idPorSlug, buscarProducto, KITS, detalle, setDetalle, kitAbierto, setKitAbierto,
    catalogoListo, kitsListos, rutaPerfume, rutaKit } = useTienda();
  const esKit = tipo === 'kit';
  const id = idPorSlug(tipo, slug);
  const perfume = !esKit && id ? buscarProducto(id) : null;
  const kit = esKit && id ? KITS.find((k) => k.id === id && k.activo !== 0) : null;
  const item = esKit ? kit : perfume;
  const listo = esKit ? kitsListos : catalogoListo;

  // La ficha lee el producto abierto del estado de la tienda
  useEffect(() => {
    if (perfume) setDetalle((d) => (d.id === perfume.id ? d : { id: perfume.id, ml: perfume.sz[0] || '', env: perfume.env[0] || '', q: 1 }));
    if (kit) setKitAbierto(kit.id);
  }, [perfume, kit, setDetalle, setKitAbierto]);

  const nombre = item ? (esKit ? kit.nombre : perfume.n) : '';
  const ruta = item ? (esKit ? rutaKit(kit.id) : rutaPerfume(perfume.id)) : `/${tipo}/${slug}`;
  const texto = item ? (esKit ? (kit.descripcion || `Kit ${nombre} de Alta Densidad.`) : descripcion(perfume)) : '';
  usePagina({
    titulo: item ? `${nombre} | Fragancias de Alta Densidad` : 'Cargando… | Fragancias de Alta Densidad',
    descripcion: String(texto).slice(0, 160),
    ruta,
    indexar: Boolean(item)
  });

  if (!item) {
    if (!listo) return <main className="sec"><div className="wrap"><p className="mute">Cargando…</p></div></main>;
    return <NoEncontrado tipo={tipo} buscado={slug} />;
  }

  const imagen = urlAbsoluta(normalizarImagen(esKit ? kit.imagen : perfume.img), SITIO);
  const datos = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: nombre,
    image: imagen,
    description: texto,
    ...(esKit ? {} : { category: etiquetaColeccion(perfume.c) }),
    brand: { '@type': 'Brand', name: esKit || !perfume.b ? 'Alta Densidad' : perfume.b },
    offers: {
      '@type': 'Offer', priceCurrency: 'COP', url: SITIO + ruta,
      price: esKit ? Number(kit.precio) : pr(perfume),
      availability: (esKit ? kit.agotado || kit.precio_revision : noDisponible(perfume) || perfume.sp)
        ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock'
    }
  };
  const abierto = esKit ? kitAbierto === kit.id : detalle.id === perfume.id;
  // Dirección oficial: los enlaces viejos o mal escritos que encontraron el producto se corrigen
  if (decodeURIComponent(window.location.pathname) !== decodeURIComponent(ruta)) return <Navigate to={ruta} replace />;

  return (
    <main className="sec ficha-pagina">
      <JsonLd datos={datos} />
      <div className="wrap">
        <nav className="ficha-migas up" aria-label="Ruta">
          <button type="button" className="ficha-volver" onClick={() => (desdeLaTienda ? navigate(-1) : navigate(esKit ? '/catalogo?ver=kits' : '/catalogo'))}>← Volver</button>
          <Link to="/">Inicio</Link><span aria-hidden="true">/</span>
          <Link to={esKit ? '/catalogo?ver=kits' : '/catalogo'}>{esKit ? 'Kits' : 'Catálogo'}</Link><span aria-hidden="true">/</span>
          <span aria-current="page">{nombre}</span>
        </nav>
        {abierto && <div className="sheet ficha-sheet">{esKit ? <DetalleKit enPagina /> : <DetalleProducto enPagina />}</div>}
      </div>
    </main>
  );
}
