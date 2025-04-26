document.addEventListener('DOMContentLoaded', function() {
    // Datos de productos
    const products = [
        {
            id: 1,
            name: "SWAROSKY",
            image: "swarosky.jpeg",
            material : "Vidrio",
            sizes: ["30ml" , "60ml" , "100ml"],
        },
        {
            id: 2,
            name: "CARTIER",
            image: "cartier.jpeg",
            material : "Vidrio",
            sizes: ["30ml" , "60ml" , "100ml"],
        },{
            id: 3,
            name: "SINGLER",
            image: "singlernew.jpg",
            material : "Vidrio",
            sizes: ["30ml" , "60ml" , "100ml"],
        },{
            id: 4,
            name: "ATOMIZADOR DE VIDRIO",
            image: "atom-vidrio.jpeg",
            material : "Vidrio",
            sizes: ["5ml"],
        },{
            id: 5,
            name: "ATOMIZADOR GRANDE",
            image: "atom-color.jpeg",
            material : "Vidrio",
            sizes: ["10ml"],
        },
    ];

    // Elementos del DOM
    const productGrid = document.getElementById('productGrid');
    
    // Mostrar productos
    function displayProducts(productsToShow) {
        productGrid.innerHTML = '';
        
        productsToShow.forEach(product => {
            const stars = '★'.repeat(product.rating) + '☆'.repeat(5 - product.rating);
            
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <div class="product-name">${product.name}</div>
                    <div class="product-sizes">${product.sizes}</div>
                </div>
            `;
            
            productGrid.appendChild(productCard);
        });
    }
    
    // Inicializar
    displayProducts(products);
    
    
});