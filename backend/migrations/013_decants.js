// Decants de 10 ml: una línea de negocio propia (decisiones del usuario del 18-10-2026).
//   · Productos.esencia_inventario_id: la esencia de DATA con la que se llena el decant de esa
//     fragancia. Sin enlace la fragancia no se ofrece en decant (no se podría descontar).
//   · DecantPrecios: lo que se cobra por la fragancia según su categoría (Árabe / Diseñador).
//   · DecantEnvases: envases de decant que el cliente elige (atomizador de bolsillo, vial de
//     vidrio), con su precio y el ítem de DATA del que se descuentan.
//   · DecantSets: sets de descubrimiento (el cliente elige N fragancias) con descuento sobre la
//     suma de los decants.
// Precio de un decant = DecantPrecios[categoría] + precio del envase. Sin feromonas.
// NULL = sin precio: la tienda lo muestra como "Consultar" y no lo cobra.
module.exports = {
    nombre: 'Decants: esencia por fragancia, precios, envases y sets',
    async up(conn, h) {
        if (!(await h.columnaExiste('Productos', 'esencia_inventario_id'))) {
            await conn.query('ALTER TABLE Productos ADD COLUMN esencia_inventario_id INT NULL');
            await conn.query('ALTER TABLE Productos ADD INDEX idx_productos_esencia (esencia_inventario_id)');
        }
        await conn.query(`CREATE TABLE IF NOT EXISTS DecantPrecios (
            categoria VARCHAR(30) NOT NULL PRIMARY KEY,
            precio INT NULL
        )`);
        await conn.query("INSERT IGNORE INTO DecantPrecios (categoria, precio) VALUES ('Arabe', NULL), ('Diseñador', NULL)");
        await conn.query(`CREATE TABLE IF NOT EXISTS DecantEnvases (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(100) NOT NULL,
            descripcion VARCHAR(300) NULL,
            imagen VARCHAR(500) NULL,
            inventario_id INT NULL,
            precio INT NULL,
            activo TINYINT(1) NOT NULL DEFAULT 1,
            orden INT NOT NULL DEFAULT 0
        )`);
        const [[{ n: nEnvases }]] = await conn.query('SELECT COUNT(*) AS n FROM DecantEnvases');
        if (!Number(nEnvases)) {
            await conn.query(`INSERT INTO DecantEnvases (nombre, descripcion, imagen, orden) VALUES
                ('Atomizador de bolsillo', 'Metálico, recargable, cabe en cualquier bolsillo.', '/assets/decants/atomizadores.jpg', 1),
                ('Vial de vidrio', 'Vidrio transparente con atomizador fino.', '/assets/decants/viales.jpg', 2)`);
        }
        await conn.query(`CREATE TABLE IF NOT EXISTS DecantSets (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(100) NOT NULL,
            cantidad INT NOT NULL,
            descuento_pct INT NOT NULL DEFAULT 0,
            descripcion VARCHAR(300) NULL,
            activo TINYINT(1) NOT NULL DEFAULT 1,
            orden INT NOT NULL DEFAULT 0
        )`);
        const [[{ n: nSets }]] = await conn.query('SELECT COUNT(*) AS n FROM DecantSets');
        if (!Number(nSets)) {
            // Descuentos de partida (editables en el panel)
            await conn.query(`INSERT INTO DecantSets (nombre, cantidad, descuento_pct, descripcion, orden) VALUES
                ('Set de descubrimiento', 3, 10, 'Tres fragancias para conocer antes de elegir tu frasco.', 1),
                ('Set de colección', 5, 15, 'Cinco fragancias: una para cada ocasión de la semana.', 2)`);
        }
    }
};
