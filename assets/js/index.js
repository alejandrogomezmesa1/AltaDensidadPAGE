document.addEventListener('DOMContentLoaded', async function() {
        // ============================
        // KITS DINÁMICOS
        // ============================
        async function cargarKitsPublico() {
            const kitsGrid = document.getElementById('kitsGrid');
            if (!kitsGrid) return;
            kitsGrid.innerHTML = '<div style="color:#aaa;padding:2rem;">Cargando kits...</div>';
            try {
                const base = (location.hostname === 'localhost' || location.hostname === '127.0.0.1') ? 'http://localhost:3000/api' : 'https://altadensidadpage-production.up.railway.app/api';
                const res = await fetch(`${base}/kits`);
                const data = await res.json();
                if (!data.success) throw new Error(data.message);
                const kits = data.data.filter(k => k.activo !== 0);
                // Guardar globalmente para paginación
                window.kitsPublicos = kits;
                window.kitsPaginaActual = 1;
                window.KITS_POR_PAGINA = 6;
                if (!kits.length) {
                    kitsGrid.innerHTML = '<div style="color:#aaa;padding:2rem;">No hay kits disponibles.</div>';
                    return;
                }
                // Render inicial con paginación
                renderKits(kits);
            } catch (err) {
                kitsGrid.innerHTML = '<div style="color:#c0392b;padding:2rem;">Error al cargar los kits.</div>';
            }
        }

        // RENDER KITS CON PAGINACIÓN
        function renderKits(kitsArray) {
            const grid = document.getElementById('kitsGrid');
            const pagina = window.kitsPaginaActual || 1;
            const perPage = window.KITS_POR_PAGINA || 6;
            const total = kitsArray.length;
            const totalPaginas = Math.max(1, Math.ceil(total / perPage));
            if (pagina > totalPaginas) window.kitsPaginaActual = 1;
            const inicio = (pagina - 1) * perPage;
            const fin = inicio + perPage;
            const slice = kitsArray.slice(inicio, fin);

            grid.innerHTML = '';
                slice.forEach(kit => {
                    const kitId = `kit_${kit.id || kit._id}`;
                    const card = document.createElement('div');
                    card.className = 'product-card kit-card-enhanced';
                    card.innerHTML = `
                        <div class="product-image">
                            <img src="${kit.imagen}" alt="${kit.nombre}">
                        </div>
                        <div class="product-info">
                            <div class="product-name">${kit.nombre}</div>
                            <div class="kit-tag">Colección Kit Especial</div>
                            <div class="kit-benefits-mini">
                                ${(kit.beneficios||[]).slice(0, 3).map(b=>`<span><i class="fas fa-check"></i> ${b}</span>`).join('')}
                            </div>
                            <div class="product-price">$${Number(kit.precio).toLocaleString('es-CO')} COP</div>
                        </div>
                        <button class="btn-agregar-carrito kit-add-btn" type="button" 
                            onclick='event.stopPropagation(); agregarAlCarrito(${JSON.stringify({id: kitId, name: kit.nombre, image: kit.imagen, price: kit.precio})})'>
                            <i class="fas fa-cart-plus"></i> <span>Agregar al Carrito</span>
                        </button>
                    `;
                    // Abrir modal al hacer click en la tarjeta completa
                    card.addEventListener('click', (e) => { if (e.target.closest('.kit-add-btn')) return; abrirModalKitPublico(kit); });
                    grid.appendChild(card);
                });

            // Rellenar con placeholders para mantener grid consistente (dos filas de 3)
            // Rellenar con placeholders para mantener grid consistente
            const cols = window.innerWidth > 1100 ? 4 : window.innerWidth > 768 ? 3 : 2;
            const resto = slice.length % cols;
            if (resto !== 0) {
                for (let i = 0; i < cols - resto; i++) {
                    const ph = document.createElement('div');
                    ph.className = 'product-card-placeholder';
                    grid.appendChild(ph);
                }
            }

            renderKitsPaginacion(total);
        }

        function renderKitsPaginacion(totalItems) {
            const cont = document.getElementById('kitsPaginacion');
            const perPage = window.KITS_POR_PAGINA || 6;
            const totalPaginas = Math.max(1, Math.ceil(totalItems / perPage));
            const pagina = window.kitsPaginaActual || 1;
            if (totalPaginas <= 1) { cont.innerHTML = ''; return; }

            let html = '';
            html += `<button class="pag-btn ${pagina === 1 ? 'pag-disabled' : ''}" onclick="cambiarPaginaKits(${pagina - 1})" ${pagina === 1 ? 'disabled' : ''}><i class='fas fa-chevron-left'></i></button>`;

            for (let p = 1; p <= totalPaginas; p++) {
                html += `<button class="pag-btn ${p === pagina ? 'pag-active' : ''}" onclick="cambiarPaginaKits(${p})">${p}</button>`;
            }

            html += `<button class="pag-btn ${pagina === totalPaginas ? 'pag-disabled' : ''}" onclick="cambiarPaginaKits(${pagina + 1})" ${pagina === totalPaginas ? 'disabled' : ''}><i class='fas fa-chevron-right'></i></button>`;
            cont.innerHTML = html;
        }

        // Exponer función para controles
        window.cambiarPaginaKits = function(p) {
            const total = (window.kitsPublicos || []).length;
            const totalPaginas = Math.max(1, Math.ceil(total / (window.KITS_POR_PAGINA || 6)));
            if (p < 1 || p > totalPaginas) return;
            window.kitsPaginaActual = p;
            renderKits(window.kitsPublicos || []);
            
            // Scroll suave hasta el inicio de los Kits
            const kitsSection = document.getElementById('kitsGrid');
            if (kitsSection) {
                const headerOffset = 100;
                const elementPosition = kitsSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            }
        };

        // Modal de detalles de kit
        function abrirModalKitPublico(kit) {
            let modal = document.getElementById('kitModalPublico');
            const kitId = `kit_${kit.id || kit._id}`;
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'kitModalPublico';
                modal.className = 'prod-modal-overlay';
                modal.innerHTML = `
                    <div class="prod-modal">
                        <button class="prod-modal-close" id="cerrarKitModalPublico">&times;</button>
                        <div class="prod-modal-body">
                            <div class="prod-modal-img"><img id="kitModalImg" src="" alt="Kit"></div>
                            <div class="prod-modal-info">
                                <div class="prod-modal-badge">Kit</div>
                                <h2 class="prod-modal-nombre" id="kitModalNombre"></h2>
                                <div class="prod-modal-desc" id="kitModalDesc"></div>
                                <div class="prod-modal-tags-group" id="kitModalBeneficios"></div>
                                <div class="prod-modal-footer">
                                    <div class="prod-modal-precio" id="kitModalPrecio"></div>
                                    <button id="kitModalAgregar" class="prod-modal-btn">
                                        <i class="fas fa-cart-plus"></i> Agregar al carrito
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);
                modal.querySelector('#cerrarKitModalPublico').onclick = cerrarModalKitPublico;
                modal.addEventListener('click', (e) => { if (e.target === modal) cerrarModalKitPublico(); });
                document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrarModalKitPublico(); });
            }
            document.getElementById('kitModalImg').src = kit.imagen;
            document.getElementById('kitModalImg').alt = kit.nombre;
            document.getElementById('kitModalNombre').textContent = kit.nombre;
            document.getElementById('kitModalDesc').textContent = kit.descripcion || 'Sin descripción disponible.';
            document.getElementById('kitModalPrecio').textContent = `$${Number(kit.precio).toLocaleString('es-CO')} COP`;
            const beneficios = kit.beneficios || [];
            document.getElementById('kitModalBeneficios').innerHTML = beneficios.length ? `<span class='prod-tag-label'>Beneficios:</span> ` + beneficios.map(b => `<span class='prod-tag'>${b}</span>`).join('') : '';
            
            // Vincular botón agregar
            document.getElementById('kitModalAgregar').onclick = () => {
                agregarAlCarrito({
                    id: kitId,
                    name: kit.nombre,
                    image: kit.imagen,
                    price: kit.precio
                });
            };

            aplicarTemaModal(modal);
            modal.classList.add('open');
            document.body.style.overflow = 'hidden';
        }

        function cerrarModalKitPublico() {
            const modal = document.getElementById('kitModalPublico');
            if (modal) {
                modal.classList.remove('open');
                document.body.style.overflow = '';
            }
        }

        // Datos de productos cargados desde la API
        let products = [];
        let productosFiltrados = [];

        const ITEMS_POR_PAGINA = 12;
        let paginaActual = 1;

        const MARCAS_RECONOCIDAS = [
            'CAROLINA HERRERA', 'LATTAFA', 'PACO RABANNE', 'VERSACE', 'DIOR', 'CHANEL', 
            'HUGO BOSS', 'LACOSTE', 'ARMAF', 'LOUIS VUITTON', 'ORIENTICA', 'AFNAN', 
            'PERRY ELLIS', 'VICTORINOX', 'AL HARAMAIN', 'MONTALE', 'BHARARA', 'BOND N*9', 
            'VALENTINO', 'PARIS HILTON', 'ARIANA GRANDE', 'BVLGARI', 'XERJOFF', 'GIORGIO ARMANI',
            'YVES SAINT LAURENT', 'CALVIN KLEIN', 'JEAN PAUL GAULTIER', 'DOLCE & GABBANA',
            'CREED', 'TOM FORD', 'HERMES', 'ROJA DOVE', 'NISHANE', 'MANCERA', 'INITIO'
        ];

        function extraerMarca(nombre) {
            if (!nombre) return 'Otras Marcas';
            const nombreUpper = nombre.toUpperCase();
            for (const marca of MARCAS_RECONOCIDAS) {
                if (nombreUpper.includes(marca)) return marca;
            }
            const palabras = nombre.split(' ');
            if (palabras.length > 1) {
                const ultima = palabras[palabras.length - 1].toUpperCase();
                if (ultima.length > 3) return ultima;
            }
            return 'Otras Marcas';
        }

        try {
            const base = (location.hostname === 'localhost' || location.hostname === '127.0.0.1') ? 'http://localhost:3000/api' : 'https://altadensidadpage-production.up.railway.app/api';
            const res = await fetch(`${base}/productos`);
            const data = await res.json();
            if (data.success) {
                products = data.data.filter(p => p.activo !== 0);
                productosFiltrados = products;
                populateBrandFilter();
            }
        } catch (e) {
            console.error('Error al cargar productos desde la API:', e);
        }

        function populateBrandFilter() {
            const filterBrand = document.getElementById('filterBrand');
            if (!filterBrand) return;
            
            // Extraer todas las marcas únicas
            const marcas = new Set();
            products.forEach(p => {
                marcas.add(extraerMarca(p.name));
            });
            
            // Ordenar y añadir al select
            const sorted = Array.from(marcas).sort();
            sorted.forEach(m => {
                if (m === 'Otras Marcas') return;
                const opt = document.createElement('option');
                opt.value = m;
                opt.textContent = m;
                filterBrand.appendChild(opt);
            });
            // Al final poner Otras Marcas
            if (marcas.has('Otras Marcas')) {
                const opt = document.createElement('option');
                opt.value = 'Otras Marcas';
                opt.textContent = 'Otras Marcas';
                filterBrand.appendChild(opt);
            }
        }

        // ============================
        // RENDER PRODUCTOS (Catalogo)
        // ============================
        function displayProducts(productsToShow, shouldScroll = false) {
            const productGrid = document.getElementById('productGrid');
            if (!productGrid) return;
            
            // ORDENAR POR MARCA Y LUEGO POR NOMBRE
            productsToShow.sort((a, b) => {
                const marcaA = extraerMarca(a.name);
                const marcaB = extraerMarca(b.name);
                
                // Primero por marca
                if (marcaA < marcaB) return -1;
                if (marcaA > marcaB) return 1;
                
                // Si es la misma marca, por nombre
                return a.name.localeCompare(b.name);
            });

            const totalPaginas = Math.ceil(productsToShow.length / ITEMS_POR_PAGINA);
            if (paginaActual > totalPaginas) paginaActual = 1;

            const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
            const fin    = inicio + ITEMS_POR_PAGINA;
            const pagina = productsToShow.slice(inicio, fin);

            if (pagina.length === 0) {
                productGrid.innerHTML = `<div class="empty-row"><i class='fas fa-search'></i> No se encontraron productos con esos filtros.</div>`;
                document.getElementById('paginacion').innerHTML = '';
                return;
            }

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
                        <div class="product-price">$${Number(product.price).toLocaleString('es-CO')} COP</div>
                    </div>
                    <button class="btn-agregar-carrito"
                        onclick='event.stopPropagation(); agregarAlCarrito(${JSON.stringify({id: product.id, name: product.name, image: product.image, price: product.price})})'>
                        <i class="fas fa-cart-plus"></i> Agregar
                    </button>
                `;
                productCard.addEventListener('click', (e) => {
                    if (e.target.closest('.btn-agregar-carrito')) return;
                    abrirModalProducto(product);
                });
                productGrid.appendChild(productCard);
            });

            // Rellenar última fila con placeholders para evitar espacios en blanco
            const cols = window.innerWidth > 1100 ? 4 : window.innerWidth > 768 ? 3 : 2;
            const resto = pagina.length % cols;
            if (resto !== 0) {
                for (let i = 0; i < cols - resto; i++) {
                    const ph = document.createElement('div');
                    ph.classList.add('product-card-placeholder');
                    productGrid.appendChild(ph);
                }
            }

            const countEl = document.getElementById('productCount');
            if (countEl) countEl.textContent = `Resultados encontrados: ${productsToShow.length}`;

            renderPaginacion(productsToShow.length);

            // Scroll suave solo si se solicita (por ejemplo, al cambiar de página)
            if (shouldScroll && productGrid && productsToShow.length > 0) {
                const headerOffset = 120;
                const elementPosition = productGrid.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                if (Math.abs(elementPosition) > 150) {
                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                }
            }
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
            displayProducts(productosFiltrados, true);
        };

        // ============================
        // FILTROS
        // ============================
        function filterProducts() {
            const name     = document.getElementById('filterName').value.toLowerCase();
            const category = document.getElementById('filterCategory').value;
            const gender   = document.getElementById('filterGender').value;
            const brand    = document.getElementById('filterBrand').value;

            productosFiltrados = products.filter(product => {
                const pBrand = extraerMarca(product.name);
                const matchesName     = product.name.toLowerCase().includes(name) || pBrand.toLowerCase().includes(name);
                const matchesCategory = !category || product.category === category;
                const matchesGender   = !gender   || product.gender   === gender;
                const matchesBrand    = !brand    || pBrand === brand;

                return matchesName && matchesCategory && matchesGender && matchesBrand;
            });

            paginaActual = 1;
            renderActiveFilters();
            displayProducts(productosFiltrados);
        }

        function renderActiveFilters() {
            const container = document.getElementById('activeFilters');
            if (!container) return;
            container.innerHTML = '';

            const category = document.getElementById('filterCategory').value;
            const gender   = document.getElementById('filterGender').value;
            const brand    = document.getElementById('filterBrand').value;

            if (category) createBadge('Categoría: ' + category, () => { 
                document.getElementById('filterCategory').value = ''; filterProducts(); 
            });
            if (gender) {
                const label = gender === 'Masculino' ? 'Caballero' : (gender === 'Femenino' ? 'Dama' : gender);
                createBadge('Género: ' + label, () => { 
                    document.getElementById('filterGender').value = ''; filterProducts(); 
                });
            }
            if (brand)    createBadge('Marca: ' + brand, () => { 
                document.getElementById('filterBrand').value = ''; filterProducts(); 
            });

            function createBadge(text, onRemove) {
                const badge = document.createElement('div');
                badge.className = 'filter-badge';
                badge.innerHTML = `<span>${text}</span><i class="fas fa-times"></i>`;
                badge.querySelector('i').onclick = onRemove;
                container.appendChild(badge);
            }
        }

        function resetFilters() {
            document.getElementById('filterName').value = '';
            document.getElementById('filterCategory').value = '';
            document.getElementById('filterGender').value = '';
            document.getElementById('filterBrand').value = '';
            productosFiltrados = products;
            paginaActual = 1;
            renderActiveFilters();
            displayProducts(productosFiltrados);
        }

        const btnReset = document.getElementById('resetFilters');
        if (btnReset) btnReset.addEventListener('click', resetFilters);

        const inputName = document.getElementById('filterName');
        if (inputName) inputName.addEventListener('input', filterProducts);

        const selCat = document.getElementById('filterCategory');
        if (selCat) selCat.addEventListener('change', filterProducts);

        const selGen = document.getElementById('filterGender');
        if (selGen) selGen.addEventListener('change', filterProducts);

        const selBrand = document.getElementById('filterBrand');
        if (selBrand) selBrand.addEventListener('change', filterProducts);

        // Filtros manejados dinámicamente en barra lateral


        // ============================
        // MODAL DETALLE PRODUCTO
        // ============================
        const productoModal  = document.getElementById('productoModal');
        const cerrarProdModal = document.getElementById('cerrarProdModal');

        function abrirModalProducto(product) {
            const stars = '★'.repeat(product.rating) + '☆'.repeat(5 - product.rating);
            document.getElementById('prodModalImg').src = product.image;
            document.getElementById('prodModalImg').alt = product.name;
            document.getElementById('prodModalNombre').textContent = product.name;
            document.getElementById('prodModalCategoria').textContent = product.category;
            document.getElementById('prodModalRating').textContent = stars;
            document.getElementById('prodModalGenero').textContent = product.gender ? `Género: ${product.gender}` : '';
            document.getElementById('prodModalDesc').textContent = product.description || 'Sin descripción disponible.';
            document.getElementById('prodModalPrecio').textContent = `$${Number(product.price).toLocaleString('es-CO')} COP`;
            
            // Vincular botón de carrito en el modal
            const btnCarrito = document.getElementById('prodModalCarrito');
            if (btnCarrito) {
                btnCarrito.onclick = () => {
                    agregarAlCarrito({
                        id: product.id,
                        name: product.name,
                        image: product.image,
                        price: product.price
                    });
                };
            }

            const tallasEl = document.getElementById('prodModalTallas');
            if (product.sizes && product.sizes.length) {
                tallasEl.innerHTML = `<span class="prod-tag-label">Tallas:</span>` +
                    product.sizes.map(s => `<span class="prod-tag">${s}</span>`).join('');
            } else {
                tallasEl.innerHTML = '';
            }
            const modal = document.getElementById('productoModal');
            aplicarTemaModal(modal);
            modal.classList.add('open');
            document.body.style.overflow = 'hidden';
        }

        function cerrarModal() {
            productoModal.classList.remove('open');
            document.body.style.overflow = '';
        }

        window.abrirModalProducto = abrirModalProducto;

        cerrarProdModal.addEventListener('click', cerrarModal);
        productoModal.addEventListener('click', (e) => { if (e.target === productoModal) cerrarModal(); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrarModal(); });

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
        cargarKitsPublico();
});

// Utilidad para aplicar tema al modal
function aplicarTemaModal(modal) {
    const esClaro = document.documentElement.classList.contains('modo-claro');
    if (esClaro) {
        modal.classList.add('modal-claro');
        modal.classList.remove('modal-oscuro');
    } else {
        modal.classList.remove('modal-claro');
        modal.classList.add('modal-oscuro');
    }
}
