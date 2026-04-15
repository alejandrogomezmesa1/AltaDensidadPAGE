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

---

Si quieres, mañana puedo: (A) revisar los logs de Railway/Vercel y confirmar que las env vars se cargaron, (B) simular un webhook firmado para validar la verificación HMAC, o (C) ejecutar la migración y crear el admin por ti.
