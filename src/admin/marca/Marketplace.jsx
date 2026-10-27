// Publicaciones listas para Facebook Marketplace: una por perfume, con nombre propio de Alta Densidad,
// título, precio, género y una descripción que engancha en la primera línea (lo único que se ve en el
// listado). El precio y la disponibilidad salen en vivo del catálogo; el pie (envíos, pagos, contacto)
// se edita una vez y aplica a todas. Nunca se publican marcas ni nombres de otras casas.
import { useEffect, useMemo, useState } from 'react';
import { apiJson } from '../../lib/api';
import { toastOk } from '../comunes';
import { copiarTexto } from './utilidades';
import PUBLICACIONES from './marketplace.json';

const PIE_INICIAL = [
  '📦 Envíos a toda Colombia · también puedes recogerlo en Medellín',
  '💳 Paga por Nequi, Daviplata o transferencia',
  '💬 Escríbeme y te ayudo a elegir tu fragancia 👇'
].join('\n');
const CLAVE_PIE = 'admin_marketplace_pie';
const GENERO = { Masculino: 'Hombre', Femenino: 'Mujer', Unisex: 'Unisex' };
const PARA = { Masculino: 'Para hombre', Femenino: 'Para mujer', Unisex: 'Unisex' };

const pesos = (n) => `$${Math.round(Number(n) || 0).toLocaleString('es-CO')}`;
const tamano = (p) => String(p?.sizes?.[0] || '100ml').replace(/ml$/i, ' ml');
const normalizar = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

function leerPie() {
  try { return localStorage.getItem(CLAVE_PIE) || PIE_INICIAL; } catch { return PIE_INICIAL; }
}

export function tituloDe(pub, prod) {
  return `Perfume ${GENERO[prod?.gender] || ''} ${pub.nombre} ${tamano(prod)} · Alta Densidad`.replace(/\s+/g, ' ').trim();
}

export function descripcionDe(pub, prod, pie) {
  const { salida, corazon, fondo } = pub.notas;
  return [
    pub.gancho,
    '',
    `✨ ${pub.nombre}: ${pub.sensacion}`,
    '',
    salida.length ? `🍋 Salida: ${salida.join(', ')}` : null,
    corazon.length ? `🌸 Corazón: ${corazon.join(', ')}` : null,
    fondo.length ? `🪵 Fondo: ${fondo.join(', ')}` : null,
    '',
    `👤 ${PARA[prod?.gender] || 'Unisex'} · ${tamano(prod)} · familia ${pub.familia.toLowerCase()}`,
    '💎 Fragancia de alta concentración',
    `📍 Ideal para: ${pub.ideal}`,
    '',
    pie.trim()
  ].filter((l) => l !== null).join('\n');
}

function Publicacion({ pub, prod, pie }) {
  const [abierta, setAbierta] = useState(false);
  const titulo = tituloDe(pub, prod);
  const texto = descripcionDe(pub, prod, pie);
  const agotado = Number(prod?.agotado) === 1;
  const copiar = async (t, aviso) => { await copiarTexto(t); toastOk(aviso); };

  return (
    <li className={`marca-mp ${agotado ? 'marca-mp--agotado' : ''}`}>
      <header className="marca-mp-cabeza">
        <div>
          <span className="marca-mute marca-mp-num">Nº {String(pub.n).padStart(3, '0')}</span>
          <h3>{pub.nombre}</h3>
        </div>
        <div className="marca-mp-precio">
          <b>{prod ? pesos(prod.price) : '—'}</b>
          <span className={`marca-chip ${agotado ? 'marca-chip--descartada' : 'marca-chip--aprobada'}`}>{agotado ? 'Agotado' : 'Disponible'}</span>
        </div>
      </header>
      <p className="marca-mp-datos">{GENERO[prod?.gender] || '—'} · {tamano(prod)} · {pub.familia}</p>

      <div className="marca-mp-campo">
        <span className="marca-eyebrow">TÍTULO</span>
        <p>{titulo}</p>
      </div>
      <div className="marca-mp-campo">
        <span className="marca-eyebrow">DESCRIPCIÓN</span>
        <pre className={abierta ? 'abierta' : ''}>{texto}</pre>
        <button type="button" className="marca-limpiar" onClick={() => setAbierta(!abierta)}>{abierta ? 'Ver menos' : 'Ver completa'}</button>
      </div>

      <div className="marca-mp-acciones">
        <button type="button" className="btn-secondary" onClick={() => copiar(titulo, 'Título copiado')}><i className="far fa-copy" /> Título</button>
        <button type="button" className="btn-secondary" disabled={!prod} onClick={() => copiar(String(Math.round(Number(prod.price))), 'Precio copiado')}><i className="far fa-copy" /> Precio</button>
        <button type="button" className="btn-primary" onClick={() => copiar(texto, 'Descripción copiada')}><i className="far fa-copy" /> Descripción</button>
      </div>
      {prod && (
        <p className="marca-mp-ref" title="Solo para saber qué esencia preparar. Nunca lo escribas en Marketplace: es marca de otra casa.">
          <i className="fas fa-lock" aria-hidden="true" /> Ref. interna (no publicar): {prod.name}
        </p>
      )}
    </li>
  );
}

export default function Marketplace({ alerta }) {
  const [productos, setProductos] = useState(null);
  const [pie, setPie] = useState(leerPie);
  const [editandoPie, setEditandoPie] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [genero, setGenero] = useState('');
  const [soloDisponibles, setSoloDisponibles] = useState(false);

  useEffect(() => {
    apiJson('productos')
      .then((r) => setProductos(new Map((r.data || []).map((p) => [p.id, p]))))
      .catch((err) => { setProductos(new Map()); alerta('No se pudieron leer los precios del catálogo: ' + err.message, 'error'); });
  }, [alerta]);

  const guardarPie = (t) => {
    setPie(t);
    try { localStorage.setItem(CLAVE_PIE, t); } catch { /* sin almacenamiento */ }
  };

  const lista = useMemo(() => {
    const q = normalizar(busqueda);
    return PUBLICACIONES.filter((pub) => {
      const prod = productos?.get(pub.id);
      if (productos && !prod) return false; // producto desactivado o borrado de la tienda
      if (genero && prod?.gender !== genero) return false;
      if (soloDisponibles && Number(prod?.agotado) === 1) return false;
      if (!q) return true;
      return normalizar(`${pub.nombre} ${pub.familia} ${pub.sensacion} ${Object.values(pub.notas).flat().join(' ')} ${prod?.name || ''}`).includes(q);
    });
  }, [productos, busqueda, genero, soloDisponibles]);

  return (
    <div className="marca-mpv">
      <p className="marca-mute marca-pers-ayuda">
        Una publicación por perfume, con su nombre propio de Alta Densidad. La primera línea es el gancho: es lo que la gente lee en la lista de Marketplace.
        Copia título, precio y descripción; las fotos están en Piezas → «Facebook Marketplace». Nunca escribas en la publicación la referencia interna.
      </p>

      <section className="marca-mp-pie">
        <div className="marca-fila marca-fila--fin">
          <span className="marca-eyebrow">PIE DE TODAS LAS DESCRIPCIONES · ENVÍOS, PAGOS Y CONTACTO</span>
          <button type="button" className="btn-secondary" onClick={() => setEditandoPie(!editandoPie)}>
            <i className={editandoPie ? 'fas fa-check' : 'fas fa-pen'} /> {editandoPie ? 'Listo' : 'Editar'}
          </button>
        </div>
        {editandoPie ? (
          <>
            <textarea rows={4} value={pie} maxLength={600} onChange={(e) => guardarPie(e.target.value)} />
            <button type="button" className="marca-limpiar" onClick={() => guardarPie(PIE_INICIAL)}>Volver al texto inicial</button>
          </>
        ) : <pre>{pie}</pre>}
      </section>

      <div className="marca-filtros">
        <div className="search-box">
          <i className="fas fa-search" />
          <input type="search" className="admin-search-input" placeholder="Nombre, nota o familia…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </div>
        <div className="marca-segmento" role="group" aria-label="Género">
          {[['', 'Todos'], ['Masculino', 'Hombre'], ['Femenino', 'Mujer'], ['Unisex', 'Unisex']].map(([k, t]) => (
            <button key={t} type="button" className={genero === k ? 'activo' : ''} onClick={() => setGenero(k)}>{t}</button>
          ))}
        </div>
        <button type="button" className={`marca-toggle ${soloDisponibles ? 'activo' : ''}`} onClick={() => setSoloDisponibles(!soloDisponibles)} aria-pressed={soloDisponibles}>
          <i className="fas fa-check" /> Solo disponibles
        </button>
      </div>
      <p className="marca-mute marca-mp-cuenta">{productos ? `${lista.length} publicaciones` : 'Cargando precios del catálogo…'}</p>

      <ul className="marca-mp-grid">
        {lista.map((pub) => <Publicacion key={pub.id} pub={pub} prod={productos?.get(pub.id)} pie={pie} />)}
      </ul>
    </div>
  );
}
