import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AccesoLayout, { CampoClave } from './AccesoLayout';
import { usePagina } from '../lib/hooks';
import { API } from '../config';

function guardarSesion(d) {
  localStorage.setItem('token', d.token);
  localStorage.setItem('usuario', JSON.stringify({ nombre: d.nombre, email: d.email, rol: d.rol }));
}

export default function Login() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [alerta, setAlerta] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [login, setLogin] = useState({ email: '', password: '' });
  const [registro, setRegistro] = useState({ nombre: '', email: '', password: '', password2: '' });
  usePagina({ titulo: 'Iniciar sesión | Fragancias de Alta Densidad', descripcion: 'Accede a tu cuenta de Fragancias de Alta Densidad.', ruta: '/login', indexar: false });

  // Si ya hay sesión activa, redirigir según el rol
  useEffect(() => {
    try {
      if (localStorage.getItem('token')) {
        const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
        navigate(usuario.rol === 'admin' ? '/admin' : '/', { replace: true });
      }
    } catch { /* sin almacenamiento */ }
  }, [navigate]);

  const mostrarTab = (t) => { setTab(t); setAlerta(null); };

  async function enviar(ruta, cuerpo, alExito) {
    setCargando(true);
    try {
      const res = await fetch(`${API}/auth/${ruta}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cuerpo)
      });
      const data = await res.json();
      if (!data.success) {
        setAlerta({ tipo: 'error', msg: data.message });
        return;
      }
      guardarSesion(data.data);
      alExito(data.data);
    } catch {
      setAlerta({ tipo: 'error', msg: 'No se pudo conectar con el servidor.' });
    } finally {
      setCargando(false);
    }
  }

  function ingresar(e) {
    e.preventDefault();
    const email = login.email.trim();
    if (!email || !login.password) { setAlerta({ tipo: 'error', msg: 'Completa todos los campos.' }); return; }
    enviar('login', { email, password: login.password }, (d) => {
      setAlerta({ tipo: 'exito', msg: `¡Bienvenido, ${d.nombre}!` });
      // Solo el rol admin entra al panel
      setTimeout(() => navigate(d.rol === 'admin' ? '/admin' : '/'), 1000);
    });
  }

  function registrar(e) {
    e.preventDefault();
    const nombre = registro.nombre.trim();
    const email = registro.email.trim();
    const { password, password2 } = registro;
    if (!nombre || !email || !password || !password2) { setAlerta({ tipo: 'error', msg: 'Completa todos los campos.' }); return; }
    if (password !== password2) { setAlerta({ tipo: 'error', msg: 'Las contraseñas no coinciden.' }); return; }
    if (password.length < 6) { setAlerta({ tipo: 'error', msg: 'La contraseña debe tener al menos 6 caracteres.' }); return; }
    enviar('register', { nombre, email, password }, (d) => {
      setAlerta({ tipo: 'exito', msg: `¡Cuenta creada! Bienvenido, ${d.nombre}.` });
      setTimeout(() => navigate('/'), 1200);
    });
  }

  const campoLogin = (k) => ({ value: login[k], onChange: (e) => setLogin((v) => ({ ...v, [k]: e.target.value })) });
  const campoReg = (k) => ({ value: registro[k], onChange: (e) => setRegistro((v) => ({ ...v, [k]: e.target.value })) });

  return (
    <AccesoLayout>
      <section className="acc-card">
        <span className="up eyebrow">Tu cuenta</span>
        <h1>Bienvenido a <em>la casa.</em></h1>

        <div className="auth-tabs up">
          <button type="button" className={`tab-btn up ${tab === 'login' ? 'active' : ''}`} onClick={() => mostrarTab('login')}>Iniciar sesión</button>
          <button type="button" className={`tab-btn up ${tab === 'register' ? 'active' : ''}`} onClick={() => mostrarTab('register')}>Registrarse</button>
        </div>

        <div className={`alerta ${alerta ? alerta.tipo : 'hidden'}`} role="alert">{alerta?.msg}</div>

        <form className={`auth-form ${tab === 'login' ? '' : 'hidden'}`} noValidate onSubmit={ingresar}>
          <div className="form-group">
            <label htmlFor="loginEmail"><i className="fas fa-envelope" /> Email</label>
            <input type="email" id="loginEmail" placeholder="tu@correo.com" autoComplete="email" required {...campoLogin('email')} />
          </div>
          <div className="form-group">
            <label htmlFor="loginPassword"><i className="fas fa-lock" /> Contraseña</label>
            <CampoClave id="loginPassword" placeholder="••••••••" autoComplete="current-password" required {...campoLogin('password')} />
          </div>
          <button type="submit" className="btn-auth" disabled={cargando}>
            {cargando ? <><i className="fas fa-spinner fa-spin" /> Ingresando...</> : <><i className="fas fa-sign-in-alt" /> Ingresar</>}
          </button>
          <p className="forgot-link"><Link to="/reset">¿Olvidaste tu contraseña?</Link></p>
          <p className="auth-switch">¿No tienes cuenta? <a href="#" onClick={(e) => { e.preventDefault(); mostrarTab('register'); }}>Regístrate</a></p>
        </form>

        <form className={`auth-form ${tab === 'register' ? '' : 'hidden'}`} noValidate onSubmit={registrar}>
          <div className="form-group">
            <label htmlFor="regNombre"><i className="fas fa-user" /> Nombre completo</label>
            <input type="text" id="regNombre" placeholder="Tu nombre" autoComplete="name" required {...campoReg('nombre')} />
          </div>
          <div className="form-group">
            <label htmlFor="regEmail"><i className="fas fa-envelope" /> Email</label>
            <input type="email" id="regEmail" placeholder="tu@correo.com" autoComplete="email" required {...campoReg('email')} />
          </div>
          <div className="form-group">
            <label htmlFor="regPassword"><i className="fas fa-lock" /> Contraseña</label>
            <CampoClave id="regPassword" placeholder="Mínimo 6 caracteres" autoComplete="new-password" required {...campoReg('password')} />
          </div>
          <div className="form-group">
            <label htmlFor="regPassword2"><i className="fas fa-lock" /> Confirmar contraseña</label>
            <CampoClave id="regPassword2" placeholder="Repite tu contraseña" autoComplete="new-password" required {...campoReg('password2')} />
          </div>
          <button type="submit" className="btn-auth" disabled={cargando}>
            {cargando ? <><i className="fas fa-spinner fa-spin" /> Creando cuenta...</> : <><i className="fas fa-user-plus" /> Crear cuenta</>}
          </button>
          <p className="auth-switch">¿Ya tienes cuenta? <a href="#" onClick={(e) => { e.preventDefault(); mostrarTab('login'); }}>Inicia sesión</a></p>
        </form>
      </section>
    </AccesoLayout>
  );
}
