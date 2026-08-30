/**
 * Capacitación e Inducción Obligatoria - Fragancias de Alta Densidad
 * Plataforma Institucional Pública & Responsiva
 */

const API_BASE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
    ? 'http://localhost:3000/api'
    : 'https://altadensidadpage-production.up.railway.app/api';

const API_INDUCCION = `${API_BASE}/induccion`;

let modulosItems = [];
let modulosCompletados = [];
let moduloActualIdx = 0;
let estadoInduccion = 'pendiente_capacitacion';

document.addEventListener('DOMContentLoaded', async () => {
    // Cargar progreso guardado localmente
    modulosCompletados = JSON.parse(localStorage.getItem('ad_capacitacion_completados') || '[]');
    estadoInduccion = localStorage.getItem('ad_capacitacion_estado') || 'pendiente_capacitacion';

    await cargarModulosCapacitacion();
});

async function cargarModulosCapacitacion() {
    const contenedor = document.getElementById('contenedorModulo');
    if (!contenedor) return;

    contenedor.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: #D4AF37;">
            <i class="fas fa-spinner fa-spin fa-3x" style="margin-bottom: 16px;"></i>
            <h3 style="margin: 0; color: #fff; font-family: 'Outfit', sans-serif;">Cargando módulos de capacitación...</h3>
            <p style="color: #aaa; font-size: 0.9rem; margin-top: 8px;">Por favor espera mientras se obtienen los datos.</p>
        </div>
    `;

    try {
        const res = await fetch(`${API_INDUCCION}/items`);
        const data = await res.json();

        if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
            modulosItems = data.data;
        } else {
            throw new Error('No se pudieron obtener los módulos');
        }
    } catch (err) {
        console.warn('Advertencia al conectar con backend:', err.message);
        if (modulosItems.length === 0) {
            contenedor.innerHTML = `
                <div style="background: rgba(220,38,38,0.1); border: 1px solid #dc2626; border-radius: 12px; padding: 24px; text-align: center;">
                    <i class="fas fa-exclamation-triangle fa-2x" style="color:#ef4444; margin-bottom:12px;"></i>
                    <h3 style="color:#fff; margin:0 0 8px 0;">Error de Conexión</h3>
                    <p style="color:#fca5a5; margin:0 0 16px 0;">No se pudo establecer conexión con el servidor. Reintenta por favor.</p>
                    <button onclick="cargarModulosCapacitacion()" class="btn-gold">
                        <i class="fas fa-redo"></i> Reintentar Cargar
                    </button>
                </div>
            `;
            return;
        }
    }

    actualizarSelectorModulosDirecto();
    actualizarBarraProgreso();
    renderizarPasoCapacitacion();
}

function actualizarSelectorModulosDirecto() {
    const select = document.getElementById('selectModuloDirecto');
    if (!select) return;

    select.innerHTML = modulosItems.map((m, idx) => {
        const esCompletado = modulosCompletados.includes(m.id);
        const marca = esCompletado ? '✓ ' : '';
        return `<option value="${idx}">${marca}Módulo ${idx + 1}: ${escHtml(m.titulo)}</option>`;
    }).join('');

    select.value = moduloActualIdx;

    // Escuchar cambios de selección
    select.onchange = (e) => {
        const val = parseInt(e.target.value, 10);
        if (!isNaN(val) && val >= 0 && val < modulosItems.length) {
            moduloActualIdx = val;
            renderModuloLectura(moduloActualIdx);
        }
    };
}

function actualizarBarraProgreso(idxActual) {
    const total = modulosItems.length;
    const completados = modulosCompletados.length;
    const porcentaje = total > 0 ? Math.round((completados / total) * 100) : 0;

    let moduloNum = completados < total ? completados + 1 : total;
    if (typeof idxActual === 'number' && idxActual >= 0) {
        moduloNum = idxActual + 1;
    }
    if (moduloNum > total) moduloNum = total;

    const barra = document.getElementById('barraProgreso');
    const texto = document.getElementById('progresoTexto');
    const contador = document.getElementById('modulosContador');
    const badge = document.getElementById('badgeEstado');
    const select = document.getElementById('selectModuloDirecto');

    if (barra) barra.style.width = `${porcentaje}%`;
    if (texto) texto.textContent = `Progreso de Capacitación: ${porcentaje}%`;
    if (contador) contador.textContent = `Módulo ${moduloNum} de ${total}`;
    if (select && typeof idxActual === 'number') select.value = idxActual;

    if (badge) {
        if (estadoInduccion === 'examen_aprobado') {
            badge.innerHTML = `<span style="background:#2563eb;color:#fff;padding:6px 14px;border-radius:20px;font-size:0.85rem;font-weight:700;"><i class="fas fa-check-circle"></i> Capacitación Completada</span>`;
        } else {
            badge.innerHTML = `<span style="background:#d97706;color:#fff;padding:6px 14px;border-radius:20px;font-size:0.85rem;font-weight:700;"><i class="fas fa-clock"></i> En Proceso</span>`;
        }
    }
}

function renderizarPasoCapacitacion() {
    const contenedorMod = document.getElementById('contenedorModulo');
    const contenedorExa = document.getElementById('contenedorExamen');
    const contenedorFin = document.getElementById('contenedorFinal');

    if (!contenedorMod || !contenedorExa || !contenedorFin) return;

    contenedorMod.classList.add('hidden');
    contenedorExa.classList.add('hidden');
    contenedorFin.classList.add('hidden');

    if (estadoInduccion === 'examen_aprobado') {
        contenedorFin.classList.remove('hidden');
        renderVistaFinalExito();
        return;
    }

    // Buscar primer módulo no completado
    let idxSiguiente = -1;
    for (let i = 0; i < modulosItems.length; i++) {
        if (!modulosCompletados.includes(modulosItems[i].id)) {
            idxSiguiente = i;
            break;
        }
    }

    if (idxSiguiente !== -1) {
        moduloActualIdx = idxSiguiente;
        contenedorMod.classList.remove('hidden');
        renderModuloLectura(moduloActualIdx);
    } else {
        contenedorExa.classList.remove('hidden');
        renderPantallaExamenFinal();
    }
}

function renderModuloLectura(idx) {
    actualizarBarraProgreso(idx);
    const mod = modulosItems[idx];
    const contenedor = document.getElementById('contenedorModulo');
    if (!contenedor || !mod) return;

    contenedor.classList.remove('hidden');
    document.getElementById('contenedorExamen').classList.add('hidden');
    document.getElementById('contenedorFinal').classList.add('hidden');

    window.scrollTo({ top: 0, behavior: 'smooth' });

    let mediaHtml = '';
    if (mod.imagen_url) {
        mediaHtml = `
            <div class="media-responsive-container">
                <img src="${mod.imagen_url}" alt="${escHtml(mod.titulo)}" class="media-responsive-img">
            </div>
        `;
    } else if (mod.video_url) {
        mediaHtml = `
            <div class="media-responsive-container">
                <div class="media-responsive-video">
                    <iframe src="${mod.video_url}" allowfullscreen></iframe>
                </div>
            </div>
        `;
    }

    const preguntas = mod.preguntas || [];
    let preguntasHtml = '';

    if (preguntas.length > 0) {
        preguntasHtml = `
            <div style="background: #151515; border: 1px solid var(--border-gold); border-radius: 12px; padding: 20px; margin-top: 28px;">
                <h3 style="color: var(--gold-primary); margin-top: 0; font-size: 1.15rem; display:flex; align-items:center; gap:8px;">
                    <i class="fas fa-question-circle"></i> Preguntas de Validación del Módulo (${preguntas.length})
                </h3>
                <p style="color: #bbb; font-size: 0.88rem; margin-bottom: 20px;">Responde correctamente para validar el módulo:</p>
                <form id="formValidarModulo" style="display:flex; flex-direction:column; gap:18px;">
                    ${preguntas.map((p, pIdx) => `
                        <div style="background: #1c1c1c; border: 1px solid #333; border-radius: 10px; padding: 16px;">
                            <p style="color: #fff; font-weight: 600; margin: 0 0 12px 0; font-size: 0.96rem;">${pIdx + 1}. ${escHtml(p.pregunta)}</p>
                            <div style="display:flex; flex-direction:column; gap:8px;">
                                ${p.opciones.map((opt, oIdx) => `
                                    <label class="option-card">
                                        <input type="radio" name="pregunta_${p.id}" value="${oIdx}" required>
                                        <span>${escHtml(opt)}</span>
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                    <div style="display:flex; justify-content:flex-end; margin-top:10px;">
                        <button type="submit" class="btn-gold">
                            <i class="fas fa-check-circle"></i> Validar Respuestas y Continuar
                        </button>
                    </div>
                </form>
            </div>
        `;
    } else {
        preguntasHtml = `
            <div style="display:flex; justify-content:flex-end; margin-top: 28px;">
                <button id="btnCompletarModuloLectura" class="btn-gold">
                    <i class="fas fa-arrow-right"></i> Módulo Leído — Continuar
                </button>
            </div>
        `;
    }

    // Navegación Flex Adaptable
    let navBotones = `<div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:20px; background:rgba(255,255,255,0.02); padding:10px 14px; border-radius:10px; border:1px solid rgba(255,255,255,0.06);">`;
    if (idx > 0) {
        navBotones += `<button onclick="renderModuloLectura(${idx - 1})" style="background:transparent; border:1px solid #555; color:#ccc; padding:8px 16px; border-radius:8px; cursor:pointer; font-size:0.88rem; font-family:inherit;"><i class="fas fa-chevron-left"></i> Anterior</button>`;
    } else {
        navBotones += `<div></div>`;
    }

    navBotones += `<span style="color:var(--gold-primary); font-size:0.88rem; font-weight:600;"><i class="fas fa-book-open"></i> Módulo ${idx + 1} de ${modulosItems.length}</span>`;

    if (idx < modulosItems.length - 1) {
        navBotones += `<button onclick="renderModuloLectura(${idx + 1})" style="background:rgba(212,175,55,0.15); border:1px solid var(--gold-primary); color:#fff; padding:8px 16px; border-radius:8px; cursor:pointer; font-size:0.88rem; font-family:inherit;">Siguiente <i class="fas fa-chevron-right"></i></button>`;
    } else {
        navBotones += `<div></div>`;
    }
    navBotones += `</div>`;

    contenedor.innerHTML = `
        ${navBotones}
        <div style="background: #141414; border: 1px solid #282828; border-radius: 12px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
            <h2 style="color: var(--gold-primary); margin: 0 0 16px 0; font-family: 'Outfit', sans-serif; font-size: clamp(1.2rem, 3vw, 1.5rem); line-height: 1.35;">${escHtml(mod.titulo)}</h2>
            ${mediaHtml}
            <div style="color: #e2e8f0; font-size: clamp(0.92rem, 2.2vw, 1rem); line-height: 1.8; white-space: pre-wrap;">${escHtml(mod.contenido)}</div>
            ${preguntasHtml}
        </div>
    `;

    if (preguntas.length > 0) {
        document.getElementById('formValidarModulo').addEventListener('submit', async (e) => {
            e.preventDefault();
            const respuestas = {};
            preguntas.forEach(p => {
                const sel = document.querySelector(`input[name="pregunta_${p.id}"]:checked`);
                if (sel) respuestas[p.id] = parseInt(sel.value, 10);
            });

            await validarItemLectura(mod, respuestas);
        });
    } else {
        const btn = document.getElementById('btnCompletarModuloLectura');
        if (btn) {
            btn.addEventListener('click', async () => {
                await validarItemLectura(mod, {});
            });
        }
    }
}

async function validarItemLectura(mod, respuestas) {
    try {
        const res = await fetch(`${API_INDUCCION}/validar-item`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ item_id: mod.id, respuestas })
        });
        const data = await res.json();

        if (data.success && data.completado) {
            if (!modulosCompletados.includes(mod.id)) {
                modulosCompletados.push(mod.id);
                localStorage.setItem('ad_capacitacion_completados', JSON.stringify(modulosCompletados));
            }
            actualizarSelectorModulosDirecto();
            
            if (moduloActualIdx < modulosItems.length - 1) {
                moduloActualIdx++;
                renderModuloLectura(moduloActualIdx);
            } else {
                renderizarPasoCapacitacion();
            }
        } else {
            Swal.fire({
                icon: 'warning',
                title: 'Verifica tus respuestas',
                text: data.message || 'Una o más respuestas no son correctas. Repasa el contenido e inténtalo de nuevo.',
                confirmButtonText: 'Corregir'
            });
        }
    } catch (err) {
        if (!modulosCompletados.includes(mod.id)) {
            modulosCompletados.push(mod.id);
            localStorage.setItem('ad_capacitacion_completados', JSON.stringify(modulosCompletados));
        }
        actualizarSelectorModulosDirecto();
        if (moduloActualIdx < modulosItems.length - 1) {
            moduloActualIdx++;
            renderModuloLectura(moduloActualIdx);
        } else {
            renderizarPasoCapacitacion();
        }
    }
}

function renderPantallaExamenFinal() {
    const contenedor = document.getElementById('contenedorExamen');
    if (!contenedor) return;

    contenedor.classList.remove('hidden');
    document.getElementById('contenedorModulo').classList.add('hidden');
    document.getElementById('contenedorFinal').classList.add('hidden');

    contenedor.innerHTML = `
        <div style="background: rgba(212,175,55,0.04); border: 2px solid var(--gold-primary); border-radius: 14px; padding: 28px 20px; text-align: center; box-shadow: 0 8px 30px rgba(0,0,0,0.6);">
            <div style="font-size: 3.2rem; color: var(--gold-primary); margin-bottom: 12px;"><i class="fas fa-file-signature"></i></div>
            <h2 style="color: #ffffff; font-family: 'Outfit', sans-serif; font-size: clamp(1.3rem, 3.5vw, 1.8rem); margin: 0 0 10px 0;">Examen Final de Inducción Obligatorio</h2>
            <p style="color: #ccc; max-width: 650px; margin: 0 auto 20px auto; font-size: 0.98rem; line-height: 1.6;">
                ¡Felicitaciones! Has completado la lectura de todos los módulos. A continuación presentarás la evaluación final.
            </p>

            <div style="background: #1c1917; border: 1px solid #f59e0b; border-radius: 10px; padding: 16px; margin: 0 auto 24px auto; max-width: 600px; text-align: left;">
                <h4 style="color: #f59e0b; margin: 0 0 8px 0;"><i class="fas fa-exclamation-triangle"></i> Requisitos de Evaluación:</h4>
                <ul style="color: #e5e7eb; margin: 0; padding-left: 20px; font-size: 0.92rem; line-height: 1.6;">
                    <li>Debes responder <strong>el 100% de las preguntas de manera correcta</strong> para aprobar el examen.</li>
                    <li>Puedes presentar el examen cuantas veces necesites.</li>
                </ul>
            </div>

            <button id="btnIniciarExamen" class="btn-gold" style="font-size: 1.08rem; padding: 14px 32px;">
                <i class="fas fa-play-circle"></i> Iniciar Examen Final Ahora
            </button>
        </div>
        <div id="examenPreguntasArea" class="hidden" style="margin-top: 24px;"></div>
    `;

    document.getElementById('btnIniciarExamen').addEventListener('click', async () => {
        await cargarPreguntasExamenFinal();
    });
}

async function cargarPreguntasExamenFinal() {
    try {
        const res = await fetch(`${API_INDUCCION}/examen`);
        const data = await res.json();
        if (!data.success) throw new Error(data.message);

        const preguntas = data.data || [];
        const area = document.getElementById('examenPreguntasArea');
        document.getElementById('btnIniciarExamen').style.display = 'none';
        area.classList.remove('hidden');

        area.innerHTML = `
            <form id="formExamenFinalSubmit" style="background:#0e0e0e; border:1px solid #333; border-radius:12px; padding:20px; box-shadow:0 6px 25px rgba(0,0,0,0.6);">
                <h3 style="color:var(--gold-primary); margin-top:0; font-family:'Outfit',sans-serif; font-size:1.2rem;"><i class="fas fa-tasks"></i> Examen Final (${preguntas.length} Preguntas)</h3>
                <p style="color:#aaa; font-size:0.88rem; margin-bottom:20px;">Responde todas las preguntas planteadas:</p>

                ${preguntas.map((p, idx) => `
                    <div style="background:#171717; border:1px solid #262626; border-radius:10px; padding:16px; margin-bottom:16px;">
                        <p style="color:#fff; font-weight:600; margin:0 0 12px 0; font-size:0.96rem;">${idx + 1}. ${escHtml(p.pregunta)}</p>
                        <div style="display:flex; flex-direction:column; gap:8px;">
                            ${p.opciones.map((opt, oIdx) => `
                                <label class="option-card">
                                    <input type="radio" name="pregunta_${p.id}" value="${oIdx}" required>
                                    <span>${escHtml(opt)}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}

                <div style="display:flex; justify-content:flex-end; margin-top:20px;">
                    <button type="submit" class="btn-gold">
                        <i class="fas fa-paper-plane"></i> Enviar Examen para Evaluación
                    </button>
                </div>
            </form>
        `;

        document.getElementById('formExamenFinalSubmit').addEventListener('submit', async (e) => {
            e.preventDefault();
            const respuestas = {};
            preguntas.forEach(p => {
                const sel = document.querySelector(`input[name="pregunta_${p.id}"]:checked`);
                if (sel) respuestas[p.id] = parseInt(sel.value, 10);
            });

            try {
                const resEval = await fetch(`${API_INDUCCION}/evaluar-examen`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ respuestas })
                });
                const dataEval = await resEval.json();

                if (dataEval.success && dataEval.aprobado) {
                    estadoInduccion = 'examen_aprobado';
                    localStorage.setItem('ad_capacitacion_estado', 'examen_aprobado');

                    Swal.fire({
                        icon: 'success',
                        title: '🎉 Examen Aprobado al 100%',
                        html: `
                            <p style="color:#e5e7eb; font-size:1rem; margin-bottom:16px; line-height:1.6;">${escHtml(dataEval.message)}</p>
                            <div style="background: linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(20,20,20,0.95) 100%); border: 1px solid var(--gold-primary); padding:18px; border-radius:12px; margin-top:12px; text-align:center; box-shadow: 0 6px 25px rgba(0,0,0,0.8);">
                                <p style="color:var(--gold-primary); font-weight:700; font-size:1rem; margin:0 0 6px 0;"><i class="fas fa-file-pdf"></i> Material Obligatorio de Consulta:</p>
                                <p style="color:#aaa; font-size:0.85rem; margin-bottom:14px;">Descarga tu Guía y Manual Completo en PDF.</p>
                                <a href="/assets/CapacitacionFraganciasAltaDensidad.pdf" download="CapacitacionFraganciasAltaDensidad.pdf" target="_blank" class="btn-gold" style="font-size:0.95rem; padding:12px 24px;">
                                    <i class="fas fa-download"></i> Descargar Manual en PDF
                                </a>
                            </div>
                        `,
                        confirmButtonText: 'Ver Certificado Final'
                    }).then(() => {
                        renderizarPasoCapacitacion();
                    });
                } else {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Examen No Aprobado',
                        text: dataEval.message || 'Debes obtener 100% de respuestas correctas.',
                        confirmButtonText: 'Volver a Intentar'
                    });
                }
            } catch (err) {
                Swal.fire('Error', 'No se pudo evaluar el examen: ' + err.message, 'error');
            }
        });
    } catch (err) {
        Swal.fire('Error', 'No se pudo obtener las preguntas del examen: ' + err.message, 'error');
    }
}

function renderVistaFinalExito() {
    const contenedor = document.getElementById('contenedorFinal');
    if (!contenedor) return;

    contenedor.classList.remove('hidden');
    document.getElementById('contenedorModulo').classList.add('hidden');
    document.getElementById('contenedorExamen').classList.add('hidden');

    contenedor.innerHTML = `
        <div style="background: rgba(37,99,235,0.08); border: 2px solid #2563eb; border-radius: 16px; padding: 32px 20px; text-align: center; box-shadow: 0 8px 30px rgba(0,0,0,0.6);">
            <div style="font-size: 3.8rem; color: #3b82f6; margin-bottom: 12px;"><i class="fas fa-user-check"></i></div>
            <h2 style="color: #ffffff; font-family: 'Outfit', sans-serif; font-size: clamp(1.4rem, 4vw, 2rem); margin: 0 0 12px 0; font-weight: 700;">¡Capacitación e Inducción Completada al 100%! 🎉</h2>
            <p style="color: #93c5fd; max-width: 650px; margin: 0 auto 24px auto; font-size: 1.05rem; line-height: 1.6;">
                Has completado exitosamente la totalidad de los módulos de formación y aprobado el examen final de <strong>Perfumería Alta Densidad</strong>.
            </p>

            <!-- CARD DE DESCARGA DEL MANUAL OBLIGATORIO EN PDF -->
            <div style="background: linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(20,20,20,0.95) 100%); border: 2px solid var(--gold-primary); border-radius: 14px; padding: 26px 18px; max-width: 680px; margin: 0 auto; text-align: center; box-shadow: 0 6px 25px rgba(212,175,55,0.25);">
                <div style="display:inline-flex; align-items:center; gap:10px; color:var(--gold-primary); font-size:1.2rem; font-weight:700; margin-bottom:12px;">
                    <i class="fas fa-file-pdf" style="font-size:1.6rem;"></i> MATERIAL OBLIGATORIO DE CAPACITACIÓN EN PDF
                </div>
                <p style="color:#e5e7eb; font-size:0.95rem; line-height:1.6; margin-bottom:20px;">
                    Descarga tu <strong>Manual Completo de Capacitación en PDF</strong>. Guarda este archivo para repasar los módulos, portafolio, normas y procedimientos.
                </p>
                <a href="/assets/CapacitacionFraganciasAltaDensidad.pdf" download="CapacitacionFraganciasAltaDensidad.pdf" target="_blank" class="btn-gold" style="font-size: 1.08rem; padding: 14px 28px;">
                    <i class="fas fa-download" style="font-size:1.3rem;"></i> Descargar Manual Completo de Capacitación (PDF)
                </a>
            </div>
        </div>
    `;
}

function escHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
