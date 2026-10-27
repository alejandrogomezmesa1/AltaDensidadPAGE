// Pestaña Marca del panel: todo el branding en un solo lugar. Las piezas vienen de
// public/assets/branding (las genera branding/generar_svg.py --publicar); el estado de revisión y
// las notas se guardan en la base (backend/routes/marca.js).
import { useCallback, useEffect, useState } from 'react';
import '../../styles/admin-marca.css';
import { apiJson } from '../../lib/api';
import { BASE } from './utilidades';
import Piezas from './Piezas';
import Paleta from './Paleta';
import Tipografia from './Tipografia';
import Generador from './Generador';
import Personalizar from './Personalizar';
import Marketplace from './Marketplace';
import Revision from './Revision';

const VISTAS = [
  { clave: 'piezas', titulo: 'Piezas', icono: 'fa-th-large' },
  { clave: 'revision', titulo: 'Revisión', icono: 'fa-tasks' },
  { clave: 'personalizar', titulo: 'Personalizar', icono: 'fa-pen-fancy' },
  { clave: 'marketplace', titulo: 'Marketplace', icono: 'fa-store' },
  { clave: 'generador', titulo: 'Generador', icono: 'fa-magic' },
  { clave: 'paleta', titulo: 'Color', icono: 'fa-palette' },
  { clave: 'tipografia', titulo: 'Tipografía', icono: 'fa-font' }
];

function vistaGuardada() {
  try {
    const v = localStorage.getItem('admin_marca_vista');
    return VISTAS.some((x) => x.clave === v) ? v : 'piezas';
  } catch {
    return 'piezas';
  }
}

export default function MarcaAdmin({ alerta, activo }) {
  const [vista, setVista] = useState(vistaGuardada);
  const [manifest, setManifest] = useState(null);
  const [estados, setEstados] = useState({});
  const [sinServidor, setSinServidor] = useState(false);
  const [abrirId, setAbrirId] = useState(null);

  const cambiarVista = (v) => {
    setVista(v);
    try { localStorage.setItem('admin_marca_vista', v); } catch { /* sin almacenamiento */ }
  };

  const cargarEstados = useCallback(async () => {
    try {
      const r = await apiJson('admin/marca');
      setEstados(r.data || {});
      setSinServidor(false);
    } catch {
      setSinServidor(true);
    }
  }, []);

  useEffect(() => {
    fetch(`${BASE}/manifest.json`, { cache: 'no-cache' })
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(setManifest)
      .catch((err) => { setManifest({ secciones: [], piezas: [] }); alerta('No se encontró el catálogo de piezas de marca: ' + err.message, 'error'); });
  }, [alerta]);

  useEffect(() => { if (activo) cargarEstados(); }, [activo, cargarEstados]);

  // Abrir una pieza desde Revisión lleva a la galería con el visor abierto
  const abrirPieza = useCallback((id) => { cambiarVista('piezas'); setAbrirId(id); }, []);

  const pendientes = Object.values(estados).reduce((s, e) => s + (e.pendientes || 0), 0);

  return (
    <div className="marca">
      <div className="admin-toolbar">
        <div>
          <h2 className="section-title">Marca</h2>
          <p className="marca-mute marca-lema">Identidad v3 · la gota tallada · «Lo que permanece»</p>
        </div>
        <nav className="marca-vistas" aria-label="Vistas de la marca">
          {VISTAS.map((v) => (
            <button key={v.clave} type="button" className={vista === v.clave ? 'activo' : ''} onClick={() => cambiarVista(v.clave)} aria-current={vista === v.clave ? 'page' : undefined}>
              <i className={`fas ${v.icono}`} aria-hidden="true" />{v.titulo}
              {v.clave === 'revision' && pendientes > 0 && <span className="marca-burbuja">{pendientes}</span>}
            </button>
          ))}
        </nav>
      </div>

      {sinServidor && (
        <p className="marca-aviso"><i className="fas fa-plug" /> No se pudo leer el estado de revisión desde el servidor: puedes ver y descargar las piezas, pero las notas y los estados no se guardarán.</p>
      )}

      {!manifest && <p className="armador-ayuda">Cargando piezas…</p>}
      {manifest && (
        <>
          <div className={vista === 'piezas' ? '' : 'hidden'}>
            <Piezas manifest={manifest} estados={estados} setEstados={setEstados} sinServidor={sinServidor} alerta={alerta}
              abrirId={vista === 'piezas' ? abrirId : null} setAbrirId={setAbrirId} />
          </div>
          {vista === 'revision' && <Revision manifest={manifest} activo={activo} onAbrir={abrirPieza} alerta={alerta} />}
          {vista === 'personalizar' && <Personalizar alerta={alerta} />}
          {vista === 'marketplace' && <Marketplace alerta={alerta} />}
          {vista === 'generador' && <Generador alerta={alerta} />}
          {vista === 'paleta' && <Paleta />}
          {vista === 'tipografia' && <Tipografia />}
        </>
      )}
    </div>
  );
}
