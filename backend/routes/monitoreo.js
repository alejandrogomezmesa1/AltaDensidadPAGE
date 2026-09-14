const express = require('express');
const router = express.Router();
const os = require('os');
const { getConnection } = require('../config/db');
const { requireAdmin } = require('../middleware/auth');

// Formatear segundos a string legible (días, horas, mins, segs)
function formatUptime(seconds) {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(' ');
}

// GET /api/admin/monitoreo/ping-db
// Prueba de latencia instantánea a la base de datos
router.get('/ping-db', requireAdmin, async (req, res) => {
    const t0 = Date.now();
    try {
        const pool = await getConnection();
        await pool.query('SELECT 1');
        const latency = Date.now() - t0;
        return res.json({
            success: true,
            status: 'online',
            latencyMs: latency,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            status: 'error',
            error: err.message,
            latencyMs: Date.now() - t0
        });
    }
});

// GET /api/admin/monitoreo/resumen
// Resumen integral de telemetría y salud del sistema
router.get('/resumen', requireAdmin, async (req, res) => {
    const t0 = Date.now();
    try {
        const pool = await getConnection();

        // 1. Diagnóstico de DB y latencia
        let dbLatencyMs = 0;
        let dbStatus = 'healthy';
        try {
            const dbPingStart = Date.now();
            await pool.query('SELECT 1');
            dbLatencyMs = Date.now() - dbPingStart;
        } catch (dbErr) {
            dbStatus = 'degraded';
            console.error('Error ping DB:', dbErr);
        }

        // 2. Telemetría de Servidor Node.js
        const mem = process.memoryUsage();
        const serverStats = {
            uptimeSeconds: Math.floor(process.uptime()),
            uptimeFormatted: formatUptime(process.uptime()),
            nodeVersion: process.version,
            platform: `${os.type()} ${os.release()} (${os.arch()})`,
            memory: {
                rssMB: Math.round(mem.rss / (1024 * 1024)),
                heapTotalMB: Math.round(mem.heapTotal / (1024 * 1024)),
                heapUsedMB: Math.round(mem.heapUsed / (1024 * 1024)),
                heapPercent: Math.round((mem.heapUsed / mem.heapTotal) * 100)
            },
            dbStatus,
            dbLatencyMs,
            cpuCores: os.cpus() ? os.cpus().length : 1,
            serverTime: new Date().toISOString()
        };

        // 3. Telemetría de Ventas y Órdenes
        let totalOrdenes = 0;
        let ventasHoy = { count: 0, total: 0 };
        let ventasMes = { total: 0 };
        let desgloseEstados = [];
        let tendenciaDiaria = [];

        try {
            // Conteo total y por estado
            const [estadosRows] = await pool.query(
                `SELECT status, COUNT(*) AS count, COALESCE(SUM(total), 0) AS sum_total 
                 FROM Ordenes 
                 GROUP BY status`
            );
            desgloseEstados = estadosRows.map(r => ({
                status: r.status,
                count: Number(r.count),
                total: Number(r.sum_total)
            }));
            totalOrdenes = desgloseEstados.reduce((acc, curr) => acc + curr.count, 0);

            // Ventas de hoy (aprobadas)
            const [hoyRows] = await pool.query(
                `SELECT COUNT(*) AS count, COALESCE(SUM(total), 0) AS total 
                 FROM Ordenes 
                 WHERE status = 'approved' AND DATE(created_at) = CURDATE()`
            );
            if (hoyRows.length > 0) {
                ventasHoy = { count: Number(hoyRows[0].count), total: Number(hoyRows[0].total) };
            }

            // Ventas últimos 30 días (aprobadas)
            const [mesRows] = await pool.query(
                `SELECT COALESCE(SUM(total), 0) AS total 
                 FROM Ordenes 
                 WHERE status = 'approved' AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
            );
            if (mesRows.length > 0) {
                ventasMes = { total: Number(mesRows[0].total) };
            }

            // Tendencia diaria últimos 14 días
            const [tendenciaRows] = await pool.query(
                `SELECT DATE(created_at) AS fecha,
                        COUNT(*) AS ordenes,
                        COALESCE(SUM(CASE WHEN status = 'approved' THEN total ELSE 0 END), 0) AS ingresos
                 FROM Ordenes 
                 WHERE created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY)
                 GROUP BY DATE(created_at)
                 ORDER BY fecha ASC`
            );
            tendenciaDiaria = tendenciaRows.map(r => ({
                fecha: r.fecha instanceof Date ? r.fecha.toISOString().split('T')[0] : String(r.fecha),
                ordenes: Number(r.ordenes),
                ingresos: Number(r.ingresos)
            }));
        } catch (ordErr) {
            console.warn('Error consultando métricas de órdenes:', ordErr.message);
        }

        // 4. Telemetría de Inventario y Catálogo
        let inventario = {
            totalProductos: 0,
            activos: 0,
            inactivos: 0,
            sinPrecio: 0,
            totalEnvases: 0,
            envasesActivos: 0,
            totalKits: 0,
            top10Count: 0
        };

        try {
            const [prodRows] = await pool.query(
                `SELECT 
                    COUNT(*) AS total,
                    COALESCE(SUM(CASE WHEN activo = 1 THEN 1 ELSE 0 END), 0) AS activos,
                    COALESCE(SUM(CASE WHEN activo = 0 THEN 1 ELSE 0 END), 0) AS inactivos,
                    COALESCE(SUM(CASE WHEN precio <= 0 THEN 1 ELSE 0 END), 0) AS sin_precio
                 FROM Productos`
            );
            if (prodRows.length > 0) {
                inventario.totalProductos = Number(prodRows[0].total);
                inventario.activos = Number(prodRows[0].activos);
                inventario.inactivos = Number(prodRows[0].inactivos);
                inventario.sinPrecio = Number(prodRows[0].sin_precio);
            }

            const [envRows] = await pool.query(
                `SELECT 
                    COUNT(*) AS total,
                    COALESCE(SUM(CASE WHEN activo = 1 THEN 1 ELSE 0 END), 0) AS activos
                 FROM Envases`
            );
            if (envRows.length > 0) {
                inventario.totalEnvases = Number(envRows[0].total);
                inventario.envasesActivos = Number(envRows[0].activos);
            }

            try {
                const [kitRows] = await pool.query('SELECT COUNT(*) AS total FROM Kits WHERE activo = 1');
                if (kitRows.length > 0) inventario.totalKits = Number(kitRows[0].total);
            } catch (e) {}

            try {
                const [topRows] = await pool.query('SELECT COUNT(*) AS total FROM Top10');
                if (topRows.length > 0) inventario.top10Count = Number(topRows[0].total);
            } catch (e) {}
        } catch (invErr) {
            console.warn('Error consultando métricas de inventario:', invErr.message);
        }

        // 5. Telemetría de Usuarios y Colaboradores en Inducción
        let personal = {
            totalUsuarios: 0,
            porRol: [],
            induccion: {
                pendiente: 0,
                enProgreso: 0,
                examenAprobado: 0,
                autorizado: 0,
                bloqueado: 0
            }
        };

        try {
            const [userRoles] = await pool.query(
                `SELECT rol, COUNT(*) AS count FROM Usuarios GROUP BY rol`
            );
            personal.porRol = userRoles.map(r => ({ rol: r.rol, count: Number(r.count) }));
            personal.totalUsuarios = personal.porRol.reduce((acc, curr) => acc + curr.count, 0);

            const [indRows] = await pool.query(
                `SELECT estado_induccion, COUNT(*) AS count 
                 FROM Usuarios 
                 WHERE rol = 'empleado' 
                 GROUP BY estado_induccion`
            );
            for (let row of indRows) {
                const est = row.estado_induccion;
                const cnt = Number(row.count);
                if (est === 'pendiente_capacitacion') personal.induccion.pendiente = cnt;
                else if (est === 'en_progreso') personal.induccion.enProgreso = cnt;
                else if (est === 'examen_aprobado') personal.induccion.examenAprobado = cnt;
                else if (est === 'autorizado') personal.induccion.autorizado = cnt;
                else if (est === 'bloqueado') personal.induccion.bloqueado = cnt;
            }
        } catch (usrErr) {
            console.warn('Error consultando métricas de personal:', usrErr.message);
        }

        // 6. Alertas Dinámicas del Sistema
        const alertas = [];
        if (personal.induccion.examenAprobado > 0) {
            alertas.push({
                id: 'alerta_autorizacion',
                nivel: 'critico',
                titulo: `${personal.induccion.examenAprobado} Colaborador(es) esperando Autorización`,
                detalle: 'Han completado y aprobado el examen final al 100%. Requieren confirmación del administrador.',
                accion: 'Autorizar Ahora',
                seccion: 'empleados'
            });
        }
        if (personal.induccion.bloqueado > 0) {
            alertas.push({
                id: 'alerta_bloqueados',
                nivel: 'advertencia',
                titulo: `${personal.induccion.bloqueado} Colaborador(es) Bloqueado(s)`,
                detalle: 'Agotaron los 3 intentos del examen de inducción y requieren reinicio o revisión.',
                accion: 'Ver Colaboradores',
                seccion: 'empleados'
            });
        }
        if (inventario.sinPrecio > 0) {
            alertas.push({
                id: 'alerta_sin_precio',
                nivel: 'advertencia',
                titulo: `${inventario.sinPrecio} Producto(s) sin precio configurado`,
                detalle: 'Existen productos en catálogo con precio $0 o no especificado.',
                accion: 'Revisar Productos',
                seccion: 'productos'
            });
        }
        const ordenesPendientes = desgloseEstados.find(e => e.status === 'pending');
        if (ordenesPendientes && ordenesPendientes.count > 0) {
            alertas.push({
                id: 'alerta_ordenes_pendientes',
                nivel: 'info',
                titulo: `${ordenesPendientes.count} Órdenes en estado Pendiente`,
                detalle: 'Pagos o transacciones generadas en espera de confirmación de pasarela.',
                accion: 'Ver Órdenes',
                seccion: 'ordenes'
            });
        }
        if (dbLatencyMs > 250) {
            alertas.push({
                id: 'alerta_latencia_db',
                nivel: 'advertencia',
                titulo: `Latencia de base de datos elevada (${dbLatencyMs} ms)`,
                detalle: 'El tiempo de respuesta del servidor MySQL es superior al umbral estándar de 150 ms.',
                accion: 'Diagnosticar',
                seccion: 'monitoreo'
            });
        }

        // 7. Feed de Actividad Reciente Unificada
        let actividadReciente = [];
        try {
            // Últimas órdenes
            const [ultimasOrdenes] = await pool.query(
                `SELECT id, external_reference, total, status, created_at, envio_nombre, envio_ciudad 
                 FROM Ordenes 
                 ORDER BY created_at DESC 
                 LIMIT 8`
            );
            for (let ord of ultimasOrdenes) {
                actividadReciente.push({
                    tipo: 'orden',
                    icono: 'fa-receipt',
                    titulo: `Orden #${ord.external_reference || ord.id}`,
                    subtitulo: `${ord.envio_nombre || 'Cliente'} - ${ord.envio_ciudad || 'Colombia'}`,
                    monto: ord.total,
                    estado: ord.status,
                    fecha: ord.created_at
                });
            }

            // Últimos colaboradores registrados o autorizados
            const [ultimosEmpleados] = await pool.query(
                `SELECT id, nombre, email, estado_induccion, ultimo_puntaje, fecha_autorizacion, creado_en 
                 FROM Usuarios 
                 WHERE rol = 'empleado' 
                 ORDER BY COALESCE(fecha_autorizacion, creado_en) DESC 
                 LIMIT 6`
            );
            for (let emp of ultimosEmpleados) {
                actividadReciente.push({
                    tipo: 'empleado',
                    icono: 'fa-user-graduate',
                    titulo: `Colaborador: ${emp.nombre}`,
                    subtitulo: `Estado: ${emp.estado_induccion} (Puntaje: ${emp.ultimo_puntaje}%)`,
                    monto: null,
                    estado: emp.estado_induccion,
                    fecha: emp.fecha_autorizacion || emp.creado_en
                });
            }

            // Ordenar por fecha cronológica descendente
            actividadReciente.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
            actividadReciente = actividadReciente.slice(0, 12);
        } catch (actErr) {
            console.warn('Error consultando actividad reciente:', actErr.message);
        }

        const respuesta = {
            success: true,
            tiempoEjecucionMs: Date.now() - t0,
            servidor: serverStats,
            ventas: {
                totalOrdenes,
                ventasHoy,
                ventasMes,
                desgloseEstados,
                tendenciaDiaria
            },
            inventario,
            personal,
            alertas,
            actividadReciente
        };

        return res.json(respuesta);
    } catch (err) {
        console.error('Error general en endpoint de monitoreo:', err);
        return res.status(500).json({
            success: false,
            message: 'Error al generar telemetría de monitoreo',
            error: err.message
        });
    }
});

module.exports = router;
