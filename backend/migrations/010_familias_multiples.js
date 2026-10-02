// Un perfume puede tener varias familias olfativas (p. ej. Floral y Gourmand), en orden: la primera
// es la principal y se refleja también en Productos.familia_id (compatibilidad). Las familias que
// ya estaban asignadas pasan a la tabla nueva como principales.
module.exports = {
    nombre: 'Varias familias olfativas por perfume',
    async up(conn) {
        await conn.query(`CREATE TABLE IF NOT EXISTS producto_familias (
            producto_id INT NOT NULL,
            familia_id INT NOT NULL,
            orden INT NOT NULL DEFAULT 0,
            PRIMARY KEY (producto_id, familia_id),
            INDEX idx_producto_familias_familia (familia_id),
            CONSTRAINT fk_producto_familias_producto FOREIGN KEY (producto_id) REFERENCES Productos(id) ON DELETE CASCADE,
            CONSTRAINT fk_producto_familias_familia FOREIGN KEY (familia_id) REFERENCES familias_olfativas(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
        await conn.query(`INSERT IGNORE INTO producto_familias (producto_id, familia_id, orden)
            SELECT id, familia_id, 0 FROM Productos WHERE familia_id IS NOT NULL`);
    }
};
