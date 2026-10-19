/**
 * MANUAL DE CÓDIGO DE VESTIMENTA Y PRESENTACIÓN
 * Fragancias de Alta Densidad
 *
 * Bloques 'uniforme' dibujan el uniforme con la función figuraUniforme() de capacitacion.js.
 */
window.MANUAL_VESTIMENTA = {
    clave: 'vestimenta',
    titulo: 'Manual de código de vestimenta y presentación',
    descripcion: 'El uniforme del personal operativo y administrativo, cómo se lleva y los estándares de cabello, uñas, accesorios e higiene.',
    modulos: [
        {
            id: 'principios',
            titulo: 'Por qué un código de vestimenta',
            resumen: 'Somos parte de la experiencia de la marca.',
            bloques: [
                { tipo: 'texto', texto: 'En Fragancias de Alta Densidad la presentación personal comunica lo mismo que nuestros frascos: cuidado, sobriedad y calidad. El negro de la marca, el oro del logotipo y una imagen limpia hacen que el cliente confíe antes de que le hablemos.' },
                { tipo: 'lista', titulo: 'Cuatro principios', items: [
                    'Sobriedad: negro, logotipo visible y nada que compita con él.',
                    'Limpieza: prendas limpias, planchadas y completas, todos los días.',
                    'Comodidad segura: calzado y prendas que permitan trabajar de pie y cargar sin riesgo.',
                    'Coherencia: todo el equipo luce igual según su rol.'
                ] }
            ]
        },
        {
            id: 'operativo',
            titulo: 'Uniforme del personal operativo',
            resumen: 'Asesores, preparación, bodega y despachos.',
            bloques: [
                { tipo: 'uniforme', rol: 'operativo', titulo: 'Personal operativo', piezas: [
                    ['Camisa tipo polo', 'Negra, con el logotipo de la empresa, por dentro o por fuera según la indicación del punto.'],
                    ['Delantal', 'De la empresa, limpio, bien atado y sin manchas de esencia. Obligatorio en preparación y bodega.'],
                    ['Pantalón negro cómodo', 'Liso, sin rotos, que permita agacharse y cargar.'],
                    ['Zapatos negros cómodos', 'Cerrados y antideslizantes. Nunca sandalias ni tenis de colores.']
                ] },
                { tipo: 'aviso', nivel: 'importante', texto: 'En preparación de perfumes, decants y en bodega no se usan anillos, pulseras ni relojes: se manipulan alcohol y esencias y los accesorios atrapan residuos.' }
            ]
        },
        {
            id: 'administrativo',
            titulo: 'Uniforme del personal administrativo',
            resumen: 'Líderes de punto, administración y oficina.',
            bloques: [
                { tipo: 'uniforme', rol: 'administrativo', titulo: 'Personal administrativo', piezas: [
                    ['Camisa tipo polo negra con logotipo', 'Limpia y planchada, con el logotipo dorado visible.'],
                    ['Jean negro', 'En excelente estado, sin rotos, desteñidos ni desgaste.'],
                    ['Zapatos modernos y formales', 'Negros, limpios y en buen estado.']
                ] },
                { tipo: 'texto', texto: 'El Líder de Punto de Venta usa el uniforme administrativo. Si apoya preparación o bodega, se pone el delantal y retira los accesorios.' }
            ]
        },
        {
            id: 'uso',
            titulo: 'Cómo se lleva el uniforme',
            resumen: 'La diferencia está en los detalles.',
            bloques: [
                { tipo: 'comparar', titulo: 'El uniforme', bien: [
                    'Limpio y planchado cada día, completo.',
                    'Logotipo visible, sin prendas encima que lo tapen.',
                    'Delantal bien atado y limpio (operativo).',
                    'Pantalón a la medida y zapatos limpios.'
                ], mal: [
                    'Prendas arrugadas, manchadas o descoloridas.',
                    'Chaquetas, sacos o gorras ajenas a la marca encima del uniforme.',
                    'Pantalones rotos, deportivos o de colores.',
                    'Chanclas, sandalias o tenis de colores.'
                ] },
                { tipo: 'aviso', nivel: 'consejo', texto: 'Ten siempre un uniforme de repuesto en el punto: un derrame de esencia no avisa.' }
            ]
        },
        {
            id: 'cabello-unas',
            titulo: 'Cabello, uñas y cuidado personal',
            resumen: 'Una imagen pulcra, sin excentricidades.',
            bloques: [
                { tipo: 'comparar', titulo: 'Cabello', bien: [
                    'Limpio, peinado y organizado.',
                    'Recogido en preparación y bodega.',
                    'Colores y cortes discretos.',
                    'Barba afeitada o bien recortada y definida.'
                ], mal: [
                    'Colores llamativos o fantasía (neón, multicolor).',
                    'Cortes o peinados extravagantes.',
                    'Cabello suelto al preparar perfumes.',
                    'Barba descuidada.'
                ] },
                { tipo: 'comparar', titulo: 'Uñas', bien: [
                    'Cortas o medianas, limpias y cuidadas.',
                    'Esmalte en tonos neutros o naturales, sin descascarar.',
                    'En preparación: cortas y sin decoraciones.'
                ], mal: [
                    'Uñas muy largas o esculpidas extremas.',
                    'Diseños recargados, piedras o colores neón.',
                    'Esmalte descascarado.'
                ] },
                { tipo: 'lista', titulo: 'Cuidado personal', items: [
                    'Higiene diaria impecable, aliento fresco y manos limpias.',
                    'Maquillaje natural y discreto.',
                    'Fragancia personal moderada: no debe competir con las fragancias que asesoramos.',
                    'Tatuajes y piercings visibles discretos; sin expansiones grandes ni piercings faciales llamativos en atención.'
                ] }
            ]
        },
        {
            id: 'accesorios',
            titulo: 'Accesorios y elementos personales',
            resumen: 'Menos es más.',
            bloques: [
                { tipo: 'tabla', titulo: 'Qué se permite y dónde', columnas: ['Elemento', 'Mostrador', 'Preparación y bodega'], filas: [
                    ['Aretes pequeños, reloj, anillo sencillo', 'Permitido', 'No'],
                    ['Collares, pulseras y anillos grandes', 'No', 'No'],
                    ['Gorras, sombreros, gafas de sol', 'No', 'No'],
                    ['Celular', 'Solo para trabajo, fuera de la vista del cliente', 'Guardado'],
                    ['Audífonos', 'No', 'No']
                ] },
                { tipo: 'aviso', nivel: 'importante', texto: 'No se come ni se masca chicle en el área de atención.' }
            ]
        },
        {
            id: 'lista',
            titulo: 'Lista de chequeo diaria',
            resumen: 'Antes de empezar el turno, frente al espejo.',
            bloques: [
                { tipo: 'chequeo', items: [
                    'Polo negra con logotipo, limpia y planchada.',
                    'Delantal limpio (personal operativo).',
                    'Pantalón negro / jean negro en buen estado.',
                    'Zapatos negros limpios.',
                    'Cabello limpio y organizado (recogido si preparo).',
                    'Uñas limpias, cortas o medianas, tonos neutros.',
                    'Accesorios según mi área.',
                    'Fragancia personal moderada.',
                    'Celular guardado.'
                ] }
            ]
        }
    ]
};
