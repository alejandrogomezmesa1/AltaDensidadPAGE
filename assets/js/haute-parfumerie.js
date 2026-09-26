/**
 * HAUTE PARFUMERIE — Alta Densidad
 * Arquitectura de Autor: Bolsa reactiva, buscador en vivo, atelier de filtros olfativos,
 * ranking Top 10 oficial, catálogo de envases de lujo, integración resiliente con backend Railway.
 */
(function() {
  "use strict";

  const WA = "573046477694";

  // ============================================================
  // DATOS DUROS DEL CATÁLOGO REAL DE FRAGANCIAS DE ALTA DENSIDAD
  // ============================================================
  const DATOS_DUROS_PRODUCTOS = [
  {
    "id": 118,
    "name": "BHARARA SOLEIL",
    "price": 130000,
    "category": "Arabe",
    "gender": "Masculino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [
      "Vidrio"
    ],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1786065326/altadensidad/ilcuxcvsdqxsnk0ly5yz.jpg",
    "description": "Bharara King Soleil es una fragancia de la casa Bharara Beauty orientada principalmente al público masculino, caracterizada por un perfil ámbar amaderado y frutal con alta presencia y rendimiento."
  },
  {
    "id": 117,
    "name": "ALEXANDRIA ll XERJOFF",
    "price": 125000,
    "category": "Arabe",
    "gender": "Unisex",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [
      "Vidrio"
    ],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1782937023/altadensidad/lk7rqnrckify9tszkd2c.jpg",
    "description": "La fragancia abre con un contraste fascinante y refinado. La frescura limpia de la lavanda y la dulzura frutal de la manzana se entrelazan de inmediato con la calidez especiada de la canela y la riqueza del palo de rosa de palisandro. Esta salida crea una introducción densa, cremosa y con un aire sumamente aristocrático."
  },
  {
    "id": 116,
    "name": "RENAISSANCE XERJOFF",
    "price": 125000,
    "category": "Arabe",
    "gender": "Unisex",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [
      "Vidrio"
    ],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1782936767/altadensidad/qnanxrjbgnoszt2enbaw.jpg",
    "description": "La fragancia abre con una explosión cítrica sumamente realista, jugosa y brillante de limones de Amalfi, mandarina y bergamota de Calabria, matizada por el toque verde y ligeramente amargo del petitgrain."
  },
  {
    "id": 115,
    "name": "HAWAS ICE RASASI",
    "price": 150000,
    "category": "Arabe",
    "gender": "Masculino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [
      "Vidrio"
    ],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1782608166/altadensidad/zczo5gcmhblxgsxquews.jpg",
    "description": "Una evolución ultra refrescante, cítrica y chispeante del legendario ADN de Hawas. Abre con una explosión helada de manzana fresca, limón italiano y anís estrellado, que evoluciona hacia un corazón frutal y dulce de ciruela y cardamomo. Su fondo de madera flotante y almizcle garantiza una estela limpia, masculina y enérgica de altísima duración."
  },
  {
    "id": 114,
    "name": "HAWAS FIRE RASASI",
    "price": 150000,
    "category": "Arabe",
    "gender": "Masculino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [
      "Vidrio"
    ],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1782608014/altadensidad/imgvy7okfxnpoujxp4nv.jpg",
    "description": "Una evolución ultra refrescante, cítrica y chispeante del ADN original. Abre con una explosión helada de manzana jugosa, limón italiano y anís estrellado, que evoluciona hacia un corazón frutal de ciruela y cardamomo. Su fondo de madera flotante y almizcle garantiza una estela limpia y enérgica de alta duración. La opción definitiva para días calurosos y uso diario casual."
  },
  {
    "id": 113,
    "name": "THANK U NEXT 2.0 ARIANA GRANDE",
    "price": 85000,
    "category": "Diseñador",
    "gender": "Femenino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [
      "Vidrio"
    ],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1782607578/altadensidad/ztc2h5y2wrvoyfoetpwd.jpg",
    "description": "Juguetón, vibrante y sumamente encantador. Esta evolución abre con una explosión refrescante de jugo de manzana, fresa silvestre y granada. Su corazón floral de orquídea blanca y jazmín da paso a un fondo adictivo y cremoso de malvavisco (bombón), almizcle y sándalo. Un perfume alegre y ultra femenino, perfecto para el uso diario."
  },
  {
    "id": 112,
    "name": "HER CONFESSION LATTAFA",
    "price": 135000,
    "category": "Arabe",
    "gender": "Femenino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [
      "Vidrio"
    ],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1782607212/altadensidad/fesanygzakp4hyqcdizy.jpg",
    "description": "Una fragancia que evoca misterio y elegancia absoluta. Abre con una combinación cálida y adictiva de canela y notas místicas, abriendo paso a un corazón intensamente floral de jazmín y nardos con un toque sutil de incienso. Su fondo de vainilla, haba tonka y almizcle envuelve la piel en una estela dulce, cremosa y sumamente magnética."
  },
  {
    "id": 111,
    "name": "HUGO BOSS RED",
    "price": 80000,
    "category": "Arabe",
    "gender": "Masculino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [
      "Vidrio"
    ],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1782606963/altadensidad/mfz2pdlbmqefacwqzrmk.jpg",
    "description": "Una fragancia electrizante y vanguardista que rompe esquemas. Destaca por su innovador concepto de contraste entre el \"frío extremo\" y el \"calor líquido\", abriendo con notas metálicas, toronja y pimienta rosa, que luego dan paso a un corazón frutal de ruibarbo y piña. Cierra con un fondo masculino y reconfortante de haba tonka y ámbar."
  },
  {
    "id": 110,
    "name": "HIS CONFESSION LATTAFA",
    "price": 135000,
    "category": "Arabe",
    "gender": "Masculino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [
      "Vidrio"
    ],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1782606774/altadensidad/suzuxazgjw2ejpfspdej.jpg",
    "description": "Una fragancia imponente que equilibra la frescura de la lavanda y la mandarina con la calidez de la canela especiada. Su evolución revela un corazón elegante de iris y ciprés, sellado por una base adictiva de vainilla, incienso y haba tonka. Un aroma magnético, cremoso y con carácter, diseñado para el hombre moderno que busca destacar con distinción absoluta."
  },
  {
    "id": 109,
    "name": "BACCARAT ROUGE  540 MAISON FRANCIS",
    "price": 110000,
    "category": "Diseñador",
    "gender": "Unisex",
    "sizes": [
      "60ml"
    ],
    "bottleTypes": [
      "Vidrio"
    ],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1782606594/altadensidad/zbkuth6wdrw5ehozhzb1.jpg",
    "description": "Maison Francis Kurkdjian Baccarat Rouge 540: El epítome del lujo contemporáneo. Una obra de arte de la perfumería de nicho francesa que envuelve la piel en un halo poético y sofisticado. Su aroma combina la calidez del azafrán y el jazmín con la densidad del ámbar gris y el cedro recién cortado. Un perfume luminoso, distintivo y con una estela dulce-resinosa que resulta adictiva desde el primer segundo."
  },
  {
    "id": 108,
    "name": "ETER DESERT ROSE ARMAF",
    "price": 135000,
    "category": "Arabe",
    "gender": "Femenino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [
      "Vidrio"
    ],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1782605844/altadensidad/kwizxqvktjl4spetmu4p.jpg",
    "description": "Una obra de arte de la perfumería árabe que equilibra a la perfección la frescura exótica con la calidez del desierto. Abre con ráfagas brillantes de frutas tropicales y notas cítricas, que evolucionan hacia un corazón floral empolvado y un fondo profundo de ámbar, almizcle y maderas finas."
  },
  {
    "id": 107,
    "name": "VULCAN BLACK FRIDAY FRENCH AVENUE",
    "price": 110000,
    "category": "Arabe",
    "gender": "Unisex",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [
      "Vidrio"
    ],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1782608356/altadensidad/pvyo7tbfrakfuc5qwfyp.jpg",
    "description": "Una declaración de fuerza y misterio. Este perfume combina una salida vibrante de azafrán, manzana y canela con un corazón imponente de cuero y rosa que le aporta una elegancia imprecionante. Su fondo terroso de pachulí, papiro y musgo sella una estela oscura, madura y profundamente magnética."
  },
  {
    "id": 106,
    "name": "VULCAN FEU FRENCH AVENUE",
    "price": 110000,
    "category": "Arabe",
    "gender": "Unisex",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [
      "Vidrio"
    ],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1782605075/altadensidad/tfi35ft9uc999cbchgpf.jpg",
    "description": "Un perfume de nicho, misterioso y sumamente sofisticado. Abre con una salida limpia de bergamota y pimienta rosada que evoluciona hacia un corazón oscuro de madera de oud, suavizado por una base adictiva de vainilla y ámbar. Un aroma opulento, maduro y elegante con una fijación excelente."
  },
  {
    "id": 105,
    "name": "9PM NIGHT OUT AFNAN",
    "price": 135000,
    "category": "Arabe",
    "gender": "Masculino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [
      "Vidrio"
    ],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1782604901/altadensidad/uonp553la39g1ctelq0y.jpg",
    "description": "La bestia indiscutible de la noche. Una explosión magnética de manzana silvestre, canela y una base ultra seductora de vainilla negra. Su rendimiento es brutal, ideal para salir de fiesta y asegurar cumplidos. Si buscas un aroma dulce, masculino y que dure toda la noche, es este."
  },
  {
    "id": 104,
    "name": "KHAMRAH QAHWA LATTAFA",
    "price": 110000,
    "category": "Arabe",
    "gender": "Unisex",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [
      "Vidrio"
    ],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1778550601/altadensidad/gfbsyn1im8orrlmkfq3x.jpg",
    "description": "Khamrah Qahwa toma la base cálida, dulce y reconfortante del aclamado Khamrah original y la eleva con el inconfundible y embriagador aroma del café arábica recién tostado. Esta fragancia gourmand abre con una mezcla especiada de canela y cardamomo, que da paso a un corazón irresistible de praliné y frutas confitadas."
  },
  {
    "id": 103,
    "name": "212 VIP MEN CAROLINA HERRERA",
    "price": 70000,
    "category": "Diseñador",
    "gender": "Masculino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [
      "Vidrio"
    ],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1778550167/altadensidad/qkv1vwepme5jzimp751i.jpg",
    "description": "212 VIP Men es una fragancia magnética, enérgica y profundamente seductora, inspirada en la actitud de las fiestas más exclusivas de Nueva York. Su composición es un cóctel vibrante que mezcla notas explosivas de maracuyá y lima con un corazón embriagador de vodka, ginebra y menta fresca."
  },
  {
    "id": 102,
    "name": "IMAGINATION LOUIS VUITTON",
    "price": 90000,
    "category": "Diseñador",
    "gender": "Unisex",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [
      "Vidrio"
    ],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1778549747/altadensidad/zzldk89i3cnfymjhsbbd.jpg",
    "description": "Imagination de Louis Vuitton es una obra maestra de la frescura y la sofisticación contemporánea. Esta fragancia captura la energía radiante de los cítricos italianos más finos y la entrelaza con el carácter distintivo del té negro chino extraído con CO2, creando un contraste perfecto entre luminosidad y profundidad."
  },
  {
    "id": 101,
    "name": "OMNIA CRYSTALLINE BVLGARY",
    "price": 65000,
    "category": "Diseñador",
    "gender": "Femenino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [
      "Vidrio"
    ],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1778549512/altadensidad/gxpzfjxpgv9hvcay2yyu.jpg",
    "description": "Omnia Crystalline es una fragancia luminosa y delicada que evoca una frescura acuática y serena. Su composición única fusiona notas de bambú y pera asiática (nashi) con la suavidad de la flor de loto, creando una estela limpia, cristalina y sofisticada."
  },
  {
    "id": 100,
    "name": "ECLAIRE LATTAFA",
    "price": 115000,
    "category": "Arabe",
    "gender": "Femenino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [
      "Vidrio"
    ],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1778548678/altadensidad/x4gkfj2cwse0xn1o9rqr.jpg",
    "description": "Déjate envolver por la dulzura más adictiva y reconfortante. Eclaire de Lattafa es una auténtica pastelería embotellada, diseñada para quienes aman los aromas irresistibles que dejan huella. Esta fragancia gourmand abre con una explosión cremosa de caramelo y leche, evolucionando hacia un corazón suave de miel y flores blancas, para finalmente reposar en una base profunda de vainilla y praliné."
  },
  {
    "id": 99,
    "name": "ART OF UNIVERSE LATTAFA",
    "price": 140000,
    "category": "Arabe",
    "gender": "Unisex",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [
      "Vidrio"
    ],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1778548440/altadensidad/mygoyvtq4g5pofh410ot.jpg",
    "description": "Descubre la majestuosidad de Medio Oriente con Art of Universe de Lattafa, una verdadera obra maestra olfativa diseñada para dejar una impresión inolvidable. Esta fragancia envolvente y misteriosa combina la riqueza de las maderas preciosas con la calidez de las especias orientales, creando un aura de lujo, poder y sofisticación."
  },
  {
    "id": 98,
    "name": "ISLAND BREEZE ARMAF",
    "price": 135000,
    "category": "Arabe",
    "gender": "Femenino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [
      "Vidrio"
    ],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1778547139/altadensidad/dnjqeagdzaqtqwzrenb0.jpg",
    "description": "Island Breeze es una fragancia vibrante y refrescante que captura la esencia de la brisa marina y las frutas bañadas por el sol. Su fórmula equilibrada ofrece una estela ligera pero duradera, perfecta para quienes buscan un aroma limpio, exótico y lleno de energía."
  },
  {
    "id": 97,
    "name": "YARA ELIXIR LATTAFA",
    "price": 115000,
    "category": "Arabe",
    "gender": "Femenino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [
      "Vidrio"
    ],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1778545898/altadensidad/dqcimmfkgx9uhnm3ydu1.jpg",
    "description": "Yara Elixir de Lattafa es una fragancia árabe femenina, intensa y sofisticada, con un perfil floral-afrutado que combina frutas tropicales, flores blancas y un fondo dulce y cálido. Es ideal para noches elegantes o climas fríos, dejando una estela envolvente y memorable."
  },
  {
    "id": 96,
    "name": "CREED AVENTUS",
    "price": 70000,
    "category": "Diseñador",
    "gender": "Masculino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [
      "Vidrio"
    ],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777778701/altadensidad/z02zdddkcdsz8qnoougp.jpg",
    "description": "Una de las fragancias más emblemáticas de la casa Creed, reconocida mundialmente por su carácter audaz y sofisticado. Aventus es un homenaje al poder, la visión y el éxito, con un aroma que combina fuerza y elegancia."
  },
  {
    "id": 95,
    "name": "CREED SILVER MOUNTAIN  WATER",
    "price": 70000,
    "category": "Diseñador",
    "gender": "Masculino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [
      "Vidrio"
    ],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777778605/altadensidad/f5zjhv12nfimthz5cs1r.jpg",
    "description": "Fragancia icónica inspirada en la pureza de los Alpes, que combina frescura cristalina con un toque sofisticado y moderno"
  },
  {
    "id": 92,
    "name": "YUM YUM  BAUL ARMAF",
    "price": 135000,
    "category": "Arabe",
    "gender": "Femenino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777689864/altadensidad/szkeyxzdssu9djz2drvk.jpg",
    "description": "Armaf Yum Yum es un perfume femenino dulce, frutal y gourmand, perfecto para mujeres que buscan un aroma coqueto y moderno. Uso diario, citas románticas, climas templados."
  },
  {
    "id": 91,
    "name": "YARA LATTAFA",
    "price": 110000,
    "category": "Arabe",
    "gender": "Femenino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777689703/altadensidad/jot6z7ewz1dlkdr7mpst.jpg",
    "description": "Yara de Lattafa es un perfume femenino dulce, floral y cremoso, ideal para quienes buscan un aroma juvenil y encantador con buena duración y versatilidad. Perfecto para uso diario, citas románticas y climas templados.",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "no": [
      "Heliotropo · Orquídea",
      "Frutas tropicales",
      "Vainilla · Sándalo"
    ],
    "h": 336
  },
  {
    "id": 90,
    "name": "212 VIP BLACK CAROLINA HERRERA",
    "price": 70000,
    "category": "Diseñador",
    "gender": "Masculino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777689605/altadensidad/focuwtyfmqechm1qcvyi.jpg",
    "description": "212 VIP Black es un perfume masculino aromático y especiado con fondo cálido, ideal para hombres que buscan un aroma seductor y moderno que destaque en ambientes sociales nocturnos. Perfecto para fiestas, citas nocturnas y climas frescos.",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "no": [
      "Notas cítricas vibrantes",
      "Especias orientales",
      "Cuero noble y feromonas"
    ],
    "h": 185
  },
  {
    "id": 89,
    "name": "VELVET GOLD ORIENTICA",
    "price": 120000,
    "category": "Arabe",
    "gender": "Unisex",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777689452/altadensidad/vaious9fe0dxj0dtsbfg.jpg",
    "description": "Velvet Gold de Orientica es un perfume oriental ambarado con matices especiados y dulces, perfecto para quienes buscan un aroma sofisticado y envolvente que destaque en ocasiones especiales.  Ideal para eventos nocturnos, citas románticas y climas templados o fríos."
  },
  {
    "id": 88,
    "name": "VERY GOOD GIRL CAROLINA HERRERA",
    "price": 80000,
    "category": "Diseñador",
    "gender": "Femenino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777689371/altadensidad/rwwrlq7dbdmqnjjuixqw.jpg",
    "description": "Very Good Girl es una fragancia femenina frutal y floral con un fondo cálido, que transmite alegría y sofisticación. Es ideal para mujeres que buscan un perfume moderno, coqueto y versátil. Perfecto para uso diario, citas románticas y climas templados.",
    "f": "Cítrica / Fresca",
    "o": "Noche",
    "no": [
      "Almendra · Café",
      "Jazmín sambac",
      "Cacao · Haba tonka"
    ],
    "h": 111
  },
  {
    "id": 87,
    "name": "HUGO BOSS BOTTLED UNLIMITED",
    "price": 75000,
    "category": "Diseñador",
    "gender": "Masculino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777689222/altadensidad/mssfblmwnowixfjhgoll.jpg",
    "description": "Boss Bottled Unlimited es un perfume masculino fresco y deportivo, perfecto para hombres activos que buscan un aroma energético y versátil.  Ideal para uso diario, gimnasio, actividades al aire libre y climas cálidos."
  },
  {
    "id": 86,
    "name": "TOY 2 DAMA MOSCHINO",
    "price": 70000,
    "category": "Diseñador",
    "gender": "Femenino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777689041/altadensidad/cfvvnrjo5xwa2rmui79q.jpg",
    "description": "Toy 2 de Moschino es un perfume femenino fresco y floral con un toque frutal, ideal para mujeres que buscan un aroma juvenil, coqueto y elegante.  Perfecto para uso diario, primavera-verano y salidas sociales."
  },
  {
    "id": 85,
    "name": "TOY 2 PEARL MOSCHINO",
    "price": 80000,
    "category": "Diseñador",
    "gender": "Femenino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777688885/altadensidad/krlcdii1znxkbf5y7c9r.jpg",
    "description": "Toy 2 Bubble Gum es un perfume femenino dulce y juguetón, que combina notas frutales y especiadas con un fondo cálido. Es ideal para mujeres jóvenes que buscan un aroma alegre, coqueto y moderno, con un toque irreverente y divertido. Perfecto para uso diario, salidas sociales y climas calidos.",
    "f": "Cítrica / Fresca",
    "o": "Noche",
    "no": [
      "Frutas frescas y bayas",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "h": 47
  },
  {
    "id": 84,
    "name": "TOY 2 BUBBLE GUM MOSCHINO",
    "price": 80000,
    "category": "Diseñador",
    "gender": "Femenino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777688373/altadensidad/eqygrstbnuqus47rwpuw.jpg",
    "description": "Toy 2 Bubble Gum es un perfume femenino dulce y juguetón, que combina notas frutales y especiadas con un fondo cálido. Es ideal para mujeres jóvenes que buscan un aroma alegre por su aroma a chicle rosa, coqueto y moderno. Perfecto para uso diario, salidas sociales y climas cálidos.",
    "f": "Cítrica / Fresca",
    "o": "Noche",
    "no": [
      "Frutas frescas y bayas",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "h": 10
  },
  {
    "id": 83,
    "name": "THANK U NEXT ARIANA GRANDE",
    "price": 80000,
    "category": "Diseñador",
    "gender": "Femenino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777688238/altadensidad/xompank3ygiknizknxx9.jpg",
    "description": "Thank U Next es un perfume femenino dulce y frutal con un toque gourmand, ideal para mujeres jóvenes que buscan un aroma alegre, coqueto y moderno, con un aire desenfadado y confiado. Perfecto para uso diario, salidas sociales y climas cálidos."
  },
  {
    "id": 82,
    "name": "SANTAL 33 LE LABOO",
    "price": 75000,
    "category": "Diseñador",
    "gender": "Unisex",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777688140/altadensidad/jz4mjl4eyukvk0zxbdvv.jpg",
    "description": "Santal 33 es un perfume amaderado y especiado, con un aire ahumado y sofisticado que lo ha convertido en un clásico moderno de la perfumería nicho. Es perfecto para quienes buscan un aroma distintivo, elegante y versátil, con gran personalidad. Ideal para uso diario en ambientes urbanos, citas elegantes y climas frescos."
  },
  {
    "id": 81,
    "name": "ONE MILLON PACO RABANNE",
    "price": 70000,
    "category": "Diseñador",
    "gender": "Masculino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777688045/altadensidad/otcuassgathy5joolh2b.jpg",
    "description": "One Million es un perfume masculino atrevido y opulento, que combina frescura cítrica con especias cálidas y un fondo de cuero y ámbar. Es ideal para hombres que buscan un aroma impactante y seductor, Perfecto para fiestas, citas nocturnas y climas frescos."
  },
  {
    "id": 80,
    "name": "OMNIA CORAL BVLGARI",
    "price": 65000,
    "category": "Diseñador",
    "gender": "Femenino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777687920/altadensidad/rwqgam5alatla11kqnik.jpg",
    "description": "Omnia Coral es una fragancia femenina fresca, frutal y floral, que transmite alegría y vitalidad mediterránea. Es ideal para mujeres que buscan un perfume juvenil y luminoso, perfecto para el día a día en primavera y verano. Perfecto para uso diario, salidas sociales y climas cálidos.",
    "f": "Cítrica / Fresca",
    "o": "Noche",
    "no": [
      "Frutas frescas y bayas",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "h": 127
  },
  {
    "id": 79,
    "name": "ODYSSEY MANDARYN SKY ARMAF",
    "price": 105000,
    "category": "Arabe",
    "gender": "Masculino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777687824/altadensidad/i2lic2tjh24awmqpp1pf.jpg",
    "description": "Se distingue por su carácter cítrico, fresco y especiado, con un aire moderno y versátil que la hace ideal para climas cálidos y uso diario. Perfecto para uso diario, oficina, actividades sociales y climas cálidos."
  },
  {
    "id": 78,
    "name": "ODYSSEY SPECTRA ARMAF",
    "price": 115000,
    "category": "Arabe",
    "gender": "Masculino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777687662/altadensidad/hdadt2smcfd4ks0xdtr1.jpg",
    "description": "Se distingue por su carácter fresco, especiado y amaderado, diseñada para hombres que buscan un perfume versátil y moderno con buena presencia. Ideal para uso diario, oficina, salidas sociales y climas templados.",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "no": [
      "Frutas frescas y bayas",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "h": 151
  },
  {
    "id": 77,
    "name": "ODYSSEY MEGA ARMAF",
    "price": 115000,
    "category": "Arabe",
    "gender": "Masculino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777687480/altadensidad/cjlgczttyq1vqbbjsqow.jpg",
    "description": "Se caracteriza por ser intensa, moderna y con un perfil fresco-amaderado, pensada para quienes buscan un perfume versátil pero con gran presencia. Ideal para uso diario, oficina, salidas sociales y climas templados.",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "no": [
      "Frutas frescas y bayas",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "h": 114
  },
  {
    "id": 76,
    "name": "ODYSSEY CHOCOLATE ARMAF",
    "price": 115000,
    "category": "Arabe",
    "gender": "Unisex",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777687379/altadensidad/es2lljvypzqucc4v5a0o.jpg",
    "description": "Está pensada para quienes disfrutan de perfumes dulces, cálidos y envolventes, con un marcado protagonismo del cacao y la vainilla. Ideal para citas románticas, eventos nocturnos y climas frescos."
  },
  {
    "id": 75,
    "name": "ODYSSEY CANDEE ARMAF",
    "price": 115000,
    "category": "Arabe",
    "gender": "Femenino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777687244/altadensidad/nmlrnf1mp5hnxbstq2sc.jpg",
    "description": "Uso diario, salidas sociales, climas cálidos, ideal para mujeres jóvenes que buscan un perfume alegre y moderno, con un aire de “postre frutal” sofisticado.",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "no": [
      "Frutas frescas y bayas",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "h": 77
  },
  {
    "id": 74,
    "name": "CLUB DE NUIT WOMAN ARMAF",
    "price": 115000,
    "category": "Arabe",
    "gender": "Femenino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777687059/altadensidad/xpvyrmpj8wqxbkkm9fz8.jpg",
    "description": "Perfil floral, dulce y elegante, con un aire sofisticado y versátil. Perfecto para uso diario, citas románticas y eventos sociales.",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "no": [
      "Limón · Grosella negra",
      "Abedul · Jazmín",
      "Almizcle · Ámbar gris"
    ],
    "h": 289
  },
  {
    "id": 73,
    "name": "CLUB DE NUIT ARMAF",
    "price": 105000,
    "category": "Arabe",
    "gender": "Masculino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1778550718/altadensidad/dzgkgof614n147vhfrso.jpg",
    "description": "Muy intensa, expansiva y dominante. Ideal para eventos nocturnos, climas frescos y ocasiones especiales."
  },
  {
    "id": 72,
    "name": "MISS DIOR",
    "price": 75000,
    "category": "Diseñador",
    "gender": "Femenino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777686760/altadensidad/ldpvogtjx0fwtdeuha3y.jpg",
    "description": "A lo largo de los años ha tenido varias reinterpretaciones, pero siempre mantiene su esencia romántica, elegante y femenina. Perfecto para citas románticas, eventos especiales, cenas elegantes y uso diario si se aplica con moderación.",
    "f": "Cítrica / Fresca",
    "o": "Noche",
    "no": [
      "Frutas frescas y bayas",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "h": 144
  },
  {
    "id": 71,
    "name": "MAYAR INTENSE LATTAFA",
    "price": 115000,
    "category": "Arabe",
    "gender": "Femenino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777686641/altadensidad/fvqm0srxgcz9giislgjy.jpg",
    "description": "Mayar Intense busca un perfil más elegante y duradero, con mayor presencia de notas cálidas y orientales. Ideal para citas románticas, eventos nocturnos y climas frescos, aunque sigue siendo versátil para uso diario.",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "no": [
      "Notas cítricas vibrantes",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "h": 50
  },
  {
    "id": 70,
    "name": "MAYAR CHERRY LATTAFA",
    "price": 115000,
    "category": "Arabe",
    "gender": "Femenino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777686571/altadensidad/xx7vocgptohl0mk8w0ye.jpg",
    "description": "Es una fragancia femenina, juvenil y dulce, pensada para quienes disfrutan de aromas golosos con un toque sofisticado. Perfecto para uso diario, salidas sociales, citas románticas y climas cálidos.",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "no": [
      "Notas cítricas vibrantes",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "h": 124
  },
  {
    "id": 69,
    "name": "MAYAR LATTAFA",
    "price": 115000,
    "category": "Arabe",
    "gender": "Femenino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777686502/altadensidad/v3ieh4zhh3ao3ojlfhqh.jpg",
    "description": "Es parte de la línea moderna de Lattafa, pensada para quienes disfrutan de fragancias gourmand y alegres. Perfecto para uso diario, salidas sociales, citas románticas y climas cálidos.",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "no": [
      "Notas cítricas vibrantes",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "h": 87
  },
  {
    "id": 68,
    "name": "LIGHT BLUE DAMA DOLCE & GABANNA",
    "price": 75000,
    "category": "Diseñador",
    "gender": "Femenino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777686421/altadensidad/udrg7gnm0axjlkrd9ftr.jpg",
    "description": "Es una fragancia fresca, mediterránea y muy versátil, que se ha convertido en un clásico para climas cálidos y uso diario.  Perfecto para uso diario, oficina, actividades sociales y climas cálidos."
  },
  {
    "id": 67,
    "name": "LIGHT BLUE MEN DOLCE & GABANNA",
    "price": 75000,
    "category": "Diseñador",
    "gender": "Masculino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777686341/altadensidad/ebtd5qyrjjghlqfkw2eh.jpg",
    "description": "Es una fragancia fresca, mediterránea y muy versátil, inspirada en el estilo de vida italiano junto al mar. Perfecto para uso diario, oficina, actividades sociales y climas cálidos."
  },
  {
    "id": 66,
    "name": "BADEE AL OUD FOR GLORY LATTAFA",
    "price": 115000,
    "category": "Arabe",
    "gender": "Unisex",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777686242/altadensidad/gaj9fjur3hj0iaqpooss.jpg",
    "description": "Es uno de los perfumes más reconocidos de la casa árabe por su intensidad y su perfil amaderado oriental. Ideal para eventos nocturnos, climas fríos y ocasiones especiales."
  },
  {
    "id": 65,
    "name": "LACOSTE RED",
    "price": 65000,
    "category": "Diseñador",
    "gender": "Masculino",
    "sizes": [
      "120ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777686083/altadensidad/k29egik43cnma8h7wryr.jpg",
    "description": "Es una fragancia fresca, energética y juvenil, pensada para transmitir dinamismo y vitalidad. Perfecto para uso diario, oficina, actividades sociales y climas cálidos."
  },
  {
    "id": 64,
    "name": "LACOSTE BLANCA",
    "price": 65000,
    "category": "Diseñador",
    "gender": "Masculino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777686014/altadensidad/ys8kzlde3ywccs5jntee.jpg",
    "description": "Es una fragancia fresca, limpia y elegante, inspirada en la icónica camiseta polo blanca de Lacoste, símbolo de sencillez y sofisticación deportiva. Perfecto para uso diario, oficina, reuniones sociales y climas cálidos.",
    "f": "Cítrica / Fresca",
    "o": "Oficina",
    "no": [
      "Pomelo · Cardamomo",
      "Ylang-ylang · Nardo",
      "Cedro de Virginia · Gamuza"
    ],
    "h": 6
  },
  {
    "id": 63,
    "name": "KHAMRAH LATTAFA",
    "price": 110000,
    "category": "Arabe",
    "gender": "Unisex",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777685921/altadensidad/cyfey3ctyid2mvtepg4r.jpg",
    "description": "Es considerado por muchos como una alternativa accesible a fragancias nicho de estilo oriental.  Ideal para eventos nocturnos, climas fríos y ocasiones especiales.",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "no": [
      "Canela · Nuez moscada",
      "Dátiles · Praliné",
      "Vainilla bourbon · Haba tonka"
    ],
    "h": 346
  },
  {
    "id": 62,
    "name": "ISLAND BLISS ARMAF",
    "price": 135000,
    "category": "Arabe",
    "gender": "Femenino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1778549998/altadensidad/hgujlhm2xgd0mpmermb8.jpg",
    "description": "Es un Eau de Parfum con un perfil tropical, refrescante y gourmand, que muchos describen como “jugoso” y parecido a un refresco frutal.  Perfecto para uso diario, actividades sociales y climas cálidos.",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "no": [
      "Notas cítricas vibrantes",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "h": 215
  },
  {
    "id": 61,
    "name": "INVICTUS PACO RABANNE",
    "price": 85000,
    "category": "Diseñador",
    "gender": "Masculino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777685235/altadensidad/ymclxiwbeszisggrurg5.jpg",
    "description": "Es una fragancia fresca, deportiva y seductora, inspirada en la victoria y la energía triunfante. Ideal para uso diario, actividades sociales, gimnasio y climas cálidos.",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "no": [
      "Toronja · Notas marinas",
      "Hoja de laurel · Jazmín",
      "Madera de gaiac · Ámbar gris"
    ],
    "h": 158
  },
  {
    "id": 60,
    "name": "HUGO BOSS BOTTLED SILVER",
    "price": 80000,
    "category": "Diseñador",
    "gender": "Masculino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777685141/altadensidad/dmniqwqmsy1eukixhpsq.jpg",
    "description": "Se presenta como una fragancia fresca, moderna y versátil, con un perfil más luminoso y metálico. Perfecto para oficina, reuniones sociales y climas templados."
  },
  {
    "id": 59,
    "name": "HUGO BOSS BOTTLED NIGTH",
    "price": 80000,
    "category": "Diseñador",
    "gender": "Masculino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777685059/altadensidad/vtnuhnkumsnbol94rzrj.jpg",
    "description": "Es una fragancia pensada para transmitir confianza y seducción en ambientes nocturnos, con un perfil amaderado aromático más intenso que el clásico Boss Bottled. Ideal para citas románticas, eventos nocturnos y climas frescos."
  },
  {
    "id": 58,
    "name": "OMBRE NOMADE LOUIS VUITTON",
    "price": 90000,
    "category": "Diseñador",
    "gender": "Unisex",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777684978/altadensidad/lj7xgvlxdpihwz5if0zc.jpg",
    "description": "Es una fragancia de lujo, intensa y sofisticada, inspirada en los viajes y en la profundidad de los paisajes desérticos. Ideal para eventos nocturnos, climas fríos y ocasiones especiales.",
    "f": "Cítrica / Fresca",
    "o": "Noche",
    "no": [
      "Frutas frescas y bayas",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "h": 57
  },
  {
    "id": 57,
    "name": "GOOD GIRL BLUSH CAROLINA HERRERA",
    "price": 80000,
    "category": "Diseñador",
    "gender": "Femenino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777684905/altadensidad/z1e7kekzlqbal7kik9ly.jpg",
    "description": "Es un Eau de Parfum femenino que combina frescura floral con un toque moderno y delicado, pensado para mujeres que buscan un aroma elegante pero más suave y luminoso. Perfecto para uso diario, citas románticas y climas cálidos o templados.",
    "f": "Cítrica / Fresca",
    "o": "Noche",
    "no": [
      "Almendra · Café",
      "Jazmín sambac",
      "Cacao · Haba tonka"
    ],
    "h": 74
  },
  {
    "id": 56,
    "name": "GOOD GIRL CAROLINA HERRERA",
    "price": 80000,
    "category": "Diseñador",
    "gender": "Femenino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777684839/altadensidad/wmw39uy0tn6qgn3zeq60.jpg",
    "description": "Es un Eau de Parfum que combina dualidad y contraste: la luz y la oscuridad, lo bueno y lo travieso, reflejando la complejidad de la mujer moderna.  Ideal para citas románticas, eventos nocturnos y climas frescos o fríos.",
    "f": "Cítrica / Fresca",
    "o": "Noche",
    "no": [
      "Almendra · Café",
      "Jazmín sambac",
      "Cacao · Haba tonka"
    ],
    "h": 37
  },
  {
    "id": 55,
    "name": "EROS ENERGY VERSACE",
    "price": 80000,
    "category": "Diseñador",
    "gender": "Masculino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777684651/altadensidad/kqn0mp9rkbxhtubreqof.jpg",
    "description": "Se caracteriza por su perfil cítrico intenso y vibrante, pensado para transmitir frescura, dinamismo y energía mediterránea. Perfecto para uso diario, oficina, actividades al aire libre, viajes y climas cálidos.",
    "f": "Cítrica / Fresca",
    "o": "Noche",
    "no": [
      "Menta fresca · Manzana verde",
      "Haba tonka · Geranio",
      "Vainilla de Madagascar · Cedro"
    ],
    "h": 228
  },
  {
    "id": 54,
    "name": "EROS FLAME VERSACE",
    "price": 75000,
    "category": "Diseñador",
    "gender": "Masculino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777684593/altadensidad/vixara7umfctvro1wn1c.jpg",
    "description": "Es una interpretación más cálida y apasionada del clásico Eros, diseñada para transmitir fuerza, amor y sensualidad con un perfil cítrico, especiado y ambarado. Ideal para citas románticas, eventos nocturnos y climas fríos o templados.",
    "f": "Cítrica / Fresca",
    "o": "Noche",
    "no": [
      "Menta fresca · Manzana verde",
      "Haba tonka · Geranio",
      "Vainilla de Madagascar · Cedro"
    ],
    "h": 265
  },
  {
    "id": 53,
    "name": "EROS VERSACE",
    "price": 75000,
    "category": "Diseñador",
    "gender": "Masculino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777684521/altadensidad/ysg7m9slygznddxkephv.jpg",
    "description": "Es una fragancia intensa, sensual y vibrante, inspirada en el dios griego del amor, Eros, y diseñada para transmitir pasión y fuerza. Ideal para salidas nocturnas, fiestas, citas románticas y climas templados o fríos."
  },
  {
    "id": 52,
    "name": "ERBA PURA XERJOFF",
    "price": 130000,
    "category": "Diseñador",
    "gender": "Unisex",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1778549276/altadensidad/newxtcztyebvsp36m0yo.jpg",
    "description": "Es una fragancia moderna, vibrante y sofisticada, reconocida por su carácter afrutado y almizclado, con gran duración y proyección. Perfecto para eventos nocturnos, climas templados o cálidos, y ocasiones especiales.",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "no": [
      "Frutas frescas y bayas",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "h": 282
  },
  {
    "id": 51,
    "name": "SAUVAGE DIOR",
    "price": 70000,
    "category": "Diseñador",
    "gender": "Masculino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777684294/altadensidad/drzlo1rkvxaugdkrhylg.jpg",
    "description": "Es un Eau de Toilette con un carácter fresco, intenso y muy versátil, inspirado en la inmensidad de paisajes desérticos y cielos azules. Perfecto para uso diario, oficina, citas románticas y eventos nocturnos."
  },
  {
    "id": 50,
    "name": "ACQUA DI GIO PROFONDO",
    "price": 85000,
    "category": "Diseñador",
    "gender": "Masculino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777684207/altadensidad/hs9awmx0kgx2ixy69rpo.jpg",
    "description": "Acqua di Giò Profondo de Giorgio Armani representa una evolución más intensa y moderna del clásico Acqua di Giò, con un perfil marino, aromático y profundo. Ideal para uso nocturno, eventos formales y climas templados o frescos."
  },
  {
    "id": 49,
    "name": "OMNIA AMETHYSTE BVLGARI",
    "price": 65000,
    "category": "Diseñador",
    "gender": "Femenino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777684118/altadensidad/er2iapojes1ezuvwlbd2.jpg",
    "description": "Es una fragancia elegante, delicada y sofisticada, inspirada en los matices de la amatista y los jardines de iris al amanecer. Ideal para uso diario, oficina, reuniones sociales y climas templados o frescos.",
    "f": "Cítrica / Fresca",
    "o": "Noche",
    "no": [
      "Frutas frescas y bayas",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "h": 201
  },
  {
    "id": 48,
    "name": "COCO MADEMOISELLE CHANEL",
    "price": 85000,
    "category": "Diseñador",
    "gender": "Femenino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777684012/altadensidad/mehi5mmdeo7rrmqcup3u.jpg",
    "description": "Es un Eau de Parfum con un carácter elegante, moderno y sofisticado, pensado para mujeres seguras y con estilo.",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "no": [
      "Naranja de Sicilia · Bergamota",
      "Rosa de mayo · Jazmín",
      "Pachulí de Indonesia · Vetiver"
    ],
    "h": 343
  },
  {
    "id": 47,
    "name": "CLOUD ARIANA GRANDE",
    "price": 80000,
    "category": "Diseñador",
    "gender": "Femenino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777683896/altadensidad/ttmv9z8hnjci0ltt21nn.jpg",
    "description": "Es un Eau de Parfum femenino con un perfil dulce, cremoso y gourmand, que transmite una sensación acogedora y romántica.",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "no": [
      "Frutas frescas y bayas",
      "Corazón floral de autor",
      "Oud ahumado y feromonas"
    ],
    "h": 242
  },
  {
    "id": 46,
    "name": "YARA CANDY LATTAFA",
    "price": 110000,
    "category": "Arabe",
    "gender": "Femenino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777683787/altadensidad/imdqhqyohvxkises7tqe.jpg",
    "description": "Es ideal para quienes disfrutan de fragancias azucaradas, juveniles y envolventes, con buena duración y proyección.",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "no": [
      "Heliotropo · Orquídea",
      "Frutas tropicales",
      "Vainilla · Sándalo"
    ],
    "h": 299
  },
  {
    "id": 45,
    "name": "CAN CAN PARIS HILTON",
    "price": 75000,
    "category": "Diseñador",
    "gender": "Femenino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777683713/altadensidad/n8fpralyfadxlgztwxl7.jpg",
    "description": "Es una fragancia juvenil, divertida y seductora, con un perfil afrutado-floral que evoluciona hacia un fondo cálido y envolvente."
  },
  {
    "id": 44,
    "name": "HUGO BOSS BOTTLED",
    "price": 75000,
    "category": "Diseñador",
    "gender": "Masculino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777683635/altadensidad/u76r1ozd9gqevkbsogtt.jpg",
    "description": "Boss Bottled es uno de los perfumes masculinos más icónicos de Hugo Boss. Es ideal para uso diario, tanto en ambientes laborales como en ocasiones sociales, gracias a su equilibrio entre frescura y calidez."
  },
  {
    "id": 43,
    "name": "VALENTINO DONNA BORN IN ROMA",
    "price": 85000,
    "category": "Diseñador",
    "gender": "Femenino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777682334/altadensidad/ygnf7znr4qh4a5ccsxtv.jpg",
    "description": "Valentino Donna Born in Roma es un Eau de Parfum femenino. Es una fragancia moderna, sofisticada y con un toque rebelde, inspirada en la cultura urbana de Roma."
  },
  {
    "id": 41,
    "name": "VALENTINO UOMO BORN IN ROMA",
    "price": 85000,
    "category": "Diseñador",
    "gender": "Masculino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777681281/altadensidad/w6porka4zqjrwmkgyknz.jpg",
    "description": "Valentino Uomo Born in Roma es una fragancia masculina moderna y sofisticada, inspirada en la energía urbana de Roma y en la elegancia italiana."
  },
  {
    "id": 40,
    "name": "BOND N*9 BLEECKER STREET",
    "price": 80000,
    "category": "Diseñador",
    "gender": "Unisex",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777681187/altadensidad/bvernehmxjkrdwhre8lo.jpg",
    "description": "Fragancia unisex cálida, especiada y afrutada, diseñada para acompañar tanto el día como la noche. Es reconocida por su carácter sofisticado y versátil, con un perfil que mezcla notas verdes, frutales y gourmand."
  },
  {
    "id": 39,
    "name": "BADE AL OUD BLUSH LATTAFA",
    "price": 110000,
    "category": "Arabe",
    "gender": "Femenino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1778548976/altadensidad/pfzfhddlsg31ilbtchle.jpg",
    "description": "Badee Al Oud Noble Blush de Lattafa es una fragancia femenina, perfecto para uso cotidiano, oficina y reuniones sociales."
  },
  {
    "id": 38,
    "name": "BLEU CHANEL",
    "price": 80000,
    "category": "Diseñador",
    "gender": "Masculino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777680941/altadensidad/qh5vyof9np4jw3grfpwm.jpg",
    "description": "Bleu de Chanel es uno de los perfumes masculinos más icónicos y versátiles del mercado, con un perfil amaderado-aromático que transmite elegancia, libertad y sofisticación.",
    "f": "Cítrica / Fresca",
    "o": "Noche",
    "no": [
      "Limón · Menta fresca",
      "Jengibre · Jazmín",
      "Incienso · Cedro · Sándalo"
    ],
    "h": 20
  },
  {
    "id": 37,
    "name": "BHARARA ROSE",
    "price": 115000,
    "category": "Arabe",
    "gender": "Femenino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777680868/altadensidad/ngi1d015f76jvrmjkaso.jpg",
    "description": "Bharara Rose es una fragancia femenina, reconocida por su carácter floral dulce y elegante, pensada para quienes buscan un perfume romántico y sofisticado.",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "no": [
      "Notas cítricas vibrantes",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "h": 188
  },
  {
    "id": 36,
    "name": "BHARARA NICHE",
    "price": 115000,
    "category": "Arabe",
    "gender": "Unisex",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777680752/altadensidad/dvfjhwixbvtw22cz60nr.jpg",
    "description": "Bharara Niche es una fragancia unisex y ligeramente gourmand, ideal para quienes buscan un perfume elegante pero versátil.",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "no": [
      "Notas cítricas vibrantes",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "h": 262
  },
  {
    "id": 35,
    "name": "BHARARA KING",
    "price": 110000,
    "category": "Arabe",
    "gender": "Masculino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777680632/altadensidad/acmdnhq9mihvqyh8vbod.jpg",
    "description": "Bharara King es un perfume masculino. Es reconocido por su carácter poderoso, desafiante y moderno.",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "no": [
      "Naranja · Bergamota",
      "Tutti-frutti",
      "Vainilla blanca · Ámbar"
    ],
    "h": 225
  },
  {
    "id": 34,
    "name": "BADE AL OUD AMETHYST LATTAFA",
    "price": 110000,
    "category": "Arabe",
    "gender": "Unisex",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777680524/altadensidad/u9i0purp9mrnp2kdofta.jpg",
    "description": "Badee Al Oud Amethyst de Lattafa es una fragancia unisex cálida y sofisticada. Recomendada para noche, eventos especiales, climas frescos."
  },
  {
    "id": 33,
    "name": "BADE AL OUD HONOR & GLORY LATTAFA",
    "price": 115000,
    "category": "Arabe",
    "gender": "Unisex",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777680389/altadensidad/ghqkm6yqq2plxqdxuhmc.jpg",
    "description": "Badee Al Oud Honor & Glory de Lattafa es una fragancia unisex, con un perfil dulce, especiado y amaderado.  Recomendada para noche, eventos especiales, climas frescos."
  },
  {
    "id": 32,
    "name": "ASAD BLACK LATTAFA",
    "price": 110000,
    "category": "Arabe",
    "gender": "Masculino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777680197/altadensidad/k2s5vk6ebusxtrom1jr7.jpg",
    "description": "Asad Black de Lattafa es un perfume masculino intenso, cálido y especiado, pero con un perfil más dulce. Es ideal para noches frescas, eventos elegantes y quienes buscan una fragancia potente y duradera."
  },
  {
    "id": 31,
    "name": "ARABIANS TONKA MONTALE",
    "price": 80000,
    "category": "Arabe",
    "gender": "Unisex",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777679909/altadensidad/pnghlzez7bshplpyxztb.jpg",
    "description": "Reconocida por su carácter oriental especiado y gourmand, con una intensidad que la hace ideal para la noche y climas fríos.",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "no": [
      "Notas cítricas vibrantes",
      "Especias orientales",
      "Fondo amaderado y feromonas"
    ],
    "h": 356
  },
  {
    "id": 30,
    "name": "AMBER ROYAL ORIENTICA",
    "price": 120000,
    "category": "Arabe",
    "gender": "Unisex",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777679751/altadensidad/mmgkqylnnu93ddoiwdhr.jpg",
    "description": "Amber Royal (también conocido como Royal Amber) de Orientica es una fragancia unisex de la colección Luxury, reconocida por su carácter dulce, cálido y envolvente."
  },
  {
    "id": 29,
    "name": "AMBER ROUGE ORIENTICA",
    "price": 125000,
    "category": "Arabe",
    "gender": "Unisex",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777679479/altadensidad/b0u6msjw28hbpv5kmjhm.jpg",
    "description": "Amber Rouge de Orientica es una fragancia unisex de la colección Luxury, reconocida por su carácter sofisticado y envolvente.",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "no": [
      "Notas cítricas vibrantes",
      "Corazón floral de autor",
      "Ámbar cálido y feromonas"
    ],
    "h": 60
  },
  {
    "id": 28,
    "name": "AMBER OUD GOLD AL HARAMAIN",
    "price": 125000,
    "category": "Arabe",
    "gender": "Unisex",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777679379/altadensidad/yzeo4zzdohwptyg2smbu.jpg",
    "description": "El Amber Oud Gold Edition de Al Haramain es una fragancia unisex de estilo oriental gourmand, reconocida por su carácter dulce, cálido y sofisticado. Es uno de los perfumes más populares de la casa, ideal para quienes buscan un aroma intenso y duradero."
  },
  {
    "id": 27,
    "name": "AMBER NOIR ORIENTICA",
    "price": 120000,
    "category": "Arabe",
    "gender": "Unisex",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777679070/altadensidad/scuvoy6yhf2fvmoyugxu.jpg",
    "description": "El Amber Noir de Orientica es una fragancia unisex de la colección Luxury, reconocida por su carácter fresco, amaderado y elegante.",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "no": [
      "Frutas frescas y bayas",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "h": 134
  },
  {
    "id": 26,
    "name": "AMBER BLEU ORIENTICA",
    "price": 120000,
    "category": "Arabe",
    "gender": "Unisex",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777678952/altadensidad/wl9wu2okqf62fydrjs9i.jpg",
    "description": "Amber Bleu de Orientica, parte de la colección Luxury, es una fragancia unisex que combina frescura cítrica con un fondo cálido y amaderado, ideal para quienes buscan un perfume versátil y elegante."
  },
  {
    "id": 25,
    "name": "AMBER AZURE ORIENTICA",
    "price": 120000,
    "category": "Arabe",
    "gender": "Unisex",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777678617/altadensidad/w5ayysnay0uc5oe7mlho.jpg",
    "description": "Amber Azure de Orientica pertenece a la colección Luxury y es una fragancia unisex que combina notas frescas, afrutadas y amaderadas con un fondo cálido de ámbar y almizcle. Es ideal para quienes buscan un perfume elegante, versátil y con proyección duradera."
  },
  {
    "id": 24,
    "name": "BLACK XS L´APHRODISIAQUE PACO RABANNE",
    "price": 80000,
    "category": "Diseñador",
    "gender": "Masculino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777678488/altadensidad/kzpmx646qiv7f3ayulug.jpg",
    "description": "Black XS L’Aphrodisiaque de Paco Rabanne es una fragancia masculina intensa, oscura y seductora. Se caracteriza por su mezcla de especias cálidas, miel y notas gourmand que evocan un estilo rockero y atrevido.",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "no": [
      "Notas cítricas vibrantes",
      "Especias orientales",
      "Fondo amaderado y feromonas"
    ],
    "h": 154
  },
  {
    "id": 23,
    "name": "BADEE AL OUD SUBLIME LATTAFA",
    "price": 110000,
    "category": "Arabe",
    "gender": "Unisex",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777678259/altadensidad/xrpollie1l13m6wuuvsf.jpg",
    "description": "Badee Al Oud Sublime de Lattafa es un perfume unisex lanzado en 2023, con un perfil afrutado, amaderado y oriental."
  },
  {
    "id": 22,
    "name": "ACQUA DI GIO",
    "price": 85000,
    "category": "Diseñador",
    "gender": "Masculino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777678154/altadensidad/ggr34cnx406hde9css00.jpg",
    "description": "Acqua di Giò de Giorgio Armani es uno de los perfumes masculinos más icónicos del mundo, reconocido por su frescura marina y su elegancia atemporal. La versión Parfum"
  },
  {
    "id": 21,
    "name": "SWISS ARMY VICTORINOX",
    "price": 70000,
    "category": "Diseñador",
    "gender": "Masculino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777678023/altadensidad/hnepeteb4udoeegstsmk.jpg",
    "description": "El perfume Swiss Army de Victorinox es una fragancia masculina fresca, aromática y versátil, pensada para hombres activos que disfrutan tanto de la ciudad como de la naturaleza."
  },
  {
    "id": 20,
    "name": "360* PERRY ELLIS",
    "price": 85000,
    "category": "Diseñador",
    "gender": "Femenino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777677785/altadensidad/wbpsj2k846g9xwfbwp6n.jpg",
    "description": "El perfume 360° de Perry Ellis es una fragancia femenina de estilo floral fresco y acuático"
  },
  {
    "id": 19,
    "name": "9PM AFNAN",
    "price": 110000,
    "category": "Arabe",
    "gender": "Masculino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777677433/altadensidad/orin0rwghlqqqhsghir1.jpg",
    "description": "El perfume 9PM de Afnan es una fragancia masculina muy popular por su carácter dulce, cálido y seductor, ideal para la noche y climas frescos.",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "no": [
      "Manzana silvestre · Canela",
      "Flor de azahar",
      "Vainilla · Haba tonka"
    ],
    "h": 326
  },
  {
    "id": 18,
    "name": "212 VIP ROSE CAROLINA HERRERA",
    "price": 65000,
    "category": "Diseñador",
    "gender": "Femenino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777677296/altadensidad/sbuhaxcnp1bntjjmsygn.jpg",
    "description": "El perfume 212 VIP Rosé de Carolina Herrera es una fragancia femenina fresca, festiva y sofisticada, inspirada en el glamour urbano y la vida nocturna.",
    "f": "Cítrica / Fresca",
    "o": "Noche",
    "no": [
      "Champaña rosada",
      "Flor de durazno",
      "Madera reina · Feromonas"
    ],
    "h": 0
  },
  {
    "id": 17,
    "name": "212 SEXY CAROLINA HERRERA",
    "price": 70000,
    "category": "Diseñador",
    "gender": "Femenino",
    "sizes": [
      "100ml"
    ],
    "bottleTypes": [
      "Plástico",
      "Vidrio"
    ],
    "image": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777675965/altadensidad/ycyamcrucoi2jhwq77w5.jpg",
    "description": "El perfume 212 Sexy de Carolina Herrera es una fragancia femenina de carácter dulce, misterioso y seductor, ideal para la noche y ocasiones especiales.",
    "f": "Cítrica / Fresca",
    "o": "Noche",
    "no": [
      "Frutas frescas y bayas",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "h": 148
  }
];

  // ============================================================
  // DATOS DUROS: TOP 10 PERFUMES MÁS VENDIDOS
  // ============================================================
  const DATOS_DUROS_TOP10 = [
  {
    "posicion": 1,
    "producto_id": 82,
    "id": 82,
    "nombre": "SANTAL 33 LE LABO",
    "imagen": "assets/img/SANTAL_33.jpg",
    "categoria": "Diseñador",
    "genero": "Unisex",
    "f": "Amaderada",
    "o": "Oficina",
    "no": [
      "Cardamomo · Iris",
      "Papiro · Violeta",
      "Sándalo · Cedro · Cuero"
    ],
    "descripcion": "Santal 33 es un perfume amaderado y especiado, con un aire ahumado y sofisticado que lo ha convertido en un clásico moderno de la perfumería nicho.",
    "precio": 75000,
    "rating": 5
  },
  {
    "posicion": 2,
    "producto_id": 68,
    "id": 68,
    "nombre": "LIGHT BLUE DAMA DOLCE & GABBANA",
    "imagen": "assets/img/ligth_blue.jpg",
    "categoria": "Diseñador",
    "genero": "Femenino",
    "f": "Cítrica / Fresca",
    "o": "Verano",
    "no": [
      "Manzana verde · Limón",
      "Bambú · Jazmín",
      "Cedro · Ámbar"
    ],
    "descripcion": "Es una fragancia fresca, mediterránea y muy versátil, que se ha convertido en un clásico para climas cálidos y uso diario.",
    "precio": 75000,
    "rating": 4
  },
  {
    "posicion": 3,
    "producto_id": 64,
    "id": 64,
    "nombre": "LACOSTE BLANCA",
    "imagen": "assets/img/LACOSTE_BLANCA.png",
    "categoria": "Diseñador",
    "genero": "Masculino",
    "f": "Aromática",
    "o": "Oficina",
    "no": [
      "Pomelo · Cardamomo",
      "Ylang-ylang · Nardo",
      "Cedro de Virginia · Gamuza"
    ],
    "descripcion": "Es una fragancia fresca, limpia y elegante, inspirada en la icónica camiseta polo blanca de Lacoste.",
    "precio": 65000,
    "rating": 4
  },
  {
    "posicion": 4,
    "producto_id": 35,
    "id": 35,
    "nombre": "BHARARA KING",
    "imagen": "assets/img/BHARARAKING.webp",
    "categoria": "Arabe",
    "genero": "Masculino",
    "f": "Dulce / Gourmand",
    "o": "Noche",
    "no": [
      "Naranja · Bergamota",
      "Tutti-frutti",
      "Vainilla blanca · Ámbar"
    ],
    "descripcion": "Bharara King es un perfume masculino reconocido por su carácter poderoso, desafiante y moderno.",
    "precio": 110000,
    "rating": 5
  },
  {
    "posicion": 5,
    "producto_id": 96,
    "id": 96,
    "nombre": "CREED AVENTUS",
    "imagen": "assets/img/creed_adventus.webp",
    "categoria": "Diseñador",
    "genero": "Masculino",
    "f": "Amaderada",
    "o": "Noche",
    "no": [
      "Piña ahumada · Grosella",
      "Abedul · Jazmín",
      "Almizcle · Musgo de roble"
    ],
    "descripcion": "Una de las fragancias más emblemáticas de la casa Creed, homenaje al poder, la visión y el éxito.",
    "precio": 70000,
    "rating": 4
  },
  {
    "posicion": 6,
    "producto_id": 28,
    "id": 28,
    "nombre": "AMBER OUD GOLD AL HARAMAIN",
    "imagen": "assets/img/AMBER_OUD_GOLD.jpeg",
    "categoria": "Arabe",
    "genero": "Unisex",
    "f": "Dulce / Gourmand",
    "o": "Noche",
    "no": [
      "Bergamota · Notas verdes",
      "Melón · Piña dulce",
      "Ámbar · Vainilla"
    ],
    "descripcion": "El Amber Oud Gold Edition de Al Haramain es una fragancia unisex de estilo oriental gourmand, dulce, cálida y sofisticada.",
    "precio": 125000,
    "rating": 5
  },
  {
    "posicion": 7,
    "producto_id": 23,
    "id": 23,
    "nombre": "BADEE AL OUD SUBLIME LATTAFA",
    "imagen": "assets/img/ADEE_AL_OUD_SUBLIME.webp",
    "categoria": "Arabe",
    "genero": "Unisex",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "no": [
      "Manzana · Ciruela · Lichi",
      "Rosa · Jazmín",
      "Vainilla · Cedro · Pachulí"
    ],
    "descripcion": "Badee Al Oud Sublime de Lattafa es un perfume unisex con un perfil afrutado, amaderado y oriental.",
    "precio": 110000,
    "rating": 5
  },
  {
    "posicion": 8,
    "producto_id": 43,
    "id": 43,
    "nombre": "VALENTINO DONNA BORN IN ROMA",
    "imagen": "assets/img/DONNA_BORN_IN_ROMA.jpeg",
    "categoria": "Diseñador",
    "genero": "Femenino",
    "f": "Floral",
    "o": "Noche",
    "no": [
      "Grosella negra · Pimienta rosa",
      "Jazmín grandiflorum",
      "Vainilla bourbon · Madera"
    ],
    "descripcion": "Valentino Donna Born in Roma es una fragancia moderna, sofisticada y con un toque rebelde, inspirada en Roma.",
    "precio": 85000,
    "rating": 5
  },
  {
    "posicion": 9,
    "producto_id": 90,
    "id": 90,
    "nombre": "212 VIP BLACK CAROLINA HERRERA",
    "imagen": "assets/img/VIP_212_BLACK.jpg",
    "categoria": "Diseñador",
    "genero": "Masculino",
    "f": "Aromática",
    "o": "Noche",
    "no": [
      "Absenta · Anís",
      "Lavanda francesa",
      "Cuero negro · Vainilla"
    ],
    "descripcion": "212 VIP Black es un perfume masculino aromático y especiado con fondo cálido, ideal para ambientes sociales nocturnos.",
    "precio": 70000,
    "rating": 5
  },
  {
    "posicion": 10,
    "producto_id": 91,
    "id": 91,
    "nombre": "YARA LATTAFA",
    "imagen": "assets/img/YARA_LATTAFA2.jpg",
    "categoria": "Arabe",
    "genero": "Femenino",
    "f": "Dulce / Gourmand",
    "o": "Oficina",
    "no": [
      "Heliotropo · Orquídea",
      "Frutas tropicales",
      "Vainilla · Sándalo"
    ],
    "descripcion": "Yara de Lattafa es un perfume femenino dulce, floral y cremoso, juvenil y encantador con gran duración y versatilidad.",
    "precio": 110000,
    "rating": 5
  }
];

  // ============================================================
  // DATOS DUROS: CATÁLOGO DE PRESENTACIONES Y ENVASES DE AUTOR
  // ============================================================
  const DATOS_DUROS_ENVASES = [
  {
    "id": 1,
    "name": "AMIRA",
    "image": "assets/img/AMIRA.jpeg",
    "material": "Vidrio",
    "sizes": [
      "30ml"
    ],
    "price": 0,
    "description": "Un envase elegante y compacto de vidrio, diseñado para realzar la exclusividad de cada fragancia. Acabado refinado y lujoso en 30ml."
  },
  {
    "id": 2,
    "name": "CARTIER",
    "image": "assets/img/CARTIER.jpeg",
    "material": "Vidrio",
    "sizes": [
      "30ml",
      "60ml"
    ],
    "price": 0,
    "description": "Evoca la elegancia y el prestigio de la alta joyería. Transmite distinción atemporal y exclusividad en 30ml y 60ml."
  },
  {
    "id": 3,
    "name": "CILINDRO",
    "image": "assets/img/CILINDRO.jpeg",
    "material": "Vidrio",
    "sizes": [
      "100ml"
    ],
    "price": 0,
    "description": "Transmite solidez y equilibrio con su forma cilíndrica pura. Presencia y resistencia en formato generoso de 100ml."
  },
  {
    "id": 4,
    "name": "EROS",
    "image": "assets/img/EROS.jpeg",
    "material": "Vidrio",
    "sizes": [
      "60ml"
    ],
    "price": 0,
    "description": "Simboliza magnetismo, seducción y presencia. Ideal para perfumes intensos que buscan dejar una huella inolvidable en 60ml."
  },
  {
    "id": 5,
    "name": "VICTORY",
    "image": "assets/img/VICTORY.jpeg",
    "material": "Vidrio",
    "sizes": [
      "60ml"
    ],
    "price": 0,
    "description": "Representa triunfo y superación. Fuerza, confianza y energía positiva en cada aplicación en 60ml."
  },
  {
    "id": 6,
    "name": "GOOD GIRL",
    "image": "assets/img/GOOD_GIRL.jpeg",
    "material": "Vidrio",
    "sizes": [
      "30ml"
    ],
    "price": 0,
    "description": "Refleja feminidad encantadora, moderna y divertida en un formato práctico y estilizado de 30ml."
  },
  {
    "id": 7,
    "name": "CALAVERA",
    "image": "assets/img/calavera1.jpeg",
    "material": "Vidrio",
    "sizes": [
      "50ml"
    ],
    "price": 0,
    "description": "Un envase atrevido, rebelde y memorable con personalidad única. Formato de 50ml para fragancias temáticas y coleccionables."
  },
  {
    "id": 8,
    "name": "MINI YARA",
    "image": "assets/img/yaritas.jpeg",
    "material": "Vidrio",
    "sizes": [
      "30ml"
    ],
    "price": 0,
    "description": "Compacto y delicado, transmite dulzura, elegancia oriental y estilo en cada detalle en 30ml."
  },
  {
    "id": 9,
    "name": "VALENTINO",
    "image": "assets/img/VALENTINO_BOTTLE.jpeg",
    "material": "Vidrio",
    "sizes": [
      "30ml",
      "60ml"
    ],
    "price": 0,
    "description": "Glamour italiano y tachonado de alta costura. Exclusividad y sofisticación moderna en 30ml y 60ml."
  },
  {
    "id": 10,
    "name": "SAUVAGE",
    "image": "assets/img/SAUVAGE_BOTTLE.jpeg",
    "material": "Vidrio",
    "sizes": [
      "30ml"
    ],
    "price": 0,
    "description": "Transmite libertad y fuerza interior. Silueta minimalista y masculina para el día a día en 30ml."
  },
  {
    "id": 11,
    "name": "MOSCHINO BEAR",
    "image": "assets/img/MOSCHINO_BEAR.jpeg",
    "material": "Vidrio",
    "sizes": [
      "60ml"
    ],
    "price": 0,
    "description": "Combina lujo, creatividad e irreverencia con un toque juguetón en cristal premium de 60ml."
  }
];

  // ============================================================
  // DATOS DUROS: KITS DE REGALO Y COLECCIÓN EXCLUSIVA
  // ============================================================
  const DATOS_DUROS_KITS = [
  {
    "id": 8,
    "nombre": "TOY 2 MOSCHINO (3X30ml)",
    "imagen": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777762823/altadensidad/bvucwekoe67yo1indv2z.jpg",
    "descripcion": "La colección Toy 2 de Moschino reúne tres fragancias que, aunque diferentes en estilo, se complementan de manera ideal para cubrir cada momento del día y cada faceta de la personalidad femenina:\n\nToy 2 Pearl aporta frescura y sofisticación, con un perfil floral-frutal luminoso que transmite elegancia y modernidad.\n\nToy 2 Bubble Gum es la opción dulce y juguetona, con notas gourmand que evocan diversión, juventud y desenfado.\n\nToy 2 Dama (clásico) representa la esencia versátil y femenina, un floral-frutal elegante que se adapta a cualquier ocasión con estilo.",
    "precio": "60000.00",
    "activo": 1,
    "creado_en": "2026-05-02T23:00:24.000Z",
    "beneficios": []
  },
  {
    "id": 9,
    "nombre": "GOOD GIRL - CAROLINA HERRERA (3X30ml)",
    "imagen": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777763020/altadensidad/yl2vpvf9nxo6wsv9bevw.jpg",
    "descripcion": "La línea Good Girl de Carolina Herrera es un homenaje a la dualidad y fuerza de la mujer moderna. Cada versión aporta un carácter distinto, pero juntas forman un kit versátil y sofisticado:\n\nGood Girl: La original, intensa y seductora. Es ideal para noches elegantes y climas fríos. Representa poder y misterio.\n\nGood Girl Blush: La más romántica y ligera. Perfecta para el día a día y climas cálidos. Es la faceta suave y luminosa de la colección.\n\nVery Good Girl: La más atrevida y juvenil. Es coqueta y moderna, ideal para citas y momentos sociales. Representa pasión y alegría.",
    "precio": "60000.00",
    "activo": 0,
    "creado_en": "2026-05-02T23:03:41.000Z",
    "beneficios": []
  },
  {
    "id": 10,
    "nombre": "VERSACE (2X60ml)",
    "imagen": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777763174/altadensidad/ookazhngckapid2xvzi2.jpg",
    "descripcion": "La línea Eros de Versace está inspirada en el dios griego del amor y representa pasión, fuerza y seducción. Cada versión aporta un carácter distinto, pero juntas forman un kit versátil y poderoso:\n\nVersace Eros: La original, fresca y juvenil. Es ideal para fiestas, citas y ambientes sociales donde se busca energía y seducción.\n\nVersace Eros Flame (2018): La más cálida y apasionada. Con cítricos vibrantes. Es perfecta para noches románticas, climas fríos y ocasiones especiales donde se quiere transmitir fuerza y elegancia.",
    "precio": "55000.00",
    "activo": 1,
    "creado_en": "2026-05-02T23:06:16.000Z",
    "beneficios": []
  },
  {
    "id": 11,
    "nombre": "KIT PERFUMES X3 DE 30ML CON FEROMONAS",
    "imagen": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777763789/altadensidad/hvdsuptdh0pujhxbc0oy.jpg",
    "descripcion": "Aquí podrás comprar tus perfumes favoritos en presentación de 30 ml, con feromonas incluidas, eligiendo entre 3 referencias diferentes o repitiendo la misma para tu kit personalizado. Con feromonas, potenciando la atracción y la confianza.",
    "precio": "45000.00",
    "activo": 0,
    "creado_en": "2026-05-02T23:16:30.000Z",
    "beneficios": []
  },
  {
    "id": 12,
    "nombre": "KIT PERFUMES X3 DE 60ML CON FEROMONAS",
    "imagen": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777763874/altadensidad/dwxwugomp4sbayop4lgf.jpg",
    "descripcion": "Aquí podrás comprar tus perfumes favoritos en presentación de 60 ml, con feromonas incluidas, eligiendo entre 3 referencias diferentes o repitiendo la misma para tu kit personalizado. Con feromonas, potenciando la atracción, la confianza y el magnetismo personal.",
    "precio": "70000.00",
    "activo": 0,
    "creado_en": "2026-05-02T23:17:55.000Z",
    "beneficios": []
  },
  {
    "id": 13,
    "nombre": "KIT X3 PERFUMES DE 100ML CON FEROMONAS",
    "imagen": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777763943/altadensidad/xcpcfcksrqschu4cifo8.jpg",
    "descripcion": "Aquí podrás comprar tus perfumes favoritos en presentación de 100 ml, con feromonas incluidas, eligiendo entre 3 referencias diferentes o repitiendo la misma para tu kit personalizado. Con feromonas, potenciando la atracción, la confianza y el magnetismo personal.",
    "precio": "100000.00",
    "activo": 0,
    "creado_en": "2026-05-02T23:19:05.000Z",
    "beneficios": []
  },
  {
    "id": 14,
    "nombre": "PACO RABANNE FEMENINO Y MASCULINO",
    "imagen": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777764260/altadensidad/yjz6lqytbmfihr4hupmp.jpg",
    "descripcion": "Aquí podrás comprar tus perfumes favoritos de Paco Rabanne – Phantom y Fame – en presentación de 60 ml con feromonas, eligiendo entre ambos o repitiendo la misma referencia para tu kit personalizado.\n\nPhantom (Masculino): Futurista, fresco y energético, con notas de limón, lavanda y vainilla que transmiten confianza y modernidad.\n\nFame (Femenino): Sofisticado, sensual y glamuroso, con mango, bergamota, jazmín y sándalo que evocan feminidad, lujo y magnetismo.",
    "precio": "60000.00",
    "activo": 1,
    "creado_en": "2026-05-02T23:24:21.000Z",
    "beneficios": []
  },
  {
    "id": 15,
    "nombre": "KIT AMIRA X3 DE 30ML CON FEROMONAS",
    "imagen": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777764404/altadensidad/rx9wyeclqrksdvbtyjo3.jpg",
    "descripcion": "Aquí podrás comprar tus perfumes favoritos en presentación de 30 ml, con feromonas incluidas, eligiendo entre 3 referencias diferentes o repitiendo la misma para tu kit personalizado. Con feromonas, potenciando la atracción, la confianza y el magnetismo personal.",
    "precio": "50000.00",
    "activo": 0,
    "creado_en": "2026-05-02T23:26:45.000Z",
    "beneficios": []
  },
  {
    "id": 16,
    "nombre": "VICTORIA´S SECRET (3X250ml)",
    "imagen": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777764677/altadensidad/ss7toak3vdizeaivldfa.jpg",
    "descripcion": "Aquí podrás comprar tus splashes favoritos de Victoria’s Secret en presentación de 250ML ml con feromonas, es el trío perfecto porque combina lo romántico, lo dulce y lo fresco, ofreciendo a cada mujer un abanico completo de aromas para expresar su estilo en cualquier momento.",
    "precio": "60000.00",
    "activo": 1,
    "creado_en": "2026-05-02T23:31:18.000Z",
    "beneficios": []
  },
  {
    "id": 18,
    "nombre": "BADEE AL OUD  – LATTAFA (3X40ml)",
    "imagen": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777775608/altadensidad/zu2yrgwku12kajpttkbj.jpg",
    "descripcion": "Sueblime(Rojo): intensidad cálida y envolvente, ideal para quienes buscan un aroma profundo y elegante.\nHonor & Glory (blanco): frescura luminosa con un toque refinado, perfecto para ocasiones especiales y momentos de distinción.\nAmethyst (morado): notas misteriosas y seductoras, diseñadas para transmitir confianza y magnetismo.",
    "precio": "150000.00",
    "activo": 1,
    "creado_en": "2026-05-03T02:33:30.000Z",
    "beneficios": []
  },
  {
    "id": 19,
    "nombre": "ARMAF DELIGHTS – (3x50ml)",
    "imagen": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777775752/altadensidad/dz7jnfeuejxdlooblq6s.jpg",
    "descripcion": "Un set de fragancias que combina la elegancia del perfume con la estética divertida y creativa de los postres. Cada frasco está diseñado como un delicioso milkshake o copa de helado, con detalles en forma de pajilla y galleta, transmitiendo un aire juvenil y sofisticado al mismo tiempo.",
    "precio": "135000.00",
    "activo": 1,
    "creado_en": "2026-05-03T02:35:53.000Z",
    "beneficios": []
  },
  {
    "id": 20,
    "nombre": "YARA & ASAD  - LATTAFA (4X30ml)",
    "imagen": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777776074/altadensidad/yiuf473p8acgyjlg9uoz.jpg",
    "descripcion": "Un set de lujo que reúne cuatro fragancias icónicas de la casa Lattafa, presentadas en un elegante estuche blanco con detalles dorados:\nYara Tous (Naranja): vibrante y juvenil, con notas frutales que transmiten energía y frescura.\nYara Moi (Blanco): delicado y sofisticado, ideal para quienes buscan un aroma limpio y elegante.\nYara (Rosa): suave y romántico, con matices florales que evocan serenidad.\nAsad (Negra): intenso y poderoso, con un carácter fuerte y magnético, perfecto para ocasiones especiales.",
    "precio": "160000.00",
    "activo": 1,
    "creado_en": "2026-05-03T02:41:16.000Z",
    "beneficios": []
  },
  {
    "id": 21,
    "nombre": "KIT LE LABO (5X30ml)",
    "imagen": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777776230/altadensidad/jmnzmywwehuzalfosnts.jpg",
    "descripcion": "Un set artesanal que reúne cinco de las fragancias más icónicas de la casa Le Labo, reconocida por su estilo minimalista y su enfoque en la perfumería de autor. Cada frasco presenta un diseño sobrio con etiqueta tipográfica en blanco y negro, reflejando autenticidad y sofisticación. Incluye:\nRose 31: un clásico floral con carácter especiado y sensual.\nThe Matcha 26: fresco y moderno, inspirado en la serenidad del té verde.\nBergamote 22: cítrico vibrante con un toque luminoso y elegante.\nSantal 33: la fragancia insignia, amaderada y envolvente, símbolo de estilo contemporáneo.\nThé Noir 29: profundo y misterioso, con notas de té negro y matices oscuros.",
    "precio": "170000.00",
    "activo": 1,
    "creado_en": "2026-05-03T02:43:52.000Z",
    "beneficios": []
  },
  {
    "id": 22,
    "nombre": "KIT KHAMRAH - LATTAFA (3X30ml)",
    "imagen": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777776339/altadensidad/n74evboxglcsvseqhvyb.jpg",
    "descripcion": "Un set de lujo que reúne tres variantes exclusivas de la línea Khamrah, presentadas en un estuche negro con detalles dorados y diseño geométrico sofisticado. Cada frasco cuadrado de vidrio incorpora patrones diagonales y acabados premium, reflejando la esencia de la alta perfumería árabe.Incluye:\nKhamrah Qahwa: una fragancia cálida y envolvente con notas inspiradas en el café, perfecta para quienes buscan intensidad y carácter.\nKhamrah: el clásico de la colección, con un equilibrio entre dulzura especiada y elegancia oriental.\nKhamrah Dukhan: profundo y misterioso, con matices ahumados que transmiten fuerza y distinción.",
    "precio": "150000.00",
    "activo": 1,
    "creado_en": "2026-05-03T02:45:41.000Z",
    "beneficios": []
  },
  {
    "id": 23,
    "nombre": "ORIENTICA LUXURY- MINIATURE DISCOVERY SET (6X8ml)",
    "imagen": "https://res.cloudinary.com/dfgmxywkt/image/upload/v1777777180/altadensidad/kql93ppyy4plscmyr1nd.jpg",
    "descripcion": "Un set exclusivo que reúne cinco fragancias de alta gama en formato miniatura, ideal para descubrir la esencia de la perfumería de lujo árabe.Presentación premium: Caja negra con patrones dorados y tipografía refinada, perfecta para regalo o colección.\nVersatilidad: Cinco fragancias distintas que permiten explorar diferentes estilos olfativos, desde notas frescas y luminosas hasta aromas intensos y misteriosos.",
    "precio": "110000.00",
    "activo": 1,
    "creado_en": "2026-05-03T02:59:42.000Z",
    "beneficios": []
  }
];

  // Estados reactivos en memoria
  let P = [];
  let TOP10 = [...DATOS_DUROS_TOP10];
  let ENVASES = [...DATOS_DUROS_ENVASES];
  let KITS = [...DATOS_DUROS_KITS];
  let kitsPaginaActual = 1;
  const KITS_POR_PAGINA = 6;
  const PRODUCTOS_POR_PAGINA = 12;
  let paginaActual = 1;

  const CART_KEY = "ad_cart_v2";
  const LEGACY_CART_KEY = "altadensidad_carrito";
  const ENVIO_TARIFAS = { medellin: 15000, metropolitana: 20000, nacional: 22000 };
  const ENVIO_ZONAS = { medellin: "Medellín", metropolitana: "Área Metropolitana", nacional: "Nacional" };

  const $ = function(s) { return document.querySelector(s); };
  const $$ = function(s) { return document.querySelectorAll(s); };
  const fmt = function(n) { return "$" + Number(n).toLocaleString("es-CO"); };
  const esc = function(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  };

  // Base del API (localhost:3000 en desarrollo, Railway en producción)
  function apiBases() {
    const isLocal = typeof location !== "undefined" &&
      (location.hostname === "localhost" || location.hostname === "127.0.0.1") &&
      location.port === "3000";
    return isLocal
      ? ["http://localhost:3000/api", "https://altadensidadpage-production.up.railway.app/api"]
      : ["https://altadensidadpage-production.up.railway.app/api"];
  }

  // Normalizador universal de imágenes para rutas locales y remotas
  function normalizarImagen(src) {
    if (!src) return "assets/img/Logo2026.png";
    if (src.startsWith("http://") || src.startsWith("https://")) return src;
    let p = src.trim();
    if (p.startsWith("img/")) {
      p = "assets/" + p;
    } else if (!p.startsWith("assets/")) {
      p = "assets/img/" + p;
    }
    return p
      .replace(/cartier\.jpeg$/i, "CARTIER.jpeg")
      .replace(/cilindro\.jpeg$/i, "CILINDRO.jpeg")
      .replace(/amira\.jpeg$/i, "AMIRA.jpeg")
      .replace(/victory\.jpeg$/i, "VICTORY.jpeg")
      .replace(/eros\.jpeg$/i, "EROS.jpeg");
  }

  // ============================================================
  // MODELO DE PRODUCTO (marca, colección, tallas y envases reales)
  // ============================================================
  const MARCAS_RECONOCIDAS = [
    "CAROLINA HERRERA", "LATTAFA", "PACO RABANNE", "VERSACE", "DIOR", "CHANEL",
    "HUGO BOSS", "LACOSTE", "ARMAF", "LOUIS VUITTON", "ORIENTICA", "AFNAN",
    "PERRY ELLIS", "VICTORINOX", "AL HARAMAIN", "MONTALE", "BHARARA", "BOND N",
    "VALENTINO", "PARIS HILTON", "ARIANA GRANDE", "BVLGARI", "XERJOFF", "GIORGIO ARMANI",
    "YVES SAINT LAURENT", "CALVIN KLEIN", "JEAN PAUL GAULTIER", "DOLCE & GABBANA",
    "CREED", "TOM FORD", "HERMES", "ROJA DOVE", "NISHANE", "MANCERA", "INITIO",
    "MOSCHINO", "MONTBLANC", "LE LABO", "ILMIN", "AHLI", "BURBERRY", "AMOUAGE"
  ];

  function extraerMarca(nombre) {
    if (!nombre) return "Otras marcas";
    const up = nombre.toUpperCase();
    for (const marca of MARCAS_RECONOCIDAS) {
      if (up.includes(marca)) return marca === "BOND N" ? "BOND NO. 9" : marca;
    }
    return "Otras marcas";
  }

  function etiquetaColeccion(c) {
    return c === "Arabe" ? "Árabe" : (c || "Diseñador");
  }

  function normalizarGenero(g) {
    if (g === "Hombre" || g === "Masculino") return "Masculino";
    if (g === "Mujer" || g === "Femenino") return "Femenino";
    return "Unisex";
  }

  // Familia, ocasión y tono del frasco deducidos de la descripción cuando no hay perfil curado
  function perfilOlfativo(item, idx) {
    const nameLow = (item.name || "").toLowerCase();
    const descLow = (item.description || "").toLowerCase();
    const catLow = (item.category || "").toLowerCase();
    let occ = "Noche";
    let fam = "Amaderada";
    let hue = (idx * 37) % 360;

    if (descLow.includes("fresc") || descLow.includes("cítric") || descLow.includes("verano") || nameLow.includes("aqua") || nameLow.includes("blue")) {
      occ = "Verano"; fam = "Cítrica / Fresca"; hue = 190;
    } else if (descLow.includes("oficina") || descLow.includes("elegante") || descLow.includes("diario") || descLow.includes("versátil")) {
      occ = "Oficina"; fam = "Aromática"; hue = 130;
    } else if (descLow.includes("dulce") || descLow.includes("vainilla") || descLow.includes("gourmand") || descLow.includes("caramelo") || nameLow.includes("candy")) {
      fam = "Dulce / Gourmand"; hue = 24;
    } else if (descLow.includes("floral") || nameLow.includes("rosa") || nameLow.includes("iris") || nameLow.includes("rose")) {
      fam = "Floral"; hue = 330;
    } else if (descLow.includes("cuero") || nameLow.includes("cuero") || nameLow.includes("leather")) {
      fam = "Cuero"; hue = 16;
    } else if (catLow.includes("arabe") || descLow.includes("oriental") || descLow.includes("especiad") || nameLow.includes("oud")) {
      fam = "Especiada / Árabe"; hue = 40;
    }
    return { f: fam, o: occ, h: hue };
  }

  // Convierte un producto con forma de API ({id, name, price, sizes, bottleTypes...}) al modelo interno
  function adaptarProducto(item, idx) {
    const curado = DATOS_DUROS_PRODUCTOS.find(function(d) { return d.id === Number(item.id) && d.f; }) || item;
    const base = perfilOlfativo(item, idx);
    const nombre = (item.name || item.nombre || "Fragancia").trim();
    return {
      id: Number(item.id),
      n: nombre,
      b: extraerMarca(nombre),
      c: item.category || item.categoria || "Diseñador",
      g: normalizarGenero(item.gender || item.genero),
      f: curado.f || base.f,
      o: curado.o || base.o,
      h: curado.h != null ? curado.h : base.h,
      no: curado.no || ["Salida vibrante", "Corazón de autor", "Ámbar y feromonas"],
      p: Number(item.price || item.precio) > 0 ? Number(item.price || item.precio) : 75000,
      sz: Array.isArray(item.sizes) ? item.sizes.filter(Boolean) : [],
      env: Array.isArray(item.bottleTypes) ? item.bottleTypes.filter(Boolean) : [],
      desc: item.description || item.descripcion || null,
      img: normalizarImagen(item.image || item.imagen || (item.images && item.images[0])),
      ag: Number(item.agotado) === 1
    };
  }

  // Busca un producto por id en el catálogo; si solo existe en el Top 10, lo adapta
  function buscarProducto(id) {
    const n = Number(id);
    const p = P.find(function(x) { return x.id === n; });
    if (p) return p;
    const t = TOP10.find(function(x) { return Number(x.producto_id || x.id) === n; });
    if (t) {
      return adaptarProducto({
        id: n, name: t.nombre, price: t.precio, image: t.imagen,
        category: t.categoria, gender: t.genero, description: t.descripcion,
        f: t.f, o: t.o, no: t.no, agotado: t.agotado
      }, n);
    }
    return null;
  }

  // Filtros activos y orden
  const FILTROS_BASE = {
    search: "",
    occasion: "Todos",
    family: "Todos",
    gender: "Todos",
    category: "Todos",
    brand: "Todos"
  };
  let filters = Object.assign({}, FILTROS_BASE);
  let orden = "destacados";

  // Carrito y selección del detalle
  let cart = [];
  let D = { id: null, ml: "", env: "", q: 1 };

  try {
    cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch(e) {
    cart = [];
  }

  function save() {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch(e) {}
  }

  // Incorpora lo que se agregó desde páginas con el carrito anterior (top10, envases, nosotros)
  function migrarCarritoLegacy() {
    let legacy = [];
    try {
      legacy = JSON.parse(localStorage.getItem(LEGACY_CART_KEY) || "[]");
      localStorage.removeItem("ad_cart");
    } catch(e) {
      return;
    }
    if (!Array.isArray(legacy) || !legacy.length) return;
    legacy.forEach(function(i) {
      const q = Math.max(1, Number(i.cantidad) || 1);
      if (String(i.id).startsWith("kit_")) {
        const kitId = Number(String(i.id).replace("kit_", ""));
        const existente = cart.find(function(x) { return x.id === "kit_" + kitId; });
        if (existente) existente.q += q;
        else cart.push({ id: "kit_" + kitId, isKit: true, kitId: kitId, q: q, precio: Number(i.price) || 0, n: i.name, ml: "Kit" });
      } else {
        const p = buscarProducto(i.id);
        addToCart(Number(i.id), p ? (p.sz[0] || "") : "", p ? (p.env[0] || "") : "", q, true);
      }
    });
    try { localStorage.removeItem(LEGACY_CART_KEY); } catch(e) {}
    save();
  }

  function etiquetaTalla(ml) {
    if (ml === "" || ml == null) return "";
    return typeof ml === "number" ? ml + " ml" : String(ml);
  }

  function pr(p) {
    return Number(p.p || p.precio || p.price || 75000);
  }

  function bt(h, s, img, name, isPriority) {
    if (img) {
      const realImg = normalizarImagen(img);
      const loadingAttr = isPriority ? 'loading="eager" fetchpriority="high"' : 'loading="lazy" decoding="async"';
      return `
        <div class="bottle-wrap">
          <img src="${realImg}" alt="${esc(name || 'Fragancia')}" class="stage-real-img" width="280" height="280" ${loadingAttr} onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='grid';">
          <div class="bottle fallback-bottle" style="--h:${h || 32};--s:${s || 1.7};display:none"><i></i></div>
        </div>
      `;
    }
    return `<div class="bottle" style="--h:${h || 32};--s:${s || 1.7}"><i></i></div>`;
  }

  function desc(p) {
    if (p.desc) return p.desc;
    const f = (p.f || "de autor").toLowerCase();
    const no = p.no || ["Notas cítricas", "Corazón aromático", "Ámbar y feromonas"];
    return `Una fragancia ${f} de alta densidad. Abre con ${no[0].toLowerCase()}, se asienta en ${no[1].toLowerCase()} y deja un fondo memorable de ${no[2].toLowerCase()}. Concentración pura Extrait de Parfum con base de feromonas.`;
  }

  function normalizar(txt) {
    return (txt || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
  }

  // ============================================================
  // COLECCIÓN: BÚSQUEDA, FILTROS, ORDEN Y PAGINACIÓN
  // ============================================================
  function filtrarProductos() {
    const term = normalizar(filters.search);
    return P.filter(function(p) {
      if (term) {
        const enNombre = normalizar(p.n).includes(term);
        const enMarca = normalizar(p.b).includes(term);
        const enFamilia = normalizar(p.f).includes(term);
        const enOcasion = normalizar(p.o).includes(term);
        const enNotas = p.no && p.no.some(n => normalizar(n).includes(term));
        const enDesc = p.desc ? normalizar(p.desc).includes(term) : false;
        if (!enNombre && !enMarca && !enFamilia && !enOcasion && !enNotas && !enDesc) return false;
      }
      if (filters.occasion !== "Todos" && p.o !== filters.occasion) return false;
      if (filters.family !== "Todos" && p.f !== filters.family) return false;
      if (filters.gender !== "Todos" && p.g !== filters.gender) return false;
      if (filters.category !== "Todos" && p.c !== filters.category) return false;
      if (filters.brand !== "Todos" && p.b !== filters.brand) return false;
      return true;
    });
  }

  function ordenarProductos(lista) {
    const copia = lista.slice();
    switch (orden) {
      case "precio-asc":
        return copia.sort((a, b) => pr(a) - pr(b));
      case "precio-desc":
        return copia.sort((a, b) => pr(b) - pr(a));
      case "nombre-asc":
        return copia.sort((a, b) => a.n.localeCompare(b.n));
      default:
        // Recomendados: agrupados por marca y luego por nombre
        return copia.sort((a, b) => a.b.localeCompare(b.b) || a.n.localeCompare(b.n));
    }
  }

  function getActiveFilterCount() {
    let count = 0;
    ["occasion", "family", "gender", "category", "brand"].forEach(function(k) {
      if (filters[k] !== "Todos") count++;
    });
    if (filters.search) count++;
    return count;
  }

  function updateFilterBadge() {
    const badge = $("#filterCountBadge");
    if (!badge) return;
    const count = getActiveFilterCount();
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = "inline-block";
    } else {
      badge.style.display = "none";
    }
  }

  function renderChips() {
    const el = $("#chips");
    if (!el) return;
    const ocasiones = ["Todos", "Noche", "Oficina", "Verano"];
    el.innerHTML = ocasiones.map(function(x) {
      return `<button class="chip up ${x === filters.occasion ? 'on' : ''}" data-f="${x}">${x}</button>`;
    }).join("");
  }

  function aplicarFiltros() {
    paginaActual = 1;
    renderChips();
    renderGrid();
  }

  function renderGrid(scroll) {
    const el = $("#grid");
    const statusEl = $("#filterStatus");
    const metaEl = $("#coleccionMeta");
    if (!el) return;

    const filtrados = ordenarProductos(filtrarProductos());
    const totalPaginas = Math.max(1, Math.ceil(filtrados.length / PRODUCTOS_POR_PAGINA));
    if (paginaActual > totalPaginas) paginaActual = 1;
    const inicio = (paginaActual - 1) * PRODUCTOS_POR_PAGINA;
    const pagina = filtrados.slice(inicio, inicio + PRODUCTOS_POR_PAGINA);

    if (statusEl) {
      if (getActiveFilterCount() > 0) {
        statusEl.style.display = "flex";
        statusEl.innerHTML = `
          <span>Mostrando <b>${filtrados.length}</b> de ${P.length} fragancias</span>
          <button class="link up" id="btnResetInline" style="font-size:var(--fs-2)">Limpiar filtros</button>
        `;
      } else {
        statusEl.style.display = "none";
      }
    }

    if (metaEl) {
      metaEl.textContent = `${P.length} formulaciones · Extrait de Parfum · Base de feromonas`;
    }

    updateFilterBadge();

    if (!filtrados.length) {
      el.innerHTML = `
        <div class="grid-empty">
          <p class="mute">No encontramos ninguna fragancia que coincida con estos criterios.</p>
          <div class="grid-empty-actions">
            <button class="btn btn--line up" id="btnResetEmpty">Ver toda la colección</button>
            <button class="btn up" data-aura>Pedir recomendación a AURA</button>
          </div>
        </div>
      `;
      renderPaginacion(0);
      return;
    }

    el.innerHTML = pagina.map(function(p, idx) {
      const isPriority = paginaActual === 1 && idx < 6;
      return `
        <article class="card">
          <div class="stage" data-open="${p.id}">
            <span class="tag up">Extrait de Parfum</span>
            ${bt(p.h, 1, p.img, p.n, isPriority)}
            <div class="notes">${esc((p.no || []).join(" · "))}</div>
          </div>
          <div class="info">
            <div>
              <small class="up card-brand">${esc(p.b)} · ${esc(etiquetaColeccion(p.c))}</small>
              <h3 data-open="${p.id}">${esc(p.n)}</h3>
              <span>${esc(p.f)} · ${fmt(pr(p))}</span>
            </div>
            ${p.ag
              ? `<button class="link up" disabled aria-disabled="true">Agotado</button>`
              : `<button class="link up" data-add="${p.id}">Añadir</button>`}
          </div>
        </article>
      `;
    }).join("");

    renderPaginacion(filtrados.length);

    if (scroll) {
      const sec = $("#coleccion");
      if (sec) window.scrollTo({ top: sec.getBoundingClientRect().top + window.pageYOffset - 80, behavior: "smooth" });
    }
  }

  function paginasVisibles(actual, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (actual <= 4) return [1, 2, 3, 4, 5, "...", total];
    if (actual >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
    return [1, "...", actual - 1, actual, actual + 1, "...", total];
  }

  function renderPaginacion(totalItems) {
    const cont = $("#paginacion");
    if (!cont) return;
    const totalPaginas = Math.ceil(totalItems / PRODUCTOS_POR_PAGINA);
    if (totalPaginas <= 1) {
      cont.innerHTML = "";
      return;
    }
    let html = `<button class="pag-btn" data-pg="${paginaActual - 1}" ${paginaActual === 1 ? "disabled" : ""} aria-label="Página anterior">←</button>`;
    paginasVisibles(paginaActual, totalPaginas).forEach(function(p) {
      html += p === "..."
        ? `<span class="pag-ellipsis">…</span>`
        : `<button class="pag-btn ${p === paginaActual ? "pag-active" : ""}" data-pg="${p}" aria-label="Página ${p}">${p}</button>`;
    });
    html += `<button class="pag-btn" data-pg="${paginaActual + 1}" ${paginaActual === totalPaginas ? "disabled" : ""} aria-label="Página siguiente">→</button>`;
    cont.innerHTML = html;
  }

  // Datos estructurados para buscadores (catálogo completo)
  function inyectarSchemaProductos() {
    if (!P.length || !$("#grid")) return;
    const previo = document.getElementById("schema-productos-dinamico");
    if (previo) previo.remove();
    const script = document.createElement("script");
    script.id = "schema-productos-dinamico";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Catálogo de Fragancias de Alta Densidad",
      "numberOfItems": P.length,
      "itemListElement": P.map(function(p, idx) {
        return {
          "@type": "ListItem",
          "position": idx + 1,
          "item": {
            "@type": "Product",
            "name": p.n,
            "image": p.img.startsWith("http") ? p.img : "https://alta-densidad-page.vercel.app/" + p.img,
            "description": p.desc || ("Perfume " + p.n + " en concentración pura Extrait de Parfum y fijación prolongada."),
            "category": etiquetaColeccion(p.c),
            "brand": { "@type": "Brand", "name": "Alta Densidad" },
            "offers": {
              "@type": "Offer",
              "priceCurrency": "COP",
              "price": pr(p),
              "availability": "https://schema.org/InStock",
              "url": "https://alta-densidad-page.vercel.app/"
            }
          }
        };
      })
    });
    document.head.appendChild(script);
  }

  // Schema de las páginas dedicadas (top10.html / envases.html)
  function inyectarSchemaPagina() {
    const pagina = document.body.dataset.page;
    let lista = null;
    let nombre = "";
    if (pagina === "top10") {
      nombre = "Top 10 perfumes más vendidos - Fragancias de Alta Densidad";
      lista = TOP10.map(t => ({ name: t.nombre || t.name, image: t.imagen || t.image, description: t.descripcion, price: Number(t.precio || t.price || 0) }));
    } else if (pagina === "envases") {
      nombre = "Envases para perfume - Fragancias de Alta Densidad";
      lista = ENVASES.map(z => ({ name: "Envase " + (z.name || z.nombre), image: z.image || z.imagen, description: z.description || z.descripcion }));
    }
    if (!lista || !lista.length) return;
    const previo = document.getElementById("schema-pagina-dinamico");
    if (previo) previo.remove();
    const url = "https://alta-densidad-page.vercel.app/" + pagina + ".html";
    const script = document.createElement("script");
    script.id = "schema-pagina-dinamico";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": nombre,
      "itemListOrder": "https://schema.org/ItemListOrderAscending",
      "numberOfItems": lista.length,
      "itemListElement": lista.map(function(x, idx) {
        const img = normalizarImagen(x.image);
        const item = {
          "@type": "Product",
          "name": x.name,
          "image": img.startsWith("http") ? img : "https://alta-densidad-page.vercel.app/" + img,
          "description": x.description || x.name,
          "brand": { "@type": "Brand", "name": "Alta Densidad" }
        };
        if (x.price) {
          item.offers = { "@type": "Offer", "priceCurrency": "COP", "price": x.price, "availability": "https://schema.org/InStock", "url": url };
        }
        return { "@type": "ListItem", "position": idx + 1, "item": item };
      })
    });
    document.head.appendChild(script);
  }

  // Pestañas genéricas: [data-tabs] > [data-tab="x"] controla #tab-x
  function initTabs() {
    $$("[data-tabs]").forEach(function(grupo) {
      const botones = grupo.querySelectorAll("[data-tab]");
      botones.forEach(function(btn) {
        btn.addEventListener("click", function() {
          botones.forEach(function(b) {
            const activo = b === btn;
            b.classList.toggle("on", activo);
            b.setAttribute("aria-selected", String(activo));
            const panel = document.getElementById("tab-" + b.dataset.tab);
            if (panel) panel.hidden = !activo;
          });
        });
      });
    });
  }

  // Contadores animados: <span data-count="99">99</span>
  function initContadores() {
    const nums = $$("[data-count]");
    if (!nums.length || !("IntersectionObserver" in window)) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);
        const el = entry.target;
        const fin = Number(el.dataset.count);
        const desde = fin > 1000 ? fin - 30 : 0;
        const inicio = performance.now();
        function paso(t) {
          const k = Math.min(1, (t - inicio) / 1400);
          el.textContent = Math.round(desde + (fin - desde) * (1 - Math.pow(1 - k, 3)));
          if (k < 1) requestAnimationFrame(paso);
        }
        requestAnimationFrame(paso);
      });
    }, { threshold: 0.5 });
    nums.forEach(n => obs.observe(n));
  }

  // ============================================================
  // TOP 10, ENVASES Y KITS
  // ============================================================
  function renderRank() {
    const el = $("#rank");
    if (!el) return;
    el.innerHTML = TOP10.map(function(p, i) {
      const pId = p.producto_id || p.id;
      const nom = p.nombre || p.name || p.n;
      const imgUrl = normalizarImagen(p.imagen || p.image || p.img);
      const fam = p.f || p.categoria || p.category || "Perfumería de Autor";
      const notas = p.no ? p.no.join(" · ") : (p.genero || p.gender || "Unisex");
      const precio = Number(p.precio || p.price || p.p || 75000);
      const loadingAttr = i < 4 ? 'loading="eager" fetchpriority="high"' : 'loading="lazy" decoding="async"';
      return `
        <div class="row rv in">
          <span class="n">${i < 9 ? "0" : ""}${i + 1}</span>
          <div class="rank-thumb-wrap" data-open="${pId}">
            <img src="${imgUrl}" alt="${esc(nom)}" class="rank-thumb" width="60" height="60" ${loadingAttr} onerror="this.src='assets/img/Logo2026.png';">
          </div>
          <div>
            <h3 data-open="${pId}">${esc(nom)}</h3>
            <small>${esc(fam)} · ${esc(notas)}</small>
            <small class="stars" aria-label="${Number(p.rating) || 5} de 5 estrellas">${"★".repeat(Number(p.rating) || 5)}${"☆".repeat(5 - (Number(p.rating) || 5))}</small>
          </div>
          <span class="pr">${fmt(precio)}</span>
          <button class="link up" data-open="${pId}">Ver</button>
        </div>
      `;
    }).join("");
  }

  function renderSizes() {
    const el = $("#sizes");
    if (!el) return;
    el.innerHTML = ENVASES.map(function(z, idx) {
      const imgPath = normalizarImagen(z.image || z.imagen);
      const tallas = Array.isArray(z.sizes) && z.sizes.length ? z.sizes.join(" · ") : (z.talla || "30ml · 60ml");
      const nom = z.name || z.nombre;
      const msgWa = encodeURIComponent("¡Hola! Me gustaría pedir mi perfume en el envase " + nom + " de Alta Densidad. ✨");
      const loadingAttr = idx < 4 ? 'loading="eager" fetchpriority="high"' : 'loading="lazy" decoding="async"';
      return `
        <div class="size rv in">
          <div class="stage" style="padding:var(--sp-2);">
            <img src="${imgPath}" alt="Envase ${esc(nom)}" class="stage-real-img" width="240" height="200" ${loadingAttr} style="max-height:200px; width:auto; max-width:85%; object-fit:contain;" onerror="this.src='assets/img/Logo2026.png';">
          </div>
          <b style="font-size:22px; margin-top:var(--sp-1); letter-spacing:0.04em;">${esc(nom)}</b>
          <span class="up eyebrow">${esc(tallas)} · ${esc(z.material || 'Vidrio')}</span>
          <p class="mute" style="font-size:var(--fs-2); line-height:1.45; max-width:28ch; margin:var(--sp-1) 0 var(--sp-2);">${esc(z.description || z.descripcion || 'Envase de vidrio premium.')}</p>
          <a class="btn btn--line up" style="font-size:11px; padding:var(--sp-2) var(--sp-3);" href="https://wa.me/${WA}?text=${msgWa}" target="_blank" rel="noopener">Pedir en este envase</a>
        </div>
      `;
    }).join("");
  }

  function renderKits() {
    const grid = $("#kitsGrid");
    if (!grid) return;

    const activos = KITS.filter(k => k.activo !== 0);
    const total = activos.length;
    const totalPaginas = Math.max(1, Math.ceil(total / KITS_POR_PAGINA));
    if (kitsPaginaActual > totalPaginas) kitsPaginaActual = 1;

    const inicio = (kitsPaginaActual - 1) * KITS_POR_PAGINA;
    const slice = activos.slice(inicio, inicio + KITS_POR_PAGINA);

    grid.innerHTML = slice.map((k, idx) => {
      const imgUrl = normalizarImagen(k.imagen || k.image);
      const precio = Number(k.precio || 60000);
      const nom = k.nombre || k.name;
      const texto = k.descripcion || "Kit especial de fragancias de alta densidad en estuche de regalo.";
      const loadingAttr = idx < 3 ? 'loading="eager" fetchpriority="high"' : 'loading="lazy" decoding="async"';

      return `
        <article class="kit-card rv in" data-kit-id="${k.id}">
          <span class="tag-kit up">Set Exclusivo</span>
          <div class="kit-stage" data-open-kit="${k.id}">
            <img src="${imgUrl}" alt="Kit ${esc(nom)}" class="kit-img" width="280" height="280" ${loadingAttr} onerror="this.src='assets/img/Logo2026.png';">
          </div>
          <div class="kit-info">
            <h3 class="kit-title" data-open-kit="${k.id}">${esc(nom)}</h3>
            <p class="kit-desc">${esc(texto)}</p>
            <div class="kit-footer">
              <span class="kit-price">${fmt(precio)}</span>
              ${k.agotado
                ? `<button class="btn btn--line up" disabled aria-disabled="true">Agotado</button>`
                : `<button class="btn btn--line up" data-addkit="${k.id}">Añadir</button>`}
            </div>
          </div>
        </article>
      `;
    }).join("");

    renderKitsPaginacion(total);
  }

  function renderKitsPaginacion(totalItems) {
    const cont = $("#kitsPaginacion");
    if (!cont) return;
    const totalPaginas = Math.max(1, Math.ceil(totalItems / KITS_POR_PAGINA));
    if (totalPaginas <= 1) {
      cont.innerHTML = "";
      return;
    }

    let html = "";
    html += `<button class="pag-btn" data-kit-page="${kitsPaginaActual - 1}" ${kitsPaginaActual === 1 ? 'disabled' : ''} aria-label="Página anterior">←</button>`;
    for (let p = 1; p <= totalPaginas; p++) {
      html += `<button class="pag-btn ${p === kitsPaginaActual ? 'pag-active' : ''}" data-kit-page="${p}" aria-label="Página ${p}">${p}</button>`;
    }
    html += `<button class="pag-btn" data-kit-page="${kitsPaginaActual + 1}" ${kitsPaginaActual === totalPaginas ? 'disabled' : ''} aria-label="Página siguiente">→</button>`;
    cont.innerHTML = html;
  }

  window.cambiarPaginaKits = function(p) {
    const activos = KITS.filter(k => k.activo !== 0);
    const totalPaginas = Math.max(1, Math.ceil(activos.length / KITS_POR_PAGINA));
    if (p < 1 || p > totalPaginas) return;
    kitsPaginaActual = p;
    renderKits();

    const sec = $("#kits");
    if (sec) {
      const top = sec.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  function openKitDet(kitId) {
    const kit = KITS.find(k => k.id === Number(kitId) || `kit_${k.id}` === String(kitId));
    if (!kit) return;
    const sheet = $("#sheet");
    if (!sheet) return;
    const nom = kit.nombre || kit.n;
    const imgUrl = normalizarImagen(kit.imagen || kit.img);
    const precio = Number(kit.precio || kit.p || 60000);
    const texto = kit.descripcion || "Kit exclusivo con selecciones premium de Alta Densidad.";
    const beneficios = kit.beneficios || [];

    sheet.innerHTML = `
      <button class="x up" data-close aria-label="Cerrar detalle">✕ Cerrar</button>
      <div class="stage" style="padding:var(--sp-4); display:flex; align-items:center; justify-content:center;">
        <img src="${imgUrl}" alt="${esc(nom)}" style="max-height:360px; max-width:90%; object-fit:contain;" onerror="this.src='assets/img/Logo2026.png';">
      </div>
      <div class="d-info">
        <span class="up eyebrow">Set Exclusivo · Estuche de Lujo</span>
        <h2>${esc(nom)}</h2>
        <p class="mute" style="white-space:pre-line; line-height:1.6; margin-top:var(--sp-2);">${esc(texto)}</p>
        ${beneficios.length ? `
          <div class="kit-modal-beneficios" style="display:flex; flex-wrap:wrap; gap:var(--sp-1); margin:var(--sp-2) 0;">
            ${beneficios.map(b => `<span class="chip up" style="font-size:11px;">✓ ${esc(b)}</span>`).join('')}
          </div>
        ` : ''}
        <div class="specs up" style="margin-top:var(--sp-3);">
          <div><b>Extrait</b>de Parfum</div>
          <div><b>12h+</b>Fijación</div>
          <div><b>+</b>Feromonas</div>
        </div>
        <div class="buy" style="margin-top:var(--sp-4);">
          <b style="font:300 28px var(--f-display)">${fmt(precio)}</b>
          ${kit.agotado
            ? `<button class="btn up" disabled aria-disabled="true">Agotado</button>`
            : `<button class="btn up" data-addkit="${kit.id}">Añadir kit a la bolsa</button>`}
        </div>
      </div>
    `;
    abrirModal("#modal");
  }

  function addKitToCart(kitId, q) {
    const kit = KITS.find(k => k.id === Number(kitId));
    if (!kit || kit.agotado) return;
    const cid = `kit_${kit.id}`;
    const item = cart.find(x => x.id === cid);
    if (item) {
      item.q += (q || 1);
    } else {
      cart.push({ id: cid, isKit: true, kitId: kit.id, q: (q || 1), precio: Number(kit.precio), n: kit.nombre, ml: "Kit" });
    }
    save();
    drawCart();
  }

  // ============================================================
  // DETALLE DE PRODUCTO (presentación y envase reales)
  // ============================================================
  function renderDetail() {
    const sheet = $("#sheet");
    const p = buscarProducto(D.id);
    if (!sheet || !p) return;
    const notas = p.no || ["Notas cítricas", "Corazón aromático", "Ámbar y feromonas"];
    const msgWa = encodeURIComponent(`¡Hola! Quiero más información sobre ${p.n}${D.ml ? " (" + etiquetaTalla(D.ml) + ")" : ""}. ✨`);

    sheet.innerHTML = `
      <button class="x up" data-close aria-label="Cerrar detalle">✕ Cerrar</button>
      <div class="stage">${bt(p.h || 32, 2, p.img, p.n, true)}</div>
      <div class="d-info">
        <span class="up eyebrow">${esc(p.b)} · ${esc(etiquetaColeccion(p.c))}</span>
        <h2>${esc(p.n)}</h2>
        <small class="up mute">${esc(p.f)} · ${esc(p.o)} · ${esc(p.g)}</small>
        <p class="mute">${esc(desc(p))}</p>
        <dl class="pyr">
          <div><dt class="up">Salida</dt><dd>${esc(notas[0] || 'Notas frescas')}</dd></div>
          <div><dt class="up">Corazón</dt><dd>${esc(notas[1] || 'Esencia de autor')}</dd></div>
          <div><dt class="up">Fondo</dt><dd>${esc(notas[2] || 'Ámbar y feromonas')}</dd></div>
        </dl>
        <div class="specs up">
          <div><b>Extrait</b>de Parfum</div>
          <div><b>12h+</b>Fijación</div>
          <div><b>+</b>Feromonas</div>
        </div>
        ${p.sz.length ? `
          <div class="opt">
            <span class="up opt-l">Presentación</span>
            <div class="pick up">
              ${p.sz.map(s => `<button class="chip ${s === D.ml ? 'on' : ''}" data-size="${esc(s)}">${esc(etiquetaTalla(s))}</button>`).join("")}
            </div>
          </div>` : ""}
        ${p.env.length ? `
          <div class="opt">
            <span class="up opt-l">Envase</span>
            <div class="pick up">
              ${p.env.map(e => `<button class="chip ${e === D.env ? 'on' : ''}" data-env="${esc(e)}">${esc(e)}</button>`).join("")}
            </div>
          </div>` : ""}
        <div class="buy">
          <b style="font:300 28px var(--f-display)">${fmt(pr(p) * D.q)}</b>
          <div class="qty">
            <button data-dq="-1" aria-label="Disminuir">−</button>
            <span>${D.q}</span>
            <button data-dq="1" aria-label="Aumentar">+</button>
          </div>
          ${p.ag
            ? `<button class="btn up" disabled aria-disabled="true">Agotado</button>`
            : `<button class="btn up" data-adddet>Añadir a la bolsa</button>`}
        </div>
        <a class="link up d-wa" href="https://wa.me/${WA}?text=${msgWa}" target="_blank" rel="noopener">Consultar con un asesor por WhatsApp</a>
      </div>
    `;
  }

  function openDet(id) {
    const p = buscarProducto(id);
    if (!p) return;
    D = { id: p.id, ml: p.sz[0] || "", env: p.env[0] || "", q: 1 };
    renderDetail();
    abrirModal("#modal");
  }

  // ============================================================
  // ATELIER DE FILTROS
  // ============================================================
  function pillsHtml(tipo, valores, etiqueta) {
    return valores.map(v => `
      <button class="chip up ${filters[tipo] === v ? 'on' : ''}" data-modal-filter="${tipo}" data-val="${esc(v)}">${esc(etiqueta ? etiqueta(v) : v)}</button>
    `).join("");
  }

  function populateFilterModal() {
    const grupos = {
      "#fpCategories": ["category", ["Todos", ...new Set(P.map(x => x.c).filter(Boolean))], v => v === "Todos" ? v : etiquetaColeccion(v)],
      "#fpFamilies": ["family", ["Todos", ...new Set(P.map(x => x.f).filter(Boolean))]],
      "#fpOccasions": ["occasion", ["Todos", "Noche", "Oficina", "Verano"]],
      "#fpGenders": ["gender", ["Todos", "Unisex", "Masculino", "Femenino"]],
      "#fpBrands": ["brand", ["Todos", ...[...new Set(P.map(x => x.b))].sort((a, b) =>
        (a === "Otras marcas") - (b === "Otras marcas") || a.localeCompare(b))]]
    };
    Object.keys(grupos).forEach(function(sel) {
      const el = $(sel);
      if (el) el.innerHTML = pillsHtml(grupos[sel][0], grupos[sel][1], grupos[sel][2]);
    });
    updateFilterModalMatchingCount();
  }

  function updateFilterModalMatchingCount() {
    const countEl = $("#filterMatchingCount");
    if (countEl) countEl.textContent = filtrarProductos().length;
  }

  function openFilterModal() {
    populateFilterModal();
    abrirModal("#filterModal");
  }

  function closeFilterModal() {
    const modal = $("#filterModal");
    const scrim = $("#scrim");
    if (modal) modal.classList.remove("on");
    if (scrim) scrim.classList.remove("on");
    document.body.style.overflow = "";
    document.body.classList.remove("ad-layer-open");
    // Las selecciones del atelier se aplican al instante; mantener la grilla sincronizada
    aplicarFiltros();
  }

  function resetAllFilters() {
    filters = Object.assign({}, FILTROS_BASE);
    const searchInput = $("#liveSearch");
    const clearBtn = $("#clearSearch");
    if (searchInput) searchInput.value = "";
    if (clearBtn) clearBtn.style.display = "none";
    aplicarFiltros();
  }

  // ============================================================
  // BOLSA (CARRITO)
  // ============================================================
  function addToCart(id, ml, env, q, silencioso) {
    const prod = buscarProducto(id);
    if (prod && prod.ag) return;
    const item = cart.find(x => x.id === id && (x.ml || "") === (ml || "") && (x.env || "") === (env || ""));
    if (item) {
      item.q += q;
    } else {
      cart.push({ id, ml: ml || "", env: env || "", q });
    }
    if (silencioso) return;
    save();
    drawCart();
  }

  // Resuelve nombre, imagen, precio y detalle de una línea de la bolsa
  function resolverLinea(l) {
    if (l.isKit || String(l.id).startsWith("kit_")) {
      const kitId = l.kitId || Number(String(l.id).replace("kit_", ""));
      const kit = KITS.find(k => k.id === kitId);
      return {
        apiId: "kit_" + kitId,
        nom: kit ? kit.nombre : (l.n || "Kit Especial"),
        img: kit ? normalizarImagen(kit.imagen) : "assets/img/Logo2026.png",
        u: kit ? Number(kit.precio) : (l.precio || 60000),
        sub: "Kit Exclusivo"
      };
    }
    const p = buscarProducto(l.id);
    return {
      apiId: String(l.id),
      nom: p ? p.n : "Fragancia",
      img: p ? p.img : "assets/img/Logo2026.png",
      u: p ? pr(p) : 75000,
      sub: [etiquetaTalla(l.ml), l.env].filter(Boolean).join(" · ") || "Fragancia"
    };
  }

  function subtotalBolsa() {
    return cart.reduce((s, l) => s + resolverLinea(l).u * l.q, 0);
  }

  function drawCart() {
    const itemsEl = $("#items");
    const totalEl = $("#total");
    const cntEl = $("#cnt");
    if (!itemsEl) return;

    let t = 0;
    let c = 0;

    if (cart.length) {
      itemsEl.innerHTML = cart.map((l, i) => {
        const r = resolverLinea(l);
        t += r.u * l.q;
        c += l.q;
        return `
          <div class="it">
            <img src="${r.img}" alt="${esc(r.nom)}" class="mini-cart-img" width="48" height="48" onerror="this.src='assets/img/Logo2026.png';">
            <div>
              <b class="up">${esc(r.nom)}</b>
              <small>${esc(r.sub)} · ${fmt(r.u)}</small>
              <div class="it-actions">
                <div class="qty">
                  <button data-cq="-1" data-i="${i}" aria-label="Disminuir">−</button>
                  <span>${l.q}</span>
                  <button data-cq="1" data-i="${i}" aria-label="Aumentar">+</button>
                </div>
                <button class="link up it-rm" data-rm="${i}">Quitar</button>
              </div>
            </div>
            <div>${fmt(r.u * l.q)}</div>
          </div>
        `;
      }).join("");
    } else {
      itemsEl.innerHTML = `
        <div class="empty">
          <p>Tu bolsa está vacía.</p>
          <p style="margin-top:var(--sp-3)"><a class="link up" href="index.html#coleccion" data-close>Ver colección</a></p>
        </div>
      `;
    }

    if (totalEl) totalEl.textContent = fmt(t);
    if (cntEl) cntEl.textContent = c;

    const acciones = $("#bagActions");
    if (acciones) acciones.style.display = cart.length ? "" : "none";

    const waBtn = $("#wa");
    if (waBtn) {
      const msg = "¡Hola! Quiero hacer un pedido en Fragancias de Alta Densidad:\n\n" +
        cart.map(l => {
          const r = resolverLinea(l);
          return `• ${l.q} x ${r.nom} (${r.sub}) = ${fmt(r.u * l.q)}`;
        }).join("\n") +
        `\n\nTotal: ${fmt(t)}\n¿Me confirman disponibilidad y despacho? ✨`;
      waBtn.href = cart.length ? `https://wa.me/${WA}?text=${encodeURIComponent(msg)}` : "#";
    }

    if (!cart.length) mostrarPaso("bag");
    actualizarResumenEnvio();
  }

  // ============================================================
  // CHECKOUT: DATOS DE ENVÍO + PAGO SEGURO (MERCADO PAGO)
  // ============================================================
  function mostrarPaso(paso) {
    const drawer = $("#drawer");
    if (!drawer) return;
    drawer.dataset.step = paso;
    const titulo = $("#drawerTitle");
    if (titulo) titulo.textContent = paso === "ship" ? "Datos de envío" : "Tu bolsa";
    if (paso === "ship") {
      actualizarResumenEnvio();
      const primero = $("#envNombre");
      if (primero) setTimeout(() => primero.focus(), 300);
    }
  }

  function actualizarResumenEnvio() {
    const zonaEl = $("#envZona");
    if (!zonaEl) return;
    const zona = zonaEl.value;
    const costo = ENVIO_TARIFAS[zona] || 0;
    const subtotal = subtotalBolsa();

    const gMetro = $("#groupMetropolitana");
    const gNac = $("#groupNacional");
    if (gMetro) gMetro.hidden = zona !== "metropolitana";
    if (gNac) gNac.hidden = zona !== "nacional";
    const inMetro = $("#envCiudadMetro");
    const inNac = $("#envCiudadNacional");
    if (inMetro) inMetro.required = zona === "metropolitana";
    if (inNac) inNac.required = zona === "nacional";

    const set = function(sel, txt) { const el = $(sel); if (el) el.textContent = txt; };
    set("#shipSubtotal", fmt(subtotal));
    set("#shipCosto", zona ? fmt(costo) : "Selecciona la zona");
    set("#shipTotal", fmt(subtotal + costo));
  }

  function mostrarErrorEnvio(msg) {
    const el = $("#envioError");
    if (!el) return;
    el.textContent = msg || "";
    el.hidden = !msg;
  }

  async function procesarPago(e) {
    e.preventDefault();
    if (!cart.length) return;
    mostrarErrorEnvio("");

    const val = function(id) { const el = document.getElementById(id); return el ? el.value.trim() : ""; };
    const zona = val("envZona");
    const costoEnvio = ENVIO_TARIFAS[zona] || 0;
    const ciudad = zona === "medellin" ? "Medellín" : (zona === "metropolitana" ? val("envCiudadMetro") : val("envCiudadNacional"));

    const shipping = {
      nombre: val("envNombre"),
      documento: val("envDocumento"),
      celular: val("envCelular"),
      zona: ENVIO_ZONAS[zona] || zona,
      ciudad: ciudad,
      direccion: val("envDireccion"),
      barrio: val("envBarrio"),
      piso: val("envPiso"),
      referencia: val("envReferencia")
    };

    const items = cart.map(function(l) {
      const r = resolverLinea(l);
      return { id: r.apiId, name: r.nom, description: r.sub, unit_price: r.u, quantity: l.q };
    });
    if (costoEnvio > 0) {
      items.push({ id: "envio-logistica", name: "Servicio de Envío (" + (ENVIO_ZONAS[zona] || zona) + ")", unit_price: costoEnvio, quantity: 1 });
    }

    const btn = $("#btnPagar");
    const textoOriginal = btn ? btn.innerHTML : "";
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Preparando tu pago seguro…";
    }

    let error = "No se pudo iniciar el pago seguro. Intenta de nuevo o finaliza por WhatsApp.";
    for (const base of apiBases()) {
      try {
        const resp = await fetch(`${base}/mercadopago/create_preference`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items, shipping })
        });
        const data = await resp.json();
        if (data.success && data.preference && data.preference.init_point) {
          window.location.href = data.preference.init_point;
          return;
        }
        if (data.message) error = data.message;
        break;
      } catch(err) {
        error = "Error de conexión al procesar el pedido. Verifica tu internet o finaliza por WhatsApp.";
      }
    }

    mostrarErrorEnvio(error);
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = textoOriginal;
    }
  }

  // ============================================================
  // CAPAS COMPARTIDAS: bolsa + checkout + detalle (todas las páginas)
  // ============================================================
  const CAPAS_HTML = `

    <div class="scrim" id="scrim" data-close></div>
    <aside class="drawer" id="drawer" data-step="bag" aria-label="Bolsa de compras">
        <div class="drawer-h up">
            <span id="drawerTitle">Tu bolsa</span>
            <button class="up" data-close aria-label="Cerrar bolsa">✕ Cerrar</button>
        </div>

        <!-- Paso 1 · Bolsa -->
        <div class="bag-view">
            <div id="items"></div>
            <div class="tot">
                <span class="up" style="align-self:center">Subtotal</span>
                <b id="total">$0</b>
            </div>
            <div id="bagActions" class="bag-actions">
                <button class="btn up btn--full btn-pay" data-checkout>
                    <span>Hacer pedido · Pago seguro</span>
                    <small>PSE · Nequi · Tarjetas</small>
                </button>
                <a class="btn btn--line up btn--full" id="wa" href="#" target="_blank" rel="noopener">Finalizar por WhatsApp</a>
                <div class="trust up mute">
                    <span>Compra protegida</span>
                    <span>Envíos a toda Colombia</span>
                    <span>Garantía de calidad</span>
                </div>
                <button class="link up bag-empty" data-empty-bag>Vaciar bolsa</button>
            </div>
        </div>

        <!-- Paso 2 · Datos de envío y pago -->
        <form class="ship-view" id="envioForm">
            <button type="button" class="link up ship-back" data-back>← Volver a la bolsa</button>
            <p class="mute ship-intro">Ingresa los datos para la transportadora. Luego te llevamos a Mercado Pago para pagar de forma segura.</p>
            <div class="form-err" id="envioError" role="alert" hidden></div>
            <div class="field-grid">
                <label class="field full"><span class="up">Nombre completo *</span>
                    <input type="text" id="envNombre" required autocomplete="name" placeholder="Ej: Juan Pérez"></label>
                <label class="field"><span class="up">Documento *</span>
                    <input type="text" id="envDocumento" required inputmode="numeric" placeholder="Cédula / NIT"></label>
                <label class="field"><span class="up">Celular *</span>
                    <input type="tel" id="envCelular" required autocomplete="tel" placeholder="300 123 4567"></label>
                <label class="field full"><span class="up">Zona de envío *</span>
                    <select id="envZona" required>
                        <option value="" disabled selected>Selecciona la zona</option>
                        <option value="medellin">Medellín ($15.000)</option>
                        <option value="metropolitana">Área Metropolitana ($20.000)</option>
                        <option value="nacional">Resto de Colombia ($22.000)</option>
                    </select></label>
                <label class="field full" id="groupMetropolitana" hidden><span class="up">Municipio *</span>
                    <select id="envCiudadMetro">
                        <option value="" disabled selected>Selecciona el municipio</option>
                        <option>Bello</option>
                        <option>Envigado</option>
                        <option>Itagüí</option>
                        <option>Sabaneta</option>
                        <option>La Estrella</option>
                        <option>Copacabana</option>
                        <option>San Antonio de Prado</option>
                        <option>Caldas</option>
                        <option>Girardota</option>
                        <option>Barbosa</option>
                    </select></label>
                <label class="field full" id="groupNacional" hidden><span class="up">Ciudad de destino *</span>
                    <input type="text" id="envCiudadNacional" placeholder="Ej: Bogotá, Cali, Cartagena…"></label>
                <label class="field"><span class="up">Barrio *</span>
                    <input type="text" id="envBarrio" required placeholder="Nombre del barrio"></label>
                <label class="field"><span class="up">Dirección *</span>
                    <input type="text" id="envDireccion" required autocomplete="street-address" placeholder="Calle 123 # 45-67"></label>
                <label class="field"><span class="up">Apto / Piso</span>
                    <input type="text" id="envPiso" placeholder="Ej: Apto 502"></label>
                <label class="field"><span class="up">Referencia</span>
                    <input type="text" id="envReferencia" placeholder="Ej: Frente al parque"></label>
            </div>
            <dl class="ship-sum">
                <div><dt class="up">Subtotal</dt><dd id="shipSubtotal">$0</dd></div>
                <div><dt class="up">Envío</dt><dd id="shipCosto">Selecciona la zona</dd></div>
                <div class="ship-total"><dt class="up">Total</dt><dd id="shipTotal">$0</dd></div>
            </dl>
            <button type="submit" class="btn up btn--full btn-pay" id="btnPagar">
                <span>Confirmar y pagar</span>
                <small>Compra 100% protegida · Mercado Pago</small>
            </button>
        </form>
    </aside>

    <div class="modal" id="modal" role="dialog" aria-modal="true" aria-label="Detalle del producto">
        <div class="sheet" id="sheet"></div>
    </div>
`;

  function asegurarCapas() {
    if ($("#drawer")) return;
    document.body.insertAdjacentHTML("beforeend", CAPAS_HTML);
  }

  // ============================================================
  // APERTURA / CIERRE DE CAPAS
  // ============================================================
  function abrirModal(sel) {
    const modal = $(sel);
    const scrim = $("#scrim");
    if (modal) modal.classList.add("on");
    if (scrim) scrim.classList.add("on");
    document.body.style.overflow = "hidden";
    document.body.classList.add("ad-layer-open");
  }

  function closeAll() {
    const filtrosAbiertos = $("#filterModal") && $("#filterModal").classList.contains("on");
    ["#drawer", "#modal", "#filterModal", "#scrim"].forEach(function(sel) {
      const el = $(sel);
      if (el) el.classList.remove("on");
    });
    document.body.style.overflow = "";
    document.body.classList.remove("ad-layer-open");
    if (filtrosAbiertos) aplicarFiltros();
  }

  function openCart() {
    const modal = $("#modal");
    const filterModal = $("#filterModal");
    if (modal) modal.classList.remove("on");
    if (filterModal) filterModal.classList.remove("on");
    mostrarPaso("bag");
    abrirModal("#drawer");
  }

  // ============================================================
  // CARGA DESDE EL BACKEND (con datos duros como respaldo)
  // ============================================================
  async function fetchConFallback(rutaApi) {
    for (const base of apiBases()) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3500);
        const resp = await fetch(`${base}/${rutaApi}`, { signal: controller.signal });
        clearTimeout(timeout);
        if (resp.ok) {
          const json = await resp.json();
          if (json.success && json.data) return json.data;
          if (Array.isArray(json)) return json;
        }
      } catch(e) {}
    }
    return null;
  }

  function cargarProductos(lista) {
    const nuevos = lista.filter(x => x.activo !== 0).map(adaptarProducto);
    if (!nuevos.length) return;
    P = nuevos;
    renderChips();
    renderGrid();
    drawCart();
    inyectarSchemaProductos();
  }

  async function cargarCatalogoBackend() {
    try {
      const data = await fetchConFallback("productos");
      if (data && data.length) cargarProductos(data);
    } catch(e) {}
  }

  async function cargarTop10Backend() {
    try {
      const data = await fetchConFallback("top10");
      if (data && data.length) {
        TOP10 = data.map((t, idx) => {
          const curado = DATOS_DUROS_TOP10.find(d => d.producto_id === (t.producto_id || t.id)) || {};
          return {
            posicion: t.posicion || idx + 1,
            producto_id: t.producto_id || t.id,
            id: t.producto_id || t.id,
            nombre: t.nombre || t.name,
            imagen: normalizarImagen(t.imagen || t.image),
            categoria: t.categoria || t.category || "Perfumería",
            genero: t.genero || t.gender || "Unisex",
            f: curado.f || t.categoria || "Perfumería de Autor",
            o: curado.o,
            no: curado.no,
            descripcion: t.descripcion || t.description || "",
            precio: Number(t.precio || t.price || 75000),
            rating: t.rating || 5,
            agotado: t.agotado ? 1 : 0
          };
        });
        renderRank();
        inyectarSchemaPagina();
      }
    } catch(e) {}
  }

  async function cargarEnvasesBackend() {
    try {
      const data = await fetchConFallback("envases");
      if (data && data.length) {
        // La base tiene envases repetidos (semilla ejecutada varias veces): uno por nombre
        const vistos = new Set();
        const unicos = data.filter(function(item) {
          const clave = String(item.name || item.nombre || "").trim().toUpperCase();
          if (!clave || vistos.has(clave)) return false;
          vistos.add(clave);
          return true;
        });
        ENVASES = unicos.map((item, idx) => {
          const coincidencia = DATOS_DUROS_ENVASES.find(e => e.name.toLowerCase() === (item.name || "").toLowerCase());
          const tallasReales = (Array.isArray(item.sizes) && item.sizes.length)
            ? item.sizes
            : (coincidencia ? coincidencia.sizes : ["30ml", "60ml"]);
          return {
            id: item.id || idx + 1,
            name: item.name || item.nombre,
            image: normalizarImagen(item.image || item.imagen),
            material: item.material || "Vidrio",
            sizes: tallasReales,
            description: item.description || item.descripcion || (coincidencia ? coincidencia.description : "Envase de autor.")
          };
        });
        renderSizes();
        inyectarSchemaPagina();
      }
    } catch(e) {}
  }

  async function cargarKitsBackend() {
    try {
      const data = await fetchConFallback("kits");
      if (data && data.length) {
        KITS = data.map((k, idx) => ({
          id: k.id || idx + 1,
          nombre: k.nombre || k.name,
          imagen: normalizarImagen(k.imagen || k.image),
          descripcion: k.descripcion || k.description || "",
          precio: Number(k.precio || k.price || 60000),
          activo: k.activo !== undefined ? k.activo : 1,
          agotado: k.agotado ? 1 : 0,
          beneficios: k.beneficios || []
        }));
        renderKits();
        drawCart();
      }
    } catch(e) {}
  }

  // Micro-interacción: imagen del Hero con inclinación 3D
  function initHeroBottleInteractivity() {
    const stage = document.querySelector(".hero .stage");
    const target = document.querySelector(".hero .hero-image-wrap") || document.querySelector(".hero .stage .bottle");
    if (!stage || !target) return;

    stage.addEventListener("mousemove", function(e) {
      const rect = stage.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      target.style.transform = `perspective(800px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateY(-4px)`;
    });

    stage.addEventListener("mouseleave", function() {
      target.style.transform = "";
    });

    const bottleCss = document.querySelector(".hero .stage .bottle");
    if (bottleCss) {
      stage.addEventListener("click", function() {
        let currentHue = parseInt(bottleCss.style.getPropertyValue("--h") || "32", 10);
        bottleCss.style.setProperty("--h", (currentHue + 45) % 360);
      });
    }
  }

  // ============================================================
  // EVENTOS DELEGADOS
  // ============================================================
  document.addEventListener("click", function(e) {
    const t = e.target;
    const g = function(a) { return t.closest("[" + a + "]"); };
    let x;

    if (t.id === "modal" || t.id === "filterModal" || t.id === "scrim") {
      closeAll();
      return;
    }

    if (x = g("data-f")) {
      filters.occasion = x.dataset.f;
      aplicarFiltros();
      return;
    }

    if (t.closest("#btnFilterModal")) {
      openFilterModal();
      return;
    }
    if (g("data-close-filters") || t.closest("#btnApplyFilters")) {
      closeFilterModal();
      return;
    }

    if (x = g("data-modal-filter")) {
      filters[x.dataset.modalFilter] = x.dataset.val;
      populateFilterModal();
      return;
    }

    if (t.id === "btnResetFilters" || t.id === "btnResetInline" || t.id === "btnResetEmpty") {
      resetAllFilters();
      if (t.id === "btnResetFilters") populateFilterModal();
      return;
    }

    if (x = g("data-pg")) {
      paginaActual = Number(x.dataset.pg);
      renderGrid(true);
      return;
    }

    if (x = g("data-add")) {
      const p = buscarProducto(x.dataset.add);
      if (p) addToCart(p.id, p.sz[0] || "", p.env[0] || "", 1);
      openCart();
    } else if (g("data-adddet")) {
      addToCart(D.id, D.ml, D.env, D.q);
      openCart();
    } else if (x = g("data-size")) {
      D.ml = x.dataset.size;
      renderDetail();
    } else if (x = g("data-env")) {
      D.env = x.dataset.env;
      renderDetail();
    } else if (x = g("data-dq")) {
      D.q = Math.max(1, D.q + Number(x.dataset.dq));
      renderDetail();
    } else if (x = g("data-cq")) {
      const idx = Number(x.dataset.i);
      if (cart[idx]) {
        cart[idx].q += Number(x.dataset.cq);
        if (cart[idx].q < 1) cart.splice(idx, 1);
        save();
        drawCart();
      }
    } else if (x = g("data-rm")) {
      cart.splice(Number(x.dataset.rm), 1);
      save();
      drawCart();
    } else if (g("data-empty-bag")) {
      cart = [];
      save();
      drawCart();
    } else if (g("data-checkout")) {
      if (cart.length) mostrarPaso("ship");
    } else if (g("data-back")) {
      mostrarPaso("bag");
    } else if (x = g("data-open")) {
      openDet(x.dataset.open);
    } else if (x = g("data-open-kit")) {
      openKitDet(x.dataset.openKit);
    } else if (x = g("data-addkit")) {
      addKitToCart(Number(x.dataset.addkit), 1);
      openCart();
    } else if (x = g("data-kit-page")) {
      window.cambiarPaginaKits(Number(x.dataset.kitPage));
    } else if (g("data-cart")) {
      e.preventDefault();
      openCart();
    } else if (g("data-logout")) {
      e.preventDefault();
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
      } catch(err) {}
      window.location.reload();
    } else if (g("data-close")) {
      closeAll();
    } else if (g("data-aura")) {
      closeAll();
      const launcher = $("#adIaChatLauncher");
      if (launcher) launcher.click();
    }
  });

  function initLiveSearch() {
    const input = $("#liveSearch");
    const clearBtn = $("#clearSearch");
    if (!input) return;

    let timeout;
    input.addEventListener("input", function() {
      clearTimeout(timeout);
      const val = input.value.trim();
      if (clearBtn) clearBtn.style.display = val ? "block" : "none";
      timeout = setTimeout(function() {
        filters.search = val;
        paginaActual = 1;
        renderGrid();
      }, 150);
    });

    if (clearBtn) {
      clearBtn.addEventListener("click", function() {
        input.value = "";
        clearBtn.style.display = "none";
        filters.search = "";
        paginaActual = 1;
        renderGrid();
        input.focus();
      });
    }
  }

  function initSort() {
    const sel = $("#sortSelect");
    if (!sel) return;
    sel.addEventListener("change", function() {
      orden = sel.value;
      paginaActual = 1;
      renderGrid();
    });
  }

  function initCheckout() {
    const form = $("#envioForm");
    const zona = $("#envZona");
    if (zona) zona.addEventListener("change", actualizarResumenEnvio);
    if (form) form.addEventListener("submit", procesarPago);
  }

  // Sesión de cliente / staff (antes en nav-sesion.js)
  // Cuenta: sin sesión el ícono lleva a login; con sesión abre un menú (nombre, panel, salir)
  function initSesion() {
    const el = $("#navSesion");
    const menu = $("#acctMenu");
    if (!el || !menu) return;
    let token = null;
    let usuario = null;
    try {
      token = localStorage.getItem("token");
      usuario = JSON.parse(localStorage.getItem("usuario") || "null");
    } catch(e) {}
    if (!token || !usuario || !usuario.nombre) return;

    const nombre = String(usuario.nombre).split(" ")[0];
    // El panel solo admite rol admin (admin.js)
    const esStaff = usuario.rol === "admin";
    el.removeAttribute("href");
    el.setAttribute("role", "button");
    el.setAttribute("tabindex", "0");
    el.setAttribute("aria-haspopup", "true");
    el.setAttribute("aria-expanded", "false");
    el.setAttribute("aria-label", "Cuenta de " + nombre);
    el.title = "Mi cuenta";
    el.classList.add("is-auth");
    el.dataset.acct = "";

    menu.innerHTML = `
      <span class="acct-hi">Hola, <b></b></span>
      ${esStaff ? '<a href="admin.html">Panel de administración</a>' : ''}
      <button type="button" data-logout>Cerrar sesión</button>
    `;
    menu.querySelector("b").textContent = nombre;
  }

  function toggleAcct(abrir) {
    const el = $("#navSesion");
    const menu = $("#acctMenu");
    if (!el || !menu || !el.hasAttribute("data-acct")) return;
    const abierto = typeof abrir === "boolean" ? abrir : menu.hidden;
    menu.hidden = !abierto;
    el.setAttribute("aria-expanded", String(abierto));
  }

  document.addEventListener("click", function(e) {
    if (e.target.closest("[data-acct]")) {
      toggleAcct();
    } else if (!e.target.closest("#acctMenu")) {
      toggleAcct(false);
    }
  });

  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") {
      closeAll();
      toggleAcct(false);
    } else if ((e.key === "Enter" || e.key === " ") && e.target.matches && e.target.matches("[data-acct]")) {
      e.preventDefault();
      toggleAcct();
    }
  });

  function initThemeToggle() {
    const btn = $("#toggleTema");
    if (!btn) return;
    const ico = btn.querySelector("i");

    function updateLabel() {
      const isLight = document.documentElement.classList.contains("modo-claro");
      const txt = isLight ? "Cambiar a modo oscuro" : "Cambiar a modo claro";
      btn.setAttribute("aria-label", txt);
      btn.title = txt;
      if (ico) ico.className = isLight ? "fa-solid fa-moon" : "fa-solid fa-sun";
    }

    btn.addEventListener("click", function() {
      const isLight = document.documentElement.classList.toggle("modo-claro");
      document.documentElement.setAttribute("data-theme", isLight ? "light" : "dark");
      try { localStorage.setItem("altadensidad_tema", isLight ? "claro" : "oscuro"); } catch(e) {}
      updateLabel();
    });

    updateLabel();
  }

  function boot() {
    // 1. Render inmediato con datos duros auténticos (0ms LCP, sin parpadeos)
    asegurarCapas();
    P = DATOS_DUROS_PRODUCTOS.map(adaptarProducto);
    migrarCarritoLegacy();
    renderChips();
    renderGrid();
    renderRank();
    renderSizes();
    renderKits();
    drawCart();
    initThemeToggle();
    initHeroBottleInteractivity();
    initLiveSearch();
    initSort();
    initCheckout();
    initSesion();
    initTabs();
    initContadores();
    inyectarSchemaProductos();
    inyectarSchemaPagina();

    // 2. Conectar en segundo plano con APIs para actualización continua
    cargarCatalogoBackend();
    cargarTop10Backend();
    cargarEnvasesBackend();
    cargarKitsBackend();

    $$(".rv").forEach(n => n.classList.add("in"));
  }

  // Compatibilidad universal con scripts legacy
  window.agregarAlCarrito = function(obj) {
    if (!obj) return;
    if (obj.id && String(obj.id).startsWith("kit_")) {
      addKitToCart(Number(String(obj.id).replace("kit_", "")), 1);
    } else {
      const p = buscarProducto(obj.id);
      addToCart(Number(obj.id), p ? (p.sz[0] || "") : "", p ? (p.env[0] || "") : "", 1);
    }
    openCart();
  };
  window.abrirModalKitPublico = function(kit) {
    if (kit && kit.id) openKitDet(kit.id);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
