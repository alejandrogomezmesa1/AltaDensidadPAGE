document.addEventListener('DOMContentLoaded', function() {
    // Datos de productos
    const products = [
        {
            id: 1,
            name: "212 VIP ROSE CAROLINA HERRERA",
            price: 16000,
            rating: 5,
            image: "img/212-vip-rose.jpg",
            category: "Diseñador",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Cilindro", "Cartier","Swarosky"],
            description: "Es una fragancia femenina con un aire fresco y dinámico. Representa el glamour juvenil y la autenticidad intrépida, ideal para quienes viven la vida al máximo y destacan con seguridad"
        },
        {
            id: 2,
            name: "GOOD GIRL CAROLINA HERRERA",
            price: 16000,
            rating: 5,
            image: "img/GOOD_GIRL.jpg",
            category: "Diseñador",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "La dualidad entre la dulzura y la intensidad. Good Girl combina la frescura del jazmín y la almendra con la profundidad del cacao y el café, creando un aroma seductor y poderoso. Su icónico frasco en forma de tacón refleja la esencia de una mujer fuerte y sofisticada."
        },
        {
            id: 3,
            name: "212 VIP BLACK CAROLINA HERRERA",
            price: 16000,
            rating: 5,
            image: "img/VIP_212_BLACK.jpg",
            category: "Diseñador",
            sizes: ["30ml", "60ml","100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "La esencia de la exclusividad. Un perfume oriental especiado, con una salida de absenta y anís, seguida por un corazón de lavanda y cuero. Su fondo de vainilla y almizcle le da una estela intensa y sofisticada. "
        },
        {
            id: 4,
            name: "BOND NO. 9 BLEECKER STREET",
            price: 16000,
            rating: 4,
            image: "img/BOND_NO.9_BLEECKER.jpg",
            category: "Diseñador",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "Un perfume intenso y seductor que combina notas de cuero, tabaco y especias. Un aroma complejo y sofisticado que seguro hará una declaración. Ideal para aquellos que buscan un perfume que refleje su personalidad audaz."
        },
        {
            id: 5,
            name: "LIGHT BLUE DOLCE & GABBANA",
            price: 16000,
            rating: 5,
            image: "img/ligth_blue.jpg",
            category: "Diseñador",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Cilindro", "Cartier","Swarosky"],
            description: "Inspirado en la frescura y sensualidad del Mediterráneo, este perfume está dirigido a personas que buscan una fragancia vibrante y juvenil. Su publicidad ha estado marcada por imágenes de verano, mar y romance, apelando a quienes disfrutan de un estilo de vida activo y sofisticado."
        },
        {
            id: 6,
            name: "SANTAL 33",
            price: 16000,
            rating: 4,
            image: "img/SANTAL_33.jpg",
            category: "Diseñador",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "La esencia de la sofisticación moderna. Una fragancia amanerada especiada, con notas de sándalo, cardamomo y cuero, que crean un aroma único y envolvente, ideal para quienes buscan un perfume minimalista pero impactante."
        },
        {
            id: 7,
            name: "TOY 2 BUBBLE GUM MOSCHINO",
            price: 16000,
            rating: 4,
            image: "img/TOY_2_BUBBLE_GUM.jpg",
            category: "Diseñador",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "Es una fragancia floral frutal con un toque divertido y juvenil. Su apertura está marcada por frutas confitadas, naranja amarga y limón, que aportan un dulzor chispeante. En el corazón, la rosa, moras y melocotón crean una sensación femenina y juguetona, mientras que el fondo de almizcle y cedro le da profundidad y duración. Es perfecta para quienes buscan un aroma alegre y moderno."
        },
        {
            id: 8,
            name: "AHLI KARPOS",
            price: 18000,
            rating: 5,
            image: "img/AHLI_KARPOS.jpeg",
            category: "Arabe",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Cilindro", "Cartier","Swarosky"],
            description: "Es una fragancia que evoca la frescura tropical y la dulzura especiada. Desde el primer rocío, despierta los sentidos con una mezcla armoniosa de notas que transportan a un paraíso aromático"
        },
        {
            id: 9,
            name: "AHLI CORVUS",
            price: 18000,
            rating: 4,
            image: "img/CORVUS.webp",
            category: "Arabe",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "Es una fragancia que combina notas frutales, florales y amaderadas, creando una experiencia olfativa sofisticada y envolvente. Su composición equilibra la dulzura de las frutas con la elegancia de las flores y la profundidad de las maderas, resultando en una fragancia versátil y duradera. Es ideal para quienes buscan un aroma adecuado para diversas ocasiones y estaciones del año."
        },
        {
            id: 10,
            name: "AHLI VEGA",
            price: 18000,
            rating: 4,
            image: "img/VEGA.webp",
            category: "Arabe",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "Un perfume sensual y seductor que combina notas de flores, frutas y especias. Un aroma intenso y atractivo que seguro despertará los sentidos. Ideal para aquellos que buscan un perfume que los haga sentir seguros y atractivos."
        },
        {
            id: 11,
            name: " COCO MADEMOISELLE CHANEL",
            price: 16000,
            rating: 5,
            image: "img/COCO.jpg",
            category: "Diseñador",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Cilindro", "Cartier","Swarosky"],
            description: "Un clásico moderno que encapsula la esencia de la sofisticación. Coco Mademoiselle es una fragancia oriental floral con una apertura vibrante de naranja y bergamota, seguida por un corazón de rosa y jazmín que exuda feminidad y elegancia. Su fondo de pachulí y vainilla le da profundidad y sensualidad, dejando una estela inolvidable."
        },
        {
            id: 12,
            name: "BLEU CHANEL",
            price: 16000,
            rating: 4,
            image: "img/BLEU.jpg",
            category: "Diseñador",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "Es una fragancia amaderada aromática, con una apertura fresca de limón, menta y pimienta rosa, seguida por un corazón de jengibre, nuez moscada y jazmín que aporta profundidad y carácter. Su fondo de sándalo, incienso y cedro le da una estela elegante y masculina. Es perfecta para quienes buscan un aroma sofisticado y atemporal, ideal para cualquier ocasión."
        },
        {
            id: 13,
            name: "IL ROSO DE ILMIN",
            price: 16000,
            rating: 4,
            image: "img/IL_ROSO3.jpg",
            category: "Diseñador",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Cilindro", "Cartier","Swarosky"],
            description: "Es una fragancia floral, frutal y oriental, diseñada para quienes buscan una esencia sofisticada y envolvente. Inspirada en la naturaleza intrépida, esta fragancia combina notas vibrantes y profundas que crean una experiencia olfativa única"
        },
        {
            id: 14,
            name: "IL ORGASME ILMIN",
            price: 16000,
            rating: 4,
            image: "img/IL_ORGASME_ILMIN.webp",
            category: "Diseñador",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "Sensualidad y magnetismo absoluto. Un perfume oriental especiado, con una apertura de frutas exóticas y especias, seguida por un corazón de flores blancas y maderas. Su fondo de vainilla y almizcle lo convierte en una fragancia seductora y envolvente."

        },
        {
            id: 15,
            name: "FEMME ILMIN",
            price: 16000,
            rating: 4,
            image: "img/FEMME.webp",
            category: "Diseñador",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "Una fragancia que evoca la frescura del verano con su mezcla de vainilla, rosa y toques polvorientos. Ilmin Femme es una experiencia embriagadora y exótica, perfecta para quienes buscan un perfume con un aire romántico y envolvente."
        },
        {
            id: 16,
            name: "CLOUD ARIANA GRANDE",
            price: 16000,
            rating: 4,
            image: "img/CLOUD_ARIANA.webp",
            category: "Diseñador",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "Cloud es una fragancia dulce y etérea, con una apertura de lavanda, pera y bergamota que aporta frescura y suavidad. Su corazón de crema batida, praliné y coco crea una sensación envolvente y reconfortante, mientras que el fondo de almizcle y maderas le da profundidad y sofisticación. Es perfecta para quienes buscan un aroma soñador y adictivo, con un toque moderno y juvenil."
        },
        {
            id: 17,
            name: "THANK U, NEXT ARIANA GRANDE",
            price: 16000,
            rating: 4,
            image: "img/THANKU2.jpg",
            category: "Diseñador",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "Es una fragancia frutal gourmand, con una salida vibrante de frambuesa y pera, seguida por un corazón de rosa y coco que aporta un aire femenino y juguetón. Su fondo de macarrón y almizcle le da un toque cremoso y seductor. Es ideal para quienes buscan un perfume divertido y atrevido, con una esencia dulce y empoderadora"
        },
        {
            id: 18,
            name: "HEIRESS PARIS HILTON",
            price: 16000,
            rating: 4,
            image: "img/HEIRESS2.webp",
            category: "Diseñador",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "Un estallido de glamour y frescura. Notas de maracuyá, naranja y melocotón que encantan desde el primer instante, con un fondo cálido y seductor de sándalo y almizcle. Radiante, juvenil, inolvidable."
        },
        {
            id: 19,
            name: "YARA CANDY LATTAFA",
            price: 18000,
            rating: 4,
            image: "img/CANDY.jpg",
            category: "Arabe",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "Dirigida a quienes aman los perfumes dulces y refrescantes, esta fragancia es perfecta para personas con un espíritu alegre y juvenil. "
        },
        {
            id: 20,
            name: "YARA LATTAFA",
            price: 18000,
            rating: 5,
            image: "img/YARA_LATTAFA2.jpg",
            category: "Arabe",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Cilindro", "Cartier","Swarosky"],
            description: "Es una fragancia oriental dulce y sofisticada, diseñada principalmente para mujeres que buscan un aroma envolvente y elegante. Su perfil olfativo la hace ideal para quienes disfrutan de fragancias con un toque gourmand y cálido."
        },
        {
            id: 21,
            name: "BHARARA ROSE",
            price: 18000,
            rating: 4,
            image: "img/BHARARAROSE.jpg",
            category: "Arabe",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: ""
        },
        {
            id: 22,
            name: "MAYAR INTENSE LATTAFA",
            price: 18000,
            rating: 4,
            image: "img/MAYARINTENSE.jpg",
            category: "Arabe",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "Un perfume fresco y cítrico que evoca la esencia de la naturaleza. Notas de bergamota y limón se mezclan con flores verdes para crear un aroma ligero y revitalizante. Ideal para aquellos que buscan un perfume para uso diario."
        },
        {
            id: 23,
            name: "MAYAR LATTAFA",
            price: 18000,
            rating: 5,
            image: "img/MAYAR_LATTAFA.jpg",
            category: "Arabe",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "Es una declaración de elegancia y sensualidad, una fragancia que envuelve los sentidos desde el primer instante. Su apertura vibrante con lichi y frambuesa despierta una feminidad radiante, mientras que las hojas de violeta aportan un matiz sofisticado y aterciopelado. En su corazón, la delicadeza de la rosa blanca, la peonía y el jazmín florece en una armonía irresistible, creando una aura de belleza etérea. Finalmente, la calidez del almizcle y la vainilla se funde en la piel, dejando una estela envolvente y adictiva."
        },        
        {
            id: 24,
            name: " BADE´E AL OUD HONOR & GLORY LATTAFA BLANCA",
            price: 18000,
            rating: 5,
            image: "img/BADE_AL_OUD_HONOR.png",
            category: "Arabe",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "Poder y presencia en cada gota. Una fragancia amaderada y especiada, con notas de bergamota, pimienta negra y lavanda, que se combinan con un fondo de maderas y almizcle. Diseñada para quienes buscan un aroma **fuerte y dominante, con una presencia imponente."
        },         
        {
            id: 25,
            name: " BADEE AL OUD SUBLIME LATTAFA ROJA",
            price: 18000,
            rating: 4,
            image: "img/ADEE_AL_OUD_SUBLIME.webp",
            category: "Arabe",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "Un lujo afrutado y envolvente. Una fragancia amaderada aromática, con notas de frutas tropicales, rosa y vainilla, que se combinan con un fondo cálido de maderas y almizcle."
        },         
        {
            id: 26,
            name: "BADE´E AL OUD AMETHYST LATTAFA MORADA",
            price: 18000,
            rating: 5,
            image: "img/BADE’E_AL_OUD.png",
            category: "Arabe",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "Misterio y elegancia en cada gota.  Un perfume oriental floral, con una apertura de bergamota y pimienta rosa, seguida por un corazón de rosa y jazmín. Su fondo de oud y vainilla le da una estela intensa y seductora."
        },         
        {
            id: 27,
            name: "BADE´E AL OUD FOR GLORY LATTAFA",
            price: 18000,
            rating: 4,
            image: "img/LATTAFANEGRA.png",
            category: "Arabe",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "Un perfume misterioso y sensual que combina notas de flores oscuras, cuero y especias. Un aroma intenso y seductor que seguro hará girar cabezas. Ideal para aquellos que buscan un perfume que refleje su lado más oscuro y seductor."
        },
        {
            id: 28,
            name: "BADE´E AL OUD NOBLE BLUSH LATTAFA",
            price: 18000,
            rating: 4,
            image: "img/NOBLEBLUSH.jpeg",
            category: "Arabe",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "Dirigida a quienes buscan una fragancia dulce y sofisticada, con un toque gourmand. Su combinación de leche de rosa, merengue y almendra la hace ideal para personas que prefieren aromas delicados y femeninos, con una elegancia sutil"
        },       
        {
            id: 29,
            name: "AMBER OUD GOLD EDITION AL HARAMAIN",
            price: 18000,
            rating: 5,
            image: "img/AMBER_OUD_GOLD.jpeg",
            category: "Arabe",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "Oro líquido en un frasco. Un perfume oriental amaderado, con una salida de bergamota y notas verdes, seguida por un corazón de maderas y ámbar. Su fondo de vainilla y almizcle lo convierte en una fragancia lujosa y adictiva."
        },         
        {
            id: 30,
            name: "AMBER ROUGE ORIENTICA",
            price: 18000,
            rating: 4,
            image: "img/AMBER_ROUGE.jpg",
            category: "Arabe",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "Intensidad y pasión en cada rocío. Inspirado en Baccarat Rouge 540, combina jazmín, azafrán y ámbar gris, creando un aroma profundo y sofisticado, con una estela envolvente y duradera."
        },         
        {
            id: 31,
            name: " ARABIANS TONKA MONTALE",
            price: 18000,
            rating: 4,
            image: "img/ARABIANS_TONKA.jpg",
            category: "Arabe",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "Montale Poder y misterio en una fragancia. Un perfume oriental especiado, con una apertura de azafrán y bergamota, seguida por un corazón de rosa y oud. Su fondo de haba tonka y almizcle le da una presencia intensa y magnética."
        },         
        {
            id: 32,
            name: "ETERNITY AQUA CALVIN KLEIN",
            price: 16000,
            rating: 4,
            image: "img/ETERNITY_AQUA.jpg",
            category: "Diseñador",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "Frescura y elegancia atemporal. Una fragancia acuática amaderada, con notas de pepino, cítricos y lavanda, que se combinan con un fondo de sándalo y almizcle, perfecta para quienes buscan un aroma limpio y sofisticado."

        },
        {
            id: 33,
            name:"IN 2U HER CALVIN KLEIN",
            price: 16000,
            rating: 4,
            image: "img/IN2UHER.jpg",
            category: "Diseñador",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "Un perfume sensual y femenino que combina notas de bergamota, flor de azahar y ámbar. Un aroma intenso y atractivo que seguro hará una declaración. La combinación de notas cítricas y florales crea un perfume fresco y sensual que es perfecto para aquellos que buscan un aroma que refleje su personalidad segura y atractiva."
        },         
        {
            id: 34,
            name: "DIOR SAUVAGE",
            price: 16000,
            rating: 4,
            image: "img/DIORSAUVAGE.PNG",
            category: "Diseñador",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "Dior La fuerza de la naturaleza en un frasco. Un perfume amaderado aromático, con una salida de bergamota y pimienta, seguida por un corazón de lavanda y geranio. Su fondo de ambroxan y cedro lo convierte en una fragancia potente y masculina."

        },         
        {
            id: 35,
            name: "ACQUA DI GIO GIORGIO ARMANI",
            price: 16000,
            rating: 4,
            image: "img/ACQUA_DI_GIO.jpg",
            category: "Diseñador",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "La frescura del mar en cada rocío. Una fragancia acuática cítrica, con notas de bergamota, neroli y romero, seguida por un corazón de jazmín y notas marinas. Su fondo de cedro y almizcle le da una sensación refrescante y elegante."

        },         
        {
            id: 36,
            name: "BORN IN ROMO VALENTINO",
            price: 16000,
            rating: 4,
            image: "img/VALENTINO_BON_IN.jpg",
            category: "Diseñador",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "La sofisticación italiana en un frasco. Una fragancia amaderada especiada, con una apertura vibrante de salvia y jengibre, seguida por un corazón de vetiver ahumado que aporta profundidad y carácter. Su fondo de maderas y minerales lo convierte en un perfume moderno y magnético"
        },
        {
            id: 37,
            name: "DONNA BORN IN ROMA VALENTINO",
            price: 16000,
            rating: 4,
            image: "img/DONNA_BORN_IN_ROMA.jpeg",
            category: "Diseñador",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "Inspirada en la elegancia de Roma, esta fragancia está dirigida a mujeres que buscan un perfume sofisticado y moderno. Con notas de jazmín sambac, vainilla Bourbon y cashmeran, es ideal para quienes desean un aroma que combine feminidad y un toque vanguardista."
        },        
        {
            id: 38,
            name: "LACOSTE BLANCA",
            price: 16000,
            rating: 4,
            image: "img/LACOSTE_BLANCA.png",
            category: "Diseñador",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "La esencia de la elegancia deportiva. Un aroma fresco y limpio, con notas de pomelo, cardamomo y ylang-ylang, que se fusionan con un fondo de cedro y cuero, Perfecto para el hombre que busca sofisticación y versatilidad, ideal para cualquier ocasión."

        },
        {
            id: 39,
            name: "LACOSTE RED STYLE IN PLAY",
            price: 16000,
            rating: 4,
            image: "img/LCRED.jpg",
            category: "Diseñador",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "Lacoste Red es una fragancia fresca y afrutada con una salida de manzana verde y maclura, seguida por un corazón de cedro y jazmínque aporta equilibrio. Su fondo de maderas y almizcle le da una sensación cálida y deportiva, perfecta para quienes buscan un aroma dinámico y juvenil."
        },
        {
            id: 40,
            name: "ONE MILLON MILLION PACO RABANNE",
            price: 16000,
            rating: 4,
            image: "img/ONE_MILLON.jpg",
            category: "Diseñador",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "Lujo y audacia en cada gota. Una fragancia amaderada especiada, con una apertura de toronja y menta, seguida por un corazón de rosa y canela. Su fondo de cuero y ámbar lo convierte en un perfume poderoso y magnético."
        },
        {
            id: 41,
            name: "BLACK XS L´APHRODISIAQUE PACO RABANNE",
            price: 16000,
            rating: 4,
            image: "img/LAPHRODISIAQUE2.jpg",
            category: "Diseñador",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "Lujo y audacia en cada gota. Una fragancia amaderada especiada, con una apertura de toronja y menta, seguida por un corazón de rosa y canela. Su fondo de cuero y ámbar lo convierte en un perfume poderoso y magnético."
        },      
        {
            id: 42,
            name: "EROS EAU DE TOILETTE VERSACE",
            price: 16000,
            rating: 4,
            image: "img/EROS.webp",
            category: "Diseñador",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "Inspirado en la mitología griega, es una fragancia amaderada aromática, que exuda poder y seducción. Su apertura vibrante con menta, manzana verde y limón aporta frescura y energía, mientras que el corazón de haba tonka y ambroxan intensifica su carácter masculino. Su fondo de vainilla, cedro y vetiverle da profundidad y una estela duradera, ideal para quienes buscan un aroma magnético y audaz"
        },
        {
            id: 43,
            name: "BOSS BOTTLED ABSOLUTE HUGO BOSS",
            price: 16000,
            rating: 4,
            image: "img/BOTTLED3.jpg",
            category: "Diseñador",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: ""
        },
        {
            id: 44,
            name: "UNLIMITED HUGO BOSS",
            price: 16000,
            rating: 4,
            image: "img/UNLIMITED2.jpg",
            category: "Diseñador",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "Un perfume masculino y sofisticado que combina notas de bergamota, lavanda y madera. Un aroma fresco y atractivo que seguro hará una declaración. La combinación de notas cítricas y florales crea un perfume intenso y duradero que es perfecto para aquellos que buscan un aroma que refleje su personalidad segura y ambiciosa."
        },
        {
            id: 45,
            name: "ISLAND BLISS ARMAF",
            price: 18000,
            rating: 4,
            image: "img/ISLANDBLISS2.webp",
            category: "Arabe",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "Inspirada en la frescura tropical, esta fragancia está diseñada para quienes buscan un aroma vibrante y exótico. Con notas de coco, bayas silvestres y vainilla, es perfecta para personas que disfrutan de perfumes alegres y relajantes, evocando la sensación de unas vacaciones en una isla paradisíaca"
        },
        {
            id: 46,
            name: "CLUB DE NUIT INTENSE (BESTIA NEGRA) ARMAF",
            price: 18000,
            rating: 4,
            image: "img/NUIT2.jpg",
            category: "Arabe",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "Club de Nuit Intense es una fragancia cítrica y amaderada con una salida de limón, piña y grosella negra, seguida por un corazón de rosa y jazmín que aporta sofisticación. Su fondo de almizcle, ámbar gris y pachulí le da una estela intensa y duradera, perfecta para quienes buscan un aroma elegante y dominante."
        },
        {
            id: 47,
            name: "9PM AFNAN",
            price: 18000,
            rating: 4,
            image: "img/9PM2.PNG",
            category: "Arabe",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "Seducción nocturna en su máxima expresión. Un perfume dulce y especiado, con una salida de manzana y canela, seguida por un corazón de flores blancas y vainilla. Su fondo de haba tonka y ámbar crea una estela intensa y adictiva, ideal para noches inolvidables."
        },
        {
            id: 48,
            name: "ODYSSEY MANDARIN SKY ARMAF",
            price: 18000,
            rating: 5,
            image: "img/ODYSSEY_MANDARIN.png",
            category: "Diseñador",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "Sumérgete en la esencia vibrante y seductora de Odyssey Mandarin Sky, una fragancia masculina que equilibra la frescura cítrica con la calidez envolvente. Su apertura chispeante de mandarina, naranja, azafrán y salvia despierta los sentidos con energía y sofisticación."
        },
        {
            id: 49,
            name: "ODYSEY CHOCOLATE DUBAI ARMAF",
            price: 18000,
            rating: 4,
            image: "img/ODYSEYCHOCOLATE.jpg",
            category: "Arabe",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "Un perfume dulce y sensual que combina notas de chocolate, vainilla y caramelos. Un aroma cálido y atractivo que seguro despertará los sentidos. La combinación de notas de chocolate y vainilla crea un perfume rico y decadente que es perfecto para aquellos que buscan un aroma dulce y sensual."
        },
        {
            id: 50,
            name: "ODYSEY CANDEE ARMAF",
            price: 18000,
            rating: 4,
            image: "img/ODYSEYCANDEE2.jpeg",
            category: "Arabe",
            sizes: ["30ml", "60ml", "100ml"],
            bottleTypes: ["Singler", "Cartier","Swarosky"],
            description: "Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír. Ideal para aquellos que buscan un perfume ligero y divertido para uso diario."
        },
    ];




    // Elementos del DOM
function displayProducts(productsToShow) {
    const productGrid = document.getElementById('productGrid');
    productGrid.innerHTML = ''; // Limpiar productos antes de agregar nuevos
    
    productsToShow.forEach(product => {
        const stars = '★'.repeat(product.rating) + '☆'.repeat(5 - product.rating);
        
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');

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

  setTimeout(() => {
    productGrid.style.display = "grid";
}, 100);


    // Inicializar
    displayProducts(products);
    
});






