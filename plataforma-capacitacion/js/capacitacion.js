/**
 * Plataforma Independiente de Inducción y Capacitación
 * Fragancias de Alta Densidad
 * 
 * Funcionalidad 100% estática / cliente (Zero-Backend)
 */

let modulosItems = [];
let modulosCompletados = [];
let moduloActualIdx = 0;
let estadoInduccion = 'pendiente_capacitacion';
let preguntasExamenActual = [];

document.addEventListener('DOMContentLoaded', () => {
    // 1. Cargar módulos del banco local
    if (window.MODULOS_CAPACITACION && Array.isArray(window.MODULOS_CAPACITACION)) {
        modulosItems = window.MODULOS_CAPACITACION;
    } else {
        console.error('No se encontró el banco de módulos en window.MODULOS_CAPACITACION');
        return;
    }

    // 2. Cargar progreso previo guardado localmente en el navegador
    try {
        modulosCompletados = JSON.parse(localStorage.getItem('ad_capacitacion_completados') || '[]');
        estadoInduccion = localStorage.getItem('ad_capacitacion_estado') || 'pendiente_capacitacion';
    } catch (e) {
        modulosCompletados = [];
        estadoInduccion = 'pendiente_capacitacion';
    }

    actualizarBadgeEstado();
    actualizarSelectorModulosDirecto();
    actualizarBarraProgreso();
    renderizarPasoCapacitacion();
});

function actualizarBadgeEstado() {
    const badge = document.getElementById('badgeEstado');
    if (!badge) return;

    if (estadoInduccion === 'examen_aprobado') {
        badge.innerHTML = `<span class="badge-status aprobado"><i class="fas fa-check-double"></i> Capacitación Aprobada</span>`;
    } else if (modulosCompletados.length >= modulosItems.length) {
        badge.innerHTML = `<span class="badge-status progreso"><i class="fas fa-clock"></i> Pendiente de Examen Final</span>`;
    } else {
        badge.innerHTML = `<span class="badge-status progreso"><i class="fas fa-spinner fa-pulse"></i> En Progreso (${modulosCompletados.length}/${modulosItems.length})</span>`;
    }
}

function actualizarSelectorModulosDirecto() {
    const select = document.getElementById('selectModuloDirecto');
    if (!select) return;

    select.innerHTML = '<option value="">-- Seleccionar Módulo Directo --</option>';

    modulosItems.forEach((mod, idx) => {
        const option = document.createElement('option');
        option.value = idx;
        const yaCompletado = modulosCompletados.includes(mod.orden || idx + 1);
        option.textContent = `${mod.titulo || 'Módulo ' + (idx + 1)} ${yaCompletado ? '✓ (Completado)' : ''}`;
        select.appendChild(option);
    });

    select.addEventListener('change', (e) => {
        const idx = parseInt(e.target.value, 10);
        if (!isNaN(idx) && idx >= 0 && idx < modulosItems.length) {
            moduloActualIdx = idx;
            renderModuloLectura(moduloActualIdx);
        }
    });
}

function actualizarBarraProgreso(idxActual) {
    const barra = document.getElementById('barraProgreso');
    const texto = document.getElementById('progresoTexto');
    const contador = document.getElementById('modulosContador');

    const total = modulosItems.length;
    const completados = modulosCompletados.length;
    const porcentaje = total > 0 ? Math.round((completados / total) * 100) : 0;

    if (barra) {
        if (window.anime) {
            anime({
                targets: barra,
                width: `${porcentaje}%`,
                duration: 600,
                easing: 'easeOutCubic'
            });
        } else {
            barra.style.width = `${porcentaje}%`;
        }
    }
    if (texto) texto.textContent = `Progreso General: ${porcentaje}% (${completados} de ${total} módulos completados)`;

    if (contador) {
        if (typeof idxActual === 'number') {
            contador.textContent = `Viendo Módulo ${idxActual + 1} de ${total}`;
        } else {
            contador.textContent = `${completados} de ${total} Módulos`;
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

    actualizarBadgeEstado();

    if (estadoInduccion === 'examen_aprobado') {
        contenedorFin.classList.remove('hidden');
        renderVistaFinalExito();
        return;
    }

    // Buscar el primer módulo pendiente
    let idxSiguiente = -1;
    for (let i = 0; i < modulosItems.length; i++) {
        const idMod = modulosItems[i].orden || (i + 1);
        if (!modulosCompletados.includes(idMod)) {
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

function formatearContenidoEditorial(texto) {
    if (!texto) return '';

    const lineas = texto.split('\n');
    let html = '';

    lineas.forEach((rawLinea) => {
        const linea = rawLinea.trim();
        if (!linea) return;

        // Elemento de lista / viñeta
        if (linea.startsWith('•') || linea.startsWith('-') || linea.startsWith('*')) {
            const contenidoLi = linea.replace(/^[•\-\*]\s*/, '');
            html += `
                <div class="module-list-item">
                    <i class="fas fa-check-circle module-list-icon"></i>
                    <span>${escHtml(contenidoLi)}</span>
                </div>
            `;
            return;
        }

        // Saludo de apertura en mayúsculas
        if (linea.startsWith('¡') && linea === linea.toUpperCase() && linea.length < 80) {
            html += `<span class="module-highlight-greeting">${escHtml(linea)}</span>`;
            return;
        }

        // Encabezados o subtítulos en mayúsculas (ej: "AGENDA DE INDUCCIÓN INSTITUCIONAL:")
        const esEncabezado = /^[A-ZÁÉÍÓÚÑ0-9\s,:\(\)\-–—]{4,90}:?$/.test(linea) && linea.length < 90 && linea === linea.toUpperCase();
        if (esEncabezado) {
            html += `<h4 class="module-subtitle">${escHtml(linea)}</h4>`;
            return;
        }

        // Párrafo estándar
        html += `<p class="module-paragraph">${escHtml(linea)}</p>`;
    });

    return html;
}

function renderModuloLectura(idx) {
    actualizarBarraProgreso(idx);
    const mod = modulosItems[idx];
    const contenedor = document.getElementById('contenedorModulo');
    if (!contenedor || !mod) return;

    contenedor.classList.remove('hidden');
    document.getElementById('contenedorExamen')?.classList.add('hidden');
    document.getElementById('contenedorFinal')?.classList.add('hidden');

    window.scrollTo({ top: 0, behavior: 'smooth' });

    let mediaHtml = '';
    if (mod.tipo === 'video' && mod.video_url) {
        if (mod.video_url.endsWith('.mp4')) {
            mediaHtml = `
                <div class="media-frame-container">
                    <video controls controlsList="nodownload" preload="metadata" style="max-width: 100%; max-height: 480px; border-radius: 10px; border: 1px solid var(--border-subtle); box-shadow: 0 8px 24px rgba(0,0,0,0.6);">
                        <source src="${mod.video_url}" type="video/mp4">
                        Tu navegador no soporta reproducción de video HTML5.
                    </video>
                </div>
            `;
        } else {
            mediaHtml = `
                <div class="media-frame-container">
                    <div class="media-responsive-video">
                        <iframe src="${mod.video_url}" allowfullscreen></iframe>
                    </div>
                </div>
            `;
        }
    } else if (mod.imagen_url) {
        mediaHtml = `
            <div class="media-frame-container">
                <img src="${mod.imagen_url}" alt="${escHtml(mod.titulo)}" class="media-responsive-img" onerror="this.style.display='none'">
            </div>
        `;
    }

    const preguntas = mod.preguntas || [];
    let preguntasHtml = '';

    if (preguntas.length > 0) {
        preguntasHtml = `
            <div class="quiz-validation-wrapper">
                <div class="quiz-header">
                    <h3 class="quiz-title">
                        <i class="fas fa-check-circle"></i> Preguntas de Validación del Módulo
                    </h3>
                    <span style="color: var(--gold-primary); font-size: 0.82rem; font-weight: 600; letter-spacing: 0.5px;">
                        ${preguntas.length} ${preguntas.length === 1 ? 'Pregunta' : 'Preguntas'}
                    </span>
                </div>
                <p class="quiz-description">Responde correctamente las preguntas formuladas a continuación para validar este módulo y continuar:</p>
                <form id="formValidarModulo">
                    <div class="options-group">
                        ${preguntas.map((p, pIdx) => `
                            <div class="question-item-card">
                                <div class="question-text-title">
                                    <span class="question-number-badge">${pIdx + 1}</span>
                                    <span>${escHtml(p.pregunta)}</span>
                                </div>
                                <div class="options-group">
                                    ${p.opciones.map((opt, oIdx) => `
                                        <label class="option-card">
                                            <input type="radio" name="pregunta_${pIdx}" value="${oIdx}" required>
                                            <span>${escHtml(opt)}</span>
                                        </label>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div style="display:flex; justify-content:flex-end; margin-top:22px;">
                        <button type="submit" class="btn-gold">
                            <i class="fas fa-check-double"></i> Validar Respuestas y Continuar
                        </button>
                    </div>
                </form>
            </div>
        `;
    } else {
        preguntasHtml = `
            <div style="display:flex; justify-content:flex-end; margin-top: 32px;">
                <button id="btnCompletarModuloLectura" class="btn-gold">
                    <span>Módulo Leído — Continuar</span> <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        `;
    }

    // Barra de navegación de cabecera
    let navBotones = `<div class="module-nav-bar">`;
    if (idx > 0) {
        navBotones += `<button onclick="renderModuloLectura(${idx - 1})" class="btn-nav-arrow"><i class="fas fa-arrow-left"></i> Anterior</button>`;
    } else {
        navBotones += `<div></div>`;
    }

    navBotones += `<span class="module-nav-pill"><i class="fas fa-book-open"></i> Módulo ${idx + 1} de ${modulosItems.length}</span>`;

    if (idx < modulosItems.length - 1) {
        navBotones += `<button onclick="renderModuloLectura(${idx + 1})" class="btn-nav-arrow primary">Siguiente <i class="fas fa-arrow-right"></i></button>`;
    } else {
        navBotones += `<button onclick="renderPantallaExamenFinal()" class="btn-gold" style="padding:8px 20px; font-size:0.88rem;">Ir al Examen <i class="fas fa-graduation-cap"></i></button>`;
    }
    navBotones += `</div>`;

    contenedor.innerHTML = `
        ${navBotones}
        <div class="module-content-card">
            <div class="module-card-header">
                <h2 class="module-title">${escHtml(mod.titulo)}</h2>
                <a href="assets/CapacitacionFraganciasAltaDensidad.pdf" download="CapacitacionFraganciasAltaDensidad.pdf" target="_blank" class="btn-pdf-pill" title="Descargar Manual Completo en PDF">
                    <i class="fas fa-file-pdf"></i> <span>Manual en PDF</span>
                </a>
            </div>
            ${mediaHtml}
            <div class="module-editorial-body">
                ${formatearContenidoEditorial(mod.contenido)}
            </div>
            ${preguntasHtml}
        </div>
    `;

    if (window.anime) {
        anime({
            targets: '.module-content-card',
            opacity: [0, 1],
            translateY: [18, 0],
            duration: 400,
            easing: 'easeOutCubic'
        });
    }

    // Event listener si no hay preguntas
    const btnSoloLectura = document.getElementById('btnCompletarModuloLectura');
    if (btnSoloLectura) {
        btnSoloLectura.addEventListener('click', () => {
            completarModuloActual(mod);
        });
    }

    // Event listener si hay formulario de preguntas
    const formValidar = document.getElementById('formValidarModulo');
    if (formValidar) {
        formValidar.addEventListener('submit', (e) => {
            e.preventDefault();
            validarRespuestasModulo(mod, preguntas);
        });
    }
}

function validarRespuestasModulo(mod, preguntas) {
    let todasCorrectas = true;

    for (let i = 0; i < preguntas.length; i++) {
        const p = preguntas[i];
        const sel = document.querySelector(`input[name="pregunta_${i}"]:checked`);
        if (!sel || parseInt(sel.value, 10) !== p.respuesta_correcta) {
            todasCorrectas = false;
            break;
        }
    }

    if (!todasCorrectas) {
        Swal.fire({
            icon: 'error',
            title: 'Respuestas Incorrectas',
            text: 'Una o más respuestas no son correctas. Por favor repasa el contenido del módulo e inténtalo de nuevo.',
            confirmButtonText: 'Revisar'
        });
        return;
    }

    // Módulo aprobado
    completarModuloActual(mod, true);
}

function completarModuloActual(mod, conAlerta = false) {
    const idMod = mod.orden || (moduloActualIdx + 1);

    if (!modulosCompletados.includes(idMod)) {
        modulosCompletados.push(idMod);
        localStorage.setItem('ad_capacitacion_completados', JSON.stringify(modulosCompletados));
    }

    actualizarBadgeEstado();
    actualizarBarraProgreso();
    actualizarSelectorModulosDirecto();

    const accionSiguiente = () => {
        if (moduloActualIdx < modulosItems.length - 1) {
            moduloActualIdx++;
            renderModuloLectura(moduloActualIdx);
        } else {
            renderizarPasoCapacitacion();
        }
    };

    if (conAlerta) {
        Swal.fire({
            icon: 'success',
            title: '¡Módulo Validado con Éxito!',
            text: 'Has respondido correctamente las preguntas. Pasemos al siguiente módulo.',
            timer: 2000,
            showConfirmButton: false
        }).then(accionSiguiente);
    } else {
        accionSiguiente();
    }
}

function renderPantallaExamenFinal() {
    const contenedorMod = document.getElementById('contenedorModulo');
    const contenedorExa = document.getElementById('contenedorExamen');
    const contenedorFin = document.getElementById('contenedorFinal');

    if (contenedorMod) contenedorMod.classList.add('hidden');
    if (contenedorFin) contenedorFin.classList.add('hidden');
    if (contenedorExa) contenedorExa.classList.remove('hidden');

    window.scrollTo({ top: 0, behavior: 'smooth' });

    contenedorExa.innerHTML = `
        <div class="exam-intro-box">
            <div class="exam-badge-icon"><i class="fas fa-award"></i></div>
            <h2 class="exam-intro-title">¡Has Culminado los 53 Módulos de Formación!</h2>
            <p class="exam-intro-subtitle">
                Estás listo(a) para presentar el <strong>Examen Final de Certificación</strong>. La prueba consta de <strong>10 preguntas aleatorias</strong> extraídas de todos los módulos temáticos.
                Para aprobar y acceder a la certificación institucional deberás obtener una calificación del <strong>100% de aciertos</strong>.
            </p>
            <div style="display:flex; justify-content:center; gap:16px; flex-wrap:wrap; margin-bottom:12px;">
                <button id="btnIniciarExamen" class="btn-gold" style="font-size:1.02rem; padding:14px 34px;">
                    <i class="fas fa-play-circle"></i> Iniciar Examen Final Ahora
                </button>
                <button onclick="renderModuloLectura(0)" class="btn-outline-dark">
                    <i class="fas fa-undo"></i> Repasar Módulos
                </button>
            </div>
            <div id="examenPreguntasArea" class="hidden" style="text-align:left; margin-top:28px;"></div>
        </div>
    `;

    document.getElementById('btnIniciarExamen').addEventListener('click', () => {
        generarPreguntasExamenFinal();
    });
}

function generarPreguntasExamenFinal() {
    // Recopilar todas las preguntas disponibles de los módulos
    const todasLasPreguntas = [];
    modulosItems.forEach((mod) => {
        if (mod.preguntas && Array.isArray(mod.preguntas)) {
            mod.preguntas.forEach((p, idx) => {
                todasLasPreguntas.push({
                    id: `${mod.orden || 1}_${idx}`,
                    pregunta: p.pregunta,
                    opciones: p.opciones,
                    respuesta_correcta: p.respuesta_correcta,
                    moduloTitulo: mod.titulo
                });
            });
        }
    });

    if (todasLasPreguntas.length === 0) {
        Swal.fire({
            icon: 'error',
            title: 'Error de Datos',
            text: 'No se encontraron preguntas en el banco de datos.'
        });
        return;
    }

    // Mezclar y tomar 10 preguntas aleatorias
    const barajadas = [...todasLasPreguntas].sort(() => 0.5 - Math.random());
    preguntasExamenActual = barajadas.slice(0, 10);

    const btnIniciar = document.getElementById('btnIniciarExamen');
    if (btnIniciar) btnIniciar.style.display = 'none';

    const area = document.getElementById('examenPreguntasArea');
    if (!area) return;

    area.classList.remove('hidden');
    area.innerHTML = `
        <form id="formExamenFinalSubmit" class="exam-form-card">
            <div class="exam-form-header">
                <div>
                    <h3 style="color:var(--gold-primary); margin:0; font-family:'Outfit',sans-serif; font-size:1.25rem; font-weight:700;">
                        <i class="fas fa-tasks"></i> Evaluación de Inducción y Capacitación
                    </h3>
                    <span style="color:var(--text-muted); font-size:0.85rem; display:block; margin-top:4px;">
                        ${preguntasExamenActual.length} preguntas aleatorias — Criterio de Aprobación: 100% de aciertos
                    </span>
                </div>
                <span class="module-nav-pill"><i class="fas fa-stopwatch"></i> Sin Límite de Tiempo</span>
            </div>

            <div class="options-group">
                ${preguntasExamenActual.map((p, idx) => `
                    <div class="question-item-card">
                        <div class="question-text-title">
                            <span class="question-number-badge">${idx + 1}</span>
                            <span>${escHtml(p.pregunta)}</span>
                        </div>
                        <div class="options-group">
                            ${p.opciones.map((opt, oIdx) => `
                                <label class="option-card">
                                    <input type="radio" name="examen_preg_${idx}" value="${oIdx}" required>
                                    <span>${escHtml(opt)}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>

            <div style="display:flex; justify-content:flex-end; gap:14px; margin-top:28px; flex-wrap:wrap;">
                <button type="button" onclick="renderPantallaExamenFinal()" class="btn-outline-dark">
                    <i class="fas fa-times"></i> Cancelar
                </button>
                <button type="submit" class="btn-gold">
                    <i class="fas fa-paper-plane"></i> Enviar Examen para Calificación
                </button>
            </div>
        </form>
    `;

    document.getElementById('formExamenFinalSubmit').addEventListener('submit', (e) => {
        e.preventDefault();
        evaluarExamenFinal();
    });
}

function evaluarExamenFinal() {
    let aciertos = 0;
    const total = preguntasExamenActual.length;

    preguntasExamenActual.forEach((p, idx) => {
        const sel = document.querySelector(`input[name="examen_preg_${idx}"]:checked`);
        if (sel && parseInt(sel.value, 10) === p.respuesta_correcta) {
            aciertos++;
        }
    });

    const porcentaje = total > 0 ? Math.round((aciertos / total) * 100) : 0;
    const aprobado = aciertos === total;

    if (aprobado) {
        estadoInduccion = 'examen_aprobado';
        localStorage.setItem('ad_capacitacion_estado', 'examen_aprobado');
        actualizarBadgeEstado();

        Swal.fire({
            icon: 'success',
            title: '¡Examen Aprobado al 100%!',
            html: `
                <p style="color:var(--text-secondary); font-size:1rem; margin-bottom:20px; line-height:1.6;">
                    ¡Felicitaciones! Has obtenido una calificación perfecta de 10 sobre 10 (100%). Has completado y certificado oficialmente tu Inducción y Capacitación en Fragancias de Alta Densidad.
                </p>
                <div class="pdf-download-card" style="padding:20px; background:var(--bg-surface); margin-top:14px;">
                    <p style="color:var(--gold-primary); font-weight:700; font-size:0.96rem; margin:0 0 6px 0;">
                        <i class="fas fa-file-pdf"></i> Material Oficial de Consulta:
                    </p>
                    <p style="color:var(--text-muted); font-size:0.86rem; margin-bottom:16px;">
                        Descarga tu Manual Institucional Completo en formato PDF.
                    </p>
                    <a href="assets/CapacitacionFraganciasAltaDensidad.pdf" download="CapacitacionFraganciasAltaDensidad.pdf" target="_blank" class="btn-gold" style="font-size:0.92rem; padding:11px 22px;">
                        <i class="fas fa-download"></i> Descargar Manual en PDF
                    </a>
                </div>
            `,
            confirmButtonText: 'Ver Certificación Final'
        }).then(() => {
            renderizarPasoCapacitacion();
        });
    } else {
        Swal.fire({
            icon: 'warning',
            title: 'Examen No Aprobado',
            html: `
                <p style="font-size:1.02rem; color:var(--text-primary);">Obtuviste <strong>${aciertos} de ${total}</strong> aciertos (<strong>${porcentaje}%</strong>).</p>
                <p style="font-size:0.9rem; color:var(--text-muted); margin-top:10px; line-height:1.6;">
                    Para obtener la certificación oficial y habilitar la descarga del manual es requisito indispensable alcanzar el <strong>100% de respuestas correctas</strong>. ¡Puedes repasar los módulos y volver a intentarlo cuando lo desees!
                </p>
            `,
            confirmButtonText: 'Volver a Intentar'
        });
    }
}

function renderVistaFinalExito() {
    const contenedor = document.getElementById('contenedorFinal');
    if (!contenedor) return;

    contenedor.classList.remove('hidden');
    document.getElementById('contenedorModulo')?.classList.add('hidden');
    document.getElementById('contenedorExamen')?.classList.add('hidden');

    window.scrollTo({ top: 0, behavior: 'smooth' });

    contenedor.innerHTML = `
        <div class="completion-card">
            <div class="completion-icon-large"><i class="fas fa-check-circle"></i></div>
            <h2 class="completion-title">¡Capacitación e Inducción Culminada con Éxito!</h2>
            <p class="completion-subtitle">
                Has completado satisfactoriamente los 53 módulos corporativos y aprobado con calificación perfecta el examen final de <strong>Fragancias de Alta Densidad</strong>.
            </p>

            <!-- CARD DE DESCARGA DEL MANUAL EN PDF -->
            <div class="pdf-download-card">
                <div class="pdf-card-title">
                    <i class="fas fa-file-pdf"></i> Manual Institucional de Capacitación
                </div>
                <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6; margin-bottom: 22px;">
                    Accede y descarga tu <strong>Manual Oficial de Capacitación en formato PDF</strong>. Conserva este documento como guía permanente de consulta técnica, portafolio de fragancias, seguridad y atención al cliente.
                </p>
                <a href="assets/CapacitacionFraganciasAltaDensidad.pdf" download="CapacitacionFraganciasAltaDensidad.pdf" target="_blank" class="btn-gold" style="font-size: 1.02rem; padding: 14px 32px;">
                    <i class="fas fa-download"></i> Descargar Manual Oficial (PDF)
                </a>
            </div>

            <div style="margin-top: 32px; display: flex; justify-content: center; gap: 16px; flex-wrap: wrap;">
                <button onclick="renderModuloLectura(0)" class="btn-outline-dark">
                    <i class="fas fa-book-open"></i> Repasar los Módulos
                </button>
                <button onclick="reiniciarProgreso()" style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.3); color: #fca5a5; padding: 12px 22px; border-radius: 10px; cursor: pointer; font-family: inherit; font-size: 0.92rem; font-weight: 600; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s ease;">
                    <i class="fas fa-redo"></i> Reiniciar Progreso
                </button>
            </div>
        </div>
    `;
}

function reiniciarProgreso() {
    Swal.fire({
        title: '¿Reiniciar todo el progreso?',
        text: 'Se borrarán los módulos completados y el estado del examen en este navegador.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, reiniciar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('ad_capacitacion_completados');
            localStorage.removeItem('ad_capacitacion_estado');
            modulosCompletados = [];
            estadoInduccion = 'pendiente_capacitacion';
            moduloActualIdx = 0;
            actualizarBadgeEstado();
            actualizarSelectorModulosDirecto();
            actualizarBarraProgreso();
            renderizarPasoCapacitacion();
            Swal.fire('Reiniciado', 'El progreso ha sido reiniciado.', 'success');
        }
    });
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
