// Enlace con el inventario de DATA y estado de sincronización de cada orden.
module.exports = {
    nombre: 'Integración con DATA',
    async up(conn, h) {
        for (const tabla of ['Productos', 'Kits']) {
            if (!(await h.columnaExiste(tabla, 'inventario_id'))) {
                await conn.query(`ALTER TABLE ${tabla} ADD COLUMN inventario_id INT NULL`);
            }
            if (!(await h.columnaExiste(tabla, 'agotado'))) {
                await conn.query(`ALTER TABLE ${tabla} ADD COLUMN agotado TINYINT(1) NOT NULL DEFAULT 0`);
            }
        }
        if (!(await h.columnaExiste('Ordenes', 'data_sync_estado'))) {
            await conn.query(`ALTER TABLE Ordenes
                ADD COLUMN data_sync_estado VARCHAR(20) NULL,
                ADD COLUMN data_venta_id INT NULL,
                ADD COLUMN data_sync_error VARCHAR(255) NULL,
                ADD COLUMN data_sync_at DATETIME NULL`);
            // Las órdenes aprobadas antes de la integración no se envían a DATA
            // (evita duplicar ventas que ya se registraron a mano)
            await conn.query("UPDATE Ordenes SET data_sync_estado = 'omitida' WHERE status = 'approved'");
        }
    }
};
