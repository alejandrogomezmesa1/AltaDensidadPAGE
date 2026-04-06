document.addEventListener('DOMContentLoaded', async function() {
    // Datos de productos cargados desde la API
    let products = [];
    let productosFiltrados = [];

    const ITEMS_POR_PAGINA = 12;
    let paginaActual = 1;

    try {
        const base = (location.hostname === 'localhost' || location.hostname === '127.0.0.1') ? 'http://localhost:3000/api' : '/api';
        const res = await fetch(`${base}/productos`);
        const data = await res.json();
        if (data.success) {
            products = data.data;
            productosFiltrados = products;
        }
    } catch (e) {
        console.error('Error al cargar productos desde la API:', e);
    }

    // ============================
    // DISPLAY
    // ============================
    function displayProducts(productsToShow) {
        const productGrid = document.getElementById('productGrid');
        const totalPaginas = Math.ceil(productsToShow.length / ITEMS_POR_PAGINA);
        if (paginaActual > totalPaginas) paginaActual = 1;

        const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
        const fin    = inicio + ITEMS_POR_PAGINA;
        const pagina = productsToShow.slice(inicio, fin);

        productGrid.innerHTML = '';
        pagina.forEach(product => {
            const stars = '★'.repeat(product.rating) + '☆'.repeat(5 - product.rating);
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            productCard.innerHTML = `
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <div class="product-name">${product.name}</div>
                    <div class="product-rating">${stars}</div>
                    <div class="product-category">${product.category}</div>
                </div>
                <button class="btn-agregar-carrito"
                    onclick='agregarAlCarrito(${JSON.stringify({id: product.id, name: product.name, image: product.image, price: product.price})})'>
                    <i class="fas fa-cart-plus"></i> Agregar
                </button>
            `;
            productGrid.appendChild(productCard);
        });

        const countEl = document.getElementById('productCount');
        if (countEl) countEl.textContent = `Resultados encontrados: ${productsToShow.length}`;

        renderPaginacion(productsToShow.length);

        // Scroll suave al inicio del grid al cambiar página
        productGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // ============================
    // PAGINACIÓN
    // ============================
    function renderPaginacion(total) {
        const contenedor   = document.getElementById('paginacion');
        const totalPaginas = Math.ceil(total / ITEMS_POR_PAGINA);

        if (totalPaginas <= 1) { contenedor.innerHTML = ''; return; }

        let html = '';

        // Botón anterior
        html += `<button class="pag-btn ${paginaActual === 1 ? 'pag-disabled' : ''}" 
                    onclick="cambiarPagina(${paginaActual - 1})" 
                    ${paginaActual === 1 ? 'disabled' : ''}>
                    <i class="fas fa-chevron-left"></i>
                 </button>`;

        // Números de página con elipsis
        const rango = paginasVisibles(paginaActual, totalPaginas);
        rango.forEach(p => {
            if (p === '...') {
                html += `<span class="pag-ellipsis">…</span>`;
            } else {
                html += `<button class="pag-btn ${p === paginaActual ? 'pag-active' : ''}" 
                            onclick="cambiarPagina(${p})">${p}</button>`;
            }
        });

        // Botón siguiente
        html += `<button class="pag-btn ${paginaActual === totalPaginas ? 'pag-disabled' : ''}" 
                    onclick="cambiarPagina(${paginaActual + 1})"
                    ${paginaActual === totalPaginas ? 'disabled' : ''}>
                    <i class="fas fa-chevron-right"></i>
                 </button>`;

        contenedor.innerHTML = html;
    }

    function paginasVisibles(actual, total) {
        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
        if (actual <= 4) return [1, 2, 3, 4, 5, '...', total];
        if (actual >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
        return [1, '...', actual - 1, actual, actual + 1, '...', total];
    }

    // Exponer para los onclick del HTML
    window.cambiarPagina = function(pagina) {
        const totalPaginas = Math.ceil(productosFiltrados.length / ITEMS_POR_PAGINA);
        if (pagina < 1 || pagina > totalPaginas) return;
        paginaActual = pagina;
        displayProducts(productosFiltrados);
    };

    // ============================
    // FILTROS
    // ============================
    function filterProducts() {
        const name     = document.getElementById('filterName').value.toLowerCase();
        const category = document.getElementById('filterCategory').value;
        const gender   = document.getElementById('filterGender').value;
        productosFiltrados = products.filter(product => {
            return product.name.toLowerCase().includes(name)
                && (!category || product.category === category)
                && (!gender   || product.gender   === gender);
        });
        paginaActual = 1;
        displayProducts(productosFiltrados);
    }

    function resetFilters() {
        document.getElementById('filterName').value = '';
        document.getElementById('filterCategory').value = '';
        document.getElementById('filterGender').value = '';
        productosFiltrados = products;
        paginaActual = 1;
        if (modal) { modal.style.display = 'none'; }
        displayProducts(productosFiltrados);
    }

    document.getElementById('resetFilters').addEventListener('click', resetFilters);
    document.getElementById('filterName').addEventListener('input', filterProducts);
    document.getElementById('filterCategory').addEventListener('change', filterProducts);
    document.getElementById('filterGender').addEventListener('change', filterProducts);

    // ============================
    // MODAL FILTROS
    // ============================
    const modal    = document.getElementById('filterModal');
    const openBtn  = document.getElementById('openFilters');
    const closeBtn = document.querySelector('.close');
    const applyBtn = document.getElementById('applyFilters');

    openBtn.addEventListener('click', () => { modal.style.display = 'block'; });
    applyBtn.addEventListener('click', () => { modal.style.display = 'none'; });
    closeBtn.addEventListener('click', () => { modal.style.display = 'none'; });
    window.addEventListener('click', (event) => { if (event.target === modal) modal.style.display = 'none'; });

    // ============================
    // SCROLL HEADER
    // ============================
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

    // ============================
    // INICIALIZAR
    // ============================
    displayProducts(productosFiltrados);
});
