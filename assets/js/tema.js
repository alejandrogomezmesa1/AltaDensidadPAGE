// tema.js — Toggle modo oscuro/claro con persistencia en localStorage
// IMPORTANTE: incluir en <head> de cada página para evitar flash de modo erróneo

// 1. Aplicar clase e atributo inmediatamente (antes de que el DOM se pinte)
(function () {
  const tema = localStorage.getItem("altadensidad_tema");
  // Por defecto usar modo oscuro. Sólo activar 'modo-claro' si el usuario
  // tiene explícitamente guardado 'claro'. Si no hay valor, asumimos oscuro.
  if (tema === "claro") {
    document.documentElement.classList.add("modo-claro");
    document.documentElement.setAttribute("data-theme", "light");
  } else {
    // Asegurarse de que no exista la clase de modo claro y activar data-theme="dark"
    document.documentElement.classList.remove("modo-claro");
    document.documentElement.setAttribute("data-theme", "dark");
  }
})();

// 2. Cuando el DOM esté listo: inyectar botón en navbar y vincular eventos
document.addEventListener("DOMContentLoaded", function () {
  _inyectarBotonTema();
  _actualizarIconoTema();
  _iniciarMenuMobile();
  _iniciarDropdowns();
});

function _inyectarBotonTema() {
  const navSesion = document.getElementById("navSesion");
  if (!navSesion || !navSesion.parentElement) return;

  const li = document.createElement("li");
  li.id = "liTema";
  li.innerHTML =
    '<button class="btn-tema" id="toggleTema" aria-label="Cambiar tema"></button>';
  navSesion.parentElement.insertBefore(li, navSesion);

  document.getElementById("toggleTema").addEventListener("click", _toggleTema);
}

function _actualizarIconoTema(animar = false) {
  const btn = document.getElementById("toggleTema");
  if (!btn) return;
  const esModoClaro = document.documentElement.classList.contains("modo-claro");
  btn.title = esModoClaro ? "Cambiar a modo oscuro" : "Cambiar a modo claro";

  if (animar && window.ADAnimations) {
    window.ADAnimations.animateThemeToggle(btn, esModoClaro);
  } else {
    btn.innerHTML = esModoClaro
      ? '<i class="fas fa-moon"></i>'
      : '<i class="fas fa-sun"></i>';
  }
}

function _toggleTema() {
  const esModoClaro = document.documentElement.classList.toggle("modo-claro");
  document.documentElement.setAttribute("data-theme", esModoClaro ? "light" : "dark");
  localStorage.setItem("altadensidad_tema", esModoClaro ? "claro" : "oscuro");
  _actualizarIconoTema(true);
}

/* ====================================================
   MENÚ HAMBURGER — MÓVIL
   ==================================================== */
function _iniciarMenuMobile() {
  const hamburger = document.getElementById("hamburgerBtn");
  const nav = document.querySelector(".main-nav");
  const overlay = document.getElementById("navOverlay");
  if (!hamburger || !nav) return;

  function _abrirNav() {
    nav.classList.add("nav-open");
    hamburger.setAttribute("aria-expanded", "true");
    hamburger.innerHTML = '<i class="fas fa-times"></i>';
    if (overlay) overlay.classList.add("active");
    document.body.style.overflow = "hidden";
    if (window.ADAnimations) {
      window.ADAnimations.staggerDrawerNav(".main-nav");
    }
  }

  function _cerrarNav() {
    nav.classList.remove("nav-open");
    hamburger.setAttribute("aria-expanded", "false");
    hamburger.innerHTML = '<i class="fas fa-bars"></i>';
    if (overlay) overlay.classList.remove("active");
    document.body.style.overflow = "";
    // Cerrar todos los dropdowns abiertos
    nav
      .querySelectorAll(".dropdown.dropdown-open")
      .forEach((d) => d.classList.remove("dropdown-open"));
  }

  hamburger.addEventListener("click", () => {
    nav.classList.contains("nav-open") ? _cerrarNav() : _abrirNav();
  });

  if (overlay) overlay.addEventListener("click", _cerrarNav);

  // Nuevo botón de cierre interno
  const closeBtn = document.getElementById("closeNav");
  if (closeBtn) closeBtn.addEventListener("click", _cerrarNav);

  // Cerrar nav al presionar Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") _cerrarNav();
  });

  // Cerrar nav al hacer clic en un link directo (no dropdown trigger)
  nav.querySelectorAll("a").forEach((link) => {
    if (link.parentElement.classList.contains("dropdown")) return; // skip dropdown triggers
    link.addEventListener("click", _cerrarNav);
  });
  nav.querySelectorAll(".dropdown-menu a").forEach((link) => {
    link.addEventListener("click", _cerrarNav);
  });

  // Swipe to close (Deslizar a la izquierda para cerrar)
  let touchStartX = 0;
  let touchEndX = 0;

  nav.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
    },
    { passive: true },
  );

  nav.addEventListener(
    "touchend",
    (e) => {
      touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 70) {
        // Deslizamiento de más de 70px a la izquierda
        _cerrarNav();
      }
    },
    { passive: true },
  );

  // Cerrar nav si la ventana se agranda por encima del breakpoint tablet
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1200) _cerrarNav();
  });
}

/* ====================================================
   DROPDOWNS — GESTIÓN GLOBAL ROBUSTA (Desktop + Mobile)
   ==================================================== */
function _iniciarDropdowns() {
  const dropdowns = document.querySelectorAll(".dropdown");
  if (!dropdowns.length) return;

  dropdowns.forEach((dropdown) => {
    const trigger = dropdown.querySelector(":scope > a");
    if (!trigger) return;

    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = dropdown.classList.contains("dropdown-open");

      // Cerrar otros dropdowns abiertos
      document.querySelectorAll(".dropdown.dropdown-open").forEach((d) => {
        if (d !== dropdown) d.classList.remove("dropdown-open");
      });

      dropdown.classList.toggle("dropdown-open", !isOpen);
    });
  });

  // Cerrar al hacer clic fuera
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".dropdown")) {
      document
        .querySelectorAll(".dropdown.dropdown-open")
        .forEach((d) => d.classList.remove("dropdown-open"));
    }
  });

  // Cerrar con Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      document
        .querySelectorAll(".dropdown.dropdown-open")
        .forEach((d) => d.classList.remove("dropdown-open"));
    }
  });
}

