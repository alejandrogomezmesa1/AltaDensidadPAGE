// Panel de administración: sidebar colapsable, barra superior y secciones del catálogo y ventas.
// Todas las secciones quedan montadas (ocultas con .hidden) para conservar búsquedas y páginas.
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../styles/admin-hp.css';
import { useClaseBody, useTema, usePagina } from '../lib/hooks';
import Monitoreo from './Monitoreo';
import ProductosAdmin from './ProductosAdmin';
import EnvasesAdmin from './EnvasesAdmin';
import KitsAdmin from './KitsAdmin';
import Top10Admin from './Top10Admin';
import OrdenesAdmin from './OrdenesAdmin';
import { PANEL_DATA } from '../config';

const SECCIONES = {
  monitoreo: { titulo: 'Monitoreo', grupo: 'General', icono: 'fa-chart-line' },
  productos: { titulo: 'Productos', grupo: 'Catálogo', icono: 'fa-spray-can' },
  envases: { titulo: 'Envases', grupo: 'Catálogo', icono: 'fa-box' },
  kits: { titulo: 'Kits', grupo: 'Catálogo', icono: 'fa-gift' },
  top10: { titulo: 'Top 10', grupo: 'Catálogo', icono: 'fa-crown' },
  ordenes: { titulo: 'Órdenes', grupo: 'Ventas', icono: 'fa-receipt' }
};
const GRUPOS = ['General', 'Catálogo', 'Ventas'];
const ESCRITORIO = '(min-width: 1024px)';

function leerUsuario() {
  try {
    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
    return token && usuario ? usuario : null;
  } catch {
    return null;
  }
}

function seccionGuardada() {
  try {
    const s = localStorage.getItem('admin_active_tab');
    return SECCIONES[s] ? s : 'monitoreo';
  } catch {
    return 'monitoreo';
  }
}

function Panel({ usuario }) {
  const navigate = useNavigate();
  const { claro, alternar } = useTema();
  const [seccion, setSeccion] = useState(seccionGuardada);
  const [movilAbierto, setMovilAbierto] = useState(false);
  const [compacto, setCompacto] = useState(() => document.documentElement.classList.contains('adm-compacto'));
  const [escritorio, setEscritorio] = useState(() => window.matchMedia(ESCRITORIO).matches);
  const [alerta, setAlerta] = useState(null);
  const temporizador = useRef(null);
  const meta = SECCIONES[seccion];

  useClaseBody('adm', movilAbierto && 'adm-side-open');
  usePagina({ titulo: `${meta.titulo} · Panel | Fragancias de Alta Densidad`, descripcion: 'Panel de gestión de Fragancias de Alta Densidad.', ruta: '/admin', indexar: false });

  const mostrarAlerta = useCallback((msg, tipo) => {
    setAlerta({ msg, tipo });
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setAlerta(null), 4000);
  }, []);
  useEffect(() => () => clearTimeout(temporizador.current), []);

  const sesionInvalida = useCallback(() => {
    Swal.fire({
      icon: 'error',
      title: 'Sesión expirada',
      text: 'Tu sesión ha terminado o es inválida. Por favor, ingresa de nuevo.',
      confirmButtonText: 'Ir al Login',
      background: '#1a1a1a', color: '#fff', confirmButtonColor: '#D4AF37'
    }).then(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      navigate('/login');
    });
  }, [navigate]);

  const irA = useCallback((s) => {
    setSeccion(s);
    try { localStorage.setItem('admin_active_tab', s); } catch { /* sin almacenamiento */ }
    setMovilAbierto(false);
    window.scrollTo({ top: 0 });
  }, []);

  // Cambiar entre escritorio y móvil cierra el menú móvil y avisa a los gráficos
  useEffect(() => {
    const mq = window.matchMedia(ESCRITORIO);
    const cambio = () => {
      setEscritorio(mq.matches);
      setMovilAbierto(false);
      setTimeout(() => window.dispatchEvent(new Event('resize')), 320);
    };
    mq.addEventListener('change', cambio);
    return () => mq.removeEventListener('change', cambio);
  }, []);

  useEffect(() => {
    if (!movilAbierto) return undefined;
    const esc = (e) => { if (e.key === 'Escape') setMovilAbierto(false); };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [movilAbierto]);

  function alternarSidebar() {
    if (escritorio) {
      const nuevo = !compacto;
      document.documentElement.classList.toggle('adm-compacto', nuevo);
      try { localStorage.setItem('admin_sidebar', nuevo ? 'compacto' : 'expandido'); } catch { /* sin almacenamiento */ }
      setCompacto(nuevo);
      // Chart.js recalcula su tamaño tras la transición del sidebar
      setTimeout(() => window.dispatchEvent(new Event('resize')), 320);
    } else {
      setMovilAbierto((a) => !a);
    }
  }

  function salir() {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
    } catch { /* sin almacenamiento */ }
    navigate('/login');
  }

  const nombre = String(usuario.nombre || 'Administrador').trim();
  const fecha = new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <>
      <aside className="adm-side" aria-label="Navegación del panel">
        <div className="adm-brand">
          <Link className="adm-brand-mark" to="/" title="Ir a la tienda">AD</Link>
          <div className="adm-brand-txt">
            <span className="adm-brand-name">Alta Densidad</span>
            <span className="adm-brand-sub up">Panel de gestión</span>
          </div>
          <button type="button" className="adm-side-close" aria-label="Cerrar menú" onClick={() => setMovilAbierto(false)}><i className="fas fa-xmark" /></button>
        </div>

        <nav className="adm-nav admin-tabs">
          {GRUPOS.map((g) => (
            <div className="adm-nav-group" key={g}>
              <span className="adm-nav-title up">{g}</span>
              {Object.entries(SECCIONES).filter(([, m]) => m.grupo === g).map(([clave, m]) => (
                <button key={clave} type="button" className={`admin-tab adm-nav-item ${seccion === clave ? 'active' : ''}`}
                  data-label={m.titulo} title={m.titulo} aria-current={seccion === clave ? 'page' : 'false'} onClick={() => irA(clave)}>
                  <i className={`fas ${m.icono}`} aria-hidden="true" /><span>{m.titulo}</span>
                </button>
              ))}
            </div>
          ))}
          <div className="adm-nav-group">
            <span className="adm-nav-title up">Ecosistema</span>
            <a className="adm-nav-item" href={PANEL_DATA} data-label="Panel DATA" title="Ir al panel DATA (inventario, ventas y caja)">
              <i className="fas fa-warehouse" aria-hidden="true" /><span>Panel DATA</span>
            </a>
          </div>
        </nav>

        <div className="adm-side-foot">
          <Link className="adm-nav-item" to="/" data-label="Ver tienda" title="Ver tienda">
            <i className="fas fa-store" aria-hidden="true" /><span>Ver tienda</span>
          </Link>
          <button type="button" className="adm-nav-item" data-label={claro ? 'Modo oscuro' : 'Modo claro'} title="Cambiar tema" onClick={alternar}>
            <i className={claro ? 'fas fa-moon' : 'fas fa-sun'} aria-hidden="true" /><span>{claro ? 'Modo oscuro' : 'Modo claro'}</span>
          </button>
          <div className="adm-user">
            <span className="adm-avatar">{nombre.charAt(0).toUpperCase()}</span>
            <div className="adm-user-txt">
              <span className="adm-user-name">{nombre}</span>
              <span className="adm-user-role up">Admin</span>
            </div>
            <button type="button" className="adm-logout" title="Cerrar sesión" aria-label="Cerrar sesión" onClick={salir}><i className="fas fa-arrow-right-from-bracket" /></button>
          </div>
        </div>
      </aside>
      <div className="adm-scrim" onClick={() => setMovilAbierto(false)} />

      <div className="adm-shell">
        <header className="adm-top">
          <button type="button" className="adm-toggle" aria-label="Mostrar u ocultar menú"
            aria-expanded={escritorio ? !compacto : movilAbierto} onClick={alternarSidebar}>
            <i className="fas fa-bars" />
          </button>
          <div className="adm-crumb">
            <span className="up adm-crumb-kicker">{meta.grupo}</span>
            <h1 className="adm-crumb-title">{meta.titulo}</h1>
          </div>
          <span className="adm-top-date up">{fecha}</span>
        </header>

        <div className={`alerta ${alerta ? alerta.tipo : 'hidden'}`}>{alerta?.msg}</div>

        <main className="admin-main">
          <div className={seccion === 'monitoreo' ? '' : 'hidden'}><Monitoreo activo={seccion === 'monitoreo'} irA={irA} /></div>
          <div className={seccion === 'productos' ? '' : 'hidden'}><ProductosAdmin alerta={mostrarAlerta} /></div>
          <div className={seccion === 'envases' ? '' : 'hidden'}><EnvasesAdmin alerta={mostrarAlerta} /></div>
          <div className={seccion === 'kits' ? '' : 'hidden'}><KitsAdmin alerta={mostrarAlerta} /></div>
          <div className={seccion === 'top10' ? '' : 'hidden'}><Top10Admin alerta={mostrarAlerta} /></div>
          <div className={seccion === 'ordenes' ? '' : 'hidden'}><OrdenesAdmin alerta={mostrarAlerta} sesionInvalida={sesionInvalida} /></div>
        </main>
      </div>
    </>
  );
}

export default function Admin() {
  const usuario = leerUsuario();
  if (!usuario) return <Navigate to="/login" replace />;
  // Sesión válida pero sin rol admin: volver a la tienda (evita el bucle login ↔ admin)
  if (usuario.rol !== 'admin') return <Navigate to="/" replace />;
  return <Panel usuario={usuario} />;
}
