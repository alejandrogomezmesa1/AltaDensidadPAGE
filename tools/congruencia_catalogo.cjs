// ============================================================
// Congruencia del catálogo web ⇄ DATA (una sola vez, idempotente)
// ------------------------------------------------------------
// Uso (desde la raíz del repo):
//   WEB_DB_URL=mysql://… DATA_DB_URL=mysql://… node tools/congruencia_catalogo.cjs            → simulación
//   WEB_DB_URL=mysql://… DATA_DB_URL=mysql://… node tools/congruencia_catalogo.cjs --aplicar  → aplica
//   --sin-dudosas  no enlaza las parejas marcadas como dudosas
//
// Lee tools/datos/emparejamiento_catalogo.json y:
//   1. Crea en DATA los perfumes (y kits activos) de la web sin pareja: precio web, stock 0, costo 0.
//   2. Enlaza cada producto/kit web con su ítem de DATA (inventario_id).
//   3. Crea en la web, como borrador (inactivo), los perfumes y kits que solo existen en DATA.
// Nunca cambia un enlace existente distinto: lo reporta. Hacer respaldo de ambas bases antes.
// ============================================================
const path = require('path');
const mysql = require(path.join(__dirname, '../backend/node_modules/mysql2/promise'));
const MAPA = require('./datos/emparejamiento_catalogo.json');

const APLICAR = process.argv.includes('--aplicar');
const SIN_DUDOSAS = process.argv.includes('--sin-dudosas');

function conexion(url, nombre) {
    if (!url) throw new Error(`Falta ${nombre}`);
    return mysql.createConnection({ uri: url, charset: 'utf8mb4' });
}

// "HAWAS  ICE RASASI" → "Hawas Ice Rasasi"; conserva siglas y cifras ("9PM", "XS", "3X30ML")
const MINUSCULAS = new Set(['de', 'di', 'del', 'la', 'el', 'y', 'en']);
const titulo = (s) => String(s).replace(/\s+/g, ' ').trim().split(' ').map((palabra, i) => {
    if (/^ll$/i.test(palabra)) return 'II';
    if (/\d/.test(palabra) || (palabra.length <= 2 && !MINUSCULAS.has(palabra.toLowerCase()))) return palabra.toUpperCase();
    const baja = palabra.toLowerCase();
    if (i > 0 && MINUSCULAS.has(baja)) return baja;
    return baja.replace(/(^|[(\-–&/])([a-záéíóúñ])/g, (_, a, b) => a + b.toUpperCase())
        .replace(/([´'])([a-záéíóúñ])(?=[a-záéíóúñ]{2})/g, (_, a, b) => a + b.toUpperCase());
}).join(' ');

(async () => {
    const web = await conexion(process.env.WEB_DB_URL, 'WEB_DB_URL');
    const data = await conexion(process.env.DATA_DB_URL, 'DATA_DB_URL');
    const plan = { enlazar: [], crearData: [], crearWeb: [], conflictos: [], omitidas: [] };

    const [productos] = await web.query('SELECT id, nombre, precio, activo, inventario_id FROM Productos');
    const [kits] = await web.query('SELECT id, nombre, precio, activo, inventario_id FROM Kits');
    const [inventario] = await data.query('SELECT id, nombre, categoria, precio, activo FROM inventario');
    const invPorId = new Map(inventario.map(i => [i.id, i]));
    const invPorNombre = new Map(inventario.map(i => [i.nombre.replace(/\s+/g, ' ').trim().toLowerCase(), i]));

    // Parejas declaradas (producto o kit)
    const parejas = [
        ...MAPA.productos.map(p => ({ ...p, tabla: 'Productos', filas: productos })),
        ...MAPA.kits.map(k => ({ ...k, tabla: 'Kits', filas: kits }))
    ];
    const emparejadosWeb = { Productos: new Set(), Kits: new Set() };
    for (const p of parejas) {
        const fila = p.filas.find(f => f.id === p.web);
        const inv = invPorId.get(p.data);
        if (!fila || !inv) { plan.conflictos.push(`${p.tabla} ${p.web} ⇄ DATA ${p.data}: no existe en ${fila ? 'DATA' : 'la web'}`); continue; }
        emparejadosWeb[p.tabla].add(fila.id);
        if (p.dudosa && SIN_DUDOSAS) { plan.omitidas.push(`${fila.nombre} ⇄ ${inv.nombre} (${p.dudosa})`); continue; }
        if (fila.inventario_id && fila.inventario_id !== inv.id) {
            plan.conflictos.push(`${fila.nombre}: ya enlazado a DATA ${fila.inventario_id}, el mapa dice ${inv.id}`);
            continue;
        }
        if (fila.inventario_id === inv.id) continue;
        plan.enlazar.push({ tabla: p.tabla, webId: fila.id, dataId: inv.id, texto: `${fila.nombre} ⇄ ${inv.nombre}${p.dudosa ? '  [DUDOSA]' : ''}` });
    }

    // Web sin pareja → crear en DATA (perfumes todos; kits solo activos)
    const sinPareja = [
        ...productos.filter(p => !emparejadosWeb.Productos.has(p.id) && !p.inventario_id).map(p => ({ ...p, tabla: 'Productos', categoria: '1.1' })),
        ...(MAPA.crear_en_data.kits_activos ? kits.filter(k => k.activo && !emparejadosWeb.Kits.has(k.id) && !k.inventario_id).map(k => ({ ...k, tabla: 'Kits', categoria: 'Kit' })) : [])
    ];
    for (const f of sinPareja) {
        const nombre = titulo(f.nombre);
        const existente = invPorNombre.get(nombre.toLowerCase());
        plan.crearData.push({ ...f, nombreData: nombre, existenteId: existente ? existente.id : null });
    }

    // Solo en DATA → borrador en la web
    const enlazadosData = new Set([...productos, ...kits].map(f => f.inventario_id).filter(Boolean));
    for (const c of MAPA.crear_en_web) {
        const inv = invPorId.get(c.data);
        if (!inv) { plan.conflictos.push(`crear_en_web: DATA ${c.data} no existe`); continue; }
        if (!enlazadosData.has(inv.id)) plan.crearWeb.push({ ...c, tabla: 'Productos', precio: inv.precio });
    }
    for (const c of MAPA.crear_kits_en_web) {
        const inv = invPorId.get(c.data);
        if (!inv) { plan.conflictos.push(`crear_kits_en_web: DATA ${c.data} no existe`); continue; }
        if (!enlazadosData.has(inv.id)) plan.crearWeb.push({ ...c, tabla: 'Kits', precio: inv.precio });
    }

    // ── Reporte ──
    console.log(`\n${APLICAR ? 'APLICANDO' : 'SIMULACIÓN (usa --aplicar para ejecutar)'}\n`);
    console.log(`Enlazar web ⇄ DATA: ${plan.enlazar.length}`);
    plan.enlazar.forEach(e => console.log(`  · [${e.tabla}] ${e.texto}`));
    console.log(`\nCrear en DATA (stock 0, costo 0): ${plan.crearData.length}`);
    plan.crearData.forEach(c => console.log(`  · [${c.categoria}] ${c.nombreData} · $${Number(c.precio).toLocaleString('es-CO')}${c.existenteId ? `  (ya existe en DATA #${c.existenteId}: solo se enlaza)` : ''}`));
    console.log(`\nCrear en la web como borrador: ${plan.crearWeb.length}`);
    plan.crearWeb.forEach(c => console.log(`  · [${c.tabla}] ${c.nombre} · $${Number(c.precio).toLocaleString('es-CO')}`));
    if (plan.omitidas.length) { console.log(`\nParejas dudosas omitidas: ${plan.omitidas.length}`); plan.omitidas.forEach(o => console.log(`  · ${o}`)); }
    if (plan.conflictos.length) { console.log(`\nConflictos (no se tocan): ${plan.conflictos.length}`); plan.conflictos.forEach(o => console.log(`  ! ${o}`)); }

    if (!APLICAR) { await web.end(); await data.end(); return; }

    // 1. DATA: crear ítems faltantes (transacción)
    await data.beginTransaction();
    try {
        for (const c of plan.crearData) {
            if (c.existenteId) { c.dataId = c.existenteId; continue; }
            const [r] = await data.query(
                `INSERT INTO inventario (nombre, categoria, precio, precio_costo, stock, tipo, unidad, activo)
                 VALUES (?, ?, ?, 0, 0, 'terminado', 'und', 1)`,
                [c.nombreData, c.categoria, Number(c.precio) || 0]);
            c.dataId = r.insertId;
        }
        await data.commit();
    } catch (err) { await data.rollback(); throw err; }

    // 2 y 3. Web: enlaces y borradores (transacción)
    await web.beginTransaction();
    try {
        for (const e of plan.enlazar) {
            await web.query(`UPDATE ${e.tabla} SET inventario_id = ? WHERE id = ? AND (inventario_id IS NULL OR inventario_id = ?)`, [e.dataId, e.webId, e.dataId]);
        }
        for (const c of plan.crearData) {
            await web.query(`UPDATE ${c.tabla} SET inventario_id = ? WHERE id = ? AND inventario_id IS NULL`, [c.dataId, c.id]);
        }
        for (const c of plan.crearWeb) {
            if (c.tabla === 'Productos') {
                const [r] = await web.query(
                    `INSERT INTO Productos (nombre, rating, imagen, categoria, genero, descripcion, precio, activo, inventario_id)
                     VALUES (?, 4, '', ?, ?, '', ?, 0, ?)`, [c.nombre, c.categoria, c.genero, c.precio, c.data]);
                if (c.marca) {
                    await web.query('INSERT IGNORE INTO marcas (nombre) VALUES (?)', [c.marca]);
                    await web.query('UPDATE Productos SET marca_id = (SELECT id FROM marcas WHERE nombre = ?) WHERE id = ?', [c.marca, r.insertId]);
                }
            } else {
                await web.query(
                    `INSERT INTO Kits (nombre, descripcion, precio, imagen, activo, inventario_id) VALUES (?, '', ?, '', 0, ?)`,
                    [c.nombre, c.precio, c.data]);
            }
        }
        await web.commit();
    } catch (err) { await web.rollback(); throw err; }

    const [[pw]] = await web.query('SELECT COUNT(*) total, SUM(inventario_id IS NOT NULL) enlazados FROM Productos');
    const [[kw]] = await web.query('SELECT COUNT(*) total, SUM(inventario_id IS NOT NULL) enlazados FROM Kits');
    console.log(`\nListo. Productos web enlazados: ${pw.enlazados}/${pw.total} · Kits enlazados: ${kw.enlazados}/${kw.total}`);
    await web.end();
    await data.end();
})().catch((err) => { console.error('ERROR:', err.message); process.exit(1); });
