const API_URL = 'http://localhost:3000/api/productos';
const API_ENVASES_URL = 'http://localhost:3000/api/envases';
const API_UPLOAD_URL = 'http://localhost:3000/api/upload';

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

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    cargarEnvases();
    registrarEventos();
    registrarEventosEnvases();
});

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
        tbodyProductos.innerHTML = `<tr><td colspan="9" class="empty-row"><i class="fas fa-exclamation-circle"></i> No se pudo conectar con el servidor.</td></tr>`;
    }
}

// ============================
// RENDER TABLA
// ============================
function renderTabla() {
    const total     = productos.length;
    const totalPags = Math.ceil(total / ITEMS_PROD);
    if (paginaProductos > totalPags && totalPags > 0) paginaProductos = totalPags;
    const inicio = (paginaProductos - 1) * ITEMS_PROD;
    const pagina = productos.slice(inicio, inicio + ITEMS_PROD);

    if (total === 0) {
        tbodyProductos.innerHTML = `<tr><td colspan="9" class="empty-row"><i class="fas fa-box-open"></i><br>No hay productos en el catálogo.</td></tr>`;
        document.getElementById('paginacionProductos').innerHTML = '';
        return;
    }

    tbodyProductos.innerHTML = pagina.map(p => `
        <tr>
            <td>${p.id}</td>
            <td>${imagenCell(p.image)}</td>
            <td><strong>${escHtml(p.name)}</strong></td>
            <td>${escHtml(p.category)}</td>
            <td>${escHtml(p.gender)}</td>
            <td>${formatPrecio(p.price)}</td>
            <td><span class="stars">${'★'.repeat(p.rating)}${'☆'.repeat(5 - p.rating)}</span></td>
            <td>${(p.sizes || []).map(t => `<span class="tag">${escHtml(t)}</span>`).join('')}</td>
            <td>
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

        const method  = id ? 'PUT' : 'POST';
        const url     = id ? `${API_URL}/${id}` : API_URL;
        const res     = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...payload, image: imagenFinal })
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
function cambiarSeccion(seccion) {
    const esProd = seccion === 'productos';
    document.getElementById('seccionProductos').classList.toggle('hidden', !esProd);
    document.getElementById('seccionEnvases').classList.toggle('hidden', esProd);
    document.getElementById('tabProductos').classList.toggle('active', esProd);
    document.getElementById('tabEnvases').classList.toggle('active', !esProd);
}

// ============================
// ENVASES — CARGAR
// ============================
async function cargarEnvases() {
    const tbody = document.getElementById('tbodyEnvases');
    tbody.innerHTML = `<tr><td colspan="7" class="loading-row"><i class="fas fa-spinner fa-spin"></i> Cargando envases...</td></tr>`;
    try {
        const res  = await fetch(API_ENVASES_URL);
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        envases = data.data;
        renderTablaEnvases();
    } catch (err) {
        mostrarAlerta('Error al cargar envases: ' + err.message, 'error');
        tbody.innerHTML = `<tr><td colspan="7" class="empty-row"><i class="fas fa-exclamation-circle"></i> No se pudo conectar con el servidor.</td></tr>`;
    }
}

// ============================
// ENVASES — RENDER TABLA
// ============================
function renderTablaEnvases() {
    const tbody     = document.getElementById('tbodyEnvases');
    const total     = envases.length;
    const totalPags = Math.ceil(total / ITEMS_ENV);
    if (paginaEnvases > totalPags && totalPags > 0) paginaEnvases = totalPags;
    const inicio = (paginaEnvases - 1) * ITEMS_ENV;
    const pagina = envases.slice(inicio, inicio + ITEMS_ENV);

    if (total === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="empty-row"><i class="fas fa-box-open"></i><br>No hay envases registrados.</td></tr>`;
        document.getElementById('paginacionEnvases').innerHTML = '';
        return;
    }
    tbody.innerHTML = pagina.map(e => `
        <tr>
            <td>${e.id}</td>
            <td>${imagenCell(e.image)}</td>
            <td><strong>${escHtml(e.name)}</strong></td>
            <td>${escHtml(e.material)}</td>
            <td>${formatPrecio(e.price)}</td>
            <td>${(e.sizes || []).map(t => `<span class="tag">${escHtml(t)}</span>`).join('')}</td>
            <td>
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

            const method = id ? 'PUT' : 'POST';
            const url    = id ? `${API_ENVASES_URL}/${id}` : API_ENVASES_URL;
            const res    = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: nombre, description: descripcion, material, price: precio, image: imagenFinalEnv, sizes })
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
    tbodyProductos.innerHTML = `<tr><td colspan="9" class="loading-row"><i class="fas fa-spinner fa-spin"></i> Cargando productos...</td></tr>`;
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
