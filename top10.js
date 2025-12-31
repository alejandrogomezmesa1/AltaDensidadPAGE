document.addEventListener('DOMContentLoaded', function() {
    // Datos de productos
    const products = [
        {
            id: 20,
            name: "YARA LATTAFA",
            rating: 5,
            image: "img/YARA_LATTAFA2.jpg",
            category: "Arabe",
            gender: "Mujer",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Cilindro", "Cartier","Swarosky"],
            description: "Yara es una fragancia femenina que envuelve con su encanto oriental y gourmand. Diseñada para mujeres que buscan un aroma elegante y envolvente, combina notas dulces y cálidas que transmiten sofisticación y ternura."
        },
        {
            id: 5,
            name: "LIGHT BLUE DOLCE & GABBANA",
            rating: 5,
            image: "img/ligth_blue.jpg",
            category: "Diseñador",
            gender: "Mujer",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Cilindro", "Cartier","Swarosky"],
            description: "Light Blue es una fragancia femenina icónica que captura la esencia del verano mediterráneo. Su carácter vibrante y sensual la convierte en una elección ideal para mujeres que buscan un perfume fresco, juvenil y sofisticado."
        },
        {
            id: 31,
            name: "AMBER ROUGE ORIENTICA",
            rating: 5,
            image: "img/AMBER_ROUGE.jpg",
            category: "Arabe",
            gender: "Unisex",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "Amber Rouge es una fragancia unisex que transmite sofisticación y misterio. Inspirada en el icónico Baccarat Rouge 540, combina notas intensas y envolventes que conquistan desde el primer instante."
        }, 
        {
            id: 3,
            name: "212 VIP BLACK CAROLINA HERRERA",
            rating: 5,
            image: "img/VIP_212_BLACK.jpg",
            category: "Diseñador",
            gender: "Hombre",
            sizes: ["30ml", "60ml","100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "212 VIP Black es una fragancia masculina intensa y sofisticada que refleja el espíritu de la fiesta neoyorquina y la exclusividad de quienes saben destacar. Su carácter oriental especiado lo convierte en un perfume magnético y seductor."
        },
        {
            id: 82,
            name: "INVICTUS PACO RABANNE",
            rating: 5,
            image: "img/INVICTUS.webp",
            category: "Diseñador",
            gender: "Hombre",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Cilindro", "Cartier","Swarosky"],
            description: "Invictus es una fragancia masculina que simboliza la victoria, la energía y el poder. Su carácter fresco y especiado lo convierte en un perfume dinámico y seductor, pensado para hombres que disfrutan de la adrenalina y la conquista."
        },
        {
            id: 35,
            name: "DIOR SAUVAGE",
            rating: 5,
            image: "img/DIORSAUVAGE.PNG",
            category: "Diseñador",
            gender: "Hombre",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "Dior Sauvage es una fragancia masculina que transmite poder, frescura y magnetismo. Inspirada en paisajes abiertos y salvajes, combina notas aromáticas y amaderadas que reflejan libertad y carácter indomable."
        },
        {
            id: 22,
            name: "BHARARA KING",
            rating: 5,
            image: "img/BHARARAKING.webp",
            category: "Arabe",
            gender: "Hombre",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "Bharara King es una fragancia masculina que combina frescura, dulzura y un toque juguetón. Diseñada para quienes buscan un perfume alegre y versátil, transmite energía positiva y modernidad."
        },
        {
            id: 64,
            name: "CLUB DE NUIT WOMAN ARMAF",
            rating: 5,
            image: "img/NUIT_WOMAN.webp",
            category: "Arabe",
            gender: "Mujer",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier", "Swarosky"],
            description: "Club de Nuit Woman es una fragancia femenina que combina dulzura, frescura y un toque romántico. Diseñada para mujeres modernas que buscan un perfume versátil y encantador, transmite alegría y sofisticación en cada aplicación."
        },
        {
            id: 60,
            name: "OMNIA CRYSTALLINE BVLGARI",
            rating: 5,
            image: "img/OMNIA_CRISTAL.jpeg",
            category: "Diseñador",
            gender: "Mujer",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier", "Swarosky"],
            description: "Omnia Crystalline es una fragancia femenina que refleja delicadeza, frescura y sofisticación. Inspirada en la transparencia y luminosidad del cristal, transmite un aura de pureza y feminidad moderna."
        },
        {
            id: 54,
            name: "OMBRE NOMADE LOUIS VUITTON",
            rating: 5,
            image: "img/HOMBRENOMADA.webp",
            category: "Diseñador",
            gender: "Hombre",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "Ombre Nomade es una fragancia unisex de lujo que captura la esencia de los viajes y la libertad. Diseñada por Louis Vuitton, es un perfume intenso y envolvente que transmite misterio, sofisticación y exclusividad."
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
                <div class="product-rating">${stars}</div>
                
                
                <div class="product-category">${product.description}</div>

            </div>
        `;
            
            productGrid.appendChild(productCard);
        });
    }
    
    // Inicializar
    displayProducts(products);
    
});