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
                        "preguntas": [
                                    {
                                                "pregunta": "¿Cuál es el eslogan corporativo de la marca?",
                                                "opciones": [
                                                            "La esencia de lujo a una fracción del precio",
                                                            "Perfumes costosos para pocos",
                                                            "Ventas al por mayor exclusivamente",
                                                            "Fragancias sin garantía"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Cuál es la promesa principal hacia los clientes?",
                                                "opciones": [
                                                            "Ofrecer fragancias de alta calidad y fijación a precios justos y competitivos",
                                                            "Vender perfumes de baja duración",
                                                            "Cerrar tiendas físicas",
                                                            "Reducir la variedad de aromas"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué atributos destacan en nuestra propuesta de valor?",
                                                "opciones": [
                                                            "Calidad de esencias, empaques elegantes, precios accesibles y atención cercana",
                                                            "Impersonalidad y desorden",
                                                            "Precios elevados sin garantía",
                                                            "Atención apática"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
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
                        "titulo": "12. Cumplimiento del Horario y Apertura de Tienda",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/12.png",
                        "video_url": null,
                        "contenido": "DEBERES DEL COLABORADOR RESPECTO AL HORARIO:\n\n1. Respetar el horario establecido (10:00 A.M. a 6:00 P.M.).\n2. Llegar con anticipación (10 a 15 minutos antes) para la apertura adecuada del punto de venta.\n3. Registrar la asistencia y el marcado de turnos según el procedimiento indicado por la empresa.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Con cuánta anticipación debe llegar el colaborador antes del inicio del turno?",
                                                "opciones": [
                                                            "5 minutos después",
                                                            "10 a 15 minutos antes",
                                                            "30 minutos después",
                                                            "En el momento exacto sin margen de preparación"
                                                ],
                                                "respuesta_correcta": 1
                                    },
                                    {
                                                "pregunta": "¿Por qué se requiere llegar de 10 a 15 minutos antes?",
                                                "opciones": [
                                                            "Para preparar la apertura del punto, verificar vitrinas, luces y caja",
                                                            "Para atender ventas informales afuera",
                                                            "No hay razón específica",
                                                            "Para retirarse temprano"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Cómo debe registrarse la asistencia diaria?",
                                                "opciones": [
                                                            "Según el procedimiento oficial indicado por la empresa (biométrico o sistema)",
                                                            "No es necesario registrar asistencia",
                                                            "Mediante mensajes a redes personales",
                                                            "Solo al final del mes"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 13,
                        "titulo": "13. Puntualidad, Asistencia e Imprevistos",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/13.png",
                        "video_url": null,
                        "contenido": "PUNTUALIDAD Y ASISTENCIA:\n\n• Llegar a tiempo en todos los turnos asignados.\n• En caso de fuerza mayor o imprevisto, informar con la mayor anticipación posible a la administración.\n• Las tardanzas e inasistencias no justificadas podrán generar llamadas de atención disciplinarias según el reglamento interno.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Qué debes hacer en caso de un imprevisto o fuerza mayor que impida llegar a tiempo?",
                                                "opciones": [
                                                            "Informar con la mayor anticipación posible a la administración",
                                                            "No avisar y llegar cuando sea posible",
                                                            "Esperar al siguiente día para justificar",
                                                            "Pedirle a un cliente que avise"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué consecuencia pueden generar las tardanzas no justificadas reincidentes?",
                                                "opciones": [
                                                            "Llamados de atención disciplinarios según el Reglamento Interno",
                                                            "Aumento de sueldo",
                                                            "Permisos adicionales",
                                                            "Felicite por escrito"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué representa la puntualidad en el equipo de Alta Densidad?",
                                                "opciones": [
                                                            "Respeto por los clientes, compañeros y compromiso con el trabajo",
                                                            "Una exigencia innecesaria",
                                                            "Un tema opcional sin impacto",
                                                            "Un trámite de poca importancia"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 14,
                        "titulo": "14. Presentación Personal y Código de Vestimenta",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/14.png",
                        "video_url": null,
                        "contenido": "PRESENTACIÓN PERSONAL Y VESTIMENTA DEL LÍDER DE PUNTO:\n\nPortar la vestimenta adecuada definida por la empresa:\n• Pantalón negro institucional de vestir.\n• Blusa o camisa blanca impecable.\n• Calzado cómodo y adecuado (preferiblemente negro y cerrado).\n• Presentación personal impecable, cuidando la higiene personal y el orden.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Cuál es el código de vestimenta oficial para el Líder de Punto?",
                                                "opciones": [
                                                            "Pantalón negro, camisa/blusa blanca y calzado cómodo cerrado negro",
                                                            "Ropa deportiva de cualquier color",
                                                            "Camiseta roja y Jean desgastado",
                                                            "Vestuario libre sin restricción"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Cómo debe ser el calzado utilizado durante la jornada laboral?",
                                                "opciones": [
                                                            "Cómodo, adecuado, preferiblemente negro y cerrado",
                                                            "Sandalias abiertas de playa",
                                                            "Zapatos de tacón alto incómodos",
                                                            "Tenis deportivos de colores fosforescentes"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Por qué se exige una presentación impecable en el punto de venta?",
                                                "opciones": [
                                                            "Porque el colaborador refleja la imagen, elegancia y profesionalismo de la marca",
                                                            "Solo para fotos de publicidad",
                                                            "Para cumplir con la fábrica de telas",
                                                            "No tiene impacto en las ventas"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 15,
                        "titulo": "15. Manejo y Confidencialidad de la Información",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/15.png",
                        "video_url": null,
                        "contenido": "MANEJO Y CONFIDENCIALIDAD DE LA INFORMACIÓN PROPRIETARIA:\n\nSe considera información reservada y confidencial de la empresa:\n• Recetas, proporciones y fórmulas de preparación de perfumería.\n• Concentraciones de esencias y secretos comerciales.\n• Cifras de ventas, datos de clientes y procesos internos del punto.\n• Mantener estricta reserva de las claves de acceso a los sistemas informáticos.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Qué información se considera estrictamente confidencial en Alta Densidad?",
                                                "opciones": [
                                                            "Recetas, fórmulas, proporciones de esencias, ventas, clientes y claves de acceso",
                                                            "La dirección de la tienda únicamente",
                                                            "El nombre comercial de la marca",
                                                            "El catálogo de precios público"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Está permitido compartir datos de ventas o clientes con personas externas?",
                                                "opciones": [
                                                            "No, está rotundamente prohibido por la política de confidencialidad",
                                                            "Sí, a cualquier amigo en redes sociales",
                                                            "Solo si pagan por la información",
                                                            "Sí, no hay restricción alguna"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Cómo deben manejarse las claves de acceso a sistemas y dispositivos?",
                                                "opciones": [
                                                            "Con estricta reserva y uso personal e intransferible",
                                                            "Anotadas en un papel pegado al mostrador",
                                                            "Compartiéndolas con los clientes",
                                                            "Enviándolas por chat público"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 16,
                        "titulo": "16. Cuidado y Liderazgo en el Punto de Venta",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/16.png",
                        "video_url": null,
                        "contenido": "CUIDADO Y LIDERAZGO EN EL PUNTO DE VENTA:\n\n• Supervisar el estado general del punto de venta (limpieza, orden, exhibición impecable).\n• Fomentar un ambiente de trabajo respetuoso, cordial y colaborativo.\n• Atender a los clientes con amabilidad, respeto y alto profesionalismo.\n• Reportar cualquier anomalía de infraestructura o stock al área correspondiente.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Cuáles son las responsabilidades clave del Líder de Punto en la tienda?",
                                                "opciones": [
                                                            "Supervisar limpieza, exhibición, fomentar respeto y brindar excelente atención",
                                                            "Ignorar las vitrinas y delegar todo",
                                                            "Atender únicamente cuando la tienda esté llena",
                                                            "Realizar compras personales durante la jornada"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué tipo de ambiente laboral debe promover el Líder de Punto?",
                                                "opciones": [
                                                            "Respetuoso, cordial y colaborativo",
                                                            "Hostil y competitivo",
                                                            "Indiferente y desorganizado",
                                                            "De desconfianza"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué debes hacer al detectar una falla en infraestructura o falta de insumos?",
                                                "opciones": [
                                                            "Reportarla oportunamente al área correspondiente para su gestión",
                                                            "Guardar silencio y esperar a que alguien lo note",
                                                            "Intentar vender menos",
                                                            "Dejar la tienda sola"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 17,
                        "titulo": "17. Uso de Redes Sociales y Dispositivos Móviles",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/17.png",
                        "video_url": null,
                        "contenido": "USO ADECUADO DE REDES SOCIALES Y CELULAR:\n\n• Uso del teléfono celular únicamente para temas laborales del punto de venta.\n• Queda prohibido el uso personal del celular (chats personales, juegos, videos) durante la atención a clientes.\n• Manejar las redes sociales personales con responsabilidad, protegiendo siempre la reputación de la empresa.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿En qué momentos está permitido el uso del celular en el punto de venta?",
                                                "opciones": [
                                                            "Únicamente para requerimientos y temas laborales del punto",
                                                            "Para chatear libremente con amigos mientras se atiende",
                                                            "Para ver películas en el mostrador",
                                                            "En todo momento sin límite"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Por qué se prohíbe el uso personal del celular durante la atención al cliente?",
                                                "opciones": [
                                                            "Porque distrae la atención, transmite falta de respeto y deteriora el servicio",
                                                            "Para ahorrar batería del teléfono",
                                                            "Solo por capricho del administrador",
                                                            "No influye en el cliente"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Cómo deben manejarse las redes sociales personales respecto a la marca?",
                                                "opciones": [
                                                            "De manera responsable, sin publicar contenidos que comprometan la imagen corporativa",
                                                            "Publicando secretos de la empresa",
                                                            "Haciendo comentarios despectivos",
                                                            "No se requiere ninguna prudencia"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 18,
                        "titulo": "18. Uso de Recursos de la Empresa",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/18.png",
                        "video_url": null,
                        "contenido": "USO DE ELEMENTOS Y RECURSOS DE LA EMPRESA:\n\n• Hacer uso exclusivo autorizado de los insumos, probadores, muestras y herramientas de trabajo.\n• Evitar el desperdicio de materia prima, fragancias en exhibición o empaques.\n• Cuidar los equipos tecnológicos, registradoras y mobiliario del punto de venta.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Cuál es la norma sobre el uso de insumos, probadores y materias primas?",
                                                "opciones": [
                                                            "Hacer uso exclusivo autorizado y evitar cualquier desperdicio de producto",
                                                            "Regalarlos a amigos sin autorización",
                                                            "Usarlos para consumo personal ilimitado",
                                                            "Tirarlos a la basura si no gustan"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué actitud se exige frente al cuidado de los equipos tecnológicos del punto?",
                                                "opciones": [
                                                            "Responsabilidad, cuidado y reporte de fallas oportuno",
                                                            "Negligencia y falta de aseo",
                                                            "Dejar los equipos encendidos sin protección",
                                                            "Usarlos para descargas personales"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Por qué es importante evitar el desperdicio en tienda?",
                                                "opciones": [
                                                            "Para optimizar recursos, controlar costos y garantizar stock suficiente para clientes",
                                                            "No afecta la economía de la tienda",
                                                            "Solo para ahorrar luz",
                                                            "Para limitar las muestras"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 19,
                        "titulo": "19. Incumplimiento y Sanciones Disciplinarias",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/19.png",
                        "video_url": null,
                        "contenido": "INCUMPLIMIENTO Y SANCIONES:\n\nEl no cumplimiento de las disposiciones de este reglamento podrá generar:\n• Llamado de atención verbal registrado.\n• Llamado de atención escrito con copia a la hoja de vida.\n• Sanciones disciplinarias según el Reglamento Interno General de Trabajo y la ley laboral vigente.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Qué medidas disciplinarias contempla el reglamento ante faltas de cumplimiento?",
                                                "opciones": [
                                                            "Llamado de atención verbal, escrito y sanciones según el Reglamento Interno",
                                                            "Ninguna consecuencia",
                                                            "Incentivos económicos",
                                                            "Descuentos arbitrarios directos"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué sucede tras un llamado de atención escrito?",
                                                "opciones": [
                                                            "Se anexa copia a la hoja de vida del colaborador para seguimiento formal",
                                                            "Se borra al día siguiente",
                                                            "No tiene validez",
                                                            "Se publica en redes sociales"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Cuál es el objetivo final de las medidas correctivas en la empresa?",
                                                "opciones": [
                                                            "Corregir conductas, mantener la disciplina y proteger la excelencia operativa",
                                                            "Castigar de forma personal",
                                                            "Perjudicar al trabajador",
                                                            "Reducir la nómina"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 20,
                        "titulo": "20. Portafolio de Productos Alta Densidad",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/20.png",
                        "video_url": null,
                        "contenido": "PORTAFOLIO DE PRODUCTOS:\n\n\"La esencia de lujo a una fracción del precio\"\n\nIniciamos la sección dedicada a nuestro portafolio de productos. En Fragancias Alta Densidad ofrecemos una oferta diversa y bien definida para satisfacer los gustos y presupuestos de cada cliente que visita nuestras tiendas.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Qué sección del aprendizaje iniciamos a partir de este módulo?",
                                                "opciones": [
                                                            "El conocimiento detallado del Portafolio de Productos de la empresa",
                                                            "La historia de la perfumería antigua únicamente",
                                                            "Procedimientos de contabilidad internacional",
                                                            "Clases de química avanzada"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Cuál es el propósito de contar con un portafolio de productos diversificado?",
                                                "opciones": [
                                                            "Satisfacer diferentes gustos, necesidades olfativas y presupuestos de los clientes",
                                                            "Confundir al comprador",
                                                            "Tener productos sin vender",
                                                            "Tener una sola opción de aroma"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué valores destacan en la oferta comercial de Alta Densidad?",
                                                "opciones": [
                                                            "Alta calidad, variedad de fragancias, excelente fijación y precios competitivos",
                                                            "Baja duración y empaques genéricos",
                                                            "Precios elevados sin asesoría",
                                                            "Poca disponibilidad de inventario"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 21,
                        "titulo": "21. Nuestra Línea de Productos",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/21.png",
                        "video_url": null,
                        "contenido": "NUESTRA LÍNEA DE PRODUCTOS COMPRENDE:\n\n1. Perfumería Original (Sellada de marca internacional).\n2. Perfumería Preparada (Formatos inspirados de alta concentración).\n3. Dickens (Mini perfumes prácticos de bolsillo).\n4. Splash Corporal y Líneas Complementarias.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Cuáles son las cuatro líneas principales de producto que comercializamos?",
                                                "opciones": [
                                                            "Perfumería original, perfumería preparada, Dickens y splash corporal",
                                                            "Jabones de barra, detergentes, desodorantes y cremas",
                                                            "Aceites industriales, envases vacíos, tapas y cajas",
                                                            "Perfumes usados y de segunda mano"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué permite al asesor conocer detalladamente cada línea de producto?",
                                                "opciones": [
                                                            "Recomendar con precisión la opción ideal para las necesidades del cliente",
                                                            "Aumentar el tiempo de espera en tienda",
                                                            "Vender solo el producto más caro",
                                                            "Omitir la explicación de fragancias"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Por qué es importante dominar las diferencias entre las líneas comercializadas?",
                                                "opciones": [
                                                            "Para brindar información transparente y generar confianza durante la venta",
                                                            "Para no responder preguntas",
                                                            "No es relevante para el asesor",
                                                            "Solo importa facturar sin asesorar"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 22,
                        "titulo": "22. Perfumería Original",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/22.png",
                        "video_url": null,
                        "contenido": "PERFUMERÍA ORIGINAL:\n\nEs aquella fragancia importada que se distribuye oficialmente desde la casa o marca de origen. Vienen con sellos de seguridad, frascos distintivos, empaques sellados de fábrica, número de lote y garantía total de autenticidad.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Qué define a la Perfumería Original en nuestro catálogo?",
                                                "opciones": [
                                                            "Fragancias importadas selladas oficialmente desde las casas de origen",
                                                            "Aromas elaborados de forma casera",
                                                            "Envases rellenables de segunda mano",
                                                            "Perfumes sin marca registrada"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué elementos garantizan la autenticidad de un perfume original?",
                                                "opciones": [
                                                            "Sellos de seguridad, caja sellada de fábrica, frasco oficial y número de lote",
                                                            "Etiquetas hechas a mano",
                                                            "Ausencia de empaque",
                                                            "Código borrado"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿A qué público se orienta principalmente la perfumería original?",
                                                "opciones": [
                                                            "A clientes que buscan marcas reconocidas internacionales y presentaciones exclusivas",
                                                            "A personas que buscan fragancias en miniatura solamente",
                                                            "A laboratorios de prueba",
                                                            "Únicamente a coleccionistas antiguos"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 23,
                        "titulo": "23. Perfumería Preparada",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/23.png",
                        "video_url": null,
                        "contenido": "PERFUMERÍA PREPARADA:\n\nEs una alternativa creada para quienes buscan disfrutar de fragancias inspiradas en las mejores tendencias mundiales con perfiles olfativos similares, alta concentración de esencias y durabilidad prolongada en la piel a un precio sumamente accesible.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Qué caracteriza a la Perfumería Preparada de Alta Densidad?",
                                                "opciones": [
                                                            "Formulación inspirada de alta fijación olfativa a un precio accesible",
                                                            "Fragancias de baja duración que desaparecen rápido",
                                                            "Copias ilegales sin estándar",
                                                            "Mezclas de agua sin esencia"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Cuál es la principal ventaja para el consumidor al adquirir perfumería preparada?",
                                                "opciones": [
                                                            "Disfrutar de aromas exquisitos con excelente durabilidad y menor costo",
                                                            "No tener fragancia visible",
                                                            "Tener que retocar cada 5 minutos",
                                                            "Tener empaques sin etiqueta"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué ingrediente clave garantiza la fijación en la perfumería preparada?",
                                                "opciones": [
                                                            "Esencias importadas de alta concentración y alcohol refinado de calidad",
                                                            "Aceite de cocina",
                                                            "Agua destilada sin fijador",
                                                            "Colorantes artificiales gruesos"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 24,
                        "titulo": "24. Línea Dickens (Mini Perfumes)",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/24.png",
                        "video_url": null,
                        "contenido": "DICKENS - MINI PERFUMES:\n\nSon mini perfumes de formato portátil, perfectos para llevar en el bolso, bolsillo, auto o viajes. Permiten al cliente tener una primera experiencia inolvidable con la fragancia o probar nuevos aromas antes de comprar frascos más grandes.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Qué es la línea Dickens en nuestro portafolio?",
                                                "opciones": [
                                                            "Mini perfumes portátiles ideales para llevar consigo o probar aromas",
                                                            "Splash de cuerpo en presentación gigante",
                                                            "Ambientadores para el hogar",
                                                            "Muestras gratuitas de papel"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Cuál es el beneficio de la presentación Dickens para el cliente?",
                                                "opciones": [
                                                            "Portabilidad práctica y la oportunidad de probar la fragancia a bajo costo",
                                                            "Un envase pesado e incómodo",
                                                            "Uso exclusivo en vitrina",
                                                            "No se puede aplicar en piel"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿En qué situaciones de venta se sugiere recomendar Dickens?",
                                                "opciones": [
                                                            "Como compra impulsiva, retoque de bolsillo, viajes o prueba previa",
                                                            "Cuando el cliente exige un frasco de 200ml",
                                                            "Solo en compras institucionales",
                                                            "Únicamente en regalos empresariales de gran tamaño"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 25,
                        "titulo": "25. Concentraciones y Colección Niche",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/25.png",
                        "video_url": null,
                        "contenido": "CONCENTRACIONES Y FRAGANCIAS NICHE (EXTRAIT DE PARFUM):\n\nContamos con líneas de alta concentración como Oriental Leather, Citrus Amber, Spicy Wood en graduación Extrait de Parfum. Ofrecen acordes olfativos opulentos, estela envolvente y una persistencia superior en piel.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Qué concentración destaca en las líneas exclusivas como Oriental Leather o Citrus Amber?",
                                                "opciones": [
                                                            "Extrait de Parfum (Extracto de perfume de alta concentración)",
                                                            "Eau de Cologne diluida",
                                                            "Agua perfumada corporal",
                                                            "Esencia pura sin alcohol"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué caracteriza a las fragancias de la categoría Niche o Extrait de Parfum?",
                                                "opciones": [
                                                            "Riqueza de notas olfativas, mayor fijación y estela envolvente",
                                                            "Baja durabilidad en piel",
                                                            "Fragancias genéricas de baja calidad",
                                                            "Aromas imperceptibles"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Para qué tipo de cliente son ideales estas fragancias de alta densidad?",
                                                "opciones": [
                                                            "Para clientes exigentes que buscan alta durabilidad y aromas intensos",
                                                            "Para personas que no desean oler a perfume",
                                                            "Solo para niños",
                                                            "Para aromatizar espacios grandes únicamente"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 26,
                        "titulo": "26. Experiencias de Compra y Portafolio",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/26.png",
                        "video_url": null,
                        "contenido": "EXPERIENCIAS DE COMPRA Y PORTAFOLIO COMPLETO:\n\nEn Fragancias Alta Densidad nos enfocamos en que cada cliente viva una experiencia sensorial memorable. Asesoramos según las familias olfativas (cítrica, amaderada, floral, oriental, gourmand), ocasión de uso y personalidad del comprador.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Qué buscamos ofrecer en la atención al cliente según este módulo?",
                                                "opciones": [
                                                            "Una experiencia de compra cercana, personalizada y memorable",
                                                            "Una transacción rápida sin hablar",
                                                            "Una venta bajo presión sin escuchar",
                                                            "Información confusa sobre notas olfativas"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué familias olfativas principales se mencionan en la asesoría?",
                                                "opciones": [
                                                            "Cítrica, amaderada, floral, oriental, gourmand",
                                                            "Metálica, plástica, ácida y salada",
                                                            "Únicamente dulce",
                                                            "Aromas sin clasificación"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Cómo debe guiarse la recomendación de un perfume?",
                                                "opciones": [
                                                            "Escuchando las preferencias del cliente, ocasión de uso y gustos personales",
                                                            "Ofreciendo siempre el que menos se vende",
                                                            "Imponiendo un aroma sin preguntar",
                                                            "Decidiendo por precio alto únicamente"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 27,
                        "titulo": "27. Liderazgo en SST y Atención al Cliente",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/27.png",
                        "video_url": null,
                        "contenido": "TE PRESENTAMOS A VICTOR MANUEL - LÍDER DE SST Y ATENCIÓN AL CLIENTE:\n\nVictor Manuel coordina la gestión de Seguridad y Salud en el Trabajo (SST), prevención de riesgos en el punto de venta, cumplimiento de EPP y la estandarización de la calidad de servicio y atención al cliente en nuestra red de tiendas.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Qué áreas lidera Victor Manuel en la organización?",
                                                "opciones": [
                                                            "Seguridad y Salud en el Trabajo (SST) y Atención al Cliente",
                                                            "Finanzas y Contabilidad internacional",
                                                            "Diseño de empaques solamente",
                                                            "Mantenimiento informático externo"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Por qué es importante la articulación entre SST y la atención en tienda?",
                                                "opciones": [
                                                            "Porque un entorno seguro y bien gestionado permite brindar un servicio de excelencia",
                                                            "No existe ninguna relación entre ambas",
                                                            "Solo para cumplir trámites en papel",
                                                            "Para evitar atender al público"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Ante qué temas puedes contar con la orientación de Victor Manuel?",
                                                "opciones": [
                                                            "Seguridad laboral, uso de EPP, prevención de accidentes y protocolos de atención",
                                                            "Pago de nómina personal únicamente",
                                                            "Comisión de compras bancarias",
                                                            "Permisos de vacaciones exclusivamente"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 28,
                        "titulo": "28. Importancia del Uso de Elementos de Protección (EPP)",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/28.png",
                        "video_url": null,
                        "contenido": "LA IMPORTANCIA DEL USO DE LOS ELEMENTOS DE PROTECCIÓN PERSONAL (EPP):\n\n\"¡Hola equipo! En nuestro día a día rodeados de fragancias, alcoholes y esencias, cuidar nuestra salud es fundamental.\"\n\nEl uso correcto de los EPP previene irritaciones en piel, salpicaduras en ojos y afecciones respiratorias por inhalación concentrada de solventes.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Por qué es obligatorio el uso de EPP en el entorno de perfumería?",
                                                "opciones": [
                                                            "Para prevenir irritaciones, derrames y proteger la piel, ojos y vías respiratorias",
                                                            "Por simple vanidad estética",
                                                            "Para abrigarse en invierno",
                                                            "No es obligatorio"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Con qué sustancias químicas principales se trabaja en perfumería?",
                                                "opciones": [
                                                            "Alcoholes, esencias concentradas y fijadores químicos",
                                                            "Agua con azúcar únicamente",
                                                            "Harina y aceites vegetales",
                                                            "Gases pesados comprimidos"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿De quién es la responsabilidad de portar y cuidar los EPP asignados?",
                                                "opciones": [
                                                            "De cada colaborador en su jornada laboral diaria",
                                                            "Del cliente que compra",
                                                            "Del transportista externo",
                                                            "Solo del proveedor de insumos"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 29,
                        "titulo": "29. ¿Qué es SST? (Seguridad y Salud en el Trabajo)",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/29.png",
                        "video_url": null,
                        "contenido": "¿QUÉ ES SST?\n\nSST significa Seguridad y Salud en el Trabajo. Es el conjunto de normas, medidas, actividades y disciplinas que buscan prevenir accidentes laborales y enfermedades ocupacionales, protegiendo el bienestar físico, mental y social de todos los trabajadores.",
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
                                                "pregunta": "¿Cuál es el objetivo principal de implementar un Sistema de SST?",
                                                "opciones": [
                                                            "Prevenir accidentes laborales, enfermedades ocupacionales y promover la salud",
                                                            "Aumentar las horas de trabajo sin descanso",
                                                            "Generar cobros extra a los empleados",
                                                            "Reducir la seguridad en instalaciones"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿A quiénes protege la normativa de SST en la empresa?",
                                                "opciones": [
                                                            "A todos los trabajadores, colaboradores y personas en las instalaciones",
                                                            "Solo a los gerentes generales",
                                                            "Únicamente a los visitantes casuales",
                                                            "Nadie en particular"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 30,
                        "titulo": "30. Riesgos en el Puesto de Trabajo",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/30.png",
                        "video_url": null,
                        "contenido": "RIESGOS EN EL PUESTO DE TRABAJO - ÁREA DE PERFUMERÍA:\n\nEn el área de trabajo existen riesgos específicos que debemos identificar y controlar:\n• Riesgos Químicos: Manipulación de alcohol e inhalación prolongada de vapores de esencias.\n• Riesgos Físicos y Ergonómicos: Caídas por derrames de líquidos, cortes por frascos de vidrio rotos o postura prolongada de pie.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Cuáles son los principales riesgos químicos identificados en perfumería?",
                                                "opciones": [
                                                            "Contacto con alcohol, salpicaduras de esencias e inhalación de vapores concentrados",
                                                            "Riesgo de radiación nuclear",
                                                            "Exposición a polvo de carbón",
                                                            "Contacto con aceites de motor"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué riesgo físico se puede presentar por un derrame de líquido no limpiado a tiempo?",
                                                "opciones": [
                                                            "Resbalones, tropezones y caídas al mismo nivel",
                                                            "Explosión eléctrica masiva",
                                                            "Corte de energía",
                                                            "Ningún riesgo"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Cómo se previenen las heridas por manipulación de envases de vidrio?",
                                                "opciones": [
                                                            "Manipulando frascos con cuidado, utilizando guantes al reempacar y manteniendo orden",
                                                            "Lanzando los frascos a las cajas",
                                                            "Dejando vidrios rotos en el suelo",
                                                            "Trabajando a oscuras"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 31,
                        "titulo": "31. Elementos de Protección Personal (EPP) en Perfumería",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/31.png",
                        "video_url": null,
                        "contenido": "ELEMENTOS DE PROTECCIÓN PERSONAL (EPP) PARA PERFUMERÍA:\n\n• Guantes de Nitrilo: Protegen manos del contacto continuo con alcohol y esencias.\n• Gafas de Seguridad: Protegen ojos de salpicaduras accidentales.\n• Mascarilla / Respirador: Evita inhalación excesiva de vapores de fragancias.\n• Bata / Delantal: Protege la ropa y piel.\n• Calzado Antideslizante: Reduce riesgo de caídas por derrames.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Por qué se prefieren los guantes de nitrilo en perfumería?",
                                                "opciones": [
                                                            "Porque protegen adecuadamente contra alcoholes, solventes y esencias sin degradarse",
                                                            "Porque son de lana caliente",
                                                            "Porque son impermeables al calor extremo únicamente",
                                                            "Porque sustituyen al uniforme completo"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué EPP protege los ojos ante posibles salpicaduras durante la preparación?",
                                                "opciones": [
                                                            "Gafas de seguridad transparentes",
                                                            "Gafas de sol oscuras",
                                                            "Casco de construcción",
                                                            "Tapa oídos"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Cuál es la función del calzado antideslizante en tienda?",
                                                "opciones": [
                                                            "Prevenir resbalones y caídas en zonas con posibles derrames de líquidos",
                                                            "Mejorar la velocidad de carrera",
                                                            "Hacer juego con la corbata",
                                                            "No tiene función protectora"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 32,
                        "titulo": "32. Reporte de Accidentes de Trabajo Paso a Paso",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/32.png",
                        "video_url": null,
                        "contenido": "REPORTE DE ACCIDENTES DE TRABAJO - PASO A PASO:\n\n1. Atender al Trabajador: Evaluar estado y brindar primeros auxilios.\n2. Controlar el Peligro: Aislar el área o contener el derrame para evitar otros accidentes.\n3. Informar Inmediatamente: Notificar al jefe directo o responsable de SST.\n4. Registrar el Accidente: Diligenciar el formato de reporte formal.\n5. Investigar y Aplicar Medidas Correctivas: Analizar la causa raíz y prevenir recurrencias.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Cuál es el primer paso inmediato ante un accidente laboral?",
                                                "opciones": [
                                                            "Atender al trabajador lesionado y brindar primeros auxilios si es necesario",
                                                            "Tomar fotografías para redes sociales",
                                                            "Limpiar apresuradamente para disimular",
                                                            "Abandonar el puesto de trabajo"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿A quién se debe notificar inmediatamente tras ocurrir un accidente?",
                                                "opciones": [
                                                            "Al jefe inmediato, supervisor o responsable de SST sin ocultar información",
                                                            "A los clientes en la fila",
                                                            "A un medio de comunicación",
                                                            "A nadie"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Por qué es fundamental investigar la causa raíz del accidente?",
                                                "opciones": [
                                                            "Para tomar medidas correctivas y prevenir que el accidente vuelva a ocurrir",
                                                            "Para buscar culpables y sancionar sin escuchar",
                                                            "Para cerrar la tienda definitivamente",
                                                            "Es un paso innecesario"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 33,
                        "titulo": "33. ¿Qué es un Plan de Emergencia?",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/33.png",
                        "video_url": null,
                        "contenido": "¿QUÉ ES UN PLAN DE EMERGENCIA?\n\n\"Un plan de emergencia es una guía que indica qué debemos hacer antes, durante y después de una emergencia, con el objetivo de proteger la vida de los trabajadores y clientes, reducir los riesgos y actuar de manera rápida y organizada.\" ",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Cómo se define un Plan de Emergencia?",
                                                "opciones": [
                                                            "Una guía de acciones organizadas antes, durante y después de una emergencia para salvar vidas",
                                                            "Un catálogo de productos en promoción",
                                                            "Un folleto publicitario para clientes",
                                                            "Un documento contable de fin de año"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Cuál es el objetivo prioritario del Plan de Emergencia?",
                                                "opciones": [
                                                            "Proteger la vida e integridad de trabajadores y clientes",
                                                            "Salvar los muebles antes que las personas",
                                                            "Continuar vendiendo durante un incendio",
                                                            "Ignorar las alarmas"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Cuándo se deben conocer las rutas de evacuación y procedimientos?",
                                                "opciones": [
                                                            "Con anterioridad, de forma previa a que ocurra cualquier emergencia",
                                                            "Solamente cuando la alarma esté sonando",
                                                            "Un mes después del evento",
                                                            "Nunca"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 34,
                        "titulo": "34. Protocolo de Evacuación para Empleados y Clientes",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/34.png",
                        "video_url": null,
                        "contenido": "PLAN DE EMERGENCIA - ¿QUÉ HACER EN UNA EMERGENCIA?\n\n• PARA EMPLEADOS:\n1. Mantén la calma y evalúa la situación.\n2. Informa inmediatamente al responsable o activa la alarma.\n3. Suspende tus actividades y evacúa por las rutas señalizadas.\n4. Dirígete al punto de encuentro externo y reporta novedades.\n\n• PARA CLIENTES:\n1. Mantén la calma y escucha las indicaciones del personal.\n2. Evacúa en orden, camina (no corras ni empujes) hacia la salida señalizada.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Qué acción inicial debe realizar un empleado al detectar una emergencia grave?",
                                                "opciones": [
                                                            "Mantener la calma, informar al responsable y activar la alarma",
                                                            "Gritar y salir corriendo desordenadamente",
                                                            "Encerrarse en el baño",
                                                            "Seguir empacando productos"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Cómo deben evacuarse las instalaciones durante una emergencia?",
                                                "opciones": [
                                                            "Por las rutas de evacuación señalizadas, caminando con orden hacia el punto de encuentro",
                                                            "Corriendo y empujando a los demás",
                                                            "Devolviéndose por objetos personales olvidados",
                                                            "Usando ascensores bloqueados"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Está permitido regresar al local antes de que el personal autorizado lo indique?",
                                                "opciones": [
                                                            "No, bajo ninguna circunstancia hasta que se declare zona segura",
                                                            "Sí, si se olvidó el abrigo personal",
                                                            "Sí, para seguir vendiendo",
                                                            "Sí, inmediatamente después de salir"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 35,
                        "titulo": "35. Ejecución y Simulacros del Plan de Emergencia",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/35.png",
                        "video_url": null,
                        "contenido": "¿CÓMO EJECUTAR EL PLAN DE EMERGENCIA?\n\nEl plan de emergencia se ejecuta capacitando continuamente al personal, asignando roles claros de brigadistas, verificando extintores, botiquines y rutas despejadas. Realizamos simulacros periódicos para evaluar los tiempos de respuesta y aplicar mejoras preventivas.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Cómo se garantiza la efectividad del Plan de Emergencia?",
                                                "opciones": [
                                                            "Capacitando al personal, manteniendo señalizaciones y realizando simulacros periódicos",
                                                            "Guardando el plan en un cajón bajo llave",
                                                            "Sin realizar ensayos ni revisiones",
                                                            "Dependiendo únicamente de personas externas"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Para qué sirven los simulacros de evacuación en la empresa?",
                                                "opciones": [
                                                            "Para poner a prueba la preparación, medir tiempos de respuesta y corregir fallas",
                                                            "Para perder tiempo de trabajo",
                                                            "Para asustar a los clientes",
                                                            "No tienen ninguna utilidad"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué elementos de emergencia deben estar siempre disponibles y señalizados?",
                                                "opciones": [
                                                            "Extintores vigentes, botiquín de primeros auxilios y rutas de evacuación despejadas",
                                                            "Cajas de mercancía apiladas en la salida",
                                                            "Puertas de emergencia con candado",
                                                            "Luces apagadas"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 36,
                        "titulo": "36. ¿Qué es la Brigada de Emergencia?",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/36.png",
                        "video_url": null,
                        "contenido": "¿QUÉ ES LA BRIGADA DE EMERGENCIA?\n\nLa Brigada de Emergencia es un grupo de trabajadores voluntarios capacitados y entrenados para actuar en la prevención, control de incendios, primeros auxilios, evacuación y apoyo durante situaciones de riesgo en la empresa.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Cómo se define la Brigada de Emergencia?",
                                                "opciones": [
                                                            "Grupo de colaboradores capacitados para actuar en prevención, primeros auxilios y evacuación",
                                                            "Un comité de festejos corporativos",
                                                            "Un grupo de clientes frecuentes",
                                                            "Una entidad gubernamental externa"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Cuáles son las funciones principales de la Brigada?",
                                                "opciones": [
                                                            "Control de conatos de incendio, primeros auxilios, guiar evacuaciones y comunicación",
                                                            "Vender perfumes de edición limitada",
                                                            "Elaborar la nómina mensual",
                                                            "Aumentar los precios de tienda"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué actitud se debe mantener frente a las instrucciones de los brigadistas en emergencia?",
                                                "opciones": [
                                                            "Seguir sus indicaciones con orden, calma y colaboración inmediata",
                                                            "Ignorar sus avisos y actuar por cuenta propia",
                                                            "Discutir las órdenes",
                                                            "Abandonar la zona sin avisar"
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
                        "contenido": "PERSONAL ENCARGADO DE LA BRIGADA DE EMERGENCIA:\n\nPresentación de los brigadistas capacitados en el punto de venta. Visualiza el video para conocer sus distintivos, chalecos o brazaletes y saber a quién dirigirte en caso de emergencia.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Cómo puedes identificar al personal de la Brigada de Emergencia en tienda?",
                                                "opciones": [
                                                            "Por sus distintivos oficiales (chalecos, brazaletes o carné de brigadista)",
                                                            "No tienen ninguna identificación",
                                                            "Llevan ropa de calle común",
                                                            "Solo por el nombre en redes"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Por qué es importante conocer a los miembros de la brigada de tu sede?",
                                                "opciones": [
                                                            "Para acudir rápidamente a ellos y acatar su liderazgo ante un incidente",
                                                            "Para pedirles permisos de horario",
                                                            "No es necesario conocerlos",
                                                            "Solo para eventos festivos"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué capacitación reciben los miembros de la brigada de emergencia?",
                                                "opciones": [
                                                            "Entrenamiento en primeros auxilios, manejo de extintores y evacuación",
                                                            "Curso de cocina internacional",
                                                            "Capacitación en diseño de joyas",
                                                            "Sin ninguna capacitación"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 38,
                        "titulo": "38. Comité de Convivencia Laboral (COCOLA)",
                        "tipo": "video",
                        "imagen_url": "/assets/img/capacitacion/38.png",
                        "video_url": "/assets/img/induccion/video_cocola_atencion.mp4",
                        "contenido": "¿QUÉ ES EL COMITÉ DE CONVIVENCIA LABORAL (COCOLA)?\n\nCOCOLA - COMPROMISO CON EL CUIDADO DE LA VIDA:\n\nEl Comité de Convivencia Laboral es el espacio encargado de promover un clima laboral sano, previniendo el acoso laboral, solucionando conflictos de forma confidencial y garantizando el respeto mutuo entre todos los colaboradores.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Cuál es el objetivo primordial del Comité COCOLA?",
                                                "opciones": [
                                                            "Promover un clima laboral armonioso, prevenir el acoso y resolver diferencias interpersonales",
                                                            "Organizar las ventas del mes",
                                                            "Revisar los contratos de arrendamiento",
                                                            "Calcular las horas extras"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Bajo qué principios se manejan los casos remitidos a COCOLA?",
                                                "opciones": [
                                                            "Estricta confidencialidad, imparcialidad, respeto y diálogo constructivo",
                                                            "Publicándolos en carteleras de la empresa",
                                                            "Contándolo a los clientes",
                                                            "Mediante discusiones públicas"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿En qué situaciones puedes consultar o acudir al Comité COCOLA?",
                                                "opciones": [
                                                            "Ante presuntas conductas de acoso laboral, diferencias interpersonales o sugerencias de convivencia",
                                                            "Para pedir préstamos personales a la empresa",
                                                            "Para solicitar productos gratis",
                                                            "Para reclamos de clientes sobre precios"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 39,
                        "titulo": "39. Personal Encargado del Comité COCOLA",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/39.png",
                        "video_url": null,
                        "contenido": "PERSONAL ENCARGADO DEL COMITÉ DE CONVIVENCIA (COCOLA):\n\nConoce a los representantes electos por los trabajadores y la administración que integran el Comité de Convivencia COCOLA. Recuerda que existen canales y formularios oficiales para radicar inquietudes con absoluta reserva.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Quiénes integran el Comité de Convivencia COCOLA?",
                                                "opciones": [
                                                            "Representantes elegidos por los trabajadores y representantes designados por la empresa",
                                                            "Únicamente personas externas a la empresa",
                                                            "Clientes que visitan la tienda",
                                                            "Proveedores de insumos"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Cómo se garantiza el debido proceso ante una solicitud enviada a COCOLA?",
                                                "opciones": [
                                                            "Escuchando a las partes con imparcialidad y proponiendo acuerdos de convivencia",
                                                            "Sancionando de inmediato sin investigar",
                                                            "Ignorando las solicitudes escritas",
                                                            "Revelando la información a terceros"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Cuál es el beneficio de contar con un COCOLA activo en la empresa?",
                                                "opciones": [
                                                            "Fomentar un entorno de trabajo seguro, saludable, respetuoso y libre de acoso",
                                                            "Aumentar el precio de venta al público",
                                                            "Evitar el uso de uniformes",
                                                            "Eliminar los horarios de trabajo"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 40,
                        "titulo": "40. ¿Qué es la Atención al Cliente?",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/40.png",
                        "video_url": null,
                        "contenido": "¿QUÉ ES LA ATENCIÓN AL CLIENTE?\n\n\"La atención al cliente es el servicio que una empresa brinda para escuchar, orientar y ayudar a sus clientes. Una buena atención debe ser amable, respetuosa, clara y rápida, buscando solucionar las necesidades o problemas del cliente. El objetivo principal es lograr su satisfacción, generar confianza y conseguir que el cliente quiera regresar y recomendar la empresa.\" ",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Cómo se define la atención al cliente dentro de nuestra empresa?",
                                                "opciones": [
                                                            "El servicio dedicado a escuchar, orientar y ayudar al cliente a solucionar sus necesidades",
                                                            "Cobrar el mayor valor posible sin asesorar",
                                                            "Imponer productos sin escuchar",
                                                            "Un trámite exclusivamente telefónico"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Cuáles son los cuatro atributos fundamentales de una excelente atención?",
                                                "opciones": [
                                                            "Amable, respetuosa, clara y rápida",
                                                            "Indiferente, lenta, confusa y fría",
                                                            "Rígida, exigente, costosa e impositiva",
                                                            "Informal, distraída, brusca e inconsistente"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Cuál es el objetivo final de brindar un servicio al cliente excepcional?",
                                                "opciones": [
                                                            "Lograr la satisfacción del cliente, generar confianza y motivar su regreso y recomendación",
                                                            "Hacer ventas de una sola vez",
                                                            "Reducir el tiempo de permanencia en tienda echando al cliente",
                                                            "Evitar que pregunte sobre perfumes"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 41,
                        "titulo": "41. Atención Adecuada vs Atención Inadecuada",
                        "tipo": "video",
                        "imagen_url": "/assets/img/capacitacion/41.png",
                        "video_url": "/assets/img/induccion/video_cocola_atencion.mp4",
                        "contenido": "ATENCIÓN ADECUADA Y ATENCIÓN INADECUADA EN PERFUMERÍA:\n\nEjemplo práctico comparativo entre una atención cercana, orientadora y amable frente a una actitud apática, distraída con el celular o desinteresada con el comprador.\n\nLa diferencia radica en la empatía y en hacer sentir especial a cada persona que ingresa a nuestras tiendas.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Qué caracteriza a una atención inadecuada en el punto de venta?",
                                                "opciones": [
                                                            "Actitud apática, brazos cruzados, distracción con el celular o falta de interés",
                                                            "Saludar con una sonrisa y escuchar atentamente",
                                                            "Explicar las familias olfativas con calma",
                                                            "Ofrecer opciones según el presupuesto del cliente"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué impacto genera en el cliente una atención adecuada y empática?",
                                                "opciones": [
                                                            "Sensación de acogida, confianza en el producto y fidelidad a la marca",
                                                            "Molestia y ganas de salir rápido",
                                                            "Desconfianza en los precios",
                                                            "Ningún impacto"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué debes hacer si un cliente tiene dudas sobre una fragancia o no se decide?",
                                                "opciones": [
                                                            "Escucharlo, asesorarlo en notas olfativas y mostrarle opciones acordes a sus gustos con amabilidad",
                                                            "Presionarlo para que compre la más costosa de inmediato",
                                                            "Ignorarlo y atender a otra persona",
                                                            "Decirle que todas huelen igual sin asesorar"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 42,
                        "titulo": "42. Imagen y Presentación del Personal",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/42.png",
                        "video_url": null,
                        "contenido": "IMAGEN Y PRESENTACIÓN DEL PERSONAL:\n\nEn nuestra perfumería, la imagen del empleado es fundamental porque representa la marca. Debemos mantener una presentación limpia, ordenada y profesional acompañada de una actitud amable. Al atender al cliente debemos sonreír, escuchar sus necesidades, ofrecer información clara y recomendar las fragancias adecuadas.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Por qué es tan importante la imagen del empleado en el punto de venta?",
                                                "opciones": [
                                                            "Porque el colaborador es la cara visible que representa los valores y profesionalismo de la marca",
                                                            "No influye en la percepción del cliente",
                                                            "Solo importa el precio del producto",
                                                            "Para cumplir trámites de fotografía"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué elementos complementan la imagen personal en la atención?",
                                                "opciones": [
                                                            "Una actitud amable, sonrisa sincera, escucha activa e información clara",
                                                            "Mirada indiferente y lenguaje despectivo",
                                                            "Respuestas cortantes y falta de saludo",
                                                            "Hablar por celular mientras se asesora"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué efecto produce en el comprador ser atendido por un asesor con excelente presentación?",
                                                "opciones": [
                                                            "Genera confianza inmediata, credibilidad en el producto y una experiencia grata",
                                                            "Provoca desconfianza",
                                                            "Le genera prisa por irse",
                                                            "Haga que reclame la factura"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 43,
                        "titulo": "43. Estándares de Imagen Correcta del Empleado",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/43.png",
                        "video_url": null,
                        "contenido": "¿CÓMO DEBE SER LA IMAGEN CORRECTA DE LOS EMPLEADOS?\n\n• Presentación personal impecable: Uniforme limpio y bien organizado.\n• Buena actitud: Sonrisa, amabilidad y disposición para ayudar.\n• Higiene personal: Manos limpias, cabello organizado y aliento fresco.\n• Aroma personal moderado: Evitar perfumes demasiado fuertes que compitan con las fragancias de la tienda.\n• Contacto visual y lenguaje corporal positivo. Evitar el celular mientras se atiende.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Por qué el aroma personal del asesor debe ser moderado y suave?",
                                                "opciones": [
                                                            "Para evitar saturar el ambiente o competir con las fragancias que el cliente está probando",
                                                            "Porque está prohibido usar perfume",
                                                            "Para no gastar perfume propio",
                                                            "Sin ninguna razón olfativa"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué aspectos de higiene personal son indispensables en tienda?",
                                                "opciones": [
                                                            "Manos y uñas impecables, cabello arreglado y excelente higiene bucal",
                                                            "Usar ropa sin lavar",
                                                            "Tener manos manchadas de tinta",
                                                            "Uñas descuidadas"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué postura corporal transmite disposición y respeto hacia el cliente?",
                                                "opciones": [
                                                            "Contacto visual directo, postura erguida, sonrisa y brazos abiertos",
                                                            "Brazos cruzados y espalda encorvada",
                                                            "Mirar al piso mientras el cliente habla",
                                                            "Dar la espalda para ver el teléfono"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 44,
                        "titulo": "44. Guía Visual: Uso Adecuado vs No Adecuado de Imagen",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/44.png",
                        "video_url": null,
                        "contenido": "GUÍA VISUAL DE IMAGEN Y PRESENTACIÓN PARA CLIENTES:\n\n• USO ADECUADO:\n- Saluda con amabilidad y sonríe.\n- Presentación impecable y uniforme limpio.\n- Ambiente limpio, ordenado y profesional.\n- Escucha al cliente y recomienda según sus necesidades.\n- Agradece la visita y se despide cordialmente.\n\n• USO NO ADECUADO (A EVITAR):\n- Usar el celular en área de atención.\n- Conversaciones personales frente al cliente.\n- Comer o masticar chicle en el puesto de trabajo.\n- Estar de brazos cruzados o ignorar al cliente.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Cuáles de las siguientes conductas están totalmente PROHIBIDAS en la atención?",
                                                "opciones": [
                                                            "Usar el celular, masticar chicle, comer o tener conversaciones personales frente al cliente",
                                                            "Saludar con una sonrisa y agradecer la visita",
                                                            "Escuchar la necesidad del cliente",
                                                            "Mantener el mostrador limpio y ordenado"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Cuál es el resultado de aplicar la guía de uso adecuado de imagen y servicio?",
                                                "opciones": [
                                                            "Cliente satisfecho, confianza, fidelización y recomendación de la marca",
                                                            "Cliente insatisfecho y pérdida de reputación",
                                                            "Reclamos continuos en tienda",
                                                            "Cancelación de ventas"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué se debe hacer al finalizar la atención de un cliente?",
                                                "opciones": [
                                                            "Agradecer cordialmente su visita y despedirse con amabilidad",
                                                            "Voltearse de inmediato sin decir nada",
                                                            "Exigirle que compre más",
                                                            "Ignorar su salida"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 45,
                        "titulo": "45. Guía de Presentación Personal Mujeres y Hombres",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/45.png",
                        "video_url": null,
                        "contenido": "PRESENTACIÓN PERSONAL EN DETALLE:\n\n• MUJERES:\n- Cabello: Limpio, ordenado y peinado. Recogido si lo requiere la labor.\n- Uniforme: Limpio, planchado y completo.\n- Uñas: Limpias, cortas y cuidadas. Esmaltes en tonos discretos o naturales.\n- Maquillaje y Aroma: Sobrio, fresco y fragancia moderada.\n\n• HOMBRES:\n- Cabello: Limpio, corto o bien peinado.\n- Barba: Afeitada o bien recortada y definida.\n- Uniforme: Limpio, planchado y completo.\n- Uñas y Aroma: Limpias, cortas y fragancia discreta.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Cómo deben ser presentadas las uñas y manos en el personal de tienda?",
                                                "opciones": [
                                                            "Limpias, cortas y cuidadas, con tonos discretos en el caso de esmaltes",
                                                            "Uñas largas con colores fosforescentes despicados",
                                                            "Manos sucias sin lavar",
                                                            "Sin ninguna norma de cuidado"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Cuál es la norma de presentación respecto a la barba en los hombres?",
                                                "opciones": [
                                                            "Debe estar completamente afeitada o bien recortada, limpia y definida",
                                                            "Larga sin peinar",
                                                            "Con residuos de comida",
                                                            "Sin definición"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Cómo debe lucir el uniforme institucional diariamente?",
                                                "opciones": [
                                                            "Impecable, limpio, completo y planchado",
                                                            "Arrugado y manchado",
                                                            "Incompleto sin blusa/camisa institucional",
                                                            "Modificado sin autorización"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 46,
                        "titulo": "46. Facturación y Métodos de Pago - Introducción",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/46.png",
                        "video_url": null,
                        "contenido": "FACTURACIÓN Y MÉTODOS DE PAGO:\n\n\"Cada venta que realizamos representa un compromiso tanto con nuestro cliente como con nuestra empresa. Por eso, es fundamental que todos los colaboradores conozcan cómo se desarrolla una venta, qué medios de pago manejamos y qué hacer ante cualquier novedad.\"\n\n¿Qué sucede si una venta se registra de forma incorrecta? Genera descuadres de caja, inconsistencias en inventario y problemas en facturación.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Por qué es importante que todo el personal conozca el proceso de facturación?",
                                                "opciones": [
                                                            "Porque cada venta es un compromiso legal, contable y de servicio con el cliente y la empresa",
                                                            "Solo le interesa al área de contabilidad externa",
                                                            "No influye en el funcionamiento de tienda",
                                                            "Para cobros informales"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué consecuencias trae registrar incorrectamente una venta en el sistema?",
                                                "opciones": [
                                                            "Descuadres de caja, errores en inventarios y fallas en reportes contables",
                                                            "Ningún problema",
                                                            "Mayor ganancia para la tienda",
                                                            "Premios para el vendedor"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué responsabilidad asume el vendedor al cerrar una transacción?",
                                                "opciones": [
                                                            "Garantizar el registro fiel de productos, precios y forma de pago ingresada",
                                                            "Cobrar sin emitir comprobante",
                                                            "Entregar mercancía sin registrar",
                                                            "Modificar los precios a su criterio"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 47,
                        "titulo": "47. ¿Cómo Funciona el Proceso de Facturación?",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/47.png",
                        "video_url": null,
                        "contenido": "FACTURACIÓN - ¿CÓMO FUNCIONA EL PROCESO EN 5 PASOS?\n\nEn nuestra empresa, la facturación respalda cada venta garantizando transparencia y control:\n\n1. Compra: El cliente selecciona sus productos.\n2. Registro: Se ingresa la venta y datos del cliente en el sistema.\n3. Facturación: Se genera la factura electrónica correspondiente.\n4. Pago: El cliente elige y efectúa su método de pago.\n5. Entrega: Se confirma la transacción y se entrega el producto empacado.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Cuáles son los 5 pasos ordenados del proceso de facturación?",
                                                "opciones": [
                                                            "Compra, Registro, Facturación, Pago y Entrega",
                                                            "Pago, Entrega, Registro, Compra y Facturación",
                                                            "Entrega sin registro ni pago",
                                                            "Registro únicamente"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué garantiza un proceso de facturación claro y transparente?",
                                                "opciones": [
                                                            "Control de inventario, respaldo al cliente y confianza en la compra",
                                                            "Pérdida de información",
                                                            "Confusión en los precios",
                                                            "Demoras en la entrega"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿En qué momento del flujo se realiza la entrega del producto al cliente?",
                                                "opciones": [
                                                            "Únicamente tras confirmar el pago y la generación/registro de la factura",
                                                            "Antes de registrar la venta",
                                                            "Sin verificar el pago",
                                                            "Al inicio de la visita"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 48,
                        "titulo": "48. Facturación por Medio de SIIGO",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/48.png",
                        "video_url": null,
                        "contenido": "FACTURACIÓN POR MEDIO DE SIIGO:\n\n¿Qué es SIIGO y por qué nos afecta a todos?\n• SIIGO es el sistema oficial donde se registran todas las ventas, productos, clientes y pagos de la empresa.\n• Aunque no seas contador, tu venta se refleja directamente en SIIGO.\n• Un error en SIIGO = Problemas de stock, impuestos y caja para todos.\n• Sirve para controlar inventario en tiempo real, declarar impuestos y llevar contabilidad exacta.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Qué es SIIGO dentro de nuestra organización?",
                                                "opciones": [
                                                            "El sistema oficial donde se registran ventas, inventarios, facturas y pagos",
                                                            "Una red social de clientes",
                                                            "Un catálogo digital de fotos",
                                                            "Un sistema de correo personal"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Por qué afecta a todos los colaboradores la información ingresada en SIIGO?",
                                                "opciones": [
                                                            "Porque lo registrado actualiza stock de inventario, impuestos y flujo de caja en tiempo real",
                                                            "No tiene ningún impacto operativo",
                                                            "Solo afecta al desarrollador de software",
                                                            "Únicamente a la gerencia"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué funciones clave cumple el software SIIGO?",
                                                "opciones": [
                                                            "Controlar inventarios, registrar ventas, emitir facturas electrónicas y tributación",
                                                            "Diseñar etiquetas de perfume",
                                                            "Transmitir videos de tienda",
                                                            "Reservar hoteles de viaje"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 49,
                        "titulo": "49. Registro de Venta Paso a Paso en SIIGO",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/49.png",
                        "video_url": null,
                        "contenido": "REGISTRO DE VENTA PASO A PASO EN SISTEMA SIIGO:\n\n01. Datos del Cliente: Nombre completo, cédula/NIT, correo electrónico y teléfono.\n02. Producto: Seleccionar la referencia y cantidad exacta adquirida.\n03. Método de Pago: Indicar claramente la modalidad (Efectivo, Nequi, Tarjeta, Crédito).\n04. Generar Factura: Emitir y enviar al correo del cliente.\n05. Confirmar: Verificar que el movimiento quede grabado e inventario actualizado.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Qué datos obligatorios del cliente deben ingresarse en SIIGO?",
                                                "opciones": [
                                                            "Nombre completo, cédula/NIT, correo electrónico y número telefónico",
                                                            "Solo el primer nombre",
                                                            "Apodo o pseudónimo casual",
                                                            "Ningún dato"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué se debe verificar al seleccionar el producto en el sistema?",
                                                "opciones": [
                                                            "La referencia exacta y la cantidad comprada para no alterar el inventario",
                                                            "Elegir cualquier producto con precio similar",
                                                            "Ingresar cantidades al azar",
                                                            "No seleccionar producto"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Cuál es el último paso al procesar la venta en SIIGO?",
                                                "opciones": [
                                                            "Confirmar el registro de la transacción y la actualización automática de stock",
                                                            "Apagar el computador",
                                                            "Cancelar la factura",
                                                            "Borrar los datos del cliente"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 50,
                        "titulo": "50. Métodos de Pago Disponibles",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/50.png",
                        "video_url": null,
                        "contenido": "MÉTODOS DE PAGO HABILITADOS EN TIENDA:\n\n• PAGO TRADICIONAL:\n- Efectivo.\n- Tarjeta Débito.\n- Tarjeta Crédito.\n\n• PAGO DIGITAL:\n- Nequi.\n- Daviplata.\n- Transferencias Bancarias.\n- Código QR.\n\n• FINANCIACIÓN / CRÉDITO:\n- Sistecrédito.\n- Addi.\n- Otras plataformas autorizadas.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Cuáles son las tres categorías de métodos de pago recibidas en tienda?",
                                                "opciones": [
                                                            "Pago Tradicional, Pago Digital y Financiación/Crédito",
                                                            "Solo efectivo en billetes de alta denominación",
                                                            "Únicamente cheques de gerencia",
                                                            "Fiado verbal únicamente"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué medios corresponden a la categoría de Pago Digital?",
                                                "opciones": [
                                                            "Nequi, Daviplata, transferencias bancarias y código QR",
                                                            "Monedas antiguas",
                                                            "Billetes físicos",
                                                            "Pagare manuales"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué plataformas de financiación al crédito manejamos en Alta Densidad?",
                                                "opciones": [
                                                            "Sistecrédito y Addi",
                                                            "Tarjetas de regalo no oficiales",
                                                            "Préstamos de terceros informales",
                                                            "Ninguna plataforma"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 51,
                        "titulo": "51. Protocolo de Pago Tradicional",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/51.png",
                        "video_url": null,
                        "contenido": "PAGO TRADICIONAL (EFECTIVO Y TARJETAS):\n\n• EFECTIVO:\n- Contar el dinero en presencia del cliente.\n- Verificar la autenticidad de los billetes recibidos.\n- Entregar el cambio exacto junto con la factura impreso o digital.\n\n• TARJETAS DÉBITO Y CRÉDITO:\n- Procesar la transacción en el datáfono oficial.\n- Verificar el estado APROBADO en la pantalla del datáfono antes de entregar la mercancía.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Qué verificación se debe realizar al recibir dinero en efectivo?",
                                                "opciones": [
                                                            "Contar el dinero frente al cliente y verificar la autenticidad de los billetes",
                                                            "Guardarlo en el bolsillo sin contar",
                                                            "Sin revisar los billetes",
                                                            "Dar el cambio antes de recibir el dinero"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué comprobación en datáfono es indispensable antes de entregar la compra por tarjeta?",
                                                "opciones": [
                                                            "Verificar que el comprobante salga APROBADO en la pantalla del datáfono",
                                                            "Entregar el producto si el datáfono marca RECHAZADO",
                                                            "No usar datáfono",
                                                            "Apagar el datáfono"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué comprobante se debe entregar siempre al cliente tras un pago tradicional?",
                                                "opciones": [
                                                            "Factura o recibo oficial impreso o digital de la transacción",
                                                            "Un papel borrador sin valor",
                                                            "Ningún soporte",
                                                            "Solo una tarjeta personal"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 52,
                        "titulo": "52. Protocolo de Pago Digital y Financiación",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/52.png",
                        "video_url": null,
                        "contenido": "PAGO DIGITAL Y FINANCIACIÓN:\n\n• PAGO DIGITAL (NEQUI / DAVIPLATA / QR):\n- Exigir el comprobante digital en pantalla.\n- Verificar la llegada efectiva de los fondos a la cuenta oficial del punto o plataforma administrativa ANTES de entregar los productos.\n\n• FINANCIACIÓN (SISTECRÉDITO / ADDI):\n- Validar el código de aprobación o token OTP con el documento del cliente en el portal habilitado.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Qué regla de oro rige para las ventas por pago digital (Nequi/Daviplata/QR)?",
                                                "opciones": [
                                                            "Verificar la confirmación y llegada de dinero en la cuenta oficial ANTES de entregar la mercancía",
                                                            "Entregar el producto con solo mostrar una foto borrosa de pantalla",
                                                            "No revisar la cuenta",
                                                            "Confiar sin comprobante"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Cómo se valida un crédito con Sistecrédito o Addi en tienda?",
                                                "opciones": [
                                                            "Verificando la cédula del cliente y el código OTP/aprobación en la plataforma oficial",
                                                            "Firmando una servilleta",
                                                            "Sin ingresar a la plataforma",
                                                            "Tomando una foto casual"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Por qué no se debe entregar mercancía con comprobantes digitales dudosos o no confirmados?",
                                                "opciones": [
                                                            "Para prevenir fraudes, comprobantes falsos y pérdidas económicas en tienda",
                                                            "No hay ningún riesgo",
                                                            "Solo por perder tiempo",
                                                            "Porque el sistema se bloquea"
                                                ],
                                                "respuesta_correcta": 0
                                    }
                        ]
            },
            {
                        "orden": 53,
                        "titulo": "53. Evaluación Final y Culminación de Capacitación",
                        "tipo": "imagen",
                        "imagen_url": "/assets/img/capacitacion/53.png",
                        "video_url": null,
                        "contenido": "EVALUACIÓN Y CULMINACIÓN DEL PROCESO:\n\n¡FELICITACIONES!\n\nHas completado la lectura y evaluación de los 53 módulos del programa de Inducción y Capacitación de Fragancias Alta Densidad. \n\nHas aprendido la cultura institucional, misión, visión, historia, reglamento interno, prevención en SST, brigadas de emergencia, portafolio de perfumería, atención al cliente, estándares de imagen personal y facturación en sistema SIIGO.\n\nA continuación quedas habilitado(a) para presentar el Examen Final Obligatorio.",
                        "preguntas": [
                                    {
                                                "pregunta": "¿Qué logro alcanzaste al finalizar este módulo?",
                                                "opciones": [
                                                            "Completar satisfactoriamente los 53 módulos de Inducción y Capacitación de la empresa",
                                                            "Terminar la secundaria",
                                                            "Comprar una franquicia",
                                                            "Ninguno"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Qué paso sigue inmediatamente después de culminar los 53 módulos?",
                                                "opciones": [
                                                            "Presentar el Examen Final Obligatorio para habilitar tu autorización laboral",
                                                            "Retirarte de la empresa",
                                                            "Reiniciar la capacitación desde cero",
                                                            "Esperar un año"
                                                ],
                                                "respuesta_correcta": 0
                                    },
                                    {
                                                "pregunta": "¿Por qué es importante haber comprendido a cabalidad cada uno de los 53 temas vistos?",
                                                "opciones": [
                                                            "Porque garantizan tu excelencia, seguridad y éxito profesional en Fragancias Alta Densidad",
                                                            "Es solo un trámite sin impacto real",
                                                            "Para memorizar números sin aplicar",
                                                            "No tiene mayor relevancia"
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
