document.addEventListener('DOMContentLoaded', function () {
    // Detectar entorno y definir URL base
    const base = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
        ? 'http://localhost:3000/api'
        : 'https://altadensidadpage-production.up.railway.app/api';
    const API_TOP10_URL = base + '/top10';
    const productGrid = document.getElementById('top10Grid');

    async function cargarTop10() {
        if (window.ADAnimations) {
            window.ADAnimations.renderSkeletons('#top10Grid', 4);
        } else {
            productGrid.innerHTML = '<div class="loading-row"><i class="fas fa-spinner fa-spin"></i> Cargando Top 10...</div>';
        }
        try {
            const res = await fetch(API_TOP10_URL);
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
            mostrarTop10(data.data);
        } catch (err) {
            productGrid.innerHTML = `<div class="empty-row"><i class='fas fa-exclamation-circle'></i> No se pudo cargar el Top 10.</div>`;
        }
    }

    function inyectarSchemaTop10(items) {
        if (!items || !items.length) return;
        let existing = document.getElementById('schema-top10-dinamico');
        if (existing) existing.remove();

        const schemaData = {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Top 10 Perfumes Más Vendidos - Fragancias de Alta Densidad",
            "itemListOrder": "https://schema.org/ItemListOrderAscending",
            "numberOfItems": items.length,
            "itemListElement": items.map((p, idx) => ({
                "@type": "ListItem",
                "position": idx + 1,
                "item": {
                    "@type": "Product",
                    "name": p.nombre || p.name,
                    "image": (p.imagen || p.image) ? ((p.imagen || p.image).startsWith('http') ? (p.imagen || p.image) : `https://alta-densidad-page.vercel.app/${p.imagen || p.image}`) : undefined,
                    "description": p.descripcion || p.description || `Perfume ${p.nombre || p.name} Top ${idx + 1} en ventas con alta concentración y fijación prolongada.`,
                    "brand": {
                        "@type": "Brand",
                        "name": "Alta Densidad"
                    },
                    "offers": {
                        "@type": "Offer",
                        "priceCurrency": "COP",
                        "price": Number(p.precio || 0),
                        "availability": "https://schema.org/InStock",
                        "url": "https://alta-densidad-page.vercel.app/top10.html"
                    }
                }
            }))
        };

        const script = document.createElement('script');
        script.id = 'schema-top10-dinamico';
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(schemaData);
        document.head.appendChild(script);
    }

    function mostrarTop10(productsToShow) {
        productGrid.innerHTML = '';
        inyectarSchemaTop10(productsToShow);
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
                    <img src="${itemData.image}" alt="Top #${rank} Perfume ${itemData.name} - Fragancia Alta Concentración" width="280" height="280" loading="lazy" decoding="async">
                </div>
                <div class="product-info">
                    <div class="product-name">${itemData.name}</div>
                    <div class="product-rating">${stars}</div>
                    <div class="product-category">${itemData.category || ''}</div>
                    <div class="product-price">$${Number(itemData.price || 0).toLocaleString('es-CO')} COP</div>
                </div>
                <button class="btn-agregar-carrito" aria-label="Agregar ${itemData.name} al carrito"
                    onclick='event.stopPropagation(); if(window.agregarAlCarrito) window.agregarAlCarrito(${JSON.stringify({ id: itemData.id, name: itemData.name, image: itemData.image, price: itemData.price })})'>
                    <i class="fas fa-cart-plus" aria-hidden="true"></i> Agregar
                </button>
            `;

            productCard.addEventListener('click', (e) => {
                if (e.target.closest('.btn-agregar-carrito')) return;
                abrirModalTop10(itemData);
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
        if (window.ADAnimations) {
            window.ADAnimations.animateTop10('#top10Grid');
        }
    }

    function abrirModalTop10(product) {
        const modal = document.getElementById('productoModal');
        if (!modal) return;
        const stars = '★'.repeat(product.rating || 5) + '☆'.repeat(5 - (product.rating || 5));
        const img = document.getElementById('prodModalImg');
        if (img) {
            img.src = product.image || '';
            img.alt = `Perfume ${product.name} - Fragancias Alta Densidad`;
        }
        const nom = document.getElementById('prodModalNombre');
        if (nom) nom.textContent = product.name || '';
        const cat = document.getElementById('prodModalCategoria');
        if (cat) cat.textContent = product.category || 'Perfumería';
        const rat = document.getElementById('prodModalRating');
        if (rat) rat.textContent = stars;
        const gen = document.getElementById('prodModalGenero');
        if (gen) gen.textContent = product.gender ? `Género: ${product.gender}` : '';
        const desc = document.getElementById('prodModalDesc');
        if (desc) desc.textContent = product.description || 'Sin descripción disponible.';
        const prec = document.getElementById('prodModalPrecio');
        if (prec) prec.textContent = `$${Number(product.price || 0).toLocaleString('es-CO')} COP`;

        const btnCarrito = document.getElementById('prodModalCarrito');
        if (btnCarrito) {
            btnCarrito.onclick = () => {
                if (window.agregarAlCarrito) {
                    window.agregarAlCarrito({
                        id: product.id,
                        name: product.name,
                        image: product.image,
                        price: product.price
                    });
                }
            };
        }

        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    const cerrarBtn = document.getElementById('cerrarProdModal');
    if (cerrarBtn) {
        cerrarBtn.addEventListener('click', () => {
            const modal = document.getElementById('productoModal');
            if (modal) modal.classList.remove('open');
            document.body.style.overflow = '';
        });
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
}, { passive: true });