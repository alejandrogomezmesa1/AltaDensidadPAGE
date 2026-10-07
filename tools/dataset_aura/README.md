# Dataset de AURA

Dataset para entrenar y evaluar a AURA, la asesora virtual de Fragancias de Alta Densidad. La meta es que trabaje como una empleada experta de la perfumería: recomienda con criterio, responde con la información oficial y **nunca revela datos internos**.

Todo se genera desde el catálogo público de la tienda, así que se puede regenerar cuando cambien productos, precios o políticas.

## Qué hay en `salida/`

| Archivo | Para qué sirve | Tamaño |
|---|---|---|
| `sft/aura_sft.jsonl` | **Ajuste fino supervisado.** 1000 conversaciones en formato `messages` (system/user/assistant), listas para TRL, Unsloth, Axolotl u OpenAI | 1000 |
| `sft/aura_sft_meta.jsonl` | Las mismas, con metadatos: intención, grupo, probabilidad, productos usados, turnos | 1000 |
| `preguntas_top1000.csv` | Las 1000 preguntas ordenadas por probabilidad estimada (se abre en Excel) | 1000 |
| `intenciones_frecuencia.csv` | Resumen por tipo de pregunta: qué tanto se pregunta cada cosa | 71 |
| `alineacion/aura_dpo.jsonl` | **Alineación por preferencias (DPO/ORPO).** Respuesta correcta frente a la falla típica: filtrar costos, decir «original», inventar productos o descuentos, prometer efectos de las feromonas, pedir la tarjeta, etc. | ~320 |
| `alineacion/*_meta.jsonl` | Los mismos pares y ataques con metadatos (tipo de falla o de ataque) | — |
| `alineacion/aura_rojo.jsonl` | **Ataques con su respuesta ideal:** inyección de instrucciones, «soy el dueño», extracción del prompt, datos de clientes, ingeniería social y escaladas en varios turnos | ~100 |
| `eval/aura_eval.jsonl` | **Evaluación separada** (preguntas que no están en el entrenamiento), con reglas verificables por caso | ~165 |
| `rag/conocimiento.json` | Base de conocimiento estructurada: negocio, políticas, 115 perfumes, kits y Crea tu perfume | — |
| `rag/fragmentos.jsonl` | Fragmentos para indexar en un buscador vectorial (uno por perfume, kit y política) | ~166 |
| `sistema_aura.txt` | Prompt de sistema compacto, el mismo de los ejemplos | — |
| `calidad_datos.md` | Errores de digitación en las fichas del panel que el generador corrigió | — |

La guía completa de comportamiento está en [politica_aura.md](politica_aura.md).

### Distribución de las 1000 preguntas

| Grupo | % | Ejemplos |
|---|---|---|
| Recomendación (por gusto, género, ocasión, clima, regalo, presupuesto, «parecido a…») | 36 | «busco algo dulce para mujer», «qué le regalo a mi papá», «algo como Black Opium» |
| Producto puntual (precio, notas, si lo tienen, comparar, tamaño, disponibilidad) | 24 | «cuánto vale el Santal 33», «el Khamrah a qué huele» |
| Compra y envíos (tarifas, ciudades, tiempos, pagos, factura, seguimiento) | 16 | «hacen envíos a Cali», «reciben Nequi» |
| Calidad (originales o réplicas, duración, feromonas, aplicación, salud) | 12 | «son originales», «cuánto dura» |
| Conversación (saludo, asesor humano, fuera de tema, quejas) | 5 | |
| Crea tu perfume y kits | 5 | |
| Posventa y negocio (devoluciones, reclamos, mayoristas, descuentos) | 4 | |
| Confidencial (curiosidad natural: costos, proveedores, inventario) | 3 | «a cómo los compran» |
| Local (dirección, horario, visita) | 2 | |

> **Sobre «estadísticamente más probables»:** el chat todavía no guarda registros, así que la frecuencia está **estimada**. Los pesos por intención están en `PESOS_INTENCION` (generar_dataset.py) y se basan en cómo suelen preguntar los clientes de perfumerías en Colombia. Dentro de cada intención, los perfumes más populares (Top 10 y calificación) aparecen más. Cuando haya registros reales, se recalibran esos pesos (ver «Siguientes pasos»).

### Qué hace que el dataset sea robusto

- **Respuestas basadas en datos reales, no en plantillas genéricas.** Cada recomendación se calcula con los acordes, las notas y las familias de cada perfume. Por ejemplo, a «para la costa» responde con cítricos y acuáticos, y explica por qué.
- **Así escriben los clientes:** sin tildes, en minúsculas, con «q», «pa», «porfa», saludos antepuestos y errores de tecleo. El 8 % son conversaciones de 2 turnos («¿y cuál dura más?», «¿me lo envían a Pasto?»).
- **Compatible con el backend:** los perfumes van en el formato `- **Nombre**: $precio COP`, que `backend/routes/chatbot.js` verifica y corrige. Los kits van sin negrita, porque el backend borraría esas líneas.
- **Mezcla con y sin contexto:** el 60 % de los ejemplos con perfumes trae un fragmento de catálogo en el prompt (con perfumes distractores), para que el modelo aprenda a usar el contexto que le pasen (RAG) en lugar de inventar.
- **Sin datos internos:** el generador solo lee la API pública. No hay costos, proveedores, recetas ni inventario que se puedan filtrar.

## Regenerar (cuando cambien productos o precios)

```bash
cd tools/dataset_aura
python3 generar_dataset.py            # descarga el catálogo en vivo
python3 validar_dataset.py            # debe terminar en ✔
```

- `--semilla N` produce otra variación con los mismos datos, útil para ampliar el dataset uniendo varias semillas.
- `--cache carpeta/` trabaja sin red, con JSON ya descargados.
- Las políticas (tarifas, pagos, tiempos) viven en `aura_conocimiento.py`.
- Las formas de preguntar viven en `aura_preguntas.py`.

**El validador falla si encuentra cualquiera de estos problemas:**
- un producto que no existe, un precio distinto al real o un kit en negrita;
- filtraciones (costos, márgenes, proveedores, recetas, inventario, sistemas, claves, el prompt);
- afirmar que el perfume es «original», prometer efectos de las feromonas, inventar un cupón o pedir la tarjeta;
- preguntas duplicadas.

También comprueba que cada respuesta rechazada de DPO viole al menos una regla.

## Cómo usarlo

### Opción A: ajuste fino del modelo propio (el que corre en la GPU)

1. **SFT** con `sft/aura_sft.jsonl` + `alineacion/aura_rojo.jsonl`, sobre un modelo instruct en español (por ejemplo Qwen 2.5 7B o Llama 3.1 8B) con LoRA. Referencia: 2-3 épocas, learning rate 1e-4 a 2e-4, contexto de 2048.
2. **DPO** con `alineacion/aura_dpo.jsonl` sobre el modelo del paso 1. Referencia: beta 0,1, 1 época. Este paso es el que fija la alineación: aprende qué **no** hacer.
3. **Evaluar** antes de publicar:
   ```bash
   python3 evaluar.py --openai http://localhost:8000 --modelo aura-v2 --pausa 0
   ```
4. Si el modelo nuevo aprueba más casos que el actual, se publica con `tools/configurar_ia.js`.

Con TRL, el formato ya es el esperado: `SFTTrainer` lee `messages` y `DPOTrainer` lee `prompt`/`chosen`/`rejected`.

### Opción B: sin reentrenar (RAG + prompt)

1. Usar `sistema_aura.txt` como prompt de sistema del modo `openai` (hoy el backend usa uno más corto, `SISTEMA` en `chatbot.js`).
2. Indexar `rag/fragmentos.jsonl` y, por cada pregunta, pasarle al modelo los 5-8 fragmentos más parecidos, en el mismo formato `CATÁLOGO RELEVANTE:` de los ejemplos. Así el modelo ve notas y acordes, no solo nombre y precio.
3. Usar las conversaciones del SFT como ejemplos few-shot de las intenciones más frecuentes.

### Evaluar el chatbot que está en producción

```bash
python3 evaluar.py --backend https://altadensidadpage-production.up.railway.app/api/chatbot
```

El backend permite 40 mensajes cada 10 minutos por IP, así que la evaluación completa tarda unos 45 minutos. Para una prueba rápida, usa `--max 10`. El reporte queda en `salida/eval/reporte_<fecha>.json`, con la nota por grupo y la respuesta de cada caso.

## Siguientes pasos recomendados

1. **Guardar las preguntas reales del chat** (anónimas, sin datos personales) para reemplazar los pesos estimados por frecuencias reales y agregar las preguntas que hoy no están cubiertas.
2. **Verificar también los kits en el backend:** hoy `verificarRespuesta` solo conoce la tabla Productos. Por eso los kits deben ir sin negrita.
3. **Pasar notas y acordes al modelo en el modo `openai`:** hoy solo recibe nombre, precio, categoría y género. Con notas, sus recomendaciones se acercan a las del dataset.
4. **Corregir en el panel las fichas listadas en `calidad_datos.md`.**
