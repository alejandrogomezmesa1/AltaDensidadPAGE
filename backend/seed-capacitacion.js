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
