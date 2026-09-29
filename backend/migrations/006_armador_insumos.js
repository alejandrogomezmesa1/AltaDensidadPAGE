// Catálogo unificado: precios del armador "Crea tu perfume" y ficha web de los insumos de DATA.
// · PreciosEsencia: lo que se cobra por la esencia según categoría (Árabe / Diseñador) y tamaño.
// · PreciosEnvase: precio de cada diseño de envase por tamaño (por nombre: la tabla Envases
//   tiene diseños repetidos). NULL = sin precio (la tienda muestra "Consultar" y no lo cobra).
// · ParametrosTienda: valores sueltos (recargo por feromonas, presentaciones en ml).
// · InsumosWeb: qué ítems de DATA (esencias, feromonas, envases vacíos…) se venden en la web,
//   con su foto y descripción. Nombre, precio y stock siguen saliendo de DATA.
// Tallas que la tienda ya mostraba (datos fijos del front): la tabla EnvaseTallas estaba vacía.
// Solo se cargan en envases sin ninguna talla; luego se editan en el panel (Envases).
const TALLAS_CONOCIDAS = {
    AMIRA: ['30ml'], CARTIER: ['30ml', '60ml'], CILINDRO: ['100ml'], EROS: ['60ml'], VICTORY: ['60ml'],
    'GOOD GIRL': ['30ml'], CALAVERA: ['50ml'], 'MINI YARA': ['30ml'], VALENTINO: ['30ml', '60ml'],
    SAUVAGE: ['30ml'], 'MOSCHINO BEAR': ['60ml']
};

module.exports = {
    nombre: 'Armador de perfumes e insumos en la web',
    async up(conn) {
        await conn.query(`CREATE TABLE IF NOT EXISTS PreciosEsencia (
            categoria VARCHAR(30) NOT NULL,
            ml INT NOT NULL,
            precio INT NULL,
            PRIMARY KEY (categoria, ml)
        )`);
        await conn.query(`CREATE TABLE IF NOT EXISTS PreciosEnvase (
            envase VARCHAR(100) NOT NULL,
            ml INT NOT NULL,
            precio INT NULL,
            PRIMARY KEY (envase, ml)
        )`);
        await conn.query(`CREATE TABLE IF NOT EXISTS ParametrosTienda (
            clave VARCHAR(60) NOT NULL PRIMARY KEY,
            valor VARCHAR(255) NULL
        )`);
        await conn.query(`CREATE TABLE IF NOT EXISTS InsumosWeb (
            inventario_id INT NOT NULL PRIMARY KEY,
            visible TINYINT(1) NOT NULL DEFAULT 0,
            imagen VARCHAR(500) NULL,
            descripcion VARCHAR(500) NULL,
            orden INT NOT NULL DEFAULT 0
        )`);
        const [sinTallas] = await conn.query('SELECT e.id, e.nombre FROM Envases e LEFT JOIN EnvaseTallas t ON t.envase_id = e.id WHERE t.id IS NULL');
        for (const e of sinTallas) {
            for (const talla of TALLAS_CONOCIDAS[String(e.nombre).trim().toUpperCase()] || []) {
                await conn.query('INSERT INTO EnvaseTallas (envase_id, talla) VALUES (?, ?)', [e.id, talla]);
            }
        }
        // Valores conocidos de la planilla (26-09): esencia 30 ml $15.000 y envase genérico 30 ml $3.000
        await conn.query(`INSERT IGNORE INTO PreciosEsencia (categoria, ml, precio) VALUES
            ('Arabe', 30, 15000), ('Diseñador', 30, 15000)`);
        await conn.query(`INSERT IGNORE INTO ParametrosTienda (clave, valor) VALUES
            ('recargo_feromonas', NULL), ('presentaciones_ml', '30,50,100')`);
    }
};
