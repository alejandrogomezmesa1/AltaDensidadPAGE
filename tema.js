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
