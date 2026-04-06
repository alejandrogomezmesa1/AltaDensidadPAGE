# Guía de Despliegue — Perfumería Alta Densidad

Sigue estos pasos **en orden**. Si ya tienes instalado algún programa, omite ese paso.

---

## Requisitos — programas a instalar

| Programa | Versión | Descarga |
|---|---|---|
| Node.js | 18 o superior | https://nodejs.org (LTS) |
| MySQL | 8.0 | https://dev.mysql.com/downloads/installer/ |
| VS Code | cualquiera | https://code.visualstudio.com |
| Git | cualquiera | https://git-scm.com |

> **Extensión de VS Code requerida:** Live Server (autor: Ritwick Dey)  
> Buscarla en el panel de extensiones de VS Code (`Ctrl+Shift+X`) → instalar.

---

## Paso 1 — Clonar o copiar el proyecto

### Opción A — Con Git
Abre PowerShell y ejecuta:
```powershell
git clone <URL-del-repositorio> C:\AltaDensidadPAGE
cd C:\AltaDensidadPAGE
```

### Opción B — Con ZIP
1. Descomprime el archivo en `C:\AltaDensidadPAGE`
2. La estructura debe quedar exactamente así:
```
C:\AltaDensidadPAGE\
├── index.html
├── backend\
│   ├── server.js
│   ├── package.json
│   └── ...
└── database\
    └── schema_mysql.sql
```

---

## Paso 2 — Instalar dependencias del backend

Abre PowerShell y ejecuta:
```powershell
cd C:\AltaDensidadPAGE\backend
npm install
```

Verás que se crea la carpeta `node_modules\`. Eso es correcto.

---

## Paso 3 — Configurar el archivo `.env`

Dentro de `C:\AltaDensidadPAGE\backend\` crea un archivo llamado exactamente `.env` (sin nombre, solo la extensión) con este contenido:

```env
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=altadensidad
DB_USER=root
DB_PASSWORD=TU_CONTRASEÑA_DE_MYSQL
PORT=3000
JWT_SECRET=AltaDensidad_SecretKey_2025_!@#
NODE_ENV=development
```

> Reemplaza `TU_CONTRASEÑA_DE_MYSQL` por la contraseña que pusiste al instalar MySQL.  
> Si la instalaste sin contraseña, deja `DB_PASSWORD=` vacío.

### Cómo crear el archivo `.env` en VS Code
1. Abre VS Code en la carpeta `backend`
2. `Ctrl+N` → nuevo archivo
3. `Ctrl+Shift+P` → escribe `Save As` → guarda como `.env` en `C:\AltaDensidadPAGE\backend\`

---

## Paso 4 — Crear la base de datos

### 4.1 Iniciar MySQL

Abre PowerShell **como Administrador** (clic derecho → Ejecutar como administrador):
```powershell
Start-Service MYSQL80
```

Verifica que esté corriendo:
```powershell
Get-Service MYSQL80
# Debe decir: Status = Running
```

### 4.2 Ejecutar el schema

```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p -e "source C:/AltaDensidadPAGE/database/schema_mysql.sql"
```

Te pedirá la contraseña de MySQL → ingrésala → Enter.

Esto crea la base de datos `altadensidad` con todas las tablas.

> **¿MySQL está en otra ruta?** Busca `mysql.exe` con:
> ```powershell
> Get-ChildItem "C:\Program Files\MySQL" -Recurse -Filter "mysql.exe"
> ```

---

## Paso 5 — Iniciar el servidor

```powershell
cd C:\AltaDensidadPAGE\backend
node server.js
```

Debes ver:
```
Conexion a MySQL establecida correctamente
Servidor corriendo en http://localhost:3000
API disponible en http://localhost:3000/api
```

> **¿Ves un error?** Lee la sección **Solución de problemas** al final.

---

## Paso 6 — Sembrar los datos iniciales

Con el servidor corriendo, abre **otra terminal** (no cierres la del servidor) y ejecuta:

```powershell
cd C:\AltaDensidadPAGE\backend

node seed-productos.js
# Espera a que termine — siembra 95 productos

node seed-envases.js
# Espera a que termine — siembra 11 envases

node seed-admin.js
# Crea el usuario administrador
```

---

## Paso 7 — Abrir el frontend

1. Abre `C:\AltaDensidadPAGE` en VS Code
2. Clic derecho sobre `index.html` → **Open with Live Server**
3. Se abre el navegador en `http://127.0.0.1:5500/index.html`

---

## ✅ Verificación final

Abre el navegador y prueba estos pasos:

- [ ] `http://localhost:3000/api/health` → debe responder `{ "success": true }`
- [ ] `http://127.0.0.1:5500/index.html` → debe cargar el catálogo con productos
- [ ] `http://127.0.0.1:5500/login.html` → login con `admin@altadensidad.com` / `Admin2025$` → redirige a `admin.html`

---

## Credenciales de acceso

| Rol | Email | Contraseña |
|---|---|---|
| Administrador | `admin@altadensidad.com` | `Admin2025$` |

---

## Uso diario (después de la primera instalación)

Cada vez que quieras usar el proyecto:

```powershell
# 1. Iniciar MySQL (terminal como Administrador)
Start-Service MYSQL80

# 2. Iniciar el backend (terminal normal)
cd C:\AltaDensidadPAGE\backend
node server.js

# 3. Abrir index.html con Live Server en VS Code
```

---

## Solución de problemas

### ❌ `Cannot connect to MySQL` o `ECONNREFUSED`
MySQL no está corriendo. Abre PowerShell como Administrador:
```powershell
Start-Service MYSQL80
```

### ❌ `ER_ACCESS_DENIED_ERROR`
La contraseña en `.env` no coincide con la de MySQL. Abre `backend\.env` y corrige `DB_PASSWORD`.

### ❌ `El puerto 3000 ya está en uso`
Otro proceso ocupa el puerto. Ciérralo:
```powershell
Get-NetTCPConnection -LocalPort 3000 -State Listen |
  Select-Object -ExpandProperty OwningProcess |
  ForEach-Object { Stop-Process -Id $_ -Force }
```
Luego vuelve a ejecutar `node server.js`.

### ❌ Los productos no cargan en el catálogo
- Verifica que el servidor esté corriendo en puerto 3000
- Abre la consola del navegador (`F12` → Console) y busca el error
- Confirma que ejecutaste los seeds del Paso 6

### ❌ `node_modules not found` o error de módulos
```powershell
cd C:\AltaDensidadPAGE\backend
npm install
```

### ❌ `schema_mysql.sql` no se encontró
Asegúrate de que la ruta sea correcta. Verifica:
```powershell
Test-Path "C:\AltaDensidadPAGE\database\schema_mysql.sql"
# Debe responder: True
```
