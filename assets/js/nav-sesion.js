// nav-sesion.js — incluir en todos los HTML del sitio
(function() {
    const navSesion = document.getElementById('navSesion');
    if (!navSesion) return;

    const token   = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');

    if (token && usuario) {
        // Sesión activa: mostrar nombre + cerrar sesión
        const esAdmin = usuario.rol === 'admin';
        navSesion.innerHTML = `
            <div class="nav-user-menu">
                <span class="nav-user-name"><i class="fas fa-user-circle"></i> ${usuario.nombre.split(' ')[0]}</span>
                <ul class="nav-user-dropdown">
                    ${esAdmin ? `<li><a href="admin.html"><i class="fas fa-cog"></i> Panel Admin</a></li>` : ''}
                    <li><a href="#" id="btnCerrarSesion"><i class="fas fa-sign-out-alt"></i> Cerrar sesión</a></li>
                </ul>
            </div>
        `;
        document.getElementById('btnCerrarSesion').addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            window.location.href = 'index.html';
        });
    } else {
        // Sin sesión: mostrar botón Ingresar
        navSesion.innerHTML = `<a href="login.html" class="nav-login-btn"><i class="fas fa-user"></i> Ingresar</a>`;
    }
})();
