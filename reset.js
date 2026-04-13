// Lógica para recuperación de contraseña
const API_BASE = '/api/auth';

// Elementos
const forgotForm = document.getElementById('forgot-password-form');
const confirmForm = document.getElementById('confirm-code-form');
const resetForm = document.getElementById('reset-password-form');

const forgotMsg = document.getElementById('forgot-password-msg');
const confirmMsg = document.getElementById('confirm-code-msg');
const resetMsg = document.getElementById('reset-password-msg');

const mensaje = document.createElement('div');
mensaje.id = 'mensaje-reset';
mensaje.style.marginTop = '10px';
mensaje.style.textAlign = 'center';
document.querySelector('.reset-form').appendChild(mensaje);

// Cambia esta variable por la URL de tu backend en Railway
const BACKEND_URL = 'https://altadensidadpage-production.up.railway.app'; // <-- pon aquí tu URL real

// Detectar parámetros en la URL para flujo directo desde el correo
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

window.addEventListener('DOMContentLoaded', () => {
  const token = getQueryParam('token');
  const email = getQueryParam('email');
  if (token && email) {
    // Oculta el formulario de email y código, muestra el de reset
    if (forgotForm) forgotForm.style.display = 'none';
    if (confirmForm) confirmForm.style.display = 'none';
    if (resetForm) {
      resetForm.style.display = 'flex';
      document.getElementById('reset-token').value = token;
      document.getElementById('reset-email').value = decodeURIComponent(email);
    }
  }
});

// 1. Solicitar email para recuperación
if (forgotForm) {
  forgotForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = forgotForm.email.value.trim();
    forgotMsg.textContent = '';
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      forgotMsg.textContent = 'Ingresa un email válido.';
      forgotMsg.style.color = 'red';
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        forgotMsg.style.color = '#00b894';
        forgotMsg.textContent = 'Te hemos enviado un código de recuperación a tu correo.';
        forgotForm.style.display = 'none';
        confirmForm.style.display = 'flex';
        document.getElementById('email-confirm').value = email;
        mensaje.textContent = '';
      } else {
        forgotMsg.textContent = data.message || 'Error al enviar el código.';
        forgotMsg.style.color = 'red';
        mensaje.textContent = '';
      }
    } catch (err) {
      forgotMsg.textContent = 'Error de red.';
      forgotMsg.style.color = 'red';
      mensaje.textContent = '';
    }
  });
}

// 2. Confirmar código (token)
if (confirmForm) {
  confirmForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const code = confirmForm.code.value.trim();
    const email = confirmForm['email-confirm'].value;
    confirmMsg.textContent = '';
    if (!code) {
      confirmMsg.textContent = 'Ingresa el código.';
      confirmMsg.style.color = 'red';
      return;
    }
    // Simulación: mostrar formulario de reset
    confirmForm.style.display = 'none';
    resetForm.style.display = 'flex';
    document.getElementById('reset-token').value = code;
    document.getElementById('reset-email').value = email;
  });
}

// 3. Resetear contraseña
if (resetForm) {
  resetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = resetForm['new-password'].value;
    const confirm = resetForm['confirm-password'].value;
    const token = resetForm['reset-token'].value;
    const email = resetForm['reset-email'].value;
    resetMsg.textContent = '';
    if (password.length < 6) {
      resetMsg.textContent = 'La contraseña debe tener al menos 6 caracteres.';
      resetMsg.style.color = 'red';
      return;
    }
    if (password !== confirm) {
      resetMsg.textContent = 'Las contraseñas no coinciden.';
      resetMsg.style.color = 'red';
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, password })
      });
      const data = await res.json();
      if (data.success) {
        resetMsg.style.color = '#00b894';
        resetMsg.textContent = '¡Contraseña restablecida! Ahora puedes iniciar sesión.';
        resetForm.reset();
        mensaje.textContent = '';
      } else {
        resetMsg.textContent = data.message || 'Error al restablecer.';
        resetMsg.style.color = 'red';
        mensaje.textContent = '';
      }
    } catch (err) {
      resetMsg.textContent = 'Error de red.';
      resetMsg.style.color = 'red';
      mensaje.textContent = '';
    }
  });
}
