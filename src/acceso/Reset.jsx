// Recuperación de contraseña: 1 · pedir código por email · 2 · confirmar código · 3 · nueva contraseña
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AccesoLayout, { CampoClave } from './AccesoLayout';
import { usePagina } from '../lib/hooks';
import { API } from '../config';

function Mensaje({ msg }) {
  return <div className={`reset-msg ${msg?.ok ? 'success' : ''}`} role="status">{msg?.texto || ''}</div>;
}

export default function Reset() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  // Enlace directo desde el correo (?token=…&email=…): va al paso 3
  const directo = params.get('token') && params.get('email');
  const [paso, setPaso] = useState(directo ? 3 : 1);
  const [email, setEmail] = useState(directo ? params.get('email') : '');
  const [codigo, setCodigo] = useState('');
  const [token, setToken] = useState(directo ? params.get('token') : '');
  const [clave, setClave] = useState({ nueva: '', confirmar: '' });
  const [msg, setMsg] = useState({ 1: null, 2: null, 3: null });
  const [cargando, setCargando] = useState(false);
  usePagina({ titulo: 'Recuperar contraseña | Fragancias de Alta Densidad', descripcion: 'Recupera el acceso a tu cuenta.', ruta: '/reset', indexar: false });

  const fijar = (n, texto, ok = false) => setMsg((m) => ({ ...m, [n]: texto ? { texto, ok } : null }));

  async function pedirCodigo(e) {
    e.preventDefault();
    const correo = email.trim();
    fijar(1, '');
    if (!correo || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo)) { fijar(1, 'Ingresa un email válido.'); return; }
    setCargando(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: correo }),
        signal: controller.signal
      });
      const data = await res.json();
      if (data.success) {
        setEmail(correo);
        setPaso(2);
        fijar(2, data.message, true);
      } else {
        fijar(1, data.message || 'Error al enviar el código.');
      }
    } catch (err) {
      fijar(1, err.name === 'AbortError'
        ? 'El servidor tarda demasiado en responder. Intenta de nuevo en unos minutos.'
        : 'Error al conectar con el servidor. Verifica tu conexión.');
    } finally {
      clearTimeout(timeoutId);
      setCargando(false);
    }
  }

  function confirmarCodigo(e) {
    e.preventDefault();
    const c = codigo.trim();
    if (!c || c.length < 6) { fijar(2, 'Ingresa el código de 6 dígitos.'); return; }
    // En este flujo, el código es el token
    setToken(c);
    setPaso(3);
  }

  async function cambiarClave(e) {
    e.preventDefault();
    fijar(3, '');
    if (clave.nueva.length < 6) { fijar(3, 'Mínimo 6 caracteres.'); return; }
    if (clave.nueva !== clave.confirmar) { fijar(3, 'Las contraseñas no coinciden.'); return; }
    setCargando(true);
    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, password: clave.nueva })
      });
      const data = await res.json();
      if (data.success) {
        fijar(3, '¡Contraseña cambiada con éxito! Redirigiendo...', true);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        fijar(3, data.message || 'Error al restablecer.');
      }
    } catch {
      fijar(3, 'Error de red.');
    } finally {
      setCargando(false);
    }
  }

  const reiniciar = (e) => {
    e.preventDefault();
    setPaso(1); setCodigo(''); setToken(''); setMsg({ 1: null, 2: null, 3: null });
  };

  return (
    <AccesoLayout volver={{ a: '/login', texto: 'Iniciar sesión' }}>
      <section className="acc-card">
        <span className="up eyebrow">Recuperar acceso</span>

        <form className={`reset-form ${paso === 1 ? '' : 'hidden'}`} onSubmit={pedirCodigo}>
          <h2>¿Olvidaste tu <em>contraseña?</em></h2>
          <p className="form-instruction">Ingresa tu email y te enviaremos un código de seguridad.</p>
          <div className="form-group">
            <label htmlFor="email"><i className="fas fa-envelope" /> Correo electrónico</label>
            <input type="email" id="email" placeholder="ejemplo@correo.com" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <button type="submit" disabled={cargando}>
            {cargando && paso === 1 ? <><i className="fas fa-spinner fa-spin" /> Enviando...</> : <><i className="fas fa-paper-plane" /> Enviar código</>}
          </button>
          <Mensaje msg={msg[1]} />
        </form>

        <form className={`reset-form ${paso === 2 ? '' : 'hidden'}`} onSubmit={confirmarCodigo}>
          <h2>Confirma tu <em>código.</em></h2>
          <p className="form-instruction">Hemos enviado un código a tu correo. Ingrésalo a continuación.</p>
          <div className="form-group">
            <label htmlFor="code"><i className="fas fa-key" /> Código de 6 dígitos</label>
            <input type="text" id="code" placeholder="000000" maxLength={6} inputMode="numeric" required autoComplete="one-time-code" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
          </div>
          <button type="submit"><i className="fas fa-check-circle" /> Verificar código</button>
          <Mensaje msg={msg[2]} />
          <p className="resend-text">¿No recibiste nada? <a href="#" onClick={reiniciar}>Intentar de nuevo</a></p>
        </form>

        <form className={`reset-form ${paso === 3 ? '' : 'hidden'}`} onSubmit={cambiarClave}>
          <h2>Nueva <em>contraseña.</em></h2>
          <p className="form-instruction">Crea una contraseña segura que no hayas usado antes.</p>
          <div className="form-group">
            <label htmlFor="new-password"><i className="fas fa-lock" /> Nueva contraseña</label>
            <CampoClave id="new-password" envoltura="input-group" placeholder="••••••••" required minLength={6} autoComplete="new-password"
              value={clave.nueva} onChange={(e) => setClave((c) => ({ ...c, nueva: e.target.value }))} />
          </div>
          <div className="form-group">
            <label htmlFor="confirm-password"><i className="fas fa-lock" /> Confirmar contraseña</label>
            <CampoClave id="confirm-password" envoltura="input-group" placeholder="••••••••" required minLength={6} autoComplete="new-password"
              value={clave.confirmar} onChange={(e) => setClave((c) => ({ ...c, confirmar: e.target.value }))} />
          </div>
          <button type="submit" disabled={cargando}>
            {cargando && paso === 3 ? <><i className="fas fa-spinner fa-spin" /> Cambiando...</> : <><i className="fas fa-save" /> Cambiar contraseña</>}
          </button>
          <Mensaje msg={msg[3]} />
        </form>
      </section>
    </AccesoLayout>
  );
}
