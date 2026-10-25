// Sección Mayoristas: el material para mayoristas en un solo bloque, con sus dos generadores juntos:
//   · Catálogo personalizado: para que el mayorista se lo muestre a sus clientes (su marca, su WhatsApp).
//   · Lista de precios mayoristas: lo que le cuesta cada perfume, con foto.
// El último PDF de cada uno queda guardado en este navegador (IndexedDB) para descargarlo de nuevo.
import { useCallback, useEffect, useState } from 'react';
import { apiJson } from '../lib/api';
import CatalogoReventa from './CatalogoReventa';
import ListaMayoristas, { descargarPdf, seleccionarMayoristas } from './ListaMayoristas';

const pesos = (v) => `$${Math.round(Number(v) || 0).toLocaleString('es-CO')}`;

// ── Últimos PDF guardados en el navegador ──
const BD = 'ad_material_mayoristas';
function abrirBd() {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open(BD, 1);
    r.onupgradeneeded = () => r.result.createObjectStore('pdf');
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}
async function guardarPdf(tipo, pdf) {
  try {
    const blob = await (await fetch(pdf.url)).blob();
    const bd = await abrirBd();
    const registro = { nombre: pdf.nombre, paginas: pdf.paginas, fecha: new Date().toISOString(), blob };
    await new Promise((ok, mal) => { const t = bd.transaction('pdf', 'readwrite'); t.objectStore('pdf').put(registro, tipo); t.oncomplete = ok; t.onerror = () => mal(t.error); });
    return registro;
  } catch { return null; }
}
async function leerPdfs() {
  try {
    const bd = await abrirBd();
    const leer = (tipo) => new Promise((ok) => { const r = bd.transaction('pdf').objectStore('pdf').get(tipo); r.onsuccess = () => ok(r.result || null); r.onerror = () => ok(null); });
    return { catalogo: await leer('catalogo'), lista: await leer('lista') };
  } catch { return { catalogo: null, lista: null }; }
}
const fechaCorta = (iso) => new Date(iso).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

function Tarjeta({ icono, titulo, para, descripcion, datos, ultimo, onAbrir, cargando }) {
  const descargar = () => {
    const url = URL.createObjectURL(ultimo.blob);
    descargarPdf({ url, nombre: ultimo.nombre });
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };
  return (
    <article className="mayoristas-tarjeta">
      <header>
        <span className="mayoristas-icono"><i className={`fas ${icono}`} /></span>
        <div>
          <span className="mayoristas-para">{para}</span>
          <h3>{titulo}</h3>
        </div>
      </header>
      <p>{descripcion}</p>
      <ul className="mayoristas-datos">{datos.map((d) => <li key={d}>{d}</li>)}</ul>
      <div className="mayoristas-acciones">
        <button type="button" className="btn-primary" onClick={onAbrir} disabled={cargando}>
          <i className="fas fa-file-pdf" /> Generar PDF
        </button>
        {ultimo
          ? <button type="button" className="btn-secondary" onClick={descargar} title={ultimo.nombre}>
              <i className="fas fa-download" /> Último ({fechaCorta(ultimo.fecha)})
            </button>
          : <span className="mayoristas-vacio">Aún no se ha generado en este navegador</span>}
      </div>
    </article>
  );
}

export default function MayoristasAdmin({ alerta }) {
  const [productos, setProductos] = useState(null);
  const [kits, setKits] = useState([]);
  const [precios, setPrecios] = useState(null);
  const [abierto, setAbierto] = useState(null); // 'catalogo' | 'lista'
  const [ultimos, setUltimos] = useState({ catalogo: null, lista: null });

  const cargar = useCallback(async () => {
    try {
      const [p, k, pr] = await Promise.all([
        apiJson('productos'), apiJson('kits').catch(() => ({ data: [] })), apiJson('admin/integracion/precios-mayoristas')
      ]);
      setProductos(p.data || []);
      setKits(k.data || []);
      setPrecios(pr.data);
    } catch (e) {
      alerta('No se pudo cargar el material para mayoristas: ' + e.message, 'error');
    }
  }, [alerta]);
  useEffect(() => { cargar(); leerPdfs().then(setUltimos); }, [cargar]);

  const listo = (tipo) => async (pdf) => {
    const r = await guardarPdf(tipo, pdf);
    if (r) setUltimos((u) => ({ ...u, [tipo]: r }));
  };

  const cargando = !productos || !precios;
  const conFicha = (productos || []).filter((p) => !!Number(p.activo) && !p.soloPreparado && !p.priceReview && Number(p.price) > 0
    && p.brand && ['top', 'heart', 'base'].every((k) => (p.notes?.[k] || []).length)).length;
  const enLista = productos && precios ? seleccionarMayoristas(productos, precios, { disponibilidad: 'todos', categoria: 'todas', generos: ['Masculino', 'Femenino', 'Unisex'], orden: 'marca' }).lista.length : 0;
  const r = precios?.regla;

  return (
    <>
      <div className="admin-toolbar">
        <h2 className="section-title">Mayoristas</h2>
        <div className="admin-toolbar-actions">
          <button type="button" className="btn-secondary" onClick={cargar}><i className="fas fa-sync-alt" /> Actualizar precios</button>
        </div>
      </div>

      <section className="mayoristas-grupo" aria-labelledby="mayoristas-titulo">
        <div className="mayoristas-grupo-cabecera">
          <h3 id="mayoristas-titulo">Material para mayoristas</h3>
          <p>
            Dos PDF con el mismo diseño y la marca de agua de Alta Densidad.
            {r && <> Precio mayorista: nuestro precio menos {pesos(r.lowDiscount)} hasta {pesos(r.lowUpTo)}, {pesos(r.midDiscount)} hasta {pesos(r.midUpTo)} y {pesos(r.highDiscount)} por encima.</>}
          </p>
          {precios && !precios.verificado && (
            <p className="mayoristas-aviso"><i className="fas fa-exclamation-triangle" /> {precios.motivo}: los precios mayoristas salen con la regla, sin comparar con el costo.</p>
          )}
        </div>
        <div className="mayoristas-tarjetas">
          <Tarjeta
            icono="fa-book-open" para="Para sus clientes" titulo="Catálogo personalizado"
            descripcion="Con el logo, las redes y el WhatsApp del mayorista. Su precio de venta es el nuestro más su ganancia, así nuestro precio se ve más bajo."
            datos={cargando ? ['Cargando…'] : [`${conFicha} perfumes con ficha completa`, 'Fotos, notas y enlace a WhatsApp en cada tarjeta']}
            ultimo={ultimos.catalogo} onAbrir={() => setAbierto('catalogo')} cargando={cargando}
          />
          <Tarjeta
            icono="fa-tags" para="Para el mayorista" titulo="Lista de precios mayoristas"
            descripcion="Lo que le cuesta cada perfume, con su foto, junto al precio al público: la diferencia es su ganancia."
            datos={cargando ? ['Cargando…'] : [`${enLista} perfumes con precio mayorista`, 'Por secciones: para él, para ella y unisex']}
            ultimo={ultimos.lista} onAbrir={() => setAbierto('lista')} cargando={cargando}
          />
        </div>
      </section>

      {productos && precios && (
        <>
          <CatalogoReventa abierto={abierto === 'catalogo'} onCerrar={() => setAbierto(null)} productos={productos} precios={precios}
            alerta={alerta} onListo={listo('catalogo')} />
          <ListaMayoristas abierto={abierto === 'lista'} onCerrar={() => setAbierto(null)} productos={productos} kits={kits} precios={precios}
            alerta={alerta} onListo={listo('lista')} />
        </>
      )}
    </>
  );
}
