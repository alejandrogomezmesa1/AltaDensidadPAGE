# Alta Densidad — Documentación Técnica

Tienda de perfumería de alta gama. Proyecto full-stack con frontend en HTML/CSS/JS vanilla y backend en Node.js + Express conectado a MySQL 8.0.

---

## Tabla de Contenidos

1. [Estructura del Proyecto](#estructura-del-proyecto)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Base de Datos](#base-de-datos)
4. [Backend](#backend)
5. [Frontend](#frontend)
6. [Paginación](#paginación)
7. [Carrito de Compras](#carrito-de-compras)
8. [SweetAlert2](#sweetalert2)
9. [Kits de Cuidado Corporal](#kits-de-cuidado-corporal)
10. [Integración WhatsApp](#integración-whatsapp)
11. [Autenticación](#autenticación)
12. [API REST](#api-rest)
13. [Scripts de Datos](#scripts-de-datos)
14. [Variables de Entorno](#variables-de-entorno)
15. [Cómo Ejecutar](#cómo-ejecutar)

---

## Estructura del Proyecto

```
AltaDensidadPAGE/
├── index.html          # Página principal (catálogo de lociones)
├── index.css
├── index.js
├── envases.html        # Catálogo de envases
├── envases.css
├── envases.js
├── top10.html          # Top 10 productos
├── top10.css
├── top10.js
├── nosotros.html       # Página "Quiénes somos"
├── nosotros.css
├── login.html          # Login y registro de usuarios
├── login.css
├── login.js
├── admin.html          # Panel de administración (protegido)
├── admin.css
├── admin.js
├── nav-sesion.js       # Script compartido de sesión en navbar
├── api.js              # Cliente API reutilizable
├── carrito.js          # Lógica del carrito de compras (sessionStorage)
├── tema.js             # Toggle modo oscuro/claro (localStorage)
├── tema.css            # Estilos para modo claro/oscuro
├── img/
│   ├── logo2025.png    # Logo del sitio (favicon + navbar)
│   └── ...             # Imágenes de productos, envases y kits
├── database/
│   ├── schema.sql          # Esquema original (SQL Server)
│   └── schema_mysql.sql    # Esquema activo (MySQL 8.0)
└── backend/
    ├── server.js
    ├── .env
    ├── package.json
    ├── config/
    │   └── db.js           # Pool de conexión MySQL
    ├── routes/
    │   ├── productos.js    # CRUD productos
    │   ├── envases.js      # CRUD envases
    │   └── auth.js         # Login y registro
    ├── seed-productos.js   # Siembra 95 productos vía API
    ├── seed-envases.js     # Siembra 11 envases vía API
    └── seed-admin.js       # Crea el superusuario admin
```

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | HTML5, CSS3, JavaScript — sin frameworks, puro vanilla |
| Backend | Node.js v22, Express 4.x — servidor HTTP y API REST |
| Base de datos | MySQL 8.0 — motor relacional, gestionado con MySQL Workbench |
| Autenticación | JWT (`jsonwebtoken`) + bcryptjs — tokens de sesión + hash de contraseñas |
| Driver DB | `mysql2/promise` — cliente MySQL para Node con soporte async/await |
| Variables de entorno | `dotenv` — carga credenciales desde `.env` sin exponerlas en el código |
| CORS | `cors` — permite que el frontend (puerto 5500) llame al backend (puerto 3000) |
| Dev server frontend | Live Server (VS Code, puerto 5500) — recarga automática al guardar |
| Dev server backend | `nodemon` — reinicia el servidor automáticamente al guardar cambios |
| Alertas UI | SweetAlert2 v11 — diálogos de confirmación y toasts en el panel admin |

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

## Frontend

### Páginas

| Archivo | Descripción |
|---|---|
| Archivo | Descripción |
|---|---|
| `index.html` | Catálogo principal de lociones/perfumes con paginación, filtros y carrito |
| `envases.html` | Catálogo de envases disponibles |
| `top10.html` | Top 10 productos destacados (datos hardcodeados en `top10.js`) |
| `nosotros.html` | Información de la empresa: misión, visión, compromiso y FAQs |
| `login.html` | Tabs de Login / Registro |
| `admin.html` | Panel CRUD con tabs Productos/Envases, paginación y SweetAlert2 (solo admin) |

### Diseño

- **Fondo:** `#0a0a0a` (negro)
- **Acento:** `#D4AF37` (dorado)
- **Tipografía:** serif elegante
- Totalmente responsive

### `nav-sesion.js`

Script incluido en todas las páginas (excepto `login.html` y `admin.html`). Lee `localStorage` y:
- Si hay sesión activa → muestra nombre del usuario con dropdown (cerrar sesión, panel admin si es admin)
- Si no hay sesión → muestra botón "Ingresar"

```html
<!-- Incluir antes de </body> en cada página -->
<script src="nav-sesion.js"></script>
```

### `api.js`

Cliente HTTP centralizado para llamadas al backend. Todas las peticiones apuntan a `http://localhost:3000/api`.

### `carrito.js`

Lógica completa del carrito de compras. Usa `sessionStorage` (se borra al cerrar la pestaña). Incluir en las páginas que muestren productos.

| Función | Descripción |
|---|---|
| `agregarAlCarrito(producto)` | Agrega un ítem o incrementa su cantidad |
| `cambiarCantidad(id, delta)` | Sube/baja la cantidad de un ítem; si llega a 0 lo elimina |
| `vaciarCarrito()` | Limpia todo el carrito |
| `obtenerCarrito()` | Retorna el array de ítems desde `sessionStorage` |
| `actualizarBadge()` | Actualiza el contador visual en el ícono del navbar |
| `renderCarrito()` | Re-dibuja el panel lateral del carrito |

```html
<!-- Incluir antes de </body> en páginas con carrito -->
<script src="carrito.js"></script>
```

### `tema.js` / `tema.css`

Toggle de modo oscuro/claro con persistencia en `localStorage` (clave `altadensidad_tema`).

- **Modo oscuro** → predeterminado (sin clase en `<html>`)
- **Modo claro** → activa la clase `html.modo-claro` que `tema.css` usa para sobreescribir variables CSS
- El script se incluye en `<head>` para aplicar el tema **antes** de que el DOM se pinte y evitar el flash de modo incorrecto
- Inyecta automáticamente un botón (sol/luna) en el navbar junto al elemento `#navSesion`

```html
<!-- Incluir en <head> de cada página -->
<link rel="stylesheet" href="tema.css">
<script src="tema.js"></script>
```

### Fetch de datos

Tanto `index.js` como `envases.js` usan `fetch` al iniciar (`DOMContentLoaded`) para cargar los datos desde la API en lugar de un array hardcodeado.

> `top10.js` es la excepción: usa un array estático de 10 productos hardcodeados directamente en el archivo (no consume la API).

### Auto-hide header en scroll

`envases.js` implementa un listener de scroll que oculta el header al bajar y lo muestra al subir, usando la clase CSS `.header--hidden`. Permite aprovechar todo el viewport al navegar el catálogo.

---

## Paginación

### Catálogo público (`index.js`)

- **12 ítems por página** (`ITEMS_POR_PAGINA = 12`)
- Botones anterior/siguiente con íconos chevron, deshabilitados en los extremos
- Números de página con elipsis inteligente para listas grandes (ej: `1 … 4 5 6 … 20`)
- Al cambiar de página hace scroll suave al inicio del grid
- `window.cambiarPagina(n)` expuesta globalmente para los `onclick` en el HTML
- El contador `#productCount` actualiza el total de resultados filtrados

```
paginasVisibles(actual, total):
  total ≤ 7  →  [1, 2, 3, 4, 5, 6, 7]
  actual ≤ 4 →  [1, 2, 3, 4, 5, '...', total]
  actual cerca del final → [1, '...', total-4 … total]
  cualquier otro → [1, '...', actual-1, actual, actual+1, '...', total]
```

### Panel Admin (`admin.js`)

- **10 ítems por página** para la tabla de productos y la de envases por separado
- Función reutilizable `renderPag(contenedorId, actual, total, onChange)` que genera los controles y llama el callback `onChange(nuevaPagina)` al hacer clic
- Misma lógica de elipsis con `pagRango(actual, total)`

---

## Carrito de Compras

### Almacenamiento

Usa `sessionStorage` con la clave `altadensidad_carrito`. El carrito se borra al cerrar la pestaña o el navegador.

### Estructura de un ítem

```json
{ "id": 5, "name": "LIGHT BLUE", "image": "img/...", "price": 35000, "cantidad": 2 }
```

### Drawer lateral

El carrito se muestra como un panel deslizable desde la derecha (`#carritoPanel`) con un overlay de fondo (`#carritoOverlay`). Se abre/cierra con `abrirCarrito()` / `cerrarCarrito()`, que también bloquean el scroll del body.

### Flujo de uso

```
Usuario hace clic en "Agregar" en una tarjeta de producto
  → agregarAlCarrito(producto)  — agrega o incrementa cantidad en sessionStorage
  → actualizarBadge()           — actualiza el contador numérico sobre el ícono del carrito
  → mostrarToastCarrito(nombre) — muestra notificación emergente por 2.5 s
  → renderCarrito()             — re-dibuja el contenido del drawer

Usuario hace clic en el ícono del carrito (navbar)
  → abrirCarrito()              — abre el panel lateral
```

### Checkout por WhatsApp

Al hacer clic en "Pedir por WhatsApp" se genera dinámicamente un enlace `wa.me` que incluye:
- Lista de productos con cantidades y precios
- Subtotal total en COP

```
https://wa.me/3046477694?text=Hola, quiero pedir:%0A• 2x Light Blue ($35.000)%0A%0ATotal: $70.000 COP
```

### Markup HTML requerido

Pegar antes de `</body>` en cada página que use el carrito:

```html
<!-- Overlay y panel drawer -->
<div id="carritoOverlay" class="carrito-overlay"></div>
<aside id="carritoPanel" class="carrito-panel">
    <div class="carrito-header">
        <h3><i class="fas fa-shopping-cart"></i> Mi Carrito</h3>
        <button id="btnCerrarCarrito" class="carrito-cerrar"><i class="fas fa-times"></i></button>
    </div>
    <div id="carritoLista" class="carrito-lista"></div>
    <div id="carritoFooter" class="carrito-footer"></div>
</aside>
<!-- Toast de confirmación -->
<div id="carritoToast" class="carrito-toast"></div>

<script src="carrito.js"></script>
```

El botón del carrito en el navbar debe tener `id="btnCarrito"` y el badge `id="carritoBadge"`.

---

## SweetAlert2

Usado exclusivamente en `admin.html` / `admin.js`. Cargado desde CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
```

### Cuándo se dispara

| Acción | Tipo | Descripción |
|---|---|---|
| Eliminar producto | Diálogo de confirmación | `icon: 'warning'`, botones Sí/Cancelar, dark theme |
| Eliminar envase | Diálogo de confirmación | Mismo estilo |
| Crear/editar producto | Toast | `position: 'top-end'`, 3 s, fondo `#1a1a1a`, texto dorado |
| Crear/editar envase | Toast | Mismo estilo |

### Tema de los diálogos

```js
Swal.fire({
    background: '#1a1a1a',   // fondo oscuro del modal
    color: '#fff',           // texto principal blanco
    confirmButtonColor: '#c0392b',  // rojo para eliminar
    cancelButtonColor: '#444'
});
```

### Tema de los toasts

```js
Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'success',
    timer: 3000,
    showConfirmButton: false,
    background: '#1a1a1a',
    color: '#D4AF37'   // acento dorado del sitio
});
```

---

## Kits de Cuidado Corporal

Sección estática en `index.html` que muestra 4 kits combinados (loción + crema corporal). No consume la API.

| Kit | Fragancia | Precio |
|---|---|---|
| Kit Haya | Lattafa | $50.000 COP |
| Kit Thank U Next *(Más Popular)* | Ariana Grande | $50.000 COP |
| Kit Bade Oud Sublime | Lattafa | $50.000 COP |
| Kit Yara | Lattafa | $50.000 COP |

Cada kit incluye: **Loción 150 ml + Crema corporal 230 ml**. El botón "Comprar Kit" genera un enlace directo a WhatsApp con el nombre del kit.

> Envío gratis en compras superiores a **$100.000 COP**.

---

## Integración WhatsApp

El sitio usa WhatsApp como canal de venta y contacto en tres puntos:

| Punto | Ubicación | Número |
|---|---|---|
| Botón "🛒 Comprar" | Navbar de todas las páginas | `3046477694` |
| Checkout del carrito | Panel lateral de carrito | `3046477694` |
| Botón de cada Kit | Sección Kits en `index.html` | `3046477694` |

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

- `rol === 'admin'` → `admin.html`
- `rol === 'cliente'` → `index.html`

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
- Live Server (VS Code) 

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

# 5. Abrir el frontend con Live Server en VS Code (puerto 5500)
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

# Abrir index.html con Live Server
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

- Conecta el repositorio y configura el proyecto como sitio estático.
- Asegúrate de que `FRONTEND_URL` en Railway apunte a la URL pública de Vercel.

3) Notas y comprobaciones

- Registra la `MP_NOTIFICATION_URL` en el panel de Mercado Pago para recibir notificaciones de pago.
- Verifica en producción con una preferencia real y revisa el webhook: `POST /api/mercadopago/webhook` actualiza el status en la tabla `Ordenes`.
- Seguridad: protege los endpoints administrativos (`/api/mercadopago/orders`, `/api/mercadopago/order/:external_reference` y `PUT /api/mercadopago/order/:external_reference`) con JWT o `x-admin-key`. Se recomienda crear un usuario admin y usar `JWT_SECRET` seguro.
