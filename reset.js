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

// 1. Solicitar email para recuperación
if (forgotForm) {
  forgotForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = forgotForm.email.value.trim();
    forgotMsg.textContent = '';
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      forgotMsg.textContent = 'Ingresa un email válido.';
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
        forgotMsg.textContent = 'Revisa tu correo para continuar.';
        // Mostrar formulario de código
        forgotForm.style.display = 'none';
        confirmForm.style.display = 'flex';
        document.getElementById('email-confirm').value = email;
        mensaje.textContent = 'Si el correo existe, se ha enviado el enlace de recuperación.';
        mensaje.style.color = 'green';
      } else {
        forgotMsg.textContent = data.message || 'Error al enviar email.';
        mensaje.textContent = data.message || 'Ocurrió un error.';
        mensaje.style.color = 'red';
      }
    } catch (err) {
      forgotMsg.textContent = 'Error de red.';
      mensaje.textContent = 'Error de red.';
      mensaje.style.color = 'red';
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
      return;
    }
    // Aquí podrías validar el token en el backend, pero si el enlace ya lleva el token, puedes saltar este paso
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
      return;
    }
    if (password !== confirm) {
      resetMsg.textContent = 'Las contraseñas no coinciden.';
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
        resetMsg.textContent = 'Contraseña restablecida. Ahora puedes iniciar sesión.';
        resetForm.reset();
        mensaje.textContent = 'Contraseña restablecida. Ahora puedes iniciar sesión.';
        mensaje.style.color = 'green';
      } else {
        resetMsg.textContent = data.message || 'Error al restablecer.';
        mensaje.textContent = data.message || 'Ocurrió un error.';
        mensaje.style.color = 'red';
      }
    } catch (err) {
      resetMsg.textContent = 'Error de red.';
      mensaje.textContent = 'Error de red.';
      mensaje.style.color = 'red';
    }
  });
}
