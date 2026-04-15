# Integración Mercado Pago — Resumen y pasos (contexto)

Fecha: 14 de abril de 2026

Este documento resume el estado actual de la integración con Mercado Pago y los pasos concretos para que mañana podamos continuar las pruebas y el despliegue.

## Resumen rápido
- Implementado endpoint `POST /api/mercadopago/create_preference` que crea una orden local (`Ordenes`) y devuelve una preferencia de Mercado Pago. Si `MP_ACCESS_TOKEN` no está configurado, el backend devuelve una preferencia mock que redirige a `_mock_mp_checkout.html`.
- Endpoint `GET /api/mercadopago/verify_payment` para consultar el pago en MP y actualizar la orden.
- Endpoint `POST /api/mercadopago/webhook` que procesa notificaciones desde Mercado Pago. Soporta verificación HMAC-SHA256 mediante `MP_WEBHOOK_SECRET` (opcional).
- Endpoints admin protegidos: `GET /api/mercadopago/orders`, `GET /api/mercadopago/order/:external_reference`, `PUT /api/mercadopago/order/:external_reference` (requieren `ADMIN_API_KEY` o token JWT admin).
- Frontend: `carrito.js` invoca `/mercadopago/create_preference`. Páginas de retorno: `success.html`, `pending.html`, `failure.html`. Mock checkout: `_mock_mp_checkout.html`.

## Archivos clave
- `backend/routes/mercadopago.js` — lógica principal MP (crear preferencia, verify, webhook, listado de órdenes).
- `backend/server.js` — captura raw body para verificación de webhook y registra rutas.
- `backend/middleware/auth.js` — `requireAdmin` / `requireAuth` para proteger endpoints.
- `database/create_orders_table.sql` — script para crear la tabla `Ordenes`.
- `carrito.js`, `_mock_mp_checkout.html`, `success.html`, `admin.html`, `admin.js` — frontends implicados.

## Variables de entorno críticas (definir en despliegue)
- Obligatorias: `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USER`, `DB_PASSWORD`, `PORT`, `FRONTEND_URL`, `JWT_SECRET`.
- Mercado Pago: `MP_ACCESS_TOKEN` (sandbox o producción), `MP_NOTIFICATION_URL` (webhook público registrado en MP).
- Recomendadas: `MP_WEBHOOK_SECRET` (HMAC), `ADMIN_API_KEY`, `SENDGRID_API_KEY` (si se usan emails).

## Endpoints resumidos
- `POST /api/mercadopago/create_preference`  — body: `{ items: [...] }`  → retorna `{ success, preference, mock? }`.
- `GET /api/mercadopago/verify_payment?payment_id=...` — consulta MP y actualiza `Ordenes`.
- `POST /api/mercadopago/webhook` — recibe notificaciones, verifica firma (si aplica) y actualiza orden.
- `GET /api/mercadopago/orders` — listado paginado (admin).
- `GET /api/mercadopago/order/:external_reference` — obtener orden (admin).
- `PUT /api/mercadopago/order/:external_reference` — actualizar estado (admin).

## Pasos rápidos para probar en despliegue (checklist operativo)
1. En el hosting (Railway/Vercel) definir las variables de entorno listadas arriba. `MP_ACCESS_TOKEN` decide si el checkout es real (sandbox/producción) o mock.
2. Asegurar que la tabla `Ordenes` existe. Ejecutar (desde una máquina con cliente MySQL):

```bash
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p $DB_DATABASE < database/create_orders_table.sql
```

3. Registrar en el panel de Mercado Pago la URL pública del webhook: `https://TU_DOMINIO/api/mercadopago/webhook` (usar sandbox o producción según token).
4. Reiniciar la app en el despliegue para que lea las nuevas variables.
5. Desde el frontend desplegado: abrir carrito → Pagar con Mercado Pago → completar pago (sandbox mostrará "API de prueba").
6. Verificar que Mercado Pago llama el webhook y que `Ordenes` cambia a `approved`. Comprobar en `admin.html` que la orden aparece y su estado cambia.

## Diagnóstico rápido (si algo falla)
- Si la respuesta es `mock: true`: `MP_ACCESS_TOKEN` no está definido o no fue leído; revisar logs del servidor (mensaje: "MP_ACCESS_TOKEN no configurado — se devuelve preferencia mock").
- Si la página MP muestra "API de prueba": estás usando token sandbox (esperado). Usa token de producción para pagos reales.
- Si el webhook no llega: comprobar que el dominio es accesible públicamente; temporalmente usar `ngrok http 3000` y registrar la URL en MP.
- Si la verificación HMAC falla: revisar que `MP_WEBHOOK_SECRET` coincide con el valor configurado en MP o desactivar temporalmente la verificación para pruebas.

## Comandos útiles
- Iniciar backend localmente:

```bash
cd backend
npm install
npx nodemon server.js   # o node server.js
```

- Sembrar admin (si hace falta):

```bash
cd backend
node seed-admin.js
```

- Test rápido de creación de preferencia (script incluido):

```bash
cd backend
node test_create_pref.js
```

## Checklist para mañana (prioridad)
- [ ] Verificar que en Railway/Vercel estén establecidas todas las env vars críticas.
- [ ] Ejecutar la migración `database/create_orders_table.sql` en producción.
- [ ] Registrar webhook en Mercado Pago y validar llamadas entrantes.
- [ ] Hacer una prueba E2E desde el frontend desplegado (sandbox o producción según token).
- [ ] Revisar logs y anotar errores para corregir.

## Pruebas E2E (Sandbox) - flujo listo
Estos pasos te permiten realizar pruebas con usuarios y pagos de prueba en sandbox.

1) Variables de entorno (en Railway/Vercel)
	- `MP_ACCESS_TOKEN` : token sandbox (APP_USR-... o APP_USR- en panel MP)
	- `MP_PUBLIC_KEY` : public key (si usas SDK cliente)
	- `MP_NOTIFICATION_URL` : `https://altadensidadpage-production.up.railway.app/api/mercadopago/webhook`
	- `MP_WEBHOOK_SECRET` : secreto HMAC (genera uno seguro y ponlo en el panel MP)
		- `MP_FORCE_MOCK` : `true|1` forza el flujo mock (dev/probando) aunque `MP_ACCESS_TOKEN` exista. Útil para pruebas con usuarios sin usar Mercado Pago sandbox.
	- `FRONTEND_URL` : `https://alta-densidad-page.vercel.app`

2) Crear preferencia de prueba
	- Desde el backend (script incluido):
	  ```bash
	  cd backend
	  node test_create_pref.js
	  ```
	  Copia `preference.sandbox_init_point` o `preference.init_point` según prefieras.
	- Desde el frontend: añade items y pulsa "Pagar con Mercado Pago".

3) Abrir checkout sandbox
	- Abre `sandbox_init_point` en el navegador.
	- Usa una tarjeta de prueba (ve Panel MP -> Tarjetas de prueba). Ejemplos comunes:
	  - Visa sandbox: `4509 9535 6623 3704` (CVV `123`, fecha futura)

4) Verificar webhook y firmas
	- Si definiste `MP_WEBHOOK_SECRET`, pon el mismo valor en el panel de Mercado Pago (webhooks) como "Clave secreta".
	- Para enviar un webhook de prueba desde tu máquina (o CI), usa el script incluido:
	  ```bash
	  node tools/send_test_webhook.js https://altadensidadpage-production.up.railway.app/api/mercadopago/webhook $MP_WEBHOOK_SECRET
	  ```
	  El script envía un payload `test.created` y añade la cabecera `x-hub-signature-256` si se proporciona el secreto.

5) Comprobar resultados
	- Revisar logs en Railway / Vercel para ver la petición entrante y la respuesta.
	- Verificar en la tabla `Ordenes` que las filas correspondientes fueron actualizadas (campo `status`, `payment_id`, `preference_id`).
	- Usar el endpoint admin: `GET /api/mercadopago/order/:external_reference` (requiere credenciales admin) para ver datos de la orden.

6) Tips y debugging
	- Si recibes `Signature required`, significa que `MP_WEBHOOK_SECRET` está definido en el backend y la petición no incluye firma; usa el script con el secreto o configura el panel MP para enviar la firma.
	- Si recibes 404 en el panel MP al enviar test, asegúrate que la URL del webhook en MP apunta a `https://altadensidadpage-production.up.railway.app/api/mercadopago/webhook` (no al frontend).

Si quieres, yo puedo:
- generar el secreto (openssl rand -hex 32) y enviártelo para pegar en Railway y panel MP, o
- ejecutar el script `node tools/send_test_webhook.js ...` contra tu despliegue (si me das el secreto temporalmente).

---

Si quieres, mañana puedo: (A) revisar los logs de Railway/Vercel y confirmar que las env vars se cargaron, (B) simular un webhook firmado para validar la verificación HMAC, o (C) ejecutar la migración y crear el admin por ti.
