// "Solo preparado": fragancias que se tienen solo en esencia. No se venden como perfume 1.1
// (no salen en la colección ni en el Top 10 y el pago las rechaza como 1.1), pero se pueden
// elegir en "Crea tu perfume".
module.exports = {
    nombre: 'Fragancias solo preparadas',
    async up(conn, h) {
        if (!(await h.columnaExiste('Productos', 'solo_preparado'))) {
            await conn.query('ALTER TABLE Productos ADD COLUMN solo_preparado TINYINT(1) NOT NULL DEFAULT 0');
        }
        // 30-09-2026: Club de Nuit Woman solo existe en esencia (el 1.1 es el de hombre)
        await conn.query("UPDATE Productos SET solo_preparado = 1 WHERE UPPER(TRIM(nombre)) = 'CLUB DE NUIT WOMAN ARMAF'");
    }
};
