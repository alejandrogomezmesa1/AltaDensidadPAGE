const _BASE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1') ? 'http://localhost:3000/api' : 'https://altadensidadpage-production.up.railway.app/api';
const API_URL = `${_BASE}/productos`;
const API_ENVASES_URL = `${_BASE}/envases`;
const API_KITS_URL = `${_BASE}/kits`;
const API_UPLOAD_URL = `${_BASE}/upload`;
const API_TOP10_URL = `${_BASE}/top10`;
// Estado Top 10
let top10 = [];
let productosDisponiblesTop10 = [];
let searchTop10 = '';
let searchKits = '';
let searchProductos = '';
let searchEnvases = '';
let searchOrdenes = '';
// ============================
// TOP 10 — CARGAR Y RENDER
// ============================
async function cargarTop10() {
    const tbody = document.getElementById('tbodyTop10');
    tbody.innerHTML = `<tr><td colspan="6" class="loading-row"><i class="fas fa-spinner fa-spin"></i> Cargando Top 10...</td></tr>`;
    try {
        const res = await fetch(API_TOP10_URL);
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        top10 = data.data;
        renderTablaTop10();
    } catch (err) {
        mostrarAlerta('Error al cargar Top 10: ' + err.message, 'error');
        tbody.innerHTML = `<tr><td colspan="6" class="empty-row"><i class="fas fa-exclamation-circle"></i> No se pudo conectar con el servidor.</td></tr>`;
    }
}

function renderTablaTop10() {
    const tbody = document.getElementById('tbodyTop10');
    
    // Filtrar localmente
    const filtrados = top10.filter(p => 
        p.nombre.toLowerCase().includes(searchTop10) || 
        p.categoria.toLowerCase().includes(searchTop10) ||
        p.genero.toLowerCase().includes(searchTop10)
    );

    if (!filtrados.length) {
        tbody.innerHTML = `<tr><td colspan="6" class="empty-row">${searchTop10 ? 'No se encontraron resultados.' : 'No hay productos en el Top 10.'}</td></tr>`;
        return;
    }

    tbody.innerHTML = filtrados.map((p, idx) => `
        <tr>
            <td data-label="#">${idx + 1}</td>
            <td data-label="Imagen">${imagenCell(p.imagen)}</td>
            <td data-label="Nombre"><strong>${escHtml(p.nombre)}</strong></td>
            <td data-label="Categoría">${escHtml(p.categoria)}</td>
            <td data-label="Género">${escHtml(p.genero)}</td>
            <td data-label="Acciones">
                <div class="acciones">
                    <button class="btn-icon" title="Subir" onclick="moverTop10(${idx},-1)" ${idx === 0 ? 'disabled' : ''}><i class="fas fa-arrow-up"></i></button>
                    <button class="btn-icon" title="Bajar" onclick="moverTop10(${idx},1)" ${idx === filtrados.length-1 ? 'disabled' : ''}><i class="fas fa-arrow-down"></i></button>
                    <button class="btn-icon eliminar" title="Quitar" onclick="quitarDeTop10(${idx})"><i class="fas fa-times"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

function moverTop10(idx, dir) {
    if ((idx === 0 && dir === -1) || (idx === top10.length-1 && dir === 1)) return;
    const temp = top10[idx];
    top10[idx] = top10[idx+dir];
    top10[idx+dir] = temp;
    renderTablaTop10();
}

function quitarDeTop10(idx) {
    top10.splice(idx, 1);
    renderTablaTop10();
    renderSelectProductosTop10();
}

function renderSelectProductosTop10(filtro = '') {
    const select = document.getElementById('selectProductoTop10');
    select.innerHTML = '<option value="">-- Seleccionar producto --</option>';
    productosDisponiblesTop10.forEach(p => {
        if (!top10.some(t => t.producto_id === p.id)) {
            if (!filtro || p.name.toLowerCase().includes(filtro.toLowerCase())) {
                select.innerHTML += `<option value="${p.id}">${escHtml(p.name)}</option>`;
            }
        }
    });
}

async function cargarProductosDisponiblesTop10() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        productosDisponiblesTop10 = data.data;
        renderSelectProductosTop10();
    } catch (err) {
        mostrarAlerta('Error al cargar productos para Top 10: ' + err.message, 'error');
    }
}

function agregarProductoATop10() {
    const select = document.getElementById('selectProductoTop10');
    const id = parseInt(select.value);
    if (!id) return;
    const prod = productosDisponiblesTop10.find(p => p.id === id);
    if (!prod) return;
    if (top10.length >= 10) { mostrarAlerta('Solo puedes tener 10 productos en el Top 10.', 'error'); return; }
    top10.push({
        producto_id: prod.id,
        nombre: prod.name,
        imagen: prod.image,
        categoria: prod.category,
        genero: prod.gender,
        descripcion: prod.description,
        precio: prod.price,
        rating: prod.rating
    });
    renderTablaTop10();
    renderSelectProductosTop10();
    // Resetear el buscador local de productos para agregar
    const buscadorLocal = document.getElementById('buscadorProductoTop10');
    if (buscadorLocal) buscadorLocal.value = '';
}

async function guardarTop10() {
    if (top10.length !== 10) { mostrarAlerta('Debes seleccionar exactamente 10 productos.', 'error'); return; }
    const ids = top10.map(p => p.producto_id);
    const btn = document.getElementById('btnGuardarTop10');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
    try {
        const res = await fetch(API_TOP10_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productos: ids })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Top 10 actualizado', showConfirmButton: false, timer: 3000, background: '#1a1a1a', color: '#D4AF37' });
    } catch (err) {
        mostrarAlerta('Error al guardar Top 10: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save"></i> Guardar Top 10';
    }
}
function registrarEventosTop10() {
    document.getElementById('btnAgregarProductoTop10').addEventListener('click', agregarProductoATop10);
    document.getElementById('btnGuardarTop10').addEventListener('click', guardarTop10);
}
// Filtrado de productos en el select de Top 10
const buscadorProductoTop10 = document.getElementById('buscadorProductoTop10');
if (buscadorProductoTop10) {
    buscadorProductoTop10.addEventListener('input', function() {
        renderSelectProductosTop10(this.value);
    });
}

// Estado Kits
let kits = [];
let paginaKits = 1;
const ITEMS_KIT = 10;
let beneficiosKitTmp = [];

// ============================
// UPLOAD DE IMAGEN
// ============================
async function subirImagen(file) {
    const fd = new FormData();
    fd.append('imagen', file);
    const res  = await fetch(API_UPLOAD_URL, { method: 'POST', body: fd });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data.path;
}

function vincularFileInput(inputFileId, previewId, fileNameId, hiddenId) {
    document.getElementById(inputFileId).addEventListener('change', function () {
        const file = this.files[0];
        if (!file) return;
        document.getElementById(fileNameId).textContent = file.name;
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById(previewId);
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
        // Limpiar el hidden mientras no se suba
        document.getElementById(hiddenId).value = '';
    });
}

// ---- Estado ----
let productos = [];
let idEliminarPendiente = null;
let paginaProductos = 1;
const ITEMS_PROD = 10;

let envases = [];
let idEliminarEnvasePendiente = null;
let paginaEnvases = 1;
const ITEMS_ENV = 10;

// ---- Referencias DOM ----
const tbodyProductos    = document.getElementById('tbodyProductos');
const alerta            = document.getElementById('alerta');
const modalProducto     = document.getElementById('modalProducto');
const modalEliminar     = document.getElementById('modalEliminar');
const formProducto      = document.getElementById('formProducto');
const modalTitulo       = document.getElementById('modalTitulo');
const nombreEliminar    = document.getElementById('nombreEliminar');

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');

    if (!token || !usuario || (usuario.rol !== 'admin' && usuario.rol !== 'empleado')) {
        window.location.href = 'login.html';
        return;
    }

    if (usuario.rol === 'empleado') {
        try {
            const res = await fetch(`${API_INDUCCION_URL}/mi-progreso`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && data.data) {
                const est = data.data.usuario.estado_induccion;
                if (est !== 'autorizado') {
                    document.querySelectorAll('.admin-tab').forEach(t => t.classList.add('hidden'));
                    document.querySelectorAll('.admin-main > div').forEach(d => d.classList.add('hidden'));
                    const secInd = document.getElementById('seccionInduccion');
                    if (secInd) secInd.classList.remove('hidden');
                    await iniciarInduccionEmpleado();
                    return;
                }
            }
        } catch (e) {
            console.error('Error al verificar inducción de empleado:', e);
        }
    }

    if (usuario.rol === 'admin') {
        const tabEmp = document.getElementById('tabEmpleados');
        if (tabEmp) tabEmp.classList.remove('hidden');
        registrarEventosEmpleados();
    }

    cargarProductos();
    cargarEnvases();
    cargarKits();
    cargarTop10();
    cargarProductosDisponiblesTop10();
    registrarEventos();
    registrarEventosEnvases();
    registrarEventosKits();
    registrarEventosTop10();
    cargarOrdenes();
    registrarEventosOrdenes();

    const savedTab = localStorage.getItem('admin_active_tab');
    if (savedTab && savedTab !== 'induccion') {
        cambiarSeccion(savedTab);
    }
});
// ============================
// KITS — CARGAR LISTA
// ============================
async function cargarKits() {
    const tbody = document.getElementById('tbodyKits');
    tbody.innerHTML = `<tr><td colspan="7" class="loading-row"><i class="fas fa-spinner fa-spin"></i> Cargando kits...</td></tr>`;
    try {
        const res = await fetch(API_KITS_URL);
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        kits = data.data;
        renderTablaKits();
    } catch (err) {
        mostrarAlerta('Error al cargar kits: ' + err.message, 'error');
        tbody.innerHTML = `<tr><td colspan="7" class="empty-row"><i class="fas fa-exclamation-circle"></i> No se pudo conectar con el servidor.</td></tr>`;
    }
}

function renderTablaKits() {
    const tbody = document.getElementById('tbodyKits');
    
    // Filtrar localmente
    const filtrados = kits.filter(k => 
        k.nombre.toLowerCase().includes(searchKits) || 
        k.descripcion.toLowerCase().includes(searchKits)
    );

    const total     = filtrados.length;
    const totalPags = Math.ceil(total / ITEMS_KIT);
    if (paginaKits > totalPags && totalPags > 0) paginaKits = totalPags;
    const inicio = (paginaKits - 1) * ITEMS_KIT;
    const pagina = filtrados.slice(inicio, inicio + ITEMS_KIT);

    if (total === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="empty-row">${searchKits ? 'No se encontraron resultados.' : 'No hay kits registrados.'}</td></tr>`;
        document.getElementById('paginacionKits').innerHTML = '';
        return;
    }
    tbody.innerHTML = pagina.map(k => `
        <tr>
            <td data-label="#">${k.id}</td>
            <td data-label="Imagen">${imagenCell(k.imagen)}</td>
            <td data-label="Nombre"><strong>${escHtml(k.nombre)}</strong></td>
            <td data-label="Descripción">${escHtml(k.descripcion)}</td>
            <td data-label="Precio">${formatPrecio(k.precio)}</td>
            <td data-label="Visible">${k.activo ? '<i class="fas fa-eye" style="color: #27ae60"></i>' : '<i class="fas fa-eye-slash" style="color: #e74c3c"></i>'}</td>
            <td data-label="Acciones">
                <div class="acciones">
                    <button class="btn-icon editar" title="Editar" onclick="abrirEditarKit(${k.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon eliminar" title="Eliminar" onclick="abrirEliminarKit(${k.id}, '${escAttr(k.nombre)}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    renderPag('paginacionKits', paginaKits, totalPags, (p) => {
        paginaKits = p;
        renderTablaKits();
    });
}

function abrirNuevoKit() {
    document.getElementById('formKit').reset();
    document.getElementById('modalTituloKit').textContent = 'Nuevo Kit';
    document.getElementById('kitId').value = '';
    document.getElementById('kitActivo').checked = true;
    beneficiosKitTmp = [];
    renderBeneficiosKit();
    limpiarImagenKit();
    abrirModal(document.getElementById('modalKit'));
}

function abrirEditarKit(id) {
    const k = kits.find(x => x.id === id);
    if (!k) return;
    document.getElementById('formKit').reset();
    document.getElementById('modalTituloKit').textContent = 'Editar Kit';
    document.getElementById('kitId').value = k.id;
    document.getElementById('kitNombre').value = k.nombre;
    document.getElementById('kitDescripcion').value = k.descripcion || '';
    document.getElementById('kitPrecio').value = k.precio;
    document.getElementById('kitImagen').value = k.imagen || '';
    document.getElementById('kitActivo').checked = !!k.activo;
    beneficiosKitTmp = Array.isArray(k.beneficios) ? [...k.beneficios] : [];
    renderBeneficiosKit();
    // Imagen preview
    const preview = document.getElementById('previewKitImagen');
    if (k.imagen) {
        preview.src = k.imagen;
        preview.style.display = 'block';
        document.getElementById('kitImgFileName').textContent = k.imagen.split('/').pop();
    } else {
        limpiarImagenKit();
    }
    abrirModal(document.getElementById('modalKit'));
}

function renderBeneficiosKit() {
    const list = document.getElementById('kitBeneficiosList');
    list.innerHTML = '';
    beneficiosKitTmp.forEach((b, idx) => {
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.style.gap = '8px';
        div.innerHTML = `<span>${escHtml(b)}</span><button type="button" class="btn-icon eliminar" title="Quitar" onclick="quitarBeneficioKit(${idx})"><i class="fas fa-times"></i></button>`;
        list.appendChild(div);
    });
}

function quitarBeneficioKit(idx) {
    beneficiosKitTmp.splice(idx, 1);
    renderBeneficiosKit();
}

function limpiarImagenKit() {
    const preview = document.getElementById('previewKitImagen');
    preview.src = '';
    preview.style.display = 'none';
    document.getElementById('kitImgFileName').textContent = 'Sin imagen seleccionada';
    document.getElementById('kitImagenFile').value = '';
    document.getElementById('kitImagen').value = '';
}

async function abrirEliminarKit(id, nombre) {
    document.getElementById('nombreEliminarKit').textContent = nombre;
    abrirModal(document.getElementById('modalEliminarKit'));
    document.getElementById('btnConfirmarEliminarKit').onclick = async () => {
        try {
            const res = await fetch(`${API_KITS_URL}/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
            cerrarModal(document.getElementById('modalEliminarKit'));
            await cargarKits();
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Kit eliminado', showConfirmButton: false, timer: 3000, background: '#1a1a1a', color: '#D4AF37' });
        } catch (err) {
            mostrarAlerta('Error al eliminar: ' + err.message, 'error');
        }
    };
}

function registrarEventosKits() {
    document.getElementById('btnNuevoKit').addEventListener('click', abrirNuevoKit);
    document.getElementById('btnCerrarModalKit').addEventListener('click', () => cerrarModal(document.getElementById('modalKit')));
    document.getElementById('btnCancelarKit').addEventListener('click', () => cerrarModal(document.getElementById('modalKit')));
    document.getElementById('btnCerrarEliminarKit').addEventListener('click', () => cerrarModal(document.getElementById('modalEliminarKit')));
    document.getElementById('btnCancelarEliminarKit').addEventListener('click', () => cerrarModal(document.getElementById('modalEliminarKit')));

    // Imagen preview
    vincularFileInput('kitImagenFile', 'previewKitImagen', 'kitImgFileName', 'kitImagen');

    // Agregar beneficio
    document.getElementById('btnAgregarBeneficio').addEventListener('click', () => {
        const val = document.getElementById('nuevoBeneficio').value.trim();
        if (val) {
            beneficiosKitTmp.push(val);
            renderBeneficiosKit();
            document.getElementById('nuevoBeneficio').value = '';
        }
    });

    // Guardar kit
    document.getElementById('formKit').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('kitId').value;
        const nombre = document.getElementById('kitNombre').value.trim();
        const descripcion = document.getElementById('kitDescripcion').value.trim();
        const precio = parseFloat(document.getElementById('kitPrecio').value);
        const imagen = document.getElementById('kitImagen').value.trim();
        if (!nombre) { document.getElementById('kitNombre').classList.add('invalid'); mostrarAlerta('El nombre es obligatorio.', 'error'); return; }
        if (!precio && precio !== 0) { document.getElementById('kitPrecio').classList.add('invalid'); mostrarAlerta('El precio es obligatorio.', 'error'); return; }
        const btn = document.getElementById('btnGuardarKit');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        try {
            // Subir imagen si hay archivo seleccionado
            const fileInputKit = document.getElementById('kitImagenFile');
            if (fileInputKit.files[0]) {
                const rutaSubida = await subirImagen(fileInputKit.files[0]);
                document.getElementById('kitImagen').value = rutaSubida;
            }
            const imagenFinal = document.getElementById('kitImagen').value.trim();
            const activo = document.getElementById('kitActivo').checked ? 1 : 0;
            const payload = { nombre, descripcion, precio, imagen: imagenFinal, beneficios: beneficiosKitTmp, activo };
            const method = id ? 'PUT' : 'POST';
            const url = id ? `${API_KITS_URL}/${id}` : API_KITS_URL;
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
            cerrarModal(document.getElementById('modalKit'));
            await cargarKits();
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: id ? 'Kit actualizado' : 'Kit creado', showConfirmButton: false, timer: 3000, background: '#1a1a1a', color: '#D4AF37' });
        } catch (err) {
            mostrarAlerta('Error al guardar: ' + err.message, 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-save"></i> Guardar';
        }
    });

    [document.getElementById('modalKit'), document.getElementById('modalEliminarKit')].forEach(m => {
        m.addEventListener('click', (e) => { if (e.target === m) cerrarModal(m); });
    });

    document.getElementById('formKit').querySelectorAll('input, textarea').forEach(el => {
        el.addEventListener('input', () => el.classList.remove('invalid'));
    });
}

// ============================
// CARGAR LISTA
// ============================
async function cargarProductos() {
    mostrarCargando();
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        productos = data.data;
        renderTabla();
    } catch (err) {
        mostrarAlerta('Error al cargar productos: ' + err.message, 'error');
        tbodyProductos.innerHTML = `<tr><td colspan="10" class="empty-row"><i class="fas fa-exclamation-circle"></i> No se pudo conectar con el servidor.</td></tr>`;
    }
}

// ============================
// RENDER TABLA
// ============================
function renderTabla() {
    // Filtrar localmente
    const filtrados = productos.filter(p => 
        p.name.toLowerCase().includes(searchProductos) || 
        p.category.toLowerCase().includes(searchProductos) ||
        p.gender.toLowerCase().includes(searchProductos)
    );

    const total     = filtrados.length;
    const totalPags = Math.ceil(total / ITEMS_PROD);
    if (paginaProductos > totalPags && totalPags > 0) paginaProductos = totalPags;
    const inicio = (paginaProductos - 1) * ITEMS_PROD;
    const pagina = filtrados.slice(inicio, inicio + ITEMS_PROD);

    if (total === 0) {
        tbodyProductos.innerHTML = `<tr><td colspan="10" class="empty-row">${searchProductos ? 'No se encontraron resultados.' : 'No hay productos en el catálogo.'}</td></tr>`;
        document.getElementById('paginacionProductos').innerHTML = '';
        return;
    }

    tbodyProductos.innerHTML = pagina.map(p => `
        <tr>
            <td data-label="#">${p.id}</td>
            <td data-label="Imagen">${imagenCell(p.image)}</td>
            <td data-label="Nombre"><strong>${escHtml(p.name)}</strong></td>
            <td data-label="Categoría">${escHtml(p.category)}</td>
            <td data-label="Género">${escHtml(p.gender)}</td>
            <td data-label="Precio">${formatPrecio(p.price)}</td>
            <td data-label="Rating">${p.rating || 0} <i class="fas fa-star" style="color: #f1c40f; font-size: 0.8rem;"></i></td>
            <td data-label="Tallas">${(p.sizes || []).join(', ') || '-'}</td>
            <td data-label="Visible">${p.activo ? '<i class="fas fa-eye" style="color: #27ae60"></i>' : '<i class="fas fa-eye-slash" style="color: #e74c3c"></i>'}</td>
            <td data-label="Acciones">
                <div class="acciones">
                    <button class="btn-icon editar" title="Editar" onclick="abrirEditar(${p.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon eliminar" title="Eliminar" onclick="abrirEliminar(${p.id}, '${escAttr(p.name)}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    renderPag('paginacionProductos', paginaProductos, totalPags, (p) => {
        paginaProductos = p;
        renderTabla();
    });
}

// ============================
// ABRIR MODAL CREAR
// ============================
function abrirNuevo() {
    limpiarForm();
    modalTitulo.textContent = 'Nuevo Producto';
    document.getElementById('productoId').value = '';
    document.getElementById('inputActivo').checked = true;
    abrirModal(modalProducto);
}

// ============================
// ABRIR MODAL EDITAR
// ============================
function abrirEditar(id) {
    const p = productos.find(x => x.id === id);
    if (!p) return;

    limpiarForm();
    modalTitulo.textContent = 'Editar Producto';

    document.getElementById('productoId').value       = p.id;
    document.getElementById('inputNombre').value      = p.name;
    document.getElementById('inputDescripcion').value = p.description || '';
    document.getElementById('inputCategoria').value   = p.category;
    document.getElementById('inputGenero').value      = p.gender;
    document.getElementById('inputPrecio').value      = p.price;
    document.getElementById('inputRating').value      = p.rating;
    document.getElementById('inputImagen').value      = p.image || '';
    document.getElementById('inputActivo').checked    = !!p.activo;

    // Mostrar imagen actual en el preview
    if (p.image) {
        const preview = document.getElementById('previewImagen');
        preview.src = p.image;
        preview.style.display = 'block';
        document.getElementById('imgFileName').textContent = p.image.split('/').pop();
    }

    // Marcar tallas
    document.querySelectorAll('input[name="talla"]').forEach(cb => {
        cb.checked = (p.sizes || []).includes(cb.value);
    });

    // Marcar tipos de envase
    document.querySelectorAll('input[name="envase"]').forEach(cb => {
        cb.checked = (p.bottleTypes || []).includes(cb.value);
    });

    abrirModal(modalProducto);
}

// ============================
// GUARDAR (Crear o Actualizar)
// ============================
formProducto.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id          = document.getElementById('productoId').value;
    const nombre      = document.getElementById('inputNombre').value.trim();
    const descripcion = document.getElementById('inputDescripcion').value.trim();
    const categoria   = document.getElementById('inputCategoria').value;
    const genero      = document.getElementById('inputGenero').value;
    const precio      = parseFloat(document.getElementById('inputPrecio').value);
    const rating      = parseInt(document.getElementById('inputRating').value);
    const imagen      = document.getElementById('inputImagen').value.trim();

    // Validación básica
    let valido = true;
    [['inputNombre', nombre], ['inputCategoria', categoria], ['inputGenero', genero], ['inputPrecio', precio]].forEach(([campo, val]) => {
        const el = document.getElementById(campo);
        if (!val || val === '' || isNaN(Number(val)) && typeof val === 'number') {
            el.classList.add('invalid');
            valido = false;
        } else {
            el.classList.remove('invalid');
        }
    });
    if (!nombre) { document.getElementById('inputNombre').classList.add('invalid'); valido = false; }
    if (!categoria) { document.getElementById('inputCategoria').classList.add('invalid'); valido = false; }
    if (!genero) { document.getElementById('inputGenero').classList.add('invalid'); valido = false; }
    if (!precio && precio !== 0) { document.getElementById('inputPrecio').classList.add('invalid'); valido = false; }

    if (!valido) { mostrarAlerta('Completa los campos obligatorios.', 'error'); return; }

    const sizes      = Array.from(document.querySelectorAll('input[name="talla"]:checked')).map(cb => cb.value);
    const bottleTypes = Array.from(document.querySelectorAll('input[name="envase"]:checked')).map(cb => cb.value);

    const payload = { name: nombre, description: descripcion, category: categoria, gender: genero, price: precio, rating, image: imagen, sizes, bottleTypes };

    const btnGuardar = document.getElementById('btnGuardar');
    btnGuardar.disabled = true;
    btnGuardar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

    try {
        // Subir imagen si hay archivo seleccionado
        const fileInput = document.getElementById('inputImagenFile');
        if (fileInput.files[0]) {
            const rutaSubida = await subirImagen(fileInput.files[0]);
            document.getElementById('inputImagen').value = rutaSubida;
        }
        const imagenFinal = document.getElementById('inputImagen').value.trim();
        const activo = document.getElementById('inputActivo').checked ? 1 : 0;

        const method  = id ? 'PUT' : 'POST';
        const url     = id ? `${API_URL}/${id}` : API_URL;
        const res     = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...payload, image: imagenFinal, activo })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);

        cerrarModal(modalProducto);
        await cargarProductos();
        Swal.fire({
            toast: true, position: 'top-end', icon: 'success',
            title: id ? 'Producto actualizado' : 'Producto creado',
            showConfirmButton: false, timer: 3000,
            background: '#1a1a1a', color: '#D4AF37'
        });
    } catch (err) {
        mostrarAlerta('Error al guardar: ' + err.message, 'error');
    } finally {
        btnGuardar.disabled = false;
        btnGuardar.innerHTML = '<i class="fas fa-save"></i> Guardar';
    }
});

// ============================
// ELIMINAR
// ============================
async function abrirEliminar(id, nombre) {
    const result = await Swal.fire({
        title: '¿Eliminar producto?',
        html: `¿Seguro que deseas eliminar <strong>${escHtml(nombre)}</strong>?<br>Esta acción no se puede deshacer.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '<i class="fas fa-trash"></i> Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#c0392b',
        cancelButtonColor: '#444',
        background: '#1a1a1a',
        color: '#fff'
    });
    if (!result.isConfirmed) return;
    try {
        const res  = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        await cargarProductos();
        Swal.fire({
            toast: true, position: 'top-end', icon: 'success',
            title: 'Producto eliminado', showConfirmButton: false, timer: 3000,
            background: '#1a1a1a', color: '#D4AF37'
        });
    } catch (err) {
        mostrarAlerta('Error al eliminar: ' + err.message, 'error');
    }
}

// ============================
// EVENTOS
// ============================
function registrarEventos() {
    document.getElementById('btnNuevoProducto').addEventListener('click', abrirNuevo);
    document.getElementById('btnCerrarModal').addEventListener('click', () => cerrarModal(modalProducto));
    document.getElementById('btnCancelarForm').addEventListener('click', () => cerrarModal(modalProducto));
    document.getElementById('btnCerrarEliminar').addEventListener('click', () => cerrarModal(modalEliminar));
    document.getElementById('btnCancelarEliminar').addEventListener('click', () => cerrarModal(modalEliminar));

    // Cerrar al hacer clic fuera del modal
    [modalProducto, modalEliminar].forEach(m => {
        m.addEventListener('click', (e) => { if (e.target === m) cerrarModal(m); });
    });

    // Limpiar validación al escribir
    formProducto.querySelectorAll('input, select').forEach(el => {
        el.addEventListener('input', () => el.classList.remove('invalid'));
    });

    // Preview de imagen — producto
    vincularFileInput('inputImagenFile', 'previewImagen', 'imgFileName', 'inputImagen');
}

// ============================
// TABS
// ============================
// ============================
// TABS
// ============================
function cambiarSeccion(seccion) {
    const usuarioSesion = JSON.parse(localStorage.getItem('usuario') || '{}');
    if (usuarioSesion.rol === 'empleado' && seccion === 'empleados') {
        seccion = 'productos';
    }

    const esProd = seccion === 'productos';
    const esEnv = seccion === 'envases';
    const esKit = seccion === 'kits';
    const esTop = seccion === 'top10';
    const esOrd = seccion === 'ordenes';
    const esEmp = seccion === 'empleados';
    const esInd = seccion === 'induccion';

    const secProd = document.getElementById('seccionProductos');
    if (secProd) secProd.classList.toggle('hidden', !esProd);
    const secEnv = document.getElementById('seccionEnvases');
    if (secEnv) secEnv.classList.toggle('hidden', !esEnv);
    const secKit = document.getElementById('seccionKits');
    if (secKit) secKit.classList.toggle('hidden', !esKit);
    const secTop = document.getElementById('seccionTop10');
    if (secTop) secTop.classList.toggle('hidden', !esTop);
    const secOrd = document.getElementById('seccionOrdenes');
    if (secOrd) secOrd.classList.toggle('hidden', !esOrd);
    const secEmp = document.getElementById('seccionEmpleados');
    if (secEmp) secEmp.classList.toggle('hidden', !esEmp);
    const secInd = document.getElementById('seccionInduccion');
    if (secInd) secInd.classList.toggle('hidden', !esInd);

    const tabProd = document.getElementById('tabProductos');
    if (tabProd) tabProd.classList.toggle('active', esProd);
    const tabEnv = document.getElementById('tabEnvases');
    if (tabEnv) tabEnv.classList.toggle('active', esEnv);
    const tabKit = document.getElementById('tabKits');
    if (tabKit) tabKit.classList.toggle('active', esKit);
    const tabTop = document.getElementById('tabTop10');
    if (tabTop) tabTop.classList.toggle('active', esTop);
    const tabOrd = document.getElementById('tabOrdenes');
    if (tabOrd) tabOrd.classList.toggle('active', esOrd);
    const tabEmp = document.getElementById('tabEmpleados');
    if (tabEmp) tabEmp.classList.toggle('active', esEmp);

    if (esEmp) {
        cargarEmpleados();
    }

    localStorage.setItem('admin_active_tab', seccion);
}
// Exponer funciones para botones inline
window.moverTop10 = moverTop10;
window.quitarDeTop10 = quitarDeTop10;

// ============================
// ENVASES — CARGAR
// ============================
async function cargarEnvases() {
    const tbody = document.getElementById('tbodyEnvases');
    tbody.innerHTML = `<tr><td colspan="8" class="loading-row"><i class="fas fa-spinner fa-spin"></i> Cargando envases...</td></tr>`;
    try {
        const res  = await fetch(API_ENVASES_URL);
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        envases = data.data;
        renderTablaEnvases();
    } catch (err) {
        mostrarAlerta('Error al cargar envases: ' + err.message, 'error');
        tbody.innerHTML = `<tr><td colspan="8" class="empty-row"><i class="fas fa-exclamation-circle"></i> No se pudo conectar con el servidor.</td></tr>`;
    }
}

// ============================
// ENVASES — RENDER TABLA
// ============================
function renderTablaEnvases() {
    const tbody     = document.getElementById('tbodyEnvases');
    
    // Filtrar localmente
    const filtrados = envases.filter(e => 
        e.name.toLowerCase().includes(searchEnvases) || 
        e.material.toLowerCase().includes(searchEnvases)
    );

    const total     = filtrados.length;
    const totalPags = Math.ceil(total / ITEMS_ENV);
    if (paginaEnvases > totalPags && totalPags > 0) paginaEnvases = totalPags;
    const inicio = (paginaEnvases - 1) * ITEMS_ENV;
    const pagina = filtrados.slice(inicio, inicio + ITEMS_ENV);

    if (total === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="empty-row">${searchEnvases ? 'No se encontraron resultados.' : 'No hay envases registrados.'}</td></tr>`;
        document.getElementById('paginacionEnvases').innerHTML = '';
        return;
    }
    tbody.innerHTML = pagina.map(e => `
        <tr>
            <td data-label="#">${e.id}</td>
            <td data-label="Imagen">${imagenCell(e.image)}</td>
            <td data-label="Nombre"><strong>${escHtml(e.name)}</strong></td>
            <td data-label="Material">${escHtml(e.material)}</td>
            <td data-label="Precio">${formatPrecio(e.price)}</td>
            <td data-label="Tallas">${(e.sizes || []).join(', ') || '-'}</td>
            <td data-label="Visible">${e.activo ? '<i class="fas fa-eye" style="color: #27ae60"></i>' : '<i class="fas fa-eye-slash" style="color: #e74c3c"></i>'}</td>
            <td data-label="Acciones">
                <div class="acciones">
                    <button class="btn-icon editar" title="Editar" onclick="abrirEditarEnvase(${e.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon eliminar" title="Eliminar" onclick="abrirEliminarEnvase(${e.id}, '${escAttr(e.name)}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    renderPag('paginacionEnvases', paginaEnvases, totalPags, (p) => {
        paginaEnvases = p;
        renderTablaEnvases();
    });
}

// ============================
// ENVASES — ABRIR MODAL CREAR
// ============================
function abrirNuevoEnvase() {
    document.getElementById('formEnvase').reset();
    document.getElementById('modalTituloEnvase').textContent = 'Nuevo Envase';
    document.getElementById('envaseId').value = '';
    // Limpiar zona de imagen
    const preview = document.getElementById('previewEnvaseImagen');
    preview.src = '';
    preview.style.display = 'none';
    document.getElementById('envaseImgFileName').textContent = 'Sin imagen seleccionada';
    document.getElementById('envaseImagenFile').value = '';
    document.getElementById('envaseImagen').value = '';
    document.getElementById('envaseActivo').checked = true;
    abrirModal(document.getElementById('modalEnvase'));
}

// ============================
// ENVASES — ABRIR MODAL EDITAR
// ============================
function abrirEditarEnvase(id) {
    const e = envases.find(x => x.id === id);
    if (!e) return;
    document.getElementById('formEnvase').reset();
    document.getElementById('modalTituloEnvase').textContent = 'Editar Envase';
    document.getElementById('envaseId').value        = e.id;
    document.getElementById('envaseNombre').value    = e.name;
    document.getElementById('envaseDescripcion').value = e.description || '';
    document.getElementById('envaseMaterial').value  = e.material;
    document.getElementById('envasePrecio').value    = e.price;
    document.getElementById('envaseImagen').value    = e.image || '';
    document.getElementById('envaseActivo').checked  = !!e.activo;

    // Mostrar imagen actual en el preview
    const previewEnv = document.getElementById('previewEnvaseImagen');
    if (e.image) {
        previewEnv.src = e.image;
        previewEnv.style.display = 'block';
        document.getElementById('envaseImgFileName').textContent = e.image.split('/').pop();
    } else {
        previewEnv.src = '';
        previewEnv.style.display = 'none';
        document.getElementById('envaseImgFileName').textContent = 'Sin imagen seleccionada';
        document.getElementById('envaseImagenFile').value = '';
    }
    document.querySelectorAll('input[name="envaseTalla"]').forEach(cb => {
        cb.checked = (e.sizes || []).includes(cb.value);
    });
    abrirModal(document.getElementById('modalEnvase'));
}

// ============================
// ENVASES — GUARDAR (registrado en registrarEventosEnvases)
// ============================

// ============================
// ENVASES — ELIMINAR
// ============================
async function abrirEliminarEnvase(id, nombre) {
    const result = await Swal.fire({
        title: '¿Eliminar envase?',
        html: `¿Seguro que deseas eliminar <strong>${escHtml(nombre)}</strong>?<br>Esta acción no se puede deshacer.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '<i class="fas fa-trash"></i> Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#c0392b',
        cancelButtonColor: '#444',
        background: '#1a1a1a',
        color: '#fff'
    });
    if (!result.isConfirmed) return;
    try {
        const res  = await fetch(`${API_ENVASES_URL}/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        await cargarEnvases();
        Swal.fire({
            toast: true, position: 'top-end', icon: 'success',
            title: 'Envase eliminado', showConfirmButton: false, timer: 3000,
            background: '#1a1a1a', color: '#D4AF37'
        });
    } catch (err) {
        mostrarAlerta('Error al eliminar: ' + err.message, 'error');
    }
}

// ============================
// ENVASES — EVENTOS
// ============================
function registrarEventosEnvases() {
    document.getElementById('btnNuevoEnvase').addEventListener('click', abrirNuevoEnvase);
    document.getElementById('btnCerrarModalEnvase').addEventListener('click', () => cerrarModal(document.getElementById('modalEnvase')));
    document.getElementById('btnCancelarEnvase').addEventListener('click', () => cerrarModal(document.getElementById('modalEnvase')));
    document.getElementById('btnCerrarEliminarEnvase').addEventListener('click', () => cerrarModal(document.getElementById('modalEliminarEnvase')));
    document.getElementById('btnCancelarEliminarEnvase').addEventListener('click', () => cerrarModal(document.getElementById('modalEliminarEnvase')));

    // Preview de imagen — envase
    vincularFileInput('envaseImagenFile', 'previewEnvaseImagen', 'envaseImgFileName', 'envaseImagen');

    document.getElementById('formEnvase').addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const id          = document.getElementById('envaseId').value;
        const nombre      = document.getElementById('envaseNombre').value.trim();
        const descripcion = document.getElementById('envaseDescripcion').value.trim();
        const material    = document.getElementById('envaseMaterial').value;
        const precio      = parseFloat(document.getElementById('envasePrecio').value);
        const imagen      = document.getElementById('envaseImagen').value.trim();
        const sizes       = Array.from(document.querySelectorAll('input[name="envaseTalla"]:checked')).map(cb => cb.value);

        if (!nombre) { document.getElementById('envaseNombre').classList.add('invalid'); mostrarAlerta('El nombre es obligatorio.', 'error'); return; }
        if (!material) { document.getElementById('envaseMaterial').classList.add('invalid'); mostrarAlerta('El material es obligatorio.', 'error'); return; }

        const btn = document.getElementById('btnGuardarEnvase');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

        try {
            // Subir imagen si hay archivo seleccionado
            const fileInputEnv = document.getElementById('envaseImagenFile');
            if (fileInputEnv.files[0]) {
                const rutaSubida = await subirImagen(fileInputEnv.files[0]);
                document.getElementById('envaseImagen').value = rutaSubida;
            }
            const imagenFinalEnv = document.getElementById('envaseImagen').value.trim();

            const activo = document.getElementById('envaseActivo').checked ? 1 : 0;

            const method = id ? 'PUT' : 'POST';
            const url    = id ? `${API_ENVASES_URL}/${id}` : API_ENVASES_URL;
            const res    = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: nombre, description: descripcion, material, price: precio, image: imagenFinalEnv, sizes, activo })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
            cerrarModal(document.getElementById('modalEnvase'));
            await cargarEnvases();
            Swal.fire({
                toast: true, position: 'top-end', icon: 'success',
                title: id ? 'Envase actualizado' : 'Envase creado',
                showConfirmButton: false, timer: 3000,
                background: '#1a1a1a', color: '#D4AF37'
            });
        } catch (err) {
            mostrarAlerta('Error al guardar: ' + err.message, 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-save"></i> Guardar';
        }
    });



    [document.getElementById('modalEnvase'), document.getElementById('modalEliminarEnvase')].forEach(m => {
        m.addEventListener('click', (e) => { if (e.target === m) cerrarModal(m); });
    });

    document.getElementById('formEnvase').querySelectorAll('input, select').forEach(el => {
        el.addEventListener('input', () => el.classList.remove('invalid'));
    });
}

// ============================
// UTILIDADES
// ============================
function abrirModal(m)  { m.classList.remove('hidden'); document.body.style.overflow = 'hidden'; }
function cerrarModal(m) { m.classList.add('hidden');    document.body.style.overflow = ''; }

// ============================
// PAGINACIÓN REUTILIZABLE
// ============================
function renderPag(contenedorId, actual, total, onChange) {
    const cont = document.getElementById(contenedorId);
    if (total <= 1) { cont.innerHTML = ''; return; }

    const btn = (label, pag, disabled, active) =>
        `<button class="admin-pag-btn${active ? ' admin-pag-active' : ''}${disabled ? ' admin-pag-disabled' : ''}"
            ${disabled ? 'disabled' : `onclick="(${onChange.toString()})(${pag})"`}>${label}</button>`;

    let html = btn('<i class="fas fa-chevron-left"></i>', actual - 1, actual === 1, false);

    const rango = pagRango(actual, total);
    rango.forEach(p => {
        if (p === '...') html += `<span class="admin-pag-ellipsis">…</span>`;
        else html += btn(p, p, false, p === actual);
    });

    html += btn('<i class="fas fa-chevron-right"></i>', actual + 1, actual === total, false);
    cont.innerHTML = html;
}

function pagRango(actual, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (actual <= 4) return [1, 2, 3, 4, 5, '...', total];
    if (actual >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    return [1, '...', actual - 1, actual, actual + 1, '...', total];
}

function limpiarForm() {
    formProducto.reset();
    formProducto.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
    // Limpiar zona de imagen
    const preview = document.getElementById('previewImagen');
    preview.src = '';
    preview.style.display = 'none';
    document.getElementById('imgFileName').textContent = 'Sin imagen seleccionada';
    document.getElementById('inputImagenFile').value = '';
    document.getElementById('inputImagen').value = '';
}

function mostrarCargando() {
    tbodyProductos.innerHTML = `<tr><td colspan="10" class="loading-row"><i class="fas fa-spinner fa-spin"></i> Cargando productos...</td></tr>`;
}

function mostrarAlerta(msg, tipo) {
    alerta.textContent = msg;
    alerta.className   = `alerta ${tipo}`;
    clearTimeout(alerta._t);
    alerta._t = setTimeout(() => { alerta.className = 'alerta hidden'; }, 4000);
}

function imagenCell(src) {
    if (!src) return `<div class="sin-imagen"><i class="fas fa-image"></i></div>`;
    return `<img class="tabla-img" src="${escAttr(src)}" alt="producto" onerror="this.parentNode.innerHTML='<div class=\\'sin-imagen\\'><i class=\\'fas fa-image\\'></i></div>'">`;
}

function formatPrecio(n) {
    return n != null ? `$${Number(n).toLocaleString('es-CO')}` : '-';
}

function escHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function escAttr(str) {
    if (!str) return '';
    return String(str).replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// ============================
// ÓRDENES (Admin)
// ============================
const API_MP_URL = `${_BASE}/mercadopago`;
function getAuthHeaders(includeJson = false) {
    const headers = {};
    if (includeJson) headers['Content-Type'] = 'application/json';
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const adminKey = localStorage.getItem('admin_key');
    if (adminKey) headers['x-admin-key'] = adminKey;
    return headers;
}
let ordenes = [];
let paginaOrdenes = 1;
const ITEMS_ORD = 20;

async function cargarOrdenes(page = 1) {
    const tbody = document.getElementById('tbodyOrdenes');
    paginaOrdenes = page;
    tbody.innerHTML = `<tr><td colspan="9" class="loading-row"><i class="fas fa-spinner fa-spin"></i> Cargando órdenes...</td></tr>`;
    try {
        // Pedimos todas las órdenes (no solo aprobadas) para que el admin las vea todas
        const res = await fetch(`${API_MP_URL}/orders?page=${page}&limit=${ITEMS_ORD}`, { headers: getAuthHeaders() });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Error al obtener órdenes');
        
        // Asignamos todas las órdenes recibidas
        ordenes = data.data || [];
        
        renderTablaOrdenes(data.meta || {});
    } catch (err) {
        if (err.message.includes('Token inválido')) {
            manejarSesionInvalida();
            return;
        }
        mostrarAlerta('Error al cargar órdenes: ' + err.message, 'error');
        tbody.innerHTML = `<tr><td colspan="9" class="empty-row"><i class="fas fa-exclamation-circle"></i> No se pudo conectar con el servidor.</td></tr>`;
    }
}

function manejarSesionInvalida() {
    Swal.fire({
        icon: 'error',
        title: 'Sesión expirada',
        text: 'Tu sesión ha terminado o es inválida. Por favor, ingresa de nuevo.',
        confirmButtonText: 'Ir al Login',
        background: '#1a1a1a',
        color: '#fff',
        confirmButtonColor: '#D4AF37'
    }).then(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        window.location.href = 'login.html';
    });
}

function renderTablaOrdenes(meta = {}) {
    const tbody = document.getElementById('tbodyOrdenes');
    
    // Filtrar localmente
    const filtrados = (ordenes || []).filter(o => 
        (o.external_reference || '').toLowerCase().includes(searchOrdenes) || 
        (o.payer_name && o.payer_name.toLowerCase().includes(searchOrdenes)) ||
        (o.payer_email && o.payer_email.toLowerCase().includes(searchOrdenes)) ||
        (o.payment_id && String(o.payment_id).includes(searchOrdenes))
    );

    if (!filtrados || filtrados.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" class="empty-row">${searchOrdenes ? 'No se encontraron resultados.' : 'No hay órdenes registradas.'}</td></tr>`;
        document.getElementById('paginacionOrdenes').innerHTML = '';
        return;
    }
    
    const statusMap = {
        'pending': 'Pendiente', 'approved': 'Aprobado', 'in_process': 'En Proceso',
        'rejected': 'Rechazado', 'cancelled': 'Cancelado', 'failed': 'Fallido', 'refunded': 'Reembolsado'
    };

    tbody.innerHTML = filtrados.map((o, idx) => {
        const estadoEsp = statusMap[o.status] || o.status || '';
        let statusColor = '#9a9a9a';
        if(o.status === 'approved') statusColor = '#27ae60';
        else if(o.status === 'pending' || o.status === 'in_process') statusColor = '#f39c12';
        else if(o.status === 'rejected' || o.status === 'cancelled' || o.status === 'failed') statusColor = '#e74c3c';
        
        let compradorText = 'N/A';
        const nombreMostrar = o.envio_nombre || o.payer_name || '';
        const correoMostrar = o.payer_email || '';
        
        if (nombreMostrar || correoMostrar) {
            compradorText = `${escHtml(nombreMostrar)} <br><small style="color:#888;">${escHtml(correoMostrar)}</small>`;
        }

        return `
        <tr>
            <td data-label="#">${(((meta.page || 1) - 1) * ITEMS_ORD) + idx + 1}</td>
            <td data-label="Ref. Interna">${escHtml(o.external_reference)}</td>
            <td data-label="Preferencia MP">${escHtml(o.preference_id || '')}</td>
            <td data-label="Pago ID">${escHtml(o.payment_id || '')}</td>
            <td data-label="Comprador">${compradorText}</td>
            <td data-label="Total">${formatPrecio(o.total)}</td>
            <td data-label="Moneda">${escHtml(o.currency || 'COP')}</td>
            <td data-label="Estado"><strong style="color: ${statusColor};">${escHtml(estadoEsp)}</strong></td>
            <td data-label="Fecha">${escHtml(o.created_at ? new Date(o.created_at).toLocaleString() : '')}</td>
            <td data-label="Acciones">
                <div class="acciones">
                    <button class="btn-icon" title="Ver" onclick="abrirDetalleOrden('${escAttr(o.external_reference)}')"><i class="fas fa-eye"></i></button>
                </div>
            </td>
        </tr>
    `}).join('');

    const totalPages = meta.pages || 1;
    renderPag('paginacionOrdenes', paginaOrdenes, totalPages, (p) => { 
        paginaOrdenes = p; 
        cargarOrdenes(p); 
    });
}

async function abrirDetalleOrden(external_reference) {
    try {
        const res = await fetch(`${API_MP_URL}/order/${encodeURIComponent(external_reference)}`, { headers: getAuthHeaders() });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Orden no encontrada');
        const o = data.order;
        document.getElementById('modalTituloOrden').textContent = `Orden ${escHtml(o.external_reference)}`;
        const statusMap = {
            'pending': 'Pendiente', 'approved': 'Aprobado', 'in_process': 'En Proceso',
            'rejected': 'Rechazado', 'cancelled': 'Cancelado', 'failed': 'Fallido', 'refunded': 'Reembolsado'
        };
        const estadoEsp = statusMap[o.status] || o.status || '';
        let statusColor = '#9a9a9a';
        if(o.status === 'approved') statusColor = '#27ae60';
        else if(o.status === 'pending' || o.status === 'in_process') statusColor = '#f39c12';
        else if(o.status === 'rejected' || o.status === 'cancelled' || o.status === 'failed') statusColor = '#e74c3c';

        let compradorInfo = 'N/A';
        const nombreMostrar = o.envio_nombre || o.payer_name || '';
        const correoMostrar = o.payer_email || '';
        if (nombreMostrar || correoMostrar) {
            compradorInfo = `<span style="color: var(--text); font-weight: 600;">${escHtml(nombreMostrar)}</span>`;
            if (correoMostrar) compradorInfo += `<br><a href="mailto:${escHtml(correoMostrar)}" style="color: var(--gold); text-decoration: none;">${escHtml(correoMostrar)}</a>`;
        }

        let envioInfo = '';
        if (o.envio_ciudad || o.envio_direccion) {
            envioInfo = `
                <div style="grid-column: 1 / -1; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 10px; margin-top: 4px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div>
                        <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Celular</span>
                        <p style="font-size: 0.9rem; color: var(--text); margin-top: 4px;">${escHtml(o.envio_celular || 'N/A')}</p>
                    </div>
                    <div>
                        <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Doc. Identidad</span>
                        <p style="font-size: 0.9rem; color: var(--text); margin-top: 4px;">${escHtml(o.envio_documento || 'N/A')}</p>
                    </div>
                    <div>
                        <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Ciudad</span>
                        <p style="font-size: 0.9rem; color: var(--text); margin-top: 4px;">${escHtml(o.envio_ciudad || 'N/A')}</p>
                    </div>
                    <div>
                        <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Dirección</span>
                        <p style="font-size: 0.9rem; color: var(--text); margin-top: 4px;">${escHtml(o.envio_direccion || 'N/A')}</p>
                    </div>
                    <div>
                        <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Barrio</span>
                        <p style="font-size: 0.9rem; color: var(--text); margin-top: 4px;">${escHtml(o.envio_barrio || 'N/A')}</p>
                    </div>
                    ${o.envio_piso ? `
                    <div>
                        <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Apto / Piso</span>
                        <p style="font-size: 0.9rem; color: var(--text); margin-top: 4px;">${escHtml(o.envio_piso)}</p>
                    </div>` : ''}
                    ${o.envio_referencia ? `
                    <div style="grid-column: 1 / -1;">
                        <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Referencia</span>
                        <p style="font-size: 0.9rem; color: var(--text); margin-top: 4px;">${escHtml(o.envio_referencia)}</p>
                    </div>` : ''}
                </div>
            `;
        }

        const info = document.getElementById('ordenInfo');
        info.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; background: rgba(0,0,0,0.2); padding: 16px; border-radius: 8px; border: 1px solid var(--border); margin-bottom: 20px;">
                <div>
                    <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Total pagado</span>
                    <p style="font-size: 1.25rem; font-weight: 700; color: var(--gold-soft); margin-top: 4px;">${formatPrecio(o.total)} ${escHtml(o.currency || '')}</p>
                </div>
                <div>
                    <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Estado actual</span>
                    <p style="margin-top: 6px;"><span style="background: ${statusColor}22; color: ${statusColor}; padding: 4px 10px; border-radius: 20px; font-weight: 600; font-size: 0.9rem; border: 1px solid ${statusColor}55;">${escHtml(estadoEsp)}</span></p>
                </div>
                <div style="grid-column: 1 / -1; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 10px; margin-top: 4px;">
                    <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Comprador</span>
                    <p style="font-size: 0.9rem; color: var(--text); margin-top: 4px;">${compradorInfo}</p>
                </div>
                ${envioInfo}
                <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 10px; margin-top: 4px;">
                    <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Preference ID</span>
                    <p style="font-size: 0.85rem; color: var(--text); margin-top: 4px; word-break: break-all;">${escHtml(o.preference_id || 'N/A')}</p>
                </div>
                <div>
                    <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Payment ID</span>
                    <p style="font-size: 0.85rem; color: var(--text); margin-top: 4px; word-break: break-all;">${escHtml(o.payment_id || 'N/A')}</p>
                </div>
            </div>
        `;

        // Items
        const itemsBox = document.getElementById('ordenItems');
        let itemsHtml = '';
        try {
            const items = typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || []);
            if (items && items.length) {
                itemsHtml = `<table class="tabla-productos" style="width:100%; border:none;"><thead><tr><th style="padding-left:0;">Producto</th><th>Cantidad</th><th style="text-align:right;">Precio</th></tr></thead><tbody>` + items.map(it => `
                    <tr><td style="padding-left:0;">${escHtml(it.title || it.name || it.id)}</td><td>${escHtml(String(it.quantity || it.cantidad || 1))}</td><td style="text-align:right; font-weight:600;">${formatPrecio(it.unit_price || it.price || 0)}</td></tr>
                `).join('') + `</tbody></table>`;
            } else {
                itemsHtml = '<div class="empty-row">Sin items.</div>';
            }
        } catch (e) {
            itemsHtml = '<div class="empty-row">No se pudieron parsear los items.</div>';
        }
        itemsBox.innerHTML = itemsHtml;

        document.getElementById('ordenRaw').textContent = JSON.stringify(o, null, 2);
        document.getElementById('ordenStatusSelect').value = o.status || 'pending';

        // Set actions
        document.getElementById('btnActualizarOrden').onclick = async () => {
            const nuevo = document.getElementById('ordenStatusSelect').value;
            try {
                const r = await fetch(`${API_MP_URL}/order/${encodeURIComponent(o.external_reference)}`, {
                    method: 'PUT', headers: getAuthHeaders(true), body: JSON.stringify({ status: nuevo })
                });
                const d = await r.json();
                if (!d.success) throw new Error(d.message || 'Error actualizando');
                mostrarAlerta('Estado actualizado', 'success');
                cargarOrdenes(paginaOrdenes);
                abrirDetalleOrden(o.external_reference);
            } catch (err) {
                mostrarAlerta('Error actualizando orden: ' + err.message, 'error');
            }
        };

        document.getElementById('btnForzarVerificacion').onclick = async () => {
            try {
                const paymentId = o.payment_id;
                if (!paymentId) return mostrarAlerta('La orden no tiene payment_id para verificar.', 'error');
                const r = await fetch(`${API_MP_URL}/verify_payment?payment_id=${encodeURIComponent(paymentId)}`);
                const dd = await r.json();
                if (!dd.success) throw new Error(dd.message || 'Error verificando');
                mostrarAlerta('Verificación solicitada', 'success');
                cargarOrdenes(paginaOrdenes);
                abrirDetalleOrden(o.external_reference);
            } catch (err) {
                mostrarAlerta('Error verificando orden: ' + err.message, 'error');
            }
        };

        // Open modal
        abrirModal(document.getElementById('modalOrden'));
    } catch (err) {
        if (err.message.includes('Token inválido')) {
            manejarSesionInvalida();
            return;
        }
        mostrarAlerta('Error al abrir orden: ' + err.message, 'error');
    }
}

function registrarEventosOrdenes() {
    const btnRef = document.getElementById('btnRefrescarOrdenes');
    if (btnRef) btnRef.addEventListener('click', () => cargarOrdenes(paginaOrdenes));
    const btnExp = document.getElementById('btnExportarOrdenes');
    if (btnExp) btnExp.addEventListener('click', () => {
        if (!ordenes || ordenes.length === 0) return mostrarAlerta('No hay órdenes para exportar', 'error');
        const csvRows = [];
        const headers = ['external_reference','preference_id','payment_id','total','currency','status','created_at'];
        csvRows.push(headers.join(','));
        ordenes.forEach(o => {
            csvRows.push([o.external_reference || '', o.preference_id || '', o.payment_id || '', o.total || 0, o.currency || '', o.status || '', o.created_at || ''].map(v => `"${String(v).replace(/"/g,'""')}"`).join(','));
        });
        const csv = csvRows.join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `ordenes_page_${paginaOrdenes}.csv`; document.body.appendChild(a); a.click(); a.remove();
    });

    // Modal close buttons
    const btnCerrar = document.getElementById('btnCerrarModalOrden');
    if (btnCerrar) btnCerrar.addEventListener('click', () => cerrarModal(document.getElementById('modalOrden')));
    const btnCerrar2 = document.getElementById('btnCerrarOrden');
    if (btnCerrar2) btnCerrar2.addEventListener('click', () => cerrarModal(document.getElementById('modalOrden')));
}

// ============================
// REGISTRAR BUSCADORES
// ============================
function registrarBuscadores() {
    const inputBusqProd = document.getElementById('searchProductos');
    if (inputBusqProd) {
        inputBusqProd.addEventListener('input', (e) => {
            searchProductos = e.target.value.toLowerCase();
            paginaProductos = 1;
            renderTabla();
        });
    }

    const inputBusqEnv = document.getElementById('searchEnvases');
    if (inputBusqEnv) {
        inputBusqEnv.addEventListener('input', (e) => {
            searchEnvases = e.target.value.toLowerCase();
            paginaEnvases = 1;
            renderTablaEnvases();
        });
    }

    const inputBusqKit = document.getElementById('searchKits');
    if (inputBusqKit) {
        inputBusqKit.addEventListener('input', (e) => {
            searchKits = e.target.value.toLowerCase();
            paginaKits = 1;
            renderTablaKits();
        });
    }

    const inputBusqTop = document.getElementById('searchTop10');
    if (inputBusqTop) {
        inputBusqTop.addEventListener('input', (e) => {
            searchTop10 = e.target.value.toLowerCase();
            renderTablaTop10();
        });
    }

    const inputBusqOrd = document.getElementById('searchOrdenes');
    if (inputBusqOrd) {
        inputBusqOrd.addEventListener('input', (e) => {
            searchOrdenes = e.target.value.toLowerCase();
            paginaOrdenes = 1;
            renderTablaOrdenes();
        });
    }
}

// Inicializar buscadores al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    registrarBuscadores();
});

window.abrirDetalleOrden = abrirDetalleOrden;

// ============================================================
// INDUCCIÓN, CAPACITACIÓN Y GESTIÓN DE COLABORADORES
// ============================================================
const API_INDUCCION_URL = `${_BASE}/induccion`;
const API_EMPLEADOS_URL = `${_BASE}/admin/empleados`;

let induccionItems = [];
let induccionItemsCompletados = [];
let induccionProgresoData = null;
let induccionModuloActualIdx = 0;

// Inicialización de Inducción para Empleados
async function iniciarInduccionEmpleado() {
    cambiarSeccion('induccion');
    await cargarProgresoInduccion();
}

async function cargarProgresoInduccion() {
    const token = localStorage.getItem('token');
    try {
        const resProgreso = await fetch(`${API_INDUCCION_URL}/mi-progreso`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const dataProgreso = await resProgreso.json();
        if (!dataProgreso.success) throw new Error(dataProgreso.message);

        induccionProgresoData = dataProgreso.data;
        induccionItemsCompletados = dataProgreso.data.itemsCompletados || [];

        const resItems = await fetch(`${API_INDUCCION_URL}/items`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const dataItems = await resItems.json();
        if (!dataItems.success) throw new Error(dataItems.message);

        induccionItems = dataItems.data || [];

        actualizarBarraProgresoInduccion();
        renderizarPasoInduccion();
    } catch (err) {
        console.error('Error al cargar inducción:', err);
        mostrarAlerta('Error al cargar módulo de inducción: ' + err.message, 'error');
    }
}

function actualizarBarraProgresoInduccion(idxActual) {
    const total = induccionItems.length;
    const completados = induccionItemsCompletados.length;
    const porcentaje = total > 0 ? Math.round((completados / total) * 100) : 0;

    let moduloNum = completados < total ? completados + 1 : total;
    if (typeof idxActual === 'number' && idxActual >= 0) {
        moduloNum = idxActual + 1;
    }
    if (moduloNum > total) moduloNum = total;

    const barra = document.getElementById('induccionBarraProgreso');
    const texto = document.getElementById('induccionProgresoTexto');
    const contador = document.getElementById('induccionModulosContador');
    const badge = document.getElementById('induccionBadgeEstado');

    if (barra) barra.style.width = `${porcentaje}%`;
    if (texto) texto.textContent = `Progreso de Capacitación: ${porcentaje}%`;
    if (contador) contador.textContent = `Módulo ${moduloNum} de ${total}`;

    if (badge) {
        const est = induccionProgresoData ? induccionProgresoData.usuario.estado_induccion : 'pendiente_capacitacion';
        if (est === 'examen_aprobado') {
            badge.innerHTML = `<span style="background:#2563eb;color:#fff;padding:6px 12px;border-radius:20px;font-size:0.85rem;font-weight:bold;"><i class="fas fa-check-circle"></i> Examen Aprobado</span>`;
        } else if (est === 'bloqueado') {
            badge.innerHTML = `<span style="background:#dc2626;color:#fff;padding:6px 12px;border-radius:20px;font-size:0.85rem;font-weight:bold;"><i class="fas fa-ban"></i> Bloqueado (3 Intentos Consumidos)</span>`;
        } else {
            badge.innerHTML = `<span style="background:#d97706;color:#fff;padding:6px 12px;border-radius:20px;font-size:0.85rem;font-weight:bold;"><i class="fas fa-clock"></i> En Capacitación</span>`;
        }
    }
}

function renderizarPasoInduccion() {
    const contenedorMod = document.getElementById('induccionContenedorModulo');
    const contenedorExa = document.getElementById('induccionContenedorExamen');
    const contenedorAut = document.getElementById('induccionContenedorAutorizacion');

    if (!contenedorMod || !contenedorExa || !contenedorAut) return;

    contenedorMod.classList.add('hidden');
    contenedorExa.classList.add('hidden');
    contenedorAut.classList.add('hidden');

    const estado = induccionProgresoData.usuario.estado_induccion;

    if (estado === 'examen_aprobado') {
        contenedorAut.classList.remove('hidden');
        renderVistaAutorizacionPendiente();
        return;
    }

    if (estado === 'bloqueado') {
        contenedorAut.classList.remove('hidden');
        renderVistaBloqueado();
        return;
    }

    // Buscar primer módulo no completado
    let idxSiguiente = -1;
    for (let i = 0; i < induccionItems.length; i++) {
        if (!induccionItemsCompletados.includes(induccionItems[i].id)) {
            idxSiguiente = i;
            break;
        }
    }

    if (idxSiguiente !== -1) {
        induccionModuloActualIdx = idxSiguiente;
        contenedorMod.classList.remove('hidden');
        renderModuloLectura(induccionModuloActualIdx);
    } else {
        contenedorExa.classList.remove('hidden');
        renderPantallaExamenFinal();
    }
}

function renderModuloLectura(idx) {
    actualizarBarraProgresoInduccion(idx);
    const mod = induccionItems[idx];
    const contenedor = document.getElementById('induccionContenedorModulo');

    let mediaHtml = '';
    if (mod.tipo === 'video' || mod.video_url) {
        const vUrl = mod.video_url || '';
        mediaHtml = `
            <div style="margin-bottom: 24px; text-align: center; background: #050505; padding: 18px; border-radius: 12px; border: 1px solid rgba(212,175,55,0.4); box-shadow: 0 6px 20px rgba(0,0,0,0.7);">
                <video controls style="max-width: 100%; max-height: 520px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.6);" preload="metadata">
                    <source src="${escHtml(vUrl)}" type="video/mp4">
                    Tu navegador no soporta el reproductor de video.
                </video>
            </div>
        `;
    } else if (mod.tipo === 'imagen' || mod.imagen_url) {
        const imgUrl = mod.imagen_url || '';
        mediaHtml = `
            <div style="margin-bottom: 24px; text-align: center; background: #0b0b0b; padding: 18px; border-radius: 12px; border: 1px solid rgba(212,175,55,0.4); box-shadow: 0 6px 20px rgba(0,0,0,0.7);">
                <img src="${escHtml(imgUrl)}" alt="${escHtml(mod.titulo)}" style="max-width: 100%; max-height: 580px; border-radius: 8px; object-fit: contain; box-shadow: 0 4px 15px rgba(0,0,0,0.6); cursor: pointer;" onclick="window.open('${escHtml(imgUrl)}', '_blank')">
                <p style="color:#aaa; font-size:0.82rem; margin-top:10px;"><i class="fas fa-search-plus"></i> Haz clic en la imagen para abrirla a resolución completa</p>
            </div>
        `;
    }

    const contenidoFormateado = escHtml(mod.contenido || '');

    contenedor.innerHTML = `
        <div style="background: rgba(12,12,12,0.95); border: 1px solid rgba(212,175,55,0.35); border-radius: 12px; padding: 24px; margin-bottom: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.5);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <span style="color:#D4AF37; font-weight:bold; font-size:0.9rem; text-transform:uppercase; letter-spacing:0.8px;">
                    <i class="fas fa-book-reader"></i> Módulo ${idx + 1} de ${induccionItems.length}
                </span>
            </div>
            <h3 style="color:#ffffff; margin: 0 0 20px 0; font-size:1.5rem; font-weight:600;">${escHtml(mod.titulo)}</h3>

            ${mediaHtml}

            <div style="color:#e0e0e0; font-size:1rem; line-height:1.75; white-space:pre-line; background:#080808; padding:20px; border-radius:10px; border:1px solid #222; margin-bottom:28px;">
                ${contenidoFormateado}
            </div>

            <div style="border-top: 1px solid rgba(212,175,55,0.3); padding-top: 24px;">
                ${(mod.preguntas && mod.preguntas.length > 0) ? `
                    <h4 style="color:#D4AF37; margin-top:0; font-size:1.15rem; font-weight:600;">
                        <i class="fas fa-question-circle"></i> Preguntas de Validación del Módulo (${mod.preguntas.length} obligatorias)
                    </h4>
                    <p style="color:#bbb; font-size:0.88rem; margin-bottom:20px;">
                        Debes responder las preguntas correctamente para avanzar al siguiente módulo.
                    </p>
                ` : `
                    <div style="background: rgba(212,175,55,0.1); border: 1px solid rgba(212,175,55,0.35); padding: 16px 20px; border-radius: 10px; margin-bottom: 20px; color: #F3E5AB; font-size: 0.95rem; display:flex; align-items:center; gap:12px;">
                        <i class="fas fa-info-circle" style="font-size:1.4rem; color:#D4AF37;"></i>
                        <span>Este módulo es una introducción y vista previa. No requiere responder preguntas. Haz clic abajo para registrar la lectura y continuar.</span>
                    </div>
                `}
                <form id="formModuloPreguntas">
                    ${(mod.preguntas || []).map((p, pIdx) => `
                        <div style="background:#141414; border:1px solid #2e2e2e; border-radius:10px; padding:18px; margin-bottom:16px;">
                            <p style="color:#fff; font-weight:600; margin:0 0 12px 0; font-size:0.98rem;">${pIdx + 1}. ${escHtml(p.pregunta)}</p>
                            <div style="display:flex; flex-direction:column; gap:10px;">
                                ${p.opciones.map((opt, oIdx) => `
                                    <label style="display:flex; align-items:center; gap:12px; color:#ddd; cursor:pointer; font-size:0.93rem; background:#0a0a0a; padding:10px 14px; border-radius:8px; border:1px solid #262626; transition: all 0.2s ease;">
                                        <input type="radio" name="pregunta_${p.id}" value="${oIdx}" required style="accent-color: #D4AF37;">
                                        <span>${escHtml(opt)}</span>
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                    
                    <div style="display:flex; justify-content:flex-end; margin-top:24px;">
                        <button type="submit" class="btn-primary" style="padding:14px 28px; font-size:1rem; font-weight:600; display:inline-flex; align-items:center; gap:10px;">
                            <i class="${(mod.preguntas && mod.preguntas.length > 0) ? 'fas fa-check-circle' : 'fas fa-arrow-right'}"></i> ${(mod.preguntas && mod.preguntas.length > 0) ? 'Verificar y Continuar al Siguiente Módulo' : 'Continuar al Siguiente Módulo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.getElementById('formModuloPreguntas').addEventListener('submit', async (e) => {
        e.preventDefault();
        const respuestas = {};
        mod.preguntas.forEach(p => {
            const sel = document.querySelector(`input[name="pregunta_${p.id}"]:checked`);
            if (sel) respuestas[p.id] = parseInt(sel.value, 10);
        });

        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_INDUCCION_URL}/validar-item`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ item_id: mod.id, respuestas })
            });
            const data = await res.json();

            if (data.success && data.completado) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Excelente!',
                    text: data.message,
                    timer: 2000,
                    showConfirmButton: false
                });
                await cargarProgresoInduccion();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Respuestas Incorrectas',
                    text: data.message || 'Una o más respuestas no son correctas. Por favor repasa el texto e inténtalo de nuevo.',
                    confirmButtonText: 'Entendido y Corregir'
                });
            }
        } catch (err) {
            Swal.fire('Error', 'No se pudo enviar la validación del módulo: ' + err.message, 'error');
        }
    });
}

function renderPantallaExamenFinal() {
    const contenedor = document.getElementById('induccionContenedorExamen');
    const intentos = induccionProgresoData.usuario.intentos_examen || 0;

    contenedor.innerHTML = `
        <div style="background: rgba(212,175,55,0.05); border: 2px solid #D4AF37; border-radius: 12px; padding: 24px; text-align: center;">
            <div style="font-size: 3rem; color: #D4AF37; margin-bottom: 12px;"><i class="fas fa-file-signature"></i></div>
            <h3 style="color: #ffffff; font-size: 1.6rem; margin: 0 0 10px 0;">Examen Final de Inducción Obligatorio</h3>
            <p style="color: #ccc; max-width: 650px; margin: 0 auto 20px auto; font-size: 0.98rem; line-height: 1.6;">
                Has completado la lectura de todos los módulos. A continuación responderás el examen final que evalúa lo aprendido.
            </p>

            <div style="background: #1c1917; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 0 auto 24px auto; max-width: 600px; text-align: left;">
                <h4 style="color: #f59e0b; margin: 0 0 8px 0;"><i class="fas fa-exclamation-triangle"></i> ¡ATENCIÓN OBLIGATORIA!</h4>
                <ul style="color: #e5e7eb; margin: 0; padding-left: 20px; font-size: 0.92rem; line-height: 1.6;">
                    <li>Debes responder <strong>el 100% de las preguntas de manera correcta</strong> para aprobar el examen.</li>
                    <li>Cuentas únicamente con <strong>MÁXIMO 3 INTENTOS</strong>.</li>
                    <li>Llevas consumidos <strong>${intentos} de 3 intentos</strong>.</li>
                </ul>
            </div>

            <button id="btnIniciarExamen" class="btn-primary" style="padding: 14px 32px; font-size: 1.1rem; border-radius: 30px;">
                <i class="fas fa-play-circle"></i> Iniciar Examen Final Ahora
            </button>
        </div>
        <div id="examenPreguntasArea" class="hidden" style="margin-top: 24px;"></div>
    `;

    document.getElementById('btnIniciarExamen').addEventListener('click', async () => {
        await cargarPreguntasExamenFinal();
    });
}

async function cargarPreguntasExamenFinal() {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_INDUCCION_URL}/examen`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);

        const preguntas = data.data || [];
        const area = document.getElementById('examenPreguntasArea');
        document.getElementById('btnIniciarExamen').style.display = 'none';
        area.classList.remove('hidden');

        area.innerHTML = `
            <form id="formExamenFinalSubmit" style="background:#0e0e0e; border:1px solid #333; border-radius:10px; padding:20px;">
                <h3 style="color:#D4AF37; margin-top:0;"><i class="fas fa-tasks"></i> Examen Final (Responde todas las preguntas)</h3>
                ${preguntas.map((p, idx) => `
                    <div style="background:#171717; border:1px solid #262626; border-radius:8px; padding:16px; margin-bottom:16px;">
                        <p style="color:#fff; font-weight:600; margin:0 0 10px 0;">${idx + 1}. ${escHtml(p.pregunta)}</p>
                        <div style="display:flex; flex-direction:column; gap:8px;">
                            ${p.opciones.map((opt, oIdx) => `
                                <label style="display:flex; align-items:center; gap:10px; color:#ddd; cursor:pointer; font-size:0.92rem; background:#0a0a0a; padding:10px 14px; border-radius:6px; border:1px solid #333;">
                                    <input type="radio" name="pregunta_${p.id}" value="${oIdx}" required>
                                    <span>${escHtml(opt)}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}

                <div style="display:flex; justify-content:flex-end; margin-top:20px;">
                    <button type="submit" class="btn-primary" style="padding:14px 28px; font-size:1.05rem;">
                        <i class="fas fa-paper-plane"></i> Enviar Examen para Evaluación
                    </button>
                </div>
            </form>
        `;

        document.getElementById('formExamenFinalSubmit').addEventListener('submit', async (e) => {
            e.preventDefault();
            const respuestas = {};
            preguntas.forEach(p => {
                const sel = document.querySelector(`input[name="pregunta_${p.id}"]:checked`);
                if (sel) respuestas[p.id] = parseInt(sel.value, 10);
            });

            try {
                const resEval = await fetch(`${API_INDUCCION_URL}/evaluar-examen`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ respuestas })
                });
                const dataEval = await resEval.json();

                if (dataEval.success && dataEval.aprobado) {
                    Swal.fire({
                        icon: 'success',
                        title: '🎉 ¡Felicitaciones! Examen Aprobado',
                        text: dataEval.message,
                        confirmButtonText: 'Continuar'
                    }).then(() => {
                        cargarProgresoInduccion();
                    });
                } else {
                    Swal.fire({
                        icon: dataEval.bloqueado ? 'error' : 'warning',
                        title: dataEval.bloqueado ? 'Cuenta Bloqueada' : 'Examen No Aprobado',
                        text: dataEval.message,
                        confirmButtonText: 'Entendido'
                    }).then(() => {
                        cargarProgresoInduccion();
                    });
                }
            } catch (err) {
                Swal.fire('Error', 'No se pudo procesar la evaluación: ' + err.message, 'error');
            }
        });
    } catch (err) {
        Swal.fire('Error', 'No se pudo obtener las preguntas del examen: ' + err.message, 'error');
    }
}

function renderVistaAutorizacionPendiente() {
    const contenedor = document.getElementById('induccionContenedorAutorizacion');
    contenedor.innerHTML = `
        <div style="background: rgba(37,99,235,0.1); border: 2px solid #2563eb; border-radius: 12px; padding: 32px; text-align: center;">
            <div style="font-size: 3.5rem; color: #3b82f6; margin-bottom: 12px;"><i class="fas fa-user-check"></i></div>
            <h3 style="color: #ffffff; font-size: 1.8rem; margin: 0 0 10px 0;">¡Examen de Inducción Aprobado!</h3>
            <p style="color: #93c5fd; max-width: 600px; margin: 0 auto 16px auto; font-size: 1.05rem; line-height: 1.6;">
                Has completado la capacitación y aprobado el examen final al 100%. Tu cuenta se encuentra actualmente en estado:
                <strong style="color:#ffffff;">Pendiente de Autorización</strong>.
            </p>
            <p style="color: #aaa; font-size: 0.95rem;">
                Por favor, notifica al <strong>Administrador</strong> para que confirme tu aprobación y haga clic en <em>"Autorizar Ingreso"</em> desde su panel. Una vez hecho esto, tendrás acceso completo al sistema.
            </p>
        </div>
    `;
}

function renderVistaBloqueado() {
    const contenedor = document.getElementById('induccionContenedorAutorizacion');
    contenedor.innerHTML = `
        <div style="background: rgba(220,38,38,0.1); border: 2px solid #dc2626; border-radius: 12px; padding: 32px; text-align: center;">
            <div style="font-size: 3.5rem; color: #ef4444; margin-bottom: 12px;"><i class="fas fa-lock"></i></div>
            <h3 style="color: #ffffff; font-size: 1.8rem; margin: 0 0 10px 0;">Has Agotado los 3 Intentos</h3>
            <p style="color: #fca5a5; max-width: 600px; margin: 0 auto 16px auto; font-size: 1.05rem; line-height: 1.6;">
                Lamentablemente has consumido tus 3 intentos en el examen final sin obtener el 100% de aprobación.
            </p>
            <p style="color: #aaa; font-size: 0.95rem;">
                Comunícate con el Administrador para solicitar una revisión o el reinicio de tus intentos.
            </p>
        </div>
    `;
}

// ============================================================
// GESTIÓN DE COLABORADORES (VISTA SUPERADMIN)
// ============================================================
async function cargarEmpleados() {
    const tbody = document.getElementById('tbodyEmpleados');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="8" class="loading-row"><i class="fas fa-spinner fa-spin"></i> Cargando lista de colaboradores...</td></tr>`;

    const token = localStorage.getItem('token');
    try {
        const res = await fetch(API_EMPLEADOS_URL, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);

        const empleados = data.data || [];
        if (empleados.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="empty-row">No hay colaboradores registrados todavía. Usa el botón "Registrar Nuevo Colaborador" para agregar uno.</td></tr>`;
            return;
        }

        tbody.innerHTML = empleados.map((e, idx) => {
            let badgeEstado = '';
            let btnsAccion = `<div style="display:flex;gap:6px;flex-wrap:wrap;">`;

            if (e.estado_induccion === 'autorizado') {
                badgeEstado = `<span style="background:#16a34a;color:#fff;padding:4px 8px;border-radius:4px;font-weight:600;font-size:0.8rem;"><i class="fas fa-check-double"></i> Autorizado</span>`;
            } else if (e.estado_induccion === 'examen_aprobado') {
                badgeEstado = `<span style="background:#2563eb;color:#fff;padding:4px 8px;border-radius:4px;font-weight:600;font-size:0.8rem;"><i class="fas fa-star"></i> Examen Aprobado</span>`;
                btnsAccion += `<button class="btn-primary" style="padding:6px 10px;font-size:0.8rem;" onclick="autorizarEmpleado(${e.id}, '${escHtml(e.nombre)}')"><i class="fas fa-user-check"></i> Autorizar</button>`;
            } else if (e.estado_induccion === 'bloqueado') {
                badgeEstado = `<span style="background:#dc2626;color:#fff;padding:4px 8px;border-radius:4px;font-weight:600;font-size:0.8rem;"><i class="fas fa-lock"></i> Bloqueado</span>`;
                btnsAccion += `<button class="btn-secondary" style="padding:6px 10px;font-size:0.8rem;" onclick="reiniciarIntentosEmpleado(${e.id}, '${escHtml(e.nombre)}')"><i class="fas fa-redo"></i> Reiniciar</button>`;
            } else {
                badgeEstado = `<span style="background:#d97706;color:#fff;padding:4px 8px;border-radius:4px;font-weight:600;font-size:0.8rem;"><i class="fas fa-hourglass-half"></i> En Capacitación</span>`;
                btnsAccion += `<button class="btn-primary" style="padding:6px 10px;font-size:0.8rem;" onclick="autorizarEmpleado(${e.id}, '${escHtml(e.nombre)}')"><i class="fas fa-user-check"></i> Autorizar</button>`;
            }

            // Acciones CRUD completas: Editar, Clave, Estado, Eliminar
            btnsAccion += `<button class="btn-secondary" style="padding:6px 10px;font-size:0.8rem;background:#0284c7;color:#fff;" title="Editar Datos" onclick="editarEmpleado(${e.id}, '${escHtml(e.nombre)}', '${escHtml(e.email)}')"><i class="fas fa-edit"></i> Editar</button>`;
            btnsAccion += `<button class="btn-secondary" style="padding:6px 10px;font-size:0.8rem;" title="Cambiar Contraseña" onclick="cambiarPasswordEmpleado(${e.id}, '${escHtml(e.nombre)}')"><i class="fas fa-key"></i> Clave</button>`;
            
            const btnEstadoColor = e.activo ? '#15803d' : '#6b7280';
            const btnEstadoTexto = e.activo ? 'Activo' : 'Inactivo';
            btnsAccion += `<button class="btn-secondary" style="padding:6px 10px;font-size:0.8rem;background:${btnEstadoColor};color:#fff;" title="Cambiar Estado Activo/Inactivo" onclick="toggleEstadoEmpleado(${e.id}, '${escHtml(e.nombre)}', ${e.activo ? 1 : 0})"><i class="fas fa-toggle-on"></i> ${btnEstadoTexto}</button>`;
            
            btnsAccion += `<button class="btn-danger" style="padding:6px 10px;font-size:0.8rem;background:#dc2626;color:#fff;" title="Eliminar Colaborador" onclick="eliminarEmpleado(${e.id}, '${escHtml(e.nombre)}')"><i class="fas fa-trash-alt"></i> Eliminar</button>`;
            btnsAccion += `</div>`;

            const fechaReg = e.creado_en ? new Date(e.creado_en).toLocaleDateString('es-CO') : '-';

            return `
                <tr>
                    <td data-label="#">${idx + 1}</td>
                    <td data-label="Colaborador"><strong>${escHtml(e.nombre)}</strong></td>
                    <td data-label="Email">${escHtml(e.email)}</td>
                    <td data-label="Fecha Registro">${fechaReg}</td>
                    <td data-label="Progreso Lecturas">${e.items_completados} / ${e.totalItems} (${e.porcentajeLectura}%)</td>
                    <td data-label="Examen">${e.intentos_examen} / 3 (Nota: ${e.ultimo_puntaje}%)</td>
                    <td data-label="Estado Inducción">${badgeEstado}</td>
                    <td data-label="Acciones">${btnsAccion}</td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        mostrarAlerta('Error al cargar empleados: ' + err.message, 'error');
        tbody.innerHTML = `<tr><td colspan="8" class="empty-row">Error al conectar con el servidor.</td></tr>`;
    }
}

async function editarEmpleado(id, nombreActual, emailActual) {
    const { value: formValues } = await Swal.fire({
        title: `Editar Colaborador`,
        html: `
            <div style="text-align:left; display:flex; flex-direction:column; gap:12px;">
                <label style="color:#ddd; font-weight:600; font-size:0.9rem;">Nombre Completo:</label>
                <input id="swalEditNombre" class="swal2-input" style="margin:0; width:100%; box-sizing:border-box;" value="${escHtml(nombreActual)}" placeholder="Nombre del colaborador">
                
                <label style="color:#ddd; font-weight:600; font-size:0.9rem;">Correo Electrónico:</label>
                <input id="swalEditEmail" type="email" class="swal2-input" style="margin:0; width:100%; box-sizing:border-box;" value="${escHtml(emailActual)}" placeholder="Correo electrónico">
                
                <label style="color:#ddd; font-weight:600; font-size:0.9rem;">Nueva Contraseña (opcional):</label>
                <input id="swalEditPassword" type="password" class="swal2-input" style="margin:0; width:100%; box-sizing:border-box;" placeholder="Dejar en blanco para no cambiar">
            </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Guardar Cambios',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            const nombre = document.getElementById('swalEditNombre').value.trim();
            const email = document.getElementById('swalEditEmail').value.trim();
            const password = document.getElementById('swalEditPassword').value;

            if (!nombre || !email) {
                Swal.showValidationMessage('Nombre y Correo son requeridos');
                return false;
            }
            if (password && password.length < 6) {
                Swal.showValidationMessage('La contraseña debe tener al menos 6 caracteres');
                return false;
            }
            return { nombre, email, password };
        }
    });

    if (!formValues) return;

    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_EMPLEADOS_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formValues)
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);

        Swal.fire({
            icon: 'success',
            title: '¡Colaborador Actualizado!',
            text: data.message,
            timer: 2000,
            showConfirmButton: false
        });
        cargarEmpleados();
    } catch (err) {
        Swal.fire('Error', 'No se pudo actualizar el colaborador: ' + err.message, 'error');
    }
}

async function eliminarEmpleado(id, nombre) {
    const result = await Swal.fire({
        title: '¿Eliminar Colaborador?',
        html: `¿Estás seguro de eliminar permanentemente a <strong>${escHtml(nombre)}</strong>?<br><br><span style="color:#ef4444; font-size:0.9rem;">Esta acción eliminará al usuario y todo su historial de progreso en la plataforma.</span>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#4b5563',
        confirmButtonText: 'Sí, Eliminar Permanentemente',
        cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_EMPLEADOS_URL}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);

        Swal.fire({
            icon: 'success',
            title: '¡Eliminado!',
            text: data.message,
            timer: 2000,
            showConfirmButton: false
        });
        cargarEmpleados();
    } catch (err) {
        Swal.fire('Error', 'No se pudo eliminar el colaborador: ' + err.message, 'error');
    }
}

async function toggleEstadoEmpleado(id, nombre, estadoActual) {
    const nuevoEstado = estadoActual ? 0 : 1;
    const textoAccion = nuevoEstado === 1 ? 'activar' : 'desactivar';

    const result = await Swal.fire({
        title: `¿${nuevoEstado === 1 ? 'Activar' : 'Desactivar'} Colaborador?`,
        html: `¿Deseas ${textoAccion} el acceso de <strong>${escHtml(nombre)}</strong> al sistema?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: nuevoEstado === 1 ? '#16a34a' : '#d97706',
        cancelButtonColor: '#4b5563',
        confirmButtonText: `Sí, ${textoAccion}`,
        cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_EMPLEADOS_URL}/${id}/estado`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ activo: nuevoEstado })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);

        Swal.fire({
            icon: 'success',
            title: '¡Estado Actualizado!',
            text: data.message,
            timer: 2000,
            showConfirmButton: false
        });
        cargarEmpleados();
    } catch (err) {
        Swal.fire('Error', 'No se pudo actualizar el estado: ' + err.message, 'error');
    }
}

async function cambiarPasswordEmpleado(id, nombre) {
    const { value: nuevaPassword } = await Swal.fire({
        title: `Cambiar Contraseña de ${nombre}`,
        input: 'text',
        inputLabel: 'Ingresa la nueva contraseña para el colaborador (mínimo 6 caracteres):',
        inputPlaceholder: 'Escribe la nueva contraseña...',
        showCancelButton: true,
        confirmButtonText: 'Guardar Contraseña',
        cancelButtonText: 'Cancelar',
        inputValidator: (val) => {
            if (!val || val.length < 6) {
                return 'La contraseña debe tener al menos 6 caracteres';
            }
        }
    });

    if (!nuevaPassword) return;

    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_EMPLEADOS_URL}/cambiar-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ usuario_id: id, nueva_password: nuevaPassword })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);

        Swal.fire({
            icon: 'success',
            title: '¡Contraseña Actualizada!',
            html: `La contraseña para <strong>${nombre}</strong> se cambió con éxito a:<br><br><code style="font-size:1.2rem;color:#D4AF37;background:#000;padding:8px 16px;border-radius:6px;display:inline-block;">${escHtml(nuevaPassword)}</code>`,
            confirmButtonText: 'Entendido'
        });
    } catch (err) {
        Swal.fire('Error', 'No se pudo cambiar la contraseña: ' + err.message, 'error');
    }
}

async function autorizarEmpleado(id, nombre) {
    const result = await Swal.fire({
        title: '¿Autorizar Ingreso?',
        html: `¿Estás seguro de autorizar el ingreso del colaborador <strong>${nombre}</strong>?<br><br>Se le concederá acceso completo a los módulos de administración de la tienda.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#D4AF37',
        cancelButtonColor: '#4b5563',
        confirmButtonText: 'Sí, Autorizar Ingreso',
        cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_EMPLEADOS_URL}/autorizar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ usuario_id: id })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);

        Swal.fire({
            icon: 'success',
            title: '¡Colaborador Autorizado!',
            text: data.message,
            timer: 2500,
            showConfirmButton: false
        });

        cargarEmpleados();
    } catch (err) {
        Swal.fire('Error', 'No se pudo autorizar al empleado: ' + err.message, 'error');
    }
}

async function reiniciarIntentosEmpleado(id, nombre) {
    const result = await Swal.fire({
        title: '¿Reiniciar Intentos?',
        text: `¿Deseas reiniciar los intentos de examen y restablecer el estado de ${nombre}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, Reiniciar',
        cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_EMPLEADOS_URL}/reiniciar-intentos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ usuario_id: id })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);

        Swal.fire('Reiniciado', data.message, 'success');
        cargarEmpleados();
    } catch (err) {
        Swal.fire('Error', 'No se pudieron reiniciar los intentos: ' + err.message, 'error');
    }
}

function registrarEventosEmpleados() {
    const btnNuevo = document.getElementById('btnNuevoEmpleado');
    const formBox = document.getElementById('formRegistrarEmpleado');
    const btnCancelar = document.getElementById('btnCancelarRegistroEmpleado');
    const formSubmit = document.getElementById('formEmpleadoSubmit');

    if (btnNuevo && formBox) {
        btnNuevo.addEventListener('click', () => {
            formBox.classList.remove('hidden');
        });
    }
    if (btnCancelar && formBox) {
        btnCancelar.addEventListener('click', () => {
            formBox.classList.add('hidden');
        });
    }

    if (formSubmit) {
        formSubmit.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nombre = document.getElementById('empNombre').value.trim();
            const email = document.getElementById('empEmail').value.trim();
            const password = document.getElementById('empPassword').value.trim();
            const telefono = document.getElementById('empTelefono').value.trim();

            const token = localStorage.getItem('token');
            try {
                const res = await fetch(`${API_EMPLEADOS_URL}/registrar`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ nombre, email, password, telefono })
                });
                const data = await res.json();
                if (!data.success) throw new Error(data.message);

                formBox.classList.add('hidden');
                formSubmit.reset();

                const htmlMessage = `
                    El colaborador <strong>${nombre}</strong> fue registrado con éxito.<br><br>
                    <div style="background:#0a0a0a; border:1px solid #D4AF37; padding:14px; border-radius:8px; text-align:left; margin:10px 0; font-size:0.95rem;">
                        <strong style="color:#D4AF37;">Credenciales del Empleado:</strong><br>
                        📧 <strong>Usuario:</strong> <code>${escHtml(email)}</code><br>
                        🔑 <strong>Contraseña:</strong> <code style="color:#D4AF37; font-weight:bold; font-size:1.1rem;">${escHtml(password)}</code>
                    </div>
                `;

                if (data.data && data.data.whatsapp_url) {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Empleado Registrado!',
                        html: htmlMessage + `
                            <p style="color:#aaa; font-size:0.85rem; margin-top:12px;">Se ha generado el mensaje predeterminado con las credenciales, link y contexto de la inducción para enviar por WhatsApp.</p>
                            <div style="margin-top:16px;">
                                <a href="${escHtml(data.data.whatsapp_url)}" target="_blank" class="swal2-confirm swal2-styled" style="background-color:#25D366; text-decoration:none; display:inline-flex; align-items:center; gap:8px; padding:10px 20px; border-radius:6px; font-weight:600; color:#fff;">
                                    <i class="fab fa-whatsapp" style="font-size:1.2rem;"></i> Abrir WhatsApp (Nueva Pestaña)
                                </a>
                            </div>
                        `,
                        showConfirmButton: false,
                        showCancelButton: true,
                        cancelButtonText: 'Cerrar'
                    });
                } else {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Empleado Registrado!',
                        html: htmlMessage,
                        confirmButtonText: 'Entendido'
                    });
                }

                cargarEmpleados();
            } catch (err) {
                Swal.fire('Error', 'No se pudo registrar al empleado: ' + err.message, 'error');
            }
        });
    }
}

window.autorizarEmpleado = autorizarEmpleado;
window.reiniciarIntentosEmpleado = reiniciarIntentosEmpleado;
window.cambiarPasswordEmpleado = cambiarPasswordEmpleado;
