(function () {
    function initTop10() {
        const productGrid = document.getElementById('top10Grid');
        if (!productGrid) return;
        const CACHE_KEY_TOP10 = 'ad_cached_top10_v1';

    // DATOS DUROS OFICIALES: TOP 10 PERFUMES MÁS VENDIDOS
    const DATOS_DUROS_TOP10 = [
  {
    "posicion": 1,
    "producto_id": 82,
    "id": 82,
    "nombre": "SANTAL 33 LE LABO",
    "imagen": "assets/img/SANTAL_33.jpg",
    "categoria": "Diseñador",
    "genero": "Unisex",
    "f": "Amaderada",
    "o": "Oficina",
    "no": [
      "Cardamomo · Iris",
      "Papiro · Violeta",
      "Sándalo · Cedro · Cuero"
    ],
    "descripcion": "Santal 33 es un perfume amaderado y especiado, con un aire ahumado y sofisticado que lo ha convertido en un clásico moderno de la perfumería nicho.",
    "precio": 75000,
    "rating": 5
  },
  {
    "posicion": 2,
    "producto_id": 68,
    "id": 68,
    "nombre": "LIGHT BLUE DAMA DOLCE & GABBANA",
    "imagen": "assets/img/ligth_blue.jpg",
    "categoria": "Diseñador",
    "genero": "Femenino",
    "f": "Cítrica / Fresca",
    "o": "Verano",
    "no": [
      "Manzana verde · Limón",
      "Bambú · Jazmín",
      "Cedro · Ámbar"
    ],
    "descripcion": "Es una fragancia fresca, mediterránea y muy versátil, que se ha convertido en un clásico para climas cálidos y uso diario.",
    "precio": 75000,
    "rating": 4
  },
  {
    "posicion": 3,
    "producto_id": 64,
    "id": 64,
    "nombre": "LACOSTE BLANCA",
    "imagen": "assets/img/LACOSTE_BLANCA.png",
    "categoria": "Diseñador",
    "genero": "Masculino",
    "f": "Aromática",
    "o": "Oficina",
    "no": [
      "Pomelo · Cardamomo",
      "Ylang-ylang · Nardo",
      "Cedro de Virginia · Gamuza"
    ],
    "descripcion": "Es una fragancia fresca, limpia y elegante, inspirada en la icónica camiseta polo blanca de Lacoste.",
    "precio": 65000,
    "rating": 4
  },
  {
    "posicion": 4,
    "producto_id": 35,
    "id": 35,
    "nombre": "BHARARA KING",
    "imagen": "assets/img/BHARARAKING.webp",
    "categoria": "Arabe",
    "genero": "Masculino",
    "f": "Dulce / Gourmand",
    "o": "Noche",
    "no": [
      "Naranja · Bergamota",
      "Tutti-frutti",
      "Vainilla blanca · Ámbar"
    ],
    "descripcion": "Bharara King es un perfume masculino reconocido por su carácter poderoso, desafiante y moderno.",
    "precio": 110000,
    "rating": 5
  },
  {
    "posicion": 5,
    "producto_id": 96,
    "id": 96,
    "nombre": "CREED AVENTUS",
    "imagen": "assets/img/creed_adventus.webp",
    "categoria": "Diseñador",
    "genero": "Masculino",
    "f": "Amaderada",
    "o": "Noche",
    "no": [
      "Piña ahumada · Grosella",
      "Abedul · Jazmín",
      "Almizcle · Musgo de roble"
    ],
    "descripcion": "Una de las fragancias más emblemáticas de la casa Creed, homenaje al poder, la visión y el éxito.",
    "precio": 70000,
    "rating": 4
  },
  {
    "posicion": 6,
    "producto_id": 28,
    "id": 28,
    "nombre": "AMBER OUD GOLD AL HARAMAIN",
    "imagen": "assets/img/AMBER_OUD_GOLD.jpeg",
    "categoria": "Arabe",
    "genero": "Unisex",
    "f": "Dulce / Gourmand",
    "o": "Noche",
    "no": [
      "Bergamota · Notas verdes",
      "Melón · Piña dulce",
      "Ámbar · Vainilla"
    ],
    "descripcion": "El Amber Oud Gold Edition de Al Haramain es una fragancia unisex de estilo oriental gourmand, dulce, cálida y sofisticada.",
    "precio": 125000,
    "rating": 5
  },
  {
    "posicion": 7,
    "producto_id": 23,
    "id": 23,
    "nombre": "BADEE AL OUD SUBLIME LATTAFA",
    "imagen": "assets/img/ADEE_AL_OUD_SUBLIME.webp",
    "categoria": "Arabe",
    "genero": "Unisex",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "no": [
      "Manzana · Ciruela · Lichi",
      "Rosa · Jazmín",
      "Vainilla · Cedro · Pachulí"
    ],
    "descripcion": "Badee Al Oud Sublime de Lattafa es un perfume unisex con un perfil afrutado, amaderado y oriental.",
    "precio": 110000,
    "rating": 5
  },
  {
    "posicion": 8,
    "producto_id": 43,
    "id": 43,
    "nombre": "VALENTINO DONNA BORN IN ROMA",
    "imagen": "assets/img/DONNA_BORN_IN_ROMA.jpeg",
    "categoria": "Diseñador",
    "genero": "Femenino",
    "f": "Floral",
    "o": "Noche",
    "no": [
      "Grosella negra · Pimienta rosa",
      "Jazmín grandiflorum",
      "Vainilla bourbon · Madera"
    ],
    "descripcion": "Valentino Donna Born in Roma es una fragancia moderna, sofisticada y con un toque rebelde, inspirada en Roma.",
    "precio": 85000,
    "rating": 5
  },
  {
    "posicion": 9,
    "producto_id": 90,
    "id": 90,
    "nombre": "212 VIP BLACK CAROLINA HERRERA",
    "imagen": "assets/img/VIP_212_BLACK.jpg",
    "categoria": "Diseñador",
    "genero": "Masculino",
    "f": "Aromática",
    "o": "Noche",
    "no": [
      "Absenta · Anís",
      "Lavanda francesa",
      "Cuero negro · Vainilla"
    ],
    "descripcion": "212 VIP Black es un perfume masculino aromático y especiado con fondo cálido, ideal para ambientes sociales nocturnos.",
    "precio": 70000,
    "rating": 5
  },
  {
    "posicion": 10,
    "producto_id": 91,
    "id": 91,
    "nombre": "YARA LATTAFA",
    "imagen": "assets/img/YARA_LATTAFA2.jpg",
    "categoria": "Arabe",
    "genero": "Femenino",
    "f": "Dulce / Gourmand",
    "o": "Oficina",
    "no": [
      "Heliotropo · Orquídea",
      "Frutas tropicales",
      "Vainilla · Sándalo"
    ],
    "descripcion": "Yara de Lattafa es un perfume femenino dulce, floral y cremoso, juvenil y encantador con gran duración y versatilidad.",
    "precio": 110000,
    "rating": 5
  }
];

    function normalizarImagen(src) {
        if (!src) return 'assets/img/Logo2026.png';
        if (src.startsWith('http://') || src.startsWith('https://')) return src;
        let p = src.trim();
        if (p.startsWith('img/')) {
            p = 'assets/' + p;
        } else if (!p.startsWith('assets/')) {
            p = 'assets/img/' + p;
        }
        return p;
    }

    // 1. Render inmediato: Caché o Datos Duros (0ms LCP, nunca queda en blanco)
    try {
        const cached = localStorage.getItem(CACHE_KEY_TOP10);
        if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed && parsed.length) {
                mostrarTop10(parsed);
                inyectarSchemaTop10(parsed);
            } else {
                mostrarTop10(DATOS_DUROS_TOP10);
            }
        } else {
            mostrarTop10(DATOS_DUROS_TOP10);
        }
    } catch(e) {
        mostrarTop10(DATOS_DUROS_TOP10);
    }

    // 2. Carga en segundo plano desde API con reintento resiliente
    async function cargarTop10() {
        const isLocal = typeof location !== 'undefined' && 
            (location.hostname === 'localhost' || location.hostname === '127.0.0.1') && 
            location.port === '3000';
        const endpoints = isLocal
            ? ['http://localhost:3000/api/top10', 'https://altadensidadpage-production.up.railway.app/api/top10']
            : ['https://altadensidadpage-production.up.railway.app/api/top10'];

        let exito = false;
        for (const url of endpoints) {
            try {
                const controller = new AbortController();
                const timer = setTimeout(() => controller.abort(), 3500);
                const res = await fetch(url, { signal: controller.signal });
                clearTimeout(timer);
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.data && data.data.length) {
                        try { localStorage.setItem(CACHE_KEY_TOP10, JSON.stringify(data.data)); } catch(e) {}
                        mostrarTop10(data.data);
                        inyectarSchemaTop10(data.data);
                        exito = true;
                        break;
                    }
                }
            } catch (err) {}
        }

        // Si fallan todas las redes pero no hay nada renderizado, asegurar datos duros
        if (!exito && (!productGrid.children || productGrid.children.length === 0)) {
            mostrarTop10(DATOS_DUROS_TOP10);
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
                    "image": normalizarImagen(p.imagen || p.image),
                    "description": p.descripcion || p.description || `Perfume ${p.nombre || p.name} Top ${idx + 1} en ventas con alta concentración y fijación prolongada.`,
                    "brand": {
                        "@type": "Brand",
                        "name": "Alta Densidad"
                    },
                    "offers": {
                        "@type": "Offer",
                        "priceCurrency": "COP",
                        "price": Number(p.precio || p.price || 0),
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

            const itemData = {
                id: product.producto_id || product.id,
                name: product.nombre || product.name,
                image: normalizarImagen(product.imagen || product.image),
                category: product.categoria || product.category || 'Perfumería',
                gender: product.genero || product.gender || 'Unisex',
                description: product.descripcion || product.description || '',
                price: Number(product.precio || product.price || 75000),
                rating: product.rating || 5
            };

            const loadingAttr = index < 4 ? 'loading="eager" fetchpriority="high"' : 'loading="lazy" decoding="async"';

            productCard.innerHTML = `
                <div class="product-rank-badge">#${rank}</div>
                <div class="product-image">
                    <img src="${itemData.image}" alt="Top #${rank} Perfume ${itemData.name} - Fragancia Alta Concentración" width="280" height="280" ${loadingAttr} onerror="this.src='assets/img/Logo2026.png';">
                </div>
                <div class="product-info">
                    <div class="product-name">${itemData.name}</div>
                    <div class="product-rating">${stars}</div>
                    <div class="product-category">${itemData.category}</div>
                    <div class="product-price">$${itemData.price.toLocaleString('es-CO')} COP</div>
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
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTop10);
    } else {
        initTop10();
    }
})();

let lastScrollTop = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > lastScrollTop && scrollTop > 80) {
        if (header) header.classList.add('header--hidden');
    } else {
        if (header) header.classList.remove('header--hidden');
    }
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
}, { passive: true });
