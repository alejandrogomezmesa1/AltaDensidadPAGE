
import os

path = r'c:\AltaDensidadPAGE\assets\js\carrito.js'

# La funcion renderCarrito completa y limpia
new_render_carrito = """
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
        .join("\\n");
      const text = `¡Hola! 👋 Acabo de armar mi pedido en la web:\\n----------------------------------\\n${msg}\\n----------------------------------\\n💰 *Total:* $${subtotal.toLocaleString("es-CO")} COP\\n\\nMe gustaría coordinar el pago y el envío. 🚀`;
      const url = `https://wa.me/3046477694?text=${encodeURIComponent(text)}`;
      pedirPorWhatsApp(url);
    });
  }

  // Vincular botón Mercado Pago
  const btnMP = document.getElementById("btnCarritoMP");
  if (btnMP) btnMP.addEventListener("click", pagarMercadoPago);
}
"""

with open(path, 'rb') as f:
    data = f.read().decode('latin-1', errors='ignore')

# 1. Quitar la funcion renderCarrito vieja (desde "function renderCarrito" hasta el final de la funcion)
# Buscamos por patron mas seguro
import re
data = re.sub(r'function renderCarrito\(\)\s*\{.*?\}\n\n// Vincular bot', 'REPLACE_ME\n\n// Vincular bot', data, flags=re.DOTALL)
# No, mejor busquemos el bloque completo de renderCarrito
data = re.sub(r'function renderCarrito\(\)\s*\{.*?\}', new_render_carrito.strip(), data, flags=re.DOTALL)

# 2. Corregir cualquier otra aparicion de Mercado Pago corrupta
data = re.sub(r'btnPagar\.textContent = "Pagar ahora.*?" Mercado Pago";', 'btnPagar.textContent = "Pagar ahora - Mercado Pago";', data)

# 3. Limpiar pedirPorWhatsApp
pedir_func = """
function pedirPorWhatsApp(url) {
    if (!url) return;
    window.open(url, "_blank");
}
"""
data = re.sub(r'function pedirPorWhatsApp\(url\)\s*\{.*?\}', pedir_func.strip(), data, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(data)

print("Ultimate Fix completado.")
