const API_ENVASES = ((location.hostname === 'localhost' || location.hostname === '127.0.0.1') ? 'http://localhost:3000/api' : 'https://altadensidadpage-production.up.railway.app/api') + '/envases';

function normalizarImagenEnvase(src) {
    if (!src) return 'assets/img/logo2025.png';
    if (src.startsWith('http://') || src.startsWith('https://')) return src;
    let path = src.trim();
    if (path.startsWith('img/')) {
        path = 'assets/' + path;
    } else if (!path.startsWith('assets/')) {
        path = 'assets/img/' + path;
    }
    // Corrección para sistemas de archivos sensibles a mayúsculas (Linux/Vercel)
    return path.replace(/cartier\.jpeg$/i, 'CARTIER.jpeg');
}

document.addEventListener('DOMContentLoaded', async function() {
    const productGrid = document.getElementById('productGrid');

    function inyectarSchemaEnvases(envases) {
        if (!envases || !envases.length) return;
        let existing = document.getElementById('schema-envases-dinamico');
        if (existing) existing.remove();

        const schemaData = {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Catálogo de Envases y Presentaciones - Fragancias de Alta Densidad",
            "numberOfItems": envases.length,
            "itemListElement": envases.map((e, idx) => ({
                "@type": "ListItem",
                "position": idx + 1,
                "item": {
                    "@type": "Product",
                    "name": `Envase ${e.name}`,
                    "image": normalizarImagenEnvase(e.image),
                    "description": e.description || `Envase ${e.name} para perfumería en material ${e.material || 'vidrio premium'}.`,
                    "brand": {
                        "@type": "Brand",
                        "name": "Alta Densidad"
                    },
                    "offers": {
                        "@type": "Offer",
                        "priceCurrency": "COP",
                        "price": Number(e.price || 0),
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

    // Mostrar envases
    function displayProducts(envases) {
        productGrid.innerHTML = '';
        inyectarSchemaEnvases(envases);

        if (!envases || envases.length === 0) {
            productGrid.innerHTML = '<p style="color:#888;text-align:center;padding:40px;">No hay envases disponibles.</p>';
            return;
        }

        envases.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            const imgUrl = normalizarImagenEnvase(product.image);
            const altText = `Envase para perfume ${product.name} - ${product.material || 'Vidrio Premium'}`;
            productCard.innerHTML = `
                <div class="product-image">
                    <img src="${imgUrl}" alt="${altText}" onerror="this.onerror=null;this.src='assets/img/logo2025.png';">
                </div>
                <div class="product-info">
                    <div class="product-name">${product.name}</div>
                    <div class="product-sizes">${(product.sizes || []).join(', ')}</div>
                    <div class="product-material"> ${product.material} </div>
                    <div class="product-description">${product.description || ''}</div>
                </div>
            `;
            productGrid.appendChild(productCard);
        });

        // Rellenar última fila con placeholders para evitar espacios en blanco
        const cols = window.innerWidth > 1100 ? 4 : window.innerWidth > 768 ? 3 : 2;
        const resto = envases.length % cols;
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

    // Cargar desde API
    try {
        if (window.ADAnimations) {
            window.ADAnimations.renderSkeletons('#productGrid', 4);
        } else {
            productGrid.innerHTML = '<p style="color:#888;text-align:center;padding:40px;"><i class="fas fa-spinner fa-spin"></i> Cargando envases...</p>';
        }
        const res  = await fetch(API_ENVASES);
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        displayProducts(data.data);
    } catch (err) {
        console.error('Error al cargar envases:', err);
        productGrid.innerHTML = '<p style="color:#c0392b;text-align:center;padding:40px;">No se pudo conectar con el servidor. Asegúrate de que el backend esté corriendo.</p>';
    }
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