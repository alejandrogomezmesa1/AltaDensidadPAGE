const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { getConnection } = require('./config/db');

async function seedCapacitacion(existingPool) {
    console.log('--- Iniciando Siembra de Datos de Capacitación e Inducción (53 Módulos) ---');
    try {
        const pool = existingPool || await getConnection();

        const modulos = [
            {
                        "orden": 1,
                        "titulo": "1. Bienvenida al Proceso de Inducción y Capacitación",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/1.png",
                        "video_url": null,
                        "contenido": "¡BIENVENIDO(A) A FRAGANCIAS ALTA DENSIDAD!\n\nHoy comienzas tu proceso institucional de inducción y capacitación en nuestra empresa. En Fragancias Alta Densidad creemos en la excelencia, la pasión por la perfumería y el compromiso con cada integrante de nuestro equipo.\n\nA través de estos 53 módulos aprenderás primero los aspectos institucionales y de inducción (misión, visión, historia, reglamento interno, seguridad en el trabajo y brigadas), y posteriormente la capacitación operativa (portafolio de fragancias, atención al cliente, estándares de imagen personal y facturación en sistema SIIGO).",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Qué proceso comienzas hoy en Fragancias Alta Densidad?",
                                                "opciones": [
                                                            "Proceso institucional de inducción y capacitación",
                                                            "Un examen externo voluntario",
                                                            "Una auditoría de inventario",
                                                            "Trámite de retiro"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Cómo se estructura la formación interactiva?",
                                                "opciones": [
                                                            "En dos etapas: inducción institucional primero y capacitación operativa después",
                                                            "Solo en manuales impresos",
                                                            "Un video sin preguntas",
                                                            "Charlas informales sin evaluación"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Cuál es el objetivo principal de completar esta capacitación?",
                                                "opciones": [
                                                            "Asegurar la excelencia operacional, normatividad, seguridad y calidad en el servicio",
                                                            "Pasar el tiempo en tienda",
                                                            "Modificar las políticas de la empresa",
                                                            "Omitir la atención al cliente"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 2,
                        "titulo": "2. Agenda de Inducción",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/2.png",
                        "video_url": null,
                        "contenido": "AGENDA DE INDUCCIÓN INSTITUCIONAL:\n\n• Espacio 1 (8:00 AM a 8:30 AM): Bienvenida y presentación institucional, historia, misión y visión.\n• Espacio 2 (8:30 AM a 9:00 AM): Reglamento interno, políticas, horarios, turno, código de vestimenta y confidencialidad.\n• Espacio 3 (9:00 AM a 10:00 AM): Portafolio de productos y líneas de perfumería.\n• Espacio 4 (10:30 AM a 12:00 PM): Seguridad y Salud en el Trabajo (SST), EPP, presentación de Brigada, COPASST, COCOLA y plan de emergencia.\n• HORA DE ALMUERZO Y EVALUACIÓN FINAL.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿A qué hora inicia la presentación institucional según la agenda?",
                                                "opciones": [
                                                            "7:30 AM",
                                                            "8:00 AM",
                                                            "8:30 AM",
                                                            "9:00 AM"
                                                ],
                                                "respuesta_correcta": 1
                                    },
                                    {
                                                "pregunta": "¿En qué espacio de la agenda se trata el Reglamento Interno y vestimenta?",
                                                "opciones": [
                                                            "Espacio 1 (8:00 a 8:30)",
                                                            "Espacio 2 (8:30 a 9:00)",
                                                            "Espacio 3 (9:00 a 10:00)",
                                                            "Espacio 4 (10:30 a 12:00)"
                                                ],
                                                "respuesta_correcta": 1
                                    },
                                    {
                                                "pregunta": "¿Qué temas corresponden al Espacio 4 de la jornada?",
                                                "opciones": [
                                                            "Seguridad y Salud en el Trabajo, EPP, Brigada, COPASST, COCOLA y Plan de Emergencia",
                                                            "Ventas al por mayor",
                                                            "Trámites bancarios",
                                                            "Hora de almuerzo"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 3,
                        "titulo": "3. Video Institucional Perfumería Alta Densidad",
                        "tipo": "video",
                        "imagen_url": "/assets/img/capacitacion/3.png",
                        "video_url": "/assets/img/Crear_un_video_elegante_y_prof.mp4",
                        "contenido": "VIDEO INSTITUCIONAL DE INDUCCIÓN:\n\nVisualiza el video institucional de Perfumería Alta Densidad para conocer nuestra esencia de marca, estándares de elegancia, sofisticación en tiendas y la propuesta de valor en fragancias premium de alta fijación.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Cuál es el propósito del video institucional?",
                                                "opciones": [
                                                            "Presentar la identidad, elegancia y propuesta de valor de la marca",
                                                            "Mostrar empaques defectuosos",
                                                            "Explicar contabilidad general",
                                                            "Vender productos de otras marcas"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué caracteriza a nuestras fragancias según la presentación institucional?",
                                                "opciones": [
                                                            "Baja duración de aroma",
                                                            "Alta fijación, concentración cuidadas y lujo accesible",
                                                            "Perfumes solo de muestra",
                                                            "Falta de garantía de calidad"
                                                ],
                                                "respuesta_correcta": 1
                                    },
                                    {
                                                "pregunta": "¿Por qué es importante asimilar el video institucional?",
                                                "opciones": [
                                                            "Para proyectar la imagen de marca y brindar una atención sofisticada",
                                                            "Es un paso opcional sin impacto",
                                                            "Para cambiar el logo de la tienda",
                                                            "Solo para usar el reproductor"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 4,
                        "titulo": "4. Conoce Más de Nosotros",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/4.png",
                        "video_url": null,
                        "contenido": "FRAGANCIAS ALTA DENSIDAD - CONOCE MÁS DE NOSOTROS:\n\n\"La esencia de lujo a una fracción del precio\"\n\nNuestra propuesta se basa en acercar el universo de la perfumería de alta gama a todas las personas. Nos enfocamos en ofrecer fragancias con alta fijación olfativa, empaques elegantes y precios competitivos, acompañadas de un servicio personalizado.",
                        "preguntas": []
            },
            {
                        "orden": 5,
                        "titulo": "5. Nuestra Misión",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/5.png",
                        "video_url": null,
                        "contenido": "NUESTRA MISIÓN:\n\nOfrecer fragancias de alta calidad a precios competitivos, brindando a nuestros clientes una experiencia de compra cercana, agradable y confiable. Buscamos que cada aroma permita a las personas sentirse cómodas, seguras y auténticas, acompañándolas en los diferentes momentos de su día a día.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Cuál es el compromiso central expresado en Nuestra Misión?",
                                                "opciones": [
                                                            "Ofrecer fragancias de alta calidad a precios competitivos con atención cercana y confiable",
                                                            "Vender al por mayor fuera del país",
                                                            "Disminuir la atención al cliente",
                                                            "Vender productos sin garantía"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué tipo de experiencia de compra busca generar la empresa?",
                                                "opciones": [
                                                            "Distante y fría",
                                                            "Cercana, agradable y confiable",
                                                            "Lenta e impersonal",
                                                            "Sin acompañamiento"
                                                ],
                                                "respuesta_correcta": 1
                                    },
                                    {
                                                "pregunta": "¿Qué busca transmitir la marca a través de sus perfumes?",
                                                "opciones": [
                                                            "Que las personas se sientan cómodas, seguras y auténticas en su día a día",
                                                            "Inseguridad y molestia",
                                                            "Sensación de incomodidad",
                                                            "Indiferencia total"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 6,
                        "titulo": "6. Nuestra Visión",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/6.png",
                        "video_url": null,
                        "contenido": "NUESTRA VISIÓN:\n\nPara el año 2028, Fragancias de Alta Densidad busca consolidarse como una marca referente en el mercado colombiano de fragancias, reconocida por la calidad de sus precios accesibles y la atención personalizada. Aspiramos a fortalecer nuestra presencia en diferentes regiones del país y continuar innovando para ofrecer experiencias únicas a nuestros clientes.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Para qué año proyecta la empresa consolidarse como marca referente en Colombia?",
                                                "opciones": [
                                                            "2025",
                                                            "2028",
                                                            "2030",
                                                            "2040"
                                                ],
                                                "respuesta_correcta": 1
                                    },
                                    {
                                                "pregunta": "¿Por qué atributos busca destacar la empresa según su visión?",
                                                "opciones": [
                                                            "Calidad de precios accesibles y atención personalizada",
                                                            "Precios inaccesibles y atención apática",
                                                            "Cierre de puntos de venta",
                                                            "Reducción del portafolio"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Hacia qué metas de expansión se orienta la visión organizacional?",
                                                "opciones": [
                                                            "Fortalecer la presencia en diferentes regiones del país e innovar continuamente",
                                                            "Permanecer solo en una ciudad",
                                                            "Vender únicamente por catálogo impreso",
                                                            "Descontinuar productos"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 7,
                        "titulo": "7. Nuestra Historia",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/7.png",
                        "video_url": null,
                        "contenido": "NUESTRA HISTORIA - LÍNEA DE TIEMPO ORGANIZACIONAL:\n\n• 2024 (Nace Nuestra Marca): Surge la idea de crear perfumes duraderos, de alta calidad y a precios accesibles.\n• 2024 - 2025 (Primeros Pasos): Construimos nuestra identidad, conocemos a los clientes y ampliamos la variedad olfativa.\n• 2025 (Crecimiento): Reconocimiento en el mercado por calidad, precios competitivos y atención cercana.\n• 2026 (Consolidación): Fortalecimiento de portafolio y mejora continua de la experiencia en tienda.\n• Nuevos Proyectos: Desarrollo de fragancias propias diferenciadoras.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿En qué año nació la marca Fragancias Alta Densidad?",
                                                "opciones": [
                                                            "2022",
                                                            "2024",
                                                            "2025",
                                                            "2026"
                                                ],
                                                "respuesta_correcta": 1
                                    },
                                    {
                                                "pregunta": "¿Qué marca la consolidación de la empresa en el año 2026?",
                                                "opciones": [
                                                            "Fortalecimiento de portafolio y mejora continua de productos y servicio",
                                                            "Primera exploración informal",
                                                            "Cierre de tiendas físicas",
                                                            "Venta a terceros"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿En qué consisten los nuevos proyectos de Alta Densidad?",
                                                "opciones": [
                                                            "Innovar continuamente y proyectar el desarrollo de fragancias propias",
                                                            "Dejar de formular aromas",
                                                            "Vender solo frascos vacíos",
                                                            "Descontinuar líneas de perfumería"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 8,
                        "titulo": "8. Gestión Humana y Recursos Humanos (RRHH)",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/8.png",
                        "video_url": null,
                        "contenido": "TE PRESENTAMOS A DANIELA - LÍDER DE RECURSOS HUMANOS (RRHH):\n\nGestión Humana acompaña el desarrollo profesional, bienestar, nómina, inducción, capacitaciones y clima laboral de todos los colaboradores. Daniela está al frente del área para apoyarte en tu proceso dentro de Fragancias Alta Densidad.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Quién es la Líder del área de Recursos Humanos (RRHH)?",
                                                "opciones": [
                                                            "Daniela",
                                                            "Victor Manuel",
                                                            "El cliente",
                                                            "Un auditor externo"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Cuál es la misión principal del área de Recursos Humanos?",
                                                "opciones": [
                                                            "Acompañar el desarrollo profesional, bienestar, nómina y clima laboral del equipo",
                                                            "Controlar la caja registradora diariamente",
                                                            "Elaborar las fórmulas de perfumería",
                                                            "Supervisar mantenimientos eléctricos"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Ante qué situaciones debes contactar al área de Gestión Humana?",
                                                "opciones": [
                                                            "Inquietudes laborales, inducción, nómina, capacitaciones y bienestar",
                                                            "Para realizar pedidos de envases a proveedores",
                                                            "Para compras personales de los clientes",
                                                            "Para solicitar cambios de precios"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 9,
                        "titulo": "9. Reglamento Interno de Trabajo - Líder de Punto",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/9.png",
                        "video_url": null,
                        "contenido": "NUESTRO REGLAMENTO INTERNO - APLICADO: LÍDER DE PUNTO (VERSIÓN 1.0):\n\nEste reglamento establece los lineamientos operacionales, políticas de conducta, vestimenta, horarios y deberes fundamentales para los colaboradores y Líderes de Punto de Alta Densidad, asegurando un ambiente de trabajo justo, profesional y transparente.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿A qué cargo aplica específicamente la Versión 1.0 de este reglamento?",
                                                "opciones": [
                                                            "Líder de Punto y personal de tienda",
                                                            "Clientes ocasionales",
                                                            "Proveedores de insumos",
                                                            "Diseñadores externos"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Cuál es el propósito del Reglamento Interno de Trabajo?",
                                                "opciones": [
                                                            "Garantizar normas, deberes, seguridad y excelencia operacional",
                                                            "Imponer sanciones arbitrarias",
                                                            "Limitar los descansos laborales",
                                                            "Subir los precios de venta"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Por qué es importante que el Líder de Punto cumpla este reglamento?",
                                                "opciones": [
                                                            "Para asegurar la calidad en la atención, disciplina y adecuado funcionamiento del punto de venta",
                                                            "Es opcional si hay buenas ventas",
                                                            "Solo aplica durante auditorías",
                                                            "Únicamente por solicitud voluntaria"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 10,
                        "titulo": "10. Objetivo del Reglamento Interno",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/10.png",
                        "video_url": null,
                        "contenido": "OBJETIVO DEL REGLAMENTO INTERNO:\n\nEstablecer las normas, responsabilidades y lineamientos claros que deben cumplir los colaboradores de Fragancias Alta Densidad, promoviendo el respeto, la seguridad laboral, el buen uso de los recursos y la calidad del servicio en cada punto de venta.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Cuál es el objetivo central del Reglamento Interno?",
                                                "opciones": [
                                                            "Establecer normas, responsabilidades y lineamientos claros para todos los colaboradores",
                                                            "Incrementar los precios al público",
                                                            "Disminuir la garantía de los productos",
                                                            "Evitar el uso de computadores"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué ambiente promueve el cumplimiento de las normas internas?",
                                                "opciones": [
                                                            "Un entorno de trabajo seguro, ordenado, respetuoso y eficiente",
                                                            "Un ambiente de desorganización e impuntualidad",
                                                            "Secretismo y falta de transparencia",
                                                            "Conflictos interpersonales"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Quiénes deben acatar las normas descritas en el reglamento?",
                                                "opciones": [
                                                            "Todos los colaboradores de la empresa en sus jornadas de trabajo",
                                                            "Solo el personal en periodo de prueba",
                                                            "Únicamente los administradores generales",
                                                            "Nadie en particular"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 11,
                        "titulo": "11. Horario de Trabajo - Líder de Punto",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/11.png",
                        "video_url": null,
                        "contenido": "HORARIO ESTABLECIDO PARA EL CARGO DE LÍDER DE PUNTO:\n\n10:00 A. M. A 6:00 P. M.\n\nCada colaborador con el cargo de Líder de Punto debe conocer, planificar y respetar su jornada laboral ordinaria conforme al horario oficial establecido.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Cuál es el horario de trabajo oficial para el cargo de Líder de Punto?",
                                                "opciones": [
                                                            "8:00 AM a 4:00 PM",
                                                            "10:00 AM a 6:00 PM",
                                                            "12:00 PM a 8:00 PM",
                                                            "9:00 AM a 5:00 PM"
                                                ],
                                                "respuesta_correcta": 1
                                    },
                                    {
                                                "pregunta": "¿A qué hora finaliza la jornada laboral ordinaria del Líder de Punto?",
                                                "opciones": [
                                                            "5:00 PM",
                                                            "6:00 PM",
                                                            "7:00 PM",
                                                            "8:00 PM"
                                                ],
                                                "respuesta_correcta": 1
                                    },
                                    {
                                                "pregunta": "¿Por qué es importante conocer y respetar este horario?",
                                                "opciones": [
                                                            "Para garantizar la atención continua al público y el orden operativo de la tienda",
                                                            "No tiene trascendencia",
                                                            "Es un horario flexible sin hora fija",
                                                            "Solo aplica para los fines de semana"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 12,
                        "titulo": "12. Cumplimiento del Horario y Puntualidad",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/12.png",
                        "video_url": null,
                        "contenido": "EL COLABORADOR DEBERÁ:\n\n• Cumplir puntualmente el horario establecido (10:00 A.M. a 6:00 P.M.).\n• Estar preparado para iniciar sus funciones exactamente a las 10:00 A.M.\n• Informar oportunamente cualquier situación que pueda generar retrasos o ausencias.\n• Respetar los tiempos destinados para alimentación y descanso.\n• No abandonar el punto de venta durante la jornada sin autorización cuando esto afecte la operación.\n\nLa puntualidad es un elemento fundamental del compromiso y liderazgo dentro de la empresa.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿A qué hora debe estar preparado el colaborador para iniciar sus funciones?",
                                                "opciones": [
                                                            "Exactamente a las 10:00 A.M.",
                                                            "A las 10:30 A.M.",
                                                            "A medio día",
                                                            "A cualquier hora sin compromiso"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué debes hacer si se presenta una situación que pueda generar un retraso?",
                                                "opciones": [
                                                            "Informar oportunamente a la administración",
                                                            "No avisar",
                                                            "Esperar varios días para dar explicaciones",
                                                            "Apagar el teléfono"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué valor representa la puntualidad en Alta Densidad?",
                                                "opciones": [
                                                            "Un elemento fundamental de compromiso y liderazgo",
                                                            "Una sugerencia opcional",
                                                            "Un tema sin importancia",
                                                            "Un obstáculo para trabajar"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 13,
                        "titulo": "13. Presentación Personal y Código de Vestimenta",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/13.png",
                        "video_url": null,
                        "contenido": "FRAGANCIAS DE ALTA DENSIDAD - GUÍA DE PRESENTACIÓN LÍDER DE PUNTO:\n\n• VESTIMENTA PERMITIDA (CÓMO SE DEBE PRESENTAR):\n- Imagen cómoda, elegante, limpia y profesional que refleje la marca.\n- Camisas, blusas o polos de apariencia elegante.\n- Pantalón formal, casual elegante o jean en excelente estado (sin rotos).\n- Calzado limpio, cómodo y apropiado.\n- Prendas acordes con la imagen corporativa.\n\n• NO PERMITIDO (CÓMO NO):\n- Ropa excesivamente informal, sucia o rota.\n- Chanclas o calzado inadecuado.\n- Mensajes ofensivos o incompatibles con la empresa.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Cuáles son las prendas de vestimenta permitidas para el Líder de Punto?",
                                                "opciones": [
                                                            "Camisas/blusas/polos elegantes, pantalón formal/casual o jean impecable y calzado limpio",
                                                            "Ropa deportiva rota",
                                                            "Chanclas de playa",
                                                            "Camisetas con mensajes ofensivos"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué calzado es el adecuado para portar en la jornada?",
                                                "opciones": [
                                                            "Calzado limpio, cómodo, cerrado y apropiado",
                                                            "Chanclas abiertas",
                                                            "Zapatos sucios de deporte desatados",
                                                            "Calzado roto"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué prendas o estilos están estrictamente PROHIBIDOS?",
                                                "opciones": [
                                                            "Ropa sucia, rota, excesivamente informal, chanclas y estampados ofensivos",
                                                            "Camisas blancas limpias",
                                                            "Pantalón formal negro",
                                                            "Calzado cómodo elegante"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 14,
                        "titulo": "14. Manejo y Confidencialidad de la Información",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/14.png",
                        "video_url": null,
                        "contenido": "SE CONSIDERA INFORMACIÓN CONFIDENCIAL DE LA EMPRESA:\n\n• Recetas y fórmulas de preparación de perfumería.\n• Proporciones y concentraciones de esencias utilizadas.\n• Procesos internos de elaboración y maceración.\n• Información de proveedores, costos y precios internos.\n• Márgenes de ganancia y estrategias comerciales.\n• Información de clientes y datos financieros.\n• Inventarios y movimientos internos.\n• Contraseñas y accesos a plataformas informáticas.\n• Estrategias de marketing antes de su publicación oficial.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Qué elementos son considerados información confidencial de la empresa?",
                                                "opciones": [
                                                            "Recetas, fórmulas, concentraciones, precios internos, datos de clientes y contraseñas",
                                                            "El eslogan comercial público",
                                                            "La dirección pública del punto de venta",
                                                            "El catálogo promocional"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué trato se debe dar a las contraseñas y accesos a plataformas?",
                                                "opciones": [
                                                            "Reserva absoluta y uso personal e intransferible sin divulgar a terceros",
                                                            "Compartirlas en redes sociales",
                                                            "Escribirlas en el mostrador visible",
                                                            "Revelarlas a clientes"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Por qué es vital proteger los procesos de maceración y proveedores?",
                                                "opciones": [
                                                            "Para salvaguardar el secreto comercial, la ventaja competitiva y la reputación de la marca",
                                                            "No tiene mayor importancia",
                                                            "Solo para trámites legales externos",
                                                            "Para ocultar información al equipo"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 15,
                        "titulo": "15. Cuidado y Liderazgo en el Punto de Venta",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/15.png",
                        "video_url": null,
                        "contenido": "IDENTIFICACIÓN Y LIDERAZGO DEL LÍDER DE PUNTO:\n\n• EL LÍDER COMO REFERENCIA:\nEl Líder de Punto es una figura de referencia para clientes y colaboradores. Su liderazgo se basa en el respeto, el ejemplo, la buena comunicación y la responsabilidad, evitando cualquier conducta de maltrato, humillación o abuso de autoridad.\n\n• RESPONSABILIDADES CLAVE:\n- Supervisar el correcto funcionamiento del punto.\n- Orientar y apoyar a los colaboradores.\n- Garantizar una adecuada atención al cliente.\n- Verificar el orden, limpieza y presentación de tienda.\n- Supervisar inventarios y productos.\n- Reportar novedades y velar por el cumplimiento de normas.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿En qué principios debe basarse el liderazgo del Líder de Punto?",
                                                "opciones": [
                                                            "Respeto, ejemplo positivo, buena comunicación y responsabilidad",
                                                            "Abuso de autoridad e imposición",
                                                            "Maltrato verbal y humillación",
                                                            "Indiferencia ante el equipo"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Cuáles son responsabilidades operativas clave del Líder de Punto?",
                                                "opciones": [
                                                            "Supervisar el punto, orientar al equipo, verificar orden e inventario y reportar novedades",
                                                            "Abandonar la tienda en horas pico",
                                                            "Ignorar las sugerencias del cliente",
                                                            "No revisar el stock"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué prácticas están rotundamente prohibidas en el liderazgo de tienda?",
                                                "opciones": [
                                                            "El maltrato, la humillación y el abuso de autoridad",
                                                            "Escuchar sugerencias del equipo",
                                                            "Dar ejemplo positivo",
                                                            "Mantener la tienda ordenada"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 16,
                        "titulo": "16. Uso de Redes Sociales y Dispositivos Móviles",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/16.png",
                        "video_url": null,
                        "contenido": "USO DE REDES SOCIALES Y TELÉFONO CELULAR:\n\n• El uso del celular durante la jornada debe ser responsable y NO afectar la atención al cliente ni las funciones asignadas.\n\n• CONTENIDO PROHIBIDO PARA PUBLICAR:\n- Recetas o fórmulas secretas de perfumería.\n- Procesos internos no autorizados.\n- Información financiera de la empresa.\n- Datos personales de clientes.\n- Conversaciones internas o fotografías de documentos privados.\n\nLa publicación de contenido corporativo debe respetar las directrices de la administración.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Cuál es la regla principal sobre el uso del celular en la jornada?",
                                                "opciones": [
                                                            "Debe ser responsable y no afectar la atención al cliente ni las labores asignadas",
                                                            "Uso libre para entretenimiento mientras se atiende",
                                                            "Está prohibido tener teléfono en el bolso",
                                                            "Se debe chatear libremente en el mostrador"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué tipo de contenido está PROHIBIDO publicar en redes sociales personales?",
                                                "opciones": [
                                                            "Fórmulas secretas, procesos no autorizados, datos financieros, clientes o fotos de documentos",
                                                            "Fotos personales de vacaciones",
                                                            "Publicidad oficial autorizada",
                                                            "Saludos cordiales"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Cómo deben manejarse las publicaciones relacionadas con la empresa?",
                                                "opciones": [
                                                            "Respetando estrictamente las directrices de publicación establecidas por la administración",
                                                            "Publicando cualquier rumor",
                                                            "Compartiendo datos privados",
                                                            "Sin ninguna norma de prudencia"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 17,
                        "titulo": "17. Uso de Elementos y Recursos de la Empresa",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/17.png",
                        "video_url": null,
                        "contenido": "USO EXCLUSIVO AUTORIZADO DE RECURSOS DE LA EMPRESA:\n\nCUIDADO Y RESPONSABILIDAD:\n• Los recursos de Fragancias Alta Densidad deben utilizarse exclusivamente para las actividades laborales autorizadas.\n• Recursos a cuidar: Equipos y hardware, materiales y productos, documentos y cuentas, herramientas de trabajo, dispositivos de comunicación, uniformes y EPP.\n\nCUIDADO ACTIVO Y REPORTE INMEDIATO:\nEl colaborador debe reportar inmediatamente cualquier daño, pérdida o uso no autorizado de los recursos.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Para qué fines se deben utilizar los recursos y herramientas de la empresa?",
                                                "opciones": [
                                                            "Exclusivamente para las actividades y labores autorizadas por la empresa",
                                                            "Para proyectos personales ajenos",
                                                            "Para préstamos a particulares externos",
                                                            "Para uso recreativo en tiempo libre"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué obligación tiene el colaborador si detecta un daño o pérdida de un equipo?",
                                                "opciones": [
                                                            "Reportar inmediatamente la novedad al área correspondiente",
                                                            "Ocultar el equipo dañado",
                                                            "Culpar a un compañero sin investigar",
                                                            "Ignorar el daño"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué elementos forman parte de los recursos de la empresa a proteger?",
                                                "opciones": [
                                                            "Equipos de cómputo, productos, herramientas, documentos, uniformes y EPP",
                                                            "Solo los computadores de la oficina principal",
                                                            "Únicamente las llaves del local",
                                                            "Solamente las sillas de descanso"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 18,
                        "titulo": "18. Incumplimiento y Sanciones Disciplinarias",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/18.png",
                        "video_url": null,
                        "contenido": "INCUMPLIMIENTO Y SANCIONES DISCIPLINARIAS:\n\nEl no cumplimiento de las disposiciones establecidas en este reglamento podrá generar las siguientes medidas correctivas:\n1. Llamado de atención verbal registrado.\n2. Llamado de atención escrito con copia a la hoja de vida.\n3. Sanciones disciplinarias conforme al Reglamento Interno General de Trabajo y la legislación laboral vigente.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Qué secuencia de medidas correctivas contempla el reglamento ante faltas?",
                                                "opciones": [
                                                            "Llamado de atención verbal, llamado escrito y sanciones según el Reglamento Interno",
                                                            "Despido inmediato sin escuchar",
                                                            "Multas económicas al azar",
                                                            "No genera ninguna consecuencia"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Dónde se anexa la copia de un llamado de atención escrito?",
                                                "opciones": [
                                                            "A la hoja de vida del colaborador para el historial disciplinario formal",
                                                            "En la cartelera pública de la tienda",
                                                            "Se desecha al final del día",
                                                            "En redes sociales de la empresa"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Cuál es el propósito de aplicar estas medidas correctivas?",
                                                "opciones": [
                                                            "Garantizar el orden, corregir conductas y mantener la excelencia operativa",
                                                            "Perjudicar personalmente al colaborador",
                                                            "Disminuir los salarios",
                                                            "Eliminar los puestos de trabajo"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 19,
                        "titulo": "19. Portafolio de Productos Alta Densidad",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/19.png",
                        "video_url": null,
                        "contenido": "FRAGANCIAS ALTA DENSIDAD - PORTAFOLIO DE PRODUCTOS:\n\n\"La esencia de lujo a una fracción del precio\"\n\nIniciamos la sección comercial de nuestro portafolio de productos. En Fragancias Alta Densidad nos enfocamos en ofrecer una amplia gama de opciones olfativas desarrolladas con los más altos estándares de calidad y durabilidad.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Qué tema abordamos a partir del módulo 19?",
                                                "opciones": [
                                                            "La presentación del Portafolio de Productos de Fragancias Alta Densidad",
                                                            "Normas de contabilidad fiscal",
                                                            "Instalación de redes de computadores",
                                                            "Capacitación en limpieza de cristales"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Cuál es la promesa que respalda nuestro portafolio comercial?",
                                                "opciones": [
                                                            "Ofrecer la esencia de lujo a una fracción del precio",
                                                            "Vender perfumes de baja duración",
                                                            "Fragancias caras para pocos clientes",
                                                            "Ventas exclusivamente al por mayor fuera del país"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Por qué es importante dominar las líneas que componen nuestro portafolio?",
                                                "opciones": [
                                                            "Para orientar al cliente con precisión y brindarle una experiencia de compra personalizada",
                                                            "No influye en las ventas",
                                                            "Solo para llenar datos en SIIGO",
                                                            "Para vender cualquier producto al azar"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 20,
                        "titulo": "20. Nuestra Línea de Productos",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/20.png",
                        "video_url": null,
                        "contenido": "NUESTRA LÍNEA DE PRODUCTOS COMPRENDE:\n\n1. Perfumería Original.\n2. Perfumería Preparada.\n3. Dickens (Mini perfumes).\n4. Splash Corporal y cuidado complementario.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Cuáles son las 4 categorías principales de productos en nuestro catálogo?",
                                                "opciones": [
                                                            "Perfumería original, perfumería preparada, Dickens y splash corporal",
                                                            "Jabones, champús, cremas de afeitar y desodorantes",
                                                            "Envases de vidrio, tapas, esencias puras y alcohol",
                                                            "Perfumes usados y muestras sin etiqueta"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué permite al asesor conocer la clasificación de los productos?",
                                                "opciones": [
                                                            "Recomendar con claridad la alternativa adecuada para cada gusto y presupuesto",
                                                            "Confundir al cliente en la compra",
                                                            "Imponer la opción más cara sin escuchar",
                                                            "Omitir la atención"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Por qué cada línea satisface una necesidad diferente en tienda?",
                                                "opciones": [
                                                            "Porque abarca desde marcas originales internacionales hasta opciones inspiradas y formatos portátiles",
                                                            "Todas las líneas son exactamente idénticas",
                                                            "Solo cambian las cajas por fuera",
                                                            "No tienen ninguna diferencia"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 21,
                        "titulo": "21. Perfumería Original",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/21.png",
                        "video_url": null,
                        "contenido": "PERFUMERÍA ORIGINAL:\n\nEs aquella que se vende oficialmente desde la casa o marca de dicho perfume. Vienen con sellos de garantía, empaques oficiales de fábrica, lote grabado y total respaldo de autenticidad.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Qué define a la Perfumería Original en nuestro catálogo?",
                                                "opciones": [
                                                            "Fragancias importadas vendidas oficialmente desde su casa o marca de origen",
                                                            "Aromas fabricados artesanalmente en casa",
                                                            "Envases rellenables de segunda mano",
                                                            "Fragancias sin registro comercial"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué garantías acompañan a un perfume original en tienda?",
                                                "opciones": [
                                                            "Sellos de seguridad, caja oficial sellada de fábrica y número de lote grabado",
                                                            "Etiquetas de papel escritas a mano",
                                                            "Empaque abierto sin código",
                                                            "Ninguna garantía"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué busca el cliente al solicitar perfumería original?",
                                                "opciones": [
                                                            "Garantía de marca de lujo internacional, presentación oficial y aroma idéntico al diseñador",
                                                            "Formatos pequeños para bolsillo únicamente",
                                                            "Aromas genéricos de baja fijación",
                                                            "Empaques sin marca"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 22,
                        "titulo": "22. Perfumería Preparada",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/22.png",
                        "video_url": null,
                        "contenido": "PERFUMERÍA PREPARADA:\n\nEs una alternativa creada para quienes buscan disfrutar de fragancias con perfiles olfativos inspirados en las mejores marcas internacionales, con alta concentración de esencias y excelente fijación a precios muy accesibles.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Qué es la Perfumería Preparada de Alta Densidad?",
                                                "opciones": [
                                                            "Una alternativa inspirada con excelente fijación olfativa y costo accesible",
                                                            "Fragancias de baja calidad que duran minutos",
                                                            "Mezclas de agua sin esencias",
                                                            "Rellenos informales sin control"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Cuál es la principal fortaleza para ofrecer la perfumería preparada?",
                                                "opciones": [
                                                            "Alta concentración de esencias, gran fijación en piel y precios muy competitivos",
                                                            "Tener empaques sin etiqueta",
                                                            "Aromas imperceptibles",
                                                            "Venta bajo reserva únicamente"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿A quién se recomienda la perfumería preparada?",
                                                "opciones": [
                                                            "A clientes que desean aromas inspirados de alta gama con gran durabilidad y precio ajustado",
                                                            "Únicamente a niños",
                                                            "A quienes no les gusta usar perfume",
                                                            "Solo para coleccionistas de frascos antiguos"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 23,
                        "titulo": "23. Línea Dickens (Mini Perfumes)",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/23.png",
                        "video_url": null,
                        "contenido": "DICKENS - MINI PERFUMES:\n\nSon mini perfumes prácticos y elegantes, perfectos para llevar en el bolso, bolsillo o viajes, permitiendo tener una primera impresión o probar la fragancia antes de adquirir frascos de mayor volumen.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Qué es la línea Dickens en nuestro catálogo?",
                                                "opciones": [
                                                            "Mini perfumes portátiles ideales para bolsillo, bolso o prueba inicial",
                                                            "Splash de cuerpo de 500ml",
                                                            "Ambientadores de autos únicamente",
                                                            "Jabones líquidos perfumados"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué ventaja ofrece la presentación Dickens al consumidor?",
                                                "opciones": [
                                                            "Facilidad de transporte en el día a día y poder probar aromas a menor inversión",
                                                            "Frascos pesados de vidrio grueso",
                                                            "Uso exclusivo de adorno",
                                                            "Imposibilidad de aplicarse en piel"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿En qué momento sugerir la línea Dickens?",
                                                "opciones": [
                                                            "Para retoque portátil, viajes, obsequios rápidos o prueba previa",
                                                            "Cuando el cliente exige un frasco de 200ml",
                                                            "Solo en ventas corporativas masivas",
                                                            "Únicamente en empaques de regalo grandes"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 24,
                        "titulo": "24. Concentraciones y Colección Niche",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/24.png",
                        "video_url": null,
                        "contenido": "CONCENTRACIONES Y FRAGANCIAS NICHE (EXTRAIT DE PARFUM):\n\nLíneas exclusivas de alta densidad como Oriental Leather, Citrus Amber, Spicy Wood en concentración Extrait de Parfum, caracterizadas por su riqueza olfativa, notas profundas y una fijación extraordinaria.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Qué concentración caracteriza a la línea Niche (Oriental Leather, Citrus Amber, Spicy Wood)?",
                                                "opciones": [
                                                            "Extrait de Parfum (Extracto de perfume de máxima concentración)",
                                                            "Eau de Cologne diluida",
                                                            "Agua perfumada de cuerpo",
                                                            "Esencia pura sin alcohol"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué atributos definen a las fragancias de colección Niche?",
                                                "opciones": [
                                                            "Notas olfativas complejas, alta densidad de esencia y duración muy prolongada",
                                                            "Aromas ligeros que se evaporan rápido",
                                                            "Fragancias genéricas de baja calidad",
                                                            "Aromas imperceptibles"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿A qué perfil de cliente orientar las fragancias Niche Extrait de Parfum?",
                                                "opciones": [
                                                            "A clientes exigentes que valoran aromas intensos, exclusivos y de máxima estela",
                                                            "A personas que buscan aromas muy tenues",
                                                            "Únicamente para aromatizar ropa guardada",
                                                            "Solo para niños"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 25,
                        "titulo": "25. Experiencias de Compra y Portafolio",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/25.png",
                        "video_url": null,
                        "contenido": "EXPERIENCIAS DE COMPRA Y PORTAFOLIO COMPLETO:\n\nEn Fragancias Alta Densidad contamos con un portafolio pensado para ofrecer diferentes opciones y experiencias memorables a nuestros clientes, guiándolos a través de familias olfativas y recomendaciones personalizadas.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Qué busca brindar Alta Densidad a través de su portafolio diversificado?",
                                                "opciones": [
                                                            "Diferentes opciones y experiencias de compra memorables para cada cliente",
                                                            "Una sola opción rígida para todos",
                                                            "Vender bajo presión sin asesoría",
                                                            "Entregar productos al azar"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Cómo se orienta al cliente durante la asesoría olfativa en tienda?",
                                                "opciones": [
                                                            "Guiándolo según familias olfativas, ocasión de uso y gustos personales",
                                                            "Imponiendo la fragancia que más pese",
                                                            "Ofreciendo únicamente la opción más costosa",
                                                            "Sin mostrar probadores"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué actitud debe demostrar el asesor durante la prueba de aromas?",
                                                "opciones": [
                                                            "Paciencia, escucha activa y recomendación experta",
                                                            "Prisa por cerrar la venta",
                                                            "Molestia si el cliente prueba varios probadores",
                                                            "Indiferencia"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 26,
                        "titulo": "26. Liderazgo en SST y Atención al Cliente",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/26.png",
                        "video_url": null,
                        "contenido": "TE PRESENTAMOS A VICTOR MANUEL - LÍDER DE SST Y ATENCIÓN AL CLIENTE:\n\nVictor Manuel lidera la gestión de Seguridad y Salud en el Trabajo (SST) y la estandarización del servicio y atención al cliente en nuestra red de tiendas.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Qué áreas coordina Victor Manuel en la empresa?",
                                                "opciones": [
                                                            "Seguridad y Salud en el Trabajo (SST) y Atención al Cliente",
                                                            "Finanzas y Contabilidad general",
                                                            "Diseño gráfico y empaques exclusivamente",
                                                            "Mantenimiento informático externo"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Por qué es importante la articulación entre SST y la atención al cliente?",
                                                "opciones": [
                                                            "Porque un punto de venta seguro y ordenado facilita brindar un servicio excelente",
                                                            "No tienen ninguna relación",
                                                            "Solo para trámites en papel",
                                                            "Para evitar atender al público"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Ante qué requerimientos puedes solicitar el apoyo de Victor Manuel?",
                                                "opciones": [
                                                            "Normas de seguridad, uso de EPP, prevención de accidentes y protocolos de atención",
                                                            "Pago de nómina personal únicamente",
                                                            "Comisiones bancarias",
                                                            "Trámites de vacaciones exclusivamente"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 27,
                        "titulo": "27. Importancia del Uso de Elementos de Protección (EPP)",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/27.png",
                        "video_url": null,
                        "contenido": "LA IMPORTANCIA DEL USO DE LOS ELEMENTOS DE PROTECCIÓN PERSONAL (EPP):\n\n\"¡Hola equipo! En nuestro día a día rodeados de fragancias, esencias y alcoholes, cuidar nuestra salud es fundamental.\" El uso continuo de los EPP previene irritaciones en piel, ojos y vías respiratorias.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Por qué es vital usar los EPP en el entorno de perfumería?",
                                                "opciones": [
                                                            "Para prevenir irritaciones, derrames y proteger piel, ojos y salud en general",
                                                            "Por simple vanidad estética",
                                                            "Para abrigarse en invierno",
                                                            "No es obligatorio"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Con qué sustancias químicas se interactúa a diario en la tienda?",
                                                "opciones": [
                                                            "Alcoholes, esencias concentradas y fijadores químicos",
                                                            "Agua con azúcar",
                                                            "Harina y polvo de tiza",
                                                            "Aceites de motor pesados"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿De quién es la responsabilidad de portar adecuadamente los EPP?",
                                                "opciones": [
                                                            "De cada colaborador durante su jornada de trabajo",
                                                            "Del cliente que compra",
                                                            "Del transportista externo",
                                                            "Solo del proveedor"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 28,
                        "titulo": "28. ¿Qué es SST? (Seguridad y Salud en el Trabajo)",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/28.png",
                        "video_url": null,
                        "contenido": "¿QUÉ ES SST?\n\nSST significa Seguridad y Salud en el Trabajo. Es el conjunto de normas, medidas y acciones que buscan prevenir accidentes laborales y enfermedades ocupacionales, protegiendo la salud física y mental de todos los trabajadores.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Qué significan las siglas SST?",
                                                "opciones": [
                                                            "Seguridad y Salud en el Trabajo",
                                                            "Servicio y Soporte Técnico",
                                                            "Sistema de Salud Total",
                                                            "Supervisión y Selección de Tiendas"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Cuál es el objetivo primordial de la normativa de SST?",
                                                "opciones": [
                                                            "Prevenir accidentes laborales, enfermedades ocupacionales y proteger a los trabajadores",
                                                            "Aumentar las horas de trabajo sin descanso",
                                                            "Generar cobros extra a los empleados",
                                                            "Reducir la seguridad en instalaciones"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿A quiénes abarca el programa de SST en la empresa?",
                                                "opciones": [
                                                            "A todos los trabajadores, colaboradores y visitantes en el punto de trabajo",
                                                            "Solo a los administradores generales",
                                                            "Únicamente al personal antiguo",
                                                            "A nadie en particular"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 29,
                        "titulo": "29. Riesgos en el Puesto de Trabajo",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/29.png",
                        "video_url": null,
                        "contenido": "RIESGOS EN EL PUESTO DE TRABAJO - ÁREA DE PRODUCTION Y PERFUMERÍA:\n\nIdentificación de riesgos:\n• Riesgos Químicos: Manipulación de alcohol, salpicaduras de esencias e inhalación de vapores.\n• Riesgos Físicos/Ergonómicos: Caídas por derrames de líquidos, cortes con envases de vidrio rotos y postura prolongada de pie.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Cuáles son los riesgos químicos más comunes en el puesto de trabajo?",
                                                "opciones": [
                                                            "Contacto con alcohol, salpicaduras de esencias e inhalación prolongada de vapores",
                                                            "Riesgo de radiación nuclear",
                                                            "Exposición a polvo de carbón",
                                                            "Contacto con grasas mecánicas"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué peligro físico se genera si no se limpia a tiempo un derrame de líquido?",
                                                "opciones": [
                                                            "Resbalones, tropezones y caídas al mismo nivel",
                                                            "Explosión eléctrica masiva",
                                                            "Corte repentino de luz",
                                                            "Ningún peligro"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Cómo prevenir cortes durante la manipulación de frascos de vidrio?",
                                                "opciones": [
                                                            "Manipulando envases con cuidado, usando guantes y manteniendo el área limpia",
                                                            "Lanzando frascos a las cajas",
                                                            "Dejando vidrios rotos en el suelo",
                                                            "Trabajando a oscuras"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 30,
                        "titulo": "30. Elementos de Protección Personal (EPP) en Perfumería",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/30.png",
                        "video_url": null,
                        "contenido": "ELEMENTOS DE PROTECCIÓN PERSONAL (EPP) PARA PERFUMERÍA:\n\n• Guantes de Nitrilo: Protegen las manos de alcoholes y esencias.\n• Gafas de Seguridad: Protegen los ojos de salpicaduras.\n• Mascarilla / Respirador: Evita inhalación de vapores concentrados.\n• Bata / Delantal Resistente: Protege la ropa y piel.\n• Calzado de Seguridad Antideslizante: Reduce riesgo de caídas.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Por qué se utilizan guantes de nitrilo en lugar de otros materiales?",
                                                "opciones": [
                                                            "Porque son resistentes al alcohol, esencias y químicos de perfumería sin degradarse",
                                                            "Porque son de lana caliente",
                                                            "Porque son para frío extremo",
                                                            "Porque sustituyen la bata"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué EPP evita salpicaduras accidentales de líquido en los ojos?",
                                                "opciones": [
                                                            "Gafas de seguridad transparentes",
                                                            "Gafas de sol oscuras",
                                                            "Casco de construcción",
                                                            "Tapa oídos"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué función cumple el calzado antideslizante en tienda?",
                                                "opciones": [
                                                            "Reducir el riesgo de caídas por derrames accidentales de líquidos",
                                                            "Mejorar la velocidad al correr",
                                                            "Hacer juego con el uniforme únicamente",
                                                            "No cumple función de seguridad"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 31,
                        "titulo": "31. Reporte de Accidentes de Trabajo Paso a Paso",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/31.png",
                        "video_url": null,
                        "contenido": "REPORTE DE ACCIDENTES DE TRABAJO - PASO A PASO:\n\n1. Atender al Trabajador: Evaluar estado y dar primeros auxilios.\n2. Controlar el Peligro: Reducir o eliminar el riesgo en el área.\n3. Informar Inmediatamente: Notificar al responsable de SST o jefe directo.\n4. Registrar el Accidente: Diligenciar el formato oficial con fecha, hora y detalles.\n5. Investigar y Aplicar Medidas Correctivas: Determinar causa raíz y prevenir recurrencias.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Cuál es el primer paso inmediato al ocurrir un accidente laboral?",
                                                "opciones": [
                                                            "Atender al trabajador lesionado y brindar primeros auxilios",
                                                            "Tomar fotos para publicar",
                                                            "Ocultar el incidente",
                                                            "Abandonar la tienda"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿A quién se debe notificar inmediatamente tras un accidente?",
                                                "opciones": [
                                                            "Al jefe inmediato, supervisor o responsable de SST",
                                                            "A los clientes de la tienda",
                                                            "A redes sociales",
                                                            "A nadie"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Por qué es indispensable investigar la causa raíz del accidente?",
                                                "opciones": [
                                                            "Para implementar acciones correctivas y evitar que vuelva a suceder",
                                                            "Para buscar culpables y sancionar sin escuchar",
                                                            "Para cerrar la tienda",
                                                            "Es un paso innecesario"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 32,
                        "titulo": "32. ¿Qué es un Plan de Emergencia?",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/32.png",
                        "video_url": null,
                        "contenido": "¿QUÉ ES UN PLAN DE EMERGENCIA?\n\n\"Un plan de emergencia es una guía que indica qué debemos hacer antes, durante y después de una emergencia, con el objetivo de proteger la vida de los trabajadores y clientes, reducir los riesgos y actuar de manera rápida y organizada.\" ",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Cómo se define un Plan de Emergencia?",
                                                "opciones": [
                                                            "Una guía de acciones organizadas antes, durante y después de una emergencia para salvar vidas",
                                                            "Un catálogo de ofertas de temporada",
                                                            "Un manual de compras",
                                                            "Un reporte de ventas mensual"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Cuál es el objetivo prioritario del Plan de Emergencia?",
                                                "opciones": [
                                                            "Proteger la vida de trabajadores y clientes",
                                                            "Salvar mercancía antes que personas",
                                                            "Seguir vendiendo durante un incendio",
                                                            "Ignorar las alarmas"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Cuándo se deben conocer las rutas de evacuación?",
                                                "opciones": [
                                                            "Previamente, antes de que suceda cualquier eventualidad o emergencia",
                                                            "Solo cuando empiece a sonar la alarma",
                                                            "Un mes después",
                                                            "Nunca"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 33,
                        "titulo": "33. Protocolo de Evacuación para Empleados y Clientes",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/33.png",
                        "video_url": null,
                        "contenido": "PLAN DE EMERGENCIA - ¿QUÉ HACER EN UNA EMERGENCIA?\n\n• PARA EMPLEADOS:\n1. Mantén la calma y evalúa la situación.\n2. Informa inmediatamente al responsable o activa la alarma.\n3. Suspende actividades y evacúa por rutas señalizadas.\n4. Dirígete al punto de encuentro externo y reporta novedades.\n\n• PARA CLIENTES:\n1. Mantén la calma y escucha instrucciones.\n2. Evacúa en orden, camina (no corras ni empujes) hacia el punto de encuentro.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Qué debe hacer un empleado al detectar una emergencia grave?",
                                                "opciones": [
                                                            "Mantener la calma, informar inmediatamente y activar la alarma",
                                                            "Gritar y salir corriendo desordenadamente",
                                                            "Encerrarse en el baño",
                                                            "Seguir facturando"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Cómo debe realizarse la evacuación hacia el punto de encuentro?",
                                                "opciones": [
                                                            "Por rutas señalizadas, caminando con orden y sin correr ni empujar",
                                                            "Corriendo a toda velocidad",
                                                            "Devolviéndose por abrigos olvidados",
                                                            "Usando ascensores bloqueados"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Está permitido reingresar al local antes de la autorización del personal de brigada?",
                                                "opciones": [
                                                            "No, bajo ninguna circunstancia hasta que se declare zona segura",
                                                            "Sí, si se olvidó un celular",
                                                            "Sí, para seguir atendiendo",
                                                            "Sí, inmediatamente después de salir"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 34,
                        "titulo": "34. Ejecución y Simulacros del Plan de Emergencia",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/34.png",
                        "video_url": null,
                        "contenido": "¿CÓMO EJECUTAR EL PLAN DE EMERGENCIA?\n\nEl plan de emergencia se ejecuta capacitando a todos los trabajadores, asignando roles, manteniendo despejadas las rutas y salidas, y verificando disponibilidad de extintores, botiquín y kit antiderrames. Se realizan simulacros periódicos para evaluar y mejorar la respuesta.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Cómo se asegura la correcta ejecución del Plan de Emergencia?",
                                                "opciones": [
                                                            "Capacitando al personal, manteniendo señalizaciones y realizando simulacros",
                                                            "Archivando el plan en un cajón sin leerlo",
                                                            "Sin realizar ensayos ni revisiones",
                                                            "Dependiendo solo de bomberos"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Para qué sirven los simulacros de evacuación periódicos?",
                                                "opciones": [
                                                            "Para evaluar tiempos de respuesta, detectar fallas y mejorar la preparación",
                                                            "Para perder tiempo de trabajo",
                                                            "Para asustar a los clientes",
                                                            "No tienen utilidad"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué equipos deben mantenerse siempre listos y despejados?",
                                                "opciones": [
                                                            "Extintores vigentes, botiquines de primeros auxilios y rutas de salida",
                                                            "Cajas de mercancía tapando las salidas",
                                                            "Puertas con candados cerrados",
                                                            "Rutas sin luz"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 35,
                        "titulo": "35. ¿Qué es la Brigada de Emergencia?",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/35.png",
                        "video_url": null,
                        "contenido": "¿QUÉ ES LA BRIGADA DE EMERGENCIA?\n\nLa brigada es un grupo de trabajadores voluntarios, capacitados para actuar y apoyar en situaciones de emergencia dentro de la empresa (incendios, primeros auxilios, evacuación y comunicación).",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Cómo se define la Brigada de Emergencia?",
                                                "opciones": [
                                                            "Grupo de colaboradores capacitados para actuar en prevención, primeros auxilios y evacuación",
                                                            "Un grupo de compras de insumos",
                                                            "Un comité de eventos festivos",
                                                            "Una entidad externa ajena a la tienda"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Cuáles son las ramas principales de la brigada?",
                                                "opciones": [
                                                            "Control de incendios, primeros auxilios, evacuación y comunicación",
                                                            "Ventas al por mayor y mercadeo",
                                                            "Contabilidad e impuestos",
                                                            "Mantenimiento informático"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué actitud se debe asumir frente a los brigadistas en emergencia?",
                                                "opciones": [
                                                            "Seguir sus instrucciones con calma, orden y colaboración inmediata",
                                                            "Discutir sus indicaciones",
                                                            "Ignorar sus avisos",
                                                            "Abandonar la zona sin avisar"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 36,
                        "titulo": "36. ¿Qué es el Comité de Convivencia (COCOLA)?",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/36.png",
                        "video_url": null,
                        "contenido": "¿QUÉ ES EL COMITÉ DE CONVIVENCIA (COCOLA)?\n\nCOCOLA - COMPROMISO CON EL CUIDADO DE LA VIDA:\nEn COCOLA trabajamos por un ambiente seguro, saludable y responsable. Nos comprometemos con el cuidado de las personas, el orden, la limpieza y la prevención de riesgos psicosociales o acoso laboral.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Cuál es la misión principal del Comité COCOLA?",
                                                "opciones": [
                                                            "Promover un clima laboral sano, respetuoso, limpio y libre de acoso laboral",
                                                            "Fijar las metas de ventas mensuales",
                                                            "Revisar los contratos de arrendamiento",
                                                            "Modificar las comisiones de los productos"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué valores destacan en los compromisos COCOLA?",
                                                "opciones": [
                                                            "Compromiso, cuidado de la vida, orden, limpieza y responsabilidad",
                                                            "Desorden e impuntualidad",
                                                            "Conflictos interpersonales",
                                                            "Competencia desleal"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Por qué el cuidado de la seguridad es tarea de todos según COCOLA?",
                                                "opciones": [
                                                            "Porque todos construimos diariamente un entorno de trabajo seguro y saludable",
                                                            "Solo le corresponde al personal de aseo",
                                                            "Es tarea exclusiva de la gerencia",
                                                            "Nadie debe preocuparse"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 37,
                        "titulo": "37. Personal Encargado de la Brigada de Emergencia",
                        "tipo": "video",
                        "imagen_url": "/assets/img/capacitacion/37.png",
                        "video_url": "/assets/img/induccion/video_brigada_emergencia.mp4",
                        "contenido": "PERSONAL ENCARGADO DE LA BRIGADA DE EMERGENCIA:\n\nPresentación de los brigadistas en el punto de venta. Visualiza el video para conocer a los integrantes designados y sus distintivos para saber a quién acudir ante cualquier emergencia médica o conato.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Cómo identificar al personal de la Brigada de Emergencia en la empresa?",
                                                "opciones": [
                                                            "Por sus distintivos oficiales (chalecos, brazaletes o carné de brigadista)",
                                                            "No tienen ninguna identificación",
                                                            "Usan ropa de calle común",
                                                            "Solo por redes sociales"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Por qué es importante conocer a los brigadistas de tu sede?",
                                                "opciones": [
                                                            "Para acudir a ellos de inmediato y acatar su liderazgo en emergencias",
                                                            "Para pedirles permisos de horario",
                                                            "No es relevante conocerlos",
                                                            "Solo para eventos sociales"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué capacitación reciben los brigadistas?",
                                                "opciones": [
                                                            "Entrenamiento en primeros auxilios, control de fuego y evacuación segura",
                                                            "Curso de cocina",
                                                            "Capacitación en ventas internacionales",
                                                            "Sin ninguna formación"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 38,
                        "titulo": "38. Personal Encargado del Comité COCOLA",
                        "tipo": "video",
                        "imagen_url": "/assets/img/capacitacion/38.png",
                        "video_url": "/assets/img/induccion/video_cocola_atencion.mp4",
                        "contenido": "PERSONAL ENCARGADO DEL COMITÉ DE CONVIVENCIA (COCOLA):\n\nPresentación de los representantes encargados de promover un clima laboral sano, respetuoso y prevenir el acoso laboral o diferencias interpersonales. En COCOLA trabajamos con absoluta reserva y confidencialidad.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Bajo qué principio se manejan las solicitudes enviadas a COCOLA?",
                                                "opciones": [
                                                            "Absoluta reserva, confidencialidad e imparcialidad",
                                                            "De forma pública en carteleras",
                                                            "Contándolo a los clientes",
                                                            "En reuniones abiertas de tienda"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿En qué situaciones se debe acudir al Comité COCOLA?",
                                                "opciones": [
                                                            "Ante presuntas conductas de acoso laboral, diferencias de convivencia o sugerencias de bienestar",
                                                            "Para pedir préstamos personales a la empresa",
                                                            "Para pedir productos de muestra gratis",
                                                            "Para reclamos sobre precios al cliente"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Quiénes conforman el Comité de Convivencia COCOLA?",
                                                "opciones": [
                                                            "Representantes elegidos por los colaboradores y representantes designados por la empresa",
                                                            "Personas externas a la organización",
                                                            "Clientes de paso",
                                                            "Proveedores de envases"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 39,
                        "titulo": "39. ¿Qué es la Atención al Cliente?",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/39.png",
                        "video_url": null,
                        "contenido": "¿QUÉ ES LA ATENCIÓN AL CLIENTE?\n\n\"La atención al cliente es el servicio que una empresa brinda para escuchar, orientar y ayudar a sus clientes. Una buena atención debe ser amable, respetuosa, clara y rápida, buscando solucionar las necesidades o problemas del cliente. El objetivo principal es lograr su satisfacción, generar confianza y conseguir que el cliente quiera regresar y recomendar la empresa.\" ",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Cómo se define la atención al cliente en nuestra empresa?",
                                                "opciones": [
                                                            "El servicio para escuchar, orientar y ayudar al cliente resolviendo sus necesidades",
                                                            "Cobrar el mayor valor posible sin asesora",
                                                            "Imponer fragancias sin escuchar",
                                                            "Un trámite telefónico únicamente"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Cuáles son los 4 atributos esenciales de una buena atención?",
                                                "opciones": [
                                                            "Amable, respetuosa, clara y rápida",
                                                            "Indiferente, lenta, confusa y fría",
                                                            "Rígida, costosa, impositiva y exigente",
                                                            "Casual, distorsionada e inconsistente"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Cuál es el objetivo final de brindar una atención excepcional?",
                                                "opciones": [
                                                            "Lograr la satisfacción del cliente, generar confianza y motivar su recomendación",
                                                            "Vender una sola vez y no volver a atenderlo",
                                                            "Reducir el tiempo de permanencia echando al cliente",
                                                            "Evitar preguntas"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 40,
                        "titulo": "40. Atención Adecuada vs Atención Inadecuada",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/40.png",
                        "video_url": "/assets/img/induccion/video_cocola_atencion.mp4",
                        "contenido": "ATENCIÓN ADECUADA VS ATENCIÓN INADECUADA EN PERFUMERÍA:\n\nEjemplo práctico comparativo entre una atención cercana, orientadora y amable frente a una actitud apática, distraída con el celular o desinteresada con el comprador.\n\nLa diferencia está en la empatía y en hacer sentir bienvenido a cada cliente que ingresa a nuestro espacio.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Qué distingue a una atención inadecuada en tienda?",
                                                "opciones": [
                                                            "Actitud apática, brazos cruzados, estar distráido en el celular o desinterés",
                                                            "Saludar con una sonrisa y escuchar atentamente",
                                                            "Explicar las familias olfativas con calma",
                                                            "Ofrecer opciones según el presupuesto"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué genera en el cliente ser atendido de forma empática y adecuada?",
                                                "opciones": [
                                                            "Sensación de acogida, confianza en el producto y fidelidad a la marca",
                                                            "Ganas de salir corriendo",
                                                            "Desconfianza en la empresa",
                                                            "Ningún impacto"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué hacer si un cliente está indeciso entre varios perfumes?",
                                                "opciones": [
                                                            "Escucharlo, asesorarlo en notas olfativas y recomendar con paciencia y amabilidad",
                                                            "Presionarlo para que compre la más cara de inmediato",
                                                            "Ignorarlo y atender a otro",
                                                            "Decirle que todas huelen igual"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 41,
                        "titulo": "41. Imagen y Presentación del Personal",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/41.png",
                        "video_url": null,
                        "contenido": "IMAGEN Y PRESENTACIÓN DEL PERSONAL:\n\nEn nuestra perfumería, la imagen del empleado es muy importante porque representa la empresa. Debemos mantener una presentación personal limpia, ordenada y profesional acompañada de una actitud amable y respetuosa. Al atender al cliente debemos sonreír, escuchar sus necesidades, ofrecer información clara y recomendar las fragancias adecuadas. Una buena imagen y atención generan confianza y hacen que el cliente quiera regresar.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Por qué es fundamental la imagen del empleado en el punto de venta?",
                                                "opciones": [
                                                            "Porque representa la empresa y genera confianza e imagen de marca positiva",
                                                            "No tiene ningún impacto en el cliente",
                                                            "Solo para tomarse fotografías",
                                                            "No influye en las ventas"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué elementos deben acompañar siempre la presentación personal?",
                                                "opciones": [
                                                            "Actitud amable, respetuosa, sonrisa sincera, escucha activa e información clara",
                                                            "Mirada apática y tono cortante",
                                                            "Distracción con el teléfono celular",
                                                            "Impaciencia ante las preguntas"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué consecuencia genera una excelente imagen y atención en el comprador?",
                                                "opciones": [
                                                            "Genera confianza inmediata y motiva al cliente a regresar y recomendar la tienda",
                                                            "Hace que el cliente reclame",
                                                            "Genera prisa por retirarse",
                                                            "Ninguna consecuencia"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 42,
                        "titulo": "42. ¿Cómo debe ser la Imagen Correcta de los Empleados?",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/42.png",
                        "video_url": null,
                        "contenido": "¿CÓMO DEBE SER LA IMAGEN CORRECTA DE LOS EMPLEADOS?\n\n• Presentación personal impecable: Uniforme limpio y bien organizado.\n• Buena actitud: Sonrisa, amabilidad y disposición para ayudar.\n• Higiene personal: Manos limpias, cabello organizado y buena presentación.\n• Aroma personal moderado: Evitar perfumes demasiado fuertes que compitan con las fragancias de la tienda.\n• Contacto visual y lenguaje corporal positivo. Hablar con claridad y respeto.\n• Evitar el celular mientras se atiende al cliente.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Por qué debe usarse un aroma personal moderado en tienda?",
                                                "opciones": [
                                                            "Para evitar perfumes fuertes que compitan o saturen las fragancias de la tienda",
                                                            "Porque está prohibido oler a perfume",
                                                            "Para ahorrar fragancia propia",
                                                            "Sin ninguna razón olfativa"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué hábitos corporales transmiten profesionalismo al atender?",
                                                "opciones": [
                                                            "Contacto visual, lenguaje corporal positivo, sonrisa y lenguaje respetuoso",
                                                            "Brazos cruzados y mirada evasiva",
                                                            "Dar la espalda mientras habla el cliente",
                                                            "Masticar chicle abiertamente"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Cuál es la norma sobre el celular mientras se atiende a un comprador?",
                                                "opciones": [
                                                            "Evitar completamente el uso del celular para dar atención 100% enfocada al cliente",
                                                            "Mirar redes entre pregunta y pregunta",
                                                            "Contestar llamadas personales frente al cliente",
                                                            "Chatear libremente"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 43,
                        "titulo": "43. Guía Visual: Uso Adecuado vs No Adecuado de Imagen",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/43.png",
                        "video_url": null,
                        "contenido": "USO ADECUADO Y NO ADECUADO - IMAGEN Y PRESENTACIÓN PARA CLIENTES:\n\n• USO ADECUADO:\n- Saluda con amabilidad y sonríe. Uniforme limpio y bien planchado.\n- Ambiente limpio, ordenado y profesional.\n- Escucha al cliente, ofrece información clara y recomienda según sus necesidades.\n- Agradece la visita y se despide cordialmente.\n- Resultado: Cliente satisfecho, confianza, fidelización y recomendación.\n\n• USO NO ADECUADO:\n- No saluda ni presta atención. Uniforme sucio o arrugado.\n- Usar el celular mientras atiendes, conversaciones personales, comer o masticar chicle, estar de brazos cruzados.\n- Resultado: Cliente insatisfecho, desconfianza y pérdida de ventas.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Cuáles son prácticas del USO ADECUADO expuestas en este módulo?",
                                                "opciones": [
                                                            "Saludar con amabilidad, uniforme limpio, escuchar atentamente y agradecer la visita",
                                                            "Usar el celular durante la atención",
                                                            "Comer o masticar chicle en el puesto de trabajo",
                                                            "Estar de brazos cruzados ignorando al cliente"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué consecuencias produce el USO NO ADECUADO de la imagen y atención?",
                                                "opciones": [
                                                            "Cliente insatisfecho, desconfianza, pérdida de ventas y mala reputación",
                                                            "Fidelización de clientes",
                                                            "Incremento de propinas",
                                                            "Premios de servicio"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué acciones deben EVITARSE rotundamente en el área de atención?",
                                                "opciones": [
                                                            "Usar el celular, tener conversaciones personales, comer, masticar chicle y cruzarse de brazos",
                                                            "Sonreír y saludar",
                                                            "Explicar las familias olfativas",
                                                            "Mantener limpio el mostrador"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 44,
                        "titulo": "44. Guía de Presentación Personal Mujeres y Hombres",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/44.png",
                        "video_url": null,
                        "contenido": "PRESENTACIÓN PERSONAL EN DETALLE:\n\n• MUJERES:\n- Cabello: Limpio, ordenado y bien cuidado. Recogido si es necesario.\n- Uniforme: Limpio, planchado y completo. Usar uniforme institucional con orgullo.\n- Uñas: Limpias, cortas y cuidadas. Esmaltes en tonos discretos o naturales.\n- Higiene y Aroma: Excelente higiene, aliento fresco y fragancia suave moderada.\n\n• HOMBRES:\n- Cabello: Limpio, corto o bien organizado.\n- Barba: Afeitada o bien recortada y arreglada, limpia y definida.\n- Uniforme: Limpio, planchado y completo.\n- Uñas y Aroma: Limpias, cortas y fragancia discreta.\n\nIMPORTANTE: Evita el uso del celular en atención. No comer ni masticar chicle en área de trabajo. Evita conversaciones personales.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Cómo deben mantenerse las uñas en el personal femenino y masculino?",
                                                "opciones": [
                                                            "Limpias, cortas y cuidadas, con esmaltes en tonos discretos en mujeres",
                                                            "Largas con esmaltes fosforescentes desgastados",
                                                            "Manos sucias sin lavar",
                                                            "Sin ningún estándar de aseo"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Cuál es la recomendación sobre el cuidado de la barba en los hombres?",
                                                "opciones": [
                                                            "Debe estar afeitada o bien recortada, limpia y definida",
                                                            "Larga y desordenada sin arreglar",
                                                            "Con residuos",
                                                            "Sin peinar"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Cómo debe lucir el uniforme institucional diariamente en ambos casos?",
                                                "opciones": [
                                                            "Limpio, planchado, completo y portado con orgullo",
                                                            "Arrugado y manchado",
                                                            "Incompleto sin la prenda oficial",
                                                            "Modificado sin autorización"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 45,
                        "titulo": "45. Facturación y Métodos de Pago - Introducción",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/45.png",
                        "video_url": null,
                        "contenido": "FACTURACIÓN Y MÉTODOS DE PAGO:\n\n\"Cada venta que realizamos representa un compromiso tanto con nuestro cliente como con nuestra empresa. Por eso, es importante que todos los colaboradores conozcan, aunque no pertenezcan directamente al área de facturación, cómo se desarrolla una venta, qué medios de pago manejamos y qué hacer cuando se presenta alguna novedad.\"\n\n\"¿Qué creen que puede pasar si una venta se registra incorrectamente?\" Genera descuadres de caja, inconsistencias de inventario y problemas contables.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Por qué es fundamental que todos los colaboradores conozcan el proceso de venta?",
                                                "opciones": [
                                                            "Porque cada venta representa un compromiso legal, contable y de servicio con cliente y empresa",
                                                            "Solo le interesa al área contable externa",
                                                            "No tiene impacto en la tienda",
                                                            "Para cobros informales"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué problemas causa registrar incorrectamente una venta?",
                                                "opciones": [
                                                            "Descuadres de caja, inconsistencias en inventario y fallas contables",
                                                            "Ningún problema",
                                                            "Mayor ganancia",
                                                            "Premios de facturación"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué responsabilidad asume el colaborador al procesar un cobro?",
                                                "opciones": [
                                                            "Garantizar el registro exacto de productos, valores y método de pago ingresado",
                                                            "Cobrar sin emitir comprobante",
                                                            "Entregar mercancía sin registrar",
                                                            "Modificar precios a su criterio"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 46,
                        "titulo": "46. Facturación: ¿Cómo funciona el proceso?",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/46.png",
                        "video_url": null,
                        "contenido": "FACTURACIÓN - ¿CÓMO FUNCIONA?\n\nEn nuestra empresa, la facturación permite registrar y respaldar cada venta, garantizando transparencia, control y confianza en cada compra:\n\n01. COMPRA: El cliente selecciona sus productos.\n02. REGISTRO: Se registra la venta y sus datos.\n03. FACTURACIÓN: Se genera la factura electrónica.\n04. PAGO: El cliente elige su método de pago.\n05. ENTREGA: Se confirma la compra y se entrega el producto.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Cuáles son las 5 etapas ordenadas del proceso de facturación?",
                                                "opciones": [
                                                            "01. Compra, 02. Registro, 03. Facturación, 04. Pago, 05. Entrega",
                                                            "01. Pago, 02. Entrega, 03. Registro, 04. Compra, 05. Facturación",
                                                            "Entrega sin registro ni pago",
                                                            "Registro únicamente"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué asegura el cumplimiento riguroso de estas 5 etapas?",
                                                "opciones": [
                                                            "Transparencia, control de inventario y confianza del cliente en la compra",
                                                            "Descuadres de stock",
                                                            "Perdida de datos",
                                                            "Retrasos injustificados"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿En qué momento se efectúa la entrega formal del producto empacado?",
                                                "opciones": [
                                                            "Tras la confirmación del registro, factura y pago verificado",
                                                            "Antes de registrar la compra",
                                                            "Sin revisar el pago",
                                                            "Al ingresar el cliente"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 47,
                        "titulo": "47. Facturación por Medio de SIIGO",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/47.png",
                        "video_url": null,
                        "contenido": "FACTURACIÓN POR MEDIO DE SIIGO:\n\n¿Qué es SIIGO y por qué nos afecta a todos?\n• SIIGO es el sistema oficial donde se registran todas las ventas, productos y pagos de la empresa.\n• Aunque no trabajes directamente en contabilidad, tu venta llega a SIIGO.\n• Lo que se registra mal en SIIGO = Problemas para todos después.\n• Sirve para: Controlar inventario, saber cuánto vendimos, declarar impuestos y llevar la contabilidad.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Qué es el sistema SIIGO en la empresa?",
                                                "opciones": [
                                                            "El sistema oficial donde se registran todas las ventas, productos, pagos e inventarios",
                                                            "Una red social corporativa",
                                                            "Un catálogo digital de fotos",
                                                            "Un correo personal"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Por qué un error en SIIGO afecta a todo el equipo?",
                                                "opciones": [
                                                            "Porque descuadra el inventario en tiempo real, la contabilidad y los impuestos de la empresa",
                                                            "No afecta a nadie",
                                                            "Solo afecta a los clientes",
                                                            "Únicamente a la plataforma"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué procesos clave administra el sistema SIIGO?",
                                                "opciones": [
                                                            "Control de inventario, registro de ventas, emisión de factura electrónica e impuestos",
                                                            "Diseño de logotipos",
                                                            "Reproducción de videos",
                                                            "Reserva de vuelos"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 48,
                        "titulo": "48. Registro de Venta Paso a Paso en SIIGO",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/48.png",
                        "video_url": null,
                        "contenido": "SISTEMA SIIGO - REGISTRO DE VENTA PASO A PASO:\n\n01. Datos del Cliente: Nombre completo, número de identificación, correo y teléfono.\n02. Producto: Se selecciona el producto y cantidad correcta.\n03. Método de Pago: Se indica claramente cómo pagó (Efectivo, Nequi, Tarjeta, etc.).\n04. Generar Factura: Se emite y se envía al cliente por correo.\n05. Confirmar: Queda registrado en el sistema y se actualiza el inventario.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Qué datos del cliente son obligatorios al registrar la venta en SIIGO?",
                                                "opciones": [
                                                            "Nombre completo, número de identificación, correo electrónico y teléfono",
                                                            "Solo el primer nombre",
                                                            "Pseudónimo casual",
                                                            "Ningún dato"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué debe verificarse en el paso 02 al seleccionar el producto?",
                                                "opciones": [
                                                            "Seleccionar la referencia exacta del producto y la cantidad correcta comprada",
                                                            "Cualquier producto al azar",
                                                            "Ingresar valores arbitrarios",
                                                            "No seleccionar producto"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué ocurre en el sistema al completar la confirmación de la factura?",
                                                "opciones": [
                                                            "La venta queda grabada y el inventario de stock se actualiza automáticamente",
                                                            "Se borra la venta",
                                                            "Se apaga el computador",
                                                            "Se cancela el recibo"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 49,
                        "titulo": "49. Métodos de Pago Disponibles",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/49.png",
                        "video_url": null,
                        "contenido": "MÉTODOS DE PAGO DISPONIBLES EN TIENDA:\n\n• PAGO TRADICIONAL:\n- Efectivo.\n- Tarjeta Débito.\n- Tarjeta Crédito.\n\n• PAGO DIGITAL:\n- Nequi.\n- Daviplata.\n- Transferencias.\n- Código QR.\n\n• FINANCIACIÓN:\n- Sistecrédito.\n- Addi.\n- Otras plataformas habilitadas por la empresa.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Cuáles son las 3 categorías principales de medios de pago en la empresa?",
                                                "opciones": [
                                                            "Pago Tradicional, Pago Digital y Financiación",
                                                            "Solo billetes en efectivo",
                                                            "Únicamente cheques de gerencia",
                                                            "Fiados verbales"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué opciones integran la categoría de Pago Digital?",
                                                "opciones": [
                                                            "Nequi, Daviplata, transferencias bancarias y código QR",
                                                            "Monedas antiguas",
                                                            "Billetes de papel",
                                                            "Títulos valores de papel"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué alternativas de Financiación a crédito están autorizadas?",
                                                "opciones": [
                                                            "Sistecrédito, Addi y plataformas oficiales habilitadas",
                                                            "Prestamos informales de terceros",
                                                            "Tarjetas de regalo no válidas",
                                                            "Ninguna"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 50,
                        "titulo": "50. Protocolo de Pago Tradicional",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/50.png",
                        "video_url": null,
                        "contenido": "PAGO TRADICIONAL (EFECTIVO Y TARJETAS):\n\nMÉTODOS DE PAGO - PAGO TRADICIONAL:\n• Efectivo: Contar el dinero frente al cliente, comprobar autenticidad de billetes y dar cambio exacto.\n• Tarjetas (Débito / Crédito): Procesar en datáfono oficial y validar estado APROBADO antes de entregar mercancía.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Qué norma rige al recibir pago en dinero en efectivo?",
                                                "opciones": [
                                                            "Contar el dinero frente al cliente y comprobar la autenticidad de billetes",
                                                            "Guardarlo en el bolsillo sin contar",
                                                            "Sin revisar billetes",
                                                            "Entregar cambio sin contar"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué verificación en datáfono se debe confirmar antes de entregar la compra?",
                                                "opciones": [
                                                            "Que el voucher o pantalla confirme el estado APROBADO",
                                                            "Entregar el producto si sale RECHAZADO",
                                                            "No usar datáfono",
                                                            "Apagar el equipo"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué recibo debe entregarse siempre al cliente en pago tradicional?",
                                                "opciones": [
                                                            "Factura o comprobante oficial impreso o digital",
                                                            "Un papel sin valor",
                                                            "Ningún comprobante",
                                                            "Una tarjeta casual"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 51,
                        "titulo": "51. Protocolo de Pago Digital",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/51.png",
                        "video_url": null,
                        "contenido": "PAGO DIGITAL (NEQUI / DAVIPLATA / QR):\n\nVerificar la llegada efectiva de los fondos a la cuenta oficial del punto o plataforma administrativa antes de entregar los productos. No confiarse únicamente de capturas de pantalla dudosas de terceros.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Cuál es la regla obligatoria antes de entregar mercancía en pago digital?",
                                                "opciones": [
                                                            "Verificar la llegada del dinero en la cuenta oficial del punto o plataforma administrativa",
                                                            "Entregar el producto con solo ver una foto borrosa",
                                                            "No revisar la cuenta",
                                                            "Confiar sin verificación"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué medios digitales forman parte del protocolo de pago digital?",
                                                "opciones": [
                                                            "Nequi, Daviplata, transferencias bancarias y código QR",
                                                            "Billetes de papel físicos",
                                                            "Cheques manuales",
                                                            "Pagares"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Por qué es crucial verificar la acreditación real en la cuenta?",
                                                "opciones": [
                                                            "Para prevenir fraudes con capturas de pantalla falsas y proteger los recursos",
                                                            "No hay ningún riesgo",
                                                            "Solo por perder tiempo",
                                                            "Porque el sistema se bloquea"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 52,
                        "titulo": "52. Financiación y Pago a Crédito",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/52.png",
                        "video_url": null,
                        "contenido": "FINANCIACIÓN Y PAGO A CRÉDITO (SISTECRÉDITO / ADDI):\n\nValidar la identidad del cliente, número de cédula y código de aprobación o token OTP directamente en la plataforma habilitada por la entidad financiera antes de autorizar la salida del producto.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Cómo se valida una transacción por Sistecrédito o Addi en tienda?",
                                                "opciones": [
                                                            "Verificando la cédula del cliente y el código OTP/aprobación en la plataforma oficial",
                                                            "Firmando una servilleta",
                                                            "Sin consultar la plataforma",
                                                            "Tomando una foto casual"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué plataformas de crédito manejamos para financiación de clientes?",
                                                "opciones": [
                                                            "Sistecrédito, Addi y plataformas aliadas oficiales",
                                                            "Préstamos informales",
                                                            "Fiados verbales sin registro",
                                                            "Ninguna"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué se requiere para completar la entrega en un pago a crédito?",
                                                "opciones": [
                                                            "Confirmar el estado de APROBADO en el portal de la entidad de crédito",
                                                            "Entregar la mercancía en estado PENDIENTE",
                                                            "No ingresar al portal",
                                                            "Ignorar la validación"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 53,
                        "titulo": "53. Evaluación Final y Culminación",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/53.png",
                        "video_url": null,
                        "contenido": "EVALUACIÓN Y CULMINACIÓN DEL PROCESO:\n\n¡FELICITACIONES!\n\nHas completado satisfactoriamente el recorrido por los 53 módulos de Inducción Institucional y Capacitación Operativa de Fragancias Alta Densidad.\n\nEstás listo(a) para presentar el Examen Final Obligatorio para habilitar tu acceso definitivo.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Qué logro alcanzaste al llegar a este módulo?",
                                                "opciones": [
                                                            "Completar satisfactoriamente los 53 módulos de Inducción y Capacitación de la empresa",
                                                            "Terminar la secundaria",
                                                            "Comprar una franquicia",
                                                            "Ninguno"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué paso corresponde realizar a continuación?",
                                                "opciones": [
                                                            "Presentar el Examen Final Obligatorio para habilitar tu autorización laboral",
                                                            "Retirarte de la empresa",
                                                            "Reiniciar la capacitación desde cero",
                                                            "Esperar un año"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Por qué es clave haber comprendido cada uno de los 53 módulos?",
                                                "opciones": [
                                                            "Porque aseguran tu excelencia, seguridad y éxito profesional en Fragancias Alta Densidad",
                                                            "Es solo un trámite sin impacto real",
                                                            "Para memorizar números sin aplicar",
                                                            "No tiene relevancia"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            }
];

        // Desactivar items antiguos con orden superior a los 53 nuevos
        await pool.query('UPDATE CapacitacionItems SET activo = 0 WHERE orden > ?', [modulos.length]);

        for (let mod of modulos) {
            const [rows] = await pool.query('SELECT id FROM CapacitacionItems WHERE orden = ?', [mod.orden]);
            let itemId;
            if (rows.length > 0) {
                itemId = rows[0].id;
                await pool.query(
                    'UPDATE CapacitacionItems SET titulo = ?, contenido = ?, tipo = ?, imagen_url = ?, video_url = ?, orden = ?, activo = 1 WHERE id = ?',
                    [mod.titulo, mod.contenido, mod.tipo, mod.imagen_url, mod.video_url, mod.orden, itemId]
                );
            } else {
                const [ins] = await pool.query(
                    'INSERT INTO CapacitacionItems (titulo, contenido, tipo, imagen_url, video_url, orden, activo) VALUES (?, ?, ?, ?, ?, ?, 1)',
                    [mod.titulo, mod.contenido, mod.tipo, mod.imagen_url, mod.video_url, mod.orden]
                );
                itemId = ins.insertId;
            }

            await pool.query('DELETE FROM CapacitacionPreguntas WHERE item_id = ?', [itemId]);
            for (let idx = 0; idx < mod.preguntas.length; idx++) {
                const p = mod.preguntas[idx];
                await pool.query(
                    'INSERT INTO CapacitacionPreguntas (item_id, pregunta, opciones, respuesta_correcta, orden) VALUES (?, ?, ?, ?, ?)',
                    [itemId, p.pregunta, JSON.stringify(p.opciones), p.respuesta_correcta, idx + 1]
                );
            }
        }

        console.log(`--- Siembra de Capacitación Finalizada con Éxito (${modulos.length} Módulos Procesados) ---`);
        if (require.main === module) {
            process.exit(0);
        }
    } catch (err) {
        console.error('Error en seedCapacitacion:', err);
        if (require.main === module) {
            process.exit(1);
        }
    }
}

if (require.main === module) {
    seedCapacitacion();
}

module.exports = seedCapacitacion;
