/**
 * INDUCCIÓN ESPECÍFICA · LÍDER DE PUNTO DE VENTA
 * Fragancias de Alta Densidad
 *
 * Cada módulo tiene bloques: texto, lista, pasos, aviso, tabla, comparar y sistemas.
 * Los pasos de caja e inventario describen las pantallas reales de Alta Densidad DATA
 * (Ventas, Compras, Gastos, Caja, Inventario, Cartera) y de SIIGO (factura electrónica).
 */
window.INDUCCION_ESPECIFICA = {
    clave: 'especifica',
    titulo: 'Inducción específica',
    cargo: 'Líder de Punto de Venta',
    descripcion: 'Lo que necesitas para liderar el punto: servicio, caja, sistemas, inventario, cuidado de la mercancía, equipo e indicadores.',
    modulos: [
        {
            id: 'cargo',
            titulo: 'Presentación y objetivo del cargo',
            resumen: 'Qué hace un Líder de Punto de Venta y por qué el punto es la cara de la marca.',
            bloques: [
                { tipo: 'texto', texto: 'Fragancias de Alta Densidad crea perfumería de alta concentración en Medellín: perfumes 1.1, perfumes preparados a la medida, decants de 10 ml, kits, esencias e insumos. El punto de venta es el lugar donde el cliente vive la marca: lo que ve, lo que huele y cómo lo atendemos es lo que recuerda.' },
                { tipo: 'lista', titulo: 'Objetivo del cargo', items: [
                    'Liderar la operación diaria del punto: apertura, ventas, caja, inventario y cierre.',
                    'Garantizar una atención exclusiva y una exhibición impecable.',
                    'Registrar cada venta y cada movimiento en los sistemas autorizados, sin excepciones.',
                    'Orientar al equipo y ser ejemplo de las normas de la empresa.',
                    'Cumplir las metas comerciales y los indicadores de gestión del punto.'
                ] },
                { tipo: 'tabla', titulo: 'Datos del cargo', columnas: ['Aspecto', 'Detalle'], filas: [
                    ['Horario', '10:00 a. m. a 6:00 p. m. (ver Reglamento interno en la Inducción general)'],
                    ['Reporta a', 'Administración / Gerencia'],
                    ['Sistemas a cargo', 'Alta Densidad DATA (ventas, caja, inventario), SIIGO (factura electrónica), datáfono y plataformas de pago'],
                    ['Uniforme', 'Estándar administrativo: polo negra con logotipo, jean negro y zapatos negros (ver Manual de vestimenta)']
                ] }
            ]
        },
        {
            id: 'servicio',
            titulo: 'Atención y servicio al cliente',
            resumen: 'Una experiencia de compra exclusiva, guiada por la pirámide olfativa.',
            bloques: [
                { tipo: 'pasos', titulo: 'La asesoría olfativa en cinco pasos', pasos: [
                    { t: 'Recibir', d: 'Saluda en los primeros segundos, con contacto visual y sin celular en la mano.' },
                    { t: 'Escuchar', d: 'Pregunta para quién es, en qué ocasión la usará y qué fragancias le gustan hoy.' },
                    { t: 'Orientar', d: 'Recomienda por familia y acorde principal (amaderado, cítrico, dulce…) y explica la pirámide: salida, corazón y fondo.' },
                    { t: 'Probar', d: 'Atomiza en tirilla o en la piel, a 15 cm, máximo tres fragancias por visita para no saturar el olfato. Ofrece granos de café entre pruebas.' },
                    { t: 'Cerrar', d: 'Confirma la elección, ofrece la presentación adecuada (1.1, preparado, decant de 10 ml para probar o kit) y registra la venta.' }
                ] },
                { tipo: 'lista', titulo: 'Lo que debes dominar', items: [
                    'Las líneas: perfumes 1.1, Crea tu perfume (envase, tamaño, esencia y feromonas), decants de 10 ml y sets de 3 y 5, kits, esencias e insumos.',
                    'Que todas nuestras fragancias son de alta concentración, con base de feromonas en los perfumes (los decants no llevan feromonas).',
                    'Los precios y promociones vigentes: los consultas en el sistema, nunca de memoria.'
                ] },
                { tipo: 'pasos', titulo: 'Novedades y reclamos (PQRS)', pasos: [
                    { t: 'Escuchar sin interrumpir', d: 'Agradece que lo cuente y toma nota de lo ocurrido, el producto y la fecha de compra.' },
                    { t: 'Verificar', d: 'Busca la venta en DATA (Ventas) por cliente o fecha y revisa la factura en SIIGO.' },
                    { t: 'Resolver o escalar', d: 'Si está dentro de tus facultades, resuelve en el momento. Si implica devolución de dinero, cambio de producto o un cliente molesto, escala a administración el mismo día.' },
                    { t: 'Registrar', d: 'Anota la PQRS en el registro del punto con la fecha de respuesta: así se mide el indicador de servicio.' }
                ] },
                { tipo: 'aviso', nivel: 'importante', texto: 'Nunca discutas con un cliente ni hagas promesas de producto que no puedas cumplir (por ejemplo, duraciones exactas). Lo que decimos: alta concentración y fijación de 12 horas o más según la piel.' }
            ]
        },
        {
            id: 'ventas',
            titulo: 'Gestión de ventas y exhibición',
            resumen: 'Metas, portafolio y un punto que vende solo.',
            bloques: [
                { tipo: 'lista', titulo: 'Impulso comercial', items: [
                    'Conoce la meta del mes y revisa a diario cómo va en DATA → Dashboard (ventas del período).',
                    'Ofrece el Top 10 del mes y las novedades; sugiere decants para quien duda entre dos fragancias.',
                    'Promueve los sets de decants y los kits para regalo.',
                    'Comparte con el equipo, cada mañana, la meta del día y las fragancias a impulsar.'
                ] },
                { tipo: 'comparar', titulo: 'Exhibición', bien: [
                    'Frascos alineados, limpios, con la etiqueta al frente.',
                    'Probadores marcados y con tirillas disponibles.',
                    'Precios visibles y actualizados con el sistema.',
                    'Producto agotado retirado de la exhibición.'
                ], mal: [
                    'Frascos con huellas, polvo o tapas sueltas.',
                    'Cajas vacías o bolsas sobre el mostrador.',
                    'Exhibición junto a la ventana con sol directo.',
                    'Precios escritos a mano o desactualizados.'
                ] }
            ]
        },
        {
            id: 'caja',
            titulo: 'Manejo de caja y dinero',
            resumen: 'Paso a paso de una venta, la caja del día y el cierre, en los aplicativos autorizados.',
            bloques: [
                { tipo: 'texto', texto: 'Toda venta se registra en dos lugares: en SIIGO, que emite la factura electrónica ante la DIAN, y en Alta Densidad DATA, que descuenta el inventario y alimenta la caja del día. Una venta que no está en DATA descuadra el inventario; una que no está en SIIGO es un problema tributario.' },
                { tipo: 'pasos', titulo: 'Registrar una venta en el punto', pasos: [
                    { t: 'Cliente', d: 'En DATA → Ventas → Nueva venta, busca al cliente por cédula. Si no existe, créalo con nombre, cédula, teléfono y ciudad (la cédula es única: no se duplica).', sistema: 'DATA' },
                    { t: 'Productos', d: 'Agrega cada producto con su cantidad. El sistema muestra el precio vigente y avisa si no hay existencias: no vendas lo que el sistema marca agotado sin autorización.', sistema: 'DATA' },
                    { t: 'Medio de pago', d: 'Elige el método real (efectivo, tarjeta, Nequi, Daviplata, transferencia, QR, Sistecrédito, Addi). Si el cliente deja un abono, regístralo: la venta queda pendiente y pasa a Cartera.', sistema: 'DATA' },
                    { t: 'Verificar el pago', d: 'Efectivo: cuenta frente al cliente y revisa los billetes. Tarjeta: espera APROBADO en el datáfono. Digital: confirma que el dinero llegó a la cuenta oficial (no basta una captura). Crédito: valida identidad y código de aprobación en la plataforma.', sistema: 'Datáfono / plataformas' },
                    { t: 'Factura electrónica', d: 'Emite la factura en SIIGO con los mismos productos, valores y medio de pago, y envíala al correo del cliente.', sistema: 'SIIGO' },
                    { t: 'Entregar', d: 'Empaca con la bolsa y el sticker de la marca y entrega solo cuando el pago esté confirmado.' }
                ] },
                { tipo: 'pasos', titulo: 'Gastos y compras del día', pasos: [
                    { t: 'Gasto', d: 'Todo dinero que sale de caja (domicilio, insumos de aseo…) se registra en DATA → Gastos, con su categoría y el soporte físico guardado.', sistema: 'DATA' },
                    { t: 'Compra de mercancía', d: 'La mercancía que llega se registra en DATA → Compras (proveedor, cantidad y costo): así entra al inventario y se actualiza el costo.', sistema: 'DATA' }
                ] },
                { tipo: 'pasos', titulo: 'Cierre de caja', pasos: [
                    { t: 'Revisar el resumen', d: 'En DATA → Caja verás: ingresos en efectivo (ventas y abonos), otros medios (tarjeta, Nequi, transferencias, web), egresos (gastos y compras) y el efectivo esperado en caja.', sistema: 'DATA' },
                    { t: 'Arqueo', d: 'Cuenta el efectivo físico por denominación y compáralo con el «Efectivo en caja» del sistema. Cuadra también los vouchers del datáfono y los pagos digitales.' },
                    { t: 'Diferencias', d: 'Si no cuadra, revisa ventas sin registrar, gastos sin soporte o pagos mal clasificados. La diferencia que persista se reporta por escrito a administración ese mismo día; nunca se completa con dinero propio ni se «guarda» para mañana.' },
                    { t: 'Cerrar', d: 'Pulsa «Cerrar caja de hoy». El cierre queda en el historial con su detalle y no se edita después.', sistema: 'DATA' },
                    { t: 'Resguardar', d: 'El efectivo y los soportes se guardan o consignan según el procedimiento de la empresa. La base de caja queda lista para el día siguiente.' }
                ] },
                { tipo: 'aviso', nivel: 'prohibido', texto: 'Prohibido: préstamos o retiros personales de la caja, vender sin registrar, cambiar precios en el sistema, registrar un medio de pago distinto al real o compartir tu usuario y clave.' }
            ]
        },
        {
            id: 'sistemas',
            titulo: 'Herramientas tecnológicas autorizadas',
            resumen: 'Qué aplicativo se usa para qué, y cuál es tu función en cada uno.',
            bloques: [
                { tipo: 'sistemas', titulo: 'Aplicativos del punto', items: [
                    { nombre: 'Alta Densidad DATA', icono: 'fa-chart-line', para: 'Sistema de gestión del negocio: ventas, caja, inventario, clientes, cartera, compras y gastos.', funcion: 'Registrar cada venta, gasto y compra; consultar existencias; hacer el cierre de caja; reportar diferencias de inventario.' },
                    { nombre: 'SIIGO', icono: 'fa-file-invoice', para: 'Facturación electrónica y contabilidad ante la DIAN.', funcion: 'Emitir la factura electrónica de cada venta con los datos correctos del cliente y enviarla por correo.' },
                    { nombre: 'Datáfono', icono: 'fa-credit-card', para: 'Pagos con tarjeta débito y crédito.', funcion: 'Procesar el pago, verificar APROBADO, guardar el voucher para el arqueo.' },
                    { nombre: 'Plataformas de pago y crédito', icono: 'fa-mobile-alt', para: 'Nequi, Daviplata, transferencias, QR, Sistecrédito, Addi.', funcion: 'Confirmar que el dinero llegó a la cuenta oficial o que el crédito quedó aprobado antes de entregar.' },
                    { nombre: 'Tienda en línea', icono: 'fa-store', para: 'Catálogo público con precios, disponibilidad, fichas olfativas y pedidos web.', funcion: 'Consultar fichas y notas para asesorar. Los pedidos web se descuentan solos en DATA: no se registran de nuevo.' },
                    { nombre: 'WhatsApp de la empresa', icono: 'fa-comment-dots', para: 'Atención y seguimiento de clientes.', funcion: 'Responder con el tono de la marca, cotizar y confirmar pedidos. Solo en el número oficial.' }
                ] },
                { tipo: 'lista', titulo: 'Buenas prácticas', items: [
                    'Cada persona entra con su propio usuario. Cierra sesión al terminar el turno.',
                    'Si el sistema no responde, anota la venta en el formato de contingencia y regístrala apenas vuelva, el mismo día.',
                    'Los precios nacen en DATA: si un producto aparece «en revisión de precio», no se vende hasta que administración lo resuelva.',
                    'Nunca instales aplicaciones ni compartas pantallas con datos de clientes.'
                ] }
            ]
        },
        {
            id: 'inventario',
            titulo: 'Control de inventarios',
            resumen: 'Cómo se maneja el stock, cómo se registra y con qué frecuencia se actualiza.',
            bloques: [
                { tipo: 'texto', texto: 'El inventario vive en DATA y cada cambio queda en un libro de movimientos: venta, compra, ajuste o anulación, con fecha, cantidad y motivo. El stock nunca se edita a mano: se mueve con una operación que deja huella.' },
                { tipo: 'tabla', titulo: 'Qué mueve el stock', columnas: ['Operación', 'Dónde se registra', 'Efecto'], filas: [
                    ['Venta en el punto', 'DATA → Ventas', 'Descuenta el producto al guardar la venta'],
                    ['Venta en la tienda en línea', 'Automático', 'DATA la descuenta cuando el pago se aprueba (los preparados y decants descuentan esencia, envase e insumos por receta)'],
                    ['Llegada de mercancía', 'DATA → Compras', 'Suma unidades o ml y actualiza el costo promedio'],
                    ['Producto averiado, conteo o corrección', 'DATA → Inventario → Ajustar stock', 'Suma o resta con un motivo obligatorio'],
                    ['Anulación de una venta', 'DATA → Ventas', 'Devuelve al inventario lo vendido']
                ] },
                { tipo: 'pasos', titulo: 'Recibir mercancía', pasos: [
                    { t: 'Comparar', d: 'Revisa la mercancía contra la factura o remisión del proveedor: referencia, cantidad y estado.' },
                    { t: 'Registrar', d: 'Ese mismo día, en DATA → Compras, registra proveedor, producto, cantidad y costo. Las esencias se registran en ml.', sistema: 'DATA' },
                    { t: 'Almacenar', d: 'Ubica la mercancía en bodega siguiendo «primero en entrar, primero en salir».' },
                    { t: 'Novedades', d: 'Faltantes o averías de llegada se reportan al proveedor y a administración con fotos, antes de registrar.' }
                ] },
                { tipo: 'pasos', titulo: 'Ajustar el stock', pasos: [
                    { t: 'Ubicar el producto', d: 'DATA → Inventario: busca el producto y abre su historial para ver los últimos movimientos.', sistema: 'DATA' },
                    { t: 'Ajustar con motivo', d: 'Usa «Ajustar stock», indica la cantidad que entra o sale y el motivo (avería, conteo físico, corrección). Sin motivo no se guarda.', sistema: 'DATA' },
                    { t: 'Autorización', d: 'Los ajustes por conteo o avería se hacen con autorización de administración y quedan con tu usuario.' }
                ] },
                { tipo: 'tabla', titulo: 'Con qué frecuencia se actualiza', columnas: ['Frecuencia', 'Qué se hace'], filas: [
                    ['En cada operación', 'Ventas, compras y ventas web mueven el stock en el momento. La tienda en línea se actualiza con DATA cada minuto.'],
                    ['Cada apertura', 'Revisar los productos en alerta de stock bajo (semáforo del inventario) y reportar lo que hay que reponer.'],
                    ['Cada cierre', 'Verificar que lo vendido en el día coincide con lo que salió de exhibición.'],
                    ['Cada semana', 'Conteo cíclico de una familia: una semana perfumes 1.1, otra esencias (en ml), otra envases e insumos.'],
                    ['Cada mes', 'Conteo físico general con administración. Las diferencias se ajustan con motivo «Conteo físico».']
                ] },
                { tipo: 'aviso', nivel: 'importante', texto: 'Semáforo de stock: un producto pasa a advertencia cuando le quedan pocas unidades (o pocos ml en las esencias). Los valores los fija administración en Configuraciones. Agotado en DATA = agotado en la tienda en línea.' }
            ]
        },
        {
            id: 'mercancia',
            titulo: 'Cuidado de la mercancía',
            resumen: 'Cómo conservar perfumes, esencias y envases para que lleguen perfectos al cliente.',
            bloques: [
                { tipo: 'pasos', titulo: 'Almacenamiento', pasos: [
                    { t: 'Lejos de luz y calor', d: 'Los perfumes y esencias se guardan sin sol directo, lejos de bombillos, vitrinas calientes y equipos que generen calor. La luz y el calor alteran las notas de salida.' },
                    { t: 'Bien cerrados', d: 'Tapas y atomizadores siempre puestos. Las esencias, en su frasco original bien tapado: el aire las oxida y evapora.' },
                    { t: 'De pie y ordenados', d: 'Frascos en posición vertical, en su caja, sin apilar peso encima. Rotula estanterías por categoría.' },
                    { t: 'Primero en entrar, primero en salir', d: 'Lo que llegó antes se vende antes. Revisa lote o fecha al reponer exhibición.' }
                ] },
                { tipo: 'pasos', titulo: 'Manipulación', pasos: [
                    { t: 'Manos limpias', d: 'Manipula con las manos limpias y secas; en bodega y preparación, sin anillos ni pulseras.' },
                    { t: 'Probadores', d: 'Solo se prueba con el probador marcado; nunca se abre un producto sellado para dar a probar.' },
                    { t: 'Preparados y decants', d: 'Se preparan con la receta definida (esencia, alcohol, fijador y envase), con embudo y medidas exactas, y se rotulan con el nombre de la fragancia.' },
                    { t: 'Limpieza', d: 'Frascos y vitrinas se limpian con paño seco o ligeramente húmedo, sin químicos sobre las etiquetas.' }
                ] },
                { tipo: 'pasos', titulo: 'Averías y derrames', pasos: [
                    { t: 'Aislar', d: 'Retira el producto de la venta y guárdalo aparte, con su caja.' },
                    { t: 'Documentar', d: 'Toma fotos y anota qué pasó, la fecha y quién lo encontró.' },
                    { t: 'Reportar y ajustar', d: 'Reporta a administración el mismo día y, con su autorización, registra el ajuste en DATA con motivo «Avería».', sistema: 'DATA' },
                    { t: 'Derrames', d: 'Ventila, limpia con paño absorbente y aleja cualquier fuente de calor: el alcohol de perfumería es inflamable.' }
                ] },
                { tipo: 'aviso', nivel: 'prohibido', texto: 'Prohibido sacar producto, muestras o probadores del punto sin autorización, y usar mercancía para uso personal.' }
            ]
        },
        {
            id: 'equipo',
            titulo: 'Liderazgo y manejo de equipo',
            resumen: 'Liderar con el ejemplo, comunicar con respeto.',
            bloques: [
                { tipo: 'lista', titulo: 'Tu rol con el equipo', items: [
                    'Dar ejemplo cumpliendo el horario, el uniforme y los procedimientos.',
                    'Distribuir las tareas del día al abrir: atención, reposición, limpieza, preparación.',
                    'Hacer seguimiento y reconocer el buen trabajo frente al equipo.',
                    'Promover un ambiente respetuoso y resolver los conflictos a tiempo.'
                ] },
                { tipo: 'comparar', titulo: 'Retroalimentación', bien: [
                    'En privado, con hechos concretos y propuesta de mejora.',
                    'Con calma, a tiempo y escuchando la versión del colaborador.'
                ], mal: [
                    'Llamados de atención frente a clientes o compañeros.',
                    'Gritos, burlas, apodos o amenazas.'
                ] },
                { tipo: 'aviso', nivel: 'importante', texto: 'Las situaciones de acoso o conflicto que no puedas resolver se llevan al Comité de Convivencia (COCOLA), como se explica en la Inducción general.' }
            ]
        },
        {
            id: 'presentacion',
            titulo: 'Presentación personal',
            resumen: 'El Líder de Punto usa el estándar administrativo.',
            bloques: [
                { tipo: 'lista', titulo: 'Estándar del Líder de Punto', items: [
                    'Camisa tipo polo negra con el logotipo de la empresa, limpia y planchada.',
                    'Jean negro en excelente estado, sin rotos ni desgaste.',
                    'Zapatos negros, modernos y formales, limpios.',
                    'Accesorios sobrios en mostrador; en bodega y preparación, sin accesorios.',
                    'Cabello, piel y uñas cuidados; fragancia personal moderada.'
                ] },
                { tipo: 'enlace', texto: 'El detalle de cada uniforme, con ejemplos de lo correcto y lo que se evita, está en el Manual de código de vestimenta y presentación.', destino: '#/vestimenta' }
            ]
        },
        {
            id: 'sst',
            titulo: 'Seguridad y salud en el trabajo (SG-SST)',
            resumen: 'Prevenir es parte del liderazgo.',
            bloques: [
                { tipo: 'lista', titulo: 'Responsabilidades del líder', items: [
                    'Reportar condiciones inseguras e informar de inmediato accidentes o incidentes.',
                    'Mantener despejadas las zonas de circulación y las rutas de evacuación.',
                    'Levantar cajas con la espalda recta y las piernas flexionadas; pedir ayuda con cargas pesadas.',
                    'Conocer la ubicación del extintor, el botiquín y el punto de encuentro.',
                    'Alcohol, esencias y fijadores lejos de fuentes de calor; en la preparación, con ventilación.',
                    'Participar en capacitaciones y simulacros.'
                ] }
            ]
        },
        {
            id: 'apertura-cierre',
            titulo: 'Apertura y cierre del punto',
            resumen: 'Las rutinas que garantizan que cada día empiece y termine en orden.',
            bloques: [
                { tipo: 'pasos', titulo: 'Apertura', pasos: [
                    { t: 'Recorrido', d: 'Revisa que el local esté como quedó: puertas, vitrinas, mercancía y caja.' },
                    { t: 'Equipos', d: 'Enciende luces, datáfono, computador y verifica conexión a DATA y SIIGO.' },
                    { t: 'Caja', d: 'Confirma la base de caja y que el día anterior quedó cerrado en DATA → Caja.', sistema: 'DATA' },
                    { t: 'Stock', d: 'Revisa las alertas de stock bajo y lo que hay que reponer en exhibición.', sistema: 'DATA' },
                    { t: 'Exhibición y limpieza', d: 'Frascos alineados y limpios, probadores y tirillas listos, precios visibles.' },
                    { t: 'Equipo', d: 'Reunión corta: meta del día, novedades del turno anterior y tareas.' }
                ] },
                { tipo: 'pasos', titulo: 'Cierre', pasos: [
                    { t: 'Ventas', d: 'Verifica que todas las ventas del día estén en DATA y facturadas en SIIGO.', sistema: 'DATA · SIIGO' },
                    { t: 'Caja', d: 'Arqueo y «Cerrar caja de hoy». Reporta cualquier diferencia por escrito.', sistema: 'DATA' },
                    { t: 'Orden', d: 'Reubica los productos, guarda probadores y deja el mostrador despejado.' },
                    { t: 'Seguridad', d: 'Apaga equipos, guarda dinero y documentos de valor, revisa puertas y alarmas.' },
                    { t: 'Novedades', d: 'Registra las novedades del día (averías, PQRS, faltantes) para el siguiente turno y administración.' }
                ] }
            ]
        },
        {
            id: 'confidencialidad',
            titulo: 'Confidencialidad y prohibiciones',
            resumen: 'La información del negocio es reservada.',
            bloques: [
                { tipo: 'lista', titulo: 'Información reservada', items: [
                    'Ventas, metas y resultados del punto.',
                    'Datos de clientes: nombres, cédulas, teléfonos y direcciones.',
                    'Costos, proveedores, recetas y fórmulas.',
                    'Usuarios, claves y accesos a los sistemas.'
                ] },
                { tipo: 'aviso', nivel: 'prohibido', texto: 'Prohibido: usar dinero de caja para fines personales, retirar productos sin autorización, alterar registros, compartir claves o divulgar información de clientes o del negocio.' },
                { tipo: 'texto', texto: 'Mantén una conducta íntegra y transparente: si cometes un error en un registro, repórtalo. Un error reportado se corrige; uno oculto se convierte en un descuadre.' }
            ]
        },
        {
            id: 'indicadores',
            titulo: 'Indicadores de gestión: cómo se miden',
            resumen: 'Los cinco indicadores del cargo, con su fórmula, su fuente y su frecuencia.',
            bloques: [
                { tipo: 'texto', texto: 'Tu gestión se evalúa con cinco indicadores. Todos salen de registros reales, por eso registrar bien es la base de un buen resultado. Las metas son las sugeridas para el cargo; la gerencia puede ajustarlas cada período.' },
                { tipo: 'indicadores', items: [
                    { n: '01', nombre: 'Ventas', mide: 'Cumplimiento de la meta comercial del punto.', formula: 'Ventas del período ÷ Meta del período × 100', fuente: 'DATA → Dashboard y Ventas', frecuencia: 'Seguimiento diario, evaluación mensual', meta: '≥ 100 %' },
                    { n: '02', nombre: 'Inventario', mide: 'Exactitud entre lo físico y lo que dice el sistema.', formula: 'Referencias sin diferencia ÷ Referencias contadas × 100', fuente: 'Conteo físico vs. DATA → Inventario (ajustes por conteo)', frecuencia: 'Semanal (cíclico) y mensual (general)', meta: '≥ 98 % · diferencia en valor ≤ 0,5 % del inventario' },
                    { n: '03', nombre: 'Caja', mide: 'Precisión de los arqueos y del registro de pagos.', formula: 'Cierres sin diferencia ÷ Cierres del período × 100', fuente: 'DATA → Caja (historial de cierres) y arqueo físico', frecuencia: 'Diaria, evaluación mensual', meta: '100 % · diferencia $0' },
                    { n: '04', nombre: 'Servicio', mide: 'Calidad de la atención y gestión de PQRS.', formula: 'PQRS resueltas en 48 h o menos ÷ PQRS recibidas × 100 · y calificación promedio de clientes (1 a 5)', fuente: 'Registro de PQRS del punto y encuesta de satisfacción', frecuencia: 'Mensual', meta: '≥ 95 % · calificación ≥ 4,5' },
                    { n: '05', nombre: 'Procesos', mide: 'Cumplimiento de los estándares operativos.', formula: 'Listas de apertura y cierre completas ÷ Días laborados × 100', fuente: 'Listas de chequeo de apertura y cierre, compras registradas el mismo día', frecuencia: 'Diaria, evaluación mensual', meta: '100 %' }
                ] },
                { tipo: 'aviso', nivel: 'consejo', texto: 'Revisa tus indicadores cada semana con administración: un indicador que se mira a tiempo se corrige a tiempo.' }
            ]
        }
    ]
};
