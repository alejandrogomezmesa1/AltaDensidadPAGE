// Marco común de las páginas públicas: encabezado, pie, WhatsApp flotante y desplazamiento a anclas
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
          <a className="foot-map" href={MAPA} target="_blank" rel="noopener noreferrer">
            <img src="/assets/img/ubicacion.png" alt="Mapa de ubicación de la tienda Alta Densidad en Medellín" width="200" height="110" loading="lazy" decoding="async" />
          </a>
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

// Al cambiar de página: ir al ancla (/#kits, /nosotros#faq) o al inicio
export function DesplazarAlCambiar() {
  const location = useLocation();
  const { pathname, hash } = location;
  // Abrir una ficha como ventana (state.fondo) o cerrarla volviendo a su fondo no mueve la página
  const fondo = location.state && location.state.fondo;
  const conFondo = Boolean(fondo);
  const fondoAnterior = useRef(null);
  useEffect(() => {
    const volvioAlFondo = fondoAnterior.current === pathname + location.search;
    fondoAnterior.current = fondo ? fondo.pathname + (fondo.search || '') : null;
    if (conFondo || volvioAlFondo) return undefined;
    if (!hash) {
      window.scrollTo({ top: 0 });
      return undefined;
    }
    const t = setTimeout(() => {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
    return () => clearTimeout(t);
  }, [pathname, hash, conFondo]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
