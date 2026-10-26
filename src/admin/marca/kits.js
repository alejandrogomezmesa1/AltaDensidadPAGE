// Paquetes de marca por proveedor: qué piezas necesita cada uno para producir y qué le pedimos.
// Son un punto de partida: en el armador se agregan o quitan piezas y se editan las indicaciones.
// Ids = rutas del manifest (public/assets/branding/manifest.json).

const LOGOS_UNA_TINTA = ['01_logo/05-logotipo.svg', '01_logo/07-isotipo-una-tinta-negra.svg', '01_logo/08-isotipo-una-tinta-blanca.svg'];
const REGLAS_LOGO = ['01_logo/10-construccion-y-area-de-proteccion.svg', '01_logo/11-tamanos-minimos.svg'];
const PALETA = '03_color/01-paleta.svg';

export const KITS = [
  {
    id: 'empaques', titulo: 'Empaques', icono: 'fa-box-open',
    para: 'Cajas, estuches, bolsas, papel seda y cinta',
    piezas: [
      '01_logo/04-imagotipo-horizontal-tinta-sobre-hueso.svg', ...LOGOS_UNA_TINTA, ...REGLAS_LOGO,
      '01_logo/12-versiones-de-acabado.svg', PALETA, '04_sistema_grafico/03-patron-simbolo-tinta.svg', '04_sistema_grafico/04-patron-simbolo-hueso.svg',
      '08_empaque/06-caja-individual.svg', '08_empaque/07-estuche-de-kit.svg', '08_empaque/08-bolsa-de-mano.svg', '08_empaque/09-caja-de-envio.svg',
      '08_empaque/10-cinta-adhesiva.svg', '08_empaque/11-papel-seda.svg', '08_empaque/13-bolsa-de-tela.svg', '08_empaque/14-caja-bolsa.svg',
      '08_empaque/05-sello-de-garantia.svg', '08b_fichas/01-estuche-kit-3x30.svg', '08b_fichas/02-bolsa-de-tela.svg', '08b_fichas/03-caja-bolsa.svg'
    ],
    indicaciones: 'Producir con los colores Pantone indicados (no por pantalla). El logo en oro va en foil 871 C cuando el acabado lo permita. '
      + 'Enviar prueba física o digital de color y de troquel antes de la producción completa. Respetar el área de protección del logo. '
      + 'Las fichas técnicas (estuche de kit, bolsa de tela y caja-bolsa) traen medidas, materiales y la aprobación del dummy.'
  },
  {
    id: 'stickers', titulo: 'Stickers y etiquetas', icono: 'fa-tags',
    para: 'Etiquetas de frasco, sellos y sticker de cierre',
    piezas: [
      '01_logo/06-isotipo-oro-sobre-tinta.svg', ...LOGOS_UNA_TINTA, '01_logo/09-sello-circular.svg', ...REGLAS_LOGO, PALETA,
      '08_empaque/02-etiqueta-frontal.svg', '08_empaque/03-etiqueta-posterior.svg', '08_empaque/04-etiqueta-circular-frascos-actuales.svg',
      '08_empaque/05-sello-de-garantia.svg', '08_empaque/12-sticker-de-cierre.svg', '09_unboxing/06-etiqueta-de-muestra.svg'
    ],
    indicaciones: 'Imprimir a tamaño real (las medidas en mm están en cada lámina). Sangrado de 2 mm y corte con troquel. '
      + 'Papel o vinilo resistente a alcohol y aceites (van sobre frascos de perfume). Los dorados en foil o tinta Pantone 7555 C.'
  },
  {
    id: 'uniformes', titulo: 'Uniformes y bordados', icono: 'fa-tshirt',
    para: 'Polos, delantales y escarapelas',
    piezas: [...LOGOS_UNA_TINTA, '01_logo/04-imagotipo-horizontal-tinta-sobre-hueso.svg', ...REGLAS_LOGO, '01_logo/12-versiones-de-acabado.svg',
      PALETA, '11_punto_de_venta/04-uniforme.svg', '11_punto_de_venta/03-escarapela.svg'],
    indicaciones: 'Bordado a una tinta (hilo dorado sobre prenda negra, o negro sobre prenda clara). Usar la versión de una tinta: '
      + 'los degradados no se bordan. Respetar el tamaño mínimo del logo; enviar muestra del bordado antes de la producción.'
  },
  {
    id: 'imprenta', titulo: 'Imprenta y papelería', icono: 'fa-print',
    para: 'Tarjetas, membrete, sobres, fichas y tiras olfativas',
    piezas: ['01_logo/02-imagotipo-vertical-tinta-sobre-hueso.svg', '01_logo/04-imagotipo-horizontal-tinta-sobre-hueso.svg', ...REGLAS_LOGO,
      '02_tipografia/01-especimen.svg', PALETA, '10_papeleria/01-tarjeta-de-presentacion.svg', '10_papeleria/02-hoja-membrete.svg',
      '10_papeleria/03-tarjeta-de-regalo.svg', '10_papeleria/05-sobre.svg', '10_papeleria/06-sobre-frente.svg', '09_unboxing/02-tarjeta-de-agradecimiento.svg',
      '09_unboxing/03-ficha-olfativa.svg', '09_unboxing/04-tira-olfativa.svg', '09_unboxing/05-tarjeta-de-cuidado.svg'],
    indicaciones: 'Imprimir a tamaño real con sangrado de 3 mm. Papel de algodón o texturizado color hueso (no blanco brillante). '
      + 'Los detalles en oro, en foil 871 C. Enviar prueba de color antes de imprimir el tiraje.'
  },
  {
    id: 'punto_de_venta', titulo: 'Punto de venta', icono: 'fa-store',
    para: 'Fachada, letreros, vinilos y señalización',
    piezas: ['01_logo/03-imagotipo-horizontal-oro-sobre-tinta.svg', '01_logo/04-imagotipo-horizontal-tinta-sobre-hueso.svg', ...LOGOS_UNA_TINTA,
      ...REGLAS_LOGO, '01_logo/12-versiones-de-acabado.svg', '01_logo/14-fondos-corporativos.svg', PALETA,
      '11_punto_de_venta/01-fachada-y-vitrina.svg', '11_punto_de_venta/02-senalizacion.svg'],
    indicaciones: 'Letras doradas sobre negro mate. Los archivos son vectoriales: escalar sin perder calidad. '
      + 'Confirmar medidas en sitio y enviar render o maqueta antes de fabricar.'
  },
  {
    id: 'digital', titulo: 'Redes y digital', icono: 'fa-hashtag',
    para: 'Contenido para Instagram, WhatsApp y la web',
    piezas: ['01_logo/01-imagotipo-vertical-oro-sobre-tinta.svg', '01_logo/06-isotipo-oro-sobre-tinta.svg', '02_tipografia/01-especimen.svg',
      '02_tipografia/02-jerarquia.svg', PALETA, '03_color/02-proporcion-y-combinaciones.svg', '04_sistema_grafico/01-elementos-de-marca.svg',
      '05_fotografia/01-escenario-noche.svg', '05_fotografia/02-escenario-dia.svg', '06_instagram/02-foto-de-perfil.svg',
      '06_instagram/04-post-lanzamiento.svg', '06_instagram/05-post-manifiesto.svg', '06_instagram/11-historia-con-zonas-seguras.svg',
      '07_whatsapp/01-gracias.svg', '07_whatsapp/03-gota-tallada.svg', '12_digital/04-qr-con-marca.svg', '12_digital/06-qr-instagram.svg'],
    indicaciones: 'Usar los colores en HEX. Tipografías: Cormorant Garamond para titulares y Jost para texto (Google Fonts, gratuitas). '
      + 'Respetar las zonas seguras de las historias y la proporción de color 70 · 20 · 10.'
  }
];

// Piezas que no conviene enviar a un proveedor como arte de producción (son de estudio interno)
export const SOLO_INTERNAS = ['00_exploracion/01-comparativa-de-simbolos.svg', '01_logo/13-usos-incorrectos.svg', '06_instagram/12-marco-de-revision.svg'];
