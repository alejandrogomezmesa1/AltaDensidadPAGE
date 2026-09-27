# Migraciones del esquema (tienda web)

El esquema de la base se cambia **solo** con archivos de esta carpeta.
El servidor aplica los pendientes al arrancar y los registra en la tabla `schema_migrations`.

- Nombre: `NNN_descripcion.js` (número de 3 dígitos, consecutivo). Nunca se renombra ni se edita una migración ya aplicada: se crea una nueva.
- Exporta `{ nombre, async up(conn, h) }`. `h` trae `tablaExiste`, `columnaExiste`, `tipoColumna`, `indiceExiste`.
- Deben ser **idempotentes** (comprobar antes de crear o alterar): MySQL no revierte cambios de estructura si algo falla a mitad.
- Sin datos de ejemplo: las semillas van en los scripts `seed-*.js`.

Comandos (desde `backend/`):

```bash
npm run migrate          # aplica pendientes
npm run migrate:status   # lista aplicadas y pendientes
```

Los archivos de `../database/*.sql` quedan solo como referencia histórica: no se ejecutan.
