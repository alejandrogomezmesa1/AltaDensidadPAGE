document.addEventListener('DOMContentLoaded', function() {
    // Datos de productos
    const products = [
        {
            id: 1,
            name: "AMIRA",
            image: "img/AMIRA.jpeg",
            material : "Vidrio",
            sizes: ["30ml" ],
            price: 0,
            description: "Un envase elegante y compacto de vidrio, diseñado para realzar la exclusividad de cada fragancia. Su acabado refinado transmite lujo y sofisticación, convirtiéndolo en la elección ideal para perfumes de alta densidad en presentaciones de 30ml."
        },
        {
            id: 2,
            name: "CARTIER",
            image: "img/cartier.jpeg",
            material : "Vidrio",
            sizes: ["30ml" , "60ml" ],
            price: 0,
            description: "Un envase que evoca la elegancia y el prestigio de la alta joyería. Su nombre transmite lujo, sofisticación y distinción, convirtiéndolo en la elección perfecta para fragancias que buscan proyectar clase atemporal y exclusividad. Disponible en presentaciones de 30ml y 60ml, es ideal para perfumes que desean destacar con estilo refinado."
        },
        {
            id: 11,
            name: "CILINDRO",
            image: "img/CILINDRO.jpeg",
            material : "Vidrio",
            sizes: ["100ml" ],
            price: 0,
            description: "Un envase que transmite solidez y equilibrio gracias a su forma geométrica. Su diseño cilíndrico refleja estabilidad y fuerza, convirtiéndolo en la opción ideal para fragancias intensas y duraderas. Con capacidad de 100ml, es perfecto para perfumes que buscan presencia y resistencia en un formato elegante y versátil."
        },
        {
            id: 3,
            name: "EROS",
            image: "img/EROS.jpeg",
            material : "Vidrio",
            sizes: [ "60ml" ],
            price: 0,
            description: "Un envase que simboliza pasión y magnetismo. Su nombre evoca al dios del amor, transmitiendo energía, seducción y modernidad. Perfecto para fragancias intensas que buscan despertar emociones y dejar una huella inolvidable. Con su formato de 60ml, es ideal para perfumes que desean combinar fuerza y elegancia en cada presentación."
        },
        {
            id: 4,
            name: "VICTORY",
            image: "img/VICTORY.jpeg",
            material : "Vidrio",
            sizes: ["60ml"],
            price: 0,
            description: "Un envase que representa triunfo y superación. Su nombre transmite fuerza, confianza y éxito, convirtiéndolo en la elección perfecta para fragancias que celebran logros personales y momentos de grandeza. Con capacidad de 60ml, es ideal para perfumes que buscan proyectar energía positiva y determinación en cada aplicación."        
        },
        {
            id: 5,
            name: "GOOD GIRL",
            image: "img/GOOD_GIRL.jpeg",
            material : "Vidrio",
            sizes: ["30ml"],
            price: 0,
            description: "Un envase que refleja frescura y modernidad. Su nombre evoca feminidad encantadora y divertida, ideal para fragancias juveniles que acompañan el día a día con estilo. Con su formato de 30ml, es perfecto para perfumes prácticos y versátiles que transmiten confianza y dulzura en cada aplicación."
        },
        {
            id: 6,
            name: "CALAVERA",
            image: "img/calavera1.jpeg",
            material : "Vidrio",
            sizes: ["50ml"],
            price: 0,
            description: "Un envase llamativo y original que transmite rebeldía y misterio. Su nombre evoca fuerza y personalidad única, convirtiéndolo en la elección perfecta para fragancias temáticas o coleccionables. Con capacidad de 50ml, es ideal para perfumes que buscan destacar con un diseño atrevido y memorable."
        },
        {
            id: 7,
            name: "MINI YARA",
            image: "img/yaritas.jpeg",
            material : "Vidrio",
            sizes: ["30ml"],
            price: 0,
            description: "Un envase compacto y elegante que refleja delicadeza y feminidad. Su nombre evoca encanto y sofisticación, convirtiéndolo en la opción ideal para fragancias suaves y exclusivas en formato pequeño. Con capacidad de 30ml, es perfecto para perfumes que desean transmitir ternura y estilo en cada detalle."
        },
        {
            id: 8,
            name: "VALENTINO",
            image: "img/VALENTINO_BOTTLE.jpeg",
            material : "Vidrio",
            sizes: ["30ml","60ml"],
            price: 0,
            description: "Un envase que refleja moda, sofisticación y exclusividad. Su nombre evoca el glamour de las pasarelas y la elegancia italiana, convirtiéndolo en la opción perfecta para fragancias modernas que buscan proyectar estilo y distinción. Disponible en presentaciones de 30ml y 60ml, es ideal para perfumes que desean transmitir lujo y personalidad en cada detalle."
        },
        {
            id: 9,
            name: "SAUVAGE",
            image: "img/SAUVAGE_BOTTLE.jpeg",
            material : "Vidrio",
            sizes: ["30ml"],
            price: 0,
            description: "Un envase que transmite libertad y frescura. Su nombre evoca naturaleza indomable y fuerza interior, convirtiéndolo en la opción perfecta para fragancias masculinas y versátiles. Con capacidad de 30ml, es ideal para perfumes que buscan proyectar autenticidad, energía y un estilo minimalista en cada presentación."
        },
        {
            id: 10,
            name: "MOSCHINO BEAR",
            image: "img/MOSCHINO_BEAR.jpeg",
            material : "Vidrio",
            sizes: ["60ml"],
            price: 0,
            description: "Un envase que combina lujo y originalidad con un toque juguetón. Su nombre evoca el estilo irreverente y sofisticado de la moda internacional, convirtiéndolo en la opción perfecta para fragancias modernas que buscan destacar con personalidad única. Con capacidad de 60ml, es ideal para perfumes que transmiten extravagancia, creatividad y un encanto exclusivo."
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