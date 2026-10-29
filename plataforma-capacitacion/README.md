# Portal de inducción y capacitación
**Fragancias de Alta Densidad** · servido por la tienda en `/capacitacion` y `/induccion` (vercel.json → `plataforma-capacitacion/index.html`; `tools/copiar_capacitacion.js` la copia a `dist/` en el build).

Aplicación estática, sin backend. El progreso se guarda en el navegador (localStorage).

## Estructura
- `index.html`: portada con el imagotipo y los cuatro submódulos.
- `js/modulos-data.js`: **Inducción general** (53 módulos). Las preguntas ya no se piden en cada módulo: forman el banco del **examen final** (10 al azar, se aprueba con el 100 %).
- `js/especifica-data.js`: **Inducción específica · Líder de Punto de Venta** (13 módulos: servicio, ventas, caja paso a paso, aplicativos autorizados, inventario, cuidado de la mercancía, equipo, SG-SST, apertura y cierre, confidencialidad e indicadores con su medición).
- `js/vestimenta-data.js`: **Manual de código de vestimenta y presentación** (uniforme operativo y administrativo ilustrados, uso correcto, cabello, uñas, accesorios, lista diaria).
- `js/bienestar-data.js`: **Plan de bienestar · Fragancias Alta Densidad le apuesta a tu bienestar** (17 módulos: inducción, objetivos, alcance, marco normativo, importancia, las nueve dimensiones con tres actividades cada una, frase final y cronograma). Ilustraciones en `assets/img/bienestar/`, numeradas según el módulo. Frecuencias y duraciones de las actividades se repiten en el cronograma: si cambian, actualiza los dos.
- `js/capacitacion.js`: rutas (`#/general`, `#/especifica`, `#/vestimenta`, `#/bienestar`, `#/<submódulo>/<módulo>`, `#/general/examen`), progreso, bloques y figuras de los uniformes.
- `css/style.css`: estilos con el brand book (tinta, hueso, oro; Cormorant Garamond y Jost).

## Editar contenido
Cada módulo de los submódulos nuevos es una lista de bloques: `texto`, `lista`, `pasos` (con `sistema` opcional), `aviso` (`prohibido` · `importante` · `consejo`), `tabla`, `comparar`, `sistemas`, `indicadores`, `uniforme`, `chequeo`, `enlace`, `imagen`, `actividades` (tarjetas con ilustración, frecuencia y duración) y `cita`. Los pasos de caja e inventario describen las pantallas reales de Alta Densidad DATA; si cambian, actualízalos aquí.

## Probar en local
```bash
python3 -m http.server 8080 --directory plataforma-capacitacion
```
