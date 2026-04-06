const API_ENVASES = 'http://localhost:3000/api/envases';

document.addEventListener('DOMContentLoaded', async function() {
    const productGrid = document.getElementById('productGrid');

    // Mostrar envases
    function displayProducts(envases) {
        productGrid.innerHTML = '';

        if (!envases || envases.length === 0) {
            productGrid.innerHTML = '<p style="color:#888;text-align:center;padding:40px;">No hay envases disponibles.</p>';
            return;
        }

        envases.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
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
    }

    // Cargar desde API
    try {
        productGrid.innerHTML = '<p style="color:#888;text-align:center;padding:40px;"><i class="fas fa-spinner fa-spin"></i> Cargando envases...</p>';
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