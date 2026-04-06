// ============================================================
// api.js - Módulo centralizado para llamadas fetch a la API
// Perfumería Alta Densidad
// ============================================================

const API_URL = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
    ? 'http://localhost:3000/api'
    : '/api';

// ============================================================
// PRODUCTOS (Fragancias)
// ============================================================

async function obtenerProductos() {
    const response = await fetch(`${API_URL}/productos`);
    if (!response.ok) throw new Error('Error al obtener productos');
    const json = await response.json();
    return json.data;
}

async function obtenerProductoPorId(id) {
    const response = await fetch(`${API_URL}/productos/${id}`);
    if (!response.ok) throw new Error('Producto no encontrado');
    const json = await response.json();
    return json.data;
}

async function crearProducto(producto) {
    const response = await fetch(`${API_URL}/productos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(producto)
    });
    if (!response.ok) throw new Error('Error al crear producto');
    return await response.json();
}

async function actualizarProducto(id, producto) {
    const response = await fetch(`${API_URL}/productos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(producto)
    });
    if (!response.ok) throw new Error('Error al actualizar producto');
    return await response.json();
}

async function eliminarProducto(id) {
    const response = await fetch(`${API_URL}/productos/${id}`, {
        method: 'DELETE'
    });
    if (!response.ok) throw new Error('Error al eliminar producto');
    return await response.json();
}

// ============================================================
// ENVASES
// ============================================================

async function obtenerEnvases() {
    const response = await fetch(`${API_URL}/envases`);
    if (!response.ok) throw new Error('Error al obtener envases');
    const json = await response.json();
    return json.data;
}

async function crearEnvase(envase) {
    const response = await fetch(`${API_URL}/envases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(envase)
    });
    if (!response.ok) throw new Error('Error al crear envase');
    return await response.json();
}

async function actualizarEnvase(id, envase) {
    const response = await fetch(`${API_URL}/envases/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(envase)
    });
    if (!response.ok) throw new Error('Error al actualizar envase');
    return await response.json();
}

async function eliminarEnvase(id) {
    const response = await fetch(`${API_URL}/envases/${id}`, {
        method: 'DELETE'
    });
    if (!response.ok) throw new Error('Error al eliminar envase');
    return await response.json();
}
