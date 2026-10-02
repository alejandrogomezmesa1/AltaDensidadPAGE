import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { iniciarScrollSuave, detenerScrollSuave } from '../lib/scrollSuave';
import { Encabezado, Pie, WhatsappFlotante } from './Marco';
import Capas from './Capas';
import Aura from './Aura';

// Páginas públicas: encabezado, contenido, pie y capas (bolsa, detalle, AURA)
export default function TiendaLayout() {
  // Scroll suave en toda la tienda (el panel de administración no lo usa)
  useEffect(() => {
    iniciarScrollSuave();
    return () => detenerScrollSuave();
  }, []);

  return (
    <>
      <Encabezado />
      <Outlet />
      <Pie />
      <Capas />
      <WhatsappFlotante />
      <Aura />
    </>
  );
}

// Tres pastillas informativas al pie de las páginas secundarias
export function Pastillas({ children }) {
  return (
    <section className="sec sec--alt">
      <div className="wrap pills-3 rv in">{children}</div>
    </section>
  );
}

export function Pastilla({ titulo, children }) {
  return (
    <div className="pill">
      <h3 className="up">{titulo}</h3>
      {children}
    </div>
  );
}
