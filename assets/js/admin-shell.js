// admin-shell.js — Sidebar, barra superior, tema y sesión del panel de administración
(function () {
    'use strict';

    const SECCIONES = {
        monitoreo: { titulo: 'Monitoreo', grupo: 'General' },
        productos: { titulo: 'Productos', grupo: 'Catálogo' },
        envases:   { titulo: 'Envases',   grupo: 'Catálogo' },
        kits:      { titulo: 'Kits',      grupo: 'Catálogo' },
        top10:     { titulo: 'Top 10',    grupo: 'Catálogo' },
        ordenes:   { titulo: 'Órdenes',   grupo: 'Ventas' }
    };
    const ESCRITORIO = window.matchMedia('(min-width: 1024px)');
    const html = document.documentElement;
    const $ = (id) => document.getElementById(id);

    function esEscritorio() { return ESCRITORIO.matches; }

    function sincronizarToggle() {
        const btn = $('admToggle');
        if (!btn) return;
        const abierto = esEscritorio() ? !html.classList.contains('adm-compacto') : document.body.classList.contains('adm-side-open');
        btn.setAttribute('aria-expanded', String(abierto));
    }

    function abrirMovil() {
        document.body.classList.add('adm-side-open');
        sincronizarToggle();
        const activo = document.querySelector('.adm-nav .active') || document.querySelector('.adm-nav-item');
        if (activo) activo.focus();
    }

    function cerrarMovil() {
        document.body.classList.remove('adm-side-open');
        sincronizarToggle();
    }

    // Tras colapsar/expandir, los gráficos de Chart.js necesitan recalcular su tamaño
    function avisarRedimension() {
        setTimeout(() => window.dispatchEvent(new Event('resize')), 320);
    }

    function alternarSidebar() {
        if (esEscritorio()) {
            const compacto = html.classList.toggle('adm-compacto');
            try { localStorage.setItem('admin_sidebar', compacto ? 'compacto' : 'expandido'); } catch (e) {}
            sincronizarToggle();
            avisarRedimension();
        } else if (document.body.classList.contains('adm-side-open')) {
            cerrarMovil();
        } else {
            abrirMovil();
        }
    }

    function alCambiarSeccion(seccion) {
        const meta = SECCIONES[seccion] || SECCIONES.monitoreo;
        const titulo = $('admSectionTitle');
        const grupo = $('admCrumbGrupo');
        if (titulo) titulo.textContent = meta.titulo;
        if (grupo) grupo.textContent = meta.grupo;
        document.title = `${meta.titulo} · Panel | Fragancias de Alta Densidad`;
        document.querySelectorAll('.adm-nav .admin-tab').forEach((b) => {
            b.setAttribute('aria-current', b.classList.contains('active') ? 'page' : 'false');
        });
        if (!esEscritorio()) cerrarMovil();
        window.scrollTo({ top: 0 });
    }

    function initTema() {
        const btn = $('admTema');
        if (!btn) return;
        const ico = btn.querySelector('i');
        const txt = $('admTemaTxt');
        const pintar = () => {
            const claro = html.classList.contains('modo-claro');
            if (ico) ico.className = claro ? 'fas fa-moon' : 'fas fa-sun';
            if (txt) txt.textContent = claro ? 'Modo oscuro' : 'Modo claro';
            btn.dataset.label = claro ? 'Modo oscuro' : 'Modo claro';
        };
        btn.addEventListener('click', () => {
            const claro = html.classList.toggle('modo-claro');
            html.setAttribute('data-theme', claro ? 'light' : 'dark');
            try { localStorage.setItem('altadensidad_tema', claro ? 'claro' : 'oscuro'); } catch (e) {}
            pintar();
        });
        pintar();
    }

    function initUsuario() {
        let usuario = null;
        try { usuario = JSON.parse(localStorage.getItem('usuario') || 'null'); } catch (e) {}
        if (usuario && usuario.nombre) {
            const nombre = String(usuario.nombre).trim();
            if ($('admUserName')) $('admUserName').textContent = nombre;
            if ($('admAvatar')) $('admAvatar').textContent = nombre.charAt(0).toUpperCase();
        }
        const salir = $('admLogout');
        if (salir) {
            salir.addEventListener('click', () => {
                try {
                    localStorage.removeItem('token');
                    localStorage.removeItem('usuario');
                } catch (e) {}
                window.location.href = 'login.html';
            });
        }
    }

    function initFecha() {
        const el = $('admFecha');
        if (el) el.textContent = new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
    }

    document.addEventListener('DOMContentLoaded', () => {
        const toggle = $('admToggle');
        if (toggle) toggle.addEventListener('click', alternarSidebar);
        document.querySelectorAll('[data-side-close]').forEach((el) => el.addEventListener('click', cerrarMovil));
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.body.classList.contains('adm-side-open')) cerrarMovil();
        });
        ESCRITORIO.addEventListener('change', () => { cerrarMovil(); avisarRedimension(); });
        initTema();
        initUsuario();
        initFecha();
        sincronizarToggle();
    });

    window.adminShell = { alCambiarSeccion, abrirMovil, cerrarMovil };
})();
