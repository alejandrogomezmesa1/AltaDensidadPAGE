// ============================================================
// Migraciones versionadas del esquema
// ------------------------------------------------------------
// Cada archivo de ./migrations (NNN_descripcion.js) exporta `nombre` y `up(conn, h)` (module.exports).
// Se aplican en orden, una sola vez, y quedan registradas en `schema_migrations`.
// MySQL no revierte cambios de estructura (DDL) dentro de transacciones, así que
// cada migración debe ser idempotente: comprobar antes de crear o alterar.
// Un candado (GET_LOCK) evita que dos instancias migren al mismo tiempo.
// ============================================================
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, 'migrations');
const LOCK = 'alta_densidad_web_migraciones';

// Utilidades disponibles para cada migración
const helpers = (conn) => ({
    async tablaExiste(tabla) {
        const [r] = await conn.query('SELECT 1 FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?', [tabla]);
        return r.length > 0;
    },
    async columnaExiste(tabla, columna) {
        const [r] = await conn.query('SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?', [tabla, columna]);
        return r.length > 0;
    },
    async tipoColumna(tabla, columna) {
        const [r] = await conn.query('SELECT DATA_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?', [tabla, columna]);
        return r[0]?.DATA_TYPE?.toLowerCase() || null;
    },
    async indiceExiste(tabla, indice) {
        const [r] = await conn.query('SELECT 1 FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?', [tabla, indice]);
        return r.length > 0;
    }
});

const listarArchivos = () => fs.readdirSync(DIR)
    .filter(f => /^\d{3}_[\w-]+\.js$/.test(f))
    .sort();

const cargarMigraciones = async () => {
    const lista = [];
    for (const archivo of listarArchivos()) {
        const mod = require(path.join(DIR, archivo));
        if (typeof mod.up !== 'function') throw new Error(`La migración ${archivo} no exporta up()`);
        lista.push({ version: archivo.slice(0, 3), archivo, nombre: mod.nombre || archivo, up: mod.up });
    }
    return lista;
};

const asegurarRegistro = (conn) => conn.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
        version     VARCHAR(10)  PRIMARY KEY,
        nombre      VARCHAR(200) NOT NULL,
        aplicada_en DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        duracion_ms INT          NOT NULL DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
`);

const leerAplicadas = async (conn) => {
    const [rows] = await conn.query('SELECT version FROM schema_migrations');
    return new Set(rows.map(r => r.version));
};

// Aplica las migraciones pendientes. Nunca lanza: devuelve el resultado para que
// el servidor decida (hoy: arrancar igual, con las funciones nuevas deshabilitadas).
const ejecutarMigraciones = async (db, { log = console } = {}) => {
    const resultado = { aplicadas: new Set(), nuevas: [], error: null };
    let conn;
    try {
        conn = await db.getConnection();
        const [[{ ok }]] = await conn.query('SELECT GET_LOCK(?, 60) AS ok', [LOCK]);
        if (ok !== 1) throw new Error('No se obtuvo el candado de migraciones (otra instancia está migrando)');

        await asegurarRegistro(conn);
        resultado.aplicadas = await leerAplicadas(conn);
        const h = helpers(conn);

        for (const m of await cargarMigraciones()) {
            if (resultado.aplicadas.has(m.version)) continue;
            const inicio = Date.now();
            log.log(`[MIGRACIONES] Aplicando ${m.archivo}…`);
            await m.up(conn, h);
            const ms = Date.now() - inicio;
            await conn.query('INSERT INTO schema_migrations (version, nombre, duracion_ms) VALUES (?, ?, ?)', [m.version, m.nombre, ms]);
            resultado.aplicadas.add(m.version);
            resultado.nuevas.push(m.archivo);
        }
        log.log(resultado.nuevas.length
            ? `[MIGRACIONES] ${resultado.nuevas.length} aplicada(s): ${resultado.nuevas.join(', ')}`
            : '[MIGRACIONES] Esquema al día');
    } catch (error) {
        resultado.error = error;
        log.error('[MIGRACIONES] Error, se detiene en la migración pendiente:', error.message);
    } finally {
        if (conn) {
            await conn.query('SELECT RELEASE_LOCK(?)', [LOCK]).catch(() => {});
            conn.release();
        }
    }
    return resultado;
};

const estadoMigraciones = async (db) => {
    const conn = await db.getConnection();
    try {
        await asegurarRegistro(conn);
        const [rows] = await conn.query('SELECT version, nombre, aplicada_en FROM schema_migrations ORDER BY version');
        const aplicadas = new Map(rows.map(r => [r.version, r]));
        return (await cargarMigraciones()).map(m => ({
            version: m.version,
            archivo: m.archivo,
            aplicada_en: aplicadas.get(m.version)?.aplicada_en || null
        }));
    } finally {
        conn.release();
    }
};

module.exports = { ejecutarMigraciones, estadoMigraciones, helpers };
