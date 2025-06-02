document.addEventListener('DOMContentLoaded', function() {
    // Datos de productos
    const products = [
        {
            id: 1,
            name: "SWAROVSKI",
            image: "img/swarosky.jpeg",
            material : "Vidrio",
            sizes: ["30ml" ],
            price: 0,
            description: "Envase elegante de vidrio con incrustaciones tipo Swarovski, ideal para perfumes exclusivos y presentaciones de lujo."
        },
        {
            id: 2,
            name: "CARTIER",
            image: "img/cartier.jpeg",
            material : "Vidrio",
            sizes: ["30ml" , "60ml" , "100ml"],
            price: 0,
            description: "Envase de vidrio grueso inspirado en la elegancia de Cartier, resistente y sofisticado para cualquier fragancia."
        },
        {
            id: 3,
            name: "EROS",
            image: "img/EROSENVASE.jpg",
            material : "Vidrio",
            sizes: [ "60ml" , "100ml"],
            price: 5500,
            description: "Botella de vidrio azul/roja con diseño inspirado en Eros, perfecta para perfumes intensos y modernos."
        },
        {
            id: 4,
            name: "ATOMIZADOR DE VIDRIO",
            image: "img/atom-vidrio.jpeg",
            material : "Vidrio",
            sizes: ["5ml"],
            price: 2000,
            description: "Atomizador pequeño de vidrio transparente, ideal para muestras o para llevar en el bolso."
        },
        {
            id: 5,
            name: "ATOMIZADOR MEDIANO",
            image: "img/atom-color.jpeg",
            material : "Vidrio",
            sizes: ["15ml"],
            price: 3000,
            description: "Atomizador de vidrio mediano con colores variados, práctico y resistente para uso diario."
        },
        {
            id: 6,
            name: "CALAVERA",
            image: "img/calavera1.jpeg",
            material : "Vidrio",
            sizes: ["50ml"],
            price: 6000,
            description: "Envase de vidrio en forma de calavera, llamativo y original, ideal para coleccionistas o fragancias temáticas."
        },
        {
            id: 7,
            name: "MINI YARA",
            image: "img/yaritas.jpeg",
            material : "Vidrio",
            sizes: ["30ml"],
            price: 10000,
            description: "Pequeño envase de vidrio inspirado en la línea Yara, compacto y elegante para fragancias femeninas."
        },
        {
            id: 8,
            name: "VALENTINO",
            image: "img/valentino1.jpeg",
            material : "Vidrio",
            sizes: ["30ml","60ml"],
            price: 4000,
            description: "Envase de vidrio con textura y diseño inspirado en Valentino, sofisticado y moderno."
        },
        {
            id: 9,
            name: "HEXAGONAL",
            image: "img/hexagonal.jpeg",
            material : "Vidrio",
            sizes: ["30ml","60ml"],
            price: 3500,
            description: "Botella de vidrio con forma hexagonal, minimalista y versátil para cualquier tipo de perfume."
        },
        {
            id: 10,
            name: "DUBAI",
            image: "img/dubai.jpeg",
            material : "Vidrio",
            sizes: ["30ml","60ml","100ml"],
            price: 0,
            description: "Envase de vidrio inspirado en el lujo de Dubái, con diseño sofisticado."
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
                    <div class="product-material"> ${product.material} </div>
                    <div class="product-description">${product.description}</div>
                </div>
            `;
            
            productGrid.appendChild(productCard);
        });
    }
    
    // Inicializar
    displayProducts(products);
    
    
});