// Marco común de las páginas públicas: encabezado, pie, WhatsApp flotante y desplazamiento a anclas
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigationType } from 'react-router-dom';
import { BotonTema } from '../lib/hooks';
import { useTienda } from './TiendaContext';
import { WA_FLOTANTE } from '../config';

function leerSesion() {
  try {
    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
    if (token && usuario && usuario.nombre) return usuario;
  } catch { /* sin almacenamiento */ }
  return null;
}

// Cuenta: sin sesión el ícono lleva a login; con sesión abre un menú (nombre, panel, salir)
function Cuenta() {
  const [usuario] = useState(leerSesion);
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!abierto) return undefined;
    const fuera = (e) => { if (ref.current && !ref.current.contains(e.target)) setAbierto(false); };
    const esc = (e) => { if (e.key === 'Escape') setAbierto(false); };
    document.addEventListener('click', fuera);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('click', fuera);
      document.removeEventListener('keydown', esc);
    };
  }, [abierto]);

  if (!usuario) {
    return (
      <div className="acct">
        <Link className="nav-ico" to="/login" aria-label="Ingresar a tu cuenta" title="Ingresar">
          <i className="fa-regular fa-user" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  const nombre = String(usuario.nombre).split(' ')[0];
  const salir = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
    } catch { /* sin almacenamiento */ }
    window.location.reload();
  };

  return (
    <div className="acct" ref={ref}>
      <a
        className="nav-ico is-auth" role="button" tabIndex={0} title="Mi cuenta"
        aria-haspopup="true" aria-expanded={abierto} aria-label={`Cuenta de ${nombre}`}
        onClick={() => setAbierto((a) => !a)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setAbierto((a) => !a); } }}
      >
        <i className="fa-regular fa-user" aria-hidden="true" />
      </a>
      <div className="acct-menu" hidden={!abierto}>
        <span className="acct-hi">Hola, <b>{nombre}</b></span>
        {usuario.rol === 'admin' && <Link to="/admin">Panel de administración</Link>}
        <button type="button" onClick={salir}>Cerrar sesión</button>
      </div>
    </div>
  );
}

export function Encabezado() {
  const { pathname, search } = useLocation();
  const { cart, abrirBolsa } = useTienda();
  const enCrear = pathname === '/catalogo' && new URLSearchParams(search).get('ver') === 'crear';
  const enInicio = pathname === '/';
  const cantidad = cart.reduce((s, l) => s + l.q, 0);
  const actual = (ruta) => (pathname === ruta ? 'page' : undefined);

  return (
    <header className="haute-header">
      <nav className="up nav-l">
        <Link to="/catalogo" aria-current={pathname === '/catalogo' && !enCrear ? 'page' : undefined}>Catálogo</Link>
        <Link to="/catalogo?ver=crear" aria-current={enCrear ? 'page' : undefined}>Crea tu perfume</Link>
        {enInicio ? <a href="#top">Top 10</a> : <Link to="/top10" aria-current={actual('/top10')}>Top 10</Link>}
        {enInicio ? <a href="#nosotros">Nosotros</a> : <Link to="/nosotros" aria-current={actual('/nosotros')}>Nosotros</Link>}
      </nav>
      <Link className="logo" to="/" onClick={() => enInicio && window.scrollTo({ top: 0, behavior: 'smooth' })}>
        Alta Densidad<small>Fragancias</small>
      </Link>
      <nav className="up nav-r">
        <BotonTema />
        <Cuenta />
        <a href="#" className="nav-bag" onClick={(e) => { e.preventDefault(); abrirBolsa(); }}>
          Bolsa (<span>{cantidad}</span>)
        </a>
      </nav>
    </header>
  );
}

const MAPA = 'https://maps.google.com/?q=calle+77c+%23+91b+-+74,+Medell%C3%ADn';
// Mapa embebido sin clave de API; se carga en diferido para no pesar en cada página
const MAPA_EMBED = 'https://www.google.com/maps?q=calle+77c+%23+91b+-+74,+Medell%C3%ADn,+Antioquia&z=16&output=embed';

export function Pie() {
  return (
    <footer className="haute-footer" id="contacto">
      <div className="wrap foot-grid">
        <div className="foot-col">
          <Link className="logo foot-logo" to="/">Alta Densidad<small>Fragancias</small></Link>
          <p className="mute">Casa de perfumería de autor en Medellín. Concentración pura Extrait de Parfum y base de feromonas.</p>
          <div className="foot-social">
            <a href="https://www.instagram.com/fragancias_alta_densidad/?hl=es" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i className="fab fa-instagram" aria-hidden="true" /></a>
            <a href="https://www.tiktok.com/@fragancias_altadensidad" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><i className="fab fa-tiktok" aria-hidden="true" /></a>
            <a href="https://wa.me/573046477694" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><i className="fab fa-whatsapp" aria-hidden="true" /></a>
          </div>
        </div>
        <div className="foot-col">
          <h4 className="up">Contacto</h4>
          <a href="https://wa.me/573046477694" target="_blank" rel="noopener noreferrer">+57 304 647 7694</a>
          <a href="mailto:perfumesaltadensidad@gmail.com">perfumesaltadensidad@gmail.com</a>
        </div>
        <div className="foot-col">
          <h4 className="up">Ubicación</h4>
          <a href={MAPA} target="_blank" rel="noopener noreferrer">Calle 77c # 91b - 74<br />Medellín, Antioquia</a>
          <div className="foot-map">
            <iframe src={MAPA_EMBED} title="Mapa de ubicación de la tienda Alta Densidad en Medellín" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
          </div>
          <a className="foot-map-link" href={MAPA} target="_blank" rel="noopener noreferrer"><i className="fas fa-location-arrow" aria-hidden="true" /> Cómo llegar</a>
        </div>
        <div className="foot-col">
          <h4 className="up">Información</h4>
          <Link to="/nosotros#faq">Preguntas frecuentes</Link>
          <Link to="/nosotros#envios">Envíos y devoluciones</Link>
          <Link to="/nosotros#privacidad">Política de privacidad</Link>
          <Link to="/login">Mi cuenta</Link>
        </div>
      </div>
      <div className="wrap foot-bottom up">
        <span>© 2026 Fragancias de Alta Densidad</span>
        <span>Envíos a toda Colombia · Pago seguro con Mercado Pago</span>
      </div>
    </footer>
  );
}

export function WhatsappFlotante() {
  return (
    <div className="whatsapp-flotante-wrapper" aria-label="Contacto directo por WhatsApp">
      <div className="whatsapp-ripple-ring ring-1" />
      <div className="whatsapp-ripple-ring ring-2" />
      <a className="btn-whatsapp-flotante" href={WA_FLOTANTE} target="_blank" rel="noopener noreferrer" aria-label="Contactar por WhatsApp">
        <i className="fab fa-whatsapp" aria-hidden="true" />
      </a>
    </div>
  );
}

// Al cambiar de página: arriba, o al ancla (/#kits, /nosotros#faq). Al volver con "atrás" o
// "adelante" se recupera la posición en la que estaba esa página (p. ej. la lista del catálogo
// después de ver un perfume). Las posiciones se guardan por entrada del historial.
const CLAVE_POSICIONES = 'ad_scroll';
function leerPosiciones() {
  try { return JSON.parse(sessionStorage.getItem(CLAVE_POSICIONES) || '{}'); } catch { return {}; }
}
function irA(y) {
  const suave = window.__scrollSuave;
  if (suave) {
    // Lenis guarda las medidas de la página anterior: sin recalcular, recortaría el destino
    suave.resize();
    suave.scrollTo(y, { immediate: true, force: true });
  } else {
    window.scrollTo(0, y);
  }
}

export function DesplazarAlCambiar() {
  const location = useLocation();
  const tipo = useNavigationType();
  const { pathname, hash, key } = location;

  // Guardar la posición de la página actual mientras se desplaza
  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    let pendiente = 0;
    // Al navegar, la página nueva acorta el documento y el navegador mueve el scroll: ese
    // movimiento ya no es de esta página y no se guarda (la dirección ya cambió)
    const direccion = window.location.pathname + window.location.search;
    const guardar = () => {
      pendiente = 0;
      if (window.location.pathname + window.location.search !== direccion) return;
      const pos = leerPosiciones();
      pos[key] = Math.round(window.scrollY);
      const claves = Object.keys(pos);
      if (claves.length > 60) delete pos[claves[0]];
      try { sessionStorage.setItem(CLAVE_POSICIONES, JSON.stringify(pos)); } catch { /* sin almacenamiento */ }
    };
    const alDesplazar = () => { if (!pendiente) pendiente = requestAnimationFrame(guardar); };
    window.addEventListener('scroll', alDesplazar, { passive: true });
    return () => { window.removeEventListener('scroll', alDesplazar); if (pendiente) cancelAnimationFrame(pendiente); };
  }, [key]);

  useEffect(() => {
    // Atrás / adelante: volver a donde estaba (cuando la página ya tiene altura suficiente)
    const guardada = tipo === 'POP' ? leerPosiciones()[key] : undefined;
    if (guardada > 0) {
      let intentos = 0;
      let t;
      const probar = () => {
        if (document.documentElement.scrollHeight >= guardada + window.innerHeight || intentos > 30) { irA(guardada); return; }
        intentos += 1;
        t = setTimeout(probar, 50);
      };
      probar();
      return () => clearTimeout(t);
    }
    if (!hash) {
      irA(0);
      return undefined;
    }
    const t = setTimeout(() => {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
    return () => clearTimeout(t);
  }, [pathname, hash]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
