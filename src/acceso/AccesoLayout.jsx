import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BotonTema, useClaseBody } from '../lib/hooks';

// Marco mínimo de login, recuperación y resultados de pago (body.acc-body)
export default function AccesoLayout({ volver = { a: '/', texto: 'Colección' }, children }) {
  useClaseBody('acc-body');
  return (
    <>
      <header className="acc-h">
        <Link className="acc-back up" to={volver.a}><span aria-hidden="true">←</span> <span className="acc-back-txt">{volver.texto}</span></Link>
        <Link className="logo" to="/">Alta Densidad<small>Fragancias</small></Link>
        <BotonTema />
      </header>
      <main className="acc">{children}</main>
      <footer className="acc-f up">
        <span>© 2026 Fragancias de Alta Densidad</span>
        <span>Medellín · +57 304 647 7694</span>
      </footer>
    </>
  );
}

// Campo de contraseña con botón para mostrarla
export function CampoClave({ id, envoltura = 'input-icon', ...props }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className={envoltura}>
      <input id={id} type={visible ? 'text' : 'password'} {...props} />
      <button type="button" className="toggle-pass" aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'} onClick={() => setVisible((v) => !v)}>
        <i className={visible ? 'fas fa-eye-slash' : 'fas fa-eye'} />
      </button>
    </div>
  );
}

