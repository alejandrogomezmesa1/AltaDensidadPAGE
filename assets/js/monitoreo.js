/**
 * Monitoreo y Telemetría en Tiempo Real - Fragancias Alta Densidad
 * Módulo de Control de Servidor, Ventas, Inventario y Personal
 */

const API_MONITOREO_BASE = (typeof location !== 'undefined' && (location.hostname === 'localhost' || location.hostname === '127.0.0.1') && location.port === '3000')
    ? 'http://localhost:3000/api/admin/monitoreo'
    : 'https://altadensidadpage-production.up.railway.app/api/admin/monitoreo';

let chartTendenciaInstance = null;
let chartEstadosInstance = null;

let datosMonitoreoCache = null;
let timerAutoRefresh = null;
let modoGraficoTendencia = 'ingresos'; // 'ingresos' | 'ordenes'

// Formateador de moneda en Pesos Colombianos (COP)
function formatCOP(valor) {
    if (isNaN(valor) || valor === null) return '$0';
    return '$' + Math.round(valor).toLocaleString('es-CO');
}

// Formatear fecha relativa o legible
function formatFechaEvento(fechaStr) {
    if (!fechaStr) return '';
    try {
        const d = new Date(fechaStr);
        if (isNaN(d.getTime())) return String(fechaStr);
        const hoy = new Date();
        const esHoy = d.toDateString() === hoy.toDateString();
        const horaStr = d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
        if (esHoy) return `Hoy ${horaStr}`;
        return `${d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })} ${horaStr}`;
    } catch (e) {
        return String(fechaStr);
    }
}

// Función principal de carga de métricas
async function cargarDatosMonitoreo() {
    const token = localStorage.getItem('token');
    const iconRef = document.getElementById('iconRefresh');
    const lblLastUpdate = document.getElementById('monitoreoLastUpdate');
    const liveDot = document.getElementById('liveDot');
    const liveText = document.getElementById('liveText');

    if (iconRef) iconRef.classList.add('fa-spin');
    if (liveText) liveText.textContent = 'ACTUALIZANDO...';

    try {
        const res = await fetch(`${API_MONITOREO_BASE}/resumen`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) {
            throw new Error(`Error en servidor: HTTP ${res.status}`);
        }

        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Error al obtener telemetría');

        datosMonitoreoCache = data;

        // Renderizar cada bloque del dashboard
        renderizarKPIs(data);
        renderizarAlertas(data.alertas);
        renderizarGraficos(data);
        renderizarTelemetriaServidor(data.servidor);
        renderizarFeedActividad(data.actividadReciente);

        if (lblLastUpdate) {
            const ahora = new Date();
            lblLastUpdate.textContent = `Actualizado: ${ahora.toLocaleTimeString('es-CO')}`;
        }
        if (liveDot) liveDot.className = 'live-dot online';
        if (liveText) liveText.textContent = 'EN VIVO';

    } catch (err) {
        console.error('Error al cargar datos de monitoreo:', err);
        if (lblLastUpdate) lblLastUpdate.textContent = `Error: ${err.message}`;
        if (liveDot) liveDot.className = 'live-dot offline';
        if (liveText) liveText.textContent = 'DESCONECTADO';
    } finally {
        if (iconRef) iconRef.classList.remove('fa-spin');
    }
}

// Renderizar tarjetas KPI principales
function renderizarKPIs(data) {
    const ventas = data.ventas || {};
    const servidor = data.servidor || {};
    const personal = data.personal || {};
    const inventario = data.inventario || {};

    // 1. Ventas Hoy
    const elVentasHoy = document.getElementById('kpiVentasHoyValor');
    const elVentasHoySub = document.getElementById('kpiVentasHoySub');
    if (elVentasHoy) elVentasHoy.textContent = formatCOP(ventas.ventasHoy?.total || 0);
    if (elVentasHoySub) elVentasHoySub.textContent = `${ventas.ventasHoy?.count || 0} órdenes aprobadas`;

    // 2. Ventas Mes
    const elVentasMes = document.getElementById('kpiVentasMesValor');
    if (elVentasMes) elVentasMes.textContent = formatCOP(ventas.ventasMes?.total || 0);

    // 3. Órdenes Totales & Aprobación
    const elTotalOrd = document.getElementById('kpiTotalOrdenesValor');
    const elTasaAprob = document.getElementById('kpiTasaAprobacion');
    const total = ventas.totalOrdenes || 0;
    if (elTotalOrd) elTotalOrd.textContent = total;

    const aprobadas = (ventas.desgloseEstados || []).find(e => e.status === 'approved')?.count || 0;
    const tasa = total > 0 ? Math.round((aprobadas / total) * 100) : 0;
    if (elTasaAprob) elTasaAprob.textContent = `${aprobadas} aprobadas (${tasa}%)`;

    // 4. Salud DB & Servidor
    const elLatencia = document.getElementById('kpiDbLatencia');
    const elUptime = document.getElementById('kpiUptime');
    const iconDb = document.getElementById('kpiIconDb');
    const latencia = servidor.dbLatencyMs || 0;

    if (elLatencia) {
        elLatencia.textContent = `${latencia} ms`;
        if (latencia > 250) {
            elLatencia.style.color = '#ef4444';
        } else if (latencia > 120) {
            elLatencia.style.color = '#f59e0b';
        } else {
            elLatencia.style.color = '#10b981';
        }
    }
    if (elUptime) elUptime.textContent = `Uptime: ${servidor.uptimeFormatted || '--'}`;



    // 6. Inventario
    const elProdActivos = document.getElementById('kpiProductosActivosValor');
    const elInvSub = document.getElementById('kpiInventarioSub');
    if (elProdActivos) elProdActivos.textContent = inventario.activos || 0;
    if (elInvSub) elInvSub.textContent = `${inventario.envasesActivos || 0} envases | ${inventario.totalKits || 0} kits`;
}

// Renderizar alertas dinámicas
function renderizarAlertas(alertas) {
    const contenedor = document.getElementById('monitoreoAlertasContenedor');
    if (!contenedor) return;

    if (!alertas || alertas.length === 0) {
        contenedor.classList.add('hidden');
        contenedor.innerHTML = '';
        return;
    }

    contenedor.classList.remove('hidden');
    contenedor.innerHTML = alertas.map(a => {
        let claseBorde = 'alerta-info';
        let iconoAlerta = 'fa-circle-info';
        if (a.nivel === 'critico') {
            claseBorde = 'alerta-critica';
            iconoAlerta = 'fa-triangle-exclamation';
        } else if (a.nivel === 'advertencia') {
            claseBorde = 'alerta-advertencia';
            iconoAlerta = 'fa-circle-exclamation';
        }

        return `
            <div class="monitoreo-alerta-card ${claseBorde}">
                <div class="alerta-card-left">
                    <div class="alerta-icono"><i class="fas ${iconoAlerta}"></i></div>
                    <div class="alerta-textos">
                        <strong class="alerta-titulo">${escHtml(a.titulo)}</strong>
                        <p class="alerta-detalle">${escHtml(a.detalle)}</p>
                    </div>
                </div>
                ${a.accion && a.seccion ? `
                    <button class="btn-alerta-accion" onclick="cambiarSeccion('${a.seccion}')">
                        ${escHtml(a.accion)} <i class="fas fa-arrow-right"></i>
                    </button>
                ` : ''}
            </div>
        `;
    }).join('');
}

// Renderizar los 3 gráficos interactivos con Chart.js
function renderizarGraficos(data) {
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js no está cargado');
        return;
    }

    // Paleta de colores Gold / Dark Luxury
    const COLOR_GOLD = '#D4AF37';
    const COLOR_GOLD_LIGHT = '#F3E5AB';
    const COLOR_GREEN = '#10B981';
    const COLOR_AMBER = '#F59E0B';
    const COLOR_RED = '#EF4444';
    const COLOR_BLUE = '#3B82F6';
    const COLOR_PURPLE = '#8B5CF6';

    // 1. GRÁFICO TENDENCIA (14 DÍAS)
    const ctxTendencia = document.getElementById('chartTendenciaVentas');
    if (ctxTendencia) {
        const tendencia = data.ventas?.tendenciaDiaria || [];
        const labels = tendencia.map(t => {
            const f = new Date(t.fecha + 'T00:00:00');
            return f.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
        });

        const datasetData = modoGraficoTendencia === 'ingresos'
            ? tendencia.map(t => t.ingresos)
            : tendencia.map(t => t.ordenes);

        const datasetLabel = modoGraficoTendencia === 'ingresos' ? 'Ingresos ($ COP)' : 'Órdenes (#)';

        if (chartTendenciaInstance) {
            chartTendenciaInstance.destroy();
        }

        chartTendenciaInstance = new Chart(ctxTendencia, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: datasetLabel,
                    data: datasetData,
                    borderColor: COLOR_GOLD,
                    backgroundColor: 'rgba(212, 175, 55, 0.15)',
                    borderWidth: 2.5,
                    pointBackgroundColor: COLOR_GOLD_LIGHT,
                    pointBorderColor: '#000',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    tension: 0.35,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#121214',
                        titleColor: '#F3E5AB',
                        bodyColor: '#fff',
                        borderColor: 'rgba(212,175,55,0.3)',
                        borderWidth: 1,
                        padding: 10,
                        callbacks: {
                            label: function(context) {
                                if (modoGraficoTendencia === 'ingresos') {
                                    return ' ' + formatCOP(context.parsed.y);
                                }
                                return ` ${context.parsed.y} orden(es)`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: '#9ca3af', font: { size: 11 } }
                    },
                    y: {
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: {
                            color: '#9ca3af',
                            font: { size: 11 },
                            callback: function(val) {
                                if (modoGraficoTendencia === 'ingresos') {
                                    if (val >= 1000000) return '$' + (val / 1000000).toFixed(1) + 'M';
                                    if (val >= 1000) return '$' + (val / 1000).toFixed(0) + 'k';
                                    return '$' + val;
                                }
                                return val;
                            }
                        }
                    }
                }
            }
        });
    }

    // 2. GRÁFICO ESTADOS DE ÓRDENES (DOUGHNUT)
    const ctxEstados = document.getElementById('chartEstadosOrdenes');
    if (ctxEstados) {
        const desglose = data.ventas?.desgloseEstados || [];
        const labelsMap = {
            approved: 'Aprobadas',
            pending: 'Pendientes',
            cancelled: 'Canceladas',
            failed: 'Fallidas',
            rejected: 'Rechazadas',
            refunded: 'Reembolsadas',
            in_process: 'En Proceso'
        };
        const colorsMap = {
            approved: COLOR_GREEN,
            pending: COLOR_AMBER,
            cancelled: COLOR_RED,
            failed: '#e11d48',
            rejected: '#64748b',
            refunded: COLOR_PURPLE,
            in_process: COLOR_BLUE
        };

        const labels = desglose.map(d => labelsMap[d.status] || d.status);
        const dataValues = desglose.map(d => d.count);
        const bgColors = desglose.map(d => colorsMap[d.status] || '#71717a');

        if (chartEstadosInstance) chartEstadosInstance.destroy();

        chartEstadosInstance = new Chart(ctxEstados, {
            type: 'doughnut',
            data: {
                labels: labels.length > 0 ? labels : ['Sin órdenes'],
                datasets: [{
                    data: dataValues.length > 0 ? dataValues : [1],
                    backgroundColor: dataValues.length > 0 ? bgColors : ['#27272a'],
                    borderColor: '#121214',
                    borderWidth: 2,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#d1d5db',
                            font: { size: 11 },
                            boxWidth: 12,
                            padding: 12
                        }
                    },
                    tooltip: {
                        backgroundColor: '#121214',
                        borderColor: 'rgba(212,175,55,0.3)',
                        borderWidth: 1,
                        padding: 10
                    }
                },
                cutout: '70%'
            }
        });
    }
}

// Renderizar telemetría técnica del servidor
function renderizarTelemetriaServidor(servidor) {
    if (!servidor) return;

    const elBarHeap = document.getElementById('barHeap');
    const elValHeap = document.getElementById('valHeap');
    const elValRss = document.getElementById('valRss');
    const elValPlataforma = document.getElementById('valPlataforma');
    const elValCpuCores = document.getElementById('valCpuCores');
    const elBadgeNode = document.getElementById('badgeServerNode');
    const elValDbPool = document.getElementById('valDbPool');

    if (elBadgeNode) elBadgeNode.textContent = `Node ${servidor.nodeVersion || ''}`;

    const mem = servidor.memory || {};
    if (elBarHeap) elBarHeap.style.width = `${Math.min(mem.heapPercent || 0, 100)}%`;
    if (elValHeap) elValHeap.textContent = `${mem.heapUsedMB || 0} MB / ${mem.heapTotalMB || 0} MB (${mem.heapPercent || 0}%)`;
    if (elValRss) elValRss.textContent = `${mem.rssMB || 0} MB`;
    if (elValPlataforma) elValPlataforma.textContent = servidor.platform || '--';
    if (elValCpuCores) elValCpuCores.textContent = `${servidor.cpuCores || 1} Núcleos`;

    if (elValDbPool) {
        if (servidor.dbStatus === 'healthy') {
            elValDbPool.textContent = `🟢 Conectado (${servidor.dbLatencyMs} ms)`;
            elValDbPool.className = 'metric-val text-green';
        } else {
            elValDbPool.textContent = `🔴 Degradado (${servidor.dbLatencyMs} ms)`;
            elValDbPool.className = 'metric-val text-danger';
        }
    }
}

// Renderizar feed de actividad reciente
function renderizarFeedActividad(actividades) {
    const lista = document.getElementById('activityFeedList');
    const badge = document.getElementById('feedCountBadge');
    if (!lista) return;

    if (!actividades || actividades.length === 0) {
        lista.innerHTML = `
            <div class="feed-empty">
                <i class="fas fa-inbox"></i> No hay actividad reciente registrada en el sistema.
            </div>
        `;
        if (badge) badge.textContent = '0 eventos';
        return;
    }

    if (badge) badge.textContent = `${actividades.length} eventos recientes`;

    lista.innerHTML = actividades.map(item => {
        let badgeEstadoHtml = '';
        if (item.tipo === 'orden') {
            const colorClass = item.estado === 'approved' ? 'tag-green' : (item.estado === 'pending' ? 'tag-amber' : 'tag-red');
            const montoStr = item.monto ? formatCOP(item.monto) : '';
            badgeEstadoHtml = `
                <div class="feed-item-right">
                    <span class="feed-monto">${montoStr}</span>
                    <span class="feed-status-tag ${colorClass}">${item.estado}</span>
                </div>
            `;
        } else if (item.tipo === 'empleado') {
            const colorClass = item.estado === 'autorizado' ? 'tag-green' : (item.estado === 'examen_aprobado' ? 'tag-gold' : 'tag-blue');
            badgeEstadoHtml = `
                <div class="feed-item-right">
                    <span class="feed-status-tag ${colorClass}">${item.estado}</span>
                </div>
            `;
        }

        return `
            <div class="activity-feed-item">
                <div class="feed-item-left">
                    <div class="feed-icon-circle ${item.tipo}">
                        <i class="fas ${item.icono || 'fa-bell'}"></i>
                    </div>
                    <div class="feed-item-content">
                        <strong class="feed-item-title">${escHtml(item.titulo)}</strong>
                        <span class="feed-item-sub">${escHtml(item.subtitulo)}</span>
                    </div>
                </div>
                ${badgeEstadoHtml}
                <span class="feed-item-time">${formatFechaEvento(item.fecha)}</span>
            </div>
        `;
    }).join('');
}

// Prueba instantánea de Ping a la Base de Datos
async function probarPingDb() {
    const btn = document.getElementById('btnPingDb');
    const lbl = document.getElementById('lblPingDb');
    const token = localStorage.getItem('token');

    if (lbl) lbl.textContent = 'Midiendo...';
    if (btn) btn.disabled = true;

    try {
        const res = await fetch(`${API_MONITOREO_BASE}/ping-db`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        if (data.success) {
            Swal.fire({
                icon: 'success',
                title: 'Conexión MySQL Exitosa',
                html: `
                    <div style="font-size:1.1rem; margin-top:10px;">
                        <p style="color:#d1d5db; margin-bottom:8px;">Base de datos en línea y respondiendo.</p>
                        <p style="color:#D4AF37; font-weight:700; font-size:1.4rem; margin:0;">Latencia: ${data.latencyMs} ms</p>
                    </div>
                `,
                background: '#161618',
                color: '#fff',
                confirmButtonColor: '#D4AF37'
            });
            // Refrescar el valor en el KPI
            const elLat = document.getElementById('kpiDbLatencia');
            if (elLat) elLat.textContent = `${data.latencyMs} ms`;
        } else {
            throw new Error(data.error || 'Fallo de respuesta');
        }
    } catch (err) {
        Swal.fire({
            icon: 'error',
            title: 'Error de Ping a DB',
            text: err.message,
            background: '#161618',
            color: '#fff',
            confirmButtonColor: '#e74c3c'
        });
    } finally {
        if (lbl) lbl.textContent = 'Ping DB';
        if (btn) btn.disabled = false;
    }
}

// Descargar snapshot JSON de telemetría
function exportarSnapshotTelemetria() {
    if (!datosMonitoreoCache) {
        Swal.fire({
            icon: 'warning',
            title: 'Sin datos disponibles',
            text: 'Espera a que termine de sincronizar la telemetría antes de exportar.',
            background: '#161618',
            color: '#fff'
        });
        return;
    }

    const jsonStr = JSON.stringify(datosMonitoreoCache, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    a.href = url;
    a.download = `altadensidad-monitoreo-snapshot-${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Configurar temporizador de auto-actualización
function configurarAutoRefresh(segundos) {
    if (timerAutoRefresh) {
        clearInterval(timerAutoRefresh);
        timerAutoRefresh = null;
    }

    const seg = parseInt(segundos, 10);
    if (seg > 0) {
        timerAutoRefresh = setInterval(() => {
            // Solo auto-actualizar si la sección activa sigue siendo monitoreo
            const secMonitoreo = document.getElementById('seccionMonitoreo');
            if (secMonitoreo && !secMonitoreo.classList.contains('hidden')) {
                cargarDatosMonitoreo();
            }
        }, seg * 1000);
    }
}

// Escapar HTML contra XSS
function escHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// Registro de eventos al cargar el documento
document.addEventListener('DOMContentLoaded', () => {
    // Botón refrescar
    const btnRef = document.getElementById('btnRefrescarMonitoreo');
    if (btnRef) btnRef.addEventListener('click', () => cargarDatosMonitoreo());

    // Botón Ping DB
    const btnPing = document.getElementById('btnPingDb');
    if (btnPing) btnPing.addEventListener('click', () => probarPingDb());

    // Botón Exportar Snapshot
    const btnExp = document.getElementById('btnExportarSnapshot');
    if (btnExp) btnExp.addEventListener('click', () => exportarSnapshotTelemetria());

    // Selector Auto-Refresh
    const selAuto = document.getElementById('selectAutoRefresh');
    if (selAuto) {
        selAuto.addEventListener('change', (e) => {
            configurarAutoRefresh(e.target.value);
        });
        // Iniciar con el valor por defecto (30 segundos)
        configurarAutoRefresh(selAuto.value || 30);
    }

    // Botones de alternancia de gráfico (Ingresos vs Órdenes)
    const btnTogIngresos = document.getElementById('btnToggleIngresos');
    const btnTogOrdenes = document.getElementById('btnToggleOrdenes');

    if (btnTogIngresos && btnTogOrdenes) {
        btnTogIngresos.addEventListener('click', () => {
            modoGraficoTendencia = 'ingresos';
            btnTogIngresos.classList.add('active');
            btnTogOrdenes.classList.remove('active');
            if (datosMonitoreoCache) renderizarGraficos(datosMonitoreoCache);
        });

        btnTogOrdenes.addEventListener('click', () => {
            modoGraficoTendencia = 'ordenes';
            btnTogOrdenes.classList.add('active');
            btnTogIngresos.classList.remove('active');
            if (datosMonitoreoCache) renderizarGraficos(datosMonitoreoCache);
        });
    }
});

// Exponer función globalmente para cambiarSeccion
window.cargarDatosMonitoreo = cargarDatosMonitoreo;
