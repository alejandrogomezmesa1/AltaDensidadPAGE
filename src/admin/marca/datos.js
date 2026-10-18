// Datos de marca que no son archivos: paleta, tipografía y flujo de revisión.
// Fuente: BRANDING_Alta_Densidad.md (B2 y B3). Si cambian allí, se cambian aquí.

export const ESTADOS = {
  propuesta: { etiqueta: 'Propuesta', icono: 'fa-pen-nib', color: 'var(--c-mute)' },
  revision: { etiqueta: 'En revisión', icono: 'fa-eye', color: 'var(--warn)' },
  aprobada: { etiqueta: 'Aprobada', icono: 'fa-check', color: 'var(--ok)' },
  descartada: { etiqueta: 'Descartada', icono: 'fa-ban', color: 'var(--err)' }
};

// cmyk / pantone: los del brand book (referencia, se validan con prueba de color de la imprenta).
// Cuando no vienen, se calculan desde el HEX.
export const PALETA = [
  {
    grupo: 'Institucionales', colores: [
      { clave: 'tinta', nombre: 'Tinta', hex: '#0B0B0C', cmyk: '60 · 40 · 40 · 100', pantone: 'Black 6 C', rol: 'Fondo protagonista, la «noche» de la marca' },
      { clave: 'hueso', nombre: 'Hueso', hex: '#F4F1EA', cmyk: '0 · 1 · 4 · 4', pantone: '9224 C', rol: 'Fondo claro, papelería, interior de cajas' },
      { clave: 'oro', nombre: 'Oro satinado', hex: '#9A7B3F', cmyk: '0 · 20 · 59 · 40', pantone: '7555 C · foil 871 C', rol: 'Acento sobre claro, logo en papel' },
      { clave: 'oro_claro', nombre: 'Oro luminoso', hex: '#C9A961', cmyk: '0 · 16 · 52 · 21', pantone: '7562 C', rol: 'Acento sobre oscuro, logo en digital' },
      { clave: 'vino', nombre: 'Vino', hex: '#5A1220', cmyk: '0 · 80 · 64 · 65', pantone: '504 C', rol: 'Acento secundario: cinta, lacre, temporada' }
    ]
  },
  {
    grupo: 'Secundarios', colores: [
      { clave: 'grafito', nombre: 'Grafito', hex: '#151517', cmyk: '9 · 9 · 0 · 91', rol: 'Superficies y tarjetas oscuras' },
      { clave: 'oro_palido', nombre: 'Oro pálido', hex: '#E6D5AE', cmyk: '0 · 7 · 24 · 10', rol: 'Fondos suaves, papel seda, historias' },
      { clave: 'oro_profundo', nombre: 'Oro profundo', hex: '#6E5628', cmyk: '0 · 22 · 64 · 57', rol: 'Texto oro sobre hueso con más contraste' },
      { clave: 'vino_claro', nombre: 'Vino claro', hex: '#8C2A3A', cmyk: '0 · 70 · 59 · 45', rol: 'Cinta de kits, amor y amistad' },
      { clave: 'ambar', nombre: 'Ámbar', hex: '#B8862F', cmyk: '0 · 27 · 74 · 28', rol: 'El «líquido» en ilustraciones' }
    ]
  },
  {
    grupo: 'Neutros', colores: [
      { clave: 'humo', nombre: 'Humo', hex: '#F2EEE6', rol: 'Texto sobre tinta' },
      { clave: 'marmol', nombre: 'Mármol', hex: '#E9E4DA', rol: 'Fondos fotográficos de día' },
      { clave: 'champana', nombre: 'Champaña', hex: '#D9C7A3', rol: 'Bordes y detalles en piezas claras' },
      { clave: 'gris', nombre: 'Gris cálido', hex: '#6B675F', rol: 'Texto secundario sobre claro' },
      { clave: 'gris2', nombre: 'Gris cálido 2', hex: '#9A958A', rol: 'Texto secundario sobre oscuro' },
      { clave: 'filete', nombre: 'Filete claro', hex: '#D6D0C3', rol: 'Líneas de 1 px sobre claro' },
      { clave: 'filete2', nombre: 'Filete oscuro', hex: '#2A2A2D', rol: 'Líneas de 1 px sobre oscuro' }
    ]
  },
  {
    grupo: 'Familias olfativas', nota: 'Solo como filete o punto de color en la ficha olfativa, nunca como fondo.', colores: [
      { clave: 'f_amaderada', nombre: 'Cedro · Amaderada', hex: '#7A5A3A' },
      { clave: 'f_ambar', nombre: 'Ámbar · Ambarada', hex: '#B8862F' },
      { clave: 'f_floral', nombre: 'Rosa empolvado · Floral', hex: '#C79A9A' },
      { clave: 'f_fresca', nombre: 'Verde salvia · Fresca', hex: '#8FA58A' },
      { clave: 'f_gourmand', nombre: 'Caramelo · Gourmand', hex: '#A86B3C' },
      { clave: 'f_especiada', nombre: 'Vino · Especiada', hex: '#5A1220' }
    ]
  }
];

export const COLORES = Object.fromEntries(PALETA.flatMap((g) => g.colores).map((c) => [c.clave, c]));

// Combinaciones permitidas (B3.4): fondo + texto
export const COMBINACIONES = [
  ['tinta', 'humo'], ['tinta', 'oro_claro'], ['tinta', 'gris2'], ['hueso', 'tinta'], ['hueso', 'oro'],
  ['hueso', 'oro_profundo'], ['hueso', 'gris'], ['vino', 'oro_claro'], ['vino', 'humo'], ['marmol', 'tinta'], ['grafito', 'oro_claro']
];

export const FUENTES = [
  { clave: 'cg300', nombre: 'Cormorant Garamond Light', familia: '"Cormorant Garamond"', peso: 300, estilo: 'normal' },
  { clave: 'cg300i', nombre: 'Cormorant Garamond Light Italic', familia: '"Cormorant Garamond"', peso: 300, estilo: 'italic' },
  { clave: 'cg400', nombre: 'Cormorant Garamond Regular', familia: '"Cormorant Garamond"', peso: 400, estilo: 'normal' },
  { clave: 'cg500', nombre: 'Cormorant Garamond Medium', familia: '"Cormorant Garamond"', peso: 500, estilo: 'normal' },
  { clave: 'j300', nombre: 'Jost Light', familia: 'Jost', peso: 300, estilo: 'normal' },
  { clave: 'j400', nombre: 'Jost Regular', familia: 'Jost', peso: 400, estilo: 'normal' },
  { clave: 'j500', nombre: 'Jost Medium', familia: 'Jost', peso: 500, estilo: 'normal' },
  { clave: 'j600', nombre: 'Jost SemiBold', familia: 'Jost', peso: 600, estilo: 'normal' }
];

// Jerarquía B2.3 (tamaño de la muestra en px)
export const JERARQUIA = [
  { nivel: 'Titular de campaña', fuente: 'cg300', px: 64, medida: '28–60 pt · 44–104 px', regla: '2 líneas; la segunda en cursiva y en oro', ejemplo: 'Lo que', ejemplo2: 'permanece.' },
  { nivel: 'Título de sección', fuente: 'cg400', px: 38, medida: '18–28 pt · 30–60 px', regla: 'Mayúscula inicial', ejemplo: 'Todo lo que creamos' },
  { nivel: 'Eyebrow / antetítulo', fuente: 'j500', px: 12, medida: '7–9 pt · 11–13 px', regla: 'MAYÚSCULAS, espaciado 0,22 em, oro o gris', ejemplo: 'Fragancias de Alta Densidad · Medellín', mayus: true, track: 0.22 },
  { nivel: 'Cuerpo', fuente: 'j300', px: 16, medida: '9–11 pt · 15–16 px', regla: 'Interlineado 1,6', ejemplo: 'Fragancias inspiradas en los grandes nichos y diseñadores, en alta concentración y con feromonas.' },
  { nivel: 'Precio', fuente: 'cg500', px: 30, medida: '12–20 pt', regla: 'Formato «$85.000»', ejemplo: '$85.000' },
  { nivel: 'Legal / lote', fuente: 'j400', px: 10, medida: '5,5–7 pt', regla: 'Gris, nunca por debajo de 5,5 pt', ejemplo: 'LOTE AD-2610 · 100 ML · HECHO EN MEDELLÍN', mayus: true, track: 0.12 }
];

export const REGLAS_TIPO = [
  'Máximo 2 familias por pieza.',
  'Nunca Cormorant en negrita: el contraste se logra con tamaño y cursiva.',
  'MAYÚSCULAS solo en Jost y siempre con espaciado.',
  'Los números romanos (I · II · III) son exclusivos de la pirámide olfativa.'
];
