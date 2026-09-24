document.addEventListener('DOMContentLoaded', function() {
        const CACHE_KEY_PRODUCTS = 'ad_cached_products_v1';
        const CACHE_KEY_KITS = 'ad_cached_kits_v1';

        // ============================
        // KITS DINÁMICOS
        // ============================
        function renderKits(kitsArray) {
            const grid = document.getElementById('kitsGrid');
            if (!grid) return;
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
                        <img src="${kit.imagen}" alt="Kit Especial ${kit.nombre} - Fragancias Alta Densidad" width="280" height="280" loading="lazy" decoding="async">
                    </div>
                    <div class="product-info">
                        <div class="product-name">${kit.nombre}</div>
                        <div class="kit-tag">Colección Kit Especial</div>
                        <div class="kit-benefits-mini">
                            ${(kit.beneficios||[]).slice(0, 3).map(b=>`<span><i class="fas fa-check" aria-hidden="true"></i> ${b}</span>`).join('')}
                        </div>
                        <div class="product-price">$${Number(kit.precio).toLocaleString('es-CO')} COP</div>
                    </div>
                    <button class="btn-agregar-carrito kit-add-btn" type="button" aria-label="Agregar kit ${kit.nombre} al carrito"
                        onclick='event.stopPropagation(); agregarAlCarrito(${JSON.stringify({id: kitId, name: kit.nombre, image: kit.imagen, price: kit.precio})})'>
                        <i class="fas fa-cart-plus" aria-hidden="true"></i> Agregar
                    </button>
                `;
                // Abrir modal al hacer click en la tarjeta completa
                card.addEventListener('click', (e) => { if (e.target.closest('.kit-add-btn')) return; abrirModalKitPublico(kit); });
                grid.appendChild(card);
            });

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
            if (window.ADAnimations) {
                window.ADAnimations.staggerCards('#kitsGrid');
            }
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
        // ============================
        // MULTI-IMAGEN CARD CAROUSEL
        // ============================
        window.cambiarFotoCard = function(btn, delta) {
            const container = btn.closest('.product-image');
            if (!container) return;
            const raw = container.getAttribute('data-images');
            if (!raw) return;
            try {
                const images = JSON.parse(decodeURIComponent(raw));
                if (!images || images.length <= 1) return;
                const img = container.querySelector('.card-main-img');
                if (!img) return;
                let currentIdx = parseInt(img.getAttribute('data-idx') || '0', 10);
                let nextIdx = (currentIdx + delta + images.length) % images.length;
                
                img.style.opacity = '0.4';
                setTimeout(() => {
                    img.src = images[nextIdx];
                    img.setAttribute('data-idx', nextIdx);
                    img.style.opacity = '1';
                }, 120);

                const dots = container.querySelectorAll('.card-dot');
                dots.forEach((dot, idx) => {
                    if (idx === nextIdx) dot.classList.add('active');
                    else dot.classList.remove('active');
                });
            } catch(e) {
                console.error('Error al cambiar imagen:', e);
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
            document.getElementById('kitModalImg').alt = `Kit Especial ${kit.nombre} - Fragancias Alta Densidad`;
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

        // Estado de filtros avanzados e interactivos
        let generoSeleccionado = '';
        let categoriaSeleccionada = '';
        let sensorialSeleccionado = '';
        let marcaSeleccionada = '';
        let ordenActual = 'destacados';

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



        function inyectarSchemaProductos(prods) {
            if (!prods || !prods.length) return;
            let existing = document.getElementById('schema-productos-dinamico');
            if (existing) existing.remove();

            const schemaData = {
                "@context": "https://schema.org",
                "@type": "ItemList",
                "name": "Catálogo de Perfumes y Fragancias de Alta Densidad",
                "numberOfItems": prods.length,
                "itemListElement": prods.map((p, idx) => ({
                    "@type": "ListItem",
                    "position": idx + 1,
                    "item": {
                        "@type": "Product",
                        "name": p.name,
                        "image": p.image ? (p.image.startsWith('http') ? p.image : `https://alta-densidad-page.vercel.app/${p.image}`) : undefined,
                        "description": p.description || `Perfume ${p.name} con alta concentración y fijación prolongada.`,
                        "category": p.category || "Perfumería",
                        "brand": {
                            "@type": "Brand",
                            "name": "Alta Densidad"
                        },
                        "offers": {
                            "@type": "Offer",
                            "priceCurrency": "COP",
                            "price": Number(p.price || 0),
                            "availability": p.activo !== 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                            "url": "https://alta-densidad-page.vercel.app/"
                        }
                    }
                }))
            };

            const script = document.createElement('script');
            script.id = 'schema-productos-dinamico';
            script.type = 'application/ld+json';
            script.textContent = JSON.stringify(schemaData);
            document.head.appendChild(script);
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
            
            // Ordenar productos según el criterio activo
            switch (ordenActual) {
                case 'precio-asc':
                    productsToShow.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
                    break;
                case 'precio-desc':
                    productsToShow.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
                    break;
                case 'nombre-asc':
                    productsToShow.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                    break;
                case 'destacados':
                default:
                    // Por marca y luego nombre
                    productsToShow.sort((a, b) => {
                        const marcaA = extraerMarca(a.name);
                        const marcaB = extraerMarca(b.name);
                        if (marcaA < marcaB) return -1;
                        if (marcaA > marcaB) return 1;
                        return (a.name || '').localeCompare(b.name || '');
                    });
                    break;
            }

            const totalPaginas = Math.ceil(productsToShow.length / ITEMS_POR_PAGINA);
            if (paginaActual > totalPaginas) paginaActual = 1;

            const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
            const fin    = inicio + ITEMS_POR_PAGINA;
            const pagina = productsToShow.slice(inicio, fin);

            if (pagina.length === 0) {
                productGrid.innerHTML = `
                    <div class="no-products-luxury">
                        <div class="no-products-icon"><i class="fas fa-compass"></i></div>
                        <h3>No encontramos fragancias con esos filtros</h3>
                        <p>Prueba combinando otras notas olfativas o pregúntale a AURA IA para recibir una recomendación a tu medida.</p>
                        <div class="no-products-actions">
                            <button type="button" class="btn-clear-empty" onclick="window.adResetFilters()">Restablecer filtros</button>
                            <button type="button" class="btn-ask-aura" onclick="window.adConsultarAuraFiltros()"><i class="fas fa-magic"></i> Consultar con AURA IA</button>
                        </div>
                    </div>
                `;
                document.getElementById('paginacion').innerHTML = '';
                return;
            }

            productGrid.innerHTML = '';
            
            pagina.forEach(product => {
                const stars = '★'.repeat(product.rating) + '☆'.repeat(5 - product.rating);
                const productCard = document.createElement('div');
                productCard.classList.add('product-card');
                const altText = `Perfume ${product.name} - Fragancia Alta Concentración ${product.gender ? '(' + product.gender + ')' : ''}`;
                
                const imgList = (Array.isArray(product.images) && product.images.length > 0)
                    ? product.images
                    : (product.image ? [product.image] : ['assets/img/placeholder.jpg']);
                const hasMultiple = imgList.length > 1;
                const encodedImages = encodeURIComponent(JSON.stringify(imgList));
                
                const arrowsHtml = hasMultiple ? `
                    <button class="card-img-arrow card-img-prev" aria-label="Foto anterior" onclick="event.stopPropagation(); window.cambiarFotoCard(this, -1);">
                        <i class="fas fa-chevron-left" aria-hidden="true"></i>
                    </button>
                    <button class="card-img-arrow card-img-next" aria-label="Foto siguiente" onclick="event.stopPropagation(); window.cambiarFotoCard(this, 1);">
                        <i class="fas fa-chevron-right" aria-hidden="true"></i>
                    </button>
                    <div class="card-img-indicators">
                        ${imgList.map((_, i) => `<span class="card-dot ${i === 0 ? 'active' : ''}"></span>`).join('')}
                    </div>
                ` : '';

                productCard.innerHTML = `
                    <div class="product-image" data-images="${encodedImages}">
                        <img class="card-main-img" data-idx="0" src="${imgList[0]}" alt="${altText}" width="280" height="280" loading="lazy" decoding="async">
                        ${arrowsHtml}
                    </div>
                    <div class="product-info">
                        <div class="product-name">${product.name}</div>
                        <div class="product-rating">${stars}</div>
                        <div class="product-category">${product.category}</div>
                        <div class="product-price">$${Number(product.price).toLocaleString('es-CO')} COP</div>
                    </div>
                    <button class="btn-agregar-carrito" aria-label="Agregar ${product.name} al carrito"
                        onclick='event.stopPropagation(); agregarAlCarrito(${JSON.stringify({id: product.id, name: product.name, image: imgList[0], price: product.price})})'>
                        <i class="fas fa-cart-plus" aria-hidden="true"></i> Agregar
                    </button>
                `;
                productCard.addEventListener('click', (e) => {
                    if (e.target.closest('.btn-agregar-carrito') || e.target.closest('.card-img-arrow')) return;
                    window.location.href = `producto.html?id=${encodeURIComponent(product.id)}`;
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
            if (window.ADAnimations) {
                window.ADAnimations.staggerCards('#productGrid');
            }

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

        // ==========================================================================
        // SISTEMA DE FILTROS INTERACTIVOS Y BÚSQUEDA SENSORIAL
        // ==========================================================================
        const SENSORY_KEYWORDS = {
            amaderada: ['amaderado', 'amaderada', 'madera', 'cedro', 'sandalo', 'sándalo', 'cuero', 'tabaco', 'oud', 'pimienta', 'especiada', 'especias', 'vetiver', 'pachuli', 'pachulí', 'palisandro', 'incienso', 'sauvage', 'club de nuit'],
            citrica: ['citrico', 'cítrico', 'citrica', 'cítrica', 'fresco', 'frescura', 'limon', 'limón', 'bergamota', 'mandarina', 'naranja', 'marino', 'acuatico', 'acuático', 'lavanda', 'menta', 'pomelo', 'toronja', 'acqua', 'eros', 'invictus', 'light blue'],
            dulce: ['dulce', 'dulzura', 'vainilla', 'caramelo', 'cafe', 'café', 'chocolate', 'miel', 'tonka', 'haba tonka', 'praline', 'praliné', 'azucar', 'azúcar', 'gourmand', 'almendra', 'canela', 'coco', 'one million', 'good girl', 'khamrah', 'yara'],
            floral: ['floral', 'flores', 'rosa', 'jazmin', 'jazmín', 'frutal', 'manzana', 'pera', 'durazno', 'frutos rojos', 'orquidea', 'orquídea', 'lirio', 'peonía', 'violeta', 'magnolia', 'azahar', 'bright crystal', 'idole', 'idôle', 'thank u next'],
            noche: ['noche', 'nocturno', 'fiesta', 'seduccion', 'seducción', 'seductor', 'intenso', 'intensa', 'potente', 'presencia', 'elegante', 'misterio', 'feromona', 'feromonas', 'oriental', 'oud', 'cuero', 'ambar', 'ámbar'],
            diario: ['diario', 'oficina', 'versatil', 'versátil', 'fresco', 'limpio', 'limpia', 'casual', 'sutil', 'delicado', 'delicada', 'primavera', 'verano', 'ligero']
        };

        const SENSORY_LABELS = {
            amaderada: 'Amaderadas & Cuero',
            citrica: 'Cítricas & Frescas',
            dulce: 'Dulces & Vainilla',
            floral: 'Florales & Frutales',
            noche: 'Noche & Seducción',
            diario: 'Diario & Oficina'
        };

        function coincideSensorial(product, criterio) {
            if (!criterio || !SENSORY_KEYWORDS[criterio]) return true;
            const texto = ((product.name || '') + ' ' + (product.description || '') + ' ' + (product.category || '')).toLowerCase();
            const keywords = SENSORY_KEYWORDS[criterio];
            return keywords.some(kw => texto.includes(kw));
        }

        function filterProducts() {
            const inputEl = document.getElementById('filterName');
            const name = (inputEl ? inputEl.value : '').toLowerCase().trim();
            const clearBtn = document.getElementById('clearSearch');
            if (clearBtn) clearBtn.style.display = name ? 'flex' : 'none';

            const brandSelect = document.getElementById('filterBrand');
            marcaSeleccionada = brandSelect ? brandSelect.value : '';

            const sortSelect = document.getElementById('filterSort');
            ordenActual = sortSelect ? sortSelect.value : 'destacados';

            productosFiltrados = products.filter(product => {
                const pBrand = extraerMarca(product.name);
                const matchesName = !name ||
                    product.name.toLowerCase().includes(name) ||
                    pBrand.toLowerCase().includes(name) ||
                    (product.description && product.description.toLowerCase().includes(name));

                const matchesCategory = !categoriaSeleccionada || product.category === categoriaSeleccionada;
                const matchesGender = !generoSeleccionado || product.gender === generoSeleccionado;
                const matchesBrand = !marcaSeleccionada || pBrand === marcaSeleccionada;
                const matchesSensory = coincideSensorial(product, sensorialSeleccionado);

                return matchesName && matchesCategory && matchesGender && matchesBrand && matchesSensory;
            });

            paginaActual = 1;
            actualizarContador();
            renderActiveFilters();
            displayProducts(productosFiltrados);
        }

        function actualizarContador() {
            const countEl = document.getElementById('filterCount');
            const total = products.length;
            const mostrados = productosFiltrados.length;
            if (countEl) {
                if (mostrados === total) {
                    countEl.innerHTML = `<i class="fas fa-sparkles"></i> Mostrando todas las <strong>${total}</strong> fragancias`;
                } else {
                    countEl.innerHTML = `<i class="fas fa-filter"></i> <strong>${mostrados}</strong> de ${total} fragancias encontradas`;
                }
            }

            // Actualizar contador del botón del modal
            const modalResultCount = document.getElementById('modalResultCount');
            if (modalResultCount) {
                modalResultCount.textContent = mostrados;
            }

            // Actualizar badge de filtros activos en la barra
            let numFiltrosActivos = 0;
            if (generoSeleccionado || categoriaSeleccionada) numFiltrosActivos++;
            if (sensorialSeleccionado) numFiltrosActivos++;
            if (marcaSeleccionada) numFiltrosActivos++;

            const badge = document.getElementById('filterActiveBadge');
            if (badge) {
                if (numFiltrosActivos > 0) {
                    badge.textContent = numFiltrosActivos;
                    badge.style.display = 'inline-flex';
                } else {
                    badge.style.display = 'none';
                }
            }
        }

        function renderActiveFilters() {
            const container = document.getElementById('activeFilters');
            if (!container) return;
            container.innerHTML = '';

            const inputName = document.getElementById('filterName');
            const busqueda = (inputName ? inputName.value.trim() : '');

            if (busqueda) {
                createBadge(`Búsqueda: "${busqueda}"`, () => {
                    if (inputName) inputName.value = '';
                    filterProducts();
                });
            }

            if (categoriaSeleccionada) {
                createBadge('Colección: ' + (categoriaSeleccionada === 'Arabe' ? 'Árabes' : categoriaSeleccionada), () => {
                    categoriaSeleccionada = '';
                    sincronizarChipsColeccion();
                    filterProducts();
                });
            }

            if (generoSeleccionado) {
                const label = generoSeleccionado === 'Masculino' ? 'Caballero' : (generoSeleccionado === 'Femenino' ? 'Dama' : generoSeleccionado);
                createBadge('Género: ' + label, () => {
                    generoSeleccionado = '';
                    sincronizarChipsColeccion();
                    filterProducts();
                });
            }

            if (sensorialSeleccionado) {
                createBadge('Nota: ' + (SENSORY_LABELS[sensorialSeleccionado] || sensorialSeleccionado), () => {
                    sensorialSeleccionado = '';
                    sincronizarChipsSensoriales();
                    filterProducts();
                });
            }

            if (marcaSeleccionada) {
                createBadge('Marca: ' + marcaSeleccionada, () => {
                    const sel = document.getElementById('filterBrand');
                    if (sel) sel.value = '';
                    marcaSeleccionada = '';
                    filterProducts();
                });
            }

            function createBadge(text, onRemove) {
                const badge = document.createElement('div');
                badge.className = 'filter-badge';
                badge.innerHTML = `<span>${text}</span><i class="fas fa-times" aria-hidden="true" title="Quitar filtro"></i>`;
                badge.querySelector('i').onclick = onRemove;
                container.appendChild(badge);
            }
        }

        function sincronizarChipsColeccion() {
            document.querySelectorAll('#genderChips .filter-chip').forEach(btn => {
                const type = btn.dataset.type;
                const val = btn.dataset.val;
                if (!generoSeleccionado && !categoriaSeleccionada) {
                    btn.classList.toggle('active', val === '');
                } else if (type === 'gender' && val === generoSeleccionado) {
                    btn.classList.add('active');
                } else if (type === 'category' && val === categoriaSeleccionada) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }

        function sincronizarChipsSensoriales() {
            document.querySelectorAll('.sensory-chip').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.val === sensorialSeleccionado);
            });
        }

        function resetFilters() {
            const inputName = document.getElementById('filterName');
            if (inputName) inputName.value = '';
            const clearBtn = document.getElementById('clearSearch');
            if (clearBtn) clearBtn.style.display = 'none';

            const brandSelect = document.getElementById('filterBrand');
            if (brandSelect) brandSelect.value = '';

            const sortSelect = document.getElementById('filterSort');
            if (sortSelect) sortSelect.value = 'destacados';

            generoSeleccionado = '';
            categoriaSeleccionada = '';
            sensorialSeleccionado = '';
            marcaSeleccionada = '';
            ordenActual = 'destacados';

            sincronizarChipsColeccion();
            sincronizarChipsSensoriales();

            productosFiltrados = products;
            paginaActual = 1;
            actualizarContador();
            renderActiveFilters();
            displayProducts(productosFiltrados);
        }

        // Exponer globalmente para botones en Empty State
        window.adResetFilters = resetFilters;

        window.adConsultarAuraFiltros = function() {
            let consulta = "Hola AURA, ";
            const partes = [];
            if (generoSeleccionado) partes.push(`para ${generoSeleccionado === 'Femenino' ? 'mujer' : 'hombre'}`);
            if (sensorialSeleccionado && SENSORY_LABELS[sensorialSeleccionado]) {
                partes.push(`con notas de ${SENSORY_LABELS[sensorialSeleccionado]}`);
            }
            const inputName = document.getElementById('filterName');
            if (inputName && inputName.value.trim()) {
                partes.push(`relacionadas con "${inputName.value.trim()}"`);
            }

            if (partes.length) {
                consulta += `¿qué fragancias me recomiendas ${partes.join(' ')}?`;
            } else {
                consulta += "¿cuáles son las fragancias más recomendadas de Alta Densidad?";
            }

            const launcher = document.getElementById('adIaChatLauncher');
            if (launcher) launcher.click();
            setTimeout(() => {
                if (window.adChatbotPreguntar) window.adChatbotPreguntar(consulta);
            }, 350);
        };

        // Asignación de Event Listeners
        const btnReset = document.getElementById('resetFilters');
        if (btnReset) btnReset.addEventListener('click', resetFilters);

        const inputName = document.getElementById('filterName');
        if (inputName) inputName.addEventListener('input', filterProducts);

        const btnClearSearch = document.getElementById('clearSearch');
        if (btnClearSearch) {
            btnClearSearch.addEventListener('click', () => {
                if (inputName) {
                    inputName.value = '';
                    inputName.focus();
                }
                filterProducts();
            });
        }

        // Eventos en chips de Colección / Género
        document.querySelectorAll('#genderChips .filter-chip').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.type;
                const val = btn.dataset.val;
                if (val === '') {
                    generoSeleccionado = '';
                    categoriaSeleccionada = '';
                } else if (type === 'gender') {
                    generoSeleccionado = (generoSeleccionado === val) ? '' : val;
                    categoriaSeleccionada = '';
                } else if (type === 'category') {
                    categoriaSeleccionada = (categoriaSeleccionada === val) ? '' : val;
                    generoSeleccionado = '';
                }
                sincronizarChipsColeccion();
                filterProducts();
            });
        });

        // Eventos en chips de Familia Olfativa / Ocasión (Sensoriales)
        document.querySelectorAll('.sensory-chip').forEach(btn => {
            btn.addEventListener('click', () => {
                const val = btn.dataset.val;
                if (sensorialSeleccionado === val) {
                    sensorialSeleccionado = '';
                } else {
                    sensorialSeleccionado = val;
                }
                sincronizarChipsSensoriales();
                filterProducts();
            });
        });

        const selBrand = document.getElementById('filterBrand');
        if (selBrand) selBrand.addEventListener('change', filterProducts);

        const selSort = document.getElementById('filterSort');
        if (selSort) selSort.addEventListener('change', filterProducts);

        // Control del Modal de Filtros (Adaptive: Bottom Sheet en móvil, Modal centrado en desktop)
        const filtersModal = document.getElementById('filtersModal');
        const openFilterModalBtn = document.getElementById('openFilterModal');
        const closeFilterModalBtn = document.getElementById('closeFilterModal');
        const applyFiltersBtn = document.getElementById('applyFiltersBtn');

        function abrirModalFiltros() {
            if (!filtersModal) return;
            filtersModal.classList.add('open');
            document.body.style.overflow = 'hidden';
        }

        function cerrarModalFiltros() {
            if (!filtersModal) return;
            filtersModal.classList.remove('open');
            document.body.style.overflow = '';
        }

        if (openFilterModalBtn) openFilterModalBtn.addEventListener('click', abrirModalFiltros);
        if (closeFilterModalBtn) closeFilterModalBtn.addEventListener('click', cerrarModalFiltros);

        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => {
                cerrarModalFiltros();
                const grid = document.getElementById('productGrid');
                if (grid) {
                    const headerOffset = 110;
                    const elementPosition = grid.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                }
            });
        }

        if (filtersModal) {
            filtersModal.addEventListener('click', (e) => {
                if (e.target === filtersModal) {
                    cerrarModalFiltros();
                }
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && filtersModal && filtersModal.classList.contains('open')) {
                cerrarModalFiltros();
            }
        });


        // ============================
        // MODAL DETALLE PRODUCTO
        // ============================
        const productoModal  = document.getElementById('productoModal');
        const cerrarProdModal = document.getElementById('cerrarProdModal');

        function abrirModalProducto(product) {
            const stars = '★'.repeat(product.rating) + '☆'.repeat(5 - product.rating);
            document.getElementById('prodModalImg').src = product.image;
            document.getElementById('prodModalImg').alt = `Perfume ${product.name} - Fragancias de Alta Densidad`;
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
            if (window.ADAnimations) {
                window.ADAnimations.animateModalOpen(modal, '.modal-content');
            }
        }

        function cerrarModal() {
            if (window.ADAnimations) {
                window.ADAnimations.animateModalClose(productoModal, '.modal-content', () => {
                    productoModal.classList.remove('open');
                    document.body.style.overflow = '';
                });
            } else {
                productoModal.classList.remove('open');
                document.body.style.overflow = '';
            }
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
        }, { passive: true });

        // ============================
        // HOME SLIDER (PRODUCTOS Y KITS)
        // ============================
        function renderHomeSlider(prods, kits) {
            const container = document.getElementById('homeSliderContainer');
            if (!container) return;

            let items = [];
            if (prods && prods.length) items = [...items, ...prods.slice(0, 8)];
            if (kits && kits.length) items = [...items, ...kits.map(k => ({...k, isKit: true}))];
            if (!items.length) return;

            // Mezclar los items usando una semilla diaria (cambia cada 24 horas)
            const seed = parseInt(new Date().toISOString().slice(0, 10).replace(/-/g, ''));
            function seededShuffle(array, s) {
                let m = array.length, t, i;
                while (m) {
                    i = Math.floor(Math.abs(Math.sin(s++)) * m--);
                    t = array[m];
                    array[m] = array[i];
                    array[i] = t;
                }
                return array;
            }
            seededShuffle(items, seed);

            container.innerHTML = '';
            items.forEach(item => {
                const card = document.createElement('div');
                card.className = 'product-card';
                
                if (item.isKit) {
                    const kitId = `kit_${item.id || item._id}`;
                    card.innerHTML = `
                        <div class="product-image"><img src="${item.imagen}" alt="Kit Especial ${item.nombre} - Fragancias Alta Densidad" width="280" height="280" loading="lazy" decoding="async"></div>
                        <div class="product-info">
                            <div class="product-name">${item.nombre}</div>
                            <div class="kit-tag">Colección Kit</div>
                            <div class="product-price">$${Number(item.precio).toLocaleString('es-CO')} COP</div>
                        </div>
                        <button class="btn-agregar-carrito" aria-label="Agregar kit ${item.nombre} al carrito" onclick='event.stopPropagation(); agregarAlCarrito(${JSON.stringify({id: kitId, name: item.nombre, image: item.imagen, price: item.precio})})'>
                            <i class="fas fa-cart-plus" aria-hidden="true"></i> Agregar
                        </button>
                    `;
                    card.onclick = () => abrirModalKitPublico(item);
                } else {
                    const stars = '★'.repeat(item.rating || 5) + '☆'.repeat(5 - (item.rating || 5));
                    card.innerHTML = `
                        <div class="product-image"><img src="${item.image}" alt="Perfume ${item.name} - Fragancias Alta Densidad" width="280" height="280" loading="lazy" decoding="async"></div>
                        <div class="product-info">
                            <div class="product-name">${item.name}</div>
                            <div class="product-rating">${stars}</div>
                            <div class="product-category">${item.category || ''}</div>
                            <div class="product-price">$${Number(item.price).toLocaleString('es-CO')} COP</div>
                        </div>
                        <button class="btn-agregar-carrito" aria-label="Agregar ${item.name} al carrito" onclick='event.stopPropagation(); agregarAlCarrito(${JSON.stringify({id: item.id, name: item.name, image: item.image, price: item.price})})'>
                            <i class="fas fa-cart-plus" aria-hidden="true"></i> Agregar
                        </button>
                    `;
                    card.onclick = () => abrirModalProducto(item);
                }
                container.appendChild(card);
            });

            // Lógica de movimiento
            let scrollAmount = 0;
            const moveSlider = (direction) => {
                const max = container.scrollWidth - container.clientWidth;
                const firstCard = container.querySelector('.product-card');
                const gap = parseFloat(getComputedStyle(container).gap) || 20;
                const step = firstCard ? firstCard.offsetWidth + gap : 300;

                if (direction === 'next') {
                    if (scrollAmount < max) {
                        scrollAmount += step;
                        if (scrollAmount > max) scrollAmount = max;
                    } else {
                        scrollAmount = 0;
                    }
                } else {
                    if (scrollAmount > 0) {
                        scrollAmount -= step;
                        if (scrollAmount < 0) scrollAmount = 0;
                    } else {
                        scrollAmount = max;
                    }
                }
                container.style.transform = `translateX(-${scrollAmount}px)`;
            };

            let autoSlide = setInterval(() => moveSlider('next'), 5000);
            const resetAutoSlide = () => {
                clearInterval(autoSlide);
                autoSlide = setInterval(() => moveSlider('next'), 5000);
            };

            const nextBtn = document.getElementById('sliderNext');
            if (nextBtn) {
                nextBtn.onclick = () => { moveSlider('next'); resetAutoSlide(); };
            }
            const prevBtn = document.getElementById('sliderPrev');
            if (prevBtn) {
                prevBtn.onclick = () => { moveSlider('prev'); resetAutoSlide(); };
            }
        }

        // ============================
        // CARGA EN PARALELO + CACHE INSTANTÁNEO
        // ============================
        // 1. Renderizar caché de inmediato si existe (0ms LCP)
        try {
            const cachedP = localStorage.getItem(CACHE_KEY_PRODUCTS);
            if (cachedP) {
                const parsedP = JSON.parse(cachedP);
                if (parsedP && parsedP.length) {
                    products = parsedP;
                    productosFiltrados = products;
                    populateBrandFilter();
                    actualizarContador();
                    displayProducts(productosFiltrados);
                    inyectarSchemaProductos(products);
                }
            }
            const cachedK = localStorage.getItem(CACHE_KEY_KITS);
            if (cachedK) {
                const parsedK = JSON.parse(cachedK);
                if (parsedK && parsedK.length) {
                    window.kitsPublicos = parsedK;
                    window.kitsPaginaActual = 1;
                    window.KITS_POR_PAGINA = 6;
                    renderKits(parsedK);
                }
            }
            if (products.length || (window.kitsPublicos && window.kitsPublicos.length)) {
                renderHomeSlider(products, window.kitsPublicos || []);
            }
        } catch(e) {}

        // 2. Si no había caché, mostrar esqueletos
        if (!products.length && window.ADAnimations) {
            window.ADAnimations.renderSkeletons('#productGrid', 4);
            window.ADAnimations.renderSkeletons('#kitsGrid', 3);
        }

        // 3. Petición única en paralelo a la API
        async function fetchCatalogoAPI() {
            const base = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
                ? 'http://localhost:3000/api'
                : 'https://altadensidadpage-production.up.railway.app/api';

            try {
                const [resProd, resKits] = await Promise.all([
                    fetch(`${base}/productos`),
                    fetch(`${base}/kits`)
                ]);
                const dataProd = await resProd.json();
                const dataKits = await resKits.json();

                if (dataProd.success) {
                    products = dataProd.data.filter(p => p.activo !== 0);
                    productosFiltrados = products;
                    try { localStorage.setItem(CACHE_KEY_PRODUCTS, JSON.stringify(products)); } catch(e) {}
                    populateBrandFilter();
                    actualizarContador();
                    displayProducts(productosFiltrados);
                    inyectarSchemaProductos(products);
                }

                if (dataKits.success) {
                    const kits = dataKits.data.filter(k => k.activo !== 0);
                    window.kitsPublicos = kits;
                    window.kitsPaginaActual = 1;
                    window.KITS_POR_PAGINA = 6;
                    try { localStorage.setItem(CACHE_KEY_KITS, JSON.stringify(kits)); } catch(e) {}
                    renderKits(kits);
                }

                renderHomeSlider(products, window.kitsPublicos || []);
            } catch(err) {
                console.error("Error cargando catálogo desde API:", err);
            }
        }

        fetchCatalogoAPI();
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
