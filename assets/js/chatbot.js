/**
 * AURA — Asesora Olfativa Virtual & Chatbot IA
 * Fragancias de Alta Densidad
 * Dark Luxury Architecture
 */

(function () {
    'use strict';

    // ── Estado del Asistente ──────────────────────────────────────────────
    let chatAbierto = false;
    let catalogoProductos = [];
    let catalogoKits = [];

    // ── Helpers de Normalización de Campos ─────────────────────────────────
    // La API devuelve campos en español (nombre, categoria, genero, etc.)
    // pero algunos cachés/contextos pueden tener campos en inglés.
    // Estos helpers garantizan compatibilidad en ambos formatos.
    function prodNombre(p) { return p.name || p.nombre || ''; }
    function prodCategoria(p) { return p.category || p.categoria || ''; }
    function prodGenero(p) { return p.gender || p.genero || ''; }
    function prodDescripcion(p) { return p.description || p.descripcion || ''; }
    function prodPrecio(p) { return Number(p.price || p.precio || 0); }
    function prodImagen(p) { return p.image || p.imagen || 'assets/img/Logo2026.png'; }
    function prodId(p) { return p.id || p._id || ''; }

    // ── Sanitizador HTML para evitar XSS ──────────────────────────────────
    function sanitizarTexto(texto) {
        const div = document.createElement('div');
        div.textContent = texto;
        return div.innerHTML;
    }

    // ── Persistencia de Conversación ──────────────────────────────────────
    const CHAT_HISTORY_KEY = 'ad_chat_history_v1';

    function guardarHistorial() {
        try {
            const contenedor = document.getElementById('adIaChatMessages');
            if (!contenedor) return;
            sessionStorage.setItem(CHAT_HISTORY_KEY, contenedor.innerHTML);
        } catch (e) { /* silenciar errores de storage */ }
    }

    function restaurarHistorial() {
        try {
            const guardado = sessionStorage.getItem(CHAT_HISTORY_KEY);
            if (!guardado) return false;
            const contenedor = document.getElementById('adIaChatMessages');
            if (!contenedor) return false;
            contenedor.innerHTML = guardado;
            contenedor.scrollTop = contenedor.scrollHeight;
            return true;
        } catch (e) { return false; }
    }

    // ── Base de Conocimiento Experta en Fragancias ─────────────────────────
    const KNOWLEDGE_BASE = {
        feromonas: {
            keywords: ['feromona', 'feromonas', 'atraer', 'seduccion', 'afrodisiaco', 'atracción'],
            respuesta: `✨ <strong>Nuestra Fórmula con Feromonas & 33% de Concentración</strong>:<br><br>
Todas nuestras fragancias están elaboradas con aceites puros importados de grado <em>Extrait de Parfum</em> (33% concentración pura) e integran microcápsulas de feromonas sintéticas de alta afinidad que reaccionan con el calor de tu piel, potenciando la proyección y el atractivo magnético.`
        },
        duracion: {
            keywords: ['duracion', 'duración', 'cuanto dura', 'fijacion', 'fijación', 'horas', 'longevidad', 'desvanece'],
            respuesta: `⏳ <strong>Fijación Superior Garantizada (+12 Horas)</strong>:<br><br>
Gracias a nuestra densidad de concentración al 33%, nuestras fragancias duran más de <strong>12 a 16 horas en piel</strong> y permanecen varios días en prendas de vestir. No usamos alcoholes industriales ni diluciones ligeras.`
        },
        envios: {
            keywords: ['envio', 'envios', 'envíos', 'tiempo de entrega', 'ciudades', 'despacho', 'costo envio', 'flete', 'medellin', 'bogota', 'cali'],
            respuesta: `🚚 <strong>Cobertura y Tiempos de Envío en Colombia</strong>:<br><br>
• <strong>Medellín (Urbano):</strong> Entregas en 24h hábiles ($15.000 COP).<br>
• <strong>Área Metropolitana (Bello, Itagüí, Envigado, Sabaneta, etc.):</strong> ($20.000 COP).<br>
• <strong>Nacional (Bogotá, Cali, Barranquilla y todo el país):</strong> 2 a 3 días hábiles vía Servientrega / Interrapidísimo ($22.000 COP).`
        },
        pagos: {
            keywords: ['pago', 'pagar', 'metodos de pago', 'nequi', 'pse', 'tarjeta', 'transferencia', 'bancolombia'],
            respuesta: `💳 <strong>Métodos de Pago 100% Seguros</strong>:<br><br>
• <strong>Pago Online Directo:</strong> Mercado Pago con PSE, Nequi, Tarjetas Débito y Crédito.<br>
• <strong>Pago por WhatsApp:</strong> Transferencia Bancolombia, Nequi o Daviplata coordinando con un asesor humano.`
        },
        ubicacion: {
            keywords: ['ubicacion', 'ubicación', 'donde estan', 'tienda fisica', 'direccion', 'dirección', 'local'],
            respuesta: `📍 <strong>Nuestra Sede en Medellín</strong>:<br><br>
Estamos ubicados en la <strong>Calle 77c # 91b - 74, Medellín, Antioquia</strong>. Atendemos pedidos y despachos a nivel nacional con entregas garantizadas.`
        }
    };

    // ── Cargar Productos desde Caché o API ─────────────────────────────────
    function obtenerCatalogo() {
        try {
            const cp = localStorage.getItem('ad_cached_products_v1');
            if (cp) catalogoProductos = JSON.parse(cp);
            const ck = localStorage.getItem('ad_cached_kits_v1');
            if (ck) catalogoKits = JSON.parse(ck);
        } catch (e) {
            console.warn('No se pudo leer caché local para el chatbot');
        }

        if (!catalogoProductos.length) {
            const base = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
                ? 'http://localhost:3000/api'
                : 'https://altadensidadpage-production.up.railway.app/api';
            fetch(`${base}/productos`)
                .then(r => r.json())
                .then(d => {
                    if (d.success) catalogoProductos = d.data.filter(p => p.activo !== 0);
                })
                .catch(() => {});
        }
    }

    // ── Inyectar Estructura HTML del Chatbot ───────────────────────────────
    function inyectarHTMLChatbot() {
        if (document.getElementById('adIaChatLauncher')) return;

        // Botón Lanzador Flotante
        // Usa fa-magic como fallback seguro (FA Free v5), con fa-sparkles para FA Pro/v6
        const launcher = document.createElement('div');
        launcher.id = 'adIaChatLauncher';
        launcher.className = 'ia-chat-launcher';
        launcher.setAttribute('role', 'button');
        launcher.setAttribute('aria-label', 'Abrir asesora olfativa virtual AURA');
        launcher.innerHTML = `
            <div class="ia-launcher-avatar">
                <i class="fas fa-magic"></i>
                <div class="ia-pulse-dot"></div>
            </div>
            <div class="ia-launcher-text">
                <span class="ia-launcher-title">AURA IA</span>
                <span class="ia-launcher-sub">Asesora Olfativa</span>
            </div>
        `;

        // Ventana de Chat
        const widget = document.createElement('div');
        widget.id = 'adIaChatWidget';
        widget.className = 'ia-chat-widget';
        widget.setAttribute('aria-live', 'polite');
        widget.innerHTML = `
            <div class="ia-chat-header">
                <div class="ia-header-brand">
                    <div class="ia-header-avatar">
                        <i class="fas fa-crown"></i>
                    </div>
                    <div class="ia-header-info">
                        <span class="ia-header-name">AURA <span class="ia-header-badge">IA Asesor</span></span>
                        <span class="ia-header-status"><span class="ia-status-circle"></span> Lista para recomendarte</span>
                    </div>
                </div>
                <button class="ia-chat-close-btn" id="adIaChatClose" aria-label="Cerrar chat">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="ia-chat-messages" id="adIaChatMessages">
                <!-- Los mensajes se insertan dinámicamente -->
            </div>
            <div class="ia-chat-footer">
                <form class="ia-chat-form" id="adIaChatForm">
                    <input type="text" id="adIaChatInput" class="ia-chat-input" placeholder="Pregúntame o describe tu aroma ideal..." autocomplete="off" aria-label="Escribe tu consulta">
                    <button type="submit" class="ia-chat-send-btn" aria-label="Enviar mensaje">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </form>
            </div>
        `;

        document.body.appendChild(launcher);
        document.body.appendChild(widget);

        // Event Listeners
        launcher.onclick = toggleChat;
        document.getElementById('adIaChatClose').onclick = toggleChat;
        document.getElementById('adIaChatForm').onsubmit = manejarEnvioMensaje;

        // Restaurar historial previo o mostrar saludo inicial
        if (!restaurarHistorial()) {
            mostrarSaludoInicial();
        }
    }

    // ── Abrir / Cerrar Chat ───────────────────────────────────────────────
    function toggleChat() {
        const widget = document.getElementById('adIaChatWidget');
        if (!widget) return;
        chatAbierto = !chatAbierto;
        if (chatAbierto) {
            widget.classList.add('active');
            obtenerCatalogo();
            setTimeout(() => {
                const input = document.getElementById('adIaChatInput');
                if (input && window.innerWidth > 480) input.focus();
            }, 300);
        } else {
            widget.classList.remove('active');
        }
    }

    // ── Renderizado de Mensajes ───────────────────────────────────────────
    function agregarMensaje(texto, remitente = 'bot', extras = null) {
        const contenedor = document.getElementById('adIaChatMessages');
        if (!contenedor) return;

        const msgDiv = document.createElement('div');
        msgDiv.className = `ia-msg ${remitente}`;

        const hora = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

        let contenidoHTML = `<div class="ia-bubble">${texto}</div>`;

        // Render de productos recomendados (con sanitización XSS)
        if (extras && extras.productos && extras.productos.length) {
            extras.productos.forEach(prod => {
                const img = sanitizarTexto(prodImagen(prod));
                const nombre = sanitizarTexto(prodNombre(prod));
                const precio = prodPrecio(prod).toLocaleString('es-CO');
                const categoria = sanitizarTexto(prodCategoria(prod)) || 'Alta Densidad';
                const pId = sanitizarTexto(String(prodId(prod)));
                const precioNum = prodPrecio(prod);
                contenidoHTML += `
                    <div class="ia-product-card">
                        <img src="${img}" alt="${nombre}" class="ia-prod-img" onerror="this.src='assets/img/Logo2026.png'">
                        <div class="ia-prod-details">
                            <div class="ia-prod-title">${nombre}</div>
                            <div class="ia-prod-tag">${categoria}</div>
                            <div class="ia-prod-price">$${precio} COP</div>
                        </div>
                        <div class="ia-prod-actions">
                            <button class="ia-btn-add" onclick='event.stopPropagation(); if(window.agregarAlCarrito) window.agregarAlCarrito({id: "${pId}", name: "${nombre}", image: "${img}", price: ${precioNum}});'>
                                <i class="fas fa-cart-plus"></i> Añadir
                            </button>
                        </div>
                    </div>
                `;
            });
        }

        // Render de Chips de Acción Rápida
        if (extras && extras.chips && extras.chips.length) {
            contenidoHTML += `<div class="ia-quick-chips">`;
            extras.chips.forEach(chip => {
                contenidoHTML += `<button type="button" class="ia-chip" onclick="window.adChatbotPreguntar('${chip.query}')">${chip.label}</button>`;
            });
            contenidoHTML += `</div>`;
        }

        contenidoHTML += `<span class="ia-msg-time">${hora}</span>`;
        msgDiv.innerHTML = contenidoHTML;

        contenedor.appendChild(msgDiv);
        contenedor.scrollTop = contenedor.scrollHeight;

        // Persistir conversación
        guardarHistorial();
    }

    // ── Mostrar Indicador de Escritura ────────────────────────────────────
    function mostrarTyping() {
        const contenedor = document.getElementById('adIaChatMessages');
        if (!contenedor) return;
        const typing = document.createElement('div');
        typing.id = 'iaTypingIndicator';
        typing.className = 'ia-msg bot';
        typing.innerHTML = `
            <div class="ia-typing-indicator">
                <div class="ia-typing-dot"></div>
                <div class="ia-typing-dot"></div>
                <div class="ia-typing-dot"></div>
            </div>
        `;
        contenedor.appendChild(typing);
        contenedor.scrollTop = contenedor.scrollHeight;
    }

    function removerTyping() {
        const typing = document.getElementById('iaTypingIndicator');
        if (typing) typing.remove();
    }

    // ── Mensaje Inicial ───────────────────────────────────────────────────
    function mostrarSaludoInicial() {
        const contenedor = document.getElementById('adIaChatMessages');
        if (!contenedor || contenedor.children.length > 0) return;

        agregarMensaje(
            `¡Hola! Soy <strong>AURA</strong>, tu Asesora Olfativa de <em>Fragancias de Alta Densidad</em>. ✨<br><br>
¿Buscas un perfume para ti o para regalar? Dime qué ocasión o notas te gustan, o elige una opción:`,
            'bot',
            {
                chips: [
                    { label: '👑 Perfumes de Mujer', query: 'recomendar perfumes de mujer' },
                    { label: '🪵 Perfumes de Hombre', query: 'recomendar perfumes de hombre' },
                    { label: '🌙 Perfumería Árabe', query: 'perfumes arabes' },
                    { label: '🧪 ¿Tienen Feromonas?', query: 'como funcionan las feromonas y duracion' },
                    { label: '🚚 Costos de Envío', query: 'cuanto cuesta el envio' }
                ]
            }
        );
    }

    // ── Motor Inteligente de Recomendación y Respuestas ───────────────────
    function procesarConsultaIA(query) {
        const q = query.toLowerCase().trim();
        obtenerCatalogo();

        // 1. Revisar FAQs / Base de Conocimiento
        for (const clave in KNOWLEDGE_BASE) {
            const seccion = KNOWLEDGE_BASE[clave];
            if (seccion.keywords.some(k => q.includes(k))) {
                return {
                    texto: seccion.respuesta,
                    chips: [
                        { label: '✨ Ver Perfumes de Mujer', query: 'recomendar perfumes de mujer' },
                        { label: '💼 Ver Perfumes de Hombre', query: 'recomendar perfumes de hombre' },
                        { label: '📲 Hablar con un Asesor Humano', query: 'asesor whatsapp' }
                    ]
                };
            }
        }

        // 2. Intención de Asesor Humano / WhatsApp
        if (q.includes('asesor') || q.includes('whatsapp') || q.includes('humano') || q.includes('hablar')) {
            const waUrl = "https://wa.me/3046477694?text=" + encodeURIComponent("¡Hola! Estuve hablando con AURA en la web y me gustaría asesoría personalizada con un experto.");
            return {
                texto: `Puedes comunicarte de inmediato con nuestro equipo de asesores en WhatsApp para pedidos personalizados o dudas específicas:<br><br>
<a href="${waUrl}" target="_blank" class="ia-chip" style="background:#0b8a6a; color:#fff; text-decoration:none; padding:8px 14px; font-weight:600;"><i class="fab fa-whatsapp"></i> Chatear en WhatsApp</a>`
            };
        }

        // 3. Recomendaciones por Género y Notas
        let prodsEncontrados = [];

        // Filtro Mujer
        if (q.includes('mujer') || q.includes('dama') || q.includes('femenin') || q.includes('chica') || q.includes('novia') || q.includes('esposa')) {
            prodsEncontrados = catalogoProductos.filter(p => prodGenero(p) === 'Femenino');
            if (q.includes('dulce') || q.includes('vainilla') || q.includes('caramelo')) {
                prodsEncontrados = prodsEncontrados.filter(p => (prodNombre(p) + prodDescripcion(p)).toLowerCase().match(/dulce|vainilla|yara|orientica|sweet|cloud|caramelo|good girl/));
            } else if (q.includes('noche') || q.includes('seductor') || q.includes('fiesta') || q.includes('cita')) {
                prodsEncontrados = prodsEncontrados.filter(p => (prodNombre(p) + prodDescripcion(p)).toLowerCase().match(/black|intense|scandal|libre|bomb|l'interdit|hypnotic/));
            } else if (q.includes('floral') || q.includes('elegante') || q.includes('rosa') || q.includes('jazmín') || q.includes('jazmin')) {
                prodsEncontrados = prodsEncontrados.filter(p => (prodNombre(p) + prodDescripcion(p)).toLowerCase().match(/floral|rosa|jazmín|jazmin|bloom|garden|miss|coco|chance/));
            }
            const seleccion = (prodsEncontrados.length ? prodsEncontrados : catalogoProductos.filter(p => prodGenero(p) === 'Femenino')).slice(0, 3);
            return {
                texto: `👑 <strong>Selección Exclusiva para Dama:</strong><br>
Fragancias de fijación extrema, proyección seductora y acordes irresistibles:`,
                productos: seleccion,
                chips: [
                    { label: '🍭 Opciones Más Dulces', query: 'perfumes mujer dulces con vainilla' },
                    { label: '🌹 Florales & Elegantes', query: 'perfumes mujer elegantes florales' },
                    { label: '🎁 Ver Kits de Regalo', query: 'kits especiales' }
                ]
            };
        }

        // Filtro Hombre
        if (q.includes('hombre') || q.includes('caballero') || q.includes('masculin') || q.includes('chico') || q.includes('novio') || q.includes('esposo')) {
            prodsEncontrados = catalogoProductos.filter(p => prodGenero(p) === 'Masculino');
            if (q.includes('amaderad') || q.includes('cuero') || q.includes('tabaco') || q.includes('noche')) {
                prodsEncontrados = prodsEncontrados.filter(p => (prodNombre(p) + prodDescripcion(p)).toLowerCase().match(/club de nuit|sauvage|oud|creed|aventus|tom ford|stronger|one million/));
            } else if (q.includes('fresco') || q.includes('citrico') || q.includes('oficina') || q.includes('diario')) {
                prodsEncontrados = prodsEncontrados.filter(p => (prodNombre(p) + prodDescripcion(p)).toLowerCase().match(/acqua|versace|eros|bleu|invictus|lacoste|light blue/));
            }
            const seleccion = (prodsEncontrados.length ? prodsEncontrados : catalogoProductos.filter(p => prodGenero(p) === 'Masculino')).slice(0, 3);
            return {
                texto: `🪵 <strong>Selección Imponente para Caballero:</strong><br>
Perfumes con presencia magnética, notas amaderadas/cítricas y fijación de más de 12 horas:`,
                productos: seleccion,
                chips: [
                    { label: '🔥 Seductores de Noche', query: 'perfumes hombre noche seductor' },
                    { label: '❄️ Frescos para el Día', query: 'perfumes hombre frescos oficina' },
                    { label: '🌙 Ver Árabes de Hombre', query: 'perfumes arabes hombre' }
                ]
            };
        }

        // Filtro Árabes
        if (q.includes('arabe') || q.includes('árabe') || q.includes('lattafa') || q.includes('armaf') || q.includes('orientica') || q.includes('afnan') || q.includes('oud')) {
            prodsEncontrados = catalogoProductos.filter(p => prodCategoria(p) === 'Arabe' || prodNombre(p).toLowerCase().match(/lattafa|armaf|orientica|afnan|yara|khamrah|oud/)).slice(0, 3);
            return {
                texto: `🌙 <strong>Colección de Perfumería Árabe Premium:</strong><br>
Proyección arrolladora, notas de ámbar, vainilla, maderas preciosas y especias orientales:`,
                productos: prodsEncontrados.length ? prodsEncontrados : catalogoProductos.slice(0, 3),
                chips: [
                    { label: '👑 Árabes Femeninos', query: 'recomendar arabes de mujer' },
                    { label: '🪵 Árabes Masculinos', query: 'recomendar arabes de hombre' }
                ]
            };
        }

        // Filtro Kits
        if (q.includes('kit') || q.includes('regalo') || q.includes('combos') || q.includes('coleccion')) {
            return {
                texto: `🎁 <strong>Kits Especiales Alta Densidad:</strong><br>
El regalo perfecto: combinaciones de fragancias de lujo + envase premium a un precio exclusivo:`,
                productos: (catalogoKits.length ? catalogoKits : catalogoProductos).slice(0, 3),
                chips: [
                    { label: '👑 Fragancias de Dama', query: 'recomendar perfumes de mujer' },
                    { label: '🪵 Fragancias de Caballero', query: 'recomendar perfumes de hombre' }
                ]
            };
        }

        // Búsqueda por Nombre / Marca específica (normalizada)
        const matches = catalogoProductos.filter(p =>
            prodNombre(p).toLowerCase().includes(q) ||
            prodDescripcion(p).toLowerCase().includes(q) ||
            prodCategoria(p).toLowerCase().includes(q)
        ).slice(0, 3);
        if (matches.length) {
            return {
                texto: `Encontré estas fragancias que coinciden perfectamente con tu búsqueda:`,
                productos: matches,
                chips: [
                    { label: '✨ Ver Más Opciones', query: 'recomendar perfumes' },
                    { label: '💬 Preguntar en WhatsApp', query: 'asesor whatsapp' }
                ]
            };
        }

        // Respuesta por defecto con guía amigable
        return {
            texto: `Puedo ayudarte a encontrar tu fragancia ideal con concentración al 33% y feromonas. ¿Te gustaría ver opciones para <strong>Dama</strong>, <strong>Caballero</strong> o nuestra colección <strong>Árabe</strong>?`,
            chips: [
                { label: '👑 Perfumes de Mujer', query: 'recomendar perfumes de mujer' },
                { label: '🪵 Perfumes de Hombre', query: 'recomendar perfumes de hombre' },
                { label: '🌙 Perfumes Árabes', query: 'perfumes arabes' },
                { label: '🧪 Duración y Feromonas', query: 'duracion y fijacion' }
            ]
        };
    }

    // ── Conexión con el Modelo IA en Vivo (Cloudflare Tunnel) ────────────
    const AI_API_URL = 'https://referrals-decorating-intellectual-earthquake.trycloudflare.com/chat';
    const AI_API_KEY = 'pk-lemw0fTHeR_zIRhw0Jng-hl3tpTBovzZhjB1ghUahR8';
    const SESSION_ID_KEY = 'ad_ai_session_id';

    function obtenerSessionId() {
        let sid = sessionStorage.getItem(SESSION_ID_KEY);
        if (!sid) {
            sid = 'user_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
            sessionStorage.setItem(SESSION_ID_KEY, sid);
        }
        return sid;
    }

    function formatearMarkdown(texto) {
        if (!texto) return '';
        let html = sanitizarTexto(texto);
        // Negrita: **texto**
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Cursiva: *texto*
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        // Listas tipo viñeta: - item o * item
        html = html.replace(/(?:^|<br>)[-*]\s+(.*?)(?=(?:<br>|$))/g, '<br>• $1');
        // Saltos de línea
        html = html.replace(/\n/g, '<br>');
        return html;
    }

    function extraerProductosMencionados(texto) {
        if (!catalogoProductos || !catalogoProductos.length || !texto) return [];
        const t = texto.toLowerCase();
        const matches = catalogoProductos.filter(p => {
            const nombre = prodNombre(p).toLowerCase().trim();
            if (nombre.length < 4) return false;
            if (t.includes(nombre)) return true;
            const palabras = nombre.split(/\s+/).filter(w => w.length > 3);
            if (palabras.length >= 2) {
                return palabras.every(w => t.includes(w));
            }
            return false;
        });
        return matches.slice(0, 3);
    }

    async function consultarAI(texto) {
        const sessionId = obtenerSessionId();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000);

        try {
            const resp = await fetch(AI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${AI_API_KEY}`
                },
                body: JSON.stringify({
                    message: texto,
                    session_id: sessionId
                }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const data = await resp.json();
            if (data && data.response) {
                const prodsMencionados = extraerProductosMencionados(data.response);
                return {
                    texto: formatearMarkdown(data.response),
                    productos: prodsMencionados,
                    chips: [
                        { label: '👑 Ver Perfumes Dama', query: 'perfumes de mujer' },
                        { label: '🪵 Ver Perfumes Hombre', query: 'perfumes de hombre' },
                        { label: '💬 Asesor Humano en WhatsApp', query: 'asesor whatsapp' }
                    ]
                };
            }
            throw new Error('Respuesta vacía o formato desconocido');
        } catch (err) {
            clearTimeout(timeoutId);
            console.warn('Asistente IA externo no disponible, usando base de conocimiento local:', err.message);
            // Fallback elegante a las reglas locales del catálogo
            return procesarConsultaIA(texto);
        }
    }

    // ── Enviar Mensaje ────────────────────────────────────────────────────
    async function manejarEnvioMensaje(e) {
        if (e) e.preventDefault();
        const input = document.getElementById('adIaChatInput');
        if (!input) return;
        const texto = input.value.trim();
        if (!texto) return;

        // Mostrar mensaje del usuario (sanitizado)
        agregarMensaje(sanitizarTexto(texto), 'user');
        input.value = '';

        // Indicador de escritura mientras el modelo procesa la respuesta
        mostrarTyping();
        try {
            const respuesta = await consultarAI(texto);
            removerTyping();
            agregarMensaje(respuesta.texto, 'bot', respuesta);
        } catch (err) {
            removerTyping();
            const fallback = procesarConsultaIA(texto);
            agregarMensaje(fallback.texto, 'bot', fallback);
        }
    }

    // ── Exponer Función Global para Chips ─────────────────────────────────
    window.adChatbotPreguntar = function (query) {
        const input = document.getElementById('adIaChatInput');
        if (input) {
            input.value = query;
            manejarEnvioMensaje();
        }
    };

    // ── Inicializar al cargar el DOM ──────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inyectarHTMLChatbot);
    } else {
        inyectarHTMLChatbot();
    }

})();
