// tema.js — Toggle modo oscuro/claro con persistencia en localStorage
// IMPORTANTE: incluir en <head> de cada página para evitar flash de modo erróneo

// 1. Aplicar clase inmediatamente (antes de que el DOM se pinte)
(function () {
    if (localStorage.getItem('altadensidad_tema') === 'claro') {
        document.documentElement.classList.add('modo-claro');
    }
})();

// 2. Cuando el DOM esté listo: inyectar botón en navbar y vincular eventos
document.addEventListener('DOMContentLoaded', function () {
    _inyectarBotonTema();
    _actualizarIconoTema();
    _iniciarMenuMobile();
});

function _inyectarBotonTema() {
    const navSesion = document.getElementById('navSesion');
    if (!navSesion || !navSesion.parentElement) return;

    const li = document.createElement('li');
    li.id = 'liTema';
    li.innerHTML = '<button class="btn-tema" id="toggleTema" aria-label="Cambiar tema"></button>';
    navSesion.parentElement.insertBefore(li, navSesion);

    document.getElementById('toggleTema').addEventListener('click', _toggleTema);
}

function _actualizarIconoTema() {
    const btn = document.getElementById('toggleTema');
    if (!btn) return;
    const esModoClaro = document.documentElement.classList.contains('modo-claro');
    // En modo claro → mostrar luna (para volver al oscuro)
    // En modo oscuro → mostrar sol (para ir al claro)
    btn.innerHTML = esModoClaro
        ? '<i class="fas fa-moon"></i>'
        : '<i class="fas fa-sun"></i>';
    btn.title = esModoClaro ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro';
}

function _toggleTema() {
    const esModoClaro = document.documentElement.classList.toggle('modo-claro');
    localStorage.setItem('altadensidad_tema', esModoClaro ? 'claro' : 'oscuro');
    _actualizarIconoTema();
}

/* ====================================================
   MENÚ HAMBURGER — MÓVIL
   ==================================================== */
function _iniciarMenuMobile() {
    const hamburger = document.getElementById('hamburgerBtn');
    const nav = document.querySelector('.main-nav');
    const overlay = document.getElementById('navOverlay');
    if (!hamburger || !nav) return;

    function _abrirNav() {
        nav.classList.add('nav-open');
        hamburger.setAttribute('aria-expanded', 'true');
        hamburger.innerHTML = '<i class="fas fa-times"></i>';
        if (overlay) overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function _cerrarNav() {
        nav.classList.remove('nav-open');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.innerHTML = '<i class="fas fa-bars"></i>';
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
        // Cerrar todos los dropdowns abiertos
        nav.querySelectorAll('.dropdown.dropdown-open')
            .forEach(d => d.classList.remove('dropdown-open'));
    }

    hamburger.addEventListener('click', () => {
        nav.classList.contains('nav-open') ? _cerrarNav() : _abrirNav();
    });

    if (overlay) overlay.addEventListener('click', _cerrarNav);

    // Cerrar nav al presionar Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') _cerrarNav();
    });

    // Cerrar nav al hacer clic en un link directo (no dropdown trigger)
    nav.querySelectorAll('a').forEach(link => {
        if (link.parentElement.classList.contains('dropdown')) return; // skip dropdown triggers
        link.addEventListener('click', _cerrarNav);
    });
    nav.querySelectorAll('.dropdown-menu a').forEach(link => {
        link.addEventListener('click', _cerrarNav);
    });

    // Swipe to close (Deslizar a la izquierda para cerrar)
    let touchStartX = 0;
    let touchEndX = 0;

    nav.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    nav.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        if (touchStartX - touchEndX > 70) { // Deslizamiento de más de 70px a la izquierda
            _cerrarNav();
        }
    }, { passive: true });

    // Dropdown toggle — todos los dispositivos (reemplaza hover/focus-within CSS)
    nav.querySelectorAll('.dropdown > a').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const dropdown = this.parentElement;
            const isOpen = dropdown.classList.contains('dropdown-open');
            // Cerrar todos los dropdowns abiertos
            nav.querySelectorAll('.dropdown.dropdown-open')
                .forEach(d => d.classList.remove('dropdown-open'));
            // Abrir éste solo si estaba cerrado
            if (!isOpen) dropdown.classList.add('dropdown-open');
        });
    });

    // Cerrar dropdown al hacer clic fuera (desktop y táctil)
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.dropdown')) {
            nav.querySelectorAll('.dropdown.dropdown-open')
                .forEach(d => d.classList.remove('dropdown-open'));
        }
    });

    // Cerrar dropdown al perder el foco (navegación con teclado)
    nav.querySelectorAll('.dropdown').forEach(dropdown => {
        dropdown.addEventListener('focusout', function (e) {
            // relatedTarget es el elemento que recibe el foco a continuación
            if (!dropdown.contains(e.relatedTarget)) {
                dropdown.classList.remove('dropdown-open');
            }
        });
    });

    // Cerrar nav si la ventana se agranda por encima del breakpoint
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) _cerrarNav();
    });
}
