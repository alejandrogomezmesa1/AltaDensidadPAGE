# Entrenar el modelo de AURA con este dataset: estado y pendientes

Fecha: 2026-10-06. Proyecto del modelo: `AltaDensidad/AltaDensidadAI/model` (github `alejandrogomezmesa1/model`): Qwen2.5-0.5B-Instruct con LoRA, SFT + DPO, RAG en SQLite y API FastAPI, en el PC con la RTX 3050 de 4 GB.

## Diagnóstico del proyecto del modelo (revisado, todavía sin cambios)

### Técnico (se arregla sin decisiones del usuario)
1. **Catálogo desactualizado.** `data/catalogo_web_productos.json` tiene 99 productos con nombres viejos («BHARARA SOLEIL», «ALEXANDRIA ll XERJOFF»), sin notas y con algunos precios viejos. La tienda tiene hoy 116. El backend (`verificarRespuesta`) borra cualquier `- **Nombre**` que no coincida con la tienda actual. Hay que reconstruir la base con `salida/rag/conocimiento.json` o con `src/extraer_catalogo_web.py` actualizado (que lea notas, acordes y nombres actuales).
2. **Productos que no se venden.** `knowledge_db.build_from_sources` mete los 110 perfumes de `dataset_perfumeria.csv` como «Clásico de Colección» con precio inventado de $110.000, así que el bot puede ofrecer Tom Ford, Kilian, etc. Hay que quitarlos de la tabla `productos`.
3. **`max_length=512`** en `train_sft.py` y `train_dpo.py` corta los ejemplos (prompt + contexto + respuesta). Hay que subirlo a 1024–1536 con gradient checkpointing, o acortar el prompt.
4. **Tres prompts distintos.** El SFT usa uno, `api.py` usa `BASE_SYSTEM` + `[DATOS OFICIALES…]` y el DPO usa «maestro perfumista químico». Hay que entrenar con el mismo formato de inferencia: un convertidor que lleve `aura_sft.jsonl`, `aura_dpo.jsonl` y `aura_rojo.jsonl` al formato de la API, y unificar `BASE_SYSTEM` con `sistema_aura.txt`.
5. **Formato de DPO.** `train_dpo.py` espera `prompt`, `chosen` y `rejected` como texto; `aura_dpo.jsonl` viene en formato conversacional, así que hay que adaptarlo.
6. **Modelo pequeño.** Con 0,5B conviene que todos los ejemplos con perfumes lleven el contexto RAG; hoy solo el 60 % lo trae. Hay que regenerar con 100 % de contexto en ese caso.

### Decisiones de negocio PENDIENTES (preguntarle al usuario)
- **Concentración «33 %»:** el modelo actual la dice. En el dataset se trató como receta confidencial. ¿Es pública o confidencial?
- **Duración:** el modelo dice «8 a 12 horas» y la web dice «12 horas o más». ¿Cuál se usa?
- **Formulación:** las guías técnicas enseñan maceración, proporciones de alcohol y fijadores. ¿Se quitan, se dejan solo como cultura general sin cantidades, o se mantienen?
- **Efecty:** el prompt actual lo menciona como medio de pago, pero la tienda no lo muestra. ¿Se acepta o no?

## Pasos cuando se decida
1. Ajustar `aura_conocimiento.py` según las decisiones y regenerar (`generar_dataset.py` + `validar_dataset.py`).
2. En el proyecto del modelo:
   - reconstruir la base con el catálogo actual, sin los «clásicos»;
   - escribir el convertidor de datasets;
   - unificar el prompt;
   - subir `max_length`.
3. Entrenar en el PC de la RTX 3050: `src/train_sft.py` y después `src/train_dpo.py`.
4. Levantar la API y evaluar: `python evaluar.py --openai http://localhost:8000 --modelo aura --key <pk-…> --pausa 0`. Comparar contra el modelo actual antes de publicar.
