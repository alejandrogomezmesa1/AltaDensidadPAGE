document.addEventListener('DOMContentLoaded', async function() {
    const productGrid = document.getElementById('productGrid');
    const CACHE_KEY_ENVASES = 'ad_cached_envases_v1';
    const WA = "573046477694";

    // DATOS DUROS OFICIALES: CATÁLOGO DE ENVASES
    const DATOS_DUROS_ENVASES = [
  {
    "id": 1,
    "name": "AMIRA",
    "image": "assets/img/AMIRA.jpeg",
    "material": "Vidrio",
    "sizes": [
      "30ml"
    ],
    "price": 0,
    "description": "Un envase elegante y compacto de vidrio, diseñado para realzar la exclusividad de cada fragancia. Acabado refinado y lujoso en 30ml."
  },
  {
    "id": 2,
    "name": "CARTIER",
    "image": "assets/img/CARTIER.jpeg",
    "material": "Vidrio",
    "sizes": [
      "30ml",
      "60ml"
    ],
    "price": 0,
    "description": "Evoca la elegancia y el prestigio de la alta joyería. Transmite distinción atemporal y exclusividad en 30ml y 60ml."
  },
  {
    "id": 3,
    "name": "CILINDRO",
    "image": "assets/img/CILINDRO.jpeg",
    "material": "Vidrio",
    "sizes": [
      "100ml"
    ],
    "price": 0,
    "description": "Transmite solidez y equilibrio con su forma cilíndrica pura. Presencia y resistencia en formato generoso de 100ml."
  },
  {
    "id": 4,
    "name": "EROS",
    "image": "assets/img/EROS.jpeg",
    "material": "Vidrio",
    "sizes": [
      "60ml"
    ],
    "price": 0,
    "description": "Simboliza magnetismo, seducción y presencia. Ideal para perfumes intensos que buscan dejar una huella inolvidable en 60ml."
  },
  {
    "id": 5,
    "name": "VICTORY",
    "image": "assets/img/VICTORY.jpeg",
    "material": "Vidrio",
    "sizes": [
      "60ml"
    ],
    "price": 0,
    "description": "Representa triunfo y superación. Fuerza, confianza y energía positiva en cada aplicación en 60ml."
  },
  {
    "id": 6,
    "name": "GOOD GIRL",
    "image": "assets/img/GOOD_GIRL.jpeg",
    "material": "Vidrio",
    "sizes": [
      "30ml"
    ],
    "price": 0,
    "description": "Refleja feminidad encantadora, moderna y divertida en un formato práctico y estilizado de 30ml."
  },
  {
    "id": 7,
    "name": "CALAVERA",
    "image": "assets/img/calavera1.jpeg",
    "material": "Vidrio",
    "sizes": [
      "50ml"
    ],
    "price": 0,
    "description": "Un envase atrevido, rebelde y memorable con personalidad única. Formato de 50ml para fragancias temáticas y coleccionables."
  },
  {
    "id": 8,
    "name": "MINI YARA",
    "image": "assets/img/yaritas.jpeg",
    "material": "Vidrio",
    "sizes": [
      "30ml"
    ],
    "price": 0,
    "description": "Compacto y delicado, transmite dulzura, elegancia oriental y estilo en cada detalle en 30ml."
  },
  {
    "id": 9,
    "name": "VALENTINO",
    "image": "assets/img/VALENTINO_BOTTLE.jpeg",
    "material": "Vidrio",
    "sizes": [
      "30ml",
      "60ml"
    ],
    "price": 0,
    "description": "Glamour italiano y tachonado de alta costura. Exclusividad y sofisticación moderna en 30ml y 60ml."
  },
  {
    "id": 10,
    "name": "SAUVAGE",
    "image": "assets/img/SAUVAGE_BOTTLE.jpeg",
    "material": "Vidrio",
    "sizes": [
      "30ml"
    ],
    "price": 0,
    "description": "Transmite libertad y fuerza interior. Silueta minimalista y masculina para el día a día en 30ml."
  },
  {
    "id": 11,
    "name": "MOSCHINO BEAR",
    "image": "assets/img/MOSCHINO_BEAR.jpeg",
    "material": "Vidrio",
    "sizes": [
      "60ml"
    ],
    "price": 0,
    "description": "Combina lujo, creatividad e irreverencia con un toque juguetón en cristal premium de 60ml."
  }
];

    function normalizarImagenEnvase(src) {
        if (!src) return 'assets/img/Logo2026.png';
        if (src.startsWith('http://') || src.startsWith('https://')) return src;
        let p = src.trim();
        if (p.startsWith('img/')) {
            p = 'assets/' + p;
        } else if (!p.startsWith('assets/')) {
            p = 'assets/img/' + p;
        }
        return p
            .replace(/cartier\.jpeg$/i, 'CARTIER.jpeg')
            .replace(/cilindro\.jpeg$/i, 'CILINDRO.jpeg')
            .replace(/amira\.jpeg$/i, 'AMIRA.jpeg')
            .replace(/victory\.jpeg$/i, 'VICTORY.jpeg')
            .replace(/eros\.jpeg$/i, 'EROS.jpeg');
    }

    function inyectarSchemaEnvases(lista) {
        if (!lista || !lista.length) return;
        let existing = document.getElementById('schema-envases-dinamico');
        if (existing) existing.remove();

        const schemaData = {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Catálogo de Envases y Presentaciones - Fragancias de Alta Densidad",
            "numberOfItems": lista.length,
            "itemListElement": lista.map((e, idx) => ({
                "@type": "ListItem",
                "position": idx + 1,
                "item": {
                    "@type": "Product",
                    "name": `Envase ${e.name || e.nombre}`,
                    "image": normalizarImagenEnvase(e.image || e.imagen),
                    "description": e.description || e.descripcion || `Envase ${e.name || e.nombre} para perfumería en material ${e.material || 'vidrio premium'}.`,
                    "brand": {
                        "@type": "Brand",
                        "name": "Alta Densidad"
                    },
                    "offers": {
                        "@type": "Offer",
                        "priceCurrency": "COP",
                        "price": Number(e.price || e.precio || 0),
                        "availability": "https://schema.org/InStock",
                        "url": "https://alta-densidad-page.vercel.app/envases.html"
                    }
                }
            }))
        };

        const script = document.createElement('script');
        script.id = 'schema-envases-dinamico';
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(schemaData);
        document.head.appendChild(script);
    }

    // 1. Cargar caché o datos duros de inmediato (0ms LCP)
    try {
        const cached = localStorage.getItem(CACHE_KEY_ENVASES);
        if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed && parsed.length) {
                displayProducts(parsed);
            } else {
                displayProducts(DATOS_DUROS_ENVASES);
            }
        } else {
            displayProducts(DATOS_DUROS_ENVASES);
        }
    } catch(e) {
        displayProducts(DATOS_DUROS_ENVASES);
    }

    function displayProducts(envasesList) {
        if (!productGrid) return;
        productGrid.innerHTML = '';
        inyectarSchemaEnvases(envasesList);

        if (!envasesList || envasesList.length === 0) {
            displayProducts(DATOS_DUROS_ENVASES);
            return;
        }

        envasesList.forEach((product, index) => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            const imgUrl = normalizarImagenEnvase(product.image || product.imagen);
            const nom = product.name || product.nombre;
            const altText = `Envase para perfume ${nom} - ${product.material || 'Vidrio Premium'}`;
            
            // Garantizar tallas reales
            const coincidencia = DATOS_DUROS_ENVASES.find(e => e.name.toLowerCase() === nom.toLowerCase());
            const tallasArray = (Array.isArray(product.sizes) && product.sizes.length)
                ? product.sizes
                : (coincidencia ? coincidencia.sizes : ['30ml', '60ml']);

            const msgWa = encodeURIComponent(`¡Hola! Me gustaría pedir una fragancia con el envase ${nom} en Alta Densidad. ✨`);
            const loadingAttr = index < 4 ? 'loading="eager" fetchpriority="high"' : 'loading="lazy" decoding="async"';

            productCard.innerHTML = `
                <div class="product-image">
                    <img src="${imgUrl}" alt="${altText}" width="280" height="280" ${loadingAttr} onerror="this.onerror=null;this.src='assets/img/Logo2026.png';">
                </div>
                <div class="product-info" style="display:flex; flex-direction:column; justify-content:space-between; height:100%;">
                    <div>
                        <div class="product-name">${nom}</div>
                        <div class="product-sizes" style="font-weight:600; color:var(--azul-dos, #D4AF37);">Presentaciones: ${tallasArray.join(', ')}</div>
                        <div class="product-material" style="color:var(--c-mute, #888); font-size:0.85rem; margin-bottom:6px;">Material: ${product.material || 'Vidrio Premium'}</div>
                        <div class="product-description">${product.description || product.descripcion || 'Diseño exclusivo en cristal tallado para perfumería de autor.'}</div>
                    </div>
                    <a class="product-button" style="text-decoration:none; display:flex; align-items:center; justify-content:center; gap:8px; margin-top:12px; width:100%; box-sizing:border-box;"
                       href="https://wa.me/${WA}?text=${msgWa}" target="_blank" rel="noopener">
                        <i class="fab fa-whatsapp" aria-hidden="true"></i> Pedir este envase
                    </a>
                </div>
            `;
            productGrid.appendChild(productCard);
        });

        const cols = window.innerWidth > 1100 ? 4 : window.innerWidth > 768 ? 3 : 2;
        const resto = envasesList.length % cols;
        if (resto !== 0) {
            for (let i = 0; i < cols - resto; i++) {
                const ph = document.createElement('div');
                ph.classList.add('product-card-placeholder');
                productGrid.appendChild(ph);
            }
        }
        if (window.ADAnimations) {
            window.ADAnimations.animateEnvases('#productGrid');
        }
    }

    // 2. Carga en segundo plano con reintento resiliente
    async function cargarEnvases() {
        const isLocal = typeof location !== 'undefined' && 
            (location.hostname === 'localhost' || location.hostname === '127.0.0.1') && 
            location.port === '3000';
        const endpoints = isLocal
            ? ['http://localhost:3000/api/envases', 'https://altadensidadpage-production.up.railway.app/api/envases']
            : ['https://altadensidadpage-production.up.railway.app/api/envases'];

        let cargados = false;
        for (const url of endpoints) {
            try {
                const controller = new AbortController();
                const timer = setTimeout(() => controller.abort(), 3500);
                const res = await fetch(url, { signal: controller.signal });
                clearTimeout(timer);
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.data && data.data.length) {
                        try { localStorage.setItem(CACHE_KEY_ENVASES, JSON.stringify(data.data)); } catch(e) {}
                        displayProducts(data.data);
                        cargados = true;
                        break;
                    }
                }
            } catch(e) {}
        }

        if (!cargados && (!productGrid.children || productGrid.children.length === 0)) {
            displayProducts(DATOS_DUROS_ENVASES);
        }
    }

    cargarEnvases();
});

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
