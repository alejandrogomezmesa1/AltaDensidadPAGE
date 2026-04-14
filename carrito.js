// ============================================================
// carrito.js — Lógica del carrito de compras
// Usa sessionStorage: se borra al cerrar la pestaña
// ============================================================

const CARRITO_KEY = 'altadensidad_carrito';

// ---- CRUD Storage ----

function obtenerCarrito() {
    try {
        return JSON.parse(sessionStorage.getItem(CARRITO_KEY)) || [];
    } catch { return []; }
}

function guardarCarrito(carrito) {
    sessionStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
}

function agregarAlCarrito(producto) {
    const carrito = obtenerCarrito();
    const idx = carrito.findIndex(i => i.id === producto.id);
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
    const idx = carrito.findIndex(i => i.id === id);
    if (idx < 0) return;
    carrito[idx].cantidad += delta;
    if (carrito[idx].cantidad <= 0) carrito.splice(idx, 1);
    guardarCarrito(carrito);
    actualizarBadge();
    renderCarrito();
}

function eliminarDelCarrito(id) {
    const carrito = obtenerCarrito().filter(i => i.id !== id);
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
    const badge = document.getElementById('carritoBadge');
    if (!badge) return;
    const total = obtenerCarrito().reduce((s, i) => s + i.cantidad, 0);
    badge.textContent = total;
    badge.style.display = total > 0 ? 'flex' : 'none';
}

// ---- Render panel ----

function renderCarrito() {
    const lista  = document.getElementById('carritoLista');
    const footer = document.getElementById('carritoFooter');
    if (!lista) return;

    const carrito = obtenerCarrito();

    if (carrito.length === 0) {
        lista.innerHTML = `
            <div class="carrito-vacio">
                <i class="fas fa-shopping-bag"></i>
                <p>Tu carrito está vacío</p>
            </div>`;
        footer.innerHTML = '';
        return;
    }

    lista.innerHTML = carrito.map(item => `
        <div class="carrito-item">
            <img src="${item.image || ''}" alt="${escCarrito(item.name)}"
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
    `).join('');

    const subtotal = carrito.reduce((s, i) => s + (Number(i.price) * i.cantidad), 0);
    const totalItems = carrito.reduce((s, i) => s + i.cantidad, 0);

    const msg = carrito.map(i =>
        `• ${i.cantidad}x ${i.name}${i.price ? ' ($' + Number(i.price).toLocaleString('es-CO') + ')' : ''}`
    ).join('%0A');
    const waUrl = `https://wa.me/3046477694?text=Hola, quiero pedir:%0A${msg}%0A%0ATotal: $${subtotal.toLocaleString('es-CO')} COP`;

    footer.innerHTML = `
        <div class="carrito-subtotal">
            <span>${totalItems} producto${totalItems !== 1 ? 's' : ''}</span>
            <span><strong>$${subtotal.toLocaleString('es-CO')} COP</strong></span>
        </div>
        <button class="carrito-btn-pedir" onclick="pedirPorWhatsApp('${waUrl}')">
            <i class="fab fa-whatsapp"></i> Pedir por WhatsApp
        </button>
        <button id="btnCarritoMP" class="carrito-btn-mp"><i class="fab fa-cc-visa"></i> Pagar con Mercado Pago</button>
        <button class="carrito-btn-vaciar" onclick="vaciarCarrito()">
            <i class="fas fa-trash"></i> Vaciar carrito
        </button>
    `;

    // Vincular botón Mercado Pago
    const btnMP = document.getElementById('btnCarritoMP');
    if (btnMP) btnMP.addEventListener('click', pagarMercadoPago);
}

// ---- WhatsApp con verificación de sesión ----

function pedirPorWhatsApp(url) {
    const token = localStorage.getItem('token');
    if (!token) {
        cerrarCarrito();
        window.location.href = 'login.html';
        return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
}

// ---- Pago con Mercado Pago ----
async function pagarMercadoPago() {
    const carrito = obtenerCarrito();
    if (!carrito || carrito.length === 0) {
        alert('El carrito está vacío');
        return;
    }
    // Mapear items para el backend
    const items = carrito.map(i => ({
        id: i.id,
        name: i.name,
        price: Number(i.price || i.precio || 0),
        quantity: Number(i.cantidad || i.quantity || 1),
        image: i.image || i.img || ''
    }));

    const base = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
        ? 'http://localhost:3000/api'
        : 'https://altadensidadpage-production.up.railway.app/api';

    try {
        const resp = await fetch(`${base}/mercadopago/create_preference`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items })
        });
        const data = await resp.json();
        if (!data.success) return alert('Error procesando pago: ' + (data.message || '')); 
        const pref = data.preference || {};
        const initPoint = pref.init_point || pref.sandbox_init_point || (pref && pref.init_point);
        if (initPoint) {
            // Redirigir a Mercado Pago
            window.location.href = initPoint;
        } else {
            console.error('Preferencia MP inesperada', pref);
            alert('No se pudo iniciar el checkout de Mercado Pago');
        }
    } catch (err) {
        console.error('Error al crear preferencia MP', err);
        alert('Error de red al intentar pagar con Mercado Pago');
    }
}

// ---- Abrir / cerrar panel ----

function abrirCarrito() {
    const panel = document.getElementById('carritoPanel');
    const overlay = document.getElementById('carritoOverlay');
    if (!panel) return;
    panel.classList.add('abierto');
    overlay.classList.add('abierto');
    document.body.style.overflow = 'hidden';
    renderCarrito();
}

function cerrarCarrito() {
    const panel = document.getElementById('carritoPanel');
    const overlay = document.getElementById('carritoOverlay');
    if (!panel) return;
    panel.classList.remove('abierto');
    overlay.classList.remove('abierto');
    document.body.style.overflow = '';
}

// ---- Toast ----

function mostrarToastCarrito(nombre) {
    let toast = document.getElementById('carritoToast');
    if (!toast) return;
    toast.textContent = `"${nombre}" agregado al carrito`;
    toast.classList.add('visible');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('visible'), 2500);
}

// ---- Utilidades ----

function escCarrito(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function formatCarrito(n) {
    return n != null ? `$${Number(n).toLocaleString('es-CO')}` : '';
}

// ---- Init ----

document.addEventListener('DOMContentLoaded', () => {
    actualizarBadge();

    const btnAbrir  = document.getElementById('btnCarrito');
    const overlay   = document.getElementById('carritoOverlay');
    const btnCerrar = document.getElementById('btnCerrarCarrito');

    if (btnAbrir)  btnAbrir.addEventListener('click', abrirCarrito);
    if (btnCerrar) btnCerrar.addEventListener('click', cerrarCarrito);
    if (overlay)   overlay.addEventListener('click', cerrarCarrito);
});
