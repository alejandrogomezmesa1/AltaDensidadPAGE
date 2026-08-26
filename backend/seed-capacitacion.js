const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { getConnection } = require('./config/db');

async function seedCapacitacion(existingPool) {
    console.log('--- Iniciando Siembra de Datos de Capacitación e Inducción ---');
    try {
        const pool = existingPool || await getConnection();

        // 1. Módulos de Capacitación
        const modulos = [
            {
                titulo: '1. Introducción a Perfumería Alta Densidad',
                contenido: `Bienvenido a Perfumería Alta Densidad. Nuestra empresa se dedica a la elaboración y comercialización de fragancias de alta calidad, inspiración y nicho internacional en Colombia. 
                
Nuestros pilares fundamentales son:
- Alta Fijación y Concentración: Todas nuestras fragancias utilizan esencias premium de alta concentración (Parfum / Extrait de Parfum).
- Calidad y Transparencia: Garantizamos una experiencia olfativa superior con estándares rigurosos.
- Orientación al Cliente: Buscamos brindar asesoría personalizada y un servicio memorable en cada compra.`,
                orden: 1,
                preguntas: [
                    {
                        pregunta: '¿Cuál es el diferencial principal de las fragancias de Alta Densidad?',
                        opciones: JSON.stringify(['Aromas sintéticos de baja duración', 'Alta concentración de esencia y fijación premium', 'Solo vender envases vacíos', 'Productos únicamente importados sin sello']),
                        respuesta_correcta: 1
                    },
                    {
                        pregunta: '¿Cuál es uno de los pilares fundamentales de la empresa?',
                        opciones: JSON.stringify(['Descuentos masivos sin control', 'Calidad, alta fijación y orientación al cliente', 'No ofrecer atención personalizada', 'Ventas únicamente al por mayor']),
                        respuesta_correcta: 1
                    },
                    {
                        pregunta: '¿En qué país opera y comercializa principalmente la marca Alta Densidad?',
                        opciones: JSON.stringify(['México', 'España', 'Colombia', 'Argentina']),
                        respuesta_correcta: 2
                    }
                ]
            },
            {
                titulo: '2. Catálogo de Productos, Categorías y Envases',
                contenido: `En Alta Densidad manejamos diversas categorías de productos:
1. Diseñador (Mujer, Hombre, Unisex): Inspiraciones de marcas icónicas como Carolina Herrera, Chanel, Dolce & Gabbana.
2. Árabe / Nicho: Perfumería oriental intensa con notas amaderadas, resinas y especias como Santal 33, Erba Pura, Ahli Karpos.
3. Envases Exclusivos: Disponemos de frascos de alta presentación como Amira, Cartier, Cilindro, Victory, Eros, Good Girl y Calavera.

Es fundamental conocer el catálogo para orientar correctamente al cliente sobre notas, familias olfativas y recomendaciones de uso.`,
                orden: 2,
                preguntas: [
                    {
                        pregunta: '¿Qué categorías de perfumes se destacan en el catálogo?',
                        opciones: JSON.stringify(['Solo ambientadores de autos', 'Diseñador, Árabe / Nicho y Envases Exclusivos', 'Solo cosméticos faciales', 'Detergentes y limpieza']),
                        respuesta_correcta: 1
                    },
                    {
                        pregunta: '¿Cuál de los siguientes es un ejemplo de envase de vidrio exclusivo del catálogo?',
                        opciones: JSON.stringify(['Lata de aluminio básica', 'Amira / Cartier / Cilindro / Victory', 'Bolsa de cartón', 'Plástico reciclado flexible']),
                        respuesta_correcta: 1
                    },
                    {
                        pregunta: '¿Por qué es importante que un colaborador conozca el catálogo a detalle?',
                        opciones: JSON.stringify(['Para subir precios arbitrariamente', 'Para recomendar adecuadamente notas y familias olfativas al cliente', 'No es necesario conocerlo', 'Solo para el inventario físico']),
                        respuesta_correcta: 1
                    }
                ]
            },
            {
                titulo: '3. Protocolo de Atención, Envíos y Administración de Pedidos',
                contenido: `Para mantener la excelencia operacional en el panel de administración:
- Confirmación de Pagos: Todos los pedidos ingresan mediante nuestra pasarela de pagos integrada (Mercado Pago).
- Despachos y Logística: Se debe verificar la información completa de envío (Nombre, Documento, Dirección, Municipio, Celular de Contacto).
- Integridad de Datos: El administrador o colaborador no debe alterar estados de orden sin previa verificación de la pasarela.
- Comunicación: Mantener respeto y comunicación rápida vía WhatsApp con los clientes para actualizaciones de guía de envío.`,
                orden: 3,
                preguntas: [
                    {
                        pregunta: '¿Qué pasarela principal procesa las transacciones en el sitio web?',
                        opciones: JSON.stringify(['Stripe', 'Mercado Pago', 'PayPal', 'Transferencia manual únicamente']),
                        respuesta_correcta: 1
                    },
                    {
                        pregunta: '¿Qué datos son obligatorios para garantizar un despacho correcto?',
                        opciones: JSON.stringify(['Solo el primer nombre', 'Nombre completo, documento, dirección exacta, municipio y celular', 'Únicamente el correo electrónico', 'Foto del comprador']),
                        respuesta_correcta: 1
                    },
                    {
                        pregunta: '¿Cuál debe ser el canal ágil de soporte y notificación de guías con el cliente?',
                        opciones: JSON.stringify(['Correo postal físico', 'WhatsApp y canales oficiales', 'Redes sociales personales', 'No se notifica al cliente']),
                        respuesta_correcta: 1
                    }
                ]
            }
        ];

        for (let mod of modulos) {
            const [rows] = await pool.query('SELECT id FROM CapacitacionItems WHERE titulo = ?', [mod.titulo]);
            let itemId;
            if (rows.length > 0) {
                itemId = rows[0].id;
                await pool.query('UPDATE CapacitacionItems SET contenido = ?, orden = ? WHERE id = ?', [mod.contenido, mod.orden, itemId]);
                console.log(`Módulo actualizado: "${mod.titulo}" (ID: ${itemId})`);
            } else {
                const [ins] = await pool.query(
                    'INSERT INTO CapacitacionItems (titulo, contenido, orden, activo) VALUES (?, ?, ?, 1)',
                    [mod.titulo, mod.contenido, mod.orden]
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
