/**
 * Seeds router — admin-only endpoints to populate the database.
 * POST /api/seeds/admin    → creates or promotes the admin user
 * POST /api/seeds/envases  → inserts the catalogue of bottle types (Envases)
 * POST /api/seeds/productos → truncates and re-inserts the full product catalogue
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { getConnection } = require('../config/db');

// ---------------------------------------------------------------------------
// Seed data — Envases
// ---------------------------------------------------------------------------
const envases = [
    { name: 'AMIRA', image: 'img/AMIRA.jpeg', material: 'Vidrio', sizes: ['30ml'], price: 0, description: 'Un envase elegante y compacto de vidrio, diseñado para realzar la exclusividad de cada fragancia. Su acabado refinado transmite lujo y sofisticación, convirtiéndolo en la elección ideal para perfumes de alta densidad en presentaciones de 30ml.' },
    { name: 'CARTIER', image: 'img/cartier.jpeg', material: 'Vidrio', sizes: ['30ml', '60ml'], price: 0, description: 'Un envase que evoca la elegancia y el prestigio de la alta joyería. Su nombre transmite lujo, sofisticación y distinción, convirtiéndolo en la elección perfecta para fragancias que buscan proyectar clase atemporal y exclusividad. Disponible en presentaciones de 30ml y 60ml, es ideal para perfumes que desean destacar con estilo refinado.' },
    { name: 'CILINDRO', image: 'img/CILINDRO.jpeg', material: 'Vidrio', sizes: ['100ml'], price: 0, description: 'Un envase que transmite solidez y equilibrio gracias a su forma geométrica. Su diseño cilíndrico refleja estabilidad y fuerza, convirtiéndolo en la opción ideal para fragancias intensas y duraderas. Con capacidad de 100ml, es perfecto para perfumes que buscan presencia y resistencia en un formato elegante y versátil.' },
    { name: 'EROS', image: 'img/EROS.jpeg', material: 'Vidrio', sizes: ['60ml'], price: 0, description: 'Un envase que simboliza pasión y magnetismo. Su nombre evoca al dios del amor, transmitiendo energía, seducción y modernidad. Perfecto para fragancias intensas que buscan despertar emociones y dejar una huella inolvidable. Con su formato de 60ml, es ideal para perfumes que desean combinar fuerza y elegancia en cada presentación.' },
    { name: 'VICTORY', image: 'img/VICTORY.jpeg', material: 'Vidrio', sizes: ['60ml'], price: 0, description: 'Un envase que representa triunfo y superación. Su nombre transmite fuerza, confianza y éxito, convirtiéndolo en la elección perfecta para fragancias que celebran logros personales y momentos de grandeza. Con capacidad de 60ml, es ideal para perfumes que buscan proyectar energía positiva y determinación en cada aplicación.' },
    { name: 'GOOD GIRL', image: 'img/GOOD_GIRL.jpeg', material: 'Vidrio', sizes: ['30ml'], price: 0, description: 'Un envase que refleja frescura y modernidad. Su nombre evoca feminidad encantadora y divertida, ideal para fragancias juveniles que acompañan el día a día con estilo. Con su formato de 30ml, es perfecto para perfumes prácticos y versátiles que transmiten confianza y dulzura en cada aplicación.' },
    { name: 'CALAVERA', image: 'img/calavera1.jpeg', material: 'Vidrio', sizes: ['50ml'], price: 0, description: 'Un envase llamativo y original que transmite rebeldía y misterio. Su nombre evoca fuerza y personalidad única, convirtiéndolo en la elección perfecta para fragancias temáticas o coleccionables. Con capacidad de 50ml, es ideal para perfumes que buscan destacar con un diseño atrevido y memorable.' },
    { name: 'MINI YARA', image: 'img/yaritas.jpeg', material: 'Vidrio', sizes: ['30ml'], price: 0, description: 'Un envase compacto y elegante que refleja delicadeza y feminidad. Su nombre evoca encanto y sofisticación, convirtiéndolo en la opción ideal para fragancias suaves y exclusivas en formato pequeño. Con capacidad de 30ml, es perfecto para perfumes que desean transmitir ternura y estilo en cada detalle.' },
    { name: 'VALENTINO', image: 'img/VALENTINO_BOTTLE.jpeg', material: 'Vidrio', sizes: ['30ml', '60ml'], price: 0, description: 'Un envase que refleja moda, sofisticación y exclusividad. Su nombre evoca el glamour de las pasarelas y la elegancia italiana, convirtiéndolo en la opción perfecta para fragancias modernas que buscan proyectar estilo y distinción. Disponible en presentaciones de 30ml y 60ml, es ideal para perfumes que desean transmitir lujo y personalidad en cada detalle.' },
    { name: 'SAUVAGE', image: 'img/SAUVAGE_BOTTLE.jpeg', material: 'Vidrio', sizes: ['30ml'], price: 0, description: 'Un envase que transmite libertad y frescura. Su nombre evoca naturaleza indomable y fuerza interior, convirtiéndolo en la opción perfecta para fragancias masculinas y versátiles. Con capacidad de 30ml, es ideal para perfumes que buscan proyectar autenticidad, energía y un estilo minimalista en cada presentación.' },
    { name: 'MOSCHINO BEAR', image: 'img/MOSCHINO_BEAR.jpeg', material: 'Vidrio', sizes: ['60ml'], price: 0, description: 'Un envase que combina lujo y originalidad con un toque juguetón. Su nombre evoca el estilo irreverente y sofisticado de la moda internacional, convirtiéndolo en la opción perfecta para fragancias modernas que buscan destacar con personalidad única. Con capacidad de 60ml, es ideal para perfumes que transmiten extravagancia, creatividad y un encanto exclusivo.' },
];

// ---------------------------------------------------------------------------
// Seed data — Productos
// ---------------------------------------------------------------------------
const productos = [
    { name: '212 VIP ROSE CAROLINA HERRERA', rating: 4, image: 'img/212-vip-rose.jpg', category: 'Diseñador', gender: 'Mujer', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Cilindro', 'Cartier', 'Swarosky'], description: 'Es una fragancia femenina con un aire fresco y dinámico. Representa el glamour juvenil y la autenticidad intrépida, ideal para quienes viven la vida al máximo y destacan con seguridad' },
    { name: 'GOOD GIRL CAROLINA HERRERA', rating: 4, image: 'img/GOOD_GIRL.jpg', category: 'Diseñador', gender: 'Mujer', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'La dualidad entre la dulzura y la intensidad. Good Girl combina la frescura del jazmín y la almendra con la profundidad del cacao y el café, creando un aroma seductor y poderoso.' },
    { name: 'GOOD GIRL BLUSH CAROLINA HERRERA', rating: 4, image: 'img/GOOD_GIRL_BLUSH.png', category: 'Diseñador', gender: 'Mujer', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.' },
    { name: 'VERY GOOD GIRL CAROLINA HERRERA', rating: 4, image: 'img/VERY_GOOD_GIRL.jpg', category: 'Diseñador', gender: 'Mujer', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.' },
    { name: '212 SEXY CAROLINA HERRERA', rating: 4, image: 'img/212_SEXY.webp', category: 'Diseñador', gender: 'Mujer', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.' },
    { name: '212 VIP BLACK CAROLINA HERRERA', rating: 5, image: 'img/VIP_212_BLACK.jpg', category: 'Diseñador', gender: 'Hombre', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'La esencia de la exclusividad. Un perfume oriental especiado, con una salida de absenta y anís, seguida por un corazón de lavanda y cuero.' },
    { name: 'BOND NO. 9 BLEECKER STREET', rating: 4, image: 'img/BOND_NO.9_BLEECKER.jpg', category: 'Diseñador', gender: 'Hombre', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Un perfume intenso y seductor que combina notas de cuero, tabaco y especias.' },
    { name: 'LIGHT BLUE DOLCE & GABBANA', rating: 5, image: 'img/ligth_blue.jpg', category: 'Diseñador', gender: 'Mujer', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Cilindro', 'Cartier', 'Swarosky'], description: 'Inspirado en la frescura y sensualidad del Mediterráneo, este perfume está dirigido a personas que buscan una fragancia vibrante y juvenil.' },
    { name: 'LIGHT BLUE DOLCE & GABBANA MEN', rating: 4, image: 'img/LIGHT_BLUE_MEN.jpg', category: 'Diseñador', gender: 'Hombre', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.' },
    { name: 'SANTAL 33', rating: 4, image: 'img/SANTAL_33.jpg', category: 'Diseñador', gender: 'Unisex', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'La esencia de la sofisticación moderna. Una fragancia amanerada especiada, con notas de sándalo, cardamomo y cuero.' },
    { name: 'TOY 2 BUBBLE GUM MOSCHINO', rating: 4, image: 'img/TOY_2_BUBBLE_GUM.jpg', category: 'Diseñador', gender: 'Mujer', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Es una fragancia floral frutal con un toque divertido y juvenil. Su apertura está marcada por frutas confitadas, naranja amarga y limón.' },
    { name: 'TOY 2 PEARL MOSCHINO', rating: 4, image: 'img/TOY_PEARL.jpg', category: 'Diseñador', gender: 'Mujer', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.' },
    { name: 'TOY 2 EDP MOSCHINO', rating: 4, image: 'img/TOY2EDP.webp', category: 'Diseñador', gender: 'Mujer', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.' },
    { name: 'OLYMPEA PACO RABANNE', rating: 4, image: 'img/OLYMPEA.webp', category: 'Diseñador', gender: 'Mujer', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.' },
    { name: 'INVICTUS PACO RABANNE', rating: 5, image: 'img/INVICTUS.webp', category: 'Diseñador', gender: 'Hombre', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Cilindro', 'Cartier', 'Swarosky'], description: 'Es una fragancia que evoca la frescura tropical y la dulzura especiada. Desde el primer rocío, despierta los sentidos con una mezcla armoniosa de notas.' },
    { name: 'LEGEND MONTBLANC', rating: 4, image: 'img/LEGEND.jpg', category: 'Diseñador', gender: 'Hombre', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Cilindro', 'Cartier', 'Swarosky'], description: 'Es una fragancia que evoca la frescura tropical y la dulzura especiada. Desde el primer rocío, despierta los sentidos con una mezcla armoniosa de notas.' },
    { name: 'AHLI KARPOS', rating: 4, image: 'img/AHLI_KARPOS.jpeg', category: 'Arabe', gender: 'Unisex', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Cilindro', 'Cartier', 'Swarosky'], description: 'Es una fragancia que evoca la frescura tropical y la dulzura especiada. Desde el primer rocío, despierta los sentidos con una mezcla armoniosa de notas.' },
    { name: 'AHLI CORVUS', rating: 4, image: 'img/CORVUS.webp', category: 'Arabe', gender: 'Unisex', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Es una fragancia que combina notas frutales, florales y amaderadas, creando una experiencia olfativa sofisticada y envolvente.' },
    { name: 'AHLI VEGA', rating: 4, image: 'img/VEGA.webp', category: 'Arabe', gender: 'Unisex', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Un perfume sensual y seductor que combina notas de flores, frutas y especias.' },
    { name: 'COCO MADEMOISELLE CHANEL', rating: 4, image: 'img/COCO.jpg', category: 'Diseñador', gender: 'Mujer', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Cilindro', 'Cartier', 'Swarosky'], description: 'Un clásico moderno que encapsula la esencia de la sofisticación. Coco Mademoiselle es una fragancia oriental floral con una apertura vibrante de naranja y bergamota.' },
    { name: 'BLEU CHANEL', rating: 4, image: 'img/BLEU.jpg', category: 'Diseñador', gender: 'Hombre', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Es una fragancia amaderada aromática, con una apertura fresca de limón, menta y pimienta rosa.' },
    { name: 'OMBRE NOMADE LOUIS VUITTON', rating: 5, image: 'img/HOMBRENOMADA.webp', category: 'Diseñador', gender: 'Hombre', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.' },
    { name: 'IL ROSO DE ILMIN', rating: 4, image: 'img/IL_ROSO3.jpg', category: 'Diseñador', gender: 'Mujer', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Cilindro', 'Cartier', 'Swarosky'], description: 'Es una fragancia floral, frutal y oriental, diseñada para quienes buscan una esencia sofisticada y envolvente.' },
    { name: 'IL ORGASME ILMIN', rating: 4, image: 'img/IL_ORGASME_ILMIN.webp', category: 'Diseñador', gender: 'Hombre', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Sensualidad y magnetismo absoluto. Un perfume oriental especiado, con una apertura de frutas exóticas y especias.' },
    { name: 'IL FEMME ILMIN', rating: 4, image: 'img/FEMME.webp', category: 'Diseñador', gender: 'Mujer', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Una fragancia que evoca la frescura del verano con su mezcla de vainilla, rosa y toques polvorientos.' },
    { name: 'IL KAKUNO ILMIN', rating: 4, image: 'img/KAKUNO.jpg', category: 'Diseñador', gender: 'Unisex', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Una fragancia que evoca la frescura del verano con su mezcla de vainilla, rosa y toques polvorientos.' },
    { name: 'CLOUD ARIANA GRANDE', rating: 4, image: 'img/CLOUD_ARIANA.webp', category: 'Diseñador', gender: 'Mujer', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Cloud es una fragancia dulce y etérea, con una apertura de lavanda, pera y bergamota que aporta frescura y suavidad.' },
    { name: 'MOD VANILLA ARIANA GRANDE', rating: 4, image: 'img/MODVANILLA.jpg', category: 'Diseñador', gender: 'Mujer', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Es una fragancia frutal gourmand, con una salida vibrante de frambuesa y pera.' },
    { name: 'THANK U, NEXT ARIANA GRANDE', rating: 4, image: 'img/THANKU2.jpg', category: 'Diseñador', gender: 'Mujer', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Es una fragancia frutal gourmand, con una salida vibrante de frambuesa y pera, seguida por un corazón de rosa y coco.' },
    { name: 'BURBERRY HER', rating: 4, image: 'img/B_HER.jpeg', category: 'Diseñador', gender: 'Mujer', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.' },
    { name: 'AMOUAGE INTERLUDE', rating: 4, image: 'img/AMOUAGE.webp', category: 'Arabe', gender: 'Hombre', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.' },
    { name: 'MEOW KATTY PERY', rating: 4, image: 'img/MEOW.webp', category: 'Diseñador', gender: 'Mujer', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Un estallido de glamour y frescura. Notas de maracuyá, naranja y melocotón que encantan desde el primer instante.' },
    { name: 'HEIRESS PARIS HILTON', rating: 4, image: 'img/HEIRESS2.webp', category: 'Diseñador', gender: 'Mujer', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Un estallido de glamour y frescura. Notas de maracuyá, naranja y melocotón que encantan desde el primer instante.' },
    { name: '360 PERRY ELLIS', rating: 4, image: 'img/360.webp', category: 'Diseñador', gender: 'Mujer', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Un estallido de glamour y frescura. Notas de maracuyá, naranja y melocotón que encantan desde el primer instante.' },
    { name: 'YUM YUM ARMAF', rating: 4, image: 'img/YUMYUM.webp', category: 'Arabe', gender: 'Mujer', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.' },
    { name: 'ISLAND BLISS ARMAF', rating: 4, image: 'img/ISLANDBLISS2.webp', category: 'Arabe', gender: 'Mujer', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Inspirada en la frescura tropical, esta fragancia está diseñada para quienes buscan un aroma vibrante y exótico.' },
    { name: 'CLUB DE NUIT INTENSE (BESTIA NEGRA) ARMAF', rating: 4, image: 'img/NUIT2.jpg', category: 'Arabe', gender: 'Hombre', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Club de Nuit Intense es una fragancia cítrica y amaderada con una salida de limón, piña y grosella negra.' },
    { name: 'CLUB DE NUIT WOMAN ARMAF', rating: 5, image: 'img/NUIT_WOMAN.webp', category: 'Arabe', gender: 'Mujer', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.' },
    { name: '9PM AFNAN', rating: 4, image: 'img/9PM2.png', category: 'Arabe', gender: 'Hombre', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Seducción nocturna en su máxima expresión. Un perfume dulce y especiado, con una salida de manzana y canela.' },
    { name: 'ODYSSEY MANDARIN SKY ARMAF', rating: 5, image: 'img/ODYSSEY_MANDARIN.png', category: 'Arabe', gender: 'Unisex', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Sumérgete en la esencia vibrante y seductora de Odyssey Mandarin Sky, una fragancia masculina que equilibra la frescura cítrica con la calidez envolvente.' },
    { name: 'ODYSSEY CHOCOLATE DUBAI ARMAF', rating: 4, image: 'img/ODYSEYCHOCOLATE.jpg', category: 'Arabe', gender: 'Unisex', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Un perfume dulce y sensual que combina notas de chocolate, vainilla y caramelos.' },
    { name: 'ODYSSEY CANDEE ARMAF', rating: 4, image: 'img/ODYSEYCANDEE2.jpeg', category: 'Arabe', gender: 'Mujer', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.' },
    { name: 'ODYSSEY MEGA ARMAF', rating: 4, image: 'img/ODYSEYMEGA.jpeg', category: 'Arabe', gender: 'Unisex', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.' },
    { name: 'ODYSSEY SPECTRA ARMAF', rating: 4, image: 'img/ODYSEYSPECTRA.webp', category: 'Arabe', gender: 'Unisex', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.' },
    { name: 'BHARARA ROSE', rating: 4, image: 'img/BHARARAROSE.jpg', category: 'Arabe', gender: 'Mujer', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: '' },
    { name: 'BHARARA KING', rating: 5, image: 'img/BHARARAKING.webp', category: 'Arabe', gender: 'Hombre', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.' },
    { name: 'BHARARA NICHE', rating: 4, image: 'img/BHARARANICHE.webp', category: 'Arabe', gender: 'Unisex', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: '' },
    { name: 'YARA CANDY LATTAFA', rating: 4, image: 'img/CANDY.jpg', category: 'Arabe', gender: 'Mujer', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Dirigida a quienes aman los perfumes dulces y refrescantes, esta fragancia es perfecta para personas con un espíritu alegre y juvenil.' },
    { name: 'YARA LATTAFA', rating: 5, image: 'img/YARA_LATTAFA2.jpg', category: 'Arabe', gender: 'Mujer', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Cilindro', 'Cartier', 'Swarosky'], description: 'Es una fragancia oriental dulce y sofisticada, diseñada principalmente para mujeres que buscan un aroma envolvente y elegante.' },
    { name: 'ASAD LATTAFA', rating: 4, image: 'img/ASAD_BLACK.jpg', category: 'Arabe', gender: 'Hombre', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.' },
    { name: 'MAYAR INTENSE LATTAFA', rating: 4, image: 'img/MAYARINTENSE.jpg', category: 'Arabe', gender: 'Mujer', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Un perfume fresco y cítrico que evoca la esencia de la naturaleza.' },
    { name: 'MAYAR LATTAFA', rating: 5, image: 'img/MAYAR_LATTAFA.jpg', category: 'Arabe', gender: 'Mujer', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Es una declaración de elegancia y sensualidad, una fragancia que envuelve los sentidos desde el primer instante.' },
    { name: 'MAYAR CHERRY LATTAFA', rating: 4, image: 'img/MAYAR_LATTAFA_CHERRY.webp', category: 'Arabe', gender: 'Mujer', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Es una declaración de elegancia y sensualidad, una fragancia que envuelve los sentidos desde el primer instante.' },
    { name: "BADE´E AL OUD HONOR & GLORY LATTAFA BLANCA", rating: 4, image: 'img/BADE_AL_OUD_HONOR.png', category: 'Arabe', gender: 'Unisex', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Poder y presencia en cada gota. Una fragancia amaderada y especiada, con notas de bergamota, pimienta negra y lavanda.' },
    { name: 'BADEE AL OUD SUBLIME LATTAFA ROJA', rating: 4, image: 'img/ADEE_AL_OUD_SUBLIME.webp', category: 'Arabe', gender: 'Unisex', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Un lujo afrutado y envolvente. Una fragancia amaderada aromática, con notas de frutas tropicales, rosa y vainilla.' },
    { name: "BADE´E AL OUD AMETHYST LATTAFA MORADA", rating: 4, image: "img/BADE'E_AL_OUD.png", category: 'Arabe', gender: 'Unisex', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Misterio y elegancia en cada gota. Un perfume oriental floral, con una apertura de bergamota y pimienta rosa.' },
    { name: "BADE´E AL OUD FOR GLORY LATTAFA NEGRA", rating: 4, image: 'img/LATTAFANEGRA.png', category: 'Arabe', gender: 'Unisex', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Un perfume misterioso y sensual que combina notas de flores oscuras, cuero y especias.' },
    { name: "BADE´E AL OUD NOBLE BLUSH LATTAFA", rating: 4, image: 'img/NOBLEBLUSH.jpeg', category: 'Arabe', gender: 'Mujer', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Dirigida a quienes buscan una fragancia dulce y sofisticada, con un toque gourmand.' },
    { name: 'KHAMRAH LATTAFA', rating: 4, image: 'img/KHAMRAH.jpg', category: 'Arabe', gender: 'Unisex', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.' },
    { name: 'AMBER OUD GOLD EDITION AL HARAMAIN', rating: 4, image: 'img/AMBER_OUD_GOLD.jpeg', category: 'Arabe', gender: 'Unisex', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Oro líquido en un frasco. Un perfume oriental amaderado, con una salida de bergamota y notas verdes.' },
    { name: 'AMBER ROUGE ORIENTICA', rating: 5, image: 'img/AMBER_ROUGE.jpg', category: 'Arabe', gender: 'Unisex', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Intensidad y pasión en cada rocío. Inspirado en Baccarat Rouge 540, combina jazmín, azafrán y ámbar gris.' },
    { name: 'VELVET GOLF ORIENTICA', rating: 4, image: 'img/VELVET_GOLD.webp', category: 'Arabe', gender: 'Unisex', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.' },
    { name: 'AMBER NOIR ORIENTICA', rating: 4, image: 'img/AMBER_NOIR.jpg', category: 'Arabe', gender: 'Unisex', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.' },
    { name: 'AZURE ORIENTICA', rating: 4, image: 'img/AMBER_AZURE.jpeg', category: 'Arabe', gender: 'Unisex', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.' },
    { name: 'ROYAL BLEU ORIENTICA', rating: 4, image: 'img/AMBER_BLEU.webp', category: 'Arabe', gender: 'Unisex', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.' },
    { name: 'ROYAL AMBER ORIENTICA', rating: 4, image: 'img/AMBER_ROYAL.webp', category: 'Arabe', gender: 'Unisex', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.' },
    { name: 'ERBA PURA XERJOFF', rating: 4, image: 'img/ERBA_PURA.avif', category: 'Arabe', gender: 'Unisex', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.' },
    { name: 'NAXOS XERJOFF', rating: 4, image: 'img/NAXOS.jpeg', category: 'Arabe', gender: 'Unisex', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.' },
    { name: 'ARABIANS TONKA MONTALE', rating: 4, image: 'img/ARABIANS_TONKA.jpg', category: 'Arabe', gender: 'Hombre', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Montale Poder y misterio en una fragancia. Un perfume oriental especiado, con una apertura de azafrán y bergamota.' },
    { name: 'ETERNITY AQUA CALVIN KLEIN', rating: 4, image: 'img/ETERNITY_AQUA.jpg', category: 'Diseñador', gender: 'Hombre', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Frescura y elegancia atemporal. Una fragancia acuática amaderada, con notas de pepino, cítricos y lavanda.' },
    { name: 'IN 2U HER CALVIN KLEIN', rating: 4, image: 'img/IN2UHER.jpg', category: 'Diseñador', gender: 'Mujer', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Un perfume sensual y femenino que combina notas de bergamota, flor de azahar y ámbar.' },
    { name: 'DIOR SAUVAGE', rating: 5, image: 'img/DIORSAUVAGE.PNG', category: 'Diseñador', gender: 'Hombre', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'La fuerza de la naturaleza en un frasco. Un perfume amaderado aromático, con una salida de bergamota y pimienta.' },
    { name: 'MISS DIOR', rating: 4, image: 'img/MISSDIOR.jpg', category: 'Diseñador', gender: 'Mujer', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.' },
    { name: 'ACQUA DI GIO GIORGIO ARMANI', rating: 4, image: 'img/ACQUA_DI_GIO.jpg', category: 'Diseñador', gender: 'Hombre', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'La frescura del mar en cada rocío. Una fragancia acuática cítrica, con notas de bergamota, neroli y romero.' },
    { name: 'AQUA DI GIO PROFONDO ARMANI', rating: 4, image: 'img/DI_GIO_PROFONDO.webp', category: 'Diseñador', gender: 'Hombre', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.' },
    { name: 'BORN IN ROMA VALENTINO', rating: 4, image: 'img/BORN_IN_ROMA.jpg', category: 'Diseñador', gender: 'Hombre', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'La sofisticación italiana en un frasco. Una fragancia amaderada especiada, con una apertura vibrante de salvia y jengibre.' },
    { name: 'DONNA BORN IN ROMA VALENTINO', rating: 4, image: 'img/DONNA_BORN_IN_ROMA.jpeg', category: 'Diseñador', gender: 'Mujer', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Inspirada en la elegancia de Roma, esta fragancia está dirigida a mujeres que buscan un perfume sofisticado y moderno.' },
    { name: 'BORN IN ROMA INTENSE VALENTINO', rating: 4, image: 'img/VALENTINO_INTENSE.jpg', category: 'Diseñador', gender: 'Mujer', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.' },
    { name: 'LACOSTE BLANCA', rating: 4, image: 'img/LACOSTE_BLANCA.png', category: 'Diseñador', gender: 'Hombre', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'La esencia de la elegancia deportiva. Un aroma fresco y limpio, con notas de pomelo, cardamomo y ylang-ylang.' },
    { name: 'LACOSTE RED STYLE IN PLAY', rating: 4, image: 'img/LCRED.jpg', category: 'Diseñador', gender: 'Hombre', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Lacoste Red es una fragancia fresca y afrutada con una salida de manzana verde y maclura.' },
    { name: 'LACOSTE SENSUELLE', rating: 4, image: 'img/LACOSTESENSUAL.jpg', category: 'Diseñador', gender: 'Mujer', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Lacoste Red es una fragancia fresca y afrutada con una salida de manzana verde y maclura.' },
    { name: 'ONE MILLON MILLION PACO RABANNE', rating: 4, image: 'img/ONE_MILLON.jpg', category: 'Diseñador', gender: 'Hombre', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Lujo y audacia en cada gota. Una fragancia amaderada especiada, con una apertura de toronja y menta.' },
    { name: "BLACK XS L´APHRODISIAQUE PACO RABANNE", rating: 4, image: 'img/LAPHRODISIAQUE2.jpg', category: 'Diseñador', gender: 'Hombre', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Lujo y audacia en cada gota. Una fragancia amaderada especiada, con una apertura de toronja y menta.' },
    { name: 'EROS EAU DE TOILETTE VERSACE', rating: 4, image: 'img/EROS.webp', category: 'Diseñador', gender: 'Hombre', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Inspirado en la mitología griega, es una fragancia amaderada aromática, que exuda poder y seducción.' },
    { name: 'EROS ENERGY VERSACE', rating: 4, image: 'img/EROS_ENERGY.jpg', category: 'Diseñador', gender: 'Hombre', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.' },
    { name: 'EROS FLAME VERSACE', rating: 4, image: 'img/EROS_FLAME.webp', category: 'Diseñador', gender: 'Hombre', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.' },
    { name: 'SANTAL BOISE VERSACE', rating: 4, image: 'img/SANTALBOISE.webp', category: 'Diseñador', gender: 'Hombre', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Cilindro', 'Cartier', 'Swarosky'], description: 'Es una fragancia que evoca la frescura tropical y la dulzura especiada.' },
    { name: 'BOSS BOTTLED ABSOLUTE HUGO BOSS', rating: 4, image: 'img/BOTTLED3.jpg', category: 'Diseñador', gender: 'Hombre', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: '' },
    { name: 'UNLIMITED HUGO BOSS', rating: 4, image: 'img/UNLIMITED2.JPG', category: 'Diseñador', gender: 'Hombre', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Un perfume masculino y sofisticado que combina notas de bergamota, lavanda y madera.' },
    { name: 'HUGO NIGHT HUGO BOSS', rating: 4, image: 'img/HUGO_NIGHT.webp', category: 'Diseñador', gender: 'Hombre', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.' },
    { name: 'BOSS SILVER HUGO BOSS', rating: 4, image: 'img/HUGO_SILVER.jpg', category: 'Diseñador', gender: 'Hombre', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.' },
    { name: 'OMNIA CORAL BVLGARI', rating: 4, image: 'img/OMNIA_CORAL.webp', category: 'Diseñador', gender: 'Mujer', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.' },
    { name: 'OMNIA CRYSTALLINE BVLGARI', rating: 5, image: 'img/OMNIA_CRISTAL.jpeg', category: 'Diseñador', gender: 'Mujer', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.' },
    { name: 'OMNIA AMETHYSTE BVLGARI', rating: 4, image: 'img/CORAL_AMETHYSTE.jpeg', category: 'Diseñador', gender: 'Mujer', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.' },
    { name: 'YOU ESIKA', rating: 4, image: 'img/YOU.webp', category: 'Diseñador', gender: 'Mujer', sizes: ['30ml', '60ml', '100ml'], bottleTypes: ['Singler', 'Cartier', 'Swarosky'], description: 'Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.' },
];

// ---------------------------------------------------------------------------
// POST /api/seeds/admin
// Creates the admin superuser or promotes an existing user to admin role.
// ---------------------------------------------------------------------------
router.post('/admin', async (req, res) => {
    console.log('[seed-admin] Iniciando seed de administrador...');
    try {
        const ADMIN = {
            nombre: 'Administrador',
            email: process.env.ADMIN_EMAIL || 'admin@altadensidad.com',
            password: process.env.ADMIN_PASSWORD || 'CambiaMeAntesDeEjecutar',
        };

        const pool = await getConnection();
        const [existe] = await pool.query('SELECT id, rol FROM Usuarios WHERE email = ?', [ADMIN.email]);

        if (existe.length > 0) {
            const u = existe[0];
            if (u.rol === 'admin') {
                console.log(`[seed-admin] ✔ El admin ya existe (id: ${u.id}). No se creó uno nuevo.`);
                return res.json({ success: true, message: `El admin ya existe (id: ${u.id}). No se creó uno nuevo.` });
            }
            await pool.query("UPDATE Usuarios SET rol = 'admin' WHERE email = ?", [ADMIN.email]);
            console.log(`[seed-admin] ✔ Usuario existente promovido a admin (id: ${u.id}).`);
            return res.json({ success: true, message: `Usuario existente promovido a admin (id: ${u.id}).` });
        }

        const password_hash = await bcrypt.hash(ADMIN.password, 10);
        const [result] = await pool.query(
            "INSERT INTO Usuarios (nombre, email, password_hash, rol) VALUES (?, ?, ?, 'admin')",
            [ADMIN.nombre, ADMIN.email, password_hash]
        );
        const [rows] = await pool.query('SELECT id, nombre, email, rol FROM Usuarios WHERE id = ?', [result.insertId]);
        const admin = rows[0];

        console.log(`[seed-admin] ✔ Superusuario creado: id=${admin.id}, email=${admin.email}, rol=${admin.rol}`);
        res.status(201).json({
            success: true,
            message: 'Superusuario creado correctamente.',
            data: { id: admin.id, nombre: admin.nombre, email: admin.email, rol: admin.rol },
        });
    } catch (err) {
        console.error('[seed-admin] Error:', err.message);
        res.status(500).json({ success: false, message: 'Error al ejecutar seed de admin.', error: err.message });
    }
});

// ---------------------------------------------------------------------------
// POST /api/seeds/envases
// Inserts the full catalogue of bottle types (Envases + EnvaseTallas).
// Skips entries that already exist by name to allow safe re-runs.
// ---------------------------------------------------------------------------
router.post('/envases', async (req, res) => {
    console.log(`[seed-envases] Iniciando seed de ${envases.length} envases...`);
    const pool = await getConnection();
    let creados = 0;
    let omitidos = 0;
    let errores = 0;
    const detalles = [];

    for (const envase of envases) {
        const conn = await pool.getConnection();
        try {
            const [existe] = await conn.query('SELECT id FROM Envases WHERE nombre = ?', [envase.name]);
            if (existe.length > 0) {
                console.log(`[seed-envases]   ↷ ${envase.name} (ya existe, omitido)`);
                detalles.push({ name: envase.name, status: 'omitido' });
                omitidos++;
                conn.release();
                continue;
            }

            await conn.beginTransaction();
            const [result] = await conn.query(
                'INSERT INTO Envases (nombre, imagen, material, descripcion, precio) VALUES (?, ?, ?, ?, ?)',
                [envase.name, envase.image || '', envase.material, envase.description || '', envase.price || 0]
            );
            const nuevoId = result.insertId;
            if (Array.isArray(envase.sizes)) {
                for (const talla of envase.sizes) {
                    await conn.query('INSERT INTO EnvaseTallas (envase_id, talla) VALUES (?, ?)', [nuevoId, talla]);
                }
            }
            await conn.commit();
            console.log(`[seed-envases]   ✔ ${envase.name}`);
            detalles.push({ name: envase.name, status: 'creado', id: nuevoId });
            creados++;
        } catch (err) {
            await conn.rollback().catch(() => {});
            console.error(`[seed-envases]   ✘ ${envase.name}: ${err.message}`);
            detalles.push({ name: envase.name, status: 'error', error: err.message });
            errores++;
        } finally {
            conn.release();
        }
    }

    console.log(`[seed-envases] Completado: ${creados} creados, ${omitidos} omitidos, ${errores} errores.`);
    res.status(errores > 0 ? 207 : 200).json({
        success: errores === 0,
        message: `Seed envases completado: ${creados} creados, ${omitidos} omitidos, ${errores} errores.`,
        data: { creados, omitidos, errores, detalles },
    });
});

// ---------------------------------------------------------------------------
// POST /api/seeds/productos
// TRUNCATES the products tables and re-inserts the full catalogue.
// ---------------------------------------------------------------------------
router.post('/productos', async (req, res) => {
    console.log(`[seed-productos] Iniciando seed de ${productos.length} productos (TRUNCATE + INSERT)...`);
    const pool = await getConnection();
    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        // Disable FK checks so TRUNCATE works without constraint errors
        await conn.query('SET FOREIGN_KEY_CHECKS = 0');
        await conn.query('TRUNCATE TABLE ProductoTallas');
        await conn.query('TRUNCATE TABLE ProductoTiposEnvase');
        await conn.query('TRUNCATE TABLE Productos');
        await conn.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('[seed-productos] Tablas truncadas correctamente.');

        let insertados = 0;
        let errores = 0;
        const detalles = [];

        for (const p of productos) {
            try {
                const [result] = await conn.query(
                    'INSERT INTO Productos (nombre, rating, imagen, categoria, genero, descripcion, precio) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [p.name, p.rating || 4, p.image || '', p.category, p.gender, p.description || '', p.price || 0]
                );
                const nuevoId = result.insertId;
                if (Array.isArray(p.sizes)) {
                    for (const talla of p.sizes) {
                        await conn.query('INSERT INTO ProductoTallas (producto_id, talla) VALUES (?, ?)', [nuevoId, talla]);
                    }
                }
                if (Array.isArray(p.bottleTypes)) {
                    for (const tipo of p.bottleTypes) {
                        await conn.query('INSERT INTO ProductoTiposEnvase (producto_id, tipo_envase) VALUES (?, ?)', [nuevoId, tipo]);
                    }
                }
                console.log(`[seed-productos]   ✔ ${p.name}`);
                detalles.push({ name: p.name, status: 'insertado', id: nuevoId });
                insertados++;
            } catch (err) {
                console.error(`[seed-productos]   ✘ ${p.name}: ${err.message}`);
                detalles.push({ name: p.name, status: 'error', error: err.message });
                errores++;
            }
        }

        await conn.commit();
        console.log(`[seed-productos] Completado: ${insertados} insertados, ${errores} errores.`);
        res.status(errores > 0 ? 207 : 200).json({
            success: errores === 0,
            message: `Seed productos completado: ${insertados} insertados, ${errores} errores.`,
            data: { insertados, errores, detalles },
        });
    } catch (err) {
        await conn.rollback().catch(() => {});
        console.error('[seed-productos] Error fatal:', err.message);
        res.status(500).json({ success: false, message: 'Error al ejecutar seed de productos.', error: err.message });
    } finally {
        conn.release();
    }
});

module.exports = router;
