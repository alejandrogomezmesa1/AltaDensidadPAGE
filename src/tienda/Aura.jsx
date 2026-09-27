// AURA — Asesora olfativa virtual. Responde con la IA del backend (/api/chatbot) y, si no está
// disponible, en modo básico con el catálogo y las preguntas frecuentes.
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTienda } from './TiendaContext';
import { useClaseBody } from '../lib/hooks';
import { LOGO, normalizarImagen } from '../lib/producto';
import { API } from '../config';
import { DATOS_DUROS_PRODUCTOS, DATOS_DUROS_KITS } from '../data/catalogo';

const CHAT_API = `${API}/chatbot`;
const HISTORIAL_KEY = 'ad_chat_history_v2';
const SESSION_ID_KEY = 'ad_ai_session_id';
const WA_AURA = 'https://wa.me/3046477694?text=%C2%A1Hola%21%20%F0%9F%91%8B%20Estoy%20consultando%20el%20asistente%20virtual%20AURA%20y%20me%20gustar%C3%ADa%20hablar%20con%20un%20asesor%20humano.%20%E2%9C%A8';

// La API devuelve campos en español o inglés según la tabla; estos helpers aceptan ambos
const prodNombre = (p) => p.name || p.nombre || '';
const prodCategoria = (p) => p.category || p.categoria || '';
const prodGenero = (p) => p.gender || p.genero || '';
const prodDescripcion = (p) => p.description || p.descripcion || '';
const prodPrecio = (p) => Number(p.price || p.precio || 0);
const prodImagen = (p) => p.image || p.imagen || LOGO;
const prodId = (p) => p.id || p._id || '';

function sanitizar(texto) {
  return String(texto).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Base de conocimiento: respuestas exactas que no gastan la IA
const KNOWLEDGE_BASE = {
  feromonas: {
    keywords: ['feromona', 'afrodisiaco'],
    respuesta: `✨ <strong>Nuestra Fórmula con Feromonas & Concentración Extrait de Parfum</strong>:<br><br>
Todas nuestras fragancias están elaboradas exclusivamente en concentración <em>Extrait de Parfum</em> (la más alta y pura de la perfumería internacional) e integran microcápsulas de feromonas sintéticas de alta afinidad que reaccionan con el calor de tu piel, potenciando la proyección y el atractivo magnético.`
  },
  duracion: {
    keywords: ['duracion', 'duración', 'cuanto dura', 'cuánto dura', 'fijacion', 'fijación', 'longevidad', 'desvanece'],
    respuesta: `⏳ <strong>Fijación Superior Garantizada (+12 Horas)</strong>:<br><br>
Gracias a nuestra formulación pura en <em>Extrait de Parfum</em>, nuestras fragancias duran más de <strong>12 a 16 horas en piel</strong> y permanecen varios días en prendas de vestir. No usamos alcoholes industriales ni diluciones ligeras.`
  },
  envios: {
    keywords: ['envio', 'envío', 'envios', 'envíos', 'domicilio', 'tiempo de entrega', 'cuanto se demora', 'cuánto se demora', 'despacho', 'flete'],
    respuesta: `🚚 <strong>Cobertura y Tiempos de Envío en Colombia</strong>:<br><br>
• <strong>Medellín (Urbano):</strong> Entregas en 24h hábiles ($15.000 COP).<br>
• <strong>Área Metropolitana (Bello, Itagüí, Envigado, Sabaneta, etc.):</strong> ($20.000 COP).<br>
• <strong>Nacional (Bogotá, Cali, Barranquilla y todo el país):</strong> 2 a 3 días hábiles vía Servientrega / Interrapidísimo ($22.000 COP).`
  },
  pagos: {
    keywords: ['pago', 'pagar', 'metodos de pago', 'nequi', 'pse', 'tarjeta', 'transferencia', 'bancolombia'],
    respuesta: `💳 <strong>Métodos de Pago 100% Seguros</strong>:<br><br>
• <strong>Pago Online Directo:</strong> Mercado Pago con PSE, Nequi, Tarjetas Débito y Crédito.<br>
• <strong>Pago por WhatsApp:</strong> Transferencia Bancolombia, Nequi o Daviplata coordinando con un asesor humano.`
  },
  ubicacion: {
    keywords: ['ubicacion', 'ubicación', 'donde estan', 'tienda fisica', 'direccion', 'dirección', 'local'],
    respuesta: `📍 <strong>Nuestra Sede en Medellín</strong>:<br><br>
Estamos ubicados en la <strong>Calle 77c # 91b - 74, Medellín, Antioquia</strong>. Atendemos pedidos y despachos a nivel nacional con entregas garantizadas.`
  }
};

const CHIPS_INICIO = [
  { label: '👑 Perfumes de Mujer', query: 'recomendar perfumes de mujer' },
  { label: '🪵 Perfumes de Hombre', query: 'recomendar perfumes de hombre' },
  { label: '🌙 Perfumería Árabe', query: 'perfumes arabes' },
  { label: '🧪 ¿Tienen Feromonas?', query: 'como funcionan las feromonas y duracion' },
  { label: '🚚 Costos de Envío', query: 'cuanto cuesta el envio' }
];

// Motor local de recomendación y respuestas (modo básico)
function procesarConsulta(query, productos, kits) {
  const q = query.toLowerCase().trim();

  for (const clave in KNOWLEDGE_BASE) {
    const seccion = KNOWLEDGE_BASE[clave];
    if (seccion.keywords.some((k) => q.includes(k))) {
      return {
        texto: seccion.respuesta,
        chips: [
          { label: '✨ Ver Perfumes de Mujer', query: 'recomendar perfumes de mujer' },
          { label: '💼 Ver Perfumes de Hombre', query: 'recomendar perfumes de hombre' },
          { label: '📲 Hablar con un Asesor Humano', query: 'asesor whatsapp' }
        ]
      };
    }
  }

  if (q.includes('asesor') || q.includes('whatsapp') || q.includes('humano') || q.includes('hablar')) {
    const waUrl = 'https://wa.me/3046477694?text=' + encodeURIComponent('¡Hola! Estuve hablando con AURA en la web y me gustaría asesoría personalizada con un experto.');
    return {
      texto: `Puedes comunicarte de inmediato con nuestro equipo de asesores en WhatsApp para pedidos personalizados o dudas específicas:<br><br>
<a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="ia-chip" style="background:#0b8a6a; color:#fff; text-decoration:none; padding:8px 14px; font-weight:600;"><i class="fab fa-whatsapp"></i> Chatear en WhatsApp</a>`
    };
  }

  const texto = (p) => (prodNombre(p) + prodDescripcion(p)).toLowerCase();

  if (q.includes('mujer') || q.includes('dama') || q.includes('femenin') || q.includes('chica') || q.includes('novia') || q.includes('esposa')) {
    const todas = productos.filter((p) => prodGenero(p) === 'Femenino');
    let encontrados = todas;
    if (q.includes('dulce') || q.includes('vainilla') || q.includes('caramelo')) {
      encontrados = todas.filter((p) => texto(p).match(/dulce|vainilla|yara|orientica|sweet|cloud|caramelo|good girl/));
    } else if (q.includes('noche') || q.includes('seductor') || q.includes('fiesta') || q.includes('cita')) {
      encontrados = todas.filter((p) => texto(p).match(/black|intense|scandal|libre|bomb|l'interdit|hypnotic/));
    } else if (q.includes('floral') || q.includes('elegante') || q.includes('rosa') || q.includes('jazmín') || q.includes('jazmin')) {
      encontrados = todas.filter((p) => texto(p).match(/floral|rosa|jazmín|jazmin|bloom|garden|miss|coco|chance/));
    }
    return {
      texto: `👑 <strong>Selección Exclusiva para Dama:</strong><br>
Fragancias de fijación extrema, proyección seductora y acordes irresistibles:`,
      productos: (encontrados.length ? encontrados : todas).slice(0, 3),
      chips: [
        { label: '🍭 Opciones Más Dulces', query: 'perfumes mujer dulces con vainilla' },
        { label: '🌹 Florales & Elegantes', query: 'perfumes mujer elegantes florales' },
        { label: '🎁 Ver Kits de Regalo', query: 'kits especiales' }
      ]
    };
  }

  if (q.includes('hombre') || q.includes('caballero') || q.includes('masculin') || q.includes('chico') || q.includes('novio') || q.includes('esposo')) {
    const todos = productos.filter((p) => prodGenero(p) === 'Masculino');
    let encontrados = todos;
    if (q.includes('amaderad') || q.includes('cuero') || q.includes('tabaco') || q.includes('noche')) {
      encontrados = todos.filter((p) => texto(p).match(/club de nuit|sauvage|oud|creed|aventus|tom ford|stronger|one million/));
    } else if (q.includes('fresco') || q.includes('citrico') || q.includes('oficina') || q.includes('diario')) {
      encontrados = todos.filter((p) => texto(p).match(/acqua|versace|eros|bleu|invictus|lacoste|light blue/));
    }
    return {
      texto: `🪵 <strong>Selección Imponente para Caballero:</strong><br>
Perfumes con presencia magnética, notas amaderadas/cítricas y fijación de más de 12 horas:`,
      productos: (encontrados.length ? encontrados : todos).slice(0, 3),
      chips: [
        { label: '🔥 Seductores de Noche', query: 'perfumes hombre noche seductor' },
        { label: '❄️ Frescos para el Día', query: 'perfumes hombre frescos oficina' },
        { label: '🌙 Ver Árabes de Hombre', query: 'perfumes arabes hombre' }
      ]
    };
  }

  if (q.includes('arabe') || q.includes('árabe') || q.includes('lattafa') || q.includes('armaf') || q.includes('orientica') || q.includes('afnan') || q.includes('oud')) {
    const encontrados = productos.filter((p) => prodCategoria(p) === 'Arabe' || prodNombre(p).toLowerCase().match(/lattafa|armaf|orientica|afnan|yara|khamrah|oud/)).slice(0, 3);
    return {
      texto: `🌙 <strong>Colección de Perfumería Árabe Premium:</strong><br>
Proyección arrolladora, notas de ámbar, vainilla, maderas preciosas y especias orientales:`,
      productos: encontrados.length ? encontrados : productos.slice(0, 3),
      chips: [
        { label: '👑 Árabes Femeninos', query: 'recomendar arabes de mujer' },
        { label: '🪵 Árabes Masculinos', query: 'recomendar arabes de hombre' }
      ]
    };
  }

  if (q.includes('kit') || q.includes('regalo') || q.includes('combos') || q.includes('coleccion')) {
    return {
      texto: `🎁 <strong>Kits Especiales Alta Densidad:</strong><br>
El regalo perfecto: combinaciones de fragancias de lujo + envase premium a un precio exclusivo:`,
      productos: (kits.length ? kits : productos).slice(0, 3),
      chips: [
        { label: '👑 Fragancias de Dama', query: 'recomendar perfumes de mujer' },
        { label: '🪵 Fragancias de Caballero', query: 'recomendar perfumes de hombre' }
      ]
    };
  }

  const coincidencias = productos.filter((p) =>
    prodNombre(p).toLowerCase().includes(q) ||
    prodDescripcion(p).toLowerCase().includes(q) ||
    prodCategoria(p).toLowerCase().includes(q)
  ).slice(0, 3);
  if (coincidencias.length) {
    return {
      texto: 'Encontré estas fragancias que coinciden perfectamente con tu búsqueda:',
      productos: coincidencias,
      chips: [
        { label: '✨ Ver Más Opciones', query: 'recomendar perfumes' },
        { label: '💬 Preguntar en WhatsApp', query: 'asesor whatsapp' }
      ]
    };
  }

  return {
    texto: 'Puedo ayudarte a encontrar tu fragancia ideal en concentración pura Extrait de Parfum y feromonas. ¿Te gustaría ver opciones para <strong>Dama</strong>, <strong>Caballero</strong> o nuestra colección <strong>Árabe</strong>?',
    chips: [
      { label: '👑 Perfumes de Mujer', query: 'recomendar perfumes de mujer' },
      { label: '🪵 Perfumes de Hombre', query: 'recomendar perfumes de hombre' },
      { label: '🌙 Perfumes Árabes', query: 'perfumes arabes' },
      { label: '🧪 Duración y Feromonas', query: 'duracion y fijacion' }
    ]
  };
}

// Preguntas frecuentes y saludos se responden localmente: son exactas y no gastan la IA
function respuestaLocalDirecta(texto, productos, kits) {
  const q = texto.toLowerCase().trim();
  if (/^(hola|holi|buenas|buenos d[ií]as|buenas tardes|buenas noches|hey|saludos)[\s!.,¡]*$/.test(q)) {
    return {
      texto: '¡Hola! Soy <strong>AURA</strong>. Cuéntame para quién es la fragancia o qué notas te gustan (dulce, fresca, amaderada…) y te recomiendo opciones del catálogo.',
      chips: [
        { label: '👑 Perfumes de Mujer', query: 'recomendar perfumes de mujer' },
        { label: '🪵 Perfumes de Hombre', query: 'recomendar perfumes de hombre' },
        { label: '🚚 Envíos', query: 'costo de envio' }
      ]
    };
  }
  for (const clave in KNOWLEDGE_BASE) {
    if (KNOWLEDGE_BASE[clave].keywords.some((k) => q.includes(k))) return procesarConsulta(texto, productos, kits);
  }
  return null;
}

function formatearMarkdown(texto) {
  if (!texto) return '';
  return sanitizar(texto)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^[ \t]*[-*•][ \t]+/gm, '• ')
    .replace(/\n/g, '<br>');
}

function extraerProductosMencionados(texto, productos) {
  if (!productos.length || !texto) return [];
  const t = texto.toLowerCase();
  return productos.filter((p) => {
    const nombre = prodNombre(p).toLowerCase().trim();
    if (nombre.length < 4) return false;
    if (t.includes(nombre)) return true;
    const palabras = nombre.split(/\s+/).filter((w) => w.length > 3);
    return palabras.length >= 2 && palabras.every((w) => t.includes(w));
  }).slice(0, 3);
}

function obtenerSessionId() {
  try {
    let sid = sessionStorage.getItem(SESSION_ID_KEY);
    if (!sid) {
      sid = 'user_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
      sessionStorage.setItem(SESSION_ID_KEY, sid);
    }
    return sid;
  } catch {
    return 'user_' + Date.now();
  }
}

const hora = () => new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

function leerHistorial() {
  try {
    const guardado = JSON.parse(sessionStorage.getItem(HISTORIAL_KEY) || 'null');
    if (Array.isArray(guardado) && guardado.length) return guardado;
  } catch { /* sin almacenamiento */ }
  return [{
    id: 1, remitente: 'bot', hora: hora(), chips: CHIPS_INICIO,
    html: `¡Hola! Soy <strong>AURA</strong>, tu Asesora Olfativa de <em>Fragancias de Alta Densidad</em>. ✨<br><br>
¿Buscas un perfume para ti o para regalar? Dime qué ocasión o notas te gustan, o elige una opción:`
  }];
}

function TarjetaProducto({ prod, onAgregar }) {
  const nombre = prodNombre(prod);
  // Los kits del API solo traen "nombre"; los perfumes traen "name"
  const esKit = !prod.name && !!prod.nombre;
  const bloqueo = (prod.priceReview || prod.precio_revision) ? 'En revisión' : (Number(prod.agotado) === 1 ? 'Agotado' : null);
  return (
    <div className="ia-product-card">
      <img src={normalizarImagen(prodImagen(prod))} alt={nombre} className="ia-prod-img" onError={(e) => { e.currentTarget.src = LOGO; }} />
      <div className="ia-prod-details">
        <div className="ia-prod-title">{nombre}</div>
        <div className="ia-prod-tag">{prodCategoria(prod) || 'Alta Densidad'}</div>
        <div className="ia-prod-price">${prodPrecio(prod).toLocaleString('es-CO')} COP</div>
      </div>
      <div className="ia-prod-actions">
        {bloqueo ? (
          <button type="button" className="ia-btn-add" disabled aria-disabled="true">{bloqueo}</button>
        ) : (
          <button type="button" className="ia-btn-add" onClick={() => onAgregar((esKit ? 'kit_' : '') + String(prodId(prod)))}>
            <i className="fas fa-cart-plus" /> Añadir
          </button>
        )}
      </div>
    </div>
  );
}

export default function Aura() {
  const { auraAbierta: abierta, setAuraAbierta, agregarRapido } = useTienda();
  const [mensajes, setMensajes] = useState(leerHistorial);
  const [escribiendo, setEscribiendo] = useState(false);
  const [entrada, setEntrada] = useState('');
  const [iaDisponible, setIaDisponible] = useState(null);
  const iaRef = useRef(null);
  const catalogo = useRef({ productos: DATOS_DUROS_PRODUCTOS, kits: DATOS_DUROS_KITS.filter((k) => k.activo !== 0), cargado: false });
  const listaRef = useRef(null);
  const inputRef = useRef(null);

  useClaseBody(abierta && 'ia-chat-open');

  const pintarEstado = useCallback((disponible) => {
    iaRef.current = disponible;
    setIaDisponible(disponible);
  }, []);

  useEffect(() => {
    try { sessionStorage.setItem(HISTORIAL_KEY, JSON.stringify(mensajes)); } catch { /* sin almacenamiento */ }
    const el = listaRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [mensajes, escribiendo]);

  // Al abrir: catálogo real y estado de la IA
  useEffect(() => {
    if (!abierta) return undefined;
    if (!catalogo.current.cargado) {
      catalogo.current.cargado = true;
      fetch(`${API}/productos`).then((r) => r.json()).then((d) => {
        if (d.success) catalogo.current.productos = d.data.filter((p) => p.activo !== 0);
      }).catch(() => {});
      fetch(`${API}/kits`).then((r) => r.json()).then((d) => {
        if (d.success) catalogo.current.kits = d.data.filter((k) => k.activo !== 0);
      }).catch(() => {});
    }
    fetch(`${CHAT_API}/estado`, { cache: 'no-store' })
      .then((r) => r.json()).then((d) => pintarEstado(!!(d && d.disponible)))
      .catch(() => pintarEstado(false));
    const t = setTimeout(() => { if (window.innerWidth > 480) inputRef.current?.focus(); }, 300);
    const esc = (e) => { if (e.key === 'Escape') setAuraAbierta(false); };
    document.addEventListener('keydown', esc);
    return () => { clearTimeout(t); document.removeEventListener('keydown', esc); };
  }, [abierta, pintarEstado, setAuraAbierta]);

  const agregar = (remitente, html, extras = {}) =>
    setMensajes((m) => [...m, { id: Date.now() + Math.random(), remitente, html, hora: hora(), ...extras }]);

  async function consultarIA(texto) {
    const { productos, kits } = catalogo.current;
    const local = respuestaLocalDirecta(texto, productos, kits);
    if (local) return local;
    const modoBasico = () => ({ ...procesarConsulta(texto, productos, kits), nota: 'Modo básico: la IA no está disponible, te respondo con el catálogo.' });
    if (iaRef.current === false) return modoBasico();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);
    try {
      const resp = await fetch(CHAT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: texto, session_id: obtenerSessionId() }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const data = await resp.json().catch(() => null);
      if (resp.status === 429 && data && data.message) {
        return { texto: sanitizar(data.message), chips: [{ label: '💬 Asesor Humano en WhatsApp', query: 'asesor whatsapp' }] };
      }
      if (!resp.ok || !data || !data.success || !data.response) throw new Error(`HTTP ${resp.status}`);
      pintarEstado(true);
      return {
        texto: formatearMarkdown(data.response),
        // El backend ya devuelve solo productos que existen, con su precio real
        productos: (data.productos && data.productos.length) ? data.productos : extraerProductosMencionados(data.response, productos),
        chips: [
          { label: '👑 Ver Perfumes Dama', query: 'perfumes de mujer' },
          { label: '🪵 Ver Perfumes Hombre', query: 'perfumes de hombre' },
          { label: '💬 Asesor Humano en WhatsApp', query: 'asesor whatsapp' }
        ]
      };
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn('AURA: IA no disponible, respondo en modo básico:', err.message);
      pintarEstado(false);
      // Reintentar la IA en el próximo mensaje tras 60 s
      setTimeout(() => { if (iaRef.current === false) iaRef.current = null; }, 60000);
      return modoBasico();
    }
  }

  async function preguntar(texto) {
    const limpio = texto.trim();
    if (!limpio) return;
    agregar('user', sanitizar(limpio));
    setEntrada('');
    setEscribiendo(true);
    try {
      const r = await consultarIA(limpio);
      agregar('bot', r.texto, { nota: r.nota, productos: r.productos, chips: r.chips });
    } catch {
      const { productos, kits } = catalogo.current;
      const r = procesarConsulta(limpio, productos, kits);
      agregar('bot', r.texto, { productos: r.productos, chips: r.chips });
    } finally {
      setEscribiendo(false);
    }
  }

  const estadoTxt = iaDisponible === null ? 'Conectando…' : (iaDisponible ? 'IA en línea' : 'Modo básico');
  const estadoTitulo = iaDisponible
    ? 'Respuestas del modelo de IA, verificadas con el catálogo'
    : (iaDisponible === false ? 'La IA no está disponible: respondo con el catálogo y las preguntas frecuentes' : undefined);

  return (
    <>
      <div className={`ia-chat-launcher ${abierta ? 'active' : ''}`} role="button" tabIndex={0} aria-label="Abrir asesora olfativa virtual AURA"
        onClick={() => setAuraAbierta(!abierta)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setAuraAbierta(!abierta); } }}>
        <div className="ia-launcher-avatar">
          <i className="fas fa-magic" />
          <div className="ia-pulse-dot" />
        </div>
        <div className="ia-launcher-text">
          <span className="ia-launcher-title">AURA IA</span>
          <span className="ia-launcher-sub">Asesora Olfativa</span>
        </div>
      </div>

      <div className={`ia-chat-widget ${abierta ? 'active' : ''}`} aria-live="polite">
        <div className="ia-chat-header">
          <div className="ia-header-brand">
            <div className="ia-header-avatar"><i className="fas fa-crown" /></div>
            <div className="ia-header-info">
              <span className="ia-header-name">AURA <span className="ia-header-badge">IA Asesor</span></span>
              <span className={`ia-header-status ${iaDisponible === false ? 'is-basic' : ''}`} title={estadoTitulo}>
                <span className="ia-status-circle" /> <span>{estadoTxt}</span>
              </span>
            </div>
          </div>
          <div className="ia-header-actions">
            <a href={WA_AURA} target="_blank" rel="noopener noreferrer" className="ia-header-wa-btn" aria-label="Hablar con asesor en WhatsApp" title="Chatear con asesor en WhatsApp">
              <i className="fab fa-whatsapp" />
            </a>
            <button className="ia-chat-close-btn" aria-label="Cerrar chat" title="Cerrar chat" onClick={() => setAuraAbierta(false)}>
              <i className="fas fa-times" />
            </button>
          </div>
        </div>

        <div className="ia-chat-messages" ref={listaRef}>
          {mensajes.map((m) => (
            <div key={m.id} className={`ia-msg ${m.remitente}`}>
              {/* El HTML del bot sale de plantillas propias o de texto sanitizado (formatearMarkdown) */}
              <div className="ia-bubble" dangerouslySetInnerHTML={{ __html: m.html }} />
              {m.nota && <div className="ia-msg-note">{m.nota}</div>}
              {m.productos?.map((p) => <TarjetaProducto key={`${prodId(p)}-${prodNombre(p)}`} prod={p} onAgregar={agregarRapido} />)}
              {m.chips?.length > 0 && (
                <div className="ia-quick-chips">
                  {m.chips.map((c) => <button key={c.label} type="button" className="ia-chip" onClick={() => preguntar(c.query)}>{c.label}</button>)}
                </div>
              )}
              <span className="ia-msg-time">{m.hora}</span>
            </div>
          ))}
          {escribiendo && (
            <div className="ia-msg bot">
              <div className="ia-typing-indicator">
                <div className="ia-typing-dot" />
                <div className="ia-typing-dot" />
                <div className="ia-typing-dot" />
              </div>
            </div>
          )}
        </div>

        <div className="ia-chat-footer">
          <form className="ia-chat-form" onSubmit={(e) => { e.preventDefault(); preguntar(entrada); }}>
            <input ref={inputRef} type="text" className="ia-chat-input" placeholder="Pregúntame o describe tu aroma ideal..." autoComplete="off" aria-label="Escribe tu consulta"
              value={entrada} onChange={(e) => setEntrada(e.target.value)} />
            <button type="submit" className="ia-chat-send-btn" aria-label="Enviar mensaje"><i className="fas fa-paper-plane" /></button>
          </form>
        </div>
      </div>
    </>
  );
}
