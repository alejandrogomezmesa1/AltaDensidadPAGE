// Uso: node migrate.js         → aplica las migraciones pendientes
//      node migrate.js status  → muestra cuáles están aplicadas
const { getConnection, closeConnection } = require('./config/db');
const { ejecutarMigraciones, estadoMigraciones } = require('./migrator');

(async () => {
    const comando = process.argv[2] || 'up';
    const pool = await getConnection();
    try {
        if (comando === 'status') {
            for (const m of await estadoMigraciones(pool)) {
                console.log(`${m.aplicada_en ? '✔' : '·'} ${m.archivo}${m.aplicada_en ? `  (${m.aplicada_en.toISOString ? m.aplicada_en.toISOString() : m.aplicada_en})` : '  pendiente'}`);
            }
        } else {
            const r = await ejecutarMigraciones(pool);
            if (r.error) process.exitCode = 1;
        }
    } finally {
        await closeConnection();
    }
})();
