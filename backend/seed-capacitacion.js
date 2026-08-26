const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { getConnection } = require('./config/db');

async function seedCapacitacion(existingPool) {
    console.log('--- Iniciando Siembra de Datos de Capacitación e Inducción ---');
    try {
        const pool = existingPool || await getConnection();

        // Módulos de Capacitación en la secuencia solicitada
        const modulos = [
            {
                titulo: '1. Agenda de Inducción',
                tipo: 'imagen',
                imagen_url: '/assets/img/induccion/foto1_agenda.png',
                video_url: null,
                contenido: `AGENDA DE INDUCCIÓN - SEPTIEMBRE 01 DE 2026:

• Espacio 1 (8:00 AM a 8:30 AM): Bienvenida y presentación, historia, misión y visión.
• Espacio 2 (8:30 AM a 9:00 AM): Reglamento interno, políticas, horarios, turno, código de vestimenta, manejo de información confidencial.
• Espacio 3 (9:00 AM a 10:00 AM): Portafolio de productos, tipos de perfumes.
• Espacio 4 (10:30 AM a 12:00 PM): Seguridad y salud en el trabajo, uso de EPP, presentación de brigada, COPASST, COCOLA, rutas de evacuación y plan de emergencia.
• HORA DE ALMUERZO.`,
                orden: 1,
                preguntas: [
                    {
                        pregunta: '¿A qué hora inicia la jornada de bienvenida y presentación de la empresa según la agenda?',
                        opciones: JSON.stringify(['7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM']),
                        respuesta_correcta: 1
                    },
                    {
                        pregunta: '¿En qué espacio se abordan los temas de Reglamento Interno, políticas y código de vestimenta?',
                        opciones: JSON.stringify(['Espacio 1 (8:00 a 8:30)', 'Espacio 2 (8:30 a 9:00)', 'Espacio 3 (9:00 a 10:00)', 'Espacio 4 (10:30 a 12:00)']),
                        respuesta_correcta: 1
                    },
                    {
                        pregunta: '¿Qué temas se tratan en el Espacio 4 de la agenda?',
                        opciones: JSON.stringify(['Únicamente hora de almuerzo', 'Ventas y descuentos de perfumes', 'Seguridad y salud en el trabajo, EPP, brigada, COPASST, COCOLA y plan de emergencia', 'Presentación de nuevos clientes']),
                        respuesta_correcta: 2
                    }
                ]
            },
            {
                titulo: '2. Video Institucional Perfumería Alta Densidad',
                tipo: 'video',
                imagen_url: null,
                video_url: '/assets/img/Crear_un_video_elegante_y_prof.mp4',
                contenido: `VIDEO INSTITUCIONAL DE INDUCCIÓN:

Por favor reproduce y visualiza detenidamente el video institucional de Perfumería Alta Densidad para conocer nuestra esencia de marca, estándares de elegancia y propuesta de valor en fragancias premium de alta fijación.`,
                orden: 2,
                preguntas: [
                    {
                        pregunta: '¿Cuál es el objetivo principal del video institucional de Alta Densidad?',
                        opciones: JSON.stringify(['Presentar la elegancia, identidad y propuesta de valor de la marca', 'Explicar trámites contables externos', 'Mostrar empaques defectuosos', 'Ninguno de los anteriores']),
                        respuesta_correcta: 0
                    },
                    {
                        pregunta: '¿Qué caracteriza a las fragancias de Alta Densidad según la identidad institucional?',
                        opciones: JSON.stringify(['Baja concentración y corta duración', 'Alta fijación, concentración y calidad superior', 'Perfumes únicamente de muestra', 'Aromas sin garantía de calidad']),
                        respuesta_correcta: 1
                    },
                    {
                        pregunta: '¿Por qué es obligatorio visualizar el contenido audiovisual durante la capacitación?',
                        opciones: JSON.stringify(['Para afianzar el conocimiento de la marca y garantizar la excelencia en el servicio', 'Es un paso opcional sin relevancia', 'Solo para probar el sistema reproductor', 'Para consumir tiempo']),
                        respuesta_correcta: 0
                    }
                ]
            },
            {
                titulo: '3. Nuestra Misión',
                tipo: 'imagen',
                imagen_url: '/assets/img/induccion/foto2_mision.png',
                video_url: null,
                contenido: `NUESTRA MISIÓN:

Ofrecer fragancias de alta calidad a precios competitivos, brindando a nuestros clientes una experiencia de compra cercana, agradable y confiable. Buscamos que cada aroma permita a las personas sentirse cómodas, seguras y auténticas, acompañándolas en los diferentes momentos de su día a día.`,
                orden: 3,
                preguntas: [
                    {
                        pregunta: '¿Cuál es el compromiso principal expuesto en Nuestra Misión?',
                        opciones: JSON.stringify(['Ofrecer fragancias de alta calidad a precios competitivos', 'Vender únicamente al por mayor fuera del país', 'Reducir la atención al cliente', 'Vender productos sin garantía']),
                        respuesta_correcta: 0
                    },
                    {
                        pregunta: '¿Qué tipo de experiencia de compra busca brindar Alta Densidad?',
                        opciones: JSON.stringify(['Distante y compleja', 'Cercana, agradable y confiable', 'Lenta e impersonal', 'Sin soporte técnico']),
                        respuesta_correcta: 1
                    },
                    {
                        pregunta: '¿Qué busca transmitir la marca a través de sus aromas en el día a día del cliente?',
                        opciones: JSON.stringify(['Permitir que las personas se sientan cómodas, seguras y auténticas', 'Inseguridad y duda', 'Sensación de fragilidad', 'Indiferencia total']),
                        respuesta_correcta: 0
                    }
                ]
            },
            {
                titulo: '4. Nuestra Visión',
                tipo: 'imagen',
                imagen_url: '/assets/img/induccion/foto3_vision.png',
                video_url: null,
                contenido: `NUESTRA VISIÓN:

Para el año 2028, Fragancias de Alta Densidad busca consolidarse como una marca referente en el mercado colombiano de fragancias, reconocida por la calidad de sus precios accesibles y la atención personalizada. Aspiramos a fortalecer nuestra presencia en diferentes regiones del país y continuar innovando para ofrecer experiencias únicas a nuestros clientes.`,
                orden: 4,
                preguntas: [
                    {
                        pregunta: '¿Para qué año proyecta la empresa consolidarse como marca referente en Colombia?',
                        opciones: JSON.stringify(['2025', '2028', '2030', '2040']),
                        respuesta_correcta: 1
                    },
                    {
                        pregunta: '¿Por qué atributos busca ser reconocida Alta Densidad según su visión?',
                        opciones: JSON.stringify(['Precios altos y atención impersonal', 'Calidad de precios accesibles y atención personalizada', 'Cierre de puntos de venta', 'Poca variedad de fragancias']),
                        respuesta_correcta: 1
                    },
                    {
                        pregunta: '¿Hacia qué metas de expansión se encamina la visión organizacional?',
                        opciones: JSON.stringify(['Fortalecer la presencia en diferentes regiones del país e innovar continuamente', 'Permanecer en una sola ciudad sin crecer', 'Abandonar el mercado nacional', 'Vender solo por catálogo impreso']),
                        respuesta_correcta: 0
                    }
                ]
            },
            {
                titulo: '5. Nuestra Historia',
                tipo: 'imagen',
                imagen_url: '/assets/img/induccion/foto4_historia.png',
                video_url: null,
                contenido: `NUESTRA HISTORIA:

Una historia que comenzó con un sueño y hoy sigue creciendo para dejar huella en cada aroma.

• 2024 - Nace nuestra marca: Surge la idea de crear perfumes duraderos, de alta calidad y a precios accesibles, pensando en todas las personas.
• 2024 - 2025 - Primeros pasos: Comenzamos a construir nuestra identidad, a conocer los gustos de nuestros clientes y a ampliar nuestra variedad de fragancias.
• 2025 - Crecimiento: Nuestra marca empieza a ganar reconocimiento gracias a la calidad de nuestros productos, precios competitivos y atención cercana.
• 2026 - Consolidación: Fortalecemos nuestro portafolio y mejoramos continuamente nuestros productos, buscando ofrecer una experiencia de compra cada vez mejor.
• Nuevos Proyectos: Apostamos por seguir innovando y proyectamos el desarrollo de fragancias propias que nos permitan diferenciarnos y ofrecer aromas únicos.`,
                orden: 5,
                preguntas: [
                    {
                        pregunta: '¿En qué año nació la marca Fragancias Alta Densidad?',
                        opciones: JSON.stringify(['2022', '2024', '2025', '2026']),
                        respuesta_correcta: 1
                    },
                    {
                        pregunta: '¿Qué hito marca el año 2026 en la línea de tiempo de la empresa?',
                        opciones: JSON.stringify(['Consolidación y fortalecimiento del portafolio', 'Nacimiento de la idea inicial', 'Primeros pasos de exploración', 'Creación de marca externa']),
                        respuesta_correcta: 0
                    },
                    {
                        pregunta: '¿En qué consisten los nuevos proyectos de Alta Densidad?',
                        opciones: JSON.stringify(['Innovar continuamente y proyectar el desarrollo de fragancias propias', 'Detener el desarrollo de perfumes', 'Vender solo fragancias importadas de terceros', 'Descontinuar productos']),
                        respuesta_correcta: 0
                    }
                ]
            },
            {
                titulo: '6. Nuestro Reglamento Interno (Líder de Punto)',
                tipo: 'imagen',
                imagen_url: '/assets/img/induccion/foto5_reglamento.png',
                video_url: null,
                contenido: `NUESTRO REGLAMENTO INTERNO - APLICADO: LÍDER DE PUNTO (VERSIÓN 1.0):

Este reglamento establece los lineamientos, políticas operativas, código de vestimenta, horarios, manejo confidencial y deberes fundamentales para los colaboradores y Líderes de Punto de Alta Densidad, garantizando un ambiente seguro, transparente y profesional.`,
                orden: 6,
                preguntas: [
                    {
                        pregunta: '¿A qué cargo o rol aplica específicamente la Versión 1.0 de este reglamento expuesto?',
                        opciones: JSON.stringify(['Líder de Punto', 'Cliente ocasional', 'Empresa de envíos', 'Diseñador externo']),
                        respuesta_correcta: 0
                    },
                    {
                        pregunta: '¿Cuál es el propósito del Reglamento Interno de Trabajo?',
                        opciones: JSON.stringify(['Garantizar normas, deberes, seguridad y excelencia operacional', 'Imponer sanciones arbitrarias', 'Limitar los derechos laborales', 'Aumentar el precio de venta']),
                        respuesta_correcta: 0
                    },
                    {
                        pregunta: '¿Por qué es importante que el Líder de Punto cumpla y haga cumplir este reglamento?',
                        opciones: JSON.stringify(['Para asegurar la calidad en la atención, la disciplina y el adecuado funcionamiento del punto de venta', 'No es necesario si hay buenas ventas', 'Solo aplica durante las auditorías', 'Únicamente por orden administrativa voluntaria']),
                        respuesta_correcta: 0
                    }
                ]
            },
            {
                titulo: '7. Horario de Trabajo - Líder de Punto',
                tipo: 'imagen',
                imagen_url: '/assets/img/induccion/foto6_horario.png',
                video_url: null,
                contenido: `HORARIO ESTABLECIDO PARA EL CARGO DE LÍDER DE PUNTO:

10:00 A. M. A 6:00 P. M.`,
                orden: 7,
                preguntas: [
                    {
                        pregunta: '¿Cuál es el horario establecido para el cargo de Líder de Punto en la empresa?',
                        opciones: JSON.stringify(['8:00 AM a 4:00 PM', '10:00 AM a 6:00 PM', '12:00 PM a 8:00 PM', '7:00 AM a 3:00 PM']),
                        respuesta_correcta: 1
                    },
                    {
                        pregunta: '¿A qué hora finaliza la jornada ordinaria del Líder de Punto según la programación establecida?',
                        opciones: JSON.stringify(['5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM']),
                        respuesta_correcta: 1
                    },
                    {
                        pregunta: '¿Por qué es indispensable conocer con claridad el horario del punto de venta?',
                        opciones: JSON.stringify(['Para coordinar la apertura, atención al cliente y operatividad del punto', 'No es necesario', 'Solo aplica para días festivos', 'Para retirarse antes de tiempo']),
                        respuesta_correcta: 0
                    }
                ]
            },
            {
                titulo: '8. Deberes del Colaborador y Puntualidad',
                tipo: 'imagen',
                imagen_url: '/assets/img/induccion/foto7_deberes_puntualidad.png',
                video_url: null,
                contenido: `EL COLABORADOR DEBERÁ:

• CUMPLIR PUNTUALMENTE EL HORARIO ESTABLECIDO.
• ESTAR PREPARADO PARA INICIAR SUS FUNCIONES A LAS 10:00 A. M.
• INFORMAR OPORTUNAMENTE CUALQUIER SITUACIÓN QUE PUEDA GENERAR RETRASOS O AUSENCIAS.
• RESPETAR LOS TIEMPOS DESTINADOS PARA ALIMENTACIÓN Y DESCANSO.
• NO ABANDONAR EL PUNTO DE VENTA DURANTE LA JORNADA SIN AUTORIZACIÓN CUANDO ESTO AFECTE LA OPERACIÓN.

LA PUNTUALIDAD SERÁ CONSIDERADA UN ELEMENTO FUNDAMENTAL DEL COMPROMISO Y LIDERAZGO DENTRO DE LA EMPRESA.`,
                orden: 8,
                preguntas: [
                    {
                        pregunta: '¿A qué hora debe estar preparado el colaborador para iniciar sus funciones?',
                        opciones: JSON.stringify(['10:00 A. M.', '10:30 A. M.', '11:00 A. M.', 'A cualquier hora sin afán']),
                        respuesta_correcta: 0
                    },
                    {
                        pregunta: '¿Qué debe hacer el colaborador ante una situación que pueda generar retraso o ausencia?',
                        opciones: JSON.stringify(['No avisar a nadie', 'Informar oportunamente a su administrador o supervisor', 'Esperar al día siguiente', 'Pedir a un cliente que avise']),
                        respuesta_correcta: 1
                    },
                    {
                        pregunta: '¿Cómo es considerada la puntualidad dentro de la cultura organizacional de Alta Densidad?',
                        opciones: JSON.stringify(['Como un elemento opcional', 'Como un elemento fundamental del compromiso y liderazgo', 'Sin importancia', 'Solo exigida en reuniones']),
                        respuesta_correcta: 1
                    }
                ]
            },
            {
                titulo: '9. Guía de Presentación Personal y Código de Vestimenta',
                tipo: 'imagen',
                imagen_url: '/assets/img/induccion/foto8_vestimenta.png',
                video_url: null,
                contenido: `GUÍA DE PRESENTACIÓN - LÍDER DE PUNTO:

VESTIMENTA PERMITIDA (CÓMO SE DEBE PRESENTAR):
Imagen cómoda, elegante, limpia y profesional. Refleja la marca.
✓ Camisas, blusas o polos de apariencia elegante.
✓ Pantalón formal, casual elegante o jean en buen estado.
✓ Calzado limpio, cómodo y apropiado.
✓ Prendas acordes con la imagen corporativa.

NO PERMITIDO (CÓMO NO SE DEBE PRESENTAR):
✕ Ropa rota, sucia o excesivamente informal.
✕ Chanclas o calzado inadecuado.
✕ Mensajes ofensivos o incompatibles.

PROFESIONALISMO Y EXCELENCIA.`,
                orden: 9,
                preguntas: [
                    {
                        pregunta: '¿Cuál es la prenda superior permitida según la guía de presentación corporativa?',
                        opciones: JSON.stringify(['Camisas, blusas o polos de apariencia elegante', 'Esqueletos sin mangas', 'Camisetas con mensajes ofensivos', 'Ropa sucia o descosida']),
                        respuesta_correcta: 0
                    },
                    {
                        pregunta: '¿Qué calzado está explícitamente NO PERMITIDO en el punto de venta?',
                        opciones: JSON.stringify(['Calzado cómodo, limpio y apropiado', 'Chanclas o calzado inadecuado', 'Zapatos formales limpios', 'Mocasines casuales elegantes']),
                        respuesta_correcta: 1
                    },
                    {
                        pregunta: '¿Qué proyecta la imagen personal del Líder de Punto ante el cliente?',
                        opciones: JSON.stringify(['Refleja la marca, el profesionalismo y la excelencia de Alta Densidad', 'Únicamente el gusto personal sin importar la marca', 'No influye en las ventas', 'Indiferencia total']),
                        respuesta_correcta: 0
                    }
                ]
            },
            {
                titulo: '10. Manejo de Información Confidencial',
                tipo: 'imagen',
                imagen_url: '/assets/img/induccion/foto9_confidencialidad.png',
                video_url: null,
                contenido: `SE CONSIDERARÁ INFORMACIÓN CONFIDENCIAL, ENTRE OTROS:

• Recetas y fórmulas de preparación.
• Proporciones y concentraciones utilizadas.
• Procesos internos de elaboración, métodos de preparación y maceración.
• Información de proveedores, costos y precios internos.
• Márgenes de ganancia y estrategias comerciales.
• Información de clientes y datos financieros.
• Inventarios y movimientos internos.
• Contraseñas y accesos a plataformas de la empresa.
• Documentos internos y estrategias de marketing antes de su publicación.`,
                orden: 10,
                preguntas: [
                    {
                        pregunta: '¿Cuál de las siguientes opciones se considera información altamente confidencial de la empresa?',
                        opciones: JSON.stringify(['Recetas, fórmulas de preparación, proporciones y accesos a plataformas', 'El nombre comercial público de la marca', 'La dirección física del punto de venta expuesta', 'El catálogo general disponible en la web']),
                        respuesta_correcta: 0
                    },
                    {
                        pregunta: '¿Se pueden divulgar costos internos, márgenes de ganancia o proveedores a personas externas?',
                        opciones: JSON.stringify(['Sí, a cualquier amigo', 'No, es estrictamente confidencial y reservado de la compañía', 'Solo por redes sociales personales', 'Depende del día de la semana']),
                        respuesta_correcta: 1
                    },
                    {
                        pregunta: '¿Qué manejo se debe dar a las contraseñas y accesos a las plataformas del sistema?',
                        opciones: JSON.stringify(['Compartirlas abiertamente', 'Mantenerlas bajo estricta confidencialidad y uso autorizado', 'Anotarlas en lugares públicos visiblemente', 'Ninguno']),
                        respuesta_correcta: 1
                    }
                ]
            },
            {
                titulo: '11. Identificación, Liderazgo Positivo y Responsabilidades',
                tipo: 'imagen',
                imagen_url: '/assets/img/induccion/foto10_liderazgo.png',
                video_url: null,
                contenido: `IDENTIFICACIÓN DEL LÍDER DE PUNTO:

EL LÍDER COMO REFERENCIA:
El Líder de Punto será una figura de referencia para clientes y colaboradores. Su liderazgo se basa en el respeto, el ejemplo, la comunicación y la responsabilidad, evitando cualquier conducta de maltrato, humillación o abuso de autoridad.

RESPONSABILIDADES CLAVE:
✓ Supervisar el correcto funcionamiento del punto.
✓ Orientar y apoyar a los colaboradores.
✓ Garantizar una adecuada atención al cliente.
✓ Verificar el orden, presentación e inventarios.
✓ Reportar novedades y velar por el cumplimiento.

PRÁCTICAS PROHIBIDAS:
✕ Maltrato o humillación.
✕ Abuso de autoridad.

LIDERAZGO POSITIVO: Respeto, Ejemplo y Comunicación.`,
                orden: 11,
                preguntas: [
                    {
                        pregunta: '¿En qué valores se fundamenta el liderazgo del Líder de Punto?',
                        opciones: JSON.stringify(['Abuso de poder y sanciones', 'Respeto, ejemplo, comunicación y responsabilidad', 'Indiferencia hacia los colaboradores', 'Favoritismos e informalidad']),
                        respuesta_correcta: 1
                    },
                    {
                        pregunta: '¿Cuáles de las siguientes son prácticas prohibidas en el liderazgo de Alta Densidad?',
                        opciones: JSON.stringify(['Supervisar inventarios y apoyar al equipo', 'Maltrato, humillación y abuso de autoridad', 'Garantizar buena atención al cliente', 'Reportar novedades oportunamente']),
                        respuesta_correcta: 1
                    },
                    {
                        pregunta: '¿Cuál es una responsabilidad clave del Líder de Punto?',
                        opciones: JSON.stringify(['Supervisar el correcto funcionamiento, orientar colaboradores y garantizar excelente atención', 'Ignorar el orden del punto', 'Delegar todas sus responsabilidades a clientes', 'No reportar novedades del punto']),
                        respuesta_correcta: 0
                    }
                ]
            },
            {
                titulo: '12. Uso Responsable de Redes Sociales y Celular',
                tipo: 'imagen',
                imagen_url: '/assets/img/induccion/foto11_redes_celular.png',
                video_url: null,
                contenido: `USO DE REDES SOCIALES Y CELULAR:

El uso del teléfono celular durante la jornada deberá ser responsable y no afectar la atención al cliente ni las funciones asignadas.

CONTENIDO PROHIBIDO DE PUBLICAR POR EL COLABORADOR:
✕ Recetas o fórmulas de preparación.
✕ Procesos internos no autorizados.
✕ Información financiera o de ventas.
✕ Datos personales de clientes.
✕ Conversaciones internas de la empresa.
✕ Fotografías de documentos privados.

LAS REDES SOCIALES COMO LÍDER:
Publicación responsable con respeto y alineada a las directrices de la administración.`,
                orden: 12,
                preguntas: [
                    {
                        pregunta: '¿Cómo debe ser el uso del teléfono celular durante la jornada laboral?',
                        opciones: JSON.stringify(['Libre y sin restricciones en todo momento', 'Responsable, sin afectar la atención al cliente ni las funciones asignadas', 'Prohibido de llevar en el bolsillo', 'Solo para juegos en línea']),
                        respuesta_correcta: 1
                    },
                    {
                        pregunta: '¿Cuál de las siguientes publicaciones está estrictamente PROHIBIDA para un colaborador?',
                        opciones: JSON.stringify(['Publicar recetas, fórmulas, conversaciones internas y datos de clientes', 'Compartir promociones públicas oficiales', 'Difundir la imagen corporativa autorizada', 'Saludar a los seguidores de la página oficial']),
                        respuesta_correcta: 0
                    },
                    {
                        pregunta: '¿A qué directrices debe alinearse cualquier publicación sobre la empresa en redes sociales?',
                        opciones: JSON.stringify(['A las opiniones del público', 'A las directrices y normas establecidas por la administración', 'A lo que cada colaborador desee libremente', 'A publicaciones de otras marcas']),
                        respuesta_correcta: 1
                    }
                ]
            },
            {
                titulo: '13. Uso de Elementos y Recursos de la Empresa',
                tipo: 'imagen',
                imagen_url: '/assets/img/induccion/foto12_recursos_empresa.png',
                video_url: null,
                contenido: `USO DE ELEMENTOS Y RECURSOS DE LA EMPRESA:

USO EXCLUSIVO AUTORIZADO - RECURSOS DE FRAGANCIAS DE ALTA DENSIDAD:
- Equipos y hardware (computadores, impresoras).
- Materiales y Productos.
- Documentos y Cuentas.
- Herramientas de trabajo.
- Dispositivos de comunicación.
- Uniformes y EPP (Elementos de Protección Personal).

CUIDADO Y RESPONSABILIDAD:
Cuidado activo y reporte inmediato. Los recursos deberán utilizarse exclusivamente para las actividades autorizadas. El colaborador deberá reportar inmediatamente cualquier daño, pérdida o uso no autorizado.`,
                orden: 13,
                preguntas: [
                    {
                        pregunta: '¿Para qué actividades deben utilizarse los recursos y equipos de la empresa?',
                        opciones: JSON.stringify(['Para actividades personales y comerciales propias', 'Exclusivamente para las actividades autorizadas de la empresa', 'Para prestar a amigos o terceros', 'Para cualquier uso libre']),
                        respuesta_correcta: 1
                    },
                    {
                        pregunta: '¿Qué debe hacer un colaborador si detecta daños, pérdidas o un uso no autorizado en los elementos de la empresa?',
                        opciones: JSON.stringify(['Ocultar la situación', 'Reportar inmediatamente el daño o novedad', 'Esperar a fin de año', 'Comprar un reemplazo por su cuenta sin avisar']),
                        respuesta_correcta: 1
                    },
                    {
                        pregunta: '¿Cuáles de los siguientes son considerados recursos de la empresa sujetos a cuidado activo?',
                        opciones: JSON.stringify(['Equipos, materiales, documentos, herramientas, dispositivos de comunicación, uniformes y EPP', 'Únicamente el teléfono personal', 'Los elementos traídos por el cliente', 'Solo los avisos publicitarios del exterior']),
                        respuesta_correcta: 0
                    }
                ]
            },
            {
                titulo: '14. Incumplimiento y Debido Proceso',
                tipo: 'imagen',
                imagen_url: '/assets/img/induccion/foto13_incumplimiento.png',
                video_url: null,
                contenido: `INCUMPLIMIENTO DEL REGLAMENTO INTERNO:

El incumplimiento de las disposiciones establecidas en este reglamento podrá generar las medidas correspondientes de acuerdo con la gravedad de la situación, las políticas internas de la empresa y la legislación laboral colombiana aplicable.

GARANTÍA DE DEBIDO PROCESO:
Antes de imponer cualquier medida disciplinaria se deberá garantizar el debido proceso correspondiente.`,
                orden: 14,
                preguntas: [
                    {
                        pregunta: '¿Bajo qué marco se determinan las medidas ante un incumplimiento del reglamento interno?',
                        opciones: JSON.stringify(['De acuerdo a la gravedad, las políticas internas y la legislación laboral colombiana', 'Según decisiones improvisadas sin justificación', 'Únicamente por votación de clientes', 'Sin considerar las leyes laborales']),
                        respuesta_correcta: 0
                    },
                    {
                        pregunta: '¿Qué principio fundamental se debe garantizar siempre antes de aplicar cualquier medida disciplinaria?',
                        opciones: JSON.stringify(['El debido proceso correspondiente', 'La sanción inmediata sin escuchar', 'La renuncia forzada', 'La divulgación pública']),
                        respuesta_correcta: 0
                    },
                    {
                        pregunta: '¿Por qué es importante el debido proceso dentro de la empresa?',
                        opciones: JSON.stringify(['Garantiza transparencia, derecho a la defensa y cumplimiento legal justo', 'Para demorar las decisiones', 'No aporta ningún valor', 'Solo aplica para el personal administrativo']),
                        respuesta_correcta: 0
                    }
                ]
            },
            {
                titulo: '15. Portafolio de Productos - Introducción',
                tipo: 'imagen',
                imagen_url: '/assets/img/induccion/foto14_portafolio_introduccion.png',
                video_url: null,
                contenido: `FRAGANCIAS DE ALTA DENSIDAD: PORTAFOLIO DE PRODUCTOS

"La esencia de lujo a una fracción del precio"

Bienvenido a la sección del portafolio comercial. Aquí aprenderás a identificar nuestras líneas principales de productos, perfumes originales, preparaciones y presentaciones corporativas.`,
                orden: 15,
                preguntas: [
                    {
                        pregunta: '¿Cuál es el lema distintivo de Fragancias de Alta Densidad expuesto en el portafolio de productos?',
                        opciones: JSON.stringify(['"La esencia de lujo a una fracción del precio"', '"Fragancias comunes para todos"', '"Ventas únicamente exclusivas"', '"Sin fijación ni garantía"']),
                        respuesta_correcta: 0
                    },
                    {
                        pregunta: '¿Cuál es el objetivo de estudiar el Portafolio de Productos en la inducción?',
                        opciones: JSON.stringify(['Conocer las líneas, presentaciones y oferta comercial para asesorar eficazmente al cliente', 'Solo memorizar nombres sin entenderlos', 'Reemplazar el inventario', 'Ninguno']),
                        respuesta_correcta: 0
                    },
                    {
                        pregunta: '¿Qué valor diferencial aporta la propuesta de valor de la marca al mercado?',
                        opciones: JSON.stringify(['Fragancias premium de alta concentración y durabilidad accesibles', 'Precios excesivamente elevados', 'Menor variedad de aromas', 'Aromas sintéticos de corta duración']),
                        respuesta_correcta: 0
                    }
                ]
            },
            {
                titulo: '16. Nuestra Línea de Productos',
                tipo: 'imagen',
                imagen_url: '/assets/img/induccion/foto15_linea_productos.png',
                video_url: null,
                contenido: `NUESTRA LÍNEA DE PRODUCTOS:

1. Perfumería Original
2. Perfumería Preparada
3. Dickens
4. Splash Corporal`,
                orden: 16,
                preguntas: [
                    {
                        pregunta: '¿Cuáles son las 4 categorías o líneas principales de productos de Alta Densidad?',
                        opciones: JSON.stringify(['Perfumería original, Perfumería preparada, Dickens y Splash corporal', 'Solo ambientadores de carro', 'Gaseosas y bebidas', 'Únicamente cremas de manos']),
                        respuesta_correcta: 0
                    },
                    {
                        pregunta: '¿Qué categoría hace referencia a las fragancias corporales ligeras y refrescantes del portafolio?',
                        opciones: JSON.stringify(['Splash corporal', 'Perfumería preparada concentrada', 'Colección de envases', 'Línea de jabones']),
                        respuesta_correcta: 0
                    },
                    {
                        pregunta: '¿Por qué es indispensable que el Líder de Punto diferencie la perfumería original de la preparada?',
                        opciones: JSON.stringify(['Para brindar la asesoría correcta sobre fijación, composición y preferencias del cliente', 'Para cobrar precios aleatorios', 'No es necesario diferenciarlas', 'Solo para el empaque secundario']),
                        respuesta_correcta: 0
                    }
                ]
            },
            {
                titulo: '17. Perfumería Original',
                tipo: 'imagen',
                imagen_url: '/assets/img/induccion/foto16_perfumeria_original.png',
                video_url: null,
                contenido: `PERFUMERÍA ORIGINAL:

Es aquella que se vende oficialmente desde la casa o marca de dicho perfume. Vienen con sellos y tarjetas que aseguran la procedencia del perfume.`,
                orden: 17,
                preguntas: [
                    {
                        pregunta: '¿Qué caracteriza a la Perfumería Original dentro de la oferta de la tienda?',
                        opciones: JSON.stringify(['Es vendida oficialmente desde la casa o marca de origen con sellos y tarjetas de procedencia', 'Se prepara manualmente en el punto sin empaque original', 'Es una imitación sin garantía', 'Se vende a granel sin sello']),
                        respuesta_correcta: 0
                    },
                    {
                        pregunta: '¿Qué elementos aseguran la procedencia y autenticidad de un perfume original?',
                        opciones: JSON.stringify(['Los sellos, empaques oficiales y tarjetas de garantía', 'Un recibo hecho a mano', 'La recomendación verbal', 'Ningún elemento']),
                        respuesta_correcta: 0
                    },
                    {
                        pregunta: '¿Por qué es importante explicar la procedencia original al cliente interesado en marcas de casa?',
                        opciones: JSON.stringify(['Para respaldar la autenticidad y generar total confianza en su compra', 'No tiene importancia', 'Para aumentar los impuestos', 'Solo para la facturación interna']),
                        respuesta_correcta: 0
                    }
                ]
            },
            {
                titulo: '18. Perfumería Preparada',
                tipo: 'imagen',
                imagen_url: '/assets/img/induccion/foto17_perfumeria_preparada.png',
                video_url: null,
                contenido: `PERFUMERÍA PREPARADA:

Es una alternativa creada para quienes buscan disfrutar de fragancias con perfiles olfativos inspirados en perfumes reconocidos, ofreciendo una excelente relación entre calidad, duración y precio.

Son una opción independiente, inspirada en diferentes estilos y familias olfativas.
Vienen en diferentes presentaciones de 30, 60 y 100 ML.`,
                orden: 18,
                preguntas: [
                    {
                        pregunta: '¿Qué es la Perfumería Preparada en Alta Densidad?',
                        opciones: JSON.stringify(['Una opción independiente inspirada en perfumes reconocidos con excelente relación calidad, duración y precio', 'Una copia barata sin aroma', 'Un perfume usado', 'Un ambientador textil']),
                        respuesta_correcta: 0
                    },
                    {
                        pregunta: '¿En qué presentaciones de mililitros (ML) vienen las fragancias preparadas?',
                        opciones: JSON.stringify(['30, 60 y 100 ML', '5 y 10 ML solamente', '200 y 500 ML', '1 litro']),
                        respuesta_correcta: 0
                    },
                    {
                        pregunta: '¿Por qué la perfumería preparada es muy atractiva para los clientes?',
                        opciones: JSON.stringify(['Ofrece perfiles olfativos reconocidos de alta concentración a un precio accesible', 'Es difícil de conseguir', 'Tiene empaques desechables de plástico fino', 'No tiene variedad']),
                        respuesta_correcta: 0
                    }
                ]
            },
            {
                titulo: '19. Línea Dickens (Mini Perfumes 10ML)',
                tipo: 'imagen',
                imagen_url: '/assets/img/induccion/foto18_dickens.png',
                video_url: null,
                contenido: `DICKENS:

Son mini perfumes, perfectos para llevar en el bolso o tener una primera impresión sobre el perfume que desea el cliente comprar.

Vienen en presentaciones de 10ML y su precio depende de si son extraídas de perfumes originales o preparadas.`,
                orden: 19,
                preguntas: [
                    {
                        pregunta: '¿Qué es la línea Dickens en el portafolio de Alta Densidad?',
                        opciones: JSON.stringify(['Mini perfumes de 10ML prácticos para el bolso o como primera prueba de fragancia', 'Cosméticos de maquillaje', 'Frascos gigantes de exhibición', 'Muestras gratuitas de papel']),
                        respuesta_correcta: 0
                    },
                    {
                        pregunta: '¿Cuál es la presentación en volumen de la línea Dickens?',
                        opciones: JSON.stringify(['10 ML', '30 ML', '50 ML', '100 ML']),
                        respuesta_correcta: 0
                    },
                    {
                        pregunta: '¿De qué depende el precio final de un mini perfume Dickens?',
                        opciones: JSON.stringify(['De si la fragancia es extraída de perfume original o si es preparada', 'Del color de la tapa solamente', 'De la hora de compra', 'Es un precio fijo en todos los productos']),
                        respuesta_correcta: 0
                    }
                ]
            },
            {
                titulo: '20. Experiencias de Compra y Canales de Venta',
                tipo: 'imagen',
                imagen_url: '/assets/img/induccion/foto19_experiencias_compra.png',
                video_url: null,
                contenido: `EXPERIENCIAS DE COMPRA ALTA DENSIDAD:

Atención, calidad, asesoría olfativa, tiempo de envío y diversidad de canales de venta.

• Punto de Venta Físico (Boutique)
• Omnichannel Web (Tienda virtual e integrada)
• Venta Corporativa y Regalos`,
                orden: 20,
                preguntas: [
                    {
                        pregunta: '¿Cuáles son los pilares de las Experiencias de Compra en Alta Densidad?',
                        opciones: JSON.stringify(['Atención, calidad, asesoría, tiempo de envío y canales de venta', 'Demora en entregas y desatención', 'Ventas informales sin comprobante', 'Únicamente compras al por mayor']),
                        respuesta_correcta: 0
                    },
                    {
                        pregunta: '¿Cuáles de los siguientes son canales de venta oficiales de la empresa?',
                        opciones: JSON.stringify(['Punto de Venta Físico, Omnichannel Web y Venta Corporativa & Regalos', 'Únicamente ventas callejeras', 'Ventas por subasta informal', 'Revendedores sin autorización']),
                        respuesta_correcta: 0
                    },
                    {
                        pregunta: '¿Por qué la asesoría personalizada es clave en la experiencia del cliente?',
                        opciones: JSON.stringify(['Ayuda a guiarlo según sus notas y familias olfativas preferidas asegurando una compra memorable', 'Para forzar las ventas masivas', 'No influye en el cliente', 'Para cobrar recargos']),
                        respuesta_correcta: 0
                    }
                ]
            },
            {
                titulo: '21. Compromiso Organizacional y Excelencia en el Servicio',
                tipo: 'imagen',
                imagen_url: '/assets/img/induccion/foto20_compromiso_portafolio.png',
                video_url: null,
                contenido: `COMPROMISO CON NUESTROS CLIENTES:

En Fragancias de Alta Densidad contamos con un portafolio pensado para ofrecer diferentes opciones y experiencias a nuestros clientes. Desde la perfumería original hasta nuestras fragancias preparadas y presentaciones DICKENS, buscamos brindar variedad, calidad y alternativas para cada necesidad.

Nuestro compromiso es que cada integrante del equipo conozca nuestro portafolio y pueda asesorar al cliente con seguridad, honestidad y excelente servicio.

Fragancias de Alta Densidad: una fragancia para cada estilo, una experiencia para recordar.`,
                orden: 21,
                preguntas: [
                    {
                        pregunta: '¿Cuál es el compromiso fundamental de todo integrante del equipo Alta Densidad?',
                        opciones: JSON.stringify(['Conocer el portafolio y asesorar al cliente con seguridad, honestidad y excelente servicio', 'Desconocer las líneas de perfumes', 'Atender solo cuando el cliente insista', 'Cambiar las fórmulas']),
                        respuesta_correcta: 0
                    },
                    {
                        pregunta: '¿Qué busca ofrecer la empresa a través de la diversidad de su portafolio?',
                        opciones: JSON.stringify(['Variedad, calidad y alternativas para cada estilo y necesidad del cliente', 'Productos de baja duración', 'Limitación de opciones', 'Precios inalcanzables']),
                        respuesta_correcta: 0
                    },
                    {
                        pregunta: '¿Cuál es el lema final de cierre del portafolio e identidad de la marca?',
                        opciones: JSON.stringify(['"Una fragancia para cada estilo, una experiencia para recordar"', '"Ventas sin garantía"', '"Perfumes temporales"', '"Solo fragancias importadas"']),
                        respuesta_correcta: 0
                    }
                ]
            }
        ];

        // Desactivar items antiguos con orden superior a los 6 nuevos
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
                console.log(`Módulo actualizado: "${mod.titulo}" (ID: ${itemId})`);
            } else {
                const [ins] = await pool.query(
                    'INSERT INTO CapacitacionItems (titulo, contenido, tipo, imagen_url, video_url, orden, activo) VALUES (?, ?, ?, ?, ?, ?, 1)',
                    [mod.titulo, mod.contenido, mod.tipo, mod.imagen_url, mod.video_url, mod.orden]
                );
                itemId = ins.insertId;
                console.log(`Módulo creado: "${mod.titulo}" (ID: ${itemId})`);
            }

            await pool.query('DELETE FROM CapacitacionPreguntas WHERE item_id = ?', [itemId]);
            for (let idx = 0; idx < mod.preguntas.length; idx++) {
                const p = mod.preguntas[idx];
                await pool.query(
                    'INSERT INTO CapacitacionPreguntas (item_id, pregunta, opciones, respuesta_correcta, orden) VALUES (?, ?, ?, ?, ?)',
                    [itemId, p.pregunta, p.opciones, p.respuesta_correcta, idx + 1]
                );
            }
            console.log(`  -> ${mod.preguntas.length} preguntas de validación asociadas al Módulo ${itemId}.`);
        }

        console.log('--- Siembra de Capacitación Finalizada con Éxito ---');
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
