document.addEventListener('DOMContentLoaded', function() {
    // Detectar entorno y definir URL base
    const base = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
        ? 'http://localhost:3000/api'
        : 'https://altadensidadpage-production.up.railway.app/api';
    const API_TOP10_URL = base + '/top10';
    const productGrid = document.getElementById('productGrid');

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
        productsToShow.forEach(product => {
            const stars = '★'.repeat(product.rating || 5) + '☆'.repeat(5 - (product.rating || 5));
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <div class="product-image">
                    <img src="${product.imagen || product.image}" alt="${product.nombre || product.name}">
                </div>
                <div class="product-info">
                    <div class="product-name">${product.nombre || product.name}</div>
                    <div class="product-rating">${stars}</div>
                    <div class="product-category">${product.descripcion || product.description || ''}</div>
                </div>
            `;
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