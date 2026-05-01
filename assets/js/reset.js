// Lógica para recuperación de contraseña - Alta Densidad
const BACKEND_URL = (location.hostname === 'localhost' || location.hostname === '127.0.0.1') 
    ? 'http://localhost:3000' 
    : 'https://altadensidadpage-production.up.railway.app';

// Elementos
const forgotForm  = document.getElementById('forgot-password-form');
const confirmForm = document.getElementById('confirm-code-form');
const resetForm   = document.getElementById('reset-password-form');

const forgotMsg  = document.getElementById('forgot-password-msg');
const confirmMsg = document.getElementById('confirm-code-msg');
const resetMsg   = document.getElementById('reset-password-msg');

// Detectar parámetros en la URL (flujo directo)
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

window.addEventListener('DOMContentLoaded', () => {
    const token = getQueryParam('token');
    const email = getQueryParam('email');
    if (token && email) {
        showForm(resetForm);
        document.getElementById('reset-token').value = token;
        document.getElementById('reset-email').value = decodeURIComponent(email);
    }
});

function showForm(formToShow) {
    [forgotForm, confirmForm, resetForm].forEach(f => f.classList.add('hidden'));
    formToShow.classList.remove('hidden');
}

function setMsg(el, text, isSuccess = false) {
    el.textContent = text;
    el.classList.toggle('success', isSuccess);
}

// 1. Solicitar email
if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = forgotForm.email.value.trim();
        const btn = document.getElementById('btnForgot');
        
        setMsg(forgotMsg, '');
        if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
            setMsg(forgotMsg, 'Ingresa un email válido.');
            return;
        }

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (data.success) {
                showForm(confirmForm);
                document.getElementById('email-confirm').value = email;
            } else {
                setMsg(forgotMsg, data.message || 'Error al enviar el código.');
            }
        } catch (err) {
            setMsg(forgotMsg, 'Error al conectar con el servidor.');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar código';
        }
    });
}

// 2. Confirmar código
if (confirmForm) {
    confirmForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const code = confirmForm.code.value.trim();
        const email = document.getElementById('email-confirm').value;
        
        if (!code || code.length < 6) {
            setMsg(confirmMsg, 'Ingresa el código de 6 dígitos.');
            return;
        }

        // En este flujo, el código es el token
        showForm(resetForm);
        document.getElementById('reset-token').value = code;
        document.getElementById('reset-email').value = email;
    });
}

// 3. Resetear contraseña
if (resetForm) {
    resetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const password = resetForm['new-password'].value;
        const confirm  = resetForm['confirm-password'].value;
        const token    = document.getElementById('reset-token').value;
        const email    = document.getElementById('reset-email').value;
        const btn      = document.getElementById('btnReset');

        setMsg(resetMsg, '');
        if (password.length < 6) {
            setMsg(resetMsg, 'Mínimo 6 caracteres.');
            return;
        }
        if (password !== confirm) {
            setMsg(resetMsg, 'Las contraseñas no coinciden.');
            return;
        }

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cambiando...';

        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token, password })
            });
            const data = await res.json();
            if (data.success) {
                setMsg(resetMsg, '¡Contraseña cambiada con éxito! Redirigiendo...', true);
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                setMsg(resetMsg, data.message || 'Error al restablecer.');
            }
        } catch (err) {
            setMsg(resetMsg, 'Error de red.');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-save"></i> Cambiar contraseña';
        }
    });
}
