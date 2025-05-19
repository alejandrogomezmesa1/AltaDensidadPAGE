document.addEventListener('DOMContentLoaded', function() {
    // Datos de productos
    const products = [
        {
            id: 1,
            name: "YARA LATTAFA",
            price: 18.000,
            rating: 5,
            image: "img/YARA_LATTAFA2.jpg",
            category: "Inspiradas en Marcas",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "Familia olfativa ambar-vainilla. Confeccionado en paño de alta calidad, este saco ofrece una combinación perfecta de sofisticación está diseñado principalmente para mujeres que buscan una fragancia dulce, sofisticada y con un toque moderno y comodidad."
        },
        {
            id: 2,
            name: "MAYAR  LATTAFA",
            price: 18.000,
            rating: 5,
            image: "img/MAYAR_LATTAFA.jpg",
            category: "Inspiradas en Marcas",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "Nuestra interpretación de la fragancia floral con notas de tuberosa y jazmín."
        },
        {
            id: 3,
            name: "BADE AL OUD HONOR & GLORY LATTAFA BLANCA",
            price: 18.000,
            rating: 5,
            image: "img/BADE_AL_OUD_HONOR.png",
            category: "Inspiradas en Marcas",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "Familia olfativa oriental amaderada. Es una fragancia unisex, diseñada para quienes buscan un aroma sofisticado, cálido y con un toque especiado. Es ideal para ocasiones especiales o para quienes desean destacar con un perfume único y elegante."
        },
        {
            id: 4,
            name: "GOOD GIRL CAROLINA HERRERA",
            price: 16.000,
            rating: 4,
            image: "img/GOOD_GIRL.jpg",
            category: "Inspiradas en Marcas",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "Familia olfativa oriental floral. Es una fragancia icónica que celebra la dualidad de la mujer moderna: audaz y sensual, pero también elegante y enigmática."
        },
        {
            id: 5,
            name: " LIGHT BLUE DOLCE & GABBANA",
            price: 16.000,
            rating: 4,
            image: "img/ligth_blue.jpg",
            category: "Inspiradas en Marcas",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "Familia olfativa floral- frutal. Está pensado principalmente para aquellos que buscan una fragancia fresca, vibrante y ligera."
        },
        {
            id: 6,
            name: "AHLI KARPOS",
            price: 18.000,
            rating: 4,
            image: "img/AHLI_KARPOS.jpeg",
            category: "Inspiradas en Marcas",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "Familia olfativa floral-frutal. Es perfecto para ocasiones informales durante el día, como reuniones con amigos, y también para eventos más formales en la noche, como cenas o salidas culturales."
        },
        {
            id: 7,
            name: " COCO MADEMOISELLE CHANNEL",
            price: 16.000,
            rating: 4,
            image: "img/COCO.jpg",
            category: "Inspiradas en Marcas",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "Familia olfativa oriental floral. Está dirigido principalmente a mujeres jóvenes y adultas que buscan un perfume que refleje confianza, independencia y feminidad. Es ideal para quienes desean un aroma versátil, adecuado tanto para el día como para la noche, y que proyecte una imagen de sofisticación con un toque de rebeldía."
        },
        {
            id: 8,
            name: "MANDARIN SKY ODYSSEY",
            price: 18.000,
            rating: 4,
            image: "img/ODYSSEY_MANDARIN.png",
            category: "Inspiradas en Marcas",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "Familia olfativa floriental. Es conocida por su carácter fresco, dulce y sofisticado, ideal para hombres modernos que buscan un aroma distintivo y versátil, gracias a su equilibrio entre frescura y sofisticación."
        },
        {
            id: 9,
            name: "212 VIP Rose",
            price: 16.000,
            rating: 5,
            image: "img/212-vip-rose.jpg",
            category: "Inspiradas en Marcas",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "Familia olfativa floral- frutal. Es un aroma juvenil y es ideal si buscas un perfume fresco pero dulce."
        },
        {
            id: 10,
            name: "212 VIP Black",
            price: 16.000,
            rating: 4,
            image: "img/VIP_212_BLACK.jpg",
            category: "Inspiradas en marcas",
            sizes: ["30ml", "60ml","100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "Familia olfativa oriental amaderada. Fragancia masculina, conocida por su carácter audaz, seductor y moderno, ideal para hombres que buscan destacar en eventos nocturnos o en ocasiones especiales."
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
                <div class="product-price">$${product.price}</div>
                <div class="product-category">${product.category}</div>

            </div>
        `;
            
            productGrid.appendChild(productCard);
        });
    }
    
    // Inicializar
    displayProducts(products);
    
});