/**
 * HAUTE PARFUMERIE — Alta Densidad
 * Arquitectura de Autor: Bolsa reactiva, buscador en vivo, atelier de filtros olfativos,
 * ranking Top 10 oficial, catálogo de envases de lujo, integración resiliente con backend Railway.
 */
(function() {
  "use strict";

  const WA = "573046477694";
  const SIZES = [
    { ml: 30, x: 0.6, s: 1.3, n: "Viaje", t: "Atomizador compacto para llevar contigo." },
    { ml: 50, x: 1.0, s: 1.7, n: "Insignia", t: "El formato de la casa, para el uso diario." },
    { ml: 100, x: 1.8, s: 2.1, n: "Colección", t: "Botella grande para quienes no quieren quedarse sin ella." }
  ];

  // ============================================================
  // DATOS DUROS DEL CATÁLOGO REAL DE FRAGANCIAS DE ALTA DENSIDAD
  // ============================================================
  const DATOS_DUROS_PRODUCTOS = [
  {
    "id": 1,
    "n": "212 VIP ROSE CAROLINA HERRERA",
    "f": "Cítrica / Fresca",
    "o": "Noche",
    "g": "Femenino",
    "no": [
      "Champaña rosada",
      "Flor de durazno",
      "Madera reina · Feromonas"
    ],
    "p": 75000,
    "h": 0,
    "desc": "Es una fragancia femenina con un aire fresco y dinámico. Representa el glamour juvenil y la autenticidad intrépida, ideal para quienes viven la vida al máximo y destacan con seguridad",
    "img": "assets/img/212-vip-rose.jpg"
  },
  {
    "id": 2,
    "n": "GOOD GIRL CAROLINA HERRERA",
    "f": "Cítrica / Fresca",
    "o": "Noche",
    "g": "Femenino",
    "no": [
      "Almendra · Café",
      "Jazmín sambac",
      "Cacao · Haba tonka"
    ],
    "p": 75000,
    "h": 37,
    "desc": "La dualidad entre la dulzura y la intensidad. Good Girl combina la frescura del jazmín y la almendra con la profundidad del cacao y el café, creando un aroma seductor y poderoso.",
    "img": "assets/img/GOOD_GIRL.jpg"
  },
  {
    "id": 3,
    "n": "GOOD GIRL BLUSH CAROLINA HERRERA",
    "f": "Cítrica / Fresca",
    "o": "Noche",
    "g": "Femenino",
    "no": [
      "Almendra · Café",
      "Jazmín sambac",
      "Cacao · Haba tonka"
    ],
    "p": 75000,
    "h": 74,
    "desc": "Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.",
    "img": "assets/img/GOOD_GIRL_BLUSH.png"
  },
  {
    "id": 4,
    "n": "VERY GOOD GIRL CAROLINA HERRERA",
    "f": "Cítrica / Fresca",
    "o": "Noche",
    "g": "Femenino",
    "no": [
      "Almendra · Café",
      "Jazmín sambac",
      "Cacao · Haba tonka"
    ],
    "p": 75000,
    "h": 111,
    "desc": "Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.",
    "img": "assets/img/VERY_GOOD_GIRL.jpg"
  },
  {
    "id": 5,
    "n": "212 SEXY CAROLINA HERRERA",
    "f": "Cítrica / Fresca",
    "o": "Noche",
    "g": "Femenino",
    "no": [
      "Frutas frescas y bayas",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 148,
    "desc": "Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.",
    "img": "assets/img/212_SEXY.webp"
  },
  {
    "id": 6,
    "n": "212 VIP BLACK CAROLINA HERRERA",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "g": "Masculino",
    "no": [
      "Notas cítricas vibrantes",
      "Especias orientales",
      "Cuero noble y feromonas"
    ],
    "p": 75000,
    "h": 185,
    "desc": "La esencia de la exclusividad. Un perfume oriental especiado, con una salida de absenta y anís, seguida por un corazón de lavanda y cuero.",
    "img": "assets/img/VIP_212_BLACK.jpg"
  },
  {
    "id": 7,
    "n": "BOND NO. 9 BLEECKER STREET",
    "f": "Cuero",
    "o": "Noche",
    "g": "Masculino",
    "no": [
      "Notas cítricas vibrantes",
      "Especias orientales",
      "Cuero noble y feromonas"
    ],
    "p": 75000,
    "h": 222,
    "desc": "Un perfume intenso y seductor que combina notas de cuero, tabaco y especias.",
    "img": "assets/img/BOND_NO.9_BLEECKER.jpg"
  },
  {
    "id": 8,
    "n": "LIGHT BLUE DOLCE & GABBANA",
    "f": "Cítrica / Fresca",
    "o": "Verano",
    "g": "Femenino",
    "no": [
      "Manzana verde · Limón",
      "Bambú · Jazmín",
      "Cedro · Ámbar"
    ],
    "p": 75000,
    "h": 259,
    "desc": "Inspirado en la frescura y sensualidad del Mediterráneo, este perfume está dirigido a personas que buscan una fragancia vibrante y juvenil.",
    "img": "assets/img/ligth_blue.jpg"
  },
  {
    "id": 9,
    "n": "LIGHT BLUE DOLCE & GABBANA MEN",
    "f": "Cítrica / Fresca",
    "o": "Verano",
    "g": "Masculino",
    "no": [
      "Manzana verde · Limón",
      "Bambú · Jazmín",
      "Cedro · Ámbar"
    ],
    "p": 75000,
    "h": 296,
    "desc": "Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.",
    "img": "assets/img/LIGHT_BLUE_MEN.jpg"
  },
  {
    "id": 10,
    "n": "SANTAL 33",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "g": "Unisex",
    "no": [
      "Cardamomo · Iris",
      "Papiro · Violeta",
      "Sándalo · Cedro · Cuero"
    ],
    "p": 75000,
    "h": 333,
    "desc": "La esencia de la sofisticación moderna. Una fragancia amanerada especiada, con notas de sándalo, cardamomo y cuero.",
    "img": "assets/img/SANTAL_33.jpg"
  },
  {
    "id": 11,
    "n": "TOY 2 BUBBLE GUM MOSCHINO",
    "f": "Cítrica / Fresca",
    "o": "Noche",
    "g": "Femenino",
    "no": [
      "Frutas frescas y bayas",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 10,
    "desc": "Es una fragancia floral frutal con un toque divertido y juvenil. Su apertura está marcada por frutas confitadas, naranja amarga y limón.",
    "img": "assets/img/TOY_2_BUBBLE_GUM.jpg"
  },
  {
    "id": 12,
    "n": "TOY 2 PEARL MOSCHINO",
    "f": "Cítrica / Fresca",
    "o": "Noche",
    "g": "Femenino",
    "no": [
      "Frutas frescas y bayas",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 47,
    "desc": "Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.",
    "img": "assets/img/TOY_PEARL.jpg"
  },
  {
    "id": 13,
    "n": "TOY 2 EDP MOSCHINO",
    "f": "Cítrica / Fresca",
    "o": "Noche",
    "g": "Femenino",
    "no": [
      "Frutas frescas y bayas",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 84,
    "desc": "Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.",
    "img": "assets/img/TOY2EDP.webp"
  },
  {
    "id": 14,
    "n": "OLYMPEA PACO RABANNE",
    "f": "Cítrica / Fresca",
    "o": "Noche",
    "g": "Femenino",
    "no": [
      "Frutas frescas y bayas",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 121,
    "desc": "Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.",
    "img": "assets/img/OLYMPEA.webp"
  },
  {
    "id": 15,
    "n": "INVICTUS PACO RABANNE",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "g": "Masculino",
    "no": [
      "Toronja · Notas marinas",
      "Hoja de laurel · Jazmín",
      "Madera de gaiac · Ámbar gris"
    ],
    "p": 75000,
    "h": 158,
    "desc": "Es una fragancia que evoca la frescura tropical y la dulzura especiada. Desde el primer rocío, despierta los sentidos con una mezcla armoniosa de notas.",
    "img": "assets/img/INVICTUS.webp"
  },
  {
    "id": 16,
    "n": "LEGEND MONTBLANC",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "g": "Masculino",
    "no": [
      "Notas cítricas vibrantes",
      "Especias orientales",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 195,
    "desc": "Es una fragancia que evoca la frescura tropical y la dulzura especiada. Desde el primer rocío, despierta los sentidos con una mezcla armoniosa de notas.",
    "img": "assets/img/LEGEND.jpg"
  },
  {
    "id": 17,
    "n": "AHLI KARPOS",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "g": "Unisex",
    "no": [
      "Notas cítricas vibrantes",
      "Especias orientales",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 232,
    "desc": "Es una fragancia que evoca la frescura tropical y la dulzura especiada. Desde el primer rocío, despierta los sentidos con una mezcla armoniosa de notas.",
    "img": "assets/img/AHLI_KARPOS.jpeg"
  },
  {
    "id": 18,
    "n": "AHLI CORVUS",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "g": "Unisex",
    "no": [
      "Frutas frescas y bayas",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 269,
    "desc": "Es una fragancia que combina notas frutales, florales y amaderadas, creando una experiencia olfativa sofisticada y envolvente.",
    "img": "assets/img/CORVUS.webp"
  },
  {
    "id": 19,
    "n": "AHLI VEGA",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "g": "Unisex",
    "no": [
      "Frutas frescas y bayas",
      "Especias orientales",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 306,
    "desc": "Un perfume sensual y seductor que combina notas de flores, frutas y especias.",
    "img": "assets/img/VEGA.webp"
  },
  {
    "id": 20,
    "n": "COCO MADEMOISELLE CHANEL",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "g": "Femenino",
    "no": [
      "Naranja de Sicilia · Bergamota",
      "Rosa de mayo · Jazmín",
      "Pachulí de Indonesia · Vetiver"
    ],
    "p": 75000,
    "h": 343,
    "desc": "Un clásico moderno que encapsula la esencia de la sofisticación. Coco Mademoiselle es una fragancia oriental floral con una apertura vibrante de naranja y bergamota.",
    "img": "assets/img/COCO.jpg"
  },
  {
    "id": 21,
    "n": "BLEU CHANEL",
    "f": "Cítrica / Fresca",
    "o": "Noche",
    "g": "Masculino",
    "no": [
      "Limón · Menta fresca",
      "Jengibre · Jazmín",
      "Incienso · Cedro · Sándalo"
    ],
    "p": 75000,
    "h": 20,
    "desc": "Es una fragancia amaderada aromática, con una apertura fresca de limón, menta y pimienta rosa.",
    "img": "assets/img/BLEU.jpg"
  },
  {
    "id": 22,
    "n": "OMBRE NOMADE LOUIS VUITTON",
    "f": "Cítrica / Fresca",
    "o": "Noche",
    "g": "Masculino",
    "no": [
      "Frutas frescas y bayas",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 57,
    "desc": "Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.",
    "img": "assets/img/HOMBRENOMADA.webp"
  },
  {
    "id": 23,
    "n": "IL ROSO DE ILMIN",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "g": "Femenino",
    "no": [
      "Frutas frescas y bayas",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 94,
    "desc": "Es una fragancia floral, frutal y oriental, diseñada para quienes buscan una esencia sofisticada y envolvente.",
    "img": "assets/img/IL_ROSO3.jpg"
  },
  {
    "id": 24,
    "n": "IL ORGASME ILMIN",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "g": "Masculino",
    "no": [
      "Frutas frescas y bayas",
      "Especias orientales",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 131,
    "desc": "Sensualidad y magnetismo absoluto. Un perfume oriental especiado, con una apertura de frutas exóticas y especias.",
    "img": "assets/img/IL_ORGASME_ILMIN.webp"
  },
  {
    "id": 25,
    "n": "IL FEMME ILMIN",
    "f": "Cítrica / Fresca",
    "o": "Verano",
    "g": "Femenino",
    "no": [
      "Notas cítricas vibrantes",
      "Corazón floral de autor",
      "Vainilla bourbon y feromonas"
    ],
    "p": 75000,
    "h": 168,
    "desc": "Una fragancia que evoca la frescura del verano con su mezcla de vainilla, rosa y toques polvorientos.",
    "img": "assets/img/FEMME.webp"
  },
  {
    "id": 26,
    "n": "IL KAKUNO ILMIN",
    "f": "Cítrica / Fresca",
    "o": "Verano",
    "g": "Unisex",
    "no": [
      "Notas cítricas vibrantes",
      "Corazón floral de autor",
      "Vainilla bourbon y feromonas"
    ],
    "p": 75000,
    "h": 205,
    "desc": "Una fragancia que evoca la frescura del verano con su mezcla de vainilla, rosa y toques polvorientos.",
    "img": "assets/img/KAKUNO.jpg"
  },
  {
    "id": 27,
    "n": "CLOUD ARIANA GRANDE",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "g": "Femenino",
    "no": [
      "Frutas frescas y bayas",
      "Corazón floral de autor",
      "Oud ahumado y feromonas"
    ],
    "p": 75000,
    "h": 242,
    "desc": "Cloud es una fragancia dulce y etérea, con una apertura de lavanda, pera y bergamota que aporta frescura y suavidad.",
    "img": "assets/img/CLOUD_ARIANA.webp"
  },
  {
    "id": 28,
    "n": "MOD VANILLA ARIANA GRANDE",
    "f": "Dulce / Gourmand",
    "o": "Noche",
    "g": "Femenino",
    "no": [
      "Frutas frescas y bayas",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 279,
    "desc": "Es una fragancia frutal gourmand, con una salida vibrante de frambuesa y pera.",
    "img": "assets/img/MODVANILLA.jpg"
  },
  {
    "id": 29,
    "n": "THANK U, NEXT ARIANA GRANDE",
    "f": "Dulce / Gourmand",
    "o": "Noche",
    "g": "Femenino",
    "no": [
      "Frutas frescas y bayas",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 316,
    "desc": "Es una fragancia frutal gourmand, con una salida vibrante de frambuesa y pera, seguida por un corazón de rosa y coco.",
    "img": "assets/img/THANKU2.jpg"
  },
  {
    "id": 30,
    "n": "BURBERRY HER",
    "f": "Cítrica / Fresca",
    "o": "Noche",
    "g": "Femenino",
    "no": [
      "Frutas frescas y bayas",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 353,
    "desc": "Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.",
    "img": "assets/img/B_HER.jpeg"
  },
  {
    "id": 31,
    "n": "AMOUAGE INTERLUDE",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "g": "Masculino",
    "no": [
      "Frutas frescas y bayas",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 30,
    "desc": "Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.",
    "img": "assets/img/AMOUAGE.webp"
  },
  {
    "id": 32,
    "n": "MEOW KATTY PERY",
    "f": "Cítrica / Fresca",
    "o": "Noche",
    "g": "Femenino",
    "no": [
      "Notas cítricas vibrantes",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 67,
    "desc": "Un estallido de glamour y frescura. Notas de maracuyá, naranja y melocotón que encantan desde el primer instante.",
    "img": "assets/img/MEOW.webp"
  },
  {
    "id": 33,
    "n": "HEIRESS PARIS HILTON",
    "f": "Cítrica / Fresca",
    "o": "Noche",
    "g": "Femenino",
    "no": [
      "Notas cítricas vibrantes",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 104,
    "desc": "Un estallido de glamour y frescura. Notas de maracuyá, naranja y melocotón que encantan desde el primer instante.",
    "img": "assets/img/HEIRESS2.webp"
  },
  {
    "id": 34,
    "n": "360 PERRY ELLIS",
    "f": "Cítrica / Fresca",
    "o": "Noche",
    "g": "Femenino",
    "no": [
      "Notas cítricas vibrantes",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 141,
    "desc": "Un estallido de glamour y frescura. Notas de maracuyá, naranja y melocotón que encantan desde el primer instante.",
    "img": "assets/img/360.webp"
  },
  {
    "id": 35,
    "n": "YUM YUM ARMAF",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "g": "Femenino",
    "no": [
      "Frutas frescas y bayas",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 178,
    "desc": "Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.",
    "img": "assets/img/YUMYUM.webp"
  },
  {
    "id": 36,
    "n": "ISLAND BLISS ARMAF",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "g": "Femenino",
    "no": [
      "Notas cítricas vibrantes",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 215,
    "desc": "Inspirada en la frescura tropical, esta fragancia está diseñada para quienes buscan un aroma vibrante y exótico.",
    "img": "assets/img/ISLANDBLISS2.webp"
  },
  {
    "id": 37,
    "n": "CLUB DE NUIT INTENSE (BESTIA NEGRA) ARMAF",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "g": "Masculino",
    "no": [
      "Limón · Grosella negra",
      "Abedul · Jazmín",
      "Almizcle · Ámbar gris"
    ],
    "p": 75000,
    "h": 252,
    "desc": "Club de Nuit Intense es una fragancia cítrica y amaderada con una salida de limón, piña y grosella negra.",
    "img": "assets/img/NUIT2.jpg"
  },
  {
    "id": 38,
    "n": "CLUB DE NUIT WOMAN ARMAF",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "g": "Femenino",
    "no": [
      "Limón · Grosella negra",
      "Abedul · Jazmín",
      "Almizcle · Ámbar gris"
    ],
    "p": 75000,
    "h": 289,
    "desc": "Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.",
    "img": "assets/img/NUIT_WOMAN.webp"
  },
  {
    "id": 39,
    "n": "9PM AFNAN",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "g": "Masculino",
    "no": [
      "Manzana silvestre · Canela",
      "Flor de azahar",
      "Vainilla · Haba tonka"
    ],
    "p": 75000,
    "h": 326,
    "desc": "Seducción nocturna en su máxima expresión. Un perfume dulce y especiado, con una salida de manzana y canela.",
    "img": "assets/img/9PM2.png"
  },
  {
    "id": 40,
    "n": "ODYSSEY MANDARIN SKY ARMAF",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "g": "Unisex",
    "no": [
      "Notas cítricas vibrantes",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 3,
    "desc": "Sumérgete en la esencia vibrante y seductora de Odyssey Mandarin Sky, una fragancia masculina que equilibra la frescura cítrica con la calidez envolvente.",
    "img": "assets/img/ODYSSEY_MANDARIN.png"
  },
  {
    "id": 41,
    "n": "ODYSSEY CHOCOLATE DUBAI ARMAF",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "g": "Unisex",
    "no": [
      "Frutas frescas y bayas",
      "Corazón floral de autor",
      "Vainilla bourbon y feromonas"
    ],
    "p": 75000,
    "h": 40,
    "desc": "Un perfume dulce y sensual que combina notas de chocolate, vainilla y caramelos.",
    "img": "assets/img/ODYSEYCHOCOLATE.jpg"
  },
  {
    "id": 42,
    "n": "ODYSSEY CANDEE ARMAF",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "g": "Femenino",
    "no": [
      "Frutas frescas y bayas",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 77,
    "desc": "Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.",
    "img": "assets/img/ODYSEYCANDEE2.jpeg"
  },
  {
    "id": 43,
    "n": "ODYSSEY MEGA ARMAF",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "g": "Unisex",
    "no": [
      "Frutas frescas y bayas",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 114,
    "desc": "Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.",
    "img": "assets/img/ODYSEYMEGA.jpeg"
  },
  {
    "id": 44,
    "n": "ODYSSEY SPECTRA ARMAF",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "g": "Unisex",
    "no": [
      "Frutas frescas y bayas",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 151,
    "desc": "Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.",
    "img": "assets/img/ODYSEYSPECTRA.webp"
  },
  {
    "id": 45,
    "n": "BHARARA ROSE",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "g": "Femenino",
    "no": [
      "Notas cítricas vibrantes",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 188,
    "desc": "Fragancia de alta concentración con base de feromonas inspirada en BHARARA ROSE.",
    "img": "assets/img/BHARARAROSE.jpg"
  },
  {
    "id": 46,
    "n": "BHARARA KING",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "g": "Masculino",
    "no": [
      "Naranja · Bergamota",
      "Tutti-frutti",
      "Vainilla blanca · Ámbar"
    ],
    "p": 75000,
    "h": 225,
    "desc": "Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.",
    "img": "assets/img/BHARARAKING.webp"
  },
  {
    "id": 47,
    "n": "BHARARA NICHE",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "g": "Unisex",
    "no": [
      "Notas cítricas vibrantes",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 262,
    "desc": "Fragancia de alta concentración con base de feromonas inspirada en BHARARA NICHE.",
    "img": "assets/img/BHARARANICHE.webp"
  },
  {
    "id": 48,
    "n": "YARA CANDY LATTAFA",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "g": "Femenino",
    "no": [
      "Heliotropo · Orquídea",
      "Frutas tropicales",
      "Vainilla · Sándalo"
    ],
    "p": 75000,
    "h": 299,
    "desc": "Dirigida a quienes aman los perfumes dulces y refrescantes, esta fragancia es perfecta para personas con un espíritu alegre y juvenil.",
    "img": "assets/img/CANDY.jpg"
  },
  {
    "id": 49,
    "n": "YARA LATTAFA",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "g": "Femenino",
    "no": [
      "Heliotropo · Orquídea",
      "Frutas tropicales",
      "Vainilla · Sándalo"
    ],
    "p": 75000,
    "h": 336,
    "desc": "Es una fragancia oriental dulce y sofisticada, diseñada principalmente para mujeres que buscan un aroma envolvente y elegante.",
    "img": "assets/img/YARA_LATTAFA2.jpg"
  },
  {
    "id": 50,
    "n": "ASAD LATTAFA",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "g": "Masculino",
    "no": [
      "Frutas frescas y bayas",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 13,
    "desc": "Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.",
    "img": "assets/img/ASAD_BLACK.jpg"
  },
  {
    "id": 51,
    "n": "MAYAR INTENSE LATTAFA",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "g": "Femenino",
    "no": [
      "Notas cítricas vibrantes",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 50,
    "desc": "Un perfume fresco y cítrico que evoca la esencia de la naturaleza.",
    "img": "assets/img/MAYARINTENSE.jpg"
  },
  {
    "id": 52,
    "n": "MAYAR LATTAFA",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "g": "Femenino",
    "no": [
      "Notas cítricas vibrantes",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 87,
    "desc": "Es una declaración de elegancia y sensualidad, una fragancia que envuelve los sentidos desde el primer instante.",
    "img": "assets/img/MAYAR_LATTAFA.jpg"
  },
  {
    "id": 53,
    "n": "MAYAR CHERRY LATTAFA",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "g": "Femenino",
    "no": [
      "Notas cítricas vibrantes",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 124,
    "desc": "Es una declaración de elegancia y sensualidad, una fragancia que envuelve los sentidos desde el primer instante.",
    "img": "assets/img/MAYAR_LATTAFA_CHERRY.webp"
  },
  {
    "id": 54,
    "n": "BADE´E AL OUD HONOR & GLORY LATTAFA BLANCA",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "g": "Unisex",
    "no": [
      "Azafrán · Nuez moscada",
      "Rosa · Cuero",
      "Oud ahumado · Pachulí"
    ],
    "p": 75000,
    "h": 161,
    "desc": "Poder y presencia en cada gota. Una fragancia amaderada y especiada, con notas de bergamota, pimienta negra y lavanda.",
    "img": "assets/img/BADE_AL_OUD_HONOR.png"
  },
  {
    "id": 55,
    "n": "BADEE AL OUD SUBLIME LATTAFA ROJA",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "g": "Unisex",
    "no": [
      "Azafrán · Nuez moscada",
      "Rosa · Cuero",
      "Oud ahumado · Pachulí"
    ],
    "p": 75000,
    "h": 198,
    "desc": "Un lujo afrutado y envolvente. Una fragancia amaderada aromática, con notas de frutas tropicales, rosa y vainilla.",
    "img": "assets/img/ADEE_AL_OUD_SUBLIME.webp"
  },
  {
    "id": 56,
    "n": "BADE´E AL OUD AMETHYST LATTAFA MORADA",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "g": "Unisex",
    "no": [
      "Azafrán · Nuez moscada",
      "Rosa · Cuero",
      "Oud ahumado · Pachulí"
    ],
    "p": 75000,
    "h": 235,
    "desc": "Misterio y elegancia en cada gota. Un perfume oriental floral, con una apertura de bergamota y pimienta rosa.",
    "img": "assets/img/BADE'E_AL_OUD.png"
  },
  {
    "id": 57,
    "n": "BADE´E AL OUD FOR GLORY LATTAFA NEGRA",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "g": "Unisex",
    "no": [
      "Azafrán · Nuez moscada",
      "Rosa · Cuero",
      "Oud ahumado · Pachulí"
    ],
    "p": 75000,
    "h": 272,
    "desc": "Un perfume misterioso y sensual que combina notas de flores oscuras, cuero y especias.",
    "img": "assets/img/LATTAFANEGRA.png"
  },
  {
    "id": 58,
    "n": "BADE´E AL OUD NOBLE BLUSH LATTAFA",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "g": "Femenino",
    "no": [
      "Azafrán · Nuez moscada",
      "Rosa · Cuero",
      "Oud ahumado · Pachulí"
    ],
    "p": 75000,
    "h": 309,
    "desc": "Dirigida a quienes buscan una fragancia dulce y sofisticada, con un toque gourmand.",
    "img": "assets/img/NOBLEBLUSH.jpeg"
  },
  {
    "id": 59,
    "n": "KHAMRAH LATTAFA",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "g": "Unisex",
    "no": [
      "Canela · Nuez moscada",
      "Dátiles · Praliné",
      "Vainilla bourbon · Haba tonka"
    ],
    "p": 75000,
    "h": 346,
    "desc": "Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.",
    "img": "assets/img/KHAMRAH.jpg"
  },
  {
    "id": 60,
    "n": "AMBER OUD GOLD EDITION AL HARAMAIN",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "g": "Unisex",
    "no": [
      "Bergamota · Notas verdes",
      "Melón · Piña dulce",
      "Ámbar · Vainilla"
    ],
    "p": 75000,
    "h": 23,
    "desc": "Oro líquido en un frasco. Un perfume oriental amaderado, con una salida de bergamota y notas verdes.",
    "img": "assets/img/AMBER_OUD_GOLD.jpeg"
  },
  {
    "id": 61,
    "n": "AMBER ROUGE ORIENTICA",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "g": "Unisex",
    "no": [
      "Notas cítricas vibrantes",
      "Corazón floral de autor",
      "Ámbar cálido y feromonas"
    ],
    "p": 75000,
    "h": 60,
    "desc": "Intensidad y pasión en cada rocío. Inspirado en Baccarat Rouge 540, combina jazmín, azafrán y ámbar gris.",
    "img": "assets/img/AMBER_ROUGE.jpg"
  },
  {
    "id": 62,
    "n": "VELVET GOLF ORIENTICA",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "g": "Unisex",
    "no": [
      "Frutas frescas y bayas",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 97,
    "desc": "Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.",
    "img": "assets/img/VELVET_GOLD.webp"
  },
  {
    "id": 63,
    "n": "AMBER NOIR ORIENTICA",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "g": "Unisex",
    "no": [
      "Frutas frescas y bayas",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 134,
    "desc": "Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.",
    "img": "assets/img/AMBER_NOIR.jpg"
  },
  {
    "id": 64,
    "n": "AZURE ORIENTICA",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "g": "Unisex",
    "no": [
      "Frutas frescas y bayas",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 171,
    "desc": "Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.",
    "img": "assets/img/AMBER_AZURE.jpeg"
  },
  {
    "id": 65,
    "n": "ROYAL BLEU ORIENTICA",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "g": "Unisex",
    "no": [
      "Limón · Menta fresca",
      "Jengibre · Jazmín",
      "Incienso · Cedro · Sándalo"
    ],
    "p": 75000,
    "h": 208,
    "desc": "Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.",
    "img": "assets/img/AMBER_BLEU.webp"
  },
  {
    "id": 66,
    "n": "ROYAL AMBER ORIENTICA",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "g": "Unisex",
    "no": [
      "Frutas frescas y bayas",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 245,
    "desc": "Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.",
    "img": "assets/img/AMBER_ROYAL.webp"
  },
  {
    "id": 67,
    "n": "ERBA PURA XERJOFF",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "g": "Unisex",
    "no": [
      "Frutas frescas y bayas",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 282,
    "desc": "Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.",
    "img": "assets/img/ERBA_PURA.avif"
  },
  {
    "id": 68,
    "n": "NAXOS XERJOFF",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "g": "Unisex",
    "no": [
      "Frutas frescas y bayas",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 319,
    "desc": "Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.",
    "img": "assets/img/NAXOS.jpeg"
  },
  {
    "id": 69,
    "n": "ARABIANS TONKA MONTALE",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "g": "Masculino",
    "no": [
      "Notas cítricas vibrantes",
      "Especias orientales",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 356,
    "desc": "Montale Poder y misterio en una fragancia. Un perfume oriental especiado, con una apertura de azafrán y bergamota.",
    "img": "assets/img/ARABIANS_TONKA.jpg"
  },
  {
    "id": 70,
    "n": "ETERNITY AQUA CALVIN KLEIN",
    "f": "Cítrica / Fresca",
    "o": "Verano",
    "g": "Masculino",
    "no": [
      "Notas cítricas vibrantes",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 33,
    "desc": "Frescura y elegancia atemporal. Una fragancia acuática amaderada, con notas de pepino, cítricos y lavanda.",
    "img": "assets/img/ETERNITY_AQUA.jpg"
  },
  {
    "id": 71,
    "n": "IN 2U HER CALVIN KLEIN",
    "f": "Aromática",
    "o": "Noche",
    "g": "Femenino",
    "no": [
      "Notas cítricas vibrantes",
      "Corazón floral de autor",
      "Ámbar cálido y feromonas"
    ],
    "p": 75000,
    "h": 70,
    "desc": "Un perfume sensual y femenino que combina notas de bergamota, flor de azahar y ámbar.",
    "img": "assets/img/IN2UHER.jpg"
  },
  {
    "id": 72,
    "n": "DIOR SAUVAGE",
    "f": "Amaderada",
    "o": "Noche",
    "g": "Masculino",
    "no": [
      "Bergamota de Calabria",
      "Pimienta de Sichuan",
      "Ambroxan · Cedro"
    ],
    "p": 75000,
    "h": 107,
    "desc": "La fuerza de la naturaleza en un frasco. Un perfume amaderado aromático, con una salida de bergamota y pimienta.",
    "img": "assets/img/DIORSAUVAGE.PNG"
  },
  {
    "id": 73,
    "n": "MISS DIOR",
    "f": "Cítrica / Fresca",
    "o": "Noche",
    "g": "Femenino",
    "no": [
      "Frutas frescas y bayas",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 144,
    "desc": "Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.",
    "img": "assets/img/MISSDIOR.jpg"
  },
  {
    "id": 74,
    "n": "ACQUA DI GIO GIORGIO ARMANI",
    "f": "Cítrica / Fresca",
    "o": "Verano",
    "g": "Masculino",
    "no": [
      "Notas cítricas vibrantes",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 181,
    "desc": "La frescura del mar en cada rocío. Una fragancia acuática cítrica, con notas de bergamota, neroli y romero.",
    "img": "assets/img/ACQUA_DI_GIO.jpg"
  },
  {
    "id": 75,
    "n": "AQUA DI GIO PROFONDO ARMANI",
    "f": "Cítrica / Fresca",
    "o": "Verano",
    "g": "Masculino",
    "no": [
      "Frutas frescas y bayas",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 218,
    "desc": "Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.",
    "img": "assets/img/DI_GIO_PROFONDO.webp"
  },
  {
    "id": 76,
    "n": "BORN IN ROMA VALENTINO",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "g": "Masculino",
    "no": [
      "Grosella negra · Pimienta rosa",
      "Jazmín grandiflorum",
      "Vainilla bourbon · Madera"
    ],
    "p": 75000,
    "h": 255,
    "desc": "La sofisticación italiana en un frasco. Una fragancia amaderada especiada, con una apertura vibrante de salvia y jengibre.",
    "img": "assets/img/BORN_IN_ROMA.jpg"
  },
  {
    "id": 77,
    "n": "DONNA BORN IN ROMA VALENTINO",
    "f": "Aromática",
    "o": "Noche",
    "g": "Femenino",
    "no": [
      "Grosella negra · Pimienta rosa",
      "Jazmín grandiflorum",
      "Vainilla bourbon · Madera"
    ],
    "p": 75000,
    "h": 292,
    "desc": "Inspirada en la elegancia de Roma, esta fragancia está dirigida a mujeres que buscan un perfume sofisticado y moderno.",
    "img": "assets/img/DONNA_BORN_IN_ROMA.jpeg"
  },
  {
    "id": 78,
    "n": "BORN IN ROMA INTENSE VALENTINO",
    "f": "Cítrica / Fresca",
    "o": "Noche",
    "g": "Femenino",
    "no": [
      "Grosella negra · Pimienta rosa",
      "Jazmín grandiflorum",
      "Vainilla bourbon · Madera"
    ],
    "p": 75000,
    "h": 329,
    "desc": "Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.",
    "img": "assets/img/VALENTINO_INTENSE.jpg"
  },
  {
    "id": 79,
    "n": "LACOSTE BLANCA",
    "f": "Cítrica / Fresca",
    "o": "Oficina",
    "g": "Masculino",
    "no": [
      "Pomelo · Cardamomo",
      "Ylang-ylang · Nardo",
      "Cedro de Virginia · Gamuza"
    ],
    "p": 75000,
    "h": 6,
    "desc": "La esencia de la elegancia deportiva. Un aroma fresco y limpio, con notas de pomelo, cardamomo y ylang-ylang.",
    "img": "assets/img/LACOSTE_BLANCA.png"
  },
  {
    "id": 80,
    "n": "LACOSTE RED STYLE IN PLAY",
    "f": "Cítrica / Fresca",
    "o": "Noche",
    "g": "Masculino",
    "no": [
      "Frutas frescas y bayas",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 43,
    "desc": "Lacoste Red es una fragancia fresca y afrutada con una salida de manzana verde y maclura.",
    "img": "assets/img/LCRED.jpg"
  },
  {
    "id": 81,
    "n": "LACOSTE SENSUELLE",
    "f": "Cítrica / Fresca",
    "o": "Noche",
    "g": "Femenino",
    "no": [
      "Frutas frescas y bayas",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 80,
    "desc": "Lacoste Red es una fragancia fresca y afrutada con una salida de manzana verde y maclura.",
    "img": "assets/img/LACOSTESENSUAL.jpg"
  },
  {
    "id": 82,
    "n": "ONE MILLON MILLION PACO RABANNE",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "g": "Masculino",
    "no": [
      "Mandarina roja · Pomelo",
      "Rosa · Canela",
      "Cuero especiado · Ámbar"
    ],
    "p": 75000,
    "h": 117,
    "desc": "Lujo y audacia en cada gota. Una fragancia amaderada especiada, con una apertura de toronja y menta.",
    "img": "assets/img/ONE_MILLON.jpg"
  },
  {
    "id": 83,
    "n": "BLACK XS L´APHRODISIAQUE PACO RABANNE",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "g": "Masculino",
    "no": [
      "Notas cítricas vibrantes",
      "Especias orientales",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 154,
    "desc": "Lujo y audacia en cada gota. Una fragancia amaderada especiada, con una apertura de toronja y menta.",
    "img": "assets/img/LAPHRODISIAQUE2.jpg"
  },
  {
    "id": 84,
    "n": "EROS EAU DE TOILETTE VERSACE",
    "f": "Amaderada",
    "o": "Noche",
    "g": "Masculino",
    "no": [
      "Menta fresca · Manzana verde",
      "Haba tonka · Geranio",
      "Vainilla de Madagascar · Cedro"
    ],
    "p": 75000,
    "h": 191,
    "desc": "Inspirado en la mitología griega, es una fragancia amaderada aromática, que exuda poder y seducción.",
    "img": "assets/img/EROS.webp"
  },
  {
    "id": 85,
    "n": "EROS ENERGY VERSACE",
    "f": "Cítrica / Fresca",
    "o": "Noche",
    "g": "Masculino",
    "no": [
      "Menta fresca · Manzana verde",
      "Haba tonka · Geranio",
      "Vainilla de Madagascar · Cedro"
    ],
    "p": 75000,
    "h": 228,
    "desc": "Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.",
    "img": "assets/img/EROS_ENERGY.jpg"
  },
  {
    "id": 86,
    "n": "EROS FLAME VERSACE",
    "f": "Cítrica / Fresca",
    "o": "Noche",
    "g": "Masculino",
    "no": [
      "Menta fresca · Manzana verde",
      "Haba tonka · Geranio",
      "Vainilla de Madagascar · Cedro"
    ],
    "p": 75000,
    "h": 265,
    "desc": "Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.",
    "img": "assets/img/EROS_FLAME.webp"
  },
  {
    "id": 87,
    "n": "SANTAL BOISE VERSACE",
    "f": "Especiada / Árabe",
    "o": "Noche",
    "g": "Masculino",
    "no": [
      "Notas cítricas vibrantes",
      "Especias orientales",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 302,
    "desc": "Es una fragancia que evoca la frescura tropical y la dulzura especiada.",
    "img": "assets/img/SANTALBOISE.webp"
  },
  {
    "id": 88,
    "n": "BOSS BOTTLED ABSOLUTE HUGO BOSS",
    "f": "Aromática",
    "o": "Noche",
    "g": "Masculino",
    "no": [
      "Notas cítricas vibrantes",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 339,
    "desc": "Fragancia de alta concentración con base de feromonas inspirada en BOSS BOTTLED ABSOLUTE HUGO BOSS.",
    "img": "assets/img/BOTTLED3.jpg"
  },
  {
    "id": 89,
    "n": "UNLIMITED HUGO BOSS",
    "f": "Aromática",
    "o": "Noche",
    "g": "Masculino",
    "no": [
      "Notas cítricas vibrantes",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 16,
    "desc": "Un perfume masculino y sofisticado que combina notas de bergamota, lavanda y madera.",
    "img": "assets/img/UNLIMITED2.JPG"
  },
  {
    "id": 90,
    "n": "HUGO NIGHT HUGO BOSS",
    "f": "Cítrica / Fresca",
    "o": "Noche",
    "g": "Masculino",
    "no": [
      "Frutas frescas y bayas",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 53,
    "desc": "Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.",
    "img": "assets/img/HUGO_NIGHT.webp"
  },
  {
    "id": 91,
    "n": "BOSS SILVER HUGO BOSS",
    "f": "Cítrica / Fresca",
    "o": "Noche",
    "g": "Masculino",
    "no": [
      "Frutas frescas y bayas",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 90,
    "desc": "Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.",
    "img": "assets/img/HUGO_SILVER.jpg"
  },
  {
    "id": 92,
    "n": "OMNIA CORAL BVLGARI",
    "f": "Cítrica / Fresca",
    "o": "Noche",
    "g": "Femenino",
    "no": [
      "Frutas frescas y bayas",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 127,
    "desc": "Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.",
    "img": "assets/img/OMNIA_CORAL.webp"
  },
  {
    "id": 93,
    "n": "OMNIA CRYSTALLINE BVLGARI",
    "f": "Cítrica / Fresca",
    "o": "Noche",
    "g": "Femenino",
    "no": [
      "Frutas frescas y bayas",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 164,
    "desc": "Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.",
    "img": "assets/img/OMNIA_CRISTAL.jpeg"
  },
  {
    "id": 94,
    "n": "OMNIA AMETHYSTE BVLGARI",
    "f": "Cítrica / Fresca",
    "o": "Noche",
    "g": "Femenino",
    "no": [
      "Frutas frescas y bayas",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 201,
    "desc": "Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.",
    "img": "assets/img/CORAL_AMETHYSTE.jpeg"
  },
  {
    "id": 95,
    "n": "YOU ESIKA",
    "f": "Cítrica / Fresca",
    "o": "Noche",
    "g": "Femenino",
    "no": [
      "Frutas frescas y bayas",
      "Corazón floral de autor",
      "Fondo amaderado y feromonas"
    ],
    "p": 75000,
    "h": 238,
    "desc": "Un perfume dulce y juguetón que combina notas de frutas y flores. Un aroma fresco y divertido que seguro hará sonreír.",
    "img": "assets/img/YOU.webp"
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

  // Estados reactivos en memoria
  let P = [...DATOS_DUROS_PRODUCTOS];
  let TOP10 = [...DATOS_DUROS_TOP10];
  let ENVASES = [...DATOS_DUROS_ENVASES];

  const $ = function(s) { return document.querySelector(s); };
  const $$ = function(s) { return document.querySelectorAll(s); };
  const fmt = function(n) { return "$" + Number(n).toLocaleString("es-CO"); };

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

  // Filtros activos
  let filters = {
    search: "",
    occasion: "Todos",
    family: "Todos",
    gender: "Todos"
  };

  // Carrito y selección
  let cart = [];
  let D = { id: P[0] ? P[0].id : 1, ml: 50, q: 1 };

  try {
    cart = JSON.parse(localStorage.getItem("ad_cart") || "[]");
  } catch(e) {
    cart = [];
  }

  function save() {
    try {
      localStorage.setItem("ad_cart", JSON.stringify(cart));
    } catch(e) {}
  }

  function sz(ml) {
    return SIZES.filter(function(z) { return z.ml === ml; })[0] || SIZES[1];
  }

  function pr(p, ml) {
    const baseP = Number(p.p || p.precio || p.price || 75000);
    return Math.round((baseP * sz(ml).x) / 1000) * 1000;
  }

  function bt(h, s, img, name, isPriority) {
    if (img) {
      const realImg = normalizarImagen(img);
      const loadingAttr = isPriority ? 'loading="eager" fetchpriority="high"' : 'loading="lazy" decoding="async"';
      return `
        <div class="bottle-wrap">
          <img src="${realImg}" alt="${name || 'Fragancia'}" class="stage-real-img" width="280" height="280" ${loadingAttr} onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='grid';">
          <div class="bottle fallback-bottle" style="--h:${h || 32};--s:${s || 1.7};display:none"><i></i></div>
        </div>
      `;
    }
    return `<div class="bottle" style="--h:${h || 32};--s:${s || 1.7}"><i></i></div>`;
  }

  function desc(p) {
    if (p.desc) return p.desc;
    if (p.description) return p.description;
    const f = (p.f || "de autor").toLowerCase();
    const no = p.no || ["Notas cítricas", "Corazón aromático", "Ámbar y feromonas"];
    return `Una fragancia ${f} de alta densidad. Abre con ${no[0].toLowerCase()}, se asienta en ${no[1].toLowerCase()} y deja un fondo memorable de ${no[2].toLowerCase()}. Concentración extra al 33% con base de feromonas.`;
  }

  function normalizar(txt) {
    return (txt || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  }

  function filtrarProductos() {
    const term = normalizar(filters.search);
    return P.filter(function(p) {
      if (term) {
        const enNombre = normalizar(p.n).includes(term);
        const enFamilia = normalizar(p.f).includes(term);
        const enOcasion = normalizar(p.o).includes(term);
        const enNotas = p.no && p.no.some(n => normalizar(n).includes(term));
        const enDesc = p.desc ? normalizar(p.desc).includes(term) : false;
        if (!enNombre && !enFamilia && !enOcasion && !enNotas && !enDesc) return false;
      }

      if (filters.occasion !== "Todos") {
        if (p.o !== filters.occasion) return false;
      }

      if (filters.family !== "Todos") {
        if (p.f !== filters.family) return false;
      }

      if (filters.gender !== "Todos") {
        if (p.g !== filters.gender) return false;
      }

      return true;
    });
  }

  function getActiveFilterCount() {
    let count = 0;
    if (filters.occasion !== "Todos") count++;
    if (filters.family !== "Todos") count++;
    if (filters.gender !== "Todos") count++;
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

  function renderGrid() {
    const el = $("#grid");
    const statusEl = $("#filterStatus");
    const metaEl = $("#coleccionMeta");
    if (!el) return;

    const filtrados = filtrarProductos();

    if (statusEl) {
      const activeCount = getActiveFilterCount();
      if (activeCount > 0) {
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
      metaEl.textContent = `${P.length} formulaciones · 33% de extracto puro · Base de feromonas`;
    }

    updateFilterBadge();

    if (!filtrados.length) {
      el.innerHTML = `
        <div style="grid-column: 1 / -1; padding: var(--sp-6) var(--sp-4); text-align: center; background: var(--c-bg);">
          <p class="mute" style="font-size: var(--fs-4); font-family: var(--f-display); margin-bottom: var(--sp-3);">
            No encontramos ninguna fragancia que coincida con estos criterios.
          </p>
          <button class="btn btn--line up" id="btnResetEmpty">Ver toda la colección</button>
        </div>
      `;
      return;
    }

    el.innerHTML = filtrados.map(function(p, idx) {
      const isPriority = idx < 6;
      return `
        <article class="card">
          <div class="stage" data-open="${p.id}">
            <span class="tag up">33% extracto</span>
            ${bt(p.h, 1, p.img, p.n, isPriority)}
            <div class="notes">${(p.no || []).join(" · ")}</div>
          </div>
          <div class="info">
            <div>
              <h3 data-open="${p.id}">${p.n}</h3>
              <span>${p.f} · desde ${fmt(pr(p, 30))}</span>
            </div>
            <button class="link up" data-add="${p.id}">Añadir</button>
          </div>
        </article>
      `;
    }).join("");
  }

  function renderRank() {
    const el = $("#rank");
    if (!el) return;
    el.innerHTML = TOP10.map(function(p, i) {
      const pId = p.producto_id || p.id;
      const nom = p.nombre || p.name || p.n;
      const fam = p.f || p.categoria || p.category || "Perfumería de Autor";
      const notas = p.no ? p.no.join(" · ") : (p.genero || p.gender || "Unisex");
      const precio = p.precio || p.price || p.p || 75000;
      return `
        <div class="row rv">
          <span class="n">${i < 9 ? "0" : ""}${i + 1}</span>
          <div>
            <h3 data-open="${pId}">${nom}</h3>
            <small>${fam} · ${notas}</small>
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
        <div class="size rv">
          <div class="stage" style="padding:var(--sp-2);">
            <img src="${imgPath}" alt="Envase ${nom}" class="stage-real-img" width="240" height="200" ${loadingAttr} style="max-height:200px; width:auto; max-width:85%; object-fit:contain;" onerror="this.src='assets/img/Logo2026.png';">
          </div>
          <b style="font-size:22px; margin-top:var(--sp-1); letter-spacing:0.04em;">${nom}</b>
          <span class="up eyebrow">${tallas} · ${z.material || 'Vidrio'}</span>
          <p class="mute" style="font-size:var(--fs-2); line-height:1.45; max-width:28ch; margin:var(--sp-1) 0 var(--sp-2);">${z.description || z.descripcion || 'Envase de vidrio premium.'}</p>
          <a class="btn btn--line up" style="font-size:11px; padding:var(--sp-2) var(--sp-3);" href="https://wa.me/${WA}?text=${msgWa}" target="_blank" rel="noopener">Pedir en este envase</a>
        </div>
      `;
    }).join("");
  }

  function renderDetail() {
    const sheet = $("#sheet");
    if (!sheet) return;
    const p = P.find(item => item.id === D.id) ||
              TOP10.find(item => (item.id === D.id || item.producto_id === D.id)) ||
              P[0];
    const z = sz(D.ml);
    const nom = p.n || p.nombre || p.name;
    const fam = p.f || p.categoria || p.category || "Perfumería de Autor";
    const occ = p.o || "Noche";
    const imgUrl = p.img || p.imagen || p.image;
    const notas = p.no || ["Notas cítricas", "Corazón aromático", "Ámbar y feromonas"];

    sheet.innerHTML = `
      <button class="x up" data-close aria-label="Cerrar detalle">✕ Cerrar</button>
      <div class="stage">${bt(p.h || 32, z.s + 0.3, imgUrl, nom, true)}</div>
      <div class="d-info">
        <span class="up eyebrow">${fam} · Ocasión: ${occ}</span>
        <h2>${nom}</h2>
        <p class="mute">${desc(p)}</p>
        <dl class="pyr">
          <div><dt class="up">Salida</dt><dd>${notas[0] || 'Notas frescas'}</dd></div>
          <div><dt class="up">Corazón</dt><dd>${notas[1] || 'Esencia de autor'}</dd></div>
          <div><dt class="up">Fondo</dt><dd>${notas[2] || 'Ámbar y feromonas'}</dd></div>
        </dl>
        <div class="specs up">
          <div><b>33%</b>Extracto</div>
          <div><b>12h+</b>Fijación</div>
          <div><b>+</b>Feromonas</div>
        </div>
        <div class="pick up">
          ${SIZES.map(s => `
            <button class="chip ${s.ml === D.ml ? 'on' : ''}" data-size="${s.ml}">${s.ml} ml</button>
          `).join("")}
        </div>
        <div class="buy">
          <b style="font:300 28px var(--f-display)">${fmt(pr(p, D.ml) * D.q)}</b>
          <div class="qty">
            <button data-dq="-1" aria-label="Disminuir">−</button>
            <span>${D.q}</span>
            <button data-dq="1" aria-label="Aumentar">+</button>
          </div>
          <button class="btn up" data-adddet>Añadir a la bolsa</button>
        </div>
      </div>
    `;
  }

  function populateFilterModal() {
    const fpFamilies = $("#fpFamilies");
    const fpOccasions = $("#fpOccasions");
    const fpGenders = $("#fpGenders");

    if (!fpFamilies || !fpOccasions || !fpGenders) return;

    const familias = ["Todos", ...new Set(P.map(x => x.f).filter(Boolean))];
    fpFamilies.innerHTML = familias.map(f => `
      <button class="chip up ${filters.family === f ? 'on' : ''}" data-modal-filter="family" data-val="${f}">${f}</button>
    `).join("");

    const ocasiones = ["Todos", "Noche", "Oficina", "Verano"];
    fpOccasions.innerHTML = ocasiones.map(o => `
      <button class="chip up ${filters.occasion === o ? 'on' : ''}" data-modal-filter="occasion" data-val="${o}">${o}</button>
    `).join("");

    const generos = ["Todos", "Unisex", "Masculino", "Femenino"];
    fpGenders.innerHTML = generos.map(g => `
      <button class="chip up ${filters.gender === g ? 'on' : ''}" data-modal-filter="gender" data-val="${g}">${g}</button>
    `).join("");

    updateFilterModalMatchingCount();
  }

  function updateFilterModalMatchingCount() {
    const countEl = $("#filterMatchingCount");
    if (!countEl) return;
    const matches = filtrarProductos().length;
    countEl.textContent = matches;
  }

  function openFilterModal() {
    populateFilterModal();
    const modal = $("#filterModal");
    const scrim = $("#scrim");
    if (modal) modal.classList.add("on");
    if (scrim) scrim.classList.add("on");
    document.body.style.overflow = "hidden";
  }

  function closeFilterModal() {
    const modal = $("#filterModal");
    const scrim = $("#scrim");
    if (modal) modal.classList.remove("on");
    if (scrim) scrim.classList.remove("on");
    document.body.style.overflow = "";
  }

  function resetAllFilters() {
    filters = {
      search: "",
      occasion: "Todos",
      family: "Todos",
      gender: "Todos"
    };
    const searchInput = $("#liveSearch");
    const clearBtn = $("#clearSearch");
    if (searchInput) searchInput.value = "";
    if (clearBtn) clearBtn.style.display = "none";
    renderChips();
    renderGrid();
    updateFilterBadge();
  }

  // Carrito / Bolsa
  function addToCart(id, ml, q) {
    const item = cart.find(x => x.id === id && x.ml === ml);
    if (item) {
      item.q += q;
    } else {
      cart.push({ id, ml, q });
    }
    save();
    drawCart();
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
        const p = P.find(item => item.id === l.id) ||
                  TOP10.find(item => (item.id === l.id || item.producto_id === l.id)) ||
                  { n: "Fragancia", p: 75000, h: 30 };
        const nom = p.n || p.nombre || p.name;
        const u = pr(p, l.ml);
        t += u * l.q;
        c += l.q;
        return `
          <div class="it">
            <div class="mini" style="--h:${p.h || 30}"></div>
            <div>
              <b class="up">${nom}</b>
              <small>${l.ml} ml · ${fmt(u)}</small>
              <div class="qty" style="margin-top:var(--sp-2)">
                <button data-cq="-1" data-i="${i}">−</button>
                <span>${l.q}</span>
                <button data-cq="1" data-i="${i}">+</button>
              </div>
            </div>
            <div>${fmt(u * l.q)}</div>
          </div>
        `;
      }).join("");
    } else {
      itemsEl.innerHTML = `
        <div class="empty">
          <p>Tu bolsa está vacía.</p>
          <p style="margin-top:var(--sp-3)"><a class="link up" href="#coleccion" data-close>Ver colección</a></p>
        </div>
      `;
    }

    if (totalEl) totalEl.textContent = fmt(t);
    if (cntEl) cntEl.textContent = c;

    const waBtn = $("#wa");
    if (waBtn) {
      const msg = "¡Hola! Quiero hacer un pedido en Fragancias de Alta Densidad:\n\n" +
        cart.map(l => {
          const p = P.find(item => item.id === l.id) ||
                    TOP10.find(item => (item.id === l.id || item.producto_id === l.id)) ||
                    { n: "Fragancia" };
          const nom = p.n || p.nombre || p.name;
          return `• ${l.q} x ${nom} (${l.ml} ml) = ${fmt(pr(p, l.ml) * l.q)}`;
        }).join("\n") +
        `\n\nTotal: ${fmt(t)}\n¿Me confirman disponibilidad y despacho? ✨`;

      waBtn.href = cart.length ? `https://wa.me/${WA}?text=${encodeURIComponent(msg)}` : "#";
      waBtn.style.opacity = cart.length ? "1" : "0.4";
      waBtn.style.pointerEvents = cart.length ? "auto" : "none";
    }
  }

  function closeAll() {
    const drawer = $("#drawer");
    const modal = $("#modal");
    const filterModal = $("#filterModal");
    const scrim = $("#scrim");
    if (drawer) drawer.classList.remove("on");
    if (modal) modal.classList.remove("on");
    if (filterModal) filterModal.classList.remove("on");
    if (scrim) scrim.classList.remove("on");
    document.body.style.overflow = "";
  }

  function openCart() {
    const modal = $("#modal");
    const filterModal = $("#filterModal");
    const drawer = $("#drawer");
    const scrim = $("#scrim");
    if (modal) modal.classList.remove("on");
    if (filterModal) filterModal.classList.remove("on");
    if (drawer) drawer.classList.add("on");
    if (scrim) scrim.classList.add("on");
    document.body.style.overflow = "hidden";
  }

  function openDet(id) {
    D = { id: Number(id), ml: 50, q: 1 };
    renderDetail();
    const modal = $("#modal");
    const scrim = $("#scrim");
    if (modal) modal.classList.add("on");
    if (scrim) scrim.classList.add("on");
    document.body.style.overflow = "hidden";
  }

  // Fetch seguro con fallback multiruta (solo localhost si el puerto es 3000)
  async function fetchConFallback(rutaApi) {
    const isLocal = typeof location !== 'undefined' && 
      (location.hostname === 'localhost' || location.hostname === '127.0.0.1') && 
      location.port === '3000';
    const urls = isLocal
      ? [`http://localhost:3000/api/${rutaApi}`, `https://altadensidadpage-production.up.railway.app/api/${rutaApi}`]
      : [`https://altadensidadpage-production.up.railway.app/api/${rutaApi}`];
    for (const url of urls) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3500);
        const resp = await fetch(url, { signal: controller.signal });
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

  // Carga reactiva de productos desde API
  async function cargarCatalogoBackend() {
    try {
      const data = await fetchConFallback("productos");
      if (data && data.length) {
        const activos = data.filter(x => x.activo !== 0);
        if (activos.length) {
          adaptarYRenderizar(activos);
          try { localStorage.setItem("ad_cached_products_v1", JSON.stringify(activos)); } catch(e) {}
        }
      }
    } catch(e) {}
  }

  // Carga reactiva del ranking Top 10 desde API
  async function cargarTop10Backend() {
    try {
      const data = await fetchConFallback("top10");
      if (data && data.length) {
        TOP10 = data.map((t, idx) => ({
          posicion: t.posicion || idx + 1,
          producto_id: t.producto_id || t.id,
          id: t.producto_id || t.id,
          nombre: t.nombre || t.name,
          imagen: normalizarImagen(t.imagen || t.image),
          categoria: t.categoria || t.category || "Perfumería",
          genero: t.genero || t.gender || "Unisex",
          f: t.categoria || "Perfumería de Autor",
          descripcion: t.descripcion || t.description || "",
          precio: Number(t.precio || t.price || 75000),
          rating: t.rating || 5
        }));
        renderRank();
        try { localStorage.setItem("ad_cached_top10_v1", JSON.stringify(TOP10)); } catch(e) {}
      }
    } catch(e) {}
  }

  // Carga reactiva de envases desde API
  async function cargarEnvasesBackend() {
    try {
      const data = await fetchConFallback("envases");
      if (data && data.length) {
        ENVASES = data.map((item, idx) => {
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
        try { localStorage.setItem("ad_cached_envases_v1", JSON.stringify(ENVASES)); } catch(e) {}
      }
    } catch(e) {}
  }

  function adaptarYRenderizar(lista) {
    const nuevos = lista.map((item, idx) => {
      let occ = "Noche";
      let fam = "Amaderada";
      let gen = "Unisex";
      let hue = (idx * 37) % 360;

      const nameLow = (item.name || "").toLowerCase();
      const descLow = (item.description || "").toLowerCase();
      const catLow = (item.category || "").toLowerCase();

      if (item.gender) {
        gen = (item.gender === "Hombre" || item.gender === "Masculino") ? "Masculino" :
              ((item.gender === "Mujer" || item.gender === "Femenino") ? "Femenino" : "Unisex");
      } else if (descLow.includes("femenin") || nameLow.includes("rose") || nameLow.includes("mujer")) {
        gen = "Femenino";
      } else if (descLow.includes("masculin") || nameLow.includes("hombre")) {
        gen = "Masculino";
      }

      if (descLow.includes("fresc") || descLow.includes("cítric") || descLow.includes("verano") || nameLow.includes("aqua") || nameLow.includes("blue")) {
        occ = "Verano";
        fam = "Cítrica / Fresca";
        hue = 190;
      } else if (descLow.includes("oficina") || descLow.includes("elegante") || descLow.includes("diario") || descLow.includes("versátil")) {
        occ = "Oficina";
        fam = "Aromática";
        hue = 130;
      } else if (descLow.includes("dulce") || descLow.includes("vainilla") || descLow.includes("gourmand") || descLow.includes("caramelo") || nameLow.includes("candy")) {
        fam = "Dulce / Gourmand";
        hue = 24;
      } else if (descLow.includes("floral") || nameLow.includes("rosa") || nameLow.includes("iris") || nameLow.includes("rose")) {
        fam = "Floral";
        hue = 330;
      } else if (descLow.includes("cuero") || nameLow.includes("cuero") || nameLow.includes("leather")) {
        fam = "Cuero";
        hue = 16;
      } else if (catLow.includes("arabe") || descLow.includes("oriental") || descLow.includes("especiad") || nameLow.includes("oud")) {
        fam = "Especiada / Árabe";
        hue = 40;
      }

      const notasExtraidas = [
        item.notas_salida || "Salida vibrante",
        item.notas_corazon || "Corazón de autor",
        item.notas_fondo || "Ámbar y feromonas"
      ];

      return {
        id: item.id || (1000 + idx),
        n: item.name,
        f: fam,
        o: occ,
        g: gen,
        no: notasExtraidas,
        p: Number(item.price) > 0 ? Number(item.price) : 75000,
        h: hue,
        desc: item.description || null,
        img: normalizarImagen(item.image || (item.images && item.images[0]))
      };
    });

    if (nuevos.length) {
      P = nuevos;
      renderChips();
      renderGrid();
    }
  }

  // Micro-interacción: Botella 3D en Hero
  function initHeroBottleInteractivity() {
    const stage = document.querySelector(".hero .stage");
    const bottle = document.querySelector(".hero .stage .bottle");
    if (!stage || !bottle) return;

    stage.addEventListener("mousemove", function(e) {
      const rect = stage.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      bottle.style.transform = `perspective(600px) rotateY(${x * 16}deg) rotateX(${-y * 16}deg) translateY(-8px)`;
    });

    stage.addEventListener("mouseleave", function() {
      bottle.style.transform = "";
    });

    stage.addEventListener("click", function() {
      let currentHue = parseInt(bottle.style.getPropertyValue("--h") || "32", 10);
      let nextHue = (currentHue + 45) % 360;
      bottle.style.setProperty("--h", nextHue);
    });
  }

  // Inicialización de Eventos Delegados
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
      renderChips();
      renderGrid();
      return;
    }

    if (t.id === "btnFilterModal" || t.closest("#btnFilterModal")) {
      openFilterModal();
      return;
    }
    if (g("data-close-filters")) {
      closeFilterModal();
      return;
    }

    if (x = g("data-modal-filter")) {
      const type = x.dataset.modalFilter;
      const val = x.dataset.val;
      filters[type] = val;
      populateFilterModal();
      return;
    }

    if (t.id === "btnApplyFilters" || t.closest("#btnApplyFilters")) {
      renderChips();
      renderGrid();
      closeFilterModal();
      return;
    }

    if (t.id === "btnResetFilters" || t.id === "btnResetInline" || t.id === "btnResetEmpty") {
      resetAllFilters();
      if (t.id === "btnResetFilters") {
        populateFilterModal();
      }
      return;
    }

    if (x = g("data-add")) {
      addToCart(Number(x.dataset.add), 50, 1);
      openCart();
    } else if (g("data-adddet")) {
      addToCart(D.id, D.ml, D.q);
      openCart();
    } else if (x = g("data-size")) {
      D.ml = Number(x.dataset.size);
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
    } else if (x = g("data-open")) {
      openDet(x.dataset.open);
    } else if (g("data-cart")) {
      e.preventDefault();
      openCart();
    } else if (g("data-close")) {
      closeAll();
    } else if (g("data-aura")) {
      const aura = $("#aura");
      if (aura) aura.classList.toggle("on");
    } else if (x = g("data-o")) {
      const m = P.find(p => p.o === x.dataset.o) || P[0];
      const r = $("#aura-r");
      if (r) {
        r.innerHTML = `Le sugiero <b>${m.n}</b>: ${(m.no || []).join(", ").toLowerCase()}. <button class="link up" data-open="${m.id}">Ver detalle</button>`;
      }
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
        renderGrid();
      }, 150);
    });

    if (clearBtn) {
      clearBtn.addEventListener("click", function() {
        input.value = "";
        clearBtn.style.display = "none";
        filters.search = "";
        renderGrid();
        input.focus();
      });
    }
  }

  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") closeAll();
  });

  function initThemeToggle() {
    const btn = $("#toggleTema");
    if (!btn) return;

    function updateLabel() {
      const isLight = document.documentElement.classList.contains("modo-claro");
      btn.textContent = isLight ? "Modo Oscuro" : "Modo Claro";
    }

    btn.addEventListener("click", function() {
      const isLight = document.documentElement.classList.toggle("modo-claro");
      document.documentElement.setAttribute("data-theme", isLight ? "light" : "dark");
      localStorage.setItem("altadensidad_tema", isLight ? "claro" : "oscuro");
      updateLabel();
    });

    updateLabel();
  }

  document.addEventListener("DOMContentLoaded", function() {
    // 1. Render inmediato con datos duros auténticos (0ms LCP, sin parpadeos)
    renderChips();
    renderGrid();
    renderRank();
    renderSizes();
    drawCart();
    initThemeToggle();
    initHeroBottleInteractivity();
    initLiveSearch();

    // 2. Conectar en segundo plano con APIs para actualización continua
    cargarCatalogoBackend();
    cargarTop10Backend();
    cargarEnvasesBackend();

    const els = document.querySelectorAll(".rv");
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(function(es) {
        es.forEach(function(x) {
          if (x.isIntersecting) {
            x.target.classList.add("in");
            io.unobserve(x.target);
          }
        });
      }, { threshold: 0.1 });
      els.forEach(n => io.observe(n));
    } else {
      els.forEach(n => n.classList.add("in"));
    }
  });
})();
