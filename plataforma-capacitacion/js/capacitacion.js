/**
 * Portal de inducción y capacitación · Fragancias de Alta Densidad
 * Estático, sin backend. Cuatro submódulos:
 *   #/general     Inducción general (53 módulos; sin preguntas filtro; examen final al terminar)
 *   #/especifica  Inducción específica · Líder de Punto de Venta
 *   #/vestimenta  Manual de código de vestimenta y presentación
 *   #/bienestar   Plan de bienestar · Fragancias Alta Densidad le apuesta a tu bienestar
 * Rutas: #/<pista>, #/<pista>/<módulo>, #/general/examen. El progreso se guarda en este navegador.
 */
(function () {
    'use strict';

    // Rutas de archivos con la raíz de la plataforma (ver index.html): la URL no lleva barra final
    const RAIZ = window.RAIZ || '/';
    const url = (src) => (!src || /^(https?:|data:|\/)/.test(src) ? src : RAIZ + src);
    const PDF = url('assets/CapacitacionFraganciasAltaDensidad.pdf');
    const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));
    const leer = (k, def) => { try { const v = localStorage.getItem(k); return v == null ? def : JSON.parse(v); } catch (e) { return def; } };
    const guardar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } };

    // ── Submódulos ──
    const general = (window.MODULOS_CAPACITACION || []).map((m) => ({
        id: String(m.orden),
        titulo: String(m.titulo || '').replace(/^\d+\.\s*/, ''),
        legado: m
    }));
    const PISTAS = {
        general: {
            clave: 'general', n: '01', titulo: 'Inducción general',
            descripcion: 'La empresa, su historia, el reglamento interno, seguridad y salud en el trabajo, el portafolio, la atención al cliente y la facturación.',
            modulos: general, examen: true, icono: 'fa-building'
        },
        especifica: Object.assign({ n: '02', icono: 'fa-store' }, window.INDUCCION_ESPECIFICA),
        vestimenta: Object.assign({ n: '03', icono: 'fa-shirt' }, window.MANUAL_VESTIMENTA),
        bienestar: Object.assign({ n: '04', icono: 'fa-spa' }, window.PLAN_BIENESTAR)
    };
    const ORDEN = ['general', 'especifica', 'vestimenta', 'bienestar'];

    // Progreso: la inducción general conserva las claves de la versión anterior
    const CLAVES = { general: 'ad_capacitacion_completados', especifica: 'ad_cap_especifica', vestimenta: 'ad_cap_vestimenta', bienestar: 'ad_cap_bienestar' };
    const leidos = (clave) => leer(CLAVES[clave], []).map(String);
    const marcarLeido = (clave, id) => {
        const ls = leidos(clave);
        if (!ls.includes(String(id))) guardar(CLAVES[clave], clave === 'general' ? [...ls, String(id)].map(Number) : [...ls, String(id)]);
    };
    const examenAprobado = () => leer('ad_capacitacion_estado', null) === 'examen_aprobado' || localStorage.getItem('ad_capacitacion_estado') === 'examen_aprobado';
    const avance = (p) => {
        const l = leidos(p.clave);
        const hechos = p.modulos.filter((m) => l.includes(m.id)).length;
        return { hechos, total: p.modulos.length, pct: p.modulos.length ? Math.round((hechos / p.modulos.length) * 100) : 0 };
    };

    const app = document.getElementById('app');
    // Atajos de teclado de la vista actual (los define cada vista; se limpian al cambiar de ruta)
    let teclas = null;
    document.addEventListener('keydown', (e) => { if (teclas) teclas(e); });

    // ── Portada: imagotipo y los cuatro submódulos ──
    function portada() {
        const tarjetas = ORDEN.map((k) => {
            const p = PISTAS[k];
            const a = avance(p);
            const accion = a.hechos === 0 ? 'Comenzar' : a.hechos >= a.total ? 'Repasar' : 'Continuar';
            const estado = k === 'general' && examenAprobado() ? '<span class="sello-ok"><i class="fas fa-check"></i> Examen aprobado</span>' : '';
            return `
                <li>
                    <a class="pista-tarjeta" href="#/${k}">
                        <span class="pista-n">${p.n}</span>
                        <span class="pista-icono"><i class="fas ${p.icono}" aria-hidden="true"></i></span>
                        <h3>${esc(p.titulo)}</h3>
                        ${p.cargo ? `<span class="pista-cargo">${esc(p.cargo)}</span>` : ''}
                        <p>${esc(p.descripcion)}</p>
                        <span class="pista-meta">${a.total} módulos · ${a.pct}% ${estado}</span>
                        <span class="barra"><i style="width:${a.pct}%"></i></span>
                        <span class="pista-ir">${accion} <i class="fas fa-arrow-right" aria-hidden="true"></i></span>
                    </a>
                </li>`;
        }).join('');
        app.innerHTML = `
            <section class="portada">
                <img class="portada-imagotipo" src="${url('assets/img/imagotipo.svg')}" alt="Fragancias de Alta Densidad" width="560" height="560">
                <p class="portada-eyebrow">Portal de inducción y capacitación</p>
                <a class="portada-bajar" href="#submodulos" aria-label="Ver los submódulos"><span>Comienza aquí</span><i class="fas fa-arrow-down" aria-hidden="true"></i></a>
            </section>
            <section class="sec" id="submodulos">
                <div class="envoltura">
                    <span class="eyebrow">Tu formación</span>
                    <h2 class="titular">Cuatro submódulos,<br><em>un mismo estándar.</em></h2>
                    <p class="mute intro">Empieza por la inducción general, sigue con la inducción específica de tu cargo y el manual de vestimenta, y conoce el plan de bienestar que preparamos para ti. Puedes volver a cualquiera cuando quieras.</p>
                    <ol class="pistas">${tarjetas}</ol>
                    <a class="enlace-pdf" href="${PDF}" download><i class="fas fa-file-pdf" aria-hidden="true"></i> Descargar el manual institucional en PDF</a>
                </div>
            </section>`;
        const bajar = app.querySelector('.portada-bajar');
        bajar.addEventListener('click', (e) => { e.preventDefault(); document.getElementById('submodulos').scrollIntoView({ behavior: 'smooth' }); });
    }

    // ── Índice de un submódulo ──
    function indicePista(p) {
        const l = leidos(p.clave);
        const a = avance(p);
        const siguiente = p.modulos.find((m) => !l.includes(m.id)) || p.modulos[0];
        const examen = p.examen ? `
            <div class="examen-cta ${a.hechos >= a.total ? '' : 'bloqueado'}">
                <div><b>Examen final</b><span class="mute">${examenAprobado() ? 'Aprobado. Puedes repasar cuando quieras.' : a.hechos >= a.total ? '10 preguntas al azar de todos los módulos. Se aprueba con el 100 %.' : `Se habilita al leer los ${a.total} módulos (llevas ${a.hechos}).`}</span></div>
                ${a.hechos >= a.total ? '<a class="btn" href="#/general/examen">Presentar examen</a>' : ''}
            </div>` : '';
        app.innerHTML = `
            <section class="sec cab-pista">
                <div class="envoltura">
                    <a class="volver" href="#/"><i class="fas fa-arrow-left" aria-hidden="true"></i> Portal</a>
                    <span class="eyebrow">${p.n} · ${esc(p.cargo || 'Submódulo')}</span>
                    <h1 class="titular">${esc(p.titulo)}</h1>
                    <p class="mute intro">${esc(p.descripcion)}</p>
                    <div class="avance"><span>${a.hechos} de ${a.total} módulos leídos</span><span class="barra"><i style="width:${a.pct}%"></i></span></div>
                    <a class="btn" href="#/${p.clave}/${siguiente.id}">${a.hechos === 0 ? 'Comenzar' : a.hechos >= a.total ? 'Repasar desde el inicio' : 'Continuar'}</a>
                    ${examen}
                    <ol class="indice">
                        ${p.modulos.map((m, i) => `
                            <li class="${l.includes(m.id) ? 'leido' : ''}">
                                <a href="#/${p.clave}/${m.id}">
                                    <span class="indice-n">${String(i + 1).padStart(2, '0')}</span>
                                    <span class="indice-t"><b>${esc(m.titulo)}</b>${m.resumen ? `<small>${esc(m.resumen)}</small>` : ''}</span>
                                    <i class="fas ${l.includes(m.id) ? 'fa-check' : 'fa-chevron-right'}" aria-hidden="true"></i>
                                </a>
                            </li>`).join('')}
                    </ol>
                </div>
            </section>`;
    }

    // ── Bloques de contenido ──
    const NIVELES = { prohibido: ['fa-ban', 'Prohibido'], importante: ['fa-triangle-exclamation', 'Importante'], consejo: ['fa-lightbulb', 'Consejo'] };

    function bloque(b) {
        switch (b.tipo) {
            case 'texto':
                return `<p class="parrafo">${esc(b.texto)}</p>`;
            case 'lista':
                return `${b.titulo ? `<h3 class="sub">${esc(b.titulo)}</h3>` : ''}<ul class="lista">${b.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
            case 'pasos':
                return `${b.titulo ? `<h3 class="sub">${esc(b.titulo)}</h3>` : ''}
                    <ol class="pasos">${b.pasos.map((s, i) => `
                        <li><span class="paso-n">${String(i + 1).padStart(2, '0')}</span>
                            <div><b>${esc(s.t)}</b>${s.sistema ? `<span class="etiqueta">${esc(s.sistema)}</span>` : ''}<p>${esc(s.d)}</p></div></li>`).join('')}
                    </ol>`;
            case 'aviso': {
                const [icono, etiqueta] = NIVELES[b.nivel] || NIVELES.importante;
                return `<div class="aviso aviso-${b.nivel}"><i class="fas ${icono}" aria-hidden="true"></i><p><b>${etiqueta}.</b> ${esc(b.texto)}</p></div>`;
            }
            case 'tabla':
                return `${b.titulo ? `<h3 class="sub">${esc(b.titulo)}</h3>` : ''}
                    <div class="tabla-caja"><table><thead><tr>${b.columnas.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead>
                    <tbody>${b.filas.map((f) => `<tr>${f.map((c, i) => `<td data-col="${esc(b.columnas[i])}">${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
            case 'comparar':
                return `${b.titulo ? `<h3 class="sub">${esc(b.titulo)}</h3>` : ''}
                    <div class="comparar">
                        <div class="bien"><span class="comparar-t"><i class="fas fa-check" aria-hidden="true"></i> Así sí</span><ul>${b.bien.map((i) => `<li>${esc(i)}</li>`).join('')}</ul></div>
                        <div class="mal"><span class="comparar-t"><i class="fas fa-xmark" aria-hidden="true"></i> Así no</span><ul>${b.mal.map((i) => `<li>${esc(i)}</li>`).join('')}</ul></div>
                    </div>`;
            case 'sistemas':
                return `${b.titulo ? `<h3 class="sub">${esc(b.titulo)}</h3>` : ''}
                    <ul class="sistemas">${b.items.map((s) => `
                        <li><i class="fas ${s.icono}" aria-hidden="true"></i><b>${esc(s.nombre)}</b>
                            <p class="mute">${esc(s.para)}</p><p><span class="etiqueta">Tu función</span> ${esc(s.funcion)}</p></li>`).join('')}
                    </ul>`;
            case 'indicadores':
                return `<ul class="indicadores">${b.items.map((x) => `
                    <li>
                        <div class="ind-cab"><span class="ind-n">${x.n}</span><h3>${esc(x.nombre)}</h3><span class="ind-meta">Meta ${esc(x.meta)}</span></div>
                        <p class="mute">${esc(x.mide)}</p>
                        <dl>
                            <div><dt>Cómo se calcula</dt><dd class="formula">${esc(x.formula)}</dd></div>
                            <div><dt>De dónde sale</dt><dd>${esc(x.fuente)}</dd></div>
                            <div><dt>Frecuencia</dt><dd>${esc(x.frecuencia)}</dd></div>
                        </dl>
                    </li>`).join('')}</ul>`;
            case 'enlace':
                return `<p class="parrafo">${esc(b.texto)} <a class="enlace" href="${esc(b.destino)}">Abrir el manual <i class="fas fa-arrow-right" aria-hidden="true"></i></a></p>`;
            case 'uniforme':
                // Con fotos: galería de las prendas; sin fotos: la ilustración de respaldo
                return `${b.fotos && b.fotos.length ? `
                    <ul class="prendas">${b.fotos.map(([src, pie]) => `
                        <li><a href="${esc(url(src))}" target="_blank" rel="noopener"><img src="${esc(url(src))}" alt="${esc(pie)}" loading="lazy"></a><span>${esc(pie)}</span></li>`).join('')}
                    </ul>` : ''}
                    <div class="uniforme ${b.fotos && b.fotos.length ? 'sin-figura' : ''}">
                        ${b.fotos && b.fotos.length ? '' : `<figure>${figuraUniforme(b.rol)}<figcaption>${esc(b.titulo)}</figcaption></figure>`}
                        <dl>${b.piezas.map(([t, d]) => `<div><dt>${esc(t)}</dt><dd>${esc(d)}</dd></div>`).join('')}</dl>
                    </div>`;
            case 'imagen':
                return `<figure class="media media-guia"><a href="${esc(url(b.src))}" target="_blank" rel="noopener" title="Ver en tamaño completo"><img src="${esc(url(b.src))}" alt="${esc(b.alt)}" loading="lazy"></a>
                    ${b.pie ? `<figcaption>${esc(b.pie)} · <span class="mute">toca para ampliar</span></figcaption>` : ''}</figure>`;
            case 'actividades':
                // Tarjetas de actividades del plan de bienestar: ilustración (o ícono), frecuencia y duración
                return `${b.titulo ? `<h3 class="sub">${esc(b.titulo)}</h3>` : ''}
                    <ul class="actividades">${b.items.map((x) => `
                        <li>
                            ${x.img
                                ? `<a class="act-img" href="${esc(url(x.img))}" target="_blank" rel="noopener" title="Ver en tamaño completo"><img src="${esc(url(x.img))}" alt="${esc(x.nombre)}" loading="lazy"></a>`
                                : `<span class="act-img act-icono"><i class="fas ${esc(x.icono || 'fa-star')}" aria-hidden="true"></i></span>`}
                            <div class="act-cuerpo">
                                <b>${esc(x.nombre)}</b>
                                <p>${esc(x.descripcion)}</p>
                                <span class="act-meta"><span><i class="fas fa-calendar-days" aria-hidden="true"></i> ${esc(x.frecuencia)}</span><span><i class="fas fa-clock" aria-hidden="true"></i> ${esc(x.duracion)}</span></span>
                            </div>
                        </li>`).join('')}
                    </ul>`;
            case 'cita':
                return `<blockquote class="cita">«${esc(b.texto)}»</blockquote>`;
            case 'chequeo':
                return `<ul class="chequeo">${b.items.map((i, n) => `<li><label><input type="checkbox" data-chequeo="${n}"> <span>${esc(i)}</span></label></li>`).join('')}</ul>
                    <p class="mute chequeo-total" aria-live="polite">0 de ${b.items.length}</p>`;
            default:
                return '';
        }
    }

    // Texto de la inducción general (formato anterior: líneas, viñetas y encabezados en mayúsculas)
    function textoLegado(texto) {
        let html = '';
        let lista = [];
        const cerrarLista = () => { if (lista.length) { html += `<ul class="lista">${lista.join('')}</ul>`; lista = []; } };
        String(texto || '').split('\n').forEach((raw) => {
            const l = raw.trim();
            if (!l) return;
            if (/^[•\-*]\s*/.test(l)) { lista.push(`<li>${esc(l.replace(/^[•\-*]\s*/, ''))}</li>`); return; }
            cerrarLista();
            if (/^[A-ZÁÉÍÓÚÑ0-9¡!\s,:()\-–—]{4,90}:?$/.test(l) && l === l.toUpperCase()) { html += `<h3 class="sub">${esc(l.replace(/:$/, ''))}</h3>`; return; }
            html += `<p class="parrafo">${esc(l)}</p>`;
        });
        cerrarLista();
        return html;
    }

    function mediaLegado(m) {
        if (m.tipo === 'video' && m.video_url) {
            return /\.mp4$/i.test(m.video_url)
                ? `<figure class="media"><video controls preload="metadata" src="${esc(url(m.video_url))}"></video></figure>`
                : `<figure class="media media-video"><iframe src="${esc(m.video_url)}" allowfullscreen title="${esc(m.titulo)}"></iframe></figure>`;
        }
        return m.imagen_url ? `<figure class="media"><img src="${esc(url(m.imagen_url))}" alt="" loading="lazy" onerror="this.parentNode.remove()"></figure>` : '';
    }

    // ── Vista de un módulo ──
    function modulo(p, id) {
        const i = p.modulos.findIndex((m) => m.id === id);
        if (i < 0) { location.hash = `#/${p.clave}`; return; }
        const m = p.modulos[i];
        const l = leidos(p.clave);
        const ant = p.modulos[i - 1];
        const sig = p.modulos[i + 1];
        const cuerpo = m.legado
            ? mediaLegado(m.legado) + textoLegado(m.legado.contenido)
            : (m.bloques || []).map(bloque).join('');
        const ultimo = !sig;
        const destinoFinal = p.examen ? '#/general/examen' : `#/${p.clave}`;
        const a = avance(p);
        const otras = ORDEN.filter((k) => k !== p.clave).map((k) => PISTAS[k]);
        app.innerHTML = `
            <div class="barra-lectura">
                <button type="button" class="btn-indice" id="abrir-indice" aria-controls="cajon" aria-expanded="false" aria-label="Abrir el índice de ${esc(p.titulo)}">
                    <span class="btn-indice-ico" aria-hidden="true"><i></i><i></i><i></i></span>
                    <span class="btn-indice-t">Índice</span>
                </button>
                <span class="barra-lectura-t"><b>${esc(p.corto || p.titulo)}</b><span class="mute">${i + 1} de ${p.modulos.length}</span></span>
                <span class="barra-lectura-flechas">
                    ${ant ? `<a href="#/${p.clave}/${ant.id}" aria-label="Módulo anterior" title="Anterior (←)"><i class="fas fa-chevron-left" aria-hidden="true"></i></a>` : '<span></span>'}
                    ${sig ? `<a href="#/${p.clave}/${sig.id}" aria-label="Módulo siguiente" title="Siguiente (→)"><i class="fas fa-chevron-right" aria-hidden="true"></i></a>` : '<span></span>'}
                </span>
                <span class="barra-lectura-avance" aria-hidden="true"><i style="width:${((i + 1) / p.modulos.length) * 100}%"></i></span>
            </div>

            <div class="velo" id="velo" hidden></div>
            <aside class="cajon" id="cajon" aria-label="Índice de ${esc(p.titulo)}" aria-hidden="true">
                <div class="cajon-cab">
                    <div>
                        <span class="eyebrow">${p.n} · Índice</span>
                        <h2>${esc(p.titulo)}</h2>
                        <div class="avance"><span>${a.hechos} de ${a.total} leídos</span><span class="barra"><i style="width:${a.pct}%"></i></span></div>
                    </div>
                    <button type="button" class="cajon-cerrar" id="cerrar-indice" aria-label="Cerrar el índice"><i class="fas fa-xmark" aria-hidden="true"></i></button>
                </div>
                <ol class="cajon-lista">${p.modulos.map((x, n) => `
                    <li class="${x.id === id ? 'actual' : ''} ${l.includes(x.id) ? 'leido' : ''}">
                        <a href="#/${p.clave}/${x.id}" ${x.id === id ? 'aria-current="page"' : ''}>
                            <span class="cajon-n">${String(n + 1).padStart(2, '0')}</span>
                            <span class="cajon-t">${esc(x.titulo)}</span>
                            <span class="cajon-estado" aria-label="${l.includes(x.id) ? 'leído' : 'pendiente'}">${l.includes(x.id) ? '<i class="fas fa-check" aria-hidden="true"></i>' : ''}</span>
                        </a>
                    </li>`).join('')}
                </ol>
                <div class="cajon-pie">
                    <a class="cajon-volver" href="#/${p.clave}"><i class="fas fa-list" aria-hidden="true"></i> Resumen del submódulo</a>
                    <span class="mute">Otros submódulos</span>
                    <div class="cajon-otras">${otras.map((o) => `<a href="#/${o.clave}">${esc(o.titulo)}</a>`).join('')}</div>
                </div>
            </aside>

            <article class="lector-articulo">
                <span class="eyebrow">${esc(p.corto || p.titulo)} · ${i + 1} de ${p.modulos.length}</span>
                <h1 class="titular">${esc(m.titulo)}</h1>
                ${m.resumen ? `<p class="intro mute">${esc(m.resumen)}</p>` : ''}
                <div class="contenido">${cuerpo}</div>
                <div class="lector-pie">
                    ${ant ? `<a class="btn btn-linea" href="#/${p.clave}/${ant.id}"><i class="fas fa-arrow-left" aria-hidden="true"></i> Anterior</a>` : '<span></span>'}
                    <button type="button" class="btn" id="leido">${ultimo ? (p.examen ? 'Leído · ir al examen' : 'Leído · terminar') : 'Leído · siguiente'} <i class="fas fa-arrow-right" aria-hidden="true"></i></button>
                </div>
            </article>`;
        // Cajón del índice: se abre con el botón, se cierra con ×, tocando fuera, con Esc o al elegir un módulo
        const cajon = document.getElementById('cajon');
        const velo = document.getElementById('velo');
        const boton = document.getElementById('abrir-indice');
        const abrir = (si) => {
            cajon.classList.toggle('abierto', si);
            cajon.setAttribute('aria-hidden', String(!si));
            velo.hidden = !si;
            boton.setAttribute('aria-expanded', String(si));
            document.body.classList.toggle('con-cajon', si);
            if (si) {
                const actual = cajon.querySelector('.actual a');
                (actual || cajon.querySelector('.cajon-cerrar')).focus({ preventScroll: true });
                if (actual) actual.scrollIntoView({ block: 'center' });
            } else boton.focus({ preventScroll: true });
        };
        boton.addEventListener('click', () => abrir(true));
        document.getElementById('cerrar-indice').addEventListener('click', () => abrir(false));
        velo.addEventListener('click', () => abrir(false));
        teclas = (e) => {
            if (e.key === 'Escape' && cajon.classList.contains('abierto')) { abrir(false); return; }
            if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || cajon.classList.contains('abierto') || e.metaKey || e.ctrlKey || e.altKey) return;
            if (e.key === 'ArrowRight' && sig) location.hash = `#/${p.clave}/${sig.id}`;
            if (e.key === 'ArrowLeft' && ant) location.hash = `#/${p.clave}/${ant.id}`;
        };
        document.getElementById('leido').addEventListener('click', () => {
            marcarLeido(p.clave, m.id);
            location.hash = sig ? `#/${p.clave}/${sig.id}` : destinoFinal;
        });
        app.querySelectorAll('[data-chequeo]').forEach((c) => c.addEventListener('change', () => {
            const total = app.querySelectorAll('[data-chequeo]');
            const hechos = [...total].filter((x) => x.checked).length;
            app.querySelector('.chequeo-total').textContent = hechos === total.length ? '¡Listo para el turno!' : `${hechos} de ${total.length}`;
        }));
    }

    // ── Examen final de la inducción general (10 preguntas al azar; 100 % para aprobar) ──
    let preguntasExamen = [];
    function examen() {
        const p = PISTAS.general;
        const a = avance(p);
        if (a.hechos < a.total && !examenAprobado()) {
            app.innerHTML = `<section class="sec"><div class="envoltura estrecha">
                <a class="volver" href="#/general"><i class="fas fa-arrow-left" aria-hidden="true"></i> Inducción general</a>
                <h1 class="titular">Examen final</h1>
                <p class="mute intro">Se habilita al leer los ${a.total} módulos de la inducción general. Llevas ${a.hechos}.</p>
                <a class="btn" href="#/general">Seguir leyendo</a></div></section>`;
            return;
        }
        const banco = [];
        (window.MODULOS_CAPACITACION || []).forEach((m) => (m.preguntas || []).forEach((q) => banco.push(q)));
        preguntasExamen = banco.map((q) => ({ q, r: Math.random() })).sort((x, y) => x.r - y.r).slice(0, 10).map((x) => x.q);
        app.innerHTML = `<section class="sec"><div class="envoltura estrecha">
            <a class="volver" href="#/general"><i class="fas fa-arrow-left" aria-hidden="true"></i> Inducción general</a>
            <span class="eyebrow">Inducción general</span>
            <h1 class="titular">Examen final</h1>
            <p class="mute intro">${examenAprobado() ? 'Ya lo aprobaste: puedes presentarlo de nuevo para repasar.' : '10 preguntas al azar de todos los módulos. Se aprueba con el 100 % de aciertos; puedes intentarlo las veces que necesites.'}</p>
            <form id="examen" class="examen">
                ${preguntasExamen.map((q, n) => `
                    <fieldset>
                        <legend><span class="paso-n">${String(n + 1).padStart(2, '0')}</span> ${esc(q.pregunta)}</legend>
                        ${q.opciones.map((o, k) => `<label class="opcion"><input type="radio" name="p${n}" value="${k}" required> <span>${esc(o)}</span></label>`).join('')}
                    </fieldset>`).join('')}
                <button class="btn" type="submit">Calificar</button>
            </form>
            <div id="resultado" aria-live="polite"></div>
        </div></section>`;
        document.getElementById('examen').addEventListener('submit', (e) => {
            e.preventDefault();
            let aciertos = 0;
            preguntasExamen.forEach((q, n) => {
                const sel = app.querySelector(`input[name="p${n}"]:checked`);
                const ok = sel && Number(sel.value) === q.respuesta_correcta;
                if (ok) aciertos += 1;
                app.querySelectorAll(`input[name="p${n}"]`).forEach((inp) => {
                    const lab = inp.closest('.opcion');
                    lab.classList.toggle('correcta', Number(inp.value) === q.respuesta_correcta && inp.checked);
                    lab.classList.toggle('incorrecta', inp.checked && Number(inp.value) !== q.respuesta_correcta);
                });
            });
            const total = preguntasExamen.length;
            const res = document.getElementById('resultado');
            if (aciertos === total) {
                try { localStorage.setItem('ad_capacitacion_estado', 'examen_aprobado'); } catch (err) { /* sin almacenamiento */ }
                res.innerHTML = `<div class="certificado">
                    <svg class="gota" viewBox="0 0 100 100" aria-hidden="true"><use href="#gota-tallada"></use></svg>
                    <span class="eyebrow">Inducción general aprobada</span>
                    <h2 class="titular">${aciertos} de ${total}.<br><em>Bienvenido(a) al equipo.</em></h2>
                    <p class="mute">Continúa con la inducción específica de tu cargo, el manual de vestimenta y el plan de bienestar.</p>
                    <div class="acciones"><a class="btn" href="#/especifica">Inducción específica</a><a class="btn btn-linea" href="${PDF}" download>Manual en PDF</a></div>
                </div>`;
            } else {
                res.innerHTML = `<div class="aviso aviso-importante"><i class="fas fa-rotate" aria-hidden="true"></i><p><b>${aciertos} de ${total} aciertos.</b> Se necesita el 100 %. Revisa las respuestas marcadas, repasa los módulos y vuelve a intentarlo. <a class="enlace" href="#/general/examen" id="otra">Nuevas preguntas</a></p></div>`;
                document.getElementById('otra').addEventListener('click', (ev) => { ev.preventDefault(); examen(); window.scrollTo(0, 0); });
            }
            res.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }

    // ── Ilustración de los uniformes (prenda plana, colores de la marca) ──
    function figuraUniforme(rol) {
        const operativo = rol === 'operativo';
        const tinta = '#151517';
        const filete = '#3a3a3e';
        const oro = '#C9A961';
        const gota = (x, y, s) => `<g transform="translate(${x},${y}) scale(${s / 100})"><path d="M50,2 L63,27 L76,46 L81,63 L77,79 L65,92 L50,98 L35,92 L23,79 L19,63 L24,46 L37,27 Z" fill="${oro}"/></g>`;
        const polo = `
            <path d="M58,34 L84,24 Q100,38 116,24 L142,34 L172,62 L156,86 L142,74 L142,158 L58,158 L58,74 L44,86 L28,62 Z" fill="${tinta}" stroke="${filete}" stroke-width="1.5" stroke-linejoin="round"/>
            <path d="M84,24 L92,44 L100,36 L108,44 L116,24" fill="none" stroke="${filete}" stroke-width="1.5" stroke-linejoin="round"/>
            <path d="M100,36 L100,66" stroke="${filete}" stroke-width="1.5"/>
            <circle cx="100" cy="50" r="1.6" fill="${filete}"/><circle cx="100" cy="60" r="1.6" fill="${filete}"/>
            <path d="M44,86 L56,78 M156,86 L144,78" stroke="${filete}" stroke-width="1.2"/>
            ${operativo ? gota(129, 66, 10) : gota(120, 54, 12)}`;
        const delantal = operativo ? `
            <path d="M76,60 L124,60 L130,250 L70,250 Z" fill="#1d1d20" stroke="${filete}" stroke-width="1.5" stroke-linejoin="round"/>
            <path d="M76,60 Q80,36 90,26 M124,60 Q120,36 110,26" fill="none" stroke="#1d1d20" stroke-width="3"/>
            <path d="M72,112 L40,124 M128,112 L160,124" stroke="#1d1d20" stroke-width="3" stroke-linecap="round"/>
            <rect x="84" y="168" width="32" height="28" fill="none" stroke="${filete}" stroke-width="1.2"/>
            ${gota(94, 76, 12)}` : '';
        const pantalon = `
            <path d="M62,160 L138,160 L144,330 L110,330 L100,200 L90,330 L56,330 Z" fill="${operativo ? '#111113' : '#141418'}" stroke="${filete}" stroke-width="1.5" stroke-linejoin="round"/>
            ${operativo ? '' : `
            <path d="M64,176 Q78,180 84,166 M136,176 Q122,180 116,166 M100,160 L100,196" fill="none" stroke="${oro}" stroke-width="0.8" stroke-dasharray="2 2" opacity="0.55"/>
            <path d="M60,320 L88,320 M112,320 L142,320" stroke="${oro}" stroke-width="0.8" stroke-dasharray="2 2" opacity="0.45"/>`}`;
        const zapatos = operativo ? `
            <path d="M50,348 Q50,336 66,336 L92,336 Q98,336 98,346 L98,356 L50,356 Z" fill="${tinta}" stroke="${filete}" stroke-width="1.5"/>
            <path d="M102,346 Q102,336 108,336 L134,336 Q150,336 150,348 L150,356 L102,356 Z" fill="${tinta}" stroke="${filete}" stroke-width="1.5"/>
            <path d="M50,352 L98,352 M102,352 L150,352" stroke="#3f3f44" stroke-width="3"/>` : `
            <path d="M46,354 Q48,340 70,340 L90,338 Q98,338 98,348 L98,356 L46,356 Z" fill="#0d0d0e" stroke="${filete}" stroke-width="1.5"/>
            <path d="M102,348 Q102,338 110,338 L130,340 Q152,340 154,354 L154,356 L102,356 Z" fill="#0d0d0e" stroke="${filete}" stroke-width="1.5"/>
            <path d="M74,344 L86,342 M114,342 L126,344" stroke="${filete}" stroke-width="1"/>`;
        return `<svg class="figura" viewBox="0 0 200 372" role="img" aria-label="Uniforme ${operativo ? 'operativo: polo negra, delantal, pantalón y zapatos negros cómodos' : 'administrativo: polo negra con logotipo, jean negro y zapatos formales'}">
            <rect x="0" y="0" width="200" height="372" fill="#F4F1EA"/>
            ${polo}${pantalon}${delantal}${zapatos}
        </svg>`;
    }

    // ── Rutas ──
    function marcarNav(clave) {
        document.querySelectorAll('.cab-nav a').forEach((a) => a.toggleAttribute('aria-current', a.dataset.pista === clave));
    }
    function rutear() {
        teclas = null;
        document.body.classList.remove('con-cajon');
        const [, clave, id] = (location.hash || '#/').replace(/^#\/?/, '#/').split('/');
        const p = PISTAS[clave];
        marcarNav(p ? clave : null);
        if (!p) portada();
        else if (clave === 'general' && id === 'examen') examen();
        else if (id) modulo(p, id);
        else indicePista(p);
        if (!(location.hash === '' || location.hash === '#/')) window.scrollTo(0, 0);
        document.title = `${p ? p.titulo + ' · ' : ''}Inducción y capacitación | Fragancias de Alta Densidad`;
        app.focus({ preventScroll: true });
    }
    // La barra de lectura se pega justo debajo de la cabecera (su alto cambia en celular)
    const cab = document.querySelector('.cab');
    if (cab && window.ResizeObserver) {
        new ResizeObserver(() => document.documentElement.style.setProperty('--cab-h', `${cab.offsetHeight}px`)).observe(cab);
    }
    window.addEventListener('hashchange', rutear);
    rutear();
})();
