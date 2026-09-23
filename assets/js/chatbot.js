// ==========================================================================
// chatbot.js — Widget flotante "Asistente Alta Densidad"
// Habla con el backend Node (proxy seguro) en POST /api/chatbot.
//
// La API key del chatbot NUNCA se expone aquí: vive en variables de entorno
// del backend (CHATBOT_API_URL / CHATBOT_API_KEY). El frontend solo llama a
// {apiUrl}/chatbot, igual que el resto de endpoints de la página.
//
// Incluir al final del <body> (con defer) en las páginas públicas.
// El widget se inyecta automáticamente; no requiere editar el HTML.
// ==========================================================================

/* ==========================================================================
   CONFIGURACIÓN — edita estos valores según tu entorno
   ========================================================================== */
const AD_CHATBOT_CONFIG = {
  // Base del backend Node (sin barra final). El endpoint real es /chatbot.
  // En producción apunta a Railway (mismo backend que ya usa la página).
  apiUrl:
    location.hostname === "localhost" || location.hostname === "127.0.0.1"
      ? "http://localhost:3000/api"
      : "https://altadensidadpage-production.up.railway.app/api",

  // Identidad del bot
  botName: "Asistente Alta Densidad",
  botSubtitle: "En línea",

  // Mensaje de bienvenida (texto, admite saltos de línea \n)
  welcomeMessage:
    "¡Hola! Soy el asistente de Alta Densidad.\nPregúntame por perfumes, precios o recomendaciones. Ej: \"¿cuánto cuesta la Bharara King?\"",

  // Sugerencias rápidas mostradas al abrir
  suggestions: [
    "Top 10 perfumes",
    "Perfumes para hombre",
    "¿Cuánto cuesta la Bharara King?",
  ],

  // Tiempo máximo de espera de respuesta (ms)
  timeoutMs: 120000,
};

// Override en tiempo de ejecución — útil para probar sin redeploy.
// Desde la consola del navegador:
//   localStorage.setItem("ad_chatbot_api_url", "http://localhost:3000/api");
try {
  const overrideUrl = localStorage.getItem("ad_chatbot_api_url");
  if (overrideUrl) AD_CHATBOT_CONFIG.apiUrl = overrideUrl;
} catch (_) {
  /* localStorage no disponible; se usan los valores por defecto */
}

(function () {
  "use strict";

  const CFG = AD_CHATBOT_CONFIG;
  let sessionId = null; // memoria multi-turno proporcionada por la API

  // ── Inyectar estructura del widget ─────────────────────────────────────
  function _render() {
    const root = document.createElement("div");
    root.className = "ad-chatbot";
    root.id = "adChatbot";

    const fab =
      '<span class="ad-chatbot-pulse"></span>' +
      '<i class="fas fa-comment-dots ad-chatbot-fab-icon" aria-hidden="true"></i>' +
      '<i class="fas fa-times ad-chatbot-fab-close" aria-hidden="true"></i>';

    root.innerHTML =
      '<button class="ad-chatbot-fab" id="adChatbotFab" aria-label="Abrir chat" aria-expanded="false">' +
        fab +
      "</button>" +
      '<div class="ad-chatbot-panel" id="adChatbotPanel" aria-hidden="true">' +
        '<div class="ad-chatbot-header">' +
          '<div class="ad-chatbot-header-icon"><i class="fas fa-robot" aria-hidden="true"></i></div>' +
          '<div class="ad-chatbot-header-text">' +
            '<div class="ad-chatbot-header-title"></div>' +
            '<div class="ad-chatbot-header-subtitle"><span class="dot"></span></div>' +
          "</div>" +
          '<button class="ad-chatbot-header-close" id="adChatbotClose" aria-label="Cerrar chat"><i class="fas fa-chevron-down" aria-hidden="true"></i></button>' +
        "</div>" +
        '<div class="ad-chatbot-messages" id="adChatbotMessages"></div>' +
        '<div class="ad-chatbot-typing" id="adChatbotTyping" hidden>' +
          "<span></span><span></span><span></span>" +
        "</div>" +
        '<div class="ad-chatbot-suggestions" id="adChatbotSuggestions"></div>' +
        '<form class="ad-chatbot-form" id="adChatbotForm">' +
          '<input class="ad-chatbot-input" id="adChatbotInput" type="text" placeholder="Escribe tu mensaje..." autocomplete="off" maxlength="500" />' +
          '<button class="ad-chatbot-send" id="adChatbotSend" type="submit" aria-label="Enviar"><i class="fas fa-paper-plane" aria-hidden="true"></i></button>' +
        "</form>" +
      "</div>";

    document.body.appendChild(root);

    root.querySelector(".ad-chatbot-header-title").textContent = CFG.botName;
    root.querySelector(".ad-chatbot-header-subtitle").appendChild(
      document.createTextNode(CFG.botSubtitle),
    );

    _renderSuggestions(root);
    _addMessage("bot", CFG.welcomeMessage);
  }

  function _renderSuggestions(root) {
    const box = root.querySelector("#adChatbotSuggestions");
    (CFG.suggestions || []).forEach((s) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "ad-chatbot-chip";
      chip.textContent = s;
      chip.addEventListener("click", () => _send(s));
      box.appendChild(chip);
    });
  }

  // ── Estado abierto/cerrado ─────────────────────────────────────────────
  function _setOpen(open) {
    const root = document.getElementById("adChatbot");
    const panel = document.getElementById("adChatbotPanel");
    const fab = document.getElementById("adChatbotFab");
    if (!root) return;
    root.classList.toggle("ad-chatbot-open", open);
    panel.setAttribute("aria-hidden", String(!open));
    fab.setAttribute("aria-expanded", String(open));
    if (open) {
      const input = document.getElementById("adChatbotInput");
      if (input) input.focus();
    }
  }

  function _bind() {
    document
      .getElementById("adChatbotFab")
      .addEventListener("click", () =>
        _setOpen(!document.getElementById("adChatbot").classList.contains("ad-chatbot-open")),
      );
    document.getElementById("adChatbotClose").addEventListener("click", () => _setOpen(false));
    document.getElementById("adChatbotForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const input = document.getElementById("adChatbotInput");
      const text = input.value.trim();
      if (!text) return;
      input.value = "";
      _send(text);
    });

    // Cerrar con Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") _setOpen(false);
    });
  }

  // ── Mensajes ───────────────────────────────────────────────────────────
  function _addMessage(role, text) {
    const box = document.getElementById("adChatbotMessages");
    const el = document.createElement("div");
    el.className = "ad-chatbot-msg ad-chatbot-msg-" + role;
    el.textContent = text;
    box.appendChild(el);
    box.scrollTop = box.scrollHeight;
    return el;
  }

  function _setTyping(on) {
    document.getElementById("adChatbotTyping").hidden = !on;
    const box = document.getElementById("adChatbotMessages");
    box.scrollTop = box.scrollHeight;
  }

  // ── Envío a la API ─────────────────────────────────────────────────────
  async function _send(message) {
    _setOpen(true);
    _addMessage("user", message);
    _setTyping(true);
    _setBusy(true);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CFG.timeoutMs);

    try {
      const body = { message };
      if (sessionId) body.session_id = sessionId;

      const r = await fetch(CFG.apiUrl.replace(/\/$/, "") + "/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!r.ok) {
        const data = await _safeJson(r);
        const detail = (data && (data.message || data.detail)) || (await _safeText(r));
        _addMessage(
          "error",
          r.status === 503
            ? "El asistente aún no está configurado en el servidor."
            : "Error " + r.status + (detail ? ": " + detail : "") + ".",
        );
        return;
      }

      const data = await r.json();
      if (data.session_id) sessionId = data.session_id;
      _addMessage("bot", data.response || "(sin respuesta)");
    } catch (err) {
      if (err.name === "AbortError") {
        _addMessage("error", "La solicitud tardó demasiado. Inténtalo de nuevo.");
      } else {
        _addMessage(
          "error",
          "No se pudo contactar al asistente. Inténtalo de nuevo en unos segundos.",
        );
      }
    } finally {
      clearTimeout(timer);
      _setTyping(false);
      _setBusy(false);
    }
  }

  function _setBusy(busy) {
    const sendBtn = document.getElementById("adChatbotSend");
    const input = document.getElementById("adChatbotInput");
    if (sendBtn) sendBtn.disabled = busy;
    if (input) input.disabled = busy;
  }

  async function _safeText(r) {
    try {
      const t = await r.text();
      return t.length > 200 ? t.slice(0, 200) : t;
    } catch (_) {
      return "";
    }
  }

  async function _safeJson(r) {
    try {
      return await r.json();
    } catch (_) {
      return null;
    }
  }

  // ── Iniciar cuando el DOM esté listo ───────────────────────────────────
  function _init() {
    if (document.getElementById("adChatbot")) return;
    _render();
    _bind();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", _init);
  } else {
    _init();
  }
})();
