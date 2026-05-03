document.addEventListener('DOMContentLoaded', function () {
    // Detectar entorno y definir URL base
    const base = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
        ? 'http://localhost:3000/api'
        : 'https://altadensidadpage-production.up.railway.app/api';
    const API_TOP10_URL = base + '/top10';
    const productGrid = document.getElementById('top10Grid');

    async function cargarTop10() {
        productGrid.innerHTML = '<div class="loading-row"><i class="fas fa-spinner fa-spin"></i> Cargando Top 10...</div>';
        try {
            const res = await fetch(API_TOP10_URL);
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
            mostrarTop10(data.data);
        } catch (err) {
            productGrid.innerHTML = `<div class="empty-row"><i class='fas fa-exclamation-circle'></i> No se pudo cargar el Top 10.</div>`;
        }
    }

    function mostrarTop10(productsToShow) {
        productGrid.innerHTML = '';
        productsToShow.forEach((product, index) => {
            const rank = index + 1;
            const stars = '★'.repeat(product.rating || 5) + '☆'.repeat(5 - (product.rating || 5));
            const productCard = document.createElement('div');
            productCard.className = 'product-card';

            // Preparar objeto para funciones globales
            const itemData = {
                id: product.producto_id || product.id,
                name: product.nombre || product.name,
                image: product.imagen || product.image,
                category: product.categoria || product.category,
                gender: product.genero || product.gender,
                description: product.descripcion || product.description,
                price: product.precio,
                rating: product.rating || 5
            };

            productCard.innerHTML = `
                <div class="product-rank-badge">#${rank}</div>
                <div class="product-image">
                    <img src="${itemData.image}" alt="${itemData.name}">
                </div>
                <div class="product-info">
                    <div class="product-name">${itemData.name}</div>
                    <div class="product-rating">${stars}</div>
                    <div class="product-category">${itemData.category || ''}</div>
                    <div class="product-price">$${Number(itemData.price || 0).toLocaleString('es-CO')} COP</div>
                </div>
                <button class="btn-agregar-carrito" 
                    onclick='event.stopPropagation(); if(window.agregarAlCarrito) window.agregarAlCarrito(${JSON.stringify({ id: itemData.id, name: itemData.name, image: itemData.image, price: itemData.price })})'>
                    <i class="fas fa-cart-plus"></i> Agregar
                </button>
            `;

            productCard.addEventListener('click', (e) => {
                if (e.target.closest('.btn-agregar-carrito')) return;
                if (window.abrirModalProducto) window.abrirModalProducto(itemData);
            });

            productGrid.appendChild(productCard);
        });
        // Rellenar última fila con placeholders para evitar espacios en blanco
        const cols = window.innerWidth > 1100 ? 4 : window.innerWidth > 768 ? 3 : 2;
        const resto = productsToShow.length % cols;
        if (resto !== 0) {
            for (let i = 0; i < cols - resto; i++) {
                const ph = document.createElement('div');
                ph.classList.add('product-card-placeholder');
                productGrid.appendChild(ph);
            }
        }
    }

    cargarTop10();

});

let lastScrollTop = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > lastScrollTop && scrollTop > 80) {
        header.classList.add('header--hidden');
    } else {
        header.classList.remove('header--hidden');
    }
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
});