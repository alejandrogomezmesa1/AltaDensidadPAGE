
// altadensidad_carrito.js — Gestión del carrito de compras
const CARRITO_KEY = "altadensidad_carrito";

// ---- CRUD Storage ----
function obtenerCarrito() {
  try {
    return JSON.parse(localStorage.getItem(CARRITO_KEY)) || [];
  } catch {
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
  actualizarBadge();
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
  actualizarBadge();
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

// ---- Badge contador ----
function actualizarBadge() {
  const badge = document.getElementById("carritoBadge");
  if (!badge) return;
  const total = obtenerCarrito().reduce((s, i) => s + i.cantidad, 0);
  badge.textContent = total;
  badge.style.display = total > 0 ? "flex" : "none";
}

// ---- Render panel ----
function renderCarrito() {
  const lista = document.getElementById("carritoLista");
  const footer = document.getElementById("carritoFooter");
  if (!lista) return;

  const carrito = obtenerCarrito();

  if (carrito.length === 0) {
    lista.innerHTML = `
            <div class="carrito-vacio">
                <i class="fas fa-shopping-bag"></i>
                <p>Tu carrito está vacío</p>
            </div>`;
    footer.innerHTML = "";
    return;
  }

  lista.innerHTML = carrito
    .map(
      (item) => `
        <div class="carrito-item">
            <img src="${item.image || ""}" alt="${escCarrito(item.name)}"
                 onerror="this.style.display='none'">
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
    `,
    )
    .join("");

  const subtotal = carrito.reduce(
    (s, i) => s + Number(i.price) * i.cantidad,
    0,
  );
  const totalItems = carrito.reduce((s, i) => s + i.cantidad, 0);

  footer.innerHTML = `
        <div class="carrito-subtotal">
            <span>${totalItems} producto${totalItems !== 1 ? "s" : ""}</span>
            <span><strong>$${subtotal.toLocaleString("es-CO")} COP</strong></span>
        </div>
        <button id="btnCarritoWA" class="carrito-btn-pedir">
            <i class="fab fa-whatsapp"></i> Pedir por WhatsApp
        </button>
        <button id="btnCarritoMP" class="carrito-btn-mp"><i class="fab fa-cc-visa"></i> Pagar ahora - Mercado Pago</button>
        <button class="carrito-btn-vaciar" onclick="vaciarCarrito()">
            <i class="fas fa-trash"></i> Vaciar carrito
        </button>
    `;

  // Vincular botón WhatsApp
  const btnWA = document.getElementById("btnCarritoWA");
  if (btnWA) {
    btnWA.addEventListener("click", () => {
      const msg = carrito
        .map(
          (i) =>
            `• ${i.cantidad}x ${i.name}${i.price ? " ($" + Number(i.price).toLocaleString("es-CO") + ")" : ""}`,
        )
        .join("\n");
      const text = `¡Hola! 👋 Acabo de armar mi pedido en la web:\n----------------------------------\n${msg}\n----------------------------------\n💰 *Total:* $${subtotal.toLocaleString("es-CO")} COP\n\nMe gustaría coordinar el pago y el envío. 🚀`;
      const url = `https://wa.me/3046477694?text=${encodeURIComponent(text)}`;
      pedirPorWhatsApp(url);
    });
  }

  // Vincular botón Mercado Pago
  const btnMP = document.getElementById("btnCarritoMP");
  if (btnMP) btnMP.addEventListener("click", pagarMercadoPago);
}

// ---- WhatsApp ----
function pedirPorWhatsApp(url) {
    if (!url) return;
    window.open(url, "_blank");
}

// ---- Mercado Pago ----
async function pagarMercadoPago() {
  abrirModalEnvio();
}

async function procesarPagoMercadoPago() {
  const carrito = obtenerCarrito();
  if (carrito.length === 0) return;

  const items = carrito.map((i) => ({
    id: i.id,
    name: i.name,
    unit_price: Number(i.price || 0),
    quantity: Number(i.cantidad || 1),
  }));

  const base = location.hostname === "localhost" || location.hostname === "127.0.0.1"
        ? "http://localhost:3000/api"
        : "https://altadensidadpage-production.up.railway.app/api";

  const btnPagar = document.getElementById("btnPagar");
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
      alert("No se pudo iniciar el checkout: " + (data.message || ""));
      if (btnPagar) {
        btnPagar.disabled = false;
        btnPagar.textContent = "Pagar ahora - Mercado Pago";
      }
    }
  } catch (err) {
    console.error(err);
    alert("Error de red");
    if (btnPagar) {
      btnPagar.disabled = false;
      btnPagar.textContent = "Pagar ahora - Mercado Pago";
    }
  }
}

// ---- Modal Envío ----
let _shippingData = null;
function abrirModalEnvio() {
  const modal = document.getElementById("envioModal");
  if (modal) modal.style.display = "flex";
}

function cerrarModalEnvio() {
  const modal = document.getElementById("envioModal");
  if (modal) modal.style.display = "none";
}

// ---- Toast ----
function mostrarToastCarrito(nombre) {
  let toast = document.getElementById("carritoToast");
  if (!toast) return;
  toast.textContent = `"${nombre}" agregado al carrito`;
  toast.classList.add("visible");
  setTimeout(() => toast.classList.remove("visible"), 2500);
}

// ---- Utilidades ----
function escCarrito(str) {
  if (!str) return "";
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function formatCarrito(n) {
  return n != null ? `$${Number(n).toLocaleString("es-CO")}` : "";
}

// ---- Panel Toggle ----
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
      _shippingData = {
        nombre: document.getElementById("envNombre").value,
        documento: document.getElementById("envDocumento").value,
        celular: document.getElementById("envCelular").value,
        ciudad: document.getElementById("envCiudad").value,
        direccion: document.getElementById("envDireccion").value,
        barrio: document.getElementById("envBarrio").value
      };
      cerrarModalEnvio();
      procesarPagoMercadoPago();
    });
  }
});
