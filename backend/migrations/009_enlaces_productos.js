// Dirección fija de cada perfume en la tienda (/perfume/<ruta>-<id>) y su referencia en
// Fragrantica. La ruta se guarda para que no cambie al editar el nombre; aquí se completa la de
// los productos existentes a partir de su marca y su nombre.
const { rutaPorDefecto } = require('../services/enlaces');

module.exports = {
    nombre: 'Enlaces de productos (ruta y referencia Fragrantica)',
    async up(conn, h) {
        if (!(await h.columnaExiste('Productos', 'ruta'))) {
            await conn.query('ALTER TABLE Productos ADD COLUMN ruta VARCHAR(160) NULL');
        }
        if (!(await h.columnaExiste('Productos', 'fragrantica_url'))) {
            await conn.query('ALTER TABLE Productos ADD COLUMN fragrantica_url VARCHAR(300) NULL');
        }
        const conMarca = await h.columnaExiste('Productos', 'marca_id');
        const [filas] = await conn.query(conMarca
            ? 'SELECT p.id, p.nombre, m.nombre AS marca FROM Productos p LEFT JOIN marcas m ON m.id = p.marca_id WHERE p.ruta IS NULL'
            : 'SELECT id, nombre, NULL AS marca FROM Productos WHERE ruta IS NULL');
        for (const f of filas) {
            await conn.query('UPDATE Productos SET ruta = ? WHERE id = ?', [rutaPorDefecto(f.nombre, f.marca), f.id]);
        }
    }
};
