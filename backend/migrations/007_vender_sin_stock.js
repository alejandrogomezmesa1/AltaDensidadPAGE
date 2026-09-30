// "Vender sin existencias": el panel puede dejar a la venta un perfume o kit aunque DATA diga
// que no hay stock (se prepara o se consigue bajo pedido). No aplica al precio en revisión.
module.exports = {
    nombre: 'Vender sin existencias',
    async up(conn, h) {
        for (const tabla of ['Productos', 'Kits']) {
            if (!(await h.columnaExiste(tabla, 'vender_sin_stock'))) {
                await conn.query(`ALTER TABLE ${tabla} ADD COLUMN vender_sin_stock TINYINT(1) NOT NULL DEFAULT 0`);
            }
        }
    }
};
