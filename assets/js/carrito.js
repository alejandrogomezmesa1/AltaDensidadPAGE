
// altadensidad_carrito.js — Gestion del carrito de compras
const CARRITO_KEY = "altadensidad_carrito";

// Utilidades de codificacion para evitar problemas de charset
const EMOJI_HELLO = decodeURIComponent('%F0%9F%91%8B'); // 👋
const EMOJI_MONEY = decodeURIComponent('%F0%9F%92%B0'); // 💰
const EMOJI_ROCKET = decodeURIComponent('%F0%9F%9A%80'); // 🚀

// ---- CRUD Storage ----
function obtenerCarrito() {
  try {
    return JSON.parse(localStorage.getItem(CARRITO_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function guardarCarrito(carrito) {
  localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
}

function agregarAlCarrito(producto) {
  const carrito = obtenerCarrito();
  const idx = carrito.findIndex((i) => i.id === producto.id);
  if (idx >= 0) {
    carrito[idx].cantidad += 1;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }
  guardarCarrito(carrito);
  actualizarBadge(true); // Pasar true para animar
  renderCarrito();
  mostrarToastCarrito(producto.name);
}

function cambiarCantidad(id, delta) {
  const carrito = obtenerCarrito();
  const idx = carrito.findIndex((i) => i.id === id);
  if (idx < 0) return;
  carrito[idx].cantidad += delta;
  if (carrito[idx].cantidad <= 0) carrito.splice(idx, 1);
  guardarCarrito(carrito);
  actualizarBadge(delta > 0); // Animar si se suma
  renderCarrito();
}

function eliminarDelCarrito(id) {
  const carrito = obtenerCarrito().filter((i) => i.id !== id);
  guardarCarrito(carrito);
  actualizarBadge();
  renderCarrito();
}

function vaciarCarrito() {
  guardarCarrito([]);
  actualizarBadge();
  renderCarrito();
}

// ---- Badge contador con animacion ----
function actualizarBadge(animar = false) {
  const badge = document.getElementById("carritoBadge");
  if (!badge) return;
  const total = obtenerCarrito().reduce((s, i) => s + i.cantidad, 0);
  badge.textContent = total;
  badge.style.display = total > 0 ? "flex" : "none";

  if (animar && total > 0) {
      badge.classList.remove("pulse");
      void badge.offsetWidth; // Force reflow
      badge.classList.add("pulse");
  }
}

// ---- Render panel ----
function renderCarrito() {
  const lista = document.getElementById("carritoLista");
  const footer = document.getElementById("carritoFooter");
  if (!lista || !footer) return;

  const carrito = obtenerCarrito();

  if (carrito.length === 0) {
    lista.innerHTML = `
        <div class="carrito-vacio">
            <i class="fas fa-shopping-bag"></i>
            <p>Tu carrito esta vacio</p>
            <button onclick="cerrarCarrito()" class="carrito-btn-vaciar" style="border-color: #D4AF37; color: #D4AF37;">
                Seguir explorando
            </button>
        </div>`;
    footer.innerHTML = "";
    return;
  }

  lista.innerHTML = carrito
    .map(
      (item) => `
        <div class="carrito-item">
            <img src="${item.image || ""}" alt="${escCarrito(item.name)}" onerror="this.style.display='none'">
            <div class="carrito-item-info">
                <span class="carrito-item-nombre">${escCarrito(item.name)}</span>
                <span class="carrito-item-precio">${formatCarrito(item.price)}</span>
            </div>
            <div class="carrito-item-controles">
                <button onclick="cambiarCantidad(${item.id}, -1)"><i class="fas fa-minus"></i></button>
                <span>${item.cantidad}</span>
                <button onclick="cambiarCantidad(${item.id}, 1)"><i class="fas fa-plus"></i></button>
            </div>
            <button class="carrito-item-eliminar" onclick="eliminarDelCarrito(${item.id})">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `
    )
    .join("");

  const subtotal = carrito.reduce((s, i) => s + Number(i.price) * i.cantidad, 0);
  const totalItems = carrito.reduce((s, i) => s + i.cantidad, 0);

  // Mensaje para WhatsApp
  const msgItems = carrito
    .map(
      (i) =>
        `* ${i.cantidad}x ${i.name}${i.price ? " ($" + Number(i.price).toLocaleString("es-CO") + ")" : ""}`
    )
    .join("\n");

  const saludo = "¡Hola! " + EMOJI_HELLO + " Acabo de armar mi pedido en la web:";
  const footMsg = EMOJI_MONEY + " *Total:* $" + subtotal.toLocaleString("es-CO") + " COP";
  const despedida = "Me gustaria coordinar el pago y el envio. " + EMOJI_ROCKET;

  const fullText = `${saludo}\n----------------------------------\n${msgItems}\n----------------------------------\n${footMsg}\n\n${despedida}`;
  const waUrl = `https://wa.me/3046477694?text=${encodeURIComponent(fullText)}`;

  footer.innerHTML = `
        <div class="carrito-subtotal">
            <span>${totalItems} producto${totalItems !== 1 ? "s" : ""}</span>
            <span><strong>$${subtotal.toLocaleString("es-CO")} COP</strong></span>
        </div>
        <a href="${waUrl}" target="_blank" class="carrito-btn-pedir" style="text-decoration: none;">
            <i class="fab fa-whatsapp"></i> Pedir por WhatsApp
        </a>
        <button class="carrito-btn-mp" onclick="pagarMercadoPago()">
            <i class="fab fa-cc-visa"></i> Pagar ahora - Mercado Pago
        </button>
        <button class="carrito-btn-vaciar" onclick="vaciarCarrito()">
            <i class="fas fa-trash"></i> Vaciar carrito
        </button>
    `;
}

// ---- Logica de Envio y Mercado Pago ----

function obtenerCostoEnvio(zona) {
  if (zona === "test") return 2000;
  if (zona === "medellin") return 15000;
  if (zona === "metropolitana") return 20000;
  if (zona === "nacional") return 22000;
  return 0;
}

function actualizarResumenEnvio() {
    const zonaSelect = document.getElementById("envZona");
    const groupMetro = document.getElementById("groupMetropolitana");
    const groupNacional = document.getElementById("groupNacional");
    const resumen = document.getElementById("resumenEnvio");
    const costoTxt = document.getElementById("costoEnvioValor");
    const totalTxt = document.getElementById("totalConEnvio");
    
    if (!zonaSelect || !resumen) return;
    
    const zona = zonaSelect.value;
    const costo = obtenerCostoEnvio(zona);
    const subtotal = obtenerCarrito().reduce((s, i) => s + (Number(i.price) * i.cantidad), 0);
    
    // Control de visibilidad de campos de ciudad
    if (groupMetro) groupMetro.style.display = (zona === "metropolitana") ? "block" : "none";
    if (groupNacional) groupNacional.style.display = (zona === "nacional") ? "block" : "none";
    
    // Hacer campos requeridos dinamicamente
    const inputMetro = document.getElementById("envCiudadMetro");
    const inputNacional = document.getElementById("envCiudadNacional");
    if (inputMetro) inputMetro.required = (zona === "metropolitana");
    if (inputNacional) inputNacional.required = (zona === "nacional");

    resumen.style.display = "block";
    costoTxt.textContent = `$${costo.toLocaleString("es-CO")}`;
    totalTxt.textContent = `$${(subtotal + costo).toLocaleString("es-CO")}`;
}

async function pagarMercadoPago() {
  abrirModalEnvio();
}

async function procesarPagoMercadoPago() {
  const carrito = obtenerCarrito();
  if (carrito.length === 0) return;

  const zonaSelect = document.getElementById("envZona");
  const zonaId = zonaSelect.value;
  const costoEnvio = obtenerCostoEnvio(zonaId);

  const items = carrito.map((i) => ({
    id: i.id,
    name: i.name,
    unit_price: Number(i.price || 0),
    quantity: Number(i.cantidad || 1),
  }));

  // Agregar item de envio si corresponde
  if (costoEnvio > 0) {
      items.push({
          id: "envio-logistica",
          name: "Servicio de Envio (" + zonaSelect.options[zonaSelect.selectedIndex].text.split(" (")[0] + ")",
          unit_price: costoEnvio,
          quantity: 1
      });
  }

  const base = location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? "http://localhost:3000/api"
    : "https://altadensidadpage-production.up.railway.app/api";

  const btnPagar = document.getElementById("btnConfirmarEnvio");
  if (btnPagar) {
    btnPagar.disabled = true;
    btnPagar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Conectando...';
  }

  try {
    const resp = await fetch(`${base}/mercadopago/create_preference`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, shipping: _shippingData }),
    });
    const data = await resp.json();
    if (data.success && data.preference && data.preference.init_point) {
      window.location.href = data.preference.init_point;
    } else {
      alert("Error en el pago");
      if (btnPagar) {
        btnPagar.disabled = false;
        btnPagar.innerHTML = '<i class="fas fa-lock"></i> Continuar al Pago Seguro';
      }
    }
  } catch (err) {
    console.error(err);
    alert("Error de red");
    if (btnPagar) {
      btnPagar.disabled = false;
      btnPagar.innerHTML = '<i class="fas fa-lock"></i> Continuar al Pago Seguro';
    }
  }
}

// ---- Modal Envio ----
let _shippingData = null;
function abrirModalEnvio() {
  const modal = document.getElementById("envioModal");
  if (modal) {
      modal.style.display = "flex";
      // Reiniciar resumen y campos
      const resumen = document.getElementById("resumenEnvio");
      if (resumen) resumen.style.display = "none";
      const zonaSelect = document.getElementById("envZona");
      if (zonaSelect) zonaSelect.selectedIndex = 0;
      
      const gMetro = document.getElementById("groupMetropolitana");
      const gNac = document.getElementById("groupNacional");
      if (gMetro) gMetro.style.display = "none";
      if (gNac) gNac.style.display = "none";
  }
}
function cerrarModalEnvio() {
  const modal = document.getElementById("envioModal");
  if (modal) modal.style.display = "none";
}

// ---- Toast Elegante ----
function mostrarToastCarrito(nombre) {
  let toast = document.getElementById("carritoToast");
  if (!toast) return;
  toast.innerHTML = `<i class="fas fa-check-circle" style="color: #D4AF37; margin-right: 10px;"></i> Agregado: <strong>${nombre}</strong>`;
  toast.classList.add("visible");
  setTimeout(() => toast.classList.remove("visible"), 3000);
}

// ---- Utilidades ----
function escCarrito(str) {
  if (!str) return "";
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function formatCarrito(n) {
  return n != null ? `$${Number(n).toLocaleString("es-CO")}` : "";
}

// ---- Panel Toggle con Scroll Lock ----
function abrirCarrito() {
  const panel = document.getElementById("carritoPanel");
  const overlay = document.getElementById("carritoOverlay");
  if (panel) panel.classList.add("abierto");
  if (overlay) overlay.classList.add("abierto");
  document.body.style.overflow = "hidden";
  renderCarrito();
}
function cerrarCarrito() {
  const panel = document.getElementById("carritoPanel");
  const overlay = document.getElementById("carritoOverlay");
  if (panel) panel.classList.remove("abierto");
  if (overlay) overlay.classList.remove("abierto");
  document.body.style.overflow = "";
}

// ---- Init ----
document.addEventListener("DOMContentLoaded", () => {
  actualizarBadge();
  const btnAbrir = document.getElementById("btnCarrito");
  const btnCerrar = document.getElementById("btnCerrarCarrito");
  const overlay = document.getElementById("carritoOverlay");
  const btnCerrarEnvio = document.getElementById("cerrarEnvioModal");

  if (btnAbrir) btnAbrir.addEventListener("click", abrirCarrito);
  if (btnCerrar) btnCerrar.addEventListener("click", cerrarCarrito);
  if (overlay) overlay.addEventListener("click", cerrarCarrito);
  if (btnCerrarEnvio) btnCerrarEnvio.addEventListener("click", cerrarModalEnvio);

  const formEnvio = document.getElementById("envioForm");
  if (formEnvio) {
    formEnvio.addEventListener("submit", (e) => {
      e.preventDefault();
      const zonaSelect = document.getElementById("envZona");
      const zonaId = zonaSelect.value;
      
      let ciudadFinal = "";
      if (zonaId === "medellin") {
          ciudadFinal = "Medellín";
      } else if (zonaId === "metropolitana") {
          ciudadFinal = document.getElementById("envCiudadMetro").value;
      } else if (zonaId === "nacional") {
          ciudadFinal = document.getElementById("envCiudadNacional").value;
      } else {
          ciudadFinal = "Prueba";
      }

      _shippingData = {
        nombre: document.getElementById("envNombre").value,
        documento: document.getElementById("envDocumento").value,
        celular: document.getElementById("envCelular").value,
        zona: zonaSelect.options[zonaSelect.selectedIndex].text.split(" ($")[0],
        ciudad: ciudadFinal,
        direccion: document.getElementById("envDireccion").value,
        barrio: document.getElementById("envBarrio").value
      };
      procesarPagoMercadoPago();
    });
  }
});
