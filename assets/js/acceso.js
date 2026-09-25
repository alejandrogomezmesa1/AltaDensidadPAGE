// acceso.js — Tema claro/oscuro compartido por login, reset y páginas de resultado de pago
(function() {
  "use strict";
  const btn = document.getElementById("toggleTema");
  if (!btn) return;
  const ico = btn.querySelector("i");

  function updateLabel() {
    const isLight = document.documentElement.classList.contains("modo-claro");
    const txt = isLight ? "Cambiar a modo oscuro" : "Cambiar a modo claro";
    btn.setAttribute("aria-label", txt);
    btn.title = txt;
    if (ico) ico.className = isLight ? "fa-solid fa-moon" : "fa-solid fa-sun";
  }

  btn.addEventListener("click", function() {
    const isLight = document.documentElement.classList.toggle("modo-claro");
    document.documentElement.setAttribute("data-theme", isLight ? "light" : "dark");
    try { localStorage.setItem("altadensidad_tema", isLight ? "claro" : "oscuro"); } catch(e) {}
    updateLabel();
  });

  updateLabel();
})();
