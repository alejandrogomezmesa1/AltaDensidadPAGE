document.addEventListener('DOMContentLoaded', function() {
    // Datos de productos
    const products = [
        {
            id: 1,
            name: "212 VIP Rose",
            price: 16.000,
            rating: 5,
            image: "212-vip-rose.jpg",
            category: "Inspiradas en Marcas",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Cilindro", "Cartier","Swarosky"],
        },
        {
            id: 2,
            name: "LIGHT BLUE DOLCE & GABBANA",
            price: 16.000,
            rating: 5,
            image: "ligth_blue.jpg",
            category: "Inspiradas en Marcas",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Cilindro", "Cartier","Swarosky"],
        },
        {
            id: 3,
            name: "YARA LATAFFA",
            price: 18.000,
            rating: 5,
            image: "YARA_LATAFFA.jpg",
            category: "Inspiradas en Marcas",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Cilindro", "Cartier","Swarosky"],
        },
        {
            id: 4,
            name: "AHLI KARPOS",
            price: 18.000,
            rating: 5,
            image: "AHLI_KARPOS.jpeg",
            category: "Inspiradas en Marcas",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Cilindro", "Cartier","Swarosky"],
        },
        {
            id: 5,
            name: " COCO MADEMOISELLE CHANNEL",
            price: 16.000,
            rating: 5,
            image: "COCO.jpg",
            category: "Inspiradas en Marcas",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Cilindro", "Cartier","Swarosky"],
        },
        {
            id: 6,
            name: "IL ROSO DE ILMIN",
            price: 16.000,
            rating: 4,
            image: "IL_ROSO.jpg",
            category: "Inspiradas en Marcas",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Cilindro", "Cartier","Swarosky"],
        },
        {
            id: 7,
            name: "GOOD GIRL CAROLINA HERRERA",
            price: 16.000,
            rating: 5,
            image: "GOOD_GIRL.jpg",
            category: "Inspiradas en Marcas",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
        },
        {
            id: 8,
            name: "CLOUD ARIANA GRANDE",
            price: 16.000,
            rating: 4,
            image: "CLOUD_ARIANA.webp",
            category: "Inspiradas en Marcas",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
        },
        {
            id: 9,
            name: "HEIRESS PARIS HILTON",
            price: 16.000,
            rating: 4,
            image: "HEIRESS.jpeg",
            category: "Inspiradas en Marcas",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
        },
        {
            id: 10,
            name: "MAYAR  LATTAFA",
            price: 18.000,
            rating: 5,
            image: "MAYAR_LATTAFA.jpg",
            category: "Inspiradas en Marcas",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
        }, 
        {
            id: 11,
            name: "DONNA BORN IN ROMA VALENTINO",
            price: 16.000,
            rating: 4,
            image: "DONNA_BORN_IN_ROMA.jpeg",
            category: "Inspiradas en Marcas",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
        },        
        {
            id: 12,
            name: " TOY 2 BUBBLE GUM MOSCHINO",
            price: 16.000,
            rating: 4,
            image: "TOY_2_BUBBLE_GUM.jpg",
            category: "Inspiradas en Marcas",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
        },        
        {
            id: 13,
            name: " BOND NO. 9 BLEECKER STREET",
            price: 16.000,
            rating: 4,
            image: "BOND_NO.9_BLEECKER.jpg",
            category: "Inspiradas en Marcas",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
        },         
        {
            id: 14,
            name: " BADE AL OUD HONOR & GLORY LATAFFA BLANCA",
            price: 18.000,
            rating: 5,
            image: "BADE_AL_OUD_HONOR.png",
            category: "Inspiradas en Marcas",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
        },         
        {
            id: 15,
            name: " BADEE AL OUD SUBLIME LATAFFA ROJA",
            price: 18.000,
            rating: 4,
            image: "ADEE_AL_OUD_SUBLIME.webp",
            category: "Inspiradas en Marcas",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
        },         
        {
            id: 16,
            name: "BADE’E AL OUD AMETHYST LATAFFA MORADA",
            price: 18.000,
            rating: 5,
            image: "BADE’E_AL_OUD.png",
            category: "Inspiradas en Marcas",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
        },         
        {
            id: 17,
            name: "SANTAL 33",
            price: 16.000,
            rating: 4,
            image: "SANTAL_33.jpg",
            category: "Inspiradas en Marcas",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
        },        
        {
            id: 18,
            name: "AMBER OUD GOLD EDITION AL HARAMAIN",
            price: 18.000,
            rating: 5,
            image: "AMBER_OUD_GOLD.jpeg",
            category: "Inspiradas en Marcas",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
        },         
        {
            id: 19 ,
            name: "AMBER ROUGE",
            price: 18.000,
            rating: 4,
            image: "AMBER_ROUGE.jpg",
            category: "Inspiradas en Marcas",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
        },         
        {
            id: 20,
            name: " ARABIANS TONKA MONTALE",
            price: 18.000,
            rating: 4,
            image: "ARABIANS_TONKA.jpg",
            category: "Inspiradas en Marcas",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
        },         
        {
            id: 21,
            name: "ETERNITY AQUA CALVIN KLEIN",
            price: 16.000,
            rating: 4,
            image: "ETERNITY_AQUA.jpg",
            category: "Inspiradas en Marcas",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
        },         
        {
            id: 22,
            name: "DIOR SAUVAGE",
            price: 16.000,
            rating: 4,
            image: "DIORSAUVAGE.PNG",
            category: "Inspiradas en Marcas",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
        },         
        {
            id: 23,
            name: "ACQUA DI GIO GIORGIO ARMANI",
            price: 16.000,
            rating: 4,
            image: "ACQUA_DI_GIO.jpg",
            category: "Inspiradas en Marcas",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
        },         
        {
            id: 24,
            name: "IL ORGASME ILMIN",
            price: 16.000,
            rating: 4,
            image: "IL_ORGASME_ILMIN.webp",
            category: "Inspiradas en Marcas",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
        },         
        {
            id: 25,
            name: "212 VIP Black",
            price: 16.000,
            rating: 5,
            image: "VIP_212_BLACK.jpg",
            category: "Inspiradas en marcas",
            sizes: ["30ml", "60ml","100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
        },
        {
            id: 26,
            name: "BORN IN ROMO VALENTINO",
            price: 16.000,
            rating: 4,
            image: "VALENTINO_BON_IN.jpg",
            category: "Inspiradas en Marcas",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
        },
        {
            id: 27,
            name: "MANDARIN SKY ODYSSEY",
            price: 18.000,
            rating: 5,
            image: "ODYSSEY_MANDARIN.png",
            category: "Inspiradas en Marcas",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
        },        
        {
            id: 28,
            name: "LACOSTE BLANCA",
            price: 16.000,
            rating: 4,
            image: "LACOSTE_BLANCA.png",
            category: "Inspiradas en Marcas",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
        },
        {
            id: 29,
            name: "ONE MILLON MILLION DE PACO RABANNE",
            price: 16.000,
            rating: 4,
            image: "ONE_MILLON.jpg",
            category: "Inspiradas en Marcas",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
        }, 
        {
            id: 30,
            name: "CAN CAN PARIS HILTON",
            price: 16.000,
            rating: 4,
            image: "CAN_CAN_PARIS.jpg",
            category: "Inspiradas en Marcas",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
        }  
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
                    <div class="product-price">${product.price.toFixed(3)}$</div>
                    <div class="product-rating" title="${product.rating} estrellas">${stars}</div>
                </div>
            `;
            
            productGrid.appendChild(productCard);
        });
    }
    
    // Inicializar
    displayProducts(products);
    
});
