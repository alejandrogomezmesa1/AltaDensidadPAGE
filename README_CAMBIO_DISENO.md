# 🏛️ Manifiesto de Rediseño — Fragancias de Alta Densidad
## Sistema de Diseño *Haute Parfumerie* (Casa de Autor · Medellín)

Este documento establece los **cimientos arquitectónicos, tokens, jerarquía visual y la hoja de ruta de implementación** para la transformación visual y conceptual de **Fragancias de Alta Densidad**.

---

## 1. Filosofía y Dirección de Arte

### Concepto: *"Menos aroma. Más densidad."*
Dejamos atrás la estética genérica de e-commerce oscuro para posicionar la marca como una **casa de perfumería contemporánea de autor**. La nueva identidad evoca exclusividad, fórmulas concentradas (33% extracto puro + base de feromonas), artesanía olfativa y sobriedad editorial de lujo (inspirado en la vanguardia de *Le Labo, Byredo, Frédéric Malle y Roja Parfums*).

### Pilares Visuales
1. **Líneas Editoriales & Geometría Pura**: Estructura de rejilla con filetes finos de 1px (`--c-line`), ángulos rectos limpios (`border-radius: 0px` o radios sumamente controlados) y amplios márgenes de respiración.
2. **Claroscuro y Atmósfera Orgánica**: Fondos profundos con tonos grafito/tinta en modo oscuro y papel hueso/marfil en modo claro, complementados con acentos de oro satinado de autor (`#9A7B3F` / `#C9A961`) y notas licorosas de vino/ámbar (`#5A1220`).
3. **Tipografía Dual de Alto Contraste**: 
   - **Display / Editorial**: `Cormorant Garamond` (serifa clásica, esbelta, majestuosa).
   - **UI / Lectura / Información**: `Jost` (grotesca geométrica, limpia, con espaciado entre letras extendido para subtítulos y micro-textos en mayúsculas).
4. **Sensorialidad Visual de la Fragancia**: Representación gráfica del líquido y frasco con gradientes calculados según la familia olfativa (`--h: hue`), notas de pirámide visible (Salida, Corazón, Fondo) y efecto de bruma (*mist glow*).

---

## 2. Arquitectura del Sistema (Orden de Capas CSS)

El CSS debe estructurarse estrictamente bajo esta jerarquía en cascada:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. TOKENS      paleta base → semánticos → tipo → espacio    │
│    (design-tokens.css)                                      │
├─────────────────────────────────────────────────────────────┤
│ 2. BASE        reset, body, tipografía global, utilidades   │
│    (reset.css, utilities: .up, .disp, .eyebrow, .mute)      │
├─────────────────────────────────────────────────────────────┤
│ 3. COMPONENTES botones, chips, tags, cards, frascos,        │
│    (components.css: .btn, .chip, .bottle, .drawer, .modal)  │
├─────────────────────────────────────────────────────────────┤
│ 4. SECCIONES   header, hero, catálogo, top10, envases, AURA │
│    (index.css, envases.css, top10.css, chatbot.css)         │
└─────────────────────────────────────────────────────────────┘
```

> **Regla de Oro**: Ninguna sección o componente debe usar colores HEX o medidas en píxeles arbitrarias. Toda propiedad visual debe nutrirse de variables semánticas `var(--...)`.

---

## 3. Tokens del Sistema de Diseño

### 3.1. Paleta Cromática Base
```css
:root {
  /* Tonos neutros luminosos (Modo Claro) */
  --hueso:    #F4F1EA;  /* Fondo principal claro */
  --hueso-2:  #EAE5DA;  /* Superficies / cards claras */
  --humo:     #F2EEE6;  /* Inverso o texto sobre fondo oscuro */
  --filete:   #D6D0C3;  /* Líneas divisorias en modo claro */

  /* Tonos oscuros profundos (Modo Oscuro) */
  --tinta:    #0B0B0C;  /* Fondo principal oscuro (negro obsidiana) */
  --grafito:  #151517;  /* Superficies / cards oscuras */
  --filete-2: #2A2A2D;  /* Líneas divisorias en modo oscuro */

  /* Acentos de Alta Perfumería */
  --oro:       #9A7B3F;  /* Oro satinado editorial */
  --oro-claro: #C9A961;  /* Oro luminoso para modo oscuro */
  --vino:      #5A1220;  /* Borgoña / ámbar licoroso */
  --gris:      #6B675F;  /* Texto secundario en modo claro */
  --gris-2:    #9A958A;  /* Texto secundario en modo oscuro */
}
```

### 3.2. Tokens Semánticos (Modo Oscuro Predeterminado)
```css
:root,
:root[data-theme="dark"] {
  --c-bg:       var(--tinta);
  --c-surface:  var(--grafito);
  --c-ink:      var(--humo);
  --c-mute:     var(--gris-2);
  --c-line:     var(--filete-2);
  --c-accent:   var(--oro-claro);
  --c-wine:     var(--vino);
  --c-inv-bg:   var(--humo);
  --c-inv-ink:  var(--tinta);
  --c-scrim:    rgba(0, 0, 0, 0.75);
}
```

### 3.3. Tokens Semánticos (Modo Claro — `html.modo-claro` y `[data-theme="light"]`)
```css
html.modo-claro,
:root[data-theme="light"] {
  --c-bg:       var(--hueso);
  --c-surface:  var(--hueso-2);
  --c-ink:      var(--tinta);
  --c-mute:     var(--gris);
  --c-line:     var(--filete);
  --c-accent:   var(--oro);
  --c-wine:     var(--vino);
  --c-inv-bg:   var(--tinta);
  --c-inv-ink:  var(--hueso);
  --c-scrim:    rgba(0, 0, 0, 0.45);
}
```

### 3.4. Tipografía y Escalas
```css
:root {
  --f-display:  "Cormorant Garamond", Georgia, "Times New Roman", serif;
  --f-ui:       "Jost", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

  --fs-1: 11px;
  --fs-2: 13px;
  --fs-3: 15px;
  --fs-4: 20px;
  --fs-5: clamp(30px, 4.5vw, 60px);
  --fs-6: clamp(44px, 7vw, 104px);

  --ls-ui:   0.22em;   /* Subtítulos en mayúsculas, botones, badges */
  --ls-logo: 0.42em;   /* Marca Alta Densidad */
  --lh-tight: 1.02;
  --lh-body:  1.6;
}
```

### 3.5. Espaciado, Forma y Movimiento
```css
:root {
  --sp-1: 4px;
  --sp-2: 8px;
  --sp-3: 16px;
  --sp-4: 24px;
  --sp-5: 40px;
  --sp-6: 64px;

  --gutter: clamp(16px, 4vw, 48px);
  --sec:    clamp(56px, 9vw, 120px);
  --maxw:   1360px;

  --r:  0px;  /* Geometría pura */
  --bw: 1px;  /* Filete editorial */

  --ease: cubic-bezier(0.2, 0.7, 0.2, 1);
  --t-1:  0.25s;
  --t-2:  0.50s;
  --t-3:  0.90s;

  --z-header: 1000;
  --z-aura:   1050;
  --z-scrim:  1100;
  --z-panel:  1200;
}
```

---

## 4. Matriz de Compatibilidad (Tokens Anteriores vs. Nuevos)

Para garantizar que los scripts de carrito, filtros y checkout no fallen, `design-tokens.css` mapea los identificadores anteriores a los nuevos:

| Token Preexistente | Nuevo Token Semántico | Función |
| :--- | :--- | :--- |
| `--color-bg` | `var(--c-bg)` | Fondo general del viewport |
| `--color-surface` | `var(--c-surface)` | Superficie de tarjetas y modales |
| `--color-card` | `var(--c-surface)` | Cards de producto |
| `--color-text` | `var(--c-ink)` | Texto principal legible |
| `--color-text-muted` | `var(--c-mute)` | Subtítulos y textos secundarios |
| `--color-gold` | `var(--c-accent)` | Oro de acento y marcas de lujo |
| `--color-border` | `var(--c-line)` | Filetes y bordes divisorios de 1px |
| `--font-display` | `var(--f-display)` | Títulos principales (Cormorant) |
| `--font-body` | `var(--f-ui)` | Texto corrido y UI (Jost) |

---

## 5. Hoja de Ruta de Implementación por Fases

### ✅ Fase 1: Cimientos y Tokens (Actual)
- Inclusión de tipografías oficiales (*Cormorant Garamond* y *Jost*) en el `<head>`.
- Actualización de `design-tokens.css` con el sistema dual claro/oscuro.
- Sincronización en `tema.js` para soportar tanto `html.modo-claro` como `data-theme="light|dark"`.

### 🔄 Fase 2: Componentes Core (`components.css`)
- Adaptación de botones (`.btn`, `.btn--line`, `.link`).
- Chips sensoriales y selectores tipo etiqueta (`.chip`, `.tag`).
- Módulo de frasco visual dinámico (`.bottle` con tonalidad `--h: hue` y escala `--s: scale`).
- Drawer de Carrito y Modal de Detalle con layout de dos columnas (*stage* + ficha técnica con pirámide olfativa).

### 🔄 Fase 3: Home & Catálogo Editorial (`index.html` + `index.css`)
- Reinvención del Hero: *"Menos aroma. Más densidad."* con atmósfera de bruma (*mist animation*).
- Grid de productos con borde de 1px continuo y cards con notas olfativas revelables en hover / tap.
- Barra compacta y drawer adaptativo de filtros integrados visualmente con la nueva paleta.

### 🔄 Fase 4: Secciones Dedicadas y Ecosistema
- **Top 10 más pedidos** (`top10.html` / sección): Numeración sobria `01` a `10` en Cormorant Garamond.
- **Envases** (`envases.html` / sección): Formatos de 30 ml (Viaje), 50 ml (Insignia) y 100 ml (Colección).
- **Nosotros**: Ficha de marca con estadísticas `33% Extracto`, `12h+ Fijación`, `+ Feromonas`.
- **AURA Concierge**: Widget minimalista tipo asistente privado de perfumería.

### 🔄 Fase 5: Pruebas de Usabilidad & Despliegue
- Pruebas en navegadores móviles (iOS Safari, Android Chrome).
- Validación de contraste WCAG AA en modo claro y modo oscuro.
- Deploy continuo verificado en Vercel.
