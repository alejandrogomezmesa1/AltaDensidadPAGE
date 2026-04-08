const API = ((location.hostname === 'localhost' || location.hostname === '127.0.0.1') ? 'http://localhost:3000/api' : 'https://altadensidadpage-production.up.railway.app/api') + '/auth';

// ---- Tabs ----
function mostrarTab(tab) {
    const isLogin = tab === 'login';
    document.getElementById('formLogin').classList.toggle('hidden', !isLogin);
    document.getElementById('formRegister').classList.toggle('hidden', isLogin);
    document.getElementById('tabLogin').classList.toggle('active', isLogin);
    document.getElementById('tabRegister').classList.toggle('active', !isLogin);
    ocultarAlerta();
}

// ---- Mostrar / ocultar contraseña ----
function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    const icon = btn.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

// ---- Alertas ----
function mostrarAlerta(msg, tipo) {
    const el = document.getElementById('alerta');
    el.textContent = msg;
    el.className = `alerta ${tipo}`;
}
function ocultarAlerta() {
    document.getElementById('alerta').className = 'alerta hidden';
}

// ---- LOGIN ----
document.getElementById('formLogin').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        mostrarAlerta('Completa todos los campos.', 'error');
        return;
    }

    const btn = document.getElementById('btnLogin');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ingresando...';

    try {
        const res  = await fetch(`${API}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (!data.success) {
            mostrarAlerta(data.message, 'error');
            return;
        }

        // Guardar sesión en localStorage
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('usuario', JSON.stringify({
            nombre: data.data.nombre,
            email: data.data.email,
            rol: data.data.rol
        }));

        mostrarAlerta(`¡Bienvenido, ${data.data.nombre}!`, 'exito');

        // Redirigir según rol
        setTimeout(() => {
            if (data.data.rol === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'index.html';
            }
        }, 1000);

    } catch (err) {
        mostrarAlerta('No se pudo conectar con el servidor.', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Ingresar';
    }
});

// ---- REGISTER ----
document.getElementById('formRegister').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre    = document.getElementById('regNombre').value.trim();
    const email     = document.getElementById('regEmail').value.trim();
    const password  = document.getElementById('regPassword').value;
    const password2 = document.getElementById('regPassword2').value;

    if (!nombre || !email || !password || !password2) {
        mostrarAlerta('Completa todos los campos.', 'error');
        return;
    }

    if (password !== password2) {
        mostrarAlerta('Las contraseñas no coinciden.', 'error');
        return;
    }

    if (password.length < 6) {
        mostrarAlerta('La contraseña debe tener al menos 6 caracteres.', 'error');
        return;
    }

    const btn = document.getElementById('btnRegister');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creando cuenta...';

    try {
        const res  = await fetch(`${API}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, email, password })
        });
        const data = await res.json();

        if (!data.success) {
            mostrarAlerta(data.message, 'error');
            return;
        }

        // Guardar sesión
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('usuario', JSON.stringify({
            nombre: data.data.nombre,
            email: data.data.email,
            rol: data.data.rol
        }));

        mostrarAlerta(`¡Cuenta creada! Bienvenido, ${data.data.nombre}.`, 'exito');
        setTimeout(() => { window.location.href = 'index.html'; }, 1200);

    } catch (err) {
        mostrarAlerta('No se pudo conectar con el servidor.', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-user-plus"></i> Crear cuenta';
    }
});

// ---- Si ya hay sesión activa, redirigir ----
(function checkSesion() {
    const token = localStorage.getItem('token');
    if (token) {
        const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
        window.location.href = usuario.rol === 'admin' ? 'admin.html' : 'index.html';
    }
})();
