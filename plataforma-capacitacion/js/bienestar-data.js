/**
 * PLAN DE BIENESTAR · Fragancias Alta Densidad le apuesta a tu bienestar
 *
 * Ilustraciones en assets/img/bienestar (el número del archivo es el del módulo).
 * Bloques propios de este submódulo:
 *   'actividades' → tarjetas con ilustración, frecuencia y duración de cada actividad
 *   'cita'        → frase destacada
 * Las frecuencias y duraciones de las actividades son las mismas del cronograma (último módulo):
 * si cambia una, cámbiala en los dos lugares.
 */
(function () {
    const img = (n) => `assets/img/bienestar/${n}.jpg`;

    window.PLAN_BIENESTAR = {
        clave: 'bienestar',
        titulo: 'Fragancias Alta Densidad le apuesta a tu bienestar',
        cargo: 'Plan de bienestar',
        corto: 'Plan de bienestar',   // en la barra de lectura
        descripcion: 'Nuestro plan para cuidar tu salud física, mental y emocional: sus objetivos, el marco legal, las nueve dimensiones del bienestar con sus actividades y el cronograma del año.',
        modulos: [
            {
                id: 'induccion',
                titulo: 'Inducción',
                resumen: 'Qué es el plan de bienestar y por qué existe.',
                bloques: [
                    { tipo: 'imagen', src: img('01-que-es-el-plan'), alt: '¿Qué es el plan de bienestar? Bienestar físico, mental, crecimiento personal y armonía de equipo alrededor de la gota de Alta Densidad', pie: '¿Qué es el plan de bienestar?' },
                    { tipo: 'texto', texto: 'El plan de bienestar es la estrategia con la que Fragancias de Alta Densidad cuida a las personas que hacen posible la marca. Así como cuidamos cada esencia y cada frasco, cuidamos la salud física, mental y emocional de cada colaborador, y los espacios que compartimos como equipo.' },
                    { tipo: 'lista', titulo: 'Se apoya en cuatro pilares', items: [
                        'Bienestar físico: aroma y energía para el cuerpo.',
                        'Bienestar mental: equilibrio y atención plena.',
                        'Crecimiento personal: aprender y avanzar en lo profesional y en lo personal.',
                        'Armonía de equipo: colaboración, conexión y buen trato.'
                    ] },
                    { tipo: 'imagen', src: img('01-plan-de-bienestar-equipo'), alt: 'El equipo de Alta Densidad compartiendo notas de reconocimiento con la gota', pie: 'Cultivando nuestro equilibrio, inspiración y felicidad' },
                    { tipo: 'texto', texto: 'En este submódulo conocerás los objetivos del plan, a quién va dirigido, en qué normas se apoya, las nueve dimensiones del bienestar con sus actividades y el cronograma del año. Participar es voluntario, pero te invitamos a vivirlo: está hecho para ti.' }
                ]
            },
            {
                id: 'objetivo-general',
                titulo: 'Objetivo general',
                resumen: 'Lo que buscamos con el plan.',
                bloques: [
                    { tipo: 'imagen', src: img('02-objetivo-general'), alt: 'Objetivo general del plan de bienestar de Fragancias de Alta Densidad', pie: 'Objetivo general' },
                    { tipo: 'cita', texto: 'Promover el bienestar integral de nuestro equipo de trabajo, fortaleciendo su salud física, mental y emocional, para que puedan desarrollar su máximo potencial y contribuir al crecimiento de Fragancias de Alta Densidad.' },
                    { tipo: 'lista', titulo: 'Lo que cuida', items: ['Salud física', 'Salud mental', 'Bienestar emocional', 'Rendimiento y crecimiento'] },
                    { tipo: 'aviso', nivel: 'consejo', texto: 'Personas que se sienten bien, hacen grandes cosas.' }
                ]
            },
            {
                id: 'objetivos-especificos',
                titulo: 'Objetivos específicos',
                resumen: 'Tres metas concretas del plan.',
                bloques: [
                    { tipo: 'imagen', src: img('03-objetivos-especificos'), alt: 'Objetivos específicos del plan de bienestar', pie: 'Objetivos específicos' },
                    { tipo: 'pasos', pasos: [
                        { t: 'Fomentar la salud física y la energía', d: 'A través de hábitos saludables, pausas activas y acceso a actividades que te mantengan con energía y vitalidad para seguir brillando.' },
                        { t: 'Cuidar la salud mental y el bienestar emocional', d: 'Brindando espacios de escucha, respiración, manejo del estrés y actividades que fortalezcan la motivación y el equilibrio.' },
                        { t: 'Crear un ambiente laboral más positivo y conectado', d: 'Fortaleciendo el trabajo en equipo, la comunicación y el sentido de pertenencia, para que cada persona se sienta valorada, escuchada y parte de algo grande.' }
                    ] },
                    { tipo: 'aviso', nivel: 'consejo', texto: 'Un equipo que se siente bien también deja huella. Tu bienestar también es parte de nuestra esencia.' }
                ]
            },
            {
                id: 'alcance',
                titulo: 'Alcance',
                resumen: '¿A quién va dirigido?',
                bloques: [
                    { tipo: 'imagen', src: img('04-alcance'), alt: 'Alcance del plan: líder de punto, asesores de venta, seguridad y salud en el trabajo, recursos humanos, gerencia, servicios generales y domiciliarios', pie: 'Alcance · ¿A quién va dirigido?' },
                    { tipo: 'texto', texto: 'El plan de bienestar es para todas las personas que trabajan con Fragancias de Alta Densidad, en los puntos de venta, en la preparación, en las rutas y en la administración.' },
                    { tipo: 'tabla', columnas: ['Cargo', 'Cómo participa'], filas: [
                        ['Líder de punto', 'Participa y organiza los turnos del punto para que su equipo asista sin dejar de atender a los clientes.'],
                        ['Asesores de venta', 'Participan en las actividades dentro de la jornada, por turnos.'],
                        ['Seguridad y salud en el trabajo', 'Participa y acompaña las pausas activas y las actividades de bienestar físico.'],
                        ['Recursos humanos', 'Lidera el plan: programa las fechas, convoca y mide la participación.'],
                        ['Gerencia', 'Participa, aprueba los recursos y da ejemplo.'],
                        ['Servicios generales', 'Participa en todas las actividades.'],
                        ['Domiciliarios', 'Participan en las actividades programadas fuera de sus rutas.']
                    ] },
                    { tipo: 'aviso', nivel: 'consejo', texto: 'Porque el bienestar también es parte de nuestro equipo: nadie se queda por fuera por su cargo o su horario.' }
                ]
            },
            {
                id: 'marco-normativo',
                titulo: 'Marco normativo',
                resumen: 'Las normas colombianas en las que se apoya el plan.',
                bloques: [
                    { tipo: 'imagen', src: img('05-marco-normativo'), alt: 'Marco normativo del plan de bienestar, fundamentado en la legislación colombiana', pie: 'Marco normativo' },
                    { tipo: 'texto', texto: 'El plan está fundamentado en la legislación colombiana. Estas son las normas que lo orientan y lo que cada una aporta:' },
                    { tipo: 'tabla', columnas: ['Norma', 'Qué aporta al plan'], filas: [
                        ['Decreto 1567 de 1998', 'Crea los programas de bienestar social e incentivos. Es la norma del sector público que tomamos como modelo para organizar el plan por áreas.'],
                        ['Decreto 1227 de 2005', 'Reglamenta esos programas: cómo se planean, a quién benefician y cómo se evalúan. También lo usamos como referente.'],
                        ['Ley 1010 de 2006', 'Previene, corrige y sanciona el acoso laboral. Respalda las actividades de convivencia, comunicación asertiva y buen trato.'],
                        ['Resolución 2646 de 2008', 'Obliga a identificar, evaluar y prevenir los factores de riesgo psicosocial. Respalda las actividades de bienestar mental y emocional y el manejo del estrés.'],
                        ['Ley 1857 de 2017', 'Protección integral a la familia: el empleador facilita una jornada semestral para que sus trabajadores compartan con su familia. Es la base del Día de la Familia.']
                    ] },
                    { tipo: 'aviso', nivel: 'importante', texto: 'Las actividades de bienestar físico se coordinan con el Sistema de Gestión de Seguridad y Salud en el Trabajo (SG-SST) que viste en la inducción.' },
                    { tipo: 'cita', texto: 'El cumplimiento legal es la base de un bienestar seguro y transparente.' }
                ]
            },
            {
                id: 'importancia',
                titulo: 'Importancia',
                resumen: '¿Por qué es importante nuestro plan de bienestar?',
                bloques: [
                    { tipo: 'imagen', src: img('06-importancia'), alt: '¿Por qué es importante nuestro plan de bienestar?', pie: 'Importancia del plan' },
                    { tipo: 'pasos', pasos: [
                        { t: '¿Con qué fin lo hacemos?', d: 'Implementamos este plan con el propósito firme de prevenir el agotamiento, fomentar la cohesión de equipo y elevar la calidad de vida de nuestros colaboradores.' },
                        { t: '¿Qué queremos lograr a largo plazo?', d: 'Consolidar una cultura organizacional sólida, donde la motivación, la empatía y la estabilidad sean los pilares que nos permitan crecer de forma sostenible, asegurando que cada miembro de nuestra familia alcance su máximo potencial.' }
                    ] },
                    { tipo: 'imagen', src: img('06-esencia-del-bienestar'), alt: 'La esencia de nuestro bienestar: físico, mental, crecimiento personal y armonía de equipo', pie: 'La esencia de nuestro bienestar' },
                    { tipo: 'texto', texto: 'En los siguientes módulos encontrarás las nueve dimensiones del bienestar. Cada una tiene su objetivo y tres actividades.' }
                ]
            },
            {
                id: 'educativo',
                titulo: 'Bienestar educativo',
                resumen: 'Aprendizaje y crecimiento.',
                bloques: [
                    { tipo: 'imagen', src: img('07-educativo'), alt: 'Bienestar educativo: autoaprendizaje y lectura, mentoría y compartir, talleres y práctica', pie: 'Bienestar educativo' },
                    { tipo: 'aviso', nivel: 'consejo', texto: 'Objetivo: fomentar el desarrollo continuo, el intercambio de conocimientos y la curiosidad intelectual.' },
                    { tipo: 'texto', texto: 'Aprender no termina con la inducción. En Alta Densidad compartimos lo que sabemos (de fragancias, de ventas, de servicio) y buscamos juntos mejores formas de hacer las cosas.' },
                    { tipo: 'actividades', items: [
                        { nombre: 'Cápsulas de Sabor Profesional', img: img('07-capsulas-de-sabor-profesional'), descripcion: 'Charlas rápidas en las que un compañero comparte trucos y conocimientos clave: una familia olfativa, una técnica de venta, un atajo en el sistema. Es la mentoría del día a día.', frecuencia: 'Quincenal', duracion: '15 min' },
                        { nombre: 'Círculo de Lectura Express', img: img('07-circulo-de-lectura-express'), descripcion: 'Espacio para debatir ideas clave de artículos, pódcast y libros. Cada participante trae una idea y la comparte con el grupo.', frecuencia: 'Mensual', duracion: '30 min' },
                        { nombre: 'Laboratorio de Ideas', img: img('07-laboratorio-de-ideas'), descripcion: 'Retos de innovación para optimizar nuestros procesos: cómo atender mejor, preparar más rápido o vender más. Las mejores ideas se prueban en los puntos.', frecuencia: 'Bimestral', duracion: '45 min' }
                    ] }
                ]
            },
            {
                id: 'social',
                titulo: 'Bienestar social',
                resumen: 'Conexión y cultura de equipo.',
                bloques: [
                    { tipo: 'imagen', src: img('08-social'), alt: 'Bienestar social: viernes de conexión sin filtro, café y acordes olfativos, muro de reconocimiento', pie: 'Bienestar social' },
                    { tipo: 'aviso', nivel: 'consejo', texto: 'Objetivo: fortalecer las relaciones interpersonales, la empatía y el sentido de pertenencia.' },
                    { tipo: 'actividades', items: [
                        { nombre: 'Viernes de Conexión sin Filtro', img: img('08-viernes-de-conexion-sin-filtro'), descripcion: 'Espacios dinámicos y juegos casuales fuera de la rutina para conocernos más allá del trabajo.', frecuencia: 'Cada viernes', duracion: '15 min' },
                        { nombre: 'Café a Ciegas y Acordes Olfativos', img: img('08-cafe-a-ciegas'), descripcion: 'Networking interno para romper los silos: compañeros de puntos y áreas distintas se encuentran a tomar café y adivinar acordes con tiras olfativas.', frecuencia: 'Mensual', duracion: '20 min' },
                        { nombre: 'Muro de Reconocimiento Positivo', img: img('08-muro-de-reconocimiento'), descripcion: 'Un espacio para destacar el apoyo y la gratitud entre compañeros: cualquiera puede dejar una nota a quien le ayudó.', frecuencia: 'Permanente · se renueva cada mes', duracion: 'Libre' }
                    ] },
                    { tipo: 'cita', texto: 'Conectamos como equipo, crecemos como familia.' }
                ]
            },
            {
                id: 'espiritual',
                titulo: 'Bienestar espiritual',
                resumen: 'Propósito y pausa mental.',
                bloques: [
                    { tipo: 'imagen', src: img('09-espiritual'), alt: 'Bienestar espiritual: minutos de pausa y reseteo, mapa de propósito y gratitud, zona de desconexión creativa', pie: 'Bienestar espiritual' },
                    { tipo: 'aviso', nivel: 'consejo', texto: 'Objetivo: promover el equilibrio mental, la desconexión consciente y el propósito.' },
                    { tipo: 'texto', texto: 'Hablamos de lo espiritual sin ninguna religión de por medio: es darle sentido a lo que hacemos y regalarnos pausas para volver a nosotros mismos. Cada quien lo vive desde sus propias creencias.' },
                    { tipo: 'actividades', items: [
                        { nombre: 'Minutos de Pausa y Reseteo', img: img('09-minutos-de-pausa-y-reseteo'), descripcion: 'Sesiones guiadas de respiración consciente y atención plena (mindfulness), con un aroma suave de fondo.', frecuencia: 'Semanal', duracion: '5 a 10 min' },
                        { nombre: 'Mapa de Propósito y Gratitud', img: img('09-mapa-de-proposito-y-gratitud'), descripcion: 'Talleres para alinear las metas personales con las del equipo y fomentar la gratitud diaria.', frecuencia: 'Trimestral', duracion: '45 min' },
                        { nombre: 'Zona de Desconexión Creativa', img: img('09-zona-de-desconexion-creativa'), descripcion: 'Un espacio libre de pantallas, con actividades manuales, lectura y música, para descansar la mente en los tiempos libres.', frecuencia: 'Permanente', duracion: 'Libre' }
                    ] },
                    { tipo: 'cita', texto: 'Pausar la mente para alinear el propósito y dar lo mejor de nosotros.' }
                ]
            },
            {
                id: 'mental',
                titulo: 'Bienestar mental · Conecta con tu mente',
                resumen: 'Tu tranquilidad también es una prioridad.',
                bloques: [
                    { tipo: 'imagen', src: img('10-mental'), alt: '¡Conecta con tu mente! Semáforo emocional, reinicia tu mente y el espejo de mi mejor versión', pie: 'Conecta con tu mente' },
                    { tipo: 'aviso', nivel: 'consejo', texto: 'Objetivo: promover el bienestar emocional mediante el reconocimiento de emociones, el manejo del estrés y la autoestima.' },
                    { tipo: 'actividades', items: [
                        { nombre: 'Semáforo emocional', img: img('10-semaforo-emocional'), descripcion: 'Identifica cómo te sientes y descubre estrategias para gestionar tus emociones. Rojo: parar y reflexionar. Amarillo: calmarse y respirar. Verde: actuar y avanzar.', frecuencia: 'Mensual', duracion: '15 a 20 min' },
                        { nombre: 'Reinicia tu mente', img: img('10-reinicia-tu-mente'), descripcion: 'Ejercicio de respiración y relajación para liberar tensiones y recuperar la calma.', frecuencia: 'Quincenal', duracion: '5 a 10 min' },
                        { nombre: 'El espejo de mi mejor versión', img: img('10-espejo-de-mi-mejor-version'), descripcion: 'Dinámica de autoestima para reconocer tus cualidades y fortalecer el amor propio, con notas de tus compañeros sobre lo que valoran de ti.', frecuencia: 'Semestral', duracion: '30 min' }
                    ] },
                    { tipo: 'aviso', nivel: 'importante', texto: 'Si sientes que el estrés o una emoción te supera, no esperes a la próxima actividad: habla con tu líder o con recursos humanos. Tu EPS también ofrece atención en salud mental.' },
                    { tipo: 'cita', texto: 'Una mente cuidada hace más llevadero el camino.' }
                ]
            },
            {
                id: 'fisico',
                titulo: 'Bienestar físico · Activa tu cuerpo',
                resumen: 'Muévete, cuídate y llena tu vida de energía.',
                bloques: [
                    { tipo: 'imagen', src: img('11-fisico'), alt: '¡Activa tu cuerpo! Reto de movimiento, laboratorio de hábitos saludables y modo pausa', pie: 'Activa tu cuerpo' },
                    { tipo: 'aviso', nivel: 'consejo', texto: 'Objetivo: promover hábitos saludables que favorezcan la actividad física, el autocuidado y la prevención de molestias físicas.' },
                    { tipo: 'texto', texto: 'En los puntos de venta pasamos muchas horas de pie y en la preparación repetimos los mismos movimientos. Estas actividades previenen el cansancio y las molestias, y hacen parte de las pausas activas del SG-SST.' },
                    { tipo: 'actividades', items: [
                        { nombre: '¡Activa tu cuerpo!', img: img('11-activa-tu-cuerpo'), descripcion: 'Reto de 60 segundos con movimientos, baile, equilibrio y ejercicios sencillos, en la pausa activa del turno.', frecuencia: 'Diaria', duracion: '1 min' },
                        { nombre: 'Laboratorio de hábitos saludables', img: img('11-laboratorio-de-habitos'), descripcion: 'Preguntas y desafíos sobre hidratación, alimentación, descanso y autocuidado.', frecuencia: 'Bimestral', duracion: '20 a 30 min' },
                        { nombre: 'Modo pausa: rescata tu postura', img: img('11-modo-pausa'), descripcion: 'Identifica errores posturales (de pie en el mostrador, sentado en caja, al cargar cajas) y participa en una rutina de estiramientos.', frecuencia: 'Mensual', duracion: '15 min' }
                    ] },
                    { tipo: 'aviso', nivel: 'importante', texto: 'Si tienes una lesión, un embarazo o una restricción médica, avisa antes de los retos de movimiento: siempre hay una versión que puedes hacer sin riesgo.' },
                    { tipo: 'cita', texto: 'Muévete hoy por el bienestar de tu mañana.' }
                ]
            },
            {
                id: 'familiar',
                titulo: 'Bienestar familiar',
                resumen: 'Equilibrio, unión y momentos que dejan huella.',
                bloques: [
                    { tipo: 'imagen', src: img('12-familiar'), alt: '¡Bienestar familiar! Día de la familia, picnic familiar y taller de integración familiar', pie: 'Bienestar familiar' },
                    { tipo: 'aviso', nivel: 'consejo', texto: 'Objetivo: fortalecer la unión familiar de los trabajadores, promoviendo espacios para compartir y lograr un equilibrio entre la vida personal y el trabajo.' },
                    { tipo: 'actividades', items: [
                        { nombre: 'Día de la Familia', descripcion: 'Juegos lúdicos y dinámicas de integración para todos los miembros de la familia. Es la jornada semestral que establece la Ley 1857 de 2017.', frecuencia: 'Semestral (junio y diciembre)', duracion: 'Media jornada', icono: 'fa-people-roof' },
                        { nombre: 'Picnic familiar', descripcion: 'Un encuentro al aire libre para compartir y disfrutar en familia, en un ambiente relajado.', frecuencia: 'Anual (julio)', duracion: 'Media jornada', icono: 'fa-basket-shopping' },
                        { nombre: 'Taller de integración familiar', descripcion: 'Actividades manuales y juegos cooperativos para fomentar la comunicación y la creatividad en familia.', frecuencia: 'Anual (septiembre)', duracion: '2 horas', icono: 'fa-puzzle-piece' }
                    ] },
                    { tipo: 'imagen', src: img('12-area-familiar'), alt: 'Área familiar: fortalecer los lazos familiares y el equilibrio vida-trabajo', pie: 'Área familiar' },
                    { tipo: 'cita', texto: 'La familia es la mejor esencia de la vida.' }
                ]
            },
            {
                id: 'recreativo',
                titulo: 'Bienestar recreativo · Área recreativa',
                resumen: 'Energía, diversión y desconexión laboral.',
                bloques: [
                    { tipo: 'imagen', src: img('13-recreativo'), alt: '¡Área recreativa! Torneo deportivo, caminata ecológica y jornada de juegos recreativos', pie: 'Área recreativa' },
                    { tipo: 'aviso', nivel: 'consejo', texto: 'Objetivo: promover la recreación, la actividad física y el aprovechamiento del tiempo libre para disminuir el estrés y mejorar el ambiente laboral.' },
                    { tipo: 'actividades', items: [
                        { nombre: 'Torneo deportivo', descripcion: 'Competencias amistosas para fomentar el compañerismo. Lo importante es jugar en equipo, no ganar.', frecuencia: 'Anual (agosto)', duracion: 'Media jornada', icono: 'fa-futbol' },
                        { nombre: 'Caminata ecológica', descripcion: 'Salida a espacios naturales cercanos a Medellín para relajarnos y desconectarnos.', frecuencia: 'Semestral (mayo y noviembre)', duracion: 'Media jornada', icono: 'fa-person-hiking' },
                        { nombre: 'Jornada de juegos recreativos', descripcion: 'Dinámicas grupales y juegos de mesa para disminuir el estrés.', frecuencia: 'Trimestral', duracion: '1 hora', icono: 'fa-dice' }
                    ] },
                    { tipo: 'imagen', src: img('13-area-recreativa'), alt: 'Área recreativa: promover la recreación y el aprovechamiento del tiempo libre', pie: 'Área recreativa' },
                    { tipo: 'cita', texto: 'La recreación renueva nuestra energía y fortalece el equipo.' }
                ]
            },
            {
                id: 'emocional',
                titulo: 'Bienestar emocional',
                resumen: 'Fortalecer el manejo del estrés y la comunicación asertiva.',
                bloques: [
                    { tipo: 'imagen', src: img('14-emocional'), alt: 'Bienestar emocional: fortalecer el manejo del estrés y la comunicación asertiva', pie: 'Bienestar emocional' },
                    { tipo: 'aviso', nivel: 'consejo', texto: 'Objetivo: fortalecer el manejo del estrés y la comunicación asertiva en el equipo.' },
                    { tipo: 'texto', texto: 'Atender clientes todo el día exige paciencia y buen trato, también entre nosotros. El bienestar mental te ayuda a reconocer lo que sientes; el emocional, a manejarlo y a expresarlo bien con los demás.' },
                    { tipo: 'actividades', items: [
                        { nombre: 'Pausa para respirar', img: img('14-pausa-para-respirar'), descripcion: 'Ejercicios breves de respiración consciente y relajación.', frecuencia: 'Quincenal', duracion: '10 a 15 min' },
                        { nombre: '«Nos escuchamos y nos entendemos»', img: img('14-nos-escuchamos'), descripcion: 'Dinámica grupal para practicar la escucha activa y la comunicación asertiva: decir lo que pensamos con respeto y escuchar sin interrumpir.', frecuencia: 'Bimestral', duracion: '20 a 30 min' },
                        { nombre: 'El poder de reconocer', img: img('14-el-poder-de-reconocer'), descripcion: 'Jornada de reconocimiento para destacar las cualidades y los aportes de cada compañero.', frecuencia: 'Trimestral', duracion: '15 a 20 min' }
                    ] }
                ]
            },
            {
                id: 'financiero',
                titulo: 'Bienestar financiero',
                resumen: 'Administrar ingresos, organizar gastos y tomar decisiones económicas.',
                bloques: [
                    { tipo: 'imagen', src: img('15-financiero'), alt: 'Bienestar financiero: administrar ingresos, organizar gastos y tomar decisiones económicas', pie: 'Bienestar financiero' },
                    { tipo: 'aviso', nivel: 'consejo', texto: 'Objetivo: brindar herramientas para administrar los ingresos, organizar los gastos y tomar decisiones económicas responsables.' },
                    { tipo: 'texto', texto: 'Las preocupaciones por el dinero también afectan el bienestar. Estos talleres son prácticos: sales con tu presupuesto, tu meta de ahorro o una decisión más clara. Lo que compartas en ellos es confidencial.' },
                    { tipo: 'actividades', items: [
                        { nombre: 'Mi dinero bajo control', img: img('15-mi-dinero-bajo-control'), descripcion: 'Taller práctico para elaborar un presupuesto mensual y organizar los ingresos.', frecuencia: 'Enero y octubre', duracion: '20 a 30 min' },
                        { nombre: 'El reto del ahorro', img: img('15-el-reto-del-ahorro'), descripcion: 'Reto para establecer metas de ahorro y planificar objetivos; se hace en julio, después de la prima de junio.', frecuencia: 'Julio', duracion: '15 a 20 min' },
                        { nombre: 'Decisiones inteligentes, bolsillo saludable', img: img('15-decisiones-inteligentes'), descripcion: 'Juego de situaciones cotidianas sobre el uso responsable del crédito y las finanzas.', frecuencia: 'Abril', duracion: '20 a 30 min' }
                    ] }
                ]
            },
            {
                id: 'frase-final',
                titulo: 'Frase final',
                resumen: 'Lo que nos une.',
                bloques: [
                    { tipo: 'imagen', src: img('16-frase-final'), alt: 'Inspiramos cada momento, cultivamos nuestro bienestar para florecer juntos', pie: 'Fragancias de Alta Densidad' },
                    { tipo: 'cita', texto: 'Inspiramos cada momento, cultivamos nuestro bienestar para florecer juntos.' },
                    { tipo: 'texto', texto: 'El plan de bienestar funciona cuando lo vivimos todos. Participa, propone nuevas actividades y cuida a tus compañeros: así como una fragancia se construye con muchas notas, un buen equipo se construye con cada persona.' }
                ]
            },
            {
                id: 'cronograma',
                titulo: 'Cronograma de actividades',
                resumen: 'Qué se hace cada semana, cada mes y en el año.',
                bloques: [
                    { tipo: 'texto', texto: 'Las actividades se hacen dentro de la jornada y por turnos, para que ningún punto de venta quede sin atención. Recursos humanos publica las fechas exactas al comienzo de cada año y las recuerda por el grupo del equipo.' },
                    { tipo: 'tabla', titulo: 'Actividades frecuentes', columnas: ['Actividad', 'Dimensión', 'Frecuencia', 'Duración'], filas: [
                        ['¡Activa tu cuerpo! (reto de 60 segundos)', 'Físico', 'Diaria', '1 min'],
                        ['Viernes de Conexión sin Filtro', 'Social', 'Cada viernes', '15 min'],
                        ['Minutos de Pausa y Reseteo', 'Espiritual', 'Semanal', '5 a 10 min'],
                        ['Cápsulas de Sabor Profesional', 'Educativo', 'Quincenal', '15 min'],
                        ['Reinicia tu mente', 'Mental', 'Quincenal', '5 a 10 min'],
                        ['Pausa para respirar', 'Emocional', 'Quincenal', '10 a 15 min'],
                        ['Círculo de Lectura Express', 'Educativo', 'Mensual', '30 min'],
                        ['Café a Ciegas y Acordes Olfativos', 'Social', 'Mensual', '20 min'],
                        ['Semáforo emocional', 'Mental', 'Mensual', '15 a 20 min'],
                        ['Modo pausa: rescata tu postura', 'Físico', 'Mensual', '15 min'],
                        ['Laboratorio de Ideas', 'Educativo', 'Bimestral', '45 min'],
                        ['Laboratorio de hábitos saludables', 'Físico', 'Bimestral', '20 a 30 min'],
                        ['«Nos escuchamos y nos entendemos»', 'Emocional', 'Bimestral', '20 a 30 min'],
                        ['Muro de Reconocimiento Positivo', 'Social', 'Permanente · se renueva cada mes', 'Libre'],
                        ['Zona de Desconexión Creativa', 'Espiritual', 'Permanente', 'Libre']
                    ] },
                    { tipo: 'tabla', titulo: 'Calendario del año', columnas: ['Mes', 'Actividades', 'Dimensiones'], filas: [
                        ['Enero', 'Mapa de Propósito y Gratitud · Mi dinero bajo control', 'Espiritual · Financiero'],
                        ['Febrero', 'Jornada de juegos recreativos', 'Recreativo'],
                        ['Marzo', 'El poder de reconocer · El espejo de mi mejor versión', 'Emocional · Mental'],
                        ['Abril', 'Mapa de Propósito y Gratitud · Decisiones inteligentes, bolsillo saludable', 'Espiritual · Financiero'],
                        ['Mayo', 'Jornada de juegos recreativos · Caminata ecológica', 'Recreativo'],
                        ['Junio', 'El poder de reconocer · Día de la Familia (primer semestre)', 'Emocional · Familiar'],
                        ['Julio', 'Mapa de Propósito y Gratitud · El reto del ahorro · Picnic familiar', 'Espiritual · Financiero · Familiar'],
                        ['Agosto', 'Jornada de juegos recreativos · Torneo deportivo', 'Recreativo'],
                        ['Septiembre', 'El poder de reconocer · El espejo de mi mejor versión · Taller de integración familiar (mes del amor y la amistad)', 'Emocional · Mental · Familiar'],
                        ['Octubre', 'Mapa de Propósito y Gratitud · Mi dinero bajo control (para planear la prima y el fin de año)', 'Espiritual · Financiero'],
                        ['Noviembre', 'Jornada de juegos recreativos · Caminata ecológica', 'Recreativo'],
                        ['Diciembre', 'El poder de reconocer · Día de la Familia (segundo semestre)', 'Emocional · Familiar']
                    ] },
                    { tipo: 'aviso', nivel: 'consejo', texto: '¿Tienes una idea para una actividad? Compártela con recursos humanos o en el Laboratorio de Ideas: el plan crece con lo que propone el equipo.' }
                ]
            }
        ]
    };
})();
