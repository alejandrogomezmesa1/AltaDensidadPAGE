// Ficha de clasificación de cada perfume: marca y perfume original, familia olfativa,
// acordes y pirámide de notas, como listas cerradas (filtros exactos en la tienda).
// Además, bandera de precio en revisión (DATA avisa si el precio no cubre el costo).

// Familias olfativas base (se pueden ampliar desde el panel)
const FAMILIAS = [
    'Amaderada', 'Ambarada / Oriental', 'Aromática', 'Chipre', 'Cítrica', 'Cuero',
    'Especiada', 'Floral', 'Frutal', 'Gourmand', 'Acuática', 'Verde', 'Almizclada', 'Fougère'
];

// Acordes frecuentes; el panel crea los que falten al escribirlos
const ACORDES = [
    'Vainilla', 'Dulce', 'Amaderado', 'Cítrico', 'Afrutado', 'Floral', 'Floral blanco',
    'Especiado cálido', 'Especiado fresco', 'Ámbar', 'Almizclado', 'Oud', 'Cuero', 'Atalcado',
    'Aromático', 'Fresco', 'Acuático', 'Marino', 'Verde', 'Tropical', 'Avainillado',
    'Caramelo', 'Café', 'Chocolate', 'Tabaco', 'Ahumado', 'Balsámico', 'Rosa', 'Lavanda', 'Tonka'
];

// Marca contenida en el nombre del producto (clave en mayúsculas → nombre de la marca)
const MARCAS = [
    ['CAROLINA HERRERA', 'Carolina Herrera'], ['LATTAFA', 'Lattafa'], ['PACO RABANNE', 'Paco Rabanne'],
    ['VERSACE', 'Versace'], ['DIOR', 'Dior'], ['CHANEL', 'Chanel'], ['HUGO BOSS', 'Hugo Boss'],
    ['LACOSTE', 'Lacoste'], ['ARMAF', 'Armaf'], ['LOUIS VUITTON', 'Louis Vuitton'], ['ORIENTICA', 'Orientica'],
    ['AFNAN', 'Afnan'], ['PERRY ELLIS', 'Perry Ellis'], ['VICTORINOX', 'Victorinox'], ['AL HARAMAIN', 'Al Haramain'],
    ['MONTALE', 'Montale'], ['BHARARA', 'Bharara'], ['BOND N', 'Bond No. 9'], ['VALENTINO', 'Valentino'],
    ['PARIS HILTON', 'Paris Hilton'], ['ARIANA GRANDE', 'Ariana Grande'], ['BVLGARI', 'Bvlgari'], ['BVLGARY', 'Bvlgari'],
    ['XERJOFF', 'Xerjoff'], ['GIORGIO ARMANI', 'Giorgio Armani'], ['ACQUA DI GIO', 'Giorgio Armani'],
    ['DOLCE & GABBANA', 'Dolce & Gabbana'], ['DOLCE & GABANNA', 'Dolce & Gabbana'], ['CREED', 'Creed'],
    ['MOSCHINO', 'Moschino'], ['LE LABO', 'Le Labo'], ['RASASI', 'Rasasi'], ['FRENCH AVENUE', 'French Avenue'],
    ['MAISON FRANCIS', 'Maison Francis Kurkdjian'], ['TOM FORD', 'Tom Ford'], ['YVES SAINT LAURENT', 'Yves Saint Laurent'],
    ['JEAN PAUL GAULTIER', 'Jean Paul Gaultier'], ['MONTBLANC', 'Montblanc'], ['BURBERRY', 'Burberry']
];

module.exports = {
    nombre: 'Clasificación de perfumes y precio en revisión',
    async up(conn, h) {
        const catalogos = [
            ['marcas', 'nombre VARCHAR(80) NOT NULL'],
            ['familias_olfativas', 'nombre VARCHAR(60) NOT NULL'],
            ['acordes', 'nombre VARCHAR(60) NOT NULL'],
            ['notas', 'nombre VARCHAR(80) NOT NULL']
        ];
        for (const [tabla, col] of catalogos) {
            await conn.query(`CREATE TABLE IF NOT EXISTS ${tabla} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                ${col},
                UNIQUE KEY uq_${tabla}_nombre (nombre)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
        }

        const columnas = {
            marca_id: 'INT NULL',
            nombre_original: 'VARCHAR(160) NULL',
            familia_id: 'INT NULL',
            precio_revision: 'TINYINT(1) NOT NULL DEFAULT 0'
        };
        for (const [col, def] of Object.entries(columnas)) {
            if (!(await h.columnaExiste('Productos', col))) await conn.query(`ALTER TABLE Productos ADD COLUMN ${col} ${def}`);
        }
        if (!(await h.columnaExiste('Kits', 'precio_revision'))) {
            await conn.query('ALTER TABLE Kits ADD COLUMN precio_revision TINYINT(1) NOT NULL DEFAULT 0');
        }
        if (!(await h.indiceExiste('Productos', 'fk_productos_marca'))) {
            await conn.query('ALTER TABLE Productos ADD CONSTRAINT fk_productos_marca FOREIGN KEY (marca_id) REFERENCES marcas(id) ON DELETE SET NULL');
        }
        if (!(await h.indiceExiste('Productos', 'fk_productos_familia'))) {
            await conn.query('ALTER TABLE Productos ADD CONSTRAINT fk_productos_familia FOREIGN KEY (familia_id) REFERENCES familias_olfativas(id) ON DELETE SET NULL');
        }

        await conn.query(`CREATE TABLE IF NOT EXISTS producto_acordes (
            producto_id INT NOT NULL,
            acorde_id   INT NOT NULL,
            orden       TINYINT NOT NULL DEFAULT 0,
            PRIMARY KEY (producto_id, acorde_id),
            CONSTRAINT fk_pa_producto FOREIGN KEY (producto_id) REFERENCES Productos(id) ON DELETE CASCADE,
            CONSTRAINT fk_pa_acorde FOREIGN KEY (acorde_id) REFERENCES acordes(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

        await conn.query(`CREATE TABLE IF NOT EXISTS producto_notas (
            producto_id INT NOT NULL,
            nota_id     INT NOT NULL,
            nivel       ENUM('salida','corazon','fondo') NOT NULL,
            orden       TINYINT NOT NULL DEFAULT 0,
            PRIMARY KEY (producto_id, nivel, nota_id),
            KEY idx_pn_nota (nota_id),
            CONSTRAINT fk_pn_producto FOREIGN KEY (producto_id) REFERENCES Productos(id) ON DELETE CASCADE,
            CONSTRAINT fk_pn_nota FOREIGN KEY (nota_id) REFERENCES notas(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

        for (const f of FAMILIAS) await conn.query('INSERT IGNORE INTO familias_olfativas (nombre) VALUES (?)', [f]);
        for (const a of ACORDES) await conn.query('INSERT IGNORE INTO acordes (nombre) VALUES (?)', [a]);

        // Marca a partir del nombre, solo en productos que aún no la tienen
        const [productos] = await conn.query('SELECT id, nombre FROM Productos WHERE marca_id IS NULL');
        for (const p of productos) {
            const up = String(p.nombre || '').toUpperCase();
            const hallada = MARCAS.find(([clave]) => up.includes(clave));
            if (!hallada) continue;
            await conn.query('INSERT IGNORE INTO marcas (nombre) VALUES (?)', [hallada[1]]);
            const [[m]] = await conn.query('SELECT id FROM marcas WHERE nombre = ?', [hallada[1]]);
            await conn.query('UPDATE Productos SET marca_id = ? WHERE id = ?', [m.id, p.id]);
        }
    }
};
