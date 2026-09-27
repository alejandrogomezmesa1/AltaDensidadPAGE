// Monitoreo en vivo: ventas, órdenes, salud del servidor y de la base, actividad reciente
import { useCallback, useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import Swal from 'sweetalert2';
import { apiJson } from '../lib/api';

Chart.register(...registerables);

const COLOR_GOLD = '#D4AF37';
const COLOR_GOLD_LIGHT = '#F3E5AB';
const ETIQUETAS_ESTADO = {
  approved: 'Aprobadas', pending: 'Pendientes', cancelled: 'Canceladas', failed: 'Fallidas',
  rejected: 'Rechazadas', refunded: 'Reembolsadas', in_process: 'En Proceso'
};
const COLORES_ESTADO = {
  approved: '#10B981', pending: '#F59E0B', cancelled: '#EF4444', failed: '#e11d48',
  rejected: '#64748b', refunded: '#8B5CF6', in_process: '#3B82F6'
};

const formatCOP = (v) => (v == null || Number.isNaN(Number(v)) ? '$0' : '$' + Math.round(v).toLocaleString('es-CO'));

function formatFechaEvento(fechaStr) {
  if (!fechaStr) return '';
  const d = new Date(fechaStr);
  if (Number.isNaN(d.getTime())) return String(fechaStr);
  const horaStr = d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  if (d.toDateString() === new Date().toDateString()) return `Hoy ${horaStr}`;
  return `${d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })} ${horaStr}`;
}

function useGrafico(crear, deps) {
  const canvas = useRef(null);
  useEffect(() => {
    if (!canvas.current) return undefined;
    const config = crear();
    if (!config) return undefined;
    const chart = new Chart(canvas.current, config);
    return () => chart.destroy();
  }, deps); // crear depende solo de deps
  return canvas;
}

function GraficoTendencia({ tendencia, modo }) {
  const canvas = useGrafico(() => ({
    type: 'line',
    data: {
      labels: tendencia.map((t) => new Date(t.fecha + 'T00:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })),
      datasets: [{
        label: modo === 'ingresos' ? 'Ingresos ($ COP)' : 'Órdenes (#)',
        data: tendencia.map((t) => (modo === 'ingresos' ? t.ingresos : t.ordenes)),
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
        legend: { display: false },
        tooltip: {
          backgroundColor: '#121214', titleColor: '#F3E5AB', bodyColor: '#fff',
          borderColor: 'rgba(212,175,55,0.3)', borderWidth: 1, padding: 10,
          callbacks: { label: (c) => (modo === 'ingresos' ? ' ' + formatCOP(c.parsed.y) : ` ${c.parsed.y} orden(es)`) }
        }
      },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af', font: { size: 11 } } },
        y: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: {
            color: '#9ca3af',
            font: { size: 11 },
            callback: (val) => {
              if (modo !== 'ingresos') return val;
              if (val >= 1000000) return '$' + (val / 1000000).toFixed(1) + 'M';
              if (val >= 1000) return '$' + (val / 1000).toFixed(0) + 'k';
              return '$' + val;
            }
          }
        }
      }
    }
  }), [tendencia, modo]);
  return <canvas ref={canvas} />;
}

function GraficoEstados({ desglose }) {
  const canvas = useGrafico(() => {
    const hay = desglose.length > 0;
    return {
      type: 'doughnut',
      data: {
        labels: hay ? desglose.map((d) => ETIQUETAS_ESTADO[d.status] || d.status) : ['Sin órdenes'],
        datasets: [{
          data: hay ? desglose.map((d) => d.count) : [1],
          backgroundColor: hay ? desglose.map((d) => COLORES_ESTADO[d.status] || '#71717a') : ['#27272a'],
          borderColor: '#121214',
          borderWidth: 2,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { color: '#d1d5db', font: { size: 11 }, boxWidth: 12, padding: 12 } },
          tooltip: { backgroundColor: '#121214', borderColor: 'rgba(212,175,55,0.3)', borderWidth: 1, padding: 10 }
        },
        cutout: '70%'
      }
    };
  }, [desglose]);
  return <canvas ref={canvas} />;
}

function Kpi({ titulo, icono, color, valor, sub, estiloValor, onClick }) {
  return (
    <div className={`monitoreo-kpi-card ${onClick ? 'clickable' : ''}`} onClick={onClick} title={onClick ? 'Ver catálogo de productos' : undefined}>
      <div className="kpi-card-header">
        <span className="kpi-title">{titulo}</span>
        <div className={`kpi-icon-badge ${color}`}><i className={`fas ${icono}`} /></div>
      </div>
      <div className="kpi-main-value" style={estiloValor}>{valor}</div>
      <div className="kpi-subtext">{sub}</div>
    </div>
  );
}

function Alertas({ alertas, irA }) {
  if (!alertas || !alertas.length) return null;
  return (
    <div className="monitoreo-alertas-grid">
      {alertas.map((a, i) => {
        const [clase, icono] = a.nivel === 'critico' ? ['alerta-critica', 'fa-triangle-exclamation']
          : a.nivel === 'advertencia' ? ['alerta-advertencia', 'fa-circle-exclamation'] : ['alerta-info', 'fa-circle-info'];
        return (
          <div className={`monitoreo-alerta-card ${clase}`} key={i}>
            <div className="alerta-card-left">
              <div className="alerta-icono"><i className={`fas ${icono}`} /></div>
              <div className="alerta-textos">
                <strong className="alerta-titulo">{a.titulo}</strong>
                <p className="alerta-detalle">{a.detalle}</p>
              </div>
            </div>
            {a.accion && a.seccion && (
              <button className="btn-alerta-accion" onClick={() => irA(a.seccion)}>{a.accion} <i className="fas fa-arrow-right" /></button>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Actividad({ items }) {
  if (!items || !items.length) {
    return <div className="feed-empty"><i className="fas fa-inbox" /> No hay actividad reciente registrada en el sistema.</div>;
  }
  return items.map((item, i) => {
    let derecha = null;
    if (item.tipo === 'orden') {
      const clase = item.estado === 'approved' ? 'tag-green' : (item.estado === 'pending' ? 'tag-amber' : 'tag-red');
      derecha = (
        <div className="feed-item-right">
          <span className="feed-monto">{item.monto ? formatCOP(item.monto) : ''}</span>
          <span className={`feed-status-tag ${clase}`}>{item.estado}</span>
        </div>
      );
    } else if (item.tipo === 'empleado') {
      const clase = item.estado === 'autorizado' ? 'tag-green' : (item.estado === 'examen_aprobado' ? 'tag-gold' : 'tag-blue');
      derecha = <div className="feed-item-right"><span className={`feed-status-tag ${clase}`}>{item.estado}</span></div>;
    }
    return (
      <div className="activity-feed-item" key={i}>
        <div className="feed-item-left">
          <div className={`feed-icon-circle ${item.tipo}`}><i className={`fas ${item.icono || 'fa-bell'}`} /></div>
          <div className="feed-item-content">
            <strong className="feed-item-title">{item.titulo}</strong>
            <span className="feed-item-sub">{item.subtitulo}</span>
          </div>
        </div>
        {derecha}
        <span className="feed-item-time">{formatFechaEvento(item.fecha)}</span>
      </div>
    );
  });
}

export default function Monitoreo({ activo, irA }) {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [conexion, setConexion] = useState({ en: null, texto: 'Sincronizando telemetría...' });
  const [refresco, setRefresco] = useState('30');
  const [modo, setModo] = useState('ingresos');
  const [midiendo, setMidiendo] = useState(false);
  const [latenciaPing, setLatenciaPing] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const data = await apiJson('admin/monitoreo/resumen');
      setDatos(data);
      setLatenciaPing(null);
      setConexion({ en: true, texto: `Actualizado: ${new Date().toLocaleTimeString('es-CO')}` });
    } catch (err) {
      console.error('Error al cargar datos de monitoreo:', err);
      setConexion({ en: false, texto: `Error: ${err.message}` });
    } finally {
      setCargando(false);
    }
  }, []);

  // Se carga al entrar a la sección y se refresca solo mientras está visible
  useEffect(() => { if (activo) cargar(); }, [activo, cargar]);
  useEffect(() => {
    const seg = parseInt(refresco, 10);
    if (!activo || !(seg > 0)) return undefined;
    const t = setInterval(cargar, seg * 1000);
    return () => clearInterval(t);
  }, [activo, refresco, cargar]);

  async function pingDb() {
    setMidiendo(true);
    try {
      const data = await apiJson('admin/monitoreo/ping-db');
      Swal.fire({
        icon: 'success',
        title: 'Conexión MySQL Exitosa',
        html: `<div style="font-size:1.1rem; margin-top:10px;"><p style="color:#d1d5db; margin-bottom:8px;">Base de datos en línea y respondiendo.</p><p style="color:#D4AF37; font-weight:700; font-size:1.4rem; margin:0;">Latencia: ${Number(data.latencyMs)} ms</p></div>`,
        background: '#161618', color: '#fff', confirmButtonColor: '#D4AF37'
      });
      setLatenciaPing(data.latencyMs);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error de Ping a DB', text: err.message, background: '#161618', color: '#fff', confirmButtonColor: '#e74c3c' });
    } finally {
      setMidiendo(false);
    }
  }

  function exportarSnapshot() {
    if (!datos) {
      Swal.fire({ icon: 'warning', title: 'Sin datos disponibles', text: 'Espera a que termine de sincronizar la telemetría antes de exportar.', background: '#161618', color: '#fff' });
      return;
    }
    const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `altadensidad-monitoreo-snapshot-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  const ventas = datos?.ventas || {};
  const servidor = datos?.servidor || {};
  const inventario = datos?.inventario || {};
  const mem = servidor.memory || {};
  const total = ventas.totalOrdenes || 0;
  const aprobadas = (ventas.desgloseEstados || []).find((e) => e.status === 'approved')?.count || 0;
  const tasa = total > 0 ? Math.round((aprobadas / total) * 100) : 0;
  const latencia = latenciaPing ?? servidor.dbLatencyMs ?? 0;
  const colorLatencia = latencia > 250 ? '#ef4444' : (latencia > 120 ? '#f59e0b' : '#10b981');
  const liveTexto = cargando ? 'ACTUALIZANDO...' : (conexion.en === false ? 'DESCONECTADO' : 'EN VIVO');

  return (
    <>
      <div className="monitoreo-toolbar">
        <div className="monitoreo-toolbar-info">
          <div className="monitoreo-live-indicator">
            <span className={`live-dot ${conexion.en === true ? 'online' : conexion.en === false ? 'offline' : ''}`} />
            <span className="live-text">{liveTexto}</span>
          </div>
          <span className="monitoreo-last-update">{conexion.texto}</span>
        </div>
        <div className="monitoreo-toolbar-actions">
          <div className="monitoreo-autorefresh-box">
            <label htmlFor="selectAutoRefresh"><i className="fas fa-sync-alt" /> Refresco:</label>
            <select id="selectAutoRefresh" className="monitoreo-select" value={refresco} onChange={(e) => setRefresco(e.target.value)}>
              <option value="0">Pausado</option>
              <option value="15">15 seg</option>
              <option value="30">30 seg</option>
              <option value="60">60 seg</option>
            </select>
          </div>
          <button className="btn-secondary" title="Probar latencia directa de base de datos" onClick={pingDb} disabled={midiendo}>
            <i className="fas fa-database" /> <span>{midiendo ? 'Midiendo...' : 'Ping DB'}</span>
          </button>
          <button className="btn-primary" title="Actualizar métricas inmediatamente" onClick={cargar}>
            <i className={`fas fa-rotate ${cargando ? 'fa-spin' : ''}`} /> Actualizar
          </button>
          <button className="btn-secondary" title="Descargar reporte snapshot en JSON" onClick={exportarSnapshot}>
            <i className="fas fa-download" /> Snapshot
          </button>
        </div>
      </div>

      <Alertas alertas={datos?.alertas} irA={irA} />

      <div className="monitoreo-kpis-grid">
        <Kpi titulo="Ventas Hoy" icono="fa-calendar-day" color="gold" valor={formatCOP(ventas.ventasHoy?.total || 0)} sub={`${ventas.ventasHoy?.count || 0} órdenes aprobadas`} />
        <Kpi titulo="Ingresos Mes (30d)" icono="fa-chart-line" color="green" valor={formatCOP(ventas.ventasMes?.total || 0)} sub="Total facturado últimos 30 días" />
        <Kpi titulo="Órdenes Totales" icono="fa-receipt" color="blue" valor={total} sub={`${aprobadas} aprobadas (${tasa}%)`} />
        <Kpi titulo="Salud DB & Servidor" icono="fa-server" color="purple" valor={`${latencia} ms`} estiloValor={datos ? { color: colorLatencia } : undefined} sub={`Uptime: ${servidor.uptimeFormatted || '--'}`} />
        <Kpi titulo="Catálogo Activo" icono="fa-spray-can" color="teal" valor={inventario.activos || 0}
          sub={`${inventario.envasesActivos || 0} envases | ${inventario.totalKits || 0} kits`} onClick={() => irA('productos')} />
      </div>

      <div className="monitoreo-charts-grid">
        <div className="monitoreo-chart-card chart-large">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-title"><i className="fas fa-chart-area" /> Ventas e Ingresos (Últimos 14 días)</h3>
              <span className="chart-subtitle">Comportamiento financiero y volumen de órdenes aprobadas</span>
            </div>
            <div className="chart-actions">
              <button className={`btn-chart-toggle ${modo === 'ingresos' ? 'active' : ''}`} onClick={() => setModo('ingresos')}>Ingresos ($)</button>
              <button className={`btn-chart-toggle ${modo === 'ordenes' ? 'active' : ''}`} onClick={() => setModo('ordenes')}>Órdenes (#)</button>
            </div>
          </div>
          <div className="chart-canvas-wrapper">
            {datos && <GraficoTendencia tendencia={ventas.tendenciaDiaria || []} modo={modo} />}
          </div>
        </div>
        <div className="monitoreo-chart-card">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-title"><i className="fas fa-chart-pie" /> Estados de Órdenes</h3>
              <span className="chart-subtitle">Desglose de transacciones</span>
            </div>
          </div>
          <div className="chart-canvas-wrapper doughnut">
            {datos && <GraficoEstados desglose={ventas.desgloseEstados || []} />}
          </div>
        </div>
      </div>

      <div className="monitoreo-bottom-grid">
        <div className="monitoreo-card server-info-card">
          <div className="card-header-styled">
            <h3 className="card-title-styled"><i className="fas fa-microchip" /> Telemetría del Servidor</h3>
            <span className="badge-status-server">{datos ? `Node ${servidor.nodeVersion || ''}` : 'Node.js'}</span>
          </div>
          <div className="server-metrics-list">
            <div className="server-metric-item">
              <span className="metric-label">Uso Memoria Heap:</span>
              <div className="metric-bar-wrapper"><div className="metric-bar-fill" style={{ width: `${Math.min(mem.heapPercent || 0, 100)}%` }} /></div>
              <span className="metric-val">{mem.heapUsedMB || 0} MB / {mem.heapTotalMB || 0} MB ({mem.heapPercent || 0}%)</span>
            </div>
            <div className="server-metric-item">
              <span className="metric-label">Memoria RSS Total:</span>
              <span className="metric-val">{mem.rssMB || 0} MB</span>
            </div>
            <div className="server-metric-item">
              <span className="metric-label">Plataforma & Arquitectura:</span>
              <span className="metric-val">{servidor.platform || '--'}</span>
            </div>
            <div className="server-metric-item">
              <span className="metric-label">Cores de CPU:</span>
              <span className="metric-val">{datos ? `${servidor.cpuCores || 1} Núcleos` : '--'}</span>
            </div>
            <div className="server-metric-item">
              <span className="metric-label">Estado Pool MySQL:</span>
              {!datos
                ? <span className="metric-val text-green">Conectado (Railway)</span>
                : servidor.dbStatus === 'healthy'
                  ? <span className="metric-val text-green">🟢 Conectado ({servidor.dbLatencyMs} ms)</span>
                  : <span className="metric-val text-danger">🔴 Degradado ({servidor.dbLatencyMs} ms)</span>}
            </div>
          </div>
        </div>

        <div className="monitoreo-card activity-feed-card">
          <div className="card-header-styled">
            <h3 className="card-title-styled"><i className="fas fa-bolt" /> Actividad Reciente del Sistema</h3>
            <span className="feed-count-badge">{datos?.actividadReciente?.length ? `${datos.actividadReciente.length} eventos recientes` : '0 eventos'}</span>
          </div>
          <div className="activity-feed-list">
            {datos ? <Actividad items={datos.actividadReciente} /> : <div className="feed-loading"><i className="fas fa-spinner fa-spin" /> Cargando actividad reciente...</div>}
          </div>
        </div>
      </div>
    </>
  );
}
