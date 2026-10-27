// ============================================================
// Vigía de tendencias del mercado de perfumería
// ------------------------------------------------------------
// Herramientas (sin claves ni servicios pagos):
//   1) Búsquedas en Google Colombia: el autocompletado de «perfume a…», «perfume hombre…», etc.
//      dice qué escribe la gente HOY en Colombia, en orden.
//   2) Google Noticias (es-419, Colombia): titulares de lanzamientos, virales y notas de moda.
//   3) Comunidad: lo más votado de la semana en Reddit (fragancias, clones y perfumería femenina).
// Con eso se puntúa cada perfume del catálogo (por su nombre original, su marca y sus notas), se
// detecta lo que buscan y no tenemos, las notas en alza, los agotados con demanda y un Top 10
// sugerido para la web. AURA (si está en línea y tiene /analista) redacta el resumen; si no,
// se arma uno con reglas. Corre solo cada día a las 06:00 (Colombia) y a pedido desde el panel.
// Todo es interno: el panel puede mostrar los originales; nada de esto se publica tal cual.
// ============================================================

const UA = 'Mozilla/5.0 (compatible; AltaDensidadVigia/1.0; +https://altadensidad.com)';
const TIMEOUT_MS = 12000;
const PAUSA_MS = 250;
const HORA_DIARIA = 6; // 06:00 hora de Colombia
const CANDADO = 'alta_densidad_vigia_tendencias';

const LETRAS = 'abcdefghijklmnopqrstuvwxyz'.split('');
const CONSULTAS_BUSQUEDA = [
    ...LETRAS.map((l) => `perfume ${l}`),
    'perfume hombre ', 'perfume mujer ', 'perfume arabe ', 'perfumes arabes ', 'perfume dulce ',
    'perfume mas vendido ', 'perfume tendencia ', 'perfume con olor a ', 'perfume para hombre que ',
    'perfume para mujer que ', 'perfume para regalar ', 'perfume clon '
];
const CONSULTAS_NOTICIAS = ['perfumes tendencia', 'perfume viral', 'perfumes más vendidos', 'perfume árabe', 'lanzamiento perfume', 'fragancia de moda'];
const SUBREDDITS = ['fragrance', 'Colognes', 'FemFragLab', 'fragranceclones'];

// Palabras que no son un perfume: se ignoran al buscar «lo que buscan y no tenemos»
const VACIAS = new Set(('perfume perfumes para de del la el los las que con y en a un una mas más hombre hombres mujer mujeres dama damas ' +
    'caballero arabe arabes árabe original originales precio precios barato baratos dulce dulces olor huele tendencia ' +
    'vendido vendidos mejor mejores colombia bogota medellin cali barranquilla mercado libre falabella exito éxito ' +
    'regalar regalo clon clones bueno buenos duradero duraderos fresco frescos economico economicos nuevo nuevos ' +
    'amazon temu shein tienda cerca mi ml 100 50 30 edp edt parfum eau toilette intense intenso kit').split(' '));
// Nombres de perfume demasiado comunes: solo cuentan si la marca aparece en el mismo texto
const GENERICOS = new Set(['her', 'cloud', 'one', 'the one', 'boss', 'polo', 'gold', 'black', 'blue', 'rose', 'red', 'oud', 'bleu',
    'light blue', 'si', 'idole', 'man', 'men', 'woman', 'intense', 'noir', 'white', 'sport', 'fresh', 'elixir', 'club', 'icon']);
// Notas y estilos que aparecen en titulares aunque no estén en el catálogo
// Palabras sueltas del catálogo de notas que no dicen nada solas («pimienta negra» → «negra»)
const NOTAS_VACIAS = new Set(['negra', 'negro', 'blanca', 'blanco', 'roja', 'rojo', 'flores', 'flor', 'notas', 'hojas', 'madera', 'maderas', 'frutas', 'mandarin']);
const ESTILOS = ['gourmand', 'solar', 'acuatico', 'almizclado', 'atalcado', 'ambarado', 'amaderado', 'floral', 'frutal', 'citrico', 'especiado', 'oriental', 'fougere', 'chipre', 'verde', 'cuero'];

const pausa = (ms) => new Promise((r) => setTimeout(r, ms));
const normalizar = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ').trim();
const compacto = (t) => normalizar(t).replace(/ /g, '');
const contienePalabra = (texto, frase) => frase && (` ${texto} `).includes(` ${frase} `);
const decodificar = (t) => String(t || '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, c) => String.fromCharCode(Number(c))).trim();

async function traer(url, { json = false } = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
        const r = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'es-CO,es;q=0.9' }, signal: controller.signal });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return json ? r.json() : r.text();
    } finally {
        clearTimeout(timer);
    }
}

// ---------- Herramientas: cada una devuelve { estado, items } y nunca lanza ----------

/** Autocompletado de Google Colombia: [{ texto, consulta, puesto }] */
async function herramientaBusquedas(traerFn = traer) {
    const items = [];
    let fallos = 0;
    for (const q of CONSULTAS_BUSQUEDA) {
        try {
            const url = `https://suggestqueries.google.com/complete/search?client=firefox&hl=es&gl=co&ie=utf-8&oe=utf-8&q=${encodeURIComponent(q)}`;
            const d = await traerFn(url, { json: true });
            (Array.isArray(d?.[1]) ? d[1] : []).slice(0, 10).forEach((texto, i) => items.push({ texto: String(texto), consulta: q.trim(), puesto: i + 1 }));
        } catch {
            fallos += 1;
        }
        await pausa(PAUSA_MS);
    }
    return { estado: fallos === CONSULTAS_BUSQUEDA.length ? 'sin respuesta' : fallos ? `${fallos} consultas fallaron` : 'ok', items };
}

function leerRss(xml) {
    const items = [];
    for (const m of String(xml).matchAll(/<item>([\s\S]*?)<\/item>/g)) {
        const bloque = m[1];
        const campo = (t) => decodificar((bloque.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`)) || [])[1]);
        const fuente = campo('source');
        let titulo = campo('title');
        if (fuente && titulo.endsWith(` - ${fuente}`)) titulo = titulo.slice(0, -(fuente.length + 3));
        items.push({ titulo, url: campo('link'), fecha: campo('pubDate'), fuente });
    }
    return items;
}

function leerAtom(xml) {
    const items = [];
    for (const m of String(xml).matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
        const b = m[1];
        items.push({
            titulo: decodificar((b.match(/<title>([\s\S]*?)<\/title>/) || [])[1]),
            url: (b.match(/<link href="([^"]+)"/) || [])[1] || '',
            fecha: decodificar((b.match(/<updated>([\s\S]*?)<\/updated>/) || [])[1])
        });
    }
    return items;
}

/** Google Noticias en español para Colombia, últimos 21 días: [{ titulo, url, fecha, fuente, dias }] */
async function herramientaNoticias(traerFn = traer, ahora = Date.now()) {
    const vistos = new Map();
    let fallos = 0;
    for (const q of CONSULTAS_NOTICIAS) {
        try {
            const xml = await traerFn(`https://news.google.com/rss/search?q=${encodeURIComponent(q + ' when:21d')}&hl=es-419&gl=CO&ceid=CO:es-419`);
            for (const it of leerRss(xml)) {
                const t = Date.parse(it.fecha);
                const dias = Number.isFinite(t) ? Math.max(0, (ahora - t) / 86400000) : 30;
                const clave = normalizar(it.titulo);
                if (dias <= 21 && clave && !vistos.has(clave)) vistos.set(clave, { ...it, dias: Math.round(dias * 10) / 10 });
            }
        } catch {
            fallos += 1;
        }
        await pausa(PAUSA_MS);
    }
    return { estado: fallos === CONSULTAS_NOTICIAS.length ? 'sin respuesta' : fallos ? `${fallos} consultas fallaron` : 'ok', items: [...vistos.values()] };
}

/** Lo más votado de la semana en comunidades de perfumería: [{ titulo, url, comunidad }] */
async function herramientaComunidad(traerFn = traer) {
    const items = [];
    let fallos = 0;
    for (const sub of SUBREDDITS) {
        try {
            const xml = await traerFn(`https://www.reddit.com/r/${sub}/top/.rss?t=week&limit=40`);
            leerAtom(xml).forEach((it) => items.push({ ...it, comunidad: `r/${sub}` }));
        } catch {
            fallos += 1;
        }
        await pausa(2000); // Reddit limita las lecturas seguidas
    }
    return { estado: fallos === SUBREDDITS.length ? 'sin respuesta' : fallos ? `${fallos} comunidades fallaron` : 'ok', items };
}

// ---------- Catálogo ----------

async function leerCatalogo(pool) {
    const [prods] = await pool.query(`
        SELECT p.id, p.nombre, p.nombre_original AS original, p.genero, p.activo,
               COALESCE(p.agotado, 0) AS agotado, COALESCE(p.vender_sin_stock, 0) AS sinStock,
               COALESCE(p.solo_preparado, 0) AS soloPreparado, m.nombre AS marca
        FROM Productos p LEFT JOIN marcas m ON m.id = p.marca_id
        WHERE p.activo = 1`);
    const [notas] = await pool.query(`SELECT pn.producto_id AS id, n.nombre FROM producto_notas pn JOIN notas n ON n.id = pn.nota_id`);
    const porProducto = new Map();
    for (const n of notas) {
        if (!porProducto.has(n.id)) porProducto.set(n.id, []);
        porProducto.get(n.id).push(n.nombre);
    }
    // agotado = sin existencias; vendible = la tienda lo vende (con existencias o «vender sin existencias»)
    return prods.map((p) => ({
        ...p, agotado: Number(p.agotado) === 1, vendible: Number(p.agotado) !== 1 || Number(p.sinStock) === 1,
        soloPreparado: Number(p.soloPreparado) === 1, notas: porProducto.get(p.id) || []
    }));
}

// Patrones con los que se reconoce un perfume en un texto
function patronesDe(p) {
    const marca = normalizar(p.marca);
    const nombres = new Set();
    for (const crudo of [p.nombre, p.original]) {
        let n = normalizar(crudo);
        if (!n) continue;
        // «Lacoste blanca» → también «blanca» (la marca se exige aparte)
        if (marca && n.startsWith(marca + ' ')) n = n.slice(marca.length + 1);
        if (n) nombres.add(n);
    }
    return [...nombres].map((n) => ({
        nombre: n,
        compacto: n.replace(/ /g, ''),
        exigeMarca: GENERICOS.has(n) || n.replace(/ /g, '').length < 4,
        conDigitos: /\d/.test(n)
    }));
}

function aparece(textoNorm, textoComp, patron, marca) {
    const hay = contienePalabra(textoNorm, patron.nombre) || (patron.conDigitos && textoComp.includes(patron.compacto));
    if (!hay) return false;
    return !patron.exigeMarca || (marca && contienePalabra(textoNorm, marca));
}

function generoDelTexto(t) {
    if (/\b(hombre|hombres|caballero|men|masculino|cologne|colognes)\b/.test(t)) return 'Masculino';
    if (/\b(mujer|mujeres|dama|damas|women|femenino|femfraglab)\b/.test(t)) return 'Femenino';
    return null;
}

// ---------- Puntaje ----------

/**
 * Cruza las señales con el catálogo. Función pura (se prueba sin red).
 * senales = { busquedas: [...], noticias: [...], comunidad: [...] }
 * anterior = datos del informe previo (para la flecha de subida/bajada)
 */
function puntuar(catalogo, senales, { anterior = null, top10Actual = [] } = {}) {
    const marcas = new Map(); // marca normalizada → { nombre, puntos, textos }
    for (const p of catalogo) if (p.marca) marcas.set(normalizar(p.marca), { nombre: p.marca, puntos: 0, textos: [] });
    // nota normalizada → cómo se muestra (con tildes)
    const visible = new Map(ESTILOS.map((e) => [e, e]));
    for (const p of catalogo) for (const n of p.notas) if (!visible.has(normalizar(n))) visible.set(normalizar(n), String(n).toLowerCase());
    const vocabulario = new Set([...visible.keys()].filter((n) => n.length >= 4 && !NOTAS_VACIAS.has(n)));
    const notasEnAlza = new Map();
    const est = new Map(catalogo.map((p) => [p.id, { bruto: 0, motivos: [], fuentes: new Set() }]));
    const patrones = new Map(catalogo.map((p) => [p.id, patronesDe(p)]));

    // Una búsqueda que sale en varias consultas cuenta una vez, con su mejor puesto
    const busquedas = new Map();
    for (const b of senales.busquedas || []) {
        const clave = normalizar(b.texto);
        if (clave && (!busquedas.has(clave) || busquedas.get(clave).puesto > b.puesto)) busquedas.set(clave, b);
    }

    const textos = [
        ...[...busquedas.values()].map((b) => ({ texto: b.texto, peso: 3 * (11 - b.puesto) / 10, tipo: 'busqueda', ref: b })),
        ...(senales.noticias || []).map((n) => ({ texto: n.titulo, peso: 2 * Math.max(0.3, 1 - (n.dias || 0) / 30), tipo: 'noticia', ref: n })),
        ...(senales.comunidad || []).map((c) => ({ texto: c.titulo, peso: 1, tipo: 'comunidad', ref: c }))
    ];

    const sinCatalogo = new Map();
    for (const t of textos) {
        const norm = normalizar(t.texto);
        const comp = norm.replace(/ /g, '');
        const genero = generoDelTexto(`${norm} ${normalizar(t.ref.comunidad || '')}`);
        let tocoProducto = false;
        let tocoMarca = false;
        for (const p of catalogo) {
            const marca = normalizar(p.marca);
            if (!patrones.get(p.id).some((pt) => aparece(norm, comp, pt, marca))) continue;
            tocoProducto = true;
            const e = est.get(p.id);
            e.bruto += t.peso;
            e.fuentes.add(t.tipo);
            if (e.motivos.length < 4) {
                e.motivos.push(t.tipo === 'busqueda' ? `Buscado en Google Colombia: «${t.ref.texto}» (#${t.ref.puesto})`
                    : t.tipo === 'noticia' ? `En noticias: «${t.ref.titulo}» (${t.ref.fuente || 'prensa'})`
                        : `Comunidad ${t.ref.comunidad}: «${t.ref.titulo.slice(0, 90)}»`);
            }
        }
        for (const [clave, m] of marcas) {
            if (clave.length >= 3 && contienePalabra(norm, clave)) {
                tocoMarca = true;
                m.puntos += t.peso;
                if (m.textos.length < 3) m.textos.push({ texto: t.texto, genero });
            }
        }
        for (const v of vocabulario) {
            if (contienePalabra(norm, v)) notasEnAlza.set(v, (notasEnAlza.get(v) || 0) + t.peso);
        }
        // Lo que buscan y no tenemos: búsquedas «perfume X» sin perfume ni marca nuestra
        if (t.tipo === 'busqueda' && !tocoProducto && !tocoMarca) {
            const resto = norm.split(' ').filter((w) => !VACIAS.has(w) && !vocabulario.has(w) && w.length > 1);
            if (resto.length) {
                const clave = resto.join(' ');
                if (!sinCatalogo.has(clave)) sinCatalogo.set(clave, { busqueda: t.ref.texto, puesto: t.ref.puesto, peso: t.peso });
            }
        }
    }

    // La marca en alza arrastra a sus perfumes (menos que una mención directa) y las notas en alza también
    const notasTop = [...notasEnAlza.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
    const pesoNota = new Map(notasTop);
    for (const p of catalogo) {
        const e = est.get(p.id);
        const m = marcas.get(normalizar(p.marca));
        if (m && m.puntos > 0) {
            const delGenero = m.textos.some((t) => !t.genero || t.genero === p.genero || p.genero === 'Unisex');
            if (delGenero) {
                e.bruto += m.puntos * 0.15;
                if (e.motivos.length < 4 && !e.fuentes.has('busqueda')) e.motivos.push(`La marca ${m.nombre} está sonando: «${m.textos[0].texto}»`);
            }
        }
        const coinciden = [...new Set(p.notas.map(normalizar))].filter((n) => pesoNota.has(n));
        if (coinciden.length) {
            e.bruto += Math.min(3, coinciden.reduce((s, n) => s + pesoNota.get(n), 0) * 0.2);
            if (e.motivos.length < 4) e.motivos.push(`Notas en alza: ${coinciden.slice(0, 3).map((n) => visible.get(n) || n).join(', ')}`);
        }
    }

    const maximo = Math.max(0, ...[...est.values()].map((e) => e.bruto));
    const previo = new Map((anterior?.productos || []).map((x) => [x.id, x.puntaje]));
    const productos = catalogo.map((p) => {
        const e = est.get(p.id);
        const puntaje = maximo > 0 ? Math.round((100 * e.bruto) / maximo) : 0;
        return {
            id: p.id, puntaje, cambio: previo.has(p.id) ? puntaje - previo.get(p.id) : null,
            directo: e.fuentes.size > 0, fuentes: [...e.fuentes], motivos: e.motivos,
            agotado: p.agotado, vendible: p.vendible !== false, soloPreparado: p.soloPreparado, genero: p.genero, marca: p.marca
        };
    }).filter((x) => x.puntaje > 0).sort((a, b) => b.puntaje - a.puntaje);

    return {
        productos,
        top10: sugerirTop10(productos, catalogo, top10Actual),
        agotadosConDemanda: productos.filter((x) => x.agotado && x.directo).slice(0, 10).map((x) => x.id),
        notas: notasTop.slice(0, 10).map(([nota, peso]) => ({ nota: visible.get(nota) || nota, peso: Math.round(peso * 10) / 10 })),
        marcas: [...marcas.values()].filter((m) => m.puntos > 0).sort((a, b) => b.puntos - a.puntos).slice(0, 10)
            .map((m) => ({ marca: m.nombre, peso: Math.round(m.puntos * 10) / 10 })),
        sinCatalogo: [...sinCatalogo.values()].sort((a, b) => b.peso - a.peso).slice(0, 15),
        busquedasTop: [...busquedas.values()].filter((b) => b.puesto <= 3).slice(0, 40).map((b) => b.texto),
        noticias: (senales.noticias || []).sort((a, b) => a.dias - b.dias).slice(0, 15)
            .map(({ titulo, url, fuente, dias }) => ({ titulo, url, fuente, dias }))
    };
}

// Top 10 de la web: lo que más suena y se puede vender hoy, con variedad (máx. 2 por marca,
// al menos 3 de hombre y 3 de mujer). Si no alcanza, completa con el Top 10 actual.
function sugerirTop10(productos, catalogo, top10Actual) {
    const porId = new Map(catalogo.map((p) => [p.id, p]));
    const vendibles = productos.filter((x) => x.vendible && !x.soloPreparado);
    const elegidos = [];
    const porMarca = new Map();
    const cuenta = { Masculino: 0, Femenino: 0 };
    const cabe = (x) => (porMarca.get(x.marca || x.id) || 0) < 2;
    const tomar = (x) => {
        elegidos.push(x.id);
        porMarca.set(x.marca || x.id, (porMarca.get(x.marca || x.id) || 0) + 1);
        if (cuenta[x.genero] !== undefined) cuenta[x.genero] += 1;
    };
    for (const x of vendibles) {
        if (elegidos.length >= 10) break;
        if (!cabe(x)) continue;
        const faltanM = Math.max(0, 3 - cuenta.Masculino);
        const faltanF = Math.max(0, 3 - cuenta.Femenino);
        const libres = 10 - elegidos.length;
        // Reserva cupos para el género que falta
        if (libres <= faltanM + faltanF && !((x.genero === 'Masculino' && faltanM) || (x.genero === 'Femenino' && faltanF) || x.genero === 'Unisex')) continue;
        tomar(x);
    }
    for (const id of top10Actual) {
        if (elegidos.length >= 10) break;
        const p = porId.get(id);
        if (p && p.vendible !== false && !p.soloPreparado && !elegidos.includes(id)) elegidos.push(id);
    }
    for (const x of vendibles) {
        if (elegidos.length >= 10) break;
        if (!elegidos.includes(x.id)) elegidos.push(x.id);
    }
    return elegidos;
}

// ---------- Resumen ----------

function resumenConReglas(datos, catalogo) {
    const porId = new Map(catalogo.map((p) => [p.id, p]));
    const nombre = (id) => porId.get(id)?.original || porId.get(id)?.nombre || `#${id}`;
    const lineas = [];
    const top = datos.productos.filter((x) => x.directo).slice(0, 5);
    if (top.length) lineas.push(`Lo que más suena de tu catálogo: ${top.map((x) => nombre(x.id)).join(', ')}.`);
    const suben = datos.productos.filter((x) => x.cambio !== null && x.cambio >= 15).slice(0, 3);
    if (suben.length) lineas.push(`Subiendo frente al informe anterior: ${suben.map((x) => `${nombre(x.id)} (+${x.cambio})`).join(', ')}.`);
    if (datos.notas.length) lineas.push(`Notas y estilos en alza: ${datos.notas.slice(0, 5).map((n) => n.nota).join(', ')}.`);
    if (datos.agotadosConDemanda.length) lineas.push(`Tienen demanda y no hay existencias (reponer): ${datos.agotadosConDemanda.slice(0, 5).map(nombre).join(', ')}.`);
    if (datos.sinCatalogo.length) lineas.push(`Buscan y no lo tienes: ${datos.sinCatalogo.slice(0, 4).map((s) => `«${s.busqueda}»`).join(', ')}.`);
    const hoy = datos.productos.filter((x) => x.vendible && !x.soloPreparado).slice(0, 3);
    if (hoy.length) lineas.push(`Para Marketplace hoy: empieza por ${hoy.map((x) => nombre(x.id)).join(', ')}.`);
    return lineas.join('\n') || 'No hubo señales suficientes hoy: las fuentes no respondieron o no mencionaron perfumes del catálogo.';
}

// AURA redacta el resumen si está en línea y tiene el endpoint /analista (AltaDensidadAI/model/api.py)
async function resumenConAura(datos, catalogo, obtenerConfig) {
    if (!obtenerConfig) return null;
    let cfg;
    try { cfg = await obtenerConfig(); } catch { return null; }
    if (!cfg?.activo || !cfg.url || cfg.modo !== 'nativo') return null;
    const porId = new Map(catalogo.map((p) => [p.id, p]));
    const senales = {
        perfumes: datos.productos.slice(0, 12).map((x) => ({
            original: porId.get(x.id)?.original || porId.get(x.id)?.nombre, marca: x.marca, puntaje: x.puntaje,
            cambio: x.cambio, agotado: x.agotado, vendible: x.vendible && !x.soloPreparado, motivos: x.motivos.slice(0, 2)
        })),
        notas: datos.notas.slice(0, 6).map((n) => n.nota),
        sin_catalogo: datos.sinCatalogo.slice(0, 5).map((s) => s.busqueda),
        agotados_con_demanda: datos.agotadosConDemanda.slice(0, 5).map((id) => porId.get(id)?.original || porId.get(id)?.nombre),
        noticias: datos.noticias.slice(0, 5).map((n) => n.titulo)
    };
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 90000);
    try {
        const headers = { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': '1' };
        if (cfg.apiKey) headers.Authorization = `Bearer ${cfg.apiKey}`;
        const r = await fetch(`${cfg.url}/analista`, { method: 'POST', headers, body: JSON.stringify({ senales }), signal: controller.signal });
        if (!r.ok) return null;
        const d = await r.json();
        return d?.resumen && d.origen === 'modelo' ? String(d.resumen).slice(0, 3000) : null;
    } catch {
        return null;
    } finally {
        clearTimeout(timer);
    }
}

// ---------- Informe ----------

let enCurso = null;

/** Investiga, puntúa y guarda un informe. Devuelve { id, generadoEn, ... } o el que ya está en curso. */
function generarInforme(pool, { origen = 'manual', obtenerConfig = null, herramientas = {} } = {}) {
    if (enCurso) return enCurso;
    enCurso = (async () => {
        const conn = await pool.getConnection();
        try {
            const [[lock]] = await conn.query('SELECT GET_LOCK(?, 0) AS ok', [CANDADO]);
            if (!lock.ok) throw Object.assign(new Error('Ya hay una investigación en curso'), { status: 409 });
            try {
                const inicio = Date.now();
                const [busquedas, noticias, comunidad] = await Promise.all([
                    (herramientas.busquedas || herramientaBusquedas)(),
                    (herramientas.noticias || herramientaNoticias)(),
                    (herramientas.comunidad || herramientaComunidad)()
                ]);
                const catalogo = await leerCatalogo(pool);
                const [previos] = await pool.query('SELECT datos FROM TendenciasInformes ORDER BY id DESC LIMIT 1');
                let anterior = null;
                try { anterior = previos.length ? JSON.parse(previos[0].datos) : null; } catch { /* informe dañado */ }
                const [top] = await pool.query('SELECT producto_id FROM Top10 ORDER BY posicion');
                const datos = puntuar(catalogo, { busquedas: busquedas.items, noticias: noticias.items, comunidad: comunidad.items },
                    { anterior, top10Actual: top.map((t) => t.producto_id) });
                datos.fuentes = {
                    busquedas: { estado: busquedas.estado, total: busquedas.items.length },
                    noticias: { estado: noticias.estado, total: noticias.items.length },
                    comunidad: { estado: comunidad.estado, total: comunidad.items.length }
                };
                datos.segundos = Math.round((Date.now() - inicio) / 1000);
                let resumen = await resumenConAura(datos, catalogo, obtenerConfig);
                const resumenOrigen = resumen ? 'aura' : 'reglas';
                if (!resumen) resumen = resumenConReglas(datos, catalogo);
                const [r] = await pool.query('INSERT INTO TendenciasInformes (origen, datos, resumen, resumen_origen) VALUES (?, ?, ?, ?)',
                    [origen, JSON.stringify(datos), resumen, resumenOrigen]);
                // Se guardan los últimos 120 informes (unos 4 meses)
                await pool.query('DELETE FROM TendenciasInformes WHERE id <= ?', [r.insertId - 120]);
                console.log(`[vigia] Informe ${r.insertId} (${origen}): ${datos.productos.length} perfumes con señal, ${datos.segundos} s, resumen por ${resumenOrigen}`);
                return { id: r.insertId };
            } finally {
                await conn.query('SELECT RELEASE_LOCK(?)', [CANDADO]);
            }
        } finally {
            conn.release();
        }
    })().finally(() => { enCurso = null; });
    return enCurso;
}

// ---------- Programación diaria ----------

function msHastaProxima(hora, ahora = new Date()) {
    // Colombia es UTC-5 todo el año (sin horario de verano)
    const col = new Date(ahora.getTime() - 5 * 3600000);
    const objetivo = Date.UTC(col.getUTCFullYear(), col.getUTCMonth(), col.getUTCDate(), hora) + 5 * 3600000;
    const ms = objetivo - ahora.getTime();
    return ms > 0 ? ms : ms + 86400000;
}

let temporizador = null;

/** Arranca la vigía diaria; si el último informe tiene más de 26 h, investiga a los 2 minutos del arranque. */
async function iniciar(pool, { obtenerConfig } = {}) {
    if (temporizador || process.env.VIGIA_TENDENCIAS === 'off') return;
    const correr = (origen) => generarInforme(pool, { origen, obtenerConfig })
        .catch((e) => console.error('[vigia] No se pudo generar el informe:', e.message));
    const programar = () => {
        temporizador = setTimeout(async () => { await correr('automatico'); programar(); }, msHastaProxima(HORA_DIARIA));
        temporizador.unref?.();
    };
    programar();
    try {
        const [r] = await pool.query('SELECT MAX(generado_en) AS ultimo FROM TendenciasInformes');
        const ultimo = r[0]?.ultimo ? new Date(r[0].ultimo).getTime() : 0;
        if (Date.now() - ultimo > 26 * 3600000) setTimeout(() => correr('automatico'), 2 * 60000).unref?.();
    } catch (e) {
        console.error('[vigia] No se pudo leer el último informe:', e.message);
    }
}

module.exports = {
    generarInforme, iniciar, puntuar, sugerirTop10, resumenConReglas, leerRss, leerAtom, msHastaProxima,
    herramientaBusquedas, herramientaNoticias, herramientaComunidad, normalizar, compacto
};
