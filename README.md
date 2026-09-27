# Alta Densidad — Documentación Técnica

Tienda de perfumería de alta gama. Proyecto full-stack con frontend en React 19 + Vite (SPA) y backend en Node.js + Express conectado a MySQL 8.0.

---

## Tabla de Contenidos

1. [Estructura del Proyecto](#estructura-del-proyecto)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Base de Datos](#base-de-datos)
4. [Backend](#backend)
5. [Frontend (React)](#frontend-react)
6. [Kits de Fragancias Exclusivas](#kits-de-fragancias-exclusivas)
7. [Integración WhatsApp](#integración-whatsapp)
8. [Autenticación](#autenticación)
9. [API REST](#api-rest)
10. [Scripts de Datos](#scripts-de-datos)
11. [Variables de Entorno](#variables-de-entorno)
12. [Cómo Ejecutar](#cómo-ejecutar)

---

## Estructura del Proyecto

```
AltaDensidadPAGE/
├── index.html              # Entrada de Vite: SEO base, fuentes, Font Awesome, tema sin destello
├── vite.config.js          # React + encapsulado de acceso.css / admin-hp.css (ver Frontend)
├── vercel.json             # Build de Vite, SPA y redirecciones de las URLs .html antiguas
├── package.json            # Dependencias del front (React, React Router, Chart.js, SweetAlert2)
├── public/
│   ├── assets/img/         # Imágenes locales (las rutas "assets/img/…" de la base siguen válidas)
│   ├── robots.txt
│   └── sitemap.xml
├── src/                    # Frontend React (detalle en la sección Frontend)
├── plataforma-capacitacion/  # Sitio estático aparte; se copia a dist/ al compilar
├── Fragancias de Alta Densidad.html  # Prototipo del sistema de diseño Haute Parfumerie
├── README_CAMBIO_DISENO.md # Manifiesto del sistema de diseño (tokens, capas, tipografía)
├── database/
│   ├── schema.sql          # Esquema original (SQL Server)
│   └── schema_mysql.sql    # Esquema activo (MySQL 8.0)
├── tools/                  # Utilidades (copiar_base.sh, copiar_capacitacion.js, …)
└── backend/                # API Express (Railway): rutas, servicios, migraciones
```

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + React Router 7, empaquetado con Vite |
| Backend | Node.js v22, Express 4.x — servidor HTTP y API REST |
| Base de datos | MySQL 8.0 — motor relacional, gestionado con MySQL Workbench |
| Autenticación | JWT (`jsonwebtoken`) + bcryptjs — tokens de sesión + hash de contraseñas |
| Driver DB | `mysql2/promise` — cliente MySQL para Node con soporte async/await |
| Variables de entorno | `dotenv` — carga credenciales desde `.env` sin exponerlas en el código |
| CORS | `cors` — permite localhost (cualquier puerto), `*.vercel.app` y `FRONTEND_URL` |
| Dev server frontend | Vite (`npm run dev`, puerto 5173) — recarga en caliente |
| Dev server backend | `nodemon` — reinicia el servidor automáticamente al guardar cambios |
| Alertas UI | SweetAlert2 v11 — diálogos de confirmación y toasts en el panel admin |
| Gráficos | Chart.js 4 — monitoreo del panel admin |

---

## Base de Datos

**Nombre:** `altadensidad`  
**Motor:** MySQL 8.0  
**Charset:** `utf8mb4` / `utf8mb4_unicode_ci` — Codificación que soporta todos los caracteres Unicode, incluyendo tildes, ñ y emojis.

### Diagrama de tablas

```
Productos
├── id (PK, AUTO_INCREMENT)
├── nombre        VARCHAR(200)
├── rating        INT (1-5, default 4)
├── imagen        VARCHAR(300)
├── categoria     VARCHAR(100)
├── genero        VARCHAR(50)
├── descripcion   TEXT
├── precio        DECIMAL(10,2)
├── activo        TINYINT(1) default 1
└── creado_en     DATETIME

ProductoTallas
├── id (PK)
├── producto_id   FK → Productos.id
└── talla         VARCHAR(20)

ProductoTiposEnvase
├── id (PK)
├── producto_id   FK → Productos.id
└── tipo_envase   VARCHAR(100)

Envases
├── id (PK, AUTO_INCREMENT)
├── nombre        VARCHAR(200)
├── imagen        VARCHAR(300)
├── material      VARCHAR(100)
├── descripcion   TEXT
├── precio        DECIMAL(10,2)
├── activo        TINYINT(1) default 1
└── creado_en     DATETIME

EnvaseTallas
├── id (PK)
├── envase_id     FK → Envases.id
└── talla         VARCHAR(20)

Usuarios
├── id (PK, AUTO_INCREMENT)
├── nombre        VARCHAR(100)
├── email         VARCHAR(200) UNIQUE
├── password_hash VARCHAR(300)
├── rol           ENUM('admin', 'cliente') default 'cliente'
├── activo        TINYINT(1) default 1
└── creado_en     DATETIME
```

### Crear la base de datos

```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p -e "source C:/AltaDensidadPAGE/database/schema_mysql.sql"
```

---

## Backend

### `backend/server.js`

Punto de entrada del servidor Express. Responsabilidades:
- Carga variables de entorno desde `.env`
- Configura CORS para orígenes `localhost:5500` y `localhost:3000`
- Registra las rutas `/api/productos`, `/api/envases`, `/api/auth`
- Expone `/api/health` como health check
- Maneja `EADDRINUSE` con mensaje amigable
- Conecta al pool MySQL antes de iniciar el listener

**Iniciar:**
```powershell
cd backend
node server.js
# o en modo watch:
npx nodemon server.js
```

### `backend/config/db.js`

Pool de conexión singleton usando `mysql2/promise`.

```js
// getConnection() — crea el pool la primera vez y lo reutiliza en las siguientes llamadas
// Evita abrir y cerrar conexiones en cada request (costoso en rendimiento)
async function getConnection() { ... }

// closeConnection() — cierra el pool manualmente (usado solo en los seeds al terminar)
async function closeConnection() { ... }
```

> El pool mantiene hasta 10 conexiones simultáneas abiertas (`connectionLimit: 10`) y las reparte entre las rutas que las necesiten.

### `backend/routes/productos.js`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/productos` | Lista todos los productos con tallas y tipos de envase |
| GET | `/api/productos/:id` | Obtiene un producto por ID |
| POST | `/api/productos` | Crea producto + tallas + tipos de envase (transacción) |
| PUT | `/api/productos/:id` | Actualiza producto + reemplaza tallas/tipos (transacción) |
| DELETE | `/api/productos/:id` | Elimina producto y sus relaciones (transacción) |

Las queries usan `GROUP_CONCAT` para devolver tallas y tipos de envase como un string separado por comas (ej: `"30ml,60ml,100ml"`), que el frontend luego convierte a array con `.split(',')`. Las operaciones de escritura usan transacciones para garantizar consistencia entre tablas relacionadas.

### `backend/routes/envases.js`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/envases` | Lista todos los envases con tallas |
| GET | `/api/envases/:id` | Obtiene un envase por ID |
| POST | `/api/envases` | Crea envase + tallas (transacción) |
| PUT | `/api/envases/:id` | Actualiza envase + reemplaza tallas (transacción) |
| DELETE | `/api/envases/:id` | Elimina envase y sus tallas (transacción) |

### `backend/routes/auth.js`

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/register` | Registra nuevo usuario (rol: `cliente`) |
| POST | `/api/auth/login` | Autentica usuario, retorna JWT |

**Validaciones en registro:**
- `nombre`, `email`, `password` requeridos
- `password` mínimo 6 caracteres
- Email único (409 si ya existe)

**Token JWT:**
- Payload: `{ id, email, rol }` — datos mínimos para identificar al usuario sin consultar la DB
- Expiración: 7 días — el usuario permanece logueado una semana sin re-autenticarse
- Secret: variable `JWT_SECRET` en `.env` — clave para firmar y verificar la autenticidad del token

---

## Frontend (React)

La tienda, las páginas de acceso y el panel son una sola SPA. El diseño es el sistema **Haute Parfumerie**
(`README_CAMBIO_DISENO.md`): tokens `--c-*`, Cormorant Garamond + Jost, filetes de 1 px, radio 0, modo
oscuro por defecto y claro con `html.modo-claro` / `data-theme`.

### Rutas

| Ruta | Página |
|---|---|
| `/` | Hero, colección (búsqueda, filtros, orden, paginación), Top 10, envases, kits, nosotros |
| `/top10`, `/envases`, `/nosotros` | Páginas dedicadas |
| `/login`, `/reset` | Acceso y recuperación de contraseña |
| `/success`, `/pending`, `/failure` | Retorno de Mercado Pago (verifican el pago con `?payment_id=`) |
| `/admin` | Panel (solo rol `admin`): monitoreo, productos, envases, kits, Top 10, órdenes |

Las URLs antiguas (`/top10.html`, `/success.html?…`, etc.) redirigen a las nuevas conservando la query,
en `vercel.json` y también dentro de la app.

### Código (`src/`)

```
src/
├── main.jsx, App.jsx        # Entrada y rutas (el admin carga aparte: Chart.js/SweetAlert2 solo ahí)
├── config.js                # API (VITE_API_URL), WhatsApp, tarifas de envío
├── styles/                  # haute-parfumerie.css, chatbot.css, acceso.css, admin-hp.css
├── data/catalogo.js         # Catálogo de respaldo: se pinta al instante y la API lo reemplaza
├── lib/                     # api.js (fetch), producto.js (modelo, marcas, perfil olfativo), hooks.jsx (tema, SEO, clases de body)
├── tienda/                  # TiendaContext (catálogo + bolsa + capas), Marco (header/footer), Secciones,
│                            # Capas (detalle y kit), Bolsa (checkout Mercado Pago), Aura (asistente IA)
├── paginas/                 # Inicio, Top10, EnvasesPagina, Nosotros
├── acceso/                  # AccesoLayout, Login, Reset, ResultadoPago
└── admin/                   # Admin (shell), Monitoreo, *Admin por sección, comunes (tablas, modales, imágenes, DATA)
```

### Estado que se guarda en el navegador

| Clave | Dónde | Uso |
|---|---|---|
| `ad_cart_v2` | localStorage | Bolsa (la de la web anterior, `altadensidad_carrito`, se migra sola) |
| `altadensidad_tema` | localStorage | `claro` / `oscuro` |
| `token`, `usuario` | localStorage | Sesión (JWT + `{ nombre, email, rol }`) |
| `admin_active_tab`, `admin_sidebar` | localStorage | Sección y sidebar compacto del panel |
| `ad_chat_history_v2`, `ad_ai_session_id` | sessionStorage | Conversación con AURA |

### CSS encapsulado

`acceso.css` y `admin-hp.css` definen clases genéricas con estilos distintos (`.alerta`, `.form-group`,
`.hidden`). Antes cada página cargaba solo su hoja; en la SPA conviven, así que `vite.config.js` las encierra
al compilar bajo la clase que su layout pone en `<body>` (`.acc-body` y `.adm`). Los archivos fuente no se tocan.

---

## Kits de Fragancias Exclusivas

Sección dinámica del inicio (`/#kits`) que muestra colecciones de fragancias premium.

| Kit | Marca | Precio |
|---|---|---|
| Kit Haya | Lattafa | $50.000 COP |
| Kit Thank U Next *(Más Popular)* | Ariana Grande | $50.000 COP |
| Kit Bade Oud Sublime | Lattafa | $50.000 COP |
| Kit Yara | Lattafa | $50.000 COP |

Cada kit incluye una selección exclusiva de fragancias de alta densidad. El botón "Agregar" permite integrar el kit directamente al carrito de compras.

> Envío gratis en compras superiores a **$100.000 COP**.

---

## Integración WhatsApp

El sitio usa WhatsApp como canal de venta y contacto en tres puntos:

| Punto | Ubicación | Número |
|---|---|---|
| Botón "🛒 Comprar" | Navbar de todas las páginas | `3046477694` |
| Checkout del carrito | Panel lateral de carrito | `3046477694` |
| Botón de cada Kit | Sección Kits del inicio | `3046477694` |

---

## Autenticación

### Flujo

```
Usuario llena formulario → POST /api/auth/login
  → Server verifica email en DB
  → Compara password con bcrypt
  → Retorna JWT + datos del usuario
Frontend guarda en localStorage:
  - token   → JWT
  - usuario → JSON { nombre, email, rol }
```

### Claves en localStorage

| Clave | Valor | Uso |
|---|---|---|
| `token` | JWT string | Se envía como `Authorization: Bearer <token>` en futuras peticiones protegidas |
| `usuario` | JSON stringify `{ nombre, email, rol }` | Permite al frontend mostrar el nombre del usuario y controlar acceso por rol sin consultar la DB |

### Redirección post-login

- `rol === 'admin'` → `/admin`
- `rol === 'cliente'` → `/`

### Credenciales admin por defecto

Definidas en `backend/seed-admin.js` antes de ejecutarlo por primera vez. Usar una contraseña segura.

---

## API REST

**Base URL:** `http://localhost:3000/api`

### Respuesta estándar

Todos los endpoints retornan siempre el mismo formato para facilitar el manejo de errores en el frontend:

```json
{
  "success": true,         // booleano — indica si la operación fue exitosa
  "message": "...",        // texto descriptivo del resultado o del error
  "data": { ... }          // payload con los datos (solo en respuestas exitosas)
}
```

### Endpoints completos

```
GET    /api/health
GET    /api/productos
GET    /api/productos/:id
POST   /api/productos
PUT    /api/productos/:id
DELETE /api/productos/:id

GET    /api/envases
GET    /api/envases/:id
POST   /api/envases
PUT    /api/envases/:id
DELETE /api/envases/:id

POST   /api/auth/register
POST   /api/auth/login
```

### Ejemplo — crear producto

```json
POST /api/productos
{
  "name": "Nombre del perfume",
  "rating": 5,
  "image": "img/PRODUCTO.jpg",
  "category": "Floral",
  "gender": "Femenino",
  "description": "Descripción del producto",
  "price": 45000,
  "sizes": ["30ml", "60ml", "100ml"],
  "envaseTypes": ["Atomizador", "Roll-on"]
}
```

---

## Scripts de Datos

Ejecutar **con el servidor corriendo** y la DB creada:

```powershell
cd backend

# Siembra 95 productos vía API POST
node seed-productos.js

# Siembra 11 envases vía API POST
node seed-envases.js

# Crea el superusuario administrador directamente en DB
node seed-admin.js
```

> `seed-admin.js` es idempotente: si el admin ya existe, no crea uno nuevo (solo actualiza el rol si fuera necesario).

---

## Variables de Entorno


Archivo: `backend/.env` (copia desde `backend/.env.example`)

```env
# ---------- MySQL (Conexion) ----------
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=altadensidad
DB_USER=root
DB_PASSWORD=tu_password

# ---------- Server ----------
PORT=3000
FRONTEND_URL=http://localhost:5500

# ---------- Autenticación / Seguridad ----------
JWT_SECRET=tu_jwt_secret_seguro
# Llave opcional para peticiones administrativas (header: x-admin-key)
ADMIN_API_KEY=

# ---------- Mercado Pago ----------
MP_ACCESS_TOKEN=
MP_NOTIFICATION_URL=

# ---------- Email (SendGrid) ----------
SENDGRID_API_KEY=

# ---------- Entorno ----------
NODE_ENV=development
```

> `.env` está en `.gitignore` y nunca debe subirse al repositorio.

---

## Cómo Ejecutar

### Requisitos previos

- Node.js 
- MySQL 8.0 corriendo en puerto 3306

### Primera vez

```powershell
# 1. Instalar dependencias del backend
cd C:\AltaDensidadPAGE\backend
npm install

# 2. Crear la base de datos y tablas
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p -e "source C:/AltaDensidadPAGE/database/schema_mysql.sql"

# 3. Iniciar el servidor
node server.js

# 4. En otra terminal — sembrar datos
node seed-productos.js
node seed-envases.js
node seed-admin.js

# 5. En la raíz del repo — frontend
cd C:\AltaDensidadPAGE
npm install
npm run dev      # http://localhost:5173
```

### Uso diario

```powershell
# Verificar que MySQL esté corriendo
Get-Service MYSQL80

# Inicializar MySQL (requiere terminal como Administrador)
Start-Service MYSQL80

# Iniciar backend
cd C:\AltaDensidadPAGE\backend
node server.js

# Frontend (otra terminal, raíz del repo)
npm run dev
# Para usar el backend local en vez del de Railway: crear .env.local con
# VITE_API_URL=http://localhost:3000/api
```

### Si el puerto 3000 ya está en uso

```powershell
# Ver qué proceso lo ocupa
Get-NetTCPConnection -LocalPort 3000 -State Listen | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Get-Process -Id $_ }

# Matar el proceso (reemplazar ID)
Stop-Process -Id <ID> -Force
```

---

## Integración Mercado Pago

Pasos rápidos para habilitar el checkout con Mercado Pago (Checkout Pro):

- **Instalar dependencia en el backend**:

```powershell
cd backend
npm install mercadopago
```

- **Variables de entorno**: copia `backend/.env.example` a `backend/.env` y añade `MP_ACCESS_TOKEN` (sandbox o producción) y `FRONTEND_URL`.

- **Endpoint disponible**: `POST /api/mercadopago/create_preference` — espera un body `{ items: [{ id, name, price, quantity, image }] }` y devuelve la `preference` creada por Mercado Pago. El frontend redirige al `preference.init_point`.

- **Webhook**: `POST /api/mercadopago/webhook` está creado como stub; registar la `MP_NOTIFICATION_URL` en el panel de Mercado Pago y completar la lógica para actualizar órdenes/estados.

- **Frontend**: el botón "Pagar con Mercado Pago" en el drawer del carrito llama al endpoint y redirige al checkout. En desarrollo usar `MP_ACCESS_TOKEN` de sandbox y probar con tarjetas de prueba.

Notas:
- Asegúrate de usar las URLs correctas en `FRONTEND_URL` y `MP_NOTIFICATION_URL` cuando despliegues a producción.
- Verifica la moneda y los montos (COP) en la cuenta de Mercado Pago y ajusta `currency_id` si fuera necesario.

### Verificación de firma (webhooks)

Es recomendable habilitar verificación HMAC en los webhooks para evitar procesamiento de notificaciones falsificadas.

- Variable: `MP_WEBHOOK_SECRET` — si la configuras en el backend, el servidor intentará validar la cabecera de firma (por ejemplo `x-hub-signature-256`, `x-mercadopago-signature` o `x-mp-signature`) usando HMAC-SHA256 sobre el body raw.
- Si la cabecera no está presente o la verificación falla, el webhook responderá `401` y no actualizará la orden.
- Para habilitar: establece `MP_WEBHOOK_SECRET` en `backend/.env` y, si tu proveedor (o proxy) permite, configura la firma en las notificaciones. Si Mercado Pago no envía firma, deja el valor vacío (verificación omitida).

---

## Despliegue (Railway & Vercel)

Recomendación: desplegar el backend en una plataforma con soporte para Node.js (Railway, Render, Heroku) y servir el frontend como sitio estático (Vercel, Netlify, o el propio Railway). Aquí un ejemplo con Railway (backend) + Vercel (frontend).

1) Railway (backend)

- Crea un nuevo proyecto y conecta tu repo de GitHub.
- Añade el servicio MySQL (o conecta la base de datos externa) y copia las credenciales a las variables de entorno en Railway: `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USER`, `DB_PASSWORD`.
- Define variables de entorno en Railway (Settings → Variables):
  - `JWT_SECRET` — valor fuerte
  - `MP_ACCESS_TOKEN` — token de producción o sandbox
  - `MP_NOTIFICATION_URL` — `https://<tu-backend>.railway.app/api/mercadopago/webhook`
  - `FRONTEND_URL` — URL pública del frontend (ej: `https://tu-frontend.vercel.app`)
  - `ADMIN_API_KEY` — opcional, clave administrativa para llamadas protegidas (header `x-admin-key`)
  - `SENDGRID_API_KEY` — opcional, para notificaciones por email
- Start command: `node server.js`
- Si prefieres migraciones manuales, ejecuta el script SQL `database/create_orders_table.sql` en la DB de producción; el servidor también intenta crear la tabla `Ordenes` al arrancar.

2) Vercel (frontend)

- Conecta el repositorio (raíz del repo). `vercel.json` ya define el build: `npm run build` → `dist/` (Vite),
  la reescritura SPA y las redirecciones de las URLs `.html` antiguas.
- Opcional: `VITE_API_URL` si el backend cambia de dominio (se incrusta al compilar).
- Asegúrate de que `FRONTEND_URL` en Railway apunte a la URL pública de Vercel.

3) Notas y comprobaciones

- Registra la `MP_NOTIFICATION_URL` en el panel de Mercado Pago para recibir notificaciones de pago.
- Verifica en producción con una preferencia real y revisa el webhook: `POST /api/mercadopago/webhook` actualiza el status en la tabla `Ordenes`.
- Seguridad: protege los endpoints administrativos (`/api/mercadopago/orders`, `/api/mercadopago/order/:external_reference` y `PUT /api/mercadopago/order/:external_reference`) con JWT o `x-admin-key`. Se recomienda crear un usuario admin y usar `JWT_SECRET` seguro.
