# Plataforma Independiente de Inducción y Capacitación
**Fragancias de Alta Densidad**

Esta carpeta contiene una aplicación web estática, 100% desacoplada e independiente del proyecto principal. No requiere Node.js, Express, MySQL ni backend para funcionar.

---

## 📁 Estructura de Archivos

```
plataforma-capacitacion/
├── index.html                    # Página principal responsiva
├── README.md                     # Documentación de uso y despliegue
├── css/
│   └── style.css                 # Estilos consolidados (dark & gold, responsive)
├── js/
│   ├── modulos-data.js           # Banco de datos con los 53 módulos, textos, videos, imágenes y preguntas con respuestas
│   └── capacitacion.js           # Motor de lectura, validación interactiva, generación de examen y localStorage
└── assets/
    ├── CapacitacionFraganciasAltaDensidad.pdf  # Manual descargable oficial
    └── img/
        ├── Logo2026.png          # Logo de Fragancias Alta Densidad
        ├── Crear_un_video_elegante_y_prof.mp4
        ├── capacitacion/         # 53 imágenes de los módulos formativos
        └── induccion/            # Fotografías y videos institucionales (SST, EPP, Brigada, etc.)
```

---

## 🚀 ¿Cómo Ejecutarla en Local?

1. **Directamente en el navegador:**
   Puedes hacer doble clic en el archivo `index.html` o abrirlo en cualquier navegador (Chrome, Edge, Safari, Firefox).
2. **Con Live Server o cualquier servidor estático:**
   ```bash
   # Opción con npx serve:
   npx serve plataforma-capacitacion

   # O con Python:
   python3 -m http.server 8080 --directory plataforma-capacitacion
   ```

---

## 🌐 ¿Cómo Desplegarla en Internet de Forma Gratuita?

Puedes copiar o mover esta carpeta a su propio repositorio de GitHub o subirla directamente a:
- **Vercel:** Importa la carpeta o crea un proyecto estático apuntando a `index.html`.
- **Netlify:** Arrastra la carpeta `plataforma-capacitacion` en [app.netlify.com/drop](https://app.netlify.com/drop).
- **GitHub Pages:** Sube los archivos a la rama `main` o `gh-pages` de un repositorio.
- **Cloudflare Pages:** Conecta tu repositorio o sube la carpeta directamente.

---

## 🌟 Características

- **53 Módulos Formativos:** Misión, visión, reglamento interno, seguridad en el trabajo (SST), EPP, brigadas, COCOLA, portafolio de fragancias y facturación.
- **Evaluación Interactiva:** 3 preguntas de validación por módulo y examen final aleatorio de 10 preguntas.
- **Persistencia de Progreso:** Guarda automáticamente el progreso de lectura y aprobación en el `localStorage` del navegador.
- **Descarga Directa de PDF:** Incluye botón directo para descargar el Manual de Capacitación Oficial.
