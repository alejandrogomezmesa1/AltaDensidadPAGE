# Despliegue — Alta Densidad

## Arquitectura

| Capa | Plataforma | URL |
|---|---|---|
| Frontend | Vercel (estático) | https://alta-densidad-page.vercel.app |
| Backend | Railway | https://altadensidadpage-production.up.railway.app |
| Base de datos | MySQL en Railway | `mysql.railway.internal:3306` (privado) |

---

## Frontend — Vercel

- Desplegado automáticamente desde `main` en GitHub
- Solo sirve archivos estáticos: `*.html`, `*.css`, `*.js`, `img/**`
- El backend fue removido de Vercel (`vercel.json` actualizado)

### `vercel.json`
Solo builds estáticos, sin rutas `/api`.

---

## Backend — Railway

- Repo: `alejandrogomezmesa1/AltaDensidadPAGE`
- **Root Directory:** `backend`
- **Start Command:** `node server.js`
- Configurado en `backend/railway.toml`

### Variables de entorno (configurar en Railway → servicio backend → Variables)

```
DB_HOST=mysql.railway.internal
DB_PORT=3306
DB_USER=root
DB_PASSWORD=<MYSQLPASSWORD del servicio MySQL en Railway>
DB_DATABASE=railway
JWT_SECRET=<secret seguro generado con crypto.randomBytes>
FRONTEND_URL=https://alta-densidad-page.vercel.app
PORT=3000
NODE_ENV=production
```

### `backend/railway.toml`

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "node server.js"
restartPolicyType = "on_failure"
```

---

## Base de datos — MySQL en Railway

- La conexión usa el host interno `mysql.railway.internal` (sin egress fees)
- Base de datos: `railway`
- Usuario: `root`

---

## URLs de API en el frontend

Todos los archivos JS usan detección de entorno:

```js
const base = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
    ? 'http://localhost:3000/api'
    : 'https://altadensidadpage-production.up.railway.app/api';
```

Archivos modificados: `api.js`, `index.js`, `envases.js`, `admin.js`, `login.js`

---

## Flujo de redeploy

1. Hacer cambios en el código
2. `git add -A ; git commit -m "mensaje" ; git push`
3. Vercel redespliega el frontend automáticamente
4. Railway redespliega el backend automáticamente

---

## Notas de seguridad

- `.env` está en `.gitignore` — nunca subir al repo
- JWT_SECRET y DB_PASSWORD solo deben existir como variables de entorno en Railway
- No exponer credenciales en el README ni en ningún archivo del repo
