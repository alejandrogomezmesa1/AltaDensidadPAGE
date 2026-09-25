# Asistente AURA — Operación del proveedor de IA

## Cómo fluye una pregunta

```
Navegador (chatbot.js) ──► Backend Railway /api/chatbot ──► Proveedor de IA
                              │  · guarda URL + API key (cifrada) en la BD
                              │  · límite: 40 mensajes / 10 min por IP
                              └─ · verifica la respuesta contra el catálogo:
                                   quita productos que no existen y corrige precios
```

- El navegador **nunca** ve la URL ni la API key del proveedor.
- Saludos y preguntas frecuentes (envíos, pagos, ubicación, fijación, feromonas) se responden en el navegador, sin gastar la IA.
- Si la IA no responde, el chat muestra **"Modo básico"** y contesta con el catálogo y las FAQ.

## Configuración inicial (una sola vez)

1. En **Railway → Variables** del backend, define `ADMIN_API_KEY` con un valor largo:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. Despliega el backend con el nuevo `routes/chatbot.js`.
3. En tu equipo, exporta la clave de admin y registra el proveedor:
   ```bash
   export AD_ADMIN_KEY="<el ADMIN_API_KEY de Railway>"
   export IA_API_KEY="pk-..."          # la API key nueva del modelo
   node tools/configurar_ia.js set --url https://xxxx.trycloudflare.com
   node tools/configurar_ia.js estado   # debe decir ✔ en línea
   ```

## Tareas frecuentes

| Situación | Comando |
|---|---|
| Ver cómo está configurado y si responde | `node tools/configurar_ia.js estado` |
| Rotar la API key | `IA_API_KEY=pk-nueva node tools/configurar_ia.js set` |
| Cambió la URL del túnel | `node tools/configurar_ia.js set --url https://nueva.trycloudflare.com` |
| Levantar el túnel y registrarlo solo (se re-registra si se cae) | `node tools/configurar_ia.js tunel --puerto 8000` |
| Cambiar a un proveedor compatible con OpenAI | `node tools/configurar_ia.js set --url https://api.proveedor.com --modo openai --modelo nombre-del-modelo --key sk-...` |
| Volver a la API propia | `node tools/configurar_ia.js set --url https://... --modo nativo` |
| Apagar la IA (el chat queda en modo básico) | `node tools/configurar_ia.js desactivar` |

El modo `tunel` requiere `cloudflared` (`brew install cloudflared` o el instalador de Windows) y se ejecuta **en el equipo que tiene la GPU**. Deja esa ventana abierta mientras la IA esté en servicio.

## Recomendado para el servicio del modelo (`api.py`)

- **URL estable:** las URLs `trycloudflare.com` cambian en cada reinicio. Con un túnel con nombre de Cloudflare (cuenta gratuita + un dominio) la URL no cambia y no hay que re-registrar nada.
- **Cerrar la documentación pública:** `FastAPI(docs_url=None, redoc_url=None, openapi_url=None)`.
- **CORS:** el navegador ya no llama al modelo; basta con permitir solo al backend (o quitar CORS).
- **Calidad observada (septiembre 2026):** los precios del catálogo son correctos, pero ante saludos inventó productos ("Prada Candy") y a "¿cuánto cuesta el envío?" respondió con perfumes. El backend ya filtra productos inexistentes, pero conviene reforzar el prompt/RAG para preguntas que no son de catálogo.

## Si cambias `JWT_SECRET` o `CHATBOT_CONFIG_SECRET`

La API key guardada se cifra con ese secreto. Si lo cambias, vuelve a registrarla:
`IA_API_KEY=pk-... node tools/configurar_ia.js set`
